'use client'

/**
 * Subsystem Detail Page — Team 3128
 *
 * Route: /subsystems/[id]
 * Usage: Place at  app/subsystems/[id]/page.tsx
 *        Import and render <SubsystemPage /> passing the subsystem id as prop,
 *        or wire up params directly.
 *
 * The 3D model is touch-drag rotatable (mouse + touch).
 * All image paths are placeholders — drop real files into /public/images/subsystems/[id]/.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import Link from 'next/link'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpecGroup {
  groupLabel: string
  items: string[]
}

interface ImageCard {
  src: string
  caption: string
  category: 'dashboard' | 'process' | 'controls'
}

interface SubsystemData {
  id: string
  label: string
  category: string
  description: string
  /** Path to the subsystem-specific GLB, relative to /public e.g. /models/swerve.glb */
  modelPath: string
  /** Initial camera Z distance for the viewer */
  cameraZ: number
  /** Base Y rotation applied to model on load (radians) */
  baseRotationY: number
  specGroups: SpecGroup[]
  imageCards: ImageCard[]
  controlsNotes: string[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Duplicate / extend as needed for each subsystem

const SUBSYSTEM_DATA: Record<string, SubsystemData> = {
  swerve: {
    id: 'swerve',
    label: 'Drivetrain',
    category: 'Mobility',
    modelPath: '/models/subsystems/swerve.glb',
    description:
      'MK4i swerve modules with Kraken motors give the robot independent wheel steering, enabling omni-directional movement and field-centric control. The 26.5" × 26.5" bellypan chassis keeps electrical systems accessible while tapped steel plates provide rigid mounting points for all major assemblies.',
    cameraZ: 7,
    baseRotationY: 0,
    specGroups: [
      {
        groupLabel: 'MK4i Swerve Modules',
        items: [
          'L2 gear ratio (15.5 ft/s)',
          'SDS 4"D × 1.5"W Billet Wheel with Black Neoprene tread',
          'Kraken x60s for drive and Kraken x44s steering',
        ],
      },
      {
        groupLabel: 'Chassis',
        items: [
          '26.5" × 26.5" frame',
          'Bellypan for easy electrical access',
          'Tapped steel plates for mounting',
        ],
      },
      {
        groupLabel: 'Bumpers',
        items: [
          '5 segments for easy removal, 1 side with split bumper for climbing',
          '1/2" HDPE backing',
          'Layered foam to absorb impacts',
        ],
      },
    ],
    imageCards: [
      // { src: '/images/subsystems/swerve/module-closeup.png',   caption: 'MK4i module with Kraken x60 drive motor',      category: 'process'    },
      // { src: '/images/subsystems/swerve/chassis-top.png',      caption: 'Bellypan electrical layout — top view',        category: 'process'    },
      // { src: '/images/subsystems/swerve/bumper-segments.png',  caption: '5-segment bumper assembly with split side',    category: 'process'    },
      // { src: '/images/subsystems/swerve/dashboard-drive.png',  caption: 'Driver dashboard — swerve telemetry',          category: 'dashboard'  },
      // { src: '/images/subsystems/swerve/controls-map.png',     caption: 'Driver controller mapping',                   category: 'controls'   },
      // { src: '/images/subsystems/swerve/controls-pid.png',     caption: 'Swerve PID tuning interface',                 category: 'controls'   },
    ],
    controlsNotes: [
      // 'Field-centric drive via NavX2 gyroscope — heading is robot-orientation-independent',
      // 'Steer motors run closed-loop on CANCoder absolute position',
      // 'Drive motors use velocity control with feed-forward from SysId characterization',
      // 'Slip detection via motor current thresholds automatically reduces drive output',
    ],
  },
  shooter: {
    id: 'shooter',
    label: 'Shooter',
    category: 'Scoring',
    modelPath: '/models/subsystems/shooter.glb',
    description:
      'The Shooter accurately propels 3 balls into the hub at a time. A steel drum covered in cats tongue grips fuel, while geared Kraken x60s maintain velocity through sustained fire.',
    cameraZ: 7,
    baseRotationY: Math.PI / 4,
    specGroups: [
      {
        groupLabel: 'Drum',
        items: [
          '2 Kraken x60 geared 12:18 to prevent deceleration',
          '4" steel drum to increase the MOI when it has contact with the fuel',
          'Drum is covered in cats tongue for grip',
          '1/8" polycarbonate hood to prevent collision with hopper balls',
        ],
      },
      {
        groupLabel: 'Kicker Rollers',
        items: [
          '4 deadaxle rollers to carry fuel to shooter',
          'Single x44 on belt system',
          'Serializes the fuel, creating a downward force that propels hopper balls in while shooting is occurring',
        ],
      },
    ],
    imageCards: [
      // { src: '/images/subsystems/shooter/drum-closeup.png',    caption: 'Steel drum with cats tongue surface',          category: 'process'   },
      // { src: '/images/subsystems/shooter/hood-assembly.png',   caption: 'Polycarbonate hood and kicker roller layout',  category: 'process'   },
      { src: '/images/subsystems/shooter/interpolation.png',   caption: 'Interpolation graph to determine shooting speed from different distances', category: 'controls' },
      { src: '/images/subsystems/shooter/shooter-state-machine.png',    caption: 'Shooter State Diagram',     category: 'controls'  },
    ],
    controlsNotes: [
      'Controlled using a Bang-Bang PID Controller in order to ',
      'Shoot command waits for "at-speed" confirmation before releasing kicker rollers',
      'Able to shoot from any point on the field through distance-RPM interpolation',
    ],
  },
  hopper: {
    id: 'hopper',
    label: 'Hopper',
    category: 'Storage',
    modelPath: '/models/subsystems/hopper.glb',
    description:
      'The Hopper is an expandable serializer and storage unit serving as a pathway between the Intake and the Shooter. Polycarbonate expansion walls and deadaxle rollers keep fuel moving reliably.',
    cameraZ: 7,
    baseRotationY: -Math.PI / 6,
    specGroups: [
      {
        groupLabel: 'Hopper Rollers',
        items: [
          '6 lightweight deadaxle rollers connected through a belt and pulley system powered by a Kraken x44 motor',
          'Zip ties and silicone tubing added to deadaxle rollers to encourage ball movement towards the kicker rollers',
        ],
      },
      {
        groupLabel: 'Expandable Hopper',
        items: [
          'Two 1/16" polycarbonate plates on each side with 2 slots each to facilitate outward movement',
          'Bent rim design on the plates to keep fuel inside of the Hopper',
          'Polycarbonate plates connected to intake to stabilize walls and allow outward movement to run in parallel between the expanding Hopper walls and Intake',
        ],
      },
    ],
    imageCards: [
      // { src: '/images/subsystems/hopper/roller-assembly.png',  caption: 'Deadaxle roller belt system',                 category: 'process'   },
      // { src: '/images/subsystems/hopper/expansion-walls.png',  caption: 'Polycarbonate expansion plates extended',     category: 'process'   },
      // { src: '/images/subsystems/hopper/dashboard.png',        caption: 'Hopper state telemetry on dashboard',         category: 'dashboard' },
      { src: '/images/subsystems/hopper/hopper-state-machine.png',     caption: 'Hopper state machine',            category: 'controls'  },
    ],
    controlsNotes: [

    ],
  },
  intake: {
    id: 'intake',
    label: 'Intake',
    category: 'Game Piece Acquisition',
    modelPath: '/models/subsystems/intake.glb',
    description:
      'A touch-it-own-it rack and pinion design that dominates the field, stealing fuel from other alliances and forcing the fuel into the Hopper. Dual rollers and a tensioned hex axle maximize contact with game pieces.',
    cameraZ: 7,
    baseRotationY: Math.PI / 3,
    specGroups: [
      {
        groupLabel: 'Rack and Pinion',
        items: [
          'A 1/4" and a 3/16" polycarbonate rack plate bolted together and mounted against a pinion to allow the intake plates to extend outside of frame perimeter',
          'Rack and pinion design allows intake to move in a singular plane, limiting risk of cracked plates due to downwards force',
        ],
      },
      {
        groupLabel: 'Rollers and Axle',
        items: [
          'Two rollers and a hex axle',
          'Bottom roller grabs the fuel, sending them into the Hopper',
          'Top roller cycles the fuel within Hopper towards the Shooter, creating space for new fuel to enter the Hopper',
          'A hex axle (tensioned to Intake with silicone tubing) drops down and rests between bumper and ground, increasing contact between fuel and the secondary roller',
        ],
      },
    ],
    imageCards: [
      { src: '/images/subsystems/intake/rack-pinion.png',      caption: 'Rack and pinion mechanism detail',            category: 'process'   },
      { src: '/images/subsystems/intake/rollers.png',          caption: 'Dual roller and hex axle assembly',           category: 'process'   },
      { src: '/images/subsystems/intake/dashboard.png',        caption: 'Intake deployment state on dashboard',        category: 'dashboard' },
      { src: '/images/subsystems/intake/controls-map.png',     caption: 'Intake deployment — controller mapping',     category: 'controls'  },
    ],
    controlsNotes: [
      'Intake deploys and retracts via rack and pinion driven by a single motor',
      'Beam-break sensor at hopper entrance confirms fuel has been acquired',
      'Auto-intake mode deploys on field-centric approach within 1m of fuel',
      'Hex axle contact force is passive — silicone tubing tension self-adjusts',
    ],
  },
  climber: {
    id: 'climber',
    label: 'Climber',
    category: 'Endgame',
    modelPath: '/models/subsystems/climber.gltf',
    description:
      'The Climber functions on an elevator that serves as the backbone for the shooter, pulling the robot up as the elevator comes down. Steel hooks resist deformation under full robot weight, with Dyneema rope providing high-strength tensioning.',
    cameraZ: 8,
    baseRotationY: -Math.PI / 4,
    specGroups: [
      {
        groupLabel: 'Elevator',
        items: [
          'L1 climb',
          '2 constant force springs pulling up on the carriage, resetting it on a hardstop',
          '2 steel hooks (steel prevents warping over time due to robot weight)',
          'Extension of hooks is servo controlled due to the lack of needed movement',
          'Dyneema rope is used to tension the hooks',
        ],
      },
    ],
    imageCards: [
      // { src: '/images/subsystems/climber/elevator-full.png',   caption: 'Full elevator assembly extended',             category: 'process'   },
      // { src: '/images/subsystems/climber/hooks-detail.png',    caption: 'Steel hook and Dyneema rope attachment',      category: 'process'   },
      // { src: '/images/subsystems/climber/dashboard.png',       caption: 'Climber height telemetry on dashboard',       category: 'dashboard' },
      { src: '/images/subsystems/climber/climber-state-machine.png',    caption: 'Climber State Machine',           category: 'controls'  },
    ],
    controlsNotes: [
      // 'Climb sequence is semi-automated — driver confirms each stage with a button hold',
      // 'Elevator uses motion-profiled position control to avoid shock loading hooks',
      // 'Servo hook deployment is triggered automatically at target bar height',
      // 'Constant force springs reset carriage passively — no motor power needed on retract',
    ],
  },
}

// ─── Image placeholder component ─────────────────────────────────────────────

function ImgPlaceholder({ src, alt, caption, category }: { src: string; alt: string; caption: string; category: string }) {
  const [errored, setErrored] = useState(false)

  const categoryColor: Record<string, string> = {
    dashboard: '#00cc88',
    process:   '#0066cc',
    controls:  '#cc6600',
  }
  const col = categoryColor[category] ?? '#0066cc'

  return (
    <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,51,102,0.5)' }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'rgba(0,15,35,0.9)' }}>
        {!errored ? (
          <Image
            src={src}
            alt={alt}
            fill
            style={{ objectFit: 'cover' }}
            onError={() => setErrored(true)}
          />
        ) : (
          // Stylised placeholder shown when image file doesn't exist yet
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ padding: '12px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1.5px solid ${col}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.5,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="1.5" stroke={col} strokeWidth="1.2"/>
                <circle cx="5.5" cy="6.5" r="1.5" stroke={col} strokeWidth="1.2"/>
                <path d="M1 11l3.5-3 3 3 2.5-2.5 4 4" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '9px', color: col, opacity: 0.5, letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center', wordBreak: 'break-all' }}>
              {src}
            </span>
          </div>
        )}
        {/* Category pill */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          padding: '2px 8px', borderRadius: '20px',
          background: `${col}22`,
          border: `1px solid ${col}55`,
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: col,
        }}>
          {category}
        </div>
      </div>
      <div style={{ padding: '10px 12px', background: 'rgba(0,10,28,0.9)' }}>
        <p style={{ fontSize: '11px', color: '#aabbcc', lineHeight: 1.5, margin: 0 }}>{caption}</p>
      </div>
    </div>
  )
}

