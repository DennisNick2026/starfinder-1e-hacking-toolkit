import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  UPGRADES, UPGRADE_CATEGORIES, MODULE_UPGRADES, TIER_DC, TIER_PRICE,
  getUpgradeEffects, getComputerBulk, getComputerHardness, getComputerSave,
} from '@/lib/upgrade-registry';

export default function ComputerSettings({
  computerName, setComputerName,
  tier, setTier,
  baseDC, setBaseDC,
  upgrades, setUpgrades,
  nodes = [],
}) {
  const basePrice = TIER_PRICE[tier] || TIER_PRICE[1];
  const effects = getUpgradeEffects(upgrades);
  const hasHardened = (upgrades || []).includes('hardened');
  const miniCount = effects.miniaturizationCount;

  // Collect active module upgrades from nodes (e.g. Range I/II/III on control modules)
  const activeModuleUpgrades = (nodes || [])
    .filter(n => n.rangeUpgrade)
    .map(n => MODULE_UPGRADES.find(u => u.key === n.rangeUpgrade))
    .filter(Boolean);

  const computerUpgradeCost = (upgrades || []).reduce((sum, key) => {
    const upg = UPGRADES.find(u => u.key === key);
    return sum + (upg ? upg.calculatePrice(tier) : 0);
  }, 0);

  const moduleUpgradeCost = activeModuleUpgrades.reduce((sum, upg) => sum + upg.calculatePrice(), 0);

  const totalPrice = basePrice + computerUpgradeCost + moduleUpgradeCost;

  const bulkInfo = getComputerBulk(tier, miniCount);
  const hardness = getComputerHardness(tier, hasHardened);
  const saveBonus = getComputerSave(tier, hasHardened);

  const handleTierChange = (newTier) => {
    const t = Math.min(10, Math.max(1, newTier));
    setTier(t);
    setBaseDC(TIER_DC[t]);
  };

  const toggleUpgrade = (key) => {
    const current = upgrades || [];
    const upg = UPGRADES.find(u => u.key === key);

    if (upg.unique !== false) {
      // Unique upgrade — toggle on/off
      if (current.includes(key)) {
        setUpgrades(current.filter(k => k !== key));
      } else {
        setUpgrades([...current, key]);
      }
    } else {
      // Non-unique — add one instance (miniaturization capped at tier+1: can't go below tier -1)
      const count = current.filter(k => k === key).length;
      if (count >= tier + 1) return;
      setUpgrades([...current, key]);
    }
  };

  const removeUpgradeInstance = (key) => {
    const current = upgrades || [];
    const idx = current.indexOf(key);
    if (idx === -1) return;
    setUpgrades([...current.slice(0, idx), ...current.slice(idx + 1)]);
  };

  const categoryOrder = Object.keys(UPGRADE_CATEGORIES);

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

      {/* Computer Stats */}
      <div className="border border-border/50 rounded-lg p-3 space-y-1.5 bg-muted/20">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">Computer Stats</p>
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-muted-foreground">Hardness</span>
          <span className="text-foreground">
            {hardness}
            {hasHardened && <span className="text-chart-3 ml-1">(+10)</span>}
          </span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-muted-foreground">Save Bonus</span>
          <span className="text-foreground">
            +{saveBonus}
            {hasHardened && <span className="text-chart-3 ml-1">(+8 vs energy)</span>}
          </span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-muted-foreground">Bulk</span>
          <span className="text-foreground">
            {typeof bulkInfo.value === 'number' ? `${bulkInfo.value} bulk` : bulkInfo.value}
            {miniCount > 0 && <span className="text-muted-foreground ml-1">(eff. T{bulkInfo.effectiveTier})</span>}
          </span>
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
                  {UPGRADE_CATEGORIES[cat]}
                </p>
                {catUpgrades.map(upg => {
                  const isUnique = upg.unique !== false;
                  const active = isUnique
                    ? (upgrades || []).includes(upg.key)
                    : (upgrades || []).filter(k => k === upg.key).length > 0;
                  const count = isUnique ? 0 : (upgrades || []).filter(k => k === upg.key).length;

                  return (
                    <div
                      key={upg.key}
                      className={cn(
                        'px-2.5 py-1.5 rounded border font-mono text-xs transition-colors',
                        active
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
                      )}
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => toggleUpgrade(upg.key)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            {isUnique && active && <Check className="w-3 h-3" />}
                            {upg.label}
                            {!isUnique && count > 0 && (
                              <span className="text-[9px] bg-accent/20 px-1 rounded">×{count}</span>
                            )}
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
                      {/* Remove button for multi-buy upgrades */}
                      {!isUnique && count > 0 && (
                        <div className="flex justify-end mt-1">
                          <button
                            className="text-[9px] text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => removeUpgradeInstance(upg.key)}
                          >
                            − Remove one
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-border pt-2 space-y-1">
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-muted-foreground">Base (Tier {tier})</span>
          <span className="text-muted-foreground">{basePrice.toLocaleString()} cr</span>
        </div>
        {computerUpgradeCost > 0 && (
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-muted-foreground">Computer Upgrades</span>
            <span className="text-muted-foreground">{computerUpgradeCost.toLocaleString()} cr</span>
          </div>
        )}
        {moduleUpgradeCost > 0 && (
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-muted-foreground">Module Upgrades ({activeModuleUpgrades.length})</span>
            <span className="text-muted-foreground">{moduleUpgradeCost.toLocaleString()} cr</span>
          </div>
        )}
        <div className="flex justify-between font-mono text-xs pt-1">
          <span className="text-muted-foreground uppercase tracking-wider">Total Cost</span>
          <span className="text-primary font-bold">{totalPrice.toLocaleString()} cr</span>
        </div>
      </div>
    </div>
  );
}