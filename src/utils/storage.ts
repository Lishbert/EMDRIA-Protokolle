import type { Protocol, ProtocolListItem, ProtocolMetadata } from '../types';
import { STORAGE_KEY_PREFIX, PROTOCOLS_LIST_KEY } from '../constants';

// Save a protocol to localStorage
export const saveProtocol = (protocol: Protocol): void => {
  try {
    const key = STORAGE_KEY_PREFIX + protocol.id;
    localStorage.setItem(key, JSON.stringify(protocol));
    updateProtocolsList(protocol);
  } catch (error) {
    console.error('Error saving protocol:', error);
    throw new Error('Failed to save protocol. Storage might be full.');
  }
};

// Load a protocol from localStorage
export const loadProtocol = (id: string): Protocol | null => {
  try {
    const key = STORAGE_KEY_PREFIX + id;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as Protocol;
  } catch (error) {
    console.error('Error loading protocol:', error);
    return null;
  }
};

// Delete a protocol from localStorage
export const deleteProtocol = (id: string): void => {
  try {
    const key = STORAGE_KEY_PREFIX + id;
    localStorage.removeItem(key);
    removeFromProtocolsList(id);
  } catch (error) {
    console.error('Error deleting protocol:', error);
    throw new Error('Failed to delete protocol.');
  }
};

// Get list of all protocols (metadata only)
export const getProtocolsList = (): ProtocolListItem[] => {
  try {
    const listData = localStorage.getItem(PROTOCOLS_LIST_KEY);
    if (!listData) return [];
    const list = JSON.parse(listData) as ProtocolListItem[];
    // Sort by lastModified descending (newest first)
    return list.sort((a, b) => b.lastModified - a.lastModified);
  } catch (error) {
    console.error('Error loading protocols list:', error);
    return [];
  }
};

// Update the protocols list with a new or modified protocol
const updateProtocolsList = (protocol: Protocol): void => {
  try {
    const list = getProtocolsList();
    const listItem: ProtocolListItem = {
      id: protocol.id,
      chiffre: protocol.chiffre,
      datum: protocol.datum,
      protokollnummer: protocol.protokollnummer,
      protocolType: protocol.protocolType,
      lastModified: protocol.lastModified,
    };

    // Remove existing entry if present
    const filteredList = list.filter(item => item.id !== protocol.id);
    
    // Add updated entry
    filteredList.push(listItem);
    
    localStorage.setItem(PROTOCOLS_LIST_KEY, JSON.stringify(filteredList));
  } catch (error) {
    console.error('Error updating protocols list:', error);
  }
};

// Remove a protocol from the list
const removeFromProtocolsList = (id: string): void => {
  try {
    const list = getProtocolsList();
    const filteredList = list.filter(item => item.id !== id);
    localStorage.setItem(PROTOCOLS_LIST_KEY, JSON.stringify(filteredList));
  } catch (error) {
    console.error('Error removing from protocols list:', error);
  }
};

// Export all protocols as a JSON file
export const exportAllProtocolsAsJSON = (): void => {
  try {
    const list = getProtocolsList();
    const allProtocols: Protocol[] = [];
    
    for (const item of list) {
      const protocol = loadProtocol(item.id);
      if (protocol) {
        allProtocols.push(protocol);
      }
    }
    
    const dataStr = JSON.stringify(allProtocols, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `EMDR_Protokolle_${timestamp}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting protocols:', error);
    throw new Error('Failed to export protocols.');
  }
};

// Import protocols from a JSON file
export const importProtocolsFromJSON = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const protocols = JSON.parse(content) as Protocol[];
        
        let importedCount = 0;
        for (const protocol of protocols) {
          // Ensure protocol has required fields
          if (protocol.id && protocol.chiffre && protocol.datum) {
            saveProtocol(protocol);
            importedCount++;
          }
        }
        
        resolve(importedCount);
      } catch (error) {
        console.error('Error importing protocols:', error);
        reject(new Error('Failed to import protocols. Invalid file format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
};

