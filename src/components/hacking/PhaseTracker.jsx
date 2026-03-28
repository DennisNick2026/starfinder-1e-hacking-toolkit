import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipForward, RotateCcw } from 'lucide-react';

export default function PhaseTracker({ phase, onAdvance, onReset }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Phase</span>
        <span className="font-mono text-lg font-bold text-primary tabular-nums">{phase}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 gap-1 font-mono text-[10px] border-primary/30 text-primary hover:bg-primary/10"
        onClick={onAdvance}
      >
        <SkipForward className="w-3 h-3" /> Next
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 gap-1 font-mono text-[10px] text-muted-foreground hover:text-destructive"
        onClick={onReset}
      >
        <RotateCcw className="w-3 h-3" /> Reset
      </Button>
    </div>
  );
}