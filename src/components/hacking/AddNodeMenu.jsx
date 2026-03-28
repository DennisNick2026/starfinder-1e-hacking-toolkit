import React from 'react';
import {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const ICONS = {
  Terminal, GitBranch, Database, SquareTerminal,
  ShieldAlert, Siren, UserX, Bug, Unlock,
};

const CATEGORIES = [
  {
    label: 'Structure',
    items: [
      { key: 'access_point', label: 'Access Point', icon: 'Terminal', color: 'text-primary' },
      { key: 'node', label: 'Node', icon: 'GitBranch', color: 'text-primary' },
    ],
  },
  {
    label: 'Modules',
    items: [
      { key: 'data_module', label: 'Data Module', icon: 'Database', color: 'text-accent' },
      { key: 'command_module', label: 'Command Module', icon: 'SquareTerminal', color: 'text-accent' },
    ],
  },
  {
    label: 'Countermeasures',
    items: [
      { key: 'firewall', label: 'Firewall', icon: 'ShieldAlert', color: 'text-destructive' },
      { key: 'alarm', label: 'Alarm', icon: 'Siren', color: 'text-destructive' },
      { key: 'counterhacker', label: 'Counterhacker', icon: 'UserX', color: 'text-destructive' },
      { key: 'virus', label: 'Virus', icon: 'Bug', color: 'text-chart-3' },
    ],
  },
  {
    label: 'Other',
    items: [
      { key: 'vulnerability', label: 'Vulnerability', icon: 'Unlock', color: 'text-chart-4' },
    ],
  },
];

export default function AddNodeMenu({ onAdd }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/80">
          <Plus className="w-4 h-4" />
          Add Node
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 bg-popover border-border">
        {CATEGORIES.map((cat, ci) => (
          <React.Fragment key={cat.label}>
            {ci > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {cat.label}
            </DropdownMenuLabel>
            {cat.items.map(item => {
              const Icon = ICONS[item.icon];
              return (
                <DropdownMenuItem
                  key={item.key}
                  className="gap-2 font-mono text-xs cursor-pointer"
                  onClick={() => onAdd(item.key)}
                >
                  <Icon className={cn('w-4 h-4', item.color)} />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}