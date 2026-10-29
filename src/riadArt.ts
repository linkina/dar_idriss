import { bust, LOOKS, raw } from './art';

// Objects of the isometric riad. Each is drawn upright, anchored at the bottom
// centre, in the same bold-outline style as the board objects.
const L = '#24140a';
// Shears a front view so it runs along the back-right wall (slope 1/2).
const alongRight = (body: string) => `<g transform="matrix(1 0.5 0 1 0 0)">${body}</g>`;

const sedari = (w: number) => `<rect x="10" y="10" width="${w}" height="34" rx="8" fill="#c0392b" stroke="${L}" stroke-width="2.5"/>
  <path d="M14 20 H${w + 6}" stroke="#f5d142" stroke-width="3"/>
  <rect x="6" y="40" width="${w + 8}" height="22" rx="6" fill="#962d22" stroke="${L}" stroke-width="2.5"/>
  <rect x="6" y="60" width="${w + 8}" height="10" rx="3" fill="#8e5a2b" stroke="${L}" stroke-width="2.5"/>`;

const cushions = (w: number) =>
  ['#f5d142', '#14b8a6', '#ff6f91', '#2471d6'].map((c, i) => {
    const x = 18 + (i * (w - 30)) / 3;
    return `<rect x="${x}" y="22" width="30" height="26" rx="9" fill="${c}" stroke="${L}" stroke-width="2.5"/><circle cx="${x + 15}" cy="35" r="3" fill="#fff" opacity=".7"/>`;
  }).join('');

