import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown, ChevronRight } from 'lucide-react';

export default function ComputerSettings({
  computerName, setComputerName,
  tier, setTier,
  baseDC, setBaseDC,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <button
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider">Computer Settings</span>
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="space-y-3 pl-5">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">System Name</Label>
            <Input
              className="font-mono text-xs mt-1 bg-muted border-border"
              value={computerName}
              onChange={(e) => setComputerName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tier / CR</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={tier}
                onChange={(e) => setTier(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Base DC</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={baseDC}
                onChange={(e) => setBaseDC(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            Formula: 13 + (4 × tier) = {13 + 4 * tier}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-[10px]"
            onClick={() => setBaseDC(13 + 4 * tier)}
          >
            Auto-calculate DC from Tier
          </Button>
        </div>
      )}
    </div>
  );
}