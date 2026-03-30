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
  blue:   { border: 'border-chart-2/60',     bg: 'bg-chart-2/5',     text: 'text-chart-2',     glow: 'glow-green'  },
  green:  { border: 'border-control/60',     bg: 'bg-control/5',     text: 'text-control',     glow: 'glow-cyan'   },
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
  onSelect, onStartConnect, onDelete, onHack, onUnhack, onConfigure, onOpenFile, mode = 'create',
  hiddenByDirectory = false, onUnresolveCm = null, onResolveCm = null, onToggleDirectoryLocked = null,
  effectiveBaseDC = 25, getNodeDC = null,
}) {
  // In play mode, nodes hidden inside a locked directory are invisible
  if (hiddenByDirectory && mode === 'play') return null;
  
  // Calculate DC dynamically
  const calculateDC = (n) => {
    if (!getNodeDC) {
      // Fallback to stored DC if helper not provided
      return n.dc ?? 25;
    }
    return getNodeDC(n, effectiveBaseDC);
  };
  const nodeDC = calculateDC(node);

  // Special compact rendering for entry and root access nodes
  if (node.isEntry || node.isRootAccess) {
    const Icon = node.isRootAccess ? ShieldCheck : LogIn;
    const hacked = !!node.resolved;
    const hackedColors = node.isRootAccess ? COLOR_MAP.purple : { border: 'border-accent/70', bg: 'bg-accent/10', text: 'text-accent', glow: 'glow-yellow' };
    const baseColors = node.isRootAccess ? COLOR_MAP.purple : COLOR_MAP.cyan;
    const colors = hacked ? hackedColors : baseColors;
    const showHack = !node.noHack;
    const showConfigure = mode === 'create' && node.isEntry;

    return (
      <div
        className={cn(
          'select-none cursor-grab active:cursor-grabbing',
          'w-32 rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 pt-3 pb-1',
          colors.border, colors.bg,
          (isSelected || hacked) && colors.glow,
          isDragging && 'opacity-70 scale-105',
        )}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      >
        <Icon className={cn('w-8 h-8', colors.text)} />
        <span className="font-mono text-xs font-bold text-foreground text-center">{node.label}</span>
        {/* Hacked status */}
        {node.isEntry && (
          <span className={cn(
            'font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border',
            hacked
              ? 'text-accent border-accent/40 bg-accent/10'
              : 'text-muted-foreground border-border/50 bg-muted/30'
          )}>
            {hacked ? '✓ BREACHED' : 'LOCKED'}
          </span>
        )}
        {/* Countermeasures */}
        {(node.countermeasures || []).filter(cm => !cm.resolved).length > 0 && (
          <div className="flex flex-wrap justify-center gap-0.5 px-1">
            {(node.countermeasures || []).filter(cm => !cm.resolved).map(cm => {
              const CmIcon = CM_ICONS[cm.icon];
              return (
                <span key={cm.id} className={cn(
                  'inline-flex items-center gap-0.5 px-1 py-0.5 rounded border text-[8px] font-mono font-semibold',
                  CM_BADGE[cm.color] || CM_BADGE.red,
                  cm.triggered && 'animate-pulse'
                )}>
                  {CmIcon && <CmIcon className="w-2 h-2" />}
                </span>
              );
            })}
          </div>
        )}
        {(showHack || showConfigure) && (
          <div className="flex w-full border-t border-border/50 mt-1">
            {showHack && (
              <button
                className={cn(
                  'flex-1 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1',
                  showConfigure && 'border-r border-border/50'
                )}
                onClick={(e) => { e.stopPropagation(); onHack(node); }}
                title="Hack this node"
              >
                <Zap className="w-3 h-3" />
              </button>
            )}
            {showConfigure && (
              <button
                className="flex-1 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); onConfigure(node.id); }}
                title="Configure node"
              >
                <Settings className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

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
        if (cm.type === 'fake_shell') return false; // only show once resolved (via resolved list)
        if (cm.type === 'alarm' && !cm.revealed && !cm.triggered) return false;
        if (hasUnresolvedFirewall && cm.type !== 'firewall') return false;
        return true;
      })
    : allActiveCms;

  // In play mode, show fake_shell only after it's resolved (detected)
  const resolvedFakeShell = mode === 'play' && allCms.some(cm => cm.type === 'fake_shell' && cm.resolved);

  return (
    <div
      className={cn(
        'select-none cursor-grab active:cursor-grabbing',
        'w-72 rounded-lg border-2 transition-shadow duration-200',
        colors.border, colors.bg,
        isSelected && colors.glow,
        isDragging && 'opacity-70 scale-105',
        node.resolved && 'opacity-50 border-dashed',
        node.isEntry && 'border-primary glow-cyan',
        // Fake nodes get a subtle purple tint in create mode
        node.fake && mode === 'create' && 'border-chart-3/60 bg-chart-3/5',
        // Real-hidden nodes get a subtle muted look in create mode
        node.real_hidden && mode === 'create' && 'opacity-60',
      )}
      style={{  }}
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
            <span className="font-mono text-xs font-semibold text-foreground flex-1 break-words">{node.name}</span>
            {/* Admin-only labels for fake shell setup */}
            {node.fake && mode === 'create' && (
              <span className="font-mono text-[8px] font-bold px-1 py-0.5 rounded border border-chart-3/50 bg-chart-3/10 text-chart-3 shrink-0">FAKE</span>
            )}
            {node.real_hidden && mode === 'create' && (
              <span className="font-mono text-[8px] font-bold px-1 py-0.5 rounded border border-muted-foreground/30 bg-muted/30 text-muted-foreground shrink-0">HIDDEN</span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground shrink-0">DC {nodeDC}</span>
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
        {resolvedFakeShell && (
          <span className="font-mono text-[10px] text-chart-3 font-bold flex items-center gap-1">
            <EyeOff className="w-3 h-3" /> FAKE SHELL DETECTED
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
                  // Triggered alarms in play mode are clickable to open hack dialog
                  if (mode === 'play' && cm.type === 'alarm' && cm.triggered) {
                    return (
                      <button
                        key={cm.id}
                        onClick={(e) => { e.stopPropagation(); onHack?.(node, cm.id); }}
                        className={cn(
                          'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-mono font-semibold animate-pulse',
                          'cursor-pointer hover:opacity-80 hover:animate-none transition-opacity',
                          CM_BADGE[cm.color] || CM_BADGE.red
                        )}
                        title="Click to hack this alarm"
                      >
                        {CmIcon && <CmIcon className="w-2.5 h-2.5" />}
                        {cm.label} ! <span className="ml-0.5 opacity-60">[hack]</span>
                      </button>
                    );
                  }
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
      <div className="flex flex-wrap border-t border-border/50">
        {!node.noHack && (
          node.resolved ? (
            <>
              {mode === 'play' && allCms.some(cm => cm.type === 'alarm' && cm.triggered && !cm.resolved) && (
                <button
                  className="flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); onHack(node); }}
                  title="Hack triggered alarm"
                >
                  <Zap className="w-3 h-3" />
                  <span>Alarm</span>
                </button>
              )}
              {mode === 'play' && (
                <button
                  className="flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5 border-l border-border/50"
                  onClick={(e) => { e.stopPropagation(); onUnhack?.(node.id); }}
                  title="Revert breach"
                >
                  <Zap className="w-3 h-3" />
                  <span>Revert</span>
                </button>
              )}
              {mode !== 'play' && (
                <button
                  className="flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); onUnhack?.(node.id); }}
                  title="Revert this node"
                >
                  <Zap className="w-3 h-3" />
                  <span>Revert</span>
                </button>
              )}
            </>
          ) : (
            <button
              className="flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
              onClick={(e) => { e.stopPropagation(); onHack(node); }}
              title="Hack this node"
            >
              <Zap className="w-3 h-3" />
              <span>Hack</span>
            </button>
          )
        )}
        {node.type === 'directory' && node.resolved && (
          <button
            className={cn(
              'flex-1 py-2 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 border-l border-border/50',
              node.locked ? 'hover:bg-accent/10' : 'hover:bg-destructive/10'
            )}
            onClick={(e) => { e.stopPropagation(); onToggleDirectoryLocked?.(node.id); }}
            title={node.locked ? 'Open directory' : 'Close directory'}
          >
            {node.locked ? <FolderLock className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />}
            <span>{node.locked ? 'Open' : 'Close'}</span>
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
        {/* Fake shell scan button — visible in play mode when node is resolved and fake_shell CM is present but unresolved */}
        {mode === 'play' && node.resolved && allCms.some(cm => cm.type === 'fake_shell' && !cm.resolved) && (
          <button
            className="flex-1 py-2 text-[10px] font-mono text-chart-3/70 hover:text-chart-3 hover:bg-chart-3/10 transition-colors flex items-center justify-center gap-1.5 border-l border-border/50"
            onClick={(e) => { e.stopPropagation(); onHack?.(node, allCms.find(cm => cm.type === 'fake_shell' && !cm.resolved)?.id); }}
            title="Scan for fake shell"
          >
            <EyeOff className="w-3 h-3" />
            <span>Scan</span>
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