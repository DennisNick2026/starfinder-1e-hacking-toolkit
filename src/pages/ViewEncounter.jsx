import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useHackingState } from '@/lib/hacking-state';
import BoardCanvas from '@/components/hacking/BoardCanvas.jsx';
import { Cpu, Eye, Wifi, WifiOff, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ViewEncounter() {
  const { id } = useParams();
  const state = useHackingState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const boardCanvasRef = useRef(null);

  // Initial load
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    base44.entities.Encounter.get(id)
      .then(enc => {
        if (cancelled) return;
        state.loadEncounter(enc);
        setLoading(false);
        setConnected(true);
        setTimeout(() => boardCanvasRef.current?.fitAll?.(), 200);
      })
      .catch(err => {
        console.error('Failed to load encounter:', err);
        if (cancelled) return;
        setError('Encounter not found or is not public.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  // Real-time subscription
  useEffect(() => {
    if (!id) return;
    const unsubscribe = base44.entities.Encounter.subscribe((event) => {
      if (event.id !== id) return;
      if (event.type === 'update') {
        state.loadEncounter(event.data);
        setConnected(true);
      } else if (event.type === 'delete') {
        setError('The host ended the session and deleted this encounter.');
        setConnected(false);
      }
    });
    return () => {
      unsubscribe();
      setConnected(false);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-primary/60 tracking-widest">CONNECTING TO LIVE ENCOUNTER...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-md px-6">
          <WifiOff className="w-10 h-10 text-destructive mx-auto" />
          <p className="font-mono text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Spectator header */}
      <header className="h-16 bg-background border-b border-primary/30 flex items-center px-5 gap-3 shrink-0">
        <Eye className="w-5 h-5 text-primary shrink-0" />
        <span className="font-mono text-[10px] tracking-widest text-primary/50 uppercase hidden sm:inline">Spectating</span>
        <Cpu className="w-4 h-4 text-primary shrink-0" />
        <span className="font-mono text-sm font-bold text-primary tracking-widest uppercase truncate">
          {state.computerName}
        </span>
        <span className="font-mono text-xs text-primary/60 border border-primary/30 px-2 py-1 rounded hidden sm:inline">
          TIER {state.tier}
        </span>
        <span className="font-mono text-xs text-primary/60 border border-primary/30 px-2 py-1 rounded hidden sm:inline">
          DC {state.effectiveBaseDC}
        </span>
        <div className="flex-1" />
        <span className="font-mono text-xs text-primary/50 tracking-widest hidden sm:inline">PHASE</span>
        <span className="font-mono text-lg text-primary font-bold w-7 text-center">{state.phase}</span>
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] tracking-widest border',
          connected ? 'border-chart-1/50 text-chart-1 bg-chart-1/10' : 'border-muted text-muted-foreground'
        )}>
          {connected ? <><Radio className="w-3 h-3 animate-pulse" /> LIVE</> : <><WifiOff className="w-3 h-3" /> OFFLINE</>}
        </div>
      </header>

      {/* Read-only board */}
      <BoardCanvas
        ref={boardCanvasRef}
        nodes={state.nodes}
        connections={state.connections}
        selectedNodeId={null}
        connectingFrom={null}
        setConnectingFrom={() => {}}
        onSelectNode={() => {}}
        onMoveNode={() => {}}
        onDeleteNode={() => {}}
        onAddConnection={() => {}}
        onDeleteConnection={null}
        onHack={() => {}}
        onUnhack={() => {}}
        onConfigure={() => {}}
        onDropNode={() => {}}
        mode="play"
        onUnresolveCm={null}
        onResolveCm={null}
        onOpenFile={() => {}}
        onToggleDirectoryLocked={() => {}}
        effectiveBaseDC={state.effectiveBaseDC}
        getNodeDC={state.getNodeDC}
      />
    </div>
  );
}