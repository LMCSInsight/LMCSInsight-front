import type { CSSProperties, ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Typography, Row, Col, Space, Button, ConfigProvider, Spin } from 'antd'

const { Title, Text } = Typography

// ─── Visual Identity ──────────────────────────────────────────────────────────
const THEME_COLORS = {
  navy: 'var(--foreground)',
  blue: 'var(--primary)',
  lightBlue: 'var(--border)',
  bg: 'var(--muted)',
  white: 'var(--card)',
  muted: 'var(--muted-foreground)',
  border: 'var(--border)',
}

const FONT = "'Outfit', sans-serif"

// ─── Shared styles ────────────────────────────────────────────────────────────
function buildStyles(colors: typeof THEME_COLORS): {
  sectionTitleStyle: CSSProperties
  labelStyle: CSSProperties
  valueStyle: CSSProperties
} {
  return {
    sectionTitleStyle: {
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 15,
      color: colors.navy,
      marginBottom: 10,
      marginTop: 18,
    },
    labelStyle: {
      fontFamily: FONT,
      fontSize: 12,
      color: colors.muted,
      fontWeight: 500,
      marginBottom: 4,
      display: 'block',
    },
    valueStyle: {
      fontFamily: FONT,
      fontSize: 14,
      color: colors.navy,
      fontWeight: 500,
      minHeight: 32,
      padding: '4px 0',
      borderBottom: `1px solid ${colors.lightBlue}`,
    },
  }
}

// ─── Simple label + data display wrapper ──────────────────────────────────────
function ReadOnlyField({
  label,
  value,
  naLabel,
  labelStyle,
  valueStyle,
}: {
  label: string
  value?: string | null | ReactNode
  naLabel: string
  labelStyle: CSSProperties
  valueStyle: CSSProperties
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={labelStyle}>{label}</span>
      <div style={valueStyle}>
        {value ? value : <span style={{ color: '#ccc' }}>{naLabel}</span>}
      </div>
    </div>
  )
}

