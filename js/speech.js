(function (M) {
  "use strict";

  var ctx = null;

  function audio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  M.chime = function () {
    try {
    var c = audio();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(c.destination);
    o.frequency.setValueAtTime(620, c.currentTime);
    o.frequency.setValueAtTime(830, c.currentTime + 0.09);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.28);
    o.start();
    o.stop(c.currentTime + 0.3);
    } catch (e) {}
  };

  var FEMALE = ["zira", "aria", "jenny", "ana", "sara", "sonia", "libby", "hazel", "susan", "samantha", "karen", "moira", "fiona", "tessa", "veena", "catherine", "linda", "female", "woman"];
  var WARM = ["ana", "jenny", "aria", "sonia", "libby"];
  var MALE = ["david", "mark", "guy", "george", "male", "daniel", "james", "ravi", "alex"];

  function voiceList() {
    if (!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  function isSonia(v) {
    var name = (v.name || "").toLowerCase();
    var lang = (v.lang || "").toLowerCase();
    return name.indexOf("sonia") >= 0 && (lang.indexOf("en") === 0 || name.indexOf("english") >= 0);
  }

  function femaleVoice() {
    var voices = voiceList();
    // Online voices (like Edge's Sonia) can't speak without internet, so offline we pick from the computer's own voices.
    if (navigator.onLine === false) {
      var local = voices.filter(function (v) { return v.localService; });
      if (local.length) voices = local;
    }
    var sonia = null;
    voices.forEach(function (v) {
      if (!sonia && isSonia(v)) sonia = v;
    });
    if (sonia) return sonia;
    var best = null;
    var bestScore = 0;
    voices.forEach(function (v) {
      var name = (v.name || "").toLowerCase();
      var lang = (v.lang || "").toLowerCase();
      if (lang.indexOf("en") !== 0 && name.indexOf("english") < 0) return;
      var score = /en-us/.test(lang) ? 5 : 2;
      FEMALE.forEach(function (hint) { if (name.indexOf(hint) >= 0) score += 12; });
      WARM.forEach(function (hint) { if (name.indexOf(hint) >= 0) score += 14; });
      MALE.forEach(function (hint) { if (name.indexOf(hint) >= 0) score -= 30; });
      if (v.localService) score += 1;
      if (score > bestScore) {
        bestScore = score;
        best = v;
      }
    });
    return best;
  }

  function delivery(voice) {
    var name = ((voice && voice.name) || "").toLowerCase();
    var warm = false;
    WARM.forEach(function (hint) { if (name.indexOf(hint) >= 0) warm = true; });
    if (!voice) return { pitch: 1.4, rate: 1.05, rateAll: 1 };
    if (warm) return { pitch: 1.08, rate: 1.02, rateAll: 0.98 };
    return { pitch: 1.26, rate: 1.05, rateAll: 1 };
  }

  var heldVoice = null;

  function remember() {
    if (!voiceList().length) return;
    heldVoice = femaleVoice();
  }

  // Voices can load late. Wait for them once (up to 1.2 s); after that, speak right away
  // with whatever voice there is, so speech never lags behind the screen.
  var voiceWaitOver = false;

  function readyVoice(done) {
    if (!window.speechSynthesis) return;
    if (voiceList().length) {
      heldVoice = femaleVoice();
      done(heldVoice);
      return;
    }
    if (heldVoice || voiceWaitOver) {
      done(heldVoice);
      return;
    }
    var finished = false;
    function finish() {
      if (finished) return;
      if (!voiceList().length && !heldVoice) return;
      finished = true;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      if (voiceList().length) heldVoice = femaleVoice();
      settle();
      done(heldVoice);
    }
    window.speechSynthesis.addEventListener("voiceschanged", finish);
    setTimeout(function () {
      voiceWaitOver = true;
      if (finished) return;
      finished = true;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      if (voiceList().length) heldVoice = femaleVoice();
      settle();
      done(heldVoice);
    }, 1200);
  }

  function fill(u, voice, rate) {
    u.lang = (voice && voice.lang) || "en-US";
    u.rate = rate;
    u.pitch = delivery(voice).pitch;
    try { if (voice) u.voice = voice; } catch (e) { /* keep the default voice */ }
  }

  var cueRun = 0;

  // Speech status for the Play buttons: "none" (no engine), "loading" (voices not in yet),
  // "speaking" (something asked for is still being said) or "ready".
  var busyRun = 0;
  var busyTimer = null;
  var voicesSettled = false;
  var watchers = [];
  function notify() {
    var st = M.speechStatus();
    watchers.forEach(function (fn) { try { fn(st); } catch (e) {} });
  }
  M.onSpeechStatus = function (fn) { watchers.push(fn); };
  M.speechStatus = function () {
    if (!window.speechSynthesis) return "none";
    if (busyRun) return "speaking";
    if (!voicesSettled && !voiceList().length && !heldVoice) return "loading";
    return "ready";
  };
  function busy(run, ms) {
    busyRun = run;
    window.clearTimeout(busyTimer);
    // Some engines never fire end or error: never stay "speaking" for ever.
    busyTimer = window.setTimeout(function () { idle(run); }, Math.min(60000, ms || 8000));
    notify();
  }
  function idle(run) {
    if (run !== undefined && run !== busyRun) return;  // an older run ending says nothing about the newer one
    busyRun = 0;
    window.clearTimeout(busyTimer);
    notify();
  }
  function settle() {
    if (voicesSettled) return;
    voicesSettled = true;
    notify();
  }

  // Speech that was asked for and then stopped (M.quiet, or newer speech) must not play late:
  // every call remembers its run number and gives up if a newer run started meanwhile.
  function say(utterances, cancel, run) {
    try { if (cancel) window.speechSynthesis.cancel(); } catch (e) {}
    window.setTimeout(function () {
      if (run !== cueRun) return;
      utterances.forEach(function (u) {
        try { window.speechSynthesis.speak(u); } catch (e) { if (u.onerror) u.onerror(e); }
      });
    }, 60);
  }

  // opts.done (optional) runs once when this speech ends, fails, or is stopped / skipped.
  M.speak = function (text, opts) {
    opts = opts || {};
    var called = false;
    var run;
    function finish() { if (called) return; called = true; idle(run); if (opts.done) { try { opts.done(); } catch (e) {} } }
    if (!window.speechSynthesis || !text) { finish(); return; }
    var cancel = opts.cancel !== false;
    run = cancel ? ++cueRun : cueRun;
    busy(run, 2500 + String(text).length * 120);
    try {
      readyVoice(function (voice) {
        if (run !== cueRun) { finish(); return; }
        var u = new SpeechSynthesisUtterance(text);
        fill(u, voice, opts.rate || delivery(voice).rate);
        u.onend = finish;
        u.onerror = finish;
        say([u], cancel, run);
        // Some engines never fire end; do not wait for ever.
        window.setTimeout(finish, Math.min(8000, 1500 + String(text).length * 120));
      });
    } catch (e) { finish(); }
  };

  M.speakAll = function (parts) {
    if (!window.speechSynthesis || !parts || !parts.length) return;
    var run = ++cueRun;
    var total = 0;
    parts.forEach(function (t) { total += String(t || "").length; });
    busy(run, 2500 + total * 120 + parts.length * 600);
    try { readyVoice(function (voice) {
      if (run !== cueRun) return;
      var utterances = [];
      var pace = delivery(voice).rateAll;
      parts.forEach(function (text) {
        if (!text) return;
        var u = new SpeechSynthesisUtterance(text);
        fill(u, voice, pace);
        u.onerror = function () { idle(run); };
        utterances.push(u);
      });
      if (!utterances.length) { idle(run); return; }
      utterances[utterances.length - 1].onend = function () { idle(run); };
      say(utterances, true, run);
    }); } catch (e) { idle(run); /* speech is optional */ }
  };

  M.speakCues = function (cues, hooks) {
    hooks = hooks || {};
    if (!window.speechSynthesis || !cues || !cues.length) {
      if (hooks.done) hooks.done();
      return;
    }
    var run = ++cueRun;
    var budget = 3000;
    cues.forEach(function (t) { budget += Math.min(30000, 1200 + String(t || "").length * 120) + (hooks.gap || 40) + 100; });
    busy(run, budget);
    readyVoice(function (voice) {
      if (run !== cueRun) return;
      var pace = delivery(voice).rateAll;
      function step(i) {
        if (run !== cueRun) return;
        if (i >= cues.length) {
          idle(run);
          if (hooks.done) hooks.done();
          return;
        }
        var text = cues[i];
        if (!text) {
          step(i + 1);
          return;
        }
        var u = new SpeechSynthesisUtterance(text);
        fill(u, voice, pace);
        var moved = false;
        var timer = window.setTimeout(function () { next(); }, Math.min(30000, 1200 + text.length * 120));
        function next() {
          if (moved || run !== cueRun) return;
          moved = true;
          window.clearTimeout(timer);
          window.setTimeout(function () { step(i + 1); }, hooks.gap || 40);
        }
        u.onstart = function () {
          if (run !== cueRun) return;
          if (hooks.start) hooks.start(i);
        };
        u.onend = next;
        u.onerror = next;
        window.speechSynthesis.speak(u);
      }
      window.speechSynthesis.cancel();
      window.setTimeout(function () {
        if (run !== cueRun) return;
        step(0);
      }, 60);
    });
  };

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", function () { remember(); if (voiceList().length) settle(); });
    remember();
    if (voiceList().length) voicesSettled = true;
    // Voices that never arrive: after 1.2 s the default voice is used, so Play is ready.
    window.setTimeout(settle, 1200);
  }

  // Text for read-aloud: no markup or symbols, units and blanks said in words.
  var UNITS = [
    [/°\s*C\b/g, " degrees Celsius"], [/°\s*F\b/g, " degrees Fahrenheit"], [/°/g, " degrees"],
    [/\bkm\s*\/\s*h\b|\bkph\b/gi, "kilometers per hour"], [/\bkm\s*\/\s*s\b/g, "kilometers per second"], [/\bmph\b/gi, "miles per hour"],
    [/\bm\s*\/\s*s\s*(²|\^2)/g, "meters per second squared"], [/\bm\s*\/\s*s\b/g, "meters per second"],
    [/\bcm\s*(³|\^3)/g, "cubic centimeters"], [/\bm\s*(²|\^2)/g, "square meters"], [/\bcm\s*(²|\^2)/g, "square centimeters"],
    [/\bCO2\b|CO₂/g, "carbon dioxide"], [/\bH2O\b|H₂O/g, "water"], [/\bO2\b|O₂/g, "oxygen"]
  ];
  var AFTER_NUMBER = { km: "kilometers", m: "meters", cm: "centimeters", mm: "millimeters", kg: "kilograms", g: "grams",
    mg: "milligrams", mL: "milliliters", ml: "milliliters", L: "liters", s: "seconds", sec: "seconds", min: "minutes",
    h: "hours", hr: "hours", hrs: "hours", N: "newtons", J: "joules", W: "watts", V: "volts", Hz: "hertz", lb: "pounds", lbs: "pounds",
    oz: "ounces", ft: "feet", "in": "inches", mi: "miles", yd: "yards" };
  var SAY = [
    [/\bMakemake\b/g, "Mah-kee Mah-kee"], [/\bHaumea\b/g, "How-may-uh"], [/\bCharon\b/g, "Kair-on"], [/\bCeres\b/g, "Seer-eez"],
    [/\bDeimos\b/g, "Day-mos"], [/\bArrokoth\b/g, "Air-oh-koth"], [/\bKuiper\b/g, "Kye-per"], [/\bTombaugh Regio\b/g, "Tom-baw Ree-jee-oh"],
    [/\bTombaugh\b/g, "Tom-baw"], [/\bDysnomia\b/g, "Dis-no-mee-uh"], [/\bMK two\b/g, "M K two"], [/\bRapa Nui\b/g, "Rah-pah Noo-ee"]
  ];
  M.speechText = function (text) {
    var t = String(text == null ? "" : text);
    t = t.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, " and ").replace(/&[a-z]+;/g, " ");
    t = t.replace(/_{2,}/g, " blank ").replace(/[*`#~^|\\]/g, " ");
    t = t.replace(/\s*\((?:m\/s|km\/h|mph|°C|°F|kg|km|cm|mm)\)/g, "");  // "meters per second (m/s)": say it once
    UNITS.forEach(function (u) { t = t.replace(u[0], u[1]); });
    // Clear unit names may follow a space ("5 km"); one-letter ones only right after the number ("5m").
    t = t.replace(/(\d)\s*(km|mm|cm|mg|mL|ml|kg|sec|min|hrs|hr|Hz|lbs|lb|oz|ft|yd)\b(?!')/g, function (all, d, u) {
      return d + " " + AFTER_NUMBER[u];
    });
    t = t.replace(/(\d)(m|g|L|h|s|N|J|W|V|in|mi)\b(?!')/g, function (all, d, u) {
      return d + " " + AFTER_NUMBER[u];
    });
    t = t.replace(/(\d)\s*%/g, "$1 percent").replace(/%/g, " percent");
    t = t.replace(/(\d)\s*[x×]\s*(\d)/g, "$1 times $2").replace(/×/g, " times ").replace(/÷/g, " divided by ");
    t = t.replace(/\s\/\s/g, " divided by ");
    t = t.replace(/\s=\s/g, " equals ").replace(/\s\+\s/g, " plus ").replace(/\s[−–-]\s(?=\d)/g, " minus ");
    t = t.replace(/(\d)\s*[–-]\s*(\d)/g, "$1 to $2").replace(/&/g, " and ").replace(/\s@\s/g, " at ");
    t = t.replace(/\b([A-Z]{4,})\b/g, function (w) { return w.toLowerCase(); });
    // v22: space names said the way astronomers say them (only the spoken text changes, never the screen).
    SAY.forEach(function (r) { t = t.replace(r[0], r[1]); });
    t = t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s*\(([^()]*)\)/g, ", $1,").replace(/[()\[\]{}"]/g, " ");
    t = t.replace(/,\s*([,.?!;:])/g, "$1").replace(/,\s*$/, "");
    t = t.replace(/\s+([,.?!;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
    return t;
  };

  // Long text in sentence-sized pieces, so no engine cuts a long question short.
  M.speechSentences = function (text) {
    var raw = String(text || "").split(/([.?!]+)\s+(?=[A-Z0-9"'])/);
    var out = [];
    for (var k = 0; k < raw.length; k += 2) {
      var s = (raw[k] + (raw[k + 1] || "")).trim();
      if (!s) continue;
      var prev = out.length ? out[out.length - 1] : "";
      if (prev && /\b(Mr|Mrs|Ms|Dr|St|Mt|vs|etc|e\.g|i\.e)\.$/i.test(prev)) out[out.length - 1] = prev + " " + s;
      else out.push(s);
    }
    return out;
  };

  // Tests only: forget loaded voices so the "loading" state can be checked again.
  M.speechTestReset = function () { voicesSettled = false; voiceWaitOver = false; heldVoice = null; idle(); };

  M.quiet = function () {
    cueRun += 1;
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    idle();
  };
})(window.Merit = window.Merit || {});
