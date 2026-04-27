import { useNavigate, useParams } from 'react-router-dom'
import { Typography, Row, Col, Button, ConfigProvider, Spin } from 'antd'
import { Mail, GraduationCap, Globe, BookOpen, Users, Hash } from 'lucide-react'

const { Title, Text } = Typography

// ─── Visual Identity ──────────────────────────────────────────────────────────
const C = {
  navy: '#21334E',
  blue: '#11499A',
  lightBlue: '#EBF1F9',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  muted: '#6b7280',
  border: '#d9d9d9',
  green: '#22c55e',
  red: '#ef4444',
  gray: '#9ca3af',
}
const FONT = "'Outfit', sans-serif"

// ─── Shared styles ────────────────────────────────────────────────────────────
const sectionTitleStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 15,
  color: C.navy,
  marginBottom: 14,
  marginTop: 20,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const labelStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 11,
  color: C.muted,
  fontWeight: 400,
  marginBottom: 2,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const valueStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 13,
  color: C.navy,
  fontWeight: 500,
  display: 'block',
  padding: '6px 10px',
  background: C.lightBlue,
  borderRadius: 4,
  minHeight: 32,
  lineHeight: '20px',
}

const linkStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 13,
  color: C.blue,
  fontWeight: 500,
  display: 'block',
  padding: '6px 10px',
  background: C.lightBlue,
  borderRadius: 4,
  minHeight: 32,
  lineHeight: '20px',
  textDecoration: 'none',
  wordBreak: 'break-all',
}

// ─── Read-only field ──────────────────────────────────────────────────────────
function ReadField({
  label,
  value,
  href,
}: {
  label: string
  value?: string | null
  href?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={labelStyle}>{label}</span>
      {href && value ? (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          style={linkStyle}
        >
          {value}
        </a>
      ) : (
        <span style={valueStyle}>{value ?? '—'}</span>
      )}
    </div>
  )
}

