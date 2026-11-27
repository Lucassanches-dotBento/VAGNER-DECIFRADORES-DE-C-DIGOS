import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCryptographicChamber, ChamberRig, InteractiveTarget } from '../three/chamberBuilder';
import { createChamberMaterials } from '../three/materials';
import { RiddlePlaqueContent } from '../three/textures';
import { CameraPreset } from '../types/game';

interface VaultScene3DProps {
  digits: [number, number, number, number];
  caesarShift: number;
  solvedIds: string[];
  isMusicPlaying: boolean;
  cameraPreset: CameraPreset;
  plaqueContent: RiddlePlaqueContent;
  lockFeedback: 'IDLE' | 'SUCCESS' | 'ERROR';
  leverPulseKey: number;
  onDialStep: (slotIndex: number, delta: 1 | -1) => void;
  onSubmitCode: () => void;
  onClearCode: () => void;
  onCaesarStep: (delta: 1 | -1) => void;
  onToggleMusic: () => void;
  onSelectVault: (vaultId: string) => void;
  onCameraPresetChange: (preset: CameraPreset) => void;
}

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  DESK: { pos: [0, 2.38, 2.72], target: [0, 1.38, -0.1] },
  RIDDLE: { pos: [0, 1.88, 1.48], target: [0, 1.66, -0.34] },
  CAESAR: { pos: [1.85, 2.02, 1.55], target: [1.46, 1.58, 0.04] },
  VAULTS: { pos: [0, 2.45, 0.85], target: [0, 1.85, -5.0] },
  OVERVIEW: { pos: [4.2, 3.85, 4.9], target: [0, 1.45, -1.6] },
};

