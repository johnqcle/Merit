(function (M) {
  "use strict";

  var KEY = "merit.v1";
  var db = { profiles: [] };
  var MATH_LEVELS = {
    beginner: { title: "Beginner", line: "Small numbers", min: 1, max: 2, start: 1 },
    intermediate: { title: "Intermediate", line: "Bigger numbers", min: 3, max: 4, start: 3 },
    expert: { title: "Expert", line: "Biggest numbers", min: 5, max: 5, start: 5 }
  };
  // The level picked on Home (Beginner / Intermediate / Expert) drives every subject.
  // A new profile starts at the level for its age band.
  var LEVEL_ORDER = ["beginner", "intermediate", "expert"];
  var BAND_LEVEL = { "5-6": "beginner", "7-8": "intermediate", "9-10": "expert" };
  var MATH_STYLES = {
    objects: { title: "Objects", line: "Count the pictures" },
    numbers: { title: "Numbers", line: "Number sentences" }
  };

  var ui = {
    screen: "who",
    activeId: null,
    draft: null,
    practice: null,
    gate: null,
    loginId: null,
    loginPass: [],
    loginBad: false,
    timer: null,
    mathStyle: ["objects", "numbers"]
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function uid() { return Math.random().toString(36).slice(2, 10); }

  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)) || { profiles: [] }; }
    catch (e) { db = { profiles: [] }; }
    if (!db.profiles) db.profiles = [];
    // v3 saved a per-subject pool level that is no longer used; drop it.
    db.profiles.forEach(function (p) { if (p && p.poolLevel) delete p.poolLevel; });
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  // Saving, sounds and speech are extras around an answer: if one fails (full storage,
  // a speech engine error), the child still sees Correct / X and moves on.
  function quietly(fn) {
    try { fn(); } catch (err) { if (window.console) console.warn("Merit:", err && err.message ? err.message : err); }
  }

  function active() {
    for (var i = 0; i < db.profiles.length; i++) if (db.profiles[i].id === ui.activeId) return db.profiles[i];
    return null;
  }

  function colorHex(id) {
    var colors = M.LOOKS.colors;
    for (var i = 0; i < colors.length; i++) if (colors[i].id === id) return colors[i].hex;
    return colors[0].hex;
  }

  function subjectById(id) {
    for (var i = 0; i < M.SUBJECTS.length; i++) if (M.SUBJECTS[i].id === id) return M.SUBJECTS[i];
    return M.SUBJECTS[0];
  }

  function soundOn() {
    var p = active();
    if (p && p.soundOn === false) return false;
    return true;
  }

  function clearTimer() {
    if (ui.timer) clearTimeout(ui.timer);
    ui.timer = null;
    ui.timerFn = null;
  }

  function arm(ms, fn) {
    clearTimer();
    ui.timerFn = fn;
    ui.timer = setTimeout(function () { ui.timerFn = null; fn(); }, ms);
  }

  function render() {
    var p = active();
    if (ui.screen !== "home") { ui.resetOpen = false; ui.resetNote = ""; ui.sciencePick = false; }
    document.body.classList.toggle("still", !!(p && p.reduceMotion));
    document.getElementById("app").innerHTML = view();
    if (ui.screen === "practice") fitBoard();
    if (ui.screen === "home") fitHome();
    paintPlay();
  }

  // Play buttons are green only when a tap will really play sound: sound on, voices loaded,
  // nothing being said. Otherwise they look normal and a tap does nothing (aria-disabled).
  var PLAY_ACTS = { "speak-prompt": 1, "speak-story": 1, "speak-token": 1, "speak-slow": 1, "read-aloud": 1 };
  function playStatus() {
    if (!soundOn()) return "off";
    var st = M.speechStatus ? M.speechStatus() : "none";
    return st === "none" ? "off" : st;
  }
  function paintPlay() {
    var st = playStatus();
    var ready = st === "ready";
    var buttons = document.querySelectorAll("#app .play");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle("play-ready", ready);
      buttons[i].setAttribute("aria-disabled", ready ? "false" : "true");
      buttons[i].setAttribute("aria-busy", st === "speaking" || st === "loading" ? "true" : "false");
      buttons[i].setAttribute("data-play", st);
    }
  }
  if (M.onSpeechStatus) M.onSpeechStatus(function () { paintPlay(); });

  // Fit the whole chalkboard (text, picture, objects, Play) and the answers in the window, no scrolling.
  // Pictures scale in CSS inside .art. Here: counting objects get the largest size that fits (wrapping
  // into rows, never under 24px); then long text shrinks a little (to set minimums); then the answer
  // buttons get tighter. Runs after every render and when the window changes size.
  var FIT_TEXT = [[".chalk-prompt", 16], [".fable-text", 15], [".fable-title", 14], [".flash-word", 24], [".chalk-word", 28], [".chalk-note", 14], [".did-you-know", 13]];
  function fitBoard() {
    var board = document.querySelector(".board");
    if (!board) return;
    var art = board.querySelector(".art");
    var desk = document.querySelector(".desk");
    var texts = [];
    FIT_TEXT.forEach(function (rule) {
      Array.prototype.forEach.call(board.querySelectorAll(rule[0]), function (el) {
        el.style.fontSize = "";
        texts.push({ el: el, base: parseFloat(getComputedStyle(el).fontSize) || 16, min: rule[1] });
      });
    });
    if (art) { art.style.removeProperty("--item"); art.classList.remove("dense"); }
    if (desk) desk.classList.remove("tight", "tighter");
    var pictured = !!(art && art.querySelector("svg, .scene, .grid, .equation"));
    function over() {
      if (board.scrollHeight > board.clientHeight + 1 || board.scrollWidth > board.clientWidth + 1) return true;
      if (art && (art.scrollHeight > art.clientHeight + 1 || art.scrollWidth > art.clientWidth + 1)) return true;
      if (art && cutOff(art)) return true;
      if (art && pictured && !art.querySelector(".count-item") && art.clientHeight < Math.min(120, board.clientHeight * 0.3)) return true;
      return false;
    }
    var items = art ? art.querySelectorAll(".count-item") : [];
    var start = items.length ? Math.max(40, Math.round(items[0].getBoundingClientRect().width) || 140) : 0;
    function setItem(px) { art.style.setProperty("--item", px + "px"); }
    function largestItem(lo, hi) {
      setItem(lo);
      if (over()) return 0;
      while (hi - lo > 1) {
        var mid = Math.floor((lo + hi) / 2);
        setItem(mid);
        if (over()) hi = mid; else lo = mid;
      }
      setItem(lo);
      return lo;
    }
    function setScale(scale) {
      texts.forEach(function (t) { t.el.style.fontSize = scale >= 1 ? "" : Math.max(t.min, Math.round(t.base * scale)) + "px"; });
    }
    var SCALES = [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.45, 0.4];
    function fitAll(lastScale) {
      if (items.length) { art.style.removeProperty("--item"); art.classList.remove("dense"); }
      setScale(1);
      if (!over()) return items.length ? start : 999;
      if (items.length) {
        // Objects: try each text size, keep the first that lets objects stay 40px+, else the best one.
        // Very big counts in a short window: slimmer group boxes and a 20px floor (still countable).
        var tries = [24, 20];
        for (var f = 0; f < tries.length; f++) {
          if (f) art.classList.add("dense");
          var best = null;
          for (var k = 0; k < SCALES.length; k++) {
            setScale(SCALES[k]);
            var got = largestItem(tries[f], start);
            if (got >= 40) return got;
            if (got && (!best || got > best.item)) best = { scale: SCALES[k], item: got };
          }
          if (best) { setScale(best.scale); largestItem(tries[f], start); return best.item; }
        }
        // Nothing fits even at 20px: the smallest size that does (very short windows only).
        setScale(SCALES[SCALES.length - 1]);
        return largestItem(12, 20);
      }
      for (var t = 1; t < SCALES.length && t <= lastScale; t++) {
        setScale(SCALES[t]);
        if (!over()) return 999;
      }
      return 0;
    }
    // Objects under 40px or anything still not fitting: make the answer area more compact and try again.
    // Text shrinks only a little before the answer area gets more compact.
    if (fitAll(3) < 40 && desk) {
      desk.classList.add("tight");
      if (fitAll(SCALES.length) < 32) {
        desk.classList.add("tighter");
        fitAll(SCALES.length);
      }
    }
    if (desk && desk.scrollHeight > desk.clientHeight + 1) {
      desk.classList.add("tight");
      if (desk.scrollHeight > desk.clientHeight + 1) desk.classList.add("tighter");
    }
    // v14: Skip / End session must stay on screen: if the screen is still too tall for the window
    // (very short windows), make the answer area compact too so the chalkboard can give up the room.
    var stage = document.querySelector(".stage");
    if (desk && stage && stage.scrollHeight > stage.clientHeight + 1) {
      desk.classList.add("tight");
      if (stage.scrollHeight > stage.clientHeight + 1) desk.classList.add("tighter");
    }
  }

  // Centered content can spill out of the top as well, which scroll sizes do not show: compare boxes.
  function cutOff(box) {
    var r = box.getBoundingClientRect();
    var all = box.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.parentNode && el.parentNode.closest && el.parentNode.closest("svg")) continue;
      if (el.closest && el.closest(".burst")) continue;
      var e = el.getBoundingClientRect();
      if (e.width < 1 || e.height < 1) continue;
      if (e.top < r.top - 1 || e.bottom > r.bottom + 1 || e.left < r.left - 1 || e.right > r.right + 1) return true;
    }
    return false;
  }

  var fitQueued = false;
  window.addEventListener("resize", function () {
    if (fitQueued) return;
    fitQueued = true;
    window.requestAnimationFrame(function () { fitQueued = false; if (ui.screen === "practice") fitBoard(); if (ui.screen === "home") fitHome(); });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (ui.screen === "practice") fitBoard(); if (ui.screen === "home") fitHome(); });

  // v16: Fit the Home screen in the window, no scroll bar. The subject cards fill the room left under the
  // header; this picks how many cards go in a row (5, 3, 2 or 1) and the largest card scale (--hs, 1.25 down
  // to 0.5) at which nothing scrolls, nothing in a card is cut off and no word runs out of its card. If even
  // the smallest scale does not fit, the cards go compact (small picture beside the tab) and it tries again.
  function fitHome() {
    var shellEl = document.querySelector(".shell.home");
    if (!shellEl) return;
    var stage = shellEl.querySelector(".stage");
    var grid = stage && stage.querySelector(".grid-cards");
    if (!grid) return;
    var cards = grid.querySelectorAll(".card");
    var parts = grid.querySelectorAll(".card h2, .card .rank, .card .muted, .card .tab");
    function fits() {
      if (stage.scrollHeight > stage.clientHeight + 1 || stage.scrollWidth > stage.clientWidth + 1) return false;
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        if (c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1) return false;
      }
      for (var j = 0; j < parts.length; j++) if (parts[j].scrollWidth > parts[j].clientWidth + 1) return false;
      return true;
    }
    shellEl.classList.remove("home-scroll");
    function set(cols, compact, hs) {
      shellEl.style.setProperty("--cols", String(cols));
      shellEl.style.setProperty("--hs", String(hs));
      shellEl.classList.toggle("home-compact", !!compact);
    }
    var width = stage.clientWidth;
    var colsList = [5, 3, 2, 1].filter(function (n) { return n === 1 || width / n >= 116; });
    var MIN = 0.5, MAX = 1.25;   // up to 1.25 on big screens, so tall cards are not half empty
    var best = null;
    [false, true].some(function (compact) {
      colsList.forEach(function (cols) {
        set(cols, compact, MIN);
        if (!fits()) return;
        var lo = MIN, hi = MAX;
        set(cols, compact, MAX);
        if (fits()) lo = MAX;
        else {
          for (var k = 0; k < 7; k++) {
            var mid = (lo + hi) / 2;
            set(cols, compact, mid);
            if (fits()) lo = mid; else hi = mid;
          }
        }
        // More cards in a row reads better: a row count change must buy a clearly bigger card.
        var score = lo * (cols === 5 ? 1.12 : cols === 3 ? 1.04 : 1);
        if (!best || score > best.score) best = { cols: cols, compact: compact, hs: lo, score: score };
      });
      return best && (best.hs >= 0.7 || compact);
    });
    shellEl.classList.remove("home-scroll");
    if (!best) {
      // Truly tiny windows (a phone, or a small window at high zoom): there is no room for all five cards even
      // at their smallest, so the cards keep their natural height and only the card area scrolls (never the
      // page, and nothing is cut off or overlaps).
      best = { cols: width >= 600 ? 3 : width >= 300 ? 2 : 1, compact: true, hs: 0.75 };
      shellEl.classList.add("home-scroll");
    }
    set(best.cols, best.compact, Math.floor(best.hs * 1000) / 1000);
    shellEl.setAttribute("data-fit", best.cols + "|" + (best.compact ? "compact" : "full") + "|" + best.hs.toFixed(2) + (shellEl.classList.contains("home-scroll") ? "|scroll" : ""));
  }

  function logo() {
    return '<button type="button" class="logo" data-act="home" aria-label="Merit home">' +
      (M.logoMarkSvg ? M.logoMarkSvg("logo-art") : "") +
      '<span class="logo-word" aria-hidden="true"><b class="lw-m">M</b><b class="lw-e">e</b><b class="lw-r">r</b><b class="lw-i">i</b><b class="lw-t">t</b></span></button>';
  }

  function apple(x, y) {
    return '<g transform="translate(' + x + "," + y + ')">' +
      '<ellipse cx="14" cy="22" rx="12" ry="13" fill="#e23d3d"/>' +
      '<ellipse cx="10" cy="18" rx="4" ry="2.5" fill="#f4b4b0"/>' +
      '<path d="M14 10 C16 4 20 6 18 11" stroke="#6b3a1f" stroke-width="2" fill="none"/>' +
      '<ellipse cx="20" cy="10" rx="7" ry="3.2" fill="#3c9a4a" transform="rotate(-28 20 10)"/></g>';
  }

  function icon(name) {
    var paths = {
      apple: apple(0, 0).replace("translate(0,0)", "translate(2,0)"),
      star: '<polygon points="20,4 24,14 36,14 26,21 30,32 20,25 10,32 14,21 4,14 16,14" fill="#e0a106"/>',
      pencil: '<rect x="10" y="8" width="8" height="26" rx="1" fill="#e0a106" transform="rotate(20 16 20)"/><polygon points="8,30 14,36 6,34" fill="#e7c48a"/>',
      book: '<path d="M8 10 H20 V34 H8 Z" fill="#2f6fed"/><path d="M20 10 H32 V34 H20 Z" fill="#244fba"/>',
      sun: '<circle cx="20" cy="20" r="8" fill="#f6e7a2"/><g stroke="#e0a106" stroke-width="2"><line x1="20" y1="6" x2="20" y2="2"/><line x1="20" y1="38" x2="20" y2="34"/><line x1="6" y1="20" x2="2" y2="20"/><line x1="38" y1="20" x2="34" y2="20"/></g>',
      bell: '<path d="M20 6 V10 A12 12 0 0 1 32 22 V28 H8 V22 A12 12 0 0 1 20 10" fill="#e0a106"/><circle cx="20" cy="32" r="3" fill="#8d6840"/>',
      block: '<rect x="8" y="8" width="24" height="24" rx="3" fill="#e7c48a" stroke="#8d6840"/><text x="20" y="26" text-anchor="middle" font-size="14" font-family="Nunito" font-weight="800" fill="#e24b4b">A</text>',
      bus: '<rect x="6" y="12" width="28" height="16" rx="3" fill="#e0a106"/><circle cx="12" cy="30" r="3" fill="#1c2430"/><circle cx="28" cy="30" r="3" fill="#1c2430"/>'
    };
    if (M.thing3d && (name === "apple" || name === "star" || name === "block")) {
      return M.thing3d(name).replace("<svg ", '<svg width="36" height="36" ');
    }
    if (M.artFill) {
      paths.pencil = '<g transform="rotate(20 20 20)"><rect x="15" y="5" width="10" height="24" rx="2" fill="' + M.artFill("yellow") + '" stroke="#c98600"/><polygon points="15,29 25,29 20,37" fill="#f6deb0" stroke="#a8743a"/><rect x="16.5" y="6" width="2.4" height="22" rx="1.2" fill="#fff" opacity="0.6"/></g>';
      paths.book = '<path d="M6 10 Q13 7 20 11 V34 Q13 30 6 33 Z" fill="' + M.artFill("blue") + '" stroke="#1c46a8"/><path d="M34 10 Q27 7 20 11 V34 Q27 30 34 33 Z" fill="' + M.artFill("sky") + '" stroke="#1c46a8"/><path d="M9 12 Q13 10.5 17 12.5" stroke="#fff" stroke-width="1.6" opacity="0.7" fill="none"/>';
      paths.sun = '<g stroke="#e0a106" stroke-width="2.4" stroke-linecap="round"><line x1="20" y1="3" x2="20" y2="7"/><line x1="20" y1="33" x2="20" y2="37"/><line x1="3" y1="20" x2="7" y2="20"/><line x1="33" y1="20" x2="37" y2="20"/><line x1="8" y1="8" x2="11" y2="11"/><line x1="29" y1="29" x2="32" y2="32"/><line x1="32" y1="8" x2="29" y2="11"/><line x1="8" y1="32" x2="11" y2="29"/></g><circle cx="20" cy="20" r="10" fill="' + M.artFill("yellow") + '" stroke="#c98600"/><ellipse cx="16.5" cy="16" rx="3" ry="1.8" fill="#fff" opacity="0.6"/>';
      paths.bell = '<path d="M20 6 Q31 8 31 21 V27 L34 30 H6 L9 27 V21 Q9 8 20 6 Z" fill="' + M.artFill("yellow") + '" stroke="#c98600"/><circle cx="20" cy="33" r="3" fill="' + M.artFill("wood") + '"/><ellipse cx="15" cy="14" rx="2.4" ry="4" fill="#fff" opacity="0.55"/>';
      paths.bus = '<rect x="5" y="9" width="30" height="20" rx="5" fill="' + M.artFill("yellow") + '" stroke="#c98600"/><rect x="9" y="13" width="9" height="6" rx="1.5" fill="#9cd8ff"/><rect x="22" y="13" width="9" height="6" rx="1.5" fill="#9cd8ff"/><circle cx="12" cy="30" r="3.6" fill="#1c2430"/><circle cx="28" cy="30" r="3.6" fill="#1c2430"/><circle cx="12" cy="30" r="1.3" fill="#ccc"/><circle cx="28" cy="30" r="1.3" fill="#ccc"/><rect x="8" y="10.5" width="14" height="1.8" rx="0.9" fill="#fff" opacity="0.7"/>';
    }
    return '<svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  }

  function avatar(p, size) {
    if (p && p.photo) {
      return '<img class="avatar photo" width="' + size + '" height="' + size + '" alt="" src="' + esc(p.photo) + '">';
    }
    var hex = colorHex(p.color);
    if (M.avatar3d) return M.avatar3d(hex, p.hat, size);
    var hat = "";
    if (p.hat === "cap") hat = '<path d="M22 18 H58 Q60 28 40 30 Q20 28 22 18 Z" fill="' + hex + '"/><rect x="22" y="16" width="28" height="8" rx="3" fill="' + hex + '"/>';
    if (p.hat === "bow") hat = '<path d="M30 20 L40 26 L50 20 L40 24 Z" fill="' + hex + '"/>';
    if (p.hat === "star") hat = '<polygon points="40,8 43,16 52,16 45,21 48,30 40,25 32,30 35,21 28,16 37,16" fill="#e0a106"/>';
    return '<svg class="avatar" width="' + size + '" height="' + size + '" viewBox="0 0 80 80" aria-hidden="true">' +
      hat +
      '<circle cx="40" cy="46" r="18" fill="#f3d2b5"/>' +
      '<circle cx="34" cy="44" r="2" fill="#1c2430"/><circle cx="46" cy="44" r="2" fill="#1c2430"/>' +
      '<path d="M34 52 Q40 56 46 52" stroke="#1c2430" fill="none"/>' +
      '<path d="M24 66 Q40 60 56 66 V76 H24 Z" fill="' + hex + '"/>' +
      "</svg>";
  }

  function photoPicker(hasPhoto) {
    return '<div class="photo-row"><label class="text-btn">Upload a picture' +
      '<input id="photo-file" class="photo-file" type="file" accept="image/*"></label>' +
      (hasPhoto ? '<button type="button" class="text-btn" data-act="clear-photo">Use the drawing</button>' : "") +
      "</div>";
  }

  function shell(inner, actions) {
    var badge = (ui.screen === "practice" && ui.practice) ? gradeBadge(ui.practice) : "";
    var subj = ui.screen === "practice" && ui.practice ? ' data-subject="' + esc(ui.practice.subjectId) + '"' : "";
    return '<div class="shell fit' + (ui.screen === "home" ? " home" : "") + '"' + subj + '><header class="top">' + logo() +
      '<div class="top-actions">' + (actions || "") +
      '<button type="button" class="icon-btn" data-act="mute">' + (soundOn() ? "Sound on" : "Muted") + "</button>" +
      badge +
      "</div></header><div class=\"stage\">" + inner + "</div></div>";
  }

  function view() {
    if (ui.screen === "gate") return shell(viewGate());
    if (ui.screen === "create") return shell(viewCreate(), '<button type="button" class="text-btn" data-act="who">Back</button>');
    if (ui.screen === "login") return shell(viewLogin(), '<button type="button" class="text-btn" data-act="who">Back</button>');
    if (ui.screen === "home") return shell(viewHome(), '<button type="button" class="text-btn" data-act="wall">Classroom wall</button><button type="button" class="text-btn" data-act="ask-parent">Parent</button><button type="button" class="text-btn" data-act="who">Switch</button>');
    if (ui.screen === "mathpick") return shell(viewMathPick(), '<button type="button" class="text-btn" data-act="home">Home</button>');
    if (ui.screen === "wall") return shell(viewWall(), '<button type="button" class="text-btn" data-act="home">Home</button>');
    if (ui.screen === "parent") return shell(viewParent(), '<button type="button" class="text-btn" data-act="home">Home</button>');
    if (ui.screen === "remove") return shell(viewRemove(), '<button type="button" class="text-btn" data-act="who">Back</button>');
    if (ui.screen === "practice") return shell(viewPractice());
    return shell(viewWho());
  }

  function viewWho() {
    var cards = db.profiles.map(function (p) {
      return '<button type="button" class="player" data-act="login" data-id="' + esc(p.id) + '">' +
        avatar(p, 72) + esc(p.name) + "</button>";
    }).join("");
    var remove = db.profiles.length
      ? '<button type="button" class="text-btn remove-ask" data-act="remove-ask">Delete an account</button>'
      : "";
    return "<h1>Who's playing?</h1><p class=\"sub\">Each player keeps their own subject proficiencies.</p>" +
      '<div class="who-row">' + cards +
      '<button type="button" class="player add" data-act="create">New player</button></div>' + remove;
  }

  function viewRemove() {
    var rows = db.profiles.map(function (p) {
      var armed = ui.removeId === p.id;
      return '<div class="remove-row">' + avatar(p, 72) +
        '<span class="remove-name">' + esc(p.name) + "</span>" +
        '<button type="button" class="text-btn" data-act="remove" data-id="' + esc(p.id) + '">' +
        (armed ? "Yes, delete " + esc(p.name) : "Delete") + "</button></div>";
    }).join("");
    return "<h1>Delete an account</h1><p class=\"sub\">This erases that player's answers and progress on this device.</p>" + rows;
  }

  function viewCreate() {
    var d = ui.draft;
    if (d.stage === "name") {
      return "<h1>New player</h1><div class=\"field\"><label for=\"player-name\">Display name</label>" +
        '<input id="player-name" maxlength="12" autocomplete="off" value="' + esc(d.name) + '"></div>' +
        (d.error ? '<p class="error">' + esc(d.error) + "</p>" : "") +
        '<button type="button" class="text-btn primary" data-act="name-next">Next</button>';
    }
    if (d.stage === "look") {
      var colors = M.LOOKS.colors.map(function (c) {
        return '<button type="button" class="swatch' + (d.color === c.id ? " on" : "") + '" style="background:' + c.hex + '" data-act="color" data-id="' + c.id + '" aria-label="' + c.id + '"></button>';
      }).join("");
      var hats = M.LOOKS.hats.map(function (h) {
        return '<button type="button" class="hat' + (d.hat === h.id ? " on" : "") + '" data-act="hat" data-id="' + h.id + '">' + esc(h.label) + "</button>";
      }).join("");
      return "<h1>Pick a look</h1><div class=\"look-preview\">" +
        avatar({ color: d.color, hat: d.hat, photo: d.photo }, 96) +
        photoPicker(!!d.photo) +
        '<div class="swatches">' + colors + '</div><div class="hats">' + hats + "</div>" +
        '<button type="button" class="text-btn primary" data-act="look-next">Next</button></div>';
    }
    return "";
  }

  function viewLogin() {
    var p = db.profiles.filter(function (x) { return x.id === ui.loginId; })[0];
    var slots = [0, 1, 2].map(function (i) {
      return '<div class="pass-slot">' + (ui.loginPass[i] ? icon(ui.loginPass[i]) : "") + "</div>";
    }).join("");
    var icons = M.PASS_ICONS.map(function (name) {
      return '<button type="button" class="pass-icon" data-act="login-tap" data-id="' + name + '" aria-label="' + name + '">' + icon(name) + "</button>";
    }).join("");
    return "<h1>" + esc(p.name) + "</h1>" + avatar(p, 80) +
      '<div class="pass-row' + (ui.loginBad ? " shake" : "") + '">' + slots + "</div>" +
      (ui.loginBad ? '<p class="error">Those pictures do not match.</p>' : "") +
      '<div class="choices">' + icons + "</div>";
  }

  function viewGate() {
    return "<h1>A grown-up question</h1><p class=\"sub\">" + ui.gate.a + " + " + ui.gate.b + "</p>" +
      '<div class="type-row"><input id="gate-answer" inputmode="numeric" autocomplete="off" aria-label="Answer">' +
      '<button type="button" class="go" data-act="gate-go">Go</button></div>' +
      (ui.gate.error ? '<p class="error">' + esc(ui.gate.error) + "</p>" : "");
  }

  function ring(frac) {
    var c = 2 * Math.PI * 18;
    var off = c * (1 - Math.max(0, Math.min(1, frac)));
    return '<svg class="ring" viewBox="0 0 44 44"><circle class="ringbg" cx="22" cy="22" r="18"></circle>' +
      '<circle class="ringfg" cx="22" cy="22" r="18" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"></circle></svg>';
  }

  function todayMin(p) {
    var ms = (p.days && p.days[M.todayKey()]) || 0;
    return ms / 60000;
  }

  function viewHome() {
    var p = active();
    var goal = p.goalMin || 10;
    var mins = todayMin(p);
    var cards = M.homeSubjects().filter(function (s) { return M.subjectShown(p, s); }).map(function (s) {
      var snap = M.snapshot(p, s.id);
      var meta = M.skillMeta(s.id, p.ageBand, snap.working.skillId);
      var detail = s.id === "math"
        ? "Addition, subtraction, multiplication, division" +
          (M.SKILLS.math[p.ageBand].some(function (sk) { return sk.id === "word"; }) ? ", word problems" : "") +
          (levelOf(p) === "beginner" ? ", shapes" : "")
        : (meta.title + " · step " + snap.working.step + " of 5");
      if (snap.topics && snap.topics.length) detail += " · " + snap.topicsStarted + " of " + snap.topics.length + " topics";
      if (snap.sight && (snap.sight.tried || levelOf(p) === "beginner")) detail += " · " + snap.sight.known + " of " + snap.sight.total + " sight words";
      if (snap.words && (snap.words.tried || levelOf(p) === "beginner")) detail += " · " + snap.words.known + " of " + snap.words.total + " words";
      if (s.id === "science" && M.subjectShown(p, { id: "astronomy", under: "science" })) {
        // Astronomy shows here once started (kept short so the card still fits small windows).
        var astroBand = M.ensureBand(p, "astronomy");
        var astroTried = Object.keys(astroBand.skills).some(function (k) { return astroBand.skills[k].answers.length > 0; });
        if (astroTried) detail += " · Astronomy step " + astroBand.working.step;
      }
      return '<button type="button" class="card" data-subject="' + s.id + '" data-act="practice" data-id="' + s.id + '">' +
        '<span class="tab">' + esc(s.short) + "</span>" + (M.mascotSvg ? M.mascotSvg(s.id) : "") + "<h2>" + esc(s.name) + "</h2>" +
        '<div class="rank">' + esc(snap.rank.title) + (snap.rank.star ? " ★" : "") + "</div>" +
        '<div class="meter"><span style="width:' + snap.score + '%"></span></div>' +
        '<div class="muted">' + esc(detail) + "</div></button>";
    }).join("");
    var current = levelOf(p);
    var levelButtons = LEVEL_ORDER.map(function (id) {
      var on = id === current;
      return '<button type="button" class="lvl-btn' + (on ? " on" : "") + '" data-act="home-level" data-id="' + id + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        esc(MATH_LEVELS[id].title) + "</button>";
    }).join("");
    // v16: hello, daily ring and level share one header row that wraps on narrow windows.
    // v17: the picture widget is gone from Home (pictures are picked when the player is made); Reset progress
    // (v18: in the bottom row) opens a small chooser (all subjects or one); a pick resets it right away, then a short note shows.
    // v19: the child's picture is back next to the hello, display only (no upload / drawing buttons on Home).
    return '<div class="home-head"><h1>Hello, ' + esc(p.name) + "</h1>" + '<div class="me">' + avatar(p, 72) + "</div>" +
      '<div class="ring-wrap">' + ring(mins / goal) + "<span>" + Math.min(goal, Math.floor(mins)) + " / " + goal + " min today</span></div>" +
      '<div class="home-level-row" role="group" aria-label="Pick a level"><span class="home-level-label">Pick a level:</span>' + levelButtons + "</div></div>" +
      '<div class="grid-cards">' + cards + "</div>" +
      // v18: Reset progress sits in a bottom row under the cards, like Skip / End session on test pages.
      '<div class="home-foot"><button type="button" class="text-btn reset-btn" data-act="reset-open" aria-haspopup="dialog">Reset progress</button></div>' +
      resetChooser(p) + sciencePick(p) + resetNote();
  }

  // v17 Reset progress chooser (Home). Tapping outside it or Close shuts it without resetting anything.
  function resetChooser(p) {
    if (!ui.resetOpen) return "";
    var rows = [{ id: "all", name: "All subjects" }].concat(M.SUBJECTS.filter(function (s) { return M.subjectShown(p, s); }));
    var buttons = rows.map(function (s) {
      return '<button type="button" class="reset-pick' + (s.id === "all" ? " all" : "") + '" data-act="reset-do" data-id="' + esc(s.id) + '"' +
        (s.id !== "all" ? ' data-subject="' + esc(s.id) + '"' : "") + ">" + esc(s.name) + "</button>";
    }).join("");
    return '<div class="reset-backdrop" data-act="reset-close"></div>' +
      '<div class="reset-pop" role="dialog" aria-modal="true" aria-labelledby="reset-title">' +
      '<h2 id="reset-title">Reset progress for ' + esc(p.name) + "</h2>" +
      '<p class="muted">Pick what to start over. Questions come back fresh from step 1.</p>' +
      '<div class="reset-list">' + buttons + "</div>" +
      '<button type="button" class="text-btn reset-close" data-act="reset-close">Close</button></div>';
  }
  // v21: tapping the Science & Engineering card asks which part: the regular questions or Astronomy.
  function sciencePick(p) {
    if (!ui.sciencePick) return "";
    var opts = M.SUBJECTS.filter(function (s) { return (s.id === "science" || s.under === "science") && M.subjectShown(p, s); });
    var lines = { science: "Living things, materials, weather, and more", astronomy: "Space and planets: Sun, Moon, stars, and rockets" };
    var topicCards = sciTopicsAt(levelOf(p)).map(function (t) {
      return '<button type="button" class="sci-topic" data-act="practice-topic" data-id="' + esc(t.id) + '" data-topic="' + esc(t.id) + '">' +
        '<span class="sci-topic-art" aria-hidden="true">' + (M.sciSceneSvg ? M.sciSceneSvg(t.scene) : "") + "</span>" +
        '<span class="sci-topic-name">' + esc(t.title) + "</span></button>";
    }).join("");
    var buttons = opts.map(function (s) {
      return '<button type="button" class="sci-pick" data-act="practice-sub" data-id="' + s.id + '" data-subject="' + s.id + '">' +
        (M.mascotSvg ? M.mascotSvg(s.id) : "") + '<span class="sci-name">' + esc(s.name) + '</span><span class="sci-line">' + esc(lines[s.id] || "") + "</span></button>";
    }).join("");
    return '<div class="reset-backdrop" data-act="sci-close"></div>' +
      '<div class="reset-pop sci-pop" role="dialog" aria-modal="true" aria-labelledby="sci-title">' +
      '<h2 id="sci-title">What do you want to practice?</h2>' +
      '<div class="sci-list">' + buttons + "</div>" +
      (topicCards ? '<h3 class="sci-topics-head">Or pick a topic:</h3><div class="sci-topics">' + topicCards + "</div>" : "") +
      '<button type="button" class="text-btn reset-close" data-act="sci-close">Close</button></div>';
  }
  // v26: Science topics with questions at this level (Plants, Animals, Human body, Matter are Beginner for now).
  function sciTopicsAt(level) {
    return (M.topicsFor ? M.topicsFor("science") : []).filter(function (t) {
      return M.bankLevelItems && M.bankLevelItems("science", t.id, level).length > 0;
    });
  }
  function resetNote() {
    return ui.resetNote ? '<div class="reset-note" role="status">' + esc(ui.resetNote) + "</div>" : "";
  }

  // Math sections to pick from: the age band's skills, plus Shapes at the Beginner level (v20).
  function mathSections(p, level) {
    var list = M.SKILLS.math[p.ageBand].slice();
    if ((level || levelOf(p)) === "beginner") { list.push(M.SHAPES_SKILL); if (M.MATH_MIX_SKILL) list.push(M.MATH_MIX_SKILL); }
    return list;
  }
  var SHAPE_SPEC = { min: 1, max: 5, start: 1 };
  var MIX_SPEC = { min: 1, max: 2, start: 1 };
  function specFor(skillId, levelId) { return skillId === "shapes" ? SHAPE_SPEC : skillId === "mathmix" ? MIX_SPEC : MATH_LEVELS[levelId]; }

  function viewMathPick() {
    var p = active();
    var picked = ui.mathPick || [];
    var styles = mathStyles();
    var styleButtons = ["objects", "numbers"].map(function (id) {
      var style = MATH_STYLES[id];
      var on = styles.indexOf(id) >= 0;
      return '<button type="button" class="style' + (on ? " on" : "") + '" data-act="math-style" data-id="' + id + '">' +
        "<h2>" + esc(style.title) + "</h2><p class=\"muted\">" + (on ? "Selected · " : "") + esc(style.line) + "</p></button>";
    }).join("");
    var cards = mathSections(p).map(function (s) {
      var on = picked.indexOf(s.id) >= 0;
      return '<button type="button" class="card math-section' + (on ? " on" : "") + '" data-act="math-section" data-id="' + s.id + '">' +
        "<h2>" + esc(s.title) + "</h2><p class=\"muted\">" + (on ? "Selected · " : "") + esc(s.line) + "</p></button>";
    }).join("");
    var ready = picked.length && styles.length;
    return "<h1>Math</h1><p class=\"sub\">Level: " + esc(mathLevelTitle(levelOf(p))) + ". Pick objects, numbers, or both.</p>" +
      '<div class="style-row">' + styleButtons + "</div>" +
      '<div class="grid-cards">' + cards + "</div>" +
      '<div class="math-start"><button type="button" class="go" data-act="math-start"' + (ready ? "" : " disabled") + ">Start</button></div>";
  }

  function viewWall() {
    var p = active();
    var blocks = M.SUBJECTS.filter(function (s) { return M.subjectShown(p, s); }).map(function (s) {
      var snap = M.snapshot(p, s.id);
      var stones = snap.skills.map(function (sk) {
        var now = sk.id === snap.working.skillId;
        return '<div class="stone' + (sk.solid ? " solid" : "") + (now ? " now" : "") + '"><span>' +
          (sk.solid ? '<span class="star">★ </span>' : "") + esc(sk.title) + "</span><span class=\"muted\">" +
          (now ? "step " + snap.working.step : sk.solid ? "solid" : Math.round(sk.mastery * 100) + "%") +
          "</span></div>";
      }).join("");
      if (snap.topics && snap.topics.length) {
        stones += snap.topics.filter(function (t) { return t.tried > 0; }).map(function (t) {
          return '<div class="stone topic' + (t.solid ? " solid" : "") + '"><span>' + (t.solid ? '<span class="star">★ </span>' : "") +
            esc(t.title) + '</span><span class="muted">' + (t.solid ? "solid" : Math.round(t.mastery * 100) + "%") + "</span></div>";
        }).join("");
        stones += '<div class="stone topic-count"><span>Topics explored</span><span class="muted">' + snap.topicsStarted + " of " + snap.topics.length + "</span></div>";
      }
      if (snap.mathmix && (snap.mathmix.tried || levelOf(p) === "beginner")) {
        stones += '<div class="stone shapes mathmix' + (snap.mathmix.solid ? " solid" : "") + '"><span>' + (snap.mathmix.solid ? '<span class="star">★ </span>' : "") +
          esc(snap.mathmix.title) + '</span><span class="muted">' + (snap.mathmix.solid ? "solid" : Math.round(snap.mathmix.mastery * 100) + "%") + "</span></div>";
      }
      if (snap.shapes && (snap.shapes.tried || levelOf(p) === "beginner")) {
        stones += '<div class="stone shapes' + (snap.shapes.solid ? " solid" : "") + '"><span>' + (snap.shapes.solid ? '<span class="star">★ </span>' : "") +
          esc(snap.shapes.title) + '</span><span class="muted">' + (snap.shapes.solid ? "solid" : Math.round(snap.shapes.mastery * 100) + "%") + "</span></div>";
      }
      if (snap.sight) {
        var sDone = snap.sight.known >= snap.sight.total;
        stones += '<div class="stone sight-words' + (sDone ? " solid" : "") + '"><span>' + (sDone ? '<span class="star">★ </span>' : "") +
          esc(M.SIGHT_SKILL.title) + '</span><span class="muted">' + snap.sight.known + " of " + snap.sight.total + " words</span></div>";
      }
      if (snap.words) {
        var wDone = snap.words.known >= snap.words.total;
        stones += '<div class="stone sight-words word-match' + (wDone ? " solid" : "") + '"><span>' + (wDone ? '<span class="star">★ </span>' : "") +
          esc(M.WORD_SKILL.title) + '</span><span class="muted">' + snap.words.known + " of " + snap.words.total + " words</span></div>";
      }
      return '<section class="panel" data-subject="' + s.id + '"><span class="tab" style="background:var(--' + s.id + ');color:#fff;border-radius:99px;padding:2px 8px;font-size:.75rem;font-weight:800">' +
        esc(s.short) + "</span><h2>" + esc(snap.rank.title) + (snap.rank.star ? " ★" : "") + "</h2>" +
        '<div class="meter"><span style="width:' + snap.score + '%"></span></div><div class="stones">' + stones + "</div></section>";
    }).join("");
    return "<h1>" + esc(p.name) + "'s classroom wall</h1>" + blocks;
  }

  function viewParent() {
    var p = active();
    var bands = M.BANDS.map(function (b) {
      return '<button type="button" class="hat' + (p.ageBand === b ? " on" : "") + '" data-act="band" data-id="' + b + '">' + b + "</button>";
    }).join("");
    var goals = [5, 10, 15].map(function (n) {
      return '<button type="button" class="hat' + ((p.goalMin || 10) === n ? " on" : "") + '" data-act="goal" data-id="' + n + '">' + n + " min</button>";
    }).join("");
    var hides = M.homeSubjects().map(function (s) {
      var hidden = (p.hidden || []).indexOf(s.id) >= 0;
      return '<button type="button" class="hat' + (hidden ? "" : " on") + '" data-act="toggle-subject" data-id="' + s.id + '">' + esc(s.short) + "</button>";
    }).join("");
    var scores = M.SUBJECTS.filter(function (s) { return !s.under || M.subjectShown(p, s); }).map(function (s) {
      var snap = M.snapshot(p, s.id);
      var lines = snap.skills.map(function (sk) {
        return '<div class="skill-line"><span>' + esc(sk.title) + "</span><span>" +
          (sk.solid ? "solid" : "step " + sk.earnedStep + " · " + Math.round(sk.mastery * 100) + "%") + "</span></div>";
      }).join("");
      var levelLine = "";
      if (s.id === "math") {
        levelLine = '<div class="skill-line"><span>Level</span><span>' + esc(mathLevelTitle(levelOf(p))) + "</span></div>";
      }
      var topicLines = "";
      if (snap.topics && snap.topics.length) {
        topicLines = '<div class="skill-line topic-head"><span><strong>Topics</strong> (mixed into practice)</span><span>' +
          snap.topicsStarted + " of " + snap.topics.length + " started</span></div>" +
          snap.topics.map(function (t) {
            return '<div class="skill-line topic-line" data-topic="' + esc(t.id) + '"><span>' + esc(t.title) + "</span><span>" +
              (t.solid ? "solid" : t.tried ? (t.earnedStep ? "step " + t.earnedStep + " · " : "") + t.right + " of " + t.tried + " right" : "not started") + "</span></div>";
          }).join("");
      }
      var sightLine = "";
      if (snap.shapes) {
        sightLine += '<div class="skill-line shapes-line"><span><strong>' + esc(snap.shapes.title) + "</strong> (Beginner level)</span><span>" +
          (snap.shapes.solid ? "solid" : snap.shapes.tried ? "step " + snap.shapes.earnedStep + " · " + snap.shapes.right + " of " + snap.shapes.tried + " right" : "not started") + "</span></div>";
      }
      if (snap.mathmix) {
        sightLine += '<div class="skill-line shapes-line mathmix-line"><span><strong>' + esc(snap.mathmix.title) + "</strong> (Beginner level)</span><span>" +
          (snap.mathmix.solid ? "solid" : snap.mathmix.tried ? "step " + snap.mathmix.earnedStep + " · " + snap.mathmix.right + " of " + snap.mathmix.tried + " right" : "not started") + "</span></div>";
      }
      if (snap.sight) {
        sightLine = '<div class="skill-line sight-line"><span><strong>' + esc(M.SIGHT_SKILL.title) + "</strong> (mixed into Beginner practice)</span><span>" +
          snap.sight.known + " of " + snap.sight.total + " words" +
          (snap.sight.answers ? " · " + snap.sight.right + " of " + snap.sight.answers + " right" : "") + "</span></div>";
      }
      if (snap.words) {
        sightLine += '<div class="skill-line sight-line word-line"><span><strong>' + esc(M.WORD_SKILL.title) + "</strong> (mixed into Beginner practice)</span><span>" +
          snap.words.known + " of " + snap.words.total + " words" +
          (snap.words.answers ? " · " + snap.words.right + " of " + snap.words.answers + " right" : "") + "</span></div>";
      }
      return "<h2>" + esc(s.name) + " · " + snap.score + "</h2>" + levelLine + lines + sightLine + topicLines;
    }).join("");
    return "<h1>Parent</h1><p class=\"sub\">Ages " + esc(p.ageBand) + " for " + esc(p.name) + ".</p>" +
      '<div class="panel"><strong>Age band</strong><div class="hats">' + bands + "</div></div>" +
      '<div class="panel"><strong>Daily ring</strong><div class="hats">' + goals + "</div></div>" +
      '<div class="panel"><strong>Subjects on the home screen</strong><div class="hats">' + hides + "</div></div>" +
      '<div class="row-actions">' +
      '<button type="button" class="text-btn" data-act="hear">' + (p.hearWords ? "Hear words: on" : "Hear words: off") + "</button>" +
      '<button type="button" class="text-btn" data-act="motion">' + (p.reduceMotion ? "Less motion: on" : "Less motion: off") + "</button>" +
      "</div><div class=\"panel\">" + scores + "</div>" + creditsPanel() +
      '<button type="button" class="text-btn" data-act="delete">' + (ui.deleting ? "Yes, delete this player" : "Delete this player") + "</button>";
  }

  function creditsPanel() {
    var list = M.BANK_SOURCES || [];
    if (!list.length) return "";
    var rows = list.map(function (src) {
      return '<div class="skill-line credit-line"><span>' + esc(src.name) + " · " + esc(src.by) + " · " + esc(src.used) + "</span><span>" +
        esc(src.license) + "</span></div>";
    }).join("");
    return '<div class="panel credits"><strong>Question sources</strong>' + rows +
      '<p class="muted">Some questions are adapted. Full list in CREDITS.md.</p></div>';
  }

  function thingSvg(id) {
    if (M.thing3d) return M.thing3d(id);
    var paths = {
      apple: '<circle cx="20" cy="24" r="13" fill="#e23d3d"/><ellipse cx="16" cy="20" rx="3" ry="2" fill="#ff8d86" opacity="0.8"/><path d="M20 12 C22 6 28 8 25 14" stroke="#6b3a1f" stroke-width="2" fill="none"/><ellipse cx="29" cy="12" rx="7" ry="3.2" fill="#3c9a4a" transform="rotate(-30 29 12)"/><circle cx="15" cy="24" r="1.3" fill="#3a1414"/><circle cx="24" cy="24" r="1.3" fill="#3a1414"/><path d="M16 28 Q20 31 24 28" stroke="#3a1414" stroke-width="1.2" fill="none"/>',
      star: '<polygon points="20,2 24.8,13 36,14 27.4,21.5 30.2,33 20,26.6 9.8,33 12.6,21.5 4,14 15.2,13" fill="#ffe56b" stroke="#e0a106" stroke-width="1"/>',
      heart: '<path d="M20 34 C6 22 6 11 14 9 C18 8 20 14 20 14 C20 14 22 8 26 9 C34 11 34 22 20 34 Z" fill="#ff5d73"/><ellipse cx="14" cy="15" rx="3" ry="2" fill="#ffd0d6"/>',
      ball: '<circle cx="20" cy="20" r="15" fill="#3d7bff"/><path d="M7 16 Q20 24 33 16" stroke="#f4f7e6" stroke-width="2" fill="none"/><path d="M14 6 Q19 20 13 34" stroke="#f4f7e6" stroke-width="2" fill="none"/><circle cx="15" cy="18" r="1.4" fill="#17305c"/><circle cx="24" cy="18" r="1.4" fill="#17305c"/>',
      block: '<rect x="6" y="8" width="28" height="26" rx="4" fill="#ffb703" stroke="#c47e00" stroke-width="2"/><circle cx="15" cy="18" r="1.5" fill="#6b3a1f"/><circle cx="25" cy="18" r="1.5" fill="#6b3a1f"/><path d="M15 24 Q20 28 25 24" stroke="#6b3a1f" stroke-width="1.4" fill="none"/>',
      flower: '<circle cx="10" cy="14" r="7" fill="#ff8fab"/><circle cx="30" cy="14" r="7" fill="#ff8fab"/><circle cx="10" cy="28" r="7" fill="#c77dff"/><circle cx="30" cy="28" r="7" fill="#c77dff"/><circle cx="20" cy="21" r="6" fill="#ffe56b"/><circle cx="18" cy="20" r="1" fill="#6b3a1f"/><circle cx="22" cy="20" r="1" fill="#6b3a1f"/>',
      moon: '<circle cx="20" cy="20" r="15" fill="#ffe56b" stroke="#e0a106" stroke-width="2"/><circle cx="15" cy="18" r="1.6" fill="#6b3a1f"/><circle cx="25" cy="18" r="1.6" fill="#6b3a1f"/><path d="M15 24 Q20 28 25 24" stroke="#6b3a1f" stroke-width="1.4" fill="none"/>',
      fish: '<ellipse cx="17" cy="21" rx="13" ry="9" fill="#3ec6e0"/><polygon points="28,21 38,10 38,32" fill="#2aa8c4"/><circle cx="12" cy="18" r="1.8" fill="#17382e"/><path d="M10 24 Q14 27 18 24" stroke="#17382e" stroke-width="1.2" fill="none"/>',
      leaf: '<path d="M20 36 C7 24 8 8 20 3 C32 8 33 24 20 36 Z" fill="#3cbf6e"/><path d="M20 8 V32" stroke="#146b32" stroke-width="1.6"/><path d="M20 16 L12 13 M20 22 L28 18" stroke="#146b32" stroke-width="1.2"/>',
      cup: '<path d="M10 8 H27 L24 32 H13 Z" fill="#fffdf8" stroke="#c4a574" stroke-width="1.5"/><path d="M27 12 H32 A6 6 0 0 1 32 24 H27" fill="none" stroke="#c4a574" stroke-width="2.2"/><path d="M14 14 H22" stroke="#9fd4e6" stroke-width="3"/><circle cx="16" cy="22" r="1.2" fill="#6b3a1f"/><circle cx="22" cy="22" r="1.2" fill="#6b3a1f"/>',
      circle: '<circle cx="20" cy="20" r="14" fill="#7eb6ff" stroke="#2f6fed" stroke-width="2"/>',
      square: '<rect x="6" y="6" width="28" height="28" rx="4" fill="#ff8fab" stroke="#e24b4b" stroke-width="2"/>',
      triangle: '<polygon points="20,4 37,35 3,35" fill="#ffe56b" stroke="#e0a106" stroke-width="2"/>',
      diamond: '<polygon points="20,3 37,20 20,37 3,20" fill="#c77dff" stroke="#8d4ec4" stroke-width="2"/>',
      crayon: '<rect x="15" y="4" width="10" height="22" rx="2" fill="#ff5d73"/><polygon points="15,26 25,26 20,36" fill="#ffb703"/><rect x="15" y="4" width="10" height="5" fill="#1c2430"/>',
      card: '<rect x="7" y="5" width="26" height="30" rx="3" fill="#fffdf8" stroke="#e0a106" stroke-width="2"/><polygon points="20,11 22.2,16 28,16.4 23.4,20 25,26 20,22.4 15,26 16.6,20 12,16.4 17.8,16" fill="#ffe56b"/>'
    };
    return '<svg viewBox="0 0 40 40" aria-hidden="true">' + (paths[id] || paths.star) + "</svg>";
  }

  function storySvg(name) {
    var ids = { apples: "apple", apple: "apple", crayons: "crayon", crayon: "crayon", blocks: "block", block: "block", stickers: "star", sticker: "star", cards: "card", card: "card" };
    return thingSvg(ids[name] || "star");
  }

  function roverSvg() {
    return '<svg class="buddy" viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="12" width="30" height="16" rx="7" fill="#ff5d73"/><circle cx="12" cy="30" r="4" fill="#1c2430"/><circle cx="28" cy="30" r="4" fill="#1c2430"/><circle cx="13" cy="30" r="1.4" fill="#fff"/><circle cx="29" cy="30" r="1.4" fill="#fff"/><circle cx="15" cy="19" r="2" fill="#fff"/><circle cx="24" cy="19" r="2" fill="#fff"/><path d="M16 24 Q20 27 24 24" stroke="#fff" stroke-width="1.4" fill="none"/></svg>';
  }

  function gemSvg() {
    return '<svg class="buddy gem" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,4 33,15 20,36 7,15" fill="#5ad1ff" stroke="#1f7fb8" stroke-width="1.6"/><polygon points="20,4 26,15 20,36 14,15" fill="#a8ebff" opacity="0.8"/><line x1="7" y1="15" x2="33" y2="15" stroke="#1f7fb8" stroke-width="1.2"/></svg>';
  }
  function keySvg() {
    return '<svg class="buddy key-art" viewBox="0 0 40 40" aria-hidden="true"><circle cx="13" cy="20" r="7" fill="none" stroke="#e0a106" stroke-width="4"/><path d="M20 20 H35 M29 20 V26 M34 20 V25" stroke="#e0a106" stroke-width="4" stroke-linecap="round" fill="none"/></svg>';
  }
  function doorSvg(open) {
    return '<svg class="buddy door-art" viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="4" width="24" height="32" rx="3" fill="' + (open ? "#c9f2c7" : "#a0612b") + '" stroke="#5b3413" stroke-width="2"/>' +
      (open ? '<path d="M14 20 L19 25 L27 14" stroke="#2f8a2b" stroke-width="3" fill="none" stroke-linecap="round"/>' : '<circle cx="26" cy="21" r="2.2" fill="#ffe56b"/><rect x="15" y="15" width="10" height="9" rx="2" fill="#ffe56b" stroke="#5b3413" stroke-width="1.2"/>') + "</svg>";
  }

  function starSvg() {
    return '<svg class="buddy" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,2 24.8,13 36,14 27.4,21.5 30.2,33 20,26.6 9.8,33 12.6,21.5 4,14 15.2,13" fill="#ffe56b" stroke="#e0a106" stroke-width="1.2"/></svg>';
  }

  function countArt(thing, n, wide) {
    var html = "";
    var count = Math.max(0, Math.min(20, n));
    for (var i = 0; i < count; i++) html += '<i class="count-item">' + thingSvg(thing) + "</i>";
    return '<div class="dots' + (wide ? " count-wide" : "") + '">' + html + "</div>";
  }

  function pie(frac) {
    var parts = String(frac || "1/2").split("/");
    var num = parseInt(parts[0], 10);
    var den = parseInt(parts[1], 10);
    if (!den || den < 1) den = 1;
    if (!num || num < 0) num = 0;
    var portion = Math.max(0, Math.min(1, num / den));
    var d = "";
    if (portion >= 0.999) {
      d = "M40 10 A30 30 0 1 1 39.9 10 Z";
    } else if (portion > 0.001) {
      var angle = portion * Math.PI * 2;
      var large = angle >= Math.PI ? 1 : 0;
      var x = (40 + 30 * Math.sin(angle)).toFixed(2);
      var y = (40 - 30 * Math.cos(angle)).toFixed(2);
      d = "M40 40 L40 10 A30 30 0 " + large + " 1 " + x + " " + y + " Z";
    }
    return '<svg class="pie-art" viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" fill="#fffdf8" stroke="#e7c48a" stroke-width="5"/>' +
      (d ? '<path d="' + d + '" fill="#ff5d73"/>' : "") +
      '<circle cx="40" cy="40" r="6" fill="#ffe56b"/></svg>';
  }

  // v20: every shape (circle, 3 to 10 sides) as a colorful 3D-style picture: a darker copy under it for the
  // thick edge, the face, and a soft shine. marks "num" puts a numbered dot on each corner, "dot" a plain dot.
  var SHAPE_COLORS = {
    circle: ["#7eb6ff", "#2f6fed"], triangle: ["#ffe56b", "#d39200"], square: ["#ff8fab", "#d63c5a"],
    rectangle: ["#3ec6e0", "#1f8ea8"], rhombus: ["#c49bff", "#7a4fd6"], pentagon: ["#7be08a", "#2f9a48"],
    hexagon: ["#ffb35c", "#d9731a"], heptagon: ["#5fd6c2", "#1f9886"], octagon: ["#ff6b6b", "#c22d2d"],
    nonagon: ["#9fb4ff", "#4a5ed1"], decagon: ["#ffd36b", "#c48a12"]
  };
  var SHAPE_SIDES = { triangle: 3, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, nonagon: 9, decagon: 10 };
  function shapePoints(name) {
    if (name === "square") return [[16, 14], [64, 14], [64, 62], [16, 62]];
    if (name === "rectangle") return [[8, 20], [112, 20], [112, 62], [8, 62]];
    if (name === "rhombus") return [[40, 6], [70, 38], [40, 70], [10, 38]];
    var n = SHAPE_SIDES[name] || 3;
    var pts = [];
    // A flat bottom edge: start half a turn step off the top for even counts.
    var off = n % 2 === 0 ? Math.PI / n : 0;
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + off + i * 2 * Math.PI / n;
      pts.push([40 + 30 * Math.cos(ang), 40 + 30 * Math.sin(ang) + (n === 3 ? 5 : 1)]);
    }
    return pts;
  }
  function shapeArt(name, marks) {
    var col = SHAPE_COLORS[name] || SHAPE_COLORS.triangle;
    var wide = name === "rectangle";
    var head = '<svg class="shape-art' + (wide ? " wide" : "") + '" data-shape="' + esc(name) + '" viewBox="0 0 ' + (wide ? 120 : 80) + ' 82" role="img" aria-label="' + esc(name) + '">' +
      // A top-to-bottom shade and a soft shadow give the 3D look without extra edges that could be miscounted.
      '<defs><linearGradient id="sg-' + esc(name) + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.45"/>' +
      '<stop offset="0.45" stop-color="' + col[0] + '"/><stop offset="1" stop-color="' + col[1] + '" stop-opacity="0.85"/></linearGradient></defs>';
    var fill = 'url(#sg-' + esc(name) + ')';
    if (name === "circle") {
      return head + '<circle class="face" cx="40" cy="40" r="28" fill="' + col[0] + '" stroke="' + col[1] + '" stroke-width="3.5"/>' +
        '<circle cx="40" cy="40" r="28" fill="' + fill + '"/>' +
        '<ellipse cx="31" cy="29" rx="8" ry="4" fill="#fff" opacity="0.6"/></svg>';
    }
    var pts = shapePoints(name);
    var str = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    var html = head + '<polygon class="face" points="' + str + '" fill="' + col[0] + '" stroke="' + col[1] + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<polygon points="' + str + '" fill="' + fill + '"/>';
    var cx = pts.reduce(function (a, p) { return a + p[0]; }, 0) / pts.length, cy = pts.reduce(function (a, p) { return a + p[1]; }, 0) / pts.length;
    html += '<ellipse cx="' + (cx - 9).toFixed(1) + '" cy="' + (cy - 10).toFixed(1) + '" rx="8" ry="3.5" fill="#fff" opacity="0.5"/>';
    if (marks) {
      pts.forEach(function (p, i) {
        html += '<g class="corner-mark"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (marks === "num" ? 5.6 : 3.4) + '" fill="#fff" stroke="#24315c" stroke-width="1.6"/>' +
          (marks === "num" ? '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 2.6).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-weight="800" fill="#24315c">' + (i + 1) + "</text>" : "") + "</g>";
      });
    }
    return html + "</svg>";
  }

  function rectArt(w, h) {
    var cells = "";
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var fill = (x + y) % 2 === 0 ? "#7eb6ff" : "#ffe56b";
        cells += '<rect x="' + (x * 22) + '" y="' + (y * 22) + '" width="18" height="18" rx="3" fill="' + fill + '"/>';
      }
    }
    return '<svg class="rect-art" style="--rw:' + w + ";--rh:" + h + '" viewBox="0 0 ' + (w * 22) + " " + (h * 22) + '">' + cells + "</svg>";
  }

  function gridArt(grid, opts) {
    opts = opts || {};
    var clickable = opts.clickable;
    // The grid keeps its shape (w by h squares) and is scaled in CSS to fit the space left on the board.
    var html = '<div class="grid-slot"><div class="grid" style="--gw:' + grid.w + ";--gh:" + grid.h +
      ";grid-template-columns:repeat(" + grid.w + ",1fr);grid-template-rows:repeat(" + grid.h + ',1fr)">';
    for (var y = 0; y < grid.h; y++) {
      for (var x = 0; x < grid.w; x++) {
        var cls = "cell";
        var mark = "";
        var wall = (grid.walls || []).some(function (w) { return w.x === x && w.y === y; });
        if (wall) cls += " wall";
        if (grid.goal && grid.goal.x === x && grid.goal.y === y) { cls += " goal"; mark = starSvg(); }
        // v25 robot puzzles: gems, a key and a door (picked-up things are gone, the door opens with the key)
        (grid.items || []).forEach(function (it, j) {
          if (it.x === x && it.y === y && !(opts.got && opts.got[j])) { cls += " gem-cell"; mark += gemSvg(); }
        });
        if (grid.key && grid.key.x === x && grid.key.y === y && !opts.hasKey) { cls += " key-cell"; mark += keySvg(); }
        if (grid.door && grid.door.x === x && grid.door.y === y) { cls += opts.hasKey ? " door-cell open" : " door-cell"; mark += doorSvg(!!opts.hasKey); }
        var roverHere = opts.rover && opts.rover.x === x && opts.rover.y === y;
        if (roverHere) {
          cls += " rover";
          mark += roverSvg();
        }
        if (opts.cell && opts.cell.x === x && opts.cell.y === y) cls += " selected";
        if (clickable && !wall) {
          html += '<button type="button" class="' + cls + '" data-act="cell" data-x="' + x + '" data-y="' + y + '"><span class="mark">' + mark + "</span></button>";
        } else {
          html += '<div class="' + cls + '" data-x="' + x + '" data-y="' + y + '"><span class="mark">' + mark + "</span></div>";
        }
      }
    }
    return html + "</div></div>";
  }

  function boardArt(q, pr) {
    var b = q.board || { kind: "words" };
    if (b.kind === "equation") {
      return '<div class="equation"><span class="num-tile">' + esc(b.a) + '</span><span class="op-tile">' + esc(b.op) +
        '</span><span class="num-tile">' + esc(b.b) + "</span></div>";
    }
    if (b.kind === "story") return '<div class="hero-art">' + storySvg(b.thing) + "</div>";
    if (b.kind === "dots") return countArt(b.thing, b.n, true);
    if (b.kind === "sumdots") {
      return '<div class="sumdots">' + countArt(b.thing, b.a) + '<span class="op">' + esc(b.op) + "</span>" + countArt(b.thing, b.b) + "</div>";
    }
    if (b.kind === "groups") {
      var g = "";
      for (var i = 0; i < b.groups; i++) g += "<div>" + countArt(b.thing, b.each) + "</div>";
      return '<div class="sumdots">' + g + "</div>";
    }
    if (b.kind === "shape") return shapeArt(b.shape, b.marks);
    if (b.kind === "sidecount") {
      return '<div class="equation sidecount"><span class="num-tile">' + esc(b.n) + '</span><span class="op-tile word-tile">' + esc(b.word) + "</span></div>";
    }
    if (b.kind === "pie") return pie(b.fraction);
    if (b.kind === "pies") return pie(b.left || "1/2") + pie(b.right || "1/4");
    if (b.kind === "rect") return rectArt(b.w, b.h);
    if (b.kind === "place") return '<div class="chalk-word">' + esc(b.n) + "</div>";
    if (b.kind === "listen") {
      return '<button type="button" class="play" data-act="speak-prompt">Play</button>';
    }
    if (b.kind === "flash") {
      return '<p class="flash-word">' + esc(b.word) + "</p>";
    }
    if (b.kind === "seeword") {
      // Beginner: the word to find, big, with a Play button that says it again.
      return '<p class="flash-word see-word">' + esc(b.word) + "</p>" +
        '<button type="button" class="play" data-act="speak-prompt" aria-label="Hear it again">Play</button>';
    }
    if (b.kind === "readword") {
      var tok = (q.tokens && q.tokens[0]) || { text: b.word };
      var slow = tok.slow ? '<button type="button" class="play" data-act="speak-slow">Slow</button>' : "";
      return '<div class="readword"><span class="chalk-word">' + esc(b.word) + '</span>' +
        '<button type="button" class="play" data-act="speak-token">Play</button>' + slow + "</div>";
    }
    if (b.kind === "sentence" || b.kind === "passage") {
      var play = q.sound ? '<button type="button" class="play" data-act="speak-prompt">Play</button>' : "";
      return "<p class=\"chalk-prompt\">" + esc(b.text || q.prompt) + "</p>" + play;
    }
    if (b.kind === "scene") return M.sceneHTML(b.scene);
    if (b.kind === "fable") {
      var storyPlay = q.sound && q.sound.kind === "story" ? '<button type="button" class="play" data-act="speak-story">Play</button>' : "";
      return '<div class="fable' + (b.scene ? " with-scene" : "") + '">' + (b.scene ? M.sceneHTML(b.scene) : "") + "<div>" +
        (b.title ? '<p class="fable-title">' + esc(b.title) + "</p>" : "") +
        '<p class="fable-text">' + esc(b.text) + "</p>" + storyPlay + "</div></div>";
    }
    if (b.kind === "bank") return "";
    if (b.kind === "grid") {
      var grid = (pr && pr.replay && pr.phase === "explain") ? pr.replay.grid : b.grid;
      var rover = null;
      if (pr && pr.replay && pr.phase === "explain" && pr.replay.rover) rover = pr.replay.rover;
      else if (pr && pr.rover) rover = pr.rover;
      else if (grid && grid.start) rover = grid.start;
      var held = { got: null, hasKey: false };
      if (q.robot && pr && pr.phase === "ask") {
        var doneMoves = q.robot.mode === "plan" ? (pr.robotRun || []) : (pr.sequence || []);
        var sofar = M.runMoves(grid, doneMoves);
        held = { got: sofar.got, hasKey: sofar.hasKey };
      }
      var art = gridArt(grid, {
        clickable: q.input === "cell" && pr && pr.phase === "ask" && !pr.mathOk,
        rover: rover,
        cell: pr && pr.cell,
        got: held.got,
        hasKey: held.hasKey
      });
      if (q.robot && pr && pr.phase === "ask") {
        var bump = pr.robotBump ? '<p class="robot-bump" role="status">' + esc(pr.robotBump) + "</p>" : "";
        return art + bump;
      }
      var prog = "";
      if (b.program && b.program.length) {
        prog = '<div class="prog">';
        b.program.forEach(function (step, i) {
          var cls = "step";
          if (b.bad === i) cls += " bad";
          if (step === "?") cls += " hole";
          prog += '<span class="' + cls + '">' + esc(step) + "</span>";
        });
        prog += "</div>";
      }
      return art + prog;
    }
    return "";
  }

  function viewPractice() {
    var p = active();
    var pr = ui.practice;
    var q = pr.question;
    if (pr.phase === "placedone") {
      var meta = M.skillMeta(pr.subjectId, p.ageBand, pr.working.skillId);
      return reportCard(pr, p, "Warm-up done") +
        '<p class="report-next">We will start with ' + esc(meta.title) + ", step " + pr.working.step + ".</p>" +
        "</div></div>" +
        '<div class="desk"><button type="button" class="go" data-act="begin-set">Start practice</button></div>';
    }
    if (pr.phase === "setdone") {
      return reportCard(pr, p, "Report card") + "</div></div>" +
        '<div class="desk row-actions"><button type="button" class="go" data-act="again">Keep going</button>' +
        '<button type="button" class="text-btn" data-act="home">Home</button></div>';
    }
    var sub = subjectById(pr.subjectId);
    var skill = M.skillMeta(pr.subjectId, p.ageBand, q.skillId);
    var art = boardArt(q, pr);
    var prompt = q.prompt;
    var feedback = "";
    if (pr.mathOk) feedback = '<p class="result-correct">Correct</p>';
    if (pr.mathOk && pr.celebrate) {
      pr.celebrate = false;
      if (!p.reduceMotion) feedback += burstHTML();
    }
    else if (pr.missMark) feedback = '<p class="result-x" aria-hidden="true">X</p>';
    var notice = pr.notice ? '<p class="chalk-note">' + esc(pr.notice) + "</p>" : "";
    var credit = q.credit ? '<p class="bank-credit">' + esc(q.credit) + "</p>" : "";
    var promptHTML = '<p class="chalk-prompt' + (q.bankId && String(prompt).length > 70 ? " long" : "") + '">' + esc(prompt) + "</p>";
    if (readsAloud(q) && pr.phase === "ask") {
      promptHTML += '<button type="button" class="play read-aloud" data-act="read-aloud" aria-label="Read the question and answers again">Play</button>';
    }
    // The picture / objects sit in .art, which takes the board space left after the text (see fitBoard).
    if (art) art = '<div class="art art-' + esc((q.board && q.board.kind) || "words") + '">' + art + "</div>";
    if (pr.mathOk && q.didYouKnow) {
      // After the right answer the picture makes room for a short fact (fits the same space).
      art = '<div class="art art-dyk"><p class="did-you-know' + (q.whyLabel ? " heres-why" : "") + '"><strong>' + esc(q.whyLabel || "Did you know?") + "</strong> " + esc(q.didYouKnow) + "</p></div>";
    }
    var lead = promptHTML + feedback + art;
    if (q.board && q.board.kind === "fable") lead = art + promptHTML + feedback;
    var pips = "";
    if (pr.mode === "place") {
      for (var i = 0; i < pr.plan.length; i++) {
        var cls = "pip" + (i < pr.index ? " on" : "") + (i === pr.index ? " now" : "");
        pips += '<i class="' + cls + '"></i>';
      }
    }
    var shownLevel = pr.mathLevel || pr.level;
    var levelTitle = shownLevel && MATH_LEVELS[shownLevel] ? " · " + MATH_LEVELS[shownLevel].title : "";
    if (pr.mathStyle && pr.mathStyle.length === 1 && MATH_STYLES[pr.mathStyle[0]]) levelTitle += " · " + MATH_STYLES[pr.mathStyle[0]].title;
    if (q.ladderTier) levelTitle += " · " + M.LADDER.titles[q.ladderTier];
    return '<div class="frame"><div class="board"><p class="chalk-kicker">' + esc(sub.name) + " · " + esc(skill.title) + levelTitle +
      (pr.mode === "place" ? " · warm-up" : "") + "</p>" +
      lead + notice + credit + "</div></div>" +
      '<div class="desk">' + deskHTML(q, pr) + "</div>" +
      '<div class="pips">' + pips + "</div>" +
      sessionBar();
  }

  // A short star-and-confetti burst on Correct (hidden with Less motion or prefers-reduced-motion).
  var BURST_COLORS = ["#ffd23f", "#ff5d7a", "#3478f0", "#2fb35f", "#f59a2a", "#7d5ce0"];
  function burstHTML() {
    var bits = "";
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
      var dist = 90 + (i % 3) * 45;
      var dx = Math.round(Math.cos(a) * dist), dy = Math.round(Math.sin(a) * dist * 0.75);
      var star = i % 3 === 0;
      bits += '<i class="' + (star ? "b-star" : "b-bit") + '" style="--dx:' + dx + "px;--dy:" + dy + "px;--rot:" + (i * 47 % 360) + "deg;--c:" + BURST_COLORS[i % BURST_COLORS.length] + ";--d:" + (i % 4) * 30 + 'ms">' + (star ? "★" : "") + "</i>";
    }
    return '<div class="burst" aria-hidden="true">' + bits + "</div>";
  }

  function sessionBar() {
    return '<div class="session-bar">' +
      '<button type="button" class="text-btn" data-act="skip">Skip</button>' +
      '<button type="button" class="text-btn end-session" data-act="stop">End session</button>' +
      "</div>";
  }

  function sessionGrade(log) {
    var correct = 0;
    var wrong = 0;
    var skipped = 0;
    (log || []).forEach(function (item) {
      if (item.skipped) skipped += 1;
      else if (item.correct) correct += 1;
      else wrong += 1;
    });
    var answered = correct + wrong;
    var pct = answered ? Math.round((100 * correct) / answered) : null;
    return { correct: correct, wrong: wrong, skipped: skipped, pct: pct, letter: pct === null ? "–" : letterFor(pct) };
  }

  function letterFor(pct) {
    if (pct >= 90) return "A";
    if (pct >= 80) return "B";
    if (pct >= 70) return "C";
    if (pct >= 60) return "D";
    return "F";
  }

  function gradeRemark(letter) {
    if (letter === "A") return "Excellent";
    if (letter === "B") return "Great work";
    if (letter === "C") return "Good";
    if (letter === "D") return "Keep going";
    if (letter === "F") return "Try again";
    return "No grade yet";
  }

  function gradeBadge(pr) {
    if (pr.phase !== "setdone" && pr.phase !== "placedone") {
      var done = pr.index || 0;
      var goal = pr.mode === "place" ? pr.plan.length : 100;
      return '<div class="grade-badge" aria-label="' + done + " of " + goal + '">' +
        '<span class="grade-letter">' + done + "</span>" +
        '<span class="grade-pct">of ' + goal + "</span></div>";
    }
    var g = sessionGrade(pr.log);
    var pct = g.pct === null ? "" : g.pct + "%";
    return '<div class="grade-badge" aria-label="Grade ' + g.letter + (pct ? " " + pct : "") + '">' +
      '<span class="grade-letter">' + g.letter + "</span>" +
      (pct ? '<span class="grade-pct">' + pct + "</span>" : "") +
      "</div>";
  }

  function reportCard(pr, p, kicker) {
    var g = sessionGrade(pr.log);
    var sub = subjectById(pr.subjectId);
    var pct = g.pct === null ? "—" : g.pct + "%";
    var counts = g.pct === null
      ? (g.skipped ? g.skipped + " skipped" : "No answers yet")
      : g.correct + " correct · " + g.wrong + " incorrect" + (g.skipped ? " · " + g.skipped + " skipped" : "");
    var extra = pr.celebration && pr.celebration !== "Set complete." ? '<p class="report-note">' + esc(pr.celebration) + "</p>" : "";
    return '<div class="frame"><div class="report-card"><p class="report-kicker">' + esc(kicker) + "</p>" +
      "<h2>" + esc(p.name) + "</h2><p class=\"report-subject\">" + esc(sub.name) + "</p>" +
      '<p class="report-mark">' + g.letter + "</p>" +
      '<p class="report-pct">' + pct + "</p>" +
      '<p class="report-remark">' + gradeRemark(g.letter) + "</p>" +
      '<p class="report-counts">' + esc(counts) + "</p>" + extra;
  }

  function cardSpeech(word) {
    var text = String(word || "").trim();
    if (/^[A-Za-z]$/.test(text)) return text.toUpperCase();
    return text;
  }

  function deskHTML(q, pr) {
    if (q.input === "flash") {
      return '<button type="button" class="go flash-hear" data-act="flash-hear">Hear it</button>' +
        '<p class="flash-note">A grown-up marks this card.</p><div class="flash-actions">' +
        '<button type="button" class="go flash-yes" data-act="flash-yes">Correct</button>' +
        '<button type="button" class="go flash-no" data-act="flash-no">Incorrect</button></div>';
    }
    if (q.input === "sequence") return sequenceDesk(q, pr);
    if (q.input === "cell") {
      return '<button type="button" class="go" data-act="cell-go"' + (pr.mathOk ? " disabled" : "") + ">Go</button>";
    }
    var locked = !!pr.mathOk;
    var longest = 0;
    q.choices.forEach(function (c) { longest = Math.max(longest, String(c.label).length); });
    var choices = q.choices.map(function (c) {
      var cls = "choice";
      if (locked && pr.lastRes && pr.lastRes.choiceId === c.id) cls += " got-it";
      else if (!locked && pr.missMark === c.id) cls += " miss";
      return '<button type="button" class="' + cls + '"' + (locked ? " disabled" : "") + ' data-act="pick" data-id="' + esc(c.id) + '">' + esc(c.label) + "</button>";
    }).join("");
    var typer = "";
    if (q.allowType && q.step >= 4) {
      var keys = q.answerKind === "number" ? "1234567890" : "abcdefghijklmnopqrstuvwxyz";
      if (q.answerKind !== "number" && q.typedAnswer && /[0-9/]/.test(String(q.typedAnswer))) keys = "1234567890/";
      var keyHtml = "";
      for (var i = 0; i < keys.length; i++) {
        keyHtml += '<button type="button" class="key" data-act="key" data-id="' + keys[i] + '"' + (locked ? " disabled" : "") + ">" + keys[i] + "</button>";
      }
      var inputCls = "";
      if (locked && pr.lastRes && pr.lastRes.text != null && String(pr.lastRes.text).trim() !== "") inputCls = " got-it";
      else if (!locked && pr.missMark === "typed") inputCls = " miss";
      typer = '<div class="type-row"><input id="typed" class="' + inputCls + '" autocomplete="off" aria-label="Type the answer" value="' + esc(pr.typed || "") + '"' + (locked ? " disabled" : "") + ">" +
        '<button type="button" class="key" data-act="backspace"' + (locked ? " disabled" : "") + ">⌫</button>" +
        '<button type="button" class="go" data-act="type-go"' + (locked ? " disabled" : "") + ">Go</button></div><div class=\"keys\">" + keyHtml + "</div>";
    }
    // Reading ladder sentences: two wide columns so each sentence reads on one or two lines.
    var wide = q.ladderTier && longest > 22 ? " wide-choices" : "";
    return '<div class="choices' + wide + '">' + choices + "</div>" + typer;
  }

  function sequenceDesk(q, pr) {
    var dis = pr.mathOk || pr.robotRunning ? " disabled" : "";
    if (q.robot && !dis && q.robot.budget && (pr.sequence || []).length >= q.robot.budget) dis = " disabled";
    var keys = [
      { dir: "U", arrow: "↑", name: "Up" },
      { dir: "L", arrow: "←", name: "Left" },
      { dir: "D", arrow: "↓", name: "Down" },
      { dir: "R", arrow: "→", name: "Right" }
    ];
    var pad = '<div class="pad" role="group" aria-label="Arrow keys">' + keys.map(function (k) {
      return '<button type="button" class="arrow-key" data-act="drive" data-dir="' + k.dir + '" aria-label="' + k.name + '"' + dis + ">" + k.arrow + "</button>";
    }).join("") + "</div>";
    if (!q.robot) return pad;
    var off = pr.mathOk || pr.robotRunning;
    var none = !(pr.sequence || []).length;
    var left = '<div class="robot-side">' +
      '<button type="button" class="tool-btn" data-act="robot-undo"' + (off || none ? " disabled" : "") + ">Undo</button>" +
      '<button type="button" class="tool-btn" data-act="robot-clear"' + (off || none ? " disabled" : "") + ">Clear</button>" +
      (q.robot.budget ? '<button type="button" class="tool-btn robot-loop" data-act="robot-repeat" title="Repeat the last arrow one more time"' +
        (off || none || (pr.sequence || []).length >= q.robot.budget ? " disabled" : "") + ">Repeat ↻</button>" : "") + "</div>";
    var planned = pr.sequence || [];
    var strip = '<div class="prog robot-prog" aria-label="Your arrows">';
    // v25 Expert: runs of the same arrow show as one repeat loop chip ("→ ×3").
    var runs = [];
    planned.forEach(function (d, i) {
      var last = runs[runs.length - 1];
      if (q.robot.budget && last && last.d === d) last.n += 1; else runs.push({ d: d, n: 1, at: i });
    });
    var shownRuns = runs.length > 12 ? runs.slice(-12) : runs;
    shownRuns.forEach(function (r) {
      var ran = pr.robotRun && r.at + r.n <= pr.robotRun.length;
      strip += '<span class="step' + (ran ? " ran" : "") + (r.n > 1 ? " loop" : "") + '">' + esc({ R: "→", L: "←", U: "↑", D: "↓" }[r.d]) + (r.n > 1 ? '<small class="loop-n">×' + r.n + "</small>" : "") + "</span>";
    });
    if (!planned.length) strip += '<span class="step empty">' + (q.robot.mode === "plan" ? "Your arrows go here" : "Your moves") + "</span>";
    strip += "</div>";
    var count = q.robot.budget ? '<p class="robot-count">' + planned.length + " of " + q.robot.budget + " moves</p>" : "";
    var right = '<div class="robot-side robot-plan">' + strip + count + (q.robot.mode === "plan"
      ? '<button type="button" class="go robot-go" data-act="robot-go"' + (off || none ? " disabled" : "") + ">Go</button>" : "") + "</div>";
    return '<div class="robot-desk">' + left + pad + right + "</div>";
  }

  function robotUndo(all) {
    var pr = ui.practice;
    if (!pr || pr.phase !== "ask" || pr.mathOk || pr.robotRunning) return;
    var q = pr.question;
    if (!q || !q.robot) return;
    pr.sequence = all ? [] : (pr.sequence || []).slice(0, -1);
    pr.robotBump = "";
    var end = M.runMoves(q.grid, q.robot.mode === "step" ? pr.sequence : []);
    pr.rover = { x: end.x, y: end.y };
    render();
  }

  function robotGo() {
    var pr = ui.practice;
    if (!pr || pr.phase !== "ask" || pr.mathOk || pr.robotRunning) return;
    var q = pr.question;
    if (!q || !q.robot || q.robot.mode !== "plan") return;
    var plan = (pr.sequence || []).slice();
    if (!plan.length) return;
    var p = active();
    var run = M.runMoves(q.grid, plan);
    var steps = run.trail.length - 1;
    pr.robotBump = "";
    function finish() {
      pr.robotRunning = false;
      if (!run.done) {
        pr.robotBump = run.doorHit ? "The door is locked. Get the key first!" : run.bumped ? "Bump! The robot hit a wall." :
          (q.grid.goal && run.x === q.grid.goal.x && run.y === q.grid.goal.y) ? "Get every gem before the star." : "The robot did not reach the star.";
      }
      pr.robotRun = null;
      submit({ sequence: plan });
    }
    if (p && p.reduceMotion) { pr.rover = { x: run.x, y: run.y }; pr.robotRun = plan.slice(0, steps); finish(); return; }
    pr.robotRunning = true;
    pr.robotRun = [];
    var i = 0;
    (function tick() {
      var cur = ui.practice;
      if (cur !== pr || pr.phase !== "ask") return;
      if (i >= steps) { arm(260, finish); return; }
      i += 1;
      pr.robotRun = plan.slice(0, i);
      pr.rover = { x: run.trail[i].x, y: run.trail[i].y };
      render();
      arm(Math.max(200, Math.min(330, Math.round(3600 / steps))), tick);
    })();
  }

  function driveArrow(dir) {
    var pr = ui.practice;
    if (!pr || pr.phase !== "ask" || pr.mathOk) return;
    var q = pr.question;
    if (!q || q.input !== "sequence" || !q.grid || !q.grid.start) return;
    if (q.robot) {
      if (pr.robotRunning) return;
      var now = (pr.sequence || []).concat([dir]);
      if (q.robot.mode === "plan") {
        if (q.robot.budget && now.length > q.robot.budget) return;
        pr.sequence = now;
        pr.robotBump = "";
        render();
        return;
      }
      // step mode: the robot moves on every press; a wall or the edge is a soft bump (no move, no miss)
      var run = M.runMoves(q.grid, now);
      if (run.bumped) {
        pr.robotBump = "Bump! Try another way.";
        pr.robotBumps = (pr.robotBumps || 0) + 1;
        render();
        return;
      }
      pr.sequence = now;
      pr.robotBump = "";
      pr.rover = { x: run.x, y: run.y };
      if (run.done) { submit({ sequence: now.slice() }); return; }
      render();
      return;
    }
    var pos = pr.rover || q.grid.start;
    var end = M.runMoves({
      w: q.grid.w,
      h: q.grid.h,
      start: { x: pos.x, y: pos.y },
      walls: q.grid.walls || []
    }, [dir]);
    var taken = (pr.sequence || []).concat([dir]);
    if (end.bumped) {
      pr.rover = { x: q.grid.start.x, y: q.grid.start.y };
      pr.sequence = [];
      submit({ sequence: taken });
      return;
    }
    pr.sequence = taken;
    pr.rover = { x: end.x, y: end.y };
    if (q.grid.goal && end.x === q.grid.goal.x && end.y === q.grid.goal.y) {
      submit({ sequence: taken.slice() });
      return;
    }
    render();
  }

  function openGate(next) {
    var a = 36 + Math.floor(Math.random() * 40);
    var b = 27 + Math.floor(Math.random() * 40);
    if ((a % 10) + (b % 10) < 10) a += 5;
    ui.gate = { a: a, b: b, error: "" };
    ui.afterGate = next;
    ui.screen = "gate";
    clearTimer();
    render();
  }

  function blankProfile(draft) {
    var p = {
      id: uid(),
      name: draft.name,
      color: draft.color,
      hat: draft.hat,
      photo: draft.photo || "",
      pass: (draft.pass || []).slice(),
      ageBand: draft.ageBand,
      hearWords: false,
      goalMin: 10,
      hidden: [],
      soundOn: true,
      reduceMotion: false,
      subjects: {},
      days: {}
    };
    M.SUBJECTS.forEach(function (s) { M.ensureBand(p, s.id); });
    return p;
  }

  // The Home level (p.level). First time: the old math picker's saved level (p.mathTrain)
  // if there is one, else the level for the age band.
  function levelOf(p) {
    if (!p) return "beginner";
    if (!MATH_LEVELS[p.level]) p.level = MATH_LEVELS[p.mathTrain] ? p.mathTrain : (BAND_LEVEL[p.ageBand] || "beginner");
    return p.level;
  }

  // Earned level in a subject (math keeps its own rule in M.mathProgress).
  function earnedLevel(p, subjectId) {
    return subjectId === "math" ? M.mathProgress(p).id : M.levelProgress(p, subjectId).id;
  }

  function clampToLevel(step, levelId) {
    var spec = MATH_LEVELS[levelId];
    if (!spec) return step;
    return Math.max(spec.min, Math.min(spec.max, step));
  }

  function mathLevelTitle(id) {
    return MATH_LEVELS[id] ? MATH_LEVELS[id].title : "Beginner";
  }

  function mathStyles() {
    var picked = ui.mathStyle || ["objects", "numbers"];
    return picked.filter(function (id) { return !!MATH_STYLES[id]; });
  }

  function mathStyleMode(list) {
    var picked = (list || []).filter(function (id) { return !!MATH_STYLES[id]; });
    if (picked.length === 1) return picked[0];
    if (picked.length > 1) return "mix";
    return "";
  }

  function stepForLevel(step, levelId, role, skillId) {
    var spec = specFor(skillId, levelId);
    if (!spec) return step;
    var s = step;
    if (s < spec.min || s > spec.max) s = spec.start;
    if (role === "review") return Math.max(spec.min, s - 1);
    if (role === "stretch") return Math.min(spec.max, s + 1);
    return s;
  }

  function trainStart(earnedStep, levelId) {
    var spec = MATH_LEVELS[levelId];
    var earned = earnedStep || 0;
    if (!spec) return Math.max(1, earned);
    if (earned >= spec.max) return spec.max;
    if (earned >= spec.start && spec.start < spec.max) return spec.start + 1;
    return spec.start;
  }

  function trainCursors(profile, ids, levelId) {
    var band = M.ensureBand(profile, "math");
    var cursors = {};
    ids.forEach(function (id) {
      var skill = band.skills[id];
      var earned = skill ? M.evaluateSkill(skill).earnedStep : 0;
      // Shapes has its own 5-step ladder at Beginner: carry on from the step earned.
      cursors[id] = { step: id === "shapes" ? Math.max(1, Math.min(5, earned || 1)) : id === "mathmix" ? Math.max(1, Math.min(2, earned || 1)) : trainStart(earned, levelId), up: 0, down: 0 };
    });
    return cursors;
  }

  function moveTrainStep(pr, skillId, result) {
    var spec = specFor(skillId, pr.mathLevel);
    var cur = pr.trainStep && pr.trainStep[skillId];
    if (!spec || !cur) return "";
    var moved = M.nextWorking({
      skillId: skillId,
      step: cur.step,
      up: cur.up || 0,
      down: cur.down || 0,
      support: false
    }, [skillId], {
      counts: true,
      correct: !!result.correct,
      unaided: !!result.unaided
    });
    var step = moved.working.step;
    if (step < spec.min) step = spec.min;
    if (step > spec.max) step = spec.max;
    pr.trainStep[skillId] = { step: step, up: moved.working.up, down: moved.working.down };
    if (step === cur.step) return "";
    if (moved.notice === "harder" || moved.notice === "easier") return moved.notice;
    return "";
  }

  function startSubject(subjectId, focus, level) {
    var p = active();
    var band = M.ensureBand(p, subjectId);
    var skills = subjectId === "math" ? mathSections(p, level || levelOf(p)) : M.SKILLS[subjectId][p.ageBand];
    var chosen = (focus || []).filter(function (id) {
      return skills.some(function (s) { return s.id === id; });
    });
    skills = M.SKILLS[subjectId][p.ageBand];
    var useLevel = subjectId === "math" && chosen.length && MATH_LEVELS[level];
    var before = M.snapshot(p, subjectId);
    var topicOnly = ui.pendingTopic || null;
    ui.pendingTopic = null;
    if (useLevel && !band.placed) band.placed = true;
    if (!band.placed && !topicOnly) {
      var pool = chosen.length ? chosen : skills.map(function (s) { return s.id; });
      var plan = [];
      var guard = 0;
      while (plan.length < 8 && guard++ < 20) {
        for (var pi = 0; pi < pool.length && plan.length < 8; pi++) {
          plan.push({ role: "place", skillId: pool[pi], step: plan.length % 2 === 0 ? 2 : 3 });
        }
      }
      ui.practice = basePractice(subjectId, "place", plan, before);
      ui.practice.notice = "Warm-up: eight questions to find your spot.";
    } else {
      var roles = [];
      for (var block = 0; block < 10; block++) {
        M.planSet().forEach(function (role) { roles.push({ role: role }); });
      }
      ui.practice = basePractice(subjectId, "set", roles, before);
    }
    if (chosen.length) ui.practice.focus = chosen.slice();
    if (topicOnly) ui.practice.topicOnly = topicOnly;
    ui.practice.level = levelOf(p);
    if (useLevel) {
      p.mathTrain = level;
      p.level = level;
      ui.practice.level = level;
      ui.practice.mathLevel = level;
      ui.practice.mathStyle = mathStyles().slice();
      p.mathStyle = ui.practice.mathStyle.slice();
      ui.practice.trainStep = trainCursors(p, chosen, level);
    }
    ui.screen = "practice";
    loadQuestion(true);
  }

  function basePractice(subjectId, mode, plan, before) {
    return {
      subjectId: subjectId,
      mode: mode,
      plan: plan,
      index: 0,
      phase: "ask",
      startedAt: Date.now(),
      shownAt: Date.now(),
      log: [],
      before: before,
      helped: false,
      question: null,
      notice: "",
      sequence: [],
      used: [],
      asked: [],
      cell: null,
      typed: "",
      replay: null
    };
  }

  // Which set questions are topic questions: 2nd and 6th of every 8 (index 1, 5) and the 8th (index 7).
  // The 4th (index 3) stays the subject's starter-bank question, the rest are the core skills.
  function isTopicSlot(pr) {
    if (!M.topicsFor || !M.topicsFor(pr.subjectId).length) return false;
    return pr.index % 4 === 1 || pr.index % 8 === 7;
  }

  // Which Beginner reading set questions are sight words: the 2nd and 6th of every 8 (index 1, 5).
  function isSightSlot(pr) {
    return pr.index % 8 === 1 || pr.index % 8 === 5;
  }
  // v23 Word match: the 4th and 8th of every 8 (index 3, 7) are everyday words (cup, dog, car ...).
  function isWordSlot(pr) {
    return pr.index % 8 === 3 || pr.index % 8 === 7;
  }

  function pickTopic(p, pr, band) {
    if (pr.topicPick && pr.topicPick.index === pr.index) return pr.topicPick.pick;
    var level = pr.level || levelOf(p);
    var steps = M.bankLevelSteps ? M.bankLevelSteps(level) : [1, 2];
    var recent = pr.topicRecent || [];
    var options = M.topicsFor(pr.subjectId).filter(function (t) {
      return M.bankLevelItems && M.bankLevelItems(pr.subjectId, t.id, level).length > 0;
    });
    var fresh = options.filter(function (t) { return recent.indexOf(t.id) < 0; });
    if (fresh.length) options = fresh;
    var pick = null;
    if (options.length) {
      var count = function (t) { var r = band.skills[t.id]; return r ? r.answers.length : 0; };
      var least = Math.min.apply(null, options.map(count));
      var pool = options.filter(function (t) { return count(t) <= least + 2; });
      var t = pool[Math.floor(Math.random() * pool.length)];
      var earned = M.evaluateSkill(band.skills[t.id]).earnedStep || 0;
      var st = Math.min(steps[steps.length - 1], Math.max(steps[0], earned + 1));
      pick = { id: t.id, step: st };
      pr.topicRecent = recent.concat([t.id]).slice(-6);
    }
    pr.topicPick = { index: pr.index, pick: pick };
    return pick;
  }

  function loadQuestion(doSpeak) {
    var p = active();
    var pr = ui.practice;
    var slot = pr.plan[pr.index];
    var band = M.ensureBand(p, pr.subjectId);
    var skills = M.SKILLS[pr.subjectId][p.ageBand];
    var ids = skills.map(function (s) { return s.id; });
    var skillId, step, support, role;
    if (pr.mode === "place") {
      skillId = slot.skillId;
      step = slot.step;
      support = false;
      role = "place";
    } else if (pr.focus && pr.focus.length) {
      role = slot.role;
      skillId = pr.focus[pr.index % pr.focus.length];
      if (pr.mathLevel) {
        if (!pr.trainStep) pr.trainStep = trainCursors(p, pr.focus, pr.mathLevel);
        if (!pr.trainStep[skillId]) pr.trainStep[skillId] = trainCursors(p, [skillId], pr.mathLevel)[skillId];
        if (role !== "review" && role !== "stretch") role = "train";
        step = stepForLevel(pr.trainStep[skillId].step, pr.mathLevel, role, skillId);
        support = false;
      } else {
        var track = (band.tracks && band.tracks[skillId]) || { step: 1, support: false };
        if (role === "review") {
          step = Math.max(1, track.step - 1);
          support = false;
        } else if (role === "stretch" && track.step < 5) {
          step = track.step + 1;
          support = false;
        } else {
          step = track.step;
          support = !!track.support;
          role = "work";
        }
      }
    } else {
      role = slot.role;
      var w = band.working;
      var idx = Math.max(0, ids.indexOf(w.skillId));
      if (role === "review") {
        skillId = idx > 0 ? ids[Math.floor(Math.random() * idx)] : w.skillId;
        step = skillId === w.skillId ? Math.max(1, w.step - 1) : Math.min(3, w.step);
        support = false;
      } else if (role === "stretch") {
        skillId = w.skillId;
        step = w.step + 1;
        if (step > 5) {
          if (idx < ids.length - 1) { skillId = ids[idx + 1]; step = 1; }
          else { step = 5; role = "work"; }
        }
        support = false;
      } else {
        skillId = w.skillId;
        step = w.step;
        support = !!w.support;
        role = "work";
      }
    }
    if (pr.subjectId === "science" && pr.mode === "set" && role === "work" && skillId !== "space" && pr.index % 3 === 0) {
      skillId = "space";
      support = false;
    } else if (pr.mode === "set" && !(pr.focus && pr.focus.length) && isTopicSlot(pr) && pickTopic(p, pr, band)) {
      // Physics topics (v13): about 3 in every 8 set questions come from the topic skills,
      // picked so the least-practiced topics with questions at this level come first.
      var topicPick = pickTopic(p, pr, band);
      skillId = topicPick.id;
      step = topicPick.step;
      support = false;
      role = "work";
    } else if (pr.mode === "set" && role === "work" && !(pr.focus && pr.focus.length) && pr.index % 4 === 3) {
      // Mix in a starter-bank question now and then, the same way space joins science.
      var bankSkill = M.BANK_SKILLS && M.BANK_SKILLS[pr.subjectId];
      if (bankSkill && skillId !== bankSkill && ids.indexOf(bankSkill) >= 0 && M.bankHas && M.bankHas(pr.subjectId, bankSkill)) {
        var bankEarned = M.evaluateSkill(band.skills[bankSkill]).earnedStep || 0;
        skillId = bankSkill;
        step = Math.min(5, Math.max(1, bankEarned + 1));
        support = false;
      }
    }
    if (pr.subjectId === "astronomy" && pr.mode === "set" && role === "work" && !(pr.focus && pr.focus.length) && skillId !== "astrospace" && pr.index % 4 === 2) {
      // v21 Astronomy: 1 in 4 set questions are the generated planets-and-space questions; the rest the space quiz bank.
      skillId = "astrospace";
      step = Math.max(1, Math.min(5, (M.evaluateSkill(band.skills.astrospace).earnedStep || 0) + 1));
      support = false;
    }
    if (pr.subjectId === "programming" && pr.mode === "set" && !(pr.focus && pr.focus.length) && skillId !== "robot" && pr.index % 2 === 0 && band.skills.robot) {
      // v25 Robot arrows: every other programming set question is an arrow robot puzzle (its step stays in the Home level).
      skillId = "robot";
      step = Math.max(1, Math.min(5, (M.evaluateSkill(band.skills.robot).earnedStep || 0) + 1));
      support = false;
      role = "work";
    }
    var shapeMix = false;
    if (pr.subjectId === "math" && pr.mode === "set" && !(pr.focus && pr.focus.length) && (pr.level || levelOf(p)) === "beginner" && pr.index % 8 === 6) {
      // v20 Shapes: 1 in 8 Beginner math set questions, on its own 5-step ladder.
      skillId = "shapes";
      step = Math.max(1, Math.min(5, (M.evaluateSkill(band.skills.shapes).earnedStep || 0) + 1));
      support = false;
      role = "work";
      shapeMix = true;
    }
    if (pr.subjectId === "math" && pr.mode === "set" && !(pr.focus && pr.focus.length) && (pr.level || levelOf(p)) === "beginner" && M.MATH_MIX_SKILL &&
      (pr.index % 8 === 1 || pr.index % 8 === 4)) {
      // v30 Math mix: 2 in 8 Beginner math set questions are generated Math mix questions (counting, time, coins...), steps 1-2.
      skillId = "mathmix";
      step = Math.max(1, Math.min(2, (M.evaluateSkill(band.skills.mathmix).earnedStep || 0) + 1));
      support = false;
      role = "work";
      shapeMix = true;
    }
    var sightItem = null;
    var readLevel = pr.level || levelOf(p);
    var sightOn = pr.subjectId === "reading" && pr.mode === "set" && readLevel === "beginner" &&
      !pr.mathLevel && M.extraSkillsFor && M.extraSkillsFor("reading").length > 0;
    if (sightOn && !(pr.focus && pr.focus.length) && isSightSlot(pr)) {
      // v15 Sight words: 2 of every 8 Beginner reading questions (the 2nd and 6th), the word picked so
      // missed and least-seen words come first. Recorded per word; the reading score and path do not move.
      sightItem = M.sightPick(p, Math.random, (p.sightRecent || []).slice(-2));
      if (sightItem) {
        skillId = M.SIGHT_SKILL.id;
        step = sightItem.step;
        support = false;
        role = "work";
      }
    }
    if (sightOn && M.WORD_ITEMS && M.WORD_ITEMS.length && !(pr.focus && pr.focus.length) && isWordSlot(pr)) {
      // v23 Word match: picked like sight words (missed first, a few in progress, then new ones in list order).
      sightItem = M.wordPick(p, Math.random, (p.wordRecent || []).slice(-2));
      if (sightItem) {
        skillId = M.WORD_SKILL.id;
        step = sightItem.step;
        support = false;
        role = "work";
      }
    }
    if (pr.topicOnly && pr.mode === "set") {
      // v26 topic card: every question comes from that Science topic, stepping inside the Home level.
      var tSteps = M.bankLevelSteps ? M.bankLevelSteps(pr.level || levelOf(p)) : [1, 2];
      var tEarned = M.evaluateSkill(band.skills[pr.topicOnly]).earnedStep || 0;
      skillId = pr.topicOnly;
      step = Math.min(tSteps[tSteps.length - 1], Math.max(tSteps[0], tEarned + 1));
      support = false;
      role = "work";
      sightItem = null;
    }
    var forced = pr.forceBank || null;
    var forcedSkill = pr.forceSkill || null;
    pr.forceBank = null;
    pr.forceSkill = null;
    if (forced || forcedSkill) sightItem = null;
    if (forcedSkill) {
      // Tests only: one generated question of this skill and step.
      skillId = forcedSkill.skillId;
      step = forcedSkill.step;
      support = !!forcedSkill.support;
      role = "work";
    } else if (forced) {
      // Tests only: show this exact bank item through the normal question path.
      skillId = forced.skill;
      step = forced.step;
      support = false;
    } else if (!pr.mathLevel && pr.level && skillId !== "shapes" && skillId !== "mathmix") {
      // Every question in the session stays inside the Home level's steps
      // (Beginner 1-2, Intermediate 3-4, Expert 5); bank questions come from that level.
      step = clampToLevel(step, pr.level);
    }
    if (!p.recent) p.recent = {};
    if (!p.recent[skillId]) p.recent[skillId] = [];
    if (!p.lastAsk) p.lastAsk = {};
    if (!pr.asked) pr.asked = [];
    var previous = p.lastAsk[pr.subjectId] || null;
    var ladderTierNow = forcedSkill && forcedSkill.tier ? forcedSkill.tier :
      (pr.mode !== "place" && M.isLadderSkill(pr.subjectId, skillId) ? M.ladderTier(p, skillId, readLevel) : 0);
    var ladderSight = null;
    if (sightOn && !forced && !(forcedSkill && !forcedSkill.sight) && ladderTierNow === 1 && (skillId === "sight" || skillId === "sight2") &&
        (forcedSkill ? true : Math.random() < 0.5)) {
      // v15: on the one-word tier of the sight-word skills, every other word is a Dolch sight word.
      ladderSight = forcedSkill && forcedSkill.sight ? M.SIGHT_ITEMS.filter(function (it) { return it.answer === forcedSkill.sight; })[0] || null
        : M.sightPick(p, Math.random, (p.sightRecent || []).slice(-2));
    }
    pr.question = M.makeQuestion({
      subject: pr.subjectId,
      skillId: skillId,
      step: step,
      support: support && role === "work",
      role: role,
      band: p.ageBand,
      style: forcedSkill && forcedSkill.style != null ? forcedSkill.style : mathStyleMode(pr.mathStyle),
      avoid: forced || forcedSkill ? [] : p.recent[skillId].concat(pr.asked),
      block: forced || !previous ? [] : [previous],
      bankItem: forced || sightItem,
      sightItem: ladderSight,
      tier: ladderTierNow,
      soundOff: p.soundOn === false,
      ladderText: forcedSkill ? forcedSkill.text || "" : "",
      ladderFormat: forcedSkill ? forcedSkill.format || "" : "",
      seeWord: pr.subjectId === "reading" && (pr.level || levelOf(p)) === "beginner",
      shapeKind: forcedSkill ? forcedSkill.shapeKind || "" : "",
      shapeId: forcedSkill ? forcedSkill.shapeId || "" : "",
      profile: p   // v24: no-repeat cycles per child
    });
    pr.ladderMissed = false;
    pr.sightMissed = false;
    pr.robotBump = ""; pr.robotRun = null; pr.robotRunning = false; pr.robotBumps = 0;
    if (pr.question.sightWord) {
      p.sightRecent = (p.sightRecent || []).concat([pr.question.sightWord]).slice(-24);
    }
    if (pr.question.matchWord) {
      p.wordRecent = (p.wordRecent || []).concat([pr.question.matchWord]).slice(-24);
    }
    pr.asked.push(pr.question.key);
    p.recent[skillId].push(pr.question.key);
    while (p.recent[skillId].length > 48) p.recent[skillId].shift();
    p.lastAsk[pr.subjectId] = { key: pr.question.key, near: pr.question.near, look: pr.question.look || "" };
    try { save(); } catch (err) { /* a full device store should not block the next question */ }
    pr.phase = "ask";
    pr.helped = false;
    pr.mathOk = false;
    pr.missMark = null;
    pr.missToken = 0;
    pr.sequence = [];
    pr.used = [];
    pr.rover = null;
    pr.cell = null;
    pr.typed = "";
    pr.replay = null;
    pr.shownAt = Date.now();
    ui.lastSpeech = [];
    render();
    if (doSpeak) quietly(function () { voice(p, pr.question); });
  }

  function markSpeaking(id) {
    var buttons = document.querySelectorAll(".choice");
    for (var i = 0; i < buttons.length; i++) {
      if (id && buttons[i].getAttribute("data-id") === id) buttons[i].classList.add("speaking");
      else buttons[i].classList.remove("speaking");
    }
  }

  function voice(p, q) {
    if (!p || p.soundOn === false) return;
    var parts = [];
    if (q.speakPrompt) parts.push(q.speakPrompt);
    if (q.sound && q.sound.kind === "prompt" && parts.indexOf(q.sound.speak) < 0) parts.push(q.sound.speak);
    if (q.sound && q.sound.kind === "prompt" && q.sound.carrier) parts.push(q.sound.carrier);
    if (p.hearWords && q.step <= 3 && q.tokens) {
      q.tokens.forEach(function (t) {
        if (t.kind === "help" && t.speak) {
          parts.push(t.speak);
          ui.practice.helped = true;
        }
      });
    }
    if (readsAloud(q)) {
      readQuestionAndAnswers(q, parts);
      return;
    }
    if ((q.readChoices) && q.input === "choice" && q.choices && q.choices.length) {
      readScienceAnswers(q, parts);
      return;
    }
    ui.lastSpeech = parts.slice();
    if (parts.length) M.speakAll(parts);
  }

  // Science & Engineering and Physics read every question aloud, then each answer, in order.
  function readsAloud(q) {
    var sid = (q && q.subject) || (ui.practice && ui.practice.subjectId);
    return !!(q && q.input === "choice" && q.choices && q.choices.length && (q.readAll || sid === "science" || sid === "physics" || sid === "astronomy"));   // v30: Math mix reads all too
  }

  function readQuestionAndAnswers(q, parts) {
    var cues = [];
    var owners = [];
    parts.forEach(function (text) {
      M.speechSentences(M.speechText(text)).forEach(function (line) { cues.push(line); owners.push(""); });
    });
    q.choices.forEach(function (c) {
      var line = M.speechText(c.label);
      if (!line) return;
      if (!/[.?!]$/.test(line)) line += ".";
      cues.push(line);
      owners.push(c.id);
    });
    ui.lastSpeech = cues.slice();
    markSpeaking("");
    M.speakCues(cues, {
      gap: 380,
      start: function (i) {
        var pr = ui.practice;
        if (!pr || pr.question !== q || pr.phase !== "ask" || pr.mathOk) return;
        markSpeaking(owners[i] || "");
      },
      done: function () { markSpeaking(""); }
    });
  }

  function readScienceAnswers(q, parts) {
    var cues = parts.slice();
    var firstChoice = cues.length;
    q.choices.forEach(function (c) { cues.push(c.label); });
    ui.lastSpeech = cues.slice();
    markSpeaking("");
    M.speakCues(cues, {
      start: function (i) {
        var pr = ui.practice;
        if (!pr || pr.question !== q || pr.phase !== "ask" || pr.mathOk) return;
        if (i < firstChoice) markSpeaking("");
        else markSpeaking(q.choices[i - firstChoice].id);
      },
      done: function () { markSpeaking(""); }
    });
  }

  function showMiss(pr, res) {
    if (res && res.sequence) {
      pr.sequence = [];
      pr.used = [];
      pr.rover = pr.question && pr.question.grid && pr.question.grid.start
        ? { x: pr.question.grid.start.x, y: pr.question.grid.start.y }
        : null;
      pr.missMark = "seq";
    } else if (res && res.cell) {
      pr.cell = null;
      pr.missMark = "cell";
    } else {
      pr.missMark = res && res.choiceId ? res.choiceId : "typed";
    }
    pr.missToken = (pr.missToken || 0) + 1;
    var token = pr.missToken;
    render();
    arm(900, function () {
      var cur = ui.practice;
      if (!cur || cur.missToken !== token) return;
      cur.missMark = null;
      render();
    });
  }

  // Reading word-length ladder: move the tier for this skill (rules in engine.js, M.LADDER).
  function ladderAnswer(p, pr, q, result) {
    if (!q.ladderTier || !M.isLadderSkill(pr.subjectId, q.skillId) || pr.mode === "place") return;
    var r = M.ladderRecord(p, q.skillId, pr.level || levelOf(p), result);
    pr.ladderNote = "";
    if (r.moved > 0) pr.ladderNote = "Great reading! Next: " + M.LADDER.titles[r.tier].toLowerCase() + ".";
    else if (r.moved < 0) pr.ladderNote = "Let's practice " + M.LADDER.titles[r.tier].toLowerCase() + " for a bit.";
    if (pr.ladderNote && (q.input === "flash" || !result.correct)) { pr.notice = pr.ladderNote; pr.ladderNote = ""; }
  }

  function submit(res) {
    var pr = ui.practice;
    var p = active();
    if (!pr || pr.phase !== "ask" || pr.mathOk) return;
    M.quiet();
    markSpeaking("");
    var q = pr.question;
    var correct = M.grade(q, res);
    if (q.input === "flash") {
      var marked = Date.now();
      var flashUnaided = !!correct;
      M.addPracticeMs(p, Math.min(60000, marked - (pr.shownAt || marked)));
      var flashNotice = M.recordAnswer(p, pr.subjectId, {
        skillId: q.skillId,
        step: q.step,
        correct: correct,
        unaided: flashUnaided,
        role: q.role,
        at: marked
      });
      pr.log.push({ skillId: q.skillId, correct: correct, unaided: flashUnaided, role: q.role });
      pr.lastRes = res;
      if (flashNotice) pr.notice = M.noticeLine(flashNotice);
      ladderAnswer(p, pr, q, { correct: correct, unaided: flashUnaided });
      quietly(save);
      if (correct && p.soundOn !== false) quietly(M.chime);
      advance();
      return;
    }
    if (!correct) {
      pr.log.push({
        skillId: q.skillId,
        step: q.step,
        correct: false,
        unaided: false,
        role: q.role
      });
      if (!pr.ladderMissed) {
        pr.ladderMissed = true;
        ladderAnswer(p, pr, q, { correct: false, unaided: false });
      }
      if (q.sightWord && !pr.sightMissed && pr.mode !== "place") {
        pr.sightMissed = true;
        M.sightRecord(p, q.sightWord, false);
      }
      if (q.matchWord && !pr.sightMissed && pr.mode !== "place") {
        pr.sightMissed = true;
        M.wordRecord(p, q.matchWord, false);
      }
      quietly(save);
      showMiss(pr, res);
      return;
    }
    var unaided = !!(correct && !pr.helped);
    var now = Date.now();
    M.addPracticeMs(p, Math.min(60000, now - (pr.shownAt || now)));
    var beforeLevel = pr.mode === "set" ? earnedLevel(p, pr.subjectId) : "";
    var notice = M.recordAnswer(p, pr.subjectId, {
      skillId: q.skillId,
      step: q.step,
      correct: correct,
      unaided: unaided,
      role: q.role,
      holdSkill: !!(pr.focus && pr.focus.length && !pr.mathLevel),
      at: now
    });
    if (pr.mathLevel && q.role === "train") notice = moveTrainStep(pr, q.skillId, { correct: correct, unaided: unaided });
    pr.log.push({ skillId: q.skillId, correct: correct, unaided: unaided, role: q.role });
    pr.lastRes = res;
    if (!pr.ladderMissed) ladderAnswer(p, pr, q, { correct: true, unaided: unaided });
    if (q.sightWord && !pr.sightMissed && pr.mode !== "place") M.sightRecord(p, q.sightWord, unaided);
    if (q.matchWord && !pr.sightMissed && pr.mode !== "place") M.wordRecord(p, q.matchWord, unaided);
    var afterLevel = beforeLevel ? earnedLevel(p, pr.subjectId) : "";
    if (beforeLevel && afterLevel !== beforeLevel && LEVEL_ORDER.indexOf(afterLevel) > LEVEL_ORDER.indexOf(levelOf(p))) {
      // Earned a higher level: move the Home level up (never down).
      p.level = afterLevel;
      if (pr.subjectId === "math") p.mathTrain = afterLevel;
      pr.notice = "You are " + mathLevelTitle(afterLevel) + " now.";
    }
    else if (notice) pr.notice = M.noticeLine(notice);
    else if (pr.ladderNote) pr.notice = pr.ladderNote;
    else if (q.robot && q.robot.mode === "plan" && res.sequence && res.sequence.length === q.robot.best) pr.notice = "★ Fewest moves!";
    pr.ladderNote = "";
    pr.mathOk = true;
    pr.celebrate = true;
    pr.missMark = null;
    render();
    quietly(save);
    // Move on after a short pause, and not before "Correct" has been said (up to a few seconds).
    var said = p.soundOn === false;
    var waited = false;
    var shown = q;
    function next() {
      var cur = ui.practice;
      if (cur && cur.mathOk && cur.question === shown) advance();
    }
    // A "Did you know?" fact stays up long enough to read (or until it has been read aloud);
    // a tap on the board still moves on right away.
    var fact = q.didYouKnow || "";
    var readMs = fact ? Math.max(1100, Math.min(7000, 900 + 55 * fact.length)) : 1100;
    arm(readMs, function () {
      waited = true;
      if (said) next();
      else arm(fact ? 9000 : 2400, next);
    });
    if (p.soundOn !== false) {
      quietly(M.chime);
      quietly(function () {
        M.speak("Correct", { done: function () {
          if (!fact) { said = true; if (waited) next(); return; }
          var cur = ui.practice;
          if (!cur || cur.question !== shown) return;
          M.speak((q.whyLabel ? q.whyLabel + ". " : "Did you know? ") + fact, { done: function () { said = true; if (waited) next(); } });
        } });
      });
    }
  }

  function startReplay() {
    var pr = ui.practice;
    var q = pr.question;
    var grid = q.grid || (q.explain && q.explain.grid);
    var moves = (q.explain && q.explain.moves) || q.sequence || [];
    if (!grid || !moves.length) return;
    var their = null;
    var res = pr.lastRes || {};
    if (res.sequence && res.sequence.join(",") !== moves.join(",")) their = res.sequence;
    if (res.choiceId && q.wrongMoves && q.choices) {
      var choice = null;
      q.choices.forEach(function (c) { if (c.id === res.choiceId) choice = c; });
      if (choice && q.wrongMoves[choice.label]) their = q.wrongMoves[choice.label];
    }
    var phases = [];
    if (their) phases.push(their);
    phases.push(moves);
    pr.replay = { grid: grid, phases: phases, phase: 0, step: 0, rover: grid.start };
    tickReplay();
  }

  function tickReplay() {
    var pr = ui.practice;
    var p = active();
    if (!pr || !pr.replay || pr.phase !== "explain") return;
    var phaseMoves = pr.replay.phases[pr.replay.phase];
    if (p && p.reduceMotion) {
      var end = M.runMoves(pr.replay.grid, pr.replay.phases[pr.replay.phases.length - 1]);
      pr.replay.rover = { x: end.x, y: end.y };
      pr.replay.phase = pr.replay.phases.length - 1;
      pr.replay.step = phaseMoves.length;
      render();
      return;
    }
    var partial = phaseMoves.slice(0, pr.replay.step);
    var run = M.runMoves(pr.replay.grid, partial);
    pr.replay.rover = { x: run.x, y: run.y };
    render();
    if (pr.replay.step < phaseMoves.length && !run.bumped) {
      pr.replay.step += 1;
      arm(420, tickReplay);
    } else if (pr.replay.phase < pr.replay.phases.length - 1) {
      pr.replay.phase += 1;
      pr.replay.step = 0;
      arm(650, tickReplay);
    }
  }

  function advance() {
    clearTimer();
    M.quiet();
    var pr = ui.practice;
    var p = active();
    if (!pr) return;
    pr.index += 1;
    if (pr.mode === "place" && pr.index >= pr.plan.length) {
      pr.working = M.finishPlacement(p, pr.subjectId, pr.log);
      pr.phase = "placedone";
      save();
      render();
      return;
    }
    if (pr.mode === "set" && pr.index >= 100) {
      finishSet();
      return;
    }
    loadQuestion(true);
  }

  function finishSet() {
    var pr = ui.practice;
    var p = active();
    pr.after = M.snapshot(p, pr.subjectId);
    pr.celebration = celebrate(pr);
    pr.phase = "setdone";
    save();
    render();
    if (p.soundOn !== false) M.speakAll(gradeSpeech(pr));
  }

  function gradeSpeech(pr) {
    var g = sessionGrade(pr.log);
    var parts = [];
    if (g.pct === null) parts.push("No grade yet.");
    else parts.push("Grade " + g.letter + ". " + g.correct + " correct and " + g.wrong + " incorrect.");
    if (pr.celebration && pr.celebration !== "Set complete.") parts.push(pr.celebration);
    return parts;
  }

  function skipQuestion() {
    var pr = ui.practice;
    var p = active();
    if (!pr || pr.phase === "setdone" || pr.phase === "placedone") return;
    clearTimer();
    M.quiet();
    if (pr.phase === "ask") {
      if (p) M.addPracticeMs(p, Math.min(60000, Date.now() - (pr.shownAt || Date.now())));
      pr.log.push({
        skillId: pr.question.skillId,
        step: pr.question.step,
        skipped: true,
        role: pr.question.role
      });
      save();
    }
    advance();
  }

  function celebrate(pr) {
    var name = subjectById(pr.subjectId).name;
    var b = pr.before;
    var a = pr.after;
    if (!a) return "Set complete.";
    if (a.rank.title !== b.rank.title || a.rank.star !== b.rank.star) {
      return "You are a " + a.rank.title + (a.rank.star ? " with a star" : "") + " in " + name + ".";
    }
    for (var i = 0; i < a.skills.length; i++) {
      if (a.skills[i].solid && !b.skills[i].solid) return a.skills[i].title + " is solid.";
    }
    if (a.score > b.score) return name + " moved up.";
    if (a.working.skillId !== b.working.skillId || a.working.step !== b.working.step) {
      var meta = M.skillMeta(pr.subjectId, active().ageBand, a.working.skillId);
      return meta.title + " is on step " + a.working.step + ".";
    }
    return "Set complete.";
  }

  function onAct(act, el) {
    var p = active();
    if (act === "mute") {
      if (p) { p.soundOn = p.soundOn === false; save(); }
      if (!soundOn()) M.quiet();
      render();
      return;
    }
    if (act === "who") {
      clearTimer();
      M.quiet();
      ui.screen = "who";
      ui.activeId = null;
      ui.removeId = null;
      ui.mathPick = [];
      ui.mathStyle = ["objects", "numbers"];
      render();
      return;
    }
    if (act === "home") {
      clearTimer(); M.quiet();
      if (!active()) { ui.screen = "who"; render(); return; }
      ui.screen = "home";
      ui.practice = null;
      render();
      return;
    }
    if (act === "create") {
      ui.draft = { stage: "name", name: "", color: "red", hat: "cap", pass: [], error: "" };
      ui.screen = "create";
      render();
      return;
    }
    if (act === "name-next") {
      var input = document.getElementById("player-name");
      var name = input ? input.value.trim() : "";
      if (!name) { ui.draft.error = "Type a display name."; render(); return; }
      ui.draft.name = name.slice(0, 12);
      ui.draft.error = "";
      ui.draft.stage = "look";
      render();
      return;
    }
    if (act === "color") { ui.draft.color = el.getAttribute("data-id"); render(); return; }
    if (act === "hat") { ui.draft.hat = el.getAttribute("data-id"); render(); return; }
    if (act === "clear-photo") {
      if (ui.draft) ui.draft.photo = "";
      else if (p) { p.photo = ""; save(); }
      render();
      return;
    }
    if (act === "look-next") { ui.draft.pass = []; ui.draft.stage = "age"; ui.draft.error = ""; render(); return; }
    if (act === "age") {
      ui.draft.ageBand = el.getAttribute("data-id");
      var player = blankProfile(ui.draft);
      db.profiles.push(player);
      ui.activeId = player.id;
      ui.draft = null;
      save();
      ui.screen = "home";
      render();
      return;
    }
    if (act === "login") {
      ui.loginId = el.getAttribute("data-id");
      var opening = db.profiles.filter(function (x) { return x.id === ui.loginId; })[0];
      if (opening && (!opening.pass || !opening.pass.length)) {
        ui.activeId = opening.id;
        ui.screen = "home";
        render();
        return;
      }
      ui.loginPass = [];
      ui.loginBad = false;
      ui.screen = "login";
      render();
      return;
    }
    if (act === "login-tap") {
      ui.loginPass.push(el.getAttribute("data-id"));
      if (ui.loginPass.length < 3) { ui.loginBad = false; render(); return; }
      var who = db.profiles.filter(function (x) { return x.id === ui.loginId; })[0];
      if (who && who.pass.join() === ui.loginPass.join()) {
        ui.activeId = who.id;
        ui.screen = "home";
        render();
        return;
      }
      ui.loginPass = [];
      ui.loginBad = true;
      render();
      return;
    }
    if (act === "gate-go") {
      var field = document.getElementById("gate-answer");
      var got = field ? parseInt(field.value, 10) : NaN;
      if (got === ui.gate.a + ui.gate.b) {
        var next = ui.afterGate;
        ui.gate = null;
        ui.afterGate = null;
        next();
      } else {
        ui.gate.error = "Try the sum again.";
        render();
      }
      return;
    }
    if (act === "ask-parent") {
      openGate(function () { ui.screen = "parent"; ui.deleting = false; render(); });
      return;
    }
    if (act === "wall") { ui.screen = "wall"; render(); return; }
    if (act === "reset-open") {
      ui.resetOpen = true;
      ui.resetNote = "";
      render();
      var first = document.querySelector(".reset-pop .reset-pick");
      if (first) first.focus();
      return;
    }
    if (act === "reset-close") { ui.resetOpen = false; render(); return; }
    if (act === "reset-do") {
      var what = el.getAttribute("data-id");
      var done = p ? M.resetProgress(p.id, what) : null;
      ui.resetOpen = false;
      if (done && done.subjects.length) {
        var title = what === "all" ? "Everything" : (M.SUBJECTS.filter(function (s) { return s.id === what; })[0] || {}).name;
        ui.resetNote = title + " is fresh again!";
        var token = ui.resetToken = (ui.resetToken || 0) + 1;
        window.setTimeout(function () {
          if (ui.resetToken !== token || !ui.resetNote) return;
          ui.resetNote = "";
          if (ui.screen === "home") render();
        }, 3500);
      }
      render();
      return;
    }
    if (act === "practice" && el.getAttribute("data-id") === "science" && p &&
        (M.subjectShown(p, { id: "astronomy", under: "science" }) || sciTopicsAt(levelOf(p)).length)) {
      ui.sciencePick = true;
      render();
      var firstSci = document.querySelector(".sci-pop .sci-pick");
      if (firstSci) firstSci.focus();
      return;
    }
    if (act === "sci-close") { ui.sciencePick = false; render(); return; }
    if (act === "practice-topic") {
      // v26: a Science topic card practices just that topic (inside the Home level).
      ui.sciencePick = false;
      ui.pendingTopic = el.getAttribute("data-id");
      startSubject("science");
      return;
    }
    if (act === "practice-sub") {
      ui.sciencePick = false;
      startSubject(el.getAttribute("data-id"));
      return;
    }
    if (act === "practice") {
      if (el.getAttribute("data-id") === "math") {
        ui.mathPick = ui.mathPick || [];
        ui.mathStyle = p && p.mathStyle ? p.mathStyle.filter(function (id) { return !!MATH_STYLES[id]; }) : ["objects", "numbers"];
        ui.screen = "mathpick";
        clearTimer();
        M.quiet();
        render();
        return;
      }
      startSubject(el.getAttribute("data-id"));
      return;
    }
    if (act === "math-style") {
      var styleId = el.getAttribute("data-id");
      if (!MATH_STYLES[styleId]) return;
      ui.mathStyle = mathStyles();
      var styleAt = ui.mathStyle.indexOf(styleId);
      if (styleAt >= 0) ui.mathStyle.splice(styleAt, 1);
      else ui.mathStyle.push(styleId);
      if (p) {
        p.mathStyle = ui.mathStyle.slice();
        save();
      }
      render();
      return;
    }
    if (act === "math-section") {
      var sectionId = el.getAttribute("data-id");
      ui.mathPick = ui.mathPick || [];
      var sectionAt = ui.mathPick.indexOf(sectionId);
      if (sectionAt >= 0) ui.mathPick.splice(sectionAt, 1);
      else ui.mathPick.push(sectionId);
      render();
      return;
    }
    if (act === "home-level") {
      var pickedLevel = el.getAttribute("data-id");
      if (p && MATH_LEVELS[pickedLevel]) {
        p.level = pickedLevel;
        save();
      }
      render();
      return;
    }
    if (act === "math-start") {
      if (!ui.mathPick || !ui.mathPick.length) return;
      startSubject("math", ui.mathPick.slice(), levelOf(p));
      return;
    }
    if (act === "band") { p.ageBand = el.getAttribute("data-id"); save(); render(); return; }
    if (act === "goal") { p.goalMin = parseInt(el.getAttribute("data-id"), 10); save(); render(); return; }
    if (act === "toggle-subject") {
      var id = el.getAttribute("data-id");
      p.hidden = p.hidden || [];
      var at = p.hidden.indexOf(id);
      if (at >= 0) p.hidden.splice(at, 1);
      else p.hidden.push(id);
      save();
      render();
      return;
    }
    if (act === "hear") { p.hearWords = !p.hearWords; save(); render(); return; }
    if (act === "motion") { p.reduceMotion = !p.reduceMotion; save(); render(); return; }
    if (act === "delete") {
      if (!ui.deleting) { ui.deleting = true; render(); return; }
      db.profiles = db.profiles.filter(function (x) { return x.id !== p.id; });
      ui.activeId = null;
      ui.deleting = false;
      save();
      ui.screen = "who";
      render();
      return;
    }
    if (act === "remove-ask") {
      if (!db.profiles.length) return;
      openGate(function () { ui.screen = "remove"; ui.removeId = null; render(); });
      return;
    }
    if (act === "remove") {
      var removeId = el.getAttribute("data-id");
      if (ui.removeId !== removeId) { ui.removeId = removeId; render(); return; }
      db.profiles = db.profiles.filter(function (x) { return x.id !== removeId; });
      if (ui.activeId === removeId) ui.activeId = null;
      ui.removeId = null;
      save();
      if (!db.profiles.length) ui.screen = "who";
      render();
      return;
    }
    if (act === "flash-hear") {
      var heard = ui.practice && ui.practice.question;
      if (!heard || heard.input !== "flash" || !heard.board) return;
      M.speak(cardSpeech(heard.board.word));
      return;
    }
    if (act === "flash-yes") { submit({ flash: "correct" }); return; }
    if (act === "flash-no") { submit({ flash: "incorrect" }); return; }
    if (act === "pick") { submit({ choiceId: el.getAttribute("data-id") }); return; }
    if (act === "key") {
      prType((ui.practice.typed || "") + el.getAttribute("data-id"));
      return;
    }
    if (act === "backspace") {
      prType((ui.practice.typed || "").slice(0, -1));
      return;
    }
    if (act === "type-go") {
      var typed = document.getElementById("typed");
      submit({ text: typed ? typed.value : ui.practice.typed });
      return;
    }
    if (act === "drive") {
      driveArrow(el.getAttribute("data-dir"));
      return;
    }
    if (act === "robot-undo") { robotUndo(false); return; }
    if (act === "robot-clear") { robotUndo(true); return; }
    if (act === "robot-go") { robotGo(); return; }
    if (act === "robot-repeat") { var rp = ui.practice; if (rp && rp.sequence && rp.sequence.length) driveArrow(rp.sequence[rp.sequence.length - 1]); return; }
    if (act === "cell") {
      if (!ui.practice || ui.practice.mathOk) return;
      ui.practice.cell = { x: parseInt(el.getAttribute("data-x"), 10), y: parseInt(el.getAttribute("data-y"), 10) };
      render();
      return;
    }
    if (act === "cell-go") {
      if (!ui.practice || ui.practice.mathOk || !ui.practice.cell) return;
      submit({ cell: ui.practice.cell });
      return;
    }
    if (act === "show-why" || act === "replay") return;
    if (act === "next" || act === "skip") {
      if (act === "skip") skipQuestion();
      else advance();
      return;
    }
    if (act === "begin-set" || act === "again") {
      if (ui.practice && ui.practice.subjectId === "math") {
        ui.mathPick = (ui.practice.focus && ui.practice.focus.length) ? ui.practice.focus.slice() : (ui.mathPick || []);
        ui.practice = null;
        ui.screen = "mathpick";
        render();
        return;
      }
      startSubject(ui.practice.subjectId);
      return;
    }
    if (act === "stop") {
      clearTimer();
      M.quiet();
      if (ui.practice && ui.practice.phase !== "setdone" && ui.practice.phase !== "placedone") finishSet();
      else { ui.screen = "home"; ui.practice = null; render(); }
      return;
    }
    if (PLAY_ACTS[act] && playStatus() !== "ready") return;
    if (act === "speak-story") {
      var told = ui.practice && ui.practice.question;
      if (told && told.sound && told.sound.kind === "story" && soundOn()) M.speak(told.sound.speak);
      return;
    }
    if (act === "read-aloud") {
      var asked = ui.practice && ui.practice.question;
      if (!asked || ui.practice.phase !== "ask" || ui.practice.mathOk || !soundOn()) return;
      quietly(function () { voice(p, asked); });
      return;
    }
    if (act === "speak-prompt") {
      var question = ui.practice.question;
      if (question.sound && question.sound.kind === "prompt") {
        if (soundOn()) {
          if (question.sound.carrier) M.speakAll([question.sound.speak, question.sound.carrier]);
          else M.speak(question.sound.speak);
        }
      } else if (question.speakPrompt && soundOn()) M.speak(question.speakPrompt);
      return;
    }
    if (act === "speak-token" || act === "speak-slow") {
      var token = ui.practice.question.tokens && ui.practice.question.tokens[0];
      if (!token) return;
      if (token.kind === "help") ui.practice.helped = true;
      if (!soundOn()) return;
      if (act === "speak-slow" && token.slow) M.speakAll(token.slow.concat([token.speak]));
      else M.speak(token.speak);
      return;
    }
  }

  function prType(value) {
    if (!ui.practice || ui.practice.mathOk) return;
    ui.practice.typed = value;
    var input = document.getElementById("typed");
    if (input) input.value = value;
    else render();
  }

  if (ui.draft && ui.draft.stage === "age") {
    /* filled by gate callback below */
  }

  function applyPhoto(dataUrl) {
    if (ui.screen === "create" && ui.draft) {
      ui.draft.photo = dataUrl;
      ui.draft.error = "";
      render();
      return;
    }
    var player = active();
    if (!player) return;
    player.photo = dataUrl;
    try { save(); }
    catch (err) { player.photo = ""; }
    render();
  }

  function readPhoto(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var size = 160;
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        var scale = Math.max(size / img.width, size / img.height);
        var w = img.width * scale;
        var h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        applyPhoto(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = function () {
        if (ui.draft) { ui.draft.error = "Choose a picture file."; render(); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  document.getElementById("app").addEventListener("change", function (e) {
    if (e.target && e.target.id === "photo-file") readPhoto(e.target.files && e.target.files[0]);
  });

  document.getElementById("app").addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    onAct(el.getAttribute("data-act"), el);
  });

  document.addEventListener("keydown", function (e) {
    var arrowDir = { ArrowLeft: "L", ArrowRight: "R", ArrowUp: "U", ArrowDown: "D" }[e.key];
    if (arrowDir) {
      var driving = ui.practice && ui.practice.phase === "ask" && !ui.practice.mathOk && ui.practice.question && ui.practice.question.input === "sequence";
      if (driving) {
        e.preventDefault();
        if (!e.repeat) driveArrow(arrowDir);
      }
      return;
    }
    var robotQ = ui.practice && ui.practice.phase === "ask" && !ui.practice.mathOk && ui.practice.question && ui.practice.question.robot;
    if (robotQ && e.key === "Backspace") { e.preventDefault(); robotUndo(false); return; }
    if (robotQ && robotQ.mode === "plan" && (e.key === "Enter" || e.key === " ") && !(document.activeElement && /^(BUTTON|INPUT)$/.test(document.activeElement.tagName))) {
      e.preventDefault(); robotGo(); return;
    }
    if (e.key === "Escape" && ui.resetOpen) { e.preventDefault(); onAct("reset-close"); return; }
    if (e.key === "Escape" && ui.sciencePick) { e.preventDefault(); onAct("sci-close"); return; }
    if (e.key !== "Enter") return;
    if (document.activeElement && document.activeElement.id === "gate-answer") {
      e.preventDefault();
      onAct("gate-go");
    }
    if (document.activeElement && document.activeElement.id === "typed") {
      e.preventDefault();
      onAct("type-go");
    }
    if (document.activeElement && document.activeElement.id === "player-name") {
      e.preventDefault();
      onAct("name-next");
    }
  });

  // Age pick is part of create, rendered when draft.stage is age.
  var _viewCreate = viewCreate;
  viewCreate = function () {
    if (ui.draft && ui.draft.stage === "age") {
      var bands = M.BANDS.map(function (b) {
        return '<button type="button" class="card" data-act="age" data-id="' + b + '"><h2>Ages ' + b + "</h2></button>";
      }).join("");
      return "<h1>Age band</h1><p class=\"sub\">This picks the ladders. A parent can change it later.</p><div class=\"grid-cards\">" + bands + "</div>";
    }
    return _viewCreate();
  };

  // v17: reset one subject ("math", "reading", ...) or "all" for one child (by id), and save.
  // Returns { subjects: [...] } (empty when nothing was reset).
  M.resetProgress = function (childId, subjectId) {
    var child = null;
    db.profiles.forEach(function (pp) { if (pp && pp.id === childId) child = pp; });
    if (!child) return { subjects: [] };
    var res = M.resetProfileProgress(child, subjectId);
    if (res.subjects.length && ui.practice && child.id === ui.activeId &&
        (subjectId === "all" || ui.practice.subjectId === subjectId)) {
      clearTimer();
      ui.practice = null;
      if (ui.screen === "practice") ui.screen = "home";
    }
    if (res.subjects.length) { try { save(); } catch (err) { /* a full store keeps the change for this visit */ } }
    return res;
  };

  M.appTest = {
    reset: function () {
      localStorage.removeItem(KEY);
      db = { profiles: [] };
      ui.activeId = null;
      ui.screen = "who";
      ui.practice = null;
    },
    create: function (opts) {
      opts = opts || {};
      var draft = { name: opts.name || "Ada", color: "blue", hat: "cap", pass: ["apple", "star", "book"], ageBand: opts.band || "7-8" };
      var player = blankProfile(draft);
      if (opts.mathTrain) player.mathTrain = opts.mathTrain;
      if (opts.level) player.level = opts.level;
      if (opts.placed !== false) {
        M.SUBJECTS.forEach(function (s) { M.ensureBand(player, s.id).placed = true; });
      }
      db.profiles.push(player);
      ui.activeId = player.id;
      ui.screen = "home";
      save();
      render();
      return player.id;
    },
    start: function (subject) { startSubject(subject || "math"); },
    // Show one generated question (subject, skill, step; opts.style for math, opts.support).
    showSkill: function (subject, skillId, step, opts) {
      opts = opts || {};
      var pr = ui.practice;
      if (!pr || pr.subjectId !== subject || pr.mode !== "set" || pr.phase === "setdone") {
        M.ensureBand(active(), subject).placed = true;
        startSubject(subject);
        pr = ui.practice;
      }
      clearTimer();
      pr.forceSkill = { skillId: skillId, step: step, support: !!opts.support, style: opts.style == null ? null : opts.style, tier: opts.tier || 0, text: opts.text || "", format: opts.format || "", sight: opts.sight || "", shapeKind: opts.shapeKind || "", shapeId: opts.shapeId || "" };
      loadQuestion(true);
      return true;
    },
    // Show one bank item (by id) in a normal practice session for its subject.
    showBank: function (id) {
      var item = null;
      (M.BANK || []).forEach(function (it) { if (it.id === id) item = it; });
      if (!item) return false;
      var pr = ui.practice;
      if (!pr || pr.subjectId !== item.subject || pr.mode !== "set" || pr.phase === "setdone") {
        M.ensureBand(active(), item.subject).placed = true;
        startSubject(item.subject);
        pr = ui.practice;
      }
      clearTimer();
      pr.forceBank = item;
      loadQuestion(true);
      return true;
    },
    // Run the pending timer now (the pause after Correct), instead of waiting for it.
    flushTimer: function () {
      var t = ui.timerFn;
      if (!t) return false;
      clearTimer();
      t();
      return true;
    },
    home: function () { ui.practice = null; ui.screen = "home"; render(); },
    parent: function () { ui.screen = "parent"; ui.deleting = false; render(); },
    correctAndNext: function () {
      var pr = ui.practice;
      if (!pr || pr.phase === "setdone" || pr.phase === "placedone") {
        if (pr) startSubject(pr.subjectId);
        pr = ui.practice;
      }
      if (!pr) return;
      if (pr.phase === "ask" && !pr.mathOk) {
        var q = pr.question;
        if (q.input === "flash") submit({ flash: "correct" });
        else if (q.input === "sequence") {
          if (q.grid && q.grid.goal) pr.rover = { x: q.grid.goal.x, y: q.grid.goal.y };
          pr.sequence = q.sequence.slice();
          submit({ sequence: q.sequence.slice() });
        }
        else if (q.input === "cell") submit({ cell: { x: q.cell.x, y: q.cell.y } });
        else submit({ choiceId: q.correctChoiceId });
      }
      pr = ui.practice;
      if (pr && pr.phase !== "setdone" && pr.phase !== "placedone" && (pr.phase === "flash" || pr.phase === "explain" || pr.mathOk)) advance();
    },
    state: function () {
      var p = active();
      var pr = ui.practice;
      return {
        screen: ui.screen,
        phase: pr && pr.phase,
        index: pr && pr.index,
        step: pr && p ? M.ensureBand(p, pr.subjectId).working.step : null,
        skill: pr && p ? M.ensureBand(p, pr.subjectId).working.skillId : null,
        questionSkill: pr && pr.question ? pr.question.skillId : null,
        questionStep: pr && pr.question ? pr.question.step : null,
        bankId: pr && pr.question ? pr.question.bankId || "" : "",
        cyclePool: pr && pr.question ? pr.question.cyclePool || "gen|" + (pr.question.subject || "") + "|" + pr.question.skillId + "|" + pr.question.step : "",
        cycleId: pr && pr.question ? (pr.question.cyclePool ? pr.question.cycleId : pr.question.key) : "",
        bankLevel: pr && pr.question ? pr.question.level || "" : "",
        level: pr ? pr.mathLevel || pr.level || "" : "",
        homeLevel: p ? levelOf(p) : "",
        speech: (ui.lastSpeech || []).slice(),
        prompt: pr && pr.question && pr.question.prompt,
        word: pr && pr.question && pr.question.board && pr.question.board.word,
        input: pr && pr.question && pr.question.input,
        play: playStatus(),
        seeWord: pr && pr.question && pr.question.board && pr.question.board.kind === "seeword" ? pr.question.board.word : "",
        sightWord: pr && pr.question ? pr.question.sightWord || "" : "",
        sightKnown: p && M.sightProgress ? M.sightProgress(p).known : 0,
        matchWord: pr && pr.question ? pr.question.matchWord || "" : "",
        wordKnown: p && M.wordProgress ? M.wordProgress(p).known : 0,
        tier: pr && pr.question ? pr.question.ladderTier || 0 : 0,
        target: pr && pr.question ? (pr.question.sound && pr.question.sound.speak) || (pr.question.board && pr.question.board.word) || "" : "",
        ladder: p && p.wordLadder ? JSON.parse(JSON.stringify(p.wordLadder)) : {},
        notice: pr ? pr.notice || "" : "",
        allowType: pr && pr.question && pr.question.allowType,
        mathOk: !!(pr && pr.mathOk),
        correctId: pr && pr.question ? pr.question.correctChoiceId : null,
        moves: pr && pr.question && pr.question.sequence ? pr.question.sequence.slice() : null,
        robot: pr && pr.question && pr.question.robot ? { mode: pr.question.robot.mode, budget: pr.question.robot.budget, best: pr.question.robot.best, gems: pr.question.robot.gems,
          key: !!(pr.question.grid && pr.question.grid.key), planned: (pr.sequence || []).length, running: !!pr.robotRunning, bump: pr.robotBump || "" } : null,
        choices: pr && pr.question && pr.question.choices && pr.question.choices.length,
        logN: pr && pr.log ? pr.log.length : 0,
        lastCorrect: !!(pr && pr.log && pr.log.length && pr.log[pr.log.length - 1].correct),
        celebration: pr && pr.celebration,
        grade: pr ? sessionGrade(pr.log).letter : null,
        pct: pr ? sessionGrade(pr.log).pct : null
      };
    }
  };

  load();
  render();
  if (location.search.indexOf("demo=1") !== -1) {
    M.appTest.reset();
    M.appTest.create({ name: "Ada", band: "5-6", placed: true });
    var which = "reading";
    var match = location.search.match(/subject=([a-z]+)/);
    if (match) which = match[1];
    M.appTest.start(which);
  }
})(window.Merit = window.Merit || {});
