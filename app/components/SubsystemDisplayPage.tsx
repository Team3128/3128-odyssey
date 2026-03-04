'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface TechnicalItem {
  label: string;
  value: string;
  image?: string;
}

interface ControlItem {
  name: string;
  description: string;
  image?: string;
}

interface SubsystemDisplayPageProps {
  subsystemName: string;
  modelPath?: string; // Path to .gltf, .glb, .obj, or .stl file
  modelConfig?: {
    color?: string;
    rotationSpeed?: number;
    scale?: number;
    position?: { x: number; y: number; z: number };
  };
  technicalSpecs: TechnicalItem[];
  controls: ControlItem[];
}

export default function SubsystemDisplayPage({
  subsystemName,
  modelPath,
  modelConfig = {},
  technicalSpecs,
  controls,
}: SubsystemDisplayPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [modelLoading, setModelLoading] = useState(!!modelPath);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerHeight > window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050810);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // Function to create fallback model
    const createFallbackModel = () => {
      const mainColor = new THREE.Color(modelConfig.color || 0x2563eb);
      const accentColor = new THREE.Color(0x60a5fa);
      
      // Base
      const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.3, 32);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: mainColor,
        metalness: 0.7,
        roughness: 0.3
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = -2;
      base.castShadow = true;

      // Lower arm
      const lowerArmGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
      const lowerArmMaterial = new THREE.MeshStandardMaterial({ 
        color: mainColor,
        metalness: 0.7,
        roughness: 0.3
      });
      const lowerArm = new THREE.Mesh(lowerArmGeometry, lowerArmMaterial);
      lowerArm.position.y = -1;
      lowerArm.castShadow = true;

      // Joint
      const jointGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const jointMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.8,
        roughness: 0.2
      });
      const joint = new THREE.Mesh(jointGeometry, jointMaterial);
      joint.position.y = -0.2;
      joint.castShadow = true;

      // Upper arm
      const upperArmGeometry = new THREE.BoxGeometry(0.35, 1.2, 0.35);
      const upperArmMaterial = new THREE.MeshStandardMaterial({ 
        color: mainColor,
        metalness: 0.7,
        roughness: 0.3
      });
      const upperArm = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
      upperArm.position.y = 0.5;
      upperArm.castShadow = true;

      // End effector
      const effectorGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
      const effectorMaterial = new THREE.MeshStandardMaterial({ 
        color: accentColor,
        metalness: 0.8,
        roughness: 0.2
      });
      const effector = new THREE.Mesh(effectorGeometry, effectorMaterial);
      effector.position.y = 1.3;
      effector.castShadow = true;

      robotGroup.add(base, lowerArm, joint, upperArm, effector);
    };

    // Load custom model or use fallback
    if (modelPath) {
      const extension = modelPath.split('.').pop()?.toLowerCase();
      
      const applyModelConfig = (loadedModel: THREE.Object3D) => {
        if (modelConfig.scale) {
          loadedModel.scale.setScalar(modelConfig.scale);
        }
        if (modelConfig.position) {
          loadedModel.position.set(
            modelConfig.position.x,
            modelConfig.position.y,
            modelConfig.position.z
          );
        }
        if (modelConfig.color) {
          const color = new THREE.Color(modelConfig.color);
          loadedModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(mat => {
                    if (mat instanceof THREE.MeshStandardMaterial || 
                        mat instanceof THREE.MeshPhongMaterial) {
                      mat.color = color;
                    }
                  });
                } else if (mesh.material instanceof THREE.MeshStandardMaterial || 
                           mesh.material instanceof THREE.MeshPhongMaterial) {
                  mesh.material.color = color;
                }
              }
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
        }
        robotGroup.add(loadedModel);
        setModelLoading(false);
      };

      const handleLoadError = (error: any) => {
        console.error('Error loading model:', error);
        setModelError('Failed to load model. Using fallback.');
        setModelLoading(false);
        createFallbackModel();
      };

      if (extension === 'gltf' || extension === 'glb') {
        const loader = new GLTFLoader();
        loader.load(
          modelPath,
          (gltf) => {
            applyModelConfig(gltf.scene);
          },
          undefined,
          handleLoadError
        );
      } else if (extension === 'obj') {
        const loader = new OBJLoader();
        loader.load(
          modelPath,
          (obj) => {
            applyModelConfig(obj);
          },
          undefined,
          handleLoadError
        );
      } else if (extension === 'stl') {
        const loader = new STLLoader();
        loader.load(
          modelPath,
          (geometry) => {
            const material = new THREE.MeshStandardMaterial({
              color: modelConfig.color || 0x2563eb,
              metalness: 0.7,
              roughness: 0.3
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            applyModelConfig(mesh);
          },
          undefined,
          handleLoadError
        );
      } else {
        setModelError('Unsupported file format. Using fallback.');
        setModelLoading(false);
        createFallbackModel();
      }
    } else {
      createFallbackModel();
    }

    // Enhanced lighting for modern look
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.6);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    rimLight.position.set(0, -5, -8);
    scene.add(rimLight);

    // Add subtle point lights for extra depth
    const pointLight1 = new THREE.PointLight(0x2563eb, 0.5, 20);
    pointLight1.position.set(3, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x60a5fa, 0.3, 15);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Modern grid with glow effect
    const gridSize = 20;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(
      gridSize, 
      gridDivisions, 
      0x1e40af, 
      0x0f172a
    );
    gridHelper.position.y = -2.2;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add circular platform glow
    const platformGeometry = new THREE.CircleGeometry(2, 64);
    const platformMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e40af,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = -2.15;
    scene.add(platform);

    // Animation
    let animationFrameId: number;
    const rotationSpeed = modelConfig.rotationSpeed || 0.005;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      robotGroup.rotation.y += rotationSpeed;
      
      // Subtle arm movement
      const time = Date.now() * 0.001;
      // upperArm.rotation.z = Math.sin(time * 0.5) * 0.2;
      // joint.rotation.z = Math.sin(time * 0.3) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    // Mouse interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      robotGroup.rotation.y += deltaX * 0.01;
      robotGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [modelPath, modelConfig]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              {subsystemName}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`grid gap-6 ${
            isVertical ? 'grid-cols-1' : 'lg:grid-cols-2'
          }`}
        >
          {/* 3D Model Section */}
          <div className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-6 bg-gradient-to-br from-slate-900/80 to-transparent border-b border-blue-500/10">
              <h2 className="text-xl font-semibold text-white mb-1">3D Model</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-blue-300">
                  {modelLoading ? 'Loading model...' : 'Drag to rotate'}
                </p>
              </div>
              {modelError && (
                <p className="text-xs text-amber-400 mt-1">{modelError}</p>
              )}
            </div>
            <div className="relative" style={{ height: isVertical ? '400px' : '600px' }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: 'block' }}
              />
              {/* Subtle corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-blue-500/30 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-blue-500/30 rounded-br-2xl"></div>
            </div>
          </div>

          {/* Info Sections */}
          <div className="space-y-6">
            {/* Technical Specifications */}
            <div className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-blue-500/20 overflow-hidden shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative p-6 bg-gradient-to-br from-slate-900/80 to-transparent border-b border-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">
                    Technical Specifications
                  </h2>
                </div>
              </div>
              <div className="relative p-6 space-y-3">
                {technicalSpecs.map((spec, index) => (
                  <div
                    key={index}
                    className="group/item relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    
                    {spec.image && (
                      <div className="relative mb-3 overflow-hidden rounded-lg">
                        <img
                          src={spec.image}
                          alt={spec.label}
                          className="w-full h-32 object-cover transition-transform duration-300 group-hover/item:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      </div>
                    )}
                    <div className="relative flex justify-between items-start gap-4">
                      <span className="text-blue-300 font-medium text-sm">
                        {spec.label}
                      </span>
                      <span className="text-white text-right font-semibold">
                        {spec.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls Information */}
            <div className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-blue-500/20 overflow-hidden shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative p-6 bg-gradient-to-br from-slate-900/80 to-transparent border-b border-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">
                    Controls Information
                  </h2>
                </div>
              </div>
              <div className="relative p-6 space-y-3">
                {controls.map((control, index) => (
                  <div
                    key={index}
                    className="group/item relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    
                    {control.image && (
                      <div className="relative mb-3 overflow-hidden rounded-lg">
                        <img
                          src={control.image}
                          alt={control.name}
                          className="w-full h-32 object-cover transition-transform duration-300 group-hover/item:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      </div>
                    )}
                    <div className="relative">
                      <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        {control.name}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {control.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}