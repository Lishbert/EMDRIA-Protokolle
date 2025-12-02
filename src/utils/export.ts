import jsPDF from 'jspdf';
import type { Protocol } from '../types';

// Format date to German format (DD.MM.YYYY)
const formatDateGerman = (isoDate: string): string => {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
};

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

