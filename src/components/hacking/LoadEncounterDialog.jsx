import React, { useState, useEffect } from 'react';
import { X, Search, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function LoadEncounterDialog({ isOpen, onClose, onLoad }) {
  const [searchMode, setSearchMode] = useState('code'); // 'code' or 'name'
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [myEncounters, setMyEncounters] = useState([]);
  const [filteredEncounters, setFilteredEncounters] = useState([]);

  // Load user's encounters on open
  useEffect(() => {
    if (!isOpen) return;
    const loadEncounters = async () => {
      try {
        const encounters = await base44.entities.Encounter.list();
        setMyEncounters(encounters);
      } catch (err) {
        console.error('Failed to load encounters:', err);
      }
    };
    loadEncounters();
  }, [isOpen]);

  // Filter encounters by search name
  useEffect(() => {
    if (searchMode === 'name') {
      const filtered = myEncounters.filter(e =>
        e.title.toLowerCase().includes(searchName.toLowerCase()) ||
        e.computerName.toLowerCase().includes(searchName.toLowerCase())
      );
      setFilteredEncounters(filtered);
    }
  }, [searchName, myEncounters, searchMode]);

  if (!isOpen) return null;

  const handleSearchByCode = async () => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const encounters = await base44.entities.Encounter.list();
      const publicEncounters = encounters.filter(e => e.isPublic);
      const encounter = publicEncounters.find(e => 
        e.shareCode && e.shareCode.toUpperCase() === searchCode.trim().toUpperCase()
      );
      
      if (!encounter) {
        setError('No encounter found with that code');
        return;
      }
      
      setResults(encounter);
    } catch (err) {
      setError('Failed to load encounter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectByName = (encounter) => {
    setResults(encounter);
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
            {/* Mode toggle */}
            <div className="flex gap-2 border-b border-primary/20 pb-3">
              <button
                onClick={() => {
                  setSearchMode('code');
                  setError('');
                  setSearchName('');
                }}
                className={cn(
                  'flex-1 py-2 font-mono text-xs tracking-wider rounded transition-colors',
                  searchMode === 'code'
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'text-primary/50 hover:text-primary'
                )}
              >
                SHARE CODE
              </button>
              <button
                onClick={() => {
                  setSearchMode('name');
                  setError('');
                  setSearchCode('');
                }}
                className={cn(
                  'flex-1 py-2 font-mono text-xs tracking-wider rounded transition-colors',
                  searchMode === 'name'
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'text-primary/50 hover:text-primary'
                )}
              >
                BY NAME
              </button>
            </div>

            {searchMode === 'code' ? (
              <div className="space-y-2">
                <p className="font-mono text-xs text-muted-foreground">Enter a share code to load an encounter</p>
                
                <Input
                  className="font-mono text-sm bg-input border-primary/30 uppercase"
                  placeholder="e.g., ABC123"
                  value={searchCode}
                  onChange={e => setSearchCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleSearchByCode()}
                />
                
                {error && (
                  <p className="font-mono text-xs text-destructive">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={handleSearchByCode}
                    disabled={!searchCode.trim() || loading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-mono text-xs text-muted-foreground">Search your saved encounters</p>
                
                <Input
                  className="font-mono text-sm bg-input border-primary/30"
                  placeholder="Search by title or computer name..."
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                />

                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredEncounters.length > 0 ? (
                    filteredEncounters.map(enc => (
                      <button
                        key={enc.id}
                        onClick={() => handleSelectByName(enc)}
                        className="w-full text-left p-2 rounded border border-primary/30 bg-primary/5 hover:bg-primary/15 transition-colors"
                      >
                        <p className="font-mono text-xs font-bold text-primary">{enc.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {enc.computerName} • Tier {enc.tier} • DC {enc.baseDC}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground italic text-center py-4">
                      {myEncounters.length === 0 ? 'No encounters yet' : 'No matches found'}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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