import React, { useState, useEffect } from 'react';
import { X, FileText, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const DATA_NODE_TYPES = ['secure_data_average', 'secure_data_large', 'secure_data_specific'];

export { DATA_NODE_TYPES };

export default function DataFileModal({ node, onClose, onSave, canEdit }) {
  const [content, setContent] = useState(node.file_content || '');
  const [mediaUrl, setMediaUrl] = useState(node.media_url || '');
  const [saved, setSaved] = useState(false);

  const getMediaType = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.match(/\.(mp4|webm|mov|ogg|avi)(\?|$)/)) return 'video';
    return 'image';
  };

  const handleSave = () => {
    onSave(node.id, { file_content: content, media_url: mediaUrl });
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
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {/* Media URL input (edit mode) */}
          {canEdit && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Image / Video URL</label>
              <input
                type="text"
                className="w-full font-mono text-xs bg-muted border border-border rounded-md px-3 py-2"
                placeholder="https://example.com/image.jpg or video.mp4"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
              />
            </div>
          )}

          {/* Media display */}
          {mediaUrl && (() => {
            const type = getMediaType(mediaUrl);
            return (
              <div className="rounded-md overflow-hidden border border-border bg-muted/30 flex items-center justify-center" style={{ maxHeight: 300 }}>
                {type === 'video' ? (
                  <video src={mediaUrl} controls className="max-w-full max-h-[300px]" />
                ) : (
                  <img src={mediaUrl} alt="File media" className="max-w-full max-h-[300px] object-contain" />
                )}
              </div>
            );
          })()}

          {/* Text content */}
          {canEdit ? (
            <Textarea
              className="flex-1 font-mono text-xs bg-muted border-border resize-none min-h-[200px]"
              placeholder="Enter file contents here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="font-mono text-xs bg-muted border border-border rounded-md p-3 overflow-y-auto min-h-[100px] whitespace-pre-wrap text-foreground/80">
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