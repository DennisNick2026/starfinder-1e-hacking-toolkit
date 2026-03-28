import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

export default function NodeEditor({ node, onUpdate, onClose }) {
  if (!node) return null;

  const handleChange = (field, value) => {
    onUpdate(node.id, { [field]: value });
  };

  return (
    <div className="w-72 bg-card border-l border-border p-4 overflow-y-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold text-primary">Edit Node</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Name</Label>
          <Input
            className="font-mono text-xs mt-1 bg-muted border-border"
            value={node.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div>
          <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description</Label>
          <Textarea
            className="font-mono text-xs mt-1 bg-muted border-border h-16 resize-none"
            value={node.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div>
          <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">DC</Label>
          <Input
            type="number"
            className="font-mono text-xs mt-1 bg-muted border-border w-24"
            value={node.dc}
            onChange={(e) => handleChange('dc', parseInt(e.target.value) || 0)}
          />
        </div>

        {node.resolve_method !== undefined && (
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Resolve Method</Label>
            <Select value={node.resolve_method} onValueChange={(v) => handleChange('resolve_method', v)}>
              <SelectTrigger className="font-mono text-xs mt-1 bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hack">Hack</SelectItem>
                <SelectItem value="Deceive">Deceive</SelectItem>
                <SelectItem value="Process">Process</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {node.successes_required !== undefined && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Successes Req</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={node.successes_required}
                onChange={(e) => handleChange('successes_required', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Current</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={node.successes_current}
                onChange={(e) => handleChange('successes_current', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {node.failures_max !== undefined && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Max Failures</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={node.failures_max}
                onChange={(e) => handleChange('failures_max', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Current</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={node.failures_current || 0}
                onChange={(e) => handleChange('failures_current', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {node.countdown !== undefined && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Countdown</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={node.countdown}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  handleChange('countdown', v);
                  handleChange('countdown_current', v);
                }}
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Remaining</Label>
              <Input
                type="number"
                className="font-mono text-xs mt-1 bg-muted border-border"
                value={node.countdown_current}
                onChange={(e) => handleChange('countdown_current', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {node.damage_per_phase !== undefined && (
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">CP Damage / Phase</Label>
            <Input
              type="number"
              className="font-mono text-xs mt-1 bg-muted border-border w-24"
              value={node.damage_per_phase}
              onChange={(e) => handleChange('damage_per_phase', parseInt(e.target.value) || 0)}
            />
          </div>
        )}

        {node.damage_on_trigger !== undefined && (
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">CP Damage on Trigger</Label>
            <Input
              type="number"
              className="font-mono text-xs mt-1 bg-muted border-border w-24"
              value={node.damage_on_trigger}
              onChange={(e) => handleChange('damage_on_trigger', parseInt(e.target.value) || 0)}
            />
          </div>
        )}

        {node.dc_reduction !== undefined && (
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">DC Reduction</Label>
            <Input
              type="number"
              className="font-mono text-xs mt-1 bg-muted border-border w-24"
              value={node.dc_reduction}
              onChange={(e) => handleChange('dc_reduction', parseInt(e.target.value) || 0)}
            />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-xs flex-1"
            onClick={() => handleChange('resolved', !node.resolved)}
          >
            {node.resolved ? 'Unresolve' : 'Mark Resolved'}
          </Button>
        </div>
      </div>
    </div>
  );
}