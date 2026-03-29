import React, { useState } from 'react';
import { X, Save, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

export default function SaveEncounterDialog({ isOpen, onClose, encounterData, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareCode, setShareCode] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const encounter = {
        title: title.trim(),
        computerName: encounterData.computerName,
        tier: encounterData.tier,
        baseDC: encounterData.baseDC,
        securityModule: encounterData.securityModule,
        upgrades: encounterData.upgrades,
        nodes: encounterData.nodes,
        connections: encounterData.connections,
        isPublic,
        shareCode: code,
      };
      
      const result = await base44.entities.Encounter.create(encounter);
      setShareCode(code);
      setSaved(true);
      if (onSaved) onSaved(result);
    } catch (err) {
      console.error('Failed to save encounter:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyShareCode = () => {
    navigator.clipboard.writeText(shareCode);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-primary/40 rounded-lg shadow-2xl w-96 p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg font-bold text-primary">SAVE ENCOUNTER</h2>
          <button onClick={onClose} className="text-primary/50 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!saved ? (
          <>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Encounter Name</label>
              <Input
                className="mt-2 font-mono text-sm bg-input border-primary/30"
                placeholder="e.g., Corporate Server A"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description (optional)</label>
              <Textarea
                className="mt-2 font-mono text-xs bg-input border-primary/30 h-20 resize-none"
                placeholder="Notes about this encounter..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label className="font-mono text-xs cursor-pointer flex-1">
                Allow others to access this encounter
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleSave}
                disabled={!title.trim() || loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Encounter'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="font-mono text-sm text-accent">✓ Encounter Saved</p>
              <p className="font-mono text-xs text-muted-foreground">Share this code with others to let them play</p>
            </div>

            <div className="bg-secondary/20 border border-secondary/40 rounded p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Share Code</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareCode}
                  className="flex-1 font-mono text-lg font-bold bg-background border border-primary/30 rounded px-3 py-2 text-primary"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyShareCode}
                  className="border-primary/30"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={() => {
                setSaved(false);
                setTitle('');
                setDescription('');
                setShareCode('');
                onClose();
              }}
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}