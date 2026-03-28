import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ComputerSettings from './ComputerSettings';
import ActivityLog from './ActivityLog';
import { Separator } from '@/components/ui/separator';

export default function Sidebar({
  computerName, setComputerName,
  tier, setTier,
  baseDC, setBaseDC,
  log,
}) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col shrink-0">
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
          <ActivityLog log={log} />
        </div>
      </ScrollArea>
    </div>
  );
}