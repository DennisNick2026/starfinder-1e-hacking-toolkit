import React from 'react';
import { cn } from '@/lib/utils';
import { Siren, Zap, Lock, Trash2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CM_ICONS = { ShieldAlert, Siren, Zap, Lock, Trash2 };

const STATE_STYLES = {
  hidden:      { label: 'Hidden',      cls: 'opacity-40 border-border/40 bg-muted/10',           badge: 'text-muted-foreground',   btn: 'border-muted-foreground/30 text-muted-foreground' },
  aware:       { label: 'Aware',       cls: 'border-destructive/40 bg-destructive/5',             badge: 'text-destructive',        btn: 'border-destructive/40 text-destructive' },
  deactivated: { label: 'Deactivated', cls: 'opacity-50 border-accent/40 bg-accent/5',            badge: 'text-accent',             btn: 'border-accent/40 text-accent' },
  triggered:   { label: 'Triggered',   cls: 'border-destructive bg-destructive/15 animate-pulse', badge: 'text-destructive',        btn: 'border-destructive text-destructive' },
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
      <div key={cm.id} className={cn('rounded-lg border p-2.5 space-y-1.5 transition-all bg-card/80', stateStyle.cls, isAccessOutPlay && 'opacity-30')}>
        <div className="flex items-center gap-2">
          {/* Number */}
          <span className="font-mono text-xs font-bold text-primary/70 w-5 text-center shrink-0">{cm.number}</span>

          {/* Icon hidden when state is hidden */}
          {!isHidden && <Icon className={cn('w-4 h-4 shrink-0', stateStyle.badge)} />}

          {isHidden ? (
            <span className="font-mono text-sm text-muted-foreground flex-1">???</span>
          ) : (
            <span className={cn('font-mono text-sm font-semibold flex-1 truncate', stateStyle.badge)}>{cm.label}</span>
          )}

          {/* Reorder (admin only) */}
          {mode === 'create' && (
            <div className="flex flex-col shrink-0">
              <button onClick={() => onReorder(cm.id, 'up')} className="text-muted-foreground/50 hover:text-primary transition-colors leading-none" title="Move up">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onReorder(cm.id, 'down')} className="text-muted-foreground/50 hover:text-primary transition-colors leading-none" title="Move down">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* State toggle buttons */}
        <div className="grid grid-cols-2 gap-1 pl-5">
          {STATES.map(s => {
            const active = cm.state === s;
            const sStyle = STATE_STYLES[s];
            return (
              <button
                key={s}
                onClick={() => onUpdate(cm.id, { state: s })}
                className={cn(
                  'font-mono text-[10px] font-bold uppercase tracking-wide py-1 rounded border transition-all',
                  active
                    ? cn(sStyle.btn, 'bg-muted/30')
                    : 'border-border/40 text-muted-foreground/40 hover:text-muted-foreground hover:border-border'
                )}
              >
                {sStyle.label}
              </button>
            );
          })}
        </div>

        {!isHidden && (
          <div className="flex items-center justify-between gap-2 pl-5">
            <span className="font-mono text-xs text-muted-foreground">DC {effectiveDC}</span>
            {mode === 'create' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-mono text-[10px] text-muted-foreground/70 hover:text-foreground border border-border/40 rounded px-2 py-0.5 truncate max-w-[90px] flex items-center gap-1">
                    {targetNode ? targetNode.name : 'No target'}
                    <ChevronDown className="w-2.5 h-2.5" />
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
              targetNode && <span className="font-mono text-[10px] text-muted-foreground/70 truncate max-w-[90px]">→ {targetNode.name}</span>
            )}
          </div>
        )}

        {isAccessOutPlay && !isHidden && (
          <p className="font-mono text-[10px] text-muted-foreground/60 italic pl-5">Out of play</p>
        )}

        {canHack && (
          <button
            onClick={() => onHack(cm)}
            className="w-full py-2 font-mono text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded border border-primary/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" /> HACK
          </button>
        )}

        {mode === 'create' && (
          <button
            onClick={() => onRemove(cm.id)}
            className="w-full py-0.5 font-mono text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="absolute left-3 top-3 z-20 w-64 flex flex-col gap-2 max-h-[calc(100%-300px)] bg-card/85 backdrop-blur-sm border-2 border-primary/40 shadow-2xl overflow-hidden"
      style={{
        clipPath: 'polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
      }}
    >
      <div className="p-2.5 flex flex-col gap-2 overflow-y-auto">
        {/* Access Countermeasures */}
        <div className="flex flex-col" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'access')}>
          <div className="px-1 py-1 border-b border-primary/30 mb-1.5">
            <h3 className="font-mono text-xs font-bold text-primary uppercase tracking-widest">Access CMs</h3>
          </div>
          <div className="space-y-1.5">
            {numberedAccessCms.length === 0 ? (
              <p className="font-mono text-[10px] text-muted-foreground/40 italic text-center py-2">Drop CMs here</p>
            ) : numberedAccessCms.map(renderCm)}
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* System Countermeasures */}
        <div className="flex flex-col" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'system')}>
          <div className="px-1 py-1 border-b border-primary/30 mb-1.5">
            <h3 className="font-mono text-xs font-bold text-primary uppercase tracking-widest">System CMs</h3>
          </div>
          <div className="space-y-1.5">
            {numberedSystemCms.length === 0 ? (
              <p className="font-mono text-[10px] text-muted-foreground/40 italic text-center py-2">Drop CMs here</p>
            ) : numberedSystemCms.map(renderCm)}
          </div>
        </div>
      </div>
    </div>
  );
}