import React from 'react';

// Node card dimensions: width=192 (w-48), approximate height=~90px
const NODE_W = 192;
const NODE_H = 90;

function getEdgePoint(fromNode, toNode) {
  // Center of each node
  const fx = fromNode.x + NODE_W / 2;
  const fy = fromNode.y + NODE_H / 2;
  const tx = toNode.x + NODE_W / 2;
  const ty = toNode.y + NODE_H / 2;

  const dx = tx - fx;
  const dy = ty - fy;
  const angle = Math.atan2(dy, dx);

  // Clamp to the rectangle edge
  const hw = NODE_W / 2;
  const hh = NODE_H / 2;
  const absCos = Math.abs(Math.cos(angle));
  const absSin = Math.abs(Math.sin(angle));

  let ex, ey;
  if (hw * absSin <= hh * absCos) {
    // exits left or right
    ex = fx + (dx > 0 ? hw : -hw);
    ey = fy + (dx > 0 ? hw : -hw) * Math.tan(angle);
  } else {
    // exits top or bottom
    ex = fx + (dy > 0 ? hh : -hh) / Math.tan(angle);
    ey = fy + (dy > 0 ? hh : -hh);
  }

  return { x: ex, y: ey };
}

export default function ConnectionLines({ nodes, connections, connectingFrom, mousePos }) {
  const getNodeById = (id) => nodes.find(n => n.id === id);
  const getCenter = (node) => ({ x: node.x + NODE_W / 2, y: node.y + NODE_H / 2 });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map(conn => {
        const fromNode = getNodeById(conn.from);
        const toNode = getNodeById(conn.to);
        if (!fromNode || !toNode) return null;
        const from = getEdgePoint(fromNode, toNode);
        const to = getEdgePoint(toNode, fromNode);
        return (
          <g key={conn.id}>
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="hsl(175 80% 50% / 0.15)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="hsl(175 80% 50% / 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="8 4"
              filter="url(#glow)"
            />
          </g>
        );
      })}

      {connectingFrom && mousePos && (() => {
        const fromNode = getNodeById(connectingFrom);
        if (!fromNode) return null;
        const center = getCenter(fromNode);
        // For the live drag line just use center since we don't have a target node
        return (
          <line
            x1={center.x} y1={center.y}
            x2={mousePos.x} y2={mousePos.y}
            stroke="hsl(175 80% 50% / 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 3"
          />
        );
      })()}
    </svg>
  );
}