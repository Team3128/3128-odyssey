'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Accent palette ───────────────────────────────────────────────────────────

type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'teal'

const ACCENT: Record<AccentColor, { solid: string; bg: string; border: string }> = {
  blue:   { solid: '#0066cc', bg: 'rgba(0,102,204,0.12)', border: 'rgba(0,102,204,0.4)' },
  green:  { solid: '#00cc88', bg: 'rgba(0,204,136,0.12)', border: 'rgba(0,204,136,0.4)' },
  orange: { solid: '#cc7700', bg: 'rgba(204,119,0,0.12)', border: 'rgba(204,119,0,0.4)' },
  purple: { solid: '#8855cc', bg: 'rgba(136,85,204,0.12)', border: 'rgba(136,85,204,0.4)' },
  teal:   { solid: '#0099aa', bg: 'rgba(0,153,170,0.12)', border: 'rgba(0,153,170,0.4)' },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface SheetEmbed {
  url: string
  title: string
  description: string
  aspect: 'wide' | 'tall'
  pill?: string
}

interface DashboardTab {
  label: string
  url: string
}

const REQUIREMENT_SHEETS: SheetEmbed[] = [
  {
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxdfPfR5ROFH-ryvOIbpu2QWdloSNWaF0stluaAjTpdMZ7vcvQxBBO9VPKj0LSPGFG5LR2dvCfO63S/pubhtml?gid=462899277&amp;single=true&amp;widget=true&amp;headers=false',
    title: 'Functional Requirements',
    description:
      'Specific requirements for robot design and performance defined by Strategy',
    aspect: 'tall',
    pill: 'Requirements',
  },
]

const DASHBOARD_TABS: DashboardTab[] = [
  {
    label: 'WEEK 1',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKoGEHYikY_UCQVc-s1BIt28nSTdeFaLmIYBbfoP4ey84TZ9VkrzINyoCb4D8M40CZw0iJAkriEoqD/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 2',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRzX6w3ldMNte9SMwROavzwtHzeo1s4qmYtXMLVuwckfNKedxjEQm-NSej074wP3tXCyygX1hZnyn1b/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 3',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpVUsjyjQtqvpPJ1eWB7377Q4_xBid8gQG9keLU0DMJ1iV06SZVki_ufro_r99P5hSvnw3Qfz-LCHy/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 4',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTNf6NIh8g9a2f6mLaGomgmTWGn4eIVWRbB0vj0UHf0VJGHl2lN5cZ9C1wtTEnBFq5ruF6wilcAq1u-/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 5',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhPv2Qy8nSGsg-L-Z0EcrsXoq0thi0QAgUih_fw3wJIzoTinpE9XWQSoNHhe9inhxj1ZK8f_dPv4mM/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 6',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7yvNSqIk5M0NRkkThYChu5nbOefq0uLZTfY7Q4DQoH-RBX9mjZKCPIw748RheRKEGC3ERJzcCb2nq/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 7',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX97gCFlnSBNZ-VgsyRHYNRf_OVlaN7YBcMAp-movTMp8_OjjWuu-9jqrazH_dRmnsCvE_u45g861s/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 8',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTiRCoyisFUxTE5_yIzzEJ4iI7gi-QCnbUZtLAsamxuzA0UHl7SxzkLTZik4qguB6SdUOcvJ3iLTf-5/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 9',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzAfOPd8BnXRieUyu1Mi1E3DNngKZhOo2cbsS4DDCKR3We45MV_z2ufLWn7T-eLOO5cDz8Wt_5yY4z/pubhtml?widget=true&amp;headers=false',
  },
   {
    label: 'WEEK 10',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ2dtWRZgT4EeR1fLalZN2h-uvNljFyTv9T8eQqSxvKfUFdS_xfo68kJT0-neWq7XZdE_nxSWH-YrS/pubhtml?widget=true&amp;headers=false',
  },
   {
    label: 'WEEK 11',
    url: '  https://docs.google.com/spreadsheets/d/e/2PACX-1vTd-2Hlqv58yS0gA-BGRkYh5NAmEiNOsJI59XCRA7K3w8GGTCC4_DXROTZynjVlOx-kADkWZk211v1I/pubhtml?widget=true&amp;headers=false',
  },
  {
    label: 'WEEK 12',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSClrhW1lut4JkcMq3WDwYGBQKZmxs5vhMlqoWj4DK29163DUMfUHGq5SG90wK7yYVNcZQ4YKbvZvkr/pubhtml?widget=true&amp;headers=false',
  }
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function aspectRatio(a: SheetEmbed['aspect']) {
  if (a === 'wide') return '16/7'
  return '3/4'
}

// ─── Sheet card (for requirements) ────────────────────────────────────────────

function SheetCard({
  sheet,
  accent = 'blue',
}: {
  sheet: SheetEmbed
  accent?: AccentColor
}) {
  const col = ACCENT[accent].solid

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(0,51,102,0.5)',
        background: 'rgba(0,10,28,0.7)',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: aspectRatio(sheet.aspect) }}>
        <iframe
          src={sheet.url}
          width="100%"
          height="100%"
          style={{ border: 'none', position: 'absolute', inset: 0 }}
        />

        {sheet.pill && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              padding: '3px 10px',
              borderRadius: 20,
              background: ACCENT[accent].bg,
              border: `1px solid ${ACCENT[accent].border}`,
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: col,
            }}
          >
            {sheet.pill}
          </div>
        )}
      </div>

      <div
        style={{
          padding: '14px 18px 16px',
          borderTop: '1px solid rgba(0,51,102,0.3)',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#ddeeff',
            margin: '0 0 4px',
          }}
        >
          {sheet.title}
        </p>
        <p
          style={{
            fontSize: '11px',
            color: '#778899',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {sheet.description}
        </p>
      </div>
    </div>
  )
}

