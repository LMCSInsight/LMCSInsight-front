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

export function downloadDirectionAnalyticsExcel(payload: {
  totals: AnalyticsExportTotals
  thematicBarsData: { name: string; count: number }[]
  evolutionByYear: { year: string; total: number }[]
  typePieData: { name: string; value: number }[]
  statusChartData: { name: string; count: number }[]
}): void {
  const wb = XLSX.utils.book_new()
  const ws0 = XLSX.utils.json_to_sheet([
    {
      'Total encadrements': payload.totals.totalSupervisions,
      Équipes: payload.totals.teamCount,
      'Moyenne / équipe': payload.totals.avgPerTeam,
    },
  ])
  XLSX.utils.book_append_sheet(wb, ws0, 'Résumé')
  const ws1 = XLSX.utils.json_to_sheet(
    payload.thematicBarsData.map((d) => ({
      Thématique: d.name,
      Encadrements: d.count,
    })),
  )
  XLSX.utils.book_append_sheet(wb, ws1, 'Thématiques')
  const ws2 = XLSX.utils.json_to_sheet(
    payload.evolutionByYear.map((d) => ({
      'Année universitaire': d.year,
      Total: d.total,
    })),
  )
  XLSX.utils.book_append_sheet(wb, ws2, 'Par année')
  const ws3 = XLSX.utils.json_to_sheet(
    payload.typePieData.map((d) => ({ Type: d.name, Nombre: d.value })),
  )
  XLSX.utils.book_append_sheet(wb, ws3, 'Par type')
  const ws4 = XLSX.utils.json_to_sheet(
    payload.statusChartData.map((d) => ({
      Indicateur: d.name,
      Nombre: d.count,
    })),
  )
  XLSX.utils.book_append_sheet(wb, ws4, 'Statuts')
  XLSX.writeFile(wb, `lmcs-analytics-direction-${dateSlug()}.xlsx`)
}

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
    Type: SUPERVISION_TYPE_LABEL_FR[s.type],
    Encadrants: supervisorsDisplayLine(s),
    Thème: themeDisplay(s),
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
