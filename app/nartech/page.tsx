'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

// ─── Types ────────────────────────────────────────────────────────────────────

interface CameraTarget {
  position: { x: number; y: number; z: number }
  lookAt: { x: number; y: number; z: number }
}

interface SpecGroup {
  groupLabel: string
  items: string[]
}

interface Subsystem {
  id: string
  label: string
  category: string
  description: string
  specGroups: SpecGroup[]
  align: 'left' | 'right'
  camera: CameraTarget
  cameraVertical?: CameraTarget
  robotRotationX?: number
  robotRotation?: number
  robotRotationZ?: number
}

// ─── Subsystem Configuration ──────────────────────────────────────────────────

const SUBSYSTEMS: Subsystem[] = [
  {
    id: 'swerve',
    label: 'Drivetrain',
    category: 'Mobility',
    description: '',
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
    align: 'left',
    camera: {
      position: { x: 3, y: 0.8, z: 5 },
      lookAt: { x: 0, y: 0.2, z: 0 },
    },
    cameraVertical: {
      position: { x: 0.4, y: 4, z: 7 },
      lookAt: { x: 0.4, y: 1.5, z: 0 },
    },
    robotRotationZ: -Math.PI / 2,
  },
  {
    id: 'shooter',
    label: 'Shooter',
    category: 'Scoring',
    description: 'The Shooter accurately propels 3 balls into the hub at a time.',
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
    align: 'right',
    camera: {
      position: { x: -3, y: 2, z: 5 },
      lookAt: { x: 0, y: 1, z: 0 },
    },
    cameraVertical: {
      position: { x: 0.4, y: 10, z: 6 },
      lookAt: { x: 0.4, y: 5.5, z: 0 },
    },
    robotRotationZ: Math.PI / 2 - Math.PI / 6,
  },
  {
    id: 'hopper',
    label: 'Hopper',
    category: 'Storage',
    description: 'The Hopper is an expandable serializer and storage unit serving as a pathway between the Intake and the Shooter.',
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
    align: 'left',
    camera: {
      position: { x: 3, y: 1.5, z: 5 },
      lookAt: { x: 0, y: 0.5, z: 0 },
    },
    cameraVertical: {
      position: { x: 0.4, y: 10, z: 4 },
      lookAt: { x: 0.4, y: 6, z: 0 },
    },
    robotRotationZ: Math.PI / 2,
  },
  {
    id: 'intake',
    label: 'Intake',
    category: 'Game Piece Acquisition',
    description: 'The Intake is a touch-it-own-it rack and pinion design that dominates the field, stealing fuel from other alliances and forcing the fuel into the Hopper.',
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
    align: 'right',
    camera: {
      position: { x: 4, y: 4, z: 0 },
      lookAt: { x: -2, y: -2, z: -2 },
    },
    cameraVertical: {
      position: { x: 1.5, y: 4, z: 8 },
      lookAt: { x: 1.5, y: 2, z: 0 },
    },
    robotRotationZ: -3.7 * Math.PI / 3,
  },
  {
    id: 'climber',
    label: 'Climber',
    category: 'Endgame',
    description: 'The Climber functions on an elevator that serves as the backbone for the shooter, pulling the robot up as the elevator comes down.',
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
    align: 'left',
    camera: {
      position: { x: -4, y: 3, z: 5 },
      lookAt: { x: 0, y: 1.5, z: 0 },
    },
    cameraVertical: {
      position: { x: 1, y: 4, z: 6 },
      lookAt: { x: 1, y: 3, z: 0 },
    },
    robotRotationZ: -Math.PI / 2 + Math.PI / 6,
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const HERO_CAMERA_HORIZONTAL: CameraTarget = {
  position: { x: -6, y: 5, z: 18 },
  lookAt: { x: -0.4, y: 1.5, z: 0 },
}

const HERO_CAMERA_VERTICAL: CameraTarget = {
  position: { x: -10, y: 6, z: 12 },
  lookAt: { x: -1.3, y: 2, z: 0 },
}

// ─── Reusable button/link style ───────────────────────────────────────────────

const linkBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#33aaff',
  border: '1px solid rgba(0, 102, 204, 0.45)',
  background: 'rgba(0, 40, 80, 0.5)',
  textDecoration: 'none',
  transition: 'background 0.2s, border-color 0.2s',
}

const ArrowIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M1 5h8M5 1l4 4-4 4" stroke="#33aaff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const hoverOn  = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.background    = 'rgba(0, 60, 120, 0.7)'
  e.currentTarget.style.borderColor   = 'rgba(0, 153, 255, 0.7)'
}
const hoverOff = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.background    = 'rgba(0, 40, 80, 0.5)'
  e.currentTarget.style.borderColor   = 'rgba(0, 102, 204, 0.45)'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TechnicalBinder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadPct, setLoadPct] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isVertical, setIsVertical] = useState(false)

  const activeIdRef = useRef<string | null>(null)

  useEffect(() => {
    const checkOrientation = () => setIsVertical(window.innerHeight > window.innerWidth)
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  const setActive = useCallback((id: string | null) => {
    activeIdRef.current = id
    setActiveId(id)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    let rafId: number
    let disposed = false

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000d1a')
    scene.fog = new THREE.FogExp2(0x000d1a, 0.015)

    const sizes = { w: window.innerWidth, h: window.innerHeight }

    const camera = new THREE.PerspectiveCamera(42, sizes.w / sizes.h, 0.05, 200)
    const initialCamera = isVertical ? HERO_CAMERA_VERTICAL : HERO_CAMERA_HORIZONTAL
    camera.position.set(initialCamera.position.x, initialCamera.position.y, initialCamera.position.z)
    const lookAt = { ...initialCamera.lookAt }

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

    scene.add(new THREE.AmbientLight(0xddeeff, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(6, 10, 8)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 50
    key.shadow.camera.left = -8;  key.shadow.camera.right = 8
    key.shadow.camera.top = 8;    key.shadow.camera.bottom = -8
    key.shadow.bias = -0.001
    scene.add(key)
    const fill = new THREE.DirectionalLight(0x2255cc, 0.9)
    fill.position.set(-5, 4, 6)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffeedd, 0.6)
    rim.position.set(0, 3, -6)
    scene.add(rim)
    scene.add(new THREE.HemisphereLight(0x001f3f, 0x000000, 0.4))

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x000814, metalness: 0.1, roughness: 0.95 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.02
    ground.receiveShadow = true
    scene.add(ground)
    const grid = new THREE.GridHelper(40, 40, 0x002244, 0x001122)
    grid.position.y = -0.01
    scene.add(grid)

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    let robotRoot: THREE.Object3D | null = null

    gltfLoader.load(
      'models/3128robot2026.glb',
      (gltf) => {
        if (disposed) return
        robotRoot = gltf.scene
        const box = new THREE.Box3().setFromObject(robotRoot)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const scale = 5 / Math.max(size.x, size.y, size.z)
        robotRoot.scale.setScalar(scale)
        robotRoot.position.sub(center.multiplyScalar(scale))
        robotRoot.rotateX(-Math.PI / 2)
        const baseRotX = robotRoot.rotation.x
        const baseRotY = robotRoot.rotation.y
        const baseRotZ = robotRoot.rotation.z
        robotRoot.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true
            obj.receiveShadow = true
            if (!Array.isArray(obj.material)) obj.material = obj.material.clone()
          }
        })
        scene.add(robotRoot)
        setLoadState('ready')
        setupScrollAnimations(baseRotX, baseRotY, baseRotZ)
      },
      (xhr) => { if (xhr.total > 0) setLoadPct(Math.round((xhr.loaded / xhr.total) * 100)) },
      (err) => { console.error('GLB load error:', err); buildPlaceholder(); setLoadState('ready') }
    )

    function buildPlaceholder() {
      const group = new THREE.Group()
      const mat = (c: number) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.7, roughness: 0.3 })
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.25, 2.8), mat(0x003366))
      base.position.y = 0.125; base.castShadow = true; group.add(base)
      ;[[-1.1,1.1],[1.1,1.1],[-1.1,-1.1],[1.1,-1.1]].forEach(([x,z]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.18,24), mat(0x111111))
        w.rotation.z = Math.PI/2; w.position.set(x,0.28,z); group.add(w)
      })
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.3,2.8,0.3), mat(0x0055aa))
      col.position.set(-0.8,1.65,0); group.add(col)
      robotRoot = group
      group.traverse((o) => { if (o instanceof THREE.Mesh) o.material = (o.material as THREE.Material).clone() })
      scene.add(group)
      setupScrollAnimations(0, 0, 0)
    }

    function setupScrollAnimations(baseRotX: number, baseRotY: number, baseRotZ: number) {
      const heroCamera = isVertical ? HERO_CAMERA_VERTICAL : HERO_CAMERA_HORIZONTAL
      const scrubSpeed = isVertical ? 0.6 : 0.1

      function tweenCamera(
        toPosition: CameraTarget['position'],
        toLookAt: CameraTarget['lookAt'],
        toRotX: number, toRotY: number, toRotZ: number,
        trigger: string,
        scrub = scrubSpeed
      ) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: isVertical ? 'top 80%'  : 'top center',
            end:   isVertical ? 'top top'   : 'bottom center',
            scrub,
            ...(!isVertical && { snap: { snapTo: 0.5, duration: { min: 0.2, max: 0.4 }, ease: 'power2.inOut' } }),
          },
        })
        tl.to(camera.position, { ...toPosition, ease: 'power2.inOut' }, 0)
        tl.to(lookAt,          { ...toLookAt,   ease: 'power2.inOut' }, 0)
        if (robotRoot) {
          tl.to(robotRoot.rotation, {
            x: baseRotX + toRotX, y: baseRotY + toRotY, z: baseRotZ + toRotZ, ease: 'power2.inOut',
          }, 0)
        }
        return tl
      }

      gsap.timeline({
        scrollTrigger: {
          trigger: '#section-hero',
          start: 'top top', end: 'bottom top',
          scrub: scrubSpeed,
          ...(!isVertical && { snap: { snapTo: 0.5, duration: { min: 0.2, max: 0.4 }, ease: 'power2.inOut' } }),
        },
      })
        .to(camera.position, { ...heroCamera.position, ease: 'power2.inOut' }, 0)
        .to(lookAt,          { ...heroCamera.lookAt,   ease: 'power2.inOut' }, 0)

      if (isVertical) {
        const totalSections = SUBSYSTEMS.length + 2
        ScrollTrigger.create({
          trigger: 'body', start: 'top top', end: 'bottom bottom',
          snap: { snapTo: 1 / (totalSections - 1), duration: { min: 0.5, max: 0.9 }, delay: 0.25, ease: 'power2.inOut' },
        })
      }

      SUBSYSTEMS.forEach((sub) => {
        const targetCamera = isVertical && sub.cameraVertical ? sub.cameraVertical : sub.camera
        tweenCamera(
          targetCamera.position, targetCamera.lookAt,
          sub.robotRotationX ?? 0, sub.robotRotation ?? 0, sub.robotRotationZ ?? 0,
          `#section-${sub.id}`
        )
        ScrollTrigger.create({
          trigger: `#section-${sub.id}`,
          start: isVertical ? 'top top+=10' : 'top center',
          end:   isVertical ? 'bottom top'  : 'bottom center',
          onEnter:     () => setActive(sub.id),
          onEnterBack: () => setActive(sub.id),
          onLeave:     () => { if (activeIdRef.current === sub.id) setActive(null) },
          onLeaveBack: () => setActive(null),
        })
      })

      // Outro: pull camera straight up so the robot disappears below frame.
      // Grid + dark navy remain; only the robot is gone.
      tweenCamera(
        { x: 60, y: 60, z: 0 },
        { x: 60, y: 0, z: 0 },
        0, 0, 0,
        '#section-outro',
        1.4
      )
    }

    const onResize = () => {
      sizes.w = window.innerWidth; sizes.h = window.innerHeight
      camera.aspect = sizes.w / sizes.h
      camera.updateProjectionMatrix()
      renderer.setSize(sizes.w, sizes.h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    window.addEventListener('resize', onResize)

    const _lookAtVec = new THREE.Vector3()
    const tick = () => {
      _lookAtVec.set(lookAt.x, lookAt.y, lookAt.z)
      camera.lookAt(_lookAtVec)
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    tick()

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
  }, [setActive, isVertical])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative" style={{ background: '#000d1a' }}>

      {/* Loading Screen */}
      {loadState === 'loading' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: '#000d1a' }}>
          <div className="w-28 h-28 mb-8 rounded-full flex items-center justify-center text-6xl"
            style={{ background: 'white', boxShadow: '0 0 80px rgba(0,102,204,0.6)' }}>
            🦄
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] mb-3" style={{ color: '#0066cc' }}>
            Loading Robot CAD
          </p>
          <div className="w-64 h-[3px] rounded-full overflow-hidden" style={{ background: '#001f3f' }}>
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${loadPct}%`, background: 'linear-gradient(90deg, #003fa3, #0066cc, #33aaff)' }} />
          </div>
          <p className="text-xs mt-3" style={{ color: '#336699' }}>{loadPct}%</p>
        </div>
      )}

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-screen" style={{ zIndex: 0 }} />

      {/* Nav dots — landscape only */}
      {!isVertical && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3" style={{ zIndex: 20 }}>
          {SUBSYSTEMS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => document.getElementById(`section-${sub.id}`)?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 group"
              title={sub.label}
            >
              <span className="text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none"
                style={{ color: '#0066cc' }}>
                {sub.label}
              </span>
              <div className="rounded-full transition-all duration-300" style={{
                width:     activeId === sub.id ? '10px' : '6px',
                height:    activeId === sub.id ? '10px' : '6px',
                background: activeId === sub.id ? '#0066cc' : '#002244',
                boxShadow: activeId === sub.id ? '0 0 10px #0066cc' : 'none',
              }} />
            </button>
          ))}
        </div>
      )}

      {/* Scroll Content */}
      <div className="relative" style={{ zIndex: 10 }}>

        {/* ── Hero ── */}
        <section id="section-hero" className="min-h-screen flex flex-col items-center justify-between py-16 px-6">
          <div className="flex justify-center w-full pt-12">
            <Image
              src="/images/white-3128.png"
              alt="Team 3128"
              width={isVertical ? Math.min(window?.innerWidth * 0.8, 700) : 450}
              height={isVertical ? Math.min(window?.innerWidth * 0.4, 200) : 225}
              priority
              style={{ filter: 'drop-shadow(0 0 40px rgba(0,102,204,0.4))', maxWidth: '80vw', height: 'auto' }}
            />
          </div>

          <div className="flex-1" />

          <div className="flex flex-col items-center gap-4 pb-4">
            <p className="font-bold tracking-wide text-center"
              style={{ color: '#ffffff', fontSize: 'clamp(1.4rem, 4vw, 2.5rem)' }}>
              Technical Portfolio
            </p>
            <div className="flex flex-col items-center gap-2" style={{ opacity: 0.7 }}>
              <div className="w-[1px] h-10"
                style={{ background: 'linear-gradient(to bottom, transparent, #0066cc)', animation: 'pulse 2s ease-in-out infinite' }} />
              <span className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#ffffff' }}>
                Scroll for more
              </span>
            </div>
          </div>
        </section>

        {/* ── Subsystem Sections ── */}
        {SUBSYSTEMS.map((sub, i) => (
          <section
            key={sub.id}
            id={`section-${sub.id}`}
            className={`min-h-screen flex px-6 md:px-10 lg:px-20 ${
              isVertical
                ? 'items-start pt-16 justify-center'
                : `items-center ${sub.align === 'right' ? 'justify-end' : 'justify-start'}`
            }`}
          >
            <div
              className={`w-full rounded-2xl overflow-hidden transition-all duration-500 ${isVertical ? 'max-w-[95%]' : 'max-w-lg'}`}
              style={{
                background:   activeId === sub.id ? 'rgba(0, 20, 50, 0.92)'          : 'rgba(0, 10, 28, 0.75)',
                backdropFilter: 'blur(16px)',
                border:       activeId === sub.id ? '1px solid rgba(0,102,204,0.6)'  : '1px solid rgba(0,51,102,0.4)',
                boxShadow:    activeId === sub.id ? '0 0 60px rgba(0,102,204,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
              }}
            >
              {/* Accent bar */}
              <div style={{
                height: '3px',
                background: activeId === sub.id ? 'linear-gradient(90deg,#003fa3,#0066cc,#33aaff)' : 'rgba(0,51,102,0.5)',
                transition: 'background 0.5s',
              }} />

              <div className="p-6 md:p-8">
                {/* Category */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#0066cc' }}>
                    {String(i + 1).padStart(2, '0')} / {sub.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold mb-4" style={{
                  fontSize: isVertical ? '1.75rem' : 'clamp(2rem, 4vw, 2.8rem)',
                  lineHeight: 1.1,
                  color: activeId === sub.id ? '#ffffff' : '#aabbcc',
                  transition: 'color 0.4s',
                }}>
                  {sub.label}
                </h3>

                {/* Description */}
                {sub.description && (
                  <p className="mb-5 leading-relaxed"
                    style={{ color: '#8899bb', fontSize: isVertical ? '0.85rem' : '0.9rem' }}>
                    {sub.description}
                  </p>
                )}

                {/* Spec Groups */}
                <div className="flex flex-col gap-4">
                  {sub.specGroups.map((group) => (
                    <div key={group.groupLabel} className="rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(0,51,102,0.5)' }}>
                      <div className="px-3 py-2" style={{ background: 'rgba(0,40,80,0.6)' }}>
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: '#33aaff' }}>
                          {group.groupLabel}
                        </span>
                      </div>
                      {group.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 px-3 py-2" style={{
                          borderTop: '1px solid rgba(0,51,102,0.4)',
                          background: idx % 2 === 0 ? 'rgba(0,30,60,0.4)' : 'rgba(0,20,45,0.3)',
                        }}>
                          <span style={{ color: '#0066cc', marginTop: '2px', flexShrink: 0 }}>›</span>
                          <span className="text-[11px] font-mono leading-relaxed" style={{ color: '#ccddee' }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* ── Learn More ── */}
                <div className="mt-5 flex justify-end">
                  <Link
                    href={`nartech/subsystems/${sub.id}`}
                    style={linkBtnStyle}
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                  >
                    Learn More <ArrowIcon />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── Outro ── */}
        <section
          id="section-outro"
          className="min-h-screen flex flex-col items-center justify-center px-6 md:px-10 gap-6 py-20"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-2" style={{ color: '#ffffff' }}>
            Team 3128 · Aluminum Narwhals
          </div>
          {/* ── Controls & Software ── */}
          <div className="rounded-2xl overflow-hidden w-3/4" style={{
            background: 'rgba(0, 10, 28, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 51, 102, 0.5)',
          }}>
            <div style={{ height: '3px', background: 'linear-gradient(90deg,#003fa3,#0066cc,#33aaff)' }} />
            <div className="p-6 flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#0066cc' }}>
                  Software
                </span>
                <h3 className="font-bold mt-1" style={{ fontSize: '1.25rem', lineHeight: 1.1, color: '#ffffff' }}>
                  Controls
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: '#8899bb' }}>
                  Driver controls, autonomous routines, and software architecture.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="nartech/controls" style={{ ...linkBtnStyle, justifyContent: 'center' }}
                  onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  Control Systems <ArrowIcon />
                </Link>
                <Link href="nartech/controls" style={{ ...linkBtnStyle, justifyContent: 'center' }}
                  onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  Autonomous Functions <ArrowIcon />
                </Link>
                <Link href="nartech/controls" style={{ ...linkBtnStyle, justifyContent: 'center' }}
                  onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  Other <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>

          {/* ── View Our Process ── */}
          <Link
            href="/nartech/process"
            className="w-3/4 rounded-2xl overflow-hidden group"
            style={{
              background: 'rgba(0, 10, 28, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 51, 102, 0.5)',
              textDecoration: 'none',
              display: 'block',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,153,255,0.6)'
              e.currentTarget.style.boxShadow   = '0 0 40px rgba(0,102,204,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,51,102,0.5)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
          >
            <div style={{ height: '3px', background: 'linear-gradient(90deg,#003fa3,#0066cc,#33aaff)' }} />
            {/* Image area — replace src with your actual image path */}
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              background: 'rgba(0,20,50,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0,51,102,0.4)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <Image
                src="/images/process-preview.png"
                alt="Our Process"
                fill
                style={{ objectFit: 'cover', opacity: 0.85 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              {/* Fallback label shown when no image is set */}
              <span style={{
                position: 'absolute',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(51,170,255,0.5)',
              }}>
                
              </span>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#0066cc' }}>
                  Documentation
                </span>
                <h3 className="font-bold mt-1" style={{ fontSize: '1.25rem', lineHeight: 1.1, color: '#ffffff' }}>
                  View Our Process
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: '#8899bb' }}>
                  Priority Lists, Technical Requirements, Robot Dashboard
                </p>
              </div>
              <ArrowIcon />
            </div>
          </Link>

          {/* ── Learn About Our Team ── */}
          <Link
            href="/team"
            className="w-3/4 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0, 10, 28, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 51, 102, 0.5)',
              textDecoration: 'none',
              display: 'block',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,153,255,0.6)'
              e.currentTarget.style.boxShadow   = '0 0 40px rgba(0,102,204,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,51,102,0.5)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
          >
            <div style={{ height: '3px', background: 'linear-gradient(90deg,#003fa3,#0066cc,#33aaff)' }} />
            {/* Image area — replace src with your actual image path */}
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              background: 'rgba(0,20,50,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0,51,102,0.4)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* <Image
                src="/images/team-preview.png"
                alt="Our Team"
                fill
                style={{ objectFit: 'cover', opacity: 0.85 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              /> */}
              <span style={{
                position: 'absolute',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(51,170,255,0.5)',
              }}>
                UNDER CONSTRUCTION
              </span>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#0066cc' }}>
                  Outreach
                </span>
                <h3 className="font-bold mt-1" style={{ fontSize: '1.25rem', lineHeight: 1.1, color: '#ffffff' }}>
                  Learn About Our Team
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: '#8899bb' }}>
                  Community involvement, mentorship, and team culture.
                </p>
              </div>
              <ArrowIcon />
            </div>
          </Link>
        </section>

      </div>
    </div>
  )
}