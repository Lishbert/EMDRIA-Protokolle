import { prisma } from '../db.js';
import type { ProtokollTyp } from '@prisma/client';

// Map frontend protocol type to Prisma enum
const mapProtocolType = (type: string): ProtokollTyp => {
  const mapping: Record<string, ProtokollTyp> = {
    'Reprozessieren': 'Reprozessieren',
    'IRI': 'IRI',
    'CIPOS': 'CIPOS',
    'Sicherer Ort': 'SichererOrt',
  };
  return mapping[type] || 'Reprozessieren';
};

// Map Prisma enum to frontend protocol type
const mapProtocolTypeToFrontend = (type: ProtokollTyp): string => {
  const mapping: Record<ProtokollTyp, string> = {
    'Reprozessieren': 'Reprozessieren',
    'IRI': 'IRI',
    'CIPOS': 'CIPOS',
    'SichererOrt': 'Sicherer Ort',
  };
  return mapping[type];
};

export interface ProtokollListItem {
  id: string;
  chiffre: string;
  datum: string;
  protokollnummer: string;
  protocolType: string;
  lastModified: number;
}

export const protocolService = {
  async getProtocolsList(benutzerId: string): Promise<ProtokollListItem[]> {
    const protokolle = await prisma.protokoll.findMany({
      where: { benutzerId },
      select: {
        id: true,
        chiffre: true,
        datum: true,
        protokollnummer: true,
        protokollTyp: true,
        geaendertAm: true,
      },
      orderBy: { geaendertAm: 'desc' },
    });

    return protokolle.map((p) => ({
      id: p.id,
      chiffre: p.chiffre,
      datum: p.datum,
      protokollnummer: p.protokollnummer,
      protocolType: mapProtocolTypeToFrontend(p.protokollTyp),
      lastModified: p.geaendertAm.getTime(),
    }));
  },

  async getProtocol(benutzerId: string, id: string) {
    const protokoll = await prisma.protokoll.findFirst({
      where: { id, benutzerId },
    });

    if (!protokoll) return null;

    // Reconstruct full protocol object
    return {
      id: protokoll.id,
      chiffre: protokoll.chiffre,
      datum: protokoll.datum,
      protokollnummer: protokoll.protokollnummer,
      protocolType: mapProtocolTypeToFrontend(protokoll.protokollTyp),
      createdAt: protokoll.erstelltAm.getTime(),
      lastModified: protokoll.geaendertAm.getTime(),
      ...(protokoll.daten as object),
    };
  },

  async createProtocol(
    benutzerId: string,
    input: {
      chiffre: string;
      datum: string;
      protokollnummer: string;
      protocolType: string;
      [key: string]: unknown;
    }
  ) {
    const { chiffre, datum, protokollnummer, protocolType, ...daten } = input;

    const protokoll = await prisma.protokoll.create({
      data: {
        benutzerId,
        chiffre,
        datum,
        protokollnummer,
        protokollTyp: mapProtocolType(protocolType),
        daten,
      },
    });

    return {
      id: protokoll.id,
      chiffre: protokoll.chiffre,
      datum: protokoll.datum,
      protokollnummer: protokoll.protokollnummer,
      protocolType: mapProtocolTypeToFrontend(protokoll.protokollTyp),
      createdAt: protokoll.erstelltAm.getTime(),
      lastModified: protokoll.geaendertAm.getTime(),
      ...daten,
    };
  },

  async updateProtocol(
    benutzerId: string,
    id: string,
    input: {
      chiffre: string;
      datum: string;
      protokollnummer: string;
      protocolType: string;
      [key: string]: unknown;
    }
  ) {
    const { chiffre, datum, protokollnummer, protocolType, ...daten } = input;

    const existing = await prisma.protokoll.findFirst({
      where: { id, benutzerId },
    });

    if (!existing) return null;

    const protokoll = await prisma.protokoll.update({
      where: { id },
      data: {
        chiffre,
        datum,
        protokollnummer,
        protokollTyp: mapProtocolType(protocolType),
        daten,
      },
    });

    return {
      id: protokoll.id,
      chiffre: protokoll.chiffre,
      datum: protokoll.datum,
      protokollnummer: protokoll.protokollnummer,
      protocolType: mapProtocolTypeToFrontend(protokoll.protokollTyp),
      createdAt: protokoll.erstelltAm.getTime(),
      lastModified: protokoll.geaendertAm.getTime(),
      ...daten,
    };
  },

  async deleteProtocol(benutzerId: string, id: string): Promise<boolean> {
    const existing = await prisma.protokoll.findFirst({
      where: { id, benutzerId },
    });

    if (!existing) return false;

    await prisma.protokoll.delete({ where: { id } });
    return true;
  },

  async exportAllProtocols(benutzerId: string) {
    const protokolle = await prisma.protokoll.findMany({
      where: { benutzerId },
    });

    return protokolle.map((p) => ({
      id: p.id,
      chiffre: p.chiffre,
      datum: p.datum,
      protokollnummer: p.protokollnummer,
      protocolType: mapProtocolTypeToFrontend(p.protokollTyp),
      createdAt: p.erstelltAm.getTime(),
      lastModified: p.geaendertAm.getTime(),
      ...(p.daten as object),
    }));
  },

  async importProtocols(
    benutzerId: string,
    protokolle: Array<{
      chiffre: string;
      datum: string;
      protokollnummer: string;
      protocolType: string;
      [key: string]: unknown;
    }>
  ): Promise<number> {
    let count = 0;

    for (const p of protokolle) {
      if (!p.chiffre || !p.datum || !p.protokollnummer || !p.protocolType) {
        continue;
      }

      const {
        chiffre,
        datum,
        protokollnummer,
        protocolType,
        id: _id,
        createdAt: _createdAt,
        lastModified: _lastModified,
        ...daten
      } = p;

      await prisma.protokoll.create({
        data: {
          benutzerId,
          chiffre,
          datum,
          protokollnummer,
          protokollTyp: mapProtocolType(protocolType),
          daten,
        },
      });
      count++;
    }

    return count;
  },
};
