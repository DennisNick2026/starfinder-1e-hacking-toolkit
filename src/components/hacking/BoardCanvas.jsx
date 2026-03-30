import React, { useRef, useState, useCallback, useMemo, useEffect, useImperativeHandle } from 'react';
import NodeCard from './NodeCard';
import ConnectionLines from './ConnectionLines';
import { cn } from '@/lib/utils';
import { Maximize2, Home } from 'lucide-react';

const NODE_W = 200;
const NODE_H = 120;
const COMPACT_NODE_W = 128;
const COMPACT_NODE_H = 128;

const BoardCanvas = React.forwardRef(function BoardCanvas({
  nodes, connections, selectedNodeId,
  connectingFrom, setConnectingFrom,
  onSelectNode, onMoveNode, onDeleteNode,
  onAddConnection, onDeleteConnection, onHack, onUnhack, onConfigure, onDropNode,
  mode = 'create', onUnresolveCm = null, onResolveCm = null, onOpenFile = null, onToggleDirectoryLocked = null,
  effectiveBaseDC = 25, getNodeDC = null,
}, ref) {
  const outerRef = useRef(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState(null);

  // Pan/zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = outerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.2), 3);
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
      y: mouseY - (mouseY - prev.y) * (newZoom / zoom),
    }));
    setZoom(newZoom);
  }, [zoom]);

  // Convert screen coords → canvas coords
  const toCanvas = useCallback((screenX, screenY) => {
    const rect = outerRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Fit all nodes to screen
  const handleFitAll = useCallback(() => {
    if (nodes.length === 0) return;
    const rect = outerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const padding = 80;
    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + NODE_W));
    const maxY = Math.max(...nodes.map(n => n.y + NODE_H));
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const newZoom = Math.min(
      (rect.width - padding * 2) / contentW,
      (rect.height - padding * 2) / contentH,
      1.5,
      3
    );
    const clamped = Math.max(newZoom, 0.2);
    setPan({
      x: (rect.width - contentW * clamped) / 2 - minX * clamped,
      y: (rect.height - contentH * clamped) / 2 - minY * clamped,
    });
    setZoom(clamped);
  }, [nodes]);

  // Center on entry node
  const handleCenter = useCallback(() => {
    const entry = nodes.find(n => n.id === 'entry');
    if (!entry) return;
    const rect = outerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const w = COMPACT_NODE_W / 2;
    const h = COMPACT_NODE_H / 2;
    setPan({
      x: rect.width / 2 - (entry.x + w) * zoom,
      y: rect.height / 2 - (entry.y + h) * zoom,
    });
  }, [nodes, zoom]);

  // Expose fitAll and center via ref for parent component
  React.useImperativeHandle(ref, () => ({
    fitAll: handleFitAll,
    center: handleCenter,
  }), [handleFitAll, handleCenter]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleBoardMouseDown = (e) => {
    if (draggingNode) return;

    const tag = e.target.tagName.toLowerCase();
    const isCanvasBg = tag === 'div'
      ? (e.target === outerRef.current || e.target.getAttribute('data-canvas') === 'true')
      : ['svg', 'line', 'g', 'defs', 'filter', 'fegaussianblur', 'femerge', 'femergenode'].includes(tag);

    if (connectingFrom) {
      setConnectingFrom(null);
      return;
    }

    if (isCanvasBg) {
      onSelectNode(null);
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();

    if (connectingFrom) {
      onAddConnection(connectingFrom, nodeId);
      setConnectingFrom(null);
      return;
    }
    // Entry and root access nodes cannot be moved
    if (nodeId === 'entry' || nodeId === 'root_access') return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const canvas = toCanvas(e.clientX, e.clientY);
    setDragOffset({ x: canvas.x - node.x, y: canvas.y - node.y });
    setDraggingNode(nodeId);
  }, [connectingFrom, nodes, onAddConnection, setConnectingFrom, toCanvas]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning && panStart.current) {
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }
    if (connectingFrom) {
      const rect = outerRef.current?.getBoundingClientRect();
      if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (draggingNode) {
      const canvas = toCanvas(e.clientX, e.clientY);
      onMoveNode(draggingNode, canvas.x - dragOffset.x, canvas.y - dragOffset.y);
    }
  }, [isPanning, draggingNode, dragOffset, onMoveNode, connectingFrom, toCanvas]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nodeType = e.dataTransfer.getData('nodeType');
    const cmType = e.dataTransfer.getData('cmType');
    
    if (cmType) {
      // Dropping a countermeasure onto the canvas
      const canvas = toCanvas(e.clientX, e.clientY);
      // Find which node was dropped on
      const dropX = canvas.x;
      const dropY = canvas.y;
      const targetNode = nodes.find(n => {
        return dropX >= n.x && dropX <= n.x + NODE_W &&
               dropY >= n.y && dropY <= n.y + NODE_H;
      });
      if (targetNode && onDropNode) {
        onDropNode(cmType, targetNode.id);
      }
      return;
    }
    
    if (!nodeType || !onDropNode) return;
    const canvas = toCanvas(e.clientX, e.clientY);
    onDropNode(nodeType, canvas.x - NODE_W / 2, canvas.y - 40);
  };

  // Compute which nodes are hidden (play mode)
  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set();

    // Entry node hides connected nodes until resolved
    const entryNode = nodes.find(n => n.id === 'entry');
    if (entryNode && !entryNode.resolved) {
      connections.forEach(c => {
        if (c.from === 'entry' && c.to !== 'root_access') hidden.add(c.to);
        if (c.to === 'entry' && c.from !== 'root_access') hidden.add(c.from);
      });
    }

    const lockedDirs = nodes.filter(n => n.type === 'directory' && n.locked);
    lockedDirs.forEach(dir => {
      connections.forEach(c => {
        if (c.from === dir.id && c.to !== 'entry' && c.to !== 'root_access') hidden.add(c.to);
        if (c.to === dir.id && c.from !== 'entry' && c.from !== 'root_access') hidden.add(c.from);
      });
    });
    const firewalled = nodes.filter(n =>
      (n.countermeasures || []).some(cm => cm.type === 'firewall' && !cm.resolved)
    );
    firewalled.forEach(node => {
      connections.forEach(c => {
        if (c.from === node.id && c.to !== 'entry' && c.to !== 'root_access') hidden.add(c.to);
        if (c.to === node.id && c.from !== 'entry' && c.from !== 'root_access') hidden.add(c.from);
      });
    });

    // Fake shell: hide fake nodes once detected; hide their real counterparts until then
    nodes.forEach(n => {
      // Only hide a fake node if it has a real replacement lined up
      if (n.fake_shell_hidden && n.realNodeId) hidden.add(n.id);
      if (n.real_hidden) hidden.add(n.id);
    });

    return hidden;
  }, [nodes, connections]);

  const visibleConnections = useMemo(() => {
    if (mode !== 'play') return connections;
    return connections.filter(c => !hiddenNodeIds.has(c.from) && !hiddenNodeIds.has(c.to));
  }, [connections, hiddenNodeIds, mode]);

  // Mouse position in canvas space for the live drag line
  const canvasMousePos = mousePos ? {
    x: (mousePos.x - pan.x) / zoom,
    y: (mousePos.y - pan.y) / zoom,
  } : null;

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div
      ref={outerRef}
      data-canvas="true"
      className={cn(
        'relative flex-1 board-grid overflow-hidden',
        connectingFrom ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
      )}
      onMouseDown={handleBoardMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
    >
      {/* Infinite canvas transform container */}
      <div
        data-canvas="true"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          pointerEvents: 'none',
        }}
      >
        {/* SVG must be big enough to cover all nodes */}
        <svg
          style={{
            position: 'absolute',
            overflow: 'visible',
            left: 0,
            top: 0,
            width: 10000,
            height: 10000,
            zIndex: 0,
            pointerEvents: 'auto',
          }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {visibleConnections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            // Get node dimensions (compact nodes are smaller)
            const fromW = (fromNode.isEntry || fromNode.isRootAccess) ? COMPACT_NODE_W : NODE_W;
            const fromH = (fromNode.isEntry || fromNode.isRootAccess) ? COMPACT_NODE_H : NODE_H;
            const toW = (toNode.isEntry || toNode.isRootAccess) ? COMPACT_NODE_W : NODE_W;
            const toH = (toNode.isEntry || toNode.isRootAccess) ? COMPACT_NODE_H : NODE_H;

            // Calculate edge-to-edge connection points
            const fromCenterX = fromNode.x + fromW / 2;
            const fromCenterY = fromNode.y + fromH / 2;
            const toCenterX = toNode.x + toW / 2;
            const toCenterY = toNode.y + toH / 2;

            const handleConnContextMenu = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (mode === 'create' && conn.id !== 'conn_root') {
                onDeleteConnection?.(conn.id);
              }
            };
            
            // Direction vector
            const dx = toCenterX - fromCenterX;
            const dy = toCenterY - fromCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const unitX = dist > 0 ? dx / dist : 0;
            const unitY = dist > 0 ? dy / dist : 0;
            
            // Find intersection with from node boundary
            const halfW = fromW / 2;
            const halfH = fromH / 2;
            let tFromX, tFromY;
            if (Math.abs(unitX) > Math.abs(unitY)) {
              // Hit left or right edge
              tFromX = unitX > 0 ? halfW : -halfW;
              tFromY = unitX !== 0 ? (tFromX * unitY) / unitX : 0;
            } else {
              // Hit top or bottom edge
              tFromY = unitY > 0 ? halfH : -halfH;
              tFromX = unitY !== 0 ? (tFromY * unitX) / unitY : 0;
            }
            const fx = fromCenterX + tFromX;
            const fy = fromCenterY + tFromY;
            
            // Find intersection with to node boundary
            const toHalfW = toW / 2;
            const toHalfH = toH / 2;
            let tToX, tToY;
            if (Math.abs(unitX) > Math.abs(unitY)) {
              // Hit left or right edge
              tToX = unitX > 0 ? -toHalfW : toHalfW;
              tToY = unitX !== 0 ? (tToX * unitY) / unitX : 0;
            } else {
              // Hit top or bottom edge
              tToY = unitY > 0 ? -toHalfH : toHalfH;
              tToX = unitY !== 0 ? (tToY * unitX) / unitY : 0;
            }
            const tx = toCenterX + tToX;
            const ty = toCenterY + tToY;
            
            return (
              <g key={conn.id} onContextMenu={handleConnContextMenu} style={{ cursor: mode === 'create' && conn.id !== 'conn_root' ? 'pointer' : 'default' }}>
                <line x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke="hsl(175 80% 50% / 0.15)" strokeWidth="4" strokeLinecap="round" />
                <line x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke="hsl(175 80% 50% / 0.5)" strokeWidth="1.5" strokeLinecap="round"
                  strokeDasharray="8 4" filter="url(#glow)" style={{ pointerEvents: 'auto' }} />
              </g>
            );
          })}
          {connectingFrom && canvasMousePos && (() => {
            const fromNode = nodes.find(n => n.id === connectingFrom);
            if (!fromNode) return null;
            
            const fromW = (fromNode.isEntry || fromNode.isRootAccess) ? COMPACT_NODE_W : NODE_W;
            const fromH = (fromNode.isEntry || fromNode.isRootAccess) ? COMPACT_NODE_H : NODE_H;
            
            const fromCenterX = fromNode.x + fromW / 2;
            const fromCenterY = fromNode.y + fromH / 2;
            const dx = canvasMousePos.x - fromCenterX;
            const dy = canvasMousePos.y - fromCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const unitX = dist > 0 ? dx / dist : 0;
            const unitY = dist > 0 ? dy / dist : 0;
            
            const halfW = fromW / 2;
            const halfH = fromH / 2;
            let tFromX = halfW, tFromY = halfH;
            if (Math.abs(unitX) > Math.abs(unitY)) {
              tFromX = unitX > 0 ? halfW : -halfW;
              tFromY = (tFromX * unitY) / unitX;
            } else {
              tFromY = unitY > 0 ? halfH : -halfH;
              tFromX = (tFromY * unitX) / unitY;
            }
            const cx = fromCenterX + tFromX;
            const cy = fromCenterY + tFromY;
            
            return (
              <line x1={cx} y1={cy} x2={canvasMousePos.x} y2={canvasMousePos.y}
                stroke="hsl(175 80% 50% / 0.6)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" />
            );
          })()}
        </svg>

        {nodes.map(node => {
          const nodeW = (node.isEntry || node.isRootAccess) ? COMPACT_NODE_W : NODE_W;
          const nodeH = (node.isEntry || node.isRootAccess) ? COMPACT_NODE_H : NODE_H;
          
          return (
          <div
            key={node.id}
            onMouseDown={(e) => { 
              // Don't start drag if clicking buttons/inputs
              if (!e.target.closest('button') && !e.target.closest('input')) {
                handleNodeMouseDown(e, node.id);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const cmType = e.dataTransfer.getData('cmType');
              if (cmType && onDropNode) {
                // Pass nodeId as second param so it's recognized as a node target
                onDropNode(cmType, undefined, node.id);
              }
            }}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              zIndex: draggingNode === node.id ? 50 : 10,
              pointerEvents: 'auto',
            }}
          >
            <NodeCard
              node={node}
              isSelected={selectedNodeId === node.id}
              isDragging={draggingNode === node.id}
              onSelect={onSelectNode}
              onStartConnect={setConnectingFrom}
              onDelete={onDeleteNode}
              onHack={onHack}
              onUnhack={onUnhack}
              onConfigure={onConfigure}
              onOpenFile={onOpenFile}
              mode={mode}
              hiddenByDirectory={hiddenNodeIds.has(node.id)}
              onUnresolveCm={onUnresolveCm}
              onResolveCm={onResolveCm}
              onToggleDirectoryLocked={onToggleDirectoryLocked}
              effectiveBaseDC={effectiveBaseDC}
              getNodeDC={getNodeDC}
              connectingFrom={connectingFrom}
            />
          </div>
        );
        })}
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2">
            <p className="font-mono text-sm text-muted-foreground/60">No nodes yet</p>
            <p className="font-mono text-xs text-muted-foreground/40">Drag nodes from the toolbar below</p>
          </div>
        </div>
      )}

      {/* Overlay controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={handleFitAll}
          className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-widest bg-card/90 border border-primary/30 text-primary/70 hover:text-primary hover:border-primary rounded transition-colors backdrop-blur-sm"
          title="Fit all nodes to screen"
        >
          <Maximize2 className="w-3 h-3" /> FIT ALL
        </button>
        <button
          onClick={handleCenter}
          className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-widest bg-card/90 border border-primary/30 text-primary/70 hover:text-primary hover:border-primary rounded transition-colors backdrop-blur-sm"
          title="Center on entry node"
        >
          <Home className="w-3 h-3" /> ENTRY
        </button>
        <div className="flex items-center justify-center px-3 py-1.5 font-mono text-[10px] tracking-widest bg-card/90 border border-primary/30 text-primary/40 rounded backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
});

export default BoardCanvas;