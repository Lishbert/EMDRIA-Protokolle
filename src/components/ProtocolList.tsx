import React, { useState, useMemo } from 'react';
import { Button, Card, Input, Select } from './ui';
import { PlusIcon, PencilIcon, TrashIcon, PrinterIcon, SearchIcon, FilterIcon, BeakerIcon } from './icons';
import type { ProtocolListItem, ProtocolType } from '../types';
import { PROTOCOL_TYPES, PROTOCOL_TYPE_COLORS, PROTOCOL_TYPE_BORDER_COLORS } from '../constants';
import { generateMultipleTestProtocols, generateTestProtocolsAllTypes } from '../utils/testData';

interface ProtocolListProps {
  protocols: ProtocolListItem[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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

  // Group filtered protocols by Chiffre
  const protocolsByChiffre = useMemo(() => {
    const grouped: Record<string, ProtocolListItem[]> = {};
    
    filteredProtocols.forEach(protocol => {
      if (!grouped[protocol.chiffre]) {
        grouped[protocol.chiffre] = [];
      }
      grouped[protocol.chiffre].push(protocol);
    });

    // Sort protocols within each group by protokollnummer (numeric extraction for proper sorting)
    Object.keys(grouped).forEach(chiffre => {
      grouped[chiffre].sort((a, b) => {
        // Try to extract numbers from protokollnummer for proper numeric sorting
        const numA = parseInt(a.protokollnummer.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.protokollnummer.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        // Fallback to string comparison
        return a.protokollnummer.localeCompare(b.protokollnummer);
      });
    });

    return grouped;
  }, [filteredProtocols]);

  // Get sorted list of chiffres
  const sortedChiffres = useMemo(() => {
    return Object.keys(protocolsByChiffre).sort((a, b) => a.localeCompare(b));
  }, [protocolsByChiffre]);

  // Track expanded chiffres
  const [expandedChiffres, setExpandedChiffres] = useState<Set<string>>(new Set());

  const toggleChiffre = (chiffre: string) => {
    setExpandedChiffres(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chiffre)) {
        newSet.delete(chiffre);
      } else {
        newSet.add(chiffre);
      }
      return newSet;
    });
  };

  // Check if all chiffres are expanded
  const allExpanded = sortedChiffres.length > 0 && sortedChiffres.every(c => expandedChiffres.has(c));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedChiffres(new Set());
    } else {
      setExpandedChiffres(new Set(sortedChiffres));
    }
  };

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
                    {type}
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

      {/* Protocols List - Grouped by Chiffre */}
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
          <>
            {/* Toggle All */}
            <div className="flex justify-end">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${allExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {allExpanded ? 'Ausblenden' : 'Einblenden'}
              </button>
            </div>

            {/* Chiffre Groups */}
            {sortedChiffres.map((chiffre) => {
              const chiffreProtocols = protocolsByChiffre[chiffre];
              const isExpanded = expandedChiffres.has(chiffre);
              
              return (
                <Card key={chiffre} className="overflow-hidden">
                  {/* Chiffre Header */}
                  <button
                    onClick={() => toggleChiffre(chiffre)}
                    className="w-full flex items-center justify-between p-4 hover:bg-background/50 transition-colors -m-4 mb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <h3 className="text-xl font-bold text-on-surface-strong">
                        {chiffre}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-semibold">
                        {chiffreProtocols.length} {chiffreProtocols.length === 1 ? 'Protokoll' : 'Protokolle'}
                      </span>
                    </div>
                  </button>

                  {/* Protocols List for this Chiffre */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {chiffreProtocols.map((protocol, index) => (
                        <div 
                          key={protocol.id} 
                          className={`ml-8 p-4 rounded-lg bg-background/50 border-l-4 ${PROTOCOL_TYPE_BORDER_COLORS[protocol.protocolType]}`}
                        >
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            {/* Protocol Info */}
                            <div className="flex-grow space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-bold text-muted">#{index + 1}</span>
                                <span className="font-bold text-on-surface-strong">
                                  {protocol.protokollnummer}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-br ${PROTOCOL_TYPE_COLORS[protocol.protocolType]} text-white`}>
                                  {protocol.protocolType}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-on-surface">
                                <div>
                                  <span className="text-muted">Datum:</span>{' '}
                                  <span className="font-semibold">{formatDateGerman(protocol.datum)}</span>
                                </div>
                                <div className="text-xs text-muted">
                                  Geändert: {formatTimestamp(protocol.lastModified)}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => onEdit(protocol.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-semibold"
                                title="Bearbeiten"
                              >
                                <PencilIcon />
                                <span className="hidden sm:inline">Bearbeiten</span>
                              </button>

                              <button
                                onClick={() => onExportPDF(protocol.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-xs font-semibold"
                                title="PDF Export"
                              >
                                <PrinterIcon />
                                <span className="hidden sm:inline">PDF</span>
                              </button>

                              <button
                                onClick={() => onDelete(protocol.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-semibold"
                                title="Löschen"
                              >
                                <TrashIcon />
                                <span className="hidden sm:inline">Löschen</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

