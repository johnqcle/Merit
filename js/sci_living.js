(function (M) {
  "use strict";
  // v28 Living / nonliving pictures: every answer choice (one thing, or a pair "A tree and a puppy") on its own card,
  // drawn with the js/sci_animals.js library and labeled with the exact button text, in button order. The right answer
  // is never marked. Scene name: "sci-lv:" + labels joined by "|".
  var INK = "#2d2a32";
  var NOUNS = {
    "tree": "tree", "puppy": "puppy", "fish": "fish", "bee": "bee", "frog": "frog", "bird": "bird", "rose": "rose", "rabbit": "rabbit",
    "fox": "fox", "camel": "camel", "bear": "bear", "seedling": "seedling", "hen": "hen", "tadpole": "tadpole", "sunflower": "sunflower",
    "kitten": "kitten", "cat": "cat", "flower": "flower", "mushroom": "mushroom", "kid": "kid", "child": "kid",
    "rock": "rock", "stone": "stone", "metal spoon": "spoon", "spoon": "spoon", "cup": "cup", "wooden block": "block", "cotton ball": "cottonball",
    "bell": "bell", "ice cube": "icecube", "balloon": "balloon", "brick": "brick", "coin": "coin", "pencil": "pencil", "glass marble": "marble",
    "cloud": "cloud", "chair": "chair", "ball": "ball", "car": "car", "toy robot": "robot", "water": "water", "sun": "sun", "book": "book", "shoe": "shoe"
  };
  M.LIVING_ART_NOUNS = NOUNS;
  // "A tree and a puppy" -> ["tree", "puppy"]; null when any part has no picture.
  M.livingArtFor = function (label) {
    var parts = String(label).split(/ and /i).map(function (x) { return x.trim().toLowerCase().replace(/^(a|an|the)\s+/, ""); });
    var keys = parts.map(function (x) { return NOUNS[x] || null; });
    return keys.every(function (k) { return k && M.SCI_ANIMAL_LIBRARY && M.SCI_ANIMAL_LIBRARY.indexOf(k) >= 0; }) ? keys : null;
  };
  M.livingSceneName = function (labels) {
    if (!labels || labels.length < 2 || !labels.every(function (l) { return M.livingArtFor(l); })) return "";
    return "sci-lv:" + labels.join("|");
  };
  // Puts the labeled-cards picture on a choice question (labels in the buttons' order).
  M.livingBoard = function (q) {
    if (!q || !q.choices) return q;
    var name = M.livingSceneName(q.choices.map(function (c) { return c.label; }));
    if (name) { q.board = { kind: "scene", scene: name, focus: "" }; q.livingArt = true; }
    return q;
  };
  // Label lines: split at " and " for pairs, else at a space when long. Joined with " " they give the label back.
  M.livingLabelLines = function (label, max) {
    if (label.length <= max) return [label];
    var i = label.indexOf(" and ");
    if (i > 0 && i <= max && label.length - i - 1 <= max) return [label.slice(0, i), label.slice(i + 1)];
    var cut = label.lastIndexOf(" ", max);
    if (cut <= 0) cut = label.indexOf(" ");
    return cut > 0 ? [label.slice(0, cut), label.slice(cut + 1)] : [label];
  };
  var PASTEL = ["#fde7ef", "#e5f1ff", "#e8f8e4", "#fff3d6"];
  function text(x, y, lines, size) {
    return lines.map(function (l, i) {
      return '<text x="' + x + '" y="' + (y + i * (size + 1.5)) + '" text-anchor="middle" font-size="' + size + '" font-weight="800" font-family="Nunito, Segoe UI, sans-serif" fill="' + INK + '">' + l.replace(/&/g, "&amp;") + "</text>";
    }).join("");
  }
  function render(labels) {
    M._animalReset();
    var pairs = labels.some(function (l) { return / and /i.test(l); });
    var n = labels.length, W = 220, H = 120, o = "";
    var cells = [];
    if (!pairs && n <= 4) {
      var w = n === 4 ? 49 : 64, gap = (W - 16 - n * w) / (n + 1);
      labels.forEach(function (l, i) { cells.push({ x: 8 + gap + i * (w + gap), y: 10, w: w, h: 100 }); });
    } else if (n <= 2) {
      labels.forEach(function (l, i) { cells.push({ x: 12 + i * 100, y: 10, w: 96, h: 100 }); });
    } else {
      H = 156;
      labels.forEach(function (l, i) { cells.push({ x: 10 + (i % 2) * 102, y: 10 + Math.floor(i / 2) * 70, w: 98, h: 66 }); });
    }
    labels.forEach(function (l, i) {
      var c = cells[i], keys = M.livingArtFor(l);
      var tall = c.h >= 90, maxCh = c.w < 55 ? 9 : c.w < 70 ? 12 : 21, size = c.w < 55 ? 8 : 9;
      var lines = M.livingLabelLines(l, maxCh);
      var artH = c.h - 6 - lines.length * (size + 1.5);
      var s = Math.min(tall ? (keys.length > 1 ? 0.62 : 0.8) : 0.48, (c.w / keys.length) / 72, artH / 76);
      o += '<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" rx="11" fill="' + PASTEL[i % 4] + '" stroke="#fff" stroke-width="2.5"/>';
      keys.forEach(function (k, j) {
        var cx = c.x + c.w * (j + 0.5) / keys.length, cy = c.y + 4 + artH / 2 - 2;
        o += M._animalPut(k, cx, cy, s);
      });
      o += text(c.x + c.w / 2, c.y + c.h - 5 - (lines.length - 1) * (size + 1.5), lines, size);
    });
    var defs = M._animalDefs();
    return '<svg class="scene-svg" viewBox="0 0 ' + W + " " + H + '" role="img">' + defs +
      '<rect x="3" y="3" width="' + (W - 6) + '" height="' + (H - 6) + '" rx="18" fill="#fffdf6" stroke="#e7c48a" stroke-width="3"/>' + o + "</svg>";
  }
  M.livingSvg = function (name) { return render(String(name).replace(/^sci-lv:/, "").split("|")); };
  if (M.sceneHTML && !M.sceneHTML.living) {
    var prev = M.sceneHTML, cache = {};
    M.sceneHTML = function (name) {
      if (/^sci-lv:/.test(name || "")) {
        if (!cache[name]) cache[name] = '<div class="scene scene-sci-lv">' + M.livingSvg(name) + "</div>";
        return cache[name];
      }
      return prev(name);
    };
    M.sceneHTML.living = true;
  }
})(window.Merit = window.Merit || {});
