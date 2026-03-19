'use client'

/**
 * Processes Page — Team 3128
 * Route: /process  (or /nartech/process)
 *
 * Google Sheets → export each tab as PNG (File → Download → PNG)
 * and place at the paths listed under each ImgCard.
 *
 * Functional requirement images:
 *   /public/images/process/requirements/[sheet-name].png
 *
 * Dashboard images:
 *   /public/images/process/dashboard/[sheet-name].png
 */

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ─── Accent palette (matches ControlsPage) ────────────────────────────────────

type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'teal'

const ACCENT: Record<AccentColor, { solid: string; bg: string; border: string }> = {
  blue:   { solid: '#0066cc', bg: 'rgba(0,102,204,0.12)',   border: 'rgba(0,102,204,0.4)'  },
  green:  { solid: '#00cc88', bg: 'rgba(0,204,136,0.12)',   border: 'rgba(0,204,136,0.4)'  },
  orange: { solid: '#cc7700', bg: 'rgba(204,119,0,0.12)',   border: 'rgba(204,119,0,0.4)'  },
  purple: { solid: '#8855cc', bg: 'rgba(136,85,204,0.12)',  border: 'rgba(136,85,204,0.4)' },
  teal:   { solid: '#0099aa', bg: 'rgba(0,153,170,0.12)',   border: 'rgba(0,153,170,0.4)'  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Each entry = one exported Google Sheet tab.
// aspect: controls how tall the preview renders — use 'wide' for landscape sheets,
//         'tall' for portrait/multi-row sheets.

interface SheetImage {
  src: string
  title: string
  description: string
  aspect: 'wide' | 'tall' | 'square'
  /** Optional — shown as a pill badge on the image */
  pill?: string
}

const REQUIREMENT_SHEETS: SheetImage[] = [
  <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQKoGEHYikY_UCQVc-s1BIt28nSTdeFaLmIYBbfoP4ey84TZ9VkrzINyoCb4D8M40CZw0iJAkriEoqD/pubhtml?widget=true&amp;headers=false"></iframe>
]

const DASHBOARD_SHEETS: SheetImage[] = [
  {
    src: '/images/process/dashboard-week1.png',
    title: 'Example Top Level Dashboard Update',
    description: 'Gives an update on all robot updates over the past week. Presented in a weekly meeting to the entire tea,',
    aspect: 'wide',
    pill: 'Dashboard',
  },
  {
    src: '/images/process/functional-requirements-tracking.png',
    title: 'Functional Requirements Tracking',
    description: 'Tracks week-to-week updates on functional requirements, as described by strategy',
    aspect: 'wide',
    pill: 'Dashboard',
  },
//   {
//     src: '/images/process/dashboard/debug-panel.png',
//     title: 'Debug & Tuning Panel',
//     description: 'PID gain sliders, motor current graphs, and WebSocket raw JSON stream. Used exclusively during off-season tuning.',
//     aspect: 'wide',
//     pill: 'Debug',
//   },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function aspectRatio(a: SheetImage['aspect']) {
  if (a === 'wide')   return '16/7'
  if (a === 'tall')   return '3/4'
  return '1/1'
}

// ─── Sheet image component ────────────────────────────────────────────────────

function SheetCard({ sheet, accent = 'blue' }: { sheet: SheetImage; accent?: AccentColor }) {
  const [errored, setErrored] = useState(false)
  const col = ACCENT[accent].solid

  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0,51,102,0.5)',
      background: 'rgba(0,10,28,0.7)',
    }}>
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: aspectRatio(sheet.aspect), background: 'rgba(0,15,40,0.95)' }}>
        {!errored ? (
          <Image
            src={sheet.src}
            alt={sheet.title}
            fill
            style={{ objectFit: 'contain' }}   // 'contain' so sheet content isn't cropped
            onError={() => setErrored(true)}
          />
        ) : (
          // Placeholder
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ padding: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `1.5px solid ${col}`, opacity: 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="1.5" stroke={col} strokeWidth="1.3"/>
                <path d="M2 8h16" stroke={col} strokeWidth="1.3"/>
                <path d="M7 4v4M13 4v4" stroke={col} strokeWidth="1.3"/>
              </svg>
            </div>
            <span style={{
              fontSize: '10px', color: col, opacity: 0.4,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              textAlign: 'center', wordBreak: 'break-all', maxWidth: 320,
            }}>
              {sheet.src}
            </span>
          </div>
        )}

        {/* Pill badge */}
        {sheet.pill && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            padding: '3px 10px', borderRadius: 20,
            background: ACCENT[accent].bg,
            border: `1px solid ${ACCENT[accent].border}`,
            fontSize: '9px', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: col,
          }}>
            {sheet.pill}
          </div>
        )}

        {/* Subtle gradient at bottom so caption doesn't clash */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
          background: 'linear-gradient(to top, rgba(0,10,28,0.7), transparent)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Caption */}
      <div style={{ padding: '14px 18px 16px', borderTop: '1px solid rgba(0,51,102,0.3)' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#ddeeff', margin: '0 0 4px', letterSpacing: '0.02em' }}>
          {sheet.title}
        </p>
        <p style={{ fontSize: '11px', color: '#778899', lineHeight: 1.6, margin: 0 }}>
          {sheet.description}
        </p>
      </div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(0,102,204,0.3), transparent)', margin: '52px 0' }} />
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  index,
  title,
  tag,
  body,
  accent = 'blue',
}: {
  index: string
  title: string
  tag?: string
  body: string
  accent?: AccentColor
}) {
  const col = ACCENT[accent].solid
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: col, opacity: 0.7 }}>
          {index}
        </span>
        {tag && (
          <>
            <span style={{ width: 1, height: 10, background: `${col}55` }} />
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: col, opacity: 0.6 }}>
              {tag}
            </span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 3, height: 28, borderRadius: 2, background: `linear-gradient(to bottom, ${col}, ${col}55)`, flexShrink: 0 }} />
        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.01em' }}>
          {title}
        </h2>
      </div>
      <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: '#8899bb', lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
        {body}
      </p>
    </div>
  )
}