// ─── Mock data ─────────────────────────────────────────────────────────────
const MOCK_SUPERVISION = {
  id: '1',
  titreProjet: 'Deep Learning for Medical Imaging',
  etudiant: 'Ali Khelifi',
  typeEncadrement: 'Master',
  statut: 'en_cours',
  statutValidation: 'en_attente',
  anneeUniversitaire: '2025-2026',
  thematique: 'Machine Learning',
  dateDebut: '2024-09-01',
  sujet: "Intelligence Artificielle pour l'Imagerie Médicale",
  descriptionSujet:
    "Développement d'un système de deep learning pour l'analyse automatique d'images médicales",
  dateFin: '2025-06-30',
  dateFinReel: '',
  encadrant: 'Dr. Meziane Abdelkader',
  coEncadrants: ['Pr. Bensalem Rachid'],
  notes: 'À valider',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SupervisionDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const colors = THEME_COLORS
  const { sectionTitleStyle, labelStyle, valueStyle } = buildStyles(colors)
  // Assuming your route is something like /supervisions/:id
  const { id } = useParams<{ id: string }>()

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['supervision', id],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Return the single mock supervision data
      return MOCK_SUPERVISION
    },
    enabled: !!id,
  })

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.blue,
          fontFamily: FONT,
          borderRadius: 3,
          colorBorder: colors.border,
        },
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');`}</style>

      {/* Outer page */}
      <div
        style={{ background: colors.bg, minHeight: '100vh', fontFamily: FONT }}
      >
        {/* White content area */}
        <div
          style={{
            background: colors.white,
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
              color: colors.navy,
              marginBottom: 2,
            }}
          >
            {t('supervisions.detail.title', {
              defaultValue: "Détails de l'encadrement",
            })}
          </Title>
          <Text style={{ fontFamily: FONT, fontSize: 12, color: colors.muted }}>
            {t('supervisions.detail.subtitle', {
              defaultValue:
                'Consultez les informations relatives à cet encadrement.',
            })}
          </Text>

          {/* ── Loading / Error States ──────────────────────────────────── */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size='large' />
              <div style={{ marginTop: 10, color: colors.muted }}>
                {t('supervisions.detail.loading', {
                  defaultValue: 'Chargement des données...',
                })}
              </div>
            </div>
          ) : isError ? (
            <div
              style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}
            >
              {t('supervisions.detail.error', {
                defaultValue:
                  'Erreur lors du chargement des données. Veuillez vérifier votre connexion.',
              })}
            </div>
          ) : (
            /* ── Data Display ─────────────────────────────────────────────── */
            <div style={{ marginTop: 20 }}>
              {/* ══ 1. Informations générales ══════════════════════════════ */}
              <div style={sectionTitleStyle}>
                {t('supervisions.detail.sections.general', {
                  defaultValue: '1. Informations générales :',
                })}
              </div>
              <Row gutter={16}>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.projectTitle', {
                      defaultValue: 'Titre du projet',
                    })}
                    value={MOCK_SUPERVISION.titreProjet}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
                <Col span={9}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.status', {
                      defaultValue: 'Statut',
                    })}
                    value={MOCK_SUPERVISION.statut}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={9}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.supervisionType', {
                      defaultValue: "Type d'encadrement",
                    })}
                    value={MOCK_SUPERVISION.typeEncadrement}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.academicYear', {
                      defaultValue: 'Année universitaire',
                    })}
                    value={MOCK_SUPERVISION.anneeUniversitaire}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>

              {/* ══ 2. Étudiant ════════════════════════════════════════════ */}
              <div style={sectionTitleStyle}>
                {t('supervisions.detail.sections.student', {
                  defaultValue: '2. Etudiant :',
                })}
              </div>
              <Row gutter={16}>
                <Col span={20}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.studentName', {
                      defaultValue: "Nom de l'étudiant",
                    })}
                    value={MOCK_SUPERVISION.etudiant}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>

              {/* ══ 3. Thématique ══════════════════════════════════════════ */}
              <div style={{ ...sectionTitleStyle, fontWeight: 600 }}>
                {t('supervisions.detail.sections.topic', {
                  defaultValue: '3. Thématique',
                })}
              </div>
              <Row gutter={16}>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.subject', {
                      defaultValue: 'Sujet',
                    })}
                    value={MOCK_SUPERVISION.sujet}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
                <Col span={13}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.theme', {
                      defaultValue: 'Thématique',
                    })}
                    value={MOCK_SUPERVISION.thematique}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.topicDescription', {
                      defaultValue: 'Description du sujet',
                    })}
                    value={MOCK_SUPERVISION.descriptionSujet}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>

              {/* ══ 4. Dates ═══════════════════════════════════════════════ */}
              <div style={sectionTitleStyle}>
                {t('supervisions.detail.sections.dates', {
                  defaultValue: '4. Dates :',
                })}
              </div>
              <Row gutter={16}>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.startDate', {
                      defaultValue: 'Date de début',
                    })}
                    value={MOCK_SUPERVISION.dateDebut}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.endDate', {
                      defaultValue: 'Date de Fin',
                    })}
                    value={MOCK_SUPERVISION.dateFin}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.actualEndDate', {
                      defaultValue: 'Date de Fin Réel',
                    })}
                    value={MOCK_SUPERVISION.dateFinReel}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>

              {/* ══ 5. Encadrant ═══════════════════════════════════════════ */}
              <div style={sectionTitleStyle}>
                {t('supervisions.detail.sections.supervisors', {
                  defaultValue: '5. Encadrants :',
                })}
              </div>
              <Row gutter={16}>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.mainSupervisor', {
                      defaultValue: 'Encadrant Principal',
                    })}
                    value={MOCK_SUPERVISION.encadrant}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>

              {/* If the backend returns an array of co-encadrants, display them */}
              {data?.coEncadrants &&
                data.coEncadrants.length > 0 &&
                data.coEncadrants.map((co: string, idx: number) => (
                  <Row gutter={16} key={idx}>
                    <Col span={11}>
                      <ReadOnlyField
                        label={t('supervisions.detail.labels.coSupervisor', {
                          defaultValue: 'CO_Encadrant {{index}}',
                          index: idx + 1,
                        })}
                        value={co}
                        naLabel={t('supervisions.detail.na', {
                          defaultValue: 'N/A',
                        })}
                        labelStyle={labelStyle}
                        valueStyle={valueStyle}
                      />
                    </Col>
                  </Row>
                ))}

              {/* ══ 6. Validation ══════════════════════════════════════════ */}
              <div style={{ ...sectionTitleStyle, fontWeight: 600 }}>
                {t('supervisions.detail.sections.validation', {
                  defaultValue: '6. Validation',
                })}
              </div>
              <Row gutter={16}>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.validationStatus', {
                      defaultValue: 'Statut validation',
                    })}
                    value={MOCK_SUPERVISION.statutValidation}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
                <Col span={11}>
                  <ReadOnlyField
                    label={t('supervisions.detail.labels.notes', {
                      defaultValue: 'Notes',
                    })}
                    value={MOCK_SUPERVISION.notes}
                    naLabel={t('supervisions.detail.na', {
                      defaultValue: 'N/A',
                    })}
                    labelStyle={labelStyle}
                    valueStyle={valueStyle}
                  />
                </Col>
              </Row>

              {/* ── Action Buttons ─────────────────────────────────────────── */}
              <div
                style={{
                  marginTop: 40,
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <Space size={10}>
                  <Button
                    onClick={() => navigate(-1)}
                    style={{
                      fontFamily: FONT,
                      fontSize: 13,
                      fontWeight: 500,
                      borderColor: colors.border,
                      color: colors.navy,
                      borderRadius: 4,
                      height: 36,
                      paddingInline: 20,
                    }}
                  >
                    {t('supervisions.detail.back', { defaultValue: 'Retour' })}
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  )
}
