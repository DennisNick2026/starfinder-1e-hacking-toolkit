import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Delete, ShieldAlert, Siren, UserX, Bug, EyeOff, Zap, Lock, Trash2 } from 'lucide-react';

const CM_ICONS = { ShieldAlert, Siren, UserX, Bug, EyeOff, Zap, Lock, Trash2 };

const CM_COLOR = {
  red: 'text-destructive border-destructive/50 bg-destructive/10',
  purple: 'text-chart-3 border-chart-3/50 bg-chart-3/10',
};

// In play mode: fake_shell always hidden; alarms hidden until revealed; firewall hides everything else
function getVisibleCms(node, mode) {
  const all = (node.countermeasures || []).filter(cm => !cm.resolved);
  if (mode !== 'play') return all;
  const hasUnresolvedFirewall = all.some(cm => cm.type === 'firewall' && !cm.resolved);
  return all.filter(cm => {
    if (cm.type === 'fake_shell') return false; // always hidden in play mode
    // Alarm: show if revealed OR triggered (so player can hack it to turn it off)
    if (cm.type === 'alarm' && !cm.revealed && !cm.triggered) return false; // hidden until first hack attempt or trigger
    if (hasUnresolvedFirewall && cm.type !== 'firewall') return false; // hidden behind firewall
    return true;
  });
}

// In play mode with an unresolved firewall, the node itself cannot be targeted directly
function canTargetNode(node, mode) {
  if (mode !== 'play') return true;
  const hasUnresolvedFirewall = (node.countermeasures || []).some(
    cm => cm.type === 'firewall' && !cm.resolved
  );
  return !hasUnresolvedFirewall;
}

function PasswordEntry({ label, password, onSuccess, disabled = false }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);

  const attempt = () => {
    if (disabled) return;
    const match = value === password;
    setResult(match ? 'success' : 'failure');
    if (match) onSuccess();
  };

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <Input
          className="font-mono text-xs bg-muted border-border flex-1"
          placeholder="Password..."
          value={value}
          onChange={e => { setValue(e.target.value); setResult(null); }}
          onKeyDown={e => { if (e.key === 'Enter') attempt(); e.stopPropagation(); }}
        />
        <Button size="sm" className="font-mono text-xs" onClick={attempt}>Enter</Button>
      </div>
      {result && (
        <p className={cn('font-mono text-xs font-bold', result === 'success' ? 'text-accent' : 'text-destructive')}>
          {result === 'success' ? '✓ Access Granted' : '✗ Wrong Password'}
        </p>
      )}
    </div>
  );
}

