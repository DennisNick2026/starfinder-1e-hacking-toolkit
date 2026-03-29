import { useState, useCallback, useEffect } from 'react';

// Countermeasure templates that can be embedded into modules
export const COUNTERMEASURE_TEMPLATES = {
  alarm: {
    type: 'alarm',
    label: 'Alarm',
    color: 'red',
    icon: 'Siren',
    dc: 0,
    countdown: 3,
    countdown_current: 3,
    triggered: false,
    resolved: false,
  },
  fake_shell: {
    type: 'fake_shell',
    label: 'Fake Shell',
    color: 'red',
    icon: 'EyeOff',
    dc: 0,
    resolved: false,
    note: 'Hackers must succeed or waste actions on fake data',
  },
  feedback: {
    type: 'feedback',
    label: 'Feedback',
    color: 'red',
    icon: 'Zap',
    dc: 0,
    damage_on_trigger: 4,
    triggered: false,
    resolved: false,
    note: 'Deals damage to hacker on failure',
  },

  firewall: {
    type: 'firewall',
    label: 'Firewall',
    color: 'red',
    icon: 'ShieldAlert',
    dc: 0, // Set dynamically based on computer DC + 2
    resolved: false,
    password: '',
  },
  lockout: {
    type: 'lockout',
    label: 'Lockout',
    color: 'red',
    icon: 'Lock',
    dc: 0,
    resolved: false,
    note: 'Boots hacker from system on trigger',
  },
  shock_grid: {
    type: 'shock_grid',
    label: 'Shock Grid',
    color: 'red',
    icon: 'Zap',
    dc: 0,
    damage_on_trigger: 6,
    triggered: false,
    resolved: false,
    note: 'Deals electricity damage to hacker on trigger',
  },
  wipe: {
    type: 'wipe',
    label: 'Wipe',
    color: 'red',
    icon: 'Trash2',
    dc: 0,
    countdown: 2,
    countdown_current: 2,
    triggered: false,
    resolved: false,
    note: 'Destroys data in module when triggered',
  },
};

// Only structural/objective nodes are placeable on the board
// DC modifiers per node type relative to base DC (13 + 4*tier)
export const NODE_DC_MODIFIERS = {
  access_point:        0,
  user_interface:      0,
  directory:           0,
  control_complex:    +2,
  secure_data_average: 0,
  secure_data_large:  +2,
  secure_data_specific:+4,
  spell_chip:          0,
  vulnerability:      -4,
  ctrl_door:           0,
  ctrl_camera:         0,
  ctrl_turret:        +2,
  ctrl_vent:           0,
  ctrl_detonate:      +2,
  ctrl_laser:         +2,
  ctrl_gravity:       +2,
  ctrl_robot:         +2,
  ctrl_shield:        +2,
  ctrl_engine:        +2,
  ctrl_weapon:        +2,
  ctrl_life_support:  +4,
  ctrl_sensor:         0,
  ctrl_power_core:    +4,
  security_module:   0,
};

