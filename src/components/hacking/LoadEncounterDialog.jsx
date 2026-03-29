import React, { useState } from 'react';
import { X, Search, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function LoadEncounterDialog({ isOpen, onClose, onLoad }) {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const encounters = await base44.entities.Encounter.filter(
        { shareCode: searchCode.trim().toUpperCase() },
        undefined,
        1
      );
      
      if (encounters.length === 0) {
        setError('No encounter found with that code');
        return;
      }
      
      setResults(encounters[0]);
    } catch (err) {
      setError('Failed to load encounter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = () => {
    if (results && onLoad) {
      onLoad(results);
      setSearchCode('');
      setResults(null);
    }
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
          <h2 className="font-mono text-lg font-bold text-primary">LOAD ENCOUNTER</h2>
          <button onClick={onClose} className="text-primary/50 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!results ? (
          <>
            <p className="font-mono text-xs text-muted-foreground">Enter a share code to load an encounter</p>
            
            <div className="space-y-2">
              <Input
                className="font-mono text-sm bg-input border-primary/30 uppercase"
                placeholder="e.g., ABC123"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              
              {error && (
                <p className="font-mono text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleSearch}
                disabled={!searchCode.trim() || loading}
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/30 rounded p-4">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">Encounter Found</p>
              <p className="font-mono text-lg font-bold text-primary mb-2">{results.title}</p>
              <p className="font-mono text-xs text-muted-foreground mb-3">
                {results.computerName} • Tier {results.tier} • DC {results.baseDC}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {results.nodes?.length || 0} nodes • {results.connections?.length || 0} connections
              </p>
            </div>

            <p className="font-mono text-[10px] text-muted-foreground italic">
              You will enter play mode. To edit, ask the creator for the original file.
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setResults(null);
                  setSearchCode('');
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground"
                onClick={handleLoad}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Playing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}