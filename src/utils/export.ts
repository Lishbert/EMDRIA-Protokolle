import jsPDF from 'jspdf';
import type { Protocol, StandardProtocol, IRIProtocol, isIRIProtocol } from '../types';
import {
  INDIKATION_OPTIONS,
  KOERPERLOKALISATION_OPTIONS,
  KOERPEREMPFINDUNG_OPTIONS,
  STIMULATION_TYP_OPTIONS,
  SET_GESCHWINDIGKEIT_OPTIONS,
} from '../constants';

// Format date to German format (DD.MM.YYYY)
const formatDateGerman = (isoDate: string): string => {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
};

// Helper to get label for value
const getLabel = <T extends string>(
  options: { value: T; label: string }[],
  value: T
): string => {
  return options.find((o) => o.value === value)?.label || value;
};

// Check if protocol is IRI
function checkIsIRI(protocol: Protocol): protocol is IRIProtocol {
  return protocol.protocolType === 'IRI';
}

// Export a single protocol as JSON
export const exportProtocolAsJSON = (protocol: Protocol): void => {
  try {
    const dataStr = JSON.stringify(protocol, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    const filename = `EMDR_${protocol.chiffre}_${protocol.datum}_${protocol.protokollnummer}.json`;
    link.download = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting protocol as JSON:', error);
    throw new Error('Failed to export protocol as JSON.');
  }
};

// Export a single protocol as PDF
export const exportProtocolAsPDF = (protocol: Protocol): void => {
  if (checkIsIRI(protocol)) {
    exportIRIProtocolAsPDF(protocol);
  } else {
    exportStandardProtocolAsPDF(protocol as StandardProtocol);
  }
};

// Export Standard Protocol as PDF
const exportStandardProtocolAsPDF = (protocol: StandardProtocol): void => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    let yPos = margin;

    // Header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EMDR Protokoll', margin, yPos);
    yPos += 10;

    // Metadata box
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Draw metadata box
    pdf.setDrawColor(100, 100, 100);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPos, contentWidth, 25, 'F');
    pdf.rect(margin, yPos, contentWidth, 25, 'S');
    
    yPos += 5;
    pdf.text(`Chiffre: ${protocol.chiffre}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Datum: ${formatDateGerman(protocol.datum)}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Protokollnummer: ${protocol.protokollnummer}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Protokolltyp: ${protocol.protocolType}`, margin + 5, yPos);
    yPos += 10;

    // Startknoten section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Startknoten', margin, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const startKnotenLines = pdf.splitTextToSize(protocol.startKnoten || '-', contentWidth);
    pdf.text(startKnotenLines, margin, yPos);
    yPos += startKnotenLines.length * 5 + 10;

    // Channel section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kanal (Stimulationen & Fragmente)', margin, yPos);
    yPos += 7;

    if (protocol.channel.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100);
      pdf.text('Keine Stimulation-Fragment-Paare eingetragen.', margin, yPos);
      pdf.setTextColor(0);
    } else {
      protocol.channel.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - margin - 40) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. Paar`, margin, yPos);
        yPos += 6;

        // Stimulation
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Stimulation:', margin + 3, yPos);
        yPos += 5;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`   Anzahl Bewegungen: ${item.stimulation.anzahlBewegungen}`, margin + 3, yPos);
        yPos += 5;
        pdf.text(`   Geschwindigkeit: ${item.stimulation.geschwindigkeit}`, margin + 3, yPos);
        yPos += 7;

        // Fragment
        pdf.setFont('helvetica', 'bold');
        pdf.text('Fragment:', margin + 3, yPos);
        yPos += 5;
        
        pdf.setFont('helvetica', 'normal');
        const fragmentLines = pdf.splitTextToSize(item.fragment.text, contentWidth - 6);
        pdf.text(fragmentLines, margin + 6, yPos);
        yPos += fragmentLines.length * 5;

        // Einwebung if present (indented with arrow, "Einwebung" bold, text on same line)
        if (item.fragment.einwebung && item.fragment.einwebung.trim()) {
          // Check if we need a new page
          if (yPos > pageHeight - margin - 20) {
            pdf.addPage();
            yPos = margin;
          }
          
          yPos += 2;
          
          // Arrow and "Einwebung:" label in bold
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('-> Einwebung:', margin + 12, yPos);
          
          // Einwebung text in normal font, on same line with tab space
          pdf.setFont('helvetica', 'normal');
          const labelWidth = 32; // Width for "-> Einwebung:" + tab space
          const einwebungLines = pdf.splitTextToSize(item.fragment.einwebung, contentWidth - 12 - labelWidth);
          pdf.text(einwebungLines, margin + 12 + labelWidth, yPos);
          yPos += einwebungLines.length * 4;
          
          pdf.setFontSize(10);
        }

        // Notes if present
        if (item.fragment.notizen && item.fragment.notizen.trim()) {
          yPos += 2;
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(80);
          const notesLines = pdf.splitTextToSize(`Notizen: ${item.fragment.notizen}`, contentWidth - 6);
          pdf.text(notesLines, margin + 6, yPos);
          yPos += notesLines.length * 4.5;
          pdf.setTextColor(0);
          pdf.setFontSize(10);
        }

        yPos += 5; // Space between pairs
      });
    }

    // Footer with timestamp
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Erstellt am ${new Date().toLocaleString('de-DE')}`, margin, pageHeight - 10);
    pdf.setTextColor(0);

    // Save PDF
    const filename = `EMDR_${protocol.chiffre}_${protocol.datum}_${protocol.protokollnummer}.pdf`;
    pdf.save(filename.replace(/[^a-zA-Z0-9_.-]/g, '_'));
  } catch (error) {
    console.error('Error exporting protocol as PDF:', error);
    throw new Error('Failed to export protocol as PDF.');
  }
};

