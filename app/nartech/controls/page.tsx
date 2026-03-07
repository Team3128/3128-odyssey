'use client'

/**
 * Controls & Software Page — Team 3128
 * Route: /controls  (or /nartech/controls)
 *
 * Image paths follow the convention:
 *   /public/images/controls/[section]/[filename].png
 * Drop real files there — placeholders render automatically until then.
 */

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'teal'

const ACCENT: Record<AccentColor, { solid: string; bg: string; border: string }> = {
  blue:   { solid: '#0066cc', bg: 'rgba(0,102,204,0.12)',   border: 'rgba(0,102,204,0.4)'  },
  green:  { solid: '#00cc88', bg: 'rgba(0,204,136,0.12)',   border: 'rgba(0,204,136,0.4)'  },
  orange: { solid: '#cc7700', bg: 'rgba(204,119,0,0.12)',   border: 'rgba(204,119,0,0.4)'  },
  purple: { solid: '#8855cc', bg: 'rgba(136,85,204,0.12)',  border: 'rgba(136,85,204,0.4)' },
  teal:   { solid: '#0099aa', bg: 'rgba(0,153,170,0.12)',   border: 'rgba(0,153,170,0.4)'  },
}

// ─── Image card ───────────────────────────────────────────────────────────────

function ImgCard({
  src,
  caption,
  accent = 'blue',
  pill,
  wide = false,
}: {
  src: string
  caption: string
  accent?: AccentColor
  pill?: string
  wide?: boolean
}) {
  const [errored, setErrored] = useState(false)
  const col = ACCENT[accent].solid

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        border: '1px solid rgba(0,51,102,0.5)',
        gridColumn: wide ? 'span 2' : undefined,
      }}
    >
      <div style={{ position: 'relative', aspectRatio: wide ? '16/7' : '16/10', background: 'rgba(0,15,35,0.9)' }}>
        {!errored ? (
          <Image
            src={src}
            alt={caption}
            fill
            style={{ objectFit: 'cover' }}
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ padding: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1.5px solid ${col}`, opacity: 0.45,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="1.5" stroke={col} strokeWidth="1.2"/>
                <circle cx="5.5" cy="6.5" r="1.5" stroke={col} strokeWidth="1.2"/>
                <path d="M1 11l3.5-3 3 3 2.5-2.5 4 4" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '9px', color: col, opacity: 0.45, letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center', wordBreak: 'break-all' }}>
              {src}
            </span>
          </div>
        )}
        {pill && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            padding: '2px 8px', borderRadius: 20,
            background: ACCENT[accent].bg,
            border: `1px solid ${ACCENT[accent].border}`,
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: col,
          }}>
            {pill}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 14px', background: 'rgba(0,10,28,0.9)' }}>
        <p style={{ fontSize: '11px', color: '#aabbcc', lineHeight: 1.5, margin: 0 }}>{caption}</p>
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  tag,
  accent = 'blue',
  children,
}: {
  title: string
  tag?: string
  accent?: AccentColor
  children: React.ReactNode
}) {
  const col = ACCENT[accent].solid
  return (
    <div className="w-full" style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 3, height: 22, borderRadius: 2, background: `linear-gradient(to bottom, ${col}, ${col}88)`, flexShrink: 0 }} />
        <h2 style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em', margin: 0 }}>
          {title}
        </h2>
        {tag && (
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: col, opacity: 0.8 }}>
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Spec table (label › value rows) ─────────────────────────────────────────

function SpecTable({ rows, accent = 'blue' }: { rows: { label: string; value: string }[]; accent?: AccentColor }) {
  const col = ACCENT[accent].solid
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,51,102,0.5)' }}>
      {rows.map(({ label, value }, idx) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          padding: '9px 14px',
          borderTop: idx > 0 ? '1px solid rgba(0,51,102,0.35)' : undefined,
          background: idx % 2 === 0 ? 'rgba(0,30,60,0.4)' : 'rgba(0,20,45,0.3)',
        }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: col, flexShrink: 0 }}>
            {label}
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ccddee', textAlign: 'right', lineHeight: 1.5 }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Bullet group (group header + bullet items) ───────────────────────────────

function BulletGroup({ label, items, accent = 'blue' }: { label: string; items: string[]; accent?: AccentColor }) {
  const col = ACCENT[accent].solid
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,51,102,0.5)' }}>
      <div style={{ padding: '8px 14px', background: 'rgba(0,40,80,0.7)' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: col }}>
          {label}
        </span>
      </div>
      {items.map((item, idx) => (
        <div key={idx} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 14px',
          borderTop: '1px solid rgba(0,51,102,0.35)',
          background: idx % 2 === 0 ? 'rgba(0,30,60,0.4)' : 'rgba(0,20,45,0.3)',
        }}>
          <span style={{ color: col, flexShrink: 0, marginTop: 1 }}>›</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#ccddee', lineHeight: 1.6 }}>{item}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Callout card ─────────────────────────────────────────────────────────────

function Callout({ children, accent = 'blue' }: { children: React.ReactNode; accent?: AccentColor }) {
  return (
    <div style={{
      borderRadius: 12, padding: '14px 18px',
      background: ACCENT[accent].bg,
      border: `1px solid ${ACCENT[accent].border}`,
      fontSize: '12px', color: '#aabbcc', lineHeight: 1.7,
    }}>
      {children}
    </div>
  )
}

// ─── Image grid ───────────────────────────────────────────────────────────────

function ImgGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 14,
    }}>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ControlsPage() {
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
        <Link href="/nartech" style={{
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
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#0066cc' }}>Software</span>
          <span style={{ width: 1, height: 12, background: 'rgba(0,102,204,0.4)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em' }}>Controls</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#334455' }}>
          Team 3128
        </span>
      </nav>

      {/* ── Hero banner ── */}
      <div style={{
        width: '100%', padding: '52px 32px 40px',
        borderBottom: '1px solid rgba(0,51,102,0.3)',
        background: 'linear-gradient(180deg, rgba(0,20,50,0.6) 0%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#0066cc' }}>
            Team 3128 · Aluminum Narwhals
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.05, margin: '10px 0 16px' }}>
            Controls
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: '#8899bb', lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
            A finite-state-machine architecture built on a shared common library, field-relative swerve control, multi-camera vision, and a custom web dashboard — designed for reliability under match conditions.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '52px 32px 80px' }}>

        {/* ════════════════════════════════════════
            1. STATE MACHINE ARCHITECTURE
        ════════════════════════════════════════ */}
        <Section title="State Machine Architecture" tag="Software Design" accent="blue">
          <Callout accent="blue">
            Each subsystem is modelled as a finite state machine. Mechanisms hold distinct states and a transition map governs every valid move between them — making robot behaviour predictable, testable, and easy to debug mid-match.
          </Callout>

          <div style={{ height: 16 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BulletGroup accent="blue" label="NAR_Subsystem Interface" items={[
              'Specifies the functionality and expectations every subsystem on the robot must satisfy',
              'Enforces a consistent API across all mechanisms',
            ]} />
            <BulletGroup accent="blue" label="NAR_PIDSubsystem" items={[
              'Custom PID subsystem class with quality-of-life additions over WPILib\'s base',
              'Shared across Position, Velocity, and Voltage subsystem types',
            ]} />
            <BulletGroup accent="blue" label="Mechanism Types" items={[
              'Position-based — elevator, pivot, climber',
              'Velocity-based — shooter drum',
              'Voltage-based — rollers, manipulator',
            ]} />
            <BulletGroup accent="blue" label="Transitions & Transition Maps" items={[
              'Maps a named "state" of the subsystem to a set of mechanism target states',
              'Default states are the entry point; exclusive states are only reachable from a specific default',
              'The default → exclusive pairing creates a clear visual model of robot intent',
            ]} />
          </div>

          <div style={{ height: 20 }} />

          {/* State machine diagram images */}
          <ImgCard
              src="/images/controls/robot-state-machine.png"
              caption="Superstructure state diagram — top-level coordination of all subsystems"
              accent="blue"
              pill="Superstructure"
            />
          <ImgGrid cols={2}>
            <ImgCard
              src="/images/subsystems/climber/climber-state-machine.png"
              caption="Climber state diagram"
              accent="blue"
              pill="Climber"
            />
            <ImgCard
              src="/images/subsystems/shooter/shooter-state-machine.png"
              caption="Shooter state diagrams"
              accent="blue"
              pill="Shooter"
            />
          </ImgGrid>
        </Section>

        {/* ════════════════════════════════════════
            2. VISION & ODOMETRY
        ════════════════════════════════════════ */}
        <Section title="Vision &amp; Odometry" tag="Pose Estimation" accent="teal">
          <Callout accent="teal">
            Four cameras — two OV2311s and two Luma P1s — run off a Raspberry Pi with PhotonVision, maximising AprilTag visibility at all field positions. Gyro-stabilised inputs filter out unreliable estimates before they reach the pose estimator.
          </Callout>

          <div style={{ height: 16 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BulletGroup accent="teal" label="Vision Setup" items={[
              '2× OV2311 + 2× Luma P1 cameras on a Raspberry Pi running PhotonVision',
              'Four cameras for maximum AprilTag coverage at all field positions',
              'PhotonVision settings tuned to maximise accuracy',
            ]} />
            <BulletGroup accent="teal" label="Tag Filtering" items={[
              'Ambiguity — reject any tag with pose ambiguity above 0.3',
              'Distance — filter tags beyond ~4.0 m',
              'ID filtering — reject tags identified through testing as detrimental to pose accuracy',
            ]} />
            <BulletGroup accent="teal" label="Pose Utilisation" items={[
              'Autonomous — pose estimates guarantee consistency regardless of field conditions',
              'Auto-align to hub for shooting from anywhere with a single button',
              'Auto-align to tower for climbing — reaches and climbs within 4 seconds',
              'Shooting interpolation — shooter voltage computed from distance to hub in real time',
            ]} />
          </div>

          <div style={{ height: 20 }} />

          {/* <ImgGrid cols={2}>
            <ImgCard
              src="/images/controls/vision/camera-layout.png"
              caption="Camera mounting positions and field-of-view coverage map"
              accent="teal"
              pill="Hardware"
            />
            <ImgCard
              src="/images/controls/vision/photonvision-ui.png"
              caption="PhotonVision interface — AprilTag detection and ambiguity readout"
              accent="teal"
              pill="PhotonVision"
            />
            <ImgCard
              src="/images/controls/vision/pose-estimator.png"
              caption="Pose estimator output on Narwhal Dashboard — field position overlay"
              accent="teal"
              pill="Odometry"
            />
            <ImgCard
              src="/images/controls/vision/auto-align.png"
              caption="Auto-align to hub — heading correction visualised on dashboard"
              accent="teal"
              pill="Auto-Align"
            />
          </ImgGrid> */}
        </Section>

        {/* ════════════════════════════════════════
            3. AUTONOMOUS
        ════════════════════════════════════════ */}
        <Section title="Autonomous Control" tag="Auto" accent="green">
          <Callout accent="green">
            Pose-based auto routines execute scoring and alignment sequences without driver input. A system-check mode lets the team verify all subsystems between matches with a single button press.
          </Callout>

          <div style={{ height: 16 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BulletGroup accent="green" label="Auto Movement" items={[
              'Auto-alignment to hub with shooting interpolation — shoot from any field position',
              'Auto-alignment to nearest tower for climbing — full sequence in under 4 seconds',
              'Shooter voltage interpolated from hub distance for consistent scoring',
            ]} />
            <BulletGroup accent="green" label="System Check" items={[
              'Single button press runs a check routine across all subsystems',
              'Used between matches to quickly confirm full robot functionality',
            ]} />
          </div>

          <div style={{ height: 20 }} />

          <ImgGrid cols={1}>
            {/* <ImgCard
              src="/images/controls/auto/routine-selector.png"
              caption="Auto routine selector on Narwhal Dashboard"
              accent="green"
              pill="Selector"
              wide={false}
            /> */}
            {/* <ImgCard
              src="/images/controls/auto/path-visualiser.png"
              caption="PathPlanner route visualisation — auto movement trajectories"
              accent="green"
              pill="Pathplanner"
            /> */}
            <ImgCard
              src="/images/controls/system_tests.png"
              caption="System check readout — pass/fail per subsystem"
              accent="green"
              pill="System Check"
            />
            <ImgCard
              src="/images/subsystems/shooter/interpolation.png"
              caption="Shooter interpolation — RPS vs. distance from hub"
              accent="green"
              pill="Interpolation"
            />
          </ImgGrid>
        </Section>

        {/* ════════════════════════════════════════
            4. COMMON REPOSITORY
        ════════════════════════════════════════ */}
        <Section title="Common Repository" tag="3128-Common" accent="purple">
          <Callout accent="purple">
            Code reused across seasons lives in a shared GitHub repository, distributed via JitPack the same way vendordep libraries like Phoenix and REVLib are consumed — one dependency update propagates to all users instantly.
          </Callout>

          <div style={{ height: 16 }} />

          <SpecTable accent="purple" rows={[
            { label: 'Repository',     value: 'github.com/Team3128/3128-common' },
            { label: 'Distribution',   value: 'JitPack (vendordep-style)' },
            { label: 'Access method',  value: 'Git submodule within robot repo' },
            { label: 'Update model',   value: 'Single dependency bump — propagates to all users' },
          ]} />

          <div style={{ height: 12 }} />

          <BulletGroup accent="purple" label="Library Contents" items={[
            'Swerve base — field-centric drive, module control, odometry',
            'Subsystem templates — NAR_PIDSubsystem, FSM base, Position / Velocity / Voltage bases',
            'Transitions and transition maps',
            'Control systems — PID, feed-forward, trapezoidal PID',
            'Motor wrappers, Shuffleboard interface, Narwhal Dashboard WebSocket',
            'Vision processing, SysID utilities',
            'Controller wrappers — Xbox, button boards',
          ]} />

          <div style={{ height: 20 }} />

          {/* <ImgGrid cols={2}>
            <ImgCard
              src="/images/controls/common/repo-structure.png"
              caption="3128-common repository structure on GitHub"
              accent="purple"
              pill="GitHub"
            />
            <ImgCard
              src="/images/controls/common/jitpack-dep.png"
              caption="JitPack dependency declaration in build.gradle"
              accent="purple"
              pill="JitPack"
            />
          </ImgGrid> */}
        </Section>

        {/* ════════════════════════════════════════
            5. NARWHAL DASHBOARD
        ════════════════════════════════════════ */}
        <Section title="Narwhal Dashboard" tag="Custom Dashboard" accent="orange">
          <Callout accent="orange">
            A custom React web dashboard that replaces WPILib's built-in dashboards with a faster, more flexible, and team-specific alternative — built to serve drivers during matches and programmers during testing.
          </Callout>

          <div style={{ height: 16 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BulletGroup accent="orange" label="Purpose" items={[
              'Offloads data processing from the RoboRIO to the driver station computer',
              'Unified tool for drivers (match-day telemetry) and programmers (debugging and tuning)',
            ]} />
            <BulletGroup accent="orange" label="Implementation" items={[
              'Written in React JS (HTML / CSS / JS)',
              'Connects to the RoboRIO via a Java WebSocket server, receiving tagged JSON data',
              'Annotation processor on the Java side marks fields for automatic dashboard exposure',
              'Modular widget system — panels can be rearranged and toggled without code changes',
            ]} />
          </div>

          <div style={{ height: 20 }} />

          {/* Wide banner image for the dashboard */}
          <ImgGrid cols={1}>
            <ImgCard
              src="/images/controls/drivers_view.png"
              caption="Narwhal Dashboard — full match-day layout with swerve telemetry, subsystem states, auto selector, and vision overlay"
              accent="orange"
              pill="Dashboard"
              wide={false}
            />
          </ImgGrid>

          <div style={{ height: 14 }} />
{/* 
          <ImgGrid cols={2}>
            <ImgCard
              src="/images/controls/dashboard/swerve-widget.png"
              caption="Swerve module telemetry widget — real-time angle and velocity per module"
              accent="orange"
              pill="Swerve"
            />
            <ImgCard
              src="/images/controls/dashboard/vision-overlay.png"
              caption="Vision overlay widget — field position and tag detections"
              accent="orange"
              pill="Vision"
            />
            <ImgCard
              src="/images/controls/dashboard/subsystem-states.png"
              caption="Subsystem state readout — current FSM state per mechanism"
              accent="orange"
              pill="States"
            />
            <ImgCard
              src="/images/controls/dashboard/websocket-debug.png"
              caption="WebSocket JSON stream — raw tagged data from RoboRIO"
              accent="orange"
              pill="Debug"
            />
          </ImgGrid> */}
        </Section>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: '1px solid rgba(0,51,102,0.3)',
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