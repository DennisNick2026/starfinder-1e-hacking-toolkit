import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dice5 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RollPanel({ nodes, hackers, onRoll }) {
  const [selectedHacker, setSelectedHacker] = useState(hackers[0]?.id || '');
  const [selectedNode, setSelectedNode] = useState('');
  const [selectedSubskill, setSelectedSubskill] = useState('hack');
  const [lastResult, setLastResult] = useState(null);

  const handleRoll = () => {
    if (!selectedHacker || !selectedNode) return;
    const result = onRoll(selectedNode, selectedHacker, selectedSubskill);
    setLastResult(result);
  };

  const unresolvedNodes = nodes.filter(n => !n.resolved);

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Roll Check
      </h3>

      <div className="space-y-2">
        <Select value={selectedHacker} onValueChange={setSelectedHacker}>
          <SelectTrigger className="font-mono text-xs bg-muted border-border h-8">
            <SelectValue placeholder="Select hacker" />
          </SelectTrigger>
          <SelectContent>
            {hackers.map(h => (
              <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedNode} onValueChange={setSelectedNode}>
          <SelectTrigger className="font-mono text-xs bg-muted border-border h-8">
            <SelectValue placeholder="Select target node" />
          </SelectTrigger>
          <SelectContent>
            {unresolvedNodes.map(n => (
              <SelectItem key={n.id} value={n.id}>{n.name} (DC {n.dc})</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSubskill} onValueChange={setSelectedSubskill}>
          <SelectTrigger className="font-mono text-xs bg-muted border-border h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hack">Hack</SelectItem>
            <SelectItem value="deceive">Deceive</SelectItem>
            <SelectItem value="process">Process</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="w-full gap-1.5 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/80"
          onClick={handleRoll}
          disabled={!selectedHacker || !selectedNode}
        >
          <Dice5 className="w-4 h-4" /> Roll Check
        </Button>
      </div>

      {lastResult && (
        <div className={cn(
          'p-3 rounded-lg border font-mono text-xs space-y-1',
          lastResult.resultType.includes('success')
            ? 'bg-accent/10 border-accent/30 text-accent'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        )}>
          <div className="flex justify-between">
            <span>d20: {lastResult.roll}</span>
            <span>Mod: +{lastResult.totalMod}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total: {lastResult.total}</span>
            <span>vs DC {lastResult.dc}</span>
          </div>
          <div className="text-center font-bold uppercase pt-1 border-t border-current/20">
            {lastResult.resultType.replace('_', ' ')}
          </div>
        </div>
      )}
    </div>
  );
}