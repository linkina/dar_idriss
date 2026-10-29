import { H } from './ui';

// All game art is drawn here as small SVGs, turned into textures at boot.

// Lighting filter that gives flat shapes volume: soft diffuse shading,
// a specular highlight from the top left, and a drop shadow.
const FX = `<defs><filter id="fx" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur"/>
<feDiffuseLighting in="blur" surfaceScale="5" diffuseConstant="1.05" lighting-color="#fff" result="diff"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>
<feColorMatrix in="SourceGraphic" type="saturate" values="1.6" result="sat"/>
<feComposite in="sat" in2="diff" operator="arithmetic" k1="1.28" k2="0" k3="0" k4="0" result="shaded"/>
<feSpecularLighting in="blur" surfaceScale="5" specularConstant=".85" specularExponent="22" lighting-color="#fff" result="spec"><fePointLight x="20" y="5" z="70"/></feSpecularLighting>
<feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>
<feComposite in="shaded" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".75" k4="0" result="lit"/>
<feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="sb"/><feOffset in="sb" dx="1.5" dy="4" result="so"/>
<feFlood flood-color="#2b1606" flood-opacity=".38"/><feComposite in2="so" operator="in" result="shadow"/>
<feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="dil"/><feFlood flood-color="#24140a"/><feComposite in2="dil" operator="in" result="outline"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="litIn"/></feMerge></filter></defs>`;

const INK_LINE = '#24140a';

// Cartoon line art: every solid shape gets a crisp dark contour. Highlights
// (shapes with opacity) and tiny dots are left as they are.
const inkLines = (body: string) =>
  body.replace(/<(path|rect|ellipse|circle|polygon)\b([^>]*?)\/>/g, (tag, name: string, attrs: string) => {
    const fill = /\bfill="([^"]*)"/.exec(attrs)?.[1];
    if (!fill || fill === 'none' || /\bopacity=/.test(attrs)) return tag;
    const r = Number(/\br="([\d.]+)"/.exec(attrs)?.[1] ?? /\brx="([\d.]+)"/.exec(attrs)?.[1] ?? 99);
    if ((name === 'circle' || name === 'ellipse') && r < 3) return tag;
    const width = Math.max(2.2, Number(/\bstroke-width="([\d.]+)"/.exec(attrs)?.[1] ?? 0));
    const rest = attrs.replace(/\s*\bstroke(-width|-linejoin)?="[^"]*"/g, '');
    return `<${name}${rest} stroke="${INK_LINE}" stroke-width="${width}" stroke-linejoin="round"/>`;
  });

