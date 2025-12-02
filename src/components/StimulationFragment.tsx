import React, { useState } from 'react';
import { Input, Select } from './ui';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import type { ChannelItem } from '../types';
import { SPEED_OPTIONS } from '../constants';

interface StimulationFragmentProps {
  item: ChannelItem;
  index: number;
  totalItems: number;
  onChange: (item: ChannelItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const StimulationFragment: React.FC<StimulationFragmentProps> = ({
  item,
  index,
  totalItems,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [notesExpanded, setNotesExpanded] = useState(!!item.fragment.notizen);

  const handleStimulationChange = (field: 'anzahlBewegungen' | 'geschwindigkeit', value: string | number) => {
    onChange({
      ...item,
      stimulation: {
        ...item.stimulation,
        [field]: field === 'anzahlBewegungen' ? Number(value) : value,
      },
    });
  };

  const handleFragmentChange = (field: 'text' | 'einwebung' | 'notizen', value: string) => {
    onChange({
      ...item,
      fragment: {
        ...item.fragment,
        [field]: value,
      },
    });
  };

  return (
    <div className="bg-background border-2 border-muted/30 rounded-lg p-4 space-y-4 hover:border-brand-primary/50 transition-colors">
      {/* Header with index and controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-secondary">
          Paar {index + 1}
        </h3>
        <div className="flex items-center gap-2">
          {onMoveUp && index > 0 && (
            <button
              onClick={onMoveUp}
              className="text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded p-1 transition-colors"
              title="Nach oben verschieben"
            >
              <ArrowUpIcon />
            </button>
          )}
          {onMoveDown && index < totalItems - 1 && (
            <button
              onClick={onMoveDown}
              className="text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded p-1 transition-colors"
              title="Nach unten verschieben"
            >
              <ArrowDownIcon />
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-muted hover:text-red-500 hover:bg-red-500/10 rounded p-1 transition-colors"
            title="Löschen"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Stimulation Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-on-surface-strong border-b border-muted/30 pb-1">
          Stimulation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Anzahl Bewegungen *"
            type="number"
            min="1"
            value={item.stimulation.anzahlBewegungen}
            onChange={(e) => handleStimulationChange('anzahlBewegungen', e.target.value)}
            placeholder="z.B. 24"
          />
          <Select
            label="Geschwindigkeit *"
            value={item.stimulation.geschwindigkeit}
            onChange={(e) => handleStimulationChange('geschwindigkeit', e.target.value)}
          >
            {SPEED_OPTIONS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Fragment Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-on-surface-strong border-b border-muted/30 pb-1">
          Fragment
        </h4>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Fragmentbeschreibung *
          </label>
          <textarea
            value={item.fragment.text}
            onChange={(e) => handleFragmentChange('text', e.target.value)}
            className="w-full bg-surface text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
            placeholder="Beschreibung des Fragments..."
          />
        </div>

        {/* Einwebung (optional, always visible) */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Einwebung (optional)
          </label>
          <textarea
            value={item.fragment.einwebung || ''}
            onChange={(e) => handleFragmentChange('einwebung', e.target.value)}
            className="w-full bg-surface text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[60px]"
            placeholder="Einwebung nach dem Fragment..."
          />
        </div>

        {/* Notizen (optional, expandable) */}
        <div>
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-on-surface transition-colors"
          >
            {notesExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            Notizen (optional)
            {item.fragment.notizen && !notesExpanded && (
              <span className="text-xs text-brand-secondary">(vorhanden)</span>
            )}
          </button>
          {notesExpanded && (
            <textarea
              value={item.fragment.notizen || ''}
              onChange={(e) => handleFragmentChange('notizen', e.target.value)}
              className="w-full bg-surface text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[60px] mt-2"
              placeholder="Zusätzliche Notizen zum Fragment..."
            />
          )}
        </div>
      </div>
    </div>
  );
};

