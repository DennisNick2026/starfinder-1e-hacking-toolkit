import React from 'react';
import {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock, Link, Trash2, Settings, Zap,
  Sparkles, EyeOff, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock, Sparkles,
};

const CM_ICONS = { ShieldAlert, Siren, UserX, Bug, EyeOff, Zap, Lock, Trash2 };

const COLOR_MAP = {
  cyan:   { border: 'border-primary/60',     bg: 'bg-primary/5',     text: 'text-primary',     glow: 'glow-cyan'   },
  green:  { border: 'border-accent/60',      bg: 'bg-accent/5',      text: 'text-accent',      glow: 'glow-green'  },
  red:    { border: 'border-destructive/60', bg: 'bg-destructive/5', text: 'text-destructive', glow: 'glow-red'    },
  purple: { border: 'border-chart-3/60',     bg: 'bg-chart-3/5',     text: 'text-chart-3',     glow: 'glow-purple' },
  yellow: { border: 'border-chart-4/60',     bg: 'bg-chart-4/5',     text: 'text-chart-4',     glow: 'glow-yellow' },
};

const CM_BADGE = {
  red:    'bg-destructive/20 text-destructive border-destructive/30',
  purple: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
};

export default function NodeCard({
  node, isSelected, isDragging,
  onSelect, onStartConnect, onDelete, onHack, onConfigure
}) {
  const Icon = ICONS[node.icon] || Terminal;
  const colors = COLOR_MAP[node.color] || COLOR_MAP.cyan;
  const progressPercent = node.successes_required
    ? Math.round((node.successes_current / node.successes_required) * 100)
    : 0;

  const activeCms = (node.countermeasures || []).filter(cm => !cm.resolved);

  return (
    <div
      className={cn(
        'absolute select-none cursor-grab active:cursor-grabbing',
        'w-48 rounded-lg border-2 transition-shadow duration-200',
        colors.border, colors.bg,
        isSelected && colors.glow,
        isDragging && 'opacity-70 scale-105',
        node.resolved && 'opacity-50 border-dashed',
      )}
      style={{ left: node.x, top: node.y }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <Icon className={cn('w-4 h-4 shrink-0', colors.text)} />
        <span className="font-mono text-xs font-semibold truncate text-foreground flex-1">
          {node.name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
          DC {node.dc}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        {node.resolved && (
          <span className="font-mono text-[10px] text-accent font-bold">✓ RESOLVED</span>
        )}

        {/* Progress bar */}
        {node.successes_required > 0 && !node.resolved && (
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                {node.successes_current}/{node.successes_required} successes
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Failure dots */}
        {node.failures_max > 0 && (
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">Fails:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: node.failures_max }).map((_, i) => (
                <div key={i} className={cn(
                  'w-2 h-2 rounded-full border',
                  i < (node.failures_current || 0)
                    ? 'bg-destructive border-destructive'
                    : 'border-muted-foreground/40'
                )} />
              ))}
            </div>
          </div>
        )}

        {/* Embedded countermeasures */}
        {activeCms.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {activeCms.map(cm => {
              const CmIcon = CM_ICONS[cm.icon];
              return (
                <span key={cm.id} className={cn(
                  'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-mono font-semibold',
                  CM_BADGE[cm.color] || CM_BADGE.red,
                  cm.triggered && 'animate-pulse'
                )}>
                  {CmIcon && <CmIcon className="w-2.5 h-2.5" />}
                  {cm.label}
                  {cm.countdown_current !== undefined && !cm.triggered && (
                    <span className="ml-0.5 opacity-70">[{cm.countdown_current}]</span>
                  )}
                  {cm.triggered && <span className="ml-0.5">!</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-border/50">
        <button
          className="flex-1 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
          onClick={(e) => { e.stopPropagation(); onHack(node); }}
          title="Hack this node"
        >
          <Zap className="w-3 h-3" />
          <span>Hack</span>
        </button>
        <button
          className="flex-1 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center border-l border-border/50"
          onClick={(e) => { e.stopPropagation(); onConfigure(node.id); }}
          title="Configure node"
        >
          <Settings className="w-3 h-3" />
        </button>
        <button
          className="flex-1 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center border-l border-border/50"
          onClick={(e) => { e.stopPropagation(); onStartConnect(node.id); }}
          title="Connect to another node"
        >
          <Link className="w-3 h-3" />
        </button>
        <button
          className="flex-1 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center border-l border-border/50"
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          title="Remove node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}