// Export IRI Protocol as PDF
const exportIRIProtocolAsPDF = (protocol: IRIProtocol): void => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    let yPos = margin;

    // Helper to check for new page
    const checkNewPage = (requiredSpace: number = 30) => {
      if (yPos > pageHeight - margin - requiredSpace) {
        pdf.addPage();
        yPos = margin;
      }
    };

    // Helper to add section header
    const addSectionHeader = (number: number, title: string) => {
      checkNewPage(20);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(128, 90, 213); // Purple color for IRI
      pdf.text(`${number}. ${title}`, margin, yPos);
      pdf.setTextColor(0);
      yPos += 7;
    };

    // Helper to add field
    const addField = (label: string, value: string | undefined | null, indent: number = 0) => {
      if (!value) return;
      checkNewPage(15);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${label}:`, margin + indent, yPos);
      yPos += 4;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(value, contentWidth - indent);
      pdf.text(lines, margin + indent, yPos);
      yPos += lines.length * 4 + 3;
    };

    // Header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(128, 90, 213);
    pdf.text('IRI Protokoll', margin, yPos);
    pdf.setTextColor(0);
    yPos += 10;

    // Section 1: Metadata box
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setDrawColor(128, 90, 213);
    pdf.setFillColor(248, 245, 255);
    pdf.rect(margin, yPos, contentWidth, 25, 'F');
    pdf.rect(margin, yPos, contentWidth, 25, 'S');
    
    yPos += 5;
    pdf.text(`Chiffre: ${protocol.chiffre}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Datum: ${formatDateGerman(protocol.datum)}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Protokollnummer: ${protocol.protokollnummer}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Protokolltyp: IRI (Integration of Resource Information)`, margin + 5, yPos);
    yPos += 12;

    // Section 2: Indikation / Ausgangslage
    addSectionHeader(2, 'Indikation / Ausgangslage');
    
    if (protocol.indikation.indikation_checklist.length > 0) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Indikation:', margin, yPos);
      yPos += 4;
      pdf.setFont('helvetica', 'normal');
      protocol.indikation.indikation_checklist.forEach((item) => {
        const label = getLabel(INDIKATION_OPTIONS, item);
        pdf.text(`• ${label}`, margin + 3, yPos);
        yPos += 4;
      });
      if (protocol.indikation.indikation_sonstiges) {
        pdf.text(`  → ${protocol.indikation.indikation_sonstiges}`, margin + 6, yPos);
        yPos += 4;
      }
      yPos += 2;
    }

    addField('Ausgangszustand', protocol.indikation.ausgangszustand_beschreibung);
    addField('Ziel der IRI', protocol.indikation.ziel_der_iri);

    // Section 3: Positiver Moment
    addSectionHeader(3, 'Auslöser der Ressource / Positiver Moment');
    addField('Positiver Moment', protocol.positiver_moment.positiver_moment_beschreibung);
    addField('Kontext', protocol.positiver_moment.kontext_positiver_moment);
    addField('Beobachtete Veränderung', protocol.positiver_moment.wahrgenommene_positive_veraenderung);
    
    if (protocol.positiver_moment.veraenderung_mimik || 
        protocol.positiver_moment.veraenderung_verbale_ausdrucksweise ||
        protocol.positiver_moment.veraenderung_koerperhaltung) {
      checkNewPage(20);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(80);
      if (protocol.positiver_moment.veraenderung_mimik) {
        pdf.text(`Mimik: ${protocol.positiver_moment.veraenderung_mimik}`, margin + 3, yPos);
        yPos += 4;
      }
      if (protocol.positiver_moment.veraenderung_verbale_ausdrucksweise) {
        pdf.text(`Verbal: ${protocol.positiver_moment.veraenderung_verbale_ausdrucksweise}`, margin + 3, yPos);
        yPos += 4;
      }
      if (protocol.positiver_moment.veraenderung_koerperhaltung) {
        pdf.text(`Körperhaltung: ${protocol.positiver_moment.veraenderung_koerperhaltung}`, margin + 3, yPos);
        yPos += 4;
      }
      pdf.setTextColor(0);
      yPos += 2;
    }

    // Section 4: Körperwahrnehmung
    addSectionHeader(4, 'Körperwahrnehmung');
    addField('Patientenbeschreibung', protocol.koerperwahrnehmung.koerperwahrnehmung_rohtext);
    
    if (protocol.koerperwahrnehmung.koerperlokalisation.length > 0) {
      checkNewPage(15);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lokalisation:', margin, yPos);
      yPos += 4;
      pdf.setFont('helvetica', 'normal');
      const lokLabels = protocol.koerperwahrnehmung.koerperlokalisation
        .map((v) => getLabel(KOERPERLOKALISATION_OPTIONS, v))
        .join(', ');
      const lokLines = pdf.splitTextToSize(lokLabels, contentWidth - 3);
      pdf.text(lokLines, margin + 3, yPos);
      yPos += lokLines.length * 4 + 2;
    }

    if (protocol.koerperwahrnehmung.qualitaet_koerperempfindung.length > 0) {
      checkNewPage(15);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Qualität:', margin, yPos);
      yPos += 4;
      pdf.setFont('helvetica', 'normal');
      const qualLabels = protocol.koerperwahrnehmung.qualitaet_koerperempfindung
        .map((v) => getLabel(KOERPEREMPFINDUNG_OPTIONS, v))
        .join(', ');
      const qualLines = pdf.splitTextToSize(qualLabels, contentWidth - 3);
      pdf.text(qualLines, margin + 3, yPos);
      yPos += qualLines.length * 4 + 2;
    }

    // Section 5: LOPE vorher
    addSectionHeader(5, 'LOPE – Level of Positive Emotion (vor Stimulation)');
    if (protocol.lope_vorher !== undefined) {
      checkNewPage(10);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(128, 90, 213);
      pdf.text(`LOPE vorher: ${protocol.lope_vorher}/10`, margin, yPos);
      pdf.setTextColor(0);
      yPos += 8;
    }

    // Section 6: Bilaterale Stimulation
    addSectionHeader(6, 'Bilaterale Stimulation');
    
    const stimTypLabel = getLabel(STIMULATION_TYP_OPTIONS, protocol.bilaterale_stimulation.stimulation_typ);
    addField('Stimulationstyp', stimTypLabel);
    
    if (protocol.bilaterale_stimulation.stimulation_typ_sonstiges) {
      addField('Beschreibung', protocol.bilaterale_stimulation.stimulation_typ_sonstiges, 3);
    }
    addField('Bemerkungen', protocol.bilaterale_stimulation.stimulation_bemerkungen_allgemein);

    // Sets
    if (protocol.bilaterale_stimulation.sets.length > 0) {
      checkNewPage(20);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Stimulationssets:', margin, yPos);
      yPos += 6;

      protocol.bilaterale_stimulation.sets.forEach((set) => {
        checkNewPage(35);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(128, 90, 213);
        pdf.text(`Set ${set.set_nummer}`, margin + 3, yPos);
        pdf.setTextColor(0);
        yPos += 5;

        pdf.setFont('helvetica', 'normal');
        const geschw = getLabel(SET_GESCHWINDIGKEIT_OPTIONS, set.set_geschwindigkeit);
        pdf.text(`Geschwindigkeit: ${geschw}${set.set_dauer ? ` | Dauer: ${set.set_dauer}` : ''}${set.set_anzahl_durchgaenge ? ` | Durchgänge: ${set.set_anzahl_durchgaenge}` : ''}`, margin + 6, yPos);
        yPos += 4;

        if (set.instruktion_text) {
          const instrLines = pdf.splitTextToSize(`Instruktion: ${set.instruktion_text}`, contentWidth - 9);
          pdf.text(instrLines, margin + 6, yPos);
          yPos += instrLines.length * 4;
        }

        if (set.subjektive_wahrnehmung_nach_set) {
          const wahrLines = pdf.splitTextToSize(`Wahrnehmung: ${set.subjektive_wahrnehmung_nach_set}`, contentWidth - 9);
          pdf.text(wahrLines, margin + 6, yPos);
          yPos += wahrLines.length * 4;
        }

        if (set.lope_nach_set !== undefined) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`LOPE nach Set: ${set.lope_nach_set}/10`, margin + 6, yPos);
          pdf.setFont('helvetica', 'normal');
          yPos += 4;
        }

        yPos += 3;
      });
    }

    // Section 7: LOPE Abschluss
    addSectionHeader(7, 'LOPE – Abschlussbewertung');
    if (protocol.lope_nachher !== undefined) {
      checkNewPage(15);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(128, 90, 213);
      pdf.text(`LOPE nachher: ${protocol.lope_nachher}/10`, margin, yPos);
      
      if (protocol.lope_vorher !== undefined) {
        const change = protocol.lope_nachher - protocol.lope_vorher;
        const changeStr = change > 0 ? `+${change}` : `${change}`;
        pdf.setTextColor(change >= 0 ? 0 : 200, change >= 0 ? 150 : 0, 0);
        pdf.text(`  (Veränderung: ${changeStr})`, margin + 50, yPos);
      }
      pdf.setTextColor(0);
      yPos += 8;
    }

    // Section 8: Ressourcen-Einschätzung
    addSectionHeader(8, 'Einschätzung der Ressource & Integration');
    
    if (protocol.ressourcen_einschaetzung.ressource_spuerbarkeit) {
      addField('Spürbarkeit der Ressource', `${protocol.ressourcen_einschaetzung.ressource_spuerbarkeit}/5`);
    }
    if (protocol.ressourcen_einschaetzung.ressource_erreichbarkeit_im_alltag) {
      addField('Erreichbarkeit im Alltag', `${protocol.ressourcen_einschaetzung.ressource_erreichbarkeit_im_alltag}/5`);
    }
    addField('Anker für den Alltag', protocol.ressourcen_einschaetzung.anker_fuer_alltag);
    addField('Vereinbarte Hausaufgabe', protocol.ressourcen_einschaetzung.vereinbarte_hausaufgabe);
    addField('Bemerkungen Risiko/Stabilität', protocol.ressourcen_einschaetzung.bemerkungen_risiko_stabilitaet);

    // Section 9: Gesamtkommentar
    addSectionHeader(9, 'Gesamtkommentar der Therapeut:in');
    addField('Reflexion zum Verlauf', protocol.abschluss.therapeut_reflexion);
    addField('Nächste Schritte', protocol.abschluss.naechste_schritte_behandlung);

    // Section 10: Einwilligung
    addSectionHeader(10, 'Einwilligung / Dokumentation');
    checkNewPage(15);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const einwilligungText = protocol.abschluss.einwilligung_dokumentation 
      ? '☑ Patient:in wurde über die Methode informiert und war einverstanden.'
      : '☐ Einwilligung nicht dokumentiert';
    pdf.text(einwilligungText, margin, yPos);
    yPos += 5;
    
    if (protocol.abschluss.signatur_therapeut) {
      pdf.text(`Signatur: ${protocol.abschluss.signatur_therapeut}`, margin, yPos);
      yPos += 5;
    }

    // Footer with timestamp
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Erstellt am ${new Date().toLocaleString('de-DE')} | Seite ${i}/${totalPages}`, margin, pageHeight - 10);
      pdf.setTextColor(0);
    }

    // Save PDF
    const filename = `IRI_${protocol.chiffre}_${protocol.datum}_${protocol.protokollnummer}.pdf`;
    pdf.save(filename.replace(/[^a-zA-Z0-9_.-]/g, '_'));
  } catch (error) {
    console.error('Error exporting IRI protocol as PDF:', error);
    throw new Error('Failed to export IRI protocol as PDF.');
  }
};
