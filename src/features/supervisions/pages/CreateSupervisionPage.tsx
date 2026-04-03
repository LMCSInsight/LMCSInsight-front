import { useState } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Space,
  ConfigProvider,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

// ─── Visual Identity ──────────────────────────────────────────────────────────
const C = {
  navy: '#21334E',
  blue: '#11499A',
  lightBlue: '#EBF1F9',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  muted: '#6b7280',
  border: '#d9d9d9',
}
const FONT = "'Outfit', sans-serif"

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATUT_OPTIONS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
  { value: 'suspendu', label: 'Suspendu' },
]
const TYPE_OPTIONS = [
  { value: 'master', label: 'Master' },
  { value: 'doctorat', label: 'Doctorat' },
  { value: 'licence', label: 'Licence' },
]
const ETUDIANT_OPTIONS = [
  { value: '1', label: 'Beghernaout Mohammed Elamin' },
  { value: '2', label: 'Benali Sara' },
  { value: '3', label: 'Djebbar Karim' },
]
const ENCADRANT_OPTIONS = [
  { value: '1', label: 'Dr. Meziane Abdelkader' },
  { value: '2', label: 'Pr. Bensalem Rachid' },
]
const VALIDATION_OPTIONS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide', label: 'Validé' },
  { value: 'refuse', label: 'Refusé' },
]

// ─── Shared styles ────────────────────────────────────────────────────────────
const sectionTitleStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 15,
  color: C.navy,
  marginBottom: 10,
  marginTop: 18,
}

const labelStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 12,
  color: C.navy,
  fontWeight: 400,
  marginBottom: 3,
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 13,
  color: C.navy,
  borderColor: C.border,
  borderRadius: 3,
  height: 32,
}

const selectStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 13,
  width: '100%',
}

