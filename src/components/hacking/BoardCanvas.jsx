import React, { useRef, useState, useCallback } from 'react';
import NodeCard from './NodeCard';
import ConnectionLines from './ConnectionLines';
import { cn } from '@/lib/utils';

export default function BoardCanvas({
  nodes, connections, selectedNodeId,
  connectingFrom, setConnectingFrom,
  onSelectNode, onMoveNode, onDeleteNode,
  onAddConnection, onHack, onConfigure,
}) {
  const boardRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState(null);

  const handleBoardMouseDown = (e) => {
    if (e.target === boardRef.current || e.target.tagName === 'svg') {
      onSelectNode(null);
      if (connectingFrom) setConnectingFrom(null);
    }
  };

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    if (connectingFrom) {
      onAddConnection(connectingFrom, nodeId);
      setConnectingFrom(null);
      return;
    }
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const rect = boardRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
    setDragging(nodeId);
  }, [connectingFrom, nodes, onAddConnection, setConnectingFrom]);

  const handleMouseMove = useCallback((e) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (connectingFrom) setMousePos({ x, y });
    if (dragging) onMoveNode(dragging, x - dragOffset.x, y - dragOffset.y);
  }, [dragging, dragOffset, onMoveNode, connectingFrom]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  return (
    <div
      ref={boardRef}
      className={cn('relative flex-1 board-grid overflow-auto', connectingFrom && 'cursor-crosshair')}
      style={{ minHeight: '600px' }}
      onMouseDown={handleBoardMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <ConnectionLines nodes={nodes} connections={connections} connectingFrom={connectingFrom} mousePos={mousePos} />

      {nodes.map(node => (
        <div
          key={node.id}
          onMouseDown={(e) => { e.preventDefault(); handleNodeMouseDown(e, node.id); }}
          style={{ zIndex: dragging === node.id ? 50 : 10 }}
        >
          <NodeCard
            node={node}
            isSelected={selectedNodeId === node.id}
            isDragging={dragging === node.id}
            onSelect={onSelectNode}
            onStartConnect={setConnectingFrom}
            onDelete={onDeleteNode}
            onHack={onHack}
            onConfigure={onConfigure}
          />
        </div>
      ))}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2">
            <p className="font-mono text-sm text-muted-foreground/60">No nodes yet</p>
            <p className="font-mono text-xs text-muted-foreground/40">Click "Add Node" to build your computer system</p>
          </div>
        </div>
      )}
    </div>
  );
}