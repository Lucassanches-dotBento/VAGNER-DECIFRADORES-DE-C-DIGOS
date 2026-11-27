import * as THREE from 'three';
import {
  createLeatherMatTexture,
  createVaultFloorTexture,
  createWalnutWoodTexture,
} from './textures';

export interface ChamberMaterials {
  floor: THREE.MeshStandardMaterial;
  wallStone: THREE.MeshStandardMaterial;
  pillarStone: THREE.MeshStandardMaterial;
  walnutWood: THREE.MeshStandardMaterial;
  leatherMat: THREE.MeshStandardMaterial;
  brushedBrass: THREE.MeshPhysicalMaterial;
  agedBronze: THREE.MeshStandardMaterial;
  forgedSteel: THREE.MeshStandardMaterial;
  darkChassis: THREE.MeshStandardMaterial;
  warmBulb: THREE.MeshStandardMaterial;
  goldIngot: THREE.MeshStandardMaterial;
  statusLocked: THREE.MeshStandardMaterial;
  statusUnlocked: THREE.MeshStandardMaterial;
  statusError: THREE.MeshStandardMaterial;
  dispose: () => void;
}

export function createChamberMaterials(anisotropy: number): ChamberMaterials {
  const floorMap = createVaultFloorTexture(anisotropy);
  const woodMap = createWalnutWoodTexture(anisotropy);
  const leatherMap = createLeatherMatTexture(anisotropy);

  const floor = new THREE.MeshStandardMaterial({
    map: floorMap,
    roughness: 0.78,
    metalness: 0.14,
  });

  const wallStone = new THREE.MeshStandardMaterial({
    color: 0x0f1727,
    roughness: 0.88,
    metalness: 0.08,
  });

  const pillarStone = new THREE.MeshStandardMaterial({
    color: 0x162238,
    roughness: 0.76,
    metalness: 0.14,
  });

  const walnutWood = new THREE.MeshStandardMaterial({
    map: woodMap,
    roughness: 0.56,
    metalness: 0.05,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    map: leatherMap,
    roughness: 0.88,
    metalness: 0.02,
  });

  const brushedBrass = new THREE.MeshPhysicalMaterial({
    color: 0xd99b26,
    metalness: 0.92,
    roughness: 0.22,
    anisotropy: 0.75,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
  });

  const agedBronze = new THREE.MeshStandardMaterial({
    color: 0x8b6220,
    metalness: 0.84,
    roughness: 0.42,
  });

  const forgedSteel = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.84,
    roughness: 0.34,
  });

  const darkChassis = new THREE.MeshStandardMaterial({
    color: 0x111a2b,
    metalness: 0.35,
    roughness: 0.65,
  });

  const warmBulb = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.0,
  });

  const goldIngot = new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24,
    metalness: 0.95,
    roughness: 0.16,
    emissive: 0x78350f,
    emissiveIntensity: 0.25,
    clearcoat: 0.4,
  });

  const statusLocked = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.9,
    roughness: 0.25,
    metalness: 0.1,
  });

  const statusUnlocked = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.35,
    roughness: 0.2,
    metalness: 0.1,
  });

  const statusError = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    emissive: 0xe11d48,
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.1,
  });

  const allMaterials = [
    floor,
    wallStone,
    pillarStone,
    walnutWood,
    leatherMat,
    brushedBrass,
    agedBronze,
    forgedSteel,
    darkChassis,
    warmBulb,
    goldIngot,
    statusLocked,
    statusUnlocked,
    statusError,
  ];

  return {
    floor,
    wallStone,
    pillarStone,
    walnutWood,
    leatherMat,
    brushedBrass,
    agedBronze,
    forgedSteel,
    darkChassis,
    warmBulb,
    goldIngot,
    statusLocked,
    statusUnlocked,
    statusError,
    dispose: () => {
      floorMap.dispose();
      woodMap.dispose();
      leatherMap.dispose();
      allMaterials.forEach((m) => m.dispose());
    },
  };
}
