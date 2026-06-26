import React, { useState } from 'react';
import {
  Terminal, FolderLock, Database, SquareTerminal, Sparkles,
  FolderOpen, Box, Hand, Cpu, Monitor,
  DoorOpen, Camera, Crosshair, Wind, Bomb, Zap, Gauge, Bot,
  Shield, Rocket, Sword, Heart, Radio, Power, Lightbulb,
  ShieldAlert, Siren, Lock, Trash2, ShieldCheck,
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
      { key: 'ctrl_lights',       label: 'Lights',       icon: Lightbulb },
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