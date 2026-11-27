import * as THREE from 'three';
import { CipherExpression } from '../types/game';

export interface RiddlePlaqueContent {
  badge: string;
  title: string;
  mechanic: string;
  expressions: CipherExpression[];
  solved: boolean;
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D Canvas context unavailable');
  }
  return [canvas, ctx];
}

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

export function createVaultFloorTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);

  ctx.fillStyle = '#0D1524';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle stone tile variation
  const tile = 128;
  for (let y = 0; y < 512; y += tile) {
    for (let x = 0; x < 512; x += tile) {
      const shade = ((x / tile + y / tile) % 2 === 0) ? '#101A2C' : '#0D1626';
      ctx.fillStyle = shade;
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
    }
  }

  // Fine stone noise speckles
  for (let i = 0; i < 1800; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const alpha = Math.random() * 0.05;
    ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
    ctx.fillRect(px, py, 2, 2);
  }

  // Subtle brass inlay grid seams
  ctx.strokeStyle = 'rgba(217, 155, 38, 0.16)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += tile) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  return finalizeColorTexture(canvas, anisotropy, 8, 8);
}

export function createWalnutWoodTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#2B1B12');
  grad.addColorStop(0.5, '#372318');
  grad.addColorStop(1, '#26170F');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 3) {
    const wave = Math.sin(y * 0.05) * 14 + Math.cos(y * 0.13) * 6;
    ctx.strokeStyle = y % 9 === 0 ? 'rgba(18, 10, 6, 0.35)' : 'rgba(92, 58, 36, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + wave, 340, y - wave, 512, y);
    ctx.stroke();
  }

  return finalizeColorTexture(canvas, anisotropy, 2, 1);
}

export function createLeatherMatTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 256);

  ctx.fillStyle = '#0F1A2C';
  ctx.fillRect(0, 0, 512, 256);

  // Subtle leather grain
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Gold leaf inset border
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, 484, 228);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(22, 22, 468, 212);

  return finalizeColorTexture(canvas, anisotropy);
}

/**
 * Wraps digits 0..9 around a cylinder drum circumference.
 * Three.js CylinderGeometry maps U=0..1 around Y starting at +Z or -Z depending on rotation.
 * We align each digit at exact 36-degree intervals so rotating the wheel aligns the digit facing front.
 */
export function createDialDigitStripTexture(anisotropy: number): THREE.CanvasTexture {
  const width = 1280;
  const height = 128;
  const [canvas, ctx] = makeCanvas(width, height);

  // Brushed dark bronze/slate backing
  const bg = ctx.createLinearGradient(0, 0, width, 0);
  bg.addColorStop(0, '#1C2536');
  bg.addColorStop(0.5, '#27344A');
  bg.addColorStop(1, '#182030');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const cellW = width / 10;
  for (let d = 0; d < 10; d++) {
    const cx = d * cellW + cellW / 2;
    const cy = height / 2;

    // Brass divider ring notch
    ctx.fillStyle = '#B47B22';
    ctx.fillRect(d * cellW, 4, 4, height - 8);

    // Subtle recessed window
    ctx.fillStyle = '#0D1522';
    ctx.fillRect(d * cellW + 12, 12, cellW - 24, height - 24);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.42)';
    ctx.lineWidth = 2;
    ctx.strokeRect(d * cellW + 12, 12, cellW - 24, height - 24);

    // Crisp engraved numeral rotated +90deg to match horizontal X-axis drum orientation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#FCD34D';
    ctx.font = '700 70px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(d), 0, 2);
    ctx.restore();
  }

  return finalizeColorTexture(canvas, anisotropy);
}

