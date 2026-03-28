import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ComputerSettings from './ComputerSettings';
import HackerPanel from './HackerPanel';
import RollPanel from './RollPanel';
import ActivityLog from './ActivityLog';

export default function Sidebar({
  computerName, setComputerName,
  tier, setTier,
  baseDC, setBaseDC,
  hackers, addHacker, updateHacker, removeHacker,
  nodes, rollCheck, log,
}) {
  return (
    <div className="w-72 bg-card border-r border-border flex flex-col shrink-0">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <ComputerSettings
            computerName={computerName}
            setComputerName={setComputerName}
            tier={tier}
            setTier={setTier}
            baseDC={baseDC}
            setBaseDC={setBaseDC}
          />

          <Separator className="bg-border/50" />

          <HackerPanel
            hackers={hackers}
            onAdd={addHacker}
            onUpdate={updateHacker}
            onRemove={removeHacker}
          />

          <Separator className="bg-border/50" />

          <RollPanel
            nodes={nodes}
            hackers={hackers}
            onRoll={rollCheck}
          />

          <Separator className="bg-border/50" />

          <ActivityLog log={log} />
        </div>
      </ScrollArea>
    </div>
  );
}