import React, { useState } from 'react';
import {
  Terminal, FolderLock, Database, SquareTerminal, Unlock, Sparkles,
  FolderOpen, Box, Hand, Triangle, Cpu,
  DoorOpen, Camera, Crosshair, Wind, Bomb, Zap, Gauge, Bot,
  Shield, Rocket, Sword, Heart, Radio, Power,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    key: 'arch',
    label: 'ARCH',
    icon: FolderOpen,
    items: [
      { key: 'directory', label: 'Directory', icon: FolderLock },
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
      { key: 'control_complex', label: 'Control', icon: SquareTerminal },
      { key: 'ctrl_door',         label: 'Door',         icon: DoorOpen },
      { key: 'ctrl_camera',       label: 'Camera',       icon: Camera },
      { key: 'ctrl_turret',       label: 'Turret',       icon: Crosshair },
      { key: 'ctrl_vent',         label: 'Vent',         icon: Wind },
      { key: 'ctrl_detonate',     label: 'Detonate',     icon: Bomb },
      { key: 'ctrl_laser',        label: 'Laser',        icon: Zap },
      { key: 'ctrl_gravity',      label: 'Gravity',      icon: Gauge },
      { key: 'ctrl_robot',        label: 'Robot',        icon: Bot },
      { key: 'ctrl_shield',       label: 'Shield',       icon: Shield },
      { key: 'ctrl_engine',       label: 'Engine',       icon: Rocket },
      { key: 'ctrl_weapon',       label: 'Weapon',       icon: Sword },
      { key: 'ctrl_life_support', label: 'Life Support', icon: Heart },
      { key: 'ctrl_sensor',       label: 'Sensor',       icon: Radio },
      { key: 'ctrl_power_core',   label: 'Power Core',   icon: Power },
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

export default function BottomToolbar({ onDragStart, mode, rootMode = false }) {
  const [activeCategory, setActiveCategory] = useState(null);

  if (mode === 'play' && !rootMode) return null;

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="shrink-0 border-t border-primary/30 bg-background flex" style={{ height: 100 }}>
      {/* Category buttons column — compact when a category is active */}
      <div className="flex border-r border-primary/20 transition-all duration-200 w-1/2">
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
              <Icon className="w-8 h-8" />
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