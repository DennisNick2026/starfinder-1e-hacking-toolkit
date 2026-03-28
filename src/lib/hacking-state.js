import { useState, useCallback } from 'react';

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
    skills: ['Computers'],
    resolved: false,
  },
  node: {
    type: 'node',
    label: 'Node',
    color: 'cyan',
    icon: 'GitBranch',
    description: 'Branch providing access to other objectives',
    dc: 0,
    resolve_method: 'Hack',
    successes_required: 2,
    successes_current: 0,
    resolved: false,
  },
  data_module: {
    type: 'data_module',
    label: 'Data Module',
    color: 'green',
    icon: 'Database',
    description: 'Contains valuable intelligence',
    dc: 0,
    resolve_method: 'Hack',
    successes_required: 1,
    successes_current: 0,
    resolved: false,
  },
  command_module: {
    type: 'command_module',
    label: 'Command Module',
    color: 'green',
    icon: 'SquareTerminal',
    description: 'Controls a system function (doors, turrets, etc.)',
    dc: 0,
    resolve_method: 'Hack',
    successes_required: 1,
    successes_current: 0,
    resolved: false,
  },
  firewall: {
    type: 'firewall',
    label: 'Firewall',
    color: 'red',
    icon: 'ShieldAlert',
    description: 'Blocks access until overcome',
    dc: 0,
    resolve_method: 'Hack',
    successes_required: 2,
    successes_current: 0,
    resolved: false,
  },
  alarm: {
    type: 'alarm',
    label: 'Alarm',
    color: 'red',
    icon: 'Siren',
    description: 'Alerts security when triggered',
    dc: 0,
    resolve_method: 'Deceive',
    countdown: 3,
    countdown_current: 3,
    triggered: false,
    resolved: false,
  },
  counterhacker: {
    type: 'counterhacker',
    label: 'Counterhacker',
    color: 'red',
    icon: 'UserX',
    description: 'Active defense that attacks persona CP',
    dc: 0,
    resolve_method: 'Deceive',
    successes_required: 3,
    successes_current: 0,
    damage_per_phase: 4,
    resolved: false,
  },
  virus: {
    type: 'virus',
    label: 'Virus',
    color: 'purple',
    icon: 'Bug',
    description: 'Malware that degrades persona on trigger',
    dc: 0,
    resolve_method: 'Process',
    countdown: 2,
    countdown_current: 2,
    damage_on_trigger: 6,
    triggered: false,
    resolved: false,
  },
  vulnerability: {
    type: 'vulnerability',
    label: 'Vulnerability',
    color: 'yellow',
    icon: 'Unlock',
    description: 'Exploit to lower an access point DC',
    dc: 0,
    skill: 'Computers',
    dc_reduction: 2,
    resolved: false,
  },
};

let nextId = 1;

function createNode(template, x, y, baseDC) {
  const id = `node_${nextId++}`;
  return {
    ...template,
    id,
    x,
    y,
    dc: template.dc || baseDC,
    name: template.label,
  };
}

const DEFAULT_HACKER = {
  name: 'Hacker',
  role: 'lead',
  computers_mod: 10,
  deceive_mod: 0,
  hack_mod: 0,
  process_mod: 0,
  cp_max: 22,
  cp_current: 22,
};

