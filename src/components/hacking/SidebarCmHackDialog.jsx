import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SidebarCmHackDialog({ cm, dc, onSubmit, onClose, rootMode = false }) {
  const [result, setResult] = useState(null);
  const [closing, setClosing] = useState(false);

  if (!cm) return null;

  const effectiveDC = rootMode ? 10 : dc;

  const handleOutcome = (outcome) => {
    if (closing) return;
    setResult(outcome);
    const total = outcome === 'success' ? effectiveDC
      : outcome === 'fail_minor' ? effectiveDC - 1
      : effectiveDC - 5;
    onSubmit(cm.id, total, rootMode);
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-6 w-80 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()} tabIndex={-1}>
        <div className="text-center space-y-1">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Hacking Countermeasure</p>
          <p className="font-mono text-lg font-bold text-foreground">{cm.label}</p>
          <p className="font-mono text-sm text-primary">DC {effectiveDC}</p>
          {rootMode && <p className="font-mono text-[10px] text-chart-3">ROOT MODE ACTIVE</p>}
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center">Roll outcome:</p>
          <div className="grid grid-cols-1 gap-2">
            <button disabled={closing} onClick={() => handleOutcome('success')}
              className={cn('w-full py-3 rounded-lg border-2 font-mono text-sm font-bold transition-all',
                result === 'success' ? 'border-primary bg-primary/20 text-primary' : 'border-primary/40 bg-primary/5 text-primary/80 hover:border-primary hover:bg-primary/15',
                closing && 'opacity-50 cursor-not-allowed')}>
              ✓ Success → Deactivate
            </button>
            <button disabled={closing} onClick={() => handleOutcome('fail_minor')}
              className={cn('w-full py-3 rounded-lg border-2 font-mono text-sm font-bold transition-all',
                result === 'fail_minor' ? 'border-chart-4 bg-chart-4/20 text-chart-4' : 'border-chart-4/40 bg-chart-4/5 text-chart-4/80 hover:border-chart-4 hover:bg-chart-4/15',
                closing && 'opacity-50 cursor-not-allowed')}>
              ~ Fail by less than 5
            </button>
            <button disabled={closing} onClick={() => handleOutcome('fail_major')}
              className={cn('w-full py-3 rounded-lg border-2 font-mono text-sm font-bold transition-all',
                result === 'fail_major' ? 'border-destructive bg-destructive/20 text-destructive' : 'border-destructive/40 bg-destructive/5 text-destructive/80 hover:border-destructive hover:bg-destructive/15',
                closing && 'opacity-50 cursor-not-allowed')}>
              ✗ Fail by 5+ → Trigger
            </button>
          </div>
        </div>

        <Button variant="outline" className="w-full font-mono text-xs" onClick={onClose} disabled={closing}>Back</Button>
      </div>
    </div>
  );
}