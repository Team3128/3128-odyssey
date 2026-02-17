'use client'

/**
 * FRC Team 3128 – Aluminum Narwhals
 * Technical Binder — GLB Edition
 *
 * SETUP
 * ─────────────────────────────────────────────────────────────────────────────
 * npm install three gsap
 * npm install --save-dev @types/three
 *
 * Place your robot model at:   /public/models/robot.glb
 *
 * TUNING CAMERA POSITIONS
 * ─────────────────────────────────────────────────────────────────────────────
 * After your model loads, open the browser console and run:
 *   window.__cam.position   → current camera position
 *   window.__cam.lookAt     → current look-at target
 * Orbit the model to frame a subsystem, then copy those values into
 * the `camera` / `lookAt` fields in SUBSYSTEMS below.
 *
 * SUBSYSTEM HIGHLIGHTING
 * ─────────────────────────────────────────────────────────────────────────────
 * In your GLB, name each part (or part group) in your CAD tool before exporting.
 * Set `meshNames` in each subsystem to match those names — the page will
 * highlight those meshes and dim everything else as you scroll to that section.
 * Leave `meshNames: []` to skip highlighting for that section.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Types ────────────────────────────────────────────────────────────────────

interface CameraTarget {
  position: { x: number; y: number; z: number }
  lookAt: { x: number; y: number; z: number }
}

interface Subsystem {
  id: string
  label: string
  category: string
  description: string
  specs: { label: string; value: string }[]
  align: 'left' | 'right'
  /** Names of meshes in the GLB to highlight. Set [] to skip highlighting. */
  meshNames: string[]
  camera: CameraTarget
}

// ─── Subsystem Configuration ──────────────────────────────────────────────────
// Adjust camera positions + lookAt to frame your actual robot model.
// Start with these defaults, then fine-tune using the console tip above.

