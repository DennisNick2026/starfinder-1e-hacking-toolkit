import React, { useState } from 'react';
import {
  Terminal, GitBranch, Database, SquareTerminal, Unlock, Sparkles,
  FolderOpen, Box, Hand, Triangle, Cpu, ChevronUp, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    key: 'arch',
    label: 'ARCH',
    icon: FolderOpen,
    items: [
      { key: 'node', label: 'Node', icon: GitBranch },
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
    ],
  },
  {
    key: 'control',
    label: 'CONTROL',
    icon: Hand,
    items: [
      { key: 'control_complex', label: 'Control (Complex)', icon: SquareTerminal },
    ],
  },
  {
    key: 'trap',
    label: 'TRAP',
    icon: Triangle,
    items: [
      { key: 'vulnerability', label: 'Vulnerability', icon: Unlock },
    ],
  },
  {
    key: 'special',
    label: 'SPECIAL',
    icon: Cpu,
    items: [
      { key: 'access_point', label: 'Access Point', icon: Terminal },
    ],
  },
];

export default function BottomToolbar({ onDragStart, mode }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [open, setOpen] = useState(true);

  if (mode === 'play') return null;

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="shrink-0 border-t border-primary/30 bg-background">
      {/* Category tabs row */}
      <div className="flex items-center border-b border-primary/20">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2 font-mono text-xs tracking-widest border-r border-primary/20 transition-colors',
                activeCategory === cat.key
                  ? 'text-primary bg-primary/10'
                  : 'text-primary/60 hover:text-primary hover:bg-primary/5'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => setOpen(o => !o)}
          className="px-3 py-2 text-primary/40 hover:text-primary transition-colors"
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Items row */}
      {open && (
        <div className="flex items-center gap-3 px-4 py-3 min-h-[72px]">
          {activeCat ? (
            activeCat.items.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('nodeType', item.key);
                    onDragStart && onDragStart(item.key);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-4 py-2.5 rounded border border-primary/40',
                    'bg-primary/5 hover:bg-primary/15 cursor-grab active:cursor-grabbing',
                    'transition-colors text-primary select-none'
                  )}
                  title={`Drag to place: ${item.label}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-mono text-[9px] tracking-widest uppercase">{item.label}</span>
                </div>
              );
            })
          ) : (
            <p className="font-mono text-[10px] text-primary/30 tracking-wider">
              &gt; SELECT A CATEGORY TO ADD NODES
            </p>
          )}
        </div>
      )}
    </div>
  );
}