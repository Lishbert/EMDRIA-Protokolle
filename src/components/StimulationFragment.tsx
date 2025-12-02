import React, { useState } from 'react';
import { Input, Select } from './ui';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon } from './icons';
import type { ChannelItem } from '../types';
import { SPEED_OPTIONS } from '../constants';

interface StimulationFragmentProps {
  item: ChannelItem;
  index: number;
  totalItems: number;
  collapsed?: boolean;
  onToggleExpand?: () => void;
  onChange: (item: ChannelItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const StimulationFragment: React.FC<StimulationFragmentProps> = ({
  item,
  index,
  totalItems,
  collapsed = false,
  onToggleExpand,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [notesExpanded, setNotesExpanded] = useState(!!item.fragment.notizen);

  // Helper to truncate text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Collapsed view
  if (collapsed) {
    return (
      <div 
        className="bg-background border-2 border-muted/30 rounded-lg p-3 hover:border-brand-primary/50 transition-colors cursor-pointer group"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Main summary content */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className="font-bold text-brand-secondary whitespace-nowrap">
              Paar {index + 1}:
            </span>
            <span className="text-on-surface">
              {item.stimulation.anzahlBewegungen} Bew. {item.stimulation.geschwindigkeit}
            </span>
            <span className="text-muted">|</span>
            <span className="text-on-surface truncate flex-1">
              {truncateText(item.fragment.text) || <span className="text-muted italic">Kein Fragment</span>}
            </span>
            {item.fragment.einwebung && (
              <span className="bg-brand-primary/20 text-brand-primary text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                Einwebung
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
              onClick={onToggleExpand}
              className="text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded p-1 transition-colors"
              title="Bearbeiten"
            >
              <PencilIcon />
            </button>
            <button
              onClick={onDelete}
              className="text-muted hover:text-red-500 hover:bg-red-500/10 rounded p-1 transition-colors"
              title="Löschen"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  // Expanded view
  return (
    <div className="bg-background border-2 border-brand-primary/50 rounded-lg p-4 space-y-4 transition-colors">
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
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded p-1 transition-colors"
              title="Einklappen"
            >
              <ChevronUpIcon />
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

