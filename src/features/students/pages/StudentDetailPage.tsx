import { Typography, Row, Col, Button, ConfigProvider, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

const { Title, Text } = Typography

const C = {
  navy: '#21334E',
  blue: '#11499A',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  muted: '#6b7280',
  border: '#d9d9d9',
  lightBlue: '#EBF1F9',
}
const FONT = "'Outfit', sans-serif"

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 15,
  color: C.navy,
  marginBottom: 14,
  marginTop: 18,
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

// ─── Read-only field ──────────────────────────────────────────────────────────
function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value ?? '—'}</span>
    </div>
  )
}

// TODO: Replace with useQuery → studentApi.getStudentById(studentId)
const getMockStudent = () => ({
  firstName: 'Mohammed Elamin',
  lastName: 'Beghernaout',
  email: 'oa_beghernaout@esi.dz',
  institution: 'ESI',
  level: 'Master',
  specialty: 'SID',
  nbSupervisions: 2,
  createdAt: '2024-09-01',
})

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()

  // TODO: Replace mock with:
  // const { data: student, isLoading } = useQuery({
  //   queryKey: ['student', studentId],
  //   queryFn: () => studentApi.getStudentById(studentId!),
  // })
  const student = getMockStudent()
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FONT }}>
        <div
          style={{
            background: C.white,
            padding: '24px 32px 60px 32px',
            minHeight: '100vh',
          }}
        >
          {/* ── Header ────────────────────────────────────────────────── */}
          <Title
            level={3}
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 20,
              color: C.navy,
              marginBottom: 2,
            }}
          >
            Détails de l&apos;étudiant
          </Title>
          <Text style={{ fontFamily: FONT, fontSize: 12, color: C.muted }}>
            Informations complètes de l&apos;étudiant. Lecture seule.
          </Text>

          <div style={{ marginTop: 24 }}>
            {/* ══ 1. Informations personnelles ══════════════════════════ */}
            <div style={sectionTitleStyle}>1. Informations personnelles :</div>

            <Row gutter={16}>
              <Col span={11}>
                <ReadField label='Prénom' value={student.firstName} />
              </Col>
              <Col span={11}>
                <ReadField label='Nom' value={student.lastName} />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={22}>
                <ReadField label='Email' value={student.email} />
              </Col>
            </Row>

            {/* ══ 2. Informations académiques ═══════════════════════════ */}
            <div style={sectionTitleStyle}>2. Informations académiques :</div>

            <Row gutter={16}>
              <Col span={11}>
                <ReadField label='Établissement' value={student.institution} />
              </Col>
              <Col span={11}>
                <ReadField label='Niveau' value={student.level} />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={11}>
                <ReadField label='Spécialité' value={student.specialty} />
              </Col>
              <Col span={11}>
                <ReadField
                  label='Nb Encadrements'
                  value={String(student.nbSupervisions)}
                />
              </Col>
            </Row>

            {/* ══ 3. Métadonnées ════════════════════════════════════════ */}
            <div style={sectionTitleStyle}>3. Métadonnées :</div>

            <Row gutter={16}>
              <Col span={11}>
                <ReadField label="Date d'ajout" value={student.createdAt} />
              </Col>
              <Col span={11}>
                <ReadField label='ID' value={studentId} />
              </Col>
            </Row>
          </div>

          {/* ── Buttons ───────────────────────────────────────────────── */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
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
                paddingInline: 20,
              }}
            >
              Retour
            </Button>
            <Button
              type='primary'
              onClick={() => navigate(`edit`)}
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: C.navy,
                borderColor: C.navy,
                borderRadius: 4,
                height: 36,
                paddingInline: 20,
              }}
            >
              Modifier
            </Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
