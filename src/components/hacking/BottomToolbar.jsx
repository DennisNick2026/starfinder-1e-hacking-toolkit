import React, { useState } from 'react';
import {
  Terminal, FolderLock, Database, SquareTerminal, Sparkles,
  FolderOpen, Box, Hand, Cpu, Monitor,
  Zap, ShieldAlert, Siren, Lock, Trash2, ShieldCheck, Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    key: 'arch',
    label: 'STRUCTURE',
    icon: FolderOpen,
    items: [
      { key: 'directory', label: 'Directory', icon: FolderLock },
      { key: 'access_point', label: 'Access Point', icon: Terminal },
      { key: 'user_interface', label: 'User Interface', icon: Monitor },
      { key: 'root_access_node', label: 'Root Access', icon: ShieldCheck },
      { key: 'computer', label: 'Computer', icon: Cpu },
    ],
  },
  {
    key: 'module',
    label: 'MODULE',
    icon: Box,
    items: [
      { key: 'secure_data_average', label: 'Data (Avg)', icon: Database },
      { key: 'secure_data_large', label: 'Data (Large)', icon: Database },
      { key: 'secure_data_specific', label: 'Data (Specific)', icon: Database },
      { key: 'spell_chip', label: 'Spell Chip', icon: Sparkles },
      { key: 'security_module', label: 'Security Module', icon: ShieldAlert },
    ],
  },
  {
    key: 'control',
    label: 'CONTROL',
    icon: Hand,
    items: [
      { key: 'control_complex', label: 'Control', icon: SquareTerminal },
      { key: 'control_general', label: 'General', icon: SquareTerminal },
    ],
  },
  {
    key: 'countermeasures',
    label: 'COUNTERMEASURES',
    icon: ShieldAlert,
    items: [
      { key: 'alarm', label: 'Alarm', icon: Siren },
      { key: 'feedback', label: 'Feedback', icon: Zap },
      { key: 'firewall', label: 'Firewall', icon: ShieldAlert },
      { key: 'lockout', label: 'Lockout', icon: Lock },
      { key: 'shock_grid', label: 'Shock Grid', icon: Zap },
      { key: 'wipe', label: 'Wipe', icon: Trash2 },
    ],
  },
  {
    key: 'upgrades',
    label: 'UPGRADES',
    icon: Radio,
    items: [
      { key: 'range', label: 'Range', icon: Radio, isModuleUpgrade: true },
    ],
  },
];

export { CATEGORIES };

export default function BottomToolbar({ onDragStart, mode, rootMode = false, activeCategory, setActiveCategory }) {
  if (mode === 'play' && !rootMode) return null;

  return (
    <div className="shrink-0 border-t border-primary/30 bg-background flex" style={{ height: 160 }}>
      {CATEGORIES.map(cat => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(isActive ? null : cat.key)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 h-full font-mono text-[11px] tracking-widest border-r border-primary/20 transition-colors flex-1',
              isActive
                ? 'text-primary bg-primary/15 border-b-2 border-b-primary'
                : 'text-primary/50 hover:text-primary hover:bg-primary/5'
            )}
          >
            <Icon className={cn('w-12 h-12', isActive && 'glow-cyan')} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}