const RIAD: Record<string, string> = {
  sedari: raw(200, 170, alongRight(sedari(176))),
  coussins: raw(200, 170, alongRight(cushions(176))),
  table: raw(120, 100, `<ellipse cx="60" cy="88" rx="40" ry="8" fill="#000" opacity=".15"/>
    <path d="M30 60 L26 88 M90 60 L94 88 M60 64 L60 92" stroke="${L}" stroke-width="5"/><path d="M30 60 L26 88 M90 60 L94 88 M60 64 L60 92" stroke="#8e5a2b" stroke-width="3"/>
    <ellipse cx="60" cy="58" rx="50" ry="18" fill="#c9a227" stroke="${L}" stroke-width="2.5"/><ellipse cx="60" cy="55" rx="42" ry="13" fill="#f5d142"/>
    <path d="M52 52 Q50 34 60 32 Q70 34 68 52Z" fill="#dfe6ec" stroke="${L}" stroke-width="2"/><path d="M68 44 Q78 40 80 32" stroke="${L}" stroke-width="2.5" fill="none"/><circle cx="60" cy="30" r="3" fill="#c9a227" stroke="${L}" stroke-width="1.5"/>
    <rect x="34" y="46" width="8" height="10" rx="2" fill="#ff6f91" stroke="${L}" stroke-width="1.5"/><rect x="80" y="48" width="8" height="10" rx="2" fill="#14b8a6" stroke="${L}" stroke-width="1.5"/>`),
  lustre: raw(100, 150, `<path d="M50 0 L50 60" stroke="${L}" stroke-width="3"/>
    <circle cx="50" cy="96" r="44" fill="#ffd54a" opacity=".25"/>
    <path d="M28 70 L72 70 L64 104 L36 104Z" fill="#d4a24c" stroke="${L}" stroke-width="2.5"/><path d="M34 70 Q50 52 66 70Z" fill="#e8bf62" stroke="${L}" stroke-width="2.5"/>
    ${['#ff4d6d', '#2471d6', '#22b35e', '#f5d142', '#a855f7'].map((c, i) => `<rect x="${32 + i * 7.5}" y="104" width="6" height="16" rx="2" fill="${c}" stroke="${L}" stroke-width="1.5"/>`).join('')}
    <circle cx="50" cy="86" r="6" fill="#fff6c2" stroke="${L}" stroke-width="2"/>`),
  'fontaine-off': raw(170, 110, `<ellipse cx="85" cy="70" rx="80" ry="36" fill="#a89a88" stroke="${L}" stroke-width="2.5"/><ellipse cx="85" cy="64" rx="66" ry="27" fill="#8a7d6c" stroke="${L}" stroke-width="2"/>
    <path d="M50 60 L70 70 L62 82 M110 56 L100 70 L118 76" stroke="${L}" stroke-width="2" fill="none"/><rect x="78" y="36" width="14" height="30" fill="#a89a88" stroke="${L}" stroke-width="2"/>`),
  fontaine: raw(170, 150, `<ellipse cx="85" cy="110" rx="80" ry="36" fill="#1d3f94" stroke="${L}" stroke-width="2.5"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<rect x="${85 + Math.cos(a) * 72 - 6}" y="${110 + Math.sin(a) * 32 - 5}" width="12" height="10" fill="${i % 2 ? '#22b35e' : '#fdf6e7'}" stroke="${L}" stroke-width="1"/>`; }).join('')}
    <ellipse cx="85" cy="104" rx="64" ry="26" fill="#38bdf8" stroke="${L}" stroke-width="2"/><ellipse cx="70" cy="98" rx="24" ry="7" fill="#fff" opacity=".5"/>
    <rect x="76" y="60" width="18" height="44" rx="4" fill="#fdf6e7" stroke="${L}" stroke-width="2.5"/><ellipse cx="85" cy="60" rx="24" ry="9" fill="#14b8a6" stroke="${L}" stroke-width="2.5"/>
    <path d="M85 54 Q84 20 85 12 M85 30 Q70 26 66 50 M85 30 Q100 26 104 50" stroke="#7fd1ff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M85 54 Q84 20 85 12" stroke="#fff" stroke-width="2" fill="none"/>`),
  oranger: raw(120, 170, `<ellipse cx="60" cy="160" rx="34" ry="8" fill="#000" opacity=".15"/>
    <path d="M38 130 L82 130 L76 162 L44 162Z" fill="#d35400" stroke="${L}" stroke-width="2.5"/><rect x="34" y="124" width="52" height="10" rx="3" fill="#e07a45" stroke="${L}" stroke-width="2.5"/>
    <path d="M42 140 L78 140" stroke="#2471d6" stroke-width="4"/><path d="M57 128 L57 96 L63 96 L63 128Z" fill="#8e5a2b" stroke="${L}" stroke-width="2"/>
    <circle cx="60" cy="62" r="46" fill="#22b35e" stroke="${L}" stroke-width="2.5"/><circle cx="44" cy="48" r="16" fill="#3fd17a"/>
    ${[[40, 70], [62, 44], [80, 66], [56, 84], [30, 50], [84, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ff8c1a" stroke="${L}" stroke-width="2"/>`).join('')}`),
  banquette: raw(150, 110, `<g transform="matrix(1 -0.5 0 1 0 70)">
    <rect x="8" y="-10" width="120" height="30" rx="8" fill="#14b8a6" stroke="${L}" stroke-width="2.5"/><path d="M14 0 H122" stroke="#f5d142" stroke-width="3"/>
    <rect x="4" y="16" width="128" height="18" rx="5" fill="#0f8a7a" stroke="${L}" stroke-width="2.5"/><rect x="4" y="32" width="128" height="10" rx="3" fill="#8e5a2b" stroke="${L}" stroke-width="2.5"/></g>`),
  porte: raw(220, 250, `<rect x="10" y="60" width="40" height="186" fill="#f3dfbd" stroke="${L}" stroke-width="3"/><rect x="170" y="60" width="40" height="186" fill="#f3dfbd" stroke="${L}" stroke-width="3"/>
    <path d="M10 70 Q10 6 110 6 Q210 6 210 70 L170 70 Q170 40 110 40 Q50 40 50 70Z" fill="#e8a33d" stroke="${L}" stroke-width="3"/>
    ${[30, 70, 110, 150, 190].map((x) => `<circle cx="${x}" cy="${x === 110 ? 22 : x === 70 || x === 150 ? 28 : 48}" r="5" fill="#1d3f94" stroke="${L}" stroke-width="1.5"/>`).join('')}
    <path d="M50 246 L50 80 Q50 50 110 48 Q170 50 170 80 L170 246Z" fill="#7a3e1d" stroke="${L}" stroke-width="3"/>
    <path d="M110 50 L110 246" stroke="${L}" stroke-width="3"/>
    ${[100, 140, 180, 220].map((y) => `<path d="M60 ${y} H100 M120 ${y} H160" stroke="#c9a227" stroke-width="3"/>`).join('')}
    <circle cx="100" cy="160" r="5" fill="#f5d142" stroke="${L}" stroke-width="1.5"/><circle cx="120" cy="160" r="5" fill="#f5d142" stroke="${L}" stroke-width="1.5"/>
    <rect x="4" y="236" width="52" height="12" fill="#2471d6" stroke="${L}" stroke-width="2.5"/><rect x="164" y="236" width="52" height="12" fill="#2471d6" stroke="${L}" stroke-width="2.5"/>`),
  lanterne: raw(60, 160, `<circle cx="30" cy="40" r="28" fill="#ffd54a" opacity=".3"/><path d="M30 60 L30 156" stroke="${L}" stroke-width="6"/><path d="M30 60 L30 156" stroke="#5a3616" stroke-width="3"/>
    <rect x="16" y="150" width="28" height="8" rx="2" fill="#5a3616" stroke="${L}" stroke-width="2"/>
    <path d="M18 22 L42 22 L46 58 L14 58Z" fill="#ffcf4a" stroke="${L}" stroke-width="2.5"/><path d="M30 22 L30 58 M16 40 L44 40" stroke="#d35400" stroke-width="2"/>
    <path d="M16 22 L44 22 L36 12 L24 12Z M12 58 L48 58 L40 66 L20 66Z" fill="#d35400" stroke="${L}" stroke-width="2"/><circle cx="30" cy="8" r="4" fill="#d35400" stroke="${L}" stroke-width="1.5"/>`),
  jarre: raw(90, 120, `<ellipse cx="45" cy="114" rx="28" ry="6" fill="#000" opacity=".15"/>
    ${[[30, 30, '#ff4d6d'], [45, 20, '#f5d142'], [60, 30, '#a855f7'], [38, 14, '#ff8c1a'], [54, 12, '#ff4d6d']].map(([x, y, c]) => `<path d="M45 52 L${x} ${y}" stroke="#25663a" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="${L}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2.5" fill="#fff6c2"/>`).join('')}
    <path d="M28 56 Q14 76 24 100 Q32 114 45 114 Q58 114 66 100 Q76 76 62 56Z" fill="#2471d6" stroke="${L}" stroke-width="2.5"/>
    <rect x="30" y="48" width="30" height="10" rx="3" fill="#1d3f94" stroke="${L}" stroke-width="2.5"/>
    <path d="M24 80 Q45 72 66 80" stroke="#f5d142" stroke-width="3" fill="none"/><path d="M30 92 Q45 86 60 92" stroke="#fdf6e7" stroke-width="2" fill="none"/>`),
  rubble: raw(90, 60, `<ellipse cx="45" cy="50" rx="40" ry="9" fill="#000" opacity=".15"/>
    <path d="M10 50 L20 32 L34 40 L46 24 L60 36 L72 30 L82 50Z" fill="#b8a48a" stroke="${L}" stroke-width="2.5"/>
    <path d="M24 46 L60 18 L66 24 L30 52Z" fill="#a0703a" stroke="${L}" stroke-width="2"/><circle cx="66" cy="44" r="6" fill="#8a7d6c" stroke="${L}" stroke-width="2"/><circle cx="22" cy="44" r="5" fill="#cbbba3" stroke="${L}" stroke-width="2"/>`),
};

// Idriss standing: the chibi bust on a long jellaba with little feet.
function walker(happy: boolean) {
  const l = LOOKS.idriss;
  return raw(100, 160, `<ellipse cx="50" cy="154" rx="26" ry="6" fill="#000" opacity=".18"/>
    <path d="M26 86 L74 86 L80 148 L20 148Z" fill="${l.robe}" stroke="${L}" stroke-width="2.5"/><path d="M50 90 L50 148" stroke="${l.trim}" stroke-width="3"/>
    <ellipse cx="38" cy="150" rx="9" ry="5" fill="#f5d142" stroke="${L}" stroke-width="2"/><ellipse cx="62" cy="150" rx="9" ry="5" fill="#f5d142" stroke="${L}" stroke-width="2"/>
    <g transform="translate(0 0)">${bust(l, happy)}</g>`);
}

export function riadEntries(): [string, string][] {
  const out: [string, string][] = Object.entries(RIAD).map(([k, v]) => [`iso-${k}`, v]);
  out.push(['walker', walker(false)], ['walker-happy', walker(true)]);
  return out;
}
