import * as THREE from 'three';
import { ChamberMaterials } from './materials';
import {
  createCaesarRingTexture,
  createContactShadowTexture,
  createDialDigitStripTexture,
  createRiddleSlateTexture,
  createVaultEmblemTexture,
  createVinylLabelTexture,
  RiddlePlaqueContent,
  updateRiddleSlateCanvas,
} from './textures';

export interface InteractiveTarget {
  mesh: THREE.Object3D;
  action:
    | { type: 'DIAL_STEP'; slotIndex: number; delta: 1 | -1 }
    | { type: 'SUBMIT_CODE' }
    | { type: 'CLEAR_CODE' }
    | { type: 'FOCUS_RIDDLE' }
    | { type: 'CAESAR_STEP'; delta: 1 | -1 }
    | { type: 'FOCUS_CAESAR' }
    | { type: 'TOGGLE_MPB' }
    | { type: 'SELECT_VAULT'; vaultId: string };
  label: string;
}

export interface VaultAssembly {
  id: string;
  code: string;
  name: string;
  doorPivot: THREE.Group;
  handwheel: THREE.Group;
  statusBulb: THREE.Mesh;
  emblemMesh: THREE.Mesh;
  emblemMaterial: THREE.MeshStandardMaterial;
  currentUnlocked: boolean;
}

export interface ChamberRig {
  root: THREE.Group;
  dialWheels: THREE.Mesh[];
  caesarInnerDisc: THREE.Mesh;
  submitLeverPivot: THREE.Group;
  lockStatusCrystal: THREE.Mesh;
  vinylPlatter: THREE.Group;
  tonearmPivot: THREE.Group;
  dustPoints: THREE.Points;
  vaults: VaultAssembly[];
  interactables: InteractiveTarget[];
  updateRiddlePlaque: (content: RiddlePlaqueContent) => void;
  updateVaultVisuals: (solvedIds: string[], anisotropy: number) => void;
  setLockFeedback: (state: 'IDLE' | 'SUCCESS' | 'ERROR') => void;
  dispose: () => void;
}

function registerInteractable(
  list: InteractiveTarget[],
  obj: THREE.Object3D,
  action: InteractiveTarget['action'],
  label: string
) {
  obj.layers.enable(1);
  obj.traverse((child) => {
    child.layers.enable(1);
  });
  list.push({ mesh: obj, action, label });
}

