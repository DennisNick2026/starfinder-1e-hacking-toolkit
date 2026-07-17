import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2, ShieldAlert, Siren, UserX, Bug, Zap, Lock, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { COUNTERMEASURE_TEMPLATES } from '@/lib/hacking-state';
import { MODULE_UPGRADES, TIER_PRICE, getCountermeasureCost } from '@/lib/upgrade-registry';
import NodeCostSection from './NodeCostSection';
import { cn } from '@/lib/utils';

const CM_ICONS = { ShieldAlert, Siren, UserX, Bug, Zap, Lock, Trash2 };
const CM_COLOR = {
  red: 'border-destructive/40 bg-destructive/5 text-destructive',
  purple: 'border-chart-3/40 bg-chart-3/5 text-chart-3',
};

export default function NodeEditor({ node, onUpdate, onClose, onAddCm, onUpdateCm, onRemoveCm, totalCountermeasures = 0, tier = 3 }) {
  const [pendingCm, setPendingCm] = useState(null); // { nodeId, cmType } waiting for override confirm

  if (!node) return null;

  const basePrice = TIER_PRICE[tier] || TIER_PRICE[1];
  const set = (field, value) => onUpdate(node.id, { [field]: value });

  // Calculate the "expected" DC for a CM based on node DC and CM type
  const getExpectedCmDC = (cm) => {
    if (!cm) return cm.dc;
    const nodeHackDC = node.dcOverride !== undefined && node.dcOverride !== null ? node.dcOverride : node.dc ?? 25;
    if (cm.type === 'firewall') return nodeHackDC + 2;
    if (cm.type === 'fake_shell') return nodeHackDC + 5;
    if (cm.type === 'shock_grid') {
      const tierDCs = [20, 22, 24, 27, 30];
      return tierDCs[(cm.level || 1) - 1];
    }
    return nodeHackDC; // default for alarm, feedback, lockout, wipe
  };

  const handleAddCm = (nodeId, cmType) => {
    if (totalCountermeasures >= tier) {
      setPendingCm({ nodeId, cmType });
      return;
    }
    onAddCm(nodeId, cmType);
  };

  const confirmOverride = () => {
    if (pendingCm) onAddCm(pendingCm.nodeId, pendingCm.cmType);
    setPendingCm(null);
  };

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-card to-card/80">
        <h3 className="font-mono text-base font-bold text-primary uppercase tracking-wider">Configure Node</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic fields */}
        <div className="space-y-5">
          <div>
            <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">Name</Label>
            <Input className="font-mono text-sm mt-1 bg-muted border-border/60 h-10" value={node.name}
              onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">Description</Label>
            <Textarea className="font-mono text-sm mt-1 bg-muted border-border/60 h-20 resize-none"
              value={node.description || ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">
                DC {node.dcOverride !== undefined && node.dcOverride !== null ? <span className="text-chart-4 text-[10px]">override</span> : ''}
              </Label>
              <div className="flex gap-1 mt-1">
                <Input type="number" className="font-mono text-sm bg-muted border-border/60 h-9"
                  placeholder="Auto"
                  value={node.dcOverride ?? ''}
                  onChange={e => {
                    const val = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                    set('dcOverride', val);
                  }} />
                {node.dcOverride !== undefined && node.dcOverride !== null && (
                  <button
                    className="px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-destructive border border-border/60 rounded hover:border-destructive/50 transition-colors"
                    title="Clear override"
                    onClick={() => set('dcOverride', null)}
                  >✕</button>
                )}
              </div>
            </div>
            {node.successes_required !== undefined && (
              <div>
                <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">Successes</Label>
                <Input type="number" className="font-mono text-sm mt-1 bg-muted border-border/60 h-9"
                  value={node.successes_required}
                  onChange={e => set('successes_required', parseInt(e.target.value) || 1)} />
              </div>
            )}
          </div>

          {node.dc_reduction !== undefined && (
            <div>
              <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">DC Reduction</Label>
              <Input type="number" className="font-mono text-sm mt-1 bg-muted border-border/60 h-9 w-24"
                value={node.dc_reduction}
                onChange={e => set('dc_reduction', parseInt(e.target.value) || 0)} />
            </div>
          )}
          {node.file_content !== undefined && (
            <div>
              <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">File Contents</Label>
              <Textarea className="font-mono text-sm mt-1 bg-muted border-border/60 h-32 resize-none"
                placeholder="Enter secret data file contents..."
                value={node.file_content || ''}
                onChange={e => set('file_content', e.target.value)} />
            </div>
          )}

          {(node.type === 'secure_data_average' || node.type === 'secure_data_large' || node.type === 'secure_data_specific') && (
            <>
              <div>
                <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">Password (optional — bypasses root access)</Label>
                <Input className="font-mono text-sm mt-1 bg-muted border-border/60 h-9"
                  placeholder="Leave blank for root access only"
                  value={node.password || ''}
                  onChange={e => set('password', e.target.value)} />
              </div>
              <div>
                <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">Image / Video URL (optional)</Label>
                <Input className="font-mono text-sm mt-1 bg-muted border-border/60 h-9"
                  placeholder="https://example.com/image.jpg"
                  value={node.media_url || ''}
                  onChange={e => set('media_url', e.target.value)} />
              </div>
            </>
          )}

          {node.tier !== undefined && (
            <div>
              <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-3">Tier</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4].map(t => (
                  <button
                    key={t}
                    onClick={() => set('tier', t)}
                    className={cn(
                      'flex-1 py-2.5 rounded border font-mono text-sm font-bold transition-colors',
                      node.tier === t
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border/60 text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {node.type === 'directory' && (
            <div>
              <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-3">Access Type</Label>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => set('requiresHack', true)}
                  className={cn(
                    'flex-1 py-2.5 rounded border font-mono text-xs font-bold transition-colors',
                    node.requiresHack !== false
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/50'
                  )}
                >
                  Hackable
                </button>
                <button
                  onClick={() => set('requiresHack', false)}
                  className={cn(
                    'flex-1 py-2.5 rounded border font-mono text-xs font-bold transition-colors',
                    node.requiresHack === false
                      ? 'bg-chart-4/20 border-chart-4 text-chart-4'
                      : 'border-border/60 text-muted-foreground hover:border-chart-4/50'
                  )}
                >
                  Unsecure
                </button>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-2">
                {node.requiresHack === false ? 'No hack required — open and close freely.' : 'Requires a successful hack to unlock.'}
              </p>
            </div>
          )}

          {node.type === 'computer' && (
            <div>
              <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-3">Computer Tier</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => (
                  <button
                    key={t}
                    onClick={() => set('computerTier', t)}
                    className={cn(
                      'py-2 rounded border font-mono text-sm font-bold transition-colors',
                      (node.computerTier || 3) === t
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border/60 text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-2">DC: {13 + 4 * (node.computerTier || 3)}</p>
            </div>
          )}

          {(node.type === 'control_complex' || node.type === 'control_general') && (
            <div>
              <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2">Range Upgrade</Label>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                <button
                  onClick={() => set('rangeUpgrade', null)}
                  className={cn(
                    'py-2 rounded border font-mono text-[11px] font-bold transition-colors',
                    !node.rangeUpgrade
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/50'
                  )}
                >
                  Base
                </button>
                {MODULE_UPGRADES.map(upg => (
                  <button
                    key={upg.key}
                    onClick={() => set('rangeUpgrade', upg.key)}
                    className={cn(
                      'py-2 rounded border font-mono text-[11px] font-bold transition-colors',
                      node.rangeUpgrade === upg.key
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border/60 text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {upg.label}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-2">
                {node.rangeUpgrade
                  ? MODULE_UPGRADES.find(u => u.key === node.rangeUpgrade)?.description
                  : 'No range upgrade — module must be operated locally.'}
              </p>
            </div>
          )}

        </div>

        <NodeCostSection node={node} basePrice={basePrice} onUpdate={onUpdate} />

        {/* Countermeasures section */}
        <div className="border-t border-border/50 pt-5">
          <div className="flex items-center justify-between mb-4">
            <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80">
              Countermeasures {(node.countermeasures || []).filter(c => c.resolved).length > 0 && <span className="text-muted-foreground text-[10px]">({(node.countermeasures || []).filter(c => c.resolved).length} resolved)</span>}
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 px-3 font-mono text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Add Countermeasure
                </DropdownMenuLabel>
                {Object.entries(COUNTERMEASURE_TEMPLATES).map(([key, tpl]) => {
                  const Icon = CM_ICONS[tpl.icon];
                  return (
                    <DropdownMenuItem key={key} className="font-mono text-xs gap-2 cursor-pointer"
                      onClick={() => handleAddCm(node.id, key)}>
                      {Icon && <Icon className="w-3 h-3 text-destructive" />}
                      {tpl.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {pendingCm && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-2 mb-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-destructive leading-relaxed">
                  Already at limit ({totalCountermeasures}/{tier} for Tier {tier}). Override as admin and add anyway?
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" className="flex-1 font-mono text-xs h-7" onClick={confirmOverride}>
                  Override & Add
                </Button>
                <Button size="sm" variant="outline" className="flex-1 font-mono text-xs h-7" onClick={() => setPendingCm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {(node.countermeasures || []).length === 0 && !pendingCm && (
            <p className="font-mono text-[10px] text-muted-foreground/50 italic">No countermeasures</p>
          )}

          <div className="space-y-2">
            {(node.countermeasures || []).map(cm => {
              const Icon = CM_ICONS[cm.icon];
              const colorCls = CM_COLOR[cm.color] || CM_COLOR.red;
              return (
                <div key={cm.id} className={cn('rounded-lg border p-2.5 space-y-2', colorCls, cm.resolved && 'opacity-60')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon className="w-3 h-3" />}
                      <span className="font-mono text-xs font-semibold">{cm.label}</span>
                      {cm.resolved && <span className="font-mono text-[9px] text-accent ml-1">✓</span>}
                      {cm.triggered && <span className="font-mono text-[9px] text-destructive ml-1">TRIGGERED</span>}
                    </div>
                    <div className="flex gap-1">
                      {cm.resolved && (
                        <button onClick={() => onUpdateCm(node.id, cm.id, { resolved: false })}
                          className="opacity-50 hover:opacity-100 transition-opacity text-accent">
                          <Lock className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => onRemoveCm(node.id, cm.id)}
                        className="opacity-50 hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">
                        DC {cm.dcOverride !== undefined && cm.dcOverride !== null ? <span className="text-chart-4 ml-1">override</span> : ''}
                      </Label>
                      <div className="flex gap-1 mt-0.5">
                        <Input type="number" className="font-mono text-xs bg-background/20 border-current/20 h-7"
                          placeholder="Auto"
                          value={cm.dcOverride ?? ''}
                          onChange={e => {
                            const val = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                            onUpdateCm(node.id, cm.id, { dcOverride: val, dc: val ?? getExpectedCmDC(cm) });
                          }} />
                        {cm.dcOverride !== undefined && cm.dcOverride !== null && (
                          <button
                            className="px-2 py-0.5 text-[10px] font-mono text-current/50 hover:text-current border border-current/20 rounded"
                            title="Clear override"
                            onClick={() => onUpdateCm(node.id, cm.id, { dcOverride: null, dc: getExpectedCmDC(cm) })}
                          >✕</button>
                        )}
                      </div>
                    </div>
                    {cm.successes_required !== undefined && (
                      <div>
                        <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Successes</Label>
                        <Input type="number" className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                          value={cm.successes_required}
                          onChange={e => onUpdateCm(node.id, cm.id, { successes_required: parseInt(e.target.value) || 1 })} />
                      </div>
                    )}
                    {cm.type === 'firewall' && !cm.resolved && (
                      <div className="col-span-2">
                        <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Password (optional)</Label>
                        <Input className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                          placeholder="Leave blank for none"
                          value={cm.password || ''}
                          onChange={e => onUpdateCm(node.id, cm.id, { password: e.target.value })} />
                      </div>
                    )}
                    {cm.type === 'alarm' && (
                      <>
                        <div className="col-span-2">
                          <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Trigger</Label>
                          <Input className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                            placeholder="e.g., Failed hack attempt"
                            value={cm.trigger || ''}
                            onChange={e => onUpdateCm(node.id, cm.id, { trigger: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                          <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Effect</Label>
                          <Input className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                            placeholder="e.g., Alerts security"
                            value={cm.effect || ''}
                            onChange={e => onUpdateCm(node.id, cm.id, { effect: e.target.value })} />
                        </div>
                      </>
                    )}
                    {cm.type === 'shock_grid' && (
                      <div className="col-span-2">
                        <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Level</Label>
                        <div className="flex gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <button
                              key={lvl}
                              onClick={() => {
                                const tierDCs = [20, 22, 24, 27, 30];
                                onUpdateCm(node.id, cm.id, { level: lvl, dc: tierDCs[lvl - 1] });
                              }}
                              className={cn(
                                'flex-1 py-1 rounded border font-mono text-xs font-semibold transition-colors',
                                cm.level === lvl
                                  ? 'bg-current/20 border-current text-current'
                                  : 'border-current/30 text-current/60 hover:border-current/50'
                              )}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                        <p className="font-mono text-[8px] text-current/50 mt-1">DC {cm.dc}</p>
                      </div>
                    )}
                    </div>
                    {/* CM Cost */}
                    <div className="flex items-center gap-2 pt-1 border-t border-current/10">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60 shrink-0">Cost</span>
                      <Input
                        type="number"
                        className="font-mono text-xs bg-background/20 border-current/20 h-6 flex-1 min-w-0"
                        placeholder={String(getCountermeasureCost(cm, basePrice, 0))}
                        value={cm.costOverride ?? ''}
                        onChange={e => {
                          const val = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                          onUpdateCm(node.id, cm.id, { costOverride: val });
                        }}
                      />
                      <span className="font-mono text-[10px] text-current/70 shrink-0">
                        {(cm.costOverride != null ? cm.costOverride : getCountermeasureCost(cm, basePrice, 0)).toLocaleString()} cr
                      </span>
                    </div>
                    </div>
              );
            })}
          </div>
        </div>

        {/* Mark resolved */}
        <div className="border-t border-border/50 pt-5">
          <Button size="sm" variant="outline" className="font-mono text-sm w-full h-9 font-semibold"
            onClick={() => set('resolved', !node.resolved)}>
            {node.resolved ? 'Unresolve' : 'Mark Resolved'}
          </Button>
        </div>
      </div>
    </div>
  );
}