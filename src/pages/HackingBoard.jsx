import React, { useState } from 'react';
import { useHackingState } from '@/lib/hacking-state';
import BoardCanvas from '@/components/hacking/BoardCanvas';
import NodeEditor from '@/components/hacking/NodeEditor';
import Sidebar from '@/components/hacking/Sidebar';
import AddNodeMenu from '@/components/hacking/AddNodeMenu';
import PhaseTracker from '@/components/hacking/PhaseTracker';
import { Cpu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HackingBoard() {
  const state = useHackingState();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleAddNode = (templateKey) => {
    // Place new node near center of visible area with slight randomization
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    state.addNode(templateKey, x, y);
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

        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
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
            hackers={state.hackers}
            addHacker={state.addHacker}
            updateHacker={state.updateHacker}
            removeHacker={state.removeHacker}
            nodes={state.nodes}
            rollCheck={state.rollCheck}
            log={state.log}
          />
        )}

        {/* Board */}
        <BoardCanvas
          nodes={state.nodes}
          connections={state.connections}
          selectedNodeId={state.selectedNodeId}
          connectingFrom={state.connectingFrom}
          setConnectingFrom={state.setConnectingFrom}
          onSelectNode={state.setSelectedNodeId}
          onMoveNode={state.moveNode}
          onDeleteNode={state.removeNode}
          onAddConnection={state.addConnection}
        />

        {/* Editor panel */}
        {state.selectedNode && (
          <NodeEditor
            node={state.selectedNode}
            onUpdate={state.updateNode}
            onClose={() => state.setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}