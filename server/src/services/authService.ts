import { prisma } from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateSessionToken, getSessionExpiryDate } from '../utils/session.js';

export interface BenutzerInfo {
  id: string;
  benutzername: string;
  anzeigename: string | null;
}

export const authService = {
  async login(benutzername: string, passwort: string): Promise<{
    success: boolean;
    error?: string;
    token?: string;
    benutzer?: BenutzerInfo;
  }> {
    const benutzer = await prisma.benutzer.findUnique({
      where: { benutzername },
    });

    if (!benutzer) {
      return { success: false, error: 'Ungültige Anmeldedaten' };
    }

    const isValid = await verifyPassword(passwort, benutzer.passwortHash);
    if (!isValid) {
      return { success: false, error: 'Ungültige Anmeldedaten' };
    }

    // Create session
    const token = generateSessionToken();
    const laeuftAbAm = getSessionExpiryDate(7);

    await prisma.sitzung.create({
      data: {
        benutzerId: benutzer.id,
        token,
        laeuftAbAm,
      },
    });

    return {
      success: true,
      token,
      benutzer: {
        id: benutzer.id,
        benutzername: benutzer.benutzername,
        anzeigename: benutzer.anzeigename,
      },
    };
  },

  async register(data: {
    benutzername: string;
    passwort: string;
    anzeigename?: string;
  }): Promise<{
    success: boolean;
    error?: string;
    benutzer?: BenutzerInfo;
  }> {
    const existing = await prisma.benutzer.findUnique({
      where: { benutzername: data.benutzername },
    });

    if (existing) {
      return { success: false, error: 'Benutzername bereits vergeben' };
    }

    const passwortHash = await hashPassword(data.passwort);

    const benutzer = await prisma.benutzer.create({
      data: {
        benutzername: data.benutzername,
        passwortHash,
        anzeigename: data.anzeigename,
      },
    });

    return {
      success: true,
      benutzer: {
        id: benutzer.id,
        benutzername: benutzer.benutzername,
        anzeigename: benutzer.anzeigename,
      },
    };
  },

  async logout(token: string): Promise<void> {
    await prisma.sitzung.delete({
      where: { token },
    }).catch(() => {
      // Ignore if session not found
    });
  },

  async validateSession(token: string): Promise<BenutzerInfo | null> {
    const sitzung = await prisma.sitzung.findUnique({
      where: { token },
      include: { benutzer: true },
    });

    if (!sitzung || sitzung.laeuftAbAm < new Date()) {
      if (sitzung) {
        await prisma.sitzung.delete({ where: { id: sitzung.id } });
      }
      return null;
    }

    return {
      id: sitzung.benutzer.id,
      benutzername: sitzung.benutzer.benutzername,
      anzeigename: sitzung.benutzer.anzeigename,
    };
  },

  async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.sitzung.deleteMany({
      where: {
        laeuftAbAm: { lt: new Date() },
      },
    });
    return result.count;
  },
};
