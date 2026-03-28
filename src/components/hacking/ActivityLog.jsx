import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function ActivityLog({ log }) {
  return (
    <div className="space-y-2">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Activity Log
      </h3>
      <ScrollArea className="h-40 rounded-lg bg-muted/30 border border-border">
        <div className="p-2 space-y-1">
          {log.length === 0 && (
            <p className="font-mono text-[10px] text-muted-foreground italic p-2">
              No activity yet. Add nodes and start hacking!
            </p>
          )}
          {log.map((entry, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="font-mono text-[10px] text-muted-foreground shrink-0 tabular-nums">
                P{entry.phase}
              </span>
              <span className={cn(
                'font-mono text-[11px] leading-tight',
                entry.type === 'success' && 'text-accent',
                entry.type === 'danger' && 'text-destructive',
                entry.type === 'system' && 'text-primary',
                entry.type === 'info' && 'text-foreground/70'
              )}>
                {entry.text}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}