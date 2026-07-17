// Centralized upgrade definitions — costs, descriptions, and gameplay effects.
// The UI and game state both consume from this single source of truth.

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
  range: 'Control Range',
  hardware: 'Hardware',
  software: 'Software',
};

export const UPGRADES = [
  {
    key: 'hardened',
    label: 'Hardened',
    description: 'Reinforced systems. All hack DCs against this computer increase by 2.',
    category: 'defensive',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.50),
    effect: { dcBonus: 2 },
  },
  {
    key: 'range_1',
    label: 'Range I',
    description: 'Control modules can operate within 100 ft of the computer.',
    category: 'range',
    calculatePrice: () => 5,
    effect: { controlRange: 100 },
  },
  {
    key: 'range_2',
    label: 'Range II',
    description: 'Control modules can operate within 1 mile of the computer.',
    category: 'range',
    calculatePrice: () => 50,
    effect: { controlRange: 1609 },
  },
  {
    key: 'range_3',
    label: 'Range III',
    description: 'Control modules can operate planetwide.',
    category: 'range',
    calculatePrice: () => 100,
    effect: { controlRange: Infinity },
  },
  {
    key: 'miniaturization',
    label: 'Miniaturization',
    description: 'Reduces the computer\'s bulk by half. Easier to conceal and transport.',
    category: 'hardware',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.10),
  },
  {
    key: 'self_charging',
    label: 'Self-Charging',
    description: 'The computer recharges its own battery automatically — never needs a power source.',
    category: 'hardware',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.10),
  },
  {
    key: 'artificial_personality',
    label: 'Artificial Personality',
    description: 'Grants +2 to Bluff, Diplomacy, and Intimidate checks made through the computer.',
    category: 'software',
    calculatePrice: (tier) => Math.round(TIER_PRICE[tier] * 0.10),
  },
];

const UPGRADE_MAP = Object.fromEntries(UPGRADES.map(u => [u.key, u]));

// Derive cumulative gameplay effects from a list of active upgrade keys.
export function getUpgradeEffects(activeUpgrades) {
  const effects = { dcBonus: 0, controlRange: 0 };
  for (const key of activeUpgrades || []) {
    const upg = UPGRADE_MAP[key];
    if (!upg?.effect) continue;
    if (upg.effect.dcBonus) effects.dcBonus += upg.effect.dcBonus;
    if (upg.effect.controlRange) effects.controlRange = Math.max(effects.controlRange, upg.effect.controlRange);
  }
  return effects;
}

export function getUpgrade(key) {
  return UPGRADE_MAP[key];
}