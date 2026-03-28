import React, { useState } from 'react';
import { useHackingState } from '@/lib/hacking-state';
import BoardCanvas from '@/components/hacking/BoardCanvas';
import NodeEditor from '@/components/hacking/NodeEditor';
import HackDialog from '@/components/hacking/HackDialog';
import Sidebar from '@/components/hacking/Sidebar';
import AddNodeMenu from '@/components/hacking/AddNodeMenu';
import PhaseTracker from '@/components/hacking/PhaseTracker';
import { Cpu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HackingBoard() {
  const state = useHackingState();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hackingNode, setHackingNode] = useState(null); // node being hacked
  const [configuringNodeId, setConfiguringNodeId] = useState(null); // node being configured

  const configuringNode = state.nodes.find(n => n.id === configuringNodeId) || null;

  const handleAddNode = (templateKey) => {
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    state.addNode(templateKey, x, y);
  };

  const handleHack = (node) => {
    setConfiguringNodeId(null);
    setHackingNode(node);
  };

  const handleConfigure = (nodeId) => {
    setHackingNode(null);
    setConfiguringNodeId(nodeId);
    state.setSelectedNodeId(nodeId);
  };

  const handleSubmitRoll = (nodeId, total, cmId) => {
    state.submitRoll(nodeId, total, cmId);
    // update hackingNode snapshot so dialog reflects new state
    setHackingNode(state.nodes.find(n => n.id === nodeId) || null);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <h1 className="font-mono text-sm font-bold text-foreground tracking-wide">
            {state.computerName}
          </h1>
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Tier {state.tier}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
            DC {state.baseDC}
          </span>
        </div>

        <div className="flex-1" />

        <PhaseTracker
          phase={state.phase}
          onAdvance={state.advancePhase}
          onReset={state.resetEncounter}
        />

        <div className="w-px h-6 bg-border" />

        <AddNodeMenu onAdd={handleAddNode} />

        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </Button>
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            computerName={state.computerName}
            setComputerName={state.setComputerName}
            tier={state.tier}
            setTier={state.setTier}
            baseDC={state.baseDC}
            setBaseDC={state.setBaseDC}
            log={state.log}
          />
        )}

        <BoardCanvas
          nodes={state.nodes}
          connections={state.connections}
          selectedNodeId={configuringNodeId}
          connectingFrom={state.connectingFrom}
          setConnectingFrom={state.setConnectingFrom}
          onSelectNode={() => {}}
          onMoveNode={state.moveNode}
          onDeleteNode={state.removeNode}
          onAddConnection={state.addConnection}
          onHack={handleHack}
          onConfigure={handleConfigure}
        />

        {configuringNode && (
          <NodeEditor
            node={configuringNode}
            onUpdate={state.updateNode}
            onClose={() => setConfiguringNodeId(null)}
            onAddCm={state.addCountermeasure}
            onUpdateCm={state.updateCountermeasure}
            onRemoveCm={state.removeCountermeasure}
          />
        )}
      </div>

      {/* Hack dialog */}
      {hackingNode && (
        <HackDialog
          node={state.nodes.find(n => n.id === hackingNode.id) || hackingNode}
          onSubmit={handleSubmitRoll}
          onClose={() => setHackingNode(null)}
        />
      )}
    </div>
  );
}