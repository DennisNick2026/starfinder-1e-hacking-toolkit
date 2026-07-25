import React from 'react';
import { cn } from '@/lib/utils';
import { Siren, Zap, Lock, Trash2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

const CM_ICONS = { ShieldAlert, Siren, Zap, Lock, Trash2 };

const STATE_STYLES = {
  hidden:      { label: 'HIDDEN',       cls: 'opacity-40 border-border/40 bg-muted/10',           badge: 'text-muted-foreground' },
  aware:       { label: 'AWARE',        cls: 'border-destructive/40 bg-destructive/5',             badge: 'text-destructive' },
  deactivated: { label: 'DEACTIVATED',  cls: 'opacity-50 border-accent/40 bg-accent/5',            badge: 'text-accent' },
  triggered:   { label: 'TRIGGERED',    cls: 'border-destructive bg-destructive/15 animate-pulse', badge: 'text-destructive' },
};

const STATES = ['hidden', 'aware', 'deactivated', 'triggered'];

export default function CountermeasureSidebar({
  countermeasures, nodes, mode, rootMode,
  onAdd, onUpdate, onRemove, onHack, onReorder, getSidebarCmDC,
}) {
  const accessCms = countermeasures.filter(cm => cm.category === 'access');
  const systemCms = countermeasures.filter(cm => cm.category === 'system');
  const entryNode = nodes.find(n => n.id === 'entry');
  const entryResolved = !!entryNode?.resolved;

  // Continuous numbering across both sections
  let cmNumber = 0;
  const numberedAccessCms = accessCms.map(cm => ({ ...cm, number: ++cmNumber }));
  const numberedSystemCms = systemCms.map(cm => ({ ...cm, number: ++cmNumber }));

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
      <div key={cm.id} className={cn('rounded-lg border p-2 space-y-1 transition-all bg-card/80', stateStyle.cls, isAccessOutPlay && 'opacity-30')}>
        <div className="flex items-center gap-1.5">
          {/* Number */}
          <span className="font-mono text-[10px] font-bold text-primary/70 w-4 text-center shrink-0">{cm.number}</span>

          {/* Icon hidden when state is hidden */}
          {!isHidden && <Icon className={cn('w-3.5 h-3.5 shrink-0', stateStyle.badge)} />}

          {isHidden ? (
            <span className="font-mono text-xs text-muted-foreground flex-1">???</span>
          ) : (
            <span className={cn('font-mono text-xs font-semibold flex-1 truncate', stateStyle.badge)}>{cm.label}</span>
          )}

          {/* Reorder (admin only) */}
          {mode === 'create' && (
            <div className="flex flex-col shrink-0">
              <button onClick={() => onReorder(cm.id, 'up')} className="text-muted-foreground/50 hover:text-primary transition-colors leading-none" title="Move up">
                <ChevronUp className="w-3 h-3" />
              </button>
              <button onClick={() => onReorder(cm.id, 'down')} className="text-muted-foreground/50 hover:text-primary transition-colors leading-none" title="Move down">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* State toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn('font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity shrink-0', stateStyle.badge, 'border-current/30')}>
                {stateStyle.label}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
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
          <div className="flex items-center justify-between gap-2 pl-5">
            <span className="font-mono text-[10px] text-muted-foreground">DC {effectiveDC}</span>
            {mode === 'create' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-mono text-[9px] text-muted-foreground/70 hover:text-foreground border border-border/40 rounded px-1.5 py-0.5 truncate max-w-[90px] flex items-center gap-1">
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
              targetNode && <span className="font-mono text-[9px] text-muted-foreground/70 truncate max-w-[90px]">→ {targetNode.name}</span>
            )}
          </div>
        )}

        {isAccessOutPlay && !isHidden && (
          <p className="font-mono text-[9px] text-muted-foreground/60 italic pl-5">Out of play</p>
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
    <div className="absolute left-3 top-3 z-20 w-60 flex flex-col gap-2 max-h-[calc(100%-1.5rem)] overflow-y-auto bg-card/85 backdrop-blur-sm border-2 border-primary/40 rounded-xl p-2 shadow-2xl">
      {/* Access Countermeasures */}
      <div className="flex flex-col" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'access')}>
        <div className="px-1 py-1 border-b border-primary/30 mb-1.5">
          <h3 className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">Access CMs</h3>
        </div>
        <div className="space-y-1.5">
          {numberedAccessCms.length === 0 ? (
            <p className="font-mono text-[9px] text-muted-foreground/40 italic text-center py-2">Drop CMs here</p>
          ) : numberedAccessCms.map(renderCm)}
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* System Countermeasures */}
      <div className="flex flex-col" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'system')}>
        <div className="px-1 py-1 border-b border-primary/30 mb-1.5">
          <h3 className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">System CMs</h3>
        </div>
        <div className="space-y-1.5">
          {numberedSystemCms.length === 0 ? (
            <p className="font-mono text-[9px] text-muted-foreground/40 italic text-center py-2">Drop CMs here</p>
          ) : numberedSystemCms.map(renderCm)}
        </div>
      </div>
    </div>
  );
}