const svg = (body: string, size = 128, fx = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${fx ? FX + `<g filter="url(#fx)">${inkLines(body)}</g>` : body}</svg>`;

const leaf = (x: number, y: number, r: number, c = '#3f9b5a') =>
  `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 C8 -10 22 -10 28 0 C22 10 8 10 0 0Z" fill="${c}" stroke="#25663a" stroke-width="1.5"/><path d="M2 0 L24 0" stroke="#25663a" stroke-width="1.2"/></g>`;

const shadow = '';

const ITEMS: Record<string, string[]> = {
  menthe: [
    shadow + `<g transform="translate(50 55) scale(2) translate(-50 -55)">` + leaf(36, 60, -30, '#4fb06a') + `</g>`,
    `<path d="M50 70 L50 26" stroke="#25663a" stroke-width="3"/>` + leaf(50, 52, -150) + leaf(50, 52, -30) + leaf(50, 38, -150) + leaf(50, 38, -30) + leaf(50, 26, -90, '#4fb06a') + `<path d="M36 62 L64 62 L60 90 L40 90Z" fill="#2f80ed" opacity=".92"/><path d="M38 66 L62 66" stroke="#9cc8ff" stroke-width="3"/><path d="M42 70 L44 86" stroke="#fff" stroke-width="2" opacity=".6"/>`,
    shadow + `<path d="M40 85 L46 40 M50 85 L50 30 M60 85 L56 40" stroke="#25663a" stroke-width="3"/>` + leaf(46, 45, -160) + leaf(54, 45, -20) + leaf(50, 32, -110) + leaf(50, 32, -70) + leaf(40, 58, -170) + leaf(60, 58, -10) + `<rect x="40" y="70" width="20" height="8" rx="2" fill="#c0392b"/>` + `<path d="M30 60 L70 60 L56 92 L44 92Z" fill="#9b59b6"/><path d="M30 60 L50 70 L70 60" fill="none" stroke="#d7b4f3" stroke-width="3"/><path d="M42 78 Q50 72 58 78" stroke="#f1c40f" stroke-width="3" fill="none"/>`,
    shadow + `<path d="M34 30 L66 30 L60 86 L40 86Z" fill="#f3c86b" opacity=".85" stroke="#b8862f" stroke-width="2"/><path d="M34 30 L66 30 L65 40 L35 40Z" fill="#fff" opacity=".5"/><path d="M38 52 L62 52" stroke="#d4a24c" stroke-width="3"/><path d="M39 62 L61 62" stroke="#d4a24c" stroke-width="2"/>` + leaf(50, 30, -60),
    shadow + `<path d="M30 80 Q28 50 50 46 Q72 50 70 80Z" fill="#cfd5dc" stroke="#7d8793" stroke-width="2"/><path d="M70 62 Q86 56 88 40" stroke="#7d8793" stroke-width="4" fill="none"/><path d="M30 58 Q16 60 18 72 Q24 78 30 74" stroke="#7d8793" stroke-width="4" fill="none"/><path d="M38 46 Q50 22 62 46Z" fill="#d4a24c" stroke="#9a7128" stroke-width="2"/><circle cx="50" cy="26" r="4" fill="#d4a24c"/><path d="M32 66 L68 66" stroke="#d4a24c" stroke-width="3"/>`,
    shadow + `<ellipse cx="50" cy="76" rx="42" ry="12" fill="#d4a24c" stroke="#9a7128" stroke-width="2"/><ellipse cx="50" cy="73" rx="36" ry="8" fill="#e8bf62"/><path d="M38 72 Q37 52 50 50 Q63 52 62 72Z" fill="#cfd5dc" stroke="#7d8793" stroke-width="2"/><path d="M44 50 Q50 38 56 50Z" fill="#d4a24c"/><path d="M62 62 Q72 58 72 48" stroke="#7d8793" stroke-width="3" fill="none"/><path d="M18 74 L24 60 L32 60 L30 74Z" fill="#ff5fa2" stroke="#b03070" stroke-width="1.5"/><path d="M70 74 L68 60 L76 60 L82 74Z" fill="#ff5fa2" stroke="#b8862f" stroke-width="1.5"/>`,
  ],
  pain: [
    shadow + `<path d="M50 88 L50 30" stroke="#b8862f" stroke-width="3"/>` + [30, 40, 50, 60].map((y) => `<ellipse cx="44" cy="${y}" rx="5" ry="8" fill="#ffc928" transform="rotate(-25 44 ${y})"/><ellipse cx="56" cy="${y}" rx="5" ry="8" fill="#ffc928" transform="rotate(25 56 ${y})"/>`).join(''),
    shadow + `<path d="M28 86 Q24 50 34 36 L66 36 Q76 50 72 86Z" fill="#efe3c8" stroke="#a89470" stroke-width="2"/><path d="M34 36 Q50 26 66 36" fill="#efe3c8" stroke="#a89470" stroke-width="2"/><path d="M36 34 L64 34" stroke="#c0392b" stroke-width="4"/><circle cx="50" cy="62" r="10" fill="none" stroke="#e8902a" stroke-width="2"/><path d="M45 62 L55 62 M50 57 L50 67" stroke="#e8902a" stroke-width="2"/>`,
    shadow + `<path d="M14 60 L86 60 Q84 90 50 92 Q16 90 14 60Z" fill="#1abc9c"/><ellipse cx="50" cy="60" rx="36" ry="8" fill="#117a65"/><ellipse cx="50" cy="52" rx="30" ry="20" fill="#f6e7c8" stroke="#c9ad7c" stroke-width="2"/><ellipse cx="42" cy="44" rx="10" ry="5" fill="#fff" opacity=".6"/>`,
    shadow + `<ellipse cx="50" cy="62" rx="36" ry="24" fill="#e8902a" stroke="#8a5a22" stroke-width="2"/><ellipse cx="50" cy="58" rx="30" ry="18" fill="#ffb347"/>` + [[40, 52], [56, 50], [48, 62], [62, 62], [36, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#5e3a14"/>`).join(''),
    shadow + `<rect x="10" y="30" width="80" height="62" rx="8" fill="#ff5fa2" transform="rotate(8 50 60)"/><path d="M16 40 L84 48 M14 80 L82 88" stroke="#fff" stroke-width="3" transform="rotate(8 50 60)"/><rect x="22" y="36" width="56" height="48" rx="6" fill="#ffbf4d" stroke="#9a6a2a" stroke-width="2" transform="rotate(-6 50 60)"/><path d="M30 50 L72 46 M30 62 L72 58 M30 74 L72 70 M42 40 L44 82 M58 38 L60 80" stroke="#b9823a" stroke-width="2" transform="rotate(-6 50 60)"/>`,
    shadow + `<ellipse cx="50" cy="72" rx="42" ry="14" fill="#2e6fa8" stroke="#1d4a73" stroke-width="2"/><ellipse cx="50" cy="70" rx="34" ry="9" fill="#fff"/>` + [[34, 62], [50, 58], [66, 62], [42, 70], [58, 70]].map(([x, y]) => `<path d="M${x - 10} ${y} Q${x} ${y - 14} ${x + 10} ${y} Q${x} ${y - 6} ${x - 10} ${y}Z" fill="#f4dfb2" stroke="#c9a46a" stroke-width="1.5"/>`).join(''),
  ],
  couture: [
    shadow + `<path d="M28 70 C20 40 60 30 50 55 C42 75 80 70 74 44" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="74" cy="42" r="3" fill="#c0392b"/>`,
    shadow + `<rect x="34" y="24" width="32" height="8" rx="2" fill="#a0703a"/><rect x="34" y="76" width="32" height="8" rx="2" fill="#a0703a"/><rect x="38" y="32" width="24" height="44" fill="#f1c40f"/>` + [38, 46, 54, 62, 70].map((y) => `<path d="M38 ${y} L62 ${y - 3}" stroke="#c79a00" stroke-width="1.5"/>`).join(''),
    shadow + `<path d="M18 74 L50 84 L82 74 L82 62 L50 72 L18 62Z" fill="#2e6fa8"/><path d="M18 62 L50 72 L82 62 L82 50 L50 60 L18 50Z" fill="#e2a33b"/><path d="M18 50 L50 60 L82 50 L50 40Z" fill="#3f9b5a"/><path d="M30 50 L50 44 L70 50" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>`,
    shadow + `<path d="M14 34 L86 34 L50 84Z" fill="#8e44ad" stroke="#5e2c74" stroke-width="2"/><path d="M26 40 L74 40 L50 74Z" fill="none" stroke="#f1c40f" stroke-width="2" stroke-dasharray="4 3"/>` + [20, 32, 44, 56, 68, 80].map((x) => `<path d="M${x} 34 L${x} 26" stroke="#f1c40f" stroke-width="2"/>`).join(''),
    shadow + `<rect x="18" y="26" width="64" height="56" rx="12" fill="#ff8c1a" stroke="#b35f00" stroke-width="2"/><path d="M50 36 L60 54 L50 72 L40 54Z" fill="#f1c40f"/><path d="M50 44 L55 54 L50 64 L45 54Z" fill="#2e6fa8"/>` + [[18, 26], [82, 26], [18, 82], [82, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#f1c40f"/>`).join(''),
    shadow + `<path d="M36 18 L64 18 L70 30 L84 40 L76 52 L68 46 L72 88 L28 88 L32 46 L24 52 L16 40 L30 30Z" fill="#1f8a70" stroke="#145a49" stroke-width="2"/><path d="M50 22 L50 88" stroke="#f1c40f" stroke-width="3"/>` + [32, 42, 52, 62, 72].map((y) => `<circle cx="50" cy="${y}" r="2.2" fill="#f1c40f"/>`).join('') + `<path d="M28 84 L72 84" stroke="#f1c40f" stroke-width="3"/>`,
  ],
  souk: [
    `<ellipse cx="50" cy="55" rx="16" ry="26" fill="#9b2d14" transform="rotate(20 50 55)"/><ellipse cx="44" cy="46" rx="4" ry="9" fill="#e8835f" transform="rotate(20 44 46)"/><path d="M44 36 Q50 32 54 38" stroke="#e8835f" stroke-width="3" fill="none"/>`,
    [[36, 58, -20], [52, 50, 10], [64, 62, 30]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="19" fill="#c9781e" transform="rotate(${r} ${x} ${y})"/><ellipse cx="${x - 3}" cy="${y - 6}" rx="3" ry="7" fill="#ffd08a" transform="rotate(${r} ${x} ${y})"/>`).join(''),
    `<path d="M18 52 L82 52 Q80 82 50 84 Q20 82 18 52Z" fill="#2e6fa8"/><path d="M24 60 L76 60" stroke="#f1c40f" stroke-width="3"/>` + [[32, 48, '#e67e22'], [46, 44, '#d4a24c'], [60, 47, '#e67e22'], [70, 50, '#c0392b'], [40, 52, '#d4a24c'], [54, 52, '#8e5a2b']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="${c}"/>`).join(''),
    `<path d="M30 46 Q26 84 50 86 Q74 84 70 46Z" fill="#16a085"/><path d="M32 62 Q50 56 68 62" stroke="#f1c40f" stroke-width="3" fill="none"/><rect x="26" y="40" width="48" height="10" rx="4" fill="#1abc9c"/>` + [[38, 38], [50, 34], [62, 38], [44, 30], [56, 30]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="7" fill="#6b8e23"/>`).join(''),
    `<path d="M22 86 Q16 56 28 44 L72 44 Q84 56 78 86Z" fill="#f5d142"/><path d="M28 44 Q50 54 72 44" stroke="#8a6a3a" stroke-width="2" fill="none"/><path d="M30 46 Q50 14 70 46Z" fill="#e67e22"/><path d="M40 40 Q50 26 60 40" fill="#c0392b"/>`,
    `<path d="M16 50 L84 50 L76 86 L24 86Z" fill="#c69c5d"/><path d="M20 62 L80 62 M22 74 L78 74" stroke="#8a6a3a" stroke-width="2"/><path d="M24 50 Q50 10 76 50" stroke="#8a6a3a" stroke-width="4" fill="none"/>` + [[32, 46, '#7a3e1d'], [44, 42, '#6b8e23'], [56, 44, '#d35400'], [68, 46, '#7a3e1d'], [50, 48, '#f1c40f']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/>`).join(''),
  ],
  poterie: [
    `<path d="M24 76 Q20 50 40 44 Q54 34 68 46 Q84 56 76 76Z" fill="#b5532a"/><path d="M36 54 Q46 48 56 52" stroke="#d97b48" stroke-width="3" fill="none"/>`,
    `<path d="M22 52 L78 52 Q76 80 50 82 Q24 80 22 52Z" fill="#ffffff"/><ellipse cx="50" cy="52" rx="28" ry="6" fill="#2471d6"/><path d="M28 62 L72 62" stroke="#2471d6" stroke-width="4"/><path d="M36 70 l4 4 4 -4 4 4 4 -4 4 4 4 -4" stroke="#2471d6" stroke-width="2" fill="none"/>`,
    `<path d="M40 22 L60 22 L58 32 Q78 44 74 66 Q70 86 50 88 Q30 86 26 66 Q22 44 42 32Z" fill="#1abc9c"/><path d="M30 56 L70 56 M28 64 L72 64" stroke="#f1c40f" stroke-width="3"/><ellipse cx="50" cy="22" rx="10" ry="3" fill="#117a65"/>`,
    `<ellipse cx="50" cy="78" rx="38" ry="9" fill="#f1c40f"/><path d="M18 76 Q30 30 50 22 Q70 30 82 76Z" fill="#1d4fd8"/><path d="M26 64 Q50 56 74 64" stroke="#ffffff" stroke-width="3" fill="none"/><path d="M34 50 Q50 44 66 50" stroke="#ffffff" stroke-width="3" fill="none"/><circle cx="50" cy="22" r="5" fill="#f1c40f"/>`,
    `<ellipse cx="50" cy="56" rx="40" ry="30" fill="#f3e9d2" stroke="#2e6fa8" stroke-width="4"/><ellipse cx="50" cy="56" rx="26" ry="19" fill="none" stroke="#1f8a70" stroke-width="3"/><path d="M50 40 L56 56 L50 72 L44 56Z M34 56 L50 50 L66 56 L50 62Z" fill="#f1c40f"/>`,
    `<path d="M36 16 L64 16 L60 26 Q86 40 80 64 Q74 88 50 90 Q26 88 20 64 Q14 40 40 26Z" fill="#1e9e4a"/><path d="M24 50 Q50 40 76 50 M22 66 Q50 58 78 66" stroke="#f1c40f" stroke-width="3" fill="none"/><path d="M50 52 L56 60 L50 68 L44 60Z" fill="#fff"/><ellipse cx="50" cy="16" rx="14" ry="4" fill="#146b38"/>`,
  ],
  orangers: [
    [0, 72, 144, 216, 288].map((r) => `<ellipse cx="50" cy="34" rx="11" ry="17" fill="#fffaf0" stroke="#e8dcc0" stroke-width="1.5" transform="rotate(${r} 50 52)"/>`).join('') + `<circle cx="50" cy="52" r="7" fill="#f1c40f"/>`,
    `<circle cx="50" cy="56" r="28" fill="#f39c12"/><circle cx="42" cy="46" r="7" fill="#fff" opacity=".35"/>` + leaf(50, 30, -50),
    `<path d="M14 30 Q50 20 86 34" stroke="#6b4423" stroke-width="5" fill="none"/>` + leaf(30, 26, -120) + leaf(64, 26, -60) + [[30, 52], [52, 60], [72, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#f39c12"/><path d="M${x} ${y - 15} L${x} ${y - 24}" stroke="#6b4423" stroke-width="2"/>`).join(''),
    `<ellipse cx="50" cy="90" rx="32" ry="7" fill="#ff5fa2"/><path d="M44 10 L52 40" stroke="#e74c3c" stroke-width="4"/><path d="M32 24 L68 24 L62 88 L38 88Z" fill="#f39c12" opacity=".9"/><path d="M32 24 L68 24 L67 34 L33 34Z" fill="#fff" opacity=".45"/><circle cx="66" cy="26" r="13" fill="#f7c04a" stroke="#e67e22" stroke-width="2"/><path d="M66 13 L66 39 M53 26 L79 26" stroke="#e67e22" stroke-width="1.5"/>`,
    `<path d="M44 14 L56 14 L56 34 Q76 42 74 66 Q72 88 50 88 Q28 88 26 66 Q24 42 44 34Z" fill="#5dade2" opacity=".9"/><rect x="42" y="8" width="16" height="9" rx="2" fill="#d4a24c"/><path d="M32 60 Q50 54 68 60" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/>` + [0, 72, 144, 216, 288].map((r) => `<ellipse cx="50" cy="62" rx="4" ry="7" fill="#fff" transform="rotate(${r} 50 70)"/>`).join(''),
    `<path d="M14 52 L86 52 L78 86 L22 86Z" fill="#c69c5d"/><path d="M18 64 L82 64 M20 76 L80 76" stroke="#8a6a3a" stroke-width="2"/>` + [[30, 44, '#f39c12'], [48, 40, '#f1c40f'], [66, 44, '#f39c12'], [40, 50, '#f39c12'], [58, 50, '#f1c40f']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/>`).join('') + leaf(70, 34, -40),
  ],
  cuivre: [
    `<rect x="22" y="28" width="56" height="48" rx="4" fill="#d9735b" transform="rotate(-8 50 52)"/><path d="M28 36 L70 30" stroke="#ffb4a0" stroke-width="3" transform="rotate(-8 50 52)"/>`,
    `<path d="M32 26 L68 26 L62 82 L38 82Z" fill="#f0802a"/><path d="M34 34 L66 34" stroke="#f0a868" stroke-width="3"/><path d="M35 50 L65 50 L64 62 L36 62Z" fill="#1abc9c"/><ellipse cx="50" cy="26" rx="18" ry="4" fill="#b4501a"/>`,
    `<path d="M50 10 L50 20" stroke="#b4501a" stroke-width="3"/><path d="M36 30 L64 30 L58 20 L42 20Z" fill="#f0802a"/><path d="M34 30 L66 30 L62 76 L38 76Z" fill="#f7dc6f"/><path d="M34 30 L66 30 L62 76 L38 76Z M50 30 L50 76" fill="none" stroke="#f0802a" stroke-width="3"/><path d="M36 76 L64 76 L58 86 L42 86Z" fill="#f0802a"/>`,
    `<path d="M50 8 L50 18" stroke="#b4501a" stroke-width="3"/><path d="M50 18 Q30 30 30 52 Q30 76 50 86 Q70 76 70 52 Q70 30 50 18Z" fill="#f0802a"/>` + [[42, 40], [58, 40], [50, 50], [40, 60], [60, 60], [50, 70], [44, 76], [56, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ff4d6d"/>`).join(''),
    `<ellipse cx="50" cy="56" rx="42" ry="28" fill="#c9a227"/><ellipse cx="50" cy="54" rx="36" ry="22" fill="#f5d142"/><ellipse cx="50" cy="54" rx="24" ry="14" fill="none" stroke="#b4501a" stroke-width="2"/><path d="M50 42 L56 54 L50 66 L44 54Z M30 54 L50 48 L70 54 L50 60Z" fill="none" stroke="#b4501a" stroke-width="2"/>`,
    `<path d="M50 6 L50 22" stroke="#b4501a" stroke-width="3"/><path d="M30 30 Q50 18 70 30 L76 46 L24 46Z" fill="#f0802a"/>` + [18, 34, 50, 66, 82].map((x) => `<path d="M${x} 50 L${x} 62" stroke="#b4501a" stroke-width="2"/><path d="M${x - 6} 62 L${x + 6} 62 L${x + 4} 78 L${x - 4} 78Z" fill="${['#2ecc71', '#e74c3c', '#3498db', '#f1c40f', '#9b59b6'][(x - 18) / 16]}" stroke="#f0802a" stroke-width="2"/>`).join('') + `<path d="M14 48 Q50 56 86 48" stroke="#f0802a" stroke-width="4" fill="none"/>`,
  ],
  hammam: [
    `<ellipse cx="50" cy="66" rx="34" ry="14" fill="#1abc9c"/><ellipse cx="50" cy="62" rx="28" ry="10" fill="#3b2412"/><ellipse cx="42" cy="58" rx="8" ry="3" fill="#6b4a35"/>`,
    `<path d="M30 86 L30 40 Q30 22 46 22 Q60 22 62 36 L70 34 Q80 36 76 48 L68 52 L68 86Z" fill="#27ae60"/><path d="M30 78 L68 78" stroke="#f1c40f" stroke-width="5"/>` + [36, 46, 56].map((y) => `<path d="M34 ${y} L64 ${y}" stroke="#1e8449" stroke-width="2"/>`).join(''),
    `<rect x="18" y="40" width="64" height="40" rx="8" fill="#f5f0e6"/><rect x="18" y="40" width="64" height="12" rx="6" fill="#fff"/><path d="M18 60 L82 60 M18 68 L82 68" stroke="#ff5fa2" stroke-width="5"/>`,
    `<path d="M28 40 Q24 82 50 84 Q76 82 72 40Z" fill="#8e44ad"/><ellipse cx="50" cy="40" rx="22" ry="6" fill="#5e2c74"/><ellipse cx="50" cy="40" rx="18" ry="4" fill="#9e9e9e"/><path d="M34 60 Q50 54 66 60" stroke="#f3e2c0" stroke-width="2" fill="none"/>`,
    `<rect x="16" y="44" width="68" height="40" rx="4" fill="#8e5a2b"/><path d="M16 56 L84 56" stroke="#d4a24c" stroke-width="3"/>` + [[28, '#5dade2'], [44, '#e79bb5'], [60, '#f1c40f'], [74, '#1f8a70']].map(([x, c]) => `<rect x="${(x as number) - 5}" y="24" width="10" height="24" rx="3" fill="${c}"/><rect x="${(x as number) - 3}" y="18" width="6" height="7" fill="#d4a24c"/>`).join(''),
    `<path d="M22 40 L78 40 L70 84 L30 84Z" fill="#f0802a"/><ellipse cx="50" cy="40" rx="28" ry="7" fill="#b4501a"/><ellipse cx="50" cy="40" rx="24" ry="5" fill="#5dade2"/><path d="M26 56 L74 56 M28 70 L72 70" stroke="#f0a868" stroke-width="3"/><path d="M22 44 Q12 60 30 66" stroke="#b4501a" stroke-width="4" fill="none"/>`,
  ],
};

const GENERATORS: Record<string, string> = {
  menthe: `<path d="M24 56 L76 56 L68 92 L32 92Z" fill="#c8693a"/><rect x="20" y="50" width="60" height="10" rx="4" fill="#e07a45"/><path d="M27 68 L73 68 L71 78 L29 78Z" fill="#1f6fb2"/>` + [32, 42, 52, 62].map((x) => `<path d="M${x} 73 l4 -4 4 4 -4 4Z" fill="#f1c40f"/>`).join('') + `<ellipse cx="50" cy="52" rx="26" ry="5" fill="#4a2c17"/>` + leaf(50, 50, -150) + leaf(50, 50, -30) + leaf(44, 38, -130) + leaf(56, 38, -50) + leaf(50, 26, -90, '#4fb06a') + leaf(34, 46, -170) + leaf(66, 46, -10) + leaf(40, 30, -115, '#4fb06a') + leaf(60, 30, -65, '#4fb06a'),
  pain: `<path d="M10 90 Q10 20 50 18 Q90 20 90 90Z" fill="#c97b45"/>` + [[22, 40], [40, 32], [60, 32], [78, 40], [16, 58], [34, 52], [66, 52], [84, 58], [16, 76], [84, 76]].map(([x, y]) => `<rect x="${x - 8}" y="${y - 4}" width="16" height="8" rx="2" fill="#a85e30"/>`).join('') + `<path d="M32 90 Q32 56 50 56 Q68 56 68 90Z" fill="#2b160a"/><path d="M36 90 Q38 64 50 66 Q62 64 64 90Z" fill="#ff7a1a"/><path d="M42 90 Q44 72 50 74 Q56 72 58 90Z" fill="#ffd84a"/><rect x="62" y="74" width="34" height="5" rx="2" fill="#8e5a2b" transform="rotate(-20 62 76)"/>`,
  couture: `<rect x="12" y="46" width="76" height="44" rx="5" fill="#8e5a2b"/><path d="M12 46 Q12 22 50 22 Q88 22 88 46Z" fill="#a46a34" transform="rotate(-14 12 46)"/><path d="M18 46 Q30 30 44 40 Q56 26 70 38 Q80 30 84 46Z" fill="#e74c3c"/><path d="M30 46 Q40 36 52 44 L60 46Z" fill="#f1c40f"/><path d="M12 58 L88 58" stroke="#d4a24c" stroke-width="4"/>` + [24, 50, 76].map((x) => `<path d="M${x} 66 l6 6 -6 6 -6 -6Z" fill="#d4a24c"/>`).join('') + `<rect x="44" y="52" width="12" height="12" rx="2" fill="#f4c430"/>`,
  souk: `<path d="M10 48 L90 48 L80 92 L20 92Z" fill="#d9a95f"/>` + [56, 64, 72, 80, 88].map((y) => `<path d="M14 ${y} L86 ${y}" stroke="#9c6b2f" stroke-width="2"/>`).join('') + [24, 36, 48, 60, 72].map((x) => `<path d="M${x} 50 L${x + 4} 92" stroke="#b5843f" stroke-width="2"/>`).join('') + `<path d="M20 48 Q50 0 80 48" stroke="#9c6b2f" stroke-width="7" fill="none"/>` + [[24, 44, '#9b2d14'], [36, 38, '#6b8e23'], [50, 36, '#f39c12'], [64, 38, '#e74c3c'], [76, 44, '#f1c40f'], [44, 46, '#c9781e'], [58, 46, '#16a085']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`).join(''),
  poterie: `<rect x="20" y="76" width="60" height="16" rx="4" fill="#8e5a2b"/><ellipse cx="50" cy="74" rx="38" ry="9" fill="#7f8c8d"/><ellipse cx="50" cy="71" rx="34" ry="7" fill="#aab7b8"/><path d="M32 70 Q26 44 40 36 L60 36 Q74 44 68 70Z" fill="#c8693a"/><ellipse cx="50" cy="36" rx="10" ry="3" fill="#8a4220"/><path d="M33 52 Q50 46 67 52 M34 60 Q50 54 66 60" stroke="#e08a5a" stroke-width="2" fill="none"/><path d="M14 64 Q8 54 16 46 M86 64 Q92 54 84 46" stroke="#3cb4e0" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  orangers: `<path d="M32 70 L68 70 L62 92 L38 92Z" fill="#c8693a"/><rect x="28" y="66" width="44" height="8" rx="3" fill="#e07a45"/><path d="M50 68 L50 46 M50 56 L40 46 M50 54 L60 44" stroke="#6b4423" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="32" r="26" fill="#2e8b57"/><circle cx="34" cy="38" r="14" fill="#3f9b5a"/><circle cx="66" cy="38" r="14" fill="#3f9b5a"/><circle cx="42" cy="22" r="12" fill="#4fb06a"/>` + [[36, 40], [58, 24], [64, 42], [46, 48], [30, 28], [52, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#ff9f1a"/>`).join('') + [[40, 30], [60, 36]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join(''),
  cuivre: `<path d="M18 52 L82 52 L74 64 L26 64Z" fill="#5d6d7e"/><path d="M38 64 L62 64 L58 86 L42 86Z" fill="#4a5a6a"/><rect x="28" y="84" width="44" height="6" rx="2" fill="#34495e"/><path d="M60 46 L82 22" stroke="#8e5a2b" stroke-width="5" stroke-linecap="round"/><rect x="70" y="12" width="22" height="12" rx="3" fill="#f0802a" transform="rotate(42 81 18)"/><rect x="30" y="44" width="22" height="8" rx="2" fill="#f0802a"/>`,
  hammam: `<path d="M14 90 L14 44 Q14 14 50 12 Q86 14 86 44 L86 90Z" fill="#d9c49c"/><path d="M24 90 L24 46 Q24 24 50 22 Q76 24 76 46 L76 90Z" fill="#3cb4e0" opacity=".6"/>` + [36, 50, 64].map((x) => `<path d="M${x} 74 Q${x - 6} 62 ${x} 52 Q${x + 6} 42 ${x} 32" stroke="#fff" stroke-width="4" fill="none" opacity=".85" stroke-linecap="round"/>`).join('') + `<path d="M28 86 L72 86 L68 78 L32 78Z" fill="#f0802a"/>`,
};

const ICONS: Record<string, string> = {
  energy: `<path d="M58 6 L22 56 L46 56 L38 94 L78 40 L54 40Z" fill="#f4c430" stroke="#b8860b" stroke-width="4" stroke-linejoin="round"/>`,
  coin: `<circle cx="50" cy="50" r="40" fill="#f1c40f" stroke="#b8860b" stroke-width="5"/><circle cx="50" cy="50" r="28" fill="none" stroke="#d4a017" stroke-width="3"/><path d="M50 32 L56 46 L70 50 L56 54 L50 68 L44 54 L30 50 L44 46Z" fill="#d4a017"/>`,
  star: `<path d="M50 6 L62 38 L96 38 L68 58 L78 92 L50 72 L22 92 L32 58 L4 38 L38 38Z" fill="#f4c430" stroke="#b8860b" stroke-width="4" stroke-linejoin="round"/>`,
  dirham: `<path d="M50 6 L86 28 L86 72 L50 94 L14 72 L14 28Z" fill="#1abc9c" stroke="#117a65" stroke-width="5"/><path d="M50 6 L86 28 L50 50 L14 28Z" fill="#76f0d0"/><path d="M50 50 L86 72 L50 94Z" fill="#13967d"/><path d="M50 30 L55 44 L70 44 L58 53 L62 68 L50 59 L38 68 L42 53 L30 44 L45 44Z" fill="#f4c430"/>`,
  riad: `<path d="M14 92 L14 40 Q14 10 50 8 Q86 10 86 40 L86 92Z" fill="#f3dfbd" stroke="#c99a68" stroke-width="5"/><path d="M30 92 L30 50 Q30 30 50 28 Q70 30 70 50 L70 92Z" fill="#1f8a70"/><circle cx="62" cy="64" r="4" fill="#f4c430"/><path d="M50 28 L50 92" stroke="#145a49" stroke-width="3"/>`,
  shop: `<path d="M18 36 L82 36 L76 92 L24 92Z" fill="#e74c3c" stroke="#a93226" stroke-width="4"/><path d="M34 40 L34 26 Q34 10 50 10 Q66 10 66 26 L66 40" stroke="#a93226" stroke-width="6" fill="none"/><path d="M50 52 L55 64 L68 64 L58 72 L62 85 L50 77 L38 85 L42 72 L32 64 L45 64Z" fill="#f4c430"/>`,
  gift: `<rect x="12" y="40" width="76" height="52" rx="6" fill="#e74c3c"/><rect x="8" y="28" width="84" height="18" rx="5" fill="#ff6b5b"/><rect x="43" y="28" width="14" height="64" fill="#f4c430"/><path d="M50 28 Q30 4 22 18 Q20 28 50 28 Q80 28 78 18 Q70 4 50 28Z" fill="#f4c430"/>`,
  lock: `<rect x="20" y="44" width="60" height="46" rx="8" fill="#7f8c8d"/><path d="M32 44 L32 30 Q32 12 50 12 Q68 12 68 30 L68 44" stroke="#7f8c8d" stroke-width="9" fill="none"/><circle cx="50" cy="64" r="7" fill="#34495e"/>`,
  check: `<circle cx="50" cy="50" r="44" fill="#27ae60"/><path d="M28 52 L44 68 L74 34" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  soundOn: `<path d="M14 38 L32 38 L54 18 L54 82 L32 62 L14 62Z" fill="#fff"/><path d="M66 34 Q78 50 66 66 M74 24 Q94 50 74 76" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  soundOff: `<path d="M14 38 L32 38 L54 18 L54 82 L32 62 L14 62Z" fill="#fff"/><path d="M66 36 L90 64 M90 36 L66 64" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,
};

// Portraits: women wear a veil and caftan, men a jellaba (hood) or tarbouche.
export interface Look { glasses?: boolean; bg: string; robe: string; veil?: string; hood?: string; fez?: boolean; hair?: string; beard?: boolean; child?: boolean; long?: boolean; pigtails?: boolean; trim: string }
export const LOOKS: Record<string, Look> = {
  idriss: { bg: '#2e6fa8', robe: '#f5f0e6', hood: '#d9c49c', hair: '#2b1a10', beard: true, trim: '#d4a24c' },
  sarah: { bg: '#8e44ad', robe: '#1f8a70', veil: '#e79bb5', trim: '#f1c40f' },
  fatima: { glasses: true, bg: '#c0392b', robe: '#6c3483', veil: '#f5f0e6', trim: '#d4a24c' },
  brahim: { bg: '#1f8a70', robe: '#5d6d7e', hood: '#5d6d7e', hair: '#2b1a10', trim: '#f5f0e6' },
  omar: { bg: '#d4a24c', robe: '#8d6e63', fez: true, beard: true, hair: '#555', trim: '#f5f0e6' },
  amr: { bg: '#e67e22', robe: '#3498db', hair: '#2b1a10', child: true, trim: '#f5f0e6' },
  ali: { bg: '#27ae60', robe: '#e74c3c', hair: '#3b2412', child: true, trim: '#f5f0e6' },
  wafa: { bg: '#ff6f91', robe: '#ff6f91', hair: '#3b2412', long: true, trim: '#f5d142' },
  ghizlane: { bg: '#ff9f43', robe: '#2471d6', veil: '#ff9f43', trim: '#f5d142' },
  samira: { bg: '#38bdf8', robe: '#c2410c', veil: '#7fd1ff', trim: '#f5d142' },
  abdellah: { bg: '#8e5a2b', robe: '#a0522d', hood: '#a0522d', hair: '#2b1a10', beard: true, trim: '#f5d142' },
  amar: { bg: '#2e8b57', robe: '#2e8b57', hair: '#2b1a10', trim: '#f5f0e6' },
  abir: { bg: '#e84393', robe: '#e84393', hair: '#5a3418', long: true, child: true, trim: '#fff' },
  tasnim: { bg: '#14b8a6', robe: '#14b8a6', hair: '#2b1a10', pigtails: true, child: true, trim: '#ffd23f' },
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

// Half-body character for the counter, in a soft chibi cartoon style:
// big round head, large shiny eyes, flat colours with gentle shading.
export function bust(l: Look, happy: boolean): string {
  const k = l.child ? 0.88 : 1;
  const line = '#6b4a35';
  const skin = '#f5cfa8';
  const skinShade = '#e8b78e';
  let out = `<ellipse cx="50" cy="98" rx="34" ry="5" fill="#000" opacity=".12"/>`;
  // Small rounded body.
  out += `<path d="M20 100 Q20 74 50 72 Q80 74 80 100Z" fill="${l.robe}" stroke="${line}" stroke-width="1.5"/>`;
  out += `<path d="M62 76 Q78 80 80 100 L70 100 Q70 84 62 76Z" fill="#000" opacity=".1"/>`;
  out += l.veil || l.long || l.pigtails
    ? `<path d="M50 76 L50 100" stroke="${l.trim}" stroke-width="3"/>` + [82, 89, 96].map((y) => `<circle cx="50" cy="${y}" r="1.7" fill="${l.trim}"/>`).join('')
    : `<path d="M43 74 L50 84 L57 74" stroke="${l.trim}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>`;
  out += `<g transform="translate(50 ${l.child ? 44 : 41}) scale(${k})">`;
  // Behind the head: veil, hood or nothing.
  if (l.veil) out += `<path d="M-30 4 Q-32 -32 0 -32 Q32 -32 30 4 Q30 26 18 32 L-18 32 Q-30 26 -30 4Z" fill="${l.veil}" stroke="${line}" stroke-width="1.5"/><path d="M14 -28 Q30 -20 30 4 Q30 22 20 30 Q26 10 14 -28Z" fill="#000" opacity=".08"/>`;
  else if (l.hood) out += `<path d="M-30 10 Q-32 -30 0 -36 Q32 -30 30 10 Q30 30 0 32 Q-30 30 -30 10Z" fill="${l.hood}" stroke="${line}" stroke-width="1.5"/>`;
  // Long hair falls behind the shoulders; pigtails sit on each side.
  if (l.long) out += `<path d="M-28 2 Q-32 -30 0 -30 Q32 -30 28 2 Q32 22 30 36 Q0 42 -30 36 Q-32 22 -28 2Z" fill="${l.hair}" stroke="${line}" stroke-width="1.5"/>`;
  if (l.pigtails) out += `<circle cx="-29" cy="-8" r="9" fill="${l.hair}" stroke="${line}" stroke-width="1.5"/><circle cx="29" cy="-8" r="9" fill="${l.hair}" stroke="${line}" stroke-width="1.5"/><circle cx="-23" cy="-12" r="3.5" fill="${l.trim}" stroke="${line}" stroke-width="1.2"/><circle cx="23" cy="-12" r="3.5" fill="${l.trim}" stroke="${line}" stroke-width="1.2"/>`;
  // Ears (hidden by a veil), face.
  if (!l.veil) out += `<circle cx="-24" cy="2" r="5" fill="${skin}" stroke="${line}" stroke-width="1.5"/><circle cx="24" cy="2" r="5" fill="${skin}" stroke="${line}" stroke-width="1.5"/>`;
  const fr = l.veil ? 21 : 24;
  out += `<ellipse cx="0" cy="2" rx="${fr}" ry="${fr - 1}" fill="${skin}" stroke="${line}" stroke-width="1.5"/>`;
  out += `<path d="M${fr * 0.55} ${-fr * 0.7} Q${fr + 1} 0 ${fr * 0.5} ${fr * 0.8} Q${fr * 0.8} 0 ${fr * 0.55} ${-fr * 0.7}Z" fill="${skinShade}" opacity=".7"/>`;
  // Hair or headwear on top.
  if (l.veil) out += `<path d="M-21 -2 Q-22 -22 0 -22 Q22 -22 21 -2 Q18 -14 0 -15 Q-18 -14 -21 -2Z" fill="${l.veil}"/>`;
  else if (l.hair && !l.hood) out += `<path d="M-24 0 Q-27 -26 0 -27 Q27 -26 24 0 Q22 -12 12 -15 Q4 -9 -6 -14 Q-18 -12 -24 0Z" fill="${l.hair}" stroke="${line}" stroke-width="1.5"/>`;
  else if (l.hair && l.hood) out += `<path d="M-18 -12 Q-10 -22 0 -21 Q10 -22 18 -12 Q8 -16 0 -14 Q-8 -16 -18 -12Z" fill="${l.hair}"/>`;
  if (l.long) out += `<circle cx="15" cy="-19" r="4.5" fill="${l.trim === '#fff' ? '#ffd23f' : l.trim}" stroke="${line}" stroke-width="1.2"/><circle cx="15" cy="-19" r="1.6" fill="#ff5fa2"/>`;
  if (l.fez) out += `<path d="M-12 -21 L-9 -38 L9 -38 L12 -21Z" fill="#d64541" stroke="${line}" stroke-width="1.5"/><path d="M0 -38 Q9 -34 9 -24" stroke="#333" stroke-width="2" fill="none"/>`;
  // Eyes: big, dark, two highlights. Happy eyes are closed arcs.
  out += happy
    ? `<path d="M-13 1 Q-9 -6 -5 1 M5 1 Q9 -6 13 1" stroke="#3a2416" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="-9" cy="0" rx="4.6" ry="6" fill="#3a2416"/><ellipse cx="9" cy="0" rx="4.6" ry="6" fill="#3a2416"/>` +
      `<circle cx="-7.5" cy="-2.5" r="1.9" fill="#fff"/><circle cx="10.5" cy="-2.5" r="1.9" fill="#fff"/><circle cx="-10.5" cy="2.5" r=".9" fill="#fff"/><circle cx="7.5" cy="2.5" r=".9" fill="#fff"/>`;
  out += `<path d="M-14 -9 Q-10 -11 -5 -9.5 M5 -9.5 Q10 -11 14 -9" stroke="${l.hair ?? '#7a5236'}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  if (l.glasses) out += `<circle cx="-9" cy="0" r="8" fill="#fff" fill-opacity=".15" stroke="#8a6a3a" stroke-width="2"/><circle cx="9" cy="0" r="8" fill="#fff" fill-opacity=".15" stroke="#8a6a3a" stroke-width="2"/><path d="M-1 0 L1 0" stroke="#8a6a3a" stroke-width="2"/>`;
  out += `<ellipse cx="-15" cy="9" rx="4.5" ry="3" fill="#f59b8f" opacity=".55"/><ellipse cx="15" cy="9" rx="4.5" ry="3" fill="#f59b8f" opacity=".55"/>`;
  if (l.beard) out += `<path d="M-20 6 Q-19 24 0 25 Q19 24 20 6 Q14 14 0 13 Q-14 14 -20 6Z" fill="${l.hair}" stroke="${line}" stroke-width="1.2"/>`;
  out += happy
    ? `<path d="M-6 9 Q0 17 6 9Z" fill="#c0504d" stroke="${line}" stroke-width="1.2"/>`
    : `<path d="M-4 10 Q0 13 4 10" stroke="${line}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  out += `</g>`;
  return out;
}

// Zellige background tile: eight-pointed stars on deep blue.
const ZELLIGE = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#24507e"/>` +
  [[0, 0], [120, 0], [0, 120], [120, 120], [60, 60]].map(([x, y]) =>
    `<g transform="translate(${x} ${y})"><rect x="-22" y="-22" width="44" height="44" fill="#f3e9d2"/><rect x="-22" y="-22" width="44" height="44" fill="#f3e9d2" transform="rotate(45)"/><circle r="12" fill="#1f8a70"/><circle r="5" fill="#d4a24c"/></g>`).join('') +
  [[60, 0], [0, 60], [120, 60], [60, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#c0392b"/>`).join('') + `</svg>`;

// Interface pieces with their own sizes (board tiles, cards, buttons).
export const raw = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const UI: Record<string, string> = {
  tile: raw(96, 96, `<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbf2"/><stop offset="1" stop-color="#f6e6c8"/></linearGradient></defs>
    <rect x="3" y="6" width="90" height="88" rx="16" fill="#d9b98a"/><rect x="3" y="3" width="90" height="86" rx="16" fill="url(#t)"/>
    <rect x="8" y="6" width="80" height="18" rx="9" fill="#fff" opacity=".8"/>`),
  tileAlt: raw(96, 96, `<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef5fc"/><stop offset="1" stop-color="#cfe0f2"/></linearGradient></defs>
    <rect x="3" y="6" width="90" height="88" rx="16" fill="#97b6d8"/><rect x="3" y="3" width="90" height="86" rx="16" fill="url(#t)"/>
    <rect x="8" y="6" width="80" height="18" rx="9" fill="#fff" opacity=".7"/>`),
  tray: raw(220, 96, `<defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbf2"/><stop offset="1" stop-color="#f6e6c8"/></linearGradient></defs>
    <rect x="2" y="10" width="216" height="84" rx="22" fill="#5a2410" opacity=".35"/><rect x="0" y="4" width="220" height="84" rx="22" fill="#1d3f94"/><rect x="2" y="6" width="216" height="80" rx="21" fill="none" stroke="#e0b048" stroke-width="2"/>
    <rect x="4" y="4" width="212" height="78" rx="20" fill="url(#p)"/><rect x="14" y="8" width="192" height="16" rx="8" fill="#fff"/>`),

  btnGreen: raw(192, 54, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd38a"/><stop offset="1" stop-color="#1e9a52"/></linearGradient></defs>
    <rect x="0" y="6" width="192" height="48" rx="16" fill="#146b38"/><rect x="0" y="0" width="192" height="48" rx="16" fill="url(#g)"/><rect x="8" y="4" width="176" height="16" rx="8" fill="#fff" opacity=".35"/>`),
  btnGrey: raw(192, 54, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cdb8"/><stop offset="1" stop-color="#b3a58c"/></linearGradient></defs>
    <rect x="0" y="6" width="192" height="48" rx="16" fill="#8c7e66"/><rect x="0" y="0" width="192" height="48" rx="16" fill="url(#g)"/><rect x="8" y="4" width="176" height="16" rx="8" fill="#fff" opacity=".3"/>`),
  pill: raw(230, 60, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbf2"/><stop offset="1" stop-color="#f6e6c8"/></linearGradient></defs>
    <rect x="2" y="5" width="226" height="54" rx="27" fill="#5a2410" opacity=".4"/><rect x="2" y="2" width="226" height="52" rx="26" fill="url(#g)" stroke="#d9a441" stroke-width="4"/><rect x="16" y="6" width="198" height="12" rx="6" fill="#fff"/>`),
  rays: raw(256, 256, `<defs><radialGradient id="ry" cx="128" cy="128" r="128" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="#fff6c2" stop-opacity="1"/><stop offset=".55" stop-color="#ffd54a" stop-opacity=".75"/><stop offset="1" stop-color="#ffb300" stop-opacity="0"/></radialGradient>
    <radialGradient id="c"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="#ffe680" stop-opacity=".8"/><stop offset="1" stop-color="#ffd54a" stop-opacity="0"/></radialGradient></defs><path d="M128 128 L255.0 112.4 L255.0 143.6Z" fill="url(#ry)"/><path d="M128 128 L245.8 178.0 L230.2 205.0Z" fill="url(#ry)"/><path d="M128 128 L205.0 230.2 L178.0 245.8Z" fill="url(#ry)"/><path d="M128 128 L143.6 255.0 L112.4 255.0Z" fill="url(#ry)"/><path d="M128 128 L78.0 245.8 L51.0 230.2Z" fill="url(#ry)"/><path d="M128 128 L25.8 205.0 L10.2 178.0Z" fill="url(#ry)"/><path d="M128 128 L1.0 143.6 L1.0 112.4Z" fill="url(#ry)"/><path d="M128 128 L10.2 78.0 L25.8 51.0Z" fill="url(#ry)"/><path d="M128 128 L51.0 25.8 L78.0 10.2Z" fill="url(#ry)"/><path d="M128 128 L112.4 1.0 L143.6 1.0Z" fill="url(#ry)"/><path d="M128 128 L178.0 10.2 L205.0 25.8Z" fill="url(#ry)"/><path d="M128 128 L230.2 51.0 L245.8 78.0Z" fill="url(#ry)"/><circle cx="128" cy="128" r="70" fill="url(#c)"/>`),
  bigCheck: raw(110, 116, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ee89a"/><stop offset="1" stop-color="#1e9a52"/></linearGradient></defs>
    <rect x="4" y="10" width="102" height="102" rx="26" fill="#146b38"/><rect x="4" y="4" width="102" height="102" rx="26" fill="url(#g)" stroke="#fff" stroke-width="5"/>
    <rect x="16" y="12" width="78" height="24" rx="12" fill="#fff" opacity=".35"/><path d="M30 56 L48 74 L82 36" stroke="#fff" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  readyGlow: raw(256, 256, `<defs><radialGradient id="r"><stop offset=".25" stop-color="#fff9c4" stop-opacity="1"/><stop offset=".6" stop-color="#7dffb0" stop-opacity=".7"/><stop offset="1" stop-color="#2ecc71" stop-opacity="0"/></radialGradient></defs><circle cx="128" cy="128" r="128" fill="url(#r)"/>`),
  tileGreen: raw(96, 96, `<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9ffe6"/><stop offset="1" stop-color="#8eeab0"/></linearGradient></defs>
    <rect x="3" y="3" width="90" height="86" rx="16" fill="url(#t)" stroke="#2ecc71" stroke-width="3"/><rect x="8" y="6" width="80" height="18" rx="9" fill="#fff" opacity=".6"/>`),
  starWhite: raw(24, 24, `<path d="M12 0 Q13.6 10.4 24 12 Q13.6 13.6 12 24 Q10.4 13.6 0 12 Q10.4 10.4 12 0Z" fill="#fff"/>`),
  genBadge: raw(40, 40, `<circle cx="20" cy="21" r="17" fill="#24140a" opacity=".3"/><circle cx="20" cy="19" r="17" fill="#fff" stroke="#24140a" stroke-width="2.5"/><path d="M23 5 L10 22 L18 22 L15 34 L30 15 L22 15Z" fill="#ff4fa3" stroke="#24140a" stroke-width="2" stroke-linejoin="round"/>`),
  genTile: raw(96, 96, `<defs><radialGradient id="g" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#fff6c8"/><stop offset=".7" stop-color="#ffe08a"/><stop offset="1" stop-color="#ffc94a"/></radialGradient></defs>
    <rect x="3" y="3" width="90" height="86" rx="16" fill="url(#g)"/><rect x="5" y="5" width="86" height="82" rx="14" fill="none" stroke="#f5b72e" stroke-width="3"/><rect x="10" y="8" width="76" height="16" rx="8" fill="#fff" opacity=".6"/>`),
  sparkle: raw(32, 32, `<path d="M16 0 L19 13 L32 16 L19 19 L16 32 L13 19 L0 16 L13 13Z" fill="#fff6c8"/><circle cx="16" cy="16" r="4" fill="#fff"/>`),
  glowGreen: raw(128, 128, `<defs><radialGradient id="r"><stop offset=".3" stop-color="#1ec760" stop-opacity=".85"/><stop offset=".62" stop-color="#27ae60" stop-opacity=".55"/><stop offset="1" stop-color="#27ae60" stop-opacity="0"/></radialGradient></defs><rect x="6" y="6" width="116" height="116" rx="26" fill="url(#r)"/><rect x="10" y="10" width="108" height="108" rx="22" fill="none" stroke="#27ae60" stroke-width="5" opacity=".9"/>`),
  glow: raw(128, 128, `<defs><radialGradient id="r"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs><circle cx="64" cy="64" r="64" fill="url(#r)"/>`),
};

// App icon, shown in the opening animation.
const APP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 200 200"> <rect width="200" height="200" rx="44" fill="#2447A0"/> <rect x="48" y="48" width="104" height="104" rx="10" fill="#C8553D" transform="rotate(45 100 100)"/> <rect x="48" y="48" width="104" height="104" rx="10" fill="#E8A33D"/> <circle cx="100" cy="100" r="38" fill="#F6EBD9"/> <path d="M86 124 L86 100 A16 16 0 1 1 114 100 L114 124 Z" fill="#2447A0"/> <path transform="translate(163 37) scale(1.5)" d="M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10 Z" fill="#F6EBD9"/> <path transform="translate(36 162)" d="M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10 Z" fill="#F6EBD9"/> </svg>`;

// Riad courtyard behind the game: sky, horseshoe arches, zellige wainscot.
const COURTYARD = raw(720, H, `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5845a"/><stop offset=".55" stop-color="#cf6a40"/><stop offset="1" stop-color="#b5532e"/></linearGradient>
  <pattern id="t" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M0 0 H120 V120" fill="none" stroke="#8f3c1e" stroke-width="3" opacity=".45"/><path d="M4 4 H116" stroke="#f2a57c" stroke-width="2" opacity=".35"/>
    <g transform="translate(60 60)" opacity=".18"><path d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6Z" fill="#fff3d6"/><rect x="-11" y="-11" width="22" height="22" fill="none" stroke="#fff3d6" stroke-width="2" transform="rotate(45)"/></g></pattern></defs>
  <rect width="720" height="${H}" fill="url(#sky)"/><rect width="720" height="${H}" fill="url(#t)"/>`);


// One arch per character, each with its own light background colour.
const ARCH_COLORS: Record<string, [string, string]> = {
  idriss: ['#bfe3ff', '#7cc4f5'],
  sarah: ['#ffd3e6', '#f78fbd'],
  fatima: ['#e3d5ff', '#b394ef'],
  brahim: ['#c8f5dd', '#6fd3a0'],
  omar: ['#ffe2bf', '#ffb35c'],
  amr: ['#fff6b8', '#ffd84a'],
  ali: ['#ffd4cc', '#ff8f7a'],
  wafa: ['#f3d9ff', '#d36bff'],
  ghizlane: ['#efffc8', '#b5e23c'],
  samira: ['#c9f7f2', '#2ec4b6'],
  abdellah: ['#f3e3c3', '#c9a46a'],
  amar: ['#d6e4ff', '#5b7cfa'],
  abir: ['#ffe3f1', '#ff5fa2'],
  tasnim: ['#e0f7ff', '#38bdf8'],
};
const arch = ([top, bottom]: [string, string]) => raw(220, 250, `<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7e8"/><stop offset="1" stop-color="#f3dfbd"/></linearGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
    <path d="M10 250 L10 110 Q10 30 60 18 Q110 0 160 18 Q210 30 210 110 L210 250Z" fill="#e8bf62"/>
    <path d="M20 250 L20 112 Q20 42 66 30 Q110 14 154 30 Q200 42 200 112 L200 250Z" fill="url(#a)"/>
    <path d="M36 250 L36 118 Q36 60 74 48 Q110 36 146 48 Q184 60 184 118 L184 250Z" fill="url(#b)"/>
    <path d="M52 110 Q60 70 96 60" stroke="#fff" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>`);

export function artEntries(): [string, string][] {
  const out: [string, string][] = [['zellige', ZELLIGE], ['courtyard', COURTYARD], ['appIcon', APP_ICON]];
  for (const [k, b] of Object.entries(UI)) out.push([k, b]);
  for (const [k, c] of Object.entries(ARCH_COLORS)) out.push([`arch-${k}`, arch(c)]);
  for (const [chain, list] of Object.entries(ITEMS)) list.forEach((b, i) => out.push([`${chain}-${i + 1}`, svg(b)]));
  for (const [chain, b] of Object.entries(GENERATORS)) out.push([`gen-${chain}`, svg(b)]);
  for (const [k, b] of Object.entries(ICONS)) out.push([`icon-${k}`, svg(b, 64)]);
  for (const [k, l] of Object.entries(LOOKS)) {
    out.push([`face-${k}`, svg(portrait(l), 120)]);
    out.push([`bust-${k}`, svg(bust(l, false), 200, false)]);
    out.push([`happy-${k}`, svg(bust(l, true), 200, false)]);
  }
  return out;
}