// ─── Callout ──────────────────────────────────────────────────────────────────

function Callout({ children, accent = 'blue' }: { children: React.ReactNode; accent?: AccentColor }) {
  return (
    <div style={{
      borderRadius: 12, padding: '14px 18px', marginBottom: 28,
      background: ACCENT[accent].bg,
      border: `1px solid ${ACCENT[accent].border}`,
      fontSize: '12px', color: '#aabbcc', lineHeight: 1.7,
    }}>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProcessPage() {
  return (
    <div style={{ background: '#000d1a', minHeight: '100vh', color: '#ffffff' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(0,8,20,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,51,102,0.4)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', color: '#0066cc',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 1L3 7l6 6" stroke="#0066cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#0066cc' }}>Documentation</span>
          <span style={{ width: 1, height: 12, background: 'rgba(0,102,204,0.4)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em' }}>Our Process</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#334455' }}>
          Team 3128
        </span>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        width: '100%', padding: '52px 32px 44px',
        borderBottom: '1px solid rgba(0,51,102,0.3)',
        background: 'linear-gradient(180deg, rgba(0,20,50,0.6) 0%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#0066cc' }}>
            Team 3128 · Aluminum Narwhals
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.05, margin: '10px 0 16px' }}>
            Our Process
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: '#8899bb', lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
            From paper requirements to match-ready robot — our engineering process is documented in structured functional requirement sheets and tracked live through a custom driver dashboard.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 32px 80px' }}>

        {/* ════════════════════════════════════
            SECTION 1 — FUNCTIONAL REQUIREMENTS
        ════════════════════════════════════ */}
        <SectionHeader
          index="01"
          title="Functional Requirements"
          tag="Engineering Process"
          accent="blue"
          body="As soon as the game is released, our Strategy department defines measurable requirements for every subsystem."
        />

        {/* One card per sheet, full width, stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {REQUIREMENT_SHEETS.map((sheet) => (
            <SheetCard key={sheet.src} sheet={sheet} accent="blue" />
          ))}
        </div>

        <Divider />

        {/* ════════════════════════════════════
            SECTION 2 — ROBOT DASHBOARD
        ════════════════════════════════════ */}
        <SectionHeader
          index="02"
          title="Robot Dashboard"
          tag="Engineering Process"
          accent="orange"
          body="The Robot Dashboard tracks week-week progress on a functional-requirement, subsystem, and overview level. This helps us maintain deadlines and meet technical requirements"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {DASHBOARD_SHEETS.map((sheet) => (
            <SheetCard key={sheet.src} sheet={sheet} accent="orange" />
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 48, marginTop: 48,
          borderTop: '1px solid rgba(0,51,102,0.3)',
        }}>
          <Link href="/" style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#0066cc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 1L2 6l6 5" stroke="#0066cc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Binder
          </Link>
          <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#334455' }}>
            Team 3128 · Aluminum Narwhals
          </span>
        </div>

      </div>
    </div>
  )
}