const SUBSYSTEMS: Subsystem[] = [
  {
    id: 'drivetrain',
    label: 'Drivetrain',
    category: 'Mobility',
    description:
      'High-performance swerve drive with custom-machined modules and a carbon-fiber chassis. Field-centric control via NavX gyroscope gives the driver intuitive, orientation-independent movement at up to 16 ft/s.',
    specs: [
      { label: 'Configuration', value: 'Swerve Drive (4 modules)' },
      { label: 'Drive Motors', value: '4× NEO Brushless' },
      { label: 'Steer Motors', value: '4× NEO 550' },
      { label: 'Top Speed', value: '16 ft/s' },
      { label: 'Chassis Material', value: 'Carbon Fiber + 6061 Al' },
      { label: 'Weight', value: '45 lbs' },
    ],
    align: 'left',
    meshNames: ['Drivetrain', 'Swerve_Module', 'Chassis'],
    camera: {
      position: { x: 3, y: 0.8, z: 5 },
      lookAt: { x: 0, y: 0.2, z: 0 },
    },
  },
  {
    id: 'intake',
    label: 'Intake',
    category: 'Game Piece Acquisition',
    description:
      'Over-the-bumper roller intake with adaptive compliance wheels that passively center game pieces. A single pneumatic cylinder deploys the intake in under 0.3 s, and a beam-break sensor confirms possession instantly.',
    specs: [
      { label: 'Type', value: 'OTB Roller Intake' },
      { label: 'Actuation', value: 'Single Pneumatic Cylinder' },
      { label: 'Deploy Time', value: '< 0.3 s' },
      { label: 'Intake Cycle', value: '0.8 s end-to-end' },
      { label: 'Detection', value: 'Beam-break Sensor' },
      { label: 'Success Rate', value: '95 %' },
    ],
    align: 'right',
    meshNames: ['Intake', 'Intake_Roller', 'Intake_Frame'],
    // camera: {
    //   position: { x: 4, y: 1.2, z: 4 },
    //   lookAt: { x: 4, y: 1.2, z: 1 },
    // },
    camera: {
      position: { x: 0, y: 0, z: -20 },
      lookAt: { x: 0, y: 0, z: -2 },
    },
  },
  {
    id: 'elevator',
    label: 'Elevator',
    category: 'Height Extension',
    description:
      'Three-stage cascading elevator with continuous Dyneema rigging and a carbon-fiber carriage. WPILib TrapezoidProfile motion planning ensures jerk-free extension to any of four preset heights.',
    specs: [
      { label: 'Stages', value: '3-Stage Cascade' },
      { label: 'Max Height', value: '78 in above ground' },
      { label: 'Drive Motors', value: '2× Falcon 500' },
      { label: 'Extension Time', value: '1.2 s (ground → high)' },
      { label: 'Position Sensor', value: 'Absolute Encoder' },
      { label: 'Repeat Precision', value: '± 0.5 in' },
    ],
    align: 'left',
    meshNames: ['Elevator', 'Elevator_Carriage', 'Elevator_Stage'],
    camera: {
      position: { x: 3.5, y: 2.5, z: 3 },
      lookAt: { x: 0, y: 2.0, z: 0 },
    },
  },
  {
    id: 'arm',
    label: 'Articulated Arm',
    category: 'Scoring Reach',
    description:
      'Single-joint arm driven through a 100:1 gearbox with a NEO motor. Feed-forward + PID control holds position against gravity at any angle, and a through-bore encoder provides absolute feedback without homing.',
    specs: [
      { label: 'Type', value: 'Single-Joint Rotary' },
      { label: 'Motor', value: 'NEO Brushless' },
      { label: 'Reduction', value: '100:1 Planetary' },
      { label: 'Range of Motion', value: '180°' },
      { label: 'Feedback', value: 'Through-bore Absolute Encoder' },
      { label: 'Accuracy', value: '± 1°' },
    ],
    align: 'right',
    meshNames: ['Arm', 'Arm_Link', 'Shoulder'],
    camera: {
      position: { x: 2.5, y: 3.8, z: 3.5 },
      lookAt: { x: 0, y: 3.3, z: 0 },
    },
  },
  {
    id: 'effector',
    label: 'End Effector',
    category: 'Game Piece Handling',
    description:
      'Compliant roller gripper that handles both cone and cube without reconfiguration. Independent left/right roller control lets the robot correct off-center pieces mid-grip. Integrated beam-break confirms secure possession before every scoring move.',
    specs: [
      { label: 'Game Pieces', value: 'Cone & Cube (universal)' },
      { label: 'Actuation', value: 'Dual Independent Rollers' },
      { label: 'Motors', value: '2× NEO 550' },
      { label: 'Sensors', value: '2× Beam-break' },
      { label: 'Grip Force', value: 'Software-variable' },
      { label: 'Cycle Time', value: '0.5 s' },
    ],
    align: 'left',
    meshNames: ['EndEffector', 'Gripper', 'Claw'],
    camera: {
      position: { x: 1.5, y: 3.6, z: 3 },
      lookAt: { x: 0, y: 3.3, z: 1 },
    },
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const HERO_CAMERA: CameraTarget = {
  position: { x: -3, y: 2.5, z: 9 },
  lookAt: { x: -3, y: 1.5, z: 0 },
}

const DIM_OPACITY = 0.08
const HIGHLIGHT_COLOR = new THREE.Color(0x4499ff)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Collect all meshes in a scene that match any of the given name fragments */
function getMeshesByNames(scene: THREE.Object3D, names: string[]): THREE.Mesh[] {
  if (names.length === 0) return []
  const result: THREE.Mesh[] = []
  scene.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh &&
      names.some((n) => obj.name.toLowerCase().includes(n.toLowerCase()))
    ) {
      result.push(obj)
    }
  })
  return result
}

/** Animate all meshes to full opacity / original colour */
function resetMaterials(allMeshes: THREE.Mesh[]) {
  allMeshes.forEach((mesh) => {
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (!mat) return
    gsap.to(mat, { opacity: 1, duration: 0.5 })
    mat.transparent = false
    mat.emissiveIntensity = 0
  })
}

