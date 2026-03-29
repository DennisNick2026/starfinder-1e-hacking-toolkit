import React from 'react';
import { X } from 'lucide-react';
import ComputerSettings from './ComputerSettings';
import { cn } from '@/lib/utils';

export default function ComputerSettingsModal({
  isOpen,
  onClose,
  computerName,
  setComputerName,
  tier,
  setTier,
  baseDC,
  setBaseDC,
  upgrades,
  setUpgrades,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-primary/40 rounded-lg shadow-2xl w-96 p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg font-bold text-primary">COMPUTER SETTINGS</h2>
          <button onClick={onClose} className="text-primary/50 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ComputerSettings
          computerName={computerName}
          setComputerName={setComputerName}
          tier={tier}
          setTier={setTier}
          baseDC={baseDC}
          setBaseDC={setBaseDC}
          upgrades={upgrades}
          setUpgrades={setUpgrades}
        />
      </div>
    </div>
  );
}