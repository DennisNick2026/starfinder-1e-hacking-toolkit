import React from 'react';
import {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock, Link, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock,
};

const COLOR_MAP = {
  cyan: { border: 'border-primary/60', bg: 'bg-primary/5', text: 'text-primary', glow: 'glow-cyan' },
  green: { border: 'border-accent/60', bg: 'bg-accent/5', text: 'text-accent', glow: 'glow-green' },
  red: { border: 'border-destructive/60', bg: 'bg-destructive/5', text: 'text-destructive', glow: 'glow-red' },
  purple: { border: 'border-chart-3/60', bg: 'bg-chart-3/5', text: 'text-chart-3', glow: 'glow-purple' },
  yellow: { border: 'border-chart-4/60', bg: 'bg-chart-4/5', text: 'text-chart-4', glow: 'glow-yellow' },
};

export default function NodeCard({
  node, isSelected, isDragging,
  onSelect, onStartConnect, onDelete
}) {
  const Icon = ICONS[node.icon] || Terminal;
  const colors = COLOR_MAP[node.color] || COLOR_MAP.cyan;

  const progressPercent = node.successes_required
    ? Math.round((node.successes_current / node.successes_required) * 100)
    : 0;

  return (
    <div
      className={cn(
        'absolute select-none cursor-grab active:cursor-grabbing',
        'w-44 rounded-lg border-2 transition-shadow duration-200',
        colors.border, colors.bg,
        isSelected && colors.glow,
        isDragging && 'opacity-70 scale-105',
        node.resolved && 'opacity-50 border-dashed',
        node.triggered && 'animate-pulse-glow'
      )}
      style={{ left: node.x, top: node.y }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <Icon className={cn('w-4 h-4 shrink-0', colors.text)} />
        <span className="font-mono text-xs font-semibold truncate text-foreground">
          {node.name}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            DC {node.dc}
          </span>
          {node.resolved && (
            <span className="font-mono text-[10px] text-accent font-bold">RESOLVED</span>
          )}
          {node.triggered && (
            <span className="font-mono text-[10px] text-destructive font-bold">TRIGGERED</span>
          )}
        </div>

        {/* Progress bar */}
        {node.successes_required > 0 && !node.resolved && (
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                {node.successes_current}/{node.successes_required}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', 
                  node.color === 'red' ? 'bg-destructive' : 'bg-primary'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Countdown */}
        {node.countdown !== undefined && !node.resolved && (
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">Timer:</span>
            <span className={cn(
              'font-mono text-xs font-bold',
              node.countdown_current <= 1 ? 'text-destructive' : 'text-chart-4'
            )}>
              {node.countdown_current}
            </span>
          </div>
        )}

        {/* Failure tracker for access points */}
        {node.failures_max > 0 && (
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">Fails:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: node.failures_max }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full border',
                    i < (node.failures_current || 0)
                      ? 'bg-destructive border-destructive'
                      : 'border-muted-foreground/40'
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-border/50">
        <button
          className="flex-1 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={(e) => { e.stopPropagation(); onStartConnect(node.id); }}
          title="Connect to another node"
        >
          <Link className="w-3 h-3 mx-auto" />
        </button>
        <button
          className="flex-1 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-l border-border/50"
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          title="Remove node"
        >
          <Trash2 className="w-3 h-3 mx-auto" />
        </button>
      </div>
    </div>
  );
}