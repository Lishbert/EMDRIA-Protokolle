import React, { useState, useEffect } from 'react';
import { Card, Button } from './ui';
import { PlusIcon } from './icons';
import { StimulationFragment } from './StimulationFragment';
import type { ChannelItem } from '../types';
import { DEFAULT_ANZAHL_BEWEGUNGEN, DEFAULT_SPEED } from '../constants';

interface ChannelEditorProps {
  channel: ChannelItem[];
  onChange: (channel: ChannelItem[]) => void;
}

export const ChannelEditor: React.FC<ChannelEditorProps> = ({ channel, onChange }) => {
  // Track which item is currently expanded (null means none, or the last one if just added)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    channel.length > 0 ? channel.length - 1 : null
  );

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

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-bold text-on-surface-strong mb-4">Kanal (Stimulation-Fragment-Paare)</h2>
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

