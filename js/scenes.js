(function (M) {
  "use strict";

  var ink = "#1c2430";
  var leaf = "#3cbf6e";
  var leafDark = "#1f8a45";
  var wood = "#e7c48a";
  var woodDark = "#8d6840";
  var red = "#e23d3d";
  var gold = "#ffe56b";
  var blue = "#7eb6ff";
  var teal = "#3ec6e0";
  var pink = "#ff8fab";
  var orange = "#ffb703";

  function wrap(inner) {
    return '<svg class="scene-svg" viewBox="0 0 220 120" role="img">' +
      '<rect x="3" y="3" width="214" height="114" rx="18" fill="#fffdf6" stroke="#e7c48a" stroke-width="3"/>' +
      inner + "</svg>";
  }

  function eyes(x, y, gap) {
    gap = gap || 5;
    return '<circle cx="' + (x - gap) + '" cy="' + y + '" r="1.7" fill="' + ink + '"/>' +
      '<circle cx="' + (x + gap) + '" cy="' + y + '" r="1.7" fill="' + ink + '"/>' +
      '<path d="M' + (x - gap) + " " + (y + 5) + " Q" + x + " " + (y + 9) + " " + (x + gap) + " " + (y + 5) +
      '" stroke="' + ink + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  }

  function ground() {
    return '<path d="M8 88 Q70 74 120 88 T212 86 V112 H8 Z" fill="#8ed39a"/>';
  }

  function sky() {
    return '<rect x="8" y="8" width="204" height="54" rx="12" fill="#d7f3ff"/>';
  }

  function nightSky() {
    return '<rect x="8" y="8" width="204" height="104" rx="14" fill="#14233f"/>' +
      '<g fill="#fff">' +
      '<circle cx="24" cy="22" r="1.4"/><circle cx="48" cy="34" r="1"/><circle cx="28" cy="84" r="1.2"/>' +
      '<circle cx="22" cy="104" r="1"/><circle cx="72" cy="18" r="1.3"/><circle cx="188" cy="24" r="1.5"/>' +
      '<circle cx="198" cy="58" r="1"/><circle cx="176" cy="98" r="1.2"/><circle cx="146" cy="20" r="1"/>' +
      '<circle cx="96" cy="16" r="1.1"/></g>';
  }

  function disc(id, cx, cy, r, fill, inner) {
    var hx = cx - Math.round(r * 0.28);
    var hy = cy - Math.round(r * 0.32);
    var rx = Math.max(4, Math.round(r * 0.22));
    var ry = Math.max(2, Math.round(r * 0.12));
    return '<defs><clipPath id="' + id + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath></defs>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"/>' +
      '<g clip-path="url(#' + id + ')">' + (inner || "") + "</g>" +
      '<ellipse cx="' + hx + '" cy="' + hy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="0.35"/>';
  }

  var art = {
    tree: wrap(sky() + ground() +
      '<rect x="100" y="62" width="20" height="32" rx="4" fill="' + woodDark + '"/>' +
      '<circle cx="110" cy="58" r="26" fill="' + leaf + '"/>' +
      '<circle cx="90" cy="68" r="16" fill="' + leafDark + '"/>' +
      '<circle cx="132" cy="66" r="16" fill="' + leafDark + '"/>' +
      '<circle cx="98" cy="52" r="5" fill="' + red + '"/>' +
      '<circle cx="122" cy="60" r="5" fill="' + red + '"/>' +
      '<circle cx="108" cy="72" r="4" fill="' + orange + '"/>'),
    rock: wrap(ground() +
      '<ellipse cx="118" cy="86" rx="48" ry="18" fill="#b7c0b4"/>' +
      '<ellipse cx="96" cy="78" rx="28" ry="16" fill="#d5ddd2"/>' +
      '<ellipse cx="132" cy="82" rx="22" ry="12" fill="#9aa394"/>'),
    puppy: wrap(sky() + ground() +
      '<ellipse cx="118" cy="84" rx="40" ry="18" fill="#f0c08a"/>' +
      '<circle cx="78" cy="66" r="16" fill="#f0c08a"/>' +
      '<ellipse cx="64" cy="52" rx="7" ry="12" fill="#e7a56a"/>' +
      '<ellipse cx="90" cy="54" rx="6" ry="10" fill="#e7a56a"/>' +
      '<ellipse cx="70" cy="78" rx="8" ry="5" fill="#fff"/>' +
      eyes(76, 64, 4) +
      '<ellipse cx="150" cy="78" rx="8" ry="5" fill="' + woodDark + '"/>'),
    fish: wrap(
      '<rect x="8" y="8" width="204" height="104" rx="14" fill="#b7e6f5"/>' +
      '<ellipse cx="100" cy="66" rx="44" ry="24" fill="' + teal + '"/>' +
      '<polygon points="138,66 176,40 164,66 176,92" fill="#1f9eb8"/>' +
      '<polygon points="96,44 118,24 122,50" fill="#7dcea0"/>' +
      '<circle cx="74" cy="60" r="6" fill="#fff"/>' +
      '<circle cx="76" cy="60" r="3" fill="' + ink + '"/>' +
      '<circle cx="40" cy="34" r="4" fill="#fff"/><circle cx="54" cy="24" r="2.5" fill="#fff"/>'),
    spoon: wrap(
      '<ellipse cx="92" cy="40" rx="22" ry="26" fill="#d7dde8" stroke="#8d97a8" stroke-width="3"/>' +
      '<ellipse cx="86" cy="34" rx="8" ry="10" fill="#fff" opacity="0.8"/>' +
      '<rect x="84" y="62" width="16" height="40" rx="6" fill="#c5cedb" stroke="#8d97a8" stroke-width="3"/>'),
    bee: wrap(sky() +
      '<ellipse cx="86" cy="48" rx="16" ry="8" fill="#fff" opacity="0.85"/>' +
      '<ellipse cx="138" cy="46" rx="16" ry="8" fill="#fff" opacity="0.85"/>' +
      '<ellipse cx="110" cy="68" rx="32" ry="20" fill="' + gold + '"/>' +
      '<rect x="98" y="50" width="8" height="36" rx="3" fill="' + ink + '"/>' +
      '<rect x="116" y="50" width="8" height="36" rx="3" fill="' + ink + '"/>' +
      '<circle cx="86" cy="62" r="8" fill="' + ink + '"/>' +
      eyes(86, 60, 3)),
    plant: wrap(sky() + ground() +
      '<rect x="92" y="78" width="36" height="24" rx="6" fill="' + wood + '" stroke="' + woodDark + '" stroke-width="2"/>' +
      '<line class="stem" x1="110" y1="70" x2="110" y2="40" stroke="' + leafDark + '" stroke-width="5" stroke-linecap="round"/>' +
      '<ellipse class="leaf" cx="90" cy="56" rx="16" ry="8" fill="' + leaf + '"/>' +
      '<ellipse class="leaf2" cx="132" cy="50" rx="16" ry="8" fill="' + leaf + '"/>' +
      '<circle cx="110" cy="36" r="8" fill="' + pink + '"/>' +
      '<circle cx="110" cy="36" r="3" fill="' + gold + '"/>' +
      '<circle class="drop" cx="110" cy="28" r="4" fill="' + blue + '"/>'),
    sun: wrap(
      '<rect x="8" y="8" width="204" height="104" rx="14" fill="#fff6d4"/>' +
      '<g stroke="' + orange + '" stroke-width="5" stroke-linecap="round">' +
      '<line x1="110" y1="22" x2="110" y2="10"/><line x1="110" y1="98" x2="110" y2="110"/>' +
      '<line x1="70" y1="60" x2="52" y2="60"/><line x1="150" y1="60" x2="168" y2="60"/>' +
      '<line x1="82" y1="32" x2="70" y2="20"/><line x1="138" y1="32" x2="150" y2="20"/>' +
      '<line x1="82" y1="88" x2="70" y2="100"/><line x1="138" y1="88" x2="150" y2="100"/></g>' +
      '<circle cx="110" cy="60" r="26" fill="' + gold + '" stroke="' + orange + '" stroke-width="3"/>' +
      eyes(110, 56, 6)),
    rain: wrap(
      '<rect x="8" y="8" width="204" height="104" rx="14" fill="#e7f2fb"/>' +
      '<ellipse cx="96" cy="46" rx="40" ry="20" fill="#d5dde8"/>' +
      '<ellipse cx="136" cy="50" rx="30" ry="16" fill="#eef3f8"/>' +
      '<g fill="' + blue + '">' +
      '<circle class="drop" cx="88" cy="78" r="5"/>' +
      '<circle class="drop d2" cx="112" cy="86" r="5"/>' +
      '<circle class="drop d3" cx="136" cy="76" r="5"/></g>'),
    wind: wrap(sky() +
      '<path d="M24 48 H130" stroke="' + blue + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M36 68 H150" stroke="' + teal + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path class="kite" d="M150 36 L176 54 L150 74 L138 54 Z" fill="' + red + '" stroke="' + ink + '" stroke-width="2"/>' +
      '<path d="M150 54 L168 96" stroke="' + ink + '" stroke-width="1.5"/>'),
    wood: wrap(
      '<rect x="48" y="36" width="124" height="52" rx="8" fill="' + wood + '" stroke="' + woodDark + '" stroke-width="3"/>' +
      '<path d="M58 50 H162 M58 64 H162 M58 76 H150" stroke="' + woodDark + '" stroke-width="2" opacity="0.45"/>' +
      '<ellipse cx="70" cy="46" rx="10" ry="4" fill="#f6e2bc"/>'),
    soft: wrap(
      '<ellipse cx="110" cy="68" rx="48" ry="26" fill="#fff"/>' +
      '<ellipse cx="86" cy="60" rx="22" ry="16" fill="#f7fbff" stroke="#d5e2ee" stroke-width="2"/>' +
      '<ellipse cx="128" cy="58" rx="24" ry="16" fill="#fff" stroke="#d5e2ee" stroke-width="2"/>' +
      '<ellipse cx="110" cy="78" rx="20" ry="12" fill="#f3f7fb"/>'),
    camel: wrap(
      '<rect x="8" y="8" width="204" height="104" rx="14" fill="#fff1d6"/>' +
      '<ellipse cx="128" cy="82" rx="46" ry="16" fill="' + wood + '"/>' +
      '<path d="M96 70 Q108 42 124 68 Q138 44 156 66" fill="' + wood + '"/>' +
      '<circle cx="78" cy="70" r="14" fill="' + wood + '"/>' +
      '<rect x="70" y="84" width="6" height="16" fill="' + woodDark + '"/>' +
      '<rect x="150" y="84" width="6" height="16" fill="' + woodDark + '"/>' +
      eyes(76, 68, 4)),
    bear: wrap(sky() + ground() +
      '<circle cx="110" cy="72" r="28" fill="#f4f7e6" stroke="' + ink + '" stroke-width="2"/>' +
      '<circle cx="88" cy="50" r="10" fill="#f4f7e6" stroke="' + ink + '" stroke-width="2"/>' +
      '<circle cx="132" cy="50" r="10" fill="#f4f7e6" stroke="' + ink + '" stroke-width="2"/>' +
      '<ellipse cx="110" cy="78" rx="8" ry="5" fill="' + ink + '"/>' +
      eyes(110, 68, 8)),
    frog: wrap(
      '<ellipse cx="110" cy="96" rx="70" ry="14" fill="#8ed4ef"/>' +
      '<ellipse cx="110" cy="78" rx="36" ry="18" fill="' + leaf + '"/>' +
      '<circle cx="88" cy="58" r="12" fill="' + leaf + '"/>' +
      '<circle cx="132" cy="58" r="12" fill="' + leaf + '"/>' +
      '<circle cx="88" cy="56" r="4" fill="#fff"/><circle cx="89" cy="56" r="2" fill="' + ink + '"/>' +
      '<circle cx="132" cy="56" r="4" fill="#fff"/><circle cx="133" cy="56" r="2" fill="' + ink + '"/>' +
      '<path d="M100 80 Q110 88 120 80" stroke="' + ink + '" stroke-width="1.6" fill="none"/>'),
    bird: wrap(sky() + ground() +
      '<ellipse cx="118" cy="58" rx="30" ry="18" fill="' + blue + '"/>' +
      '<circle cx="84" cy="50" r="14" fill="' + blue + '"/>' +
      '<polygon points="72,46 72,56 52,51" fill="' + orange + '"/>' +
      '<ellipse cx="122" cy="56" rx="14" ry="7" fill="#5aa2ea"/>' +
      '<polygon points="144,50 176,40 170,62 144,64" fill="#2f6fed"/>' +
      '<circle cx="80" cy="48" r="2.4" fill="' + ink + '"/>' +
      '<path d="M108 74 V94 M130 74 V94" stroke="' + orange + '" stroke-width="3" stroke-linecap="round"/>'),
    cycle: wrap(
      '<g font-family="Nunito, sans-serif" font-size="15" font-weight="800" text-anchor="middle">' +
      '<circle cx="36" cy="62" r="20" fill="' + gold + '" stroke="' + orange + '" stroke-width="3"/>' +
      '<text x="36" y="67" fill="' + ink + '">1</text>' +
      '<circle cx="86" cy="62" r="20" fill="' + leaf + '" stroke="' + leafDark + '" stroke-width="3"/>' +
      '<text x="86" y="67" fill="' + ink + '">2</text>' +
      '<circle cx="136" cy="62" r="20" fill="' + teal + '" stroke="#1f8ea8" stroke-width="3"/>' +
      '<text x="136" y="67" fill="' + ink + '">3</text>' +
      '<circle cx="186" cy="62" r="20" fill="' + pink + '" stroke="' + red + '" stroke-width="3"/>' +
      '<text x="186" y="67" fill="' + ink + '">4</text></g>' +
      '<path d="M56 62 H66 M106 62 H116 M156 62 H166" stroke="' + woodDark + '" stroke-width="3" stroke-linecap="round"/>'),
    ice: wrap(
      '<rect x="70" y="28" width="80" height="64" rx="10" fill="#e5fbff" stroke="' + blue + '" stroke-width="4"/>' +
      '<path d="M86 28 L74 92 M110 28 L122 92 M130 40 L86 78" stroke="#9fd4e6" stroke-width="3"/>' +
      '<rect x="82" y="38" width="16" height="8" rx="3" fill="#fff" opacity="0.85"/>'),
    cup: wrap(
      '<path d="M70 28 H150 L138 100 H82 Z" fill="#fff" stroke="' + woodDark + '" stroke-width="4"/>' +
      '<path d="M82 40 H136 L128 90 H90 Z" fill="' + blue + '"/>' +
      '<path d="M150 42 H168 A14 14 0 0 1 168 74 H150" fill="none" stroke="' + woodDark + '" stroke-width="4"/>'),
    balloon: wrap(sky() +
      '<ellipse cx="110" cy="52" rx="32" ry="38" fill="' + red + '"/>' +
      '<ellipse cx="98" cy="40" rx="8" ry="12" fill="#ff8d86" opacity="0.8"/>' +
      '<polygon points="104,88 116,88 110,98" fill="' + red + '"/>' +
      '<path d="M110 98 Q104 108 112 114" stroke="' + ink + '" stroke-width="2" fill="none"/>'),
    bridge: wrap(
      '<rect x="8" y="70" width="204" height="36" fill="#8ed4ef"/>' +
      '<path d="M24 78 H196" stroke="' + woodDark + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M40 78 V48 H180 V78" fill="none" stroke="' + wood + '" stroke-width="6"/>' +
      '<rect class="post" x="102" y="48" width="16" height="30" rx="2" fill="' + orange + '" stroke="' + woodDark + '" stroke-width="2"/>'),
    rabbit: wrap(ground() +
      '<ellipse cx="116" cy="84" rx="32" ry="16" fill="#fff" stroke="#d5dde4" stroke-width="2"/>' +
      '<circle cx="82" cy="66" r="14" fill="#fff" stroke="#d5dde4" stroke-width="2"/>' +
      '<ellipse cx="72" cy="44" rx="6" ry="16" fill="#fff" stroke="#d5dde4" stroke-width="2"/>' +
      '<ellipse cx="90" cy="46" rx="6" ry="16" fill="#fff" stroke="#d5dde4" stroke-width="2"/>' +
      '<ellipse cx="74" cy="46" rx="2" ry="8" fill="' + pink + '"/>' +
      eyes(80, 64, 4)),
    fox: wrap(ground() +
      '<polygon points="64,90 110,48 156,90" fill="' + orange + '"/>' +
      '<polygon points="92,58 102,32 112,58" fill="' + orange + '"/>' +
      '<polygon points="114,58 126,30 136,58" fill="' + orange + '"/>' +
      '<ellipse cx="110" cy="74" rx="12" ry="8" fill="#fff"/>' +
      eyes(110, 66, 6)),
    mix: wrap(
      '<ellipse cx="110" cy="86" rx="62" ry="18" fill="' + wood + '" stroke="' + woodDark + '" stroke-width="3"/>' +
      '<circle cx="78" cy="62" r="12" fill="' + red + '"/>' +
      '<circle cx="110" cy="52" r="12" fill="' + gold + '"/>' +
      '<circle cx="140" cy="64" r="12" fill="' + blue + '"/>' +
      '<circle cx="96" cy="74" r="8" fill="' + leaf + '"/>'),
    magnet: wrap(
      '<path d="M62 28 H92 V86 A8 8 0 0 0 92 86 H62 Z" fill="' + red + '"/>' +
      '<path d="M128 28 H158 V86 H128 Z" fill="' + blue + '"/>' +
      '<path d="M92 28 H128 V52 H92 Z" fill="#f4f7e6" stroke="' + ink + '" stroke-width="3"/>' +
      '<rect x="62" y="28" width="30" height="58" fill="' + red + '" stroke="' + ink + '" stroke-width="3"/>' +
      '<rect x="128" y="28" width="30" height="58" fill="' + blue + '" stroke="' + ink + '" stroke-width="3"/>' +
      '<rect x="62" y="86" width="30" height="14" fill="#d7dde8" stroke="' + ink + '" stroke-width="3"/>' +
      '<rect x="128" y="86" width="30" height="14" fill="#d7dde8" stroke="' + ink + '" stroke-width="3"/>'),
    push: wrap(ground() +
      '<g class="mover">' +
      '<rect x="70" y="46" width="58" height="26" rx="8" fill="' + orange + '" stroke="' + woodDark + '" stroke-width="2"/>' +
      '<circle cx="84" cy="76" r="7" fill="' + ink + '"/><circle cx="116" cy="76" r="7" fill="' + ink + '"/>' +
      '<circle cx="86" cy="56" r="2" fill="' + ink + '"/><circle cx="98" cy="56" r="2" fill="' + ink + '"/>' +
      '<path d="M84 64 Q94 70 106 64" stroke="' + ink + '" stroke-width="1.5" fill="none"/>' +
      "</g>" +
      '<path d="M28 58 H64" stroke="' + red + '" stroke-width="5" stroke-linecap="round"/>' +
      '<polygon points="64,50 78,58 64,66" fill="' + red + '"/>'),
    pull: wrap(ground() +
      '<g class="mover pull">' +
      '<rect x="96" y="46" width="58" height="26" rx="8" fill="' + blue + '" stroke="#2f6fed" stroke-width="2"/>' +
      '<circle cx="110" cy="76" r="7" fill="' + ink + '"/><circle cx="142" cy="76" r="7" fill="' + ink + '"/>' +
      '<circle cx="114" cy="56" r="2" fill="' + ink + '"/><circle cx="128" cy="56" r="2" fill="' + ink + '"/>' +
      "</g>" +
      '<path d="M28 58 H90" stroke="' + red + '" stroke-width="5" stroke-linecap="round"/>' +
      '<polygon points="28,50 14,58 28,66" fill="' + red + '"/>'),
    race: wrap(
      '<rect x="8" y="8" width="204" height="104" rx="14" fill="#e7f6ff"/>' +
      '<rect x="16" y="34" width="156" height="24" rx="8" fill="#d7dde8"/>' +
      '<rect x="16" y="68" width="156" height="24" rx="8" fill="#efe6d4"/>' +
      '<g class="fast">' +
      '<rect x="24" y="36" width="40" height="16" rx="6" fill="' + red + '"/>' +
      '<circle cx="34" cy="54" r="5" fill="' + ink + '"/><circle cx="56" cy="54" r="5" fill="' + ink + '"/>' +
      '<circle cx="36" cy="42" r="2" fill="#fff"/><circle cx="46" cy="42" r="2" fill="#fff"/>' +
      "</g>" +
      '<g class="slow">' +
      '<rect x="24" y="70" width="40" height="16" rx="6" fill="' + blue + '"/>' +
      '<circle cx="34" cy="88" r="5" fill="' + ink + '"/><circle cx="56" cy="88" r="5" fill="' + ink + '"/>' +
      '<circle cx="36" cy="76" r="2" fill="#fff"/><circle cx="46" cy="76" r="2" fill="#fff"/>' +
      "</g>" +
      '<line x1="180" y1="20" x2="180" y2="100" stroke="' + red + '" stroke-width="4"/>' +
      '<polygon points="180,18 204,30 180,42" fill="' + red + '"/>'),
    scale: wrap(
      '<polygon points="110,24 100,40 120,40" fill="' + woodDark + '"/>' +
      '<rect x="104" y="40" width="12" height="48" rx="3" fill="' + wood + '"/>' +
      '<line x1="36" y1="48" x2="184" y2="48" stroke="' + ink + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M40 48 L52 78 H84 L72 48" fill="' + gold + '" stroke="' + woodDark + '" stroke-width="2"/>' +
      '<path d="M148 48 L160 78 H192 L180 48" fill="' + gold + '" stroke="' + woodDark + '" stroke-width="2"/>'),
    float: wrap(
      '<path d="M28 72 H192 V104 H28 Z" fill="' + blue + '"/>' +
      '<path d="M28 72 Q70 64 110 72 T192 72" fill="none" stroke="#fff" stroke-width="3"/>' +
      '<circle class="floater" cx="110" cy="58" r="18" fill="' + pink + '" stroke="' + red + '" stroke-width="3"/>' +
      '<ellipse cx="104" cy="52" rx="5" ry="3" fill="#fff" opacity="0.8"/>'),
    friction: wrap(
      '<rect x="16" y="78" width="90" height="22" rx="4" fill="#8d6b45"/>' +
      '<path d="M24 84 H96 M28 92 H90 M22 98 H98" stroke="#6b4a28" stroke-width="2"/>' +
      '<rect x="114" y="86" width="90" height="10" rx="4" fill="' + wood + '"/>' +
      '<g class="mover"><rect x="36" y="52" width="40" height="20" rx="6" fill="' + red + '"/><circle cx="46" cy="74" r="5" fill="' + ink + '"/><circle cx="66" cy="74" r="5" fill="' + ink + '"/></g>'),
    ramp: wrap(
      '<polygon points="24,96 100,96 100,36" fill="#8d6b45"/>' +
      '<polygon points="118,96 200,96 200,72" fill="' + wood + '"/>' +
      '<rect class="car-steep" x="70" y="32" width="26" height="14" rx="4" fill="' + red + '"/>' +
      '<rect class="car-flat" x="156" y="64" width="26" height="14" rx="4" fill="' + blue + '"/>'),
    drop: wrap(
      '<rect class="blk heavy" x="64" y="16" width="28" height="28" rx="4" fill="' + wood + '" stroke="' + woodDark + '" stroke-width="2"/>' +
      '<rect class="blk light" x="128" y="22" width="16" height="16" rx="3" fill="' + gold + '" stroke="' + orange + '" stroke-width="2"/>' +
      '<line x1="24" y1="100" x2="196" y2="100" stroke="' + leafDark + '" stroke-width="4" stroke-linecap="round"/>'),
    forces: wrap(
      '<rect x="86" y="44" width="48" height="32" rx="8" fill="' + orange + '" stroke="' + woodDark + '" stroke-width="2"/>' +
      '<path d="M28 60 H80" stroke="' + red + '" stroke-width="5" stroke-linecap="round"/>' +
      '<polygon points="80,52 94,60 80,68" fill="' + red + '"/>' +
      '<path d="M140 60 H192" stroke="' + blue + '" stroke-width="5" stroke-linecap="round"/>' +
      '<polygon points="140,52 126,60 140,68" fill="' + blue + '"/>'),
    shadow: wrap(
      '<circle cx="40" cy="32" r="14" fill="' + gold + '" stroke="' + orange + '" stroke-width="3"/>' +
      '<rect x="104" y="36" width="28" height="46" rx="4" fill="' + blue + '" stroke="#2f6fed" stroke-width="2"/>' +
      '<ellipse class="shade" cx="156" cy="96" rx="32" ry="10" fill="#17382e" opacity="0.55"/>'),
    pulley: wrap(
      '<rect x="96" y="10" width="28" height="10" rx="3" fill="' + woodDark + '"/>' +
      '<circle cx="110" cy="32" r="16" fill="#fff" stroke="' + ink + '" stroke-width="4"/>' +
      '<circle cx="110" cy="32" r="4" fill="' + wood + '"/>' +
      '<line x1="94" y1="32" x2="94" y2="100" stroke="' + ink + '" stroke-width="3"/>' +
      '<line class="rope" x1="126" y1="32" x2="126" y2="72" stroke="' + ink + '" stroke-width="3"/>' +
      '<rect class="load" x="110" y="72" width="32" height="22" rx="4" fill="' + orange + '" stroke="' + woodDark + '" stroke-width="2"/>'),
    moon: wrap(nightSky() + disc("clipMoon", 110, 62, 30, "#eceaf4",
      '<circle cx="98" cy="52" r="7" fill="#d4d0de"/><circle cx="124" cy="68" r="9" fill="#c8c4d4"/>' +
      '<circle cx="104" cy="74" r="4" fill="#ddd9e6"/>')),
    earth: wrap(nightSky() + disc("clipEarth", 110, 62, 32, "#3d7fe0",
      '<ellipse cx="98" cy="52" rx="16" ry="9" fill="' + leaf + '"/>' +
      '<ellipse cx="126" cy="74" rx="13" ry="8" fill="' + leafDark + '"/>' +
      '<ellipse cx="112" cy="64" rx="7" ry="5" fill="#8ed39a"/>')),
    mars: wrap(nightSky() + disc("clipMars", 110, 62, 28, "#d4654a",
      '<circle cx="98" cy="54" r="6" fill="#b8503c"/><circle cx="122" cy="70" r="8" fill="#e58a72"/>' +
      '<circle cx="108" cy="76" r="3" fill="#a84838"/>')),
    jupiter: wrap(nightSky() + disc("clipJupiter", 110, 62, 36, "#e6b15a",
      '<rect x="70" y="46" width="80" height="9" fill="#f6d7a4"/>' +
      '<rect x="70" y="60" width="80" height="8" fill="#c9843a"/>' +
      '<rect x="70" y="74" width="80" height="7" fill="#f0c27a"/>' +
      '<ellipse cx="128" cy="72" rx="9" ry="6" fill="#e23d3d"/>')),
    saturn: wrap(nightSky() +
      '<ellipse cx="110" cy="64" rx="74" ry="18" fill="none" stroke="#f0d59a" stroke-width="10"/>' +
      '<ellipse cx="110" cy="64" rx="60" ry="13" fill="none" stroke="#e7c48a" stroke-width="3"/>' +
      disc("clipSaturn", 110, 64, 26, "#f0d59a",
        '<ellipse cx="110" cy="56" rx="26" ry="5" fill="#ffe7b8"/>')),
    mercury: wrap(nightSky() + disc("clipMercury", 110, 62, 18, "#b7a898",
      '<circle cx="104" cy="56" r="3.5" fill="#8d7d70"/><circle cx="116" cy="66" r="2.6" fill="#9a8b7e"/>' +
      '<circle cx="108" cy="70" r="2" fill="#7d6e62"/>')),
    venus: wrap(nightSky() + disc("clipVenus", 110, 62, 30, "#f3e27a",
      '<ellipse cx="100" cy="50" rx="18" ry="8" fill="#fff6c2"/>' +
      '<ellipse cx="124" cy="72" rx="16" ry="8" fill="#e6d48a"/>' +
      '<ellipse cx="108" cy="62" rx="10" ry="5" fill="#fff2b0"/>')),
    uranus: wrap(nightSky() + disc("clipUranus", 110, 62, 28, "#b7efe8",
      '<ellipse cx="110" cy="54" rx="28" ry="6" fill="#e9fffb"/>')),
    neptune: wrap(nightSky() + disc("clipNeptune", 110, 62, 30, "#3d6fd8",
      '<ellipse cx="110" cy="50" rx="30" ry="6" fill="#2a4f9e"/>' +
      '<ellipse cx="122" cy="72" rx="8" ry="5" fill="#1d3f86"/>')),
    stars: wrap(nightSky() +
      '<polygon points="110,28 116,50 138,50 120,64 128,86 110,72 92,86 100,64 82,50 104,50" fill="#ffe56b"/>' +
      '<polygon points="168,34 170,40 176,40 171,44 173,50 168,46 163,50 165,44 160,40 166,40" fill="#fff"/>' +
      '<polygon points="52,68 54,74 60,74 55,78 57,84 52,80 47,84 49,78 44,74 50,74" fill="#fff"/>'),
    rocket: wrap(
      '<rect x="8" y="8" width="204" height="104" rx="14" fill="#d7f3ff"/>' +
      '<path d="M8 96 H212 V112 H8 Z" fill="#8ed39a"/>' +
      '<polygon points="110,16 132,52 88,52" fill="#e23d3d"/>' +
      '<rect x="92" y="50" width="36" height="40" rx="6" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>' +
      '<circle cx="110" cy="68" r="7" fill="#7eb6ff" stroke="' + ink + '" stroke-width="2"/>' +
      '<polygon points="92,74 74,100 94,90" fill="#e23d3d"/>' +
      '<polygon points="128,74 146,100 126,90" fill="#e23d3d"/>' +
      '<polygon points="100,90 110,112 120,90" fill="#ffb703"/>' +
      '<polygon points="105,94 110,108 115,94" fill="#ffe56b"/>'),
    astronaut: wrap(nightSky() +
      '<circle cx="110" cy="42" r="16" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>' +
      '<circle cx="110" cy="43" r="10" fill="#d7f3ff"/>' +
      '<circle cx="106" cy="42" r="1.5" fill="' + ink + '"/><circle cx="114" cy="42" r="1.5" fill="' + ink + '"/>' +
      '<path d="M106 47 Q110 50 114 47" fill="none" stroke="' + ink + '" stroke-width="1.3" stroke-linecap="round"/>' +
      '<rect x="90" y="58" width="40" height="34" rx="12" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>' +
      '<rect x="100" y="68" width="20" height="14" rx="3" fill="#7eb6ff"/>' +
      '<rect x="74" y="64" width="16" height="12" rx="5" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>' +
      '<rect x="130" y="64" width="16" height="12" rx="5" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>' +
      '<rect x="98" y="92" width="10" height="12" rx="3" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>' +
      '<rect x="112" y="92" width="10" height="12" rx="3" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>'),
    orbit: wrap(nightSky() +
      '<circle cx="110" cy="62" r="40" fill="none" stroke="#d7e4f5" stroke-width="2" stroke-dasharray="5 4"/>' +
      '<circle cx="110" cy="62" r="14" fill="#ffe56b" stroke="#ffb703" stroke-width="3"/>' +
      '<circle cx="150" cy="62" r="6" fill="#f7f4ea"/>'),
    galaxy: wrap(nightSky() +
      '<ellipse cx="110" cy="62" rx="70" ry="26" fill="#24365c" transform="rotate(-24 110 62)"/>' +
      '<g fill="#fff">' +
      '<circle cx="110" cy="62" r="2"/><circle cx="122" cy="56" r="1.4"/><circle cx="134" cy="50" r="1.3"/>' +
      '<circle cx="148" cy="44" r="1.5"/><circle cx="162" cy="40" r="1.2"/><circle cx="124" cy="70" r="1.3"/>' +
      '<circle cx="138" cy="78" r="1.4"/><circle cx="154" cy="86" r="1.2"/>' +
      '<circle cx="98" cy="68" r="1.3"/><circle cx="86" cy="74" r="1.4"/><circle cx="72" cy="82" r="1.2"/>' +
      '<circle cx="58" cy="88" r="1.3"/><circle cx="96" cy="52" r="1.2"/><circle cx="82" cy="44" r="1.4"/>' +
      '<circle cx="68" cy="36" r="1.2"/><circle cx="54" cy="30" r="1.1"/></g>' +
      '<circle cx="110" cy="62" r="7" fill="#ffe56b"/>'),
    comet: wrap(nightSky() +
      '<polygon points="158,62 36,34 52,62 34,90" fill="#d7e4f5" opacity="0.9"/>' +
      '<polygon points="158,62 70,48 78,62 64,78" fill="#fff" opacity="0.85"/>' +
      '<circle cx="164" cy="62" r="11" fill="#f7f4ea"/>' +
      '<ellipse cx="160" cy="58" rx="4" ry="2.5" fill="#fff" opacity="0.8"/>'),
    meteor: wrap(nightSky() +
      '<line x1="36" y1="34" x2="154" y2="86" stroke="#ffe56b" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="78" y1="52" x2="154" y2="86" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="158" cy="88" r="5" fill="#fff"/>'),
    asteroid: wrap(nightSky() +
      '<ellipse cx="64" cy="74" rx="18" ry="13" fill="#9aa394"/>' +
      '<ellipse cx="112" cy="60" rx="26" ry="18" fill="#c5cdc2"/>' +
      '<ellipse cx="158" cy="76" rx="16" ry="12" fill="#8d97a8"/>' +
      '<circle cx="104" cy="54" r="4" fill="#8b9488"/><circle cx="122" cy="66" r="3" fill="#7e877c"/>' +
      '<circle cx="60" cy="70" r="2.5" fill="#7d867a"/>'),
    satellite: wrap(nightSky() +
      '<rect x="62" y="54" width="32" height="16" rx="2" fill="#7eb6ff" stroke="' + ink + '" stroke-width="2"/>' +
      '<rect x="94" y="48" width="28" height="28" rx="4" fill="#f7f4ea" stroke="' + ink + '" stroke-width="2"/>' +
      '<rect x="122" y="54" width="32" height="16" rx="2" fill="#7eb6ff" stroke="' + ink + '" stroke-width="2"/>' +
      '<line x1="70" y1="58" x2="70" y2="66" stroke="' + ink + '" stroke-width="1.4"/>' +
      '<line x1="146" y1="58" x2="146" y2="66" stroke="' + ink + '" stroke-width="1.4"/>' +
      '<line x1="108" y1="48" x2="108" y2="36" stroke="' + ink + '" stroke-width="2"/>' +
      '<circle cx="108" cy="34" r="3" fill="#ffe56b"/>'),
    eclipse: wrap(
      '<rect x="8" y="8" width="204" height="104" rx="14" fill="#14182b"/>' +
      '<circle cx="110" cy="60" r="32" fill="none" stroke="#ffe56b" stroke-width="3"/>' +
      '<circle cx="110" cy="60" r="22" fill="#ffe56b"/>' +
      '<circle cx="124" cy="60" r="20" fill="#14182b"/>'),
    tilt: wrap(nightSky() +
      '<circle cx="48" cy="62" r="16" fill="#ffe56b" stroke="#ffb703" stroke-width="3"/>' +
      disc("clipTilt", 148, 62, 26, "#3d7fe0",
        '<ellipse cx="140" cy="54" rx="12" ry="7" fill="' + leaf + '"/>' +
        '<ellipse cx="158" cy="72" rx="8" ry="5" fill="' + leafDark + '"/>') +
      '<line x1="132" y1="28" x2="164" y2="96" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>'),
    // v30 Astronomy Beginner scenes: day and night, Pluto, the Kuiper Belt, the Big Dipper, the planets in order.
    daynight: wrap('<rect x="8" y="8" width="102" height="104" rx="14" fill="#d7f3ff"/><rect x="104" y="8" width="108" height="104" rx="14" fill="#14233f"/><rect x="100" y="8" width="14" height="104" fill="#14233f"/>' +
      '<circle cx="34" cy="34" r="16" fill="' + gold + '" stroke="' + orange + '" stroke-width="3"/>' +
      '<g fill="#fff"><circle cx="176" cy="22" r="1.4"/><circle cx="196" cy="48" r="1.1"/><circle cx="186" cy="96" r="1.3"/><circle cx="160" cy="104" r="1"/></g>' +
      disc("clipDN", 120, 62, 34, "#3d7fe0", '<ellipse cx="106" cy="52" rx="16" ry="9" fill="' + leaf + '"/><ellipse cx="134" cy="76" rx="13" ry="8" fill="' + leafDark + '"/>' +
        '<rect x="120" y="20" width="40" height="90" fill="#0b1630" opacity="0.6"/>')),
    pluto: wrap(nightSky() + disc("clipPluto", 104, 64, 32, "#d9b48f",
        '<path d="M108 82 C92 72 88 58 98 54 C104 52 108 57 108 60 C108 57 112 52 118 54 C128 58 124 72 108 82 Z" fill="#fff3e0"/>' +
        '<circle cx="86" cy="54" r="5" fill="#b8916c"/><circle cx="80" cy="74" r="4" fill="#a8805a"/>') +
      disc("clipCharon", 166, 34, 12, "#a9a4a0", '<circle cx="162" cy="30" r="3" fill="#8e8984"/>')),
    kuiper: wrap(nightSky() +
      '<circle cx="24" cy="62" r="11" fill="' + gold + '" stroke="' + orange + '" stroke-width="2.5"/>' +
      disc("clipKN", 66, 62, 8, "#3d6fd8", "") +
      '<g fill="#cfe3f7">' + (function () {
        var o = "", i;
        for (i = 0; i < 46; i++) {
          var a = (i * 47) % 100 / 100, b = (i * 73) % 100 / 100;
          o += '<circle cx="' + (104 + a * 100).toFixed(1) + '" cy="' + (30 + b * 64 + Math.sin(a * 6) * 4).toFixed(1) + '" r="' + (1 + (i % 3) * 0.7).toFixed(1) + '"/>';
        }
        return o;
      })() + "</g>" +
      disc("clipKP", 150, 58, 6, "#d9b48f", "")),
    dipper: wrap(nightSky() +
      '<path d="M40 44 L72 40 L100 50 L124 62 L132 88 L172 92 L178 66 L124 62" fill="none" stroke="#9fb6dd" stroke-width="1.6" stroke-dasharray="3 3"/>' +
      [[40, 44], [72, 40], [100, 50], [124, 62], [132, 88], [172, 92], [178, 66]].map(function (p) {
        var x = p[0], y = p[1];
        return '<polygon points="' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (k) { var r = k % 2 ? 2.6 : 6.5, an = k * Math.PI / 5; return (x + Math.sin(an) * r).toFixed(1) + "," + (y - Math.cos(an) * r).toFixed(1); }).join(" ") + '" fill="#ffe56b"/>';
      }).join("")),
    planets: wrap(nightSky() +
      '<circle cx="23" cy="62" r="14" fill="' + gold + '" stroke="' + orange + '" stroke-width="3"/>' +
      disc("clipPl1", 46, 62, 3, "#b7a898", "") + disc("clipPl2", 60, 62, 5, "#f3e27a", "") + disc("clipPl3", 76, 62, 5.5, "#3d7fe0", '<ellipse cx="75" cy="61" rx="3" ry="2" fill="' + leaf + '"/>') +
      disc("clipPl4", 91, 62, 4, "#d4654a", "") +
      disc("clipPl5", 116, 62, 12, "#e6b15a", '<rect x="104" y="56" width="24" height="3" fill="#c9843a"/><rect x="104" y="64" width="24" height="3" fill="#f6d7a4"/>') +
      '<ellipse cx="152" cy="62" rx="17" ry="4.5" fill="none" stroke="#f0d59a" stroke-width="3"/>' + disc("clipPl6", 152, 62, 9, "#f0d59a", "") +
      disc("clipPl7", 180, 62, 6.5, "#b7efe8", "") + disc("clipPl8", 200, 62, 6.5, "#3d6fd8", "")),
    idea: wrap(
      '<circle cx="110" cy="52" r="28" fill="' + gold + '" stroke="' + orange + '" stroke-width="3"/>' +
      '<rect x="102" y="80" width="16" height="10" rx="2" fill="' + wood + '"/>' +
      '<path d="M98 96 H122" stroke="' + woodDark + '" stroke-width="3" stroke-linecap="round"/>' +
      eyes(110, 50, 6)),
    letter: wrap('<text x="110" y="86" text-anchor="middle" font-size="78" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="' + red + '">A</text>'),
    word: wrap('<text x="110" y="76" text-anchor="middle" font-size="48" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="#2f6fed">abc</text>'),
    dots: wrap('<g>' +
      '<circle cx="70" cy="60" r="16" fill="' + red + '"/>' +
      '<circle cx="110" cy="60" r="16" fill="' + gold + '"/>' +
      '<circle cx="150" cy="60" r="16" fill="' + blue + '"/></g>'),
    shape: wrap('<circle cx="110" cy="60" r="34" fill="' + blue + '" stroke="#2f6fed" stroke-width="4"/>'),
    pie: wrap(
      '<circle cx="110" cy="60" r="36" fill="#fff" stroke="' + wood + '" stroke-width="6"/>' +
      '<path d="M110 60 L110 24 A36 36 0 0 1 146 60 Z" fill="' + red + '"/>'),
    groups: wrap('<g>' +
      '<circle cx="48" cy="40" r="10" fill="' + gold + '"/><circle cx="74" cy="40" r="10" fill="' + gold + '"/>' +
      '<circle cx="48" cy="72" r="10" fill="' + gold + '"/><circle cx="74" cy="72" r="10" fill="' + gold + '"/>' +
      '<circle cx="146" cy="40" r="10" fill="' + blue + '"/><circle cx="172" cy="40" r="10" fill="' + blue + '"/>' +
      '<circle cx="146" cy="72" r="10" fill="' + blue + '"/><circle cx="172" cy="72" r="10" fill="' + blue + '"/></g>'),
    sum: wrap('<text x="110" y="82" text-anchor="middle" font-size="72" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="' + leafDark + '">+</text>'),
    place: wrap('<text x="110" y="82" text-anchor="middle" font-size="68" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="#2f6fed">10</text>'),
    rect: wrap('<g>' +
      '<rect x="62" y="32" width="22" height="22" rx="4" fill="' + blue + '"/>' +
      '<rect x="88" y="32" width="22" height="22" rx="4" fill="' + gold + '"/>' +
      '<rect x="62" y="58" width="22" height="22" rx="4" fill="' + gold + '"/>' +
      '<rect x="88" y="58" width="22" height="22" rx="4" fill="' + blue + '"/></g>'),
    skip: wrap('<text x="110" y="74" text-anchor="middle" font-size="36" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="' + ink + '">2, 4, 6</text>')
  };

  M.sceneHTML = function (name) {
    var inner = art[name] || art.idea;
    return '<div class="scene scene-' + (name || "idea") + '">' + inner + "</div>";
  };
})(window.Merit = window.Merit || {});
