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
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { Option } = Select

// ─── Visual Identity ──────────────────────────────────────────────────────────
const C = {
  navy: '#21334E',
  blue: '#11499A',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  muted: '#6b7280',
  border: '#d9d9d9',
}
const FONT = "'Outfit', sans-serif"

// ─── Options (from DB model) ──────────────────────────────────────────────────
const INSTITUTION_OPTIONS = [
  { value: 'ESI', label: 'ESI' },
  { value: 'Extérieur', label: 'Extérieur' },
]

const LEVEL_OPTIONS = [
  { value: 'Master', label: 'Master' },
  { value: 'Doctorant', label: 'Doctorant' },
]

const SPECIALTY_OPTIONS = [
  { value: 'SIL', label: 'SIL' },
  { value: 'SID', label: 'SID' },
  { value: 'SIT', label: 'SIT' },
  { value: 'SIQ', label: 'SIQ' },
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

// ─── Field wrapper ────────────────────────────────────────────────────────────
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
export default function RegisterStudentPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = (values: unknown) => {
    // TODO: useMutation → studentApi.registerStudent(values)
    console.log('Register student:', values)
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
            Ajouter un étudiant
          </Title>
          <Text style={{ fontFamily: FONT, fontSize: 12, color: C.muted }}>
            Remplissez les informations pour enregistrer un nouvel étudiant.
          </Text>

          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            requiredMark={false}
            style={{ marginTop: 20 }}
          >
            {/* ══ 1. Informations personnelles ═══════════════════════════ */}
            <div style={sectionTitleStyle}>1. Informations personnelles :</div>

            {/* firstName | lastName */}
            <Row gutter={16}>
              <Col span={11}>
                <Field label='Prénom' name='firstName' required>
                  <Input style={inputStyle} />
                </Field>
              </Col>
              <Col span={11}>
                <Field label='Nom' name='lastName' required>
                  <Input style={inputStyle} />
                </Field>
              </Col>
            </Row>

            {/* email full width */}
            <Row gutter={16}>
              <Col span={22}>
                <Field label='Email' name='email'>
                  <Input
                    placeholder='exemple@esi.dz'
                    style={inputStyle}
                    type='email'
                  />
                </Field>
              </Col>
            </Row>

            {/* ══ 2. Informations académiques ════════════════════════════ */}
            <div style={sectionTitleStyle}>2. Informations académiques :</div>

            {/* institution | level */}
            <Row gutter={16}>
              <Col span={11}>
                <Field label='Établissement' name='institution' required>
                  <Select style={selectStyle} size='small'>
                    {INSTITUTION_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Field>
              </Col>
              <Col span={11}>
                <Field label='Niveau' name='level' required>
                  <Select style={selectStyle} size='small'>
                    {LEVEL_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
                </Field>
              </Col>
            </Row>

            {/* specialty */}
            <Row gutter={16}>
              <Col span={11}>
                <Field label='Spécialité' name='specialty'>
                  <Select
                    style={selectStyle}
                    size='small'
                    placeholder='Sélectionner une spécialité'
                  >
                    {SPECIALTY_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        {o.label}
                      </Option>
                    ))}
                  </Select>
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
                  Ajouter l&apos;étudiant
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  )
}
