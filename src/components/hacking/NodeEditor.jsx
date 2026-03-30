import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2, ShieldAlert, Siren, UserX, Bug, EyeOff, Zap, Lock, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTERMEASURE_TEMPLATES } from '@/lib/hacking-state';
import { cn } from '@/lib/utils';

const CM_ICONS = { ShieldAlert, Siren, UserX, Bug, EyeOff, Zap, Lock, Trash2 };
const CM_COLOR = {
  red: 'border-destructive/40 bg-destructive/5 text-destructive',
  purple: 'border-chart-3/40 bg-chart-3/5 text-chart-3',
};

export default function NodeEditor({ node, onUpdate, onClose, onAddCm, onUpdateCm, onRemoveCm, totalCountermeasures = 0, tier = 3, allNodes = [] }) {
  const [pendingCm, setPendingCm] = useState(null); // { nodeId, cmType } waiting for override confirm

  if (!node) return null;

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
    <div className="w-72 bg-card border-l border-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-mono text-sm font-semibold text-primary">Configure Node</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic fields */}
        <div className="space-y-3">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input className="font-mono text-xs mt-1 bg-muted border-border" value={node.name}
              onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea className="font-mono text-xs mt-1 bg-muted border-border h-14 resize-none"
              value={node.description || ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                DC {node.dcOverride !== undefined && node.dcOverride !== null ? <span className="text-chart-4 ml-1">override</span> : ''}
              </Label>
              <div className="flex gap-1 mt-1">
                <Input type="number" className="font-mono text-xs bg-muted border-border"
                  placeholder="Auto"
                  value={node.dcOverride ?? ''}
                  onChange={e => {
                    const val = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                    set('dcOverride', val);
                  }} />
                {node.dcOverride !== undefined && node.dcOverride !== null && (
                  <button
                    className="px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive border border-border rounded"
                    title="Clear override"
                    onClick={() => set('dcOverride', null)}
                  >✕</button>
                )}
              </div>
            </div>
            {node.successes_required !== undefined && (
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Successes</Label>
                <Input type="number" className="font-mono text-xs mt-1 bg-muted border-border"
                  value={node.successes_required}
                  onChange={e => set('successes_required', parseInt(e.target.value) || 1)} />
              </div>
            )}
          </div>

          {node.dc_reduction !== undefined && (
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">DC Reduction</Label>
              <Input type="number" className="font-mono text-xs mt-1 bg-muted border-border w-24"
                value={node.dc_reduction}
                onChange={e => set('dc_reduction', parseInt(e.target.value) || 0)} />
            </div>
          )}
          {node.file_content !== undefined && (
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">File Contents</Label>
              <Textarea className="font-mono text-xs mt-1 bg-muted border-border h-28 resize-none"
                placeholder="Enter secret data file contents..."
                value={node.file_content || ''}
                onChange={e => set('file_content', e.target.value)} />
            </div>
          )}

          {node.tier !== undefined && (
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tier</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map(t => (
                  <button
                    key={t}
                    onClick={() => set('tier', t)}
                    className={cn(
                      'flex-1 py-2 rounded border font-mono text-xs font-semibold transition-colors',
                      node.tier === t
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Countermeasures section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Countermeasures {(node.countermeasures || []).filter(c => c.resolved).length > 0 && `(${(node.countermeasures || []).filter(c => c.resolved).length} resolved)`}
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 px-2 font-mono text-[10px] gap-1 text-primary hover:text-primary">
                  <Plus className="w-3 h-3" /> Add
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
                        DC {cm.dc !== getExpectedCmDC(cm) ? <span className="text-chart-4 ml-1">override</span> : ''}
                      </Label>
                      <Input type="number" className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                        value={cm.dc}
                        onChange={e => onUpdateCm(node.id, cm.id, { dc: parseInt(e.target.value) || 0 })} />
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
                    </div>
              );
            })}
          </div>
        </div>

        {/* Fake Shell node tagging */}
        {!node.isEntry && !node.isRootAccess && (
          <div className="space-y-2 border-t border-border pt-3">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Fake Shell</Label>
            <button
              onClick={() => set('fake', !node.fake)}
              className={cn(
                'w-full py-2 rounded border font-mono text-xs font-semibold transition-colors',
                node.fake
                  ? 'bg-chart-3/20 border-chart-3 text-chart-3'
                  : 'border-border text-muted-foreground hover:border-chart-3/50'
              )}
            >
              {node.fake ? 'Fake Node ✓' : 'Mark as Fake Node'}
            </button>
            {node.fake && (
              <>
                <p className="font-mono text-[9px] text-chart-3/70 mt-1">This node is a decoy. It will vanish when a fake shell is detected.</p>
                <div className="mt-2">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Reveals Real Node</Label>
                  <Select
                    value={node.realNodeId || 'none'}
                    onValueChange={v => set('realNodeId', v === 'none' ? null : v)}
                  >
                    <SelectTrigger className="mt-1 font-mono text-xs bg-muted border-border h-8">
                      <SelectValue placeholder="None (just vanishes)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="font-mono text-xs">None (just vanishes)</SelectItem>
                      {allNodes
                        .filter(n => n.id !== node.id && !n.fake && !n.isEntry && !n.isRootAccess)
                        .map(n => (
                          <SelectItem key={n.id} value={n.id} className="font-mono text-xs">{n.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  {node.realNodeId && <p className="font-mono text-[9px] text-primary/60 mt-1">Linked real node will be hidden until this fake is detected.</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Mark resolved */}
        <Button size="sm" variant="outline" className="font-mono text-xs w-full"
          onClick={() => set('resolved', !node.resolved)}>
          {node.resolved ? 'Unresolve' : 'Mark Resolved'}
        </Button>
      </div>
    </div>
  );
}