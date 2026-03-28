import { useState, useCallback } from 'react';

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
  node: {
    type: 'node',
    label: 'Node',
    color: 'cyan',
    icon: 'GitBranch',
    description: 'Branch providing access to other objectives',
    dc: 0,
    successes_required: 2,
    successes_current: 0,
    resolved: false,
    countermeasures: [],
  },
  control_complex: {
    type: 'control_complex',
    label: 'Control (Complex)',
    color: 'green',
    icon: 'SquareTerminal',
    description: 'Controls a complex system function',
    dc: 0,
    successes_required: 3,
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
    successes_required: 2,
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
  return {
    ...template,
    id,
    x,
    y,
    dc: template.dc || baseDC,
    name: template.label,
    countermeasures: [],
  };
}

export function useHackingState() {
  const [computerName, setComputerName] = useState('Secure Terminal');
  const [tier, setTier] = useState(3);
  const [baseDC, setBaseDC] = useState(24);
  const [phase, setPhase] = useState(1);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
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
    setNodes(prev => [...prev, node]);
    addLogEntry(`Added ${node.label}: "${node.name}"`, 'system');
    return node.id;
  }, [baseDC, addLogEntry]);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  }, []);

  const removeNode = useCallback((nodeId) => {
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
      const success = total >= n.dc;
      if (!success) {
        if (n.failures_max !== undefined) {
          const newFailures = (n.failures_current || 0) + 1;
          return { ...n, failures_current: newFailures };
        }
        return n;
      }
      if (n.successes_required !== undefined) {
        const newSuccesses = Math.min((n.successes_current || 0) + 1, n.successes_required);
        const resolved = newSuccesses >= n.successes_required;
        return { ...n, successes_current: newSuccesses, resolved };
      }
      return { ...n, resolved: true };
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
      countermeasures: (n.countermeasures || []).map(cm => ({
        ...cm,
        successes_current: 0,
        resolved: false,
        triggered: false,
        countdown_current: cm.countdown,
      })),
    })));
    setLog([]);
    addLogEntry('Encounter reset', 'system');
  }, [addLogEntry]);

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
    resetEncounter, addLogEntry,
    NODE_TEMPLATES,
  };
}

export { NODE_TEMPLATES };