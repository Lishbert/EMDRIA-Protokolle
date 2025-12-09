import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

export const LoginForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [benutzername, setBenutzername] = useState('');
  const [passwort, setPasswort] = useState('');
  const [anzeigename, setAnzeigename] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(benutzername, passwort, anzeigename || undefined);
        // After successful registration, log in
        await login(benutzername, passwort);
      } else {
        await login(benutzername, passwort);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-on-surface-strong mb-2">
            EMDR Protokolle
          </h1>
          <p className="text-muted">
            {isRegister ? 'Neues Konto erstellen' : 'Anmelden'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Benutzername"
            value={benutzername}
            onChange={(e) => setBenutzername(e.target.value)}
            required
            minLength={3}
            maxLength={50}
            autoComplete="username"
          />

          <Input
            label="Passwort"
            type="password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            required
            minLength={8}
            maxLength={100}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />

          {isRegister && (
            <Input
              label="Anzeigename (optional)"
              value={anzeigename}
              onChange={(e) => setAnzeigename(e.target.value)}
              maxLength={100}
              autoComplete="name"
            />
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading
              ? 'Bitte warten...'
              : isRegister
                ? 'Registrieren'
                : 'Anmelden'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-brand-primary hover:underline text-sm"
          >
            {isRegister
              ? 'Bereits ein Konto? Anmelden'
              : 'Noch kein Konto? Registrieren'}
          </button>
        </div>
      </Card>
    </div>
  );
};
