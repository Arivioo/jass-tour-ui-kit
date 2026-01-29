import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Save } from 'lucide-react';

export default function Statuten() {
  const [textContent, setTextContent] = useState(PLACEHOLDER_STATUTEN);

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Tabs defaultValue="text">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
              <TabsTrigger value="pdf" className="flex-1">PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Statuten hier eingeben..."
              />
              <Button className="w-full gap-2">
                <Save className="h-4 w-4" />
                Speichern
              </Button>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-4">
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 font-semibold">PDF hochladen</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Ziehe eine PDF-Datei hierher oder klicke zum Auswählen
                </p>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Datei auswählen
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const PLACEHOLDER_STATUTEN = `STATUTEN DER BEIZE JASS TOUR
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
Änderungen an diesen Statuten bedürfen der Zustimmung aller Spieler.
`;
