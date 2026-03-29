import React, { useState } from 'react';
import { useHackingState } from '@/lib/hacking-state';
import BoardCanvas from '@/components/hacking/BoardCanvas';
import NodeEditor from '@/components/hacking/NodeEditor';
import HackDialog from '@/components/hacking/HackDialog';
import BottomToolbar from '@/components/hacking/BottomToolbar';
import BottomLog from '@/components/hacking/BottomLog';
import ComputerSettings from '@/components/hacking/ComputerSettings';
import DataFileModal from '@/components/hacking/DataFileModal';
import { Cpu, ShieldCheck, Play, SkipForward, RotateCcw, Settings, Shield, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HackingBoard() {
  const state = useHackingState();
  const [mode, setMode] = useState('create');
  // rootModeOverride: manually toggled on/off; auto-enabled when root_access node is resolved
  const [rootModeOverride, setRootModeOverride] = useState(false);
  const rootMode = rootModeOverride || state.rootAccessGranted;
  // In play mode, only allow toggle if root has been earned
  const canToggleRoot = mode === 'create' || state.rootAccessGranted;
  const [hackingNode, setHackingNode] = useState(null);
  const [configuringNodeId, setConfiguringNodeId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [fileNode, setFileNode] = useState(null);

  const configuringNode = state.nodes.find(n => n.id === configuringNodeId) || null;
  const selectedNode = configuringNode || state.nodes.find(n => n.id === state.selectedNodeId) || null;

  const handleDropNode = (templateKey, x, y) => {
    state.addNode(templateKey, x, y);
  };

  const handleHack = (node) => {
    setConfiguringNodeId(null);
    setHackingNode(node);
  };

  const handleConfigure = (nodeId) => {
    if (mode === 'play') return;
    setHackingNode(null);
    setConfiguringNodeId(nodeId);
    state.setSelectedNodeId(nodeId);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setConfiguringNodeId(null);
    setHackingNode(null);
    setShowSettings(false);
  };

  const handleSubmitRoll = (nodeId, total, cmId) => {
    state.submitRoll(nodeId, total, cmId);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="h-10 bg-background border-b border-primary/30 flex items-center px-4 gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Cpu className="w-4 h-4 text-primary shrink-0" />
          <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase truncate">
            {state.computerName}
          </span>
          <span className="font-mono text-[10px] text-primary/50 border border-primary/30 px-1.5 py-0.5 rounded">
            T{state.tier}
          </span>
          <span className="font-mono text-[10px] text-primary/50 border border-primary/30 px-1.5 py-0.5 rounded">
            DC {state.effectiveBaseDC}
          </span>
          <span className={cn(
            'font-mono text-[10px] border px-1.5 py-0.5 rounded',
            state.totalCountermeasures > state.tier
              ? 'text-destructive border-destructive/50 bg-destructive/10'
              : 'text-primary/50 border-primary/30'
          )}>
            CM {state.totalCountermeasures}/{state.tier}
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center border border-primary/30 rounded overflow-hidden">
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] tracking-widest transition-colors',
              mode === 'create' ? 'bg-primary text-primary-foreground' : 'text-primary/50 hover:text-primary'
            )}
            onClick={() => handleSwitchMode('create')}
          >
            <Pencil className="w-3 h-3" /> ADMIN
          </button>
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] tracking-widest transition-colors border-l border-primary/30',
              mode === 'play' ? 'bg-primary text-primary-foreground' : 'text-primary/50 hover:text-primary'
            )}
            onClick={() => handleSwitchMode('play')}
          >
            <Play className="w-3 h-3" /> PLAY
          </button>
        </div>

        {/* Root Access toggle — always in Admin, only after earned in Play */}
        {canToggleRoot && (
          <button
            onClick={() => setRootModeOverride(v => !v)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] tracking-widest border rounded transition-colors',
              rootModeOverride
                ? 'border-chart-3 bg-chart-3/20 text-chart-3'
                : 'border-primary/30 text-primary/50 hover:text-primary/80 hover:border-primary/50'
            )}
          >
            <ShieldCheck className="w-3 h-3" />
            ROOT {rootModeOverride ? 'ON' : 'OFF'}
          </button>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-primary/50 tracking-widest">PHASE</span>
          <span className="font-mono text-xs text-primary font-bold w-6 text-center">{state.phase}</span>
          <button
            onClick={state.advancePhase}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded"
          >
            <SkipForward className="w-3 h-3" /> NEXT
          </button>
          <button
            onClick={state.resetEncounter}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono border border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive transition-colors rounded"
          >
            <RotateCcw className="w-3 h-3" /> RESET
          </button>
          <button
            onClick={() => setShowSettings(s => !s)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-[10px] font-mono border rounded transition-colors',
              showSettings
                ? 'border-primary text-primary bg-primary/10'
                : 'border-primary/30 text-primary/50 hover:text-primary hover:border-primary'
            )}
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <BoardCanvas
            nodes={state.nodes}
            connections={state.connections}
            selectedNodeId={configuringNodeId || state.selectedNodeId}
            connectingFrom={state.connectingFrom}
            setConnectingFrom={state.setConnectingFrom}
            onSelectNode={(id) => {
              state.setSelectedNodeId(id);
              if (!id) setConfiguringNodeId(null);
            }}
            onMoveNode={state.moveNode}
            onDeleteNode={mode === 'create' ? state.removeNode : () => {}}
            onAddConnection={state.addConnection}
            onHack={handleHack}
            onUnhack={state.unhackNode}
            onConfigure={handleConfigure}
            onDropNode={handleDropNode}
            mode={mode}
            onUnresolveCm={mode === 'play' ? state.unresolveCountermeasure : null}
            onOpenFile={setFileNode}
          />

          <BottomLog log={state.log} selectedNode={selectedNode} activeCategory={activeCategory} onDragStart={() => {}} />
          <BottomToolbar mode={mode} onDragStart={() => {}} rootMode={rootMode} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>

        {mode === 'create' && configuringNode && (
          <NodeEditor
            node={configuringNode}
            onUpdate={state.updateNode}
            onClose={() => setConfiguringNodeId(null)}
            onAddCm={state.addCountermeasure}
            onUpdateCm={state.updateCountermeasure}
            onRemoveCm={state.removeCountermeasure}
          />
        )}

        {showSettings && (
          <div className="w-64 bg-card border-l border-primary/30 shrink-0 overflow-y-auto p-4">
            <ComputerSettings
              computerName={state.computerName}
              setComputerName={state.setComputerName}
              tier={state.tier}
              setTier={state.setTier}
              baseDC={state.baseDC}
              setBaseDC={state.setBaseDC}
              securityModule={state.securityModule}
              setSecurityModule={state.setSecurityModule}
              upgrades={state.upgrades}
              setUpgrades={state.setUpgrades}
            />
          </div>
        )}
      </div>

      {fileNode && (
        <DataFileModal
          node={state.nodes.find(n => n.id === fileNode.id) || fileNode}
          canEdit={mode === 'create' || rootMode}
          onClose={() => setFileNode(null)}
          onSave={(nodeId, content) => state.updateNode(nodeId, { file_content: content })}
        />
      )}

      {hackingNode && (
        <HackDialog
          key={hackingNode.id}
          node={state.nodes.find(n => n.id === hackingNode.id) || hackingNode}
          onSubmit={handleSubmitRoll}
          onUnhack={(nodeId) => { state.unhackNode(nodeId); }}
          onClose={() => setHackingNode(null)}
          mode={mode}
          rootMode={rootMode}
        />
      )}
    </div>
  );
}