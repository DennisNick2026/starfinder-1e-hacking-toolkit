import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPGRADES, UPGRADE_CATEGORIES, TIER_DC, TIER_PRICE } from '@/lib/upgrade-registry';

export default function ComputerSettings({
  computerName, setComputerName,
  tier, setTier,
  baseDC, setBaseDC,
  upgrades, setUpgrades,
}) {
  const basePrice = TIER_PRICE[tier] || TIER_PRICE[1];

  const totalPrice = basePrice
    + (upgrades || []).reduce((sum, key) => {
        const upg = UPGRADES.find(u => u.key === key);
        return sum + (upg ? upg.calculatePrice(tier) : 0);
      }, 0);

  const handleTierChange = (newTier) => {
    const t = Math.min(10, Math.max(1, newTier));
    setTier(t);
    setBaseDC(TIER_DC[t]);
  };

  const toggleUpgrade = (key) => {
    const current = upgrades || [];
    const upg = UPGRADES.find(u => u.key === key);

    if (current.includes(key)) {
      setUpgrades(current.filter(k => k !== key));
    } else {
      // Range upgrades are mutually exclusive — selecting one removes others
      let newList = current;
      if (upg?.category === 'range') {
        newList = current.filter(k => {
          const u = UPGRADES.find(u => u.key === k);
          return u?.category !== 'range';
        });
      }
      setUpgrades([...newList, key]);
    }
  };

  // Group upgrades by category for cleaner display
  const grouped = UPGRADE_CATEGORIES;
  const categoryOrder = Object.keys(grouped);

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">System Name</Label>
        <Input
          className="font-mono text-xs mt-1 bg-muted border-border"
          value={computerName}
          onChange={(e) => setComputerName(e.target.value)}
        />
      </div>

      {/* Tier */}
      <div>
        <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tier</Label>
        <div className="flex items-center gap-2 mt-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded bg-secondary hover:bg-secondary/70 text-foreground"
            onClick={() => handleTierChange(tier - 1)}
          ><Minus className="w-3 h-3" /></button>
          <span className="font-mono text-sm font-bold text-primary w-6 text-center">{tier}</span>
          <button
            className="w-7 h-7 flex items-center justify-center rounded bg-secondary hover:bg-secondary/70 text-foreground"
            onClick={() => handleTierChange(tier + 1)}
          ><Plus className="w-3 h-3" /></button>
          <span className="font-mono text-[10px] text-muted-foreground ml-1">DC {TIER_DC[tier] || baseDC}</span>
          <span className="font-mono text-[10px] text-muted-foreground">· {basePrice.toLocaleString()} cr</span>
        </div>
      </div>

      {/* Upgrades — grouped by category */}
      <div>
        <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Upgrades</Label>
        <div className="flex flex-col gap-3 mt-2">
          {categoryOrder.map(cat => {
            const catUpgrades = UPGRADES.filter(u => u.category === cat);
            if (catUpgrades.length === 0) return null;
            return (
              <div key={cat} className="space-y-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 pl-1">
                  {grouped[cat]}
                </p>
                {catUpgrades.map(upg => {
                  const active = (upgrades || []).includes(upg.key);
                  return (
                    <button
                      key={upg.key}
                      onClick={() => toggleUpgrade(upg.key)}
                      className={cn(
                        'w-full text-left px-2.5 py-1.5 rounded border font-mono text-xs transition-colors',
                        active
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          {active && <Check className="w-3 h-3" />}
                          {upg.label}
                        </span>
                        <span className="opacity-60">{upg.calculatePrice(tier).toLocaleString()} cr</span>
                      </div>
                      <p className={cn(
                        'font-sans text-[10px] leading-snug mt-1',
                        active ? 'text-accent/60' : 'text-muted-foreground/50'
                      )}>
                        {upg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-border pt-2">
        <div className="flex justify-between font-mono text-xs">
          <span className="text-muted-foreground uppercase tracking-wider">Total Cost</span>
          <span className="text-primary font-bold">{totalPrice.toLocaleString()} cr</span>
        </div>
      </div>
    </div>
  );
}