export default function HackDialog({ node, onSubmit, onUnhack, onClose, mode = 'create', rootMode = false }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  // null = rolling against node, or a cm.id
  const [target, setTarget] = useState(null);
  const [closing, setClosing] = useState(false);

  if (!node) return null;

  const isDirectory = node.type === 'directory';
  const activeCms = getVisibleCms(node, mode);
  const nodeTargetable = canTargetNode(node, mode);

  // Firewall password: look for a firewall CM that has a password set
  const firewallCm = (node.countermeasures || []).find(cm => cm.type === 'firewall' && !cm.resolved && cm.password);
  const hasFirewallPassword = !!firewallCm;

  // If the currently selected target CM no longer exists (e.g. firewall just resolved), reset to null
  const targetStillValid = target === null || activeCms.some(cm => cm.id === target);
  const resolvedTarget = targetStillValid ? target : null;

  // If node is blocked by firewall in play mode, auto-target the firewall
  const effectiveTarget = (!nodeTargetable && resolvedTarget === null)
    ? activeCms.find(cm => cm.type === 'firewall')?.id ?? null
    : resolvedTarget;

  const activeTarget = effectiveTarget
    ? (node.countermeasures || []).find(cm => cm.id === effectiveTarget)
    : null;

  const rawTargetDC = activeTarget ? activeTarget.dc : node.dc;
  const targetDC = rootMode ? 10 : rawTargetDC;
  const targetLabel = activeTarget ? activeTarget.label : node.name;

  const handleDigit = (d) => {
    if (input.length >= 3) return;
    setInput(prev => prev + d);
    setResult(null);
  };

  const handleClear = () => {
    setInput(prev => prev.slice(0, -1));
    setResult(null);
  };

  const handleSubmit = () => {
    if (closing) return;
    const total = parseInt(input);
    if (isNaN(total)) return;
    const success = total >= targetDC;
    setResult(success ? 'success' : 'failure');
    // Snapshot the current effectiveTarget before state updates ripple through
    const submittedTarget = effectiveTarget;
    onSubmit(node.id, total, submittedTarget || null);
    if (success) {
      setInput('');
      setClosing(true);
      setTimeout(onClose, 400);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
    if (e.key === 'Backspace') handleClear();
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl p-6 w-80 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Target selector */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Rolling against:</p>
          <div className="flex flex-wrap gap-2">
            {nodeTargetable && (
              <button
                className={cn(
                  'font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors',
                  effectiveTarget === null
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
                onClick={() => { setTarget(null); setInput(''); setResult(null); }}
              >
                {node.name} (DC {node.dc})
              </button>
            )}
            {activeCms.map(cm => {
              const Icon = CM_ICONS[cm.icon];
              return (
                <button
                  key={cm.id}
                  className={cn(
                    'font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5',
                    effectiveTarget === cm.id
                      ? CM_COLOR[cm.color] + ' border-opacity-100'
                      : 'border-border text-muted-foreground hover:border-destructive/50'
                  )}
                  onClick={() => { setTarget(cm.id); setInput(''); setResult(null); }}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {cm.label} (DC {cm.dc})
                </button>
              );
            })}
          </div>
        </div>

        {/* Display */}
        <div className={cn(
          'bg-muted rounded-lg px-4 py-3 text-right font-mono',
          result === 'success' && 'bg-accent/20 border border-accent',
          result === 'failure' && 'bg-destructive/20 border border-destructive',
          !result && 'border border-border'
        )}>
          <p className="text-[10px] text-muted-foreground mb-1">
            {targetLabel} — DC {targetDC}
          </p>
          <p className="text-3xl font-bold text-foreground tracking-widest">
            {input || '—'}
          </p>
          {result && (
            <p className={cn(
              'text-xs font-bold uppercase tracking-widest mt-1',
              result === 'success' ? 'text-accent' : 'text-destructive'
            )}>
              {result === 'success' ? '✓ Success' : '✗ Failure'}
            </p>
          )}
        </div>



        {/* Password entry for firewalls */}
        {hasFirewallPassword && (
          <PasswordEntry
            label="Or enter firewall password:"
            password={firewallCm.password}
            disabled={closing}
            onSuccess={() => {
              setClosing(true);
              const cmId = firewallCm.id;
              onSubmit(node.id, 9999, cmId);
              setTimeout(onClose, 400);
            }}
          />
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2">
          {[7,8,9,4,5,6,1,2,3].map(d => (
            <button
              key={d}
              disabled={closing}
              className="h-12 rounded-lg bg-secondary hover:bg-secondary/70 font-mono text-lg font-semibold text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleDigit(String(d))}
            >
              {d}
            </button>
          ))}
          <button
            disabled={closing}
            className="h-12 rounded-lg bg-secondary hover:bg-secondary/70 font-mono text-sm text-muted-foreground transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button
            disabled={closing}
            className="h-12 rounded-lg bg-secondary hover:bg-secondary/70 font-mono text-sm text-muted-foreground transition-colors flex items-center justify-center col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClear}
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 font-mono text-xs" onClick={onClose} disabled={closing}>
            Back
          </Button>
          {node.resolved ? (
            <Button
              className="flex-1 font-mono text-xs bg-destructive/80 text-destructive-foreground hover:bg-destructive"
              onClick={() => { onUnhack(node.id); setResult(null); setInput(''); }}
              disabled={closing}
            >
              Unhack
            </Button>
          ) : (
            <Button
              className="flex-1 font-mono text-xs bg-primary text-primary-foreground"
              onClick={handleSubmit}
              disabled={!input || closing}
            >
              Enter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}