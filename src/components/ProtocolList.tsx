import React, { useState, useMemo } from 'react';
import { Button, Card, Input, Select } from './ui';
import { PlusIcon, PencilIcon, TrashIcon, DownloadIcon, PrinterIcon, SearchIcon, FilterIcon, BeakerIcon } from './icons';
import type { ProtocolListItem, ProtocolType } from '../types';
import { PROTOCOL_TYPES, PROTOCOL_TYPE_COLORS, PROTOCOL_TYPE_BORDER_COLORS } from '../constants';
import { generateMultipleTestProtocols, generateTestProtocolsAllTypes } from '../utils/testData';

interface ProtocolListProps {
  protocols: ProtocolListItem[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExportJSON: (id: string) => void;
  onExportPDF: (id: string) => void;
  onRefresh: () => void;
}

// Format date to German format
const formatDateGerman = (isoDate: string): string => {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
};

// Format timestamp to readable date
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ProtocolList: React.FC<ProtocolListProps> = ({
  protocols,
  onNew,
  onEdit,
  onDelete,
  onExportJSON,
  onExportPDF,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ProtocolType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showTestDataMenu, setShowTestDataMenu] = useState(false);

  const handleGenerateTestData = (count: number) => {
    generateMultipleTestProtocols(count);
    onRefresh();
    setShowTestDataMenu(false);
  };

  const handleGenerateAllTypes = () => {
    generateTestProtocolsAllTypes();
    onRefresh();
    setShowTestDataMenu(false);
  };

  // Close test data menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTestDataMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.test-data-menu-container')) {
          setShowTestDataMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTestDataMenu]);

  // Filter and search protocols
  const filteredProtocols = useMemo(() => {
    let filtered = protocols;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.protocolType === filterType);
    }

    // Search by chiffre or protokollnummer
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.chiffre.toLowerCase().includes(search) ||
          p.protokollnummer.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [protocols, filterType, searchTerm]);

  // Group protocols by type for statistics
  const protocolsByType = useMemo(() => {
    const grouped: Record<ProtocolType, number> = {
      'Reprozessieren': 0,
      'IRI': 0,
      'CIPOS': 0,
      'Sicherer Ort': 0,
      'Custom': 0,
    };
    protocols.forEach(p => {
      grouped[p.protocolType] = (grouped[p.protocolType] || 0) + 1;
    });
    return grouped;
  }, [protocols]);

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface-strong">
              Protokollübersicht
            </h2>
            <p className="text-sm text-muted mt-1">
              {protocols.length} {protocols.length === 1 ? 'Protokoll' : 'Protokolle'} gespeichert
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={onNew} variant="success">
              <PlusIcon />
              Neues Protokoll
            </Button>
            <div className="relative test-data-menu-container">
              <Button 
                onClick={() => setShowTestDataMenu(!showTestDataMenu)} 
                variant="secondary"
                title="Testdaten generieren"
              >
                <BeakerIcon />
                Testdaten
              </Button>
              {showTestDataMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border-2 border-brand-primary/30 rounded-lg shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleGenerateTestData(1)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                    >
                      1 Testprotokoll erstellen
                    </button>
                    <button
                      onClick={() => handleGenerateTestData(5)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                    >
                      5 Testprotokolle erstellen
                    </button>
                    <button
                      onClick={() => handleGenerateTestData(10)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                    >
                      10 Testprotokolle erstellen
                    </button>
                    <div className="border-t border-muted/30 my-1"></div>
                    <button
                      onClick={handleGenerateAllTypes}
                      className="w-full text-left px-3 py-2 rounded hover:bg-background text-brand-secondary text-sm font-semibold transition-colors"
                    >
                      Je 1 pro Protokolltyp (5)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {PROTOCOL_TYPES.map(type => (
            <div
              key={type}
              className={`bg-gradient-to-br ${PROTOCOL_TYPE_COLORS[type]} p-3 rounded-lg text-white text-center`}
            >
              <div className="text-2xl font-bold">{protocolsByType[type]}</div>
              <div className="text-xs opacity-90 mt-1">{type}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Suche nach Chiffre oder Protokollnummer..."
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                  <SearchIcon />
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              className="sm:w-auto"
            >
              <FilterIcon />
              Filter
            </Button>
          </div>

          {showFilters && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <Select
                label="Nach Protokolltyp filtern"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ProtocolType | 'all')}
              >
                <option value="all">Alle Typen</option>
                {PROTOCOL_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type} ({protocolsByType[type]})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {(searchTerm || filterType !== 'all') && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>
                {filteredProtocols.length} von {protocols.length}{' '}
                {filteredProtocols.length === 1 ? 'Protokoll' : 'Protokolle'}
              </span>
              {(searchTerm || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-brand-primary hover:underline"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Protocols List */}
      <div className="space-y-4">
        {filteredProtocols.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-muted">
              <p className="text-lg mb-2">
                {protocols.length === 0
                  ? 'Noch keine Protokolle vorhanden'
                  : 'Keine Protokolle gefunden'}
              </p>
              <p className="text-sm mb-6">
                {protocols.length === 0
                  ? 'Erstellen Sie Ihr erstes EMDR-Protokoll'
                  : 'Versuchen Sie, Ihre Suchkriterien anzupassen'}
              </p>
              {protocols.length === 0 && (
                <Button onClick={onNew} variant="success">
                  <PlusIcon />
                  Neues Protokoll erstellen
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredProtocols.map((protocol) => (
            <Card key={protocol.id} className={`border-l-4 ${PROTOCOL_TYPE_BORDER_COLORS[protocol.protocolType]}`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Protocol Info */}
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-on-surface-strong">
                      {protocol.chiffre}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-br ${PROTOCOL_TYPE_COLORS[protocol.protocolType]} text-white`}>
                      {protocol.protocolType}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-on-surface">
                    <div>
                      <span className="text-muted">Protokollnummer:</span>{' '}
                      <span className="font-semibold">{protocol.protokollnummer}</span>
                    </div>
                    <div>
                      <span className="text-muted">Datum:</span>{' '}
                      <span className="font-semibold">{formatDateGerman(protocol.datum)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    Zuletzt geändert: {formatTimestamp(protocol.lastModified)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onEdit(protocol.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold"
                    title="Bearbeiten"
                  >
                    <PencilIcon />
                    <span className="hidden sm:inline">Bearbeiten</span>
                  </button>

                  <button
                    onClick={() => onExportJSON(protocol.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-semibold"
                    title="JSON Export"
                  >
                    <DownloadIcon />
                    <span className="hidden sm:inline">JSON</span>
                  </button>

                  <button
                    onClick={() => onExportPDF(protocol.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-semibold"
                    title="PDF Export"
                  >
                    <PrinterIcon />
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  <button
                    onClick={() => onDelete(protocol.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-semibold"
                    title="Löschen"
                  >
                    <TrashIcon />
                    <span className="hidden sm:inline">Löschen</span>
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