// ─── Dashboard with tabs ──────────────────────────────────────────────────────

function DashboardTabs({ accent = 'orange' }: { accent?: AccentColor }) {
  const [tab, setTab] = useState(0)
  const col = ACCENT[accent].solid

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(0,51,102,0.5)',
        background: 'rgba(0,10,28,0.7)',
      }}
    >

      {/* Dropdown selector */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid rgba(0,51,102,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: col,
            opacity: 0.7,
            fontWeight: 700
          }}
        >
          Dashboard View
        </span>

        <select
          value={tab}
          onChange={(e) => setTab(Number(e.target.value))}
          style={{
            background: ACCENT[accent].bg,
            border: `1px solid ${ACCENT[accent].border}`,
            color: '#ddeeff',
            fontSize: '11px',
            padding: '6px 10px',
            borderRadius: 6,
            outline: 'none',
            cursor: 'pointer',
            letterSpacing: '0.08em'
          }}
        >
          {DASHBOARD_TABS.map((t, i) => (
            <option key={i} value={i}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sheet */}
      <div style={{ width: '100%', height: 520 }}>
        <iframe
          src={DASHBOARD_TABS[tab].url}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background:
          'linear-gradient(to right, transparent, rgba(0,102,204,0.3), transparent)',
        margin: '52px 0',
      }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProcessPage() {
  return (
    <div style={{ background: '#000d1a', minHeight: '100vh', color: '#ffffff' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 32px 80px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 30 }}>
          Our Process
        </h1>

        {/* Requirements */}
        <h2 style={{ marginBottom: 16 }}>Functional Requirements</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {REQUIREMENT_SHEETS.map((sheet) => (
            <SheetCard key={sheet.title} sheet={sheet} accent="blue" />
          ))}
        </div>

        <Divider />

        {/* Dashboard */}
        <h2 style={{ marginBottom: 16 }}>Robot Dashboard</h2>

        <DashboardTabs />
      </div>
    </div>
  )
}