/** Dim everything, then highlight the target set */
function highlightMeshes(allMeshes: THREE.Mesh[], targets: THREE.Mesh[]) {
  const targetSet = new Set(targets)
  allMeshes.forEach((mesh) => {
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (!mat) return
    if (targetSet.has(mesh)) {
      mat.transparent = false
      gsap.to(mat, { opacity: 1, duration: 0.5 })
      mat.emissive = HIGHLIGHT_COLOR
      mat.emissiveIntensity = 0.12
    } else {
      mat.transparent = true
      gsap.to(mat, { opacity: DIM_OPACITY, duration: 0.5 })
      mat.emissiveIntensity = 0
    }
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TechnicalBinder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadPct, setLoadPct] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeIdRef = useRef<string | null>(null)

  // Keep ref in sync so Three.js callbacks can read it without stale closure
  const setActive = useCallback((id: string | null) => {
    activeIdRef.current = id
    setActiveId(id)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    let rafId: number
    let disposed = false

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000d1a')
    scene.fog = new THREE.FogExp2(0x000d1a, 0.045)

    // ── Sizes ──────────────────────────────────────────────────────────────
    const sizes = {
      w: window.innerWidth,
      h: window.innerHeight,
    }

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, sizes.w / sizes.h, 0.05, 200)
    camera.position.set(
      HERO_CAMERA.position.x,
      HERO_CAMERA.position.y,
      HERO_CAMERA.position.z
    )

    // Mutable look-at target — GSAP tweens this object, render loop applies it
    const lookAt = {
      x: HERO_CAMERA.lookAt.x,
      y: HERO_CAMERA.lookAt.y,
      z: HERO_CAMERA.lookAt.z,
    }

    // Expose camera for devs tuning positions (see header comment)
    if (typeof window !== 'undefined') {
      ;(window as unknown as Record<string, unknown>).__cam = { position: camera.position, lookAt }
    }

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(sizes.w, sizes.h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace = THREE.SRGBColorSpace

    // ── Lights ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xddeeff, 0.55))

    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(6, 10, 8)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 0.5
    key.shadow.camera.far = 50
    key.shadow.camera.left = -8
    key.shadow.camera.right = 8
    key.shadow.camera.top = 8
    key.shadow.camera.bottom = -8
    key.shadow.bias = -0.001
    scene.add(key)

    // Cool blue fill from the front-left
    const fill = new THREE.DirectionalLight(0x2255cc, 0.9)
    fill.position.set(-5, 4, 6)
    scene.add(fill)

    // Warm rim from behind to separate robot from background
    const rim = new THREE.DirectionalLight(0xffeedd, 0.6)
    rim.position.set(0, 3, -6)
    scene.add(rim)

    // Ground bounce
    const bounce = new THREE.HemisphereLight(0x001f3f, 0x000000, 0.4)
    scene.add(bounce)

    // ── Ground + Grid ──────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({
        color: 0x000814,
        metalness: 0.1,
        roughness: 0.95,
      })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.02
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(40, 40, 0x002244, 0x001122)
    grid.position.y = -0.01
    scene.add(grid)

    // ── Load GLB ───────────────────────────────────────────────────────────
    const dracoLoader = new DRACOLoader()
    // Draco decoder wasm — served from Next.js public folder.
    // Copy node_modules/three/examples/jsm/libs/draco/ to public/draco/
    dracoLoader.setDecoderPath('/draco/')

    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    let allMeshes: THREE.Mesh[] = []
    let robotRoot: THREE.Object3D | null = null

    gltfLoader.load(
      'models/3128robot2026.glb',
      (gltf) => {
        if (disposed) return

        robotRoot = gltf.scene

        // Auto-scale & centre
        const box = new THREE.Box3().setFromObject(robotRoot)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 5 / maxDim           // normalise to ~5 unit tall
        robotRoot.scale.setScalar(scale)
        robotRoot.position.sub(center.multiplyScalar(scale))
        robotRoot.position.y += 0           // sit on ground
        robotRoot.rotateX(-Math.PI/2)
        robotRoot.rotateZ(-Math.PI/3);

        // Shadows + material prep
        robotRoot.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true
            obj.receiveShadow = true

            // Clone material so we can tween individual meshes independently
            if (!Array.isArray(obj.material)) {
              obj.material = obj.material.clone()
            }

            allMeshes.push(obj)
          }
        })

        scene.add(robotRoot)
        setLoadState('ready')
        setupScrollAnimations()
      },
      (xhr) => {
        if (xhr.total > 0) setLoadPct(Math.round((xhr.loaded / xhr.total) * 100))
      },
      (err) => {
        console.error('GLB load error:', err)
        // Fallback: simple placeholder so the page isn't broken
        buildPlaceholder()
        setLoadState('ready')
        setupScrollAnimations()
      }
    )

    // Fallback geometry while model loads / if file missing
    function buildPlaceholder() {
      const group = new THREE.Group()

      const mat = (color: number) =>
        new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 })

      // Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.25, 2.8), mat(0x003366))
      base.position.y = 0.125
      base.castShadow = true
      base.name = 'Chassis'
      group.add(base)

      // Wheels
      ;[[-1.1, 1.1], [1.1, 1.1], [-1.1, -1.1], [1.1, -1.1]].forEach(([x, z]) => {
        const w = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.18, 24),
          mat(0x111111)
        )
        w.rotation.z = Math.PI / 2
        w.position.set(x, 0.28, z)
        w.name = 'Drivetrain'
        group.add(w)
      })

      // Elevator column
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.8, 0.3), mat(0x0055aa))
      col.position.set(-0.8, 1.65, 0)
      col.castShadow = true
      col.name = 'Elevator'
      group.add(col)

      // Intake bar
      const intake = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.3), mat(0x001f3f))
      intake.position.set(0, 0.55, 1.4)
      intake.name = 'Intake'
      group.add(intake)

      // Arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.25), mat(0x0077cc))
      arm.position.set(0.5, 3.2, 0)
      arm.name = 'Arm'
      group.add(arm)

      // Effector
      const effector = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat(0x0044aa))
      effector.position.set(0.5, 3.2, 0.9)
      effector.name = 'EndEffector'
      group.add(effector)

      robotRoot = group
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.material = (o.material as THREE.Material).clone()
          allMeshes.push(o)
        }
      })
      scene.add(group)
    }

    // ── Scroll Animations ──────────────────────────────────────────────────

    function animateCamera(target: CameraTarget, scrub = 0.1) {
      return {
        position: target.position,
        lookAt: target.lookAt,
        scrub,
      }
    }

    function setupScrollAnimations() {
      // Helper that smoothly moves camera + lookAt together
      function tweenCamera(
        toPosition: { x: number; y: number; z: number },
        toLookAt: { x: number; y: number; z: number },
        trigger: string,
        scrub = 0.1
      ) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: 'top center',
            end: 'bottom center',
            scrub,
          },
        })
        tl.to(camera.position, { ...toPosition, ease: 'power2.inOut' }, 0)
        tl.to(lookAt, { ...toLookAt, ease: 'power2.inOut' }, 0)
        return tl
      }

      // Hero — already at start position, just pin briefly
      gsap.timeline({
        scrollTrigger: {
          trigger: '#section-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.1,
          pin: false,
        },
      })
        .to(camera.position, { ...HERO_CAMERA.position, ease: 'power2.inOut' }, 0)
        .to(lookAt, { ...HERO_CAMERA.lookAt, ease: 'power2.inOut' }, 0)

      // Subsystem sections
      SUBSYSTEMS.forEach((sub) => {
        const tl = tweenCamera(
          sub.camera.position,
          sub.camera.lookAt,
          `#section-${sub.id}`,
          0.1
        )

        ScrollTrigger.create({
          trigger: `#section-${sub.id}`,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => {
            setActive(sub.id)
            if (allMeshes.length > 0) {
              const targets = getMeshesByNames(scene, sub.meshNames)
              if (targets.length > 0) highlightMeshes(allMeshes, targets)
              else resetMaterials(allMeshes)
            }
          },
          onEnterBack: () => {
            setActive(sub.id)
            if (allMeshes.length > 0) {
              const targets = getMeshesByNames(scene, sub.meshNames)
              if (targets.length > 0) highlightMeshes(allMeshes, targets)
              else resetMaterials(allMeshes)
            }
          },
          onLeave: () => {
            if (activeIdRef.current === sub.id) {
              resetMaterials(allMeshes)
              setActive(null)
            }
          },
          onLeaveBack: () => {
            resetMaterials(allMeshes)
            setActive(null)
          },
        })

        return tl
      })

      // Outro — pull back to hero view
      tweenCamera(
        { x: HERO_CAMERA.position.x, y: HERO_CAMERA.position.y + 1, z: HERO_CAMERA.position.z + 2 },
        HERO_CAMERA.lookAt,
        '#section-outro',
        1.4
      )
    }

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      sizes.w = window.innerWidth
      sizes.h = window.innerHeight
      camera.aspect = sizes.w / sizes.h
      camera.updateProjectionMatrix()
      renderer.setSize(sizes.w, sizes.h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    window.addEventListener('resize', onResize)

    // ── Render loop ────────────────────────────────────────────────────────
    const _lookAtVec = new THREE.Vector3()
    const tick = () => {
      _lookAtVec.set(lookAt.x, lookAt.y, lookAt.z)
      camera.lookAt(_lookAtVec)
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    tick()

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      ScrollTrigger.getAll().forEach((t) => t.kill())
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
  }, [setActive])

  // ─── UI ─────────────────────────────────────────────────────────────────────

  return (
    <div className="relative" style={{ background: '#000d1a' }}>

      {/* ── Loading screen ───────────────────────────────────────────────── */}
      {loadState === 'loading' && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: '#000d1a' }}
        >
          {/* Narwhal pulse */}
          <div
            className="w-28 h-28 mb-8 rounded-full flex items-center justify-center text-6xl"
            style={{ background: 'white', boxShadow: '0 0 80px rgba(0,102,204,0.6)' }}
          >
            🦄
          </div>

          <p
            className="text-sm font-bold uppercase tracking-[0.35em] mb-3"
            style={{ color: '#0066cc' }}
          >
            Loading Robot CAD
          </p>

          {/* Progress bar */}
          <div
            className="w-64 h-[3px] rounded-full overflow-hidden"
            style={{ background: '#001f3f' }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${loadPct}%`,
                background: 'linear-gradient(90deg, #003fa3, #0066cc, #33aaff)',
              }}
            />
          </div>
          <p className="text-xs mt-3" style={{ color: '#336699' }}>
            {loadPct}%
          </p>
        </div>
      )}

      {/* ── Fixed 3D canvas ──────────────────────────────────────────────── */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-screen" style={{ zIndex: 0 }} />

      {/* ── Subsystem indicator dots (right edge) ───────────────────────── */}
      <div
        className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3"
        style={{ zIndex: 20 }}
      >
        {SUBSYSTEMS.map((sub) => (
          <button
            key={sub.id}
            onClick={() => {
              document.getElementById(`section-${sub.id}`)?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex items-center gap-2 group"
            title={sub.label}
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none"
              style={{ color: '#0066cc' }}
            >
              {sub.label}
            </span>
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: activeId === sub.id ? '10px' : '6px',
                height: activeId === sub.id ? '10px' : '6px',
                background: activeId === sub.id ? '#0066cc' : '#002244',
                boxShadow: activeId === sub.id ? '0 0 10px #0066cc' : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <div className="relative" style={{ zIndex: 10 }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          id="section-hero"
          className="min-h-screen flex flex-col justify-center pb-20 px-10 md:px-20"
        >
          {/* Team number — big, bottom-left */}
          <div>
            <div
              className="font-black leading-none select-none"
              style={{
                fontSize: 'clamp(7rem, 20vw, 16rem)',
                letterSpacing: '-0.04em',
                background: 'linear-gradient(170deg, #ffffff 30%, #0055bb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(0,102,204,0.35))',
              }}
            >
              3128
            </div>

            <h2
              className="font-bold uppercase tracking-[0.22em]"
              style={{
                fontSize: 'clamp(1.1rem, 3.5vw, 2.4rem)',
                color: '#ffffff',
                marginTop: '-0.3em',
                marginBottom: '1.5rem',
              }}
            >
              Aluminum Narwhals
            </h2>

          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ opacity: 0.55 }}
          >
            <div
              className="w-[1px] h-12"
              style={{
                background: 'linear-gradient(to bottom, transparent, #0066cc)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#0066cc' }}
            >
              Scroll
            </span>
          </div>
        </section>

        {/* ── SUBSYSTEM SECTIONS ───────────────────────────────────────── */}
        {SUBSYSTEMS.map((sub, i) => (
          <section
            key={sub.id}
            id={`section-${sub.id}`}
            className={`min-h-screen flex items-center px-10 md:px-20 ${
              sub.align === 'right' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className="max-w-lg w-full rounded-2xl overflow-hidden transition-all duration-500"
              style={{
                background:
                  activeId === sub.id
                    ? 'rgba(0, 20, 50, 0.92)'
                    : 'rgba(0, 10, 28, 0.75)',
                backdropFilter: 'blur(16px)',
                border:
                  activeId === sub.id
                    ? '1px solid rgba(0, 102, 204, 0.6)'
                    : '1px solid rgba(0, 51, 102, 0.4)',
                boxShadow:
                  activeId === sub.id
                    ? '0 0 60px rgba(0, 102, 204, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : 'none',
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  height: '3px',
                  background:
                    activeId === sub.id
                      ? 'linear-gradient(90deg, #003fa3, #0066cc, #33aaff)'
                      : 'rgba(0,51,102,0.5)',
                  transition: 'background 0.5s',
                }}
              />

              <div className="p-8">
                {/* Category tag */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: '#0066cc' }}
                  >
                    {String(i + 1).padStart(2, '0')} / {sub.category}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-bold mb-4"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                    lineHeight: 1.1,
                    color: activeId === sub.id ? '#ffffff' : '#aabbcc',
                    transition: 'color 0.4s',
                  }}
                >
                  {sub.label}
                </h3>

                {/* Description */}
                <p
                  className="mb-6 leading-relaxed"
                  style={{
                    color: '#8899bb',
                    fontSize: '0.9rem',
                  }}
                >
                  {sub.description}
                </p>

                {/* Spec table */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(0,51,102,0.5)' }}
                >
                  {sub.specs.map(({ label, value }, idx) => (
                    <div
                      key={label}
                      className="flex justify-between items-center px-4 py-2.5"
                      style={{
                        borderBottom:
                          idx < sub.specs.length - 1
                            ? '1px solid rgba(0,51,102,0.4)'
                            : 'none',
                        background: idx % 2 === 0 ? 'rgba(0,30,60,0.4)' : 'rgba(0,20,45,0.3)',
                      }}
                    >
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: '#0066cc' }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: '#ccddee' }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── OUTRO ────────────────────────────────────────────────────── */}
        <section
          id="section-outro"
          className="min-h-screen flex flex-col items-center justify-center text-center px-10"
        >
          <div
            className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
            style={{ color: '#0066cc' }}
          >
            Team 3128 · Aluminum Narwhals
          </div>
        </section>
      </div>
    </div>
  )
}