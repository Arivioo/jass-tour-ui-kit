import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RankingPlayer } from '@/types/jass';

interface PaymentRow {
  name: string;
  buyIn: number;
  fines: number;
  rankFine: number;
  total: number;
}

export function exportSessionPdf({
  date,
  location,
  rankings,
  payments,
  losliPlayerName,
}: {
  date: string;
  location: string;
  rankings: RankingPlayer[];
  payments: PaymentRow[];
  losliPlayerName?: string;
}) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Beize Jass Tour', 14, 20);
  doc.setFontSize(12);
  doc.text(`${date}${location ? ` - ${location}` : ''}`, 14, 28);

  // Rankings table
  doc.setFontSize(14);
  doc.text('Schlussrangliste', 14, 40);

  autoTable(doc, {
    startY: 44,
    head: [['Rang', 'Spieler', 'Siege']],
    body: rankings.map(r => [r.rank, r.name, r.wins]),
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 46] },
  });

  // Payments table
  const paymentsY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.text('Zahlungsübersicht', 14, paymentsY);

  autoTable(doc, {
    startY: paymentsY + 4,
    head: [['Spieler', 'Buy-In', 'Bussen', 'Rang-Busse', 'Total']],
    body: payments.map(p => [
      p.name,
      `CHF ${p.buyIn}`,
      `CHF ${p.fines}`,
      `CHF ${p.rankFine}`,
      `CHF ${p.total}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 46] },
    foot: [['Total', '', '', '', `CHF ${payments.reduce((s, p) => s + p.total, 0)}`]],
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
  });

  // Losli note
  if (losliPlayerName) {
    const losliY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Lösli: ${losliPlayerName} muss nächstes Mal Lösli kaufen.`, 14, losliY);
  }

  doc.save(`jass-session-${date.replace(/\s/g, '-')}.pdf`);
}
