import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_DC = {
  1: 17, 2: 21, 3: 25, 4: 29, 5: 33,
  6: 37, 7: 41, 8: 45, 9: 49, 10: 53,
};

const TIER_PRICE = {
  1: 50, 2: 250, 3: 1250, 4: 5000, 5: 10000,
  6: 20000, 7: 40000, 8: 80000, 9: 160000, 10: 320000,
};

const SECURITY_MODULES = [
  { label: 'Security I',   dcBonus: 1, priceMultiplier: 0.25 },
  { label: 'Security II',  dcBonus: 2, priceMultiplier: 0.50 },
  { label: 'Security III', dcBonus: 3, priceMultiplier: 0.75 },
  { label: 'Security IV',  dcBonus: 4, priceMultiplier: 1.00 },
];

const UPGRADES = [
  { key: 'artificial_personality', label: 'Artificial Personality', priceMultiplier: 0.10 },
  { key: 'hardened',               label: 'Hardened',               priceMultiplier: 0.50 },
  { key: 'miniaturization',        label: 'Miniaturization',        priceMultiplier: 0.10 },
  { key: 'range_1',                label: 'Range I (100 ft)',       fixedPrice: 5 },
  { key: 'range_2',                label: 'Range II (1 mile)',      fixedPrice: 50 },
  { key: 'range_3',                label: 'Range III (Planetwide)', fixedPrice: 100 },
  { key: 'self_charging',          label: 'Self-Charging',          priceMultiplier: 0.10 },
];

export default function ComputerSettings({
  computerName, setComputerName,
  tier, setTier,
  baseDC, setBaseDC,
  securityModule, setSecurityModule,
  upgrades, setUpgrades,
}) {
  const [expanded, setExpanded] = useState(false);

  const basePrice = TIER_PRICE[tier] || TIER_PRICE[1];

  const upgradePrice = (upg) => {
    if (upg.fixedPrice !== undefined) return upg.fixedPrice;
    return Math.round(basePrice * upg.priceMultiplier);
  };

  const securityPrice = securityModule !== null
    ? Math.round(basePrice * SECURITY_MODULES[securityModule].priceMultiplier)
    : 0;

  const totalPrice = basePrice
    + securityPrice
    + (upgrades || []).reduce((sum, key) => {
        const upg = UPGRADES.find(u => u.key === key);
        return sum + (upg ? upgradePrice(upg) : 0);
      }, 0);

  const handleTierChange = (newTier) => {
    const t = Math.min(10, Math.max(1, newTier));
    setTier(t);
    setBaseDC(TIER_DC[t]);
  };

  const toggleUpgrade = (key) => {
    const current = upgrades || [];
    if (current.includes(key)) {
      setUpgrades(current.filter(k => k !== key));
    } else {
      setUpgrades([...current, key]);
    }
  };

  return (
    <div className="space-y-2">
      <button
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider">Computer Settings</span>
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="space-y-4 pl-2">
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

          {/* Security Module */}
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Security Module</Label>
            <div className="flex flex-col gap-1 mt-1">
              <button
                onClick={() => setSecurityModule(null)}
                className={cn(
                  'text-left px-2 py-1 rounded border font-mono text-xs transition-colors',
                  securityModule === null
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                None
              </button>
              {SECURITY_MODULES.map((sm, i) => (
                <button
                  key={i}
                  onClick={() => setSecurityModule(i)}
                  className={cn(
                    'text-left px-2 py-1 rounded border font-mono text-xs transition-colors flex justify-between',
                    securityModule === i
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'border-border text-muted-foreground hover:border-destructive/40'
                  )}
                >
                  <span>{sm.label} <span className="opacity-60">+{sm.dcBonus} DC</span></span>
                  <span className="opacity-60">{Math.round(basePrice * sm.priceMultiplier).toLocaleString()} cr</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upgrades */}
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Upgrades</Label>
            <div className="flex flex-col gap-1 mt-1">
              {UPGRADES.map(upg => {
                const active = (upgrades || []).includes(upg.key);
                return (
                  <button
                    key={upg.key}
                    onClick={() => toggleUpgrade(upg.key)}
                    className={cn(
                      'text-left px-2 py-1 rounded border font-mono text-xs transition-colors flex justify-between',
                      active
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:border-accent/40'
                    )}
                  >
                    <span>{upg.label}</span>
                    <span className="opacity-60">{upgradePrice(upg).toLocaleString()} cr</span>
                  </button>
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
      )}
    </div>
  );
}