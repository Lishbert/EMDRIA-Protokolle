import React, { useState, useEffect } from 'react';
import { Card, Button } from './ui';
import { PlusIcon, SparklesIcon } from './icons';
import { StimulationFragment } from './StimulationFragment';
import type { ChannelItem } from '../types';
import { DEFAULT_ANZAHL_BEWEGUNGEN, DEFAULT_SPEED } from '../constants';
import { getRandomChannelItem } from '../utils/testData';

interface ChannelEditorProps {
  channel: ChannelItem[];
  onChange: (channel: ChannelItem[]) => void;
}

export const ChannelEditor: React.FC<ChannelEditorProps> = ({ channel, onChange }) => {
  // Track which item is currently expanded (null means none, or the last one if just added)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    channel.length > 0 ? channel.length - 1 : null
  );
  
  // Dropdown menu state
  const [showTestDataMenu, setShowTestDataMenu] = useState(false);

  // Update expandedIndex when channel length changes (e.g., when items are deleted)
  useEffect(() => {
    if (expandedIndex !== null && expandedIndex >= channel.length) {
      setExpandedIndex(channel.length > 0 ? channel.length - 1 : null);
    }
  }, [channel.length, expandedIndex]);

  const addChannelItem = () => {
    const newItem: ChannelItem = {
      id: crypto.randomUUID(),
      stimulation: {
        id: crypto.randomUUID(),
        anzahlBewegungen: DEFAULT_ANZAHL_BEWEGUNGEN,
        geschwindigkeit: DEFAULT_SPEED,
      },
      fragment: {
        id: crypto.randomUUID(),
        text: '',
        notizen: '',
      },
    };
    onChange([...channel, newItem]);
    // Set the new item as expanded (collapse all others)
    setExpandedIndex(channel.length);
  };

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const updateChannelItem = (index: number, updatedItem: ChannelItem) => {
    const newChannel = [...channel];
    newChannel[index] = updatedItem;
    onChange(newChannel);
  };

  const deleteChannelItem = (index: number) => {
    const newChannel = channel.filter((_, i) => i !== index);
    onChange(newChannel);
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newChannel = [...channel];
    [newChannel[index - 1], newChannel[index]] = [newChannel[index], newChannel[index - 1]];
    onChange(newChannel);
  };

  const moveItemDown = (index: number) => {
    if (index === channel.length - 1) return;
    const newChannel = [...channel];
    [newChannel[index], newChannel[index + 1]] = [newChannel[index + 1], newChannel[index]];
    onChange(newChannel);
  };

  const fillWithTestData = (count: number) => {
    const newChannel = Array.from({ length: count }, () => getRandomChannelItem());
    onChange(newChannel);
    // Collapse all items after filling
    setExpandedIndex(null);
    setShowTestDataMenu(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTestDataMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.test-data-dropdown')) {
          setShowTestDataMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTestDataMenu]);

  return (
    <Card className="mb-6">
      {/* Header with title and test data dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-on-surface-strong">Kanal (Stimulation-Fragment-Paare)</h2>
        <div className="relative test-data-dropdown">
          <button
            type="button"
            onClick={() => setShowTestDataMenu(!showTestDataMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Kanal mit Testdaten füllen"
          >
            <SparklesIcon />
            Testdaten einfügen
            <svg className={`w-4 h-4 transition-transform ${showTestDataMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTestDataMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-surface border-2 border-brand-secondary/30 rounded-lg shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="p-1">
                <button
                  onClick={() => fillWithTestData(5)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                >
                  5 Paare erstellen
                </button>
                <button
                  onClick={() => fillWithTestData(10)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                >
                  10 Paare erstellen
                </button>
                <button
                  onClick={() => fillWithTestData(15)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                >
                  15 Paare erstellen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {channel.length === 0 && (
          <div className="text-center py-8 text-muted">
            <p className="mb-4">Noch keine Stimulation-Fragment-Paare vorhanden.</p>
            <p className="text-sm">Klicken Sie auf "Paar hinzufügen", um zu beginnen.</p>
          </div>
        )}

        {channel.map((item, index) => (
          <StimulationFragment
            key={item.id}
            item={item}
            index={index}
            totalItems={channel.length}
            collapsed={expandedIndex !== index}
            onToggleExpand={() => handleToggleExpand(index)}
            onChange={(updatedItem) => updateChannelItem(index, updatedItem)}
            onDelete={() => deleteChannelItem(index)}
            onMoveUp={() => moveItemUp(index)}
            onMoveDown={() => moveItemDown(index)}
          />
        ))}

        <div className="pt-4">
          <Button onClick={addChannelItem} className="w-full md:w-auto">
            <PlusIcon />
            Paar hinzufügen
          </Button>
        </div>
      </div>
    </Card>
  );
};