export function createCaesarRingTexture(isInner: boolean, anisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const [canvas, ctx] = makeCanvas(size, size);
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Disc background
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
  ctx.fillStyle = isInner ? '#2D2112' : '#121D31';
  ctx.fill();

  // Concentric brass borders
  ctx.lineWidth = 10;
  ctx.strokeStyle = isInner ? '#F59E0B' : '#94A3B8';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.47, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.strokeStyle = isInner ? '#D97706' : '#475569';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.34, 0, Math.PI * 2);
  ctx.stroke();

  // 26 letters around the circumference (A at top: -PI/2)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const radius = isInner ? size * 0.405 : size * 0.415;

  for (let i = 0; i < 26; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 26;
    const sepAngle = angle - Math.PI / 26;

    // Tick divider
    ctx.strokeStyle = isInner ? 'rgba(245, 158, 11, 0.35)' : 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(sepAngle) * (size * 0.34), cy + Math.sin(sepAngle) * (size * 0.34));
    ctx.lineTo(cx + Math.cos(sepAngle) * (size * 0.47), cy + Math.sin(sepAngle) * (size * 0.47));
    ctx.stroke();

    // Letter
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = isInner ? '#FDE68A' : '#E2E8F0';
    ctx.font = `700 ${isInner ? 34 : 36}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letters[i], 0, 0);
    ctx.restore();
  }

  return finalizeColorTexture(canvas, anisotropy);
}

export function createVinylLabelTexture(anisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size, size);
  const cx = size / 2;
  const cy = size / 2;

  ctx.fillStyle = '#0D0E12';
  ctx.fillRect(0, 0, size, size);

  // Concentric vinyl grooves
  for (let r = 95; r < 245; r += 5) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = r % 15 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Amber MPB center label
  ctx.beginPath();
  ctx.arc(cx, cy, 86, 0, Math.PI * 2);
  ctx.fillStyle = '#D97706';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0B1320';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MPB', cx, cy - 32);
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText('ARQUIVO CIFRA', cx, cy + 44);

  // Spindle hole
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#1E293B';
  ctx.fill();

  return finalizeColorTexture(canvas, anisotropy);
}

export function createVaultEmblemTexture(
  code: string,
  name: string,
  unlocked: boolean,
  anisotropy: number
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 160);

  ctx.fillStyle = unlocked ? '#0F2922' : '#10192A';
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = unlocked ? '#10B981' : '#D97706';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.fillStyle = unlocked ? '#34D399' : '#FBBF24';
  ctx.font = '700 32px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(code, 256, 62);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 34px "Fraunces", Georgia, serif';
  ctx.fillText(name, 256, 118);

  return finalizeColorTexture(canvas, anisotropy);
}

export function updateRiddleSlateCanvas(
  canvas: HTMLCanvasElement,
  content: RiddlePlaqueContent
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Slate background
  ctx.fillStyle = '#0B1320';
  ctx.fillRect(0, 0, w, h);

  // Subtle top bar
  ctx.fillStyle = content.solved ? '#064E3B' : '#162238';
  ctx.fillRect(0, 0, w, 92);

  ctx.strokeStyle = content.solved ? '#10B981' : '#F59E0B';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  // Header badge + title
  ctx.fillStyle = content.solved ? '#6EE7B7' : '#FBBF24';
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(content.badge, 36, 56);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(content.solved ? 'DECIFRADO' : content.mechanic, w - 36, 56);

  // Title
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 40px "Fraunces", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(content.title.slice(0, 34), 36, 148);

  // Expressions (up to 4 lines)
  const items = content.expressions.slice(0, 4);
  let y = 190;
  const rowH = items.length <= 2 ? 120 : items.length === 3 ? 96 : 76;

  items.forEach((expr) => {
    ctx.fillStyle = '#121D31';
    ctx.fillRect(36, y, w - 72, rowH - 12);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, y, w - 72, rowH - 12);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${expr.label} (${expr.language})`, 54, y + 30);

    ctx.fillStyle = '#FDE68A';
    ctx.font = '700 30px "JetBrains Mono", monospace';
    ctx.fillText(expr.code.slice(0, 44), 54, y + rowH - 26);

    y += rowH;
  });
}

export function createRiddleSlateTexture(
  content: RiddlePlaqueContent,
  anisotropy: number
): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
  const [canvas] = makeCanvas(1024, 640);
  updateRiddleSlateCanvas(canvas, content);
  const texture = finalizeColorTexture(canvas, anisotropy);
  return { canvas, texture };
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(3, 6, 14, 0.72)');
  grad.addColorStop(0.55, 'rgba(3, 6, 14, 0.32)');
  grad.addColorStop(1, 'rgba(3, 6, 14, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
