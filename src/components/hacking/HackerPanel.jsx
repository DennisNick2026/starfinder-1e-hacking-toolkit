import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

function HackerCard({ hacker, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const cpPercent = Math.round((hacker.cp_current / hacker.cp_max) * 100);

  let cpColor = 'bg-accent';
  if (cpPercent <= 25) cpColor = 'bg-destructive';
  else if (cpPercent <= 50) cpColor = 'bg-chart-4';
  else if (cpPercent <= 75) cpColor = 'bg-primary';

  return (
    <div className="bg-muted/50 rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <Input
          className="font-mono text-xs bg-transparent border-none h-6 p-0 font-semibold"
          value={hacker.name}
          onChange={(e) => onUpdate(hacker.id, { name: e.target.value })}
        />
        <span className={cn(
          'font-mono text-[10px] uppercase px-1.5 py-0.5 rounded',
          hacker.role === 'lead' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
        )}>
          {hacker.role}
        </span>
        <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => onRemove(hacker.id)}>
          <Trash2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>

      {/* CP Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-destructive" />
            <span className="font-mono text-[10px] text-muted-foreground">CP</span>
          </div>
          <span className="font-mono text-[10px] font-bold">{hacker.cp_current}/{hacker.cp_max}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', cpColor)}
            style={{ width: `${cpPercent}%` }}
          />
        </div>
      </div>

      {expanded && (
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] uppercase text-muted-foreground">Role</Label>
              <Select value={hacker.role} onValueChange={(v) => onUpdate(hacker.id, { role: v })}>
                <SelectTrigger className="font-mono text-xs h-7 mt-0.5 bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase text-muted-foreground">Computers Mod</Label>
              <Input
                type="number"
                className="font-mono text-xs h-7 mt-0.5 bg-muted border-border"
                value={hacker.computers_mod}
                onChange={(e) => onUpdate(hacker.id, { computers_mod: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {['deceive', 'hack', 'process'].map(sub => (
              <div key={sub}>
                <Label className="font-mono text-[10px] uppercase text-muted-foreground">{sub}</Label>
                <Input
                  type="number"
                  className="font-mono text-xs h-7 mt-0.5 bg-muted border-border"
                  value={hacker[`${sub}_mod`]}
                  onChange={(e) => onUpdate(hacker.id, { [`${sub}_mod`]: parseInt(e.target.value) || 0 })}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] uppercase text-muted-foreground">CP Max</Label>
              <Input
                type="number"
                className="font-mono text-xs h-7 mt-0.5 bg-muted border-border"
                value={hacker.cp_max}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  onUpdate(hacker.id, { cp_max: v, cp_current: Math.min(hacker.cp_current, v) });
                }}
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase text-muted-foreground">CP Current</Label>
              <Input
                type="number"
                className="font-mono text-xs h-7 mt-0.5 bg-muted border-border"
                value={hacker.cp_current}
                onChange={(e) => onUpdate(hacker.id, { cp_current: Math.min(parseInt(e.target.value) || 0, hacker.cp_max) })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HackerPanel({ hackers, onAdd, onUpdate, onRemove }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Hackers
        </h3>
        <Button size="sm" variant="ghost" className="h-6 px-2 gap-1 font-mono text-[10px]" onClick={onAdd}>
          <UserPlus className="w-3 h-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {hackers.map(h => (
          <HackerCard key={h.id} hacker={h} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}