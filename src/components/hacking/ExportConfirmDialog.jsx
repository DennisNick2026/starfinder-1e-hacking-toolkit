import React from 'react';
import { X, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExportConfirmDialog({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

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
          <h2 className="font-mono text-lg font-bold text-primary">SAVE TO FILE</h2>
          <button onClick={onClose} className="text-primary/50 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/30 rounded">
          <FileJson className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="font-mono text-xs text-primary/80 leading-relaxed">
            This will download your current encounter setup as a JSON file to your computer. You can load it back later using the "Load from File" option.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 font-mono text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 font-mono text-xs bg-primary text-primary-foreground"
            onClick={() => { onConfirm(); onClose(); }}
          >
            <FileJson className="w-3.5 h-3.5 mr-1.5" /> Download File
          </Button>
        </div>
      </div>
    </div>
  );
}