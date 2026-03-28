import React from 'react';
import { cn } from '@/lib/utils';

const TYPE_COLOR = {
  success: 'text-primary',
  danger: 'text-destructive',
  system: 'text-primary/50',
  info: 'text-primary/70',
};

export default function BottomLog({ log, selectedNode }) {
  return (
    <div className="flex border-t border-primary/30 bg-background shrink-0" style={{ height: 120 }}>
      {/* Activity log - left half */}
      <div className="flex-1 border-r border-primary/20 overflow-hidden px-3 py-2">
        <div className="space-y-0.5 overflow-y-auto h-full">
          {log.length === 0 ? (
            <p className="font-mono text-[10px] text-primary/40">&gt; SYSTEM READY</p>
          ) : (
            log.slice(0, 8).map((entry, i) => (
              <p key={i} className={cn('font-mono text-[11px]', TYPE_COLOR[entry.type] || 'text-primary/60')}>
                &gt; {entry.text}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Selected node info - right half */}
      <div className="flex-1 px-3 py-2 overflow-hidden">
        {selectedNode ? (
          <div className="space-y-1">
            <p className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">&gt; NODE SELECTED</p>
            <p className="font-mono text-sm font-bold text-primary">{selectedNode.name}</p>
            <p className="font-mono text-[11px] text-primary/60">DC {selectedNode.dc} · {selectedNode.successes_current || 0}/{selectedNode.successes_required || 0} successes</p>
          </div>
        ) : (
          <p className="font-mono text-[10px] text-primary/40">&gt; NO NODE SELECTED</p>
        )}
      </div>
    </div>
  );
}