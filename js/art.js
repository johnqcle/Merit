// v11 3D-style art: shared SVG gradients, the Merit logo, subject mascots, counting objects and avatar.
// All self-contained SVG (no image files, works offline, scales to any size).
(function (M) {
  "use strict";

  function radial(id, a, b, c) {
    return '<radialGradient id="' + id + '" cx="0.35" cy="0.3" r="0.8">' +
      '<stop offset="0" stop-color="' + a + '"/><stop offset="0.55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/></radialGradient>';
  }
  function linear(id, a, b, c) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + a + '"/><stop offset="0.5" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/></linearGradient>';
  }

  // Colors: [light, mid, dark]
  var C = {
    red: ["#ff9a8a", "#ee4235", "#a81d1d"],
    blue: ["#9cc8ff", "#3478f0", "#1c46a8"],
    green: ["#9df2b4", "#2fb35f", "#17703a"],
    orange: ["#ffd79a", "#f59a2a", "#b5600c"],
    purple: ["#d3c2ff", "#7d5ce0", "#46308f"],
    yellow: ["#fff8c2", "#ffd23f", "#d08f00"],
    pink: ["#ffd0db", "#ff5d7a", "#c22b4a"],
    cyan: ["#c4f5ff", "#3ec6e0", "#1d8aa3"],
    leaf: ["#b4f3c2", "#3cbf6e", "#1f7a40"],
    cream: ["#ffffff", "#f8f1e4", "#d9c8a8"],
    wood: ["#f6deb0", "#dcae66", "#a8743a"],
    skin: ["#ffeedd", "#f6cfae", "#d9a07a"],
    lilac: ["#f0dcff", "#c77dff", "#8d4ec4"],
    sky: ["#d9efff", "#7eb6ff", "#2f6fed"]
  };

  function defsBody() {
    var out = "";
    Object.keys(C).forEach(function (k) {
      out += radial("m3-" + k, C[k][0], C[k][1], C[k][2]);
      out += linear("m3l-" + k, C[k][0], C[k][1], C[k][2]);
    });
    out += '<linearGradient id="m3-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
    out += '<radialGradient id="m3-shadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.38"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>';
    out += '<linearGradient id="m3-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/><stop offset="0.5" stop-color="#e8fbff" stop-opacity="0.35"/><stop offset="1" stop-color="#bfe9f5" stop-opacity="0.7"/></linearGradient>';
    out += '<linearGradient id="m3s-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6fa"/><stop offset="0.55" stop-color="#c9d0dc"/><stop offset="1" stop-color="#8a93a3"/></linearGradient>';
    out += '<filter id="m3-drop" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#1c2430" flood-opacity="0.28"/></filter>';
    return out;
  }
  M.ART_DEFS = defsBody;

  // One hidden <svg> holds every gradient, so all inline art can use url(#m3-...).
  function installDefs() {
    if (!document.body || document.getElementById("m3-defs")) return;
    var holder = document.createElement("div");
    holder.innerHTML = '<svg id="m3-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>' + defsBody() + "</defs></svg>";
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }
  M.installArtDefs = installDefs;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installDefs);
  else installDefs();

  // fill with gradient, falling back to the mid color if the gradient is missing
  function g(name) { return 'url(#m3-' + name + ') ' + C[name][1]; }
  function gl(name) { return 'url(#m3l-' + name + ') ' + C[name][1]; }
  M.artFill = g;

  function shadow(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#m3-shadow)"/>';
  }
  function gloss(cx, cy, rx, ry, rot) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="0.55"' +
      (rot ? ' transform="rotate(' + rot + " " + cx + " " + cy + ')"' : "") + "/>";
  }
  function face(cx, cy, s, ink) {
    ink = ink || "#3a1414";
    var e = 2.6 * s, sm = 4 * s;
    return '<circle cx="' + (cx - e) + '" cy="' + cy + '" r="' + (1.35 * s) + '" fill="' + ink + '"/>' +
      '<circle cx="' + (cx + e) + '" cy="' + cy + '" r="' + (1.35 * s) + '" fill="' + ink + '"/>' +
      '<circle cx="' + (cx - e + 0.45 * s) + '" cy="' + (cy - 0.45 * s) + '" r="' + (0.45 * s) + '" fill="#fff"/>' +
      '<circle cx="' + (cx + e + 0.45 * s) + '" cy="' + (cy - 0.45 * s) + '" r="' + (0.45 * s) + '" fill="#fff"/>' +
      '<path d="M' + (cx - sm / 2) + " " + (cy + 3 * s) + " Q" + cx + " " + (cy + 5.4 * s) + " " + (cx + sm / 2) + " " + (cy + 3 * s) + '" stroke="' + ink + '" stroke-width="' + (1.1 * s) + '" fill="none" stroke-linecap="round"/>';
  }

  // Counting objects, 40x40, shaded like small toys.
  var THINGS = {
    apple: function () {
      return shadow(20, 37, 11, 2.4) +
        '<path d="M20 12 C13 8 5 12 6 22 C7 31 13 36 20 34 C27 36 33 31 34 22 C35 12 27 8 20 12 Z" fill="' + g("red") + '" stroke="#9c1c1c" stroke-width="0.8"/>' +
        gloss(13.5, 17, 4, 2.4, -30) +
        '<path d="M20 12 C21 7 24 5 26 4" stroke="#6b3a1f" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path d="M22 9 C25 3 32 4 33 7 C30 11 25 11 22 9 Z" fill="' + g("leaf") + '"/>' + face(20, 23, 1);
    },
    star: function () {
      return shadow(20, 37, 12, 2.4) +
        '<polygon points="20,2 24.8,13 36,14 27.4,21.5 30.2,33 20,26.6 9.8,33 12.6,21.5 4,14 15.2,13" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<polygon points="20,7 23.3,14.6 31,15.4 25.1,20.5 27,28.3 20,24 13,28.3 14.9,20.5 9,15.4 16.7,14.6" fill="#fff" opacity="0.28"/>' +
        gloss(15, 12, 3.4, 1.8, -35) + face(20, 18.5, 0.85, "#6b3a1f");
    },
    heart: function () {
      return shadow(20, 37, 10, 2.2) +
        '<path d="M20 34 C6 23 5 12 12.5 9 C17 7.5 20 12 20 13.5 C20 12 23 7.5 27.5 9 C35 12 34 23 20 34 Z" fill="' + g("pink") + '" stroke="#a8203d" stroke-width="0.8"/>' +
        gloss(13.5, 14, 3.4, 2.2, -30);
    },
    ball: function () {
      return shadow(20, 37, 12, 2.4) +
        '<circle cx="20" cy="19" r="15" fill="' + g("blue") + '" stroke="#17305c" stroke-width="0.8"/>' +
        '<path d="M6 16 Q20 25 34 16" stroke="#ffe56b" stroke-width="2.4" fill="none"/>' +
        '<path d="M15 4.8 Q21 19 14 33" stroke="#fff" stroke-width="2" fill="none" opacity="0.9"/>' +
        gloss(13, 11, 4.4, 2.6, -35) + face(21, 20, 0.85, "#0f2147");
    },
    block: function () {
      return shadow(20, 37.5, 13, 2.2) +
        '<polygon points="6,13 12,7 36,7 30,13" fill="#ffd77a" stroke="#b97700" stroke-width="0.8" stroke-linejoin="round"/>' +
        '<polygon points="30,13 36,7 36,30 30,36" fill="#d48a00" stroke="#9c6300" stroke-width="0.8" stroke-linejoin="round"/>' +
        '<rect x="6" y="13" width="24" height="23" rx="2.5" fill="' + gl("yellow") + '" stroke="#b97700" stroke-width="0.8"/>' +
        '<rect x="8.5" y="15" width="12" height="3.2" rx="1.6" fill="#fff" opacity="0.6"/>' + face(18, 23, 0.9, "#6b3a1f");
    },
    flower: function () {
      return shadow(20, 37, 11, 2.2) +
        '<circle cx="11" cy="13" r="7" fill="' + g("pink") + '"/><circle cx="29" cy="13" r="7" fill="' + g("pink") + '"/>' +
        '<circle cx="11" cy="28" r="7" fill="' + g("lilac") + '"/><circle cx="29" cy="28" r="7" fill="' + g("lilac") + '"/>' +
        '<circle cx="20" cy="20.5" r="7" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="0.6"/>' +
        gloss(17.5, 17.5, 2.4, 1.3, -30) + face(20, 20, 0.7, "#6b3a1f");
    },
    moon: function () {
      return shadow(20, 37, 12, 2.4) +
        '<circle cx="20" cy="19" r="15" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="1"/>' +
        '<circle cx="26" cy="27" r="2.4" fill="#e8b500" opacity="0.5"/><circle cx="11" cy="24" r="1.8" fill="#e8b500" opacity="0.5"/>' +
        gloss(13, 11, 4.4, 2.6, -35) + face(20, 18, 0.9, "#6b3a1f");
    },
    fish: function () {
      return shadow(19, 37, 13, 2.2) +
        '<polygon points="28,20 38,9 37,20 38,31" fill="' + g("cyan") + '" stroke="#156b80" stroke-width="0.8" stroke-linejoin="round"/>' +
        '<ellipse cx="17" cy="20" rx="13.5" ry="9.5" fill="' + g("cyan") + '" stroke="#156b80" stroke-width="0.8"/>' +
        '<path d="M20 11 Q24 20 20 29" stroke="#1d8aa3" stroke-width="1.2" fill="none" opacity="0.7"/>' +
        gloss(11, 14.5, 4, 1.8, -20) +
        '<circle cx="10.5" cy="18" r="2" fill="#0f2b33"/><circle cx="11.1" cy="17.4" r="0.7" fill="#fff"/>' +
        '<path d="M8 23.5 Q11 26 14 23.5" stroke="#0f2b33" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
    },
    leaf: function () {
      return shadow(20, 37.5, 9, 2) +
        '<path d="M20 36 C6 25 7 8 20 2.5 C33 8 34 25 20 36 Z" fill="' + g("leaf") + '" stroke="#146b32" stroke-width="0.8"/>' +
        '<path d="M20 7 V33" stroke="#146b32" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M20 15 L12.5 11.5 M20 21 L28 17 M20 27 L13 23.5" stroke="#146b32" stroke-width="1.2" stroke-linecap="round"/>' +
        gloss(14.5, 13, 2.6, 4.2, 20);
    },
    cup: function () {
      return shadow(19, 37, 11, 2.2) +
        '<path d="M27 13 H31.5 A5.5 5.5 0 0 1 31.5 24 H27" fill="none" stroke="#b9925a" stroke-width="2.6"/>' +
        '<path d="M9 8 H28 L25 33 Q18.5 35 12 33 Z" fill="' + gl("cream") + '" stroke="#b9925a" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<ellipse cx="18.5" cy="8.5" rx="9.5" ry="2.4" fill="#8fd0e8" stroke="#b9925a" stroke-width="1"/>' +
        '<rect x="11.5" y="12" width="3" height="16" rx="1.5" fill="#fff" opacity="0.8"/>' + face(19.5, 20, 0.85, "#6b3a1f");
    },
    circle: function () {
      return shadow(20, 37, 12, 2.4) + '<circle cx="20" cy="19" r="14.5" fill="' + g("sky") + '" stroke="#1c46a8" stroke-width="1.4"/>' + gloss(14, 12, 4.4, 2.6, -35);
    },
    square: function () {
      return shadow(20, 37, 13, 2.2) + '<rect x="6" y="5" width="28" height="28" rx="5" fill="' + g("pink") + '" stroke="#a8203d" stroke-width="1.4"/>' +
        '<rect x="9" y="8" width="14" height="4" rx="2" fill="#fff" opacity="0.55"/>';
    },
    triangle: function () {
      return shadow(20, 37, 14, 2.2) + '<polygon points="20,3.5 37,34 3,34" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<polygon points="20,9 24,16.5 16,16.5" fill="#fff" opacity="0.5"/>';
    },
    diamond: function () {
      return shadow(20, 37.5, 11, 2) + '<polygon points="20,2.5 36,19 20,35.5 4,19" fill="' + g("lilac") + '" stroke="#6d34a3" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<polygon points="20,6.5 27,13.5 20,13.5 13,13.5" fill="#fff" opacity="0.45"/>';
    },
    crayon: function () {
      return shadow(20, 37.5, 8, 1.8) +
        '<rect x="14.5" y="4" width="11" height="23" rx="2" fill="' + gl("pink") + '" stroke="#a8203d" stroke-width="0.8"/>' +
        '<polygon points="14.5,27 25.5,27 20,36" fill="#ffcf7a" stroke="#b97700" stroke-width="0.8" stroke-linejoin="round"/>' +
        '<polygon points="18.3,32.5 21.7,32.5 20,36" fill="#c22b4a"/>' +
        '<rect x="14.5" y="8" width="11" height="3" fill="#7a1530" opacity="0.6"/><rect x="14.5" y="21" width="11" height="3" fill="#7a1530" opacity="0.6"/>' +
        '<rect x="16" y="5" width="2.4" height="21" rx="1.2" fill="#fff" opacity="0.55"/>';
    },
    card: function () {
      return shadow(20, 37.5, 12, 2) +
        '<rect x="7" y="4" width="26" height="31" rx="4" fill="' + gl("cream") + '" stroke="#c98600" stroke-width="1.4"/>' +
        '<polygon points="20,10 22.4,15.6 28.5,16 23.8,20 25.3,26 20,22.6 14.7,26 16.2,20 11.5,16 17.6,15.6" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="0.6"/>' +
        '<rect x="9.5" y="6.5" width="10" height="2.6" rx="1.3" fill="#fff" opacity="0.9"/>';
    }
  };
  M.thing3d = function (id) {
    return '<svg viewBox="0 0 40 40" aria-hidden="true">' + (THINGS[id] || THINGS.star)() + "</svg>";
  };
  M.THING3D_IDS = Object.keys(THINGS);

  // ----- Scene shading: every solid color shape in a scene gets a soft top-light gradient -----
  function hex6(h) {
    h = h.replace("#", "").toLowerCase();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return h;
  }
  function mix(h, to, t) {
    var n = parseInt(h, 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (to - r) * t); gg = Math.round(gg + (to - gg) * t); b = Math.round(b + (to - b) * t);
    return "#" + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }
  function lum(h) {
    var n = parseInt(h, 16);
    return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }
  var shaded = {};
  function ensureShade(h) {
    if (shaded[h]) return true;
    installDefs();
    var defs = document.querySelector("#m3-defs defs");
    if (!defs) return false;
    var NS = "http://www.w3.org/2000/svg";
    var lg = document.createElementNS(NS, "linearGradient");
    lg.setAttribute("id", "m3s-" + h);
    lg.setAttribute("x1", "0"); lg.setAttribute("y1", "0"); lg.setAttribute("x2", "0.25"); lg.setAttribute("y2", "1");
    [["0", mix(h, 255, 0.38)], ["0.5", "#" + h], ["1", mix(h, 0, 0.24)]].forEach(function (st) {
      var e = document.createElementNS(NS, "stop");
      e.setAttribute("offset", st[0]); e.setAttribute("stop-color", st[1]);
      lg.appendChild(e);
    });
    defs.appendChild(lg);
    shaded[h] = true;
    return true;
  }
  M.shade3d = function (markup) {
    return String(markup).replace(/<(circle|ellipse|rect|path|polygon)\b([^>]*?)\bfill="(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})"/g, function (all, tag, mid, col) {
      var h = hex6(col);
      if (lum(h) > 0.82 || !ensureShade(h)) return all;
      return "<" + tag + mid + 'fill="url(#m3s-' + h + ") " + col + '"';
    });
  };
  // ----- v13 physics topic pictures (same card frame and look as js/scenes.js) -----
  var INK = "#2d2a32";
  function sceneFrame(inner) {
    return '<svg class="scene-svg" viewBox="0 0 220 120" role="img">' +
      '<rect x="3" y="3" width="214" height="114" rx="18" fill="#fffdf6" stroke="#e7c48a" stroke-width="3"/>' + inner + "</svg>";
  }
  function sk(w) { return ' stroke="' + INK + '" stroke-width="' + (w || 3) + '" stroke-linejoin="round"'; }
  function moonPhase(cx, kind) {
    var r = 17, top = cx + "," + (60 - r), bot = cx + "," + (60 + r);
    var out = '<circle cx="' + cx + '" cy="60" r="' + r + '" fill="#3b4466" stroke="#8e97bd" stroke-width="2"/>';
    if (kind === "crescent") out += '<path d="M' + top + " A" + r + " " + r + " 0 0 1 " + bot + " A" + (r * 0.55) + " " + r + " 0 0 0 " + top + ' Z" fill="#f4efcf"/>';
    if (kind === "half") out += '<path d="M' + top + " A" + r + " " + r + " 0 0 1 " + bot + ' Z" fill="#f4efcf"/>';
    if (kind === "gibbous") out += '<path d="M' + top + " A" + r + " " + r + " 0 0 1 " + bot + " A" + (r * 0.55) + " " + r + " 0 0 1 " + top + ' Z" fill="#f4efcf"/>';
    if (kind === "full") out += '<circle cx="' + cx + '" cy="60" r="' + r + '" fill="#f4efcf" stroke="#8e97bd" stroke-width="2"/>';
    return out;
  }
  var EXTRA_SCENES = {
    lever: function () {
      return '<rect x="14" y="98" width="192" height="9" rx="4" fill="#8fd18b"/>' +
        '<polygon points="110,64 92,98 128,98" fill="#e0a106"' + sk() + "/>" +
        '<g transform="rotate(-12 110 62)">' +
        '<rect x="28" y="56" width="164" height="10" rx="4" fill="#b07a45"' + sk() + "/>" +
        '<rect x="36" y="28" width="32" height="28" rx="5" fill="#2f6fed"' + sk() + "/>" +
        '<circle cx="172" cy="45" r="11" fill="#e24b4b"' + sk() + "/></g>";
    },
    circuit: function () {
      var rays = [[110, 4, 110, 0], [84, 14, 80, 10], [136, 14, 140, 10], [80, 30, 74, 30], [140, 30, 146, 30]].map(function (l) {
        return '<line x1="' + l[0] + '" y1="' + (l[1] + 6) + '" x2="' + l[2] + '" y2="' + (l[3] + 6) + '" stroke="#e0a106" stroke-width="3" stroke-linecap="round"/>';
      }).join("");
      return '<rect x="40" y="52" width="140" height="48" rx="10" fill="none" stroke="#c97a2b" stroke-width="5"/>' +
        '<rect x="27" y="60" width="26" height="34" rx="4" fill="#2f8f55"' + sk() + "/>" +
        '<rect x="34" y="54" width="12" height="7" rx="2" fill="#d7dde8"' + sk(2) + "/>" +
        '<path d="M36 72 h8 M40 68 v8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' +
        '<rect x="102" y="40" width="16" height="13" rx="2" fill="#a7adb8"' + sk() + "/>" +
        '<circle cx="110" cy="27" r="15" fill="#ffe27a"' + sk() + "/>" +
        '<path d="M104 33 q6 -10 12 0" fill="none" stroke="#c97a2b" stroke-width="2"/>' + rays +
        '<rect x="128" y="94" width="26" height="12" rx="4" fill="#e24b4b"' + sk(2) + "/>";
    },
    prism: function () {
      var cols = ["#e24b4b", "#f28c28", "#f2d14a", "#3fb55a", "#2f6fed", "#7b4fd6"];
      var fan = cols.map(function (c, i) {
        return '<polygon points="126,62 210,' + (40 + i * 11) + " 210," + (51 + i * 11) + '" fill="' + c + '"/>';
      }).join("");
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#24315c"/>' +
        '<path d="M12 74 L94 62" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>' + fan +
        '<polygon points="110,24 76,98 144,98" fill="#cfeeff" fill-opacity="0.8" stroke="#ffffff" stroke-width="3"/>';
    },
    sound: function () {
      var arcs = [0, 1, 2].map(function (i) {
        var x = 128 + i * 20, h = 18 + i * 12;
        return '<path d="M' + x + " " + (62 - h) + " Q" + (x + 16 + i * 4) + " 62 " + x + " " + (62 + h) + '" fill="none" stroke="#2f6fed" stroke-width="5" stroke-linecap="round"/>';
      }).join("");
      return '<rect x="30" y="50" width="80" height="44" fill="#e24b4b"' + sk() + "/>" +
        '<ellipse cx="70" cy="94" rx="40" ry="10" fill="#c23b3b"' + sk() + "/>" +
        '<path d="M30 54 L50 92 L70 54 L90 92 L110 54" fill="none" stroke="#f2d14a" stroke-width="3"/>' +
        '<ellipse cx="70" cy="50" rx="40" ry="11" fill="#f6f1e2"' + sk() + "/>" +
        '<line x1="92" y1="14" x2="76" y2="44" stroke="#b07a45" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="93" cy="13" r="5" fill="#f2d14a"' + sk(2) + "/>" + arcs;
    },
    phases: function () {
      return '<rect x="10" y="10" width="200" height="100" rx="14" fill="#24315c"/>' +
        '<circle cx="30" cy="24" r="1.6" fill="#fff"/><circle cx="190" cy="98" r="1.6" fill="#fff"/><circle cx="160" cy="22" r="1.4" fill="#fff"/>' +
        moonPhase(34, "new") + moonPhase(72, "crescent") + moonPhase(110, "half") + moonPhase(148, "gibbous") + moonPhase(186, "full");
    },
    wave: function () {
      return '<path d="M10 72 Q35 46 60 72 T110 72 T160 72 T210 72 V110 H10 Z" fill="#2f6fed"/>' +
        '<path d="M10 86 Q35 66 60 86 T110 86 T160 86 T210 86 V110 H10 Z" fill="#5a8ff2"/>' +
        '<ellipse cx="85" cy="54" rx="13" ry="9" fill="#f2d14a"' + sk(2.5) + "/>" +
        '<circle cx="96" cy="44" r="7" fill="#f2d14a"' + sk(2.5) + "/>" +
        '<path d="M102 44 l7 2 l-7 2 z" fill="#f28c28"' + sk(1.5) + "/>" +
        '<circle cx="97" cy="42" r="1.4" fill="' + INK + '"/>' +
        '<path d="M150 30 v18 M144 42 l6 7 l6 -7" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M150 98 v-14 M144 90 l6 -7 l6 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    }
  };
  M.EXTRA_SCENE_IDS = Object.keys(EXTRA_SCENES);
  if (M.sceneHTML && !M.sceneHTML.extra) {
    var baseScene = M.sceneHTML;
    M.sceneHTML = function (name) {
      if (EXTRA_SCENES[name]) return '<div class="scene scene-' + name + '">' + sceneFrame(EXTRA_SCENES[name]()) + "</div>";
      return baseScene(name);
    };
    M.sceneHTML.extra = true;
  }
  if (M.sceneHTML && !M.sceneHTML.shaded) {
    var plainScene = M.sceneHTML;
    var sceneCache = {};
    M.sceneHTML = function (name) {
      var k = name || "idea";
      if (!sceneCache[k]) sceneCache[k] = M.shade3d(plainScene(name));
      return sceneCache[k];
    };
    M.sceneHTML.shaded = true;
  }

  // ----- Logo: glossy 3D A B C blocks with an apple on top -----
  function block3d(x, y, s, letter, col) {
    var w = 26 * s, d = 7 * s;
    var c = C[col];
    return '<g transform="translate(' + x + "," + y + ')">' +
      '<polygon points="0,' + d + " " + d + ",0 " + (w + d) + ",0 " + w + "," + d + '" fill="' + c[0] + '" stroke="' + c[2] + '" stroke-width="1" stroke-linejoin="round"/>' +
      '<polygon points="' + w + "," + d + " " + (w + d) + ",0 " + (w + d) + "," + w + " " + w + "," + (w + d) + '" fill="' + c[2] + '" stroke="' + c[2] + '" stroke-width="1" stroke-linejoin="round"/>' +
      '<rect x="0" y="' + d + '" width="' + w + '" height="' + w + '" rx="' + (3.5 * s) + '" fill="' + gl(col) + '" stroke="' + c[2] + '" stroke-width="1"/>' +
      '<rect x="' + (3 * s) + '" y="' + (d + 2.5 * s) + '" width="' + (11 * s) + '" height="' + (3.2 * s) + '" rx="' + (1.6 * s) + '" fill="#fff" opacity="0.6"/>' +
      '<text x="' + (w / 2) + '" y="' + (d + 19.5 * s) + '" text-anchor="middle" font-family="Nunito, \'Arial Rounded MT Bold\', \'Segoe UI\', sans-serif" font-size="' + (17 * s) + '" font-weight="800" fill="#fff" stroke="' + c[2] + '" stroke-width="' + (0.8 * s) + '" paint-order="stroke">' + letter + "</text></g>";
  }
  function logoApple(x, y, s) {
    return '<g transform="translate(' + x + "," + y + ") scale(" + s + ')">' + THINGS.apple() + "</g>";
  }
  M.logoMarkSvg = function (cls) {
    return '<svg class="' + (cls || "logo-art") + '" viewBox="0 0 128 64" aria-hidden="true" focusable="false">' +
      '<ellipse cx="62" cy="60" rx="58" ry="3.5" fill="url(#m3-shadow)"/>' +
      block3d(2, 26, 1, "A", "red") +
      block3d(36, 30, 1, "B", "blue") +
      block3d(70, 22, 1, "C", "green") +
      logoApple(94, 2, 0.88) +
      "</svg>";
  };

  // ----- Subject mascots (100x100) -----
  var MASCOTS = {
    math: function () {
      return shadow(50, 92, 34, 5) +
        '<polygon points="18,34 32,20 82,20 68,34" fill="#ffb3a8" stroke="#a81d1d" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<polygon points="68,34 82,20 82,72 68,86" fill="#b52a22" stroke="#8a1616" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<rect x="18" y="34" width="50" height="52" rx="8" fill="' + gl("red") + '" stroke="#8a1616" stroke-width="1.5"/>' +
        '<rect x="23" y="38" width="26" height="6" rx="3" fill="#fff" opacity="0.55"/>' +
        '<text x="43" y="76" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="34" fill="#fff" stroke="#8a1616" stroke-width="1.5" paint-order="stroke">+</text>' +
        face(43, 52, 2.1, "#3a1010") +
        '<g transform="translate(70,6)"><circle cx="12" cy="12" r="11" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="1.2"/>' +
        '<text x="12" y="17.5" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="16" fill="#8a5a00">×</text>' + gloss(8, 7, 3, 1.6, -30) + "</g>";
    },
    reading: function () {
      return shadow(50, 92, 38, 5) +
        '<path d="M10 30 Q30 22 50 32 Q70 22 90 30 L90 82 Q70 74 50 84 Q30 74 10 82 Z" fill="#1c46a8"/>' +
        '<path d="M14 26 Q31 18 50 28 L50 78 Q31 68 14 76 Z" fill="' + gl("cream") + '" stroke="#b9925a" stroke-width="1.2"/>' +
        '<path d="M86 26 Q69 18 50 28 L50 78 Q69 68 86 76 Z" fill="' + gl("cream") + '" stroke="#b9925a" stroke-width="1.2"/>' +
        '<path d="M50 28 V78" stroke="#b9925a" stroke-width="1.6"/>' +
        '<path d="M20 38 Q30 34 43 39 M20 46 Q30 42 43 47 M57 39 Q70 34 80 38 M57 47 Q70 42 80 46" stroke="#9cc8ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        face(50, 58, 2.0, "#1c2a5c") +
        '<path d="M8 80 Q30 72 50 82 Q70 72 92 80 L92 86 Q70 78 50 88 Q30 78 8 86 Z" fill="' + gl("blue") + '"/>' +
        '<path d="M70 4 L73 12 L81 13 L75 18 L77 26 L70 21.5 L63 26 L65 18 L59 13 L67 12 Z" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="1"/>';
    },
    // Science & Engineering: the ringed planet (science questions include space), in science green.
    // Astronomy (v21): a little red-and-white rocket with a round window and a flame, among stars.
    astronomy: function () {
      return shadow(50, 94, 26, 4.5) +
        '<path d="M50 6 C66 18 70 40 66 66 H34 C30 40 34 18 50 6 Z" fill="' + gl("cream") + '" stroke="#8a93a8" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M50 6 C58 12 62 20 64 28 H36 C38 20 42 12 50 6 Z" fill="' + g("red") + '" stroke="#a81d1d" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M34 50 L20 70 L34 66 Z" fill="' + g("red") + '" stroke="#a81d1d" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M66 50 L80 70 L66 66 Z" fill="' + g("red") + '" stroke="#a81d1d" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="42" r="9" fill="' + g("sky") + '" stroke="#46308f" stroke-width="2.4"/>' + face(50, 41, 1.6, "#1c2a5c") +
        '<path d="M40 66 Q50 92 60 66 Z" fill="' + g("yellow") + '" stroke="#d08f00" stroke-width="1.4"/>' +
        '<path d="M45 66 Q50 82 55 66 Z" fill="#ff9a3c"/>' +
        '<path d="M39 22 Q41 16 45 12" stroke="#fff" stroke-opacity="0.7" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M86 14 L88 19 L93 20 L89 23 L90 28 L86 25.5 L82 28 L83 23 L79 20 L84 19 Z" fill="' + g("yellow") + '"/>' +
        '<circle cx="14" cy="24" r="3" fill="' + g("yellow") + '"/><circle cx="84" cy="80" r="2.6" fill="' + g("yellow") + '"/>';
    },
    science: function () {
      return shadow(50, 93, 32, 5) +
        '<g transform="rotate(-14 50 52)"><ellipse cx="50" cy="52" rx="44" ry="12" fill="none" stroke="#146b32" stroke-width="6"/></g>' +
        '<circle cx="50" cy="50" r="28" fill="' + g("green") + '" stroke="#0f5a28" stroke-width="1.5"/>' +
        '<path d="M25 42 Q50 50 75 42" stroke="#9df2b4" stroke-width="3" fill="none" opacity="0.8"/>' +
        '<circle cx="64" cy="62" r="3.4" fill="#17703a" opacity="0.45"/><circle cx="33" cy="58" r="2.4" fill="#17703a" opacity="0.45"/>' +
        gloss(40, 34, 9, 5, -30) + face(50, 45, 2.2, "#0b3a1a") +
        '<g transform="rotate(-14 50 52)"><path d="M6 52 A44 12 0 0 0 94 52" fill="none" stroke="#5fd68a" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M14 55 A44 12 0 0 0 40 63" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round"/></g>' +
        '<path d="M86 12 L88 17 L93 18 L89 21 L90 26 L86 23.5 L82 26 L83 21 L79 18 L84 17 Z" fill="' + g("yellow") + '"/><circle cx="14" cy="82" r="3.5" fill="' + g("yellow") + '"/>';
    },
    // Physics: a friendly horseshoe magnet pulling a little ball (clear at small sizes), in physics orange.
    physics: function () {
      return shadow(46, 93, 30, 5) +
        // horseshoe body: thick U, opening downward
        '<path d="M16 76 V44 A30 30 0 0 1 76 44 V76 H56 V44 A10 10 0 0 0 36 44 V76 Z" fill="' + gl("orange") + '" stroke="#9c4f08" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M21 50 A25 25 0 0 1 46 19" stroke="#fff" stroke-opacity="0.6" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        // silver pole tips
        '<rect x="16" y="72" width="20" height="14" rx="3" fill="url(#m3s-steel) #c9d0dc" stroke="#6b7280" stroke-width="1.5"/>' +
        '<rect x="56" y="72" width="20" height="14" rx="3" fill="url(#m3s-steel) #c9d0dc" stroke="#6b7280" stroke-width="1.5"/>' +
        '<rect x="19" y="74.5" width="9" height="3" rx="1.5" fill="#fff" opacity="0.9"/><rect x="59" y="74.5" width="9" height="3" rx="1.5" fill="#fff" opacity="0.9"/>' +
        face(46, 30, 2.1, "#5a2a00") +
        // a little steel ball pulled toward the magnet, with pull lines
        '<path d="M83 56 Q78.5 66 83 76 M89 59 Q86 66 89 73" stroke="#f59a2a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<circle cx="94" cy="66" r="5.5" fill="url(#m3s-steel) #c9d0dc" stroke="#6b7280" stroke-width="1.2"/>' +
        '<ellipse cx="92.3" cy="64.2" rx="1.9" ry="1.2" fill="#fff" opacity="0.9"/>';
    },
    programming: function () {
      return shadow(50, 93, 30, 5) +
        '<line x1="50" y1="8" x2="50" y2="20" stroke="#46308f" stroke-width="3"/>' +
        '<circle cx="50" cy="8" r="5.5" fill="' + g("pink") + '"/>' +
        '<rect x="14" y="20" width="72" height="56" rx="16" fill="' + gl("purple") + '" stroke="#352270" stroke-width="1.5"/>' +
        '<rect x="22" y="28" width="56" height="34" rx="9" fill="#1d1640"/>' +
        '<circle cx="38" cy="43" r="6" fill="#7dffb0"/><circle cx="62" cy="43" r="6" fill="#7dffb0"/>' +
        '<circle cx="40" cy="41" r="2" fill="#fff"/><circle cx="64" cy="41" r="2" fill="#fff"/>' +
        '<path d="M42 54 Q50 59 58 54" stroke="#7dffb0" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<rect x="20" y="23" width="28" height="4" rx="2" fill="#fff" opacity="0.5"/>' +
        '<rect x="30" y="76" width="40" height="12" rx="5" fill="' + gl("purple") + '" stroke="#352270" stroke-width="1.2"/>' +
        '<rect x="6" y="40" width="8" height="18" rx="4" fill="#5a3fb8"/><rect x="86" y="40" width="8" height="18" rx="4" fill="#5a3fb8"/>';
    }
  };
  M.mascotSvg = function (subject) {
    var f = MASCOTS[subject];
    if (!f) return "";
    return '<svg class="mascot" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + f() + "</svg>";
  };

  // ----- Avatar: round, shaded, friendly -----
  M.avatar3d = function (hex, hat, size) {
    var hatSvg = "";
    if (hat === "cap") hatSvg = '<path d="M20 30 Q22 12 40 12 Q58 12 60 30 Z" fill="' + hex + '"/>' +
      '<path d="M20 30 Q22 12 40 12 Q58 12 60 30 Z" fill="url(#m3-gloss)" opacity="0.5"/>' +
      '<path d="M40 29 Q56 26 68 31 Q60 35 40 33 Z" fill="' + hex + '"/><path d="M40 33 Q60 35 68 31 L68 33 Q58 37 40 35 Z" fill="#000" opacity="0.2"/>' +
      '<circle cx="40" cy="12" r="2.6" fill="#fff" opacity="0.85"/>';
    if (hat === "bow") hatSvg = '<path d="M28 18 L40 24 L52 18 Q55 25 52 30 L40 26 L28 30 Q25 25 28 18 Z" fill="' + hex + '"/>' +
      '<circle cx="40" cy="25" r="3.6" fill="' + hex + '"/><ellipse cx="32" cy="21" rx="3" ry="1.6" fill="#fff" opacity="0.55"/>';
    if (hat === "star") hatSvg = '<polygon points="40,4 43.5,12.5 52.5,13 45.5,18.5 48,27.5 40,22.5 32,27.5 34.5,18.5 27.5,13 36.5,12.5" fill="' + g("yellow") + '" stroke="#c98600" stroke-width="1"/>';
    return '<svg class="avatar" width="' + size + '" height="' + size + '" viewBox="0 0 80 80" aria-hidden="true">' +
      shadow(40, 77, 22, 3) +
      '<path d="M18 76 Q18 58 40 58 Q62 58 62 76 Z" fill="' + hex + '"/>' +
      '<path d="M18 76 Q18 58 40 58 Q62 58 62 76 Z" fill="url(#m3-gloss)" opacity="0.35"/>' +
      '<path d="M22 76 Q24 66 32 63" stroke="#000" stroke-opacity="0.12" stroke-width="3" fill="none"/>' +
      '<circle cx="40" cy="40" r="20" fill="' + g("skin") + '"/>' +
      '<path d="M21 36 Q24 20 40 20 Q56 20 59 36 Q52 28 40 29 Q28 28 21 36 Z" fill="#6b3f26"/>' +
      '<ellipse cx="31" cy="47" rx="4" ry="2.6" fill="#ff9aa8" opacity="0.6"/><ellipse cx="49" cy="47" rx="4" ry="2.6" fill="#ff9aa8" opacity="0.6"/>' +
      '<ellipse cx="33.5" cy="41" rx="2.6" ry="3.2" fill="#1c2430"/><ellipse cx="46.5" cy="41" rx="2.6" ry="3.2" fill="#1c2430"/>' +
      '<circle cx="34.5" cy="39.8" r="1" fill="#fff"/><circle cx="47.5" cy="39.8" r="1" fill="#fff"/>' +
      '<path d="M34.5 49 Q40 54 45.5 49" stroke="#7a2e1f" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      gloss(32, 30, 6, 2.6, -20) +
      hatSvg + "</svg>";
  };
})(window.Merit = window.Merit || {});