// ─── Statut badge ─────────────────────────────────────────────────────────────
function StatutBadge({ statut }: { statut: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    Actif: { bg: '#dcfce7', color: '#15803d' },
    Inactif: { bg: '#fee2e2', color: '#dc2626' },
    Retraite: { bg: '#f3f4f6', color: '#6b7280' },
  }
  const labels: Record<string, string> = {
    Actif: 'Actif',
    Inactif: 'Inactif',
    Retraite: 'Retraité',
  }
  const s = colors[statut] ?? { bg: C.lightBlue, color: C.navy }
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        padding: '3px 10px',
        borderRadius: 20,
        display: 'inline-block',
      }}
    >
      {labels[statut] ?? statut}
    </span>
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const getMockChercheur = (id: string) => ({
  chercheur_id: id,
  nom_complet: 'Dr.Boualem Khalouat',
  mails: ['b.khalouat@esi.dz', 'khalouat.boualem@gmail.com'],
  tel: '+213 550 123 456',
  diplome: "Doctorat d'État en Informatique",
  etablissement_origine: 'ESI',
  qualite: 'Professeur',
  grade_recherche: 'Directeur de recherche',
  statut: 'Actif',
  hindex: 14,
  url_dblp: 'https://dblp.org/pid/xx/xxxx.html',
  url_google_scholar: 'https://scholar.google.com/citations?user=xxxxx',
  url_researchgate: 'https://www.researchgate.net/profile/Boualem-Khalouat',
  url_site_personnel: null,
  // supervision stats
  totalEncadrements: 27,
  enCours: 12,
  enAttente: 5,
  termine: 10,
  pfe: 3,
  master: 8,
  doctorat: 2,
  stage: 12,
})

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DetailChercheur() {
  const { chercheurId } = useParams<{ chercheurId: string }>()
  const navigate = useNavigate()

  // TODO: replace with:
  // const { data: chercheur, isLoading } = useQuery({
  //   queryKey: ['chercheur', chercheurId],
  //   queryFn: () => chercheurApi.getChercheurById(chercheurId!),
  // })
  const chercheur = getMockChercheur(chercheurId ?? '')
  const isLoading = false

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <Spin size='large' />
      </div>
    )
  }

  const initial =
    chercheur.nom_complet
      .replace(/^(Dr\.|Pr\.)\s*/i, '')
      .trim()[0]
      ?.toUpperCase() ?? '?'

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: C.blue,
          fontFamily: FONT,
          borderRadius: 3,
          colorBorder: C.border,
        },
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FONT }}>
        <div
          style={{
            background: C.white,
            padding: '28px 36px 60px 36px',
            minHeight: '100vh',
          }}
        >
          {/* ── Hero header ──────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 28,
              paddingBottom: 24,
              borderBottom: `1px solid ${C.lightBlue}`,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: C.navy,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: C.white,
                  fontWeight: 800,
                  fontSize: 26,
                  fontFamily: FONT,
                }}
              >
                {initial}
              </span>
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <Title
                  level={3}
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.navy,
                    margin: 0,
                  }}
                >
                  {chercheur.nom_complet}
                </Title>
                <StatutBadge statut={chercheur.statut} />
              </div>
              <Text style={{ fontFamily: FONT, fontSize: 13, color: C.muted }}>
                {chercheur.qualite} · {chercheur.grade_recherche} ·{' '}
                {chercheur.etablissement_origine}
              </Text>
              <div style={{ marginTop: 4 }}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    color: C.blue,
                    fontWeight: 600,
                    background: C.lightBlue,
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  H-Index: {chercheur.hindex}
                </span>
              </div>
            </div>

            {/* Supervision stats mini */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Total', value: chercheur.totalEncadrements },
                { label: 'En cours', value: chercheur.enCours },
                { label: 'Terminés', value: chercheur.termine },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: C.navy,
                      fontFamily: FONT,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      fontFamily: FONT,
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 1. Informations personnelles ─────────────────────────────── */}
          <div style={sectionTitleStyle}>
            <Hash size={15} color={C.navy} />
            1. Identification
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <ReadField
                label='Matricule (ID)'
                value={chercheur.chercheur_id}
              />
            </Col>
            <Col span={8}>
              <ReadField label='Nom complet' value={chercheur.nom_complet} />
            </Col>
            <Col span={8}>
              <ReadField
                label='Statut'
                value={
                  chercheur.statut === 'Actif'
                    ? 'Actif'
                    : chercheur.statut === 'Inactif'
                      ? 'Inactif'
                      : 'Retraité'
                }
              />
            </Col>
          </Row>

          {/* ── 2. Contact ───────────────────────────────────────────────── */}
          <div style={sectionTitleStyle}>
            <Mail size={15} color={C.navy} />
            2. Contact
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <span style={labelStyle}>Emails</span>
                {chercheur.mails.length > 0 ? (
                  chercheur.mails.map((mail) => (
                    <span key={mail} style={{ ...valueStyle, marginBottom: 4 }}>
                      {mail}
                    </span>
                  ))
                ) : (
                  <span style={valueStyle}>—</span>
                )}
              </div>
            </Col>
            <Col span={12}>
              <ReadField label='Téléphone' value={chercheur.tel} />
            </Col>
          </Row>

          {/* ── 3. Parcours académique ───────────────────────────────────── */}
          <div style={sectionTitleStyle}>
            <GraduationCap size={15} color={C.navy} />
            3. Parcours académique
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <ReadField label='Diplôme' value={chercheur.diplome} />
            </Col>
            <Col span={12}>
              <ReadField
                label="Établissement d'origine"
                value={chercheur.etablissement_origine}
              />
            </Col>
          </Row>

          {/* ── 4. Classification professionnelle ───────────────────────── */}
          <div style={sectionTitleStyle}>
            <Users size={15} color={C.navy} />
            4. Classification professionnelle
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <ReadField label='Qualité' value={chercheur.qualite} />
            </Col>
            <Col span={8}>
              <ReadField
                label='Grade de recherche'
                value={chercheur.grade_recherche}
              />
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <span style={labelStyle}>H-Index</span>
                <span
                  style={{
                    ...valueStyle,
                    fontWeight: 700,
                    fontSize: 16,
                    color: C.blue,
                  }}
                >
                  {chercheur.hindex}
                </span>
              </div>
            </Col>
          </Row>

          {/* ── 5. Encadrements ─────────────────────────────────────────── */}
          <div style={sectionTitleStyle}>
            <BookOpen size={15} color={C.navy} />
            5. Encadrements
          </div>

          <Row gutter={16}>
            {[
              { label: 'Total', value: chercheur.totalEncadrements },
              { label: 'En cours', value: chercheur.enCours },
              { label: 'En attente', value: chercheur.enAttente },
              { label: 'Terminés', value: chercheur.termine },
            ].map((s) => (
              <Col span={6} key={s.label}>
                <div
                  style={{
                    marginBottom: 16,
                    textAlign: 'center',
                    padding: '12px 8px',
                    background: C.lightBlue,
                    borderRadius: 6,
                  }}
                >
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: C.navy,
                      fontFamily: FONT,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      fontFamily: FONT,
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              </Col>
            ))}
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            {[
              { label: 'PFE', value: chercheur.pfe },
              { label: 'Master', value: chercheur.master },
              { label: 'Doctorat', value: chercheur.doctorat },
              { label: 'Stage', value: chercheur.stage },
            ].map((s) => (
              <Col span={6} key={s.label}>
                <div
                  style={{
                    marginBottom: 16,
                    textAlign: 'center',
                    padding: '10px 8px',
                    background: C.lightBlue,
                    borderRadius: 6,
                  }}
                >
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: C.navy,
                      fontFamily: FONT,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      fontFamily: FONT,
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              </Col>
            ))}
          </Row>

          {/* ── 6. Présence en ligne ─────────────────────────────────────── */}
          <div style={sectionTitleStyle}>
            <Globe size={15} color={C.navy} />
            6. Présence en ligne
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <ReadField
                label='DBLP'
                value={chercheur.url_dblp}
                href={chercheur.url_dblp ?? undefined}
              />
            </Col>
            <Col span={12}>
              <ReadField
                label='Google Scholar'
                value={chercheur.url_google_scholar}
                href={chercheur.url_google_scholar ?? undefined}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <ReadField
                label='ResearchGate'
                value={chercheur.url_researchgate}
                href={chercheur.url_researchgate ?? undefined}
              />
            </Col>
            <Col span={12}>
              <ReadField
                label='Site personnel'
                value={chercheur.url_site_personnel}
                href={chercheur.url_site_personnel ?? undefined}
              />
            </Col>
          </Row>

          {/* ── Action buttons ───────────────────────────────────────────── */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              onClick={() => navigate(-1)}
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 500,
                borderColor: C.border,
                color: C.navy,
                borderRadius: 4,
                height: 36,
                paddingInline: 24,
              }}
            >
              Retour
            </Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