export function useHackingState() {
  const [computerName, setComputerName] = useState('Secure Terminal');
  const [tier, setTier] = useState(3);
  const [baseDC, setBaseDC] = useState(24);
  const [phase, setPhase] = useState(1);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [hackers, setHackers] = useState([{ ...DEFAULT_HACKER, id: 'hacker_1' }]);
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

  const rollCheck = useCallback((nodeId, hackerId, subskill) => {
    const node = nodes.find(n => n.id === nodeId);
    const hacker = hackers.find(h => h.id === hackerId);
    if (!node || !hacker) return;

    const roll = Math.floor(Math.random() * 20) + 1;
    const modKey = `${subskill}_mod`;
    const totalMod = hacker.computers_mod + (hacker[modKey] || 0);
    const total = roll + totalMod;
    const dc = node.dc;
    const success = total >= dc;
    const critSuccess = total >= dc + 10 || roll === 20;
    const critFail = total < dc - 10 || roll === 1;

    let resultType = 'failure';
    if (critSuccess && roll !== 1) resultType = 'crit_success';
    else if (success && roll !== 1) resultType = 'success';
    else if (critFail || roll === 1) resultType = 'crit_failure';

    const resultText = `${hacker.name} rolls ${subskill} on "${node.name}": d20(${roll}) + ${totalMod} = ${total} vs DC ${dc} → ${resultType.replace('_', ' ').toUpperCase()}`;
    addLogEntry(resultText, resultType === 'crit_success' || resultType === 'success' ? 'success' : 'danger');

    if (resultType === 'crit_success' || resultType === 'success') {
      const gained = resultType === 'crit_success' ? 2 : 1;
      if (node.successes_required) {
        const newSuccesses = Math.min((node.successes_current || 0) + gained, node.successes_required);
        const resolved = newSuccesses >= node.successes_required;
        updateNode(nodeId, { successes_current: newSuccesses, resolved });
        if (resolved) addLogEntry(`"${node.name}" resolved!`, 'success');
      }
    }

    if (resultType === 'failure' || resultType === 'crit_failure') {
      if (node.failures_max) {
        const gained = resultType === 'crit_failure' ? 2 : 1;
        const newFailures = (node.failures_current || 0) + gained;
        updateNode(nodeId, { failures_current: newFailures });
        if (newFailures >= node.failures_max) {
          addLogEntry(`"${node.name}" countermeasures triggered!`, 'danger');
        }
      }
    }

    return { roll, totalMod, total, dc, resultType };
  }, [nodes, hackers, addLogEntry, updateNode]);

  const advancePhase = useCallback(() => {
    setPhase(p => p + 1);
    // Tick down countdowns
    setNodes(prev => prev.map(n => {
      if (n.countdown_current !== undefined && !n.resolved && !n.triggered) {
        const newCountdown = n.countdown_current - 1;
        if (newCountdown <= 0) {
          addLogEntry(`"${n.name}" triggered!`, 'danger');
          return { ...n, countdown_current: 0, triggered: true };
        }
        return { ...n, countdown_current: newCountdown };
      }
      return n;
    }));
    addLogEntry(`Phase ${phase + 1} begins`, 'system');
  }, [phase, addLogEntry]);

  const addHacker = useCallback(() => {
    const id = `hacker_${Date.now()}`;
    setHackers(prev => [...prev, { ...DEFAULT_HACKER, id, name: `Hacker ${prev.length + 1}` }]);
  }, []);

  const updateHacker = useCallback((hackerId, updates) => {
    setHackers(prev => prev.map(h => h.id === hackerId ? { ...h, ...updates } : h));
  }, []);

  const removeHacker = useCallback((hackerId) => {
    setHackers(prev => prev.filter(h => h.id !== hackerId));
  }, []);

  const resetEncounter = useCallback(() => {
    setPhase(1);
    setNodes(prev => prev.map(n => ({
      ...n,
      successes_current: 0,
      failures_current: 0,
      resolved: false,
      triggered: false,
      countdown_current: n.countdown,
    })));
    setHackers(prev => prev.map(h => ({ ...h, cp_current: h.cp_max })));
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
    hackers,
    selectedNodeId, setSelectedNodeId,
    selectedNode,
    connectingFrom, setConnectingFrom,
    log,
    addNode, updateNode, removeNode, moveNode,
    addConnection, removeConnection,
    rollCheck, advancePhase,
    addHacker, updateHacker, removeHacker,
    resetEncounter, addLogEntry,
    NODE_TEMPLATES,
  };
}

export { NODE_TEMPLATES };