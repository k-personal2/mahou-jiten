/** 属性を連想させる抽象的な背景パターン（SVG文字列）。画像やエフェクトではなく線画のみ。 */
const HUE: Record<string, number> = { fire: 35, ice: 235, thunder: 85, wind: 165, water: 240, earth: 60, light: 85, dark: 300, none: 60, heal: 150, revive: 80, buff: 45, ailment: 315, death: 20 };

export function motifSvg(kind: string): string {
  const hh = HUE[kind] ?? 60, st = `oklch(0.56 0.12 ${hh})`, W = 400, H = 220, out: string[] = [], id = 'm-' + kind;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const P = (d: string, o: number, w = 1, c = st, extra = '') => out.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o.toFixed(2)}" stroke-linecap="round" ${extra}/>`);
  const C = (cx: number, cy: number, r: number, o: number, extra = '') => out.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${st}" stroke-width="1" opacity="${o.toFixed(2)}" ${extra}/>`);

  if (kind === 'fire') {
    for (let i = 0; i < 10; i++) {
      let d = ''; const y0 = 30 + i * 19, a = 5 + i * 1.4, ph = i * 0.9;
      for (let x = -10; x <= W + 10; x += 8) { const y = y0 + Math.sin(x / 36 + ph) * a + Math.sin(x / 15 + ph * 2) * a * 0.3; d += (x < 0 ? 'M' : 'L') + x + ',' + y.toFixed(1); }
      P(d, 0.22 + i * 0.03, 1.3, `oklch(0.58 0.15 ${22 + i * 4})`);
    }
  } else if (kind === 'ice') {
    for (let i = -12; i <= 24; i++) { const o = i * 28; P(`M${o},0 L${o + 127},220`, 0.13); P(`M${o},220 L${o + 127},0`, 0.13); }
    [[200, 110, 90], [70, 50, 34], [330, 170, 40], [350, 40, 22]].forEach(([cx, cy, r]) => {
      let d = '';
      for (let j = 0; j < 7; j++) { const a = (Math.PI / 3) * j + Math.PI / 6; d += (j ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1); }
      P(d, 0.45, 1.1);
      for (let j = 0; j < 3; j++) { const a = (Math.PI / 3) * j, k = r * 0.8; P(`M${(cx - Math.cos(a) * k).toFixed(1)},${(cy - Math.sin(a) * k).toFixed(1)}L${(cx + Math.cos(a) * k).toFixed(1)},${(cy + Math.sin(a) * k).toFixed(1)}`, 0.3); }
    });
  } else if (kind === 'thunder') {
    for (let i = 0; i < 7; i++) {
      let x = 30 + i * 56 + rnd() * 20, d = `M${x.toFixed(1)},-5`;
      for (let y = 10; y <= 230; y += 16 + rnd() * 14) { x += (rnd() - 0.5) * 34; d += `L${x.toFixed(1)},${y.toFixed(1)}`; }
      P(d, 0.25 + rnd() * 0.3, 0.8, `oklch(0.55 0.12 ${70 + i * 3})`, 'stroke-linejoin="miter"');
    }
  } else if (kind === 'wind') {
    for (let i = 0; i < 9; i++) { const y = 20 + i * 24, a = 30 + rnd() * 40; P(`M-20,${y} C 110,${y - a} 250,${y + a} 420,${y - a * 0.3}`, 0.18 + rnd() * 0.3, 1.1); }
  } else if (kind === 'water') {
    for (let i = 1; i < 12; i++) out.push(`<ellipse cx="200" cy="110" rx="${i * 26}" ry="${i * 11}" fill="none" stroke="${st}" opacity="${(0.5 - i * 0.035).toFixed(2)}"/>`);
  } else if (kind === 'earth') {
    for (let i = 0; i < 14; i++) { let d = ''; const y0 = 10 + i * 15; for (let x = -10; x <= W + 10; x += 20) d += (x < 0 ? 'M' : 'L') + x + ',' + (y0 + Math.sin(x / 70 + i) * 3).toFixed(1); P(d, 0.15 + (i % 3) * 0.08); }
  } else if (kind === 'dark') {
    for (let i = 1; i < 10; i++) C(200, 110, i * 22, 0.55 - i * 0.04, `stroke-dasharray="1 ${3 + i}"`);
  } else if (kind === 'buff') {
    for (let j = 0; j < 5; j++) for (let i = 0; i < 9; i++) { const x = 20 + i * 46 + (j % 2) * 23, y = 30 + j * 44; P(`M${x - 10},${y + 8} L${x},${y} L${x + 10},${y + 8}`, 0.3); }
  } else if (kind === 'ailment') {
    for (let i = 0; i < 26; i++) C(rnd() * W, rnd() * H, 4 + rnd() * 16, 0.2 + rnd() * 0.25, 'stroke-dasharray="2 3"');
  } else if (kind === 'death') {
    for (let i = 0; i < 30; i++) { const x = 8 + i * 13.5; P(`M${x},0 L${x},${(60 + rnd() * 160).toFixed(0)}`, 0.12 + rnd() * 0.2, 0.8); }
  } else if (kind === 'heal' || kind === 'revive' || kind === 'light') {
    [[200, 110, 150], [70, 60, 70], [340, 160, 80], [330, 40, 40], [90, 180, 50]].forEach(([cx, cy, r]) => out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-g)"/>`));
    for (let i = 1; i < 5; i++) C(200, 110, 40 + i * 30, 0.2);
    for (let i = 0; i < 28; i++) out.push(`<circle cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * H).toFixed(1)}" r="${(1 + rnd() * 1.6).toFixed(1)}" fill="${st}" opacity="${(0.25 + rnd() * 0.35).toFixed(2)}"/>`);
  } else {
    for (let y = 12; y < H; y += 18) for (let x = 12; x < W; x += 18) out.push(`<circle cx="${x}" cy="${y}" r="1" fill="${st}" opacity="0.25"/>`);
  }
  const defs = `<defs>
<radialGradient id="${id}-g"><stop offset="0%" stop-color="oklch(0.8 0.12 ${hh})" stop-opacity="0.55"/><stop offset="100%" stop-color="oklch(0.8 0.12 ${hh})" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-h"><stop offset="0%" stop-color="#f3ead4" stop-opacity="0.95"/><stop offset="70%" stop-color="#f3ead4" stop-opacity="0.6"/><stop offset="100%" stop-color="#f3ead4" stop-opacity="0"/></radialGradient>
</defs>`;
  out.push(`<ellipse cx="200" cy="110" rx="170" ry="72" fill="url(#${id}-h)"/>`);
  return `<svg class="motif" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}${out.join('')}</svg>`;
}