// ─── Simple label + field wrapper ─────────────────────────────────────────────
function Field({
  label,
  name,
  required,
  children,
}: {
  label: string
  name?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <Form.Item
      name={name}
      rules={required ? [{ required: true, message: '' }] : undefined}
      style={{ marginBottom: 14 }}
      label={<span style={labelStyle}>{label}</span>}
    >
      {children}
    </Form.Item>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateSupervisionPage() {
  const [form] = Form.useForm()
  const [coEncadrants, setCoEncadrants] = useState<string[]>([])
  const navigate = useNavigate()

  const handleAddCoEncadrant = () => setCoEncadrants((p) => [...p, ''])
  const handleCoChange = (i: number, v: string) =>
    setCoEncadrants((p) => {
      const a = [...p]
      a[i] = v
      return a
    })

  const onFinish = (values: unknown) => {
    // TODO: useMutation → supervisionApi.createSupervision
    console.log(values, coEncadrants)
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

      {/* Outer page — same light grey as sidebar area */}
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FONT }}>
        {/* White content area — NO card, no shadow, just white background */}
        <div
          style={{
            background: C.white,
            marginLeft: 0,
            padding: '24px 32px 60px 32px',
            minHeight: '100vh',
          }}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
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
            Ajouter un encadrement
          </Title>
          <Text style={{ fontFamily: FONT, fontSize: 12, color: C.muted }}>
            Remplissez les informations pour ajouter un nouvel encadrement.
          </Text>

          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            requiredMark={false}
            style={{ marginTop: 20 }}
          >
            {/* ══ 1. Informations générales ══════════════════════════════ */}
            <div style={sectionTitleStyle}>1. Informations générales :</div>

            {/* Row 1: Titre du projet | Statut */}
            <Row gutter={16}>
              <Col span={11}>
                <Field label='Titre du projet' name='titreProjet' required>
                  <Input style={inputStyle} />
                </Field>
              </Col>
              <Col span={9}>
                <Field label='Statut' name='statut' required>
                  <Select style={selectStyle} size='small'>
                    {STATUT_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Field>
              </Col>
            </Row>

            {/* Row 2: Type d'encadrement | Année universitaire */}
            <Row gutter={16}>
              <Col span={9}>
                <Field
                  label="Type d'encadrement"
                  name='typeEncadrement'
                  required
                >
                  <Select style={selectStyle} size='small'>
                    {TYPE_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Field>
              </Col>
              <Col span={11}>
                <Field
                  label='Année universitaire'
                  name='anneeUniversitaire'
                  required
                >
                  <Input placeholder='0000/0000' style={inputStyle} />
                </Field>
              </Col>
            </Row>

            {/* ══ 2. Étudiant ════════════════════════════════════════════ */}
            <div style={sectionTitleStyle}>2. Etudiant :</div>

            {/* Label left, dropdown right */}
            <Row gutter={16} align='middle'>
              <Col span={8}>
                <span style={{ ...labelStyle, lineHeight: '32px' }}>
                  Sélectionner étudiant
                </span>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='etudiant'
                  style={{ marginBottom: 14 }}
                  rules={[{ required: true, message: '' }]}
                >
                  <Select
                    showSearch
                    style={selectStyle}
                    placeholder='beghernaout mohammed elamin'
                    filterOption={(input, option) =>
                      ((option?.children as string) ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {ETUDIANT_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* ══ 3. Thématique ══════════════════════════════════════════ */}
            <div style={{ ...sectionTitleStyle, fontWeight: 600 }}>
              3. Thématique
            </div>

            {/* Row: Sujet | Thématique */}
            <Row gutter={16}>
              <Col span={11}>
                <Field label='Sujet' name='sujet' required>
                  <Input
                    placeholder='Intelligence Artificielle'
                    style={inputStyle}
                  />
                </Field>
              </Col>
              <Col span={13}>
                <Field label='Thématique' name='thematique' required>
                  <Input
                    placeholder='Détection des maladies cardiaques avec le Machine Learning'
                    style={inputStyle}
                  />
                </Field>
              </Col>
            </Row>

            {/* Description full width */}
            <Field label='Description du sujet' name='descriptionSujet'>
              <TextArea
                rows={4}
                style={{
                  ...inputStyle,
                  height: 'auto',
                  resize: 'vertical',
                  fontFamily: FONT,
                }}
              />
            </Field>

            {/* ══ 4. Dates ═══════════════════════════════════════════════ */}
            <div style={sectionTitleStyle}>4. Dates :</div>

            <Row gutter={16}>
              <Col span={11}>
                <Field label='Date de début' name='dateDebut' required>
                  <Input placeholder='00/00/0000' style={inputStyle} />
                </Field>
              </Col>
              <Col span={11}>
                <Field label='Date de Fin' name='dateFin' required>
                  <Input placeholder='00/00/0000' style={inputStyle} />
                </Field>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={11}>
                <Field label='Date de Fin Réel' name='dateFinReel'>
                  <Input placeholder='Optionnelle' style={inputStyle} />
                </Field>
              </Col>
            </Row>

            {/* ══ 5. Encadrant ═══════════════════════════════════════════ */}
            <div style={sectionTitleStyle}>5. Encadrant :</div>

            <Row gutter={16} align='bottom'>
              <Col span={11}>
                <Field label='Encadrants' name='encadrant' required>
                  <Select
                    style={selectStyle}
                    size='small'
                    placeholder='00/00/2000'
                  >
                    {ENCADRANT_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Field>
              </Col>
              <Col span={9}>
                <Form.Item style={{ marginBottom: 14 }}>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleAddCoEncadrant}
                    style={{
                      borderColor: C.blue,
                      color: C.blue,
                      fontFamily: FONT,
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 4,
                      height: 32,
                    }}
                  >
                    Ajouter un CO_Encadrant
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            {coEncadrants.map((val, idx) => (
              <Row gutter={16} key={idx}>
                <Col span={11}>
                  <div style={labelStyle}>CO_Encadrant {idx + 1}</div>
                  <Select
                    style={{ ...selectStyle, marginBottom: 14 }}
                    placeholder='Sélectionner'
                    value={val || undefined}
                    onChange={(v) => handleCoChange(idx, v)}
                  >
                    {ENCADRANT_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            ))}

            {/* ══ 6. Validation ══════════════════════════════════════════ */}
            <div style={{ ...sectionTitleStyle, fontWeight: 600 }}>
              6. Validation
            </div>

            <Row gutter={16}>
              <Col span={11}>
                <Field
                  label='Statut validation'
                  name='statutValidation'
                  required
                >
                  <Select
                    style={selectStyle}
                    size='small'
                    placeholder='En attente / Validé / Refusé'
                  >
                    {VALIDATION_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Field>
              </Col>
              <Col span={11}>
                <Field label='Notes' name='notes'>
                  <Input style={inputStyle} />
                </Field>
              </Col>
            </Row>

            {/* ── Action Buttons ─────────────────────────────────────────── */}
            <div
              style={{
                marginTop: 28,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Space size={10}>
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
                  Annuler
                </Button>
                <Button
                  type='primary'
                  htmlType='submit'
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
                  Ajouter l&apos;encadrement
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  )
}
