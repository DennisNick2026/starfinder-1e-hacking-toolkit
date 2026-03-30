import React, { useState, useEffect } from 'react';
import { X, FileText, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const DATA_NODE_TYPES = ['secure_data_average', 'secure_data_large', 'secure_data_specific'];

export { DATA_NODE_TYPES };

// Deterministic garble: replace each char with a "random" symbol based on char code
function garbleText(text) {
  const glitch = '█▓▒░╬╫╪┼┤├╣╠╗╔╚╝║═╦╩╤╧╟╞╙╘╒╓╫░▒▓█@#$%&*!?~/\\^<>';
  return text.split('').map((ch, i) => {
    if (ch === '\n') return '\n';
    if (ch === ' ') return ' ';
    return glitch[(ch.charCodeAt(0) * 7 + i * 3) % glitch.length];
  }).join('');
}

export default function DataFileModal({ node, onClose, onSave, canEdit }) {
  const [content, setContent] = useState(node.file_content || '');
  const [saved, setSaved] = useState(false);
  const isFake = !!node.fake;

  const handleSave = () => {
    onSave(node.id, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (canEdit) handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-accent/40 rounded-xl shadow-2xl flex flex-col"
        style={{ width: 560, maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <FileText className="w-4 h-4 text-accent shrink-0" />
          <span className="font-mono text-sm font-semibold text-accent flex-1 truncate">
            {node.name}
          </span>
          {!canEdit && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span className="font-mono text-[10px]">READ ONLY</span>
            </div>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File content */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          {canEdit ? (
            <Textarea
              className="flex-1 font-mono text-xs bg-muted border-border resize-none min-h-[300px]"
              placeholder="Enter file contents here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
            />
          ) : isFake ? (
            <div className="flex-1 font-mono text-xs bg-muted border border-border rounded-md p-3 overflow-y-auto min-h-[300px] whitespace-pre-wrap text-chart-3/60 select-none">
              {content ? garbleText(content) : <span className="text-muted-foreground italic">[ empty file ]</span>}
            </div>
          ) : (
            <div className="flex-1 font-mono text-xs bg-muted border border-border rounded-md p-3 overflow-y-auto min-h-[300px] whitespace-pre-wrap text-foreground/80">
              {content || <span className="text-muted-foreground italic">[ empty file ]</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <Button variant="outline" className="font-mono text-xs" onClick={onClose}>
            Close
          </Button>
          {canEdit && (
            <Button
              className={cn(
                'font-mono text-xs transition-colors',
                saved ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
              )}
              onClick={handleSave}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saved ? 'Saved!' : 'Save'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}