// All game art is drawn here as small SVGs, turned into textures at boot.

// Lighting filter that gives flat shapes volume: soft diffuse shading,
// a specular highlight from the top left, and a drop shadow.
const FX = `<defs><filter id="fx" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur"/>
<feDiffuseLighting in="blur" surfaceScale="5" diffuseConstant="1.05" lighting-color="#fff" result="diff"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>
<feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1="1.22" k2="0" k3="0" k4="0" result="shaded"/>
<feSpecularLighting in="blur" surfaceScale="5" specularConstant=".85" specularExponent="22" lighting-color="#fff" result="spec"><fePointLight x="20" y="5" z="70"/></feSpecularLighting>
<feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>
<feComposite in="shaded" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".75" k4="0" result="lit"/>
<feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="sb"/><feOffset in="sb" dx="1.5" dy="4" result="so"/>
<feFlood flood-color="#2b1606" flood-opacity=".38"/><feComposite in2="so" operator="in" result="shadow"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="litIn"/></feMerge></filter></defs>`;

const svg = (body: string, size = 128, fx = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${fx ? FX + `<g filter="url(#fx)">${body}</g>` : body}</svg>`;

const leaf = (x: number, y: number, r: number, c = '#3f9b5a') =>
  `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 C8 -10 22 -10 28 0 C22 10 8 10 0 0Z" fill="${c}" stroke="#25663a" stroke-width="1.5"/><path d="M2 0 L24 0" stroke="#25663a" stroke-width="1.2"/></g>`;

const shadow = '';

const ITEMS: Record<string, string[]> = {
  menthe: [
    shadow + `<g transform="translate(50 55) scale(2) translate(-50 -55)">` + leaf(36, 60, -30, '#4fb06a') + `</g>`,
    shadow + `<path d="M50 85 L50 30" stroke="#25663a" stroke-width="3"/>` + leaf(50, 60, -150) + leaf(50, 60, -30) + leaf(50, 42, -150) + leaf(50, 42, -30) + leaf(50, 30, -90, '#4fb06a'),
    shadow + `<path d="M40 85 L46 40 M50 85 L50 30 M60 85 L56 40" stroke="#25663a" stroke-width="3"/>` + leaf(46, 45, -160) + leaf(54, 45, -20) + leaf(50, 32, -110) + leaf(50, 32, -70) + leaf(40, 58, -170) + leaf(60, 58, -10) + `<rect x="40" y="70" width="20" height="8" rx="2" fill="#c0392b"/>`,
    shadow + `<path d="M34 30 L66 30 L60 86 L40 86Z" fill="#f3c86b" opacity=".85" stroke="#b8862f" stroke-width="2"/><path d="M34 30 L66 30 L65 40 L35 40Z" fill="#fff" opacity=".5"/><path d="M38 52 L62 52" stroke="#d4a24c" stroke-width="3"/><path d="M39 62 L61 62" stroke="#d4a24c" stroke-width="2"/>` + leaf(50, 30, -60),
    shadow + `<path d="M30 80 Q28 50 50 46 Q72 50 70 80Z" fill="#cfd5dc" stroke="#7d8793" stroke-width="2"/><path d="M70 62 Q86 56 88 40" stroke="#7d8793" stroke-width="4" fill="none"/><path d="M30 58 Q16 60 18 72 Q24 78 30 74" stroke="#7d8793" stroke-width="4" fill="none"/><path d="M38 46 Q50 22 62 46Z" fill="#d4a24c" stroke="#9a7128" stroke-width="2"/><circle cx="50" cy="26" r="4" fill="#d4a24c"/><path d="M32 66 L68 66" stroke="#d4a24c" stroke-width="3"/>`,
    shadow + `<ellipse cx="50" cy="76" rx="42" ry="12" fill="#d4a24c" stroke="#9a7128" stroke-width="2"/><ellipse cx="50" cy="73" rx="36" ry="8" fill="#e8bf62"/><path d="M38 72 Q37 52 50 50 Q63 52 62 72Z" fill="#cfd5dc" stroke="#7d8793" stroke-width="2"/><path d="M44 50 Q50 38 56 50Z" fill="#d4a24c"/><path d="M62 62 Q72 58 72 48" stroke="#7d8793" stroke-width="3" fill="none"/><path d="M18 74 L24 60 L32 60 L30 74Z" fill="#f3c86b" stroke="#b8862f" stroke-width="1.5"/><path d="M70 74 L68 60 L76 60 L82 74Z" fill="#f3c86b" stroke="#b8862f" stroke-width="1.5"/>`,
  ],
  pain: [
    shadow + `<path d="M50 88 L50 30" stroke="#b8862f" stroke-width="3"/>` + [30, 40, 50, 60].map((y) => `<ellipse cx="44" cy="${y}" rx="5" ry="8" fill="#e1b04a" transform="rotate(-25 44 ${y})"/><ellipse cx="56" cy="${y}" rx="5" ry="8" fill="#e1b04a" transform="rotate(25 56 ${y})"/>`).join(''),
    shadow + `<path d="M28 86 Q24 50 34 36 L66 36 Q76 50 72 86Z" fill="#efe3c8" stroke="#a89470" stroke-width="2"/><path d="M34 36 Q50 26 66 36" fill="#efe3c8" stroke="#a89470" stroke-width="2"/><path d="M36 34 L64 34" stroke="#c0392b" stroke-width="4"/><circle cx="50" cy="62" r="10" fill="none" stroke="#c98a3e" stroke-width="2"/><path d="M45 62 L55 62 M50 57 L50 67" stroke="#c98a3e" stroke-width="2"/>`,
    shadow + `<ellipse cx="50" cy="64" rx="30" ry="22" fill="#f6e7c8" stroke="#c9ad7c" stroke-width="2"/><ellipse cx="42" cy="56" rx="10" ry="5" fill="#fff" opacity=".6"/>`,
    shadow + `<ellipse cx="50" cy="62" rx="36" ry="24" fill="#c98a3e" stroke="#8a5a22" stroke-width="2"/><ellipse cx="50" cy="58" rx="30" ry="18" fill="#dba25a"/>` + [[40, 52], [56, 50], [48, 62], [62, 62], [36, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#5e3a14"/>`).join(''),
    shadow + `<rect x="22" y="36" width="56" height="48" rx="6" fill="#e3b261" stroke="#9a6a2a" stroke-width="2" transform="rotate(-6 50 60)"/><path d="M30 50 L72 46 M30 62 L72 58 M30 74 L72 70 M42 40 L44 82 M58 38 L60 80" stroke="#b9823a" stroke-width="2" transform="rotate(-6 50 60)"/>`,
    shadow + `<ellipse cx="50" cy="72" rx="42" ry="14" fill="#2e6fa8" stroke="#1d4a73" stroke-width="2"/><ellipse cx="50" cy="70" rx="34" ry="9" fill="#fff"/>` + [[34, 62], [50, 58], [66, 62], [42, 70], [58, 70]].map(([x, y]) => `<path d="M${x - 10} ${y} Q${x} ${y - 14} ${x + 10} ${y} Q${x} ${y - 6} ${x - 10} ${y}Z" fill="#f4dfb2" stroke="#c9a46a" stroke-width="1.5"/>`).join(''),
  ],
  couture: [
    shadow + `<path d="M28 70 C20 40 60 30 50 55 C42 75 80 70 74 44" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="74" cy="42" r="3" fill="#c0392b"/>`,
    shadow + `<rect x="34" y="24" width="32" height="8" rx="2" fill="#a0703a"/><rect x="34" y="76" width="32" height="8" rx="2" fill="#a0703a"/><rect x="38" y="32" width="24" height="44" fill="#c0392b"/>` + [38, 46, 54, 62, 70].map((y) => `<path d="M38 ${y} L62 ${y - 3}" stroke="#8e2a1f" stroke-width="1.5"/>`).join(''),
    shadow + `<path d="M18 74 L50 84 L82 74 L82 62 L50 72 L18 62Z" fill="#2e6fa8"/><path d="M18 62 L50 72 L82 62 L82 50 L50 60 L18 50Z" fill="#e2a33b"/><path d="M18 50 L50 60 L82 50 L50 40Z" fill="#3f9b5a"/><path d="M30 50 L50 44 L70 50" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>`,
    shadow + `<path d="M14 34 L86 34 L50 84Z" fill="#8e44ad" stroke="#5e2c74" stroke-width="2"/><path d="M26 40 L74 40 L50 74Z" fill="none" stroke="#f1c40f" stroke-width="2" stroke-dasharray="4 3"/>` + [20, 32, 44, 56, 68, 80].map((x) => `<path d="M${x} 34 L${x} 26" stroke="#f1c40f" stroke-width="2"/>`).join(''),
    shadow + `<rect x="18" y="26" width="64" height="56" rx="12" fill="#c0392b" stroke="#7d2219" stroke-width="2"/><path d="M50 36 L60 54 L50 72 L40 54Z" fill="#f1c40f"/><path d="M50 44 L55 54 L50 64 L45 54Z" fill="#2e6fa8"/>` + [[18, 26], [82, 26], [18, 82], [82, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#f1c40f"/>`).join(''),
    shadow + `<path d="M36 18 L64 18 L70 30 L84 40 L76 52 L68 46 L72 88 L28 88 L32 46 L24 52 L16 40 L30 30Z" fill="#1f8a70" stroke="#145a49" stroke-width="2"/><path d="M50 22 L50 88" stroke="#f1c40f" stroke-width="3"/>` + [32, 42, 52, 62, 72].map((y) => `<circle cx="50" cy="${y}" r="2.2" fill="#f1c40f"/>`).join('') + `<path d="M28 84 L72 84" stroke="#f1c40f" stroke-width="3"/>`,
  ],
};

const GENERATORS: Record<string, string> = {
  menthe: `<path d="M28 58 L72 58 L66 88 L34 88Z" fill="#c8693a" stroke="#8a4220" stroke-width="2"/><rect x="25" y="54" width="50" height="8" rx="3" fill="#d97b48" stroke="#8a4220" stroke-width="2"/>` +
    leaf(50, 54, -150) + leaf(50, 54, -30) + leaf(46, 40, -130) + leaf(54, 40, -50) + leaf(50, 30, -90, '#4fb06a') + leaf(36, 50, -170) + leaf(64, 50, -10),
  pain: `<path d="M14 88 Q14 22 50 22 Q86 22 86 88Z" fill="#d9a066" stroke="#8a5a2c" stroke-width="2"/><path d="M34 88 Q34 58 50 58 Q66 58 66 88Z" fill="#3b2412"/><path d="M38 88 Q40 68 50 70 Q60 68 62 88Z" fill="#f39c12"/><path d="M44 88 Q46 76 50 78 Q54 76 56 88Z" fill="#f7dc6f"/><path d="M26 44 Q50 30 74 44" stroke="#b07a44" stroke-width="2" fill="none"/>`,
  couture: `<rect x="14" y="44" width="72" height="44" rx="4" fill="#8e5a2b" stroke="#5a3616" stroke-width="2"/><path d="M14 44 Q14 24 50 24 Q86 24 86 44Z" fill="#a46a34" stroke="#5a3616" stroke-width="2"/><path d="M14 56 L86 56" stroke="#d4a24c" stroke-width="4"/><rect x="44" y="50" width="12" height="14" rx="2" fill="#d4a24c" stroke="#9a7128" stroke-width="1.5"/><path d="M30 24 L30 88 M70 24 L70 88" stroke="#d4a24c" stroke-width="3"/>`,
};

const ICONS: Record<string, string> = {
  energy: `<path d="M58 6 L22 56 L46 56 L38 94 L78 40 L54 40Z" fill="#f4c430" stroke="#b8860b" stroke-width="4" stroke-linejoin="round"/>`,
  coin: `<circle cx="50" cy="50" r="40" fill="#f1c40f" stroke="#b8860b" stroke-width="5"/><circle cx="50" cy="50" r="28" fill="none" stroke="#d4a017" stroke-width="3"/><path d="M50 32 L56 46 L70 50 L56 54 L50 68 L44 54 L30 50 L44 46Z" fill="#d4a017"/>`,
  star: `<path d="M50 6 L62 38 L96 38 L68 58 L78 92 L50 72 L22 92 L32 58 L4 38 L38 38Z" fill="#f4c430" stroke="#b8860b" stroke-width="4" stroke-linejoin="round"/>`,
  check: `<circle cx="50" cy="50" r="44" fill="#27ae60"/><path d="M28 52 L44 68 L74 34" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  soundOn: `<path d="M14 38 L32 38 L54 18 L54 82 L32 62 L14 62Z" fill="#fff"/><path d="M66 34 Q78 50 66 66 M74 24 Q94 50 74 76" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  soundOff: `<path d="M14 38 L32 38 L54 18 L54 82 L32 62 L14 62Z" fill="#fff"/><path d="M66 36 L90 64 M90 36 L66 64" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
};

// Portraits: women wear a veil and caftan, men a jellaba (hood) or tarbouche.
interface Look { bg: string; robe: string; veil?: string; hood?: string; fez?: boolean; hair?: string; beard?: boolean; child?: boolean; trim: string }
const LOOKS: Record<string, Look> = {
  idriss: { bg: '#2e6fa8', robe: '#f5f0e6', hood: '#d9c49c', hair: '#2b1a10', beard: true, trim: '#d4a24c' },
  sarah: { bg: '#8e44ad', robe: '#1f8a70', veil: '#e79bb5', trim: '#f1c40f' },
  fatima: { bg: '#c0392b', robe: '#6c3483', veil: '#f5f0e6', trim: '#d4a24c' },
  brahim: { bg: '#1f8a70', robe: '#5d6d7e', hood: '#5d6d7e', hair: '#2b1a10', trim: '#f5f0e6' },
  omar: { bg: '#d4a24c', robe: '#8d6e63', fez: true, beard: true, hair: '#555', trim: '#f5f0e6' },
  amr: { bg: '#e67e22', robe: '#3498db', hair: '#2b1a10', child: true, trim: '#f5f0e6' },
  ali: { bg: '#27ae60', robe: '#e74c3c', hair: '#3b2412', child: true, trim: '#f5f0e6' },
};

function portrait(l: Look, mode: 'face' | 'bust' | 'happy' = 'face'): string {
  const s = l.child ? 0.85 : 1;
  const face = `<g transform="translate(50 ${l.child ? 48 : 44}) scale(${s})">`;
  let back = '';
  let top = '';
  if (l.veil) back += `<path d="M-26 6 Q-28 -30 0 -30 Q28 -30 26 6 L30 40 L-30 40Z" fill="${l.veil}" stroke="#0002" stroke-width="1.5"/>`;
  if (l.hood) back += `<path d="M-28 10 Q-30 -26 0 -36 Q30 -26 28 10 L32 40 L-32 40Z" fill="${l.hood}" stroke="#0003" stroke-width="1.5"/>`;
  if (l.hair && !l.veil) top += `<path d="M-19 -6 Q-20 -24 0 -24 Q20 -24 19 -6 Q14 -16 0 -16 Q-14 -16 -19 -6Z" fill="${l.hair}"/>`;
  if (l.fez) top += `<path d="M-14 -16 L-11 -34 L11 -34 L14 -16Z" fill="#c0392b" stroke="#7d2219" stroke-width="1.5"/><path d="M0 -34 Q8 -30 10 -22" stroke="#111" stroke-width="2" fill="none"/>`;
  const beard = l.beard ? `<path d="M-15 2 Q-14 20 0 22 Q14 20 15 2 Q8 12 0 12 Q-8 12 -15 2Z" fill="${l.hair}"/>` : '';
  // Happy: closed smiling eyes, open smile and rosy cheeks.
  const eyes = mode === 'happy'
    ? `<path d="M-9 -3 Q-6 -8 -3 -3 M3 -3 Q6 -8 9 -3" stroke="#2b1a10" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="-6" cy="-4" rx="2.2" ry="2.8" fill="#2b1a10"/><ellipse cx="6" cy="-4" rx="2.2" ry="2.8" fill="#2b1a10"/><circle cx="-5.3" cy="-5" r=".8" fill="#fff"/><circle cx="6.7" cy="-5" r=".8" fill="#fff"/>`;
  const mouth = mode === 'happy'
    ? `<path d="M-8 4 Q0 16 8 4Z" fill="#8a2a1a"/><path d="M-6 5 L6 5 L5 7 L-5 7Z" fill="#fff"/>`
    : `<path d="M-6 6 Q0 10 6 6" stroke="#8a4a2a" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const cheeks = `<circle cx="-11" cy="3" r="3.5" fill="#f08a7a" opacity="${mode === 'happy' ? 0.6 : 0.3}"/><circle cx="11" cy="3" r="3.5" fill="#f08a7a" opacity="${mode === 'happy' ? 0.6 : 0.3}"/>`;
  const head = `<circle cx="0" cy="-2" r="18" fill="#e6b88a"/>` + cheeks + eyes + (l.beard ? '' : mouth);
  const veilFront = l.veil ? `<path d="M-20 -6 Q-21 -24 0 -24 Q21 -24 20 -6 Q20 -20 0 -20 Q-20 -20 -20 -6Z" fill="${l.veil}"/>` : '';
  const after = l.beard ? mouth : '';
  const robe = `<path d="M8 104 Q10 68 50 66 Q90 68 92 104Z" fill="${l.robe}"/><path d="M50 68 L50 104" stroke="${l.trim}" stroke-width="3"/><path d="M40 70 Q50 78 60 70" stroke="${l.trim}" stroke-width="2.5" fill="none"/>`;
  if (mode !== 'face') return face + back + `</g>` + robe + face + head + beard + after + top + veilFront + `</g>`;
  return `<circle cx="50" cy="50" r="48" fill="${l.bg}"/><clipPath id="c"><circle cx="50" cy="50" r="48"/></clipPath><g clip-path="url(#c)">` +
    face + back + `</g><path d="M14 104 Q16 70 50 68 Q84 70 86 104Z" fill="${l.robe}"/><path d="M50 70 L50 100" stroke="${l.trim}" stroke-width="3"/>` +
    face + head + beard + after + top + veilFront + `</g></g><circle cx="50" cy="50" r="47" fill="none" stroke="#fff" stroke-width="3"/>`;
}

// Half-body character for the counter: more detail than the round portrait.
function bust(l: Look, happy: boolean): string {
  const k = l.child ? 0.86 : 1;
  const hx = 50;
  const hy = l.child ? 44 : 40;
  const skin = `<radialGradient id="sk" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f6d3ae"/><stop offset="1" stop-color="#d9a073"/></radialGradient>`;
  const cloth = `<linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>`;
  let out = `<defs>${skin}${cloth}</defs>`;
  // Shoulders and robe.
  const robe = `<path d="M6 100 Q8 70 30 64 Q50 60 70 64 Q92 70 94 100Z" fill="${l.robe}"/>`;
  const trim = l.veil
    ? `<path d="M50 66 L50 100" stroke="${l.trim}" stroke-width="3.5"/>` + [72, 79, 86, 93].map((y) => `<circle cx="50" cy="${y}" r="1.8" fill="${l.trim}"/>`).join('') + `<path d="M36 66 Q50 74 64 66" stroke="${l.trim}" stroke-width="3" fill="none"/>`
    : `<path d="M42 64 L50 78 L58 64" stroke="${l.trim}" stroke-width="3" fill="none"/><path d="M50 78 L50 100" stroke="${l.trim}" stroke-width="2.5"/>`;
  const hoodBack = l.hood || (!l.veil && !l.fez && !l.child) ? `<path d="M26 66 Q22 48 34 44 L66 44 Q78 48 74 66 Q50 74 26 66Z" fill="${l.hood ?? l.robe}"/><path d="M26 66 Q22 48 34 44 L66 44 Q78 48 74 66 Q50 74 26 66Z" fill="url(#cl)"/>` : '';
  const veilBack = l.veil ? `<path d="M${hx - 24} ${hy + 4} Q${hx - 27} ${hy - 26} ${hx} ${hy - 27} Q${hx + 27} ${hy - 26} ${hx + 24} ${hy + 4} L${hx + 32} ${hy + 34} Q${hx} ${hy + 44} ${hx - 32} ${hy + 34}Z" fill="${l.veil}"/><path d="M${hx - 24} ${hy + 4} Q${hx - 27} ${hy - 26} ${hx} ${hy - 27} Q${hx + 27} ${hy - 26} ${hx + 24} ${hy + 4} L${hx + 32} ${hy + 34} Q${hx} ${hy + 44} ${hx - 32} ${hy + 34}Z" fill="url(#cl)"/>` : '';
  out += hoodBack + robe + `<path d="M6 100 Q8 70 30 64 Q50 60 70 64 Q92 70 94 100Z" fill="url(#cl)"/>` + trim + veilBack;
  // Head.
  out += `<g transform="translate(${hx} ${hy}) scale(${k})">`;
  out += `<rect x="-6" y="10" width="12" height="12" fill="#d9a073"/>`;
  if (!l.veil) out += `<ellipse cx="-17" cy="0" rx="3.5" ry="5" fill="#e3ad80"/><ellipse cx="17" cy="0" rx="3.5" ry="5" fill="#e3ad80"/>`;
  out += `<ellipse cx="0" cy="-1" rx="17" ry="19" fill="url(#sk)"/>`;
  if (l.hair && !l.veil) out += `<path d="M-17 -4 Q-19 -24 0 -24 Q19 -24 17 -4 Q16 -14 8 -16 Q2 -12 -6 -16 Q-15 -14 -17 -4Z" fill="${l.hair}"/>`;
  if (l.fez) out += `<path d="M-13 -15 L-10 -32 L10 -32 L13 -15Z" fill="#c0392b"/><ellipse cx="0" cy="-32" rx="10" ry="2.5" fill="#a93226"/><path d="M0 -32 Q9 -28 10 -19" stroke="#222" stroke-width="2" fill="none"/>`;
  // Brows, eyes, nose, cheeks, mouth.
  const brow = l.hair ?? '#5a3a22';
  out += `<path d="M-11 -9 Q-7 -12 -3 -10 M3 -10 Q7 -12 11 -9" stroke="${brow}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  out += happy
    ? `<path d="M-10 -3 Q-7 -8 -3 -3 M3 -3 Q7 -8 10 -3" stroke="#2b1a10" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="-6.5" cy="-3" rx="3.4" ry="3.8" fill="#fff"/><ellipse cx="6.5" cy="-3" rx="3.4" ry="3.8" fill="#fff"/><circle cx="-6" cy="-2.6" r="2.4" fill="#5b3a1e"/><circle cx="7" cy="-2.6" r="2.4" fill="#5b3a1e"/><circle cx="-6" cy="-2.6" r="1.2" fill="#111"/><circle cx="7" cy="-2.6" r="1.2" fill="#111"/><circle cx="-5.2" cy="-3.6" r=".8" fill="#fff"/><circle cx="7.8" cy="-3.6" r=".8" fill="#fff"/>`;
  out += `<path d="M0 0 Q-2 4 0 5" stroke="#b97d55" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  out += `<circle cx="-11" cy="5" r="3.5" fill="#f08a7a" opacity="${happy ? 0.65 : 0.35}"/><circle cx="11" cy="5" r="3.5" fill="#f08a7a" opacity="${happy ? 0.65 : 0.35}"/>`;
  if (l.beard) out += `<path d="M-16 1 Q-15 20 0 22 Q15 20 16 1 Q12 9 7 9 Q0 7 -7 9 Q-12 9 -16 1Z" fill="${l.hair}"/>`;
  out += happy
    ? `<path d="M-7 8 Q0 18 7 8Z" fill="#8a2a1a"/><path d="M-5.5 8.5 L5.5 8.5 L4.5 10.5 L-4.5 10.5Z" fill="#fff"/>`
    : `<path d="M-5 9 Q0 13 5 9" stroke="#8a3a2a" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if (l.veil) out += `<path d="M-19 -2 Q-21 -24 0 -24 Q21 -24 19 -2 Q19 -20 0 -20 Q-19 -20 -19 -2Z" fill="${l.veil}"/><path d="M-19 -2 Q-21 -24 0 -24 Q21 -24 19 -2 Q19 -20 0 -20 Q-19 -20 -19 -2Z" fill="url(#cl)"/><path d="M-17 14 Q0 26 17 14" stroke="${l.veil}" stroke-width="5" fill="none"/>`;
  out += `</g>`;
  return out;
}

// Zellige background tile: eight-pointed stars on deep blue.
const ZELLIGE = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#24507e"/>` +
  [[0, 0], [120, 0], [0, 120], [120, 120], [60, 60]].map(([x, y]) =>
    `<g transform="translate(${x} ${y})"><rect x="-22" y="-22" width="44" height="44" fill="#f3e9d2"/><rect x="-22" y="-22" width="44" height="44" fill="#f3e9d2" transform="rotate(45)"/><circle r="12" fill="#1f8a70"/><circle r="5" fill="#d4a24c"/></g>`).join('') +
  [[60, 0], [0, 60], [120, 60], [60, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#c0392b"/>`).join('') + `</svg>`;

// Interface pieces with their own sizes (board tiles, cards, buttons).
const raw = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const UI: Record<string, string> = {
  tile: raw(96, 96, `<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3f4fb"/></linearGradient></defs>
    <rect x="3" y="6" width="90" height="88" rx="16" fill="#9fd3ea"/><rect x="3" y="3" width="90" height="86" rx="16" fill="url(#t)"/>
    <rect x="8" y="6" width="80" height="18" rx="9" fill="#fff" opacity=".8"/>`),
  tileAlt: raw(96, 96, `<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3fbff"/><stop offset="1" stop-color="#cfeaf6"/></linearGradient></defs>
    <rect x="3" y="6" width="90" height="88" rx="16" fill="#8cc6e0"/><rect x="3" y="3" width="90" height="86" rx="16" fill="url(#t)"/>
    <rect x="8" y="6" width="80" height="18" rx="9" fill="#fff" opacity=".7"/>`),
  tray: raw(220, 96, `<defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dff1fa"/></linearGradient></defs>
    <rect x="2" y="10" width="216" height="84" rx="22" fill="#2a7fb8" opacity=".35"/><rect x="0" y="4" width="220" height="84" rx="22" fill="#3cb4e0"/>
    <rect x="4" y="4" width="212" height="78" rx="20" fill="url(#p)"/><rect x="14" y="8" width="192" height="16" rx="8" fill="#fff"/>`),
  arch: raw(220, 250, `<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7e8"/><stop offset="1" stop-color="#f3dfbd"/></linearGradient></defs>
    <path d="M10 250 L10 110 Q10 30 60 18 Q110 0 160 18 Q210 30 210 110 L210 250Z" fill="#e8bf62"/>
    <path d="M20 250 L20 112 Q20 42 66 30 Q110 14 154 30 Q200 42 200 112 L200 250Z" fill="url(#a)"/>
    <path d="M36 250 L36 118 Q36 60 74 48 Q110 36 146 48 Q184 60 184 118 L184 250Z" fill="#9fdcef" opacity=".55"/>`),
  btnGreen: raw(192, 54, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd38a"/><stop offset="1" stop-color="#1e9a52"/></linearGradient></defs>
    <rect x="0" y="6" width="192" height="48" rx="16" fill="#146b38"/><rect x="0" y="0" width="192" height="48" rx="16" fill="url(#g)"/><rect x="8" y="4" width="176" height="16" rx="8" fill="#fff" opacity=".35"/>`),
  btnGrey: raw(192, 54, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cdb8"/><stop offset="1" stop-color="#b3a58c"/></linearGradient></defs>
    <rect x="0" y="6" width="192" height="48" rx="16" fill="#8c7e66"/><rect x="0" y="0" width="192" height="48" rx="16" fill="url(#g)"/><rect x="8" y="4" width="176" height="16" rx="8" fill="#fff" opacity=".3"/>`),
  pill: raw(230, 60, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dff1fa"/></linearGradient></defs>
    <rect x="2" y="5" width="226" height="54" rx="27" fill="#2a7fb8" opacity=".35"/><rect x="2" y="2" width="226" height="52" rx="26" fill="url(#g)" stroke="#3cb4e0" stroke-width="3"/><rect x="16" y="6" width="198" height="12" rx="6" fill="#fff"/>`),
  rays: raw(256, 256, `<defs><radialGradient id="ry" cx="128" cy="128" r="128" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="#fff6c2" stop-opacity="1"/><stop offset=".55" stop-color="#ffd54a" stop-opacity=".75"/><stop offset="1" stop-color="#ffb300" stop-opacity="0"/></radialGradient>
    <radialGradient id="c"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="#ffe680" stop-opacity=".8"/><stop offset="1" stop-color="#ffd54a" stop-opacity="0"/></radialGradient></defs><path d="M128 128 L255.0 112.4 L255.0 143.6Z" fill="url(#ry)"/><path d="M128 128 L245.8 178.0 L230.2 205.0Z" fill="url(#ry)"/><path d="M128 128 L205.0 230.2 L178.0 245.8Z" fill="url(#ry)"/><path d="M128 128 L143.6 255.0 L112.4 255.0Z" fill="url(#ry)"/><path d="M128 128 L78.0 245.8 L51.0 230.2Z" fill="url(#ry)"/><path d="M128 128 L25.8 205.0 L10.2 178.0Z" fill="url(#ry)"/><path d="M128 128 L1.0 143.6 L1.0 112.4Z" fill="url(#ry)"/><path d="M128 128 L10.2 78.0 L25.8 51.0Z" fill="url(#ry)"/><path d="M128 128 L51.0 25.8 L78.0 10.2Z" fill="url(#ry)"/><path d="M128 128 L112.4 1.0 L143.6 1.0Z" fill="url(#ry)"/><path d="M128 128 L178.0 10.2 L205.0 25.8Z" fill="url(#ry)"/><path d="M128 128 L230.2 51.0 L245.8 78.0Z" fill="url(#ry)"/><circle cx="128" cy="128" r="70" fill="url(#c)"/>`),
  sparkle: raw(32, 32, `<path d="M16 0 L19 13 L32 16 L19 19 L16 32 L13 19 L0 16 L13 13Z" fill="#fff6c8"/><circle cx="16" cy="16" r="4" fill="#fff"/>`),
  glowGreen: raw(128, 128, `<defs><radialGradient id="r"><stop offset=".3" stop-color="#1ec760" stop-opacity=".85"/><stop offset=".62" stop-color="#27ae60" stop-opacity=".55"/><stop offset="1" stop-color="#27ae60" stop-opacity="0"/></radialGradient></defs><rect x="6" y="6" width="116" height="116" rx="26" fill="url(#r)"/><rect x="10" y="10" width="108" height="108" rx="22" fill="none" stroke="#27ae60" stroke-width="5" opacity=".9"/>`),
  glow: raw(128, 128, `<defs><radialGradient id="r"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs><circle cx="64" cy="64" r="64" fill="url(#r)"/>`),
};

// Riad courtyard behind the game: sky, horseshoe arches, zellige wainscot.
const COURTYARD = raw(720, 1280, `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc3ea"/><stop offset=".5" stop-color="#8fdcf2"/><stop offset="1" stop-color="#bfeaf7"/></linearGradient>
  <pattern id="z" width="90" height="90" patternUnits="userSpaceOnUse"><g fill="none" stroke="#fff" stroke-width="2" opacity=".35"><rect x="25" y="25" width="40" height="40"/><rect x="25" y="25" width="40" height="40" transform="rotate(45 45 45)"/><circle cx="45" cy="45" r="9"/></g></pattern></defs>
  <rect width="720" height="1280" fill="url(#sky)"/><rect width="720" height="1280" fill="url(#z)"/>`);

export function artEntries(): [string, string][] {
  const out: [string, string][] = [['zellige', ZELLIGE], ['courtyard', COURTYARD]];
  for (const [k, b] of Object.entries(UI)) out.push([k, b]);
  for (const [chain, list] of Object.entries(ITEMS)) list.forEach((b, i) => out.push([`${chain}-${i + 1}`, svg(b)]));
  for (const [chain, b] of Object.entries(GENERATORS)) out.push([`gen-${chain}`, svg(b)]);
  for (const [k, b] of Object.entries(ICONS)) out.push([`icon-${k}`, svg(b, 64)]);
  for (const [k, l] of Object.entries(LOOKS)) {
    out.push([`face-${k}`, svg(portrait(l), 120)]);
    out.push([`bust-${k}`, svg(bust(l, false), 200)]);
    out.push([`happy-${k}`, svg(bust(l, true), 200)]);
  }
  return out;
}
