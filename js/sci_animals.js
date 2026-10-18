(function (M) {
  "use strict";
  // v27 Animals art: a library of cute 3D-look animals (soft radial gradients, highlights, ground shadows, friendly
  // faces), habitat tiles and body-covering close-ups, composed per Animals question (M.SCI_ANIMAL_ART, key = scene
  // "sci-an-<key>"). Pictures show the question's animal or every answer choice, never marking the right one.
  var INK = "#2d2a32";
  var used = {};
  function hx(c) { c = c.replace("#", ""); return c.length === 3 ? c.split("").map(function (x) { return x + x; }).join("") : c; }
  function mix(c, t, a) {
    var h = hx(c), o = "#";
    for (var i = 0; i < 3; i++) { var v = parseInt(h.substr(i * 2, 2), 16); v = Math.round(v + (t - v) * a); o += ("0" + v.toString(16)).slice(-2); }
    return o;
  }
  function G(c) { var h = hx(c); used[h] = true; return "url(#ang-" + h + ")"; }
  function defs() {
    return "<defs>" + Object.keys(used).map(function (h) {
      return '<radialGradient id="ang-' + h + '" cx="0.36" cy="0.3" r="0.8"><stop offset="0" stop-color="' + mix("#" + h, 255, 0.5) +
        '"/><stop offset="0.55" stop-color="#' + h + '"/><stop offset="1" stop-color="' + mix("#" + h, 0, 0.28) + '"/></radialGradient>';
    }).join("") + "</defs>";
  }
  var S = ' stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  function el(x, y, rx, ry, c, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + G(c) + '"' + S + (rot ? ' transform="rotate(' + rot + " " + x + " " + y + ')"' : "") + "/>"; }
  function ci(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + G(c) + '"' + S + "/>"; }
  function pa(d, c) { return '<path d="' + d + '" fill="' + (c ? G(c) : "none") + '"' + S + "/>"; }
  function ln(d, c, w) { return '<path d="' + d + '" fill="none" stroke="' + (c || INK) + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function flat(d, c, op) { return '<path d="' + d + '" fill="' + c + '"' + (op ? ' opacity="' + op + '"' : "") + "/>"; }
  function dot(x, y, r, c, op) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"' + (op ? ' opacity="' + op + '"' : "") + "/>"; }
  function eye(x, y, r) {
    r = r || 4;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"' + S + "/>" + dot(x + r * 0.15, y + r * 0.1, r * 0.62, INK) + dot(x - r * 0.15, y - r * 0.25, r * 0.25, "#fff");
  }
  function smile(x, y, w) { w = w || 4; return ln("M" + (x - w) + " " + y + " Q" + x + " " + (y + w * 0.9) + " " + (x + w) + " " + y); }
  function cheek(x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="3" ry="2" fill="#ff8fab" opacity="0.6"/>'; }
  function shine(x, y, rx, ry) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="0.45"/>'; }
  function legs(xs, y, h, c, w) { return xs.map(function (x) { return '<rect x="' + (x - (w || 3)) + '" y="' + y + '" width="' + 2 * (w || 3) + '" height="' + h + '" rx="' + (w || 3) + '" fill="' + G(c) + '"' + S + "/>"; }).join(""); }

  // Each animal is drawn facing left in a box about 70 x 64 around (0, 0), feet near y = 30.
  var A = {};
  A.dog = function () {
    return ln("M24 4 q10 -10 8 -20", "#8a5a33", 4) + legs([-10, -2, 10, 18], 14, 16, "#b07a45") + el(4, 8, 22, 13, "#c98a4b") +
      ci(-16, -8, 14, "#c98a4b") + el(-27, -6, 5, 11, "#7a4a25", 15) + el(-5, -10, 5, 11, "#7a4a25", -15) + el(-22, 0, 8, 6, "#f3d9b5") +
      dot(-28, -2, 2.6, INK) + eye(-19, -11, 3.6) + eye(-10, -11, 3.6) + smile(-22, 2, 3) + cheek(-8, -2) + shine(-2, 1, 8, 3);
  };
  A.puppy = function () { return '<g transform="scale(0.85)">' + A.dog() + "</g>"; };
  A.cat = function () {
    return ln("M22 10 q16 -4 12 -22", "#d9781f", 4.5) + legs([-8, 0, 10, 16], 14, 15, "#f29a3a") + el(4, 8, 20, 12, "#f29a3a") +
      pa("M-28 -14 L-26 -30 L-16 -20 Z", "#f29a3a") + pa("M-10 -20 L-2 -30 L0 -12 Z", "#f29a3a") + ci(-14, -8, 14, "#f29a3a") +
      ln("M-14 -22 v6 M-8 -21 v5 M-20 -21 v5", "#c96a15", 2) + eye(-19, -10, 3.6) + eye(-9, -10, 3.6) + dot(-14, -3, 2, "#ff6f91") + smile(-14, 0, 3) +
      ln("M-24 -2 h-10 M-24 1 l-9 3 M-4 -2 h10 M-4 1 l9 3", INK, 1) + shine(0, 2, 8, 3);
  };
  A.kitten = function () { return '<g transform="scale(0.85)">' + A.cat() + "</g>"; };
  A.cow = function () {
    return legs([-14, -4, 12, 22], 12, 18, "#f4f1ea") + el(4, 4, 26, 15, "#f7f4ec") + flat("M-2 -8 q10 -4 12 6 q-6 8 -14 2 z", INK) + flat("M14 6 q8 0 10 8 q-8 4 -12 -2 z", INK) +
      pa("M-34 -22 q-4 -6 2 -8 M-14 -22 q4 -6 -2 -8", null) + el(-24, -10, 12, 13, "#f7f4ec") + el(-36, -14, 6, 3, "#f7f4ec", -20) + el(-12, -14, 6, 3, "#f7f4ec", 20) +
      el(-25, 0, 10, 7, "#ffb3c4") + dot(-29, 0, 1.6, INK) + dot(-21, 0, 1.6, INK) + eye(-29, -12, 3.2) + eye(-20, -12, 3.2) + shine(6, -4, 9, 3);
  };
  A.calf = function () { return '<g transform="scale(0.8)">' + A.cow() + "</g>"; };
  A.horse = function (c, mane) {
    c = c || "#a8693a"; mane = mane || "#5b3a22";
    return ln("M26 0 q10 6 6 22", mane, 5) + legs([-12, -4, 14, 22], 12, 20, c) + el(6, 4, 24, 13, c) +
      pa("M-14 -4 L-20 -26 L-8 -28 L0 -6 Z", c) + el(-26, -24, 12, 7, c, 25) + el(-34, -19, 5, 4, mix(c, 255, 0.3)) +
      pa("M-12 -30 l2 -8 l4 7", c) + ln("M-6 -28 q8 10 6 26", mane, 4) + eye(-24, -28, 3) + dot(-36, -20, 1.2, INK) + smile(-31, -16, 2) + shine(8, -2, 9, 3);
  };
  A.foal = function () { return '<g transform="scale(0.78)">' + A.horse("#c99060", "#7a5030") + "</g>"; };
  A.zebra = function () {
    return A.horse("#ffffff", INK) + ln("M-2 -2 q-2 10 2 16 M8 -6 q-2 12 2 20 M18 -6 q-2 12 2 20 M-14 -10 l6 -2 M-16 -18 l6 -2", INK, 3);
  };
  A.pig = function () {
    return ln("M24 2 q8 -2 4 -8 q-4 -4 2 -8", "#e07a96", 2.4) + legs([-12, -4, 8, 16], 12, 14, "#ff9fb8") + el(2, 4, 24, 16, "#ffb3c8") +
      pa("M-18 -16 L-16 -26 L-8 -18 Z", "#ff9fb8") + pa("M-2 -16 L4 -26 L6 -12 Z", "#ff9fb8") + ci(-10, -6, 13, "#ffb3c8") +
      el(-14, 0, 6, 4.5, "#ff8fab") + dot(-16, 0, 1.3, INK) + dot(-12, 0, 1.3, INK) + eye(-16, -9, 3) + eye(-6, -9, 3) + cheek(-2, -2) + shine(4, -6, 9, 3);
  };
  A.sheep = function (c) {
    var wool = [[-8, -2], [4, -6], [16, -2], [-12, 10], [2, 12], [16, 10], [24, 4]].map(function (p) { return ci(p[0], p[1], 9, c || "#fbfaf5"); }).join("");
    return legs([-8, 0, 12, 20], 14, 16, "#4a4458") + wool + el(-20, -6, 9, 11, "#4a4458") + el(-28, -10, 5, 2.5, "#4a4458", -20) +
      ci(-18, -16, 5, c || "#fbfaf5") + eye(-23, -7, 2.8) + eye(-16, -7, 2.8) + smile(-20, 0, 2.5);
  };
  A.lamb = function () { return '<g transform="scale(0.78)">' + A.sheep() + "</g>"; };
  A.bird = function (c, b) {
    c = c || "#4f8ff7";
    return pa("M18 2 L32 -6 L30 8 Z", mix(c, 0, 0.2)) + ln("M-4 22 v8 M4 22 v8", "#f28c28", 2.4) + el(2, 6, 20, 17, c) + el(0, 12, 12, 9, b || "#ffe7a8") +
      el(10, 4, 11, 7, mix(c, 0, 0.15), -20) + pa("M-18 -2 L-28 2 L-18 6 Z", "#ffb703") + eye(-9, -2, 4) + cheek(-6, 6) + shine(-4, -6, 7, 3);
  };
  A.parrot = function () { return A.bird("#e24b4b", "#ffd23f") + flat("M10 0 q10 4 12 12 q-10 0 -14 -8 z", "#3fb55a"); };
  A.chick = function () {
    return ln("M-4 20 v8 M4 20 v8", "#f28c28", 2.4) + ci(0, 4, 18, "#ffd84a") + el(10, 6, 7, 5, "#f5c22a", -20) + pa("M-16 2 L-24 5 L-16 8 Z", "#ff9d2a") +
      ln("M0 -14 q-2 -6 2 -8 M2 -14 q4 -5 6 -2", "#e0a106", 2) + eye(-7, 0, 3.6) + cheek(-5, 8) + shine(-4, -6, 6, 3);
  };
  A.duckling = function () { return '<g transform="scale(0.8)">' + A.chick() + "</g>"; };
  A.duck = function () {
    return pa("M-10 26 h-8 l4 -4 z M8 26 h-8 l4 -4 z", "#ff9d2a") + el(4, 10, 24, 14, "#fbfaf5") + el(10, 6, 12, 7, "#e9e6dc", -15) + pa("M24 4 l10 -6 l-2 10 z", "#fbfaf5") +
      ci(-16, -8, 11, "#3fb55a") + pa("M-26 -6 q-10 0 -12 4 q8 3 12 0 z", "#ff9d2a") + eye(-17, -11, 3.4) + dot(-6, 2, 0, "#fff") + shine(-2, 2, 9, 3);
  };
  A.chicken = function () {
    return ln("M-4 20 v10 M6 20 v10", "#f28c28", 2.4) + pa("M16 -4 q14 -10 14 6 q-4 10 -14 8 z", "#fbfaf5") + el(2, 8, 20, 15, "#fbfaf5") + el(8, 8, 10, 7, "#ece7da", -20) +
      ci(-12, -8, 10, "#fbfaf5") + pa("M-16 -18 q2 -6 5 -1 q2 -6 5 0 q3 -4 4 2 z", "#e24b4b") + el(-14, 2, 2.5, 4, "#e24b4b") + pa("M-21 -8 L-29 -5 L-21 -2 Z", "#ffb703") +
      eye(-14, -10, 3) + shine(-2, 0, 8, 3);
  };
  A.egg = function () { return '<ellipse cx="0" cy="14" rx="15" ry="19" fill="' + G("#fbf0d9") + '"' + S + "/>" + shine(-5, 4, 4, 7); };
  A.crackegg = function () { return A.egg() + ln("M-15 12 l6 -5 l5 6 l5 -6 l5 6 l5 -5 l4 4", INK, 2); };
  A.owl = function () {
    return el(0, 6, 20, 24, "#a8693a") + el(0, 12, 12, 15, "#f0d6ac") + pa("M-18 -14 L-14 -26 L-6 -16 Z M18 -14 L14 -26 L6 -16 Z", "#a8693a") +
      ci(-8, -8, 8, "#fff7e6") + ci(8, -8, 8, "#fff7e6") + eye(-8, -8, 5) + eye(8, -8, 5) + pa("M-3 -1 L3 -1 L0 5 Z", "#ffb703") +
      ln("M-6 30 v-2 M6 30 v-2", "#ffb703", 3) + shine(-8, 8, 4, 6);
  };
  A.penguin = function () {
    return pa("M-10 28 h10 l-4 -4 z M2 28 h10 l-4 -4 z", "#ff9d2a") + el(0, 4, 18, 26, "#2f3445") + el(0, 10, 12, 19, "#fbfaf5") +
      el(-18, 6, 5, 13, "#2f3445", 20) + el(18, 6, 5, 13, "#2f3445", -20) + eye(-6, -12, 3.6) + eye(6, -12, 3.6) + pa("M-4 -6 L4 -6 L0 0 Z", "#ffb703") + cheek(-9, -4) + cheek(9, -4) + shine(-6, -16, 5, 3);
  };
  A.fish = function (c) {
    c = c || "#ff9d2a";
    return pa("M18 0 L34 -12 L32 12 Z", mix(c, 0, 0.15)) + pa("M-2 -12 q8 -12 16 -2 z", mix(c, 0, 0.1)) + el(0, 0, 22, 14, c) +
      ln("M4 -12 q-4 12 0 24 M12 -10 q-3 10 0 20", mix(c, 255, 0.4), 2.4) + el(4, 8, 7, 3, mix(c, 0, 0.1), 20) + eye(-12, -3, 4) + smile(-16, 5, 2.5) + shine(-6, -7, 7, 2.5);
  };
  A.goldfish = function () { return A.fish("#ffad33"); };
  A.babyfish = function () { return '<g transform="scale(0.7)">' + A.fish("#5fb0ff") + "</g>" + dot(-26, -12, 2.5, "#bfe6fb") + dot(-30, -20, 1.8, "#bfe6fb"); };
  A.shark = function () {
    return pa("M24 -2 L40 -16 L36 0 L40 12 Z", "#7d8da6") + pa("M-2 -12 L6 -28 L12 -12 Z", "#7d8da6") + el(0, 0, 32, 13, "#93a3bd") + flat("M-30 2 q30 16 58 2 q-30 6 -58 -2 z", "#f4f6fa") +
      pa("M0 8 l-8 10 l12 -6 z", "#7d8da6") + eye(-18, -4, 3.4) + ln("M-30 4 q6 4 12 2", INK, 1.6) + ln("M-8 -4 v6 M-4 -4 v6 M0 -4 v6", "#6a7a92", 1.4) + shine(-6, -6, 10, 2.5);
  };
  A.whale = function () {
    return ln("M-14 -22 q-2 -8 -6 -10 M-14 -22 q2 -8 6 -10 M-14 -22 v-10", "#7eb6ff", 2.4) + pa("M24 0 q10 -14 16 -14 q-4 8 -2 14 q-2 6 2 14 q-6 0 -16 -14 z", "#3d6fd8") +
      el(-2, 4, 30, 18, "#4f86f0") + flat("M-30 8 q28 22 56 2 q-28 10 -56 -2 z", "#dbe9ff") + eye(-16, -2, 3.6) + smile(-22, 8, 4) + cheek(-12, 6) + shine(-8, -6, 12, 4);
  };
  A.dolphin = function () {
    return pa("M22 2 q10 -10 16 -8 q-4 6 -2 10 q-2 6 2 10 q-8 0 -16 -12 z", "#5c86b8") + pa("M0 -10 L8 -24 L12 -9 Z", "#5c86b8") + el(0, 2, 26, 11, "#6f9bd1") +
      pa("M-24 0 q-10 0 -12 4 q6 3 12 1 z", "#6f9bd1") + flat("M-24 4 q24 12 48 0 q-24 6 -48 0 z", "#e8f1ff") + eye(-14, -2, 3.2) + smile(-26, 3, 3) + shine(-4, -4, 9, 2.5);
  };
  A.frog = function () {
    return el(-16, 22, 10, 5, "#3a9a4f") + el(16, 22, 10, 5, "#3a9a4f") + el(0, 10, 24, 16, "#4cc46a") + el(0, 16, 15, 9, "#c8f0b0") +
      ci(-11, -6, 8, "#4cc46a") + ci(11, -6, 8, "#4cc46a") + eye(-11, -7, 5) + eye(11, -7, 5) + ln("M-12 6 Q0 14 12 6") + cheek(-15, 6) + cheek(15, 6) + shine(-8, 2, 7, 3);
  };
  A.tadpole = function () { return ln("M6 2 q10 -8 18 0 t16 0", "#3d4a5c", 4) + el(-2, 2, 12, 10, "#4a5a70") + eye(-6, -1, 3.2) + smile(-7, 5, 2) + shine(-5, -4, 4, 2); };
  A.babyfrog = function () { return '<g transform="translate(-5 0) scale(0.82)">' + A.tadpole() + "</g>"; };
  A.frogeggs = function () {
    var out = "";
    [[-16, 4], [-6, -4], [4, 4], [14, -4], [-8, 12], [6, 14], [18, 10], [-18, -8], [0, -14]].forEach(function (p) { out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="#e6f7ff" fill-opacity="0.85"' + S + "/>" + dot(p[0], p[1], 2.6, INK); });
    return out;
  };
  A.turtle = function () {
    return legs([-14, 12], 12, 12, "#7ac36a", 4) + el(-28, 4, 9, 8, "#8ad07a") + pa("M-20 14 Q-20 -16 2 -16 Q24 -16 24 14 Z", "#3f9a55") +
      ln("M-8 14 l4 -12 h12 l4 12 M-4 2 l-8 -12 M12 2 l8 -12", "#2a6e3c", 2) + ln("M-22 14 H26", INK, 2) + eye(-31, 1, 3) + smile(-32, 7, 2) + shine(-6, -8, 9, 3);
  };
  A.snake = function () {
    return pa("M30 18 q-6 -16 -22 -8 q-16 8 -22 -6 q-4 -10 6 -14", null) + ln("M30 18 q-6 -16 -22 -8 q-16 8 -22 -6 q-4 -10 6 -14", "#3a9a4f", 11) +
      ln("M30 18 q-6 -16 -22 -8 q-16 8 -22 -6 q-4 -10 6 -14", "#7ad38a", 5) + el(-14, -18, 11, 8, "#4cc46a") + eye(-17, -21, 3) + eye(-9, -21, 3) +
      ln("M-25 -16 h-6 l-2 -2 M-31 -16 l-2 2", "#e24b4b", 1.6) + cheek(-16, -14);
  };
  A.lizard = function () {
    return ln("M14 10 q20 4 22 14", "#3fb55a", 6) + legs([-10, 8], 10, 10, "#3fb55a") + el(0, 6, 18, 8, "#4cc46a") + el(-20, 2, 10, 7, "#4cc46a") +
      dot(-2, 2, 2, "#2a8a44") + dot(6, 6, 2, "#2a8a44") + eye(-21, -2, 3) + smile(-26, 4, 2.5) + shine(-2, 1, 7, 2);
  };
  A.butterfly = function () {
    return el(-12, -10, 13, 11, "#ff7aa8", -20) + el(12, -10, 13, 11, "#ff7aa8", 20) + el(-10, 10, 9, 8, "#ffb703", 20) + el(10, 10, 9, 8, "#ffb703", -20) +
      dot(-14, -10, 4, "#fff", 0.7) + dot(14, -10, 4, "#fff", 0.7) + el(0, 0, 4, 18, "#5b3a6e") + ln("M-2 -17 q-4 -8 -8 -8 M2 -17 q4 -8 8 -8") + dot(-1.5, -12, 1.2, "#fff") + dot(1.5, -12, 1.2, "#fff");
  };
  A.caterpillar = function () {
    return [24, 14, 4, -6].map(function (x, i) { return ci(x, 10 - (i % 2) * 3, 9, i % 2 ? "#7ad38a" : "#4cc46a"); }).join("") + ci(-17, 2, 11, "#4cc46a") +
      ln("M-21 -8 l-4 -8 M-13 -8 l2 -8") + dot(-25, -16, 2, "#e24b4b") + dot(-11, -16, 2, "#e24b4b") + eye(-21, 0, 3) + eye(-13, 0, 3) + smile(-17, 6, 3);
  };
  A.bee = function () {
    return el(-2, -14, 9, 7, "#e6f7ff", -25) + el(8, -14, 9, 7, "#e6f7ff", 25) + el(2, 4, 20, 14, "#ffd23f") +
      ln("M0 -9 v26 M10 -7 v22", INK, 4) + pa("M22 4 l7 -2 l-7 4 z", INK) + ci(-16, 0, 9, "#ffd23f") + ln("M-18 -9 q-2 -7 -6 -8 M-14 -9 q0 -7 3 -9") +
      eye(-19, -1, 3) + smile(-17, 4, 2.4) + cheek(-13, 5) + shine(0, -4, 7, 2.5);
  };
  A.ladybug = function () {
    return legs([-10, 0, 10], 10, 8, INK, 1.5) + pa("M-20 10 Q-20 -18 2 -18 Q24 -18 24 10 Z", "#e24b4b") + ln("M2 -18 V10") +
      dot(-8, -6, 4, INK) + dot(12, -6, 4, INK) + dot(-10, 4, 3, INK) + dot(14, 4, 3, INK) + ci(-20, 2, 8, "#3a3444") + eye(-23, 0, 2.6) + eye(-17, 0, 2.6) + shine(-4, -10, 6, 2.5);
  };
  A.ant = function () {
    return ln("M-6 4 l-8 14 M-2 4 l-2 16 M2 4 l6 16 M-6 4 l-12 6 M2 4 l14 6 M-2 4 l10 -2", INK, 1.8) + el(18, 4, 12, 9, "#6b3a2a") + el(0, 4, 7, 6, "#6b3a2a") +
      ci(-16, -2, 9, "#6b3a2a") + ln("M-20 -10 q-4 -8 -10 -8 M-14 -10 q0 -8 4 -10") + eye(-19, -3, 2.8) + eye(-13, -3, 2.8) + shine(16, 0, 5, 2);
  };
  A.spider = function () {
    var L = "";
    [[-1, -16], [-1, -6], [-1, 6], [-1, 16]].forEach(function (p, i) {
      L += ln("M-6 4 q-14 " + (p[1] - 10) + " -26 " + (p[1] + 12), INK, 2.6) + ln("M6 4 q14 " + (p[1] - 10) + " 26 " + (p[1] + 12), INK, 2.6);
    });
    return L + ci(0, 10, 14, "#5b4a7a") + ci(0, -8, 9, "#6d5c8c") + eye(-4, -9, 3) + eye(4, -9, 3) + smile(0, -3, 2.4) + shine(-5, 4, 5, 3);
  };
  A.bear = function (c, m) {
    c = c || "#9a6a3e"; m = m || "#e8c99a";
    return legs([-12, 12], 14, 14, c, 6) + el(0, 10, 22, 17, c) + ci(-12, -18, 6, c) + ci(12, -18, 6, c) + ci(0, -8, 15, c) + el(0, -2, 8, 6, m) +
      dot(0, -4, 2.6, INK) + eye(-6, -11, 3.2) + eye(6, -11, 3.2) + smile(0, 0, 2.5) + cheek(-10, -3) + cheek(10, -3) + shine(-5, -14, 6, 3);
  };
  A.cub = function () { return '<g transform="scale(0.72)">' + A.bear() + "</g>"; };
  A.polarbear = function () { return A.bear("#f4f1ea", "#fffdf6"); };
  A.lion = function () {
    var mane = "";
    for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5; mane += ci((Math.cos(a) * 15).toFixed(1), (-6 + Math.sin(a) * 15).toFixed(1), 8, "#c96a15"); }
    return ln("M20 14 q14 2 12 -10", "#e0a106", 3) + legs([-10, 10], 14, 14, "#f2b23a", 5) + el(4, 12, 20, 12, "#f2b23a") + mane + ci(0, -6, 13, "#f7c55a") +
      el(0, 0, 6, 4, "#fff1cc") + dot(0, -2, 2.2, INK) + eye(-5, -9, 3) + eye(5, -9, 3) + smile(0, 2, 2.5) + cheek(-8, -1) + cheek(8, -1);
  };
  A.cheetah = function () {
    return A.cat().replace(/#f29a3a/g, "#f2c14a").replace(/#d9781f/g, "#c9962a").replace(/#c96a15/g, "#c9962a") + dot(0, 6, 2, INK) + dot(10, 4, 2, INK) + dot(16, 10, 2, INK) + dot(-4, 12, 2, INK) + dot(6, 12, 1.6, INK);
  };
  A.elephant = function () {
    return legs([-12, -2, 12, 22], 14, 16, "#9aa6ba", 5) + el(6, 6, 26, 18, "#a9b4c8") + el(-8, -6, 12, 16, "#93a0b6") + ci(-20, -6, 13, "#a9b4c8") +
      pa("M-30 -2 q-8 10 -4 22 q2 4 6 2 q-4 -10 2 -18 z", "#a9b4c8") + el(-8, -6, 6, 9, "#ffc2d1") + eye(-24, -10, 3.2) + cheek(-20, 0) + pa("M-30 6 l-4 5", null) + shine(8, -4, 10, 3);
  };
  A.giraffe = function () {
    return legs([-10, -2, 10, 18], 10, 20, "#f2c14a") + el(4, 6, 20, 11, "#f5c95a") + pa("M-14 2 L-24 -30 L-14 -32 L-4 0 Z", "#f5c95a") +
      el(-24, -32, 9, 6, "#f5c95a", 15) + ln("M-26 -38 v-6 M-20 -38 v-6", "#a8693a", 2.4) + dot(-26, -44, 2, "#a8693a") + dot(-20, -44, 2, "#a8693a") +
      [[-2, 4], [10, 2], [16, 10], [-18, -10], [-16, -22], [4, 10]].map(function (p) { return dot(p[0], p[1], 3, "#b8742f"); }).join("") + eye(-24, -34, 2.6) + smile(-30, -28, 2);
  };
  A.monkey = function () {
    return ln("M14 18 q16 0 14 -16 q-2 -8 -8 -6", "#8a5a33", 3.5) + el(2, 14, 14, 14, "#9a6a3e") + ci(-14, -8, 6, "#e8c99a") + ci(14, -8, 6, "#e8c99a") + ci(0, -8, 13, "#9a6a3e") +
      el(0, -4, 10, 9, "#f0d6ac") + eye(-4, -9, 3) + eye(4, -9, 3) + smile(0, -1, 3) + el(2, 16, 7, 8, "#e8c99a");
  };
  A.rabbit = function () {
    return ci(20, 14, 6, "#fbfaf5") + legs([-6, 10], 18, 10, "#c9c4bb", 5) + el(4, 12, 18, 14, "#d9d4cb") + el(-14, -30, 4.5, 14, "#d9d4cb", -10) + el(-4, -30, 4.5, 14, "#d9d4cb", 10) +
      el(-14, -30, 2, 9, "#ffb3c4", -10) + el(-4, -30, 2, 9, "#ffb3c4", 10) + ci(-10, -8, 12, "#d9d4cb") + eye(-14, -10, 3) + eye(-6, -10, 3) + dot(-10, -4, 1.8, "#ff6f91") + smile(-10, -1, 2) + cheek(-16, -3);
  };
  A.camel = function () {
    return legs([-12, -4, 12, 20], 10, 20, "#c99a5a", 3) + el(4, 6, 22, 11, "#ddb070") + pa("M-6 -2 q6 -20 14 0 z", "#ddb070") + pa("M6 -2 q6 -18 14 0 z", "#ddb070") +
      pa("M-14 4 q-10 -10 -8 -26 l8 0 q0 12 6 20 z", "#ddb070") + el(-22, -24, 9, 6, "#ddb070") + eye(-22, -27, 2.6) + smile(-28, -21, 2) + shine(0, 2, 8, 2.5);
  };
  A.kangaroo = function () {
    return ln("M10 22 q22 4 26 -4", "#b9824a", 6) + el(2, 6, 14, 20, "#c9925a") + el(-2, 12, 7, 8, "#e8c99a") + ci(-3, 8, 4, "#c9925a") + dot(-4, 7, 1, INK) +
      pa("M-6 26 h-14 l4 -6 h8 z", "#b9824a") + el(-8, -18, 9, 8, "#c9925a") + el(-10, -30, 3, 7, "#c9925a", -10) + el(-2, -30, 3, 7, "#c9925a", 10) +
      el(-15, -16, 4, 3, "#c9925a") + eye(-8, -20, 3) + dot(-18, -16, 1.4, INK) + shine(-2, -4, 5, 4);
  };
  A.squirrel = function () {
    return pa("M8 24 q24 -2 22 -24 q-2 -16 -14 -14 q8 8 4 20 q-4 10 -12 12 z", "#d97a2b") + el(-2, 12, 12, 14, "#e48a3a") + el(-4, 16, 6, 8, "#f6d2a8") +
      ci(-6, -8, 10, "#e48a3a") + pa("M-12 -16 l0 -8 l6 6 z M-2 -16 l2 -8 l3 8 z", "#e48a3a") + eye(-10, -10, 3) + eye(-2, -10, 3) + dot(-6, -4, 1.6, INK) + ci(-14, 18, 4, "#a8693a");
  };
  A.porcupine = function () {
    var q = "";
    for (var i = 0; i < 9; i++) { var a = Math.PI + i * Math.PI / 8; q += ln("M" + (4 + Math.cos(a) * 16).toFixed(1) + " " + (8 + Math.sin(a) * 12).toFixed(1) + " l" + (Math.cos(a) * 12).toFixed(1) + " " + (Math.sin(a) * 12).toFixed(1), "#4a3a2a", 2.6); }
    return q + legs([-8, 12], 16, 8, "#7a5a3a", 4) + el(4, 10, 22, 14, "#8a6a4a") + el(-18, 12, 9, 8, "#c9a27a") + dot(-26, 12, 2, INK) + eye(-18, 9, 2.6) + smile(-22, 16, 2);
  };
  A.snail = function () {
    return pa("M-30 24 q2 -10 14 -10 h34 q8 0 8 10 z", "#c9b2e6") + ln("M-24 14 l-4 -12 M-18 14 l0 -12") + dot(-28, 2, 2.2, INK) + dot(-18, 2, 2.2, INK) +
      ci(6, 2, 18, "#e0a106") + ln("M6 2 m-12 0 a12 12 0 1 1 12 12 a8 8 0 1 1 -8 -8 a4 4 0 1 1 4 4", "#a86a10", 2.2) + smile(-24, 18, 2) + shine(0, -8, 6, 3);
  };
  A.worm = function () {
    return ln("M-28 16 q8 -16 16 0 t16 0 t16 0", "#e07a96", 10) + ln("M-28 16 q8 -16 16 0 t16 0 t16 0", "#ffa3bb", 5) + ci(24, 14, 7, "#ffa3bb") + eye(22, 12, 2.4) + eye(27, 12, 2.4);
  };


  // ----- v28 living things and nonliving objects (same look) -----
  function petals(n, r, pr, c) { var o = ""; for (var i = 0; i < n; i++) { var a = i * 2 * Math.PI / n; o += el((Math.cos(a) * r).toFixed(1), (Math.sin(a) * r).toFixed(1), pr, pr * 0.7, c, (a * 180 / Math.PI).toFixed(0)); } return o; }
  function stemLeaves(top) { return '<rect x="-2.5" y="' + top + '" width="5" height="' + (30 - top) + '" rx="2.5" fill="' + G("#3a9a4f") + '"' + S + "/>" + el(-8, 14, 8, 4, "#4cc46a", -25) + el(8, 8, 8, 4, "#4cc46a", 25); }
  A.tree = function () { return '<rect x="-6" y="0" width="12" height="30" rx="4" fill="' + G("#9a6a3e") + '"' + S + "/>" + ci(-12, -8, 14, "#3fb55a") + ci(12, -8, 14, "#3fb55a") + ci(0, -20, 16, "#4cc46a") + dot(-6, -22, 2.5, "#e24b4b") + dot(10, -10, 2.5, "#e24b4b") + shine(-6, -28, 6, 3); };
  A.rose = function () { return stemLeaves(-6) + '<g transform="translate(0 -14)">' + ci(0, 0, 11, "#e24b4b") + ln("M-6 -2 q6 -8 12 0 q-6 6 -10 0 M-3 3 q4 4 8 0", "#a8202c", 1.6) + "</g>" + shine(-4, -20, 3, 2); };
  A.flower = function () { return stemLeaves(-6) + '<g transform="translate(0 -14)">' + petals(6, 8, 6, "#ff8fab") + ci(0, 0, 5.5, "#ffd23f") + eye(-2, -1, 1.6) + "</g>"; };
  A.sunflower = function () { return stemLeaves(-8) + '<g transform="translate(0 -16)">' + petals(10, 11, 5.5, "#ffd23f") + ci(0, 0, 8, "#8a5a33") + dot(-3, -2, 1.2, "#5b3a22") + dot(3, 2, 1.2, "#5b3a22") + dot(2, -3, 1.2, "#5b3a22") + "</g>"; };
  A.seedling = function () { return pa("M-16 22 h32 l-4 10 h-24 z", "#c97a4a") + el(0, 22, 16, 3, "#6b4226") + ln("M0 22 V2", "#3a9a4f", 3.5) + el(-8, 0, 9, 5, "#4cc46a", -30) + el(8, -2, 9, 5, "#4cc46a", 30) + shine(-8, -2, 3, 1.5); };
  A.mushroom = function () { return pa("M-7 4 h14 l2 26 h-18 z", "#fbf0d9") + pa("M-22 6 Q-22 -22 0 -22 Q22 -22 22 6 Z", "#e24b4b") + dot(-10, -8, 3.5, "#fff") + dot(6, -14, 3, "#fff") + dot(12, -2, 2.6, "#fff") + eye(-4, 14, 2.4) + eye(4, 14, 2.4) + shine(-10, -14, 5, 2.5); };
  A.kid = function () { return legs([-5, 5], 16, 14, "#2f6fed", 3.5) + pa("M-12 18 q0 -18 12 -18 q12 0 12 18 z", "#ffb703") + ln("M-12 8 l-6 8 M12 8 l6 8", "#f6c9a0", 4) + ci(0, -12, 12, "#f6c9a0") + pa("M-12 -14 q2 -12 12 -12 q10 0 12 12 q-8 -6 -24 0 z", "#6b4226") + eye(-4, -12, 2.6) + eye(4, -12, 2.6) + smile(0, -6, 3) + cheek(-7, -7) + cheek(7, -7); };
  A.fox = function () { return ln("M20 10 q16 4 12 -14", "#e0661f", 6) + dot(32, -6, 3, "#fff") + legs([-8, 12], 14, 14, "#e0661f", 3) + el(4, 8, 18, 11, "#f07a2a") + pa("M-26 -16 L-22 -30 L-14 -18 Z M-6 -18 L-2 -30 L2 -14 Z", "#f07a2a") + pa("M-26 -10 q10 -16 28 0 q-6 14 -14 16 q-8 -2 -14 -16 z", "#f07a2a") + pa("M-20 -2 q6 8 12 0 q-6 10 -12 0 z", "#fff7ea") + dot(-14, 4, 2, INK) + eye(-18, -9, 2.8) + eye(-8, -9, 2.8); };
  A.hen = function () { return A.chicken(); };
  A.rock = function () { return pa("M-24 28 Q-28 6 -12 -2 Q0 -14 14 -6 Q28 2 26 28 Z", "#9aa0aa") + ln("M-8 8 l6 6 M10 2 l-4 8", "#7a808a", 1.6) + shine(-6, 2, 8, 3); };
  A.stone = A.rock;
  A.brick = function () { return '<rect x="-24" y="6" width="48" height="22" rx="3" fill="' + G("#c8553d") + '"' + S + "/>" + ln("M-24 17 H24 M-6 6 V17 M10 17 V28", "#8a3424", 1.6) + shine(-12, 10, 8, 2); };
  A.spoon = function () { return '<g transform="rotate(-30)">' + el(0, -12, 9, 12, "#c9d0dc") + '<rect x="-2.5" y="-2" width="5" height="34" rx="2.5" fill="' + G("#c9d0dc") + '"' + S + "/>" + shine(-3, -16, 3, 5) + "</g>"; };
  A.cup = function () { return ln("M16 2 q14 2 12 12 q-2 8 -14 8", INK, 6) + ln("M16 2 q14 2 12 12 q-2 8 -14 8", "#2f8fdd", 3) + pa("M-16 -6 h32 l-4 34 h-24 z", "#4fa3f7") + el(0, -6, 16, 4, "#bfe0ff") + shine(-8, 6, 3, 9); };
  A.block = function () { return '<polygon points="-18,0 -10,-8 22,-8 14,0" fill="' + G("#ecc58a") + '"' + S + '/><polygon points="14,0 22,-8 22,22 14,30" fill="' + G("#b88a4e") + '"' + S + '/><rect x="-18" y="0" width="32" height="30" rx="3" fill="' + G("#ddb070") + '"' + S + "/>" + ln("M-12 8 q8 4 0 10 q-8 4 0 10", "#b88a4e", 1.4); };
  A.cottonball = function () { return ci(-8, 14, 10, "#ffffff") + ci(8, 14, 10, "#ffffff") + ci(0, 4, 11, "#ffffff") + shine(-4, 0, 4, 2); };
  A.bell = function () { return pa("M-18 20 Q-18 -18 0 -18 Q18 -18 18 20 Z", "#ffc93a") + ci(0, -21, 3.5, "#e0a106") + ci(0, 24, 5, "#e0a106") + '<rect x="-21" y="18" width="42" height="5" rx="2.5" fill="' + G("#e0a106") + '"' + S + "/>" + shine(-7, -6, 4, 8); };
  A.icecube = function () { return '<polygon points="-16,-2 -8,-10 20,-10 12,-2" fill="' + G("#e6f7ff") + '"' + S + '/><polygon points="12,-2 20,-10 20,18 12,26" fill="' + G("#9fd4f2") + '"' + S + '/><rect x="-16" y="-2" width="28" height="28" rx="4" fill="' + G("#bfe6fb") + '"' + S + "/>" + shine(-9, 4, 4, 2); };
  A.balloon = function () { return ln("M0 14 q-6 8 2 18", INK, 1.4) + el(0, -6, 16, 19, "#e24b4b") + pa("M-3 13 h6 l-3 4 z", "#c23b3b") + shine(-6, -14, 4, 6); };
  A.coin = function () { return ci(0, 6, 20, "#ffd23f") + ci(0, 6, 14, "#f2c12a") + '<path d="M0 -3 l3 6 l6 1 l-4.5 4 l1 6 l-5.5 -3 l-5.5 3 l1 -6 l-4.5 -4 l6 -1 z" fill="#e0a106"/>' + shine(-8, -4, 5, 3); };
  A.pencil = function () { return '<g transform="rotate(-35)"><rect x="-5" y="-26" width="10" height="40" fill="' + G("#ffc93a") + '"' + S + '/><rect x="-5" y="-32" width="10" height="7" rx="2" fill="' + G("#ff8fab") + '"' + S + '/><path d="M-5 14 L0 28 L5 14 Z" fill="' + G("#f3d9b5") + '"' + S + '/><path d="M-1.8 22 L0 28 L1.8 22 Z" fill="' + INK + '"/></g>'; };
  A.marble = function () { return ci(0, 8, 16, "#5aa9ff") + ln("M-10 2 q10 10 20 -2 M-8 14 q8 -6 18 4", "#e24b4b", 2.4) + shine(-6, 0, 5, 3); };
  A.cloud = function () { return pa("M-26 14 A11 11 0 0 1 -18 -4 A14 14 0 0 1 6 -10 A12 12 0 0 1 22 4 A9 9 0 0 1 22 20 H-20 A7 7 0 0 1 -26 14 Z", "#f2f6fb") + eye(-6, 6, 2.4) + eye(4, 6, 2.4) + smile(-1, 11, 2.4); };
  A.chair = function () { return legs([-14, 12], 8, 22, "#a8693a", 2.5) + '<rect x="-14" y="-24" width="6" height="34" rx="2" fill="' + G("#a8693a") + '"' + S + '/><rect x="-18" y="2" width="36" height="8" rx="3" fill="' + G("#c98a4b") + '"' + S + '/><rect x="-16" y="-24" width="8" height="26" rx="3" fill="' + G("#c98a4b") + '"' + S + "/>"; };
  A.ball = function () { return ci(0, 8, 20, "#e24b4b") + pa("M-20 8 Q0 -4 20 8 Q0 20 -20 8 Z", "#fff") + ln("M0 -12 V28", "#2f6fed", 3) + shine(-8, -2, 5, 3); };
  A.car = function () { return pa("M-30 18 v-12 q0 -6 8 -6 h6 l8 -12 h18 l10 12 h4 q8 0 8 8 v10 z", "#2f6fed") + pa("M-12 0 l6 -9 h8 v9 z M6 0 v-9 h7 l7 9 z", "#cfeeff") + ci(-16, 20, 7, "#3a3444") + ci(18, 20, 7, "#3a3444") + dot(-16, 20, 2.5, "#c9d0dc") + dot(18, 20, 2.5, "#c9d0dc") + dot(-27, 10, 2.5, "#ffd23f") + shine(-10, 6, 8, 2); };
  A.robot = function () { return legs([-6, 6], 18, 12, "#9aa6ba", 3) + '<rect x="-14" y="-2" width="28" height="22" rx="5" fill="' + G("#a9b4c8") + '"' + S + '/><rect x="-12" y="-24" width="24" height="20" rx="6" fill="' + G("#c9d0dc") + '"' + S + "/>" + ln("M0 -24 v-6", INK, 1.8) + dot(0, -31, 3, "#e24b4b") + '<rect x="-8" y="-19" width="16" height="9" rx="4" fill="#24315c"/>' + dot(-4, -15, 2, "#7ef0ff") + dot(4, -15, 2, "#7ef0ff") + dot(-5, 8, 2.5, "#ffd23f") + dot(5, 8, 2.5, "#3fb55a"); };
  A.water = function () { return pa("M0 -22 Q16 0 13 10 A13 13 0 0 1 -13 10 Q-16 0 0 -22 Z", "#5aa9ff") + shine(-5, 2, 3, 6); };
  A.sun = function () { var r = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; r += ln("M" + (Math.cos(a) * 18).toFixed(1) + " " + (2 + Math.sin(a) * 18).toFixed(1) + " L" + (Math.cos(a) * 26).toFixed(1) + " " + (2 + Math.sin(a) * 26).toFixed(1), "#e0a106", 3.5); } return r + ci(0, 2, 15, "#ffd23f") + eye(-5, 0, 2.4) + eye(5, 0, 2.4) + smile(0, 6, 3); };
  A.book = function () { return pa("M-24 -10 q12 -6 24 0 v34 q-12 -6 -24 0 z", "#e24b4b") + pa("M0 -10 q12 -6 24 0 v34 q-12 -6 -24 0 z", "#e24b4b") + pa("M-21 -8 q10 -5 21 0 v30 q-10 -5 -21 0 z", "#fffdf6") + pa("M0 -8 q11 -5 21 0 v30 q-11 -5 -21 0 z", "#fffdf6") + ln("M-17 0 h12 M-17 6 h12 M4 0 h12 M4 6 h12", "#9fb2c8", 1.4); };
  A.shoe = function () { return pa("M-26 26 v-14 q0 -10 10 -10 h8 q4 10 14 10 h8 q12 0 12 10 v4 z", "#e24b4b") + '<rect x="-26" y="22" width="52" height="6" rx="3" fill="' + G("#fbfaf5") + '"' + S + "/>" + ln("M-12 4 l6 4 M-8 0 l6 4", "#fff", 1.6) + shine(-18, 10, 4, 3); };

  // Habitat tiles (fill a w x h box at 0,0) and covering close-ups.
  var clipN = 0;
  function tile(kind, w, h) {
    var o = "";
    if (kind === "forest") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#d8f3d0") + [0.2, 0.55, 0.85].map(function (f, i) {
      var x = w * f, y = h * 0.62; return '<rect x="' + (x - 3) + '" y="' + y + '" width="6" height="' + h * 0.3 + '" fill="' + G("#8a5a33") + '"/>' + ci(x, y - 6, 12 - i, "#3fb55a"); }).join("") + flat("M0 " + h * 0.9 + " h" + w + " v" + h * 0.1 + " h-" + w + " z", "#7cc46a");
    if (kind === "ocean") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#bfe6fb") + flat("M0 " + h * 0.3 + " q" + w / 4 + " -6 " + w / 2 + " 0 t" + w / 2 + " 0 V" + h + " H0 z", "#3d86e8") +
      dot(w * 0.3, h * 0.6, 3, "#fff", 0.6) + dot(w * 0.4, h * 0.45, 2, "#fff", 0.6) + flat("M0 " + h * 0.92 + " h" + w + " v" + h * 0.08 + " h-" + w + " z", "#e7c48a");
    if (kind === "desert") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#ffeec2") + ci(w * 0.78, h * 0.2, 7, "#ffd23f") + flat("M0 " + h * 0.7 + " q" + w / 2 + " -16 " + w + " 0 V" + h + " H0 z", "#e8c07a") +
      '<rect x="' + (w * 0.25 - 4) + '" y="' + h * 0.38 + '" width="8" height="' + h * 0.36 + '" rx="4" fill="' + G("#3fb55a") + '"' + S + "/>";
    if (kind === "arctic") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#e3f2ff") + flat("M0 " + h * 0.62 + " L" + w * 0.3 + " " + h * 0.42 + " L" + w * 0.55 + " " + h * 0.6 + " L" + w * 0.8 + " " + h * 0.38 + " L" + w + " " + h * 0.6 + " V" + h + " H0 z", "#ffffff") +
      flat("M" + w * 0.3 + " " + h * 0.42 + " L" + w * 0.4 + " " + h * 0.5 + " L" + w * 0.3 + " " + h * 0.6 + " z", "#bfe0f7") + dot(w * 0.2, h * 0.2, 1.5, "#9fc6e8") + dot(w * 0.6, h * 0.15, 1.5, "#9fc6e8");
    if (kind === "pond") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#dff5d8") + el(w / 2, h * 0.72, w * 0.44, h * 0.18, "#5aa9ff") + el(w * 0.35, h * 0.7, 7, 3, "#3fb55a") +
      ln("M" + w * 0.12 + " " + h * 0.7 + " v-" + h * 0.3 + " M" + w * 0.88 + " " + h * 0.7 + " v-" + h * 0.34, "#3a9a4f", 2.5) + el(w * 0.12, h * 0.38, 2.5, 6, "#8a5a33") + el(w * 0.88, h * 0.34, 2.5, 6, "#8a5a33");
    if (kind === "farm") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#d7f3ff") + flat("M0 " + h * 0.7 + " h" + w + " V" + h + " H0 z", "#8ed39a") +
      pa("M" + w * 0.55 + " " + h * 0.7 + " v-" + h * 0.3 + " l" + w * 0.17 + " -" + h * 0.16 + " l" + w * 0.17 + " " + h * 0.16 + " v" + h * 0.3 + " z", "#e24b4b") +
      ln("M0 " + h * 0.62 + " H" + w * 0.5 + " M" + w * 0.1 + " " + h * 0.52 + " v" + h * 0.2 + " M" + w * 0.3 + " " + h * 0.52 + " v" + h * 0.2, "#b07a45", 2.5);
    if (kind === "jungle") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#c8efc0") + el(w * 0.15, h * 0.2, 14, 6, "#2f8f55", 30) + el(w * 0.85, h * 0.25, 14, 6, "#2f8f55", -30) +
      ln("M" + w * 0.5 + " 0 q-6 " + h * 0.3 + " 4 " + h * 0.55, "#3a9a4f", 2.5) + el(w * 0.3, h * 0.85, 12, 5, "#3fb55a", -10) + el(w * 0.72, h * 0.88, 12, 5, "#3fb55a", 15);
    if (kind === "nest") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#e4f6dc") + ln("M0 " + h * 0.72 + " H" + w, "#8a5a33", 5) +
      pa("M" + w * 0.2 + " " + h * 0.55 + " q" + w * 0.3 + " " + h * 0.3 + " " + w * 0.6 + " 0 z", "#b07a45") + ln("M" + w * 0.24 + " " + h * 0.6 + " l" + w * 0.5 + " 2 M" + w * 0.28 + " " + h * 0.66 + " l" + w * 0.42 + " -3", "#7a4a25", 1.4);
    if (kind === "icecave") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#e3f2ff") + pa("M" + w * 0.1 + " " + h * 0.9 + " Q" + w * 0.5 + " " + h * 0.05 + " " + w * 0.9 + " " + h * 0.9 + " z", "#cfe9fb") +
      flat("M" + w * 0.3 + " " + h * 0.9 + " Q" + w * 0.5 + " " + h * 0.35 + " " + w * 0.7 + " " + h * 0.9 + " z", "#4a6a8a");
    if (kind === "seafloor") o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#2f6fd8") + flat("M0 " + h * 0.8 + " q" + w / 2 + " -10 " + w + " 0 V" + h + " H0 z", "#e7c48a") +
      ln("M" + w * 0.25 + " " + h * 0.82 + " q-6 -14 2 -26 M" + w * 0.75 + " " + h * 0.82 + " q6 -14 -2 -24", "#3fb55a", 3) + dot(w * 0.5, h * 0.3, 2.5, "#fff", 0.5);
    if (kind === "fur") { o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#c98a4b"); for (var i = 0; i < 5; i++) for (var j = 0; j < 4; j++) o += ln("M" + (w * (i + 0.3) / 5) + " " + (h * (j + 0.2) / 4) + " q4 6 2 12", "#8d5a2b", 2); }
    if (kind === "feathers") { o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#7eb6ff"); for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) o += pa("M" + (w * (c + (r % 2) * 0.5) / 3.5) + " " + (h * r / 3.6) + " q8 6 0 18 q-8 -12 0 -18 z", r % 2 ? "#4f8ff7" : "#9fc8ff"); }
    if (kind === "scales") { o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#3fb55a"); for (var r2 = 0; r2 < 6; r2++) for (var c2 = 0; c2 < 6; c2++) o += ln("M" + (c2 * 12 + (r2 % 2) * 6 - 6) + " " + (r2 * 9 + 6) + " a6 6 0 0 0 12 0", "#1f8a45", 1.8); }
    if (kind === "shell") { o = flat("M0 0 h" + w + " v" + h + " h-" + w + " z", "#3f9a55"); for (var r3 = 0; r3 < 3; r3++) for (var c3 = 0; c3 < 3; c3++) o += pa("M" + (c3 * 22 + (r3 % 2) * 11 - 4) + " " + (r3 * 20 + 6) + " l8 -6 h10 l8 6 l-8 8 h-10 z", "#5ab86a"); }
    clipN++;
    return '<clipPath id="anc-' + clipN + '"><rect x="0" y="0" width="' + w + '" height="' + h + '" rx="10"/></clipPath><g clip-path="url(#anc-' + clipN + ')">' + o + "</g>" +
      '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="10" fill="none" stroke="#fff" stroke-width="2.5"/>';
  }
  function shadow(x, y, rx) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + rx * 0.18 + '" fill="#1c2430" opacity="0.18"/>'; }
  function put(name, x, y, s) { return shadow(x, y + 30 * s, 26 * s) + '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + A[name]() + "</g>"; }
  function label(x, y, t) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="10.5" font-weight="800" font-family="Nunito, Segoe UI, sans-serif" fill="' + INK + '" stroke="#fffdf6" stroke-width="3" paint-order="stroke">' + t + "</text>";
  }
  // Tile label beside a tile: one line, or two when long (always inside the frame).
  function tlabel(x, y, t) {
    var words = t.split(" "), lines = [t];
    if (t.length > 14) { var half = Math.ceil(words.length / 2); lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")]; }
    return lines.map(function (l, i) {
      return '<text x="' + x + '" y="' + (y + (lines.length === 1 ? 4 : i * 10 - 1)) + '" font-size="9" font-weight="800" font-family="Nunito, Segoe UI, sans-serif" fill="' + INK + '">' + l + "</text>";
    }).join("");
  }
  var PASTEL = ["#fde7ef", "#e5f1ff", "#e8f8e4", "#fff3d6"];
  function card(x, y, w, h, i) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' + PASTEL[i % 4] + '" stroke="#fff" stroke-width="2.5"/>'; }
  function q(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + G("#ffd23f") + '"' + S + '/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="15" font-weight="800" font-family="Nunito, Segoe UI, sans-serif" fill="' + INK + '">?</text>'; }
  var ART = {
    // row: every answer choice (animal, label), in the file's order (the buttons are shuffled anyway)
    // pick: the question's animal on the left and every choice (a close-up or place tile, label) on the right
    // pair: grown-up and baby (baby with a ? bubble); solo: one big animal on a habitat; seq: from X to ?
    "cover-bird": { pick: "bird", tiles: [["feathers", "Feathers"], ["fur", "Fur"], ["scales", "Scales"]] },
    "cover-dog": { pick: "dog", tiles: [["fur", "Fur"], ["feathers", "Feathers"], ["scales", "Scales"]] },
    "cover-fish": { pick: "fish", tiles: [["scales", "Scales"], ["feathers", "Feathers"], ["fur", "Fur"]] },
    "cover-snake": { pick: "snake", tiles: [["scales", "Dry scales"], ["feathers", "Feathers"], ["fur", "Fur"]] },
    "shell": { row: [["turtle", "A turtle"], ["cat", "A cat"], ["duck", "A duck"]] },
    "wool": { row: [["sheep", "A sheep"], ["fish", "A fish"], ["frog", "A frog"]] },
    "spines": { row: [["porcupine", "A porcupine"], ["goldfish", "A goldfish"], ["parrot", "A parrot"]] },
    "ocean": { row: [["whale", "A whale"], ["camel", "A camel"], ["squirrel", "A squirrel"]] },
    "desert": { row: [["camel", "A camel"], ["penguin", "A penguin"], ["whale", "A whale"]] },
    "icy": { row: [["penguin", "A penguin"], ["camel", "A camel"], ["lizard", "A lizard"]] },
    "pond": { row: [["frog", "A frog"], ["lion", "A lion"], ["camel", "A camel"]] },
    "forest": { row: [["squirrel", "A squirrel"], ["shark", "A shark"], ["camel", "A camel"]] },
    "fishhome": { pick: "fish", tiles: [["pond", "In water"], ["nest", "In a nest in a tree"], ["desert", "In the sand of a desert"]] },
    "birdeggs": { pick: "bird", tiles: [["nest", "In a nest"], ["icecave", "In a cave of ice"], ["seafloor", "At the bottom of the sea"]] },
    "frogbaby": { seq: "frogeggs", bg: "pond" },
    "caterpillar": { seq: "caterpillar", bg: "forest" },
    "hatch": { seq: "crackegg", from: "chicken", bg: "forest" },
    "baby-dog": { pair: ["dog", "puppy"], bg: "farm" },
    "baby-cat": { pair: ["cat", "kitten"], bg: "farm" },
    "baby-cow": { pair: ["cow", "calf"], bg: "farm" },
    "baby-bear": { pair: ["bear", "cub"], bg: "forest" },
    "baby-sheep": { pair: ["sheep", "lamb"], bg: "farm" },
    "baby-horse": { pair: ["horse", "foal"], bg: "farm" },
    "fly": { row: [["bird", "A bird"], ["fish", "A fish"], ["cow", "A cow"]] },
    "sixlegs": { row: [["ant", "An ant"], ["dog", "A dog"], ["spider", "A spider"]] },
    "spiderlegs": { solo: "spider", bg: "forest" },
    "milk": { row: [["puppy", "A puppy"], ["babyfish", "A baby fish"], ["babyfrog", "A baby frog"]] },
    "gills": { row: [["fish", "A fish"], ["dog", "A dog"], ["bird", "A bird"]] },
    "fins": { row: [["fish", "A fish"], ["lion", "A lion"], ["bird", "A bird"]] },
    "hops": { row: [["kangaroo", "A kangaroo"], ["penguin", "A penguin"], ["shark", "A shark"]] },
    "pouch": { row: [["kangaroo", "A kangaroo"], ["duck", "A duck"], ["frog", "A frog"]] },
    "den": { row: [["bear", "A bear"], ["bee", "A bee"], ["fish", "A fish"]] },
    "web": { row: [["spider", "A spider"], ["cow", "A cow"], ["frog", "A frog"]] },
    "honey": { row: [["bee", "A bee"], ["ant", "An ant"], ["spider", "A spider"]] },
    "hive": { row: [["bee", "A bee"], ["horse", "A horse"], ["whale", "A whale"]] },
    "birdfly": { solo: "bird", bg: "forest" },
    "fishswim": { solo: "fish", bg: "ocean" },
    "trunk": { row: [["elephant", "An elephant"], ["giraffe", "A giraffe"], ["zebra", "A zebra"]] },
    "neck": { row: [["giraffe", "A giraffe"], ["pig", "A pig"], ["rabbit", "A rabbit"]] },
    "stripes": { row: [["zebra", "A zebra"], ["pig", "A pig"], ["goldfish", "A goldfish"]] },
    "slow": { row: [["snail", "A snail"], ["rabbit", "A rabbit"], ["cheetah", "A cheetah"]] },
    "insect": { row: [["ladybug", "A ladybug"], ["spider", "A spider"], ["worm", "A worm"]] },
    "card": { card: true }
  };
  function compose(a) {
    var o = "";
    if (a.row) {
      var n = a.row.length, w = 64, gap = (204 - n * w) / (n + 1);
      a.row.forEach(function (r, i) {
        var x = 8 + gap + i * (w + gap);
        o += card(x, 10, w, 100, i) + put(r[0], x + w / 2, 52, 0.78) + label(x + w / 2, 102, r[1].replace(/^(A|An) /, ""));
      });
    } else if (a.pick) {
      o += card(10, 10, 72, 100, 1) + put(a.pick, 46, 54, 0.85);
      a.tiles.forEach(function (t, i) {
        var y = 12 + i * 33;
        o += '<g transform="translate(90 ' + y + ')">' + tile(t[0], 40, 30) + "</g>" + tlabel(136, y + 15, t[1]);
      });
    } else if (a.pair) {
      o += '<g transform="translate(10 10)">' + tile(a.bg, 200, 100) + "</g>" + put(a.pair[0], 74, 58, 1) + put(a.pair[1], 156, 72, 0.7) + q(176, 34) +
        '<path d="M110 40 c-4 -6 -12 -2 -8 4 l8 8 l8 -8 c4 -6 -4 -10 -8 -4 z" fill="' + G("#ff6f91") + '"' + S + "/>";
    } else if (a.solo) {
      o += '<g transform="translate(10 10)">' + tile(a.bg, 200, 100) + "</g>" + put(a.solo, 110, 56, 1.25);
    } else if (a.seq) {
      o += '<g transform="translate(10 10)">' + tile(a.bg, 200, 100) + "</g>";
      if (a.from) o += put(a.from, 46, 58, 0.85) + put(a.seq, 104, 58, 0.85);
      else o += put(a.seq, 66, 58, 1);
      o += '<path d="M124 62 h30" stroke="#e24b4b" stroke-width="4" stroke-linecap="round"/><path d="M148 54 l8 8 l-8 8" fill="none" stroke="#e24b4b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' + q(180, 62);
    } else if (a.card) {
      o += '<g transform="translate(10 10)">' + tile("pond", 200, 100) + "</g>" + put("bee", 44, 40, 0.6) + put("frog", 104, 66, 0.9) + put("duck", 168, 64, 0.8) + put("butterfly", 150, 26, 0.5);
    }
    return o;
  }
  M.SCI_ANIMAL_ART = ART;
  M._animalPut = put; M._animalDefs = function () { var d = defs(); used = {}; return d; }; M._animalReset = function () { used = {}; };
  M._animalTile = tile;
  M.SCI_ANIMAL_LIBRARY = Object.keys(A);
  M.SCI_ANIMAL_TILES = ["forest", "ocean", "desert", "arctic", "pond", "farm", "jungle", "nest", "icecave", "seafloor", "fur", "feathers", "scales", "shell"];
  // A library drawing on its own (for checks and future use): an animal or a tile in the card frame.
  M.animalSvg = function (name) {
    used = {}; clipN = 0;
    var inner = A[name] ? put(name, 110, 56, 1.3) : M.SCI_ANIMAL_TILES.indexOf(name) >= 0 ? '<g transform="translate(10 10)">' + tile(name, 200, 100) + "</g>" : "";
    return frame(inner);
  };
  function frame(inner) {
    var d = defs();
    return '<svg class="scene-svg" viewBox="0 0 220 120" role="img">' + d +
      '<rect x="3" y="3" width="214" height="114" rx="18" fill="#fffdf6" stroke="#e7c48a" stroke-width="3"/>' + inner + "</svg>";
  }
  var uid = 0;
  function render(key) {
    used = {};
    var inner = compose(ART[key]);
    // unique clip ids per render so two copies on one page never clash
    uid++;
    inner = inner.replace(/anc-(\d+)/g, "anc" + uid + "-$1");
    return frame(inner);
  }
  Object.keys(ART).forEach(function (k) { if (M.SCI_SCENE_IDS) M.SCI_SCENE_IDS.push("sci-an-" + k); });
  var prevSvg = M.sciSceneSvg;
  M.sciSceneSvg = function (name) {
    var m = /^sci-an-(.+)$/.exec(name || "");
    if (m && ART[m[1]]) return render(m[1]);
    return prevSvg ? prevSvg(name) : "";
  };
  if (M.sceneHTML && !M.sceneHTML.animals) {
    var prevScene = M.sceneHTML;
    var cache = {};
    M.sceneHTML = function (name) {
      var m = /^sci-an-(.+)$/.exec(name || "");
      if (m && ART[m[1]]) { if (!cache[name]) cache[name] = '<div class="scene scene-sci-an scene-' + name + '">' + render(m[1]) + "</div>"; return cache[name]; }
      return prevScene(name);
    };
    M.sceneHTML.animals = true;
  }
})(window.Merit = window.Merit || {});
