import React, { useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImportEncounterDialog({ isOpen, onClose, onImport }) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImport(data);
      } catch (error) {
        alert('Invalid JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-primary/40 rounded-lg shadow-2xl w-96 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg font-bold text-primary">IMPORT ENCOUNTER</h2>
          <button onClick={onClose} className="text-primary/50 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          Select a JSON file exported from this toolkit to import an encounter.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full font-mono text-xs gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Upload className="w-4 h-4" /> CHOOSE FILE
        </Button>
      </div>
    </div>
  );
}