const NODE_TEMPLATES = {
  access_point: {
    type: 'access_point',
    label: 'Access Point',
    color: 'cyan',
    icon: 'Terminal',
    description: 'Entry point to the system',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  user_interface: {
    type: 'user_interface',
    label: 'User Interface',
    color: 'cyan',
    icon: 'Terminal',
    description: 'Secondary entry point — a physical or remote UI terminal into the system',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  directory: {
    type: 'directory',
    label: 'Directory',
    color: 'yellow',
    icon: 'FolderLock',
    description: 'Locked folder — nodes inside are hidden until opened',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    locked: true,
    countermeasures: [],
  },
  control_complex: {
    type: 'control_complex',
    label: 'Control (Complex)',
    color: 'cyan',
    icon: 'SquareTerminal',
    description: 'Controls a complex system function',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  secure_data_average: {
    type: 'secure_data_average',
    label: 'Secure Data (Avg)',
    color: 'blue',
    icon: 'Database',
    description: 'Average-security stored data',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    file_content: '',
    countermeasures: [],
  },
  secure_data_large: {
    type: 'secure_data_large',
    label: 'Secure Data (Large)',
    color: 'blue',
    icon: 'Database',
    description: 'Large volume of secured data',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    file_content: '',
    countermeasures: [],
  },
  secure_data_specific: {
    type: 'secure_data_specific',
    label: 'Secure Data (Specific)',
    color: 'blue',
    icon: 'Database',
    description: 'Specific targeted data record',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    file_content: '',
    countermeasures: [],
  },
  spell_chip: {
    type: 'spell_chip',
    label: 'Spell Chip',
    color: 'blue',
    icon: 'Sparkles',
    description: 'Magical data storage chip',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  vulnerability: {
    type: 'vulnerability',
    label: 'Vulnerability',
    color: 'cyan',
    icon: 'Unlock',
    description: 'Exploit to lower an access point DC',
    dc: 0,
    dc_reduction: 2,
    resolved: false,
    countermeasures: [],
  },
  ctrl_door: {
    type: 'ctrl_door', label: 'Door', color: 'green', icon: 'SquareTerminal',
    description: 'Control a door — lock, unlock, or open/close remotely',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_camera: {
    type: 'ctrl_camera', label: 'Camera', color: 'green', icon: 'SquareTerminal',
    description: 'Access or disable a security camera',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_turret: {
    type: 'ctrl_turret', label: 'Turret', color: 'green', icon: 'SquareTerminal',
    description: 'Disable, redirect, or take control of a turret',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_vent: {
    type: 'ctrl_vent', label: 'Vent', color: 'green', icon: 'SquareTerminal',
    description: 'Open, close, or reroute ventilation systems',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_detonate: {
    type: 'ctrl_detonate', label: 'Detonate', color: 'red', icon: 'SquareTerminal',
    description: 'Trigger an explosive or destructive device remotely',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_laser: {
    type: 'ctrl_laser', label: 'Laser', color: 'green', icon: 'SquareTerminal',
    description: 'Redirect or disable a laser system',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_gravity: {
    type: 'ctrl_gravity', label: 'Gravity', color: 'green', icon: 'SquareTerminal',
    description: 'Alter gravity plating settings in an area',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_robot: {
    type: 'ctrl_robot', label: 'Robot', color: 'green', icon: 'SquareTerminal',
    description: 'Hack and override a robot or drone',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_shield: {
    type: 'ctrl_shield', label: 'Shield', color: 'green', icon: 'SquareTerminal',
    description: 'Lower or disable a shield generator',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_engine: {
    type: 'ctrl_engine', label: 'Engine', color: 'green', icon: 'SquareTerminal',
    description: 'Sabotage or control an engine or thruster',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_weapon: {
    type: 'ctrl_weapon', label: 'Weapon', color: 'green', icon: 'SquareTerminal',
    description: 'Override or disable a weapons system',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_life_support: {
    type: 'ctrl_life_support', label: 'Life Support', color: 'green', icon: 'SquareTerminal',
    description: 'Tamper with life support systems',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_sensor: {
    type: 'ctrl_sensor', label: 'Sensor', color: 'green', icon: 'SquareTerminal',
    description: 'Blind, loop, or spoof sensor arrays',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  ctrl_power_core: {
    type: 'ctrl_power_core', label: 'Power Core', color: 'green', icon: 'SquareTerminal',
    description: 'Access and manipulate the main power core',
    dc: 0, successes_required: 1, successes_current: 0, resolved: false, countermeasures: [],
  },
  security_module: {
    type: 'security_module',
    label: 'Security Module',
    color: 'red',
    icon: 'ShieldAlert',
    description: 'Configurable security module (tier 1-4)',
    dc: 0,
    tier: 1,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
};

let nextId = 2;  // Start at 2 since entry and root_access take slots
let nextCmId = 1;

function createNode(template, x, y, baseDC) {
  const id = `node_${nextId++}`;
  const modifier = NODE_DC_MODIFIERS[template.type] ?? 0;
  const dc = Math.max(1, baseDC + modifier);
  return {
    ...template,
    id,
    x,
    y,
    dc,
    name: template.label,
    countermeasures: [],
  };
}

const ENTRY_NODE = {
  id: 'entry',
  type: 'entry',
  label: 'Entry',
  name: 'ENTRY',
  color: 'cyan',
  icon: 'LogIn',
  description: 'Hacking entry point — always present',
  dc: 24,
  successes_required: 0,
  successes_current: 0,
  resolved: false,
  isEntry: true,
  noHack: true,
  countermeasures: [],
  x: 400,
  y: 160,
};

const ROOT_ACCESS_NODE = {
  id: 'root_access',
  type: 'root_access',
  label: 'Root Access',
  name: 'ROOT ACCESS',
  color: 'purple',
  icon: 'ShieldCheck',
  description: 'Full system control — all DCs become 10',
  dc: 44, // baseDC + 20, updated dynamically
  successes_required: 1,
  successes_current: 0,
  resolved: false,
  isRootAccess: true,
  countermeasures: [],
  x: 400,
  y: 300,
};

export function useHackingState() {
  const baseDCInit = 25;
  const [computerName, setComputerName] = useState('Untitled Encounter');
  const [tier, setTier] = useState(3);
  const [baseDC, setBaseDC] = useState(baseDCInit);
  const [upgrades, setUpgrades] = useState([]);
  const [phase, setPhase] = useState(1);

  const getCenteredNodes = (dc) => {
    const cx = Math.max(200, window.innerWidth / 2 - 96);
    const cy = Math.max(80, window.innerHeight / 2 - 160);
    return [
      { ...ENTRY_NODE, dc, x: cx, y: cy },
      { ...ROOT_ACCESS_NODE, dc: dc + 20, x: cx, y: cy + 160 },
    ];
  };

  const [nodes, setNodes] = useState(() => getCenteredNodes(baseDCInit));
  const [connections, setConnections] = useState([
    { from: 'entry', to: 'root_access', id: 'conn_root' },
  ]);

  // Calculate security DC bonus from highest tier security module on board
  const getSecurityDCBonus = useCallback((nodesList) => {
    const unresolved = nodesList.filter(n => n.type === 'security_module' && !n.resolved && n.tier);
    return unresolved.length > 0 ? Math.max(...unresolved.map(n => n.tier || 0)) : 0;
  }, []);

  // Calculate effective base DC with security bonus
  const securityBonus = getSecurityDCBonus(nodes);
  const effectiveBaseDC = baseDC + securityBonus;

  // Keep entry node and root access DC in sync with baseDC + highest security bonus
  // Also update all other node DCs and security module names
  useEffect(() => {
    const securityBonus = getSecurityDCBonus(nodes);
    const effectiveDC = baseDC + securityBonus;
    setNodes(prev => prev.map(n => {
      if (n.id === 'entry') return { ...n, dc: effectiveDC };
      if (n.id === 'root_access') return { ...n, dc: effectiveDC + 20 };
      
      // Update all other nodes' DCs
      const modifier = NODE_DC_MODIFIERS[n.type] ?? 0;
      const newDC = Math.max(1, effectiveDC + modifier);
      
      // Update security module name to reflect tier
      if (n.type === 'security_module') {
        const tierNames = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
        const tierName = tierNames[n.tier] || 'I';
        return { ...n, dc: newDC, name: `Security Module ${tierName}` };
      }
      
      return { ...n, dc: newDC };
    }));
  }, [baseDC, nodes]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [log, setLog] = useState([]);

  const addLogEntry = useCallback((text, type = 'info') => {
    setLog(prev => [{ text, type, phase, time: Date.now() }, ...prev].slice(0, 100));
  }, [phase]);

  const addNode = useCallback((templateKey, x, y) => {
    const template = NODE_TEMPLATES[templateKey];
    if (!template) return;
    const node = createNode(template, x, y, effectiveBaseDC);
    // Auto-number directories: DIR-01, DIR-02, etc.
    if (templateKey === 'directory') {
      setNodes(prev => {
        const dirCount = prev.filter(n => n.type === 'directory').length + 1;
        const numbered = { ...node, name: `DIR-${String(dirCount).padStart(2, '0')}`, locked: true };
        addLogEntry(`Added Directory: "${numbered.name}"`, 'system');
        return [...prev, numbered];
      });
    } else {
      setNodes(prev => {
        addLogEntry(`Added ${node.label}: "${node.name}"`, 'system');
        return [...prev, node];
      });
    }
    return node.id;
  }, [effectiveBaseDC, addLogEntry]);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      const updated = { ...n, ...updates };
      
      // Auto-update security module name when tier changes
      if (n.type === 'security_module' && updates.tier !== undefined) {
        const tierNames = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
        const tierName = tierNames[updates.tier] || 'I';
        updated.name = `Security Module ${tierName}`;
      }
      
      return updated;
    }));
  }, []);

  const removeNode = useCallback((nodeId) => {
    // Entry and root access nodes cannot be deleted
    if (nodeId === 'entry' || nodeId === 'root_access') return;
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    addLogEntry(`Removed node`, 'system');
  }, [selectedNodeId, addLogEntry]);

  const moveNode = useCallback((nodeId, x, y) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  }, []);

  const addConnection = useCallback((fromId, toId) => {
    if (fromId === toId) return;
    const exists = connections.some(c =>
      (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
    );
    if (exists) return;
    setConnections(prev => [...prev, { from: fromId, to: toId, id: `conn_${Date.now()}` }]);
  }, [connections]);

  const removeConnection = useCallback((connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  }, []);

  // Add a countermeasure to a node
  const addCountermeasure = useCallback((nodeId, cmType) => {
    const template = COUNTERMEASURE_TEMPLATES[cmType];
    if (!template) return;
    const cm = { ...template, id: `cm_${nextCmId++}` };
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, countermeasures: [...(n.countermeasures || []), cm] } : n
    ));
  }, []);

  const updateCountermeasure = useCallback((nodeId, cmId, updates) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      return {
        ...n,
        countermeasures: (n.countermeasures || []).map(cm =>
          cm.id === cmId ? { ...cm, ...updates } : cm
        ),
      };
    }));
  }, []);

  const removeCountermeasure = useCallback((nodeId, cmId) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      return { ...n, countermeasures: (n.countermeasures || []).filter(cm => cm.id !== cmId) };
    }));
  }, []);

  const unresolveCountermeasure = useCallback((nodeId, cmId) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      return {
        ...n,
        countermeasures: (n.countermeasures || []).map(cm =>
          cm.id === cmId ? { ...cm, resolved: false } : cm
        ),
      };
    }));
  }, []);

  const unhackNode = useCallback((nodeId) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      return {
        ...n,
        successes_current: 0,
        resolved: false,
        ...(n.type === 'directory' ? { locked: true } : {}),
        countermeasures: (n.countermeasures || []).map(cm => ({
          ...cm,
          successes_current: 0,
          resolved: false,
          triggered: false,
          revealed: false,
          countdown_current: cm.countdown,
        })),
      };
    }));
  }, []);

  const toggleDirectoryLocked = useCallback((nodeId) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId || n.type !== 'directory') return n;
      return { ...n, locked: !n.locked };
    }));
  }, []);

  // Submit a manual roll total against a node or countermeasure DC
  // target: { nodeId, cmId? } — if cmId present, rolling against a countermeasure
  const submitRoll = useCallback((nodeId, total, cmId = null, rootMode = false) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;

      if (cmId) {
        // Rolling against a countermeasure
        const cms = (n.countermeasures || []).map(cm => {
          if (cm.id !== cmId) return cm;
          if (cm.resolved) return cm;
          const effectiveDC = rootMode ? 10 : cm.dc;
          const success = total >= effectiveDC;
          if (!success) return cm;
          if (cm.successes_required !== undefined) {
            const newSuccesses = Math.min((cm.successes_current || 0) + 1, cm.successes_required);
            const resolved = newSuccesses >= cm.successes_required;
            return { ...cm, successes_current: newSuccesses, resolved, triggered: false };
          }
          return { ...cm, resolved: true, triggered: false };
        });
        return { ...n, countermeasures: cms };
      }

      // Rolling against the node itself
      if (n.resolved) return n;
      const effectiveNodeDC = rootMode ? 10 : n.dc;
      const margin = total - effectiveNodeDC; // positive = success, negative = failure
      const success = margin >= 0;

      // Update alarm countermeasures based on roll result
      const updatedCms = (n.countermeasures || []).map(cm => {
        if (cm.type !== 'alarm' || cm.resolved || cm.triggered) return cm;
        if (success || margin >= -4) {
          // Success or fail by less than 5: alarm is revealed but not triggered
          return { ...cm, revealed: true };
        } else {
          // Fail by 5 or more: alarm triggers
          return { ...cm, revealed: true, triggered: true };
        }
      });

      if (!success) {
        return { ...n, countermeasures: updatedCms };
      }
      if (n.successes_required !== undefined) {
        const newSuccesses = Math.min((n.successes_current || 0) + 1, n.successes_required);
        const resolved = newSuccesses >= n.successes_required;
        const unlocked = resolved && n.type === 'directory' ? { locked: false } : {};
        return { ...n, successes_current: newSuccesses, resolved, ...unlocked, countermeasures: updatedCms };
      }
      const unlocked = n.type === 'directory' ? { locked: false } : {};
      return { ...n, resolved: true, ...unlocked, countermeasures: updatedCms };
    }));
  }, []);

  const advancePhase = useCallback(() => {
    setPhase(p => p + 1);
    setNodes(prev => prev.map(n => {
      // Tick countermeasure countdowns
      const updatedCms = (n.countermeasures || []).map(cm => {
        if (cm.countdown_current !== undefined && !cm.resolved && !cm.triggered) {
          const newCountdown = cm.countdown_current - 1;
          if (newCountdown <= 0) return { ...cm, countdown_current: 0, triggered: true };
          return { ...cm, countdown_current: newCountdown };
        }
        return cm;
      });
      return { ...n, countermeasures: updatedCms };
    }));
    addLogEntry(`Phase ${phase + 1} begins`, 'system');
  }, [phase, addLogEntry]);

  const clearNodes = useCallback(() => {
    setNodes(prev => prev.filter(n => n.isEntry || n.isRootAccess));
    setConnections(prev => prev.filter(c =>
      (c.from === 'entry' || c.from === 'root_access') &&
      (c.to === 'entry' || c.to === 'root_access')
    ));
    addLogEntry('All nodes cleared', 'system');
  }, [addLogEntry]);

  const resetEncounter = useCallback(() => {
    setPhase(1);
    setNodes(prev => prev.map(n => ({
      ...n,
      successes_current: 0,
      resolved: false,
      triggered: false,
      ...(n.type === 'directory' ? { locked: true } : {}),
      countermeasures: (n.countermeasures || []).map(cm => ({
        ...cm,
        successes_current: 0,
        resolved: false,
        triggered: false,
        revealed: false,
        countdown_current: cm.countdown,
      })),
    })));
    setLog([]);
    addLogEntry('Encounter reset', 'system');
  }, [addLogEntry]);

  // Whether root access has been granted
  const rootAccessGranted = nodes.find(n => n.id === 'root_access')?.resolved ?? false;

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Count total countermeasures across all nodes (for tier limit)
  const totalCountermeasures = nodes.reduce((sum, n) =>
    sum + (n.countermeasures || []).filter(cm => !cm.resolved).length, 0
  );

  const loadEncounter = useCallback((encounterData) => {
    setComputerName(encounterData.computerName);
    setTier(encounterData.tier);
    setBaseDC(encounterData.baseDC);
    setSecurityModule(encounterData.securityModule || null);
    setUpgrades(encounterData.upgrades || []);
    setNodes(encounterData.nodes || []);
    setConnections(encounterData.connections || []);
    setPhase(1);
    setLog([]);
  }, []);

  return {
    computerName, setComputerName,
    tier, setTier,
    baseDC, setBaseDC,
    upgrades, setUpgrades,
    effectiveBaseDC,
    totalCountermeasures,
    phase, setPhase,
    nodes, connections,
    selectedNodeId, setSelectedNodeId,
    selectedNode,
    connectingFrom, setConnectingFrom,
    log,
    addNode, updateNode, removeNode, moveNode,
    addConnection, removeConnection,
    addCountermeasure, updateCountermeasure, removeCountermeasure, unresolveCountermeasure,
    submitRoll, advancePhase,
    resetEncounter, clearNodes, addLogEntry, unhackNode, loadEncounter, toggleDirectoryLocked,
    rootAccessGranted,
    NODE_TEMPLATES,
  };
}

export { NODE_TEMPLATES };