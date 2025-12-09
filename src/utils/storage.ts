import type { Protocol, ProtocolListItem } from '../types';
import { api, handleApiResponse } from '../api/client';

// Save a protocol to the backend
export const saveProtocol = async (protocol: Protocol): Promise<void> => {
  try {
    const { id, chiffre, datum, protokollnummer, protocolType, createdAt, lastModified, ...data } = protocol;

    const payload = {
      chiffre,
      datum,
      protokollnummer,
      protocolType,
      ...data,
    };

    // Try to update existing protocol first
    if (id) {
      const existing = await api.api.protocols[':id'].$get({ param: { id } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      if (existing) {
        await handleApiResponse(
          await api.api.protocols[':id'].$put({
            param: { id },
            json: payload,
          })
        );
        return;
      }
    }

    // Create new protocol
    await handleApiResponse(await api.api.protocols.$post({ json: payload }));
  } catch (error) {
    console.error('Error saving protocol:', error);
    throw new Error('Protokoll konnte nicht gespeichert werden.');
  }
};

// Load a protocol from the backend
export const loadProtocol = async (id: string): Promise<Protocol | null> => {
  try {
    const response = await api.api.protocols[':id'].$get({ param: { id } });
    if (!response.ok) return null;
    return (await response.json()) as Protocol;
  } catch (error) {
    console.error('Error loading protocol:', error);
    return null;
  }
};

// Delete a protocol from the backend
export const deleteProtocol = async (id: string): Promise<void> => {
  try {
    await handleApiResponse(await api.api.protocols[':id'].$delete({ param: { id } }));
  } catch (error) {
    console.error('Error deleting protocol:', error);
    throw new Error('Protokoll konnte nicht gelöscht werden.');
  }
};

// Get list of all protocols (metadata only)
export const getProtocolsList = async (): Promise<ProtocolListItem[]> => {
  try {
    const response = await api.api.protocols.$get();
    if (!response.ok) return [];
    return (await response.json()) as ProtocolListItem[];
  } catch (error) {
    console.error('Error loading protocols list:', error);
    return [];
  }
};

// Export all protocols as a JSON file
export const exportAllProtocolsAsJSON = async (): Promise<void> => {
  try {
    const response = await api.api.protocols.export.json.$get();
    const blob = await response.blob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `EMDR_Protokolle_${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting protocols:', error);
    throw new Error('Protokolle konnten nicht exportiert werden.');
  }
};

// Import protocols from a JSON file
export const importProtocolsFromJSON = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const protocols = JSON.parse(content) as Protocol[];

        const response = await api.api.protocols.import.$post({
          json: { protocols },
        });

        const result = await handleApiResponse<{ imported: number }>(response);
        resolve(result.imported);
      } catch (error) {
        console.error('Error importing protocols:', error);
        reject(new Error('Protokolle konnten nicht importiert werden.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Datei konnte nicht gelesen werden.'));
    };

    reader.readAsText(file);
  });
};
