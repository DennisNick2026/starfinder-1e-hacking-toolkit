import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useHackingState } from '@/lib/hacking-state';
import BoardCanvas from '@/components/hacking/BoardCanvas.jsx';
import NodeEditor from '@/components/hacking/NodeEditor';
import HackDialog from '@/components/hacking/HackDialog';
import BottomToolbar from '@/components/hacking/BottomToolbar';
import BottomLog from '@/components/hacking/BottomLog';
import ComputerSettingsModal from '@/components/hacking/ComputerSettingsModal';
import DataFileModal from '@/components/hacking/DataFileModal';
import SaveEncounterDialog from '@/components/hacking/SaveEncounterDialog';
import LoadEncounterDialog from '@/components/hacking/LoadEncounterDialog';
import ImportEncounterDialog from '@/components/hacking/ImportEncounterDialog';
import ExportConfirmDialog from '@/components/hacking/ExportConfirmDialog';
import CloudPasswordGate from '@/components/hacking/CloudPasswordGate';
import { Cpu, ShieldCheck, Play, SkipForward, SkipBack, RotateCcw, Settings, Pencil, Trash2, Upload, Download, FileJson, Database } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function HackingBoard() {
  const state = useHackingState();
  const [mode, setMode] = useState('create');
  const [rootModeOverride, setRootModeOverride] = useState(false);
  const rootMode = rootModeOverride || state.rootAccessGranted;
  const canToggleRoot = mode === 'create' || state.rootAccessGranted;
  const [hackingNode, setHackingNode] = useState(null);
  const boardCanvasRef = useRef(null);

  const [configuringNodeId, setConfiguringNodeId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [fileNode, setFileNode] = useState(null);
  const [cloudUnlocked, setCloudUnlocked] = useState(false);
  const [cloudVerified, setCloudVerified] = useState(false);
  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [pendingCloudAction, setPendingCloudAction] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then((user) => {
      if (user?.role === 'admin') {setIsAdmin(true);setCloudVerified(true);setCloudUnlocked(true);}
    }).catch(() => {});
  }, []);

  const requestCloudAction = (action) => {
    if (cloudVerified) {
      if (action === 'save') setShowSaveDialog(true);
      if (action === 'load') setShowLoadDialog(true);
    } else {
      setPendingCloudAction(action);
      setShowPasswordGate(true);
    }
  };

  const handlePasswordSuccess = () => {
    setCloudVerified(true);
    setShowPasswordGate(false);
    if (pendingCloudAction === 'save') setShowSaveDialog(true);
    if (pendingCloudAction === 'load') setShowLoadDialog(true);
    setPendingCloudAction(null);
  };
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [sharedEncounter, setSharedEncounter] = useState(null);
  const [currentShareCode, setCurrentShareCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [pendingCmDrop, setPendingCmDrop] = useState(null); // { cmType, nodeId }

  const configuringNode = state.nodes.find((n) => n.id === configuringNodeId) || null;
  const selectedNode = configuringNode || state.nodes.find((n) => n.id === state.selectedNodeId) || null;

  const handleDropNode = (templateKey, x, y, dropType) => {
    // If second arg is undefined and third is a string, it's a CM drop on a node
    if (x === undefined && typeof y === 'string') {
      const nodeId = y;
      if (dropType === 'moduleUpgrade') {
        // Dropping a module upgrade (e.g., Range) onto a control module
        const node = state.nodes.find(n => n.id === nodeId);
        if (node && (node.type === 'control_complex' || node.type === 'control_general')) {
          if (!node.rangeUpgrade) {
            state.updateNode(nodeId, { rangeUpgrade: 'range_1' });
          }
          setConfiguringNodeId(nodeId);
        }
        return;
      }
      if (state.totalCountermeasures >= state.tier) {
        setPendingCmDrop({ cmType: templateKey, nodeId });
      } else {
        state.addCountermeasure(nodeId, templateKey);
        setConfiguringNodeId(nodeId);
      }
      return;
    }
    // Otherwise it's a node type with x,y coordinates
    state.addNode(templateKey, x, y);
  };



  const handleHack = (node, cmId = null) => {
    setConfiguringNodeId(null);
    setHackingNode({ node, cmId });
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
    if (newMode === 'play') setActiveCategory(null);
  };

  // Auto-enable root mode when root access node is resolved
  useEffect(() => {
    if (state.rootAccessGranted) setRootModeOverride(true);
  }, [state.rootAccessGranted]);



  const handleSubmitRoll = (nodeId, total, cmId) => {
    state.submitRoll(nodeId, total, cmId, rootMode);
  };

  const handleLoadEncounter = (encounter) => {
    state.loadEncounter(encounter);
    setSharedEncounter(encounter);
    setMode('play');
    setShowLoadDialog(false);
    setTimeout(() => boardCanvasRef.current?.center?.(), 100);
  };

  const handleNewEncounter = () => {
    state.clearNodes();
    state.resetEncounter();
    setCurrentShareCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    setSharedEncounter(null);
  };

  const handleExportJSON = () => {
    const encounterData = {
      computerName: state.computerName,
      tier: state.tier,
      baseDC: state.baseDC,
      upgrades: state.upgrades,
      nodes: state.nodes,
      connections: state.connections
    };
    const jsonString = JSON.stringify(encounterData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encounter_${state.computerName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (data) => {
    state.loadEncounter(data);
    setSharedEncounter(null);
    setMode('play');
    setShowImportDialog(false);
    setTimeout(() => boardCanvasRef.current?.center?.(), 100);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="h-20 bg-background border-b border-primary/30 flex items-center px-5 gap-4 shrink-0">

        {/* Left: computer info */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <Cpu
            className="w-5 h-5 text-primary shrink-0 cursor-default select-none"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setCloudUnlocked((v) => !v);
              }
            }} />
          
          <span className="font-mono text-sm font-bold text-primary tracking-widest uppercase truncate">
            {state.computerName}
          </span>
          <span className="font-mono text-xs text-primary/60 border border-primary/30 px-2 py-1 rounded">
            TIER {state.tier}
          </span>
          <span className="font-mono text-xs text-primary/60 border border-primary/30 px-2 py-1 rounded">
            DC {state.effectiveBaseDC}
          </span>
          {mode === 'create' &&
          <span className={cn(
            'font-mono text-xs border px-2 py-1 rounded',
            state.totalCountermeasures > state.tier ?
            'text-destructive border-destructive/50 bg-destructive/10' :
            'text-primary/60 border-primary/30'
          )}>
              Countermeasures {state.totalCountermeasures}/{state.tier}
              {state.totalCountermeasures > state.tier &&
            <span className="ml-1.5 text-destructive font-bold">⚠ Over Limit</span>
            }
            </span>
          }
        </div>

        {/* Spacer — pushes center content to true center in play mode */}
        <div className="flex-1" />

        {/* Center: mode-dependent controls */}
        {mode === 'create' ?
        <div className="flex items-center gap-2 shrink-0">
            {cloudUnlocked &&
          <>
                <button
              onClick={handleNewEncounter}
              className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-widest border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded">
              
                  <Pencil className="w-3.5 h-3.5" /> NEW
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-widest border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded">
                      <Database className="w-3.5 h-3.5" /> CLOUD
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-mono">
                    <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Cloud Storage</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => requestCloudAction('save')} className="gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Save to Cloud
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => requestCloudAction('load')} className="gap-2 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> Load from Cloud
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
          }
            <button
            onClick={() => setShowExportConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-widest border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded">
            
              <FileJson className="w-3.5 h-3.5" /> SAVE TO FILE
            </button>
            <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-widest border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded">
            
              <FileJson className="w-3.5 h-3.5" /> LOAD FROM FILE
            </button>

            <div className="flex items-center border border-primary/30 rounded overflow-hidden">
              <button
              className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs tracking-widest transition-colors bg-primary text-primary-foreground"
              onClick={() => handleSwitchMode('create')}
              disabled={sharedEncounter}>
              
                <Pencil className="w-3.5 h-3.5" /> ADMIN
              </button>
              <button
              className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs tracking-widest transition-colors border-l border-primary/30 text-primary/50 hover:text-primary"
              onClick={() => handleSwitchMode('play')}>
              
                <Play className="w-3.5 h-3.5" /> PLAY
              </button>
            </div>

            {canToggleRoot &&
          <button
            onClick={() => setRootModeOverride((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-widest border rounded transition-colors',
              rootModeOverride ?
              'border-chart-3 bg-chart-3/20 text-chart-3' :
              'border-primary/30 text-primary/50 hover:text-primary/80 hover:border-primary/50'
            )}>
            
                <ShieldCheck className="w-3.5 h-3.5" />
                ROOT {rootModeOverride ? 'ON' : 'OFF'}
              </button>
          }
          </div> : (

        /* Play mode: fully centered controls */
        <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center border border-primary/30 rounded overflow-hidden">
              <button
              className="flex items-center gap-1.5 px-5 py-2.5 font-mono text-sm tracking-widest transition-colors text-primary/50 hover:text-primary"
              onClick={(e) => {
                if (sharedEncounter && !(e.ctrlKey || e.metaKey)) return;
                if (e.ctrlKey || e.metaKey) setSharedEncounter(null);
                handleSwitchMode('create');
              }}>
              
                <Pencil className="w-4 h-4" /> ADMIN
              </button>
              <button
              className="flex items-center gap-1.5 px-5 py-2.5 font-mono text-sm tracking-widest transition-colors border-l border-primary/30 bg-primary text-primary-foreground"
              onClick={() => handleSwitchMode('play')}>
              
                <Play className="w-4 h-4" /> PLAY
              </button>
            </div>

            {canToggleRoot &&
          <button
            onClick={() => setRootModeOverride((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 font-mono text-sm tracking-widest border rounded transition-colors',
              rootModeOverride ?
              'border-chart-3 bg-chart-3/20 text-chart-3' :
              'border-primary/30 text-primary/50 hover:text-primary/80 hover:border-primary/50'
            )}>
            
                <ShieldCheck className="w-4 h-4" />
                ROOT {rootModeOverride ? 'ON' : 'OFF'}
              </button>
          }

            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-primary/50 tracking-widest">PHASE</span>
              <span className="font-mono text-xl text-primary font-bold w-9 text-center">{state.phase}</span>
              <button
              onClick={() => state.setPhase((p) => Math.max(1, p - 1))}
              disabled={state.phase <= 1}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed">
              
                <SkipBack className="w-4 h-4" /> PREV
              </button>
              <button
              onClick={state.advancePhase}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded">
              
                <SkipForward className="w-4 h-4" /> NEXT
              </button>
              <button
              onClick={state.resetEncounter}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive transition-colors rounded">
              
                <RotateCcw className="w-4 h-4" /> RESET
              </button>
              <button
              onClick={state.clearNodes}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive transition-colors rounded">
              
                <Trash2 className="w-4 h-4" /> CLEAR
              </button>
              <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-primary/30 text-primary/50 hover:text-primary hover:border-primary rounded transition-colors"
              title="Computer settings">
              
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>)
        }

        {/* Spacer — balances left side so center is truly centered in play mode */}
        <div className="flex-1" />

        {/* Right: phase controls (admin mode only) */}
        {mode === 'create' &&
        <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-primary/50 tracking-widest">Action
</span>
            <span className="font-mono text-sm text-primary font-bold w-7 text-center">{state.phase}</span>
            <button onClick={() => state.setPhase((p) => Math.max(1, p - 1))}
          disabled={state.phase <= 1}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed">
            
              <SkipBack className="w-3.5 h-3.5" /> PREV
            </button>
            <button
            onClick={state.advancePhase}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-primary/30 text-primary/70 hover:text-primary hover:border-primary transition-colors rounded">
            
              <SkipForward className="w-3.5 h-3.5" /> NEXT
            </button>
            <button
            onClick={state.resetEncounter}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive transition-colors rounded">
            
              <RotateCcw className="w-3.5 h-3.5" /> RESET
            </button>
            <button
            onClick={state.clearNodes}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive transition-colors rounded">
            
              <Trash2 className="w-3.5 h-3.5" /> CLEAR
            </button>
            <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-primary/30 text-primary/50 hover:text-primary hover:border-primary rounded transition-colors"
            title="Computer settings">
            
              <Settings className="w-4 h-4" />
            </button>
          </div>
        }
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <BoardCanvas
            ref={boardCanvasRef}
            nodes={state.nodes}
            connections={state.connections}
            selectedNodeId={configuringNodeId || state.selectedNodeId}
            connectingFrom={state.connectingFrom}
            setConnectingFrom={state.setConnectingFrom}
            onSelectNode={(id) => {
              state.setSelectedNodeId(id);
              if (!id) {
                setConfiguringNodeId(null);
                setActiveCategory(null);
              }
            }}
            onMoveNode={state.moveNode}
            onDeleteNode={mode === 'create' ? state.removeNode : () => {}}
            onAddConnection={state.addConnection}
            onDeleteConnection={mode === 'create' ? state.removeConnection : null}
            onHack={(node, cmId) => handleHack(node, cmId)}
            onUnhack={state.unhackNode}
            onConfigure={handleConfigure}
            onDropNode={handleDropNode}

            mode={mode}
            onUnresolveCm={mode === 'play' ? state.unresolveCountermeasure : null}
            onResolveCm={mode === 'play' ? (nodeId, cmId) => state.updateCountermeasure(nodeId, cmId, { resolved: true }) : null}
            onOpenFile={setFileNode}
            onToggleDirectoryLocked={state.toggleDirectoryLocked}
            effectiveBaseDC={state.effectiveBaseDC}
            getNodeDC={state.getNodeDC}
            rootMode={rootMode}
            onToggleRequiresHack={state.toggleRequiresHack} />
          

          <BottomLog log={state.log} selectedNode={selectedNode} activeCategory={activeCategory} getNodeDC={state.getNodeDC} effectiveBaseDC={state.effectiveBaseDC} />
          <BottomToolbar mode={mode} rootMode={rootMode} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>

        {mode === 'create' && configuringNode &&
        <NodeEditor
          node={configuringNode}
          onUpdate={state.updateNode}
          onClose={() => setConfiguringNodeId(null)}
          onAddCm={state.addCountermeasure}
          onUpdateCm={state.updateCountermeasure}
          onRemoveCm={state.removeCountermeasure}
          totalCountermeasures={state.totalCountermeasures}
          tier={state.tier}
          getNodeDC={state.getNodeDC}
          effectiveBaseDC={state.effectiveBaseDC} />

        }
      </div>

      {fileNode &&
      <DataFileModal
        key={fileNode.id}
        node={state.nodes.find((n) => n.id === fileNode.id) || fileNode}
        canEdit={mode === 'create'}
        onClose={() => setFileNode(null)}
        onSave={(nodeId, data) => state.updateNode(nodeId, data)} />

      }

      {hackingNode &&
      <HackDialog
        key={hackingNode.node.id + (hackingNode.cmId || '') + (rootMode ? '-root' : '')}
        node={state.nodes.find((n) => n.id === hackingNode.node.id) || hackingNode.node}
        onSubmit={handleSubmitRoll}
        onUnhack={(nodeId) => {state.unhackNode(nodeId);}}
        onClose={() => setHackingNode(null)}
        mode={mode}
        rootMode={rootMode}
        initialTarget={hackingNode.cmId}
        effectiveBaseDC={state.effectiveBaseDC}
        getNodeDC={state.getNodeDC} />

      }

      <SaveEncounterDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        shareCode={currentShareCode}
        encounterData={{
          computerName: state.computerName,
          tier: state.tier,
          baseDC: state.baseDC,
          upgrades: state.upgrades,
          nodes: state.nodes,
          connections: state.connections
        }} />
      

      <LoadEncounterDialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        onLoad={handleLoadEncounter} />
      

      <ImportEncounterDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportJSON} />
      

      <ExportConfirmDialog
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        onConfirm={handleExportJSON} />
      

      {/* CM drop override confirmation */}
      {pendingCmDrop &&
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPendingCmDrop(null)}>
          <div className="bg-card border border-destructive/50 rounded-xl p-6 w-80 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="text-destructive text-lg">⚠</span>
              <p className="font-mono text-xs text-destructive leading-relaxed">
                Already at countermeasure limit ({state.totalCountermeasures}/{state.tier} for Tier {state.tier}). Override as admin and add anyway?
              </p>
            </div>
            <div className="flex gap-2">
              <button
              className="flex-1 py-2 rounded font-mono text-xs bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
              onClick={() => {
                state.addCountermeasure(pendingCmDrop.nodeId, pendingCmDrop.cmType);
                setConfiguringNodeId(pendingCmDrop.nodeId);
                setPendingCmDrop(null);
              }}>
              
                Override &amp; Add
              </button>
              <button
              className="flex-1 py-2 rounded font-mono text-xs border border-border text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setPendingCmDrop(null)}>
              
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <CloudPasswordGate
        isOpen={showPasswordGate}
        onSuccess={handlePasswordSuccess}
        onClose={() => {setShowPasswordGate(false);setPendingCloudAction(null);}} />
      

      <ComputerSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        computerName={state.computerName}
        setComputerName={state.setComputerName}
        tier={state.tier}
        setTier={state.setTier}
        baseDC={state.baseDC}
        setBaseDC={state.setBaseDC}
        upgrades={state.upgrades}
        setUpgrades={state.setUpgrades}
        nodes={state.nodes} />
      
    </div>);

}