// Reusable math objects outside animation loop (zero GC)
const _pointer = new THREE.Vector2();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function VaultScene3D({
  digits,
  caesarShift,
  solvedIds,
  isMusicPlaying,
  cameraPreset,
  plaqueContent,
  lockFeedback,
  leverPulseKey,
  onDialStep,
  onSubmitCode,
  onClearCode,
  onCaesarStep,
  onToggleMusic,
  onSelectVault,
  onCameraPresetChange,
}: VaultScene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // Latest state & callbacks synced to refs so WebGL context mounts once and never resets
  const stateRef = useRef({
    digits,
    caesarShift,
    solvedIds,
    isMusicPlaying,
    cameraPreset,
    plaqueContent,
    lockFeedback,
    leverPulseKey,
  });
  stateRef.current = {
    digits,
    caesarShift,
    solvedIds,
    isMusicPlaying,
    cameraPreset,
    plaqueContent,
    lockFeedback,
    leverPulseKey,
  };

  const callbacksRef = useRef({
    onDialStep,
    onSubmitCode,
    onClearCode,
    onCaesarStep,
    onToggleMusic,
    onSelectVault,
    onCameraPresetChange,
  });
  callbacksRef.current = {
    onDialStep,
    onSubmitCode,
    onClearCode,
    onCaesarStep,
    onToggleMusic,
    onSelectVault,
    onCameraPresetChange,
  };

  const rigRef = useRef<ChamberRig | null>(null);
  const anisotropyRef = useRef<number>(1);
  const cameraTransitionActiveRef = useRef(true);
  const leverPullTimerRef = useRef(0);

  // Trigger camera transition when preset prop changes
  useEffect(() => {
    cameraTransitionActiveRef.current = true;
  }, [cameraPreset]);

  // Trigger lever mechanical pull when leverPulseKey increments
  useEffect(() => {
    if (leverPulseKey > 0) {
      leverPullTimerRef.current = 0.38;
    }
  }, [leverPulseKey]);

  // Update 3D riddle slate texture when active puzzle changes
  useEffect(() => {
    rigRef.current?.updateRiddlePlaque(plaqueContent);
  }, [plaqueContent]);

  // Update vault open/locked visuals when solvedIds change
  useEffect(() => {
    rigRef.current?.updateVaultVisuals(solvedIds, anisotropyRef.current);
  }, [solvedIds]);

  // Update lock crystal feedback color
  useEffect(() => {
    rigRef.current?.setLockFeedback(lockFeedback);
  }, [lockFeedback]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    const canvasEl = renderer.domElement;
    canvasEl.style.display = 'block';
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    container.appendChild(canvasEl);

    const maxAniso = isSoftwareGl ? 1 : Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    anisotropyRef.current = maxAniso;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1320);
    scene.fog = new THREE.FogExp2(0x0b1320, 0.042);

    // Studio procedural environment reflection (mandatory on every device)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 60);
    const initialPreset = CAMERA_PRESETS[stateRef.current.cameraPreset];
    camera.position.set(...initialPreset.pos);

    const controls = new OrbitControls(camera, canvasEl);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.35;
    controls.maxDistance = 11.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = 0.2;
    controls.target.set(...initialPreset.target);
    controls.update();

    const handleControlsStart = () => {
      cameraTransitionActiveRef.current = false;
    };
    controls.addEventListener('start', handleControlsStart);

    // 3-Point Warm/Cool Studio + Chamber Lighting (<= 3 shadow casters)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe4b5, 1.85);
    keyLight.position.set(4.5, 7.5, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(-5.5, 5.0, -4.5);
    scene.add(rimLight);

    // Build Materials & Chamber Geometry
    const materials = createChamberMaterials(maxAniso);
    const chamberRig = buildCryptographicChamber(
      materials,
      maxAniso,
      stateRef.current.plaqueContent
    );
    chamberRig.updateVaultVisuals(stateRef.current.solvedIds, maxAniso);
    chamberRig.setLockFeedback(stateRef.current.lockFeedback);
    scene.add(chamberRig.root);
    rigRef.current = chamberRig;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster restricted to layer 1 interactables
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    const findTarget = (hitObj: THREE.Object3D): InteractiveTarget | null => {
      let cur: THREE.Object3D | null = hitObj;
      while (cur) {
        const match = chamberRig.interactables.find((it) => it.mesh === cur);
        if (match) return match;
        cur = cur.parent;
      }
      return null;
    };

    let downX = 0;
    let downY = 0;
    let lastHoverCheck = 0;

    const updatePointerFromEvent = (e: PointerEvent) => {
      const rect = canvasEl.getBoundingClientRect();
      _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;

      updatePointerFromEvent(e);
      raycaster.setFromCamera(_pointer, camera);
      const hits = raycaster.intersectObjects(
        chamberRig.interactables.map((i) => i.mesh),
        true
      );
      if (hits.length > 0) {
        const target = findTarget(hits[0].object);
        if (target) {
          canvasEl.style.cursor = 'pointer';
          setHoverLabel(target.label);
          return;
        }
      }
      canvasEl.style.cursor = 'grab';
      setHoverLabel(null);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) return; // Was an orbit drag, not a click

      updatePointerFromEvent(e);
      raycaster.setFromCamera(_pointer, camera);
      const hits = raycaster.intersectObjects(
        chamberRig.interactables.map((i) => i.mesh),
        true
      );
      if (hits.length === 0) return;
      const target = findTarget(hits[0].object);
      if (!target) return;

      const act = target.action;
      switch (act.type) {
        case 'DIAL_STEP':
          callbacksRef.current.onDialStep(act.slotIndex, act.delta);
          break;
        case 'SUBMIT_CODE':
          callbacksRef.current.onSubmitCode();
          break;
        case 'CLEAR_CODE':
          callbacksRef.current.onClearCode();
          break;
        case 'FOCUS_RIDDLE':
          callbacksRef.current.onCameraPresetChange('RIDDLE');
          break;
        case 'CAESAR_STEP':
          callbacksRef.current.onCaesarStep(act.delta);
          callbacksRef.current.onCameraPresetChange('CAESAR');
          break;
        case 'FOCUS_CAESAR':
          callbacksRef.current.onCameraPresetChange('CAESAR');
          break;
        case 'TOGGLE_MPB':
          callbacksRef.current.onToggleMusic();
          break;
        case 'SELECT_VAULT':
          callbacksRef.current.onCameraPresetChange('VAULTS');
          callbacksRef.current.onSelectVault(act.vaultId);
          break;
      }
    };

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    let contextLost = false;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      setWebglUnavailable(true);
    };
    const handleContextRestored = () => {
      contextLost = false;
      setWebglUnavailable(false);
    };

    canvasEl.addEventListener('pointerdown', handlePointerDown);
    canvasEl.addEventListener('pointermove', handlePointerMove);
    canvasEl.addEventListener('pointerup', handlePointerUp);
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);
    window.addEventListener('resize', handleResize);

    // Animation loop with Software WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed || contextLost) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const st = stateRef.current;

      // 1. Smoothly damp 4 Brass Dial Wheels to selected digits
      for (let i = 0; i < 4; i++) {
        const wheel = chamberRig.dialWheels[i];
        const targetAngle = -(st.digits[i] + 0.5) * ((Math.PI * 2) / 10);
        wheel.rotation.y = THREE.MathUtils.damp(wheel.rotation.y, targetAngle, 12, delta);
      }

      // 2. Smoothly damp 3D Caesar inner brass disc
      const targetCaesarAngle = -st.caesarShift * ((Math.PI * 2) / 26);
      chamberRig.caesarInnerDisc.rotation.z = THREE.MathUtils.damp(
        chamberRig.caesarInnerDisc.rotation.z,
        targetCaesarAngle,
        10,
        delta
      );

      // 3. Submit lever mechanical pull & spring return
      if (leverPullTimerRef.current > 0) {
        leverPullTimerRef.current = Math.max(0, leverPullTimerRef.current - delta);
      }
      const targetLeverRot = leverPullTimerRef.current > 0.14 ? 0.65 : 0;
      chamberRig.submitLeverPivot.rotation.x = THREE.MathUtils.damp(
        chamberRig.submitLeverPivot.rotation.x,
        targetLeverRot,
        14,
        delta
      );

      // 4. Vault doors & handwheels smoothly swing open when solved
      chamberRig.vaults.forEach((v) => {
        const unlocked = st.solvedIds.includes(v.id);
        const targetDoorAngle = unlocked ? -1.32 : 0;
        const targetWheelAngle = unlocked ? Math.PI * 2.2 : 0;
        v.doorPivot.rotation.y = THREE.MathUtils.damp(
          v.doorPivot.rotation.y,
          targetDoorAngle,
          4.5,
          delta
        );
        v.handwheel.rotation.z = THREE.MathUtils.damp(
          v.handwheel.rotation.z,
          targetWheelAngle,
          5.0,
          delta
        );
      });

      // 5. MPB Vitrola vinyl spin & tonearm articulation
      if (st.isMusicPlaying) {
        chamberRig.vinylPlatter.rotation.y -= delta * 1.45;
      }
      const targetTonearm = st.isMusicPlaying ? 0.42 : 0;
      chamberRig.tonearmPivot.rotation.y = THREE.MathUtils.damp(
        chamberRig.tonearmPivot.rotation.y,
        targetTonearm,
        6.5,
        delta
      );

      // 6. Gentle floating dust drift
      chamberRig.dustPoints.rotation.y += delta * 0.015;

      // 7. Camera preset exponential damping (stops on arrival or user Orbit start)
      if (cameraTransitionActiveRef.current) {
        const preset = CAMERA_PRESETS[st.cameraPreset];
        _targetCamPos.set(...preset.pos);
        _targetLookAt.set(...preset.target);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 5.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 5.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 5.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, 6.0, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, 6.0, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, 6.0, delta);

        if (
          camera.position.distanceToSquared(_targetCamPos) < 0.0004 &&
          controls.target.distanceToSquared(_targetLookAt) < 0.0004
        ) {
          cameraTransitionActiveRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      controls.removeEventListener('start', handleControlsStart);
      controls.dispose();

      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      canvasEl.removeEventListener('pointermove', handlePointerMove);
      canvasEl.removeEventListener('pointerup', handlePointerUp);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
      window.removeEventListener('resize', handleResize);

      chamberRig.dispose();
      materials.dispose();
      envTexture.dispose();
      renderer.dispose();

      if (canvasEl.parentNode === container) {
        container.removeChild(canvasEl);
      }
      rigRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 select-none overflow-hidden bg-[#0B1320]">
      {/* Isolated WebGL mount container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Graceful WebGL Fallback */}
      {webglUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#0B1320] text-center">
          <div className="max-w-md bg-[#121D31] border border-slate-700 rounded-xl p-6 flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold text-amber-300">
              Visualização 3D Indisponível
            </h2>
            <p className="text-sm text-slate-300">
              O contexto WebGL foi suspenso pelo navegador. Você pode continuar decifrando todos os enigmas usando o painel abaixo.
            </p>
          </div>
        </div>
      )}

      {/* Subtle 3D Hover Tooltip (never uses backdrop-blur over WebGL) */}
      {hoverLabel && !webglUnavailable && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 rounded-lg bg-[#0B1320]/95 border border-amber-500/50 text-xs font-medium text-amber-200 whitespace-nowrap shadow-lg"
        >
          {hoverLabel}
        </div>
      )}
    </div>
  );
}