// ─── Interactive 3D Viewer ────────────────────────────────────────────────────

function ModelViewer({ modelPath, cameraZ, baseRotationY }: { modelPath: string; cameraZ: number; baseRotationY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadPct, setLoadPct] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let rafId: number
    let disposed = false

    // ── Scene — no fog so distant parts of the model stay crisp ──
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000d1a')

    const w = canvas.clientWidth  || canvas.offsetWidth
    const h = canvas.clientHeight || canvas.offsetHeight

    // Narrower FOV (32°) reduces perspective distortion on metallic surfaces
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.05, 200)
    camera.position.set(0, 1.5, cameraZ)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = false   // shadows off — no floor to receive them
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9   // slightly under-expose so metals don't blow out
    renderer.outputColorSpace = THREE.SRGBColorSpace

    // ── Studio 3-point lighting ──
    // Soft ambient keeps shadow areas from going pure black
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))

    // Key light — large, soft, slightly above and to the right
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(5, 8, 6)
    scene.add(key)

    // Fill light — cool tint, opposite side, lower intensity
    const fillL = new THREE.DirectionalLight(0xc8d8ff, 0.55)
    fillL.position.set(-6, 2, 4)
    scene.add(fillL)

    // Rim / back light — warm, behind model, adds separation from background
    const rimL = new THREE.DirectionalLight(0xffe8cc, 0.45)
    rimL.position.set(0, 4, -7)
    scene.add(rimL)

    // Under-fill — very subtle bounce from below, stops underside being pure black
    const underL = new THREE.DirectionalLight(0x8899bb, 0.15)
    underL.position.set(0, -5, 2)
    scene.add(underL)

    // ── Robot rotation state ──
    let rotY = baseRotationY
    let rotX = 0
    let targetRotY = baseRotationY
    let targetRotX = 0
    let autoSpin = true          // gentle auto-rotate until user touches
    let autoSpinSpeed = 0.003

    // ── Drag / touch handling ──
    let isDragging = false
    let lastX = 0
    let lastY = 0
    let velX = 0
    let velY = 0

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true; autoSpin = false
      lastX = e.clientX; lastY = e.clientY
      velX = 0; velY = 0
      canvas.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      velX = dx * 0.012
      velY = dy * 0.008
      targetRotY += dx * 0.012
      targetRotX += dy * 0.008
      targetRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotX))
      lastX = e.clientX; lastY = e.clientY
    }
    const onPointerUp = () => { isDragging = false }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup',   onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    // Pinch-to-zoom
    let lastPinchDist = 0
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const delta = lastPinchDist - dist
        camera.position.z = Math.max(3, Math.min(15, camera.position.z + delta * 0.02))
        lastPinchDist = dist
      }
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })

    // Scroll-to-zoom on desktop
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      camera.position.z = Math.max(3, Math.min(15, camera.position.z + e.deltaY * 0.01))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })

    // ── Load model ──
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    let robotRoot: THREE.Object3D | null = null

    gltfLoader.load(
      modelPath,
      (gltf) => {
        if (disposed) return
        robotRoot = gltf.scene
        const box = new THREE.Box3().setFromObject(robotRoot)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const scale = 4.5 / Math.max(size.x, size.y, size.z)
        robotRoot.scale.setScalar(scale)
        robotRoot.position.sub(center.multiplyScalar(scale))
        robotRoot.rotateX(-Math.PI / 2)
        robotRoot.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true; obj.receiveShadow = true
            if (!Array.isArray(obj.material)) obj.material = obj.material.clone()
          }
        })
        scene.add(robotRoot)
        setReady(true)
      },
      (xhr) => { if (xhr.total > 0) setLoadPct(Math.round((xhr.loaded / xhr.total) * 100)) },
      () => {
        // Fallback placeholder box
        const group = new THREE.Group()
        const mat = (c: number) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.6, roughness: 0.4 })
        group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.25, 2.8), mat(0x003366)), { castShadow: true }))
        ;[[-1.1,1.1],[1.1,1.1],[-1.1,-1.1],[1.1,-1.1]].forEach(([x,z]) => {
          const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.18,24), mat(0x111111))
          w2.rotation.z = Math.PI/2; w2.position.set(x,0.28,z); group.add(w2)
        })
        robotRoot = group; scene.add(group)
        setReady(true)
      }
    )

    // ── Resize ──
    const onResize = () => {
      const nw = canvas.clientWidth; const nh = canvas.clientHeight
      camera.aspect = nw / nh; camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)

    // ── Tick ──
    const lookAtVec = new THREE.Vector3(0, 0.5, 0)
    const tick = () => {
      if (!disposed) rafId = requestAnimationFrame(tick)

      if (!isDragging) {
        if (autoSpin) targetRotY += autoSpinSpeed
        // momentum decay
        velX *= 0.92; velY *= 0.92
        targetRotY += velX * 0.1
        targetRotX += velY * 0.1
        targetRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotX))
      }

      rotY += (targetRotY - rotY) * 0.08
      rotX += (targetRotX - rotX) * 0.08

      if (robotRoot) {
        robotRoot.rotation.y = rotY
        robotRoot.rotation.x = -Math.PI / 2 + rotX
      }

      camera.lookAt(lookAtVec)
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      canvas.removeEventListener('pointerdown',   onPointerDown)
      canvas.removeEventListener('pointermove',   onPointerMove)
      canvas.removeEventListener('pointerup',     onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('touchstart',    onTouchStart)
      canvas.removeEventListener('touchmove',     onTouchMove)
      canvas.removeEventListener('wheel',         onWheel)
      ro.disconnect()
      dracoLoader.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => m.dispose())
        }
      })
      renderer.dispose()
    }
  }, [modelPath, cameraZ, baseRotationY])

  return (
    <div className="relative w-full" style={{ height: '100%' }}>
      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
          style={{ background: '#000d1a' }}>
          <div className="w-48 h-[2px] rounded-full overflow-hidden" style={{ background: '#001f3f' }}>
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${loadPct}%`, background: 'linear-gradient(90deg,#003fa3,#0066cc,#33aaff)' }} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#0066cc' }}>
            {loadPct}%
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: 'grab', touchAction: 'none', display: 'block' }}
      />
      {/* Hint */}
      {ready && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2"
          style={{ opacity: 0.45, pointerEvents: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#0066cc" strokeWidth="1"/>
            <path d="M4 7h6M7 4v6" stroke="#0066cc" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em]" style={{ color: '#0066cc' }}>
            Drag to rotate · Pinch to zoom
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom,#0066cc,#33aaff)', flexShrink: 0 }} />
        <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
          {title}
        </h2>
        {accent && (
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0066cc', marginLeft: 4 }}>
            {accent}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface SubsystemPageProps {
  /** Pass the subsystem id from your Next.js route params */
  id: string
}

export default function SubsystemPage({ id }: SubsystemPageProps) {
  const data = SUBSYSTEM_DATA[id] ?? SUBSYSTEM_DATA['swerve']
  const [isVertical, setIsVertical] = useState(false)

  useEffect(() => {
    const check = () => setIsVertical(window.innerHeight > window.innerWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const dashboardCards = data.imageCards.filter((c) => c.category === 'dashboard')
  const processCards   = data.imageCards.filter((c) => c.category === 'process')
  const controlsCards  = data.imageCards.filter((c) => c.category === 'controls')

  return (
    <div style={{ background: '#000d1a', minHeight: '100vh', color: '#ffffff' }}>

      {/* ── Top nav bar ── */}
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
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#0066cc' }}>
            {data.category}
          </span>
          <span style={{ width: 1, height: 12, background: 'rgba(0,102,204,0.4)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em' }}>
            {data.label}
          </span>
        </div>

        <Link href="/nartech" style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#336699', textDecoration: 'none',
        }}>
          All Systems
        </Link>
      </nav>

      {/* ── 3D Model Viewer ── */}
      <div style={{
        width: '100%',
        height: isVertical ? '45vh' : '55vh',
        position: isVertical ? 'sticky' : 'relative',
        top: isVertical ? 52 : undefined,
        zIndex: isVertical ? 30 : undefined,
        borderBottom: '1px solid rgba(0,51,102,0.3)',
      }}>
        <ModelViewer modelPath={data.modelPath} cameraZ={data.cameraZ} baseRotationY={data.baseRotationY} />

        {/* Subsystem label overlaid on the viewer */}
        <div style={{
          position: 'absolute', top: 16, left: 20,
          display: 'flex', flexDirection: 'column', gap: 2,
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#0066cc' }}>
            {data.category}
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1, margin: 0 }}>
            {data.label}
          </h1>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isVertical ? '32px 16px 60px' : '48px 32px 80px' }}>

        {/* Description */}
        <p style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
          color: '#8899bb', lineHeight: 1.75,
          marginBottom: 48,
          maxWidth: 720,
        }}>
          {data.description}
        </p>

        {/* ── Mechanical Specs ── */}
        <Section title="Mechanical Specifications">
          <div className="flex flex-col gap-5">
            {data.specGroups.map((group) => (
              <div key={group.groupLabel} style={{
                borderRadius: 14, overflow: 'hidden',
                border: '1px solid rgba(0,51,102,0.5)',
              }}>
                <div style={{ padding: '8px 14px', background: 'rgba(0,40,80,0.7)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#33aaff' }}>
                    {group.groupLabel}
                  </span>
                </div>
                {group.items.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '9px 14px',
                    borderTop: '1px solid rgba(0,51,102,0.35)',
                    background: idx % 2 === 0 ? 'rgba(0,30,60,0.4)' : 'rgba(0,20,45,0.3)',
                  }}>
                    <span style={{ color: '#0066cc', flexShrink: 0, marginTop: 1 }}>›</span>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#ccddee', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <div style={{ height: 52 }} />

        {/* ── Process / Build Photos ── */}
        {processCards.length > 0 && (
          <Section title="Build Process" accent="Engineering">
            <div style={{
              display: 'grid',
              gridTemplateColumns: isVertical ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {processCards.map((card) => (
                <ImgPlaceholder key={card.src} src={card.src} alt={card.caption} caption={card.caption} category={card.category} />
              ))}
            </div>
          </Section>
        )}

        <div style={{ height: 52 }} />

        {/* ── Dashboard ── */}
        {dashboardCards.length > 0 && (
          <Section title="Robot Dashboard" accent="Telemetry">
            <div style={{
              display: 'grid',
              gridTemplateColumns: isVertical ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
            }}>
              {dashboardCards.map((card) => (
                <ImgPlaceholder key={card.src} src={card.src} alt={card.caption} caption={card.caption} category={card.category} />
              ))}
            </div>
          </Section>
        )}

        <div style={{ height: 52 }} />

        {/* ── Controls ── */}
        <Section title="Controls &amp; Software" accent="Operator">
          {/* Notes */}
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            border: '1px solid rgba(0,51,102,0.5)',
            marginBottom: 16,
          }}>
            <div style={{ padding: '8px 14px', background: 'rgba(0,40,80,0.7)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#cc8833' }}>
                Implementation Notes
              </span>
            </div>
            {data.controlsNotes.map((note, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '9px 14px',
                borderTop: '1px solid rgba(0,51,102,0.35)',
                background: idx % 2 === 0 ? 'rgba(0,30,60,0.4)' : 'rgba(0,20,45,0.3)',
              }}>
                <span style={{ color: '#cc8833', flexShrink: 0, marginTop: 1 }}>›</span>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#ccddee', lineHeight: 1.6 }}>{note}</span>
              </div>
            ))}
          </div>

          {/* Controls images */}
          {controlsCards.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isVertical ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {controlsCards.map((card) => (
                <ImgPlaceholder key={card.src} src={card.src} alt={card.caption} caption={card.caption} category={card.category} />
              ))}
            </div>
          )}
        </Section>

        <div style={{ height: 52 }} />

        {/* ── Footer nav ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: '1px solid rgba(0,51,102,0.3)',
        }}>
          <Link href="/nartech" style={{
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