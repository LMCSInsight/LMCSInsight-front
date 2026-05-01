import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Supervision } from '@/features/supervisions/types'
import {
  studentDisplayName,
  supervisorsDisplayLine,
  themeDisplay,
  SUPERVISION_TYPE_LABEL_FR,
  supervisionStatusBadgeLabel,
} from '@/features/direction/lib/supervisionUi'

function dateSlug(): string {
  return new Date().toISOString().slice(0, 10)
}

function lastTableBottom(doc: jsPDF): number {
  const d = doc as jsPDF & { lastAutoTable?: { finalY: number } }
  return d.lastAutoTable?.finalY ?? 40
}

export type AnalyticsExportTotals = {
  totalSupervisions: number
  teamCount: number
  avgPerTeam: number
}

// Note: analytics Excel export removed. Use PDF export only via `downloadDirectionAnalyticsPdf`.

export function downloadDirectionAnalyticsPdf(payload: {
  title: string
  generatedLine: string
  totals: AnalyticsExportTotals
  thematicBarsData: { name: string; count: number }[]
  evolutionByYear: { year: string; total: number }[]
  typePieData: { name: string; value: number }[]
  statusChartData: { name: string; count: number }[]
  evolutionSeriesName: string
}): void {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.setTextColor(33, 51, 78)
  doc.text(payload.title, 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(payload.generatedLine, 14, 24)
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(
    [
      `• Total encadrements : ${payload.totals.totalSupervisions}`,
      `• Équipes (annuaire) : ${payload.totals.teamCount}`,
      `• Moyenne / équipe : ${payload.totals.avgPerTeam}`,
    ],
    14,
    34,
  )

  autoTable(doc, {
    startY: 52,
    head: [['Thématique', 'Encadrements']],
    body: payload.thematicBarsData.map((d) => [d.name, String(d.count)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [51, 65, 85] },
  })

  autoTable(doc, {
    startY: lastTableBottom(doc) + 10,
    head: [['Année', payload.evolutionSeriesName]],
    body: payload.evolutionByYear.map((d) => [d.year, String(d.total)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [51, 65, 85] },
  })

  autoTable(doc, {
    startY: lastTableBottom(doc) + 10,
    head: [['Type', 'Nombre']],
    body: payload.typePieData.map((d) => [d.name, String(d.value)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [51, 65, 85] },
  })

  autoTable(doc, {
    startY: lastTableBottom(doc) + 10,
    head: [['Indicateur', 'Nombre']],
    body: payload.statusChartData.map((d) => [d.name, String(d.count)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [51, 65, 85] },
  })

  doc.save(`lmcs-analytics-direction-${dateSlug()}.pdf`)
}

export function downloadDirectionPreviewExcel(
  supervisions: Supervision[],
): void {
  const rows = supervisions.map((s) => ({
    Titre: s.title,
    Étudiant: studentDisplayName(s),
    'Email étudiant': s.student?.email ?? '',
    Type: SUPERVISION_TYPE_LABEL_FR[s.type],
    Encadrants: supervisorsDisplayLine(s),
    'Emails encadrants': (s.supervisors ?? [])
      .flatMap((sup) => sup.supervisor?.mails ?? [])
      .filter(Boolean)
      .join(', '),
    Thème: themeDisplay(s),
    'Mots-clés': (s.keywords ?? []).join(', '),
    'Année univ.': s.academicYear,
    Statut: supervisionStatusBadgeLabel(s),
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Encadrements')
  XLSX.writeFile(wb, `lmcs-rapport-filtre-${dateSlug()}.xlsx`)
}

export function downloadDirectionPreviewPdf(
  supervisions: Supervision[],
  tableHead: string[],
): void {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.setTextColor(33, 51, 78)
  doc.text('LMCS — Encadrements (filtre)', 14, 14)
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 22)

  const body = supervisions.map((s) => [
    s.title,
    studentDisplayName(s),
    SUPERVISION_TYPE_LABEL_FR[s.type],
    supervisorsDisplayLine(s),
    themeDisplay(s),
    s.academicYear,
    supervisionStatusBadgeLabel(s),
  ])

  autoTable(doc, {
    startY: 28,
    head: [tableHead],
    body,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 28 },
      2: { cellWidth: 22 },
      3: { cellWidth: 42 },
      4: { cellWidth: 36 },
      5: { cellWidth: 22 },
      6: { cellWidth: 28 },
    },
  })

  doc.save(`lmcs-rapport-filtre-${dateSlug()}.pdf`)
}
