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
    dc: 0,
    successes_required: 2,
    successes_current: 0,
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
    color: 'purple',
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
  directory:           0,
  control_complex:    +2,
  secure_data_average: 0,
  secure_data_large:  +2,
  secure_data_specific:+4,
  spell_chip:          0,
  vulnerability:      -4,
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
    failures_current: 0,
    failures_max: 3,
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
    password: '',
    countermeasures: [],
  },
  control_complex: {
    type: 'control_complex',
    label: 'Control (Complex)',
    color: 'green',
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
    color: 'green',
    icon: 'Database',
    description: 'Average-security stored data',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  secure_data_large: {
    type: 'secure_data_large',
    label: 'Secure Data (Large)',
    color: 'green',
    icon: 'Database',
    description: 'Large volume of secured data',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  secure_data_specific: {
    type: 'secure_data_specific',
    label: 'Secure Data (Specific)',
    color: 'green',
    icon: 'Database',
    description: 'Specific targeted data record',
    dc: 0,
    successes_required: 1,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  spell_chip: {
    type: 'spell_chip',
    label: 'Spell Chip',
    color: 'purple',
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
    color: 'yellow',
    icon: 'Unlock',
    description: 'Exploit to lower an access point DC',
    dc: 0,
    dc_reduction: 2,
    resolved: false,
    countermeasures: [],
  },
};

let nextId = 1;
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
  const baseDCInit = 24;
  const [computerName, setComputerName] = useState('Untitled Encounter');
  const [tier, setTier] = useState(3);
  const [baseDC, setBaseDC] = useState(baseDCInit);
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

  // Keep entry node and root access DC in sync with baseDC
  useEffect(() => {
    setNodes(prev => prev.map(n => {
      if (n.id === 'entry') return { ...n, dc: baseDC };
      if (n.id === 'root_access') return { ...n, dc: baseDC + 20 };
      return n;
    }));
  }, [baseDC]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [log, setLog] = useState([]);

  const addLogEntry = useCallback((text, type = 'info') => {
    setLog(prev => [{ text, type, phase, time: Date.now() }, ...prev].slice(0, 100));
  }, [phase]);

  const addNode = useCallback((templateKey, x, y) => {
    const template = NODE_TEMPLATES[templateKey];
    if (!template) return;
    const node = createNode(template, x, y, baseDC);
    // Auto-number directories: DIR-01, DIR-02, etc.
    if (templateKey === 'directory') {
      setNodes(prev => {
        const dirCount = prev.filter(n => n.type === 'directory').length + 1;
        const numbered = { ...node, name: `DIR-${String(dirCount).padStart(2, '0')}`, locked: true };
        addLogEntry(`Added Directory: "${numbered.name}"`, 'system');
        return [...prev, numbered];
      });
    } else {
      setNodes(prev => [...prev, node]);
      addLogEntry(`Added ${node.label}: "${node.name}"`, 'system');
    }
    return node.id;
  }, [baseDC, addLogEntry]);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n));
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

  const unhackNode = useCallback((nodeId) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      return {
        ...n,
        successes_current: 0,
        failures_current: 0,
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

  // Submit a manual roll total against a node or countermeasure DC
  // target: { nodeId, cmId? } — if cmId present, rolling against a countermeasure
  const submitRoll = useCallback((nodeId, total, cmId = null) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;

      if (cmId) {
        // Rolling against a countermeasure
        const cms = (n.countermeasures || []).map(cm => {
          if (cm.id !== cmId) return cm;
          if (cm.resolved || cm.triggered) return cm;
          const success = total >= cm.dc;
          if (!success) return cm;
          if (cm.successes_required !== undefined) {
            const newSuccesses = Math.min((cm.successes_current || 0) + 1, cm.successes_required);
            const resolved = newSuccesses >= cm.successes_required;
            return { ...cm, successes_current: newSuccesses, resolved };
          }
          return { ...cm, resolved: true };
        });
        return { ...n, countermeasures: cms };
      }

      // Rolling against the node itself
      if (n.resolved) return n;
      const margin = total - n.dc; // positive = success, negative = failure
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
        if (n.failures_max !== undefined) {
          const newFailures = (n.failures_current || 0) + 1;
          return { ...n, failures_current: newFailures, countermeasures: updatedCms };
        }
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

  const resetEncounter = useCallback(() => {
    setPhase(1);
    setNodes(prev => prev.map(n => ({
      ...n,
      successes_current: 0,
      failures_current: 0,
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

  return {
    computerName, setComputerName,
    tier, setTier,
    baseDC, setBaseDC,
    phase, setPhase,
    nodes, connections,
    selectedNodeId, setSelectedNodeId,
    selectedNode,
    connectingFrom, setConnectingFrom,
    log,
    addNode, updateNode, removeNode, moveNode,
    addConnection, removeConnection,
    addCountermeasure, updateCountermeasure, removeCountermeasure,
    submitRoll, advancePhase,
    resetEncounter, addLogEntry, unhackNode,
    rootAccessGranted,
    NODE_TEMPLATES,
  };
}

export { NODE_TEMPLATES };