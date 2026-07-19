import React, { useState, useEffect } from 'react';
import { X, FileText, Save, Lock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

const DATA_NODE_TYPES = ['secure_data_average', 'secure_data_large', 'secure_data_specific'];

export { DATA_NODE_TYPES };

export default function DataFileModal({ node, onClose, onSave, canEdit }) {
  const [content, setContent] = useState(node.file_content || '');
  const [mediaUrl, setMediaUrl] = useState(node.media_url || '');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Re-sync local state when switching to a different node
  useEffect(() => {
    setContent(node.file_content || '');
    setMediaUrl(node.media_url || '');
  }, [node.id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMediaUrl(file_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

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
            <div className={cn('flex items-center gap-1', node.resolved ? 'text-accent' : 'text-muted-foreground')}>
              <Lock className="w-3 h-3" />
              <span className="font-mono text-[10px]">{node.resolved ? 'BREACHED' : 'READ ONLY'}</span>
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
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Image / Video</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 font-mono text-xs bg-muted border border-border rounded-md px-3 py-2"
                  placeholder="Paste URL or upload a file..."
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                />
                <label className={cn(
                  'flex items-center gap-1.5 px-3 py-2 font-mono text-xs border rounded-md cursor-pointer transition-colors whitespace-nowrap',
                  uploading ? 'opacity-50 cursor-wait' : 'border-accent/40 text-accent hover:bg-accent/10'
                )}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
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