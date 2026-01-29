import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Info } from 'lucide-react';

export default function Rangliste() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Ewige Rangliste</h1>
        <p className="text-muted-foreground">Alle Siege und Punkte aller Zeiten</p>
      </div>

      {/* Placeholder Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Rangliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rang</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Siege</TableHead>
                <TableHead className="text-right">Punkte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4].map((rank) => (
                <TableRow key={rank} className="text-muted-foreground">
                  <TableCell className="font-medium">{rank}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">—</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h4 className="font-medium">Daten folgen</h4>
            <p className="text-sm text-muted-foreground">
              Die ewige Rangliste wird automatisch aktualisiert, sobald Sessions abgeschlossen werden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
