(function (M) {
  "use strict";

  function rngFactory(seed) {
    var a = seed || ((Date.now() ^ ((Math.random() * 1e9) | 0)) >>> 0);
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function choiceQuestion(spec, correctLabel, wrongLabels, support, rng) {
    var unique = [];
    wrongLabels.forEach(function (w) {
      if (w !== correctLabel && unique.indexOf(w) < 0) unique.push(w);
    });
    var need = support ? 1 : Math.min(3, unique.length);
    var labels = shuffle(rng, [correctLabel].concat(shuffle(rng, unique).slice(0, need)));
    var choices = labels.map(function (label, i) {
      return { id: "o" + i, label: String(label) };
    });
    var correct = null;
    choices.forEach(function (c) { if (c.label === String(correctLabel)) correct = c; });
    var q = {
      id: uid(),
      input: "choice",
      allowType: false,
      answerKind: "word",
      choices: choices,
      correctChoiceId: correct.id,
      typedAnswer: String(correctLabel),
      tokens: [],
      sound: null
    };
    Object.keys(spec).forEach(function (k) { q[k] = spec[k]; });
    q.choices = choices;
    q.correctChoiceId = correct.id;
    return q;
  }

  function numberQuestion(spec, answer, support, rng, spread) {
    var set = [answer];
    var guard = 0;
    while (set.length < (support ? 2 : 4) && guard++ < 40) {
      var delta = 1 + Math.floor(rng() * (spread || 4));
      var v = answer + (rng() < 0.5 ? -delta : delta);
      if (v >= 0 && set.indexOf(v) < 0) set.push(v);
    }
    while (set.length < (support ? 2 : 4)) {
      var extra = answer + set.length + 1;
      if (set.indexOf(extra) < 0) set.push(extra);
    }
    var labels = shuffle(rng, set).map(String);
    var choices = labels.map(function (label, i) { return { id: "o" + i, label: label }; });
    var correct = null;
    choices.forEach(function (c) { if (c.label === String(answer)) correct = c; });
    var q = {
      id: uid(),
      input: "choice",
      allowType: !!spec.allowType,
      answerKind: "number",
      typedAnswer: String(answer),
      choices: choices,
      correctChoiceId: correct.id,
      tokens: [],
      sound: null
    };
    Object.keys(spec).forEach(function (k) { q[k] = spec[k]; });
    q.choices = choices;
    q.correctChoiceId = correct.id;
    q.typedAnswer = String(answer);
    q.answerKind = "number";
    return q;
  }

  var NAMES = ["Sam", "Jo", "Ana", "Max", "Luz", "Ned"];

  function mixObjects(opts, canPicture) {
    if (!canPicture) return false;
    var last = opts.block && opts.block.length ? opts.block[opts.block.length - 1] : null;
    var lastLook = last && last.look ? String(last.look) : "";
    if (lastLook.indexOf("thing|") === 0) return false;
    if (last && !lastLook) return true;
    return opts.rng() < 0.5;
  }

  function wantPictures(opts, canPicture) {
    if (opts.style === "numbers") return false;
    if (opts.style === "objects") return true;
    if (opts.style === "mix") return mixObjects(opts, true);
    return mixObjects(opts, canPicture);
  }

  function arithmetic(opts, cfg) {
    var rng = opts.rng;
    var step = opts.step;
    var max = cfg.max[step - 1];
    var op = cfg.ops.length === 1 ? cfg.ops[0] : pick(rng, cfg.ops);
    var a, b, ans;
    if (op === "+") {
      a = 1 + Math.floor(rng() * Math.max(1, max - 1));
      b = 1 + Math.floor(rng() * Math.max(1, max - a));
      if (a + b > max) b = Math.max(1, max - a);
      ans = a + b;
    } else if (op === "-") {
      a = Math.min(max, 2 + Math.floor(rng() * Math.max(1, max - 1)));
      b = 1 + Math.floor(rng() * a);
      ans = a - b;
    } else {
      a = cfg.left ? cfg.left[step - 1] : (1 + Math.floor(rng() * 9));
      var hi = step <= 2 ? 5 : 9;
      b = 1 + Math.floor(rng() * hi);
      ans = a * b;
      op = "×";
    }
    var pictures = wantPictures(opts, step <= (cfg.picturesUntil || 0) && !opts.support && op !== "×");
    var groups = op === "×" && step <= 2 && pictures;
    var word = !opts.style && !pictures && step >= 4 && rng() < 0.45 && op !== "×";
    var prompt, board;
    var shown = null;
    var surface = "num";
    if (word) {
      var name = pick(rng, NAMES);
      var thing = pick(rng, ["crayons", "apples", "blocks", "stickers", "cards", "shells", "buttons", "marbles", "pennies", "leaves"]);
      var tales = op === "+" ? [
        name + " has " + a + " " + thing + " and gets " + b + " more. How many " + thing + " now?",
        name + " finds " + a + " " + thing + " and then finds " + b + " more. How many " + thing + " in all?",
        "There are " + a + " " + thing + " in the box and " + b + " on the table. How many " + thing + " altogether?",
        name + " sets out " + a + " " + thing + ". A friend adds " + b + " more. How many " + thing + " are there?"
      ] : [
        name + " has " + a + " " + thing + " and gives away " + b + ". How many are left?",
        name + " had " + a + " " + thing + " and lost " + b + ". How many " + thing + " are left?",
        "A box holds " + a + " " + thing + ". " + name + " takes " + b + " out. How many stay in the box?",
        name + " counts " + a + " " + thing + " and then uses " + b + ". How many are left?"
      ];
      var tale = Math.floor(rng() * tales.length);
      prompt = tales[tale];
      board = { kind: "story", thing: thing };
      pictures = false;
      surface = "tale" + tale + "-" + thing;
    } else if (groups) {
      shown = countThing(rng);
      prompt = "How many " + shown.many + " in all?";
      board = { kind: "groups", groups: a, each: b, thing: shown.id };
      surface = shown.id;
    } else if (pictures) {
      shown = countThing(rng);
      prompt = op === "+" ? ("How many " + shown.many + " in all?") : ("Take away. How many " + shown.many + " are left?");
      board = { kind: "sumdots", a: a, b: b, op: op, thing: shown.id };
      surface = shown.id;
    } else {
      prompt = a + " " + op + " " + b + " = ?";
      board = { kind: "equation", a: a, op: op, b: b };
    }
    return numberQuestion({
      prompt: prompt,
      speakPrompt: prompt,
      board: board,
      allowType: step >= 4,
      explain: { say: a + " " + op + " " + b + " is " + ans + ".", scene: "sum", a: a, b: b, op: op, answer: ans },
      stem: op + "|" + a + "|" + b + "|" + surface
    }, ans, opts.support, rng, step >= 4 ? 8 : 3);
  }

  // v20 Shapes (Beginner math): sides and corners from 3 to 10, plus the circle (0) as a fun one.
  // Steps: 1 count sides/corners of 3-4 sided shapes with numbered corner dots; 2 up to 6 sides with plain dots;
  // 3 up to 8, no dots; 4 up to 10 and "Which shape has N sides?"; 5 name the shape and sides = corners facts.
  var SHAPE_LIST = [
    { id: "circle", name: "circle", n: 0, fact: "A circle is round, with no sides and no corners. A wheel is a circle!" },
    { id: "triangle", name: "triangle", n: 3, fact: "A triangle has 3 sides and 3 corners. A slice of pizza looks like a triangle!" },
    { id: "square", name: "square", n: 4, fact: "A square has 4 sides and 4 corners, and all its sides are the same length." },
    { id: "rectangle", name: "rectangle", n: 4, fact: "A rectangle has 4 sides and 4 corners. A door is a rectangle!" },
    { id: "rhombus", name: "rhombus", n: 4, fact: "A rhombus has 4 sides and 4 corners. People often call it a diamond!" },
    { id: "pentagon", name: "pentagon", n: 5, fact: "A pentagon has 5 sides and 5 corners. A house drawn with a pointy roof is a pentagon!" },
    { id: "hexagon", name: "hexagon", n: 6, fact: "A hexagon has 6 sides and 6 corners. Bees build their honeycomb out of hexagons!" },
    { id: "heptagon", name: "heptagon", n: 7, fact: "A heptagon has 7 sides and 7 corners. Some coins are heptagons!" },
    { id: "octagon", name: "octagon", n: 8, fact: "An octagon has 8 sides and 8 corners. A stop sign is an octagon!" },
    { id: "nonagon", name: "nonagon", n: 9, fact: "A nonagon has 9 sides and 9 corners." },
    { id: "decagon", name: "decagon", n: 10, fact: "A decagon has 10 sides and 10 corners. That is a lot of corners!" }
  ];
  M.SHAPE_LIST = SHAPE_LIST;
  function shapeById(id) { return SHAPE_LIST.filter(function (s) { return s.id === id; })[0]; }
  function aName(name) { return (/^[aeiou]/.test(name) ? "an " : "a ") + name; }
  var SHAPE_MAX = { 1: 4, 2: 6, 3: 8, 4: 10, 5: 10 };
  // Number choices near the right count (0 to 10), never repeated.
  function nearCounts(rng, n, lo) {
    var out = [];
    [1, -1, 2, -2, 3, -3, 4].forEach(function (d) { var v = n + d; if (v >= lo && v <= 10 && out.indexOf(v) < 0) out.push(v); });
    return out.slice(0, 4);
  }
  M.shapeNearCounts = nearCounts;
  // Shape names with side counts close to this one, so the choices are not giveaways.
  function nearNames(shape) {
    return SHAPE_LIST.filter(function (s) { return s.id !== shape.id && s.n !== shape.n; })
      .sort(function (a, b) { return Math.abs(a.n - shape.n) - Math.abs(b.n - shape.n); })
      .slice(0, 3).map(function (s) { return s.name; });
  }
  M.shapeNearNames = nearNames;

  function makeShapes(opts) {
    var rng = opts.rng;
    var step = Math.max(1, Math.min(5, opts.step || 1));
    var max = SHAPE_MAX[step];
    var pool = SHAPE_LIST.filter(function (s) { return s.n >= 3 && s.n <= max; });
    var kind;
    var r = rng();
    if (step <= 3) kind = r < 0.12 ? "circle" : r < 0.56 ? "sides" : "corners";
    else if (step === 4) kind = r < 0.35 ? "sides" : r < 0.65 ? "corners" : "which";
    else kind = r < 0.4 ? "name" : r < 0.65 ? "which" : r < 0.85 ? "fact" : "corners";
    if (opts.shapeKind) kind = opts.shapeKind;
    var shape = opts.shapeId ? shapeById(opts.shapeId) : kind === "circle" ? shapeById("circle") : pick(rng, pool);
    if (kind === "circle") kind = rng() < 0.5 ? "sides" : "corners";
    if (shape.n === 0 && (kind === "which" || kind === "fact")) kind = "corners";
    // Corner markers help count: numbered at step 1, plain dots at step 2 or with support.
    var marks = step === 1 ? "num" : step === 2 || opts.support ? "dot" : "";
    var q;
    if (kind === "sides" || kind === "corners") {
      var word = kind;
      var prompt = "How many " + word + " does this shape have?";
      q = choiceQuestion({
        prompt: prompt,
        speakPrompt: prompt,
        board: { kind: "shape", shape: shape.id, marks: shape.n ? marks : "" },
        stem: "shape|" + word + "|" + shape.id
      }, String(shape.n), nearCounts(rng, shape.n, 0).map(String), opts.support, rng);
      q.answerKind = "number";
    } else if (kind === "which") {
      var pw = rng() < 0.5 ? "sides" : "corners";
      var promptW = "Which shape has " + shape.n + " " + pw + "?";
      var wrongW = nearNames(shape).filter(function (nm) { return shapeById(nm).n !== shape.n; });
      var right = shape.id === "rhombus" || shape.id === "rectangle" ? "square" : shape.name;
      if (shape.n === 4) wrongW = nearNames(shapeById("square")).filter(function (nm) { return shapeById(nm).n !== 4; });
      shape = shapeById(right);
      q = choiceQuestion({
        prompt: promptW,
        speakPrompt: promptW,
        board: { kind: "sidecount", n: shape.n, word: pw },
        stem: "shape|which|" + pw + "|" + shape.n
      }, shape.name, wrongW, opts.support, rng);
    } else if (kind === "name") {
      var named = pool.filter(function (s) { return s.n >= 5; });
      if (!opts.shapeId) shape = pick(rng, named.length ? named : pool);
      q = choiceQuestion({
        prompt: "What is this shape called?",
        speakPrompt: "What is this shape called?",
        board: { kind: "shape", shape: shape.id, marks: opts.support ? "dot" : "" },
        stem: "shape|name|" + shape.id
      }, shape.name, nearNames(shape), opts.support, rng);
    } else {
      var promptF = "A shape has " + shape.n + " sides. How many corners does it have?";
      q = choiceQuestion({
        prompt: promptF,
        speakPrompt: promptF,
        board: { kind: "sidecount", n: shape.n, word: "sides" },
        stem: "shape|fact|" + shape.n
      }, String(shape.n), nearCounts(rng, shape.n, 3).map(String), opts.support, rng);
      q.answerKind = "number";
    }
    q.shapeId = shape.id;
    q.shapeKind = kind;
    q.readChoices = true;
    q.didYouKnow = shape.fact;
    q.explain = { say: shape.fact, scene: "shape", shape: shape.id };
    return q;
  }

  var COUNT_THINGS = [
    { id: "apple", one: "apple", many: "apples" },
    { id: "star", one: "star", many: "stars" },
    { id: "heart", one: "heart", many: "hearts" },
    { id: "ball", one: "ball", many: "balls" },
    { id: "block", one: "block", many: "blocks" },
    { id: "flower", one: "flower", many: "flowers" },
    { id: "moon", one: "moon", many: "moons" },
    { id: "fish", one: "fish", many: "fish" },
    { id: "leaf", one: "leaf", many: "leaves" },
    { id: "cup", one: "cup", many: "cups" },
    { id: "circle", one: "circle", many: "circles" },
    { id: "square", one: "square", many: "squares" },
    { id: "triangle", one: "triangle", many: "triangles" },
    { id: "diamond", one: "diamond", many: "diamonds" }
  ];

  function countThing(rng) {
    return pick(rng, COUNT_THINGS);
  }

  function countSay(n, thing) {
    if (n === 1) return "There is 1 " + thing.one + ".";
    return "There are " + n + " " + thing.many + ".";
  }

  function makeCount(opts) {
    var maxes = [5, 8, 12, 16, 20];
    var max = maxes[opts.step - 1];
    var min = opts.step === 1 ? 1 : Math.min(3, max);
    var n = min + Math.floor(opts.rng() * (max - min + 1));
    var thing = countThing(opts.rng);
    return numberQuestion({
      prompt: "How many " + thing.many + "?",
      speakPrompt: "How many " + thing.many + "?",
      board: { kind: "dots", n: n, thing: thing.id },
      allowType: opts.step >= 4,
      explain: { say: countSay(n, thing), scene: "dots", n: n },
      stem: "count|" + thing.id + "|" + n
    }, n, opts.support, opts.rng, opts.step >= 4 ? 5 : 2);
  }

  function makePlace(opts) {
    var rng = opts.rng;
    var n = 10 + Math.floor(rng() * 90);
    var tens = Math.floor(n / 10);
    var ones = n % 10;
    var askTens = rng() < 0.6 || ones === 0;
    var answer = askTens ? tens : ones;
    var prompt = askTens ? ("How many tens are in " + n + "?") : ("How many ones are in " + n + "?");
    var say = askTens
      ? (n + " has " + tens + " tens. That is " + (tens * 10) + ".")
      : (n + " has " + ones + " ones.");
    return numberQuestion({
      prompt: prompt,
      speakPrompt: prompt,
      board: { kind: "place", n: n, tens: tens, ones: ones },
      allowType: opts.step >= 4,
      explain: { say: say, scene: "place", n: n }
    }, answer, opts.support, rng, 3);
  }

  function makeSkip(opts) {
    var bys = [2, 2, 5, 10, 5];
    var by = bys[opts.step - 1];
    var start = by * (1 + Math.floor(opts.rng() * (opts.step >= 4 ? 6 : 3)));
    var seq = [start, start + by, start + by * 2];
    var ans = start + by * 3;
    return numberQuestion({
      prompt: "What comes next? " + seq.join(", ") + ", ___",
      speakPrompt: "What comes next? " + seq.join(", "),
      board: { kind: "words" },
      allowType: opts.step >= 4,
      explain: { say: "Count by " + by + ". Next is " + ans + ".", scene: "skip", by: by, answer: ans }
    }, ans, opts.support, opts.rng, by);
  }

  function bandOf(opts) {
    return opts.band || "7-8";
  }

  function factorPair(rng, step, band) {
    var divHi = { "5-6": [3, 4, 5, 5, 5], "7-8": [5, 6, 9, 10, 12], "9-10": [10, 12, 12, 12, 12] };
    var quotHi = { "5-6": [3, 4, 5, 5, 6], "7-8": [5, 8, 9, 10, 10], "9-10": [10, 12, 12, 12, 12] };
    var caps = { "5-6": 20, "7-8": 100, "9-10": 144 };
    var dTop = (divHi[band] || divHi["7-8"])[step - 1];
    var qTop = (quotHi[band] || quotHi["7-8"])[step - 1];
    var divisor = 2 + Math.floor(rng() * Math.max(1, dTop - 1));
    var quotient = 1 + Math.floor(rng() * qTop);
    var cap = caps[band] || 100;
    if (divisor * quotient > cap) quotient = Math.max(1, Math.floor(cap / divisor));
    return { divisor: divisor, quotient: quotient, total: divisor * quotient };
  }

  function makeAdd(opts) {
    var maxes = {
      "5-6": [5, 8, 10, 12, 20],
      "7-8": [12, 20, 50, 100, 100],
      "9-10": [30, 50, 100, 100, 200]
    };
    var pics = { "5-6": 2, "7-8": 1, "9-10": 0 };
    var band = bandOf(opts);
    return arithmetic(opts, { max: maxes[band] || maxes["7-8"], ops: ["+"], picturesUntil: pics[band] || 0 });
  }

  function makeSub(opts) {
    var maxes = {
      "5-6": [5, 8, 10, 12, 20],
      "7-8": [12, 20, 50, 100, 100],
      "9-10": [30, 50, 100, 100, 200]
    };
    var pics = { "5-6": 2, "7-8": 1, "9-10": 0 };
    var band = bandOf(opts);
    return arithmetic(opts, { max: maxes[band] || maxes["7-8"], ops: ["-"], picturesUntil: pics[band] || 0 });
  }

  function makeMul(opts) {
    var rng = opts.rng;
    var step = opts.step;
    var band = bandOf(opts);
    var pair = factorPair(rng, step, band);
    var a = pair.divisor;
    var b = pair.quotient;
    var ans = pair.total;
    var pictures = wantPictures(opts, (band === "5-6" && step <= 2) || (band === "7-8" && step === 1));
    var shown = pictures ? countThing(rng) : null;
    var word = !opts.style && !pictures && step >= 4 && rng() < 0.45;
    var prompt;
    var speak;
    var board;
    if (pictures) {
      prompt = "How many " + shown.many + " in all?";
      speak = "How many is " + a + " groups of " + b + "?";
      board = { kind: "groups", groups: a, each: b, thing: shown.id };
    } else if (word) {
      var name = pick(rng, NAMES);
      var thing = pick(rng, ["apples", "blocks", "stickers", "cards", "crayons", "shells", "buttons", "marbles"]);
      var groupsTales = [
        name + " has " + a + " groups of " + b + " " + thing + ". How many " + thing + " in all?",
        name + " makes " + a + " piles with " + b + " " + thing + " in each pile. How many " + thing + " is that?",
        "There are " + a + " bags. Each bag has " + b + " " + thing + ". How many " + thing + " altogether?"
      ];
      prompt = groupsTales[Math.floor(rng() * groupsTales.length)];
      speak = prompt;
      board = { kind: "story", thing: thing };
    } else {
      prompt = a + " × " + b + " = ?";
      speak = a + " times " + b;
      board = { kind: "equation", a: a, op: "×", b: b };
    }
    return numberQuestion({
      prompt: prompt,
      speakPrompt: speak,
      board: board,
      allowType: step >= 4,
      explain: { say: a + " groups of " + b + " is " + ans + ".", scene: "groups", groups: a, each: b, answer: ans },
      stem: "x|" + a + "|" + b + "|" + (shown ? shown.id : word ? thing : "num")
    }, ans, opts.support, rng, step >= 4 ? 12 : 4);
  }

  function makeDiv(opts) {
    var rng = opts.rng;
    var step = opts.step;
    var band = bandOf(opts);
    var pair = factorPair(rng, step, band);
    var divisor = pair.divisor;
    var ans = pair.quotient;
    var total = pair.total;
    var pictures = wantPictures(opts, (band === "5-6" && step <= 2) || (band === "7-8" && step === 1));
    var shown = pictures ? countThing(rng) : null;
    var word = !opts.style && !pictures && step >= 4 && rng() < 0.45;
    var prompt;
    var speak;
    var board;
    if (pictures) {
      prompt = "Share " + total + " " + shown.many + " into " + divisor + " equal groups. How many in each group?";
      speak = prompt;
      board = { kind: "dots", n: total, thing: shown.id };
    } else if (word) {
      var name = pick(rng, NAMES);
      var thing = pick(rng, ["apples", "blocks", "stickers", "cards", "crayons", "shells", "buttons", "marbles"]);
      var shareTales = [
        name + " has " + total + " " + thing + " to share equally into " + divisor + " groups. How many in each group?",
        name + " splits " + total + " " + thing + " into " + divisor + " equal piles. How many " + thing + " go in each pile?",
        total + " " + thing + " are shared fairly among " + divisor + " friends. How many does each friend get?"
      ];
      prompt = shareTales[Math.floor(rng() * shareTales.length)];
      speak = prompt;
      board = { kind: "story", thing: thing };
    } else {
      prompt = total + " ÷ " + divisor + " = ?";
      speak = total + " divided by " + divisor;
      board = { kind: "equation", a: total, op: "÷", b: divisor };
    }
    return numberQuestion({
      prompt: prompt,
      speakPrompt: speak,
      board: board,
      allowType: step >= 4,
      explain: { say: total + " shared into " + divisor + " groups is " + ans + " each.", scene: "groups", groups: divisor, each: ans, answer: ans },
      stem: "÷|" + total + "|" + divisor + "|" + (shown ? shown.id : word ? thing : "num")
    }, ans, opts.support, rng, step >= 4 ? 6 : 3);
  }

  function makeTimes(opts) {
    var rng = opts.rng;
    var step = opts.step;
    var lefts = [2, 2, 3, 4, 7];
    var a = step >= 4 && rng() < 0.5 ? (2 + Math.floor(rng() * 8)) : lefts[step - 1];
    var b = 1 + Math.floor(rng() * (step <= 2 ? 5 : 9));
    var ans = a * b;
    var pictures = step <= 2;
    var shown = pictures ? countThing(rng) : null;
    return numberQuestion({
      prompt: pictures ? ("How many " + shown.many + " in all?") : (a + " × " + b + " = ?"),
      speakPrompt: pictures ? ("How many is " + a + " groups of " + b + "?") : (a + " times " + b),
      board: pictures ? { kind: "groups", groups: a, each: b, thing: shown.id } : { kind: "words" },
      allowType: step >= 4,
      explain: { say: a + " groups of " + b + " is " + ans + ".", scene: "groups", groups: a, each: b, answer: ans },
      stem: "x|" + a + "|" + b
    }, ans, opts.support, rng, step >= 4 ? 12 : 4);
  }

  function makeBig(opts) {
    var rng = opts.rng;
    var step = opts.step;
    var a, b, op, ans;
    if (step <= 2) {
      op = "+";
      a = (1 + Math.floor(rng() * 7)) * 10;
      b = (1 + Math.floor(rng() * 4)) * 10;
      if (step === 2) { a = 20 + Math.floor(rng() * 40); b = 1 + Math.floor(rng() * 8); }
      ans = a + b;
    } else if (step === 3) {
      op = rng() < 0.5 ? "+" : "-";
      if (op === "+") { a = 21 + Math.floor(rng() * 40); b = 11 + Math.floor(rng() * 20); ans = a + b; }
      else { a = 40 + Math.floor(rng() * 50); b = 10 + Math.floor(rng() * 20); if (b > a) b = 10; ans = a - b; }
    } else {
      op = rng() < 0.55 ? "+" : "-";
      if (op === "+") { a = 18 + Math.floor(rng() * 60); b = 14 + Math.floor(rng() * 40); ans = a + b; }
      else { a = 40 + Math.floor(rng() * 55); b = 12 + Math.floor(rng() * 30); if (b > a) b = a; ans = a - b; }
    }
    var name = pick(rng, NAMES);
    var prompt = step >= 4 && rng() < 0.4
      ? (op === "+"
        ? name + " read " + a + " pages and then " + b + " more. How many pages?"
        : name + " had " + a + " cards and gave away " + b + ". How many are left?")
      : (a + " " + op + " " + b + " = ?");
    return numberQuestion({
      prompt: prompt,
      speakPrompt: prompt,
      board: { kind: "words" },
      allowType: step >= 4,
      explain: { say: a + " " + op + " " + b + " is " + ans + ".", scene: "sum", a: a, b: b, op: op, answer: ans }
    }, ans, opts.support, rng, 10);
  }

  function makeWithin100(opts) {
    return makeBig(opts);
  }

  function fractionWords(frac) {
    var names = {
      "1/2": "one half",
      "1/3": "one third",
      "1/4": "one fourth",
      "1/8": "one eighth",
      "2/3": "two thirds",
      "2/4": "two fourths",
      "3/4": "three fourths"
    };
    return names[frac] || frac;
  }

  function makeFractions(opts) {
    var rng = opts.rng;
    var step = opts.step;
    if (step <= 2) {
      var early = step === 1 ? ["1/2", "1/4"] : ["1/2", "1/4", "1/3", "3/4"];
      var shaded = pick(rng, early);
      var qEarly = choiceQuestion({
        prompt: "Which fraction is shaded?",
        speakPrompt: "Which fraction is shaded?",
        board: { kind: "pie", fraction: shaded },
        explain: { say: fractionWords(shaded) + " of the circle is shaded. That is " + shaded + ".", scene: "pie", fraction: shaded },
        stem: "shade|" + shaded
      }, shaded, ["1/2", "1/4", "1/3", "3/4", "2/2"].filter(function (x) { return x !== shaded; }), opts.support, rng);
      return qEarly;
    }
    if (step === 3) {
      var pairs = [
        ["1/2", "1/4", "1/2"],
        ["1/2", "1/3", "1/2"],
        ["1/2", "1/8", "1/2"],
        ["1/3", "1/4", "1/3"],
        ["1/3", "1/8", "1/3"],
        ["3/4", "1/4", "3/4"],
        ["3/4", "1/2", "3/4"],
        ["3/4", "1/3", "3/4"],
        ["3/4", "1/8", "3/4"],
        ["2/4", "1/4", "2/4"],
        ["2/3", "1/3", "2/3"],
        ["2/3", "1/4", "2/3"],
        ["2/3", "1/8", "2/3"]
      ];
      var pair = pick(rng, pairs);
      var bigger = pair[2];
      var smaller = bigger === pair[0] ? pair[1] : pair[0];
      var askBigger = rng() < 0.5;
      var answer = askBigger ? bigger : smaller;
      var qCmp = choiceQuestion({
        prompt: askBigger ? "Which is bigger?" : "Which is smaller?",
        speakPrompt: (askBigger ? "Which is bigger, " : "Which is smaller, ") + fractionWords(pair[0]) + " or " + fractionWords(pair[1]) + "?",
        board: { kind: "pies", left: pair[0], right: pair[1] },
        explain: { say: askBigger ? (bigger + " is bigger than " + smaller + ".") : (smaller + " is smaller than " + bigger + "."), scene: "pie", fraction: answer },
        stem: (askBigger ? "bigger|" : "smaller|") + pair[0] + "|" + pair[1]
      }, answer, [bigger, smaller, "1/8", "2/2", "1/3"].filter(function (x) { return x !== answer; }), opts.support, rng);
      return qCmp;
    }
    var set = ["1/2", "1/4", "2/4", "3/4", "1/3", "2/3", "1/8"];
    var frac = pick(rng, set);
    var say = frac === "2/4"
      ? "Two of four equal parts are shaded. 2/4 is the same amount as 1/2."
      : (fractionWords(frac) + " of the circle is shaded. That is " + frac + ".");
    var q = choiceQuestion({
      prompt: "What fraction is shaded?",
      speakPrompt: "What fraction is shaded?",
      board: { kind: "pie", fraction: frac },
      allowType: true,
      explain: { say: say, scene: "pie", fraction: frac },
      stem: "type|" + frac
    }, frac, ["1/2", "1/3", "1/4", "2/4", "3/4", "2/2", "2/3"].filter(function (x) { return x !== frac; }), opts.support, rng);
    q.allowType = true;
    q.typedAnswer = frac;
    q.answerKind = "word";
    return q;
  }

  function makeArea(opts) {
    var rng = opts.rng;
    var step = opts.step;
    var w = step <= 2 ? (2 + Math.floor(rng() * 2)) : (2 + Math.floor(rng() * 4));
    var h = step <= 2 ? (1 + Math.floor(rng() * 2)) : (2 + Math.floor(rng() * 3));
    var area = w * h;
    var prompt = step >= 5 && rng() < 0.45
      ? ("How many steps around a rectangle that is " + w + " across and " + h + " down?")
      : ("A rectangle is " + w + " squares across and " + h + " down. How many squares inside?");
    var ans = prompt.indexOf("around") >= 0 ? (2 * (w + h)) : area;
    var say = prompt.indexOf("around") >= 0
      ? ("Around the outside is " + ans + " steps.")
      : ("There are " + area + " squares inside.");
    return numberQuestion({
      prompt: prompt,
      speakPrompt: prompt,
      board: { kind: "rect", w: w, h: h },
      allowType: step >= 4,
      explain: { say: say, scene: "rect", w: w, h: h, answer: ans }
    }, ans, opts.support, rng, 4);
  }

  var FIRST_WORDS = "at it up go we me am an cat dog sun mom dad big red run sat hat hop fun yes no so he she my by do if on in us ox ax be nook pot pan pin peg pet pig pen map mop mud men met mad mat nap net nut not nod lap leg log lot lip lit kit kid keg cut cup cub cap can cab bat bag bug bun bus but bud dip dig den did dot dug fog fan fat fed fig fin fit gab gas got gum gut hen hid him his hit hog hot hug hum hut jab jam jet jog jot jug lap led let lid lit lug mad man mat mid mix mud nag nip nod nun nut pad pal pat peg pen pet pin pit pod pop pot pug pun pup rag ram ran rap rat red rib rid rig rim rip rob rod rot rub rug run rut sad sag sap sat set sip sit sob sod sub sun tab tag tan tap ten tin tip top tot tub tug van vat vet wig win wit yes yet yum zip".split(" ");
  var SIMPLE_WORDS = "map pig hat bed cup pin mop leg bus fan net log sit bag pot hen dog cat sun run hop jam web fox box six wax mix fix van cab dab gab lab tab cod nod pod rod sod cub tub rub hub bud dud mud lad pad sad tad bid did hid lid rid kid dig fig pig wig big rig bin din fin pin tin win bit fit hit kit lit pit sit bib fib rib cob job mob rob sob bog dog fog hog log cop hop mop pop top cot dot got hot jot lot not pot tot bun fun gun nun pun run sun dip hip lip rip sip tip zip".split(" ");
  var CVC_WORDS = "cat sun map pig dog hat bed cup pin mop leg bus fan net log sit run bag jam web fox box six van cab bat rat mat pat sat fat hat vat bat cot dot got hot jot lot not pot rot bug dug hug jug mug pug rug tug bud mud cud cub tub rub hub cap gap lap nap rap sap tap zap can fan man pan ran tan van den hen men pen ten bin din fin kin pin tin win bit fit hit kit lit pit sit bib rib cob job mob rob sob bog dog fog hog log cop hop mop pop top bun fun gun nun pun run sun dip hip lip rip sip tip zip".split(" ");
  var SIGHT = "the and is you to it we in my go see can like play look for said was are she he they them this that with have from were what when where who why your all her his out now new not one two too into just them then than back been call came each find first give good help here home keep know last left live long made make many more much must name need next only open over put read same saw say some take tell than them time very want well went will wish work your about after again always around because before could every friend little people their would".split(" ");
  var DIGRAPHS = "ship chat thin duck fish chop moth when shin much pack bath wish chip that rush sock path whip shop shed shell shock shin shut chin chop chum such rich which then them this thin thud thumb thank think three throw truck trash track trick truck check chick chess chest chill chuck clock click clack black block brick bring brush crash fresh grass green grab glad glass plant plane plate play plum plus shed shelf shell shift ship shop shot shut smash smell snack snap snow snug spend spill spin spot stop stuck stuff swim swing that then them thin think those thumb thump whale wheat wheel when which whip whisk white why back pack sack tack deck kick lock rock sock duck luck pick trick track crack black clock block brick brush crash fresh grass green".split(" ");
  var SILENT = "cake bike home cute rope kite note tape bone mine lake time hope cube game ride make take name same came late gate date hate rate wave save gave made fade made hide ride side tide wide life wife line fine pine nine dine time home hope note rope mole hole pole stole stone bone cone tone cube tube tune use fuse mute these those made fade wade made bake cake lake rake take wake fake make sake tape cape grape shape shade trade brave grave flame frame plane plate skate state place space trace brace chase chase mice nice rice price slice spice twice drive five hive live dive size prize froze chose those close stone phone wrote globe robe code rode node poke woke joke broke spoke smoke".split(" ");
  var SIGHT2 = "because around before could every friend little people their where would again about always once another another through thought enough while which these those other after under never along being does done draw drink eight find first found going great green grow happy house jump keep kind know laugh light might night other paper place please pretty right round shall should small start thank think today together under until upon water where which white write yellow another before around because friend little people their would could should".split(" ");
  var MULTI = "sunlight backpack cupcake raincoat sandbox bedroom starfish pancake popcorn bathtub doorbell football rainbow snowman bookshelf blueberry sunflower moonlight bedroom doorbell popcorn snowball raincoat cupcake sandbox backpack starfish pancake bathtub football rainbow bookshelf blueberry doorbell popcorn bedroom sandbox raincoat sunlight moonlight cupcake starfish pancake popcorn bathtub football rainbow snowman bookshelf blueberry sunflower doorbell backpack sandbox bedroom raincoat pancake starfish popcorn bathtub football rainbow snowball bookshelf blueberry sunlight moonlight cupcake sandbox backpack bedroom starfish pancake popcorn bathtub doorbell football rainbow snowman bookshelf blueberry sunflower moonlight raincoat sandbox".split(" ");
  var PREFIX_WORDS = "unhappy unfair unsafe unkind unlock unlike unpack unsure retell reread replay remake redo reopen refill rewrite unable unafraid unclear unclip uncover uneven unhook unhurt unkind unlike unload unlock unpack unreal unsafe unsnap untie untidy unwell unwrap unlucky unplug unmade unread unwise rewrite redo remake refill reheat rejoin relock remake reopen repack replay reread rerun retell retie reuse revisit rewind rework rewash recheck recolor recopy reheat relight rename reorder replan retest retell rewrite undo unlike unsafe unlock unpack unsure rewrite reread replay remake reopen refill retell unable unafraid uneven unhook unplug unwrap unlucky".split(" ");

  function lineBank() {
    var people = ["I", "We", "Mom", "Dad"];
    var pals = ["The dog", "The cat", "The pig", "The hen"];
    var things = ["The bus", "The cup", "The hat", "The sun"];
    var can = ["can run", "can hop", "can sit", "can play", "can look", "can go", "can nap", "can hum"];
    var is = ["is big", "is red", "is fun", "is wet"];
    var lines = [];
    people.forEach(function (who) {
      can.forEach(function (did) { lines.push(who + " " + did); });
    });
    pals.forEach(function (who) {
      can.concat(is).forEach(function (did) { lines.push(who + " " + did); });
    });
    things.forEach(function (who) {
      is.forEach(function (did) { lines.push(who + " " + did); });
    });
    return lines;
  }

  function sentenceBank() {
    var who = ["The cat", "The dog", "My friend", "A rabbit", "The children", "She", "He", "We", "The bird", "A frog"];
    var did = [
      "sat on the mat",
      "played in the sun",
      "looked at the rainbow",
      "hid under the bush",
      "read a little book",
      "went to the park",
      "found a red cup",
      "fed the hen",
      "ran around the yard",
      "held a blue kite"
    ];
    var lines = [];
    who.forEach(function (name) {
      did.forEach(function (act) { lines.push(name + " " + act + "."); });
    });
    return lines;
  }

  function storyBank() {
    var who = ["The little dog", "My friend", "The children", "A rabbit", "She", "He", "The bird", "Our class"];
    var did = [
      "ran around the yard before lunch",
      "could see the rainbow after the rain",
      "was unhappy about the lost hat",
      "reread the story before bed",
      "looked for the starfish again",
      "left the backpack under the bed",
      "would not forget the warm coat",
      "sat around the quiet fire",
      "always packs a red cup",
      "played a game before dinner",
      "found a pancake on the blue plate",
      "watched the snowman in the yard"
    ];
    var lines = [];
    who.forEach(function (name) {
      did.forEach(function (act) { lines.push(name + " " + act + "."); });
    });
    return lines;
  }

  var SHORT_LINES = lineBank();
  var LONGER_LINES = sentenceBank();
  var STORY_LINES = storyBank();

  function uniqueList(list) {
    var seen = {};
    var out = [];
    list.forEach(function (word) {
      var key = String(word).toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push(word);
    });
    return out;
  }

  function flashCard(opts, list) {
    list = uniqueList(list);
    var step = Math.max(1, Math.min(5, opts.step || 1));
    var span = Math.max(40, Math.ceil(list.length * 0.7));
    if (span > list.length) span = list.length;
    var start = 0;
    if (list.length > span) start = Math.floor((list.length - span) * (step - 1) / 4);
    var pool = list.slice(start, start + span);
    if (pool.length < 12) pool = list.slice();
    var word = String(pick(opts.rng, pool));
    var line = word.indexOf(" ") >= 0;
    return {
      id: uid(),
      input: "flash",
      allowType: false,
      answerKind: "word",
      prompt: line ? "Read this." : "Read this word.",
      speakPrompt: "",
      board: { kind: "flash", word: word },
      choices: [],
      correctChoiceId: "",
      typedAnswer: word,
      tokens: [],
      sound: null,
      explain: { say: word, scene: "word", word: word.split(" ")[0] },
      stem: "flash|" + word.toLowerCase()
    };
  }


  // ---- Reading word-length ladder (tiers 1-5; see M.LADDER in engine.js) ----
  var TIER2 = ["red hat","big dog","hot sun","wet cat","wet pig","my cup","the bus","red bed","big pig","ten hens","sad cat","hot pot","six pens","fun bus","tan van","dog bed","cat nap","sun hat","mud pit","pig pen","red cup","big box","hop up","the fox","a web","my mom","his dad","her map","a bug","wet dog","red fan","big rug","fix it","see me","look up","go in","can run","we sit","I hop","bad cat","top hat","pet rat","tin can","sad hen","big net","red pen","cut log","hot mug","wet mop","ten pins","dig in","hug mom","a red bug","pig and hen","run and hop","get the cup"].filter(function (s) { return s.split(" ").length === 2; });
  var TIER3 = ["the cat sat","a big red bus","the dog can run","I see the sun","my hat is red","we hop and run","the pig is wet","hens in a pen","the bug can hop","mom and dad","I like my cat","the sun is hot","a fox in it","the cup is wet","we can play","look at me","the van is tan","I can see you","he ran to me","she has a hat","the dog is big","a cat on top","my bed is red","we sat down","put it on","the rat ran","get the red cup","the fox can run","dad can fix it","a pig in mud","I see a bug","the hen sat","you can go","we like to play","the bus is big","she can hop","a web on it","my mom can run","the kid has pens","is it hot","look at the dog","the cat is sad","he can dig","a box for you","I have a map","the jet is red"];
  var TIER4 = ["The cat sat on the mat.","The big dog ran to me.","I can see the hot sun.","My mom has a red hat.","We like to play in the sun.","The pig is in the mud.","She can hop on one leg.","The fox ran into a box.","Dad can fix the big van.","Look at the bug on the log.","The hen sat in her pen.","I put my cup on the bed.","He has a pet rat at home.","The kids went to the park.","We sat on the rug and read.","A frog can jump very far.","The bus is red and big.","My friend has a blue kite.","The bird sat in the tree.","I like to look at the moon.","The dog had a nap.","We can go to the shop now.","She found a red cup.","The little cat is very sad.","Mom said we can play now.","Look at the fish in the tank.","The man got on the big bus.","My cat likes to sit with me.","He ran fast to get the ball.","We will have fun at the park.","The duck can swim in the pond.","I see six eggs in it.","The sun came up over the hill.","A big wet dog shook on me.","Dad and I fed the hens.","The cup fell off the table.","Please help me find my hat.","The kids ran up the hill.","Can you see the red ship?","She put the jam on the bun.","The bug hid under a rock.","We had a big lunch today.","My dog likes to dig.","The cat and the dog are friends."];
  var TIER5 = ["The little dog ran around the yard before lunch.","We went to the park and played on the swings.","My friend and I read a funny book after school.","The cat sat on the mat. Then it went to sleep.","It was raining, so we stayed inside and made a fort.","The children could see a rainbow after the rain.","Dad made pancakes, and we ate them with jam.","The bird built a nest in the tall green tree.","She put on her coat because it was cold outside.","We planted seeds, and soon little plants came up.","The frog jumped into the pond with a big splash.","After dinner, we went for a walk with the dog.","The bus was late, so we waited by the gate.","I found a shell on the beach. It was pink.","The rabbit hid under the bush when the fox came.","Mom read us a story, and then we went to bed.","The duck and her babies swam across the pond.","Our class went to the farm to see the cows.","He lost his hat, but his sister found it later.","The sun was hot, so we sat under a big tree.","My cat likes to sleep on my bed at night.","We made a snowman and gave him a red hat.","The wind blew the kite high up into the sky.","Grandma came to visit, and she brought a cake.","The puppy was tired after playing all day long.","We put the toys away before we had our lunch.","The boat went slowly down the river. We waved.","I can ride my bike to the park with my dad.","The bee went from flower to flower in the garden.","At the zoo we saw a lion, a bear, and a seal.","The moon was bright, and the stars were out.","She painted a picture of her house and her dog.","The hen laid an egg. The farmer picked it up.","Tom shared his apple with his friend at school.","The baby laughed when the dog licked her hand.","We heard thunder, so we ran back into the house.","The fish swam around and around in the big tank.","Ben put on his boots and jumped in the puddles.","The leaves turned red and fell from the trees.","Every morning I brush my teeth and eat breakfast.","The train went over the bridge and into the town.","My brother built a tall tower with his blocks."];
  var LADDER_TIERS = { 2: TIER2, 3: TIER3, 4: TIER4, 5: TIER5 };
  M.LADDER_LISTS = { sounds: FIRST_WORDS, names: SIMPLE_WORDS, cvc: CVC_WORDS, sight: SIGHT, digraphs: DIGRAPHS, silente: SILENT, sight2: SIGHT2, multi: MULTI, prefix: PREFIX_WORDS };
  M.LADDER_TIERS = LADDER_TIERS;
  // Words a beginner may see on tiers 1-3 (lists above plus a few basics; plural -s allowed).
  var LADDER_EXTRA = "a i wet has get bad down".split(" ");
  var easySet = null;
  function ladderEasy() {
    if (easySet) return easySet;
    easySet = {};
    FIRST_WORDS.concat(SIMPLE_WORDS, CVC_WORDS, SIGHT, LADDER_EXTRA).forEach(function (w) { easySet[w.toLowerCase()] = true; });
    return easySet;
  }
  M.ladderEasyWord = function (w) {
    var e = ladderEasy();
    w = String(w).toLowerCase().replace(/[^a-z]/g, "");
    return !!(e[w] || (/s$/.test(w) && e[w.slice(0, -1)]));
  };
  // Swap classes for ladder wrong choices: a word is only swapped for another word of the same kind and form
  // (thing for thing, past verb for past verb ...), all lowercase common words. Names, function words,
  // words of two kinds at once (can, like, you, her, saw ...) and anything not listed here are never
  // swapped and never used.
  var SWAP_CLASSES = {
    thing: "hat cat bat mat rat dog log frog pig cup pup bus bed bug rug mug jug hen pen box fox sun bun van fan pan map cap mop top pot pit net jet web leg lid mud nut tin pin bin ship shop fish dish cake lake bike kite moon tree bee ball wall bell book hook boat goat coat road hill pond park farm yard gate rock sock duck truck bird nest egg bone home house mouse town train rain bear pear lion seal tank sky shell table school garden river bridge beach tower flower picture morning dinner lunch apple puppy baby rabbit friend brother sister farmer class day night snowman rainbow star seed plant swing ring king wing sand hand band tent cub hut bag jam ham fort story zoo sea",
    people: "mom dad man kid",
    things: "hats cats bats rats dogs logs frogs pigs cups bugs rugs hens pens pins boxes buns fans maps eggs cows kids friends babies boots blocks toys trees leaves stars seeds plants swings puddles pancakes teeth children birds books boats cakes bikes kites ducks socks rocks bells nests apples hills ponds",
    doto: "fix get see eat find help put cut mix make take hug visit ride",
    go: "run hop sit dig go jump swim sleep walk play nap sing hide win",
    didto: "found fed made gave got heard brought painted planted picked licked shared built lost laid hugged",
    went: "sat ran hid fell went came swam jumped waited waved stayed laughed turned sang hopped",
    does: "hops runs sits digs helps eats looks plays jumps reads swims sleeps walks rides packs",
    doing: "playing raining jumping running sitting reading singing",
    adj: "red big hot wet sad tan bad little tall blue green pink cold long funny tired bright fast warm soft",
    num: "one two six ten five four three",
    place: "in on at by under over into up off",
    weyou: "we they",
    heshe: "he she",
    whom: "me him us them",
    whose: "my his our your"
  };


  // Odd, unkind or rare words that are never used as wrong choices (or as ladder words to read).
  var LADDER_BLOCK = "gun nun dud fib gab jot bib cud lad tad din kin sod rut nag jab dab rig mob rob bog cob vat keg wit nip sag pun tot zap chum clack thud thump sob fat hog sap rap gut mutt".split(" ");
  var swapOf = null;
  function swapIndex() {
    if (swapOf) return swapOf;
    swapOf = {};
    Object.keys(SWAP_CLASSES).forEach(function (k) {
      SWAP_CLASSES[k].split(" ").forEach(function (w) { if (w && !swapOf[w]) swapOf[w] = k; });
    });
    return swapOf;
  }
  function blocked(w) { return LADDER_BLOCK.indexOf(String(w).toLowerCase()) >= 0; }
  M.ladderBlocked = blocked;
  // A word allowed in a wrong choice: a listed swap word (tiers 2-5) or a word of the skill's own list (tier 1).
  M.ladderAllowedWord = function (w, tier, own) {
    w = String(w).toLowerCase().replace(/[^a-z]/g, "");
    if (!w || blocked(w)) return false;
    if (tier === 1) return !!(own && own.map(function (x) { return String(x).toLowerCase(); }).indexOf(w) >= 0);
    return !!swapIndex()[w];
  };
  function lettersOff(a, b) {
    if (a.length !== b.length) return 99;
    var d = 0;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
    return d;
  }
  // Look-alike first: one letter off, then same first or last letter and about the same length, then the rest.
  function rankAlike(word, cands) {
    return cands.map(function (c) {
      var r = 4;
      if (lettersOff(word, c) === 1) r = 1;
      else if (Math.abs(c.length - word.length) <= 1 && (c[0] === word[0] || c[c.length - 1] === word[word.length - 1])) r = 2;
      else if (Math.abs(c.length - word.length) <= 1) r = 3;
      return { w: c, r: r };
    });
  }
  function caseLike(model, repl, first) {
    // Same casing as the word it replaces: capital only at the start of a sentence that has one.
    var up = model.charAt(0) !== model.charAt(0).toLowerCase();
    return up && first ? repl.charAt(0).toUpperCase() + repl.slice(1) : repl;
  }
  function pickBalanced(rng, answer, ranked, n) {
    // ranked: [{text, r, at}] best first. Take n, different positions first, then avoid the answer being
    // the only longest or only shortest choice when another candidate can fix that.
    ranked = shuffle(rng, ranked).sort(function (a, b) { return a.r - b.r; });
    var out = [];
    var used = {};
    ranked.forEach(function (c) { if (out.length < n && !used[c.at] && out.indexOf(c.text) < 0 && c.text !== answer) { used[c.at] = 1; out.push(c.text); } });
    ranked.forEach(function (c) { if (out.length < n && out.indexOf(c.text) < 0 && c.text !== answer) out.push(c.text); });
    function extreme(list) {
      var L = answer.length;
      return list.length && (list.every(function (x) { return x.length > L; }) || list.every(function (x) { return x.length < L; }));
    }
    if (extreme(out)) {
      var L = answer.length;
      var fix = ranked.filter(function (c) { return out.indexOf(c.text) < 0 && c.text !== answer && (out[0].length > L ? c.text.length <= L : c.text.length >= L); })[0];
      if (fix) out[out.length - 1] = fix.text;
    }
    return out;
  }
  // Wrong choices for a word / phrase / sentence: one word (sometimes two) swapped for a common word of the
  // same kind, same casing, same punctuation.
  M.ladderDistractors = function (text, tier, rng, n, own) {
    text = String(text);
    if (tier === 1 || text.indexOf(" ") < 0) {
      var w0 = text.toLowerCase();
      var pool = uniqueList((own || []).map(function (w) { return String(w).toLowerCase(); }))
        .filter(function (w) { return /^[a-z]+$/.test(w) && w !== w0 && !blocked(w) && Math.abs(w.length - w0.length) <= 1; });
      var ranked1 = rankAlike(w0, pool).map(function (c) { return { text: caseLike(text, c.w, true), r: c.r, at: 0 }; });
      return pickBalanced(rng, text, ranked1, n);
    }
    var idx = swapIndex();
    var toks = text.split(" ");
    var singles = [];
    var perPos = [];
    toks.forEach(function (tok, i) {
      var m = /^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/.exec(tok);
      if (!m) return;
      var word = m[2];
      var low = word.toLowerCase();
      if (word !== low && i > 0) return;          // a name or "I": never swapped
      var kind = idx[low];
      if (!kind || blocked(low)) return;
      var prev = i > 0 ? toks[i - 1].toLowerCase().replace(/[^a-z]/g, "") : "";
      var inText = text.toLowerCase().replace(/[^a-z ]/g, "").split(" ");
      var cands = SWAP_CLASSES[kind].split(" ").filter(function (c, k, all) {
        if (!c || c === low || all.indexOf(c) !== k || blocked(c) || inText.indexOf(c) >= 0) return false;
        if (tier <= 3 && !M.ladderEasyWord(c)) return false;
        if (prev === "an" && !/^[aeiou]/.test(c)) return false;   // "an egg", never "an jug"
        if (prev === "a" && /^[aeiou]/.test(c)) return false;
        return true;
      });
      var opts = rankAlike(low, cands).map(function (c) {
        var t = toks.slice();
        t[i] = m[1] + caseLike(word, c.w, i === 0) + m[3];
        return { text: t.join(" "), r: c.r, at: i, tok: t[i] };
      });
      perPos.push(opts);
      singles = singles.concat(opts);
    });
    var out = pickBalanced(rng, text, singles.filter(function (c) { return c.r <= 3; }), n);
    if (out.length < n) {
      // two words changed (best look-alikes at two different spots)
      var pairs = [];
      for (var a = 0; a < perPos.length; a++) {
        for (var b = a + 1; b < perPos.length; b++) {
          perPos[a].slice(0, 4).forEach(function (x) {
            perPos[b].slice(0, 4).forEach(function (y) {
              var t = toks.slice();
              t[x.at] = x.tok;
              t[y.at] = y.tok;
              pairs.push({ text: t.join(" "), r: x.r + y.r, at: 100 + a * 10 + b });
            });
          });
        }
      }
      pickBalanced(rng, text, singles.concat(pairs), n).forEach(function (x) { if (out.length < n && out.indexOf(x) < 0) out.push(x); });
    }
    return out.slice(0, n);
  };

  // Problems with one ladder question's choices (empty list = fine). Used by the tests.
  M.ladderCheckChoices = function (answer, labels, tier, own) {
    var bad = [];
    answer = String(answer);
    if (labels.filter(function (l) { return l === answer; }).length !== 1) bad.push("answer is not on exactly one choice");
    if (labels.filter(function (l, i) { return labels.indexOf(l) === i; }).length !== labels.length) bad.push("duplicate choices");
    var aw = answer.split(" ");
    function capPattern(t) { return t.split(" ").map(function (w) { var c = w.replace(/[^A-Za-z]/g, "").charAt(0); return c && c !== c.toLowerCase() ? "A" : "a"; }).join(""); }
    function punct(t) { return t.replace(/[A-Za-z]/g, ""); }
    labels.forEach(function (l) {
      if (l === answer) return;
      var lw = l.split(" ");
      if (lw.length !== aw.length) bad.push("word count differs: " + l);
      if (capPattern(l) !== capPattern(answer)) bad.push("casing differs: " + l);
      if (punct(l) !== punct(answer)) bad.push("punctuation differs: " + l);
      var changed = 0;
      lw.forEach(function (w, i) {
        if (w === aw[i]) return;
        changed++;
        var bare = w.replace(/[^A-Za-z]/g, "");
        if (!M.ladderAllowedWord(bare, tier, own)) bad.push("word not allowed: " + bare + " in " + l);
        if (i > 0 && bare !== bare.toLowerCase()) bad.push("capital inside: " + l);
      });
      if (!changed || changed > 2) bad.push("changes " + changed + " words: " + l);
    });
    return bad;
  };

  function ladderQuestion(opts, list) {
    var rng = opts.rng;
    var tier = Math.max(1, Math.min(5, opts.tier || 1));
    var text;
    if (opts.ladderText) {
      text = opts.ladderText;
    } else if (tier === 1) {
      var single = flashCard(opts, list);
      text = single.board.word;
      for (var tries = 0; blocked(text) && tries < 20; tries++) text = flashCard(opts, list).board.word;
    } else {
      text = String(pick(rng, LADDER_TIERS[tier]));
    }
    var sightItem = tier === 1 && opts.sightItem && !opts.ladderText ? opts.sightItem : null;
    if (sightItem) text = sightItem.answer;   // v15: a Dolch sight word on the one-word tier
    var wrong = sightItem ? sightItem.choices.filter(function (c) { return c !== sightItem.answer; })
      : M.ladderDistractors(text, tier, rng, 3, tier === 1 ? list : null);
    // Flash card (a grown-up marks it) some of the time, and always when sound is off;
    // otherwise listen-and-find: the app says it, the child taps it. Choices are never read aloud.
    // Beginner: always see it + hear it + tap it (no flash cards, also with sound off).
    var see = !!opts.seeWord && wrong.length >= 1;
    var useFlash = !see && (opts.soundOff || wrong.length < 2 || rng() < 0.35);
    if (!see && opts.ladderFormat === "flash") useFlash = true;
    else if (!see && opts.ladderFormat === "choice" && wrong.length) useFlash = !!opts.soundOff;
    var q;
    if (useFlash) {
      q = flashCard(opts, [text]);
      q.prompt = tier === 1 ? "Read this word." : "Read this.";
      q.stem = "ladder|" + text.toLowerCase();
    } else if (see) {
      q = choiceQuestion({
        // Shown prompt uses no word from the reading lists, so it never repeats the word to find.
        prompt: "Match:",
        speakPrompt: tier === 1 ? "Find this word." : "Find these words.",
        board: { kind: "seeword", word: text },
        sound: sightItem && sightItem.say ? { kind: "prompt", speak: text, carrier: sightItem.say } : { kind: "prompt", speak: text },
        readChoices: false,
        explain: { say: text, scene: "word", word: text.split(" ")[0].replace(/[^A-Za-z]/g, "") },
        stem: "ladder|" + text.toLowerCase()
      }, text, wrong, opts.support, rng);
    } else {
      q = choiceQuestion({
        // The shown prompt has no reading words in it, so it can never show the answer.
        prompt: "Listen!",
        speakPrompt: tier === 1 ? "Find the word." : "Find these words.",
        board: { kind: "listen" },
        sound: { kind: "prompt", speak: text },
        readChoices: false,
        explain: { say: text, scene: "word", word: text.split(" ")[0].replace(/[^A-Za-z]/g, "") },
        stem: "ladder|" + text.toLowerCase()
      }, text, wrong, opts.support, rng);
    }
    q.ladderTier = tier;
    if (sightItem) {
      q.sightWord = sightItem.answer;
      q.sightId = sightItem.id;
      q.credit = sightItem.credit;
      if (!see) {   // (sight words are always see-it-and-hear-it; flash only if the caller forces it)
        q.sightWord = "";
      }
    }
    return q;
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function otherLabels(rng, pool, answer, n) {
    var out = [];
    var guard = 0;
    while (out.length < n && guard++ < 40) {
      var label = pool[Math.floor(rng() * pool.length)];
      if (label !== answer && out.indexOf(label) < 0) out.push(label);
    }
    return out;
  }

  function sceneChoice(opts, prompt, scene, say, answer, wrong, stem) {
    return choiceQuestion({
      prompt: prompt,
      speakPrompt: prompt,
      board: { kind: "scene", scene: scene, focus: "" },
      explain: { say: say, scene: scene, focus: "" },
      stem: stem
    }, answer, wrong, opts.support, opts.rng);
  }

  function makeLiving(opts) {
    // v28: every form shows each answer choice (or pair) on its own labeled card (js/sci_living.js).
    var q = makeLivingPlain(opts);
    return M.livingBoard ? M.livingBoard(q) : q;
  }
  function makeLivingPlain(opts) {
    var rng = opts.rng;
    var living = [
      ["a tree", "tree", "A tree is living. It grows and needs water and light."],
      ["a puppy", "puppy", "A puppy is living. It can grow."],
      ["a fish", "fish", "A fish is living. It needs water."],
      ["a bee", "bee", "A bee is living. It can grow and fly."],
      ["a frog", "frog", "A frog is living. It grows from an egg."],
      ["a bird", "bird", "A bird is living. It needs food and air."],
      ["a rose", "plant", "A rose is a living plant. It can grow."],
      ["a rabbit", "rabbit", "A rabbit is living. It eats and grows."],
      ["a fox", "fox", "A fox is living. It eats and grows."],
      ["a camel", "camel", "A camel is living. It needs food and water."],
      ["a bear", "bear", "A bear is living. It eats, breathes, and grows."],
      ["a seedling", "plant", "A seedling is living. It can grow into a plant."],
      ["a hen", "bird", "A hen is living. It eats and can lay eggs."],
      ["a tadpole", "frog", "A tadpole is living. It grows into a frog."],
      ["a sunflower", "plant", "A sunflower is a living plant. It turns toward the light."],
      ["a kitten", "puppy", "A kitten is living. It needs food and water."]
    ];
    var non = [
      ["a rock", "rock", "A rock does not grow, eat, or need water. It is nonliving."],
      ["a metal spoon", "spoon", "A metal spoon was never alive."],
      ["a cup", "cup", "A cup is nonliving."],
      ["a wooden block", "wood", "A wooden block does not grow or eat."],
      ["a cotton ball", "soft", "A cotton ball is nonliving."],
      ["a bell", "idea", "A bell is nonliving. It does not grow."],
      ["an ice cube", "ice", "An ice cube is nonliving water. It does not eat or grow."],
      ["a balloon", "balloon", "A balloon is nonliving. It does not grow by itself."],
      ["a brick", "rock", "A brick is nonliving. It does not need food."],
      ["a coin", "idea", "A coin is nonliving metal."],
      ["a pencil", "wood", "A pencil is nonliving. It does not grow."],
      ["a glass marble", "idea", "A glass marble is nonliving."]
    ];
    M.LIVING_THINGS = living.map(function (n) { return cap(n[0]); });
    M.NONLIVING_THINGS = non.map(function (n) { return cap(n[0]); });
    var form = Math.floor(rng() * 5);
    if (form === 0 || form === 2) {
      var item = pick(rng, living);
      var ask = form === 0 ? "Which one is living?" : "Which one can grow?";
      return sceneChoice(opts, ask, item[1], item[2], cap(item[0]), non.map(function (n) { return cap(n[0]); }), (form === 0 ? "living|" : "grow|") + item[0]);
    }
    if (form === 1) {
      var dead = pick(rng, non);
      return sceneChoice(opts, "Which one is nonliving?", dead[1], dead[2], cap(dead[0]), living.map(function (n) { return cap(n[0]); }), "non|" + dead[0]);
    }
    if (form === 3) {
      // Plants make their own food, so only animals answer "needs food" (v28: seedling and sunflower left out too).
      var animals = living.filter(function (n) { return ["a tree", "a rose", "a seedling", "a sunflower"].indexOf(n[0]) < 0; });
      var animal = pick(rng, animals);
      return sceneChoice(opts, "Which one needs food?", animal[1], cap(animal[0]) + " is living, so it needs food.", cap(animal[0]), non.map(function (n) { return cap(n[0]); }), "food|" + animal[0]);
    }
    var a = pick(rng, living);
    var b = pick(rng, living.filter(function (n) { return n[0] !== a[0]; }));
    var pair = cap(a[0]) + " and " + b[0];
    var wrongPairs = [];
    var guard = 0;
    while (wrongPairs.length < 3 && guard++ < 20) {
      var x = pick(rng, non);
      var y = pick(rng, non);
      var label = cap(x[0]) + " and " + y[0];
      if (x[0] !== y[0] && wrongPairs.indexOf(label) < 0) wrongPairs.push(label);
    }
    return sceneChoice(opts, "Which pair is living?", a[1], cap(a[0]) + " and " + b[0] + " are both living.", pair, wrongPairs, "pair|" + [a[0], b[0]].sort().join("+"));
  }

  function makeNeeds(opts) {
    var rng = opts.rng;
    var name = pick(rng, NAMES);
    var plants = [["daisy", "plant"], ["bean plant", "plant"], ["sunflower", "sun"], ["rose", "plant"], ["sprout", "plant"], ["fern", "plant"], ["oak tree", "tree"], ["cactus", "plant"]];
    var animals = [
      ["puppy", "puppy", "Food and water"],
      ["kitten", "puppy", "Food and water"],
      ["bird", "bird", "Food and water"],
      ["fish", "fish", "Water"],
      ["frog", "frog", "Water"],
      ["fox", "fox", "Food and water"],
      ["rabbit", "rabbit", "Food and water"],
      ["bee", "bee", "Food"],
      ["camel", "camel", "Food and water"],
      ["bear", "bear", "Food and water"]
    ];
    var form = Math.floor(rng() * 5);
    var plant = pick(rng, plants);
    var animal = pick(rng, animals);
    if (form === 0) {
      return sceneChoice(opts, "What does a " + plant[0] + " need to grow?", "plant", "A plant needs water, light, and air.", "Water and light", ["Only darkness", "Soda and candy", "A loud noise"], "need|" + plant[0]);
    }
    if (form === 1) {
      return sceneChoice(opts, name + "'s " + plant[0] + " is drooping in a dark closet. What should " + name + " change?", plant[1], "Light and water help the plant perk up.", "Give it light and water", ["Hide it deeper", "Paint the pot", "Pick off every leaf"], "closet|" + plant[0]);
    }
    if (form === 2) {
      return sceneChoice(opts, "What does a " + animal[0] + " need every day?", animal[1], "A " + animal[0] + " needs " + animal[2].toLowerCase() + ".", animal[2], ["A television", "A hat", "Rocks to eat"], "daily|" + animal[0]);
    }
    if (form === 3) {
      var drink = animal[2] === "Water" ? "Water" : "A drink of water";
      return sceneChoice(opts, "A " + animal[0] + " has an empty bowl. What should you add?", animal[1], "An empty bowl means it needs " + drink.toLowerCase() + ".", drink, ["A hat", "A bell", "More dry sand only"], "bowl|" + animal[0]);
    }
    return sceneChoice(opts, "Which one helps a " + plant[0] + " make food?", "sun", "Leaves use sunlight, air, and water.", "Sunlight", ["A scarf", "Loud music", "A metal box"], "sun|" + plant[0]);
  }

  function makeWeather(opts) {
    var rng = opts.rng;
    var name = pick(rng, NAMES);
    var rows = [
      ["rain-coat", name + " is going out in the rain. What helps " + name + " stay dry?", "A raincoat", "rain", "A raincoat sheds the rain.", ["Sunglasses only", "A paper fan", "Sandals with no coat"]],
      ["rain-umbrella", "Rain is falling. What can " + name + " hold overhead?", "An umbrella", "rain", "An umbrella helps keep the rain off.", ["A paper fan", "Sunglasses only", "A wool scarf only"]],
      ["rain-boots", name + " wants dry feet in the puddles. What helps?", "Rain boots", "rain", "Rain boots keep feet drier.", ["Ice skates", "A paper fan", "Sandals with no coat"]],
      ["sun-hat", "The sun is bright and hot. What helps " + name + "?", "A hat and water", "sun", "A hat shades you, and water helps on a hot day.", ["A wool scarf only", "Ice skates", "A heavy blanket"]],
      ["sun-shade", name + " feels hot in the sun. What is a good choice?", "Shade and a drink", "sun", "Shade and a drink help when the sun is hot.", ["A snowsuit", "Ice skates", "A heavy blanket"]],
      ["sun-shirt", "It is sunny and calm. Which clothes fit?", "A light shirt", "sun", "A warm sunny day calls for light clothes.", ["A snowsuit", "Rain boots and a heavy coat", "Ice skates"]],
      ["wind-kite", "The wind is strong. What can the wind push?", "A kite", "wind", "Wind is moving air. It can push a kite.", ["A brick sitting still", "A mountain", "A closed book in a drawer"]],
      ["wind-air", "What is the wind?", "Moving air", "wind", "Wind is air that is moving.", ["A kind of rock", "Still water", "A plant root"]],
      ["cloud-rain", "The sky is full of dark clouds. What might happen next?", "Rain", "rain", "Dark clouds often bring rain.", ["The moon falls", "Snow made of sugar", "The sun gets closer"]],
      ["storm-inside", "Lightning flashes and the clouds are dark. What is a safe choice?", "Go inside", "rain", "A storm is safer from indoors.", ["Stand under the only tree", "Fly a kite", "Swim in the pond"]],
      ["puddle-rain", "Puddles cover the ground. What fell from the clouds?", "Rain", "rain", "Rain falls from clouds and can make puddles.", ["Sand", "Wooden blocks", "Sunlight"]],
      ["kite-sky", name + " wants to fly a kite. Which sky helps?", "A windy sky", "wind", "A kite needs moving air.", ["A closed room", "A still closet", "A dark drawer"]],
      ["snow-coat", "Snow is falling. What helps " + name + " stay warm?", "A warm coat", "soft", "A warm coat keeps the cold snow off your skin.", ["A paper fan", "Sandals with no coat", "Sunglasses only"]],
      ["snow-boots", name + " wants dry feet in the snow. What helps?", "Warm boots", "soft", "Warm boots keep feet drier in snow.", ["Ice skates with no socks", "A paper fan", "Sandals with no coat"]],
      ["fog-slow", "Fog hides the path. What is a safe choice?", "Walk slowly and stay with a grown-up", "wind", "Fog makes it hard to see, so slow and close is safer.", ["Run into the road", "Close your eyes", "Ride a kite"]],
      ["hot-water", "The day is hot and sunny. What should " + name + " drink?", "Water", "sun", "Water helps on a hot day.", ["A wool scarf", "A snowsuit", "Nothing at all"]],
      ["cold-layers", "The wind is cold. What helps " + name + "?", "A coat", "wind", "A coat blocks the cold wind.", ["A paper fan", "Sandals only", "A cup of ice on your head"]],
      ["puddle-boots", "Puddles are deep after the rain. What keeps feet drier?", "Rain boots", "rain", "Rain boots keep feet out of the puddle.", ["Paper shoes", "A wool scarf only", "Sunglasses only"]],
      ["sun-shade-tree", name + " is hot in the open sun. Where is a cooler spot?", "In the shade", "sun", "Shade blocks some of the hot sunlight.", ["On the hottest rock", "Inside a closed car", "Under a metal roof in the sun"]],
      ["wind-hat", "The wind keeps taking " + name + "'s hat. What is the wind?", "Moving air", "wind", "Wind is air that is moving.", ["A kind of rock", "Still water", "A plant root"]],
      ["cloud-cover", "Gray clouds cover the sky. What might they bring?", "Rain", "rain", "Gray clouds can bring rain.", ["A new moon falling", "Sugar snow", "A louder sun"]],
      ["storm-window", "Thunder booms. Where should " + name + " wait?", "Indoors", "rain", "Indoors is safer in a thunderstorm.", ["Under the only tree", "In the pond", "On the open hill"]],
      ["breeze-pinwheel", "A soft breeze is blowing. What can it spin?", "A pinwheel", "wind", "Moving air can spin a pinwheel.", ["A brick", "A closed book", "A rock on the ground"]],
      ["frost-window", "The morning grass is icy. What fell when it was cold?", "Frost", "ice", "Cold air can leave frost on the grass.", ["Hot soup", "Dry sand", "Sunlight only"]],
      ["rainbow-after", "The rain stops and the sun comes out. What can appear?", "A rainbow", "sun", "Sunlight through raindrops can make a rainbow.", ["A rock storm", "A second moon", "A metal cloud"]]
    ];
    var row = pick(rng, rows);
    return sceneChoice(opts, row[1], row[3], row[4], row[2], row[5], "weather|" + row[0]);
  }

  function makeMaterials(opts) {
    var rng = opts.rng;
    var rows = [
      ["step", "You need a step that will not bend. Which material?", "A hard wood block", "wood", "Hard wood stays stiff, so it can be a step.", ["A soft cloth", "A tissue", "A cotton ball"]],
      ["roof", "You want a roof that keeps rain out. Which material?", "Waterproof cloth", "rain", "Waterproof cloth lets the rain run off.", ["A paper napkin", "A sponge", "Loose cotton that soaks"]],
      ["coat", "You want a coat that keeps rain out. Which material?", "Waterproof cloth", "rain", "Waterproof cloth sheds the rain.", ["A paper napkin", "A sponge", "A cotton ball"]],
      ["soft", "Which material is soft?", "A cotton ball", "soft", "A cotton ball squishes. Brick, metal, and glass are hard.", ["A brick", "A metal spoon", "A glass cup"]],
      ["pillow", "You are stuffing a pillow. Which material fits?", "Soft cloth filling", "soft", "A pillow needs something soft.", ["Pebbles", "A brick", "Broken glass"]],
      ["handle", "Which is a good handle for a hot pot?", "Wood that stays cooler", "wood", "Wood does not heat up as fast as metal, so it can be a handle.", ["Bare metal you must grab", "Ice", "Paper that can burn"]],
      ["spoon", "Which spoon will not soak up the soup?", "A metal spoon", "spoon", "Metal stays firm in soup. A napkin would fall apart.", ["A paper napkin", "A tissue", "A dry sponge"]],
      ["bag", "You want a bag you can fold. Which material fits?", "Soft cloth", "soft", "Cloth can bend and fold. A brick cannot.", ["A brick", "A metal bar", "A glass cup"]],
      ["boat", "You want a toy that can sit on water. Which material fits?", "A wooden block", "wood", "Many wooden blocks float. A tissue falls apart when it is wet.", ["A tissue", "A paper napkin", "A cotton ball that gets soggy"]],
      ["hug", "You want something soft to hold. Which material fits?", "A cotton ball", "soft", "A cotton ball is soft. A rock is not.", ["A rock", "A brick", "A metal spoon"]],
      ["window", "You want to see the rain and stay dry. What fits the window?", "Clear glass", "rain", "Glass lets you see through and blocks the rain.", ["A paper napkin", "A cotton ball", "An open hole only"]],
      ["path", "You need a path that will not turn to mud. Which material?", "Hard stone", "rock", "Stone stays firm when it is wet. A tissue does not.", ["A tissue", "A cotton ball", "A paper napkin"]],
      ["tent", "You want a tent that sheds the rain. Which material?", "Waterproof cloth", "rain", "Waterproof cloth lets the rain run off the tent.", ["A paper napkin", "A sponge", "A cotton ball"]],
      ["nest", "A toy nest should be soft inside. Which material fits?", "Soft cloth", "soft", "Soft cloth is gentle inside a nest.", ["Broken glass", "A brick", "A metal bar"]],
      ["bridge-deck", "You need a bridge deck that stays stiff. Which material?", "A hard wood block", "wood", "Hard wood stays stiff across a gap.", ["A tissue", "A cotton ball", "A paper napkin"]],
      ["mug", "You want a mug that will not soak up the milk. Which material?", "A glass cup", "cup", "Glass holds milk without soaking it up.", ["A paper napkin", "A sponge", "A tissue"]],
      ["kite-tail", "A kite tail should be light. Which material fits?", "A strip of cloth", "soft", "Light cloth can flutter in the wind. A brick cannot.", ["A brick", "A metal bar", "A glass cup"]],
      ["raft", "You want a toy raft that can sit on water. Which material fits?", "A wooden block", "wood", "A wooden block can float. A tissue falls apart.", ["A tissue", "A paper napkin", "A cotton ball that gets soggy"]],
      ["magnet-case", "You want a case the magnet will not stick to. Which material?", "A wooden block", "wood", "Wood is not iron, so the magnet does not stick to it.", ["An iron nail", "A steel pin", "A steel key"]],
      ["shade-hat", "You want a hat that blocks the sun. Which material fits?", "Thick cloth", "soft", "Thick cloth can shade your face.", ["A clear hole", "A paper fan with no brim", "A bare wire"]],
      ["drum", "You want a drum you can tap. Which material makes a firm top?", "A wood top", "wood", "A firm wood top can be tapped. A tissue cannot.", ["A tissue", "A cotton ball", "Steam"]],
      ["lunch", "You want a box that keeps a sandwich from getting soaked. Which material?", "A solid box", "cup", "A solid box blocks the rain. A napkin does not.", ["A paper napkin only", "A sponge", "An open tissue"]],
      ["garden-tag", "A garden tag must not melt in the rain. Which material fits?", "A wooden tag", "wood", "Wood stays a tag in the rain better than a tissue.", ["A tissue", "A sugar cube", "A dry sponge left in the puddle"]]
    ];
    var row = pick(rng, rows);
    return sceneChoice(opts, row[1], row[3], row[4], row[2], row[5], "mat|" + row[0]);
  }

  function makeHabitat(opts) {
    var rng = opts.rng;
    var homes = [
      ["a fish", "In water", "fish", "A fish's body works in water. That is its habitat."],
      ["a camel", "A desert", "camel", "Wide feet and a way to store water fit the desert."],
      ["a polar bear", "A cold snowy place", "bear", "Thick fur keeps a polar bear warm."],
      ["a frog", "A pond", "frog", "A frog's eggs and skin need water, so a pond fits."],
      ["a bird", "A tree", "bird", "Wings help a bird reach a nest in a tree."],
      ["a bee", "Near flowers", "bee", "A bee finds food in flowers."],
      ["a rabbit", "A grassy field", "rabbit", "A rabbit eats plants in a grassy field."],
      ["a rose", "Soil in the sun", "plant", "A rose needs soil, water, and light."],
      ["a fox", "A woodland", "fox", "A fox finds food and cover in a woodland."],
      ["a bear", "A forest", "bear", "A bear finds food and a den in a forest."],
      ["a camel", "A dry desert", "camel", "A camel can live where water is scarce."],
      ["a bee", "A garden of flowers", "bee", "A bee finds nectar in flowers."],
      ["a hen", "A grassy yard", "bird", "A hen pecks for food in a grassy yard."],
      ["a cactus", "A sunny desert", "plant", "A cactus stores water and likes strong sun."],
      ["a crab", "A rocky shore", "rock", "A crab finds food and cover along a rocky shore."],
      ["a duck", "A pond", "bird", "A duck swims and feeds on a pond."]
    ];
    var home = pick(rng, homes);
    var places = homes.map(function (h) { return h[1]; });
    var form = rng() < 0.5;
    var prompt = form
      ? ("Where does " + home[0] + " get what it needs?")
      : ("Which place fits " + home[0] + "?");
    return sceneChoice(opts, prompt, home[2], home[3], home[1], places, "home|" + home[0] + "|" + (form ? "where" : "fit"));
  }

  function makeCycle(opts) {
    var rng = opts.rng;
    var cycles = [
      { id: "butterfly", scene: "cycle", steps: ["an egg", "a caterpillar", "a chrysalis", "a butterfly"], loop: "It can lay new eggs", say: "Egg, then caterpillar, then chrysalis, then butterfly." },
      { id: "frog", scene: "frog", steps: ["an egg", "a tadpole", "a frog"], loop: "It can lay new eggs", say: "Frog eggs hatch into tadpoles. Tadpoles grow into frogs." },
      { id: "plant", scene: "plant", steps: ["a seed", "a sprout", "a young plant", "a plant with new seeds"], loop: "New seeds can start again", say: "A seed sprouts into a young plant, which can make new seeds." },
      { id: "bird", scene: "bird", steps: ["an egg", "a chick", "a bird"], loop: "It can lay new eggs", say: "A bird egg hatches into a chick. The chick grows into a bird." },
      { id: "bean", scene: "plant", steps: ["a bean seed", "a root", "a green shoot", "a bean plant with pods"], loop: "New seeds can start again", say: "A bean seed grows a root, then a shoot, then pods with new seeds." },
      { id: "sunflower", scene: "sun", steps: ["a seed", "a sprout", "a tall plant", "a flower head full of seeds"], loop: "New seeds can start again", say: "A sunflower seed sprouts, grows tall, and makes new seeds." }
    ];
    var cycle = pick(rng, cycles);
    var idx = Math.floor(rng() * cycle.steps.length);
    var after = cycle.steps[idx];
    var last = idx === cycle.steps.length - 1;
    var answer = last ? cycle.loop : cap(cycle.steps[idx + 1]);
    var prompt = last
      ? ("In the " + cycle.id + " life cycle, what can happen after " + after + "?")
      : ("In the " + cycle.id + " life cycle, what comes right after " + after + "?");
    var wrongPool = ["A rock", "A bird", "A seed", "A caterpillar", "A chrysalis", "A frog", "A butterfly", "A tadpole", "An egg"];
    var wrong = otherLabels(rng, wrongPool.filter(function (w) { return w.toLowerCase() !== answer.toLowerCase(); }), answer, 4);
    return sceneChoice(opts, prompt, cycle.scene, last ? ("After that, the cycle can continue. " + cycle.say) : cycle.say, answer, wrong, "cycle|" + cycle.id + "|" + idx);
  }

  function makeMatter(opts) {
    var rng = opts.rng;
    var solids = [
      ["an ice cube", "ice", "Ice is solid water. It keeps its shape until it melts.", "An ice cube"],
      ["a wooden block", "wood", "A wooden block keeps its shape. It is a solid.", "A wooden block"],
      ["a rock", "rock", "A rock keeps its shape. It is a solid.", "A rock"],
      ["a metal spoon", "spoon", "A metal spoon keeps its shape. It is a solid.", "A metal spoon"],
      ["a brick", "rock", "A brick keeps its shape. It is a solid.", "A brick"],
      ["a coin", "idea", "A coin keeps its shape. It is a solid.", "A coin"],
      ["a pencil", "wood", "A pencil keeps its shape. It is a solid.", "A pencil"],
      ["a glass marble", "idea", "A glass marble keeps its shape. It is a solid.", "A glass marble"]
    ];
    var liquids = [
      ["juice", "cup", "Juice is a liquid. It flows and takes the shape of the cup.", "Juice"],
      ["milk", "cup", "Milk is a liquid. It pours and takes the shape of the cup.", "Milk"],
      ["water", "cup", "Water is a liquid. It flows and takes the shape of the cup.", "Water"],
      ["soup", "cup", "Soup is a liquid. It pours and takes the shape of the bowl.", "Soup"],
      ["oil", "cup", "Oil is a liquid. It flows and takes the shape of the cup.", "Oil"],
      ["honey", "cup", "Honey is a thick liquid. It still pours and takes the shape of the cup.", "Honey"]
    ];
    var gases = [
      ["air in a balloon", "balloon", "Air is a gas. It spreads out to fill the balloon.", "Air"],
      ["steam above a warm cup", "cup", "Steam is water as a gas. It spreads into the air.", "Steam"],
      ["the air you breathe out", "balloon", "The air you breathe out is a gas. It spreads into the room.", "Air you breathe out"],
      ["wind moving past a kite", "wind", "Wind is air, a gas, moving past the kite.", "Moving air"]
    ];
    var form = Math.floor(rng() * 5);
    if (form === 0) {
      var s = pick(rng, solids);
      return sceneChoice(opts, cap(s[0]) + " keeps its shape. What is it?", s[1], s[2], "A solid", ["A liquid", "A gas", "A sound"], "solid|" + s[0]);
    }
    if (form === 1) {
      var L = pick(rng, liquids);
      return sceneChoice(opts, cap(L[0]) + " takes the shape of a cup. What is it?", L[1], L[2], "A liquid", ["A solid", "A gas", "A rock"], "liquid|" + L[0]);
    }
    if (form === 2) {
      var g = pick(rng, gases);
      return sceneChoice(opts, cap(g[0]) + " spreads out to fill the space. What is it?", g[1], g[2], "A gas", ["A solid", "A liquid", "A kind of rock"], "gas|" + g[0]);
    }
    if (form === 3) {
      var which = pick(rng, solids);
      return sceneChoice(opts, "Which one is a solid?", which[1], which[2], which[3], ["Milk", "Steam", "Juice"], "which-solid|" + which[3]);
    }
    if (rng() < 0.5) {
      var liq = pick(rng, liquids);
      return sceneChoice(opts, "Which one is a liquid?", liq[1], liq[2], liq[3], ["A wooden block", "A rock", "Steam"], "which-liquid|" + liq[3]);
    }
    return sceneChoice(opts, "What happens when an ice cube sits in a warm room?", "ice", "Warmth melts the solid ice into liquid water.", "It melts into water", ["It turns into wood", "It becomes a seed", "It gets harder forever"], "melt|ice");
  }

  function makeBridge(opts) {
    var rng = opts.rng;
    var loads = ["a book", "a toy block", "a small car", "a cup of water", "a box of crayons", "a toy wagon"];
    var helps = [
      ["post", "A post in the middle", "A post in the middle helps the bridge hold the load."],
      ["brace", "A triangle brace", "A triangle brace keeps the bridge from folding."],
      ["beam", "A thicker beam", "A thicker beam bends less."],
      ["arch", "An arch underneath", "An arch sends the load out to the sides."],
      ["legs", "Two extra legs", "Extra legs hold the deck up."]
    ];
    var load = pick(rng, loads);
    var help = pick(rng, helps);
    var form = Math.floor(rng() * 4);
    if (form === 0) {
      return sceneChoice(opts, "Which bridge can hold " + load + " better?", "bridge", help[2], "The one with " + help[1].toLowerCase(), ["A flat strip with no support", "A tissue laid across a gap", "A loose string"], "hold|" + help[0] + "|" + load);
    }
    if (form === 1) {
      return sceneChoice(opts, "You may add one piece so the bridge can hold " + load + ". What helps most?", "bridge", help[2], help[1], ["A sticker on top", "Paint", "A bell on the side"], "add|" + help[0] + "|" + load);
    }
    if (form === 2) {
      return sceneChoice(opts, "The flat bridge bends under " + load + ". What can you say?", "bridge", "If it bends, add a support or a stiffer shape and test again.", "It needs a stronger shape or a support", ["Bending means it is the strongest", "It should be made of tissue", "Take away every support"], "bend|" + load);
    }
    return sceneChoice(opts, "Two bridges match except one has " + help[1].toLowerCase() + ". What is the one change?", "bridge", "A fair look changes one thing. Here, that piece is the change.", help[1], ["The color of the table", "The day of the week", "The shoes you wear"], "fair|" + help[0]);
  }

  function makeFood(opts) {
    var rng = opts.rng;
    var chains = [
      { id: "grass", plant: "grass", eater: "a rabbit", hunter: "a fox", scene: "rabbit" },
      { id: "leaf", plant: "a leaf", eater: "a caterpillar", hunter: "a bird", scene: "bird" },
      { id: "clover", plant: "clover", eater: "a rabbit", hunter: "a fox", scene: "rabbit" },
      { id: "berries", plant: "berries", eater: "a bird", hunter: "a fox", scene: "bird" },
      { id: "algae", plant: "algae", eater: "a small fish", hunter: "a big fish", scene: "fish" },
      { id: "nectar", plant: "nectar", eater: "a bee", hunter: "a bird", scene: "bee" },
      { id: "seeds", plant: "seeds", eater: "a mouse", hunter: "a fox", scene: "fox" },
      { id: "pondweed", plant: "pondweed", eater: "a tadpole", hunter: "a fish", scene: "frog" },
      { id: "acorns", plant: "acorns", eater: "a squirrel", hunter: "a fox", scene: "fox" }
    ];
    var chain = pick(rng, chains);
    var form = Math.floor(rng() * 4);
    if (form === 0) {
      return sceneChoice(opts, cap(chain.eater) + " eats in this chain: sun, " + chain.plant + ", " + chain.eater + ", " + chain.hunter + ". What does " + chain.eater + " eat?", chain.scene, cap(chain.eater) + " eats " + chain.plant + ".", cap(chain.plant), [cap(chain.hunter), "Rocks", "Only sunlight"], "eat|" + chain.id);
    }
    if (form === 1) {
      return sceneChoice(opts, "In that chain, what does " + chain.hunter + " eat?", chain.hunter === "a fox" ? "fox" : "bird", cap(chain.hunter) + " eats " + chain.eater + ".", cap(chain.eater), [cap(chain.plant), "Sunlight", "Soil"], "hunt|" + chain.id);
    }
    if (form === 2) {
      return sceneChoice(opts, "Where does the energy in the " + chain.plant + " start?", "sun", "The plant uses sunlight. That energy moves along the food chain.", "Sunlight", [cap(chain.hunter), "A magnet", "A shadow"], "sun|" + chain.id);
    }
    var order = "Sun, " + chain.plant.replace("a ", "") + ", " + chain.eater.replace("a ", "");
    return sceneChoice(opts, "Which list is a food chain in order?", chain.scene, "Sunlight helps the plant, and then an animal eats the plant.", order, ["Fox, sun, rock", "Rabbit, sun, plant", "Soil, fox, sunlight"], "order|" + chain.id);
  }

  function makeMixture(opts) {
    var rng = opts.rng;
    var easy = [["raisins", "oats"], ["buttons", "paper clips"], ["nuts", "pretzels"], ["beads", "blocks"], ["sand", "pebbles"], ["shells", "stones"], ["coins", "beans"], ["marbles", "buttons"], ["leaves", "twigs"], ["crayons", "erasers"]];
    var hard = [["sugar", "water"], ["salt", "water"], ["lemon juice", "water"], ["cocoa", "warm milk"], ["honey", "warm water"]];
    var magnetic = [["sand", "iron nails"], ["rice", "steel pins"], ["flour", "steel paper clips"], ["beans", "iron bolts"], ["salt", "steel tacks"]];
    var form = Math.floor(rng() * 4);
    if (form === 0) {
      var pair = pick(rng, easy);
      return sceneChoice(opts, "A bowl has " + pair[0] + " and " + pair[1] + ". Can you separate them by picking?", "mix", cap(pair[0]) + " and " + pair[1] + " stay in pieces. You can pick them apart.", "Yes", ["No, they melted together", "Only by freezing the room", "Only if they turn into a gas"], "pick|" + pair.join("+"));
    }
    if (form === 1) {
      var mix = pick(rng, hard);
      return sceneChoice(opts, cap(mix[0]) + " is stirred into " + mix[1] + " until you cannot see it. Can you pick it out with your fingers?", "cup", "It dissolved. Picking will not pull it back out.", "No", ["Yes, it sits in chunks", "Yes, if you paint it", "Yes, with a dry spoon"], "dissolve|" + mix[0]);
    }
    if (form === 2) {
      var sort = pick(rng, easy);
      var answer = cap(sort[0]) + " and " + sort[1];
      var wrongs = otherLabels(rng, ["Salt in water", "Sugar in hot tea", "Lemon juice in water", "Buttons and paper clips", "Nuts and pretzels", "Beads and blocks"], answer, 3);
      return sceneChoice(opts, "Which mixture is easy to separate by hand?", "mix", answer + " stay whole, so you can sort them.", answer, wrongs, "easy|" + sort.join("+"));
    }
    var mag = pick(rng, magnetic);
    return sceneChoice(opts, "You have " + mag[0] + " and " + mag[1] + ". What can help pull out the " + mag[1] + "?", "magnet", "A magnet pulls the iron or steel and leaves the rest.", "A magnet", ["A shadow", "A louder sound", "More " + mag[0]], "magnet|" + mag.join("+"));
  }

  function makeWater(opts) {
    var rng = opts.rng;
    var bodies = [["a puddle", "sun"], ["a pond", "rain"], ["a bowl of water", "cup"], ["a lake", "rain"], ["a cup of water", "cup"], ["a bucket", "rain"], ["a birdbath", "bird"], ["a fish tank", "fish"]];
    var body = pick(rng, bodies);
    var form = Math.floor(rng() * 5);
    if (form === 0) {
      return sceneChoice(opts, "The sun warms " + body[0] + ". What happens to some of the water?", body[1], "Heat helps the water evaporate. It rises as water vapor.", "It rises into the air", ["It turns into wood", "It becomes a rock", "It turns into a seed"], "rise|" + body[0]);
    }
    if (form === 1) {
      return sceneChoice(opts, "Water vapor from " + body[0] + " cools high up. What can form?", "rain", "Cooled water vapor can form droplets in a cloud.", "A cloud", ["A brick", "A magnet", "A seed"], "cloud|" + body[0]);
    }
    if (form === 2) {
      return sceneChoice(opts, "What falls when cloud droplets from " + body[0] + " get heavy?", "rain", "Heavy droplets fall as rain.", "Rain", ["Dry sand", "Sunlight", "Wood blocks"], "fall|" + body[0]);
    }
    if (form === 3) {
      return sceneChoice(opts, "Rain fills " + body[0] + ", then the sun comes out. What can happen next?", "sun", "The sun can warm the water, and some of it evaporates again.", "Some water evaporates again", ["The water becomes a fish by itself", "The water turns into metal", "Rain stops forever"], "again|" + body[0]);
    }
    return sceneChoice(opts, "Which order fits the water cycle?", "rain", "Water warms, rises, forms clouds, and can fall as rain.", "Puddle warms, vapor rises, cloud, rain", ["Rain, then the sun turns into a puddle", "Cloud, then the puddle becomes a rock", "Vapor, then the cloud eats the sun"], "order|water");
  }

  function makeFair(opts) {
    var rng = opts.rng;
    var tests = [
      ["water", "Two matching plants", "plant", "how water changes the plant", "The plants and the light"],
      ["light", "Two matching plants", "sun", "how light changes the plant", "The plants and the water"],
      ["the ramp height", "Two matching cars", "ramp", "how height changes the roll", "The car and the floor"],
      ["the surface", "Two matching rovers", "friction", "how the surface changes the roll", "The rover and the push"],
      ["a middle post", "Two matching bridges", "bridge", "how a post changes the strength", "The bridges and the load"],
      ["the soil", "Two matching seeds", "plant", "how soil changes the sprout", "The seeds and the water"],
      ["the magnet", "Two matching paper clips", "magnet", "how a magnet changes the clip", "The clips and the table"],
      ["the weight", "Two matching boats", "float", "how weight changes the float", "The boats and the water"],
      ["the light color", "Two matching plants", "sun", "how light color changes the plant", "The plants and the water"],
      ["the ramp cover", "Two matching cars", "ramp", "how the cover changes the roll", "The cars and the ramp height"],
      ["the cup shape", "Two matching ice cubes", "ice", "how the cup changes the melt", "The ice cubes and the room"]
    ];
    var test = pick(rng, tests);
    var form = Math.floor(rng() * 4);
    if (form === 0) {
      return sceneChoice(opts, "You want to know if " + test[0] + " matters. Which test is fair?", test[2], "A fair test changes one thing. Here, only " + test[0] + " changes.", cap(test[1]) + ", only " + test[0] + " is different", ["Change the pot, the light, and the water", "Different objects and a different setup each time", "Change three things at once"], "fair|" + test[0]);
    }
    if (form === 1) {
      return sceneChoice(opts, "You have " + test[1] + ". You change only " + test[0] + ". What are you testing?", test[2], "One change tells you what that change did.", cap(test[3]), ["The day of the week", "Whether they need a hat", "The color of the table and the change together"], "test|" + test[0]);
    }
    if (form === 2) {
      return sceneChoice(opts, "A test changes " + test[0] + " and two other things. What is the problem?", test[2], "If many things change, you cannot tell which change mattered.", "Too many things changed", ["It has a prediction", "It is written down", "It uses a test"], "many|" + test[0]);
    }
    return sceneChoice(opts, "What should stay the same when you test " + test[0] + "?", test[2], "Keep everything else the same so " + test[0] + " is the one change.", test[4], ["Nothing", "A different object each time", "The thing you are testing"], "same|" + test[0]);
  }

  function spaceBank() {
    var rows = [];
    function add(bands, min, max, scene, prompt, say, answer, wrong, id) {
      rows.push({ bands: bands, min: min, max: max, scene: scene, prompt: prompt, say: say, answer: answer, wrong: wrong, id: id });
    }
    var young = ["5-6"];
    var mid = ["7-8"];
    var old = ["9-10"];
    var older = ["7-8", "9-10"];

    add(young, 1, 2, "sun", "Which one lights the day?", "The Sun lights the day.", "The Sun", ["The Moon", "A rocket", "A cloud"], "lights-day");
    add(young, 1, 2, "sun", "The Sun is up. What is it?", "Day is when your side of Earth faces the Sun.", "Day", ["Night", "Bedtime", "A dark cave"], "is-day");
    add(young, 1, 2, "moon", "The sky is dark and the Sun is down. What is it?", "Night is when your side of Earth faces away from the Sun.", "Night", ["Noon", "A bright day", "Lunch"], "is-night");
    add(young, 1, 2, "earth", "Earth spins. What does that make?", "Earth spins, so we get day and night.", "Day and night", ["New stars", "A bigger Moon", "Rings on Earth"], "spin-day");
    add(young, 1, 2, "earth", "Where do people live?", "People live on Earth.", "On Earth", ["On the Sun", "On the Moon", "In a rain cloud"], "home");
    add(young, 1, 2, "earth", "Which planet is our home?", "Earth is the planet where people live.", "Earth", ["The Sun", "The Moon", "A rocket"], "home-planet");
    add(young, 1, 2, "orbit", "What does Earth travel around?", "Earth travels around the Sun.", "The Sun", ["A tree", "A kite", "A cup"], "around-sun");
    add(young, 1, 2, "moon", "What does the Moon travel around?", "The Moon travels around Earth.", "Earth", ["A cloud", "A chair", "A cup"], "moon-around");
    add(young, 1, 2, "stars", "What are stars?", "Stars are far-away suns. They make their own light.", "Far-away suns", ["Close rocks", "Raindrops", "Windows"], "stars-are");
    add(young, 1, 2, "sun", "Is the Sun a star?", "The Sun is a star. It lights our day.", "Yes", ["No, it is a moon", "No, it is a rock", "No, it is a cloud"], "sun-star");
    add(young, 1, 2, "rocket", "What can carry people off Earth?", "A rocket can carry people into space.", "A rocket", ["A bicycle", "A kite", "A wagon"], "rocket-ride");
    add(young, 1, 2, "astronaut", "Why does an astronaut wear a helmet in space?", "An astronaut wears a helmet because there is no air to breathe in space.", "There is no air to breathe", ["To hide from the Moon", "To catch rain", "To hear a bird"], "helmet");
    add(young, 1, 2, "sun", "What is this bright daytime star?", "This is the Sun. It is the star that lights our day.", "The Sun", ["The Moon", "A rocket", "A helmet"], "pic-sun");
    add(young, 1, 2, "earth", "What is this blue and green planet?", "This is Earth, the planet where people live.", "Earth", ["The Sun", "A rocket", "The Moon"], "pic-earth");
    add(young, 1, 2, "moon", "What is this gray round body in the night sky?", "This is the Moon.", "The Moon", ["The Sun", "A fish", "A cup"], "pic-moon");
    add(young, 1, 2, "rocket", "What is lifting off the ground?", "A rocket lifts off and can go to space.", "A rocket", ["The Moon", "A tree", "A spoon"], "pic-rocket");
    add(young, 1, 2, "astronaut", "Who wears this helmet and suit?", "An astronaut wears a suit and helmet in space.", "An astronaut", ["A fish", "A rock", "A cloud"], "pic-astro");
    add(young, 1, 2, "stars", "What do we see as tiny lights in the dark sky?", "Those tiny lights are stars, and stars are far-away suns.", "Stars", ["Cups", "Fish", "Chairs"], "see-stars");

    add(young, 3, 5, "orbit", "Which planet is called the red planet?", "Mars is the red planet.", "Mars", ["Earth", "The Moon", "Saturn"], "which-mars");
    add(young, 3, 5, "mars", "What color is Mars?", "Mars is the red planet.", "Red", ["Blue and green", "Yellow like the Sun", "Clear like glass"], "mars-color");
    add(young, 3, 5, "stars", "Which planet is known for its bright rings?", "Saturn has bright rings made of ice and rock.", "Saturn", ["Earth", "The Moon", "Mars"], "which-saturn");
    add(young, 3, 5, "saturn", "What goes around Saturn?", "Bright rings of ice and rock go around Saturn.", "Bright rings", ["A helmet", "Tree branches", "A puddle"], "saturn-rings");
    add(young, 3, 5, "rocket", "Which planet is the largest?", "Jupiter is the largest planet.", "Jupiter", ["The Moon", "Mercury", "Mars"], "which-jupiter");
    add(young, 3, 5, "jupiter", "This huge planet has bands and a big red spot. What is it?", "Jupiter is the largest planet. The big red spot is a giant storm.", "Jupiter", ["The Moon", "Mercury", "Earth"], "pic-jupiter");
    add(young, 3, 5, "orbit", "Which planet is closest to the Sun?", "Mercury is the closest planet to the Sun.", "Mercury", ["Earth", "Neptune", "Saturn"], "which-mercury");
    add(young, 3, 5, "mercury", "This small rocky planet is closest to the Sun. What is it?", "Mercury is the closest planet to the Sun.", "Mercury", ["Neptune", "Saturn", "Earth"], "pic-mercury");
    add(young, 3, 5, "stars", "Which of the eight planets is farthest from the Sun?", "Neptune is the farthest of the eight planets.", "Neptune", ["Mercury", "Earth", "Mars"], "which-neptune");
    add(young, 3, 5, "neptune", "This deep blue planet is the farthest of the eight. What is it?", "Neptune is the farthest of the eight planets.", "Neptune", ["Mercury", "Mars", "Earth"], "pic-neptune");
    add(young, 3, 5, "orbit", "How many planets go around our Sun?", "Eight planets go around our Sun.", "Eight", ["Two", "Three", "Twenty"], "count-eight");
    add(young, 3, 5, "rocket", "Earth is which planet from the Sun?", "Earth is the third planet from the Sun.", "The third", ["The first", "The eighth", "The fifth"], "earth-third");
    add(young, 3, 5, "orbit", "What is one year for Earth?", "A year is one trip Earth takes around the Sun.", "One trip around the Sun", ["One spin of Earth", "One night", "One rocket launch"], "year-trip");
    add(young, 3, 5, "earth", "People live on which planet?", "People live on Earth.", "Earth", ["Mercury", "Jupiter", "Saturn"], "people-earth");
    add(young, 3, 5, "mars", "What is this red planet?", "Mars is the red planet.", "Mars", ["Earth", "The Moon", "Saturn"], "pic-mars");
    add(young, 3, 5, "sun", "A year is one trip around which body?", "A year is one trip Earth takes around the Sun.", "The Sun", ["The Moon", "A rocket", "A cloud"], "year-sun");

    var planets = [
      { name: "Mercury", ord: "first", kind: "rocky", ask: "Which planet is closest to the Sun?", scene: "mercury", about: "Mercury is the closest planet to the Sun." },
      { name: "Venus", ord: "second", kind: "rocky", ask: "Which planet has thick yellow clouds?", scene: "venus", about: "Venus has thick yellow clouds." },
      { name: "Earth", ord: "third", kind: "rocky", ask: "Which planet is our home?", scene: "earth", about: "Earth is the planet where people live." },
      { name: "Mars", ord: "fourth", kind: "rocky", ask: "Which planet is the red planet?", scene: "mars", about: "Mars is the red planet. It looks red because of rusty dust." },
      { name: "Jupiter", ord: "fifth", kind: "giant", ask: "Which planet is the largest?", scene: "jupiter", about: "Jupiter is the largest planet." },
      { name: "Saturn", ord: "sixth", kind: "giant", ask: "Which planet is known for its bright rings?", scene: "saturn", about: "Saturn is known for its bright rings of ice and rock." },
      { name: "Uranus", ord: "seventh", kind: "giant", ask: "Which planet spins on its side?", scene: "uranus", about: "Uranus spins on its side." },
      { name: "Neptune", ord: "eighth", kind: "giant", ask: "Which planet has the fastest winds?", scene: "neptune", about: "Neptune has the fastest winds of the eight planets." }
    ];
    var orders = ["The first", "The second", "The third", "The fourth", "The fifth", "The sixth", "The seventh", "The eighth"];
    var neutral = ["orbit", "stars", "rocket"];
    function others(i, skip) {
      var out = [];
      var k = 0;
      while (out.length < 3 && k < 8) {
        var name = planets[(i + 1 + k) % 8].name;
        if (skip.indexOf(name) < 0 && out.indexOf(name) < 0) out.push(name);
        k++;
      }
      return out;
    }
    for (var i = 0; i < planets.length; i++) {
      var p = planets[i];
      var scene = neutral[i % 3];
      add(mid, 1, 5, scene, p.ask, p.about, p.name, others(i, [p.name]), "trait-" + p.name);
      add(old, 1, 2, scene, p.ask, p.about, p.name, others(i, [p.name]), "trait-" + p.name);
      add(mid, 2, 5, p.scene, p.name + " is which planet from the Sun?", p.name + " is the " + p.ord + " planet from the Sun.", orders[i], [orders[(i + 2) % 8], orders[(i + 4) % 8], orders[(i + 5) % 8]], "ord-" + p.name);
      add(old, 1, 4, p.scene, p.name + " is which planet from the Sun?", p.name + " is the " + p.ord + " planet from the Sun.", orders[i], [orders[(i + 2) % 8], orders[(i + 4) % 8], orders[(i + 5) % 8]], "ord-" + p.name);
      var kindLabel = p.kind === "rocky" ? "A rocky planet" : "A giant planet";
      var otherKind = p.kind === "rocky" ? "A giant planet" : "A rocky planet";
      var kindSay = p.name + " is " + (p.kind === "rocky" ? "a rocky planet." : "a giant planet.");
      add(mid, 3, 5, p.scene, "What kind of planet is " + p.name + "?", kindSay, kindLabel, [otherKind, "A star", "A moon"], "kind-" + p.name);
      add(old, 1, 4, p.scene, "What kind of planet is " + p.name + "?", kindSay, kindLabel, [otherKind, "A star", "A moon"], "kind-" + p.name);
      var groupLabel = p.kind === "rocky" ? "The inner rocky planets" : "The outer giant planets";
      var otherGroup = p.kind === "rocky" ? "The outer giant planets" : "The inner rocky planets";
      add(old, 1, 4, p.scene, "Which group is " + p.name + " in?", p.name + " is one of " + groupLabel.toLowerCase() + ".", groupLabel, [otherGroup, "The stars", "One moon"], "group-" + p.name);
      if (i < 7) {
        var nxt = planets[i + 1];
        add(mid, 3, 5, neutral[(i + 1) % 3], "Which planet comes just after " + p.name + "?", nxt.name + " comes just after " + p.name + ".", nxt.name, others(i, [nxt.name]), "next-" + p.name);
        add(old, 1, 4, neutral[(i + 1) % 3], "Which planet comes just after " + p.name + "?", nxt.name + " comes just after " + p.name + ".", nxt.name, others(i, [nxt.name]), "next-" + p.name);
      }
      if (i > 0) {
        var prev = planets[i - 1];
        add(mid, 3, 5, neutral[(i + 2) % 3], "Which planet comes just before " + p.name + "?", prev.name + " comes just before " + p.name + ".", prev.name, others(i, [prev.name]), "prev-" + p.name);
        add(old, 1, 4, neutral[(i + 2) % 3], "Which planet comes just before " + p.name + "?", prev.name + " comes just before " + p.name + ".", prev.name, others(i, [prev.name]), "prev-" + p.name);
      }
    }

    add(mid, 1, 2, "orbit", "How many planets orbit our Sun?", "Eight planets orbit our Sun.", "Eight", ["Two", "Four", "Twenty"], "count-easy");
    add(mid, 3, 5, "orbit", "How many planets orbit our Sun?", "Eight planets orbit our Sun. Pluto is a dwarf planet, not a ninth planet.", "Eight", ["Nine", "Three", "Twenty"], "count-pluto");
    add(old, 1, 4, "orbit", "How many planets orbit our Sun?", "Eight planets orbit our Sun. Pluto is a dwarf planet, not a ninth planet.", "Eight", ["Nine", "Three", "Twenty"], "count-pluto");
    add(mid, 3, 5, "orbit", "Is Pluto one of the eight planets?", "Pluto is a dwarf planet. It is not one of the eight planets.", "No, it is a dwarf planet", ["Yes, it is the ninth planet", "Yes, it is a star", "Yes, it is Earth's moon"], "pluto-no");
    add(old, 3, 4, "orbit", "Is Pluto one of the eight planets?", "Pluto is a dwarf planet. It is not one of the eight planets.", "No, it is a dwarf planet", ["Yes, it is the ninth planet", "Yes, it is a star", "Yes, it is Earth's moon"], "pluto-no");
    add(mid, 3, 5, "stars", "Which name is a dwarf planet, not one of the eight?", "Pluto is a dwarf planet. It is not one of the eight planets.", "Pluto", ["Neptune", "Earth", "Jupiter"], "pluto-name");
    add(old, 3, 4, "stars", "Which name is a dwarf planet, not one of the eight?", "Pluto is a dwarf planet. It is not one of the eight planets.", "Pluto", ["Neptune", "Earth", "Jupiter"], "pluto-name");
    add(mid, 1, 5, "sun", "The Sun is a what?", "The Sun is a star.", "A star", ["A rocky planet", "A moon", "A helmet"], "sun-is-star");
    add(old, 1, 4, "sun", "The Sun is a what?", "The Sun is a star.", "A star", ["A rocky planet", "A moon", "A helmet"], "sun-is-star");
    add(mid, 1, 5, "orbit", "What is a planet's path around the Sun called?", "An orbit is the path a planet takes around the Sun.", "An orbit", ["A helmet", "A rock", "A puddle"], "orbit-name");
    add(old, 1, 4, "orbit", "What is a planet's path around the Sun called?", "An orbit is the path a planet takes around the Sun.", "An orbit", ["A helmet", "A rock", "A puddle"], "orbit-name");
    add(mid, 1, 5, "earth", "What is one day on Earth?", "A day is one full spin of Earth. That spin takes about 24 hours.", "One full spin", ["One trip around the Sun", "One trip to Mars", "One rocket launch"], "day-spin");
    add(old, 1, 4, "earth", "What is one day on Earth?", "A day is one full spin of Earth. That spin takes about 24 hours.", "One full spin", ["One trip around the Sun", "One trip to Mars", "One rocket launch"], "day-spin");
    add(mid, 1, 5, "orbit", "What is one year for Earth?", "A year is one trip Earth takes around the Sun. That trip takes about 365 days.", "One trip around the Sun", ["One spin of Earth", "One night", "One cloud"], "year-365");
    add(old, 1, 4, "orbit", "What is one year for Earth?", "A year is one trip Earth takes around the Sun. That trip takes about 365 days.", "One trip around the Sun", ["One spin of Earth", "One night", "One cloud"], "year-365");
    add(mid, 2, 5, "earth", "About how long is one spin of Earth?", "A day is about 24 hours, one full spin of Earth.", "About 24 hours", ["About 24 minutes", "About 24 days", "About 24 years"], "day-hours");
    add(older, 3, 5, "moon", "Why does the Moon look bright?", "The Moon looks bright because it reflects sunlight.", "It reflects sunlight", ["It is a star", "It makes its own fire", "Earth turns it on"], "moon-light");
    add(mid, 3, 5, "stars", "Which planet is the hottest?", "Venus is the hottest planet because thick clouds hold heat in.", "Venus", ["Mercury", "Earth", "Neptune"], "hottest");
    add(old, 1, 4, "stars", "Which planet is the hottest?", "Venus is the hottest planet because thick clouds hold heat in.", "Venus", ["Mercury", "Earth", "Neptune"], "hottest");
    add(mid, 3, 5, "saturn", "Saturn's bright rings are mostly what?", "Saturn's bright rings are made of ice and rock.", "Ice and rock", ["Leaves and wood", "Rain clouds", "Helmet glass"], "ring-stuff");
    add(old, 3, 4, "saturn", "Saturn's bright rings are mostly what?", "Saturn's bright rings are made of ice and rock.", "Ice and rock", ["Leaves and wood", "Rain clouds", "Helmet glass"], "ring-stuff");
    add(mid, 4, 5, "jupiter", "The big red spot on Jupiter is what?", "The big red spot on Jupiter is a giant storm.", "A giant storm", ["A lake of water", "A ring of ice", "A small moon"], "red-spot");
    add(old, 1, 4, "jupiter", "The big red spot on Jupiter is what?", "The big red spot on Jupiter is a giant storm.", "A giant storm", ["A lake of water", "A ring of ice", "A small moon"], "red-spot");
    add(old, 1, 2, "orbit", "The first four planets from the Sun are which kind?", "The first four planets are rocky: Mercury, Venus, Earth, and Mars.", "Rocky planets", ["Giant planets", "Stars", "Moons"], "inner-four");
    add(old, 1, 2, "orbit", "The last four planets from the Sun are which kind?", "The last four planets are giant planets: Jupiter, Saturn, Uranus, and Neptune.", "Giant planets", ["Rocky planets", "Stars", "Moons"], "outer-four");
    add(old, 1, 4, "stars", "Which planet is an inner rocky planet?", "Mars is one of the inner rocky planets.", "Mars", ["Jupiter", "Saturn", "Neptune"], "inner-mars");
    add(old, 1, 4, "rocket", "Which planet is an outer giant planet?", "Neptune is one of the outer giant planets.", "Neptune", ["Mercury", "Venus", "Mars"], "outer-neptune");

    add(old, 3, 4, "moon", "What does our Moon orbit?", "Our Moon orbits Earth.", "Earth", ["The Sun only", "Jupiter only", "A comet"], "moon-earth");
    add(old, 3, 4, "jupiter", "Jupiter has which of these?", "Jupiter has many moons.", "Many moons", ["No moons at all", "Only one ring and no moons", "A helmet"], "jupiter-moons");
    add(old, 3, 4, "orbit", "A moon is a body that orbits what?", "A moon orbits a planet.", "A planet", ["A tree", "A cloud", "A helmet"], "moon-means");
    add(old, 3, 4, "earth", "How many moons does Earth have?", "Earth has one moon.", "One", ["None", "Eight", "Twenty"], "earth-moons");

    add(old, 3, 5, "comet", "What is a comet?", "A comet is ice and dust with a tail.", "Ice and dust with a tail", ["A star that fell", "A planet where people live", "A rain cloud"], "comet-what");
    add(old, 3, 5, "comet", "Which one is ice and dust with a tail?", "A comet is ice and dust with a tail.", "A comet", ["A meteor streak", "A planet", "A helmet"], "comet-which");
    add(old, 3, 5, "meteor", "What is a meteor?", "A meteor is a bright streak when a space rock burns in the air.", "A bright streak in the sky", ["A planet's ring", "A quiet moon", "A lake"], "meteor-what");
    add(old, 3, 5, "meteor", "A space rock burns in the air and makes a streak. What is that streak?", "That bright streak is a meteor.", "A meteor", ["A comet sitting far away", "A moon", "A satellite"], "meteor-streak");
    add(old, 3, 5, "asteroid", "Where is the asteroid belt?", "The asteroid belt is between Mars and Jupiter.", "Between Mars and Jupiter", ["Between Earth and the Moon", "Around Saturn's rings", "Past Neptune only"], "belt-where");
    add(old, 3, 5, "asteroid", "What sits between Mars and Jupiter?", "The asteroid belt sits between Mars and Jupiter.", "The asteroid belt", ["Earth's moon", "The Sun", "A rain cloud"], "belt-what");
    add(old, 3, 5, "asteroid", "What is an asteroid?", "An asteroid is a space rock. The asteroid belt is between Mars and Jupiter.", "A space rock", ["A star", "A helmet", "A raindrop"], "asteroid-what");
    add(old, 3, 5, "orbit", "Why do planets look bright?", "Planets reflect sunlight. They do not make their own light.", "They reflect sunlight", ["They burn like the Sun", "They are clouds", "They are helmets"], "planet-light");
    add(old, 3, 5, "mars", "Why does Mars look bright in the sky?", "Mars reflects sunlight. Planets do not make their own light.", "It reflects sunlight", ["It is a star", "It makes fire like the Sun", "It is a cloud"], "mars-light");

    add(old, 5, 5, "orbit", "What keeps Earth on its path around the Sun?", "Gravity keeps Earth on its path around the Sun.", "Gravity", ["A long rope", "The air", "A rocket engine"], "grav-earth");
    add(old, 5, 5, "moon", "What holds the Moon near Earth?", "Gravity holds the Moon near Earth.", "Gravity", ["A string", "Wind", "A magnet in a helmet"], "grav-moon");
    add(old, 5, 5, "eclipse", "What do we call it when the Moon blocks the Sun's light?", "A solar eclipse happens when the Moon blocks the Sun's light.", "A solar eclipse", ["A full moon", "Night", "A comet"], "eclipse-name");
    add(old, 5, 5, "eclipse", "During a solar eclipse, what blocks the Sun's light?", "The Moon blocks the Sun's light in a solar eclipse.", "The Moon", ["A cloud of rain", "A rocket", "Jupiter's red spot"], "eclipse-moon");
    add(old, 5, 5, "tilt", "Why does Earth have seasons?", "Seasons happen because Earth is tilted.", "Earth is tilted", ["Earth is much closer to the Sun in summer", "The Sun turns off", "The Moon covers the Sun all winter"], "seasons");
    add(old, 5, 5, "tilt", "What makes the seasons change?", "The seasons change because Earth is tilted as it goes around the Sun.", "Earth's tilt", ["A closer path in summer", "The Sun getting bigger", "A new moon each week"], "seasons-change");
    add(old, 5, 5, "galaxy", "What is the Milky Way?", "The Milky Way is our galaxy.", "Our galaxy", ["Earth's moon", "One planet", "A rocket"], "milky");
    add(old, 5, 5, "galaxy", "What is a galaxy?", "A galaxy is a huge group of stars.", "A huge group of stars", ["One planet", "A rain cloud", "A helmet"], "galaxy-what");
    add(old, 5, 5, "stars", "The Sun is one star in a huge group. What do we call that group?", "That huge group of stars is a galaxy. Ours is the Milky Way.", "A galaxy", ["A planet", "A moon", "An orbit"], "galaxy-group");
    add(old, 5, 5, "sun", "About how long does sunlight take to reach Earth?", "Sunlight takes about 8 minutes to reach Earth.", "About 8 minutes", ["About 8 seconds", "About 8 days", "About 8 years"], "sun-minutes");
    add(old, 5, 5, "satellite", "What is a machine that orbits Earth?", "A satellite orbits Earth.", "A satellite", ["A comet", "A star", "A puddle"], "sat-what");
    add(old, 5, 5, "satellite", "A weather picture comes from a machine above Earth. What is that machine?", "That machine is a satellite orbiting Earth.", "A satellite", ["A meteor", "A star", "A cloud on the ground"], "sat-weather");
    return rows;
  }

  function makeSpace(opts) {
    var step = Math.max(1, Math.min(5, opts.step || 1));
    var band = opts.band || "7-8";
    var all = spaceBank().filter(function (row) { return row.bands.indexOf(band) >= 0; });
    var rows = all.filter(function (row) { return step >= row.min && step <= row.max; });
    if (!rows.length) rows = all;
    var row = pick(opts.rng, rows);
    return sceneChoice(opts, row.prompt, row.scene, row.say, row.answer, row.wrong, "space|" + row.id + "|" + row.scene);
  }

  function makePush(opts) {
    var rng = opts.rng;
    var things = ["wagon", "cart", "ball", "chair", "swing", "door", "sled", "toy box", "stroller", "suitcase", "scooter", "desk"];
    var thing = pick(rng, things);
    var form = Math.floor(rng() * 4);
    if (form === 0) {
      return sceneChoice(opts, "You push the " + thing + " away from you. Which way does it move?", "push", "A push moves the " + thing + " away from your hands.", "Away from you", ["Toward you", "Straight up", "It cannot move"], "push|" + thing);
    }
    if (form === 1) {
      return sceneChoice(opts, "You pull the " + thing + " toward you. Which way does it move?", "pull", "A pull moves the " + thing + " toward your hands.", "Toward you", ["Away from you", "Straight up", "It sinks"], "pull|" + thing);
    }
    if (form === 2) {
      return sceneChoice(opts, "You give the " + thing + " a push. What can happen?", "push", "A push can start the " + thing + " moving.", "It starts moving", ["It becomes heavier", "It turns into a rock", "It cannot ever move"], "start|" + thing);
    }
    var rolling = pick(rng, ["wagon", "cart", "ball", "chair"]);
    return sceneChoice(opts, "You stop pushing the " + rolling + ". What happens next?", "push", "When the push stops, the " + rolling + " slows down and then stops.", "It slows and stops", ["It speeds up forever", "It floats away", "It grows"], "stop|" + rolling);
  }

  function twoRacers(rng) {
    var racers = ["Sam", "Max", "Jo", "Luz", "Ned", "Rio"];
    var first = pick(rng, racers);
    var second = pick(rng, racers.filter(function (name) { return name !== first; }));
    return [first, second];
  }

  function makeSpeed(opts) {
    var rng = opts.rng;
    var pair = twoRacers(rng);
    var fast = 2 + Math.floor(rng() * 4);
    var slow = fast + 2 + Math.floor(rng() * 4);
    var firstFast = rng() < 0.5;
    var fastName = firstFast ? pair[0] : pair[1];
    var slowName = firstFast ? pair[1] : pair[0];
    var firstTime = firstFast ? fast : slow;
    var secondTime = firstFast ? slow : fast;
    return sceneChoice(opts, pair[0] + " and " + pair[1] + " start together. " + pair[0] + " reaches the flag in " + firstTime + " seconds. " + pair[1] + " takes " + secondTime + " seconds. Who is faster?", "race", fastName + " takes less time, so " + fastName + " is faster.", fastName, [slowName, "They tie", "Neither moves"], "pace|" + fastName + "|" + fast + "|" + slowName + "|" + slow);
  }

  function makeBalance(opts) {
    var cap = [4, 6, 8, 10, 12][opts.step - 1] || 6;
    var left = 1 + Math.floor(opts.rng() * cap);
    var right = 1 + Math.floor(opts.rng() * cap);
    if (opts.step < 4 && left === right) right = left + 1;
    var answer = left === right ? "It stays level" : (left > right ? "The left side" : "The right side");
    var wrong = ["The left side", "The right side", "It stays level", "Both sides go up"].filter(function (w) { return w !== answer; });
    return choiceQuestion({
      prompt: "The left pan has " + left + " blocks. The right pan has " + right + ". Which side goes down?",
      speakPrompt: "Which side of the scale goes down?",
      board: { kind: "scene", scene: "scale", left: left, right: right },
      explain: { say: left === right ? "The sides match, so the scale stays level." : "The side with more blocks goes down.", scene: "scale", left: left, right: right },
      stem: "bal|" + left + "|" + right
    }, answer, wrong, opts.support, opts.rng);
  }

  function makeFloat(opts) {
    var rng = opts.rng;
    var rows = [
      ["a rock", "It sinks", "Rocks are heavy for their size and sink in a bowl of water."],
      ["a hollow ball", "It floats", "A hollow ball holds air, so it can float."],
      ["a metal spoon", "It sinks", "A metal spoon sinks in a cup of water."],
      ["a wooden block", "It floats", "Many wooden blocks float on water."],
      ["a coin", "It sinks", "A coin is metal and sinks in a cup of water."],
      ["a leaf", "It floats", "A dry leaf is light for its size and can float."],
      ["a crayon", "It sinks", "A crayon sinks in a bowl of water."],
      ["a beach ball", "It floats", "A beach ball holds air, so it floats."],
      ["a marble", "It sinks", "A marble is heavy for its size and sinks."],
      ["a cork", "It floats", "A cork is light for its size and floats."],
      ["a metal key", "It sinks", "A metal key sinks in water."],
      ["a feather", "It floats", "A feather is light and can float on water."],
      ["a brick", "It sinks", "A brick sinks in water."],
      ["a rubber duck", "It floats", "A rubber duck holds air, so it floats."],
      ["a pebble", "It sinks", "A pebble is heavy for its size and sinks."],
      ["a dry stick", "It floats", "A dry stick is light for its size and can float."],
      ["a ping-pong ball", "It floats", "A ping-pong ball holds air, so it floats."],
      ["a plastic lid", "It floats", "A light plastic lid can float."],
      ["a glass marble", "It sinks", "A glass marble sinks in water."],
      ["a sponge boat", "It floats", "A dry sponge boat holds air and can float at first."],
      ["a steel bolt", "It sinks", "A steel bolt sinks in water."]
    ];
    var row = pick(rng, rows);
    return sceneChoice(opts, "You set " + row[0] + " in water. What happens?", "float", row[2], row[1], ["It sinks", "It floats", "It flies", "It turns into ice"].filter(function (w) { return w !== row[1]; }), "float|" + row[0]);
  }

  function makeFriction(opts) {
    var rng = opts.rng;
    var pairs = [
      ["a rough rug", "a smooth wood floor", "On the rug", "On the wood floor"],
      ["dry grass", "a tile floor", "On the grass", "On the tile"],
      ["sandpaper", "ice", "On the sandpaper", "On the ice"],
      ["a carpet", "a gym floor", "On the carpet", "On the gym floor"],
      ["a gravel path", "a polished floor", "On the gravel", "On the polished floor"],
      ["a towel", "a bare table", "On the towel", "On the table"],
      ["a bumpy mat", "a shiny floor", "On the mat", "On the shiny floor"],
      ["a brick path", "a frozen puddle", "On the bricks", "On the ice"],
      ["a thick rug", "a bare hallway", "On the rug", "On the hallway"],
      ["a sandy track", "a gym floor", "On the sand", "On the gym floor"],
      ["a rubber mat", "a waxed floor", "On the rubber", "On the waxed floor"],
      ["deep grass", "a sidewalk", "In the grass", "On the sidewalk"],
      ["a corduroy cloth", "a plastic sheet", "On the corduroy", "On the plastic"],
      ["a gravel driveway", "a marble floor", "On the gravel", "On the marble"]
    ];
    var pair = pick(rng, pairs);
    var sooner = rng() < 0.5;
    if (sooner) {
      return sceneChoice(opts, "The same rover rolls on " + pair[0] + " and on " + pair[1] + ". Where does it stop sooner?", "friction", "The rough surface grabs the wheels more. That force is friction, so the rover stops sooner there.", pair[2], [pair[3], "They stop together", "It speeds up on the rough one"], "soon|" + pair[0]);
    }
    return sceneChoice(opts, "The same rover rolls on " + pair[0] + " and on " + pair[1] + ". Where does it keep rolling longer?", "friction", "The smoother surface has less friction, so the rover rolls longer there.", pair[3], [pair[2], "They stop together", "It stops at once on the smooth one"], "long|" + pair[0]);
  }

  function makeRamp(opts) {
    var rng = opts.rng;
    var things = ["car", "ball", "block", "toy wagon", "marble", "roller skate", "can", "toy truck"];
    var thing = pick(rng, things);
    var steep = pick(rng, ["steeper", "higher", "taller", "sharper"]);
    var form = rng() < 0.5;
    if (form) {
      return sceneChoice(opts, "Two ramps, the same " + thing + ". One ramp is " + steep + ". Which " + thing + " rolls farther along the floor?", "ramp", "The " + steep + " ramp gives the " + thing + " more speed, so it rolls farther.", "The " + thing + " from the " + steep + " ramp", ["The " + thing + " from the lower ramp", "They stop at the top", "Neither one moves"], "far|" + thing + "|" + steep);
    }
    return sceneChoice(opts, "One ramp is " + steep + " and one is nearly flat. Which ramp gives the " + thing + " more speed?", "ramp", "A " + steep + " ramp sends the " + thing + " faster.", "The " + steep + " ramp", ["The nearly flat ramp", "They give the same speed", "Neither ramp"], "speed|" + thing + "|" + steep);
  }

  function makeMagnet(opts) {
    var rng = opts.rng;
    var sticks = [
      ["a paper clip", "A paper clip is iron metal, so a magnet can pull it."],
      ["an iron nail", "An iron nail is metal a magnet can pull."],
      ["a steel pin", "A steel pin sticks to a magnet."],
      ["an iron screw", "An iron screw sticks to a magnet."],
      ["a steel key", "A steel key sticks to a magnet."],
      ["a steel spoon", "A steel spoon sticks to a magnet."],
      ["an iron bolt", "An iron bolt sticks to a magnet."],
      ["a steel tack", "A steel tack sticks to a magnet."],
      ["an iron washer", "An iron washer sticks to a magnet."],
      ["a steel nail", "A steel nail sticks to a magnet."],
      ["an iron pan", "An iron pan sticks to a magnet."],
      ["a steel clip", "A steel clip sticks to a magnet."],
      ["an iron hook", "An iron hook sticks to a magnet."],
      ["a steel brad", "A steel brad sticks to a magnet."]
    ];
    var skips = ["a wooden block", "a cotton ball", "a rubber eraser", "a plastic spoon", "a leaf", "a penny", "a rubber band", "a plastic cup", "a piece of paper", "a glass marble", "a wooden pencil", "a rubber duck", "a plastic lid", "a cork", "a feather", "a wax crayon"];
    if (opts.step >= 4 && rng() < 0.45) {
      var same = rng() < 0.5;
      if (same) {
        return sceneChoice(opts, "Two magnet ends with the same mark face each other. What do they do?", "magnet", "The same ends push apart. Opposite ends pull together.", "They push apart", ["They always stick", "They turn into water", "Nothing can happen"], "poles|same");
      }
      return sceneChoice(opts, "Two magnet ends with opposite marks face each other. What do they do?", "magnet", "Opposite ends pull together. The same ends push apart.", "They pull together", ["They always push apart", "They turn into water", "Nothing can happen"], "poles|opp");
    }
    var yes = rng() < 0.55;
    if (yes) {
      var stick = pick(rng, sticks);
      return sceneChoice(opts, "Which one sticks to a magnet?", "magnet", stick[1], cap(stick[0]), skips.map(cap), "stick|" + stick[0]);
    }
    var skip = pick(rng, skips);
    return sceneChoice(opts, "Which one does not stick to a magnet?", "magnet", cap(skip) + " is not iron or steel, so a magnet does not pull it.", cap(skip), sticks.map(function (s) { return cap(s[0]); }), "skip|" + skip);
  }

  function makeDrop(opts) {
    var rng = opts.rng;
    var pairs = [
      ["a heavy block", "a light block"],
      ["a big rock", "a small rock"],
      ["a heavy book", "a pencil"],
      ["a big metal block", "a small metal block"],
      ["a heavy book", "a sheet of paper"],
      ["a full bottle", "an empty bottle"],
      ["a large stone", "a pebble"],
      ["a metal pan", "a plastic cup"],
      ["a brick", "a foam block"]
    ];
    var pair = pick(rng, pairs);
    var form = Math.floor(rng() * 3);
    var say = "They land together. Being heavier does not make one fall faster here.";
    if (form === 0) {
      return sceneChoice(opts, cap(pair[0]) + " and " + pair[1] + " drop from the same height at the same time. Which lands first?", "drop", say, "They land together", ["The heavy one", "The light one", "Neither falls"], "land|" + pair[0]);
    }
    if (form === 1) {
      return sceneChoice(opts, "Does " + pair[0] + " fall faster than " + pair[1] + " from the same height?", "drop", say, "No, they land together", ["Yes, the heavy one", "Yes, the light one", "Neither falls"], "faster|" + pair[0]);
    }
    return sceneChoice(opts, cap(pair[0]) + " and " + pair[1] + " are dropped together. Which one reaches the ground first?", "drop", say, "They tie", ["The heavy one", "The light one", "Neither falls"], "tie|" + pair[0]);
  }

  function makeForces(opts) {
    var rng = opts.rng;
    var things = ["box", "wagon", "book", "cart", "sled", "crate", "desk", "toy chest"];
    var thing = pick(rng, things);
    var n = 2 + Math.floor(rng() * 3);
    var balanced = opts.step < 3 || rng() < 0.5;
    if (balanced) {
      return sceneChoice(opts, n + " pushes press the " + thing + " from the left and " + n + " matching pushes press from the right. What happens?", "forces", "The pushes match, so they are balanced. The " + thing + " does not start moving.", "The " + thing + " stays put", ["It zooms left", "It zooms right", "It floats up"], "bal|" + thing + "|" + n);
    }
    var fromLeft = rng() < 0.5;
    var strong = n + 2;
    var way = fromLeft ? "To the right" : "To the left";
    var side = fromLeft ? "left" : "right";
    var other = fromLeft ? "right" : "left";
    return sceneChoice(opts, "A strong push from the " + side + " (" + strong + ") beats a small push from the " + other + " (" + n + "). Which way does the " + thing + " move?", "forces", "The stronger push wins. The " + thing + " moves " + way.toLowerCase() + ".", way, [fromLeft ? "To the left" : "To the right", "It stays put", "Straight up"], "unbal|" + thing + "|" + side + "|" + strong + "|" + n);
  }

  function makeTrips(opts) {
    var rng = opts.rng;
    var t = 4 + Math.floor(rng() * 5);
    var far = 8 + Math.floor(rng() * 8);
    var near = 2 + Math.floor(rng() * 5);
    if (near >= far) near = Math.max(1, far - 3);
    var pair = twoRacers(rng);
    var farName = rng() < 0.5 ? pair[0] : pair[1];
    var nearName = farName === pair[0] ? pair[1] : pair[0];
    var askFar = opts.step < 4 || rng() < 0.5;
    if (askFar) {
      return sceneChoice(opts, "In " + t + " seconds, " + farName + " goes " + far + " meters and " + nearName + " goes " + near + " meters. Who went farther?", "race", "Same time, more meters. " + farName + " went farther.", farName, [nearName, "They went the same distance", "No one moved"], "meters|" + farName + "|" + t + "|" + far + "|" + near);
    }
    var slow = t + 2 + Math.floor(rng() * 4);
    return sceneChoice(opts, farName + " and " + nearName + " both travel " + far + " meters. " + farName + " takes " + t + " seconds. " + nearName + " takes " + slow + " seconds. Who is faster?", "race", "Same distance, less time. " + farName + " is faster.", farName, [nearName, "They tie", nearName + ", because the time is longer"], "pace|" + farName + "|" + far + "|" + t + "|" + slow);
  }

  function makeLight(opts) {
    var rng = opts.rng;
    var things = ["cup", "book", "block", "box", "can", "boot", "bottle", "toy"];
    var thing = pick(rng, things);
    var form = Math.floor(rng() * 4);
    if (form === 0) {
      return sceneChoice(opts, "A lamp shines from the left of a " + thing + ". Where does the shadow fall?", "shadow", "Light travels in a straight line. The " + thing + " blocks it, so the shadow is on the right.", "On the right of the " + thing, ["On the lamp", "Under the lamp bulb", "On the left, between the lamp and the " + thing], "shade|" + thing);
    }
    if (form === 1) {
      return sceneChoice(opts, "A lamp is on the left of a " + thing + ". What blocks the light to make the shadow?", "shadow", "The " + thing + " blocks the light, and the shadow falls on the other side.", "The " + thing, ["The lamp itself", "The empty air beside it", "The shadow makes the light"], "block|" + thing);
    }
    if (form === 2) {
      return sceneChoice(opts, "The lamp shining on the " + thing + " is turned off. What happens to that shadow?", "shadow", "No light from the lamp means no shadow from the lamp.", "The shadow goes away", ["The shadow gets brighter", "The shadow moves onto the lamp", "The " + thing + " starts to glow"], "off|" + thing);
    }
    return sceneChoice(opts, "A clear window and a " + thing + " are in the same lamplight. Which one makes the darker shadow?", "shadow", "The " + thing + " blocks the light. Clear glass lets most of the light through.", "The " + thing, ["The clear window", "Neither can make a shadow", "The lamp bulb"], "dark|" + thing);
  }

  function makePulley(opts) {
    var rng = opts.rng;
    var loads = ["load", "bucket", "flag", "box", "bag", "pail", "basket", "crate", "lantern", "pack"];
    var load = pick(rng, loads);
    var form = Math.floor(rng() * 3);
    if (form === 0) {
      return sceneChoice(opts, "A rope runs over a pulley to a " + load + ". You pull the rope down. Which way does the " + load + " go?", "pulley", "The pulley turns the pull. You pull down, and the " + load + " goes up.", "Up", ["Down", "It stays still", "Sideways through the wheel"], "up|" + load);
    }
    if (form === 1) {
      return sceneChoice(opts, "You want the " + load + " on the pulley to go up. Which way do you pull the rope?", "pulley", "Pull down on the rope, and the " + load + " goes up.", "Down", ["Up", "Sideways", "You do not pull"], "pull|" + load);
    }
    return sceneChoice(opts, "The " + load + " on the pulley goes up. Which way was the rope pulled?", "pulley", "The rope was pulled down, so the " + load + " rose.", "Down", ["Up", "Not at all", "Through the wheel"], "rose|" + load);
  }

  var DIRS = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
  var DIR_NAME = { R: "Right", L: "Left", U: "Up", D: "Down" };

  function inb(grid, x, y) {
    if (x < 0 || y < 0 || x >= grid.w || y >= grid.h) return false;
    var walls = grid.walls || [];
    for (var i = 0; i < walls.length; i++) if (walls[i].x === x && walls[i].y === y) return false;
    return true;
  }

  // Runs arrows on a grid. v25: grids can also have gems (items), a key and a door. The door is a wall
  // until the key has been picked up; gems and the key are picked up when the robot steps on them.
  M.runMoves = function (grid, moves) {
    var x = grid.start.x;
    var y = grid.start.y;
    var trail = [{ x: x, y: y }];
    var bumped = false;
    var items = grid.items || [];
    var got = {};
    var hasKey = false;
    var door = grid.door || null;
    function pickUp() {
      for (var j = 0; j < items.length; j++) if (items[j].x === x && items[j].y === y) got[j] = true;
      if (grid.key && grid.key.x === x && grid.key.y === y) hasKey = true;
    }
    var doorHit = false;
    for (var i = 0; i < moves.length; i++) {
      var d = DIRS[moves[i]];
      if (!d) break;
      var nx = x + d[0];
      var ny = y + d[1];
      if (!inb(grid, nx, ny)) { bumped = true; break; }
      if (door && !hasKey && door.x === nx && door.y === ny) { bumped = true; doorHit = true; break; }
      x = nx;
      y = ny;
      trail.push({ x: x, y: y });
      pickUp();
    }
    var gotN = Object.keys(got).length;
    return { x: x, y: y, trail: trail, bumped: bumped, doorHit: doorHit, got: got, gotN: gotN, hasKey: hasKey,
      done: !bumped && !!grid.goal && x === grid.goal.x && y === grid.goal.y && gotN === items.length };
  };

  // v25 robot puzzles: shortest solution by breadth-first search over (square, gems picked up, key).
  M.robotSolve = function (grid) {
    var items = grid.items || [];
    var full = (1 << items.length) - 1;
    function itemAt(x, y) { for (var j = 0; j < items.length; j++) if (items[j].x === x && items[j].y === y) return j; return -1; }
    var start = { x: grid.start.x, y: grid.start.y, m: 0, k: 0 };
    var j0 = itemAt(start.x, start.y); if (j0 >= 0) start.m |= 1 << j0;
    var key = function (s) { return s.x + "," + s.y + "," + s.m + "," + s.k; };
    var prev = {}; prev[key(start)] = null;
    var queue = [start], head = 0;
    while (head < queue.length) {
      var cur = queue[head++];
      if (grid.goal && cur.x === grid.goal.x && cur.y === grid.goal.y && cur.m === full) {
        var path = [], kk = key(cur);
        while (prev[kk]) { path.unshift(prev[kk].d); kk = prev[kk].from; }
        return path;
      }
      for (var dname in DIRS) {
        var nx = cur.x + DIRS[dname][0], ny = cur.y + DIRS[dname][1];
        if (!inb(grid, nx, ny)) continue;
        if (grid.door && !cur.k && grid.door.x === nx && grid.door.y === ny) continue;
        var n = { x: nx, y: ny, m: cur.m, k: cur.k };
        var j = itemAt(nx, ny); if (j >= 0) n.m |= 1 << j;
        if (grid.key && grid.key.x === nx && grid.key.y === ny) n.k = 1;
        var nk = key(n);
        if (nk in prev) continue;
        prev[nk] = { from: key(cur), d: dname };
        queue.push(n);
      }
    }
    return null;
  };

  var ARROW = { R: "→", L: "←", U: "↑", D: "↓" };
  var COUNT_WORD = { 1: "Once", 2: "Twice", 3: "Three times", 4: "Four times" };

  function arrows(moves) {
    return moves.map(function (m) { return ARROW[m]; }).join(" ");
  }

  function reaches(grid, moves) {
    if (!grid || !grid.goal || !moves || !moves.length) return false;
    var end = M.runMoves(grid, moves);
    return end.done;
  }

  function cellsOf(moves) {
    var x = 0;
    var y = 0;
    var cells = [{ x: 0, y: 0 }];
    moves.forEach(function (m) {
      x += DIRS[m][0];
      y += DIRS[m][1];
      cells.push({ x: x, y: y });
    });
    return cells;
  }

  function pathTouches(cells) {
    for (var i = 0; i < cells.length; i++) {
      for (var j = i + 2; j < cells.length; j++) {
        if (Math.abs(cells[i].x - cells[j].x) + Math.abs(cells[i].y - cells[j].y) === 1) return true;
      }
    }
    return false;
  }

  function uniquePerms(arr) {
    var out = [];
    var used = [];
    var cur = [];
    function walk() {
      if (cur.length === arr.length) {
        out.push(cur.slice());
        return;
      }
      var seen = {};
      for (var i = 0; i < arr.length; i++) {
        if (used[i] || seen[arr[i]]) continue;
        seen[arr[i]] = true;
        used[i] = true;
        cur.push(arr[i]);
        walk();
        cur.pop();
        used[i] = false;
      }
    }
    walk();
    return out;
  }

  function winnerCount(grid, moves) {
    var perms = uniquePerms(moves);
    var n = 0;
    for (var i = 0; i < perms.length; i++) if (reaches(grid, perms[i])) n++;
    return n;
  }

  function gridFromMoves(moves) {
    var cells = cellsOf(moves);
    var minX = 0;
    var minY = 0;
    var maxX = 0;
    var maxY = 0;
    cells.forEach(function (c) {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.x > maxX) maxX = c.x;
      if (c.y > maxY) maxY = c.y;
    });
    var open = {};
    cells.forEach(function (c) { open[(c.x - minX) + "," + (c.y - minY)] = true; });
    var walls = [];
    for (var yy = minY; yy <= maxY; yy++) {
      for (var xx = minX; xx <= maxX; xx++) {
        if (!open[(xx - minX) + "," + (yy - minY)]) walls.push({ x: xx - minX, y: yy - minY });
      }
    }
    var last = cells[cells.length - 1];
    return {
      w: maxX - minX + 1,
      h: maxY - minY + 1,
      start: { x: -minX, y: -minY },
      goal: { x: last.x - minX, y: last.y - minY },
      walls: walls,
      moves: moves.slice()
    };
  }

  function cropOpen(moveLists, goalIndex) {
    var minX = 0;
    var minY = 0;
    var maxX = 0;
    var maxY = 0;
    var ends = [];
    moveLists.forEach(function (moves) {
      var x = 0;
      var y = 0;
      for (var i = 0; i < moves.length; i++) {
        x += DIRS[moves[i]][0];
        y += DIRS[moves[i]][1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      ends.push({ x: x, y: y });
    });
    var goal = ends[goalIndex];
    if (!goal || (goal.x === 0 && goal.y === 0)) return null;
    return {
      w: maxX - minX + 1,
      h: maxY - minY + 1,
      start: { x: -minX, y: -minY },
      goal: { x: goal.x - minX, y: goal.y - minY },
      walls: [],
      moves: moveLists[goalIndex].slice()
    };
  }

  function openFromMoves(moves, pad) {
    var grid = cropOpen([moves], 0);
    if (!grid) return null;
    grid.start.x += pad;
    grid.start.y += pad;
    grid.goal.x += pad;
    grid.goal.y += pad;
    grid.w += pad * 2;
    grid.h += pad * 2;
    return grid;
  }

  function fallbackMoves(len) {
    var patterns = {
      2: ["R", "U"],
      3: ["R", "R", "U"],
      4: ["R", "R", "U", "U"],
      5: ["R", "R", "U", "U", "L"],
      6: ["R", "R", "U", "U", "L", "L"]
    };
    return (patterns[len] || patterns[4]).slice();
  }

  function tightMaze(rng, len) {
    var size = len > 4 ? 6 : 5;
    for (var attempt = 0; attempt < 30; attempt++) {
      var carved = carve(rng, size, size, len);
      if (!carved.moves || carved.moves.length !== len) continue;
      var kinds = {};
      carved.moves.forEach(function (m) { kinds[m] = true; });
      if (Object.keys(kinds).length < 2) continue;
      if (pathTouches(cellsOf(carved.moves))) continue;
      var grid = gridFromMoves(carved.moves);
      if (grid.start.x === grid.goal.x && grid.start.y === grid.goal.y) continue;
      if (!reaches(grid, grid.moves)) continue;
      if (winnerCount(grid, grid.moves) !== 1) continue;
      return grid;
    }
    return gridFromMoves(fallbackMoves(len));
  }

  function timesMoves(body, n) {
    var moves = [];
    for (var t = 0; t < n; t++) {
      for (var i = 0; i < body.length; i++) moves.push(body[i]);
    }
    return moves;
  }

  function repeatMoves(dir, n) {
    var moves = [];
    for (var i = 0; i < n; i++) moves.push(dir);
    return moves;
  }

  function carve(rng, w, h, len) {
    var x = Math.floor(rng() * w);
    var y = Math.floor(rng() * h);
    var startX = x;
    var startY = y;
    var moves = [];
    var seen = {};
    seen[x + "," + y] = true;
    var keys = ["R", "L", "U", "D"];
    for (var i = 0; i < len; i++) {
      var opts = keys.filter(function (k) {
        var nx = x + DIRS[k][0];
        var ny = y + DIRS[k][1];
        return inb({ w: w, h: h, walls: [] }, nx, ny) && !seen[nx + "," + ny];
      });
      if (!opts.length) break;
      var k = opts[Math.floor(rng() * opts.length)];
      moves.push(k);
      x += DIRS[k][0];
      y += DIRS[k][1];
      seen[x + "," + y] = true;
    }
    return { w: w, h: h, start: { x: startX, y: startY }, goal: { x: x, y: y }, moves: moves, walls: [] };
  }

  function gridCopy(g, withGoal) {
    return {
      w: g.w,
      h: g.h,
      start: { x: g.start.x, y: g.start.y },
      goal: withGoal && g.goal ? { x: g.goal.x, y: g.goal.y } : null,
      walls: (g.walls || []).map(function (w) { return { x: w.x, y: w.y }; }),
      items: (g.items || []).map(function (w) { return { x: w.x, y: w.y }; }),
      key: g.key ? { x: g.key.x, y: g.key.y } : null,
      door: g.door ? { x: g.door.x, y: g.door.y } : null,
      moves: g.moves.slice()
    };
  }

  // ---- v25 Robot puzzles: press the arrows to drive the robot ----
  //   Beginner (steps 1-2): open grid, 2-5 moves, the robot moves on every press ("step" mode).
  //   Intermediate (steps 3-4): walls, 1-3 gems to pick up, 5-10 moves; plan the arrows, then press Go ("plan").
  //   Expert (step 5): bigger maze, a key that opens a door, a gem, a move budget ("in 12 moves or fewer").
  // Every grid is checked by M.robotSolve (breadth-first search); the shortest path sets the move count.
  var ROBOT_SPEC = {
    1: { w: 4, h: 3, min: 2, max: 3, walls: 0, items: 0 },
    2: { w: 5, h: 4, min: 3, max: 5, walls: 2, items: 0 },
    3: { w: 5, h: 5, min: 5, max: 8, walls: 6, items: 1 },
    4: { w: 6, h: 5, min: 6, max: 10, walls: 8, items: 2 },
    5: { w: 7, h: 6, min: 9, max: 16, walls: 13, items: 1, key: true }
  };
  function robotGrid(rng, step) {
    var spec = ROBOT_SPEC[step] || ROBOT_SPEC[1];
    for (var attempt = 0; attempt < 400; attempt++) {
      var w = spec.w, h = spec.h, used = {};
      function cell() {
        for (var t = 0; t < 50; t++) {
          var c = { x: Math.floor(rng() * w), y: Math.floor(rng() * h) };
          if (!used[c.x + "," + c.y]) { used[c.x + "," + c.y] = true; return c; }
        }
        return null;
      }
      var start = cell(), goal = cell();
      if (!start || !goal) continue;
      var dist = Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
      if (dist < Math.min(spec.min, 3)) continue;
      var items = [];
      for (var i = 0; i < spec.items; i++) items.push(cell());
      if (items.some(function (c) { return !c; })) continue;
      var walls = [];
      for (var k = 0; k < spec.walls; k++) { var wc = cell(); if (wc) walls.push(wc); }
      var key = null, door = null;
      if (spec.key) {
        // The door goes on a square the robot must pass (blocking it cuts every way to the star); the key
        // goes on a square it can reach before the door.
        var open = { w: w, h: h, start: start, goal: goal, walls: walls, items: [], moves: [] };
        var way = M.robotSolve(open);
        if (!way || way.length < 4) continue;
        var cells = M.runMoves(open, way).trail.slice(1, -1).filter(function (c) {
          return !used[c.x + "," + c.y] && M.robotSolve({ w: w, h: h, start: start, goal: goal, walls: walls.concat([c]), items: [], moves: [] }) === null;
        });
        if (!cells.length) continue;
        door = cells[Math.floor(rng() * cells.length)];
        used[door.x + "," + door.y] = true;
        var shut = walls.concat([door]);
        var reach = [];
        for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
          if (used[xx + "," + yy]) continue;
          var probe = { w: w, h: h, start: start, goal: { x: xx, y: yy }, walls: shut, items: [], moves: [] };
          if (M.robotSolve(probe)) reach.push({ x: xx, y: yy });
        }
        if (!reach.length) continue;
        key = reach[Math.floor(rng() * reach.length)];
        used[key.x + "," + key.y] = true;
        // gems must sit on squares the robot can reach at all
      }
      var grid = { w: w, h: h, start: start, goal: goal, walls: walls, items: items, key: key, door: door, moves: [] };
      var sol = M.robotSolve(grid);
      if (!sol || sol.length < spec.min || sol.length > spec.max) continue;
      var kinds = {}; sol.forEach(function (m) { kinds[m] = 1; });
      if (step >= 2 && Object.keys(kinds).length < 2) continue;
      if (spec.key) {
        // the door must matter: with the door shut for good there is no way to the star
        var shut = { w: w, h: h, start: start, goal: goal, walls: walls.concat([door]), items: items, moves: [] };
        if (M.robotSolve(shut)) continue;
      }
      if (spec.items) {
        // the gems must matter: the shortest way without them is shorter
        var bare = { w: w, h: h, start: start, goal: goal, walls: walls, key: key, door: door, items: [], moves: [] };
        var plain = M.robotSolve(bare);
        if (plain && plain.length === sol.length && step >= 4) continue;
      }
      grid.moves = sol;
      return grid;
    }
    var fb = gridFromMoves(fallbackMoves(Math.min(6, Math.max(2, spec.min))));
    fb.items = []; fb.key = null; fb.door = null;
    return fb;
  }
  function makeRobot(opts) {
    var step = opts.step || 1;
    var grid = robotGrid(opts.rng, step);
    var best = grid.moves.length;
    var mode = step <= 2 ? "step" : "plan";
    var budget = step >= 5 ? best + (opts.rng() < 0.5 ? 0 : 2) : null;
    var gems = (grid.items || []).length;
    var gemWord = gems === 1 ? "the gem" : gems === 2 ? "both gems" : "all " + ["", "", "two", "three"][gems] + " gems";
    var prompt, say;
    if (mode === "step") {
      prompt = "Help the robot get the star! Press the arrows.";
      say = "Help the robot get the star!";
    } else if (!grid.key) {
      prompt = "Plan the arrows: get " + gemWord + ", then the star. Then press Go.";
      say = "Plan the arrows. Get " + gemWord + ", then the star. Then press Go.";
    } else {
      prompt = "Get the key to open the door. Get the gem and the star in " + budget + " moves or fewer.";
      say = "Get the key to open the door. Get the gem and the star in " + budget + " moves or fewer.";
      prompt += " Repeat ↻ makes a loop.";
    }
    var layout = function (list) { return (list || []).map(function (c) { return c.x + "." + c.y; }).join(","); };
    return {
      id: uid(),
      input: "sequence",
      reach: true,
      robot: { mode: mode, budget: budget, best: best, gems: gems },
      allowType: false,
      prompt: prompt,
      speakPrompt: say,
      board: { kind: "grid", grid: gridCopy(grid, true) },
      sequence: grid.moves.slice(),
      tray: [],
      grid: grid,
      choices: [],
      explain: {
        say: "One way: " + grid.moves.map(function (m) { return DIR_NAME[m]; }).join(", ") + ".",
        scene: "grid",
        grid: grid,
        moves: grid.moves.slice()
      },
      stem: "robot|" + step + "|" + grid.w + "x" + grid.h + "|" + layout([grid.start, grid.goal]) + "|" + layout(grid.walls) + "|" + layout(grid.items) + "|" + layout([grid.key, grid.door].filter(Boolean))
    };
  }
  M.ROBOT_SPEC = ROBOT_SPEC;

  function makeBuild(opts, len) {
    var grid = tightMaze(opts.rng, len);
    var tray = shuffle(opts.rng, grid.moves.map(function (dir, i) {
      return { id: "b" + i, dir: dir, label: DIR_NAME[dir] };
    }));
    return {
      id: uid(),
      input: "sequence",
      reach: true,
      allowType: false,
      prompt: "Press the arrow keys to move the square onto the star.",
      speakPrompt: "Press the arrow keys to move the square onto the star.",
      board: { kind: "grid", grid: gridCopy(grid, true) },
      sequence: grid.moves.slice(),
      tray: tray,
      grid: grid,
      choices: [],
      explain: {
        say: "Follow the open squares: " + grid.moves.map(function (m) { return DIR_NAME[m]; }).join(", ") + ".",
        scene: "grid",
        grid: grid,
        moves: grid.moves.slice()
      },
      stem: "maze|" + grid.moves.join("") + "|" + grid.w + "x" + grid.h
    };
  }

  function fixQuestion(opts, grid, idx, bad) {
    var correct = grid.moves[idx];
    var broken = grid.moves.slice();
    broken[idx] = bad;
    if (reaches(grid, broken) || !reaches(grid, grid.moves)) return null;
    var wrongDirs = ["R", "L", "U", "D"].filter(function (d) {
      if (d === correct) return false;
      var alt = grid.moves.slice();
      alt[idx] = d;
      return !reaches(grid, alt);
    });
    if (wrongDirs.length < 1) return null;
    var q = choiceQuestion({
      prompt: "The crossed-out arrow is wrong. Which arrow should replace it?",
      speakPrompt: "Which arrow should replace the wrong one?",
      board: {
        kind: "grid",
        grid: gridCopy(grid, true),
        bad: idx,
        program: broken.map(function (m) { return ARROW[m]; })
      },
      explain: {
        say: "Replace it with " + DIR_NAME[correct].toLowerCase() + ".",
        scene: "grid",
        grid: grid,
        moves: grid.moves.slice()
      },
      stem: "fix|" + grid.moves.join("") + "|" + idx + bad
    }, ARROW[correct], wrongDirs.map(function (d) { return ARROW[d]; }), opts.support, opts.rng);
    q.grid = grid;
    q.programs = {};
    q.programs[ARROW[correct]] = grid.moves.slice();
    wrongDirs.forEach(function (d) {
      var alt = grid.moves.slice();
      alt[idx] = d;
      q.programs[ARROW[d]] = alt;
    });
    return q;
  }

  function makeFix(opts, len) {
    var dirs = ["R", "L", "U", "D"];
    for (var attempt = 0; attempt < 12; attempt++) {
      var grid = tightMaze(opts.rng, len);
      var order = shuffle(opts.rng, grid.moves.map(function (_, i) { return i; }));
      for (var k = 0; k < order.length; k++) {
        var idx = order[k];
        var bads = shuffle(opts.rng, dirs.filter(function (d) { return d !== grid.moves[idx]; }));
        for (var b = 0; b < bads.length; b++) {
          var q = fixQuestion(opts, grid, idx, bads[b]);
          if (q) return q;
        }
      }
    }
    var fallback = gridFromMoves(fallbackMoves(len));
    return fixQuestion(opts, fallback, 0, fallback.moves[0] === "R" ? "L" : "R");
  }

  function straightGrid(dir, n) {
    var moves = [];
    for (var i = 0; i < n; i++) moves.push(dir);
    var grid;
    if (dir === "L") grid = { w: n + 2, h: 3, start: { x: n, y: 1 }, goal: { x: 0, y: 1 }, moves: moves, walls: [] };
    else if (dir === "U") grid = { w: 3, h: n + 2, start: { x: 1, y: n }, goal: { x: 1, y: 0 }, moves: moves, walls: [] };
    else if (dir === "D") grid = { w: 3, h: n + 2, start: { x: 1, y: 0 }, goal: { x: 1, y: n }, moves: moves, walls: [] };
    else grid = { w: n + 2, h: 3, start: { x: 0, y: 1 }, goal: { x: n, y: 1 }, moves: moves, walls: [] };
    return { grid: grid, moves: moves };
  }

  function makeRepeatQ(opts) {
    var rng = opts.rng;
    var minN = 2;
    var maxN = opts.step <= 2 ? 3 : opts.step <= 4 ? 4 : 5;
    var n = minN + Math.floor(rng() * (maxN - minN + 1));
    var dirs = shuffle(rng, ["R", "L", "U", "D"]);
    for (var d = 0; d < dirs.length; d++) {
      var dir = dirs[d];
      var built = straightGrid(dir, n);
      if (!reaches(built.grid, built.moves)) continue;
      var other = dir === "U" || dir === "D" ? "R" : "U";
      var options = [
        repeatMoves(dir, n),
        repeatMoves(dir, Math.max(1, n - 1)),
        repeatMoves(dir, n + 1),
        repeatMoves(other, n)
      ];
      var correct = arrows(options[0]);
      var wrongs = [];
      var programs = {};
      programs[correct] = options[0];
      var clash = false;
      options.forEach(function (moves) {
        var label = arrows(moves);
        if (label === correct) return;
        if (reaches(built.grid, moves)) clash = true;
        if (wrongs.indexOf(label) >= 0) return;
        wrongs.push(label);
        programs[label] = moves;
      });
      if (clash || wrongs.length < 1) continue;
      var q = choiceQuestion({
        prompt: "Which arrows reach the star?",
        speakPrompt: "Which arrows reach the star?",
        board: { kind: "grid", grid: gridCopy(built.grid, true) },
        explain: { say: DIR_NAME[dir] + ", " + n + " times, lands on the star.", scene: "grid", grid: built.grid, moves: built.moves },
        stem: "rep|" + dir + "|" + n
      }, correct, wrongs, opts.support, rng);
      q.grid = built.grid;
      q.programs = programs;
      q.sequence = built.moves.slice();
      return q;
    }
    var fallback = straightGrid("R", n);
    var qf = choiceQuestion({
      prompt: "Which arrows reach the star?",
      speakPrompt: "Which arrows reach the star?",
      board: { kind: "grid", grid: gridCopy(fallback.grid, true) },
      explain: { say: "Right, " + n + " times, lands on the star.", scene: "grid", grid: fallback.grid, moves: fallback.moves },
      stem: "rep|R|" + n
    }, arrows(repeatMoves("R", n)), [arrows(repeatMoves("R", n - 1)), arrows(repeatMoves("U", n))], opts.support, rng);
    qf.grid = fallback.grid;
    qf.programs = {};
    qf.programs[arrows(repeatMoves("R", n))] = repeatMoves("R", n);
    qf.programs[arrows(repeatMoves("R", n - 1))] = repeatMoves("R", n - 1);
    qf.programs[arrows(repeatMoves("U", n))] = repeatMoves("U", n);
    qf.sequence = fallback.moves.slice();
    return qf;
  }

  function makeRepeatPath(opts) {
    var rng = opts.rng;
    var bodies = [
      ["R", "U"], ["R", "D"], ["U", "R"], ["D", "R"],
      ["L", "U"], ["L", "D"], ["U", "L"], ["D", "L"],
      ["R", "R"], ["U", "U"], ["L", "L"], ["D", "D"]
    ];
    if (opts.step >= 4) bodies = bodies.concat([["R", "U", "R"], ["R", "D", "R"], ["U", "R", "U"], ["D", "R", "D"]]);
    var timesChoices = opts.step >= 4 ? [2, 3] : [2];
    var order = shuffle(rng, bodies);
    for (var i = 0; i < order.length; i++) {
      var body = order[i];
      var times = timesChoices[Math.floor(rng() * timesChoices.length)];
      var lists = [1, 2, 3, 4].map(function (n) { return timesMoves(body, n); });
      var grid = cropOpen(lists, times - 1);
      if (!grid || !reaches(grid, lists[times - 1])) continue;
      var correct = COUNT_WORD[times];
      var wrongs = [];
      var programs = {};
      programs[correct] = lists[times - 1];
      var clash = false;
      for (var n = 1; n <= 4; n++) {
        if (n === times) continue;
        if (reaches(grid, lists[n - 1])) clash = true;
        wrongs.push(COUNT_WORD[n]);
        programs[COUNT_WORD[n]] = lists[n - 1];
      }
      if (clash || wrongs.length < 1) continue;
      var q = choiceQuestion({
        prompt: "Repeat these arrows until the rover reaches the star. How many times?",
        speakPrompt: "How many times should the rover repeat these arrows?",
        board: { kind: "grid", grid: gridCopy(grid, true), program: body.map(function (m) { return ARROW[m]; }) },
        explain: { say: correct + " reaches the star.", scene: "grid", grid: grid, moves: lists[times - 1] },
        stem: "times|" + body.join("") + "|" + times
      }, correct, wrongs, opts.support, rng);
      q.grid = grid;
      q.programs = programs;
      q.sequence = lists[times - 1].slice();
      return q;
    }
    var body = ["R", "U"];
    var lists = [1, 2, 3, 4].map(function (n) { return timesMoves(body, n); });
    var grid = cropOpen(lists, 1);
    var qf = choiceQuestion({
      prompt: "Repeat these arrows until the rover reaches the star. How many times?",
      speakPrompt: "How many times should the rover repeat these arrows?",
      board: { kind: "grid", grid: gridCopy(grid, true), program: ["→", "↑"] },
      explain: { say: "Twice reaches the star.", scene: "grid", grid: grid, moves: lists[1] },
      stem: "times|RU|2"
    }, "Twice", ["Once", "Three times"], opts.support, rng);
    qf.grid = grid;
    qf.programs = { "Once": lists[0], "Twice": lists[1], "Three times": lists[2] };
    qf.sequence = lists[1].slice();
    return qf;
  }

  function makeRepMix(opts) {
    var rng = opts.rng;
    var pool = [
      ["R", "U"], ["R", "D"], ["U", "R"], ["D", "R"],
      ["L", "U"], ["U", "L"], ["R", "R"], ["U", "U"],
      ["D", "D"], ["L", "L"]
    ];
    var order = shuffle(rng, pool);
    for (var i = 0; i < order.length; i++) {
      var body = order[i];
      var correctMoves = timesMoves(body, 2);
      var correct = arrows(body);
      var wrongBodies = [];
      for (var j = 0; j < order.length; j++) {
        if (j === i) continue;
        var label = arrows(order[j]);
        if (label === correct) continue;
        var endMoves = timesMoves(order[j], 2);
        var goal = cellsOf(correctMoves);
        var other = cellsOf(endMoves);
        var g = goal[goal.length - 1];
        var o = other[other.length - 1];
        if (g.x === o.x && g.y === o.y) continue;
        if (wrongBodies.some(function (b) { return arrows(b) === label; })) continue;
        wrongBodies.push(order[j]);
        if (wrongBodies.length >= 3) break;
      }
      if (!wrongBodies.length) continue;
      var grid = cropOpen([correctMoves], 0);
      if (!grid || !reaches(grid, correctMoves)) continue;
      var wrongs = [];
      var programs = {};
      programs[correct] = correctMoves;
      for (var k = 0; k < wrongBodies.length; k++) {
        var trial = timesMoves(wrongBodies[k], 2);
        if (reaches(grid, trial)) continue;
        var wlabel = arrows(wrongBodies[k]);
        if (wrongs.indexOf(wlabel) >= 0) continue;
        wrongs.push(wlabel);
        programs[wlabel] = trial;
      }
      if (wrongs.length < 1) continue;
      var q = choiceQuestion({
        prompt: "Which arrows, done twice, reach the star?",
        speakPrompt: "Which arrows should be done twice?",
        board: { kind: "grid", grid: gridCopy(grid, true) },
        explain: { say: correct + ", done twice, lands on the star.", scene: "grid", grid: grid, moves: correctMoves },
        stem: "mix|" + body.join("")
      }, correct, wrongs, opts.support, rng);
      q.grid = grid;
      q.programs = programs;
      q.sequence = correctMoves.slice();
      return q;
    }
    var body = ["R", "U"];
    var lists = [timesMoves(body, 2), timesMoves(["R", "R"], 2)];
    var grid = cropOpen([lists[0]], 0);
    var qf = choiceQuestion({
      prompt: "Which arrows, done twice, reach the star?",
      speakPrompt: "Which arrows should be done twice?",
      board: { kind: "grid", grid: gridCopy(grid, true) },
      explain: { say: "Right then up, done twice, lands on the star.", scene: "grid", grid: grid, moves: lists[0] },
      stem: "mix|RU"
    }, "→ ↑", ["→ →"], opts.support, rng);
    qf.grid = grid;
    qf.programs = { "→ ↑": lists[0], "→ →": lists[1] };
    qf.sequence = lists[0].slice();
    return qf;
  }

  function makePredict(opts, len) {
    var rng = opts.rng;
    var size = len > 4 ? 6 : 5;
    for (var attempt = 0; attempt < 30; attempt++) {
      var carved = carve(rng, size, size, len);
      if (!carved.moves || carved.moves.length !== len) continue;
      var grid = openFromMoves(carved.moves, 1);
      if (!grid || !reaches(grid, carved.moves)) continue;
      var correct = arrows(carved.moves);
      var wrongs = [];
      var programs = {};
      var seen = {};
      programs[correct] = carved.moves.slice();
      seen[correct] = true;
      for (var i = 0; i < carved.moves.length && wrongs.length < 6; i++) {
        var dirs = ["R", "L", "U", "D"];
        for (var d = 0; d < dirs.length; d++) {
          if (dirs[d] === carved.moves[i]) continue;
          var alt = carved.moves.slice();
          alt[i] = dirs[d];
          var label = arrows(alt);
          if (seen[label]) continue;
          seen[label] = true;
          if (reaches(grid, alt)) continue;
          wrongs.push(label);
          programs[label] = alt;
          if (wrongs.length >= 6) break;
        }
      }
      if (wrongs.length < 1) continue;
      var q = choiceQuestion({
        prompt: "Which arrows reach the star?",
        speakPrompt: "Which arrows reach the star?",
        board: { kind: "grid", grid: gridCopy(grid, true) },
        explain: {
          say: "These arrows land on the star: " + carved.moves.map(function (m) { return DIR_NAME[m]; }).join(", ") + ".",
          scene: "grid",
          grid: grid,
          moves: carved.moves.slice()
        },
        stem: "which|" + carved.moves.join("")
      }, correct, wrongs, opts.support, rng);
      q.grid = grid;
      q.programs = programs;
      q.sequence = carved.moves.slice();
      return q;
    }
    var moves = fallbackMoves(len);
    var grid = openFromMoves(moves, 1);
    var alt = moves.slice();
    alt[alt.length - 1] = alt[alt.length - 1] === "R" ? "L" : "R";
    var qf = choiceQuestion({
      prompt: "Which arrows reach the star?",
      speakPrompt: "Which arrows reach the star?",
      board: { kind: "grid", grid: gridCopy(grid, true) },
      explain: { say: "Follow each arrow from the rover to the star.", scene: "grid", grid: grid, moves: moves },
      stem: "which|" + moves.join("")
    }, arrows(moves), [arrows(alt)], opts.support, rng);
    qf.grid = grid;
    qf.programs = {};
    qf.programs[arrows(moves)] = moves.slice();
    qf.programs[arrows(alt)] = alt;
    qf.sequence = moves.slice();
    return qf;
  }

  function makeFixCount(opts) {
    var rng = opts.rng;
    var dirs = shuffle(rng, ["R", "U", "L", "D"]);
    var hi = opts.step >= 4 ? 5 : 4;
    for (var d = 0; d < dirs.length; d++) {
      var dir = dirs[d];
      var n = 2 + Math.floor(rng() * (hi - 1));
      var built = straightGrid(dir, n);
      if (!reaches(built.grid, built.moves)) continue;
      var name = DIR_NAME[dir].toLowerCase();
      var q = numberQuestion({
        prompt: "How many times should the rover go " + name + "?",
        speakPrompt: "How many times should the rover go " + name + "?",
        board: { kind: "grid", grid: gridCopy(built.grid, true), program: [ARROW[dir]] },
        allowType: opts.step >= 4,
        explain: { say: "The star is " + n + " squares that way.", scene: "grid", grid: built.grid, moves: built.moves },
        stem: "count|" + dir + "|" + n
      }, n, opts.support, rng, 2);
      q.grid = built.grid;
      q.sequence = built.moves.slice();
      q.repeatDir = dir;
      var bad = false;
      q.choices.forEach(function (c) {
        var k = parseInt(c.label, 10);
        var hit = reaches(q.grid, repeatMoves(dir, k));
        if (c.id === q.correctChoiceId && !hit) bad = true;
        if (c.id !== q.correctChoiceId && hit) bad = true;
      });
      if (!bad) return q;
    }
    var built = straightGrid("R", 3);
    var qf = numberQuestion({
      prompt: "How many times should the rover go right?",
      speakPrompt: "How many times should the rover go right?",
      board: { kind: "grid", grid: gridCopy(built.grid, true), program: ["→"] },
      allowType: opts.step >= 4,
      explain: { say: "The star is 3 squares that way.", scene: "grid", grid: built.grid, moves: built.moves },
      stem: "count|R|3"
    }, 3, opts.support, rng, 2);
    qf.grid = built.grid;
    qf.sequence = built.moves.slice();
    qf.repeatDir = "R";
    return qf;
  }

  function buildBlocked(rng) {
    var attempt;
    for (attempt = 0; attempt < 16; attempt++) {
      var y = 1 + Math.floor(rng() * 2);
      var goalX = 2 + Math.floor(rng() * 3);
      var wallX = 1 + Math.floor(rng() * (goalX - 1));
      var up = rng() < 0.5;
      var rise = 1;
      if (up && y >= 2 && rng() < 0.5) rise = 2;
      if (!up && y <= 1 && rng() < 0.5) rise = 2;
      var ny = y + (up ? -rise : rise);
      if (ny < 0 || ny > 3) continue;
      var moves = [];
      var r;
      for (r = 0; r < rise; r++) moves.push(up ? "U" : "D");
      for (r = 0; r < goalX; r++) moves.push("R");
      for (r = 0; r < rise; r++) moves.push(up ? "D" : "U");
      var grid = {
        w: goalX + 2,
        h: 4,
        start: { x: 0, y: y },
        goal: { x: goalX, y: y },
        walls: [{ x: wallX, y: y }],
        moves: moves
      };
      var end = M.runMoves(grid, moves);
      if (end.bumped || end.x !== goalX || end.y !== y || end.trail.length !== moves.length + 1) continue;
      var straight = [];
      for (r = 0; r < goalX; r++) straight.push("R");
      if (!M.runMoves(grid, straight).bumped) continue;
      var correct = arrows(moves);
      var wrong = [
        { label: arrows(straight), moves: straight },
        { label: up ? "↑ ↑" : "↓ ↓", moves: up ? ["U", "U"] : ["D", "D"] },
        { label: "← ←", moves: ["L", "L"] }
      ];
      return { grid: grid, moves: moves, correct: correct, wrong: wrong, stem: moves.join("") + "|w" + wallX + "y" + y };
    }
    var fallbackMoves = ["U", "R", "R", "D"];
    return {
      grid: { w: 4, h: 4, start: { x: 0, y: 1 }, goal: { x: 2, y: 1 }, walls: [{ x: 1, y: 1 }], moves: fallbackMoves },
      moves: fallbackMoves,
      correct: "↑ → → ↓",
      wrong: [
        { label: "→ →", moves: ["R", "R"] },
        { label: "↑ ↑", moves: ["U", "U"] },
        { label: "← ←", moves: ["L", "L"] }
      ],
      stem: "URRD|w1y1"
    };
  }

  function makeIfBlocked(opts) {
    for (var attempt = 0; attempt < 8; attempt++) {
      var item = buildBlocked(opts.rng);
      if (!reaches(item.grid, item.moves)) continue;
      var wrongs = [];
      var programs = {};
      programs[item.correct] = item.moves.slice();
      var ok = true;
      item.wrong.forEach(function (w) {
        if (w.label === item.correct) return;
        if (reaches(item.grid, w.moves)) ok = false;
        if (wrongs.indexOf(w.label) >= 0) return;
        wrongs.push(w.label);
        programs[w.label] = w.moves;
      });
      if (!ok || wrongs.length < 1) continue;
      var q = choiceQuestion({
        prompt: "A wall blocks the straight path. Which arrows go around it to the star?",
        speakPrompt: "Which arrows go around the wall?",
        board: { kind: "grid", grid: gridCopy(item.grid, true) },
        explain: { say: "Go around the wall, then back to the star.", scene: "grid", grid: item.grid, moves: item.moves.slice() },
        stem: "wall|" + item.stem
      }, item.correct, wrongs, opts.support, opts.rng);
      q.grid = item.grid;
      q.programs = programs;
      q.sequence = item.moves.slice();
      return q;
    }
    var moves = ["U", "R", "R", "D"];
    var grid = { w: 4, h: 4, start: { x: 0, y: 1 }, goal: { x: 2, y: 1 }, walls: [{ x: 1, y: 1 }], moves: moves };
    var qf = choiceQuestion({
      prompt: "A wall blocks the straight path. Which arrows go around it to the star?",
      speakPrompt: "Which arrows go around the wall?",
      board: { kind: "grid", grid: gridCopy(grid, true) },
      explain: { say: "Go around the wall, then back to the star.", scene: "grid", grid: grid, moves: moves },
      stem: "wall|URRD|w1y1"
    }, "↑ → → ↓", ["→ →", "← ←"], opts.support, opts.rng);
    qf.grid = grid;
    qf.programs = { "↑ → → ↓": moves, "→ →": ["R", "R"], "← ←": ["L", "L"] };
    qf.sequence = moves.slice();
    return qf;
  }

  // Beginner reading word items show the key word big on the board and read it aloud ("see it, hear it,
  // pick it"). Returns { key, prompt } for find-the-word, rhyme, letter and same-sound items, else null.
  M.beginnerKeyWord = function (item) {
    if (!item || item.subject !== "reading" || item.level !== "beginner" || item.passage) return null;
    var m = /^Find the word:\s*(.+?)\.?$/.exec(item.prompt);
    if (m) return { key: m[1], prompt: "Match:", say: "Find this word." };
    m = /rhymes? with (\w+)/i.exec(item.prompt) || /same sound as (\w+)/i.exec(item.prompt) || /the letter ([A-Za-z])\b/.exec(item.prompt);
    if (m) return { key: m[1], prompt: item.prompt };
    return null;
  };

  function makeBank(opts) {
    var subject = opts.subject;
    if (!subject) {
      Object.keys(M.BANK_SKILLS || {}).forEach(function (id) { if (M.BANK_SKILLS[id] === opts.skillId) subject = id; });
    }
    if (!subject && M.isTopicSkill && M.isTopicSkill("physics", opts.skillId)) subject = "physics";
    if (!subject && M.isTopicSkill && M.isTopicSkill("science", opts.skillId)) subject = "science";
    // The bank is one pool per subject, sorted by level; the step picks the level
    // (Beginner = steps 1-2, Intermediate = 3-4, Expert = 5), not the age band.
    var item = opts.bankItem || (M.bankPick ? M.bankPick(subject, opts.skillId, opts.step, opts.rng, opts.profile || null) : null);
    if (!item) throw new Error("No bank questions for " + subject + " " + opts.skillId + " step " + opts.step);
    var number = item.answerKind === "number";
    var wrong = item.choices.filter(function (c) { return c !== item.answer; });
    var board;
    if (item.passage) board = { kind: "fable", title: item.title || "", text: item.passage, scene: item.scene || "" };
    else if (item.picture) board = { kind: "sumdots", a: item.picture.a, b: item.picture.b, op: item.picture.op, thing: item.picture.thing };
    else if (item.scene) board = { kind: "scene", scene: item.scene, focus: "" };
    else board = { kind: "bank" };
    var seen = M.beginnerKeyWord(item);
    if (seen) board = { kind: "seeword", word: seen.key };
    var q = choiceQuestion({
      prompt: seen ? seen.prompt : item.prompt,
      speakPrompt: seen ? seen.say || seen.prompt : item.prompt,
      board: board,
      explain: { say: item.explanation || ("The answer is " + item.answer + "."), scene: "idea" },
      stem: "bank|" + item.id,
      bankId: item.id,
      credit: item.credit,
      source: item.source,
      sourceUrl: item.sourceUrl,
      license: item.license,
      readChoices: !!item.readChoices,
      level: item.level,
      sound: seen ? (item.say ? { kind: "prompt", speak: seen.key, carrier: item.say } : { kind: "prompt", speak: seen.key }) :
        (item.passage && item.level === "beginner" ? { kind: "story", speak: item.passage } : null)
    }, item.answer, wrong, opts.support, opts.rng);
    if (number) {
      q.answerKind = "number";
      q.allowType = opts.step >= 4;
    } else {
      q.answerKind = "word";
      q.allowType = false;
    }
    q.typedAnswer = item.answer;
    // Topic items carry a short fact, shown as "Did you know?" after the right answer.
    if (item.didYouKnow && item.explanation) q.didYouKnow = item.explanation;
    if (item.whyLabel) q.whyLabel = item.whyLabel;
    // v28: Beginner living / nonliving bank questions show every choice on a labeled card.
    if (item.subject === "science" && item.level === "beginner" && /\b(living|alive)\b/i.test(item.prompt) && M.livingBoard) M.livingBoard(q);
    if (item.factRef) q.factRef = item.factRef;
    if (item.skill === "sightwords") { q.sightWord = item.answer; q.sightId = item.id; }
    if (item.skill === "wordmatch") { q.matchWord = item.answer; q.matchId = item.id; }
    if (M.bankPoolKey && item.id) { q.cyclePool = M.bankPoolKey(item); q.cycleId = item.skill === "sightwords" || item.skill === "wordmatch" ? item.answer : item.id; }
    return q;
  }

  var MAKERS = {
    add: makeAdd,
    sub: makeSub,
    mul: makeMul,
    div: makeDiv,
    count: makeCount,
    add5: function (o) { return arithmetic(o, { max: [5, 5, 10, 10, 12], ops: ["+"], picturesUntil: 2 }); },
    sub5: function (o) { return arithmetic(o, { max: [5, 5, 10, 10, 12], ops: ["-"], picturesUntil: 2 }); },
    shapes: makeShapes,
    mathmix: function (o) { return M.makeMathMix(o, choiceQuestion); },   // v30 Math mix (js/math_mix.js)
    astro: makeBank,
    astrospace: makeSpace,
    within20: function (o) { return arithmetic(o, { max: [10, 12, 20, 20, 20], ops: ["+", "-"], picturesUntil: 1 }); },
    place: makePlace,
    within100: makeWithin100,
    skip: makeSkip,
    times: makeTimes,
    bigadd: makeBig,
    fractions: makeFractions,
    area: makeArea,
    sounds: function (o) { return o.tier ? ladderQuestion(o, FIRST_WORDS) : flashCard(o, FIRST_WORDS); },
    names: function (o) { return o.tier ? ladderQuestion(o, SIMPLE_WORDS) : flashCard(o, SIMPLE_WORDS); },
    cvc: function (o) { return o.tier ? ladderQuestion(o, CVC_WORDS) : flashCard(o, CVC_WORDS); },
    sight: function (o) { return o.tier ? ladderQuestion(o, SIGHT) : flashCard(o, SIGHT); },
    digraphs: function (o) { return o.tier ? ladderQuestion(o, DIGRAPHS) : flashCard(o, DIGRAPHS); },
    silente: function (o) { return o.tier ? ladderQuestion(o, SILENT) : flashCard(o, SILENT); },
    sentence: function (o) { return flashCard(o, SHORT_LINES); },
    sight2: function (o) { return o.tier ? ladderQuestion(o, SIGHT2) : flashCard(o, SIGHT2); },
    multi: function (o) { return o.tier ? ladderQuestion(o, MULTI) : flashCard(o, MULTI); },
    mainidea: function (o) { return flashCard(o, LONGER_LINES); },
    prefix: function (o) { return o.tier ? ladderQuestion(o, PREFIX_WORDS) : flashCard(o, PREFIX_WORDS); },
    whyq: function (o) { return flashCard(o, STORY_LINES); },
    living: makeLiving,
    needs: makeNeeds,
    weather: makeWeather,
    materials: makeMaterials,
    habitat: makeHabitat,
    cycle: makeCycle,
    matter: makeMatter,
    bridge: makeBridge,
    food: makeFood,
    mixture: makeMixture,
    water: makeWater,
    fairtest: makeFair,
    space: makeSpace,
    push: makePush,
    speed: makeSpeed,
    balance: makeBalance,
    float: makeFloat,
    friction: makeFriction,
    ramp: makeRamp,
    magnet: makeMagnet,
    drop: makeDrop,
    balanceforce: makeForces,
    trips: makeTrips,
    light: makeLight,
    pulley: makePulley
  };

  MAKERS.sequence = function (o) { return makeBuild(o, [2, 2, 3, 3, 4][o.step - 1]); };
  // v25: "Missing step" (fill in the hole) was removed; the arrow robot puzzles took its place.
  MAKERS.robot = makeRobot;
  MAKERS.repeat = makeRepeatQ;
  MAKERS.predict = function (o) { return makePredict(o, [2, 2, 3, 3, 4][o.step - 1]); };
  MAKERS.longer = function (o) { return makeBuild(o, [3, 4, 4, 5, 6][o.step - 1]); };
  MAKERS.repeatpath = makeRepeatPath;
  MAKERS.predict2 = function (o) { return makePredict(o, [3, 4, 4, 5, 5][o.step - 1]); };
  MAKERS.fixone = function (o) { return makeFix(o, [3, 4, 4, 5, 6][o.step - 1]); };
  MAKERS.repmix = makeRepMix;
  MAKERS.ifblocked = makeIfBlocked;
  MAKERS.predict3 = function (o) { return makePredict(o, [4, 5, 5, 6, 7][o.step - 1]); };
  MAKERS.fixcount = makeFixCount;
  MAKERS.word = makeBank;
  MAKERS.story = makeBank;
  MAKERS.facts = makeBank;
  MAKERS.physfacts = makeBank;
  MAKERS.sightwords = makeBank;
  MAKERS.wordmatch = makeBank;

  function isName(part) {
    return part === "Sam" || part === "Max" || part === "Jo" || part === "Luz" || part === "Ned" || part === "Rio" || part === "Ana" || part === "Kai" || part === "Noa" || part === "Ivy";
  }

  function nearOf(q) {
    if (q.near) return q.near;
    var bits = String(q.stem || "").split("|");
    var head = bits[0] || "";
    if (head === "+" || head === "x" || head === "×") {
      var a = Number(bits[1]);
      var b = Number(bits[2]);
      if (a > b) { var swap = a; a = b; b = swap; }
      return "fact|" + head + "|" + a + "|" + b;
    }
    if (head === "-" || head === "÷") return "fact|" + head + "|" + bits[1] + "|" + bits[2];
    if (head === "flash") return "flash|" + bits.slice(1).join("|");
    if (head === "pace" || head === "meters") {
      var nums = bits.filter(function (part) { return /^\d+$/.test(part); });
      return head + "|" + nums.join("|");
    }
    var rest = bits.slice(1).filter(function (part) { return !isName(part); });
    return head + "|" + rest.join("|");
  }

  function lookOf(q) {
    if (q.look) return q.look;
    var board = q.board || {};
    if (board.thing) return "thing|" + board.thing;
    if (board.kind === "flash") return "word|" + String(board.word || "").toLowerCase();
    if (q.sequence && q.sequence.length) return "path|" + q.sequence.join("");
    if (board.kind === "scene") {
      var bits = String(q.stem || "").split("|").filter(function (part) {
        return !isName(part) && !/^\d+$/.test(part);
      });
      if (bits.length > 1) return "noun|" + bits[bits.length - 1];
    }
    return "";
  }

  function questionKey(q) {
    if (q.stem) return q.skillId + "|" + q.step + "|" + q.stem;
    var b = q.board || {};
    var mark = (q.prompt || "") + ">" + (q.typedAnswer || "");
    if (b.kind === "dots") mark += "#" + b.n;
    else if (b.kind === "sumdots") mark += "#" + b.a + (b.op || "") + b.b;
    else if (b.kind === "groups") mark += "#" + b.groups + "x" + b.each;
    else if (b.kind === "shape") mark += "#" + (b.shape || "");
    else if (b.kind === "pie") mark += "#" + (b.fraction || "");
    else if (b.kind === "pies") mark += "#" + (b.left || "") + ">" + (b.right || "");
    else if (b.kind === "rect") mark += "#" + b.w + "x" + b.h;
    else if (b.kind === "place") mark += "#" + b.n;
    else if (b.kind === "readword") mark += "#" + (b.word || "");
    else if (b.kind === "listen") mark += "#" + ((q.sound && q.sound.speak) || "");
    else if (b.kind === "sentence" || b.kind === "passage") mark += "#" + (b.text || "");
    else if (b.kind === "scene") mark += "#" + (b.scene || "");
    if (q.sequence && q.sequence.length) mark += "#seq" + q.sequence.join("");
    if (q.cell) mark += "#cell" + q.cell.x + "," + q.cell.y;
    return q.skillId + "|" + q.step + "|" + mark;
  }

  M.makeQuestion = function (opts) {
    var rng = opts.rng || rngFactory(opts.seed);
    var step = Math.max(1, Math.min(5, opts.step || 1));
    var avoid = opts.avoid || [];
    var block = opts.block || [];
    var last = block.length ? block[block.length - 1] : null;
    var packed = {
      rng: rng,
      step: step,
      support: !!opts.support,
      subject: opts.subject,
      skillId: opts.skillId,
      role: opts.role || "work",
      band: opts.band || "7-8",
      block: block,
      style: opts.style || "",
      bankItem: opts.bankItem || null,
      tier: opts.tier || 0,
      soundOff: !!opts.soundOff,
      ladderText: opts.ladderText || "",
      ladderFormat: opts.ladderFormat || "",
      seeWord: !!opts.seeWord,
      sightItem: opts.sightItem || null,
      shapeKind: opts.shapeKind || "",
      shapeId: opts.shapeId || "",
      mixTemplate: opts.mixTemplate || "",
      profile: opts.profile || null
    };
    var fn = MAKERS[opts.skillId];
    if (!fn && M.isTopicSkill && M.isTopicSkill(opts.subject || "physics", opts.skillId)) fn = makeBank;
    if (!fn) throw new Error("No questions for " + opts.skillId);
    var q = null;
    var best = null;
    var bestScore = 999;
    var tries = 0;
    var prof = opts.profile || null;
    var genKey = "gen|" + (opts.subject || "") + "|" + opts.skillId + "|" + step;
    function commit(x) {
      if (!prof || !M.cycleMark) return x;
      if (x.cyclePool) M.cycleMark(prof, x.cyclePool, x.cycleId);
      else if (x.sightWord) M.cycleMark(prof, "list|reading|sightwords", x.sightWord);
      else M.cycleMark(prof, genKey, x.key);
      return x;
    }
    do {
      q = fn(packed);
      q.subject = opts.subject;
      q.skillId = opts.skillId;
      q.step = step;
      q.role = packed.role;
      q.support = !!opts.support;
      if (!q.explain) q.explain = { say: "Here is the answer.", scene: "idea" };
      q.key = questionKey(q);
      q.near = nearOf(q);
      q.look = lookOf(q);
      // v24: generated questions also count as "same" when shown already this cycle (bank items are
      // already picked from the unseen ones).
      var genSeen = !!(prof && !q.cyclePool && M.cycleSeen(prof, genKey, q.key));
      var same = avoid.indexOf(q.key) >= 0 || genSeen;
      var similar = !!(last && (q.near === last.near || (q.look && last.look && q.look === last.look)));
      var score = (similar ? 50 : 0) + (same ? 5 : 0) + (genSeen ? 5 : 0);
      if (score < bestScore) { best = q; bestScore = score; }
      tries++;
      if (!same && !similar) return commit(q);
    } while (tries < 48);
    // 48 draws in a row gave only seen questions: this generated pool is used up, so a new cycle starts.
    if (prof && !best.cyclePool && M.cycleSeen(prof, genKey, best.key)) {
      M.cycleRestart(M.cyclePool(prof, genKey));
    }
    return commit(best);
  };

  M.planSet = function (rng) {
    var roles = ["work", "work", "work", "work", "work", "work", "work", "review", "review", "stretch"];
    roles = shuffle(rng || rngFactory(), roles);
    if (roles[0] !== "work") {
      var i = roles.indexOf("work");
      roles[i] = roles[0];
      roles[0] = "work";
    }
    return roles;
  };

  M.noticeLine = function (notice) {
    if (notice === "harder") return "These get a little harder.";
    if (notice === "easier") return "Let's try a smaller step.";
    if (notice === "support") return "Extra pictures and fewer buttons are on.";
    if (notice === "ready") return "You have the hang of this step.";
    return "";
  };
})(window.Merit = window.Merit || {});
