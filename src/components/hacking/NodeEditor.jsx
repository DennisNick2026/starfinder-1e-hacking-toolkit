import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2, ShieldAlert, Siren, UserX, Bug, EyeOff, Zap, Lock } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { COUNTERMEASURE_TEMPLATES } from '@/lib/hacking-state';
import { cn } from '@/lib/utils';

const CM_ICONS = { ShieldAlert, Siren, UserX, Bug, EyeOff, Zap, Lock, Trash2 };
const CM_COLOR = {
  red: 'border-destructive/40 bg-destructive/5 text-destructive',
  purple: 'border-chart-3/40 bg-chart-3/5 text-chart-3',
};

export default function NodeEditor({ node, onUpdate, onClose, onAddCm, onUpdateCm, onRemoveCm }) {
  if (!node) return null;

  const set = (field, value) => onUpdate(node.id, { [field]: value });

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
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">DC</Label>
              <Input type="number" className="font-mono text-xs mt-1 bg-muted border-border"
                value={node.dc} onChange={e => set('dc', parseInt(e.target.value) || 0)} />
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
          {node.failures_max !== undefined && (
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Max Failures</Label>
              <Input type="number" className="font-mono text-xs mt-1 bg-muted border-border w-24"
                value={node.failures_max}
                onChange={e => set('failures_max', parseInt(e.target.value) || 1)} />
            </div>
          )}
          {node.dc_reduction !== undefined && (
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">DC Reduction</Label>
              <Input type="number" className="font-mono text-xs mt-1 bg-muted border-border w-24"
                value={node.dc_reduction}
                onChange={e => set('dc_reduction', parseInt(e.target.value) || 0)} />
            </div>
          )}

        </div>

        {/* Countermeasures section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Countermeasures
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
                      onClick={() => onAddCm(node.id, key)}>
                      {Icon && <Icon className="w-3 h-3 text-destructive" />}
                      {tpl.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {(node.countermeasures || []).length === 0 && (
            <p className="font-mono text-[10px] text-muted-foreground/50 italic">No countermeasures</p>
          )}

          <div className="space-y-2">
            {(node.countermeasures || []).map(cm => {
              const Icon = CM_ICONS[cm.icon];
              const colorCls = CM_COLOR[cm.color] || CM_COLOR.red;
              return (
                <div key={cm.id} className={cn('rounded-lg border p-2.5 space-y-2', colorCls)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon className="w-3 h-3" />}
                      <span className="font-mono text-xs font-semibold">{cm.label}</span>
                      {cm.resolved && <span className="font-mono text-[9px] text-accent ml-1">RESOLVED</span>}
                      {cm.triggered && <span className="font-mono text-[9px] text-destructive ml-1">TRIGGERED</span>}
                    </div>
                    <button onClick={() => onRemoveCm(node.id, cm.id)}
                      className="opacity-50 hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">DC</Label>
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
                    {cm.countdown !== undefined && (
                      <div>
                        <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Countdown</Label>
                        <Input type="number" className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                          value={cm.countdown}
                          onChange={e => {
                            const v = parseInt(e.target.value) || 1;
                            onUpdateCm(node.id, cm.id, { countdown: v, countdown_current: v });
                          }} />
                      </div>
                    )}
                    {cm.damage_per_phase !== undefined && (
                      <div>
                        <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Dmg/Phase</Label>
                        <Input type="number" className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                          value={cm.damage_per_phase}
                          onChange={e => onUpdateCm(node.id, cm.id, { damage_per_phase: parseInt(e.target.value) || 0 })} />
                      </div>
                    )}
                    {cm.damage_on_trigger !== undefined && (
                      <div>
                        <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Dmg Trigger</Label>
                        <Input type="number" className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                          value={cm.damage_on_trigger}
                          onChange={e => onUpdateCm(node.id, cm.id, { damage_on_trigger: parseInt(e.target.value) || 0 })} />
                      </div>
                    )}
                  </div>
                  {cm.type === 'firewall' && (
                    <div>
                      <Label className="font-mono text-[9px] uppercase tracking-wider text-current opacity-60">Password (optional)</Label>
                      <Input className="font-mono text-xs mt-0.5 bg-background/20 border-current/20 h-7"
                        placeholder="Leave blank for none"
                        value={cm.password || ''}
                        onChange={e => onUpdateCm(node.id, cm.id, { password: e.target.value })} />
                    </div>
                  )}
                  </div>
              );
            })}
          </div>
        </div>

        {/* Mark resolved */}
        <Button size="sm" variant="outline" className="font-mono text-xs w-full"
          onClick={() => set('resolved', !node.resolved)}>
          {node.resolved ? 'Unresolve' : 'Mark Resolved'}
        </Button>
      </div>
    </div>
  );
}