import React from 'react';
import { cn } from '@/lib/utils';
import { Siren, Zap, Lock, Trash2, ShieldAlert, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

const CM_ICONS = { ShieldAlert, Siren, Zap, Lock, Trash2 };

const STATE_STYLES = {
  hidden:      { label: 'HIDDEN',     cls: 'opacity-40 border-border/40 bg-muted/10',           badge: 'text-muted-foreground' },
  aware:       { label: 'AWARE',      cls: 'border-destructive/40 bg-destructive/5',             badge: 'text-destructive' },
  deactivated: { label: 'OFFLINE',    cls: 'opacity-50 border-accent/40 bg-accent/5',            badge: 'text-accent' },
  triggered:   { label: 'TRIGGERED',  cls: 'border-destructive bg-destructive/15 animate-pulse', badge: 'text-destructive' },
};

const STATES = ['hidden', 'aware', 'deactivated', 'triggered'];

export default function CountermeasureSidebar({
  countermeasures, nodes, mode, rootMode,
  onAdd, onUpdate, onRemove, onHack, getSidebarCmDC,
}) {
  const accessCms = countermeasures.filter(cm => cm.category === 'access');
  const systemCms = countermeasures.filter(cm => cm.category === 'system');
  const entryNode = nodes.find(n => n.id === 'entry');
  const entryResolved = !!entryNode?.resolved;

  const handleDrop = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    const cmType = e.dataTransfer.getData('sidebarCm');
    if (!cmType || cmType === 'firewall') return;
    const initialState = mode === 'play' ? 'hidden' : 'aware';
    onAdd(cmType, category, initialState);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const renderCm = (cm) => {
    const Icon = CM_ICONS[cm.icon] || ShieldAlert;
    const stateStyle = STATE_STYLES[cm.state] || STATE_STYLES.hidden;
    const targetNode = cm.targetNodeId ? nodes.find(n => n.id === cm.targetNodeId) : null;
    const dc = getSidebarCmDC(cm);
    const effectiveDC = rootMode ? 10 : dc;
    const isHidden = cm.state === 'hidden';
    const isAware = cm.state === 'aware';
    const isTriggered = cm.state === 'triggered';
    const isAccessOutPlay = mode === 'play' && cm.category === 'access' && entryResolved;
    const canHack = (isAware || isTriggered) && !isAccessOutPlay;

    return (
      <div key={cm.id} className={cn('rounded-lg border p-2.5 space-y-1.5 transition-all', stateStyle.cls, isAccessOutPlay && 'opacity-30')}>
        <div className="flex items-center gap-2">
          <Icon className={cn('w-3.5 h-3.5 shrink-0', isHidden ? 'text-muted-foreground' : stateStyle.badge)} />
          {isHidden ? (
            <span className="font-mono text-xs text-muted-foreground flex-1">???</span>
          ) : (
            <span className={cn('font-mono text-xs font-semibold flex-1 truncate', stateStyle.badge)}>{cm.label}</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn('font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity', stateStyle.badge, 'border-current/30')}>
                {stateStyle.label}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-28">
              <DropdownMenuLabel className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Set State</DropdownMenuLabel>
              {STATES.map(s => (
                <DropdownMenuItem key={s} className="font-mono text-xs cursor-pointer" onClick={() => onUpdate(cm.id, { state: s })}>
                  {STATE_STYLES[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isHidden && (
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">DC {effectiveDC}</span>
            {mode === 'create' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-mono text-[9px] text-muted-foreground/70 hover:text-foreground border border-border/40 rounded px-1.5 py-0.5 truncate max-w-[100px] flex items-center gap-1">
                    {targetNode ? targetNode.name : 'No target'}
                    <ChevronDown className="w-2 h-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 max-h-48 overflow-y-auto">
                  <DropdownMenuItem className="font-mono text-xs cursor-pointer" onClick={() => onUpdate(cm.id, { targetNodeId: null })}>
                    None
                  </DropdownMenuItem>
                  {nodes.filter(n => !n.isEntry && !n.isRootAccess).map(n => (
                    <DropdownMenuItem key={n.id} className="font-mono text-xs cursor-pointer" onClick={() => onUpdate(cm.id, { targetNodeId: n.id })}>
                      {n.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              targetNode && <span className="font-mono text-[9px] text-muted-foreground/70 truncate max-w-[100px]">→ {targetNode.name}</span>
            )}
          </div>
        )}

        {isAccessOutPlay && !isHidden && (
          <p className="font-mono text-[9px] text-muted-foreground/60 italic">Out of play</p>
        )}

        {canHack && (
          <button
            onClick={() => onHack(cm)}
            className="w-full py-1.5 font-mono text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded border border-primary/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3 h-3" /> HACK
          </button>
        )}

        {mode === 'create' && (
          <button
            onClick={() => onRemove(cm.id)}
            className="w-full py-0.5 font-mono text-[9px] text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 className="w-2.5 h-2.5" /> Remove
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col overflow-hidden shrink-0">
      {/* Access Countermeasures */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'access')}
      >
        <div className="px-3 py-2.5 border-b border-border/50 bg-secondary/20">
          <h3 className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">Access CMs</h3>
          <p className="font-mono text-[9px] text-muted-foreground/60">Entry node defenses</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {accessCms.length === 0 ? (
            <p className="font-mono text-[9px] text-muted-foreground/40 italic text-center py-4">Drop CMs here</p>
          ) : accessCms.map(renderCm)}
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* System Countermeasures */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'system')}
      >
        <div className="px-3 py-2.5 border-b border-border/50 bg-secondary/20">
          <h3 className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">System CMs</h3>
          <p className="font-mono text-[9px] text-muted-foreground/60">Past entry node</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {systemCms.length === 0 ? (
            <p className="font-mono text-[9px] text-muted-foreground/40 italic text-center py-4">Drop CMs here</p>
          ) : systemCms.map(renderCm)}
        </div>
      </div>
    </div>
  );
}