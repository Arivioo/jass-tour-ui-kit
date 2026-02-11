import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function Statuten() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Statuten</h1>
        <p className="text-muted-foreground">Regeln und Bussen der Beize Jass Tour</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Statuten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
{STATUTEN_TEXT}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

const STATUTEN_TEXT = `STATUTEN DER BEIZE JASS TOUR
=============================

1. ALLGEMEINES
--------------
Die Beize Jass Tour ist ein regelmässiger Jass-Abend unter Freunden.

2. TEILNAHME
------------
- Buy-In: CHF 25.– pro Abend
- Fester Spielerkreis: 4 Spieler
- Spielort wechselt nach Absprache

3. BUSSEN
---------
- Eichle Banner: CHF 5.–
- Match verloren: CHF 10.–
- Weniger Punkte (Abend): CHF 5.–
- 4 Gliichi: CHF 5.– (doppelt: CHF 10.–)
- Charte Lüpfe: CHF 5.–

4. RANG-BUSSEN (Ende Abend)
---------------------------
- 1. Platz: CHF 0.–
- 2. Platz: CHF 10.–
- 3. Platz: CHF 15.–
- 4. Platz: CHF 20.–

5. LÖSLI
--------
Wer als Erster nach Hause geht, bringt nächstes Mal Lösli mit.

6. DIVERSES
-----------
Änderungen an diesen Statuten bedürfen der Zustimmung aller Spieler.`;
