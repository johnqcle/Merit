(function (M) {
  "use strict";
  // v30 Math mix (Beginner): template-based generated questions. Every question is made from a template and
  // random numbers, so there is endless variety and nothing to store. Each variant has a stable signature
  // (q.stem = "mix|<template>|<numbers>") that the v24 no-repeat cycle uses. 3 choices, one right answer,
  // a generated "Here's why", read aloud (Play), and a cute 3D-look picture (scene "m-...", drawn below).
  var TEMPLATES = ["count", "nearby", "compare", "add", "sub", "doubles", "make10", "skip", "ordinal", "pattern",
    "time", "coins", "length", "weight", "halves", "evenodd"];
  M.MATH_MIX_TEMPLATES = TEMPLATES;
  M.MATH_MIX_SKILL = { id: "mathmix", title: "Math mix", line: "Counting, time, coins and more" };

  var NAMES = [["Sam", "he"], ["Jo", "she"], ["Ana", "she"], ["Max", "he"], ["Luz", "she"], ["Ned", "he"], ["Kai", "he"],
    ["Noa", "she"], ["Ivy", "she"], ["Rio", "he"], ["Mia", "she"], ["Ben", "he"]];
  var OBJ = [["apple", "apples"], ["star", "stars"], ["ball", "balls"], ["block", "blocks"], ["flower", "flowers"], ["fish", "fish"],
    ["leaf", "leaves"], ["cup", "cups"], ["crayon", "crayons"], ["heart", "hearts"], ["card", "cards"]];
  var ORD = ["first", "second", "third", "fourth", "fifth"];
  var RACERS = ["dog", "cat", "pig", "duck", "frog", "rabbit", "bear", "lion", "cow", "sheep", "turtle", "monkey"];
  var COIN = { p: ["penny", 1], n: ["nickel", 5], d: ["dime", 10], q: ["quarter", 25] };
  var RIBBON = [["red", "#e8453c"], ["blue", "#3d7de8"], ["green", "#3bb36a"], ["yellow", "#f2c12e"], ["purple", "#9a5ae0"], ["orange", "#f08a2c"]];
  // Heavier first. Every pair is a clear real-world difference.
  var HEAVY = [["elephant", "rabbit"], ["car", "ball"], ["rock", "balloon"], ["cow", "chick"], ["horse", "cat"], ["bear", "bee"],
    ["chair", "pencil"], ["brick", "cottonball"], ["whale", "fish"], ["pig", "duckling"], ["book", "balloon"], ["lion", "snail"]];

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, a) { return a[Math.floor(rng() * a.length)]; }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function cents(n) { return n + (n === 1 ? " cent" : " cents"); }
  function hourOf(h) { return ((h - 1 + 12) % 12) + 1; }
  function clockLabel(h, m) { return m === 30 ? "Half past " + h : h + " o'clock"; }
  // Two wrong numbers near the answer (never the answer, never below lo, no repeats).
  function near(rng, ans, lo, extra) {
    var c = (extra || []).filter(function (x) { return x !== ans && x >= lo; });
    shuffle(rng, [1, -1, 2, -2, 3]).forEach(function (d) { if (ans + d >= lo) c.push(ans + d); });
    var out = [];
    c.forEach(function (x) { if (out.length < 2 && x !== ans && out.indexOf(x) < 0) out.push(x); });
    return out;
  }
  function seqSay(list) { return list.map(function (x) { return x === "?" ? "what" : String(x); }).join(", "); }

  // ----- the templates: each returns [signature, prompt, scene, right answer, [2 wrong answers], why, speakPrompt?] -----
  var T = {};
  T.count = function (rng, step) {
    var o = pick(rng, OBJ), n = step === 1 ? ri(rng, 2, 10) : ri(rng, 8, 20);
    return [o[0] + n, "How many " + o[1] + " are there?", "m-count:" + o[0] + ":" + n, n, near(rng, n, 1),
      "Touch and count each one once: 1, 2, 3, and on up to " + n + ". There are " + n + " " + o[1] + "."];
  };
  T.nearby = function (rng, step) {
    var top = step === 1 ? 10 : 20, form = ri(rng, 0, 2), n;
    if (form === 0) {
      n = ri(rng, step === 1 ? 1 : 9, top - 1);
      return ["after" + n, "What number comes just after " + n + "?", "m-tiles:" + n + ",?", n + 1, near(rng, n + 1, 0, [n - 1, n + 2]),
        "Just after means one more. When you count, " + (n + 1) + " comes right after " + n + "."];
    }
    if (form === 1) {
      n = ri(rng, step === 1 ? 2 : 10, top);
      return ["before" + n, "What number comes just before " + n + "?", "m-tiles:?," + n, n - 1, near(rng, n - 1, 0, [n + 1, n - 2]),
        "Just before means one less. When you count, " + (n - 1) + " comes right before " + n + "."];
    }
    n = ri(rng, step === 1 ? 1 : 9, top - 1);
    return ["between" + n, "What number is between " + (n - 1) + " and " + (n + 1) + "?", "m-tiles:" + (n - 1) + ",?," + (n + 1), n, near(rng, n, 0, [n + 2, n - 2]),
      "Count " + (n - 1) + ", " + n + ", " + (n + 1) + ". The number in the middle is " + n + "."];
  };
  T.compare = function (rng, step) {
    var top = step === 1 ? 10 : 20;
    if (rng() < 0.5) {
      var nums = shuffle(rng, Array.apply(null, Array(top)).map(function (x, i) { return i + 1; })).slice(0, 3);
      var big = rng() < 0.5, ans = big ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      var sorted = nums.slice().sort(function (a, b) { return a - b; });
      return [(big ? "big" : "small") + sorted.join("-"), "Which number is the " + (big ? "biggest" : "smallest") + "?", "m-tiles:" + nums.join(","), ans,
        nums.filter(function (x) { return x !== ans; }),
        ans + " is the " + (big ? "biggest" : "smallest") + ". When you count " + sorted.join(", ") + ", " + ans + " comes " + (big ? "last" : "first") + "."];
    }
    var two = shuffle(rng, OBJ.filter(function (o) { return o[0] !== "fish"; })).slice(0, 2), a = ri(rng, 2, 10), b = ri(rng, 2, 10);
    if (rng() < 0.15) b = a;
    var more = rng() < 0.5, word = more ? "more" : "fewer";
    var right = a === b ? "They are the same" : (more ? a > b : a < b) ? "The " + two[0][1] : "The " + two[1][1];
    var why = a === b ? "There are " + a + " " + two[0][1] + " and " + b + " " + two[1][1] + ". Each one has a partner, so they are the same." :
      "There are " + a + " " + two[0][1] + " and " + b + " " + two[1][1] + ". " + Math.max(a, b) + " is more than " + Math.min(a, b) + ".";
    return ["groups" + word + two[0][0] + a + two[1][0] + b, "Which group has " + word + "?", "m-two:" + two[0][0] + ":" + a + ":" + two[1][0] + ":" + b, right,
      ["The " + two[0][1], "The " + two[1][1], "They are the same"].filter(function (x) { return x !== right; }), why];
  };
  function who(rng) { var n = pick(rng, NAMES); return { name: n[0], he: n[1], He: cap(n[1]), his: n[1] === "he" ? "his" : "her" }; }
  T.add = function (rng, step) {
    var a, b;
    if (step === 1) { a = ri(rng, 2, 8); b = ri(rng, 1, 10 - a); } else { a = ri(rng, 5, 15); b = ri(rng, Math.max(1, 11 - a), Math.min(9, 20 - a)); }
    var o = pick(rng, OBJ), p = who(rng), f = ri(rng, 0, 3), s = a + b, pr;
    if (f === 0) pr = p.name + " has " + a + " " + o[1] + ". " + p.He + " gets " + b + " more. How many " + o[1] + " does " + p.he + " have now?";
    else if (f === 1) pr = p.name + " sees " + a + " " + o[1] + ", then " + b + " more. How many " + o[1] + " in all?";
    else if (f === 2) pr = "There are " + a + " " + o[1] + " in a box. " + p.name + " puts in " + b + " more. How many are in the box now?";
    else pr = p.name + " has " + a + " " + o[1] + " and " + p.his + " friend has " + b + ". How many " + o[1] + " do they have together?";
    return [f + p.name + o[0] + a + "+" + b, pr, "m-story:" + o[0] + ":" + a + ":+:" + b, s, near(rng, s, 0),
      "Put them together: " + a + " and " + b + " more make " + s + ". " + a + " + " + b + " = " + s + "."];
  };
  T.sub = function (rng, step) {
    var a, b;
    if (step === 1) { a = ri(rng, 3, 10); b = ri(rng, 1, a - 1); } else { a = ri(rng, 11, 20); b = ri(rng, 1, Math.min(10, a - 1)); }
    var o = pick(rng, OBJ), p = who(rng), f = ri(rng, 0, 3), d = a - b, pr;
    if (f === 0) pr = p.name + " has " + a + " " + o[1] + ". " + p.He + " gives " + b + " to a friend. How many " + o[1] + " are left?";
    else if (f === 1) pr = "There are " + a + " " + o[1] + " on the table. " + p.name + " takes " + b + " away. How many are left?";
    else if (f === 2) pr = p.name + " had " + a + " " + o[1] + " and lost " + b + ". How many " + o[1] + " does " + p.he + " have now?";
    else pr = p.name + " made " + a + " " + o[1] + " and gave away " + b + ". How many are left?";
    return [f + p.name + o[0] + a + "-" + b, pr, "m-story:" + o[0] + ":" + a + ":-:" + b, d, near(rng, d, 0, [a + b > 20 ? d + 2 : a + b]),
      "Start with " + a + " and take away " + b + ". " + a + " - " + b + " = " + d + ", so " + d + " are left."];
  };
  T.doubles = function (rng, step) {
    var n = step === 1 ? ri(rng, 1, 5) : ri(rng, 4, 10), o = pick(rng, OBJ), f = ri(rng, 0, 2), d = 2 * n, pr, sp;
    if (f === 0) pr = "What is " + n + " + " + n + "?";
    else if (f === 1) pr = "What is double " + n + "?";
    else { var p = who(rng); pr = p.name + " has " + n + " " + (n === 1 ? o[0] : o[1]) + " in each hand. How many " + o[1] + " is that?"; }
    return [f + o[0] + n, pr, "m-story:" + o[0] + ":" + n + ":+:" + n, d, near(rng, d, 1, [d + 2, d - 2, n + 1]),
      "Double " + n + " means " + n + " and " + n + " more. " + n + " + " + n + " = " + d + "."];
  };
  T.make10 = function (rng, step) {
    var a = ri(rng, 1, 9), ans = 10 - a, f = step === 1 ? 0 : ri(rng, 0, 1), pr;
    if (f === 0) pr = a + " and what number make 10?";
    else { var p = who(rng); pr = p.name + " has " + a + " " + (a === 1 ? "sticker" : "stickers") + ". How many more does " + p.he + " need to have 10?"; }
    return [f + "a" + a, pr, "m-frame:" + a + ":0", ans, near(rng, ans, 0),
      "Count the empty boxes in the ten frame: there are " + ans + ". " + a + " + " + ans + " = 10."];
  };
  T.skip = function (rng, step) {
    var by = step === 1 ? pick(rng, [2, 10]) : pick(rng, [2, 5, 10]);
    var startMax = step === 1 ? (by === 2 ? 6 : 4) : (by === 2 ? 12 : by === 5 ? 6 : 6);
    var k0 = ri(rng, 1, startMax), list = [0, 1, 2, 3, 4].map(function (i) { return (k0 + i) * by; });
    var miss = step === 1 ? 4 : ri(rng, 2, 4), ans = list[miss];
    var shown = list.map(function (x, i) { return i === miss ? "?" : x; });
    var nm = by === 2 ? "twos" : by === 5 ? "fives" : "tens";
    var pr = "Count by " + nm + ". What number is missing?";
    return [by + "-" + k0 + "-" + miss, pr, "m-tiles:" + shown.join(","), ans, near(rng, ans, 1, [ans + 1, ans + by, ans - 1]),
      "Counting by " + nm + " adds " + by + " each time: " + list.join(", ") + ".", "Count by " + nm + ". " + seqSay(shown) + ". What number is missing?"];
  };
  T.ordinal = function (rng, step) {
    var line = shuffle(rng, RACERS).slice(0, 5), k = step === 1 ? ri(rng, 0, 2) : ri(rng, 0, 4), form = ri(rng, 0, 1), sc = "m-race:" + line.join(",");
    if (form === 0) {
      var wrong = [k - 1, k + 1, k + 2, k - 2].filter(function (i) { return i >= 0 && i < 5; }).slice(0, 2).map(function (i) { return "The " + line[i]; });
      return ["who" + line.join("") + k, "Which animal is " + ORD[k] + " in line? Start counting at the flag.", sc, "The " + line[k], wrong,
        "Start at the flag and count: " + line.slice(0, k + 1).map(function (x, i) { return ORD[i] + " the " + x; }).join(", ") + "."];
    }
    var wr = [k - 1, k + 1, k + 2, k - 2].filter(function (i) { return i >= 0 && i < 5; }).slice(0, 2).map(function (i) { return cap(ORD[i]); });
    return ["place" + line.join("") + k, "What place is the " + line[k] + " in? Start counting at the flag.", sc, cap(ORD[k]), wr,
      "Count from the flag: " + line.slice(0, k + 1).map(function (x, i) { return ORD[i] + " the " + x; }).join(", ") + ". The " + line[k] + " is " + ORD[k] + "."];
  };
  T.pattern = function (rng, step) {
    var kind = step === 1 ? pick(rng, ["ab", "up", "down"]) : pick(rng, ["ab", "abc", "pairs", "up2", "down", "up"]);
    var list, why, a = ri(rng, 1, 5), b = ri(rng, 1, 9), c;
    if (kind === "ab") { while (b === a) b = ri(rng, 1, 9); list = [a, b, a, b, a, b]; why = "The pattern is " + a + ", " + b + ", then it starts again. After " + a + " comes " + b + "."; }
    else if (kind === "abc") { b = a + 1; c = a + 2; list = [a, b, c, a, b, c]; why = "The pattern " + a + ", " + b + ", " + c + " repeats. After " + b + " comes " + c + "."; }
    else if (kind === "pairs") { list = [a, a, a + 1, a + 1, a + 2, a + 2]; why = "Each number comes two times, then the next number. " + (a + 2) + " comes two times."; }
    else if (kind === "up2") { a = ri(rng, 1, 6); list = [a, a + 2, a + 4, a + 6, a + 8]; why = "Each number is 2 more than the one before. " + (a + 6) + " + 2 = " + (a + 8) + "."; }
    else if (kind === "down") { a = ri(rng, 6, step === 1 ? 10 : 20); list = [a, a - 1, a - 2, a - 3, a - 4]; why = "The numbers count back by one. One less than " + (a - 3) + " is " + (a - 4) + "."; }
    else { a = ri(rng, 1, step === 1 ? 6 : 15); list = [a, a + 1, a + 2, a + 3, a + 4]; why = "The numbers count up by one. One more than " + (a + 3) + " is " + (a + 4) + "."; }
    var ans = list[list.length - 1], shown = list.slice(0, -1).concat(["?"]);
    var extra = kind === "ab" ? [a] : kind === "abc" ? [a, b] : kind === "pairs" ? [a + 1, a + 3] : kind === "up2" ? [ans - 1, ans + 1] : [];
    return [kind + ":" + list.join("-"), "What number comes next in the pattern?", "m-tiles:" + shown.join(","), ans, near(rng, ans, 0, shuffle(rng, extra)),
      why, seqSay(shown.slice(0, -1)) + ". What number comes next in the pattern?"];
  };
  T.time = function (rng, step) {
    var h = ri(rng, 1, 12), m = step === 1 ? 0 : pick(rng, [0, 30]);
    if (step === 2 && rng() < 0.25) {
      var h2 = hourOf(h + 1);
      return ["later" + h, "This clock shows " + h + " o'clock. What time will it be one hour later?", "m-clock:" + h + ":0", h2 + " o'clock",
        [hourOf(h - 1) + " o'clock", hourOf(h + 2) + " o'clock"], "One hour after " + h + " o'clock, the short hand moves to " + h2 + ". It is " + h2 + " o'clock."];
    }
    var right = clockLabel(h, m), wrong;
    if (m === 0) wrong = [hourOf(h + 1) + " o'clock", h === 12 || h === 11 ? "6 o'clock" : "12 o'clock"];
    else wrong = ["Half past " + hourOf(h + 1), h + " o'clock"];
    var why = m === 0 ? "The long hand points to 12 and the short hand points to " + h + ". That is " + h + " o'clock." :
      "The long hand points to 6, so it is half past. The short hand is just past " + h + ". That is half past " + h + ".";
    return ["read" + h + "-" + m, "What time does the clock show?", "m-clock:" + h + ":" + m, right, wrong, why];
  };
  T.coins = function (rng, step) {
    var form = step === 1 ? ri(rng, 0, 2) : rng() < 0.8 ? 2 : ri(rng, 0, 1);
    var keys = ["p", "n", "d", "q"];
    if (form === 0) {
      var k = pick(rng, keys), v = COIN[k][1];
      return ["worth" + k, "How much is one " + COIN[k][0] + " worth?", "m-coins:" + k, cents(v), shuffle(rng, keys.filter(function (x) { return x !== k; })).slice(0, 2).map(function (x) { return cents(COIN[x][1]); }),
        "A penny is 1 cent, a nickel is 5 cents, a dime is 10 cents and a quarter is 25 cents. A " + COIN[k][0] + " is " + cents(v) + "."];
    }
    if (form === 1) {
      var three = shuffle(rng, keys).slice(0, 3), want = pick(rng, three);
      return ["which" + three.join("") + want, "Which coin is worth " + cents(COIN[want][1]) + "?", "m-coins:" + three.join(","), "A " + COIN[want][0],
        three.filter(function (x) { return x !== want; }).map(function (x) { return "A " + COIN[x][0]; }),
        "A " + COIN[want][0] + " is worth " + cents(COIN[want][1]) + "." + (want === "d" || want === "n" ? " A dime is smaller than a nickel, but a dime is worth more." : "")];
    }
    var list;
    if (step === 1) {
      var f = ri(rng, 0, 2);
      if (f === 0) list = Array(ri(rng, 2, 9)).join("p,").split(",").map(function () { return "p"; });
      else if (f === 1) { list = ["n"]; for (var i = ri(rng, 1, 4); i > 0; i--) list.push("p"); }
      else list = Array(ri(rng, 2, 4) + 1).join("d,").split(",").slice(0, -1).map(function () { return "d"; });
    } else {
      list = [];
      var nq = ri(rng, 0, 1), nd = ri(rng, 0, 2), nn = ri(rng, 0, 1), np = ri(rng, 0, 3);
      for (i = 0; i < nq; i++) list.push("q");
      for (i = 0; i < nd; i++) list.push("d");
      for (i = 0; i < nn; i++) list.push("n");
      for (i = 0; i < np; i++) list.push("p");
      while (list.length < 2) list.push("p");
    }
    var tot = 0; list.forEach(function (x) { tot += COIN[x][1]; });
    var counts = {}; list.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
    var parts = keys.slice().reverse().filter(function (x) { return counts[x]; }).map(function (x) { return counts[x] + " " + (counts[x] === 1 ? COIN[x][0] : COIN[x][0] === "penny" ? "pennies" : COIN[x][0] + "s"); });
    var adds = list.map(function (x) { return COIN[x][1]; });
    var why = (parts.length === 1 && list.length > 1 && list[0] === "p" ? "Each penny is 1 cent. Count them: " + list.length + " cents." :
      "Count the coins: " + adds.join(" + ") + " = " + tot + ". That is " + cents(tot) + ".");
    var wrongN = near(rng, tot, 1, shuffle(rng, [list.length, tot + 5, tot - 5, tot + 1]));
    return ["sum" + list.join(""), "How much money is this?", "m-coins:" + list.join(","), cents(tot), wrongN.map(cents), why,
      "How much money is this? Count the coins: " + parts.join(" and ") + "."];
  };
  T.length = function (rng, step) {
    var cols = shuffle(rng, RIBBON).slice(0, 3), lens = shuffle(rng, step === 1 ? pick(rng, [[2, 5, 8], [3, 5, 8], [2, 4, 7], [3, 6, 8]]) : shuffle(rng, [2, 3, 4, 5, 6, 7, 8]).slice(0, 3));
    // at least 2 steps apart at step 1, 1 step apart at step 2 (still easy to see)
    var lng = rng() < 0.5, best = 0;
    lens.forEach(function (l, i) { if (lng ? l > lens[best] : l < lens[best]) best = i; });
    var right = "The " + cols[best][0] + " ribbon";
    return [(lng ? "long" : "short") + cols.map(function (c, i) { return c[0] + lens[i]; }).join(""), "Which ribbon is the " + (lng ? "longest" : "shortest") + "?",
      "m-ribbons:" + cols.map(function (c, i) { return c[0] + "-" + lens[i]; }).join(","), right,
      cols.filter(function (c, i) { return i !== best; }).map(function (c) { return "The " + c[0] + " ribbon"; }),
      "All the ribbons start at the same line. The " + cols[best][0] + " ribbon ends " + (lng ? "farthest away" : "first") + ", so it is the " + (lng ? "longest" : "shortest") + "."];
  };
  function nice(id) { return id === "cottonball" ? "cotton ball" : id === "duckling" ? "duckling" : id; }
  T.weight = function (rng, step) {
    var same = rng() < 0.12, pair = pick(rng, HEAVY), heavy = pair[0], light = pair[1];
    if (same) { var b = pick(rng, ["block", "ball", "cup", "book", "marble"]); heavy = light = b; }
    var left = rng() < 0.5 ? heavy : light, right = left === heavy && !same ? light : heavy;
    if (same) left = right = heavy;
    var askHeavy = rng() < 0.5, word = askHeavy ? "heavier" : "lighter";
    var ans = same ? "They weigh the same" : "The " + nice(askHeavy ? heavy : light);
    var other = same ? ["The left " + nice(heavy), "The right " + nice(heavy)] : ["The " + nice(askHeavy ? light : heavy), "They weigh the same"];
    var why = same ? "The scale is level. Both sides weigh the same." :
      "The heavier side of a scale goes down. The " + nice(heavy) + " side is down, so the " + nice(heavy) + " is heavier and the " + nice(light) + " is lighter.";
    return [word + left + "-" + right, "Which is " + word + "?", "m-scale:" + left + ":" + right + ":" + (same ? "0" : left === heavy ? "L" : "R"), ans, other, why];
  };
  T.halves = function (rng, step) {
    var form = step === 1 ? ri(rng, 0, 1) : ri(rng, 0, 2);
    if (form === 0) {
      var base = pick(rng, ["circle", "rect"]), others = shuffle(rng, ["uneq", "thirds", "fourths", "uneq2"]).slice(0, 2);
      var kinds = shuffle(rng, ["half"].concat(others)), k = kinds.indexOf("half"), L = ["A", "B", "C"];
      return ["shape" + base + kinds.join(""), "Which shape is cut in half?", "m-halves:" + base + ":" + kinds.join(","), "Shape " + L[k],
        L.filter(function (x, i) { return i !== k; }).map(function (x) { return "Shape " + x; }),
        "Halves are 2 parts that are the same size. Shape " + L[k] + " has 2 parts that match."];
    }
    var n = 2 * (step === 1 ? ri(rng, 1, 5) : ri(rng, 4, 10)), o = pick(rng, OBJ), h = n / 2, pr;
    if (form === 1) pr = "What is half of " + n + "?";
    else { var p = who(rng); pr = p.name + " shares " + n + " " + o[1] + " with a friend. They each get the same. How many does each one get?"; }
    return [form + o[0] + n, pr, "m-split:" + o[0] + ":" + n, h, near(rng, h, 1, [n, h + 1, h - 1]),
      "Half means 2 equal parts. " + n + " shared into 2 equal groups gives " + h + " in each group. " + h + " + " + h + " = " + n + "."];
  };
  T.evenodd = function (rng, step) {
    var top = step === 1 ? 10 : 20, even = rng() < 0.5, ev = [], od = [];
    for (var i = 1; i <= top; i++) (i % 2 ? od : ev).push(i);
    var ans = pick(rng, even ? ev : od), wrong = shuffle(rng, even ? od : ev).slice(0, 2), nums = shuffle(rng, [ans].concat(wrong));
    var why = even ? ans + " is even. " + ans + " things make pairs with none left over. Even numbers end in 0, 2, 4, 6 or 8." :
      ans + " is odd. " + ans + " things make pairs with one left over. Odd numbers end in 1, 3, 5, 7 or 9.";
    return [(even ? "even" : "odd") + wrong.slice().sort(function (a, b) { return a - b; }).join("-") + "-" + ans, "Which number is " + (even ? "even" : "odd") + "?", "m-tiles:" + nums.join(","), ans, wrong, why];
  };

  M.mathMixVariant = function (template, rng, step) { return T[template](rng, step); };
  // The question maker (questions.js MAKERS.mathmix): opts = { rng, step, support, mixTemplate }.
  M.makeMathMix = function (opts, choiceQuestion) {
    var rng = opts.rng, step = Math.max(1, Math.min(2, opts.step || 1));
    var t = opts.mixTemplate && T[opts.mixTemplate] ? opts.mixTemplate : pick(rng, TEMPLATES);
    var v = T[t](rng, step);
    var right = String(v[3]), wrong = v[4].map(String);
    var q = choiceQuestion({
      prompt: v[1],
      speakPrompt: v[6] || v[1],
      board: { kind: "scene", scene: v[2], focus: "" },
      stem: "mix|" + t + "|" + v[0]
    }, right, wrong, opts.support, rng);
    q.mixTemplate = t;
    q.answerKind = /^\d+$/.test(right) ? "number" : "word";
    q.readAll = true;
    q.whyLabel = "Here's why";
    q.didYouKnow = v[5];
    q.explain = { say: v[5], scene: "idea" };
    return q;
  };

  // =====================================================================================================
  // Pictures: scene names "m-<kind>:<params>", 220 x 120 cards in the cute 3D look (soft gradients,
  // highlights, ground shadows). Objects reuse the 3D things (art.js) and the animal library (sci_animals.js).
  var INK = "#2d2a32", used = {};
  function hx(c) { c = c.replace("#", ""); return c.length === 3 ? c.split("").map(function (x) { return x + x; }).join("") : c; }
  function mix(c, t, a) {
    var h = hx(c), o = "#";
    for (var i = 0; i < 3; i++) { var v = parseInt(h.substr(i * 2, 2), 16); v = Math.round(v + (t - v) * a); o += ("0" + v.toString(16)).slice(-2); }
    return o;
  }
  function G(c) { var h = hx(c); used[h] = true; return "url(#mmg-" + h + ")"; }
  function defs() {
    return Object.keys(used).map(function (h) {
      return '<radialGradient id="mmg-' + h + '" cx="0.36" cy="0.3" r="0.85"><stop offset="0" stop-color="' + mix("#" + h, 255, 0.5) +
        '"/><stop offset="0.55" stop-color="#' + h + '"/><stop offset="1" stop-color="' + mix("#" + h, 0, 0.28) + '"/></radialGradient>';
    }).join("");
  }
  var S = ' stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
  function txt(x, y, t, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 11) + '" font-weight="800" font-family="Nunito, Segoe UI, sans-serif" fill="' + (fill || INK) + '"' + (extra || "") + ">" + t + "</text>";
  }
  function label(x, y, t) { return txt(x, y, t, 10.5, INK, ' stroke="#fffdf6" stroke-width="3" paint-order="stroke"'); }
  function shadow(x, y, rx) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + (rx * 0.22) + '" fill="#000" opacity="0.13"/>'; }
  function thing(id, x, y, s) {
    // a 3D thing (40 x 40 art) centred on x, y at size s
    return shadow(x, y + s * 0.44, s * 0.32) + M.thing3d(id).replace("<svg ", '<svg x="' + (x - s / 2).toFixed(1) + '" y="' + (y - s / 2).toFixed(1) + '" width="' + s.toFixed(1) + '" height="' + s.toFixed(1) + '" ');
  }
  function tileBox(x, y, w, h, t, c) {
    var q = t === "?";
    return '<rect x="' + (x + 2) + '" y="' + (y + 4) + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.22) + '" fill="#000" opacity="0.14"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.22) + '" fill="' + (q ? "#fffdf6" : G(c)) + '"' + S + (q ? ' stroke-dasharray="4 3"' : "") + "/>" +
      (q ? "" : '<rect x="' + (x + w * 0.16) + '" y="' + (y + h * 0.1) + '" width="' + (w * 0.5) + '" height="' + (h * 0.14) + '" rx="' + (h * 0.07) + '" fill="#fff" opacity="0.5"/>') +
      txt(x + w / 2, y + h * 0.68, t, Math.min(h * 0.55, w * (String(t).length > 1 ? 0.48 : 0.62)), q ? "#e24b4b" : "#fff", q ? "" : ' stroke="' + mix(c, 0, 0.35) + '" stroke-width="1.2" paint-order="stroke"');
  }
  var TILE_C = ["#ff8a5c", "#4fb3ff", "#7bd36b", "#ffc23d", "#c28cff", "#ff6f91"];
  var SC = {};
  SC.tiles = function (p) {
    var list = p[0].split(","), n = list.length, w = Math.min(44, 196 / n - 6), h = Math.min(54, w * 1.2), gap = 6;
    var x0 = 110 - (n * w + (n - 1) * gap) / 2, o = "";
    list.forEach(function (t, i) { o += tileBox(x0 + i * (w + gap), 60 - h / 2, w, h, t, TILE_C[i % TILE_C.length]); });
    return o;
  };
  function grid(id, n, x0, y0, cols, st) {
    var o = "";
    for (var i = 0; i < n; i++) o += thing(id, x0 + (i % cols) * st + st / 2, y0 + Math.floor(i / cols) * st + st / 2, st * 0.92);
    return o;
  }
  SC.count = function (p) {
    var id = p[0], n = +p[1], o = "";
    if (n <= 10) { var st = 34; o += grid(id, n, 110 - 2.5 * st, 60 - st, 5, st); }
    else {
      var s2 = 20;
      o += grid(id, 10, 8, 40, 5, s2) + grid(id, n - 10, 114, 40, 5, s2);
      o += '<path d="M110 30 v60" stroke="#e7c48a" stroke-width="2" stroke-dasharray="3 3"/>';
    }
    return o;
  };
  SC.two = function (p) {
    var a = +p[1], b = +p[3], st = 19;
    return grid(p[0], a, 14, 18, 10, st) + '<path d="M14 60 h196" stroke="#e7c48a" stroke-width="2" stroke-dasharray="3 3"/>' + grid(p[2], b, 14, 66, 10, st);
  };
  function sign(x, y, t) { return '<circle cx="' + x + '" cy="' + y + '" r="10" fill="' + G("#ffd84d") + '"' + S + "/>" + txt(x, y + 5, t, 15); }
  SC.story = function (p) {
    var id = p[0], a = +p[1], op = p[2], b = +p[3], o = "";
    if (op === "+") {
      var ca = Math.min(a, 5), cb = Math.min(b, 5), rows = Math.max(Math.ceil(a / 5), Math.ceil(b / 5));
      var st = Math.min(32, 172 / (ca + cb), 100 / rows), wa = ca * st, wb = cb * st, x0 = 110 - (wa + wb + 28) / 2, y0 = 60 - rows * st / 2;
      o += grid(id, a, x0, y0, 5, st) + sign(x0 + wa + 14, 60, "+") + grid(id, b, x0 + wa + 28, y0, 5, st);
    } else {
      var cols = a > 10 ? 10 : 5, rw = Math.ceil(a / cols), s = Math.min(32, 200 / cols, 100 / rw), xx = 110 - cols * s / 2, yy = 60 - rw * s / 2;
      o += grid(id, a, xx, yy, cols, s);
      for (var i = a - b; i < a; i++) {
        var cx = xx + (i % cols) * s + s / 2, cy = yy + Math.floor(i / cols) * s + s / 2, r = s * 0.36;
        o += '<path d="M' + (cx - r) + " " + (cy - r) + " L" + (cx + r) + " " + (cy + r) + " M" + (cx + r) + " " + (cy - r) + " L" + (cx - r) + " " + (cy + r) + '" stroke="#e24b4b" stroke-width="3.2" stroke-linecap="round" opacity="0.9"/>';
      }
    }
    return o;
  };
  SC.frame = function (p) {
    var a = +p[0], b = +p[1], c = 32, x0 = 110 - 2.5 * c, y0 = 60 - c, o = '<rect x="' + (x0 - 4) + '" y="' + (y0 - 4) + '" width="' + (5 * c + 8) + '" height="' + (2 * c + 8) + '" rx="8" fill="' + G("#8fd0ff") + '"' + S + "/>";
    for (var i = 0; i < 10; i++) {
      var x = x0 + (i % 5) * c, y = y0 + Math.floor(i / 5) * c;
      o += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (c - 4) + '" height="' + (c - 4) + '" rx="5" fill="#fffdf6" stroke="#5a8fc0" stroke-width="1.4"/>';
      if (i < a) o += '<circle cx="' + (x + c / 2) + '" cy="' + (y + c / 2) + '" r="' + (c * 0.33) + '" fill="' + G("#ef4b4b") + '"' + S + '/><circle cx="' + (x + c / 2 - 3) + '" cy="' + (y + c / 2 - 4) + '" r="3" fill="#fff" opacity="0.6"/>';
      else if (i < a + b) o += '<circle cx="' + (x + c / 2) + '" cy="' + (y + c / 2) + '" r="' + (c * 0.33) + '" fill="' + G("#3d7de8") + '"' + S + "/>";
    }
    return o;
  };
  SC.split = function (p) {
    var n = +p[1], h = n / 2, st = Math.min(30, 190 / h);
    var x0 = 110 - h * st / 2;
    return grid(p[0], h, x0, 18, h, st) + '<path d="M12 60 h196" stroke="#e24b4b" stroke-width="2.5" stroke-dasharray="6 4"/>' + grid(p[0], h, x0, 66, h, st);
  };
  SC.clock = function (p) {
    var h = +p[0], m = +p[1], cx = 110, cy = 60, r = 44, o = "";
    o += shadow(cx, cy + r + 4, 40);
    o += '<circle cx="' + (cx - 34) + '" cy="' + (cy - 38) + '" r="12" fill="' + G("#ffc23d") + '"' + S + '/><circle cx="' + (cx + 34) + '" cy="' + (cy - 38) + '" r="12" fill="' + G("#ffc23d") + '"' + S + "/>";
    o += '<path d="M' + (cx - 26) + " " + (cy + r - 6) + " l-7 10 M" + (cx + 26) + " " + (cy + r - 6) + ' l7 10" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
    o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + G("#ff6f61") + '"' + S + '/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 7) + '" fill="#fffdf6"' + S + "/>";
    for (var i = 1; i <= 12; i++) {
      var an = i * Math.PI / 6;
      o += txt((cx + Math.sin(an) * (r - 16)).toFixed(1), (cy - Math.cos(an) * (r - 16) + 4).toFixed(1), i, 10);
    }
    var ha = ((h % 12) + m / 60) * Math.PI / 6, ma = m / 60 * 2 * Math.PI;
    o += '<path d="M' + cx + " " + cy + " L" + (cx + Math.sin(ma) * 31).toFixed(1) + " " + (cy - Math.cos(ma) * 31).toFixed(1) + '" stroke="#3d7de8" stroke-width="3.2" stroke-linecap="round"/>';
    o += '<path d="M' + cx + " " + cy + " L" + (cx + Math.sin(ha) * 20).toFixed(1) + " " + (cy - Math.cos(ha) * 20).toFixed(1) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
    o += '<circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="' + INK + '"/><ellipse cx="' + (cx - 20) + '" cy="' + (cy - 26) + '" rx="10" ry="5" fill="#fff" opacity="0.35" transform="rotate(-30 ' + (cx - 20) + " " + (cy - 26) + ')"/>';
    return o;
  };
  var COIN_R = { p: 13, n: 15, d: 12, q: 17 };
  function coin(k, x, y, s) {
    var r = COIN_R[k] * s, c = k === "p" ? "#d0814a" : "#c3c9d1", o = shadow(x, y + r + 2, r * 0.9);
    o += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + G(c) + '"' + S + '/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.8) + '" fill="none" stroke="' + mix(c, 0, 0.3) + '" stroke-width="1"/>';
    // a little face in profile, like on a real coin
    o += '<path d="M' + (x - r * 0.15) + " " + (y + r * 0.45) + " q" + (-r * 0.45) + " " + (-r * 0.2) + " " + (-r * 0.3) + " " + (-r * 0.6) + " q" + (r * 0.1) + " " + (-r * 0.45) + " " + (r * 0.45) + " " + (-r * 0.35) + " q" + (r * 0.3) + " " + (r * 0.15) + " " + (r * 0.2) + " " + (r * 0.55) + ' z" fill="' + mix(c, 0, 0.18) + '" opacity="0.8"/>';
    return o + '<ellipse cx="' + (x - r * 0.35) + '" cy="' + (y - r * 0.45) + '" rx="' + (r * 0.3) + '" ry="' + (r * 0.16) + '" fill="#fff" opacity="0.55"/>';
  }
  function clampX(x) { return Math.max(26, Math.min(194, x)); }
  SC.coins = function (p) {
    var list = p[0].split(","), s = list.length === 1 ? 2.4 : list.length <= 3 ? 1.7 : 1.25, gap = 8 * s / 1.25, o = "";
    var widths = list.map(function (k) { return 2 * COIN_R[k] * s; }), tot = widths.reduce(function (a, b) { return a + b; }, 0) + gap * (list.length - 1);
    if (tot > 190) { var f = 190 / tot; s *= f; gap *= f; widths = widths.map(function (w) { return w * f; }); tot = 190; }
    var x = 110 - tot / 2, maxR = Math.max.apply(null, list.map(function (k) { return COIN_R[k]; }));
    list.forEach(function (k, i) {
      var cx = x + widths[i] / 2;
      o += coin(k, cx, 52, s) + (i && list[i - 1] === k ? "" : label(clampX(cx + (list[i + 1] === k ? (widths[i] + gap) / 2 * (list.filter(function (c) { return c === k; }).length - 1) : 0)), 52 + maxR * s + 16, COIN[k][0] === "penny" && list[i + 1] === k ? "pennies" : list[i + 1] === k ? COIN[k][0] + "s" : COIN[k][0]));
      x += widths[i] + gap;
    });
    return o;
  };
  SC.ribbons = function (p) {
    var o = '<path d="M54 14 v94" stroke="' + INK + '" stroke-width="2" stroke-dasharray="4 3"/>';
    p[0].split(",").forEach(function (r, i) {
      var nm = r.split("-")[0], len = +r.split("-")[1], c = RIBBON.filter(function (x) { return x[0] === nm; })[0][1], y = 22 + i * 32, w = len * 19;
      o += label(30, y + 14, nm) + '<rect x="56" y="' + (y + 3) + '" width="' + w + '" height="16" rx="5" fill="#000" opacity="0.12"/>' +
        '<rect x="54" y="' + y + '" width="' + w + '" height="16" rx="5" fill="' + G(c) + '"' + S + '/><rect x="58" y="' + (y + 3) + '" width="' + (w - 10) + '" height="3.5" rx="1.7" fill="#fff" opacity="0.5"/>';
    });
    return o;
  };
  SC.scale = function (p) {
    // a pan balance: the heavier side goes down; each thing sits on its own pan
    var L = p[0], R = p[1], t = p[2] === "L" ? 10 : p[2] === "R" ? -10 : 0, o = "", py = 74;
    o += shadow(110, 112, 34) + '<path d="M94 112 h32 l-6 -10 h-20 z" fill="' + G("#8a6a4a") + '"' + S + '/><rect x="106" y="' + py + '" width="8" height="30" rx="3" fill="' + G("#a8805a") + '"' + S + "/>";
    var lx = 44, rx = 176, ly = py + t, ry = py - t;
    o += '<path d="M' + lx + " " + ly + " L" + rx + " " + ry + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="110" cy="' + py + '" r="5.5" fill="' + G("#ffc23d") + '"' + S + "/>";
    [[lx, ly, L], [rx, ry, R]].forEach(function (e) {
      var top = e[1] - 9;
      o += '<rect x="' + (e[0] - 2.5) + '" y="' + top + '" width="5" height="9" fill="' + INK + '"/>' +
        '<ellipse cx="' + e[0] + '" cy="' + top + '" rx="32" ry="6" fill="' + G("#ffd84d") + '"' + S + "/>" +
        M._animalPut(e[2], e[0], top - 21, 0.62);
    });
    return o;
  };
  SC.race = function (p) {
    var list = p[0].split(","), o = '<rect x="14" y="20" width="4" height="78" rx="2" fill="' + G("#8a6a4a") + '"' + S + '/><path d="M18 22 h22 l-6 9 l6 9 h-22 z" fill="' + G("#e8453c") + '"' + S + "/>";
    o += '<path d="M10 100 h204" stroke="#bfa070" stroke-width="2"/>';
    list.forEach(function (a, i) {
      var x = 46 + i * 36;
      o += M._animalPut(a, x, 62, 0.54) + txt(x, 112, a, 9, INK, ' stroke="#fffdf6" stroke-width="3" paint-order="stroke"');
    });
    return o;
  };
  function piece(base, kind, cx, cy, c) {
    var o = "", r = 26, w = 50, h = 40, x = cx - w / 2, y = cy - h / 2;
    var line = function (d) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>'; };
    if (base === "circle") {
      o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + G(c) + '"' + S + "/>";
      if (kind === "half") o += line("M" + cx + " " + (cy - r) + " V" + (cy + r));
      else if (kind === "uneq") o += line("M" + (cx + 12) + " " + (cy - 23) + " V" + (cy + 23));
      else if (kind === "uneq2") o += line("M" + (cx - 24) + " " + (cy - 10) + " L" + (cx + 24) + " " + (cy - 10));
      else if (kind === "thirds") [0, 120, 240].forEach(function (d) { var a = d * Math.PI / 180; o += line("M" + cx + " " + cy + " L" + (cx + Math.sin(a) * r).toFixed(1) + " " + (cy - Math.cos(a) * r).toFixed(1)); });
      else o += line("M" + cx + " " + (cy - r) + " V" + (cy + r)) + line("M" + (cx - r) + " " + cy + " H" + (cx + r));
    } else {
      o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + G(c) + '"' + S + "/>";
      if (kind === "half") o += line("M" + cx + " " + y + " V" + (y + h));
      else if (kind === "uneq") o += line("M" + (x + 14) + " " + y + " V" + (y + h));
      else if (kind === "uneq2") o += line("M" + x + " " + (y + 11) + " H" + (x + w));
      else if (kind === "thirds") o += line("M" + (x + w / 3) + " " + y + " V" + (y + h)) + line("M" + (x + 2 * w / 3) + " " + y + " V" + (y + h));
      else o += line("M" + cx + " " + y + " V" + (y + h)) + line("M" + x + " " + cy + " H" + (x + w));
    }
    return shadow(cx, cy + 32, 22) + o + '<ellipse cx="' + (cx - 10) + '" cy="' + (cy - 12) + '" rx="8" ry="4" fill="#fff" opacity="0.4"/>';
  }
  SC.halves = function (p) {
    var base = p[0], kinds = p[1].split(","), o = "", c = base === "circle" ? "#ffb347" : "#7ec8ff";
    kinds.forEach(function (k, i) { var cx = 42 + i * 68; o += piece(base, k, cx, 52, c) + label(cx, 108, ["A", "B", "C"][i]); });
    return o;
  };

  M.mathSceneSvg = function (name) {
    var m = /^m-([a-z]+):?(.*)$/.exec(name || "");
    if (!m || !SC[m[1]]) return "";
    used = {};
    if (M._animalReset) M._animalReset();
    var inner = SC[m[1]](m[2].split(":"));
    var adefs = M._animalDefs ? M._animalDefs() : "";
    adefs = adefs.replace(/^<defs>|<\/defs>$/g, "");
    return '<svg class="scene-svg" viewBox="0 0 220 120" role="img"><defs>' + defs() + adefs + "</defs>" +
      '<rect x="3" y="3" width="214" height="114" rx="18" fill="#fffdf6" stroke="#e7c48a" stroke-width="3"/>' + inner + "</svg>";
  };
  M.MATH_SCENE_KINDS = Object.keys(SC);
  if (M.sceneHTML && !M.sceneHTML.mathmix) {
    var prev = M.sceneHTML, cache = {}, nCache = 0;
    M.sceneHTML = function (name) {
      if (/^m-[a-z]+/.test(name || "")) {
        if (!cache[name]) { if (++nCache > 300) { cache = {}; nCache = 1; } cache[name] = '<div class="scene scene-mmix scene-m-' + name.split(":")[0].slice(2) + '">' + M.mathSceneSvg(name) + "</div>"; }
        return cache[name];
      }
      return prev(name);
    };
    M.sceneHTML.mathmix = true;
  }
})(window.Merit = window.Merit || {});
