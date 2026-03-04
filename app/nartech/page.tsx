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
 * Place team number image at:  /public/images/3128-logo.png
 *                              (transparent PNG works best)
 *
 * VERTICAL DISPLAY SUPPORT
 * ─────────────────────────────────────────────────────────────────────────────
 * Automatically detects portrait orientation and adjusts layout:
 * - Centers content instead of side-aligning
 * - Smaller font sizes for narrow screens
 * - Hides navigation dots
 * - Optimizes card sizing
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

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
  meshNames: string[]
  camera: CameraTarget
  /** Camera position for vertical/portrait displays */
  cameraVertical?: CameraTarget
  /** Robot rotation in radians around X axis (pitch forward/back). 0 = default */
  robotRotationX?: number
  /** Robot rotation in radians around Y axis. 0 = default, Math.PI = 180° flip */
  robotRotation?: number
  /** Robot rotation in radians around Z axis (tilt left/right). 0 = default */
  robotRotationZ?: number
}

// ─── Subsystem Configuration ──────────────────────────────────────────────────

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
    cameraVertical: {
      position: { x: 0, y: 2, z: 8 },
      lookAt: { x: 0, y: 0.5, z: 0 },
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
    camera: {
      position: { x: 2, y: 2, z: 2 },
      lookAt: { x: 0, y: 0, z: 0 },
    },
    cameraVertical: {
      position: { x: 2, y: 2, z: 2 },
      lookAt: { x: 0, y: 0, z: 0 },
    },
    // robotRotation: Math.PI, // Rotate 180° to show back side
    robotRotationZ: Math.PI + Math.PI/2,
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const HERO_CAMERA_HORIZONTAL: CameraTarget = {
  position: { x: -6, y: 5, z: 18 },
  lookAt: { x: -0.4, y: 1.5, z: 0 },
}

const HERO_CAMERA_VERTICAL: CameraTarget = {
  position: { x: 0, y: 6, z: 15 },
  lookAt: { x: 0, y: 2, z: 0 },
}

const DIM_OPACITY = 0.08
const HIGHLIGHT_COLOR = new THREE.Color(0x4499ff)

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function resetMaterials(allMeshes: THREE.Mesh[]) {
  allMeshes.forEach((mesh) => {
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (!mat) return
    gsap.to(mat, { opacity: 1, duration: 0.5 })
    mat.transparent = false
    mat.emissiveIntensity = 0
  })
}

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
  const [isVertical, setIsVertical] = useState(false)

  const activeIdRef = useRef<string | null>(null)

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsVertical(window.innerHeight > window.innerWidth)
    }
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
    scene.fog = new THREE.FogExp2(0x000d1a, 0.045)

    const sizes = {
      w: window.innerWidth,
      h: window.innerHeight,
    }

    const camera = new THREE.PerspectiveCamera(42, sizes.w / sizes.h, 0.05, 200)
    
    // Set initial camera based on orientation
    const initialCamera = isVertical ? HERO_CAMERA_VERTICAL : HERO_CAMERA_HORIZONTAL
    camera.position.set(
      initialCamera.position.x,
      initialCamera.position.y,
      initialCamera.position.z
    )

    const lookAt = {
      x: initialCamera.lookAt.x,
      y: initialCamera.lookAt.y,
      z: initialCamera.lookAt.z,
    }

    if (typeof window !== 'undefined') {
      ;(window as unknown as Record<string, unknown>).__cam = { position: camera.position, lookAt }
    }

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
    key.shadow.camera.near = 0.5
    key.shadow.camera.far = 50
    key.shadow.camera.left = -8
    key.shadow.camera.right = 8
    key.shadow.camera.top = 8
    key.shadow.camera.bottom = -8
    key.shadow.bias = -0.001
    scene.add(key)

    const fill = new THREE.DirectionalLight(0x2255cc, 0.9)
    fill.position.set(-5, 4, 6)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffeedd, 0.6)
    rim.position.set(0, 3, -6)
    scene.add(rim)

    const bounce = new THREE.HemisphereLight(0x001f3f, 0x000000, 0.4)
    scene.add(bounce)

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

    const dracoLoader = new DRACOLoader()
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

        const box = new THREE.Box3().setFromObject(robotRoot)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 5 / maxDim
        robotRoot.scale.setScalar(scale)
        robotRoot.position.sub(center.multiplyScalar(scale))
        robotRoot.position.y += 0
        robotRoot.rotateX(-Math.PI/2)
        robotRoot.rotateZ(-Math.PI/3)
        
        // Store the initial rotation as the base rotation
        const initialRotationX = robotRoot.rotation.x
        const initialRotationY = robotRoot.rotation.y
        const initialRotationZ = robotRoot.rotation.z

        robotRoot.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true
            obj.receiveShadow = true

            if (!Array.isArray(obj.material)) {
              obj.material = obj.material.clone()
            }

            allMeshes.push(obj)
          }
        })

        scene.add(robotRoot)
        setLoadState('ready')
        setupScrollAnimations(initialRotationX, initialRotationY, initialRotationZ)
      },
      (xhr) => {
        if (xhr.total > 0) setLoadPct(Math.round((xhr.loaded / xhr.total) * 100))
      },
      (err) => {
        console.error('GLB load error:', err)
        buildPlaceholder()
        setLoadState('ready')
      }
    )

    function buildPlaceholder() {
      const group = new THREE.Group()
      const mat = (color: number) =>
        new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 })

      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.25, 2.8), mat(0x003366))
      base.position.y = 0.125
      base.castShadow = true
      base.name = 'Chassis'
      group.add(base)

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

      const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.8, 0.3), mat(0x0055aa))
      col.position.set(-0.8, 1.65, 0)
      col.castShadow = true
      col.name = 'Elevator'
      group.add(col)

      const intake = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.3), mat(0x001f3f))
      intake.position.set(0, 0.55, 1.4)
      intake.name = 'Intake'
      group.add(intake)

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.25), mat(0x0077cc))
      arm.position.set(0.5, 3.2, 0)
      arm.name = 'Arm'
      group.add(arm)

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
      
      // Placeholder has no initial rotation
      const initialRotationX = 0
      const initialRotationY = 0
      const initialRotationZ = 0
      setupScrollAnimations(initialRotationX, initialRotationY, initialRotationZ)
    }

    function setupScrollAnimations(baseRotationX: number, baseRotationY: number, baseRotationZ: number) {
      const heroCamera = isVertical ? HERO_CAMERA_VERTICAL : HERO_CAMERA_HORIZONTAL
      
      function tweenCamera(
        toPosition: { x: number; y: number; z: number },
        toLookAt: { x: number; y: number; z: number },
        toRotationX: number,
        toRotationY: number,
        toRotationZ: number,
        trigger: string,
        scrub = 0.1
      ) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: 'top center',
            end: 'bottom center',
            scrub,
            snap: {
              snapTo: 0.5, // Snap to middle of section
              duration: { min: 0.2, max: 0.4 },
              ease: 'power2.inOut',
            },
          },
        })
        tl.to(camera.position, { ...toPosition, ease: 'power2.inOut' }, 0)
        tl.to(lookAt, { ...toLookAt, ease: 'power2.inOut' }, 0)
        
        // Animate robot rotation (X, Y, and Z axes) - add to base rotation
        if (robotRoot) {
          tl.to(
            robotRoot.rotation,
            {
              x: baseRotationX + toRotationX,
              y: baseRotationY + toRotationY,
              z: baseRotationZ + toRotationZ,
              ease: 'power2.inOut',
            },
            0
          )
        }
        
        return tl
      }

      gsap.timeline({
        scrollTrigger: {
          trigger: '#section-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.1,
          pin: false,
          snap: {
            snapTo: 0.5,
            duration: { min: 0.2, max: 0.4 },
            ease: 'power2.inOut',
          },
        },
      })
        .to(camera.position, { ...heroCamera.position, ease: 'power2.inOut' }, 0)
        .to(lookAt, { ...heroCamera.lookAt, ease: 'power2.inOut' }, 0)

      SUBSYSTEMS.forEach((sub) => {
        const targetRotationX = sub.robotRotationX ?? 0
        const targetRotationY = sub.robotRotation ?? 0
        const targetRotationZ = sub.robotRotationZ ?? 0
        // Use vertical camera if available and in vertical mode, otherwise use default
        const targetCamera = isVertical && sub.cameraVertical ? sub.cameraVertical : sub.camera
        
        tweenCamera(
          targetCamera.position,
          targetCamera.lookAt,
          targetRotationX,
          targetRotationY,
          targetRotationZ,
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
      })

      tweenCamera(
        { x: heroCamera.position.x, y: heroCamera.position.y + 1, z: heroCamera.position.z + 2 },
        heroCamera.lookAt,
        0, // No additional X rotation for outro
        0, // No additional Y rotation for outro
        0, // No additional Z rotation for outro
        '#section-outro',
        1.4
      )
    }

    const onResize = () => {
      sizes.w = window.innerWidth
      sizes.h = window.innerHeight
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
  }, [setActive])

  return (
    <div className="relative" style={{ background: '#000d1a' }}>
      {loadState === 'loading' && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: '#000d1a' }}
        >
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

      <canvas ref={canvasRef} className="fixed inset-0 w-full h-screen" style={{ zIndex: 0 }} />

      {!isVertical && (
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
      )}

      <div className="relative" style={{ zIndex: 10 }}>
        <section
          id="section-hero"
          className={`min-h-screen flex flex-col ${
            isVertical ? 'justify-start items-center text-center' : 'justify-center'
          } pb-20 px-6 mt-[350px] md:px-10 lg:px-20`}
        >
          <div className={isVertical ? 'justify-top' : ''}>
            <div className={`relative mb-6 ${isVertical ? 'flex mx-auto w-full' : ''}`}>
              <Image
                src="/images/white-3128.png"
                alt="Team 3128"
                width={isVertical ? 900 : 450}
                height={isVertical ? 450 : 225}
                priority
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(0,102,204,0.4))',
                }}
              />
            </div>

          </div>
          <div className={isVertical ? 'mt-[550px] justify-end' : ''}>
            {isVertical && (
              <p className={`font-bold tracking-wide`} style={{ color: '#ffffff', lineHeight: 1.65, fontSize: '3rem' }}>
                Technical Portfolio
              </p>
            )}
            {isVertical && (
              <p style={{ color: '#ffffff', lineHeight: 1.65, fontSize: '1.1rem' }}>
                Scroll to uncover our robot
              </p>
            )}
          </div>

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

        {SUBSYSTEMS.map((sub, i) => (
          <section
            key={sub.id}
            id={`section-${sub.id}`}
            className={`min-h-screen flex px-6 md:px-10 lg:px-20 ${
              isVertical 
                ? 'items-start pt-20 justify-center' 
                : `items-center ${sub.align === 'right' ? 'justify-end' : 'justify-start'}`
            }`}
          >
            <div
              className={`w-full rounded-2xl overflow-hidden transition-all duration-500 ${
                isVertical ? 'max-w-[95%]' : 'max-w-lg'
              }`}
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

              <div className={`p-6 ${isVertical ? 'md:p-8' : 'md:p-8'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: '#0066cc' }}
                  >
                    {String(i + 1).padStart(2, '0')} / {sub.category}
                  </span>
                </div>

                <h3
                  className="font-bold mb-4"
                  style={{
                    fontSize: isVertical ? '1.75rem' : 'clamp(2rem, 4vw, 2.8rem)',
                    lineHeight: 1.1,
                    color: activeId === sub.id ? '#ffffff' : '#aabbcc',
                    transition: 'color 0.4s',
                  }}
                >
                  {sub.label}
                </h3>

                <p
                  className="mb-6 leading-relaxed"
                  style={{
                    color: '#8899bb',
                    fontSize: isVertical ? '0.85rem' : '0.9rem',
                  }}
                >
                  {sub.description}
                </p>

                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(0,51,102,0.5)' }}
                >
                  {sub.specs.map(({ label, value }, idx) => (
                    <div
                      key={label}
                      className="flex justify-between items-center px-3 py-2"
                      style={{
                        borderBottom:
                          idx < sub.specs.length - 1
                            ? '1px solid rgba(0,51,102,0.4)'
                            : 'none',
                        background: idx % 2 === 0 ? 'rgba(0,30,60,0.4)' : 'rgba(0,20,45,0.3)',
                      }}
                    >
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: '#0066cc' }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[10px] font-mono"
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