export function buildCryptographicChamber(
  mats: ChamberMaterials,
  anisotropy: number,
  initialPlaque: RiddlePlaqueContent
): ChamberRig {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const interactables: InteractiveTarget[] = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // Contact shadow helper
  const shadowTex = track(createContactShadowTexture());
  const shadowMat = track(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );

  // ============================================================================
  // 1. CHAMBER ARCHITECTURE (Floor, Back Vault Wall, Fluted Pillars, Dust)
  // ============================================================================
  const floorGeo = track(new THREE.PlaneGeometry(36, 36));
  const floor = new THREE.Mesh(floorGeo, mats.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  root.add(floor);

  const backWallGeo = track(new THREE.BoxGeometry(26, 9, 0.8));
  const backWall = new THREE.Mesh(backWallGeo, mats.wallStone);
  backWall.position.set(0, 4.5, -5.8);
  backWall.receiveShadow = true;
  root.add(backWall);

  // Brass wall trim molding
  const wallTrimGeo = track(new THREE.BoxGeometry(24, 0.14, 0.14));
  const lowerTrim = new THREE.Mesh(wallTrimGeo, mats.agedBronze);
  lowerTrim.position.set(0, 0.2, -5.36);
  root.add(lowerTrim);

  const upperTrim = new THREE.Mesh(wallTrimGeo, mats.agedBronze);
  upperTrim.position.set(0, 5.4, -5.36);
  root.add(upperTrim);

  // Fluted architectural columns framing the chamber
  const pillarBaseGeo = track(new THREE.BoxGeometry(0.9, 0.35, 0.9));
  const pillarShaftGeo = track(new THREE.CylinderGeometry(0.32, 0.36, 6.2, 16));
  const pillarCapGeo = track(new THREE.BoxGeometry(0.86, 0.28, 0.86));
  [-6.8, -1.9, 1.9, 6.8].forEach((px) => {
    const col = new THREE.Group();
    col.position.set(px, 0, -5.1);

    const pBase = new THREE.Mesh(pillarBaseGeo, mats.pillarStone);
    pBase.position.y = 0.175;
    pBase.receiveShadow = true;
    col.add(pBase);

    const pShaft = new THREE.Mesh(pillarShaftGeo, mats.pillarStone);
    pShaft.position.y = 3.45;
    pShaft.castShadow = true;
    pShaft.receiveShadow = true;
    col.add(pShaft);

    const pCap = new THREE.Mesh(pillarCapGeo, mats.agedBronze);
    pCap.position.y = 6.65;
    col.add(pCap);

    root.add(col);
  });

  // Subtle floating dust particles (low-cost ambient depth)
  const dustCount = 120;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 14;
    dustPositions[i * 3 + 1] = 0.6 + Math.random() * 5.2;
    dustPositions[i * 3 + 2] = -4.5 + Math.random() * 8;
  }
  const dustGeo = track(new THREE.BufferGeometry());
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = track(
    new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    })
  );
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  root.add(dustPoints);

  // ============================================================================
  // 2. THREE ARMORED SECRET VAULTS ON BACK WALL (S1, S2, S3)
  // ============================================================================
  const vaultSpecs = [
    { id: 'sec-01', code: 'S1', name: 'COFRE ALFA', x: -4.2 },
    { id: 'sec-02', code: 'S2', name: 'COFRE BETA', x: 0 },
    { id: 'sec-03', code: 'S3', name: 'COFRE ÔMEGA', x: 4.2 },
  ];

  const vaults: VaultAssembly[] = [];
  const vaultFrameOuterGeo = track(new THREE.BoxGeometry(2.55, 3.1, 0.38));
  const vaultCavityGeo = track(new THREE.BoxGeometry(1.9, 2.35, 0.35));
  const vaultDoorDiscGeo = track(new THREE.CylinderGeometry(1.02, 1.02, 0.2, 36));
  const vaultDoorRimGeo = track(new THREE.TorusGeometry(0.98, 0.08, 12, 36));
  const handwheelRimGeo = track(new THREE.TorusGeometry(0.36, 0.04, 10, 24));
  const handwheelSpokeGeo = track(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8));
  const handwheelHubGeo = track(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16));
  const boltGeo = track(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 10));
  const bulbGeo = track(new THREE.SphereGeometry(0.09, 16, 12));
  const emblemPlaneGeo = track(new THREE.PlaneGeometry(1.48, 0.46));
  const ingotGeo = track(new THREE.BoxGeometry(0.38, 0.14, 0.22));
  const pedestalGeo = track(new THREE.BoxGeometry(2.7, 0.28, 0.7));

  vaultSpecs.forEach((spec) => {
    const vGroup = new THREE.Group();
    vGroup.position.set(spec.x, 0, -5.22);

    // Base plinth grounded at y=0
    const plinth = new THREE.Mesh(pedestalGeo, mats.pillarStone);
    plinth.position.set(0, 0.14, 0.1);
    plinth.receiveShadow = true;
    vGroup.add(plinth);

    // Outer armored frame
    const frame = new THREE.Mesh(vaultFrameOuterGeo, mats.forgedSteel);
    frame.position.set(0, 1.83, 0);
    frame.castShadow = true;
    frame.receiveShadow = true;
    vGroup.add(frame);

    // Recessed inner cavity + gold archive ingots (visible when door swings open)
    const cavity = new THREE.Mesh(vaultCavityGeo, mats.darkChassis);
    cavity.position.set(0, 1.83, -0.05);
    vGroup.add(cavity);

    for (let row = 0; row < 2; row++) {
      for (let col = -1; col <= 1; col++) {
        const ingot = new THREE.Mesh(ingotGeo, mats.goldIngot);
        ingot.position.set(col * 0.46, 1.35 + row * 0.22, -0.06);
        vGroup.add(ingot);
      }
    }

    // Hinge pivot on left edge of vault opening
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-1.02, 1.83, 0.2);

    const doorDisc = new THREE.Mesh(vaultDoorDiscGeo, mats.forgedSteel);
    doorDisc.rotation.x = Math.PI / 2;
    doorDisc.position.set(1.02, 0, 0);
    doorDisc.castShadow = true;
    doorPivot.add(doorDisc);

    const doorRim = new THREE.Mesh(vaultDoorRimGeo, mats.brushedBrass);
    doorRim.position.set(1.02, 0, 0.08);
    doorPivot.add(doorRim);

    // Radial locking bolts
    for (let b = 0; b < 6; b++) {
      const ang = (b * Math.PI * 2) / 6;
      const bolt = new THREE.Mesh(boltGeo, mats.agedBronze);
      bolt.position.set(1.02 + Math.cos(ang) * 0.84, Math.sin(ang) * 0.84, 0.07);
      bolt.rotation.z = ang + Math.PI / 2;
      doorPivot.add(bolt);
    }

    // 5-spoke brass handwheel
    const handwheel = new THREE.Group();
    handwheel.position.set(1.02, 0, 0.18);
    const hwRim = new THREE.Mesh(handwheelRimGeo, mats.brushedBrass);
    handwheel.add(hwRim);
    const hwHub = new THREE.Mesh(handwheelHubGeo, mats.brushedBrass);
    hwHub.rotation.x = Math.PI / 2;
    handwheel.add(hwHub);
    for (let s = 0; s < 3; s++) {
      const spoke = new THREE.Mesh(handwheelSpokeGeo, mats.brushedBrass);
      spoke.rotation.z = (s * Math.PI) / 3;
      handwheel.add(spoke);
    }
    doorPivot.add(handwheel);
    vGroup.add(doorPivot);

    // Top emblem plate & status beacon
    const emblemTex = track(createVaultEmblemTexture(spec.code, spec.name, false, anisotropy));
    const emblemMat = track(
      new THREE.MeshStandardMaterial({
        map: emblemTex,
        roughness: 0.45,
        metalness: 0.25,
      })
    );
    const emblemMesh = new THREE.Mesh(emblemPlaneGeo, emblemMat);
    emblemMesh.position.set(0, 3.16, 0.21);
    vGroup.add(emblemMesh);

    const statusBulb = new THREE.Mesh(bulbGeo, mats.statusLocked);
    statusBulb.position.set(0.95, 3.16, 0.22);
    vGroup.add(statusBulb);

    registerInteractable(
      interactables,
      vGroup,
      { type: 'SELECT_VAULT', vaultId: spec.id },
      `Inspecionar ${spec.name} (${spec.code})`
    );

    vaults.push({
      id: spec.id,
      code: spec.code,
      name: spec.name,
      doorPivot,
      handwheel,
      statusBulb,
      emblemMesh,
      emblemMaterial: emblemMat,
      currentUnlocked: false,
    });

    root.add(vGroup);
  });

  // ============================================================================
  // 3. CENTRAL CRYPTOGRAPHIC DESK (Grounded at y=0, tabletop at y=1.18)
  // ============================================================================
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, 0, 0);

  // Soft contact shadow under desk
  const deskShadowGeo = track(new THREE.PlaneGeometry(5.6, 3.4));
  const deskShadow = new THREE.Mesh(deskShadowGeo, shadowMat);
  deskShadow.rotation.x = -Math.PI / 2;
  deskShadow.position.y = 0.015;
  deskGroup.add(deskShadow);

  // 4 Tapered Steel Legs with Brass Feet
  const legGeo = track(new THREE.CylinderGeometry(0.055, 0.038, 1.1, 14));
  const footGeo = track(new THREE.CylinderGeometry(0.055, 0.065, 0.06, 14));
  const legOffsets: [number, number][] = [
    [-2.05, -0.92],
    [2.05, -0.92],
    [-2.05, 0.92],
    [2.05, 0.92],
  ];
  legOffsets.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, mats.forgedSteel);
    leg.position.set(lx, 0.55, lz);
    leg.castShadow = true;
    deskGroup.add(leg);

    const foot = new THREE.Mesh(footGeo, mats.brushedBrass);
    foot.position.set(lx, 0.03, lz);
    deskGroup.add(foot);
  });

  // Desk Apron & Walnut Tabletop (top surface at y = 1.18)
  const apronGeo = track(new THREE.BoxGeometry(4.2, 0.14, 1.95));
  const apron = new THREE.Mesh(apronGeo, mats.darkChassis);
  apron.position.set(0, 1.04, 0);
  apron.castShadow = true;
  deskGroup.add(apron);

  const tableTopGeo = track(new THREE.BoxGeometry(4.56, 0.09, 2.24));
  const tableTop = new THREE.Mesh(tableTopGeo, mats.walnutWood);
  tableTop.position.set(0, 1.135, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  deskGroup.add(tableTop);

  // Brass corner brackets on tabletop
  const cornerGeo = track(new THREE.BoxGeometry(0.18, 0.096, 0.18));
  legOffsets.forEach(([cx, cz]) => {
    const bracket = new THREE.Mesh(cornerGeo, mats.brushedBrass);
    bracket.position.set(cx * 1.07, 1.135, cz * 1.13);
    deskGroup.add(bracket);
  });

  // Leather desk blotter mat (sits flush at y=1.185)
  const blotterGeo = track(new THREE.BoxGeometry(2.2, 0.014, 1.25));
  const blotter = new THREE.Mesh(blotterGeo, mats.leatherMat);
  blotter.position.set(0, 1.187, 0.18);
  blotter.receiveShadow = true;
  deskGroup.add(blotter);

  // ============================================================================
  // 4. HERO ASSEMBLY A: 3D CIPHER LOCK CONSOLE (4 Rotating Brass Dial Wheels)
  // ============================================================================
  const consoleGroup = new THREE.Group();
  consoleGroup.position.set(0, 1.194, 0.36);

  const consoleBaseGeo = track(new THREE.BoxGeometry(1.76, 0.14, 0.72));
  const consoleBase = new THREE.Mesh(consoleBaseGeo, mats.darkChassis);
  consoleBase.position.y = 0.07;
  consoleBase.castShadow = true;
  consoleBase.receiveShadow = true;
  consoleGroup.add(consoleBase);

  const consoleBezelGeo = track(new THREE.BoxGeometry(1.82, 0.035, 0.78));
  const consoleBezel = new THREE.Mesh(consoleBezelGeo, mats.brushedBrass);
  consoleBezel.position.y = 0.018;
  consoleGroup.add(consoleBezel);

  // Front angled reading bar + status crystal
  const crystalGeo = track(new THREE.OctahedronGeometry(0.055, 0));
  const lockStatusCrystal = new THREE.Mesh(crystalGeo, mats.statusLocked);
  lockStatusCrystal.position.set(0, 0.19, 0.26);
  consoleGroup.add(lockStatusCrystal);

  // 4 Rotating 3D Numeric Drum Wheels (0..9)
  const dialStripTex = track(createDialDigitStripTexture(anisotropy));
  const dialDrumMat = track(
    new THREE.MeshStandardMaterial({
      map: dialStripTex,
      roughness: 0.32,
      metalness: 0.45,
    })
  );
  const dialCapMat = mats.brushedBrass;
  const drumGeo = track(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 30, 1, false));
  const nudgeTabGeo = track(new THREE.BoxGeometry(0.14, 0.032, 0.09));
  const ringDividerGeo = track(new THREE.TorusGeometry(0.164, 0.012, 8, 24));

  const dialWheels: THREE.Mesh[] = [];
  const slotX = [-0.46, -0.155, 0.155, 0.46];

  slotX.forEach((sx, idx) => {
    const wheelHolder = new THREE.Group();
    wheelHolder.position.set(sx, 0.17, 0.02);
    // Rotate +90 deg around Z so cylinder axis lies horizontally along X while +Z faces front
    wheelHolder.rotation.z = Math.PI / 2;

    const wheelMesh = new THREE.Mesh(drumGeo, [dialDrumMat, dialCapMat, dialCapMat]);
    wheelMesh.castShadow = true;
    // Initialize pointing to digit 0
    wheelMesh.rotation.y = -(0 + 0.5) * ((Math.PI * 2) / 10);
    wheelHolder.add(wheelMesh);
    consoleGroup.add(wheelHolder);
    dialWheels.push(wheelMesh);

    // Brass housing rings flanking each drum
    const ringL = new THREE.Mesh(ringDividerGeo, mats.brushedBrass);
    ringL.rotation.y = Math.PI / 2;
    ringL.position.set(sx - 0.115, 0.17, 0.02);
    consoleGroup.add(ringL);

    const ringR = new THREE.Mesh(ringDividerGeo, mats.brushedBrass);
    ringR.rotation.y = Math.PI / 2;
    ringR.position.set(sx + 0.115, 0.17, 0.02);
    consoleGroup.add(ringR);

    // Direct 3D click on the drum itself increments +1
    registerInteractable(
      interactables,
      wheelMesh,
      { type: 'DIAL_STEP', slotIndex: idx, delta: 1 },
      `Girar dígito ${idx + 1}`
    );

    // Upper (+1) & Lower (-1) clickable brass nudge tabs
    const upTab = new THREE.Mesh(nudgeTabGeo, mats.brushedBrass);
    upTab.position.set(sx, 0.16, -0.2);
    consoleGroup.add(upTab);
    registerInteractable(
      interactables,
      upTab,
      { type: 'DIAL_STEP', slotIndex: idx, delta: 1 },
      `Avançar dígito ${idx + 1}`
    );

    const downTab = new THREE.Mesh(nudgeTabGeo, mats.agedBronze);
    downTab.position.set(sx, 0.16, 0.24);
    consoleGroup.add(downTab);
    registerInteractable(
      interactables,
      downTab,
      { type: 'DIAL_STEP', slotIndex: idx, delta: -1 },
      `Voltar dígito ${idx + 1}`
    );
  });

  // Left: Clear Push Button
  const clearBtnGeo = track(new THREE.CylinderGeometry(0.055, 0.065, 0.05, 16));
  const clearBtn = new THREE.Mesh(clearBtnGeo, mats.agedBronze);
  clearBtn.position.set(-0.73, 0.16, 0.06);
  consoleGroup.add(clearBtn);
  registerInteractable(
    interactables,
    clearBtn,
    { type: 'CLEAR_CODE' },
    'Zerar travas (0000)'
  );

  // Right: Mechanical Brass Submit Lever
  const submitLeverPivot = new THREE.Group();
  submitLeverPivot.position.set(0.74, 0.15, 0.06);

  const leverBaseGeo = track(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 16));
  const leverBase = new THREE.Mesh(leverBaseGeo, mats.forgedSteel);
  submitLeverPivot.add(leverBase);

  const leverShaftGeo = track(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 12));
  const leverShaft = new THREE.Mesh(leverShaftGeo, mats.brushedBrass);
  leverShaft.position.y = 0.12;
  submitLeverPivot.add(leverShaft);

  const leverKnobGeo = track(new THREE.SphereGeometry(0.045, 16, 12));
  const leverKnob = new THREE.Mesh(leverKnobGeo, mats.goldIngot);
  leverKnob.position.y = 0.24;
  submitLeverPivot.add(leverKnob);

  consoleGroup.add(submitLeverPivot);
  registerInteractable(
    interactables,
    submitLeverPivot,
    { type: 'SUBMIT_CODE' },
    'Acionar Alavanca (Decifrar Código)'
  );

  deskGroup.add(consoleGroup);

  // ============================================================================
  // 5. HERO ASSEMBLY B: 3D STANDING RIDDLE SLATE PLAQUE
  // ============================================================================
  const plaqueGroup = new THREE.Group();
  plaqueGroup.position.set(0, 1.194, -0.34);

  const easelBaseGeo = track(new THREE.BoxGeometry(1.5, 0.05, 0.36));
  const easelBase = new THREE.Mesh(easelBaseGeo, mats.agedBronze);
  easelBase.position.y = 0.025;
  plaqueGroup.add(easelBase);

  const slateHolder = new THREE.Group();
  slateHolder.position.set(0, 0.56, -0.02);
  slateHolder.rotation.x = -0.22; // Tilted ergonomically toward the player

  const slateFrameGeo = track(new THREE.BoxGeometry(1.88, 1.18, 0.06));
  const slateFrame = new THREE.Mesh(slateFrameGeo, mats.brushedBrass);
  slateFrame.castShadow = true;
  slateHolder.add(slateFrame);

  const { canvas: plaqueCanvas, texture: plaqueTexture } = createRiddleSlateTexture(
    initialPlaque,
    anisotropy
  );
  track(plaqueTexture);

  const plaqueScreenMat = track(
    new THREE.MeshStandardMaterial({
      map: plaqueTexture,
      roughness: 0.42,
      metalness: 0.08,
      emissive: 0x0b1320,
      emissiveMap: plaqueTexture,
      emissiveIntensity: 0.35,
    })
  );
  const plaqueScreenGeo = track(new THREE.PlaneGeometry(1.76, 1.08));
  const plaqueScreen = new THREE.Mesh(plaqueScreenGeo, plaqueScreenMat);
  plaqueScreen.position.z = 0.032;
  slateHolder.add(plaqueScreen);

  plaqueGroup.add(slateHolder);
  registerInteractable(
    interactables,
    plaqueGroup,
    { type: 'FOCUS_RIDDLE' },
    'Aproximar do Enigma 3D'
  );
  deskGroup.add(plaqueGroup);

  // ============================================================================
  // 6. HERO ASSEMBLY C: 3D RODA DE CÉSAR FÍSICA (Right Wing of Desk)
  // ============================================================================
  const caesarGroup = new THREE.Group();
  caesarGroup.position.set(1.48, 1.194, 0.05);
  caesarGroup.rotation.y = -0.35;

  const caesarStandGeo = track(new THREE.BoxGeometry(0.95, 0.06, 0.42));
  const caesarStand = new THREE.Mesh(caesarStandGeo, mats.agedBronze);
  caesarStand.position.y = 0.03;
  caesarStand.castShadow = true;
  caesarGroup.add(caesarStand);

  const caesarTilt = new THREE.Group();
  caesarTilt.position.set(0, 0.48, 0);
  caesarTilt.rotation.x = -0.45;

  const outerTex = track(createCaesarRingTexture(false, anisotropy));
  const outerRingMat = track(
    new THREE.MeshStandardMaterial({
      map: outerTex,
      roughness: 0.45,
      metalness: 0.35,
    })
  );
  const outerDiscGeo = track(new THREE.CylinderGeometry(0.46, 0.48, 0.04, 48));
  const outerDisc = new THREE.Mesh(outerDiscGeo, [mats.forgedSteel, outerRingMat, mats.forgedSteel]);
  outerDisc.rotation.x = Math.PI / 2;
  outerDisc.castShadow = true;
  caesarTilt.add(outerDisc);

  const innerTex = track(createCaesarRingTexture(true, anisotropy));
  const innerDiscMat = track(
    new THREE.MeshStandardMaterial({
      map: innerTex,
      roughness: 0.28,
      metalness: 0.65,
    })
  );
  const innerDiscGeo = track(new THREE.CircleGeometry(0.33, 48));
  const caesarInnerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
  caesarInnerDisc.position.z = 0.025;
  caesarTilt.add(caesarInnerDisc);

  // Central knurled brass knob + top pointer
  const centerKnobGeo = track(new THREE.CylinderGeometry(0.065, 0.08, 0.05, 20));
  const centerKnob = new THREE.Mesh(centerKnobGeo, mats.brushedBrass);
  centerKnob.rotation.x = Math.PI / 2;
  centerKnob.position.z = 0.045;
  caesarTilt.add(centerKnob);

  const pointerGeo = track(new THREE.ConeGeometry(0.035, 0.08, 12));
  const pointer = new THREE.Mesh(pointerGeo, mats.goldIngot);
  pointer.rotation.z = Math.PI;
  pointer.position.set(0, 0.48, 0.04);
  caesarTilt.add(pointer);

  caesarGroup.add(caesarTilt);
  registerInteractable(
    interactables,
    caesarGroup,
    { type: 'CAESAR_STEP', delta: 1 },
    'Girar Roda de César 3D (+1)'
  );
  deskGroup.add(caesarGroup);

  // ============================================================================
  // 7. HERO ASSEMBLY D: 3D VITROLA MPB + BRASS DESK LAMP (Left Wing of Desk)
  // ============================================================================
  const vitrolaGroup = new THREE.Group();
  vitrolaGroup.position.set(-1.52, 1.194, 0.16);
  vitrolaGroup.rotation.y = 0.28;

  const plinthBoxGeo = track(new THREE.BoxGeometry(0.86, 0.12, 0.72));
  const plinthBox = new THREE.Mesh(plinthBoxGeo, mats.walnutWood);
  plinthBox.position.y = 0.06;
  plinthBox.castShadow = true;
  vitrolaGroup.add(plinthBox);

  const brassTrimGeo = track(new THREE.BoxGeometry(0.88, 0.024, 0.74));
  const brassTrim = new THREE.Mesh(brassTrimGeo, mats.brushedBrass);
  brassTrim.position.y = 0.015;
  vitrolaGroup.add(brassTrim);

  // Spinning vinyl platter
  const vinylPlatter = new THREE.Group();
  vinylPlatter.position.set(-0.08, 0.135, 0);

  const platterMetalGeo = track(new THREE.CylinderGeometry(0.285, 0.295, 0.025, 36));
  const platterMetal = new THREE.Mesh(platterMetalGeo, mats.brushedBrass);
  vinylPlatter.add(platterMetal);

  const vinylTex = track(createVinylLabelTexture(anisotropy));
  const vinylMat = track(
    new THREE.MeshStandardMaterial({
      map: vinylTex,
      roughness: 0.24,
      metalness: 0.12,
    })
  );
  const vinylGeo = track(new THREE.CylinderGeometry(0.265, 0.265, 0.01, 36));
  const vinylDisc = new THREE.Mesh(vinylGeo, [mats.darkChassis, vinylMat, mats.darkChassis]);
  vinylDisc.position.y = 0.016;
  vinylPlatter.add(vinylDisc);

  const spindleGeo = track(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 12));
  const spindle = new THREE.Mesh(spindleGeo, mats.brushedBrass);
  spindle.position.y = 0.028;
  vinylPlatter.add(spindle);
  vitrolaGroup.add(vinylPlatter);

  // Pivoting brass tonearm
  const tonearmPivot = new THREE.Group();
  tonearmPivot.position.set(0.29, 0.16, -0.2);

  const armBaseGeo = track(new THREE.CylinderGeometry(0.045, 0.055, 0.05, 16));
  const armBase = new THREE.Mesh(armBaseGeo, mats.forgedSteel);
  tonearmPivot.add(armBase);

  const armRodGeo = track(new THREE.CylinderGeometry(0.01, 0.01, 0.36, 10));
  const armRod = new THREE.Mesh(armRodGeo, mats.brushedBrass);
  armRod.rotation.x = Math.PI / 2;
  armRod.position.set(0, 0.03, 0.18);
  tonearmPivot.add(armRod);

  const headshellGeo = track(new THREE.BoxGeometry(0.038, 0.024, 0.065));
  const headshell = new THREE.Mesh(headshellGeo, mats.goldIngot);
  headshell.position.set(0, 0.022, 0.36);
  tonearmPivot.add(headshell);

  vitrolaGroup.add(tonearmPivot);

  registerInteractable(
    interactables,
    vitrolaGroup,
    { type: 'TOGGLE_MPB' },
    'Tocar / Pausar Vitrola MPB'
  );
  deskGroup.add(vitrolaGroup);

  // Classic Banker / Brass Desk Lamp (back-left of desk)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-1.62, 1.194, -0.62);

  const lampBaseGeo = track(new THREE.CylinderGeometry(0.16, 0.19, 0.05, 24));
  const lampBase = new THREE.Mesh(lampBaseGeo, mats.brushedBrass);
  lampBase.position.y = 0.025;
  lampBase.castShadow = true;
  lampGroup.add(lampBase);

  const lampStemGeo = track(new THREE.CylinderGeometry(0.022, 0.026, 0.56, 12));
  const lampStem = new THREE.Mesh(lampStemGeo, mats.brushedBrass);
  lampStem.position.set(0, 0.3, -0.02);
  lampStem.rotation.x = 0.18;
  lampGroup.add(lampStem);

  const lampShadeGeo = track(new THREE.ConeGeometry(0.24, 0.16, 24, 1, true));
  const lampShade = new THREE.Mesh(lampShadeGeo, mats.agedBronze);
  lampShade.position.set(0.06, 0.56, 0.1);
  lampShade.rotation.x = 0.35;
  lampShade.rotation.z = -0.25;
  lampGroup.add(lampShade);

  const bulbMeshGeo = track(new THREE.SphereGeometry(0.055, 14, 10));
  const bulbMesh = new THREE.Mesh(bulbMeshGeo, mats.warmBulb);
  bulbMesh.position.set(0.06, 0.52, 0.1);
  lampGroup.add(bulbMesh);

  const deskLampLight = new THREE.PointLight(0xffb84d, 3.2, 6.5, 1.8);
  deskLampLight.position.set(0.1, 0.48, 0.16);
  lampGroup.add(deskLampLight);

  deskGroup.add(lampGroup);
  root.add(deskGroup);

  return {
    root,
    dialWheels,
    caesarInnerDisc,
    submitLeverPivot,
    lockStatusCrystal,
    vinylPlatter,
    tonearmPivot,
    dustPoints,
    vaults,
    interactables,
    updateRiddlePlaque: (content: RiddlePlaqueContent) => {
      updateRiddleSlateCanvas(plaqueCanvas, content);
      plaqueTexture.needsUpdate = true;
    },
    updateVaultVisuals: (solvedIds: string[], aniso: number) => {
      vaults.forEach((v) => {
        const unlocked = solvedIds.includes(v.id);
        if (unlocked !== v.currentUnlocked) {
          v.currentUnlocked = unlocked;
          v.statusBulb.material = unlocked ? mats.statusUnlocked : mats.statusLocked;
          const oldTex = v.emblemMaterial.map;
          v.emblemMaterial.map = createVaultEmblemTexture(v.code, v.name, unlocked, aniso);
          v.emblemMaterial.needsUpdate = true;
          oldTex?.dispose();
        }
      });
    },
    setLockFeedback: (state: 'IDLE' | 'SUCCESS' | 'ERROR') => {
      if (state === 'SUCCESS') {
        lockStatusCrystal.material = mats.statusUnlocked;
      } else if (state === 'ERROR') {
        lockStatusCrystal.material = mats.statusError;
      } else {
        lockStatusCrystal.material = mats.statusLocked;
      }
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose());
      vaults.forEach((v) => {
        v.emblemMaterial.map?.dispose();
        v.emblemMaterial.dispose();
      });
    },
  };
}
