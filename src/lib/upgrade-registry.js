// Centralized upgrade definitions — costs, descriptions, and gameplay effects.
// Computer upgrades apply to the computer itself; module upgrades attach to individual nodes.

export const TIER_DC = {
  1: 17, 2: 21, 3: 25, 4: 29, 5: 33,
  6: 37, 7: 41, 8: 45, 9: 49, 10: 53,
};

export const TIER_PRICE = {
  1: 50, 2: 250, 3: 1250, 4: 5000, 5: 10000,
  6: 20000, 7: 40000, 8: 80000, 9: 160000, 10: 320000,
};

export const UPGRADE_CATEGORIES = {
  defensive: 'Defensive',
  hardware: 'Hardware',
  software: 'Software',
};

// Upgrades that apply to the computer as a whole
export const UPGRADES = [
  {
    key: 'hardened',
    label: 'Hardened',
    description: '+10 hardness and +8 to saves vs energy attacks and effects targeting computers or electronic systems.',
    category: 'defensive',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.50),
    unique: true,
    effect: { hardnessBonus: 10, saveBonus: 8 },
  },
  {
    key: 'miniaturization',
    label: 'Miniaturization',
    description: 'Treat computer as 1 tier lower for bulk (min tier -1). Can be purchased multiple times — 10% of base price each.',
    category: 'hardware',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.10),
    unique: false, // can be bought multiple times
  },
  {
    key: 'self_charging',
    label: 'Self-Charging',
    description: 'The computer recharges its own battery automatically — never needs an external power source.',
    category: 'hardware',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.10),
    unique: true,
  },
  {
    key: 'artificial_personality',
    label: 'Artificial Personality',
    description: 'The computer can talk and be talked to hands-free. Primarily a roleplay feature.',
    category: 'software',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.10),
    unique: true,
  },
];

// Upgrades that attach to a specific control module node
export const MODULE_UPGRADES = [
  {
    key: 'range_1',
    label: 'Range I',
    description: 'Control module operates within 100 feet of the computer.',
    calculatePrice: () => 5,
    effect: { range: 100, rangeLabel: '100 ft' },
  },
  {
    key: 'range_2',
    label: 'Range II',
    description: 'Control module operates within 1 mile of the computer.',
    calculatePrice: () => 50,
    effect: { range: 1609, rangeLabel: '1 mile' },
  },
  {
    key: 'range_3',
    label: 'Range III',
    description: 'Control module operates planetwide.',
    calculatePrice: () => 100,
    effect: { range: Infinity, rangeLabel: 'Planetwide' },
  },
];

const UPGRADE_MAP = Object.fromEntries(UPGRADES.map(u => [u.key, u]));
const MODULE_UPGRADE_MAP = Object.fromEntries(MODULE_UPGRADES.map(u => [u.key, u]));

// Derive cumulative effects from a list of active upgrade keys.
export function getUpgradeEffects(activeUpgrades) {
  const effects = { hardnessBonus: 0, saveBonus: 0, miniaturizationCount: 0 };
  for (const key of activeUpgrades || []) {
    const upg = UPGRADE_MAP[key];
    if (!upg) continue;
    if (upg.effect?.hardnessBonus) effects.hardnessBonus += upg.effect.hardnessBonus;
    if (upg.effect?.saveBonus) effects.saveBonus += upg.effect.saveBonus;
    if (key === 'miniaturization') effects.miniaturizationCount++;
  }
  return effects;
}

// Computer bulk calculation — base is tier squared; miniaturization lowers effective tier
export function getComputerBulk(tier, miniaturizationCount = 0) {
  const effectiveTier = Math.max(-1, tier - miniaturizationCount);
  if (effectiveTier <= -1) return { value: 'Negligible', effectiveTier };
  if (effectiveTier === 0) return { value: 'Light', effectiveTier };
  return { value: effectiveTier * effectiveTier, effectiveTier };
}

// Computer hardness — base is 5 + tier; Hardened adds +10
export function getComputerHardness(tier, hardened = false) {
  return (5 + tier) + (hardened ? 10 : 0);
}

// Computer save bonus — base is tier; Hardened adds +8 vs energy/electronic
export function getComputerSave(tier, hardened = false) {
  return tier + (hardened ? 8 : 0);
}

export function getUpgrade(key) {
  return UPGRADE_MAP[key];
}

export function getModuleUpgrade(key) {
  return MODULE_UPGRADE_MAP[key];
}