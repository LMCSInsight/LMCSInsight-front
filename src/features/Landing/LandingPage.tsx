import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { ArrowRight, BarChart2, History, Scale } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Line,
  Tooltip,
} from 'recharts'

// ─── Visual Identity ──────────────────────────────────────────────────────────
const C = {
  navy: '#1a2d4d',
  navyDark: '#0f1f38',
  blue: '#2563eb',
  blueLight: '#3b82f6',
  lightBg: '#dbeafe',
  heroBg: '#e8f0fe',
  white: '#ffffff',
  muted: '#6b7280',
  mutedDark: '#94a3b8',
  cardBg: '#f0f6ff',
  darkSection: '#1a2d4d',
}
const FONT = "'Outfit', sans-serif"

// ─── Mock chart data ──────────────────────────────────────────────────────────
const barData = [
  { name: 'Jan', a: 30, b: 50 },
  { name: 'Feb', a: 45, b: 70 },
  { name: 'Mar', a: 25, b: 40 },
  { name: 'Apr', a: 55, b: 65 },
  { name: 'May', a: 35, b: 80 },
]

// ─── Smooth scroll helper ─────────────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ─── Nav link ─────────────────────────────────────────────────────────────────
function NavLink({ label, target }: { label: string; target: string }) {
  return (
    <button
      type='button'
      onClick={() => scrollTo(target)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: FONT,
        fontSize: 14,
        fontWeight: 500,
        color: C.navy,
        padding: '4px 2px',
      }}
    >
      {label}
    </button>
  )
}

// ─── Benefit card ─────────────────────────────────────────────────────────────
function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <p
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 14,
          color: C.navy,
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 12,
          color: '#374151',
          lineHeight: 1.6,
          marginBottom: 10,
        }}
      >
        {desc}
      </p>
      <span
        style={{
          fontFamily: FONT,
          fontSize: 12,
          color: C.blue,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        learn More
      </span>
    </div>
  )
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType
  title: string
  desc: string
}) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#dbeafe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={C.blue} />
      </div>
      <div>
        <p
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 13,
            color: C.navy,
            marginBottom: 4,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: C.muted,
            lineHeight: 1.5,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  )
}

// ─── Why card (dark section) ──────────────────────────────────────────────────
function WhyCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <p
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 13,
          color: C.white,
          marginBottom: 12,
        }}
      >
        {title}
      </p>
      {items.map((item, i) => (
        <p
          key={i}
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6,
            marginBottom: 4,
          }}
        >
          {item}
        </p>
      ))}
    </div>
  )
}

// ─── Mini dashboard mockup ────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        width: '100%',
        maxWidth: 620,
        margin: '0 auto',
      }}
    >
      {/* Sidebar + content */}
      <div style={{ display: 'flex', height: 280 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 130,
            background: C.navy,
            padding: '20px 14px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 24,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '6px 8px',
            }}
          >
            <img
              src='/lmcs.png'
              alt='LMCS'
              style={{ height: 18, filter: 'brightness(10)' }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span
              style={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 700,
                color: C.white,
              }}
            >
              LMCS
            </span>
          </div>
          {['Dashboard', 'Etudiants', 'Projets', 'Analytique'].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.3)',
                }}
              />
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500,
                }}
              >
                {item}
              </span>
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: C.blue,
              }}
            />
            <div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 9,
                  color: C.white,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Beghernaout.Amine
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                }}
              >
                Admin
              </p>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '14px 16px', background: '#f8fafc' }}>
          {/* KPI row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginBottom: 12,
            }}
          >
            {[
              { label: 'Total Projects', val: '2,026' },
              { label: 'efrtedvtèj_jg', val: '2,6' },
              { label: 'fvbnhtj.nhtg', val: '1234' },
              { label: 'TBVFderftyh', val: '1231' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  background: C.white,
                  borderRadius: 8,
                  padding: '8px 10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 9,
                    color: C.muted,
                    margin: 0,
                  }}
                >
                  {kpi.label}
                </p>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    fontWeight: 800,
                    color: C.navy,
                    margin: '2px 0',
                  }}
                >
                  {kpi.val}
                </p>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 8,
                    color: '#22c55e',
                    margin: 0,
                  }}
                >
                  20% This semestre ↑
                </p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            <div
              style={{
                background: C.white,
                borderRadius: 8,
                padding: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 9,
                    fontWeight: 600,
                    color: C.navy,
                    margin: 0,
                  }}
                >
                  Supervision Activity
                </p>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 8,
                    color: '#22c55e',
                    margin: 0,
                  }}
                >
                  20% This semestre ↓
                </p>
              </div>
              <div style={{ height: 80 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={barData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <Bar dataKey='a' fill='#93c5fd' radius={[2, 2, 0, 0]} />
                    <Bar dataKey='b' fill={C.navy} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div
              style={{
                background: C.white,
                borderRadius: 8,
                padding: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 9,
                  fontWeight: 600,
                  color: C.navy,
                  margin: '0 0 6px',
                }}
              >
                Projects Type
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 80,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: C.navy,
                    border: '8px solid #93c5fd',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Analytics mockup ─────────────────────────────────────────────────────────
function AnalyticsMockup() {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        padding: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 700,
            color: C.navy,
            margin: 0,
          }}
        >
          Supervision Activity
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 11,
            color: '#22c55e',
            margin: 0,
          }}
        >
          20% This semestre ↓
        </p>
      </div>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={barData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey='name'
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey='a' fill='#93c5fd' radius={[3, 3, 0, 0]} />
            <Bar dataKey='b' fill={C.navy} radius={[3, 3, 0, 0]} />
            <Line
              type='monotone'
              dataKey='b'
              stroke={C.navy}
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginTop: 12,
        }}
      >
        {['', ''].map((_, i) => (
          <div
            key={i}
            style={{ height: 28, background: '#f1f5f9', borderRadius: 6 }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ fontFamily: FONT, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #fff; }
        section { scroll-margin-top: 70px; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.95)' : C.white,
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.3s ease',
          borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src='/lmcs.png'
              alt='LMCS'
              style={{ height: 32 }}
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
                if (el.nextElementSibling) {
                  ;(el.nextElementSibling as HTMLElement).style.display = 'flex'
                }
              }}
            />
            <div
              style={{
                display: 'none',
                width: 36,
                height: 36,
                borderRadius: 8,
                background: C.navy,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: C.white, fontWeight: 900, fontSize: 13 }}>
                L
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <NavLink label='caractéristiques' target='caracteristiques' />
            <NavLink label='Dashboards' target='dashboards' />
            <NavLink label='Avantages' target='avantages' />
            <NavLink label='Architecture' target='architecture' />
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to={ROUTES.LOGIN}
              style={{
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 500,
                color: C.navy,
                textDecoration: 'none',
                padding: '8px 16px',
              }}
            >
              Se connecter
            </Link>
            <Link
              to={ROUTES.LOGIN}
              style={{
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 600,
                color: C.white,
                textDecoration: 'none',
                background: C.navy,
                padding: '8px 20px',
                borderRadius: 8,
              }}
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id='caracteristiques'
        style={{
          background:
            'linear-gradient(160deg, #e8f0fe 0%, #dbeafe 50%, #eff6ff 100%)',
          paddingTop: 120,
          paddingBottom: 60,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <h1
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 52,
              lineHeight: 1.1,
              color: C.navy,
              marginBottom: 16,
            }}
          >
            Système de Suivi <span style={{ color: C.blueLight }}>des</span>
            <br />
            <span style={{ color: C.blueLight }}>Encadrements</span>
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              color: '#374151',
              lineHeight: 1.7,
              maxWidth: 480,
              margin: '0 auto 32px',
            }}
          >
            Plateforme institutionnelle dédiée à la gestion et à l&apos;analyse
            des encadrements académiques du laboratoire LMCS.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
            }}
          >
            <Link
              to='/auth/login'
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 700,
                color: C.white,
                textDecoration: 'none',
                background: C.navy,
                padding: '12px 28px',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Commencer <ArrowRight size={16} />
            </Link>
            <button
              type='button'
              onClick={() => scrollTo('avantages')}
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 600,
                color: C.navy,
                background: 'transparent',
                border: '2px solid #cbd5e1',
                padding: '12px 28px',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              En savoir Plus
            </button>
          </div>
        </div>

        {/* Dashboard preview */}
        <div
          style={{ maxWidth: 700, margin: '48px auto 0', padding: '0 24px' }}
        >
          <DashboardMockup />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BÉNÉFICES — "avantages"
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id='avantages'
        style={{
          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 36,
              color: C.navy,
              textAlign: 'center',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
            }}
          >
            Bénéfices de la Plateforme
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              color: '#374151',
              textAlign: 'center',
              lineHeight: 1.7,
              maxWidth: 580,
              margin: '0 auto 48px',
            }}
          >
            Une plateforme conçue pour améliorer l&apos;efficacité des
            encadrants, optimiser l&apos;administration et renforcer la
            gouvernance du laboratoire
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {[
              {
                title: 'Encadrant',
                desc: "Optimisation du suivi pédagogique. La plateforme permet aux encadrants de gérer efficacement leurs travaux académiques et d'assurer un suivi structuré des étudiants",
              },
              {
                title: 'Encadrant',
                desc: "Optimisation du suivi pédagogique. La plateforme permet aux encadrants de gérer efficacement leurs travaux académiques et d'assurer un suivi structuré des étudiants",
              },
              {
                title: 'Encadrant',
                desc: "Optimisation du suivi pédagogique. La plateforme permet aux encadrants de gérer efficacement leurs travaux académiques et d'assurer un suivi structuré des étudiants",
              },
              {
                title: 'Encadrant',
                desc: "Optimisation du suivi pédagogique. La plateforme permet aux encadrants de gérer efficacement leurs travaux académiques et d'assurer un suivi structuré des étudiants",
              },
              {
                title: 'Encadrant',
                desc: "Optimisation du suivi pédagogique. La plateforme permet aux encadrants de gérer efficacement leurs travaux académiques et d'assurer un suivi structuré des étudiants",
              },
              {
                title: 'Encadrant',
                desc: "Optimisation du suivi pédagogique. La plateforme permet aux encadrants de gérer efficacement leurs travaux académiques et d'assurer un suivi structuré des étudiants",
              },
            ].map((card, i) => (
              <BenefitCard key={i} title={card.title} desc={card.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ANALYSE & INDICATEURS — "dashboards"
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id='dashboards'
        style={{
          background: C.white,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 36,
              color: C.navy,
              textAlign: 'center',
              marginBottom: 64,
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
            }}
          >
            Analyse &amp; Indicateurs
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              alignItems: 'center',
            }}
          >
            {/* Left — text */}
            <div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 15,
                  color: C.navy,
                  fontWeight: 600,
                  lineHeight: 1.6,
                  marginBottom: 32,
                }}
              >
                La plateforme offre une vision consolidée et analytique des
                activités d&apos;encadrement du laboratoire.
              </p>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <FeatureRow
                  icon={BarChart2}
                  title='Visualisation des données'
                  desc='Analyse instantanée des encadrements grâce à des tableaux de bord interactifs et des graphiques dynamiques.'
                />
                <FeatureRow
                  icon={History}
                  title='Analyse historique'
                  desc="Comparaison des encadrements par année universitaire afin d'identifier les tendances et l'évolution de la charge pédagogique."
                />
                <FeatureRow
                  icon={Scale}
                  title='Répartition équilibrée'
                  desc='Suivi de la distribution des encadrements entre enseignants pour garantir une charge équitable et optimisée.'
                />
              </div>
            </div>

            {/* Right — analytics mockup */}
            <AnalyticsMockup />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          POURQUOI — "architecture"
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id='architecture'
        style={{
          background: C.darkSection,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 40,
              color: C.white,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Pourquoi cette plateforme ?
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'center',
              marginBottom: 48,
            }}
          >
            Conçue pour moderniser la gestion académique
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            <WhyCard
              title='Amélioration de la visibilité'
              items={[
                'Offre une vision claire et globale des encadrements en cours et soutenus au sein du laboratoire.',
                'Suivi structuré des activités académiques.',
              ]}
            />
            <WhyCard
              title='Optimisation du temps'
              items={[
                'Automatise les tâches administratives répétitives et réduit le suivi manuel via fichiers externes.',
                "Gain de temps pour les encadrants et l'administration.",
              ]}
            />
            <WhyCard
              title='Aide à la décision stratégique'
              items={[
                'Fournit des indicateurs fiables permettant une meilleure planification et répartition des encadrements.',
                'Appui aux décisions de la direction.',
              ]}
            />
            <WhyCard
              title='Centralisation des données'
              items={[
                "Regroupe l'ensemble des informations académiques dans une plateforme unique, sécurisée et structurée.",
                'Suppression des fichiers dispersés.',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 100%)',
          padding: '100px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 38,
              color: C.navy,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            Moderniser la gestion des encadrements académiques
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              color: '#374151',
              lineHeight: 1.7,
              marginBottom: 40,
            }}
          >
            Rejoignez une approche innovante basée sur la centralisation,
            l&apos;analyse des données et l&apos;optimisation du suivi
            scientifique.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
            }}
          >
            <Link
              to='/auth/login'
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 700,
                color: C.white,
                textDecoration: 'none',
                background: C.navy,
                padding: '13px 30px',
                borderRadius: 24,
              }}
            >
              Acceder A la Plateforme
            </Link>
            <button
              type='button'
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 600,
                color: C.navy,
                background: 'transparent',
                border: '2px solid #cbd5e1',
                padding: '13px 30px',
                borderRadius: 24,
                cursor: 'pointer',
              }}
            >
              Demander une démonstration
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          background: C.white,
          borderTop: '1px solid #e5e7eb',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 40,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 16,
              }}
            >
              <img
                src='/lmcs.png'
                alt='LMCS'
                style={{ height: 36 }}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <img
                src='/logo-esi.png'
                alt='ESI'
                style={{ height: 36 }}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                color: C.navy,
                marginBottom: 6,
              }}
            >
              Système de Suivi des Encadrements
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: C.muted,
                lineHeight: 1.6,
              }}
            >
              Plateforme dédiée à la gestion et au pilotage des encadrements
              académiques au sein du laboratoire.
            </p>
          </div>

          {/* Produit */}
          <div>
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                color: C.navy,
                marginBottom: 16,
              }}
            >
              Produit
            </p>
            {[
              'Fonctionnalités',
              'Tableaux de bord',
              'Profils utilisateurs',
              'Sécurité',
            ].map((item) => (
              <p
                key={item}
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: C.muted,
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                {item}
              </p>
            ))}
          </div>

          {/* Institution */}
          <div>
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                color: C.navy,
                marginBottom: 16,
              }}
            >
              Institution
            </p>
            {[
              'Laboratoire LMCS',
              "École Nationale Supérieure d'Informatique",
              'Projet Phase II (2025–2026)',
            ].map((item) => (
              <p
                key={item}
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: C.muted,
                  marginBottom: 8,
                }}
              >
                {item}
              </p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 14,
                color: C.navy,
                marginBottom: 16,
              }}
            >
              Contact
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: C.muted,
                marginBottom: 4,
              }}
            >
              Contact administratif
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: C.blue,
                marginBottom: 8,
              }}
            >
              support@lmcs-esi.dz
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: C.muted,
                lineHeight: 1.6,
              }}
            >
              Adresse
              <br />
              École Nationale Supérieure d&apos;Informatique
              <br />
              Alger, Algérie
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
