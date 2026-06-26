import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
const CM_COLOR = {
  red: 'text-destructive border-destructive/50 bg-destructive/10',
  purple: 'text-chart-3 border-chart-3/50 bg-chart-3/10',
};

const DATA_NODE_TYPES = ['secure_data_average', 'secure_data_large', 'secure_data_specific'];

// In play mode: fake_shell hidden until node is resolved (then player can roll to detect it);
// alarms hidden until revealed; firewall blocks everything else
function getVisibleCms(node, mode) {
  const all = (node.countermeasures || []).filter(cm => !cm.resolved);
  if (mode !== 'play') return all;
  const hasUnresolvedFirewall = all.some(cm => cm.type === 'firewall');
  return all.filter(cm => {
    if (cm.type === 'alarm' && !cm.revealed && !cm.triggered) return false;
    if (hasUnresolvedFirewall && cm.type !== 'firewall') return false;
    return true;
  });
}

function PasswordEntry({ label, password, onSuccess, disabled = false }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);

  const attempt = () => {
    if (disabled) return;
    const match = value === password;
    setResult(match ? 'success' : 'failure');
    if (match) {
      setValue('');
      onSuccess();
    }
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
          disabled={disabled}
        />
        <Button size="sm" className="font-mono text-xs" onClick={attempt} disabled={disabled}>Enter</Button>
      </div>
      {result && (
        <p className={cn('font-mono text-xs font-bold', result === 'success' ? 'text-accent' : 'text-destructive')}>
          {result === 'success' ? '✓ Firewall Breached' : '✗ Wrong Password'}
        </p>
      )}
    </div>
  );
}

