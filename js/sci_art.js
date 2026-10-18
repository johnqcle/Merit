(function (M) {
  "use strict";
  // v26 Science topic pictures (Plants, Animals, Human body, Matter): self-contained SVG in the same card frame,
  // ink outline and 3D shading (M.shade3d) as the other scene pictures. Names start with "sci-".
  var INK = "#2d2a32";
  function sk(w) { return ' stroke="' + INK + '" stroke-width="' + (w || 2.5) + '" stroke-linejoin="round"'; }
  function frame(inner) {
    return '<svg class="scene-svg" viewBox="0 0 220 120" role="img">' +
      '<rect x="3" y="3" width="214" height="114" rx="18" fill="#fffdf6" stroke="#e7c48a" stroke-width="3"/>' + inner + "</svg>";
  }
  function face(x, y, s) {
    s = s || 1;
    return '<circle cx="' + (x - 4 * s) + '" cy="' + y + '" r="' + 1.8 * s + '" fill="' + INK + '"/><circle cx="' + (x + 4 * s) + '" cy="' + y + '" r="' + 1.8 * s + '" fill="' + INK + '"/>' +
      '<path d="M' + (x - 4 * s) + " " + (y + 4 * s) + " Q" + x + " " + (y + 8 * s) + " " + (x + 4 * s) + " " + (y + 4 * s) + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
  }
  function label(x, y, t, anchor) {
    return '<text x="' + x + '" y="' + y + '" font-size="10" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="' + INK + '" text-anchor="' + (anchor || "start") + '">' + t + "</text>";
  }
  function line(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#8d6840" stroke-width="1.5" stroke-dasharray="3 2"/>'; }
  function soil() { return '<rect x="10" y="80" width="200" height="30" rx="8" fill="#8d6840"/><rect x="10" y="80" width="200" height="6" fill="#6fbf5f"/>'; }
  function sun(x, y, r) {
    var rays = "";
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; rays += '<line x1="' + (x + Math.cos(a) * (r + 3)).toFixed(1) + '" y1="' + (y + Math.sin(a) * (r + 3)).toFixed(1) + '" x2="' + (x + Math.cos(a) * (r + 9)).toFixed(1) + '" y2="' + (y + Math.sin(a) * (r + 9)).toFixed(1) + '" stroke="#e0a106" stroke-width="3" stroke-linecap="round"/>'; }
    return rays + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#ffd23f"' + sk(2) + "/>" + face(x, y - 1, 0.8);
  }
  function flower(x, y, c) {
    var p = "";
    for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; p += '<circle cx="' + (x + Math.cos(a) * 8).toFixed(1) + '" cy="' + (y + Math.sin(a) * 8).toFixed(1) + '" r="6" fill="' + c + '"' + sk(1.5) + "/>"; }
    return p + '<circle cx="' + x + '" cy="' + y + '" r="5.5" fill="#ffd23f"' + sk(1.5) + "/>";
  }
  function leaf(x, y, rot, s) {
    s = s || 1;
    return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ") scale(" + s + ')"><path d="M0 0 Q12 -12 26 0 Q12 12 0 0 Z" fill="#3cbf6e"' + sk(2) + '/><path d="M2 0 H22" stroke="#1f8a45" stroke-width="1.5"/></g>';
  }
  function drop(x, y, s, c) {
    s = s || 1;
    return '<path transform="translate(' + x + " " + y + ") scale(" + s + ')" d="M0 -16 Q12 0 10 6 A10 10 0 0 1 -10 6 Q-12 0 0 -16 Z" fill="' + (c || "#5aa9ff") + '"' + sk(2) + "/>" +
      '<ellipse cx="' + (x - 4 * s) + '" cy="' + (y + 0 * s) + '" rx="' + 2.5 * s + '" ry="' + 4 * s + '" fill="#fff" opacity="0.6"/>';
  }
  function ice(x, y, s) {
    s = s || 1; var w = 34 * s, d = 9 * s;
    return '<g transform="translate(' + x + "," + y + ')"><polygon points="0,' + d + " " + d + ",0 " + (w + d) + ",0 " + w + "," + d + '" fill="#e6f7ff"' + sk(2) + "/>" +
      '<polygon points="' + w + "," + d + " " + (w + d) + ",0 " + (w + d) + "," + w + " " + w + "," + (w + d) + '" fill="#9fd4f2"' + sk(2) + "/>" +
      '<rect x="0" y="' + d + '" width="' + w + '" height="' + w + '" rx="4" fill="#bfe6fb"' + sk(2) + "/>" +
      '<rect x="' + 4 * s + '" y="' + (d + 4 * s) + '" width="' + 10 * s + '" height="' + 4 * s + '" rx="2" fill="#fff" opacity="0.8"/></g>';
  }
  function cloud(x, y, s, c) {
    s = s || 1;
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><path d="M-22 8 A10 10 0 0 1 -14 -8 A13 13 0 0 1 8 -12 A11 11 0 0 1 22 2 A8 8 0 0 1 20 14 H-18 A7 7 0 0 1 -22 8 Z" fill="' + (c || "#f2f6fb") + '"' + sk(2) + "/></g>";
  }
  function atom(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"' + sk(1.8) + '/><circle cx="' + (x - r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + r * 0.25 + '" fill="#fff" opacity="0.7"/>'; }
  function arrow(x1, y, x2, c) { return '<path d="M' + x1 + " " + y + " H" + (x2 - 6) + '" stroke="' + (c || "#e24b4b") + '" stroke-width="3.5" stroke-linecap="round"/><path d="M' + (x2 - 8) + " " + (y - 6) + " L" + x2 + " " + y + " L" + (x2 - 8) + " " + (y + 6) + '" fill="none" stroke="' + (c || "#e24b4b") + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'; }

  var S = {
    plantparts: function () {
      return soil() + '<path d="M74 82 q-10 12 -18 22 M78 84 q2 12 -2 22 M82 82 q12 10 20 20" fill="none" stroke="#f3e2c0" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="75" y="34" width="7" height="50" rx="3" fill="#3a9a4f"' + sk(2) + "/>" + leaf(80, 60, -25) + leaf(76, 52, 205) + flower(78, 28, "#ff8fab") +
        line(92, 28, 132, 22) + label(136, 25, "Flower") + line(104, 54, 132, 46) + label(136, 49, "Leaf") +
        line(83, 72, 132, 70) + label(136, 73, "Stem") + line(100, 100, 132, 96) + '<text x="136" y="99" font-size="10" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="#fff">Roots</text>';
    },
    seedgrow: function () {
      return soil() + '<ellipse cx="40" cy="92" rx="10" ry="7" fill="#b07a45"' + sk(2) + "/>" + arrow(56, 70, 76) +
        '<ellipse cx="98" cy="92" rx="9" ry="6" fill="#b07a45"' + sk(2) + '/><path d="M98 87 V66" stroke="#3a9a4f" stroke-width="4"/>' + leaf(98, 68, -40, 0.6) + leaf(98, 68, 220, 0.6) +
        arrow(120, 70, 140) + '<rect x="166" y="38" width="6" height="44" rx="3" fill="#3a9a4f"' + sk(2) + "/>" + leaf(170, 66, -25, 0.9) + leaf(168, 56, 205, 0.9) + flower(169, 32, "#ffb703") +
        label(40, 22, "seed", "middle") + label(98, 22, "sprout", "middle") + label(169, 16, "plant", "middle");
    },
    sunleaf: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#d7f3ff"/>' + sun(40, 34, 15) +
        '<path d="M60 48 L100 66" stroke="#ffd23f" stroke-width="4" stroke-dasharray="6 4"/>' +
        '<g transform="translate(96 64)"><path d="M0 0 Q36 -34 78 0 Q36 34 0 0 Z" fill="#3cbf6e"' + sk(2.5) + '/><path d="M4 0 H70 M30 0 l10 -10 M30 0 l10 10 M50 0 l8 -8 M50 0 l8 8" stroke="#1f8a45" stroke-width="2"/></g>' +
        face(136, 60, 1.1) + drop(118, 102, 0.6) + label(130, 106, "water") + label(150, 26, "air") + '<circle cx="176" cy="22" r="3" fill="#cfd8e3"' + sk(1) + '/><circle cx="186" cy="28" r="2.5" fill="#cfd8e3"' + sk(1) + "/>";
    },
    flowerbee: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#e8fbe4"/>' + '<rect x="58" y="56" width="6" height="52" fill="#3a9a4f"/>' + leaf(62, 86, -30) + flower(61, 50, "#ff8fab") +
        '<rect x="158" y="62" width="6" height="46" fill="#3a9a4f"/>' + flower(161, 56, "#7b4fd6") +
        '<path d="M76 40 Q110 10 146 44" fill="none" stroke="#e0a106" stroke-width="2" stroke-dasharray="3 4"/>' +
        '<g transform="translate(112 30)"><ellipse cx="-4" cy="-8" rx="7" ry="5" fill="#e6f7ff" opacity="0.9"' + sk(1.5) + '/><ellipse cx="6" cy="-8" rx="7" ry="5" fill="#e6f7ff" opacity="0.9"' + sk(1.5) + "/>" +
        '<ellipse cx="0" cy="0" rx="14" ry="9" fill="#ffd23f"' + sk(2) + '/><path d="M-4 -8 V8 M4 -8 V8" stroke="' + INK + '" stroke-width="3"/>' + face(-10, -1, 0.6) + "</g>";
    },
    coverings: function () {
      return '<circle cx="45" cy="60" r="28" fill="#c98a4b"' + sk() + '/><path d="M28 50 q6 -4 10 0 M44 44 q6 -4 10 0 M34 68 q6 -4 10 0 M50 62 q6 -4 10 0" fill="none" stroke="#8d5a2b" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="110" cy="60" r="28" fill="#5aa9ff"' + sk() + '/><path d="M92 54 q8 -14 18 -2 q8 -14 18 -2 M92 70 q8 -14 18 -2 q8 -14 18 -2" fill="none" stroke="#2f6fed" stroke-width="2.5"/>' +
        '<circle cx="175" cy="60" r="28" fill="#3fb55a"' + sk() + '/><path d="M155 50 a6 6 0 0 0 12 0 a6 6 0 0 0 12 0 a6 6 0 0 0 12 0 M155 64 a6 6 0 0 0 12 0 a6 6 0 0 0 12 0 a6 6 0 0 0 12 0" fill="none" stroke="#1f8a45" stroke-width="2"/>' +
        label(45, 106, "fur", "middle") + label(110, 106, "feathers", "middle") + label(175, 106, "scales", "middle");
    },
    habitats: function () {
      return '<rect x="10" y="10" width="64" height="100" rx="12" fill="#cdeec8"/><polygon points="42,22 26,62 58,62" fill="#2f8f55"' + sk(2) + '/><rect x="38" y="62" width="8" height="18" fill="#8d6840"' + sk(1.5) + "/>" +
        '<rect x="78" y="10" width="64" height="100" rx="12" fill="#bfe6fb"/><path d="M78 50 q16 -8 32 0 t32 0 V110 H78 Z" fill="#2f6fed"/><ellipse cx="110" cy="76" rx="14" ry="8" fill="#ffb703"' + sk(2) + '/><polygon points="96,76 86,68 86,84" fill="#ffb703"' + sk(2) + '/><circle cx="116" cy="74" r="1.6" fill="' + INK + '"/>' +
        '<rect x="146" y="10" width="64" height="100" rx="12" fill="#ffe7b0"/><circle cx="192" cy="28" r="9" fill="#ffd23f"' + sk(1.5) + '/><rect x="172" y="44" width="10" height="40" rx="5" fill="#3fb55a"' + sk(2) + '/><path d="M172 60 h-8 v-10" fill="none" stroke="#3fb55a" stroke-width="6" stroke-linecap="round"/><path d="M146 84 q32 -10 64 0 V110 H146 Z" fill="#e7c48a"/>' +
        label(42, 102, "forest", "middle") + '<text x="110" y="102" font-size="10" font-family="Nunito, Segoe UI, sans-serif" font-weight="800" fill="#fff" text-anchor="middle">ocean</text>' + label(178, 102, "desert", "middle");
    },
    lifecycle: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#d7f3ff"/><rect x="10" y="78" width="200" height="32" rx="10" fill="#7eb6ff"/>' +
        '<circle cx="34" cy="60" r="6" fill="#e6f7ff"' + sk(1.5) + '/><circle cx="44" cy="64" r="6" fill="#e6f7ff"' + sk(1.5) + '/><circle cx="38" cy="70" r="6" fill="#e6f7ff"' + sk(1.5) + '/><circle cx="34" cy="60" r="2" fill="' + INK + '"/><circle cx="44" cy="64" r="2" fill="' + INK + '"/><circle cx="38" cy="70" r="2" fill="' + INK + '"/>' +
        arrow(56, 64, 74) + '<ellipse cx="96" cy="64" rx="11" ry="9" fill="#5e7d3a"' + sk(2) + '/><path d="M106 64 q12 -8 18 2 q-8 4 -18 0" fill="#7a9a4f"' + sk(1.5) + '/><circle cx="92" cy="62" r="1.6" fill="#fff"/>' +
        arrow(130, 64, 148) + '<ellipse cx="180" cy="66" rx="20" ry="14" fill="#3fb55a"' + sk(2) + '/><circle cx="170" cy="52" r="6" fill="#3fb55a"' + sk(2) + '/><circle cx="190" cy="52" r="6" fill="#3fb55a"' + sk(2) + '/><circle cx="170" cy="52" r="2" fill="' + INK + '"/><circle cx="190" cy="52" r="2" fill="' + INK + '"/><path d="M172 70 q8 6 16 0" fill="none" stroke="' + INK + '" stroke-width="1.6"/>' +
        label(39, 26, "eggs", "middle") + label(102, 26, "tadpole", "middle") + label(180, 26, "frog", "middle");
    },
    groups: function () {
      return '<g transform="translate(40 58)"><ellipse cx="0" cy="0" rx="20" ry="14" fill="#e24b4b"' + sk(2) + '/><circle cx="14" cy="-12" r="8" fill="#e24b4b"' + sk(2) + '/><polygon points="22,-12 30,-9 22,-7" fill="#ffb703"' + sk(1.2) + '/><path d="M-6 -4 q10 -10 18 6" fill="#c23b3b"' + sk(1.5) + '/><circle cx="16" cy="-13" r="1.6" fill="' + INK + '"/></g>' +
        '<g transform="translate(110 58)"><ellipse cx="0" cy="0" rx="22" ry="12" fill="#ffb703"' + sk(2) + '/><polygon points="-20,0 -34,-10 -34,10" fill="#ffb703"' + sk(2) + '/><circle cx="12" cy="-3" r="2" fill="' + INK + '"/><path d="M0 -10 q6 10 0 20" fill="none" stroke="#e0a106" stroke-width="2"/></g>' +
        '<g transform="translate(178 60)"><ellipse cx="0" cy="0" rx="12" ry="9" fill="#2d2a32"/><ellipse cx="0" cy="0" rx="10" ry="8" fill="#e24b4b"/><path d="M0 -8 V8" stroke="' + INK + '" stroke-width="1.5"/><circle cx="-4" cy="-2" r="2" fill="' + INK + '"/><circle cx="4" cy="3" r="2" fill="' + INK + '"/><circle cx="0" cy="-11" r="5" fill="' + INK + '"/>' +
        '<path d="M-10 -4 h-8 M-11 2 h-9 M-10 7 h-8 M10 -4 h8 M11 2 h9 M10 7 h8" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/></g>' +
        label(40, 100, "bird", "middle") + label(110, 100, "fish", "middle") + label(178, 100, "insect", "middle");
    },
    senses: function () {
      return '<circle cx="64" cy="60" r="38" fill="#f6c9a0"' + sk() + '/><path d="M30 46 Q36 18 64 20 Q94 18 98 46 Q80 32 60 34 Q42 34 30 46 Z" fill="#6b4226"' + sk(2) + "/>" +
        '<circle cx="50" cy="56" r="7" fill="#fff"' + sk(1.5) + '/><circle cx="78" cy="56" r="7" fill="#fff"' + sk(1.5) + '/><circle cx="51" cy="57" r="3.5" fill="#2f6fed"/><circle cx="79" cy="57" r="3.5" fill="#2f6fed"/>' +
        '<path d="M64 60 q-4 10 2 12" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M50 80 q14 12 28 0 q-14 4 -28 0 Z" fill="#e24b4b"' + sk(1.5) + "/>" +
        '<ellipse cx="26" cy="62" rx="5" ry="9" fill="#f6c9a0"' + sk(2) + '/><ellipse cx="102" cy="62" rx="5" ry="9" fill="#f6c9a0"' + sk(2) + "/>" +
        label(124, 26, "see") + label(124, 46, "hear") + label(124, 66, "smell") + label(124, 86, "taste") + label(124, 106, "touch") +
        '<g transform="translate(184 92)"><rect x="-10" y="-8" width="20" height="18" rx="6" fill="#f6c9a0"' + sk(2) + '/><rect x="-10" y="-22" width="6" height="16" rx="3" fill="#f6c9a0"' + sk(2) + '/><rect x="-3" y="-24" width="6" height="18" rx="3" fill="#f6c9a0"' + sk(2) + '/><rect x="4" y="-22" width="6" height="16" rx="3" fill="#f6c9a0"' + sk(2) + "/></g>";
    },
    skeleton: function () {
      function bone(x1, y1, x2, y2) {
        return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#fbf6e9" stroke-width="5.5" stroke-linecap="round"/>' +
          '<circle cx="' + x1 + '" cy="' + y1 + '" r="4.5" fill="#fbf6e9"' + sk(1.5) + '/><circle cx="' + x2 + '" cy="' + y2 + '" r="4.5" fill="#fbf6e9"' + sk(1.5) + "/>";
      }
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#e8eefc"/><circle cx="60" cy="28" r="13" fill="#fbf6e9"' + sk(2) + "/>" + face(60, 27, 0.9) +
        bone(60, 44, 60, 74) + '<path d="M48 50 q12 6 24 0 M48 58 q12 6 24 0 M50 66 q10 5 20 0" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
        bone(48, 46, 34, 66) + bone(72, 46, 86, 66) + bone(54, 78, 48, 102) + bone(66, 78, 72, 102) +
        '<g transform="translate(150 66)"><path d="M-36 14 Q-30 -6 -6 -6 L10 -30 Q18 -38 26 -30 L14 -2 Q8 18 -16 22 Z" fill="#ff8fab"' + sk(2.5) + '/><path d="M-20 0 q10 -16 26 -10" fill="none" stroke="#e05582" stroke-width="2.5"/></g>' +
        label(118, 104, "bones and muscles");
    },
    heartlungs: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#fff0f3"/>' +
        '<path d="M40 30 Q22 34 24 70 Q26 98 52 94 Q62 90 62 70 V36 Q56 26 40 30 Z" fill="#ff9fb4"' + sk(2.5) + "/>" +
        '<path d="M180 30 Q198 34 196 70 Q194 98 168 94 Q158 90 158 70 V36 Q164 26 180 30 Z" fill="#ff9fb4"' + sk(2.5) + "/>" +
        '<path d="M110 16 V40 M110 40 Q90 44 66 50 M110 40 Q130 44 154 50" fill="none" stroke="#c9d0dc" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M110 96 C76 74 80 46 98 48 C106 48 110 56 110 60 C110 56 114 48 122 48 C140 46 144 74 110 96 Z" fill="#e24b4b"' + sk(2.5) + "/>" + face(110, 64, 1.2) +
        '<ellipse cx="98" cy="54" rx="5" ry="3" fill="#fff" opacity="0.6"/>' + label(110, 108, "heart", "middle") + label(42, 108, "lung", "middle") + label(178, 108, "lung", "middle");
    },
    tummy: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#fff6e6"/>' +
        '<path d="M60 16 V40" stroke="#ff9fb4" stroke-width="8" stroke-linecap="round"/><path d="M60 40 Q50 52 58 70 Q72 92 100 80 Q110 70 92 64 Q78 62 76 46 Q72 36 60 40 Z" fill="#ff8fab"' + sk(2.5) + "/>" + face(74, 66, 1) +
        '<path d="M100 84 q20 10 34 -2 q14 -12 30 0 q14 12 24 0" fill="none" stroke="#ffb3c4" stroke-width="7" stroke-linecap="round"/>' +
        '<g transform="translate(170 40)"><circle cx="0" cy="0" r="16" fill="#e24b4b"' + sk(2) + '/><path d="M0 -16 q2 -8 8 -8" fill="none" stroke="#3a9a4f" stroke-width="3"/><ellipse cx="-5" cy="-6" rx="4" ry="2.5" fill="#fff" opacity="0.6"/></g>' +
        '<g transform="translate(126 40)"><path d="M-10 6 Q-10 -12 0 -12 Q10 -12 10 6 Z" fill="#fff"' + sk(2) + '/><path d="M-10 6 H10" stroke="' + INK + '" stroke-width="2"/></g>' + label(60, 106, "stomach", "middle");
    },
    states: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#eef7ff"/>' + ice(22, 40, 1) + face(39, 66, 0.9) +
        drop(110, 66, 1.6) + face(110, 72, 0.9) + cloud(176, 58, 1.3) + face(176, 60, 0.9) +
        '<path d="M166 84 q-4 6 0 12 M182 84 q-4 6 0 12" fill="none" stroke="#9fb2c8" stroke-width="2.5" stroke-linecap="round"/>' +
        label(43, 104, "solid", "middle") + label(110, 104, "liquid", "middle") + label(176, 104, "gas", "middle");
    },
    icecube: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#e6f4ff"/>' + ice(56, 26, 1.7) + face(85, 72, 1.3) +
        '<path d="M150 30 l6 6 M156 30 l-6 6 M153 26 v14 M146 33 h14" stroke="#7eb6ff" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M174 60 l5 5 M179 60 l-5 5 M176.5 56 v12 M170.5 62 h12" stroke="#7eb6ff" stroke-width="2.5" stroke-linecap="round"/>' + label(152, 98, "solid ice");
    },
    waterdrop: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#e6f4ff"/>' + drop(80, 58, 2.6) + face(80, 70, 1.3) +
        '<path d="M126 92 Q160 82 196 92" fill="none" stroke="#5aa9ff" stroke-width="4" stroke-linecap="round"/>' + drop(150, 52, 0.8) + drop(176, 40, 0.6) + label(140, 108, "liquid water");
    },
    steam: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#f4f1ff"/>' +
        '<path d="M40 74 H112 L106 104 H46 Z" fill="#7b88a8"' + sk(2.5) + '/><rect x="34" y="68" width="84" height="8" rx="4" fill="#a7b2cc"' + sk(2) + "/>" +
        '<path d="M52 104 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0" fill="#ffb703"' + sk(1.2) + "/>" +
        '<path d="M60 64 q-8 -10 0 -20 q8 -10 0 -20 M78 64 q-8 -10 0 -20 q8 -10 0 -20 M96 64 q-8 -10 0 -20 q8 -10 0 -20" fill="none" stroke="#b9c4d8" stroke-width="4" stroke-linecap="round"/>' +
        cloud(164, 42, 1.5) + face(164, 44, 1) + label(164, 92, "gas", "middle");
    },
    melt: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#fff7e0"/>' + sun(190, 28, 10) + ice(22, 44, 1.1) + arrow(78, 66, 112, "#f28c28") +
        '<ellipse cx="160" cy="88" rx="34" ry="9" fill="#7eb6ff"' + sk(2) + "/>" + '<path d="M140 88 q20 -36 40 0" fill="#bfe6fb"' + sk(2) + "/>" + face(160, 78, 0.9) +
        label(46, 106, "freeze", "middle") + label(95, 56, "warm", "middle") + label(160, 106, "melt", "middle");
    },
    molecules: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#eef2ff"/>' +
        atom(70, 60, 20, "#e24b4b") + atom(46, 82, 12, "#f4f6fa") + atom(94, 82, 12, "#f4f6fa") + face(70, 58, 1) +
        atom(150, 44, 9, "#2f6fed") + atom(168, 44, 9, "#2f6fed") + atom(150, 82, 9, "#3fb55a") + atom(172, 82, 9, "#ffb703") + atom(192, 70, 7, "#7b4fd6") +
        label(70, 24, "molecule", "middle") + label(162, 24, "atoms", "middle");
    },
    mixture: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#f2fbf4"/>' +
        '<path d="M40 30 H96 L90 102 H46 Z" fill="#e6f7ff"' + sk(2.5) + '/><path d="M43 52 H93 L90 102 H46 Z" fill="#9fd4f2"/>' +
        '<circle cx="56" cy="92" r="4" fill="#c98a4b"/><circle cx="68" cy="96" r="3.5" fill="#8d6840"/><circle cx="80" cy="92" r="4" fill="#c98a4b"/><circle cx="62" cy="84" r="3" fill="#8d6840"/>' +
        '<path d="M126 30 H182 L176 102 H132 Z" fill="#e6f7ff"' + sk(2.5) + '/><path d="M129 52 H179 L176 102 H132 Z" fill="#a8e6c4"/>' +
        '<line x1="168" y1="22" x2="150" y2="94" stroke="#b07a45" stroke-width="5" stroke-linecap="round"/>' +
        label(68, 22, "mixture", "middle") + label(154, 116 - 8, "", "middle") + label(154, 22, "solution", "middle");
    }
  };
  M.SCI_SCENE_IDS = Object.keys(S).map(function (k) { return "sci-" + k; });
  M.sciSceneSvg = function (name) {
    var k = String(name || "").replace(/^sci-/, "");
    return S[k] ? (M.shade3d ? M.shade3d(frame(S[k]())) : frame(S[k]())) : "";
  };
  if (M.sceneHTML && !M.sceneHTML.sci) {
    var prev = M.sceneHTML;
    var cache = {};
    M.sceneHTML = function (name) {
      if (/^sci-/.test(name || "") && S[name.slice(4)]) {
        if (!cache[name]) cache[name] = '<div class="scene scene-' + name + '">' + M.sciSceneSvg(name) + "</div>";
        return cache[name];
      }
      return prev(name);
    };
    M.sceneHTML.sci = true;
  }
})(window.Merit = window.Merit || {});
