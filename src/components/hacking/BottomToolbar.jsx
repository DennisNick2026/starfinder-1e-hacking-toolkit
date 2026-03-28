import React, { useState } from 'react';
import {
  Terminal, GitBranch, Database, SquareTerminal, Unlock, Sparkles,
  FolderOpen, Box, Hand, Triangle, Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    key: 'arch',
    label: 'ARCH',
    icon: FolderOpen,
    items: [
      { key: 'node', label: 'Node', icon: GitBranch },
      { key: 'access_point', label: 'Access Point', icon: Terminal },
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
];

export default function BottomToolbar({ onDragStart, mode }) {
  const [activeCategory, setActiveCategory] = useState(null);

  if (mode === 'play') return null;

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="shrink-0 border-t border-primary/30 bg-background flex" style={{ height: 100 }}>
      {/* Category buttons column */}
      <div className="flex border-r border-primary/20">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(isActive ? null : cat.key)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 px-5 h-full font-mono text-[10px] tracking-widest border-r border-primary/20 transition-colors min-w-[72px]',
                isActive
                  ? 'text-primary bg-primary/15 border-b-2 border-b-primary'
                  : 'text-primary/50 hover:text-primary hover:bg-primary/5'
              )}
            >
              <Icon className="w-5 h-5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Items area */}
      <div className="flex-1 flex items-center gap-4 px-5 overflow-x-auto">
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
                  'flex flex-col items-center gap-2 px-5 py-3 rounded border border-primary/40',
                  'bg-primary/5 hover:bg-primary/20 cursor-grab active:cursor-grabbing',
                  'transition-colors text-primary select-none shrink-0'
                )}
                title={`Drag to place: ${item.label}`}
              >
                <Icon className="w-7 h-7" />
                <span className="font-mono text-[10px] tracking-widest uppercase">{item.label}</span>
              </div>
            );
          })
        ) : (
          <p className="font-mono text-[11px] text-primary/30 tracking-wider">
            &gt; SELECT A CATEGORY ABOVE TO ADD NODES
          </p>
        )}
      </div>
    </div>
  );
}