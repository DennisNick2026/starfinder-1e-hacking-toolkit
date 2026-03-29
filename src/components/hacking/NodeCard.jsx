import React from 'react';
import {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock, Link, Trash2, Settings, Zap,
  Sparkles, EyeOff, Lock, LogIn, ShieldCheck, FolderLock, FolderOpen, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DATA_NODE_TYPES = ['secure_data_average', 'secure_data_large', 'secure_data_specific'];

const ICONS = {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock, Sparkles, LogIn, ShieldCheck, FolderLock, FolderOpen,
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
  onSelect, onStartConnect, onDelete, onHack, onConfigure, onOpenFile, mode = 'create',
  hiddenByDirectory = false, onUnresolveCm = null,
}) {
  // In play mode, nodes hidden inside a locked directory are invisible
  if (hiddenByDirectory && mode === 'play') return null;

  const Icon = node.type === 'directory'
    ? (node.locked ? FolderLock : FolderOpen)
    : (ICONS[node.icon] || Terminal);
  // Check for unresolved firewall
  const allCms = (node.countermeasures || []);
  const allActiveCms = allCms.filter(cm => !cm.resolved);
  const hasUnresolvedFirewall = allActiveCms.some(cm => cm.type === 'firewall');
  const firewallBlocked = mode === 'play' && hasUnresolvedFirewall;

  const colors = firewallBlocked ? COLOR_MAP.red : (COLOR_MAP[node.color] || COLOR_MAP.cyan);
  const progressPercent = node.successes_required
    ? Math.round((node.successes_current / node.successes_required) * 100)
    : 0;

  // What to show on the card face
  const activeCms = mode === 'play'
    ? allActiveCms.filter(cm => {
        if (cm.type === 'fake_shell') return false;
        if (cm.type === 'alarm' && !cm.revealed && !cm.triggered) return false;
        if (hasUnresolvedFirewall && cm.type !== 'firewall') return false;
        return true;
      })
    : allActiveCms;

  return (
    <div
      className={cn(
        'absolute select-none cursor-grab active:cursor-grabbing',
        'w-56 rounded-lg border-2 transition-shadow duration-200',
        colors.border, colors.bg,
        isSelected && colors.glow,
        isDragging && 'opacity-70 scale-105',
        node.resolved && 'opacity-50 border-dashed',
        node.isEntry && 'border-primary glow-cyan',
      )}
      style={{ left: node.x, top: node.y }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        {firewallBlocked ? (
          <>
            <ShieldAlert className="w-4 h-4 shrink-0 text-destructive" />
            <span className="font-mono text-xs font-semibold text-foreground flex-1">FIREWALL</span>
          </>
        ) : (
          <>
            <Icon className={cn('w-4 h-4 shrink-0', colors.text)} />
            <span className="font-mono text-xs font-semibold truncate text-foreground flex-1">{node.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground shrink-0">DC {node.dc}</span>
          </>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        {node.resolved && (
          <span className="font-mono text-[10px] text-accent font-bold">
            {node.type === 'directory' ? '✓ UNLOCKED' : '✓ RESOLVED'}
          </span>
        )}

        {/* Directory lock status — hidden in play mode when firewalled (would reveal node type) */}
        {node.type === 'directory' && !node.resolved && !firewallBlocked && (
          <div className="flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-chart-4" />
            <span className="font-mono text-[10px] text-chart-4">LOCKED</span>
            {node.password && mode !== 'play' && (
              <span className="font-mono text-[9px] text-muted-foreground ml-1">pw: {node.password}</span>
            )}
          </div>
        )}

        {/* Progress bar */}
        {node.successes_required > 0 && !node.resolved && (
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] text-muted-foreground">
              {node.successes_current}/{node.successes_required} successes
            </span>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}



        {firewallBlocked ? (
          <p className="font-mono text-[9px] text-muted-foreground/60 italic">Contents hidden</p>
        ) : (
          <>
            {/* Embedded countermeasures (unresolved) */}
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

            {/* Resolved countermeasures (play mode) */}
            {mode === 'play' && allCms.filter(cm => cm.resolved).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5 border-t border-border/30 mt-1.5 pt-1">
                {allCms.filter(cm => cm.resolved).map(cm => {
                  const CmIcon = CM_ICONS[cm.icon];
                  return (
                    <button
                      key={cm.id}
                      onClick={(e) => { e.stopPropagation(); onUnresolveCm?.(node.id, cm.id); }}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-mono font-semibold',
                        'opacity-60 hover:opacity-100 transition-opacity cursor-pointer',
                        CM_BADGE[cm.color] || CM_BADGE.red
                      )}
                      title="Click to reactivate"
                    >
                      {CmIcon && <CmIcon className="w-3 h-3" />}
                      {cm.label}
                      <span className="ml-1 text-accent">✓</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-border/50">
        {!node.noHack && (
          <button
            className={cn(
              'flex-1 py-2 text-[10px] font-mono transition-colors flex items-center justify-center gap-1.5',
              node.resolved
                ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            )}
            onClick={(e) => { e.stopPropagation(); onHack(node); }}
            title={node.resolved ? 'Revert this node' : 'Hack this node'}
          >
            <Zap className="w-3 h-3" />
            <span>{node.resolved ? 'Revert' : 'Hack'}</span>
          </button>
        )}
        {DATA_NODE_TYPES.includes(node.type) && (mode === 'create' || node.resolved) && (
          <button
            className="flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-1.5 border-l border-border/50"
            onClick={(e) => { e.stopPropagation(); onOpenFile?.(node); }}
            title="Open data file"
          >
            <FileText className="w-3 h-3" />
            <span>File</span>
          </button>
        )}
        {mode === 'create' && (
          <>
            <button
              className={cn(
                'flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center border-l border-border/50'
              )}
              onClick={(e) => { e.stopPropagation(); onConfigure(node.id); }}
              title="Configure node"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              className="flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center border-l border-border/50"
              onClick={(e) => { e.stopPropagation(); onStartConnect(node.id); }}
              title="Connect to another node"
            >
              <Link className="w-3.5 h-3.5" />
            </button>
            {!node.isEntry && !node.isRootAccess && (
              <button
                className="flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center border-l border-border/50"
                onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                title="Remove node"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}