import React, { useState } from 'react';
import { useHackingState } from '@/lib/hacking-state';
import BoardCanvas from '@/components/hacking/BoardCanvas';
import NodeEditor from '@/components/hacking/NodeEditor';
import HackDialog from '@/components/hacking/HackDialog';
import BottomToolbar from '@/components/hacking/BottomToolbar';
import BottomLog from '@/components/hacking/BottomLog';
import ComputerSettings from '@/components/hacking/ComputerSettings';
import { Cpu, Pencil, Play, SkipForward, RotateCcw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HackingBoard() {
  const state = useHackingState();
  const [mode, setMode] = useState('create');
  // rootMode: all DCs become 10 (granted when root_access node resolved)
  const rootMode = state.rootAccessGranted;
  const [hackingNode, setHackingNode] = useState(null);
  const [configuringNodeId, setConfiguringNodeId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

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
    setHackingNode(state.nodes.find(n => n.id === nodeId) || null);
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
            DC {state.baseDC}
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
            <Pencil className="w-3 h-3" /> CREATE
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
        {rootMode && (
          <span className="font-mono text-[10px] text-chart-3 border border-chart-3/50 bg-chart-3/10 px-2 py-0.5 rounded tracking-widest animate-pulse">
            ★ ROOT ACCESS — DC 10
          </span>
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
            onConfigure={handleConfigure}
            onDropNode={handleDropNode}
            mode={mode}
          />

          <BottomLog log={state.log} selectedNode={selectedNode} />
          <BottomToolbar mode={mode} onDragStart={() => {}} rootMode={rootMode} />
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
            />
          </div>
        )}
      </div>

      {hackingNode && (
        <HackDialog
          node={state.nodes.find(n => n.id === hackingNode.id) || hackingNode}
          onSubmit={handleSubmitRoll}
          onClose={() => setHackingNode(null)}
          mode={mode}
          rootMode={rootMode}
        />
      )}
    </div>
  );
}