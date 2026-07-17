import React from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/components/hacking/BottomToolbar';

const TYPE_COLOR = {
  success: 'text-primary',
  danger: 'text-destructive',
  system: 'text-primary/50',
  info: 'text-primary/70',
};

export default function BottomLog({ log, selectedNode, activeCategory, getNodeDC, effectiveBaseDC }) {
  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="relative flex border-t border-primary/30 bg-background shrink-0" style={{ height: 120 }}>
      {/* Activity log OR node palette - left half */}
      <div className="flex-1 border-r border-primary/20 overflow-hidden px-3 py-2">

        {activeCat ? (
          <div className="flex items-center gap-3 h-full overflow-x-auto">
            {activeCat.items.map(item => {
              const Icon = item.icon;
              const isCm = activeCat.key === 'countermeasures';
              return (
                <div
                  key={item.key}
                  draggable
                  onDragStart={e => {
                    if (item.isModuleUpgrade) {
                      e.dataTransfer.setData('moduleUpgrade', item.key);
                    } else if (isCm) {
                      e.dataTransfer.setData('cmType', item.key);
                    } else {
                      e.dataTransfer.setData('nodeType', item.key);
                    }
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-4 py-2 rounded border',
                    'transition-colors text-primary select-none shrink-0 cursor-grab active:cursor-grabbing',
                    'border-primary/40 bg-primary/5 hover:bg-primary/20'
                  )}
                  title={`Drag to place: ${item.label}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-mono text-[9px] tracking-widest uppercase">{item.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
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
        )}
      </div>

      {/* Selected node info - right half */}
      <div className="flex-1 px-3 py-2 overflow-hidden">
        {selectedNode ? (
          <div className="space-y-1">
            <p className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">&gt; NODE SELECTED</p>
            <p className="font-mono text-sm font-bold text-primary">{selectedNode.name}</p>
            <p className="font-mono text-[11px] text-primary/60">DC {getNodeDC ? getNodeDC(selectedNode, effectiveBaseDC) : selectedNode.dc} · {selectedNode.successes_current || 0}/{selectedNode.successes_required || 0} successes</p>
          </div>
        ) : (
          <p className="font-mono text-[10px] text-primary/40">&gt; NO NODE SELECTED</p>
        )}
      </div>
    </div>
  );
}