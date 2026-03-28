import React from 'react';

export default function ConnectionLines({ nodes, connections, connectingFrom, mousePos }) {
  const getNodeCenter = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 88, y: node.y + 50 };
  };

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
        const from = getNodeCenter(conn.from);
        const to = getNodeCenter(conn.to);
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
        const from = getNodeCenter(connectingFrom);
        return (
          <line
            x1={from.x} y1={from.y}
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