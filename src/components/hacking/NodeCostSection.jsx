import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NODE_COSTS, getNodeCost } from '@/lib/upgrade-registry';

export default function NodeCostSection({ node, basePrice, onUpdate }) {
  const costDef = NODE_COSTS[node.type];
  if (!costDef) return null;

  const calculatedCost = getNodeCost(node, basePrice);
  const hasOverride = node.costOverride != null;
  const effectiveCost = hasOverride ? node.costOverride : calculatedCost;
  const isVaries = costDef.type === 'varies';
  const isPercentOf = costDef.type === 'percent_of';

  // Hide for free nodes (fixed 0) unless overridden
  if (costDef.type === 'fixed' && costDef.value === 0 && !hasOverride) return null;

  return (
    <div className="border-t border-border/50 pt-5">
      <div className="flex items-center justify-between mb-3">
        <Label className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/80">Cost</Label>
        <span className="font-mono text-sm font-bold text-primary">
          {effectiveCost.toLocaleString()} cr
          {hasOverride && <span className="text-chart-4 text-[10px] ml-1">override</span>}
        </span>
      </div>

      <div className="space-y-2">
        {isPercentOf && (
          <div>
            <Label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block mb-1">
              {costDef.field === 'controlledDevicePrice' ? 'Controlled Device Price' : 'Spell Gem Price'} (cr)
            </Label>
            <Input
              type="number"
              className="font-mono text-sm bg-muted border-border/60 h-9"
              placeholder="0"
              value={node[costDef.field] ?? ''}
              onChange={e => {
                const val = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                onUpdate(node.id, { [costDef.field]: val });
              }}
            />
            <p className="font-mono text-[10px] text-muted-foreground mt-1">{costDef.label}</p>
          </div>
        )}

        <div>
          <Label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block mb-1">
            {isVaries ? 'Price (varies — set manually)' : 'Override Price (optional)'}
          </Label>
          <div className="flex gap-1">
            <Input
              type="number"
              className="font-mono text-sm bg-muted border-border/60 h-9"
              placeholder={isVaries ? 'Set price' : String(calculatedCost)}
              value={node.costOverride ?? ''}
              onChange={e => {
                const val = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                onUpdate(node.id, { costOverride: val });
              }}
            />
            {hasOverride && (
              <button
                className="px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-destructive border border-border/60 rounded hover:border-destructive/50 transition-colors"
                title="Clear override"
                onClick={() => onUpdate(node.id, { costOverride: null })}
              >✕</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}