export default function HackDialog({ node, onSubmit, onUnhack, onClose, mode = 'create', rootMode = false, initialTarget = null, effectiveBaseDC = 25, getNodeDC = null }) {
  const [result, setResult] = useState(null); // 'success' | 'fail_minor' | 'fail_major'
  const [target, setTarget] = useState(initialTarget);
  const [closing, setClosing] = useState(false);
  const [passwordBypassed, setPasswordBypassed] = useState(false);

  if (!node) return null;
  
  // Calculate DC dynamically
  const calculateDC = (n) => {
    if (!getNodeDC) return n.dc ?? 25;
    return getNodeDC(n, effectiveBaseDC);
  };
  const nodeDC = calculateDC(node);

  const activeCms = getVisibleCms(node, mode);

  const hasUnresolvedFirewall = (node.countermeasures || []).some(cm => cm.type === 'firewall' && !cm.resolved);
  const firewallCm = (node.countermeasures || []).find(cm => cm.type === 'firewall' && !cm.resolved);
  const hasFirewallPassword = !!firewallCm?.password;

  // Secure data nodes require root access (or a password) to interact
  const isSecureData = DATA_NODE_TYPES.includes(node.type);
  const requiresRoot = isSecureData && mode === 'play' && !rootMode && !passwordBypassed && !node.resolved && !hasUnresolvedFirewall;

  const targetStillValid = target === null || activeCms.some(cm => cm.id === target);
  const resolvedTarget = targetStillValid ? target : null;

  const effectiveTarget = (!hasUnresolvedFirewall && resolvedTarget === null)
    ? null
    : (hasUnresolvedFirewall && resolvedTarget === null)
    ? firewallCm?.id ?? null
    : resolvedTarget;

  const activeTarget = effectiveTarget
    ? (node.countermeasures || []).find(cm => cm.id === effectiveTarget)
    : null;

  const rawTargetDC = activeTarget ? activeTarget.dc : nodeDC;
  const targetDC = rawTargetDC;
  const targetLabel = activeTarget ? activeTarget.label : node.name;
  const rootApplies = rootMode && !hasUnresolvedFirewall;
  const effectiveTargetDC = rootApplies ? 10 : targetDC;

  const handleOutcome = (outcome) => {
    if (closing) return;
    setResult(outcome);

    // Map outcome to a total that drives the existing submitRoll logic
    const total = outcome === 'success' ? effectiveTargetDC
      : outcome === 'fail_minor' ? effectiveTargetDC - 1   // margin = -1 (fail by < 5)
      : effectiveTargetDC - 5;                              // margin = -5 (fail by >= 5)
    onSubmit(node.id, total, effectiveTarget || null);
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
    >
      <div
        className="bg-card border border-border rounded-xl p-6 w-80 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Hacking</p>
          <p className="font-mono text-lg font-bold text-foreground">
            {targetLabel}
          </p>
          <p className="font-mono text-sm text-primary">DC {targetDC}</p>
        </div>

        <>
            {/* Target selector (CMs) */}
            {activeCms.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Target:</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeCms.map(cm => {
                    return (
                      <button
                        key={cm.id}
                        className={cn(
                          'font-mono text-xs px-2.5 py-1 rounded border transition-colors',
                          effectiveTarget === cm.id
                            ? CM_COLOR[cm.color]
                            : 'border-border text-muted-foreground hover:border-destructive/50'
                        )}
                        onClick={() => { setTarget(cm.id); setResult(null); }}
                      >
                        {cm.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Password entry for firewall */}
            {hasFirewallPassword && hasUnresolvedFirewall && effectiveTarget === firewallCm?.id && (
              <PasswordEntry
                key={firewallCm.id}
                label="Or enter firewall password:"
                password={firewallCm.password}
                disabled={closing}
                onSuccess={() => {
                  setClosing(true);
                  onSubmit(node.id, 9999, firewallCm.id);
                  setTimeout(onClose, 400);
                }}
              />
            )}

            {/* Root access requirement for secure data nodes */}
            {requiresRoot && (
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <p className="font-mono text-xs text-chart-3 font-bold">ROOT ACCESS REQUIRED</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {node.password ? 'Enter password to bypass:' : 'No password set — root access required to interact.'}
                  </p>
                </div>
                {node.password && (
                  <PasswordEntry
                    label="Secure data password:"
                    password={node.password}
                    disabled={closing}
                    onSuccess={() => setPasswordBypassed(true)}
                  />
                )}
              </div>
            )}

            {/* Outcome buttons */}
            {!requiresRoot && (!node.resolved || activeCms.length > 0) && (
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center">Roll outcome:</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    disabled={closing}
                    onClick={() => handleOutcome('success')}
                    className={cn(
                      'w-full py-3 rounded-lg border-2 font-mono text-sm font-bold transition-all',
                      result === 'success'
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-primary/40 bg-primary/5 text-primary/80 hover:border-primary hover:bg-primary/15',
                      closing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    ✓ Success
                  </button>
                  <button
                    disabled={closing}
                    onClick={() => handleOutcome('fail_minor')}
                    className={cn(
                      'w-full py-3 rounded-lg border-2 font-mono text-sm font-bold transition-all',
                      result === 'fail_minor'
                        ? 'border-chart-4 bg-chart-4/20 text-chart-4'
                        : 'border-chart-4/40 bg-chart-4/5 text-chart-4/80 hover:border-chart-4 hover:bg-chart-4/15',
                      closing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    ~ Fail by less than 5
                  </button>
                  <button
                    disabled={closing}
                    onClick={() => handleOutcome('fail_major')}
                    className={cn(
                      'w-full py-3 rounded-lg border-2 font-mono text-sm font-bold transition-all',
                      result === 'fail_major'
                        ? 'border-destructive bg-destructive/20 text-destructive'
                        : 'border-destructive/40 bg-destructive/5 text-destructive/80 hover:border-destructive hover:bg-destructive/15',
                      closing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    ✗ Fail by 5 or more
                  </button>
                </div>
              </div>
            )}
          </>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 font-mono text-xs" onClick={onClose} disabled={closing}>
            Back
          </Button>
          {node.resolved && (
            <Button
              className="flex-1 font-mono text-xs bg-destructive/80 text-destructive-foreground hover:bg-destructive"
              onClick={() => { onUnhack(node.id); setResult(null); }}
              disabled={closing}
            >
              Unhack
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}