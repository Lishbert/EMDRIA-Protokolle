import React, { useState, useEffect } from 'react';
import { Tabs } from './components/ui';
import type { Tab } from './components/ui';
import { ProtocolList } from './components/ProtocolList';
import { ProtocolEditor } from './components/ProtocolEditor';
import { ListIcon, PencilIcon, CloudIcon } from './components/icons';
import type { Protocol, ProtocolListItem } from './types';
import { getProtocolsList, loadProtocol, deleteProtocol } from './utils/storage';
import { exportProtocolAsJSON, exportProtocolAsPDF } from './utils/export';

// Notification Component
interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, isVisible, onClose }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === 'success'
      ? 'from-green-500 to-green-600'
      : type === 'error'
      ? 'from-red-500 to-red-600'
      : 'from-blue-500 to-blue-600';

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
      <div
        className={`bg-gradient-to-br ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md border-2 border-white/20`}
      >
        <p className="font-semibold text-sm flex-grow">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Confirm Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onCancel}
    >
      <div
        className="bg-surface rounded-xl shadow-2xl max-w-md w-full border-2 border-red-500/30 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-muted/20">
          <h3 className="text-xl font-bold text-on-surface-strong">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-on-surface text-base leading-relaxed">{message}</p>
        </div>
        <div className="p-6 border-t border-muted/20 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-surface hover:bg-background border-2 border-muted/30 hover:border-muted text-on-surface"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white border-2 border-red-400"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [protocols, setProtocols] = useState<ProtocolListItem[]>([]);
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);
  const [isNewProtocol, setIsNewProtocol] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      isVisible: true,
      message,
      type,
    });
  };

  // Load protocols list on mount
  useEffect(() => {
    loadProtocolsList();
  }, []);

  const loadProtocolsList = () => {
    const list = getProtocolsList();
    setProtocols(list);
  };

  const handleNewProtocol = () => {
    setCurrentProtocol(null);
    setIsNewProtocol(true);
    setActiveTab('editor');
  };

  const handleEditProtocol = (id: string) => {
    const protocol = loadProtocol(id);
    if (protocol) {
      setCurrentProtocol(protocol);
      setIsNewProtocol(false);
      setActiveTab('editor');
    } else {
      showNotification('Protokoll konnte nicht geladen werden.', 'error');
    }
  };

  const handleDeleteProtocol = (id: string) => {
    const protocol = protocols.find(p => p.id === id);
    if (!protocol) return;

    setConfirmModal({
      isOpen: true,
      title: 'Protokoll löschen',
      message: `Möchten Sie das Protokoll "${protocol.chiffre} - ${protocol.protokollnummer}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
      onConfirm: () => {
        try {
          deleteProtocol(id);
          loadProtocolsList();
          showNotification('Protokoll wurde erfolgreich gelöscht.', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          showNotification('Fehler beim Löschen des Protokolls.', 'error');
        }
      },
    });
  };

  const handleSaveProtocol = () => {
    loadProtocolsList();
    setActiveTab('list');
    showNotification(
      isNewProtocol ? 'Protokoll wurde erfolgreich erstellt.' : 'Protokoll wurde erfolgreich gespeichert.',
      'success'
    );
  };

  const handleCancelEdit = () => {
    setCurrentProtocol(null);
    setIsNewProtocol(false);
    setActiveTab('list');
  };

  const handleExportJSON = (id: string) => {
    const protocol = loadProtocol(id);
    if (protocol) {
      try {
        exportProtocolAsJSON(protocol);
        showNotification('JSON-Export erfolgreich.', 'success');
      } catch (error) {
        showNotification('Fehler beim JSON-Export.', 'error');
      }
    }
  };

  const handleExportPDF = (id: string) => {
    const protocol = loadProtocol(id);
    if (protocol) {
      try {
        exportProtocolAsPDF(protocol);
        showNotification('PDF-Export erfolgreich.', 'success');
      } catch (error) {
        showNotification('Fehler beim PDF-Export.', 'error');
      }
    }
  };

  const tabs: Tab[] = [
    {
      id: 'list',
      label: 'Protokollübersicht',
      icon: <ListIcon />,
    },
    {
      id: 'editor',
      label: isNewProtocol ? 'Neues Protokoll' : 'Protokoll bearbeiten',
      icon: <PencilIcon />,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="bg-surface shadow-lg border-b-2 border-brand-primary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-on-surface-strong">EMDR Protokolle</h1>
              <p className="text-sm text-muted mt-1">
                Verwaltung von EMDR-Protokollen mit verschiedenen Protokolltypen
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-secondary">
              <CloudIcon />
              <span>Auto-Speichern aktiv</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="mb-8">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as 'list' | 'editor')} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[60vh]">
          {activeTab === 'list' ? (
            <ProtocolList
              protocols={protocols}
              onNew={handleNewProtocol}
              onEdit={handleEditProtocol}
              onDelete={handleDeleteProtocol}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onRefresh={loadProtocolsList}
            />
          ) : (
            <ProtocolEditor
              protocol={currentProtocol}
              onSave={handleSaveProtocol}
              onCancel={handleCancelEdit}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-muted/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted">
            EMDR Protokoll-Plattform © {new Date().getFullYear()} | Daten werden lokal gespeichert
          </p>
        </div>
      </footer>

      {/* Notification */}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

