import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Circle,
  FileSpreadsheet,
  FileText,
  Filter,
  LayoutList,
  Eye,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StepId = 1 | 2 | 3

type ReportRow = {
  title: string
  student: string
  type: string
  status: string
  supervisor: string
  year: string
  theme: string
}

const TYPE_OPTIONS = ['Tout', 'PFE', 'Master', 'Doctorat', 'Stage', 'Projet']
const TEACHER_OPTIONS = [
  'Tout',
  'Bougherroun Amine',
  'Bendib Nadia',
  'Khelif Rachid',
  'Saadi Imane',
]
const YEAR_OPTIONS = ['Tout', '2024-2025', '2025-2026']
const STATUS_OPTIONS = ['Tout', 'En cours', 'Terminé', 'Suspendu']
const THEME_OPTIONS = [
  'Tout',
  'Intelligence artificielle',
  'Cybersécurité',
  'Cloud',
  'IoT',
]

const REPORT_ROWS: ReportRow[] = [
  {
    title: 'Deep Learning for Medical Imaging',
    student: 'Ali Khelifi',
    type: 'Master',
    status: 'EN COURS',
    supervisor: 'Bougherroun Amine',
    year: '2025/2026',
    theme: 'Intelligence artificielle',
  },
  {
    title: 'Blockchain for Supply Chain',
    student: 'Sara Meziani',
    type: 'PFE',
    status: 'Terminé',
    supervisor: 'Bougherroun Amine',
    year: '2025/2026',
    theme: 'Cloud',
  },
  {
    title: 'IoT Security Framework',
    student: 'Youcef Benali',
    type: 'Master',
    status: 'EN COURS',
    supervisor: 'Bendib Nadia',
    year: '2025/2026',
    theme: 'IoT',
  },
  {
    title: 'AI for Healthcare Diagnostics',
    student: 'Amina Taleb',
    type: 'Doctorat',
    status: 'EN COURS',
    supervisor: 'Khelif Rachid',
    year: '2025/2026',
    theme: 'Intelligence artificielle',
  },
  {
    title: 'NLP for Arabic Text',
    student: 'Mohamed Khelifi',
    type: 'Master',
    status: 'EN COURS',
    supervisor: 'Saadi Imane',
    year: '2025/2026',
    theme: 'Cybersécurité',
  },
]

const REPORT_SECTIONS = [
  'Statistiques globales (types, taux de soutenance)',
  'Liste détaillée des thèses de Doctorat',
  'Liste détaillée des Masters et PFEs',
  'Bilan par équipe de recherche / évolution annuelle',
  'Répartition thématique (axes de recherche)',
]

function StepBadge({ step, current }: { step: StepId; current: StepId }) {
  const isDone = step < current
  const isCurrent = step === current

  return (
    <div className='flex items-center gap-2'>
      <span
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
          isDone
            ? 'bg-emerald-500 text-white'
            : isCurrent
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {isDone ? <CheckCircle2 className='size-4' /> : step}
      </span>
      <span
        className={cn(
          'whitespace-nowrap text-sm transition-colors',
          isCurrent || isDone ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {step === 1
          ? 'Période et filtres'
          : step === 2
            ? 'Contenu'
            : 'Aperçu et export'}
      </span>
    </div>
  )
}

function AnimatedStage({
  direction,
  children,
}: {
  direction: 'forward' | 'backward'
  children: ReactNode
}) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        entered
          ? 'translate-x-0 opacity-100'
          : direction === 'forward'
            ? 'translate-x-6 opacity-0'
            : '-translate-x-6 opacity-0',
      )}
    >
      {children}
    </div>
  )
}

function WizardFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <Card className='overflow-hidden border-border/60 bg-card shadow-sm'>
      <CardContent className='space-y-5 p-5 sm:p-6'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{subtitle}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (next: string) => void
}) {
  return (
    <label className='space-y-1.5'>
      <span className='text-sm font-medium text-foreground'>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='h-9 w-full rounded-md border border-border/70 bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20'
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function StatisticsReportsPage() {
  const [step, setStep] = useState<StepId>(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [selectedYear, setSelectedYear] = useState('Tout')
  const [selectedType, setSelectedType] = useState('Tout')
  const [selectedTeacher, setSelectedTeacher] = useState('Tout')
  const [selectedStatus, setSelectedStatus] = useState('Tout')
  const [selectedTheme, setSelectedTheme] = useState('Tout')
  const [selectedSections, setSelectedSections] = useState<string[]>([
    REPORT_SECTIONS[0],
    REPORT_SECTIONS[2],
    REPORT_SECTIONS[4],
  ])

  const visibleRows = useMemo(() => {
    return REPORT_ROWS.filter((row) => {
      if (selectedType !== 'Tout' && row.type !== selectedType) return false
      if (selectedTeacher !== 'Tout' && row.supervisor !== selectedTeacher)
        return false
      if (selectedYear !== 'Tout' && row.year !== selectedYear) return false
      if (selectedStatus !== 'Tout' && row.status !== selectedStatus)
        return false
      if (selectedTheme !== 'Tout' && row.theme !== selectedTheme) return false
      return true
    })
  }, [
    selectedType,
    selectedTeacher,
    selectedYear,
    selectedStatus,
    selectedTheme,
  ])

  const currentSelections = useMemo(
    () => [
      { label: 'Année', value: selectedYear },
      { label: 'Type', value: selectedType },
      { label: 'Statut', value: selectedStatus },
      { label: 'Thématique', value: selectedTheme },
    ],
    [selectedYear, selectedType, selectedStatus, selectedTheme],
  )

  const goForward = (nextStep: StepId) => {
    setDirection('forward')
    setStep(nextStep)
  }

  const goBack = (previousStep: StepId) => {
    setDirection('backward')
    setStep(previousStep)
  }

  const toggleSection = (section: string) => {
    setSelectedSections((current) =>
      current.includes(section)
        ? current.filter((value) => value !== section)
        : [...current, section],
    )
  }

  const exportToXlsx = () => {
    const rows = visibleRows.map((row) => ({
      Titre: row.title,
      Étudiant: row.student,
      Type: row.type,
      Statut: row.status,
      Encadrant: row.supervisor,
      Année: row.year,
      Thématique: row.theme,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bilan')
    XLSX.writeFile(wb, 'bilan.xlsx')
  }

  const exportToPdf = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor(31, 53, 87)
    doc.text('Bilan - LMCS', 14, 18)

    doc.setFontSize(10)
    doc.setTextColor(90, 99, 117)
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-DZ')}`, 14, 26)

    doc.setFontSize(11)
    doc.setTextColor(31, 53, 87)
    doc.text('Sélections', 14, 36)
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(
      currentSelections
        .map((item) => `${item.label} : ${item.value}`)
        .join(' | '),
      14,
      44,
      { maxWidth: 180 },
    )

    autoTable(doc, {
      startY: 54,
      head: [['Titre', 'Étudiant', 'Type', 'Statut', 'Encadrant', 'Année']],
      body: visibleRows.map((row) => [
        row.title,
        row.student,
        row.type,
        row.status,
        row.supervisor,
        row.year,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [31, 53, 87], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    })

    doc.save('bilan.pdf')
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Statistiques et rapports
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Bilan interactif avec transitions entre les trois vues demandées.
        </p>
      </div>

      <div className='mx-auto max-w-6xl rounded-3xl bg-[#edf4fb] p-4 sm:p-6'>
        <div className='rounded-2xl border border-white/70 bg-white shadow-sm'>
          <div className='space-y-4 border-b border-border/50 px-5 py-4'>
            <h2 className='text-lg font-semibold'>Générateur de rapport</h2>
            <div className='flex flex-wrap items-center gap-3'>
              <StepBadge step={1} current={step} />
              <div className='h-px flex-1 bg-border/70' />
              <StepBadge step={2} current={step} />
              <div className='h-px flex-1 bg-border/70' />
              <StepBadge step={3} current={step} />
            </div>
          </div>

          <div className='px-5 py-5 sm:px-6'>
            {step === 1 && (
              <AnimatedStage key='step-1' direction={direction}>
                <WizardFrame
                  title='Période et filtres'
                  subtitle='Définissez la période, puis affinez avec les filtres optionnels.'
                >
                  <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
                    <SelectField
                      label='Type'
                      value={selectedType}
                      options={TYPE_OPTIONS}
                      onChange={setSelectedType}
                    />
                    <SelectField
                      label='Enseignant'
                      value={selectedTeacher}
                      options={TEACHER_OPTIONS}
                      onChange={setSelectedTeacher}
                    />
                    <SelectField
                      label='Année universitaire'
                      value={selectedYear}
                      options={YEAR_OPTIONS}
                      onChange={setSelectedYear}
                    />
                    <SelectField
                      label='Statut'
                      value={selectedStatus}
                      options={STATUS_OPTIONS}
                      onChange={setSelectedStatus}
                    />
                    <SelectField
                      label='Thématique'
                      value={selectedTheme}
                      options={THEME_OPTIONS}
                      onChange={setSelectedTheme}
                    />
                  </div>

                  <div className='flex justify-start pt-2'>
                    <Button
                      onClick={() => goForward(2)}
                      className='inline-flex items-center gap-2 bg-[#1f3557] text-white hover:bg-[#172944]'
                    >
                      Suivant
                      <ArrowRight className='size-4' />
                    </Button>
                  </div>
                </WizardFrame>
              </AnimatedStage>
            )}

            {step === 2 && (
              <AnimatedStage key='step-2' direction={direction}>
                <WizardFrame
                  title='Contenu'
                  subtitle='Sélectionnez les sections à inclure dans le rapport généré.'
                >
                  <div className='space-y-3'>
                    {REPORT_SECTIONS.map((section) => (
                      <label
                        key={section}
                        className='flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border/60 hover:bg-muted/30'
                      >
                        <input
                          type='checkbox'
                          checked={selectedSections.includes(section)}
                          onChange={() => toggleSection(section)}
                          className='mt-1 rounded border-border text-primary focus:ring-primary/30'
                        />
                        <span className='text-sm text-foreground'>
                          {section}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className='flex flex-wrap gap-3 pt-2'>
                    <Button
                      variant='outline'
                      onClick={() => goBack(1)}
                      className='inline-flex items-center gap-2'
                    >
                      <ChevronLeft className='size-4' />
                      Retour
                    </Button>
                    <Button
                      onClick={() => goForward(3)}
                      className='inline-flex items-center gap-2 bg-[#1f3557] text-white hover:bg-[#172944]'
                    >
                      Générer l’aperçu
                      <ArrowRight className='size-4' />
                    </Button>
                  </div>
                </WizardFrame>
              </AnimatedStage>
            )}

            {step === 3 && (
              <AnimatedStage key='step-3' direction={direction}>
                <WizardFrame
                  title='Aperçu et export'
                  subtitle='Vérifiez le résultat avant d’exporter le document final.'
                >
                  <div className='mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground'>
                    {currentSelections.map((item) => (
                      <span
                        key={item.label}
                        className='rounded-full bg-muted px-3 py-1'
                      >
                        {item.label}: {item.value}
                      </span>
                    ))}
                  </div>

                  <div className='overflow-x-auto rounded-xl border border-border/60'>
                    <table className='min-w-full divide-y divide-border/60 text-sm'>
                      <thead className='bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                        <tr>
                          <th className='px-4 py-3'>Titre</th>
                          <th className='px-4 py-3'>Étudiant</th>
                          <th className='px-4 py-3'>Type</th>
                          <th className='px-4 py-3'>Statut</th>
                          <th className='px-4 py-3'>Encadrant</th>
                          <th className='px-4 py-3'>Année</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-border/60 bg-white'>
                        {visibleRows.map((row) => (
                          <tr key={row.title} className='hover:bg-muted/20'>
                            <td className='px-4 py-3 font-medium text-foreground'>
                              {row.title}
                            </td>
                            <td className='px-4 py-3 text-muted-foreground'>
                              {row.student}
                            </td>
                            <td className='px-4 py-3'>{row.type}</td>
                            <td className='px-4 py-3'>{row.status}</td>
                            <td className='px-4 py-3 text-muted-foreground'>
                              {row.supervisor}
                            </td>
                            <td className='px-4 py-3 text-muted-foreground'>
                              {row.year}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className='mt-4 flex flex-wrap gap-3'>
                    <Button
                      variant='outline'
                      onClick={() => goBack(2)}
                      className='inline-flex items-center gap-2'
                    >
                      <ChevronLeft className='size-4' />
                      Retour
                    </Button>
                    <Button
                      onClick={exportToPdf}
                      className='inline-flex items-center gap-2 bg-[#1f3557] text-white hover:bg-[#172944]'
                    >
                      <FileText className='size-4' />
                      Export en PDF
                    </Button>
                    <Button
                      onClick={exportToXlsx}
                      className='inline-flex items-center gap-2 bg-[#1f3557] text-white hover:bg-[#172944]'
                    >
                      <FileSpreadsheet className='size-4' />
                      Export en EXCEL
                    </Button>
                  </div>
                </WizardFrame>
              </AnimatedStage>
            )}
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='border-border/60 bg-card/80'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <Filter className='size-4 text-muted-foreground' />
              Étape active
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            {step === 1
              ? 'Ajustez la période et les filtres.'
              : step === 2
                ? 'Choisissez les sections à générer.'
                : 'Prévisualisez et exportez le rapport.'}
          </CardContent>
        </Card>

        <Card className='border-border/60 bg-card/80'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <LayoutList className='size-4 text-muted-foreground' />
              Sections sélectionnées
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm text-muted-foreground'>
            {selectedSections.map((section) => (
              <div key={section} className='flex items-center gap-2'>
                <Circle className='size-3 fill-current' />
                <span>{section}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='border-border/60 bg-card/80'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <Eye className='size-4 text-muted-foreground' />
              Résultat filtré
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            {visibleRows.length} ligne{visibleRows.length > 1 ? 's' : ''} prête
            {visibleRows.length > 1 ? 's' : ''} pour le rapport.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
