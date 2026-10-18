(function (M) {
  "use strict";
  var fails = [];
  function assert(cond, msg) {
    if (!cond) fails.push(msg);
  }

  function lands(grid, moves) {
    if (!grid || !grid.goal || !moves || !moves.length) return false;
    var end = M.runMoves(grid, moves);
    return !end.bumped && end.x === grid.goal.x && end.y === grid.goal.y;
  }

  function assertProgram(q, id, step) {
    assert(q.input !== "cell", "programming is not a hidden-star tap " + id);
    assert(q.grid && q.grid.goal, "programming grid " + id);
    var seqLen = { sequence: [2, 2, 3, 3, 4], longer: [3, 4, 4, 5, 6] };
    if (seqLen[id]) assert(q.sequence.length === seqLen[id][step - 1], id + " length " + q.sequence.length + " step " + step);
    if (q.input === "sequence") {
      assert(q.reach, "maze is graded by landing " + id);
      assert(lands(q.grid, q.sequence), "maze lands " + id);
      var rev = q.sequence.slice().reverse();
      if (rev.join("") !== q.sequence.join("") && id !== "robot") assert(!lands(q.grid, rev), "reverse misses " + id);
      if (id !== "robot") assert(winnerSafe(q), "only one arrow order lands " + id);
    }
    if (q.programs) {
      assert(lands(q.grid, q.programs[q.typedAnswer]), "official program lands " + id);
      q.choices.forEach(function (c) {
        if (c.id === q.correctChoiceId) return;
        assert(q.programs[c.label], "moves for " + c.label + " " + id);
        assert(!lands(q.grid, q.programs[c.label]), "wrong program misses " + id + " [" + c.label + "]");
      });
    }
    if (q.repeatDir) {
      q.choices.forEach(function (c) {
        var k = parseInt(c.label, 10);
        var moves = [];
        for (var i = 0; i < k; i++) moves.push(q.repeatDir);
        var hit = lands(q.grid, moves);
        if (c.id === q.correctChoiceId) assert(hit, "count lands " + id);
        else assert(!hit, "count miss " + id + " " + c.label);
      });
    }
    if (q.choices) {
      q.choices.forEach(function (c) {
        assert(String(c.label).indexOf("Repeat ") !== 0, "no sentence repeat " + id);
      });
    }
    if (id === "fixone") {
      assert(typeof q.board.bad === "number", "fix shows the bad arrow");
      assert(q.board.program[q.board.bad] !== q.typedAnswer, "bad arrow is not the fix");
      assert(q.board.program.indexOf("?") < 0, "fix is not a blank");
    }
    if (id === "repmix") {
      q.choices.forEach(function (c) {
        assert(c.label.split(" ").length === 2, "repeat two moves " + c.label);
      });
      assert(q.grid.w * q.grid.h <= 20, "repeat two stays on a small map " + q.grid.w + "x" + q.grid.h);
    }
  }

  function winnerSafe(q) {
    var moves = q.sequence;
    var seen = {};
    function walk(cur, used) {
      if (cur.length === moves.length) {
        var key = cur.join("");
        if (seen[key]) return true;
        seen[key] = lands(q.grid, cur);
        return true;
      }
      var local = {};
      for (var i = 0; i < moves.length; i++) {
        if (used[i] || local[moves[i]]) continue;
        local[moves[i]] = true;
        used[i] = true;
        cur.push(moves[i]);
        walk(cur, used);
        cur.pop();
        used[i] = false;
      }
      return true;
    }
    walk([], []);
    var wins = 0;
    Object.keys(seen).forEach(function (k) { if (seen[k]) wins++; });
    return wins === 1;
  }

  var ids = ["s1", "s2", "s3"];
  var w = { skillId: "s2", step: 3, up: 0, down: 0, support: false };
  for (var i = 0; i < 5; i++) {
    w = M.nextWorking(w, ids, { counts: true, correct: true, unaided: true }).working;
  }
  assert(w.step === 4 && w.skillId === "s2" && w.up === 0, "five correct raises one step, got " + w.skillId + " step " + w.step);

  w = { skillId: "s2", step: 5, up: 4, down: 0, support: false };
  w = M.nextWorking(w, ids, { counts: true, correct: true, unaided: true }).working;
  assert(w.skillId === "s3" && w.step === 1, "step 5 promotes to next skill");

  w = { skillId: "s1", step: 1, up: 0, down: 0, support: true };
  var moved;
  for (i = 0; i < 5; i++) moved = M.nextWorking(w, ids, { counts: true, correct: true, unaided: true }), w = moved.working;
  assert(w.support === false && w.step === 1 && w.skillId === "s1", "support clears without raising");
  for (i = 0; i < 5; i++) w = M.nextWorking(w, ids, { counts: true, correct: true, unaided: true }).working;
  assert(w.step === 2, "next streak raises after support");

  w = { skillId: "s2", step: 4, up: 2, down: 0, support: false };
  for (i = 0; i < 3; i++) moved = M.nextWorking(w, ids, { counts: true, correct: false, unaided: true }), w = moved.working;
  assert(w.step === 3 && w.skillId === "s2", "three misses lower a step");

  w = { skillId: "s2", step: 1, up: 0, down: 2, support: false };
  moved = M.nextWorking(w, ids, { counts: true, correct: false, unaided: true });
  assert(moved.working.skillId === "s1" && moved.working.step === 5, "floor of a later skill drops to previous step 5");

  w = { skillId: "s1", step: 1, up: 0, down: 2, support: false };
  moved = M.nextWorking(w, ids, { counts: true, correct: false, unaided: true });
  assert(moved.working.support === true && moved.working.step === 1, "bottom adds support");

  w = { skillId: "s1", step: 1, up: 4, down: 0, support: false };
  w = M.nextWorking(w, ids, { counts: true, correct: true, unaided: false }).working;
  assert(w.up === 0 && w.step === 1, "helped correct clears the up streak");

  w = { skillId: "s1", step: 2, up: 4, down: 0, support: false };
  w = M.nextWorking(w, ids, { counts: false, correct: true, unaided: true }).working;
  assert(w.up === 4 && w.step === 2, "review does not move the streak");

  assert(M.grade({ input: "choice", correctChoiceId: "o1", allowType: true, answerKind: "number", typedAnswer: "12" }, { text: "012" }), "leading zero counts");
  assert(M.grade({ input: "choice", correctChoiceId: "o1", allowType: true, answerKind: "word", typedAnswer: "Cat" }, { text: " cat " }), "word case and space");
  assert(M.grade({ input: "sequence", sequence: ["R", "U"] }, { sequence: ["R", "U"] }), "sequence match");
  assert(!M.grade({ input: "sequence", sequence: ["R", "U"] }, { sequence: ["U", "R"] }), "sequence order");
  var wallGrid = { w: 2, h: 2, start: { x: 0, y: 1 }, goal: { x: 1, y: 0 }, walls: [{ x: 0, y: 0 }] };
  assert(M.grade({ input: "sequence", reach: true, sequence: ["R", "U"], grid: wallGrid }, { sequence: ["R", "U"] }), "landing path counts");
  assert(M.grade({ input: "sequence", reach: true, sequence: ["R", "U"], grid: wallGrid }, { sequence: ["R", "U", "D", "U"] }), "a longer path that still lands counts");
  assert(!M.grade({ input: "sequence", reach: true, sequence: ["R", "U"], grid: wallGrid }, { sequence: ["R"] }), "stopping short of the star does not count");
  assert(!M.grade({ input: "sequence", reach: true, sequence: ["R", "U"], grid: wallGrid }, { sequence: [] }), "an empty path does not land");
  assert(!M.grade({ input: "sequence", reach: true, sequence: ["R", "U"], grid: wallGrid }, { sequence: ["U", "R"] }), "a path that hits a wall does not count");
  assert(M.grade({ input: "cell", cell: { x: 2, y: 1 } }, { cell: { x: 2, y: 1 } }), "cell match");

  var skill = { solid: false, answers: [] };
  var t0 = new Date("2026-10-01T12:00:00").getTime();
  for (i = 0; i < 8; i++) skill.answers.push({ step: 2, correct: true, unaided: true, at: t0 });
  var ev = M.evaluateSkill(skill);
  assert(ev.earnedStep === 2 && Math.abs(ev.mastery - 0.4) < 0.001, "eight unaided correct earn the step");

  skill = { solid: false, answers: [] };
  for (i = 0; i < 14; i++) skill.answers.push({ step: 4, correct: true, unaided: true, at: t0 });
  var t1 = new Date("2026-10-02T12:00:00").getTime();
  for (i = 0; i < 6; i++) skill.answers.push({ step: 5, correct: true, unaided: true, at: t1 });
  ev = M.evaluateSkill(skill);
  assert(ev.solid === true && ev.mastery === 1, "solid needs a later day");
  skill.solid = true;
  for (i = 0; i < 8; i++) skill.answers.push({ step: 5, correct: false, unaided: true, at: t1 + 1000 });
  ev = M.evaluateSkill(skill);
  assert(ev.solid === false, "solid drops under 70 percent");

  var profile = {
    ageBand: "5-6",
    subjects: {}
  };
  M.SUBJECTS.forEach(function (s) {
    M.SKILLS[s.id][profile.ageBand].forEach(function () {});
    var snap = M.snapshot(profile, s.id);
    assert(snap.score === 0, s.id + " starts at 0");
    assert(snap.rank.title === M.RANKS[s.id][0], s.id + " starter rank");
  });

  M.BANDS.forEach(function (band) {
    M.SUBJECTS.forEach(function (subject) {
      M.SKILLS[subject.id][band].forEach(function (skillMeta) {
        [1, 3, 5].forEach(function (step) {
          var q;
          try {
            q = M.makeQuestion({ subject: subject.id, skillId: skillMeta.id, step: step, support: step === 1, seed: 7 + step, band: band });
          } catch (err) {
            fails.push("throw " + subject.id + " " + skillMeta.id + " step " + step + " " + err.message);
            return;
          }
          assert(q && q.prompt, "prompt " + skillMeta.id);
          assert(q.explain && q.explain.say, "explain " + skillMeta.id);
          if (q.input === "choice") {
            assert(q.choices && q.choices.length >= (step === 1 ? 2 : 2), "choices " + skillMeta.id + " step " + step);
            assert(q.choices.some(function (c) { return c.id === q.correctChoiceId; }), "correct id " + skillMeta.id);
            if (step === 1) assert(q.choices.length === 2, "support is two choices for " + skillMeta.id + " got " + q.choices.length);
            assert(M.grade(q, { choiceId: q.correctChoiceId }), "grade choice " + skillMeta.id);
          } else if (q.input === "sequence") {
            assert(q.sequence && q.sequence.length >= 2, "path " + skillMeta.id + " len " + (q.sequence && q.sequence.length));
            var end = M.runMoves(q.grid, q.sequence);
            assert(end.x === q.grid.goal.x && end.y === q.grid.goal.y && !end.bumped, "path reaches " + skillMeta.id);
            assert(M.grade(q, { sequence: q.sequence.slice() }), "grade path " + skillMeta.id);
          } else if (q.input === "flash") {
            assert(q.board && q.board.word, "flash word " + skillMeta.id);
            assert(!q.sound, "flash has no voice " + skillMeta.id);
            assert(!q.choices || !q.choices.length, "flash has no choices " + skillMeta.id);
            assert(M.grade(q, { flash: "correct" }), "grade flash yes " + skillMeta.id);
            assert(!M.grade(q, { flash: "incorrect" }), "grade flash no " + skillMeta.id);
          } else if (q.input === "cell") {
            assert(M.grade(q, { cell: { x: q.cell.x, y: q.cell.y } }), "grade cell " + skillMeta.id);
            var end2 = M.runMoves(q.grid, q.sequence);
            assert(end2.x === q.cell.x && end2.y === q.cell.y, "predict cell " + skillMeta.id);
          } else {
            fails.push("bad input " + skillMeta.id);
          }
          if (subject.id === "math" && q.stem) {
            var bits = q.stem.split("|");
            if (q.stem.indexOf("+|") === 0 || q.stem.indexOf("-|") === 0) {
              var left = Number(bits[1]);
              var right = Number(bits[2]);
              var expect = q.stem.charAt(0) === "+" ? left + right : left - right;
              assert(Number(q.typedAnswer) === expect && expect >= 0, "add or subtract " + q.stem + " got " + q.typedAnswer);
            }
            if (q.stem.indexOf("x|") === 0) assert(Number(q.typedAnswer) === Number(bits[1]) * Number(bits[2]), "times " + q.stem);
            if (q.stem.indexOf("÷|") === 0) {
              var total = Number(bits[1]);
              var divisor = Number(bits[2]);
              assert(divisor > 1 && total % divisor === 0 && Number(q.typedAnswer) === total / divisor, "exact division " + q.stem + " got " + q.typedAnswer);
            }
          }
          if (subject.id === "math" && q.board && q.board.kind === "groups") {
            assert(Number(q.typedAnswer) === q.board.groups * q.board.each, "groups match " + skillMeta.id);
          }
          if (subject.id === "programming") assertProgram(q, skillMeta.id, step);
          if (q.allowType) {
            assert(q.typedAnswer != null, "typed " + skillMeta.id);
            assert(M.grade(q, { text: q.typedAnswer }), "grade typed " + skillMeta.id + " step " + step);
          }
          if (step >= 4 && (q.answerKind === "number" || (subject.id === "reading" && q.input === "choice" && q.typedAnswer && q.skillId !== "sounds" && q.skillId !== "names" && q.skillId !== "sentence" && q.skillId !== "mainidea" && q.skillId !== "whyq" && q.skillId !== "story"))) {
            assert(q.allowType, "hard reading/number should type " + skillMeta.id + " step " + step);
          }
        });
      });
    });
  });

  ["sequence", "robot", "repeat", "predict", "longer", "repeatpath", "predict2", "fixone", "repmix", "ifblocked", "predict3", "fixcount"].forEach(function (id) {
    for (var seed = 1; seed <= 4; seed++) {
      [1, 5].forEach(function (step) {
        var pq = M.makeQuestion({ subject: "programming", skillId: id, step: step, support: step === 1, seed: seed * 97 + step });
        assertProgram(pq, id, step);
      });
    }
  });

  function raceOk(q) {
    assert(q.prompt.indexOf("Ana") < 0 && q.prompt.indexOf("Bo") < 0, "retired Ana and Bo race");
    var speed = q.prompt.match(/^(\w+) and (\w+) start together\. \1 reaches the flag in (\d+) seconds\. \2 takes (\d+) seconds\. Who is faster\?$/);
    if (speed) {
      var aTime = parseInt(speed[3], 10);
      var bTime = parseInt(speed[4], 10);
      var expect = aTime < bTime ? speed[1] : bTime < aTime ? speed[2] : "";
      assert(expect && q.typedAnswer === expect, "shorter time is faster, got " + q.typedAnswer + " for " + q.prompt);
      return;
    }
    var farther = q.prompt.match(/^In (\d+) seconds, (\w+) goes (\d+) meters and (\w+) goes (\d+) meters\. Who went farther\?$/);
    if (farther) {
      var aFar = parseInt(farther[3], 10);
      var bFar = parseInt(farther[5], 10);
      var farExpect = aFar > bFar ? farther[2] : bFar > aFar ? farther[4] : "";
      assert(farExpect && q.typedAnswer === farExpect, "more meters went farther: " + q.prompt);
      return;
    }
    var timed = q.prompt.match(/^(\w+) and (\w+) both travel (\d+) meters\. \1 takes (\d+) seconds\. \2 takes (\d+) seconds\. Who is faster\?$/);
    if (timed) {
      var aSec = parseInt(timed[4], 10);
      var bSec = parseInt(timed[5], 10);
      var timeExpect = aSec < bSec ? timed[1] : bSec < aSec ? timed[2] : "";
      assert(timeExpect && q.typedAnswer === timeExpect, "less time is faster: " + q.prompt);
    }
  }
  ["speed", "trips"].forEach(function (id) {
    for (var seed = 1; seed <= 24; seed++) {
      [1, 3, 5].forEach(function (step) {
        raceOk(M.makeQuestion({ subject: "physics", skillId: id, step: step, seed: seed * 13 + step }));
      });
    }
  });

  var countThings = {};
  var sawObject = 0;
  var sawNumber = 0;
  for (var cs = 1; cs <= 24; cs++) {
    var cq = M.makeQuestion({ subject: "math", skillId: "add", step: 1, band: "5-6", seed: cs * 17 });
    assert(cq.prompt.indexOf("dots") < 0, "addition does not ask for dots");
    if (cq.board && cq.board.kind === "equation") {
      sawNumber += 1;
      assert(cq.prompt.indexOf("=") >= 0, "number addition shows the sum");
    } else {
      sawObject += 1;
      assert(cq.board && cq.board.thing, "addition pictures have an object");
      assert(cq.prompt.indexOf("How many ") === 0, "addition names the object");
      countThings[cq.board.thing] = true;
    }
  }
  assert(sawObject > 0 && sawNumber > 0, "addition mixes objects and numbers");
  assert(Object.keys(countThings).length >= 3, "addition objects vary, saw " + Object.keys(countThings).join(","));
  var mixFirst = M.makeQuestion({ subject: "math", skillId: "add", step: 1, band: "5-6", seed: 3 });
  var mixNext = M.makeQuestion({
    subject: "math",
    skillId: "add",
    step: 1,
    band: "5-6",
    seed: 11,
    block: [{ key: mixFirst.key, near: mixFirst.near, look: mixFirst.look || "" }]
  });
  var mixFirstObject = !!(mixFirst.board && mixFirst.board.thing);
  var mixNextObject = !!(mixNext.board && mixNext.board.thing);
  assert(mixFirstObject !== mixNextObject, "the next math question switches between objects and numbers");
  var numbersOnly = M.makeQuestion({ subject: "math", skillId: "add", step: 1, band: "5-6", seed: 4, style: "numbers" });
  assert(numbersOnly.board && numbersOnly.board.kind === "equation" && !numbersOnly.board.thing, "numbers stay a number sentence");
  var objectsOnly = M.makeQuestion({ subject: "math", skillId: "add", step: 5, band: "9-10", seed: 4, style: "objects" });
  assert(objectsOnly.board && objectsOnly.board.thing, "objects stay pictures on a hard step");
  var timesNumbers = M.makeQuestion({ subject: "math", skillId: "mul", step: 1, band: "5-6", seed: 2, style: "numbers" });
  assert(timesNumbers.board && timesNumbers.board.kind === "equation", "times numbers use a number sentence");

  function pushTrain(person, skillId, step, n) {
    for (var k = 0; k < n; k++) {
      M.recordAnswer(person, "math", {
        skillId: skillId,
        step: step,
        correct: true,
        unaided: true,
        role: "train",
        at: t0 + k
      });
    }
  }
  var learner = { ageBand: "7-8", subjects: {} };
  var prog0 = M.mathProgress(learner);
  assert(prog0.id === "beginner" && prog0.earnedStep === 0, "math starts at beginner");
  pushTrain(learner, "add", 2, 8);
  var prog1 = M.mathProgress(learner);
  assert(prog1.id === "intermediate" && prog1.earnedStep === 2, "step 2 earned is intermediate");
  var keptTrack = M.ensureBand(learner, "math").tracks.add.step;
  var keptWorking = M.ensureBand(learner, "math").working.step;
  pushTrain(learner, "add", 1, 8);
  var progStay = M.mathProgress(learner);
  assert(progStay.id === "intermediate" && progStay.earnedStep === 2, "easier training does not drop the level");
  assert(M.ensureBand(learner, "math").tracks.add.step === keptTrack, "train answers do not move the section track");
  assert(M.ensureBand(learner, "math").working.step === keptWorking, "train answers leave the working ladder");
  pushTrain(learner, "mul", 4, 8);
  var prog2 = M.mathProgress(learner);
  assert(prog2.id === "expert" && prog2.earnedStep === 4, "step 4 earned is expert");
  var sprinter = { ageBand: "9-10", subjects: {} };
  pushTrain(sprinter, "div", 5, 8);
  var prog3 = M.mathProgress(sprinter);
  assert(prog3.id === "expert" && prog3.earnedStep === 5, "expert training can earn expert");
  var other = { ageBand: "7-8", subjects: {} };
  assert(M.mathProgress(other).id === "beginner", "another player stays at beginner");
  // Read-aloud text for science / physics.
  [["Water boils at 100°C.", "Water boils at 100 degrees Celsius."],
   ["It goes 60 km/h for 2h.", "It goes 60 kilometers per hour for 2 hours."],
   ["Sleet and hail are forms of ___", "Sleet and hail are forms of blank"],
   ["Which of these BEST fits?", "Which of these best fits?"],
   ["A property of CO2 gas", "A property of carbon dioxide gas"],
   ["100% efficiency", "100 percent efficiency"],
   ["A push from the right (6) wins.", "A push from the right, 6, wins."],
   ["5 in a row", "5 in a row"],
   ["meters per second (m/s)", "meters per second"],
   ["<b>Hot</b> &amp; cold", "Hot and cold"]].forEach(function (pair) {
    assert(M.speechText(pair[0]) === pair[1], "speech text: " + pair[0] + " -> " + M.speechText(pair[0]));
  });
    // Play status: speaking while speech runs, ready when it ends, is stopped, or fails; old runs ending do not count.
    (function () {
      var real = Object.getOwnPropertyDescriptor(window, "speechSynthesis");
      var said = [];
      var fake = { getVoices: function () { return [{ name: "Fake", lang: "en-US" }]; }, addEventListener: function () {}, removeEventListener: function () {},
        cancel: function () {}, speak: function (u) { said.push(u); } };
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: fake });
      M.quiet();
      assert(M.speechStatus() === "ready", "speech status ready with voices (" + M.speechStatus() + ")");
      M.speak("one");
      assert(M.speechStatus() === "speaking", "speech status speaking after speak");
      M.quiet();
      assert(M.speechStatus() === "ready", "speech status ready after quiet");
      M.speakAll(["two", "three"]);
      assert(M.speechStatus() === "speaking", "speech status speaking after speakAll");
      M.quiet();
      M.speakCues(["four"], {});
      assert(M.speechStatus() === "speaking", "speech status speaking after speakCues");
      M.quiet();
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
      assert(M.speechStatus() === "none", "speech status none without an engine");
      if (real) Object.defineProperty(window, "speechSynthesis", real); else delete window.speechSynthesis;
    })();
  assert(M.speechSentences("It is 2.5 m. Why? Mr. Lee knows.").length === 3, "speech splits sentences but not decimals or Mr.");
  // Level earned in the other subjects (moves the Home level up).
  var reader = { ageBand: "5-6", subjects: {} };
  assert(M.levelProgress(reader, "reading").id === "beginner", "reading level starts at beginner");
  M.ensureBand(reader, "reading");
  var rSkill = M.SKILLS.reading["5-6"][0].id;
  for (var ri = 0; ri < 10; ri++) M.recordAnswer(reader, "reading", { skillId: rSkill, step: 2, correct: true, unaided: true, role: "work" });
  assert(M.levelProgress(reader, "reading").id === "intermediate", "earning step 2 in reading is intermediate");
  assert(M.levelProgress(reader, "science").id === "beginner", "reading progress does not count for science");

  function poolCount(subjectId, band) {
    var seen = {};
    M.SKILLS[subjectId][band].forEach(function (skillMeta, s) {
      for (var step = 1; step <= 5; step++) {
        for (var seed = 1; seed <= 18; seed++) {
          var q = M.makeQuestion({
            subject: subjectId,
            skillId: skillMeta.id,
            step: step,
            band: band,
            seed: seed * 97 + step * 13 + s * 3
          });
          seen[q.key] = true;
        }
      }
    });
    return Object.keys(seen).length;
  }
  ["math", "reading", "science", "physics", "programming"].forEach(function (subjectId) {
    ["5-6", "7-8", "9-10"].forEach(function (band) {
      var n = poolCount(subjectId, band);
      assert(n >= 100, subjectId + " " + band + " has a pool of " + n);
    });
  });

  function noBackToBack(subjectId, band, skillId) {
    var avoid = [];
    var block = [];
    var prev = null;
    for (var i = 0; i < 16; i++) {
      var q = M.makeQuestion({
        subject: subjectId,
        skillId: skillId,
        step: 3,
        band: band,
        seed: 4000 + i * 19,
        avoid: avoid,
        block: block
      });
      if (prev) {
        assert(q.key !== prev.key, subjectId + " " + skillId + " repeated the same question");
        assert(q.near !== prev.near, subjectId + " " + skillId + " repeated a similar question");
        assert(!(q.look && prev.look && q.look === prev.look), subjectId + " " + skillId + " repeated the same picture");
      }
      prev = { key: q.key, near: q.near, look: q.look || "" };
      avoid.push(q.key);
      block = [prev];
    }
  }
  noBackToBack("math", "7-8", "add");
  noBackToBack("reading", "5-6", "sight");
  noBackToBack("science", "5-6", "living");
  noBackToBack("physics", "7-8", "ramp");
  noBackToBack("programming", "7-8", "longer");

  var spaceKid = { ageBand: "5-6", subjects: {} };
  M.ensureBand(spaceKid, "science");
  M.recordAnswer(spaceKid, "science", { skillId: "space", step: 1, correct: true, unaided: true, role: "work" });
  var spaceBand = M.ensureBand(spaceKid, "science");
  assert(spaceBand.working.skillId === "living" && spaceBand.working.step === 1 && spaceBand.working.up === 0, "a space question does not move the other science skill");
  var youngScenes = { sun: 1, moon: 1, earth: 1, stars: 1, rocket: 1, astronaut: 1, orbit: 1 };
  for (var si = 1; si <= 10; si++) {
    var sq = M.makeQuestion({ subject: "science", skillId: "space", step: 1, band: "5-6", seed: si });
    var blob = (sq.prompt + " " + sq.choices.map(function (c) { return c.label; }).join(" ") + " " + sq.explain.say).toLowerCase();
    assert(blob.indexOf("eclipse") < 0 && blob.indexOf("galaxy") < 0 && blob.indexOf("dwarf") < 0 && blob.indexOf("light-year") < 0, "simple space " + sq.prompt);
    assert(youngScenes[sq.board.scene], "young space picture " + sq.board.scene);
    assert(M.grade(sq, { choiceId: sq.correctChoiceId }), "grade space");
  }
  for (var sj = 1; sj <= 10; sj++) {
    var hard = M.makeQuestion({ subject: "science", skillId: "space", step: 5, band: "9-10", seed: sj * 5 });
    var hardBlob = (hard.prompt + " " + hard.explain.say).toLowerCase();
    assert(/grav|eclipse|season|galaxy|satellite|asteroid|comet|meteor|minute|reflect/.test(hardBlob), "older space question " + hard.prompt);
    assert(M.grade(hard, { choiceId: hard.correctChoiceId }), "grade older space");
  }

  var plan = M.planSet(function () { return 0.2; });
  assert(plan.length === 10 && plan[0] === "work", "set starts on a working problem");
  assert(plan.filter(function (r) { return r === "review"; }).length === 2, "two reviews");
  assert(plan.filter(function (r) { return r === "stretch"; }).length === 1, "one stretch");

  // ---- question bank (js/bank.js), one pool per subject sorted by level ----
  (function bankChecks() {
    assert(M.BANK && M.BANK.length > 0, "bank has items");
    if (!M.BANK) return;
    var LEVEL_STEPS = { beginner: [1, 2], intermediate: [3, 4], expert: [5] };
    assert(M.BANK_LEVELS && M.BANK_LEVELS.length === 3, "bank has three levels");
    M.BANK_LEVELS.forEach(function (lv) {
      assert(JSON.stringify(lv.steps) === JSON.stringify(LEVEL_STEPS[lv.id]), "level " + lv.id + " steps match the app's level picker");
    });
    [1, 2, 3, 4, 5].forEach(function (st) {
      assert(M.bankLevelOf(st) === (st <= 2 ? "beginner" : st <= 4 ? "intermediate" : "expert"), "step " + st + " belongs to the right level");
    });
    var need = ["id", "subject", "band", "level", "skill", "step", "prompt", "choices", "answer", "source", "sourceUrl", "license", "credit"];
    var seenIds = {};
    var subjects = {};
    M.SUBJECTS.forEach(function (s) { subjects[s.id] = true; });
    M.BANK.forEach(function (item) {
      var tag = "bank " + (item && item.id);
      need.forEach(function (k) {
        if (k === "sourceUrl" && item.source === "Written for Merit") return;
        assert(item[k] !== undefined && item[k] !== null && item[k] !== "", tag + " has " + k);
      });
      // Word items: exactly one choice can be right, and the prompt never gives the answer away.
      var chs = (item.choices || []).map(function (c) { return String(c).toLowerCase(); });
      var ans = String(item.answer).toLowerCase();
      assert(chs.filter(function (c) { return c === ans; }).length === 1, tag + " answer is exactly one choice");
      var rh = /^Which word rhymes with (\w+)\?$/.exec(item.prompt);
      if (rh) {
        var base = rh[1].toLowerCase();
        assert(ans !== base && chs.indexOf(base) < 0, tag + " rhyme word is not itself a choice");
        var rime = function (w) { var m = /[aeiouy]+[^aeiouy]*e?$/.exec(w); return m ? m[0] : w; };
        assert(chs.filter(function (c) { return rime(c) === rime(base); }).length === 1 && rime(ans) === rime(base), tag + " only the answer rhymes");
      }
      var lt = /^Which word (starts|ends) with the letter (\w)\?$/.exec(item.prompt);
      if (lt) {
        var L = lt[2].toLowerCase();
        var hits = chs.filter(function (c) { return lt[1] === "starts" ? c.charAt(0) === L : c.charAt(c.length - 1) === L; });
        assert(hits.length === 1 && hits[0] === ans, tag + " only the answer " + lt[1] + " with " + L);
      }
      var fw = /^Find the word: (\w+)\.$/.exec(item.prompt);
      if (fw) assert(ans === fw[1].toLowerCase(), tag + " find-the-word answer is the word");
      if (item.subject !== "math" && !fw && ans.length > 2) {
        assert(String(item.prompt).toLowerCase().indexOf(ans) < 0, tag + " prompt does not contain the answer");
      }
      assert(!seenIds[item.id], tag + " id is unique");
      seenIds[item.id] = true;
      assert(subjects[item.subject], tag + " subject");
      assert(M.BANDS.indexOf(item.band) >= 0, tag + " band (kept as a note)");
      assert(LEVEL_STEPS[item.level], tag + " level");
      assert(LEVEL_STEPS[item.level] && LEVEL_STEPS[item.level].indexOf(item.step) >= 0, tag + " step fits its level");
      var topicItem = M.isTopicSkill(item.subject, item.skill) ||
        (M.extraSkillsFor ? M.extraSkillsFor(item.subject) : []).some(function (x) { return x.id === item.skill; });
      var catalogItem = !M.BANK_SKILLS[item.subject] && M.SKILLS[item.subject] && M.BANDS.every(function (b) {
        return M.SKILLS[item.subject][b].some(function (sk) { return sk.id === item.skill; });
      });
      assert(item.skill === M.BANK_SKILLS[item.subject] || topicItem || catalogItem, tag + " skill is the subject's bank skill or a topic skill");
      if (!topicItem) {
        M.BANDS.forEach(function (band) {
          assert(M.SKILLS[item.subject][band].some(function (s) { return s.id === item.skill; }), tag + " skill is in the " + band + " catalog");
        });
      }
      assert(Array.isArray(item.choices) && item.choices.length >= 3 && item.choices.length <= 4, tag + " has 3-4 choices");
      var uniq = {};
      (item.choices || []).forEach(function (c) {
        assert(typeof c === "string" && c.trim() !== "", tag + " choice text");
        assert(!uniq[String(c).toLowerCase()], tag + " choices differ");
        uniq[String(c).toLowerCase()] = true;
      });
      assert(item.choices.indexOf(item.answer) >= 0, tag + " answer is among choices");
      if (item.answerKind === "number") {
        assert(item.choices.every(function (c) { return /^\d+$/.test(c); }), tag + " number choices are whole numbers");
        assert(M.normNum(item.answer) === item.answer, tag + " number answer is clean");
      }
      assert(/^https?:\/\//.test(item.sourceUrl) || item.source === "Written for Merit", tag + " source URL");
      assert(String(item.prompt).length <= 320, tag + " prompt length");
      if (item.passage) {
        var cap = item.level === "beginner" ? 25 : item.level === "intermediate" ? 70 : 120;
        assert(item.passage.split(/\s+/).length <= cap, tag + " passage length for " + item.level);
      }
    });
    // Level coverage: every bank subject has a healthy pool at every level and every step.
    Object.keys(M.BANK_SKILLS).forEach(function (subjectId) {
      var skillId = M.BANK_SKILLS[subjectId];
      Object.keys(LEVEL_STEPS).forEach(function (lv) {
        var n = M.bankLevelItems(subjectId, skillId, lv).length;
        assert(n >= (lv === "beginner" ? 80 : 60), "bank " + subjectId + " " + lv + " has at least " + (lv === "beginner" ? 80 : 60) + " items (" + n + ")");
        LEVEL_STEPS[lv].forEach(function (st) {
          assert(M.bankItems(subjectId, skillId, st).length >= 25, "bank " + subjectId + " step " + st + " has at least 25 items");
        });
      });
    });
    var easy = {};
    (M.BANK_EASY_WORDS || []).forEach(function (w) { easy[w] = true; });
    function easyWord(w) {
      if (easy[w]) return true;
      var ends = [["ies", "y"], ["es", ""], ["s", ""], ["ed", ""], ["ed", "e"], ["ing", ""], ["ing", "e"], ["er", ""], ["est", ""], ["ly", ""], ["ier", "y"], ["iest", "y"]];
      for (var i = 0; i < ends.length; i++) {
        var suf = ends[i][0];
        if (w.length > suf.length && w.slice(-suf.length) === suf) {
          var base = w.slice(0, -suf.length) + ends[i][1];
          if (easy[base]) return true;
          if (base.length > 2 && base.charAt(base.length - 1) === base.charAt(base.length - 2) && easy[base.slice(0, -1)]) return true;
        }
      }
      return false;
    }
    assert((M.BANK_EASY_WORDS || []).length > 500, "easy word list is loaded");
    var seenBeginner = {};
    M.BANK.forEach(function (item) {
      if (item.level !== "beginner") return;
      var tag = "bank beginner " + item.id;
      var text = [item.prompt, item.choices.join(" "), item.passage || ""].join(" ");
      (text.match(/[A-Za-z]+(?:'[a-z]+)?/g) || []).forEach(function (w) {
        var lw = w.toLowerCase().replace(/'s$/, "");
        if (lw.length > 1) assert(easyWord(lw) || (item.subject === "astronomy" && (M.ASTRO_WORDS || []).indexOf(lw) >= 0) || (item.subject === "science" && M.isTopicSkill("science", item.skill) && (M.SCI_TOPIC_WORDS || []).indexOf(lw) >= 0) || (item.skill === "wordmatch" && (M.WORD_ITEMS || []).some(function (w) { return w.answer === lw; })), tag + " uses an easy word: " + lw);
      });
      // (v15 sight words may repeat a starter-bank "Find the word" prompt; they are checked among themselves)
      var key = (item.skill === "sightwords" ? "sight|" : "") + item.subject + "|" + item.prompt + "|" + (item.passage || "");
      assert(!seenBeginner[key], tag + " is not a repeat");
      seenBeginner[key] = true;
      assert(item.prompt.split(/\s+/).length <= 18, tag + " short prompt");
      assert(!/[_<>{}\[\]^=]/.test(item.prompt), tag + " prompt reads well aloud");
      assert(item.source === "Written for Merit" || (item.skill === "sightwords" && item.license === "Public domain" && /Dolch/.test(item.source)), tag + " is written for Merit (or a public-domain Dolch sight word)");
      if (item.subject === "reading" && !item.passage) assert(item.readChoices === false, tag + " word items do not read the choices aloud");
      if (item.subject === "science" || item.subject === "physics" || item.passage) assert(item.readChoices === true, tag + " reads choices aloud");
      if (item.passage) assert(item.passage.split(/[.!?]/).filter(function (x) { return x.trim(); }).length <= 4, tag + " story is 1-4 sentences");
      if (item.subject === "math") {
        var n = Number(item.answer);
        assert(n >= 0 && n <= 10, tag + " answer within 10");
        if (item.picture) assert((item.picture.op === "+" ? item.picture.a + item.picture.b : item.picture.a - item.picture.b) === n, tag + " picture matches the answer");
      }
    });
    var story1 = null;
    for (var sd = 1; sd < 60 && !story1; sd++) {
      var tryq = M.makeQuestion({ subject: "reading", skillId: "story", step: 2, band: "9-10", seed: sd });
      if (tryq.board.kind === "fable") story1 = tryq;
    }
    assert(story1 && story1.sound && story1.sound.kind === "story" && story1.sound.speak === story1.board.text, "beginner story has a Play voice, even for an older child");
    assert(story1 && story1.readChoices === true, "beginner story reads the choices");
    var fable5 = M.makeQuestion({ subject: "reading", skillId: "story", step: 5, band: "5-6", seed: 3 });
    assert(fable5.board.kind === "fable" && !fable5.sound, "expert fable shows the passage without a Play voice");
    var math1 = M.makeQuestion({ subject: "math", skillId: "word", step: 1, band: "9-10", seed: 9 });
    assert(math1.board.kind === "sumdots" && math1.board.thing, "beginner story sums show pictures");
    // Selection follows the level (the step), whatever the age band.
    Object.keys(M.BANK_SKILLS).forEach(function (subjectId) {
      var skillId = M.BANK_SKILLS[subjectId];
      M.BANDS.forEach(function (band) {
        for (var st = 1; st <= 5; st++) {
          for (var seed = 1; seed <= 5; seed++) {
            var bq = M.makeQuestion({ subject: subjectId, skillId: skillId, step: st, band: band, support: st === 1 && seed % 2 === 0, seed: seed * 31 + st });
            var item = null;
            M.BANK.forEach(function (it) { if (it.id === bq.bankId) item = it; });
            var tag2 = "bank q " + subjectId + " " + band + " step " + st;
            assert(item, tag2 + " comes from the bank");
            if (!item) continue;
            assert(item.subject === subjectId && item.skill === skillId, tag2 + " matches subject and skill");
            assert(item.step === st && item.level === M.bankLevelOf(st), tag2 + " comes from the asked step and level");
            assert(bq.level === item.level, tag2 + " question carries its level");
            var right = null;
            bq.choices.forEach(function (c) { if (c.id === bq.correctChoiceId) right = c; });
            assert(right && right.label === item.answer, tag2 + " correct button is the answer");
            assert(M.grade(bq, { choiceId: bq.correctChoiceId }), tag2 + " grades the answer");
            bq.choices.forEach(function (c) {
              if (c.id !== bq.correctChoiceId) assert(!M.grade(bq, { choiceId: c.id }), tag2 + " wrong button is wrong");
            });
            if (bq.support) assert(bq.choices.length === 2, tag2 + " support shows two choices");
            else assert(bq.choices.length === item.choices.length, tag2 + " shows all choices");
            if (item.answerKind === "number" && st >= 4) {
              assert(bq.allowType && M.grade(bq, { text: item.answer }), tag2 + " typed number");
              assert(!M.grade(bq, { text: String(Number(item.answer) + 1) }), tag2 + " typed wrong number");
            }
            assert(bq.credit && bq.license, tag2 + " carries a credit");
            if (subjectId === "reading" && item.passage) assert(bq.board.kind === "fable" && bq.board.text, tag2 + " shows the story");
          }
        }
      });
    });
    // Many picks inside one level never leave it.
    Object.keys(M.BANK_SKILLS).forEach(function (subjectId) {
      var skillId = M.BANK_SKILLS[subjectId];
      [1, 2, 3, 4, 5].forEach(function (st) {
        var r = 0.013;
        for (var k = 0; k < 40; k++) {
          r = (r * 9301 + 0.49297) % 1;
          var it = M.bankPick(subjectId, skillId, st, (function (v) { return function () { return v; }; })(r));
          assert(it && it.level === M.bankLevelOf(st), "bankPick " + subjectId + " step " + st + " stays in level");
        }
      });
    });
    var a1 = M.bankPick("science", "facts", 3, function () { return 0.5; });
    var a2 = M.bankPick("science", "facts", 3, function () { return 0.5; });
    assert(a1 && a2 && a1.id === a2.id, "bankPick is repeatable with the same rng");
    assert(M.bankPick("programming", "sequence", 3) === null, "no bank for programming");
    var bankKid = { ageBand: "7-8", subjects: {} };
    M.ensureBand(bankKid, "science");
    M.recordAnswer(bankKid, "science", { skillId: "facts", step: 1, correct: true, unaided: true, role: "work" });
    var bankBand = M.ensureBand(bankKid, "science");
    assert(bankBand.skills.facts.answers.length === 1, "bank answers are recorded for mastery");
    assert(bankBand.working.skillId === "habitat" && bankBand.working.step === 1 && bankBand.working.up === 0, "a mixed-in bank question does not move the working skill");
var wordKid = { ageBand: "5-6", subjects: {} };
    M.ensureBand(wordKid, "math");
    for (var li = 0; li < 10; li++) M.recordAnswer(wordKid, "math", { skillId: "word", step: 4, correct: true, unaided: true, role: "train" });
    assert(wordKid.subjects.math.bands["5-6"].skills.word.answers.length === 10, "math level answers on word problems are recorded");
    assert(M.mathProgress(wordKid).id === "expert", "earning step 4 on math word problems counts toward the math level");
  })();

  // Reading word-length ladder
  (function () {
    var L = M.LADDER;
    function kid() { return { ageBand: "5-6", subjects: {} }; }
    function feed(k, skill, lv, marks) {
      var moves = [];
      marks.forEach(function (m) {
        var r = M.ladderRecord(k, skill, lv, { correct: m !== 0, unaided: m === 1 });
        moves.push(r.moved);
      });
      return moves;
    }
    var k = kid();
    assert(M.ladderTier(k, "cvc", "beginner") === 1, "ladder: beginner starts on one word");
    assert(M.ladderTier(kid(), "cvc", "intermediate") === 3 && M.ladderTier(kid(), "cvc", "expert") === 4, "ladder: intermediate starts at 3, expert at 4");
    var m = feed(k, "cvc", "beginner", [1, 1, 1, 1]);
    assert(m.join("") === "0000" && k.wordLadder.cvc.tier === 1, "ladder: 4 right is not enough");
    m = feed(k, "cvc", "beginner", [1]);
    assert(m[0] === 1 && k.wordLadder.cvc.tier === 2, "ladder: 5 right in a row moves up one tier");
    m = feed(k, "cvc", "beginner", [0, 0, 0]);
    assert(m.join("") === "000" && k.wordLadder.cvc.tier === 2, "ladder: cooldown, the 3 answers after a move cannot move it");
    m = feed(k, "cvc", "beginner", [0]);
    assert(m[0] === -1 && k.wordLadder.cvc.tier === 1, "ladder: misses after the cooldown move down");
    var k2 = kid();
    feed(k2, "sight", "beginner", [1, 1, 1, 1, 0, 1, 1, 1, 1]);
    assert(k2.wordLadder.sight.tier === 1, "ladder: a miss breaks the run");
    m = feed(k2, "sight", "beginner", [1]);
    assert(m[0] === 1, "ladder: 8 of the last 10 right moves up");
    var k3 = kid();
    feed(k3, "sight", "beginner", [1, 0.5, 1, 1, 1, 1]);
    assert(k3.wordLadder.sight.tier === 1, "ladder: a helped answer does not count toward moving up");
    feed(k3, "sight", "beginner", [1]);
    assert(k3.wordLadder.sight.tier === 2, "ladder: then 5 unaided right moves up");
    var k4 = kid();
    M.ladderTier(k4, "cvc", "intermediate");
    feed(k4, "cvc", "intermediate", [1, 0, 1, 0]);
    assert(k4.wordLadder.cvc.tier === 2, "ladder: 2 misses in the last 3 move down");
    var k5 = kid();
    M.ladderTier(k5, "cvc", "intermediate");
    feed(k5, "cvc", "intermediate", [0, 1, 1, 0, 1, 1]);
    assert(k5.wordLadder.cvc.tier === 3, "ladder: spread-out misses stay");
    feed(k5, "cvc", "intermediate", [0, 1, 0]);
    assert(k5.wordLadder.cvc.tier === 2, "ladder: miss, right, miss moves down");
    var k6 = kid();
    for (var i = 0; i < 60; i++) M.ladderRecord(k6, "cvc", "beginner", { correct: true, unaided: true });
    assert(k6.wordLadder.cvc.tier === 3, "ladder: beginner tops out at tier 3");
    for (var j = 0; j < 60; j++) M.ladderRecord(k6, "cvc", "beginner", { correct: false, unaided: false });
    assert(k6.wordLadder.cvc.tier === 1, "ladder: and never goes below tier 1");
    var k7 = kid();
    for (var e = 0; e < 60; e++) M.ladderRecord(k7, "cvc", "expert", { correct: true, unaided: true });
    assert(k7.wordLadder.cvc.tier === 5, "ladder: expert reaches tier 5");
    for (var f = 0; f < 60; f++) M.ladderRecord(k7, "cvc", "expert", { correct: false, unaided: false });
    assert(k7.wordLadder.cvc.tier === 3, "ladder: expert floor is tier 3");
    assert(M.ladderTier(k7, "cvc", "beginner") === 3, "ladder: switching Home level keeps a tier that fits the new window");
    assert(M.ladderTier(k7, "cvc", "expert") === 3 && M.ladderTier(kid(), "cvc", "expert") === 4, "ladder: tiers stay in the level window");
    var k8 = kid();
    k8.wordLadder = { cvc: { tier: 5, hist: [], cool: 0, level: "expert" } };
    assert(M.ladderTier(k8, "cvc", "beginner") === 1, "ladder: dropping to Beginner from tier 5 restarts at one word");
    k8.wordLadder.cvc = "junk";
    assert(M.ladderTier(k8, "cvc", "beginner") === 1, "ladder: bad saved data is reset");
    assert(!M.isLadderSkill("reading", "story") && M.isLadderSkill("reading", "cvc") && !M.isLadderSkill("math", "cvc"), "ladder: only reading word skills");
    // content
    var counts = { 2: [2, 2], 3: [3, 4], 4: [5, 7], 5: [8, 14] };
    [2, 3, 4, 5].forEach(function (t) {
      var list = M.LADDER_TIERS[t];
      assert(list.length >= 40, "ladder tier " + t + " has 40+ items (" + list.length + ")");
      var seen = {};
      list.forEach(function (line) {
        var n = line.split(" ").length;
        assert(n >= counts[t][0] && n <= counts[t][1], "ladder tier " + t + " length: " + line);
        assert(!seen[line.toLowerCase()], "ladder tier " + t + " duplicate: " + line);
        seen[line.toLowerCase()] = 1;
        if (t <= 3) line.split(" ").forEach(function (w) { assert(M.ladderEasyWord(w), "ladder beginner word list: " + w + " in " + line); });
        var d = M.ladderDistractors(line, t, function () { return 0.42; }, 3);
        assert(d.length === 3, "ladder distractors for " + line);
        M.ladderCheckChoices(line, [line].concat(d), t).forEach(function (msg) { assert(false, "ladder tier " + t + " " + line + ": " + msg); });
        if (t <= 3) d.forEach(function (x) { x.split(" ").forEach(function (w) { assert(M.ladderEasyWord(w), "ladder beginner distractor word: " + w); }); });
      });
    });
    // generated questions
    [1, 2, 3, 4, 5].forEach(function (t) {
      for (var s = 0; s < 40; s++) {
        var q = M.makeQuestion({ subject: "reading", skillId: "sight", step: 2, band: "5-6", tier: t, seed: 900 + s * 7 + t });
        assert(q.ladderTier === t, "ladder question keeps its tier");
        var text = q.input === "flash" ? q.board.word : q.sound.speak;
        var n = text.split(" ").length;
        assert(t === 1 ? n === 1 : n >= counts[t][0] && n <= counts[t][1], "ladder question tier " + t + " length: " + text);
        if (q.input === "choice") {
          assert(q.readChoices === false && q.board.kind === "listen", "ladder choices are not read aloud");
          assert((" " + q.prompt.toLowerCase().replace(/[^a-z ]/g, " ") + " ").indexOf(" " + text.toLowerCase().replace(/[^a-z ]/g, " ") + " ") < 0, "ladder prompt does not show the answer");
          var right = q.choices.filter(function (c) { return c.id === q.correctChoiceId; })[0];
          assert(right && right.label === text, "ladder answer is among choices");
          var labels = q.choices.map(function (c) { return c.label; });
          M.ladderCheckChoices(text, labels, t, t === 1 ? null : null).forEach(function (msg) { if (t > 1) assert(false, "ladder question " + text + ": " + msg); });
          assert(labels.filter(function (x, i) { return labels.indexOf(x) === i; }).length === labels.length, "ladder labels unique");
        }
      }
      var off = M.makeQuestion({ subject: "reading", skillId: "sight", step: 2, band: "5-6", tier: t, seed: 5, soundOff: true });
      assert(off.input === "flash", "ladder with sound off uses flash cards");
    });
    // casing / proper nouns: the case of the reported bug, and the giveaway check
    var rh = M.ladderDistractors("red hat", 2, function () { return 0.1; }, 3);
    assert(rh.every(function (x) { return x === x.toLowerCase(); }), "ladder: lowercase phrase gets lowercase choices (" + rh.join(" / ") + ")");
    var cap4 = M.ladderDistractors("The cat sat on the mat.", 4, function () { return 0.7; }, 3);
    assert(cap4.every(function (x) { return /^[A-Z][a-z]* /.test(x) && /\.$/.test(x) && x.slice(1) === x.slice(1).toLowerCase(); }), "ladder: sentence choices all start with a capital, end with a period, no other capitals");
    ["tom", "ben", "grandma", "led", "rod", "gun", "nun"].forEach(function (w) { assert(!M.ladderAllowedWord(w, 2) && !M.ladderAllowedWord(w, 4), "ladder: never a wrong-choice word: " + w); });
    assert(M.ladderCheckChoices("red hat", ["red hat", "Rod hat", "red bat", "Led hat"], 2).length >= 2, "ladder check catches the Rod / Led bug");
    var extremes = 0, total = 0;
    [2, 3, 4, 5].forEach(function (t) {
      M.LADDER_TIERS[t].forEach(function (line, n) {
        var d2 = M.ladderDistractors(line, t, function () { return ((n * 37) % 100) / 100; }, 3);
        total++;
        if (d2.every(function (x) { return x.length > line.length; }) || d2.every(function (x) { return x.length < line.length; })) extremes++;
      });
    });
    assert(extremes * 10 <= total, "ladder: the answer is rarely the only longest / shortest choice (" + extremes + " of " + total + ")");
    window.__ladderExtremes = extremes + " of " + total;
    // Beginner: see the word + hear it + tap it
    [1, 2, 3].forEach(function (t) {
      for (var b = 0; b < 20; b++) {
        var sq = M.makeQuestion({ subject: "reading", skillId: "cvc", step: 1, band: "5-6", tier: t, seed: 300 + b * 11 + t, seeWord: true, soundOff: b % 2 === 0 });
        var target = sq.board.word;
        assert(sq.input === "choice" && sq.board.kind === "seeword", "beginner ladder is a see-and-tap choice (tier " + t + ")");
        assert(sq.sound && sq.sound.speak === target && sq.readChoices === false, "beginner ladder says the word, not the choices");
        assert(sq.choices.filter(function (c) { return c.label === target && c.id === sq.correctChoiceId; }).length === 1, "beginner ladder answer is the shown word");
      }
    });
    var keyed = 0;
    M.BANK.forEach(function (it) {
      if (it.subject !== "reading" || it.level !== "beginner" || it.passage) return;
      var k = M.beginnerKeyWord(it);
      if (/^Find the word|rhymes? with|the letter|same sound as/i.test(it.prompt)) {
        assert(k && k.key, "beginner bank item has a key word: " + it.id);
        if (!k) return;
        keyed++;
        var bq = M.makeQuestion({ subject: "reading", skillId: it.skill, step: it.step, band: it.band, bankItem: it, seed: 1 });
        assert(bq.board.kind === "seeword" && bq.board.word === k.key && bq.sound.speak === k.key, "beginner bank shows and says the key word: " + it.id);
        if (/^Find the word/.test(it.prompt)) assert(k.key === it.answer, "find-the-word key is the answer: " + it.id);
      }
    });
    assert(keyed >= 30, "beginner bank word items found (" + keyed + ")");
    assert(M.beginnerKeyWord({ subject: "reading", level: "intermediate", prompt: "Find the word: the." }) === null, "only Beginner bank items change");
    var plain = M.makeQuestion({ subject: "reading", skillId: "sight", step: 2, band: "5-6", seed: 3 });
    assert(plain.input === "flash" && !plain.ladderTier, "no tier given: the old single-word flash card");
  })();


  // ----- v13: physics topic skills -----
  (function () {
    var topics = M.topicsFor("physics");
    assert(topics.length >= 15, "physics has 15+ topic skills (" + topics.length + ")");
    assert(M.topicsFor("math").length === 0, "only physics has topic skills");
    var LV = { beginner: [1, 2], intermediate: [3, 4], expert: [5] };
    var total = 0;
    var PROPER = /^(The |the )?(Earth|Sun|Moon|Mars|Jupiter|Mercury|Isaac|Albert|Thomas|Marie|Archimedes|Pascal|Bernoulli|Boyle)/;
    topics.forEach(function (t) {
      assert(t.title && t.line && t.line.length <= 40, "topic " + t.id + " has a short title and line");
      M.BANDS.forEach(function (band) {
        assert(!M.SKILLS.physics[band].some(function (s) { return s.id === t.id; }), "topic " + t.id + " does not clash with a core skill");
        assert(M.skillMeta("physics", band, t.id).title === t.title, "skillMeta knows topic " + t.id);
      });
      var all = M.bankItems("physics", t.id);
      total += all.length;
      assert(all.length >= 15 && all.length <= 25, "topic " + t.id + " has 15-25 items (" + all.length + ")");
      Object.keys(LV).forEach(function (lv) {
        assert(M.bankLevelItems("physics", t.id, lv).length >= 4, "topic " + t.id + " has items at " + lv);
      });
      all.forEach(function (it) {
        var tag = "topic item " + it.id;
        assert(it.didYouKnow === true && it.explanation && !/^The answer is/.test(it.explanation), tag + " has a real Did you know? line");
        assert(it.explanation.length <= 150, tag + " fact is short");
        assert(it.readChoices === true, tag + " reads the choices aloud");
        assert(it.factRef && /^https?:\/\//.test(it.factRefUrl), tag + " notes the fact's reference");
        assert(["Original work written for Merit", "CC BY-SA 4.0", "MIT"].indexOf(it.license) >= 0, tag + " license");
        assert(it.source === "Written for Merit" || /^https?:\/\//.test(it.sourceUrl), tag + " source URL");
        assert(LV[it.level].indexOf(it.step) >= 0, tag + " step fits level");
        assert(it.choices.length === (it.level === "beginner" ? 3 : 4), tag + " choice count for level");
        var caps = {};
        it.choices.forEach(function (c) { if (!PROPER.test(c)) caps[/^[A-Z]/.test(c) ? "up" : "low"] = true; });
        assert(Object.keys(caps).length <= 1, tag + " choices share one capital style");
        var ends = {};
        it.choices.forEach(function (c) { ends[/[.!?]$/.test(c) ? "p" : "n"] = true; });
        assert(Object.keys(ends).length === 1, tag + " choices share end punctuation");
        var others = it.choices.filter(function (c) { return c !== it.answer; }).map(function (c) { return c.length; });
        assert(it.answer.length <= Math.max.apply(null, others) + 14, tag + " answer is not the long giveaway");
        var spoken = [it.prompt].concat(it.choices, [it.explanation]).map(M.speechText).join(" ");
        assert(!/[_\/=<>^]/.test(spoken), tag + " reads aloud without symbols: " + spoken.slice(0, 80));
      });
    });
    assert(total >= 300, "300+ physics topic items (" + total + ")");
    // Each topic and step makes a question from that topic and level, with the fact attached.
    topics.forEach(function (t) {
      for (var st = 1; st <= 5; st++) {
        var q = M.makeQuestion({ subject: "physics", skillId: t.id, step: st, band: "7-8", seed: st * 7 + 3 });
        var item = null;
        M.BANK.forEach(function (it) { if (it.id === q.bankId) item = it; });
        assert(item && item.skill === t.id, "topic q " + t.id + " step " + st + " comes from the topic");
        assert(item && item.level === M.bankLevelOf(st), "topic q " + t.id + " step " + st + " stays in level");
        assert(q.didYouKnow && q.didYouKnow === (item && item.explanation), "topic q " + t.id + " carries Did you know?");
        assert(q.readChoices === true, "topic q " + t.id + " reads choices");
        assert(M.grade(q, { choiceId: q.correctChoiceId }), "topic q " + t.id + " grades the answer");
      }
    });
    var old = M.makeQuestion({ subject: "physics", skillId: "physfacts", step: 3, band: "7-8", seed: 5 });
    assert(!old.didYouKnow, "older physics facts keep their feedback (no Did you know?)");
    // Tracking: topic answers are recorded per skill and listed apart; the score is unchanged.
    var kid = { ageBand: "7-8", subjects: {} };
    M.ensureBand(kid, "physics");
    var before = M.snapshot(kid, "physics");
    assert(before.topics.length === topics.length && before.topicsStarted === 0, "snapshot lists the topics");
    var tid = topics[0].id;
    for (var k = 0; k < 10; k++) M.recordAnswer(kid, "physics", { skillId: tid, step: 2, correct: true, unaided: true, role: "work", at: Date.now() });
    var after = M.snapshot(kid, "physics");
    var tr = after.topics.filter(function (x) { return x.id === tid; })[0];
    assert(tr.tried === 10 && tr.right === 10 && tr.earnedStep === 2, "topic mastery tracked per skill");
    assert(after.topicsStarted === 1, "topics started counted");
    assert(after.score === before.score, "topic answers do not move the core score");
    assert(after.working.skillId === before.working.skillId && after.working.step === before.working.step, "topic answers do not move the core path");
    assert(M.levelProgress(kid, "physics").earnedStep === 0, "topic answers do not change the earned level");
  })();

  // v15: Sight words (200 Dolch words, Beginner reading).
  (function () {
    var items = M.SIGHT_ITEMS || [];
    assert(items.length === 200, "sight words: 200 items (" + items.length + ")");
    assert(M.SIGHT_DOLCH && M.SIGHT_DOLCH.length === 220, "sight words: the 220-word Dolch list is loaded");
    var dolch = {};
    (M.SIGHT_DOLCH || []).forEach(function (w) { dolch[w] = true; });
    var homo = {};
    (M.SIGHT_HOMOPHONES || []).forEach(function (g) { g.forEach(function (w) { homo[w] = (homo[w] || []).concat(g.filter(function (x) { return x !== w; })); }); });
    ["to|two", "to|too", "for|four", "there|their", "no|know", "right|write", "by|buy", "eight|ate", "red|read"].forEach(function (pair) {
      var ab = pair.split("|");
      assert((homo[ab[0]] || []).indexOf(ab[1]) >= 0, "sight words: homophone list has " + pair);
    });
    var seenWord = {};
    items.forEach(function (it, i) {
      var tag = "sight " + it.id + " (" + it.answer + ")";
      assert(it.id === "sw-" + ("00" + (i + 1)).slice(-3), tag + " id in order");
      assert(it.subject === "reading" && it.skill === "sightwords" && it.level === "beginner" && (it.step === 1 || it.step === 2), tag + " is a Beginner reading sight-word item");
      assert(it.license === "Public domain" && /Dolch/.test(it.source) && /Dolch/.test(it.credit), tag + " carries the Dolch source and license");
      assert(dolch[it.answer], tag + " is a Dolch word");
      assert(!seenWord[it.answer], tag + " word is not repeated");
      seenWord[it.answer] = true;
      assert(it.prompt === "Find the word: " + it.answer + ".", tag + " prompt");
      assert(it.choices.length === 4 && it.choices[0] === it.answer, tag + " has 4 choices with the answer");
      assert(it.choices.filter(function (c) { return c === it.answer; }).length === 1, tag + " exactly one correct answer");
      var low = it.choices.map(function (c) { return c.toLowerCase(); });
      assert(low.filter(function (c, k) { return low.indexOf(c) === k; }).length === 4, tag + " choices are all different");
      it.choices.forEach(function (c, k) {
        assert(dolch[c], tag + " choice is a Dolch word: " + c);
        assert(/^[a-z]+$/.test(c) || (c === "I" && k === 0), tag + " casing (lowercase, I only as its own answer): " + c);
        it.choices.forEach(function (d, m) {
          if (m > k) assert((homo[c] || []).indexOf(d) < 0 && (homo[d] || []).indexOf(c) < 0, tag + " no homophones among the choices: " + c + "/" + d);
        });
      });
      if (it.say) {
        var said = it.say.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/);
        assert(said.indexOf(it.answer.toLowerCase()) >= 0, tag + " carrier uses the word");
        it.choices.slice(1).forEach(function (c) { assert(said.indexOf(c) < 0, tag + " carrier never says a wrong choice: " + c); });
      }
      var q = M.makeQuestion({ subject: "reading", skillId: "sightwords", step: it.step, band: "5-6", bankItem: it, seed: i + 1 });
      assert(q.board && q.board.kind === "seeword" && q.board.word === it.answer, tag + " shows the word big");
      assert(q.sound && q.sound.kind === "prompt" && q.sound.speak === it.answer && (!it.say || q.sound.carrier === it.say), tag + " says the word");
      assert(q.speakPrompt === "Find this word." && q.prompt === "Match:", tag + " see it, hear it, tap it");
      assert(q.input === "choice" && q.choices.length === 4 && !q.readChoices, tag + " four choices, never read aloud");
      assert(q.sightWord === it.answer, tag + " is tracked as a sight word");
      assert(M.grade(q, { choiceId: q.correctChoiceId }) && q.choices.filter(function (c) { return c.id !== q.correctChoiceId; }).every(function (c) { return !M.grade(q, { choiceId: c.id }); }), tag + " grades one right answer");
    });
    // Asked-for confusables are used.
    [["was", "saw"], ["on", "no"], ["the", "then"], ["of", "off"], ["where", "were"]].forEach(function (pr) {
      var it = items.filter(function (x) { return x.answer === pr[0]; })[0];
      assert(it && it.choices.indexOf(pr[1]) > 0, "sight words: " + pr[0] + " has " + pr[1] + " as a wrong choice");
    });
    ["a", "I", "read", "live", "does", "us", "use"].forEach(function (w) {
      var it = items.filter(function (x) { return x.answer === w; })[0];
      assert(it && it.say, "sight words: " + w + " has a short carrier sentence for the voice");
    });
    // One-word ladder tier with a sight word: same see-it question, counted for the ladder skill and the word.
    var swq = M.makeQuestion({ subject: "reading", skillId: "sight", step: 2, band: "5-6", tier: 1, seeWord: true, sightItem: items[83], seed: 4 });
    assert(swq.ladderTier === 1 && swq.board.kind === "seeword" && swq.board.word === items[83].answer, "sight words: one-word ladder tier shows the sight word");
    assert(swq.choices.map(function (c) { return c.label; }).sort().join() === items[83].choices.slice().sort().join(), "sight words: ladder tier uses the vetted choices");
    assert(swq.sightWord === items[83].answer && swq.skillId === "sight", "sight words: ladder question stays a ladder-skill question");
    // Per-word mastery: two right first tries in a row = known; a miss undoes it.
    var kid = { ageBand: "5-6", subjects: {} };
    M.ensureBand(kid, "reading");
    var before = M.snapshot(kid, "reading");
    assert(before.sight && before.sight.total === 200 && before.sight.known === 0, "sight words: snapshot lists 0 of 200");
    M.sightRecord(kid, "was", true);
    assert(M.sightProgress(kid).known === 0, "sight words: one right is not known yet");
    M.sightRecord(kid, "was", true);
    assert(M.sightProgress(kid).known === 1, "sight words: two rights in a row = known");
    M.sightRecord(kid, "was", false);
    assert(M.sightProgress(kid).known === 0, "sight words: a miss makes it not known");
    // The skill record exists, and its answers never move the reading score, path, level or ladder.
    for (var k = 0; k < 12; k++) M.recordAnswer(kid, "reading", { skillId: "sightwords", step: 1, correct: true, unaided: true, role: "work", at: Date.now() });
    var after = M.snapshot(kid, "reading");
    assert(after.score === before.score && after.working.skillId === before.working.skillId && after.working.step === before.working.step, "sight words: answers do not move the reading score or path");
    assert(M.levelProgress(kid, "reading").earnedStep === 0, "sight words: answers do not change the earned level");
    assert(!kid.wordLadder || !Object.keys(kid.wordLadder).length, "sight words: answers do not touch the word ladder");
    assert(after.skills.every(function (s) { return s.id !== "sightwords"; }), "sight words: not one of the scored core skills");
    // Picking: new words come in list order; missed words come back first.
    var fresh = { ageBand: "5-6", subjects: {} };
    var r = 0.123;
    function rng() { r = (r * 9301 + 49297) % 233280 / 233280; return r; }
    for (var t = 0; t < 30; t++) assert(M.sightPick(fresh, rng).rank <= 6, "sight words: a new player starts with the first words");
    M.sightRecord(fresh, "because", false);
    var back = 0;
    for (var u = 0; u < 200; u++) if (M.sightPick(fresh, rng).answer === "because") back++;
    assert(back > 50, "sight words: a missed word comes back often (" + back + " of 200)");
    // Words in progress are finished: a right first try brings the word back soon, so it can become known.
    var prog = { ageBand: "5-6", subjects: {} }, rounds = 0;
    for (var g = 0; g < 40; g++) { var pw = M.sightPick(prog, rng, (prog.sightRecent || []).slice(-2)); prog.sightRecent = (prog.sightRecent || []).concat([pw.answer]); M.sightRecord(prog, pw.answer, true); rounds++; }
    assert(M.sightProgress(prog).known >= 12, "sight words: always right for 40 words -> at least 12 known (" + M.sightProgress(prog).known + ")");
    assert(prog.sightRecent.every(function (x, i) { return i === 0 || x !== prog.sightRecent[i - 1]; }), "sight words: never the same word twice in a row");
    for (var w = 0; w < 6; w++) { M.sightRecord(fresh, items[w].answer, true); M.sightRecord(fresh, items[w].answer, true); }
    var newer = 0;
    for (var v = 0; v < 100; v++) { var pk = M.sightPick(fresh, rng, ["because"]); if (pk.rank > 6) newer++; }
    assert(newer > 70, "sight words: known words step aside for new ones (" + newer + " of 100)");
  })();

  // v25 Robot arrows: every generated grid is solvable (BFS), sizes and move counts fit the level, budgets hold;
  // the "Missing step" (fill in the hole) questions are gone and old saves drop them cleanly.
  (function () {
    var spec = M.ROBOT_SPEC;
    [1, 2, 3, 4, 5].forEach(function (step) {
      var stems = {}, bad = [];
      for (var i = 0; i < 300; i++) {
        var q = M.makeQuestion({ subject: "programming", skillId: "robot", step: step, band: "7-8", seed: 50000 + step * 1000 + i });
        var g = q.grid, sp = spec[step];
        stems[q.stem] = 1;
        var sol = M.robotSolve(g);
        if (!sol || sol.length !== q.sequence.length) { bad.push("not shortest/solvable " + q.stem); continue; }
        if (!M.runMoves(g, q.sequence).done || !M.grade(q, { sequence: q.sequence })) bad.push("solution fails " + q.stem);
        if (q.sequence.length < sp.min || q.sequence.length > sp.max) bad.push("length " + q.sequence.length + " " + q.stem);
        if (g.w !== sp.w || g.h !== sp.h || (g.items || []).length !== sp.items) bad.push("size/gems " + q.stem);
        if (q.robot.mode !== (step <= 2 ? "step" : "plan")) bad.push("mode " + q.robot.mode);
        if (step === 5) {
          if (!g.key || !g.door) bad.push("no key/door " + q.stem);
          if (!(q.robot.budget >= q.robot.best && q.robot.budget <= q.robot.best + 2)) bad.push("budget " + q.robot.budget + " best " + q.robot.best);
          if (g.door && M.robotSolve({ w: g.w, h: g.h, start: g.start, goal: g.goal, walls: g.walls.concat([g.door]), items: g.items })) bad.push("door does not matter " + q.stem);
          var long = q.sequence.concat([]); while (long.length <= q.robot.budget) long = long.concat(["L", "R"]);
          if (M.grade(q, { sequence: long })) bad.push("over budget graded right");
        } else if (q.robot.budget) bad.push("budget below Expert");
        if (!/star/i.test(q.speakPrompt)) bad.push("goal not said: " + q.speakPrompt);
        if (M.grade(q, { sequence: q.sequence.slice(0, -1) })) bad.push("one short graded right " + q.stem);
      }
      var variety = Object.keys(stems).length;
      assert(!bad.length, "robot step " + step + ": 300 grids solvable and in range (" + bad.slice(0, 3).join("; ") + ")");
      assert(variety >= (step === 1 ? 40 : 200), "robot step " + step + ": many different grids (" + variety + " of 300)");
    });
    // gems must be picked up, the door needs the key
    var q3 = M.makeQuestion({ subject: "programming", skillId: "robot", step: 4, band: "7-8", seed: 77 });
    var bare = M.robotSolve({ w: q3.grid.w, h: q3.grid.h, start: q3.grid.start, goal: q3.grid.goal, walls: q3.grid.walls, items: [] });
    if (bare && bare.length < q3.sequence.length) assert(!M.grade(q3, { sequence: bare }), "robot: skipping the gems is not right");
    // removed: Missing step
    var all = [];
    Object.keys(M.SKILLS.programming).forEach(function (b) { M.SKILLS.programming[b].forEach(function (sk) { all.push(sk.id); }); });
    assert(all.indexOf("orderbug") < 0 && ["5-6", "7-8", "9-10"].every(function (b) { return M.SKILLS.programming[b].some(function (sk) { return sk.id === "robot"; }); }), "robot: in every band, Missing step gone");
    var threw = false; try { M.makeQuestion({ subject: "programming", skillId: "orderbug", step: 1, seed: 1 }); } catch (e) { threw = true; }
    assert(threw, "robot: no Missing step questions can be made");
    var old = { id: "o", name: "O", ageBand: "5-6", subjects: { programming: { bands: { "5-6": { placed: true, working: { skillId: "orderbug", step: 3, up: 1, down: 0, support: false },
      skills: { orderbug: { answers: [{ correct: true, unaided: true, step: 3 }], solid: false }, sequence: { answers: [], solid: false } }, tracks: { orderbug: { step: 3 } } } } } },
      recent: { orderbug: ["orderbug|1|x"] }, cycles: { v: 1, pools: { "gen|programming|orderbug|1": { seen: { a: 1 }, n: 1, cycle: 1 } } } };
    var band = M.ensureBand(old, "programming");
    assert(!band.skills.orderbug && !band.tracks.orderbug && band.working.skillId !== "orderbug" && !old.recent.orderbug && !old.cycles.pools["gen|programming|orderbug|1"], "robot: an old save drops Missing step cleanly");
    var snap = M.snapshot(old, "programming");
    assert(JSON.stringify(snap).indexOf("orderbug") < 0 && JSON.stringify(snap).indexOf("Missing step") < 0, "robot: no dead skill in the snapshot");
  })();

  // v24 No-repeat cycles: every item of a pool once before any repeat; persists; reset clears; old saves migrate.
  (function () {
    function kidOf(band) { return { id: "c", name: "C", ageBand: band || "7-8", subjects: {} }; }
    // Bank pools: the 3 biggest bank lists plus Astronomy, a physics topic and a reading bank list.
    var groups = {};
    M.BANK.forEach(function (it) { if (it.skill === "sightwords" || it.skill === "wordmatch") return; var k = it.subject + "|" + it.skill + "|" + it.step; (groups[k] = groups[k] || []).push(it); });
    var keys = Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length; });
    var pick = keys.slice(0, 3);
    ["astronomy|astro|1", "astronomy|astro|5"].concat(keys.filter(function (k) { return /^physics\|/.test(k); }).slice(0, 1), keys.filter(function (k) { return /^reading\|/.test(k); }).slice(0, 1))
      .forEach(function (k) { if (groups[k] && pick.indexOf(k) < 0) pick.push(k); });
    pick.forEach(function (k) {
      var parts = k.split("|"), list = groups[k], kid = kidOf();
      var shown = [], firstCycle = [], ok = true;
      for (var i = 0; i < list.length * 2; i++) {
        var q = M.makeQuestion({ subject: parts[0], skillId: parts[1], step: +parts[2], band: "7-8", seed: 7000 + i, profile: kid });
        shown.push(q.cycleId);
        if (i === list.length - 1) {
          firstCycle = shown.slice();
          var set = {}; firstCycle.forEach(function (x) { set[x] = 1; });
          ok = Object.keys(set).length === list.length && list.every(function (it) { return set[it.id]; });
        }
        if (i === list.length && q.cycleId === shown[list.length - 1]) ok = false;   // not the last one first again
        if (i === list.length + 3) { kid = JSON.parse(JSON.stringify(kid)); }   // saved and loaded midway
      }
      var second = {}; shown.slice(list.length).forEach(function (x) { second[x] = 1; });
      assert(ok && Object.keys(second).length === list.length, "cycles: bank pool " + k + " (" + list.length + " items) shows every item once per cycle, twice over");
    });
    // Sight words (200) and Word match (100): every word once before any repeat when none is missed.
    [["sightwords", function (p, r, a) { return M.sightPick(p, r, a); }, M.SIGHT_ITEMS], ["wordmatch", function (p, r, a) { return M.wordPick(p, r, a); }, M.WORD_ITEMS]].forEach(function (t) {
      var kid = kidOf("5-6"), got = {}, recent = [], dup = 0;
      for (var i = 0; i < t[2].length; i++) {
        var it = t[1](kid, Math.random, recent.slice(-2));
        if (got[it.answer]) dup++;
        got[it.answer] = 1; recent.push(it.answer);
        M.cycleMark(kid, "list|reading|" + t[0], it.answer);
        if (t[0] === "sightwords") M.sightRecord(kid, it.answer, true); else M.wordRecord(kid, it.answer, true);
      }
      assert(!dup && Object.keys(got).length === t[2].length, "cycles: all " + t[2].length + " " + t[0] + " once before any repeat (" + dup + " repeats)");
      var next = t[1](kid, Math.random, []);
      assert(next && M.cyclePool(kid, "list|reading|" + t[0]).cycle === 2 && next.answer !== recent[recent.length - 1], "cycles: " + t[0] + " starts a new cycle, not with the last word");
    });
    // A missed word may come back once later in the same cycle, then not again until the cycle is done.
    (function () {
      var kid = kidOf("5-6"), w = M.SIGHT_ITEMS[0].answer, back = 0;
      M.cycleMark(kid, "list|reading|sightwords", w); M.sightRecord(kid, w, false);
      for (var i = 0; i < 60; i++) {
        var it = M.sightPick(kid, Math.random, []);
        if (it.answer === w) { back++; M.sightRecord(kid, w, false); }
        M.cycleMark(kid, "list|reading|sightwords", it.answer);
        if (it.answer !== w) M.sightRecord(kid, it.answer, true);
      }
      assert(back === 1, "cycles: a missed sight word comes back exactly once in the cycle (" + back + ")");
    })();
    // Generated questions: no question key twice inside a cycle (math, shapes, programming, reading ladder).
    [["math", "add", 1], ["math", "add", 3], ["math", "shapes", 2], ["programming", "sequence", 2], ["astronomy", "astrospace", 3]].forEach(function (g) {
      var kid = kidOf("7-8"), bad = 0, n = 0, inCycle = {}, cycle = 1;
      for (var i = 0; i < 160; i++) {
        var q;
        try { q = M.makeQuestion({ subject: g[0], skillId: g[1], step: g[2], band: "7-8", seed: 9000 + i, profile: kid }); } catch (e) { return; }
        var pool = M.cyclePool(kid, "gen|" + g[0] + "|" + g[1] + "|" + g[2]);
        if (pool.cycle !== cycle) { cycle = pool.cycle; inCycle = {}; }
        if (inCycle[q.key]) bad++;
        inCycle[q.key] = 1; n++;
      }
      assert(n === 160 && !bad, "cycles: generated " + g.join(" ") + " never repeats a question inside a cycle (" + bad + " repeats, " + cycle + " cycles)");
    });
    // Reset clears that subject's cycles only; Reset all clears every cycle.
    var kid = kidOf();
    M.makeQuestion({ subject: "science", skillId: pick[0].split("|")[1], step: 3, band: "7-8", seed: 1, profile: kid });
    M.makeQuestion({ subject: "math", skillId: "add", step: 1, band: "7-8", seed: 1, profile: kid });
    var before = Object.keys(kid.cycles.pools);
    M.resetProfileProgress(kid, "math");
    var after = Object.keys(kid.cycles.pools);
    assert(before.some(function (k) { return k.split("|")[1] === "math"; }) && after.every(function (k) { return k.split("|")[1] !== "math"; }) && after.length === before.filter(function (k) { return k.split("|")[1] !== "math"; }).length, "cycles: Reset Math clears only Math cycles (" + after.join(",") + ")");
    M.resetProfileProgress(kid, "all");
    assert(!Object.keys(kid.cycles.pools).length, "cycles: Reset all clears every cycle");
    // Migration: an old save (no cycles) keeps its recent questions as seen; a broken cycles field is rebuilt.
    var old = kidOf();
    var oq = M.makeQuestion({ subject: "math", skillId: "add", step: 1, band: "7-8", seed: 3 });
    old.recent = { add: [oq.key] };
    M.cyclesOf(old);
    assert(M.cycleSeen(old, "gen|math|add|1", oq.key) && old.cycles.v === 1, "cycles: old save migrates (recent questions count as seen)");
    var broken = kidOf(); broken.cycles = "oops";
    var bq = M.makeQuestion({ subject: "math", skillId: "add", step: 2, band: "7-8", seed: 4, profile: broken });
    assert(broken.cycles && broken.cycles.v === 1 && M.cycleSeen(broken, "gen|math|add|2", bq.key), "cycles: a broken save is rebuilt");
  })();

  // v23 Word match: 100 everyday words, one right answer, look-alike distractors from the list, no homophones.
  (function () {
    var items = M.WORD_ITEMS || [], words = items.map(function (it) { return it.answer; });
    assert(items.length === 100 && M.WORD_SKILL.total === 100, "word match: 100 items");
    assert(words.every(function (w, i) { return words.indexOf(w) === i; }), "word match: no duplicate words");
    assert(words.every(function (w) { return (M.SIGHT_DOLCH || []).indexOf(w) < 0 && !(M.SIGHT_ITEMS || []).some(function (s) { return s.answer === w; }); }), "word match: no Dolch sight word");
    var homo = (M.WORD_HOMOPHONES || []).concat(M.SIGHT_HOMOPHONES || []);
    function same(a, b) { return homo.some(function (g) { return g.indexOf(a) >= 0 && g.indexOf(b) >= 0; }); }
    ["sun", "son", "eye", "I", "nose", "knows", "ant", "aunt", "ball", "bawl"].forEach(function (w, i, a) { if (i % 2 === 0) assert(same(w, a[i + 1]), "word match: knows " + w + " sounds like " + a[i + 1]); });
    items.forEach(function (it) {
      var tag = "word match " + it.id + " " + it.answer;
      assert(it.skill === "wordmatch" && it.level === "beginner" && it.band === "5-6" && it.readChoices === false, tag + " is a Beginner reading item");
      assert(it.choices.length === 4 && it.choices.filter(function (c) { return c === it.answer; }).length === 1, tag + " four choices, one right");
      assert(it.choices.every(function (c, i) { return it.choices.indexOf(c) === i && words.indexOf(c) >= 0 && c === c.toLowerCase(); }), tag + " choices are list words, lower case, no repeats");
      it.choices.forEach(function (a) { it.choices.forEach(function (b) { assert(a === b || !same(a, b), tag + " no homophones: " + a + " / " + b); }); });
      assert(it.prompt === "Find the word: " + it.answer + ".", tag + " prompt");
    });
    var q = M.makeQuestion({ subject: "reading", skillId: "wordmatch", step: 1, band: "5-6", bankItem: items[0], seed: 3 });
    assert(q.matchWord === items[0].answer && q.choices.length === 4, "word match: question carries the word");
    var kid = { id: "w", name: "W", ageBand: "5-6", subjects: {} };
    var first = M.wordPick(kid, function () { return 0; }, []);
    assert(first && first.answer === "mom", "word match: new words come in list order (" + (first && first.answer) + ")");
    M.wordRecord(kid, "mom", true); M.wordRecord(kid, "mom", true); M.sightRecord(kid, "the", true);
    var wp = M.wordProgress(kid), sp = M.sightProgress(kid);
    assert(wp.known === 1 && wp.total === 100 && sp.tried === 1 && sp.known === 0 && !kid.sightWords.mom && kid.wordMatch.mom, "word match: kept apart from sight words");
    assert(M.snapshot(kid, "reading").words.known === 1, "word match: snapshot shows words known");
    M.resetProfileProgress(kid, "reading");
    assert(M.wordProgress(kid).known === 0 && M.wordProgress(kid).tried === 0, "word match: Reset Reading clears it");
    assert(M.extraSkillsFor("reading").some(function (x) { return x.id === "wordmatch"; }) && M.skillIdsOf("reading").indexOf("wordmatch") >= 0, "word match: a Reading skill");
  })();

  // v26 Science topics: Plants, Animals, Human body, Matter (Beginner questions, all written for Merit).
  (function () {
    var topics = M.topicsFor("science");
    assert(topics.map(function (t) { return t.id; }).join(",") === "splants,sanimals,sbody,smatter", "science topics: four topics");
    var all = M.SCI_TOPIC_ITEMS || [], prompts = {};
    topics.forEach(function (t) {
      var lv = { beginner: 0, intermediate: 0, expert: 0 };
      all.filter(function (it) { return it.skill === t.id; }).forEach(function (it) {
        lv[it.level]++;
        var tag = "science topic " + it.id;
        assert(it.subject === "science" && M.isTopicSkill("science", it.skill), tag + " is a Science topic item");
        assert(it.choices.length === 3 && it.choices.filter(function (c) { return c === it.answer; }).length === 1, tag + " three choices with one right answer");
        var lower = it.choices.map(function (c) { return c.toLowerCase(); });
        assert(lower.every(function (c, i) { return lower.indexOf(c) === i; }), tag + " choices differ");
        assert(it.explanation && it.explanation.length > 10 && it.whyLabel === "Here's why" && it.didYouKnow && it.readChoices, tag + " has a read-aloud Here's why");
        assert(/^sci-/.test(it.scene) && M.SCI_SCENE_IDS.indexOf(it.scene) >= 0, tag + " has a science picture");
        assert((it.step === 1 || it.step === 2) && it.level === "beginner", tag + " Beginner step");
        [it.prompt, it.explanation].concat(it.choices).forEach(function (x) { assert(!/[0-9%°~&<>#@*^_=+\[\]{}|\\\/]/.test(x), tag + " speech-friendly: " + x); });
        assert(!prompts[it.prompt.toLowerCase()], tag + " prompt not repeated");
        prompts[it.prompt.toLowerCase()] = true;
      });
      assert(lv.beginner >= 40 && lv.intermediate === 0 && lv.expert === 0, "science topic " + t.id + ": 40+ Beginner (" + JSON.stringify(lv) + ")");
      assert(M.bankItems("science", t.id, 1).length >= 20 && M.bankItems("science", t.id, 2).length >= 20, "science topic " + t.id + ": both Beginner steps filled");
      var q = M.makeQuestion({ subject: "science", skillId: t.id, step: 1, band: "7-8", seed: 5 });
      var right = q.choices.filter(function (c) { return c.id === q.correctChoiceId; })[0];
      var item = all.filter(function (it) { return it.id === q.bankId; })[0];
      assert(item && right && right.label === item.answer && q.whyLabel === "Here's why" && q.didYouKnow === item.explanation && q.board.kind === "scene", "science topic " + t.id + ": question shows the picture, right answer and Here's why");
      // v24 no-repeat: every item in the step pool comes once before any repeats.
      var kid = { id: "c", name: "C", ageBand: "5-6", subjects: {} }, got = {}, pool = M.bankItems("science", t.id, 2);
      for (var i = 0; i < pool.length; i++) {
        var it2 = M.bankPick("science", t.id, 2, Math.random, kid);
        got[it2.id] = true;
        M.cycleMark(kid, M.bankPoolKey(it2), it2.id);
      }
      assert(Object.keys(got).length === pool.length, "science topic " + t.id + ": cycles through all " + pool.length + " before repeating");
    });
    // v27: every Animals question has its own matching picture from the animal art library.
    all.filter(function (it) { return it.skill === "sanimals"; }).forEach(function (it) {
      var tag = "v27 animals art " + it.id, key = String(it.scene).replace(/^sci-an-/, ""), art = (M.SCI_ANIMAL_ART || {})[key];
      assert(/^sci-an-/.test(it.scene) && art, tag + " has a matching art id (" + it.scene + ")");
      if (!art) return;
      var names = (art.row || []).map(function (r) { return r[0]; }).concat(art.pick ? [art.pick] : [], art.pair || [], art.solo ? [art.solo] : [], art.seq ? [art.seq] : [], art.from ? [art.from] : []);
      assert(names.length && names.every(function (n) { return M.SCI_ANIMAL_LIBRARY.indexOf(n) >= 0; }), tag + " draws only library animals");
      var shown = art.row ? art.row.map(function (r) { return r[1]; }) : art.tiles ? art.tiles.map(function (t) { return t[1]; }) : null;
      if (shown) assert(shown.slice().sort().join("|") === it.choices.slice().sort().join("|"), tag + " pictures every answer choice, labeled the same");
      var svg = M.sciSceneSvg(it.scene);
      assert(/<svg/.test(svg) && /radialGradient/.test(svg), tag + " draws with 3D gradients");
    });
    var anIds = Object.keys(M.SCI_ANIMAL_ART || {});
    assert(anIds.length >= 42 && M.SCI_ANIMAL_LIBRARY.length >= 40, "v27 animals art: library loaded (" + M.SCI_ANIMAL_LIBRARY.length + " animals)");
    ["dog", "puppy", "cat", "kitten", "cow", "calf", "horse", "pig", "sheep", "bird", "chick", "duck", "owl", "penguin", "fish", "shark", "whale", "dolphin", "frog", "tadpole", "turtle", "snake", "lizard", "butterfly", "caterpillar", "bee", "ladybug", "ant", "spider", "bear", "lion", "elephant", "giraffe", "monkey", "rabbit", "camel", "polarbear", "kangaroo", "chicken", "egg"].forEach(function (n) {
      assert(M.SCI_ANIMAL_LIBRARY.indexOf(n) >= 0 && /<svg/.test(M.animalSvg(n)), "v27 animals art: library has " + n);
    });
    ["forest", "ocean", "desert", "arctic", "pond", "farm", "jungle", "fur", "feathers", "scales", "shell"].forEach(function (n) { assert(M.SCI_ANIMAL_TILES.indexOf(n) >= 0, "v27 animals art: tile " + n); });
    assert(M.topicMeta("science", "sanimals").scene === "sci-an-card" && /<svg/.test(M.sciSceneSvg("sci-an-card")), "v27 animals art: new topic card picture");
    var kid2 = { id: "d", name: "D", ageBand: "5-6", subjects: {} };
    M.recordAnswer(kid2, "science", { skillId: "splants", step: 1, correct: true, unaided: true, role: "work" });
    assert(M.snapshot(kid2, "science").topics.filter(function (t) { return t.id === "splants"; })[0].tried === 1, "science topics: answers tracked as a skill");
    assert(M.skillIdsOf("science").indexOf("smatter") >= 0, "science topics: part of Science skills for reset");
    M.resetProfileProgress(kid2, "science");
    assert(M.snapshot(kid2, "science").topicsStarted === 0, "science topics: Reset Science clears them");
    assert(M.speechText("Here's why. Plants need water.") === "Here's why. Plants need water.", "science topics: Here's why reads cleanly");
  })();

  // v28 Living / nonliving pictures: every generated variant and every Beginner living bank item shows each choice
  // (single or pair) on its own card, labeled with the exact button text, in button order.
  (function () {
    M.makeQuestion({ subject: "science", skillId: "living", step: 1, band: "5-6", seed: 1 });
    (M.LIVING_THINGS || []).concat(M.NONLIVING_THINGS || []).forEach(function (t) { assert(M.livingArtFor(t), "v28 living art: " + t + " has a picture"); });
    assert((M.LIVING_THINGS || []).length >= 16 && (M.NONLIVING_THINGS || []).length >= 12, "v28 living art: item lists exposed");
    var forms = {}, bad = 0;
    function check(q, tag) {
      var labels = q.choices.map(function (c) { return c.label; });
      var ok = q.board.kind === "scene" && q.board.scene === "sci-lv:" + labels.join("|") && labels.every(function (l) { return M.livingArtFor(l); });
      var svg = ok ? M.livingSvg(q.board.scene) : "";
      var shownText = (svg.match(/<text[^>]*>[^<]*<\/text>/g) || []).map(function (t) { return t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&"); }).join(" ");
      ok = ok && shownText === labels.join(" ") && !/correct|right|answer/i.test(svg) && /radialGradient/.test(svg);
      if (!ok) { bad++; if (bad < 5) assert(false, tag + " living art matches the choices: " + labels.join(" / ")); }
    }
    for (var st = 1; st <= 5; st++) for (var s = 0; s < 400; s++) {
      var q = M.makeQuestion({ subject: "science", skillId: "living", step: st, band: "5-6", seed: s * 13 + st, support: s % 4 === 0 });
      forms[q.prompt] = (forms[q.prompt] || 0) + 1;
      check(q, "v28 living gen " + q.prompt);
    }
    assert(bad === 0, "v28 living art: every generated living question has matching art (" + bad + " bad)");
    ["Which one is living?", "Which one can grow?", "Which one is nonliving?", "Which one needs food?", "Which pair is living?"].forEach(function (f) { assert(forms[f] > 50, "v28 living art: form tested: " + f); });
    var pairs = M.makeQuestion({ subject: "science", skillId: "living", step: 2, band: "5-6", seed: 1 });
    var items = M.BANK.filter(function (i) { return i.subject === "science" && i.level === "beginner" && /\b(living|alive)\b/i.test(i.prompt) && i.choices.every(function (c) { return M.livingArtFor(c); }); });
    assert(items.length >= 6, "v28 living art: Beginner living bank items found (" + items.length + ")");
    items.forEach(function (it) { check(M.makeQuestion({ subject: "science", skillId: it.skill, step: it.step, band: "5-6", bankItem: it, seed: 3 }), "v28 living bank " + it.id); });
    assert(bad === 0, "v28 living art: every living bank item has matching art");
  })();

  // v21 Astronomy: 100 new space questions, tracked as their own section under Science & Engineering.
  (function () {
    var items = M.ASTRO_ITEMS || [];
    var lv = { beginner: 0, intermediate: 0, expert: 0 };
    items.forEach(function (it) {
      lv[it.level]++;
      var tag = "astronomy " + it.id;
      assert(it.subject === "astronomy" && it.skill === "astro", tag + " is an astronomy item");
      assert(it.choices.filter(function (c) { return c === it.answer; }).length === 1, tag + " one right answer");
      assert(it.choices.length === (it.level === "beginner" ? 3 : 4), tag + " choice count");
      assert(it.didYouKnow && it.explanation && it.readChoices, tag + " has a read-aloud Did you know");
      assert(/^https:\/\/(science|spaceplace|www|nssdc\.gsfc)\.nasa\.gov\//.test(it.factRefUrl), tag + " fact checked against NASA");
      [it.prompt, it.explanation].concat(it.choices).forEach(function (t) { assert(!/[%°~&<>#@*^_=+\[\]{}|\\\/]/.test(t), tag + " symbol-free: " + t); });
    });
    assert(items.length === 286 && lv.beginner === 170 && lv.intermediate === 63 && lv.expert === 53, "astronomy: 286 items, 170 / 63 / 53 (" + JSON.stringify(lv) + ")");
    // v22: moons, Earths inside, dwarf planets and Kuiper Belt. Numbers are words (read aloud naturally); counts that grow say "more than".
    var v22 = items.slice(100, 186);
    assert(v22.length === 86, "astronomy v22: 86 new items");
    assert(v22.filter(function (it) { return /Makemake/.test(it.prompt + it.answer + it.choices.join(" ")); }).length >= 6, "astronomy v22: several Makemake questions");
    assert(M.speechText("Makemake and Haumea") === "Mah-kee Mah-kee and How-may-uh" && M.speechText("Kuiper Belt") === "Kye-per Belt", "astronomy v22: space names read aloud the right way");
    v22.forEach(function (it) {
      [it.prompt, it.explanation].concat(it.choices).forEach(function (t) { assert(!/[0-9]/.test(t), "astronomy v22 " + it.id + " numbers spoken as words: " + t); });
    });
    var giant = items.filter(function (it) { return /(Jupiter|Saturn|Uranus|Neptune)/.test(it.prompt) && /many moons|lots of moons|how many are known|About how many does/.test(it.prompt); });
    assert(giant.length >= 3 && giant.every(function (it) { return /^More than/.test(it.answer); }), "astronomy v22: giant planet moon counts say more than");
    ["Ganymede", "Titan", "Triton", "Phobos and Deimos", "About one thousand three hundred", "About seven hundred sixty", "About sixty three", "About fifty seven", "About eighteen", "About six or seven", "Haumea", "Ceres", "Tombaugh Regio", "Charon", "Five", "The Kuiper Belt"].forEach(function (a) {
      assert(v22.some(function (it) { return it.answer === a; }), "astronomy v22: has an item answered " + a);
    });
    // v30: 100 more Beginner questions (steps 1-2), each with a picture, a Here's why fact, no repeats of older prompts.
    var v30 = items.slice(186), seenP = {};
    items.slice(0, 186).forEach(function (it) { seenP[it.prompt.toLowerCase()] = 1; });
    assert(v30.length === 100 && v30.every(function (it) { return it.level === "beginner" && (it.step === 1 || it.step === 2); }), "astronomy v30: 100 new Beginner items");
    v30.forEach(function (it) {
      var tg = "astronomy v30 " + it.id;
      assert(!seenP[it.prompt.toLowerCase()], tg + " prompt is new");
      seenP[it.prompt.toLowerCase()] = 1;
      assert(it.choices.length === 3 && it.choices.filter(function (c) { return c === it.answer; }).length === 1 &&
        it.choices.every(function (c, i) { return it.choices.map(function (x) { return x.toLowerCase(); }).indexOf(c.toLowerCase()) === i; }), tg + " 3 different choices, the answer once");
      assert(it.explanation && it.explanation.length > 20 && it.didYouKnow && it.readChoices, tg + " has a Here's why fact, read aloud");
      assert(it.scene && (!M.SCI_SCENE_IDS || true), tg + " has a picture");
      [it.prompt, it.explanation].concat(it.choices).forEach(function (t) { assert(!/[0-9]/.test(t), tg + " numbers spoken as words: " + t); });
    });
    ["Saturn", "Neptune"].forEach(function (pl) {
      var mm = v30.filter(function (it) { return new RegExp(pl).test(it.prompt) && /moons/.test(it.prompt); });
      assert(mm.length === 1 && /^More than/.test(mm[0].answer), "astronomy v30: " + pl + " moon count says more than");
    });
    var sub = M.SUBJECTS.filter(function (x) { return x.id === "astronomy"; })[0];
    assert(sub && sub.under === "science" && M.homeSubjects().every(function (x) { return x.id !== "astronomy"; }), "astronomy: a section of Science, not its own Home card");
    var q = M.makeQuestion({ subject: "astronomy", skillId: "astro", step: 1, band: "5-6", seed: 4 });
    assert(q.level === "beginner" && q.didYouKnow && /^astro-/.test(q.bankId), "astronomy: step 1 gives a Beginner space quiz question");
    var kid = { id: "a", name: "A", ageBand: "7-8", subjects: {} };
    M.recordAnswer(kid, "science", { skillId: "habitat", step: 2, correct: true, unaided: true, role: "review" });
    M.recordAnswer(kid, "astronomy", { skillId: "astro", step: 2, correct: true, unaided: true, role: "review" });
    var sciBefore = JSON.stringify(kid.subjects.science);
    M.resetProfileProgress(kid, "astronomy");
    assert(JSON.stringify(kid.subjects.science) === sciBefore && !M.ensureBand(kid, "astronomy").skills.astro.answers.length, "astronomy: reset Astronomy keeps Science");
  })();

  // v20 Shapes: counts, one right answer, near and valid distractors, step ranges.
  (function () {
    var truth = { circle: 0, triangle: 3, square: 4, rectangle: 4, rhombus: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, nonagon: 9, decagon: 10 };
    assert(M.SHAPE_LIST.length === 11 && M.SHAPE_LIST.every(function (s) { return truth[s.id] === s.n; }), "shapes: every shape's side and corner count is right");
    for (var n = 3; n <= 10; n++) assert(M.SHAPE_LIST.some(function (s) { return s.n === n; }), "shapes: a shape with " + n + " sides");
    var byName = {}; M.SHAPE_LIST.forEach(function (s) { byName[s.name] = s; });
    var kinds = {}, bad = [];
    for (var step = 1; step <= 5; step++) {
      for (var i = 0; i < 300; i++) {
        var q = M.makeQuestion({ subject: "math", skillId: "shapes", step: step, band: "5-6", seed: step * 1000 + i, support: i % 7 === 0 });
        kinds[q.shapeKind] = true;
        var labels = q.choices.map(function (c) { return c.label; });
        var right = q.choices.filter(function (c) { return c.id === q.correctChoiceId; });
        if (right.length !== 1) bad.push("no single right " + q.key);
        if (labels.length !== (q.support ? 2 : 4) || labels.some(function (l, k) { return labels.indexOf(l) !== k; })) bad.push("choices " + labels.join(",") + " " + q.key);
        var sh = byName[q.shapeId] || M.SHAPE_LIST.filter(function (s) { return s.id === q.shapeId; })[0];
        if (!sh) { bad.push("unknown shape " + q.shapeId); continue; }
        if (sh.n > { 1: 4, 2: 6, 3: 8, 4: 10, 5: 10 }[step]) bad.push("too many sides at step " + step + ": " + sh.id);
        var ans = right[0] && right[0].label;
        if (q.shapeKind === "sides" || q.shapeKind === "corners" || q.shapeKind === "fact") {
          if (ans !== String(sh.n)) bad.push("wrong count " + q.key + " " + ans);
          labels.forEach(function (l) { var v = Number(l); if (!(v >= 0 && v <= 10) || (l !== ans && Math.abs(v - sh.n) > 4)) bad.push("far or odd number " + l + " " + q.key); });
          if (q.board.kind === "shape" && q.board.shape !== sh.id) bad.push("board shape " + q.key);
        } else {
          if (ans !== sh.name) bad.push("wrong name " + q.key);
          var target = q.shapeKind === "which" ? q.board.n : sh.n;
          labels.forEach(function (l) {
            if (!byName[l]) bad.push("unknown name " + l);
            else if (l !== ans && byName[l].n === target) bad.push("second right answer " + l + " " + q.key);
          });
        }
        if (!q.readChoices || !q.didYouKnow || q.didYouKnow.indexOf(String(sh.n)) < 0 && sh.n) bad.push("explanation " + q.key);
        if (step === 1 && q.board.kind === "shape" && sh.n && q.board.marks !== "num") bad.push("step 1 needs numbered corners");
        if (step >= 3 && !q.support && q.board.marks) bad.push("no corner dots at step " + step);
      }
    }
    assert(!bad.length, "shapes: 1500 questions valid (" + bad.slice(0, 4).join("; ") + ")");
    ["sides", "corners", "which", "name", "fact"].forEach(function (k) { assert(kinds[k], "shapes: makes '" + k + "' questions"); });
    var oct = M.makeQuestion({ subject: "math", skillId: "shapes", step: 5, band: "5-6", seed: 3, shapeKind: "name", shapeId: "octagon" });
    assert(oct.prompt === "What is this shape called?" && oct.choices.some(function (c) { return c.id === oct.correctChoiceId && c.label === "octagon"; }) &&
      oct.didYouKnow === "An octagon has 8 sides and 8 corners. A stop sign is an octagon!", "shapes: octagon name question and stop-sign fact");
    assert(M.extraSkillsFor("math").some(function (x) { return x.id === "shapes"; }) && M.skillIdsOf("math").indexOf("shapes") >= 0, "shapes: a Math skill that Reset progress clears");
  })();

  // v30 Math mix (Beginner): every template, 1500 generated questions per template per step, each one checked
  // against its picture/numbers by an independent answer key; choices, explanation, read-aloud, cycling.
  (function () {
    if (!M.makeMathMix) { assert(false, "math mix: js/math_mix.js loaded"); return; }
    var ORD = ["first", "second", "third", "fourth", "fifth"], CV = { p: 1, n: 5, d: 10, q: 25 }, CN = { p: "penny", n: "nickel", d: "dime", q: "quarter" };
    function cents(n) { return n + (n === 1 ? " cent" : " cents"); }
    function key(q) {
      var sc = q.board.scene.split(":"), kind = sc[0].slice(2), t = q.mixTemplate, P = q.prompt, nums;
      if (t === "count") return sc[2];
      if (t === "add" || t === "sub" || t === "doubles") return String(sc[3] === "+" ? +sc[2] + +sc[4] : +sc[2] - +sc[4]);
      if (t === "make10") return String(10 - +sc[1]);
      if (t === "nearby") {
        var m = /just after (\d+)/.exec(P) || /just before (\d+)/.exec(P) || /between (\d+) and (\d+)/.exec(P);
        return String(/after/.test(P) ? +m[1] + 1 : /before/.test(P) ? +m[1] - 1 : (+m[1] + +m[2]) / 2);
      }
      if (t === "compare") {
        if (kind === "tiles") { nums = sc[1].split(",").map(Number); return String(/biggest/.test(P) ? Math.max.apply(null, nums) : Math.min.apply(null, nums)); }
        var a = +sc[2], b = +sc[4], pl = function (id) { return { leaf: "leaves", fish: "fish" }[id] || id + "s"; };
        if (a === b) return "They are the same";
        return "The " + pl(/more/.test(P) === (a > b) ? sc[1] : sc[3]);
      }
      if (t === "skip" || t === "pattern") {
        var L = sc[1].split(","), qi = L.indexOf("?"), kn = L.map(Number);
        if (t === "skip") {
          var by = 0;
          for (var j = 0; j + 1 < L.length && !by; j++) if (L[j] !== "?" && L[j + 1] !== "?") by = kn[j + 1] - kn[j];
          return String(qi > 0 ? kn[qi - 1] + by : kn[1] - by);
        }
        var kind2 = q.stem.split("|")[2].split(":")[0];
        if (kind2 === "ab") return String(kn[qi - 2]);
        if (kind2 === "abc") return String(kn[qi - 3]);
        if (kind2 === "pairs") return String(kn[qi - 1]);
        if (kind2 === "up") return String(kn[qi - 1] + 1);
        if (kind2 === "up2") return String(kn[qi - 1] + 2);
        if (kind2 === "down") return String(kn[qi - 1] - 1);
        return "?";
      }
      if (t === "time") {
        var h = +sc[1], mm = +sc[2];
        if (/one hour later/.test(P)) return (h % 12 + 1) + " o'clock";
        return mm === 30 ? "Half past " + h : h + " o'clock";
      }
      if (t === "coins") {
        var cs = sc[1].split(",");
        if (/How much is one/.test(P)) return cents(CV[cs[0]]);
        if (/Which coin/.test(P)) { var v = +/worth (\d+)/.exec(P)[1]; return "A " + CN[cs.filter(function (c) { return CV[c] === v; })[0]]; }
        return cents(cs.reduce(function (s, c) { return s + CV[c]; }, 0));
      }
      if (t === "length") {
        var rb = sc[1].split(",").map(function (r) { return r.split("-"); }), best = rb[0];
        rb.forEach(function (r) { if (/longest/.test(P) ? +r[1] > +best[1] : +r[1] < +best[1]) best = r; });
        return "The " + best[0] + " ribbon";
      }
      if (t === "weight") {
        if (sc[3] === "0") return "They weigh the same";
        var heavy = sc[3] === "L" ? sc[1] : sc[2], light = sc[3] === "L" ? sc[2] : sc[1];
        var w = /heavier/.test(P) ? heavy : light;
        return "The " + (w === "cottonball" ? "cotton ball" : w);
      }
      if (t === "halves") {
        if (kind === "halves") return "Shape " + "ABC".charAt(sc[2].split(",").indexOf("half"));
        return String(+sc[2] / 2);
      }
      if (t === "evenodd") {
        nums = sc[1].split(",").map(Number);
        var want = /even/.test(P) ? 0 : 1, hit = nums.filter(function (n) { return n % 2 === want; });
        return hit.length === 1 ? String(hit[0]) : "two answers";
      }
      if (t === "ordinal") {
        var line = sc[1].split(",");
        var mw = /is (\w+) in line/.exec(P);
        if (mw) return "The " + line[ORD.indexOf(mw[1])];
        var who = /place is the (\w+) in/.exec(P)[1];
        return ORD[line.indexOf(who)].charAt(0).toUpperCase() + ORD[line.indexOf(who)].slice(1);
      }
      return "?";
    }
    var bad = [], variants = {}, total = 0, heavyOk = true;
    var HEAVY = { elephant: 1, car: 1, rock: 1, cow: 1, horse: 1, bear: 1, chair: 1, brick: 1, whale: 1, pig: 1, book: 1, lion: 1 };
    M.MATH_MIX_TEMPLATES.forEach(function (t) {
      [1, 2].forEach(function (step) {
        var seen = {};
        for (var i = 0; i < 1500; i++) {
          var sup = i % 11 === 0;
          var q = M.makeQuestion({ subject: "math", skillId: "mathmix", step: step, band: "5-6", seed: 31000 + i * 13 + step, support: sup, mixTemplate: t });
          total++;
          seen[q.stem] = 1;
          var labels = q.choices.map(function (c) { return c.label; });
          var right = q.choices.filter(function (c) { return c.id === q.correctChoiceId; });
          var k = key(q), tag = t + " s" + step + " " + q.prompt + " [" + labels.join(" / ") + "]";
          if (q.mixTemplate !== t) bad.push("template " + tag);
          if (labels.length !== (sup ? 2 : 3)) bad.push("choice count " + tag);
          if (labels.some(function (l, j) { return labels.indexOf(l) !== j || !l; })) bad.push("duplicate/empty choice " + tag);
          if (right.length !== 1) bad.push("not one right " + tag);
          else if (right[0].label !== k) bad.push("answer key " + k + " vs " + right[0].label + " " + tag);
          if (labels.filter(function (l) { return l === k; }).length !== 1) bad.push("answer once " + tag);
          if (!q.didYouKnow || q.didYouKnow.length < 20 || q.whyLabel !== "Here's why" || !q.readAll || !q.speakPrompt) bad.push("why/read " + tag);
          if (/undefined|NaN|null/.test(q.prompt + labels.join() + q.didYouKnow + q.speakPrompt + q.board.scene)) bad.push("undefined " + tag);
          if (/\?\s*\./.test(q.speakPrompt) || /, \?/.test(q.speakPrompt)) bad.push("speech " + q.speakPrompt);
          labels.forEach(function (l) { var n = parseInt(l, 10); if (/^\d/.test(l) && (n < 0 || n > 120)) bad.push("number range " + tag); });
          if (q.board.kind !== "scene" || !/^m-[a-z]+:/.test(q.board.scene) || (M.MATH_SCENE_KINDS || []).indexOf(q.board.scene.split(":")[0].slice(2)) < 0) bad.push("picture " + tag);
          if ((t === "weight" || t === "ordinal") && M.SCI_ANIMAL_LIBRARY) {
            var scn = q.board.scene.split(":"), drawn = t === "weight" ? [scn[1], scn[2]] : scn[1].split(",");
            drawn.forEach(function (d) { if (M.SCI_ANIMAL_LIBRARY.indexOf(d) < 0) bad.push("no drawing for " + d); });
          }
          if (t === "weight" && q.board.scene.split(":")[3] !== "0") { var sc = q.board.scene.split(":"); if (!HEAVY[sc[3] === "L" ? sc[1] : sc[2]]) heavyOk = false; }
          if (q.key.indexOf("mathmix|" + step + "|mix|" + t + "|") !== 0) bad.push("stable id " + q.key);
        }
        variants[t + step] = Object.keys(seen).length;
      });
    });
    M.MATH_MIX_VARIANTS = variants;
    assert(!bad.length, "math mix: " + total + " generated questions (16 templates x 2 steps x 1500) all valid (" + bad.length + " bad: " + bad.slice(0, 4).join("; ") + ")");
    assert(heavyOk, "math mix: the heavier thing always sits on the low side of the scale");
    assert(M.MATH_MIX_TEMPLATES.length === 16 && M.MATH_MIX_TEMPLATES.every(function (t) { return variants[t + "1"] >= 9 && variants[t + "2"] >= 9; }),
      "math mix: 16 templates, each with many variants (" + JSON.stringify(variants) + ")");
    // Same signature = same question (stable ids for the no-repeat cycle).
    var a1 = M.makeQuestion({ subject: "math", skillId: "mathmix", step: 2, band: "5-6", seed: 77, mixTemplate: "coins" });
    var a2 = M.makeQuestion({ subject: "math", skillId: "mathmix", step: 2, band: "5-6", seed: 77, mixTemplate: "coins" });
    assert(a1.key === a2.key && a1.prompt === a2.prompt && a1.board.scene === a2.board.scene, "math mix: a variant's signature id is stable");
    // No-repeat cycling: 300 draws in a row with one child never repeat a variant (a cycle is 400 variants).
    var kid = { id: "mm", name: "mm", ageBand: "5-6", subjects: {} };
    M.ensureBand(kid, "math");
    var keys = {}, rep = 0, tmpl = {};
    for (var i = 0; i < 300; i++) {
      var q = M.makeQuestion({ subject: "math", skillId: "mathmix", step: 1 + (i % 2), band: "5-6", seed: 50000 + i, profile: kid });
      if (keys[q.key]) rep++;
      keys[q.key] = 1; tmpl[q.mixTemplate] = 1;
    }
    assert(rep === 0 && Object.keys(tmpl).length === 16, "math mix: 300 questions with no repeat, every template used (" + rep + " repeats, " + Object.keys(tmpl).length + " templates)");
    assert(M.extraSkillsFor("math").some(function (x) { return x.id === "mathmix"; }) && M.skillIdsOf("math").indexOf("mathmix") >= 0, "math mix: a Math skill that Reset progress clears");
    M.cyclesClear(kid, "math");
    assert(!Object.keys(kid.cycles.pools).some(function (k) { return k.indexOf("|mathmix|") > 0; }), "math mix: reset clears its no-repeat cycle");
  })();

  // v17: Reset progress (M.resetProfileProgress; the app's M.resetProgress(childId, subject) wraps it).
  (function () {
    function kidWithProgress(name) {
      var kid = { id: name, name: name, color: "red", hat: "cap", photo: "data:image/png;base64,xx", ageBand: "5-6", soundOn: false,
        hearWords: true, goalMin: 15, hidden: [], reduceMotion: true, mathStyle: ["numbers"], level: "expert", mathTrain: "expert",
        subjects: {}, days: { "2026-10-11": 600000 } };
      M.SUBJECTS.forEach(function (sub) {
        var b = M.ensureBand(kid, sub.id);
        b.placed = true;
        var skills = M.SKILLS[sub.id]["5-6"];
        b.working = { skillId: skills[1].id, step: 4, up: 2, down: 0, support: false };
        skills.concat(M.topicsFor(sub.id)).concat(M.extraSkillsFor(sub.id)).forEach(function (sk) {
          for (var i = 0; i < 6; i++) M.recordAnswer(kid, sub.id, { skillId: sk.id, step: 3, correct: true, unaided: true, role: "review", at: Date.now() });
        });
        kid.recent = kid.recent || {};
        kid.recent[skills[0].id] = ["k1", "k2"];
        kid.lastAsk = kid.lastAsk || {};
        kid.lastAsk[sub.id] = { key: "k2", near: "n", look: "" };
      });
      M.ladderRecord(kid, "sight", "beginner", { correct: true, unaided: true });
      kid.wordLadder.sight.tier = 3;
      M.sightRecord(kid, "was", true); M.sightRecord(kid, "was", true); M.sightRecord(kid, "the", false);
      kid.sightRecent = ["was", "the"];
      return kid;
    }
    function copy(x) { return JSON.parse(JSON.stringify(x)); }
    function fresh(kid, sid, tag) {
      var snap = M.snapshot(kid, sid);
      var first = M.SKILLS[sid][kid.ageBand][0].id;
      assert(snap.score === 0 && snap.skills.every(function (sk) { return sk.mastery === 0 && !sk.solid; }), tag + ": " + sid + " score and skills back to 0");
      assert(snap.working.skillId === first && snap.working.step === 1 && snap.placed, tag + ": " + sid + " starts at the first skill, step 1, no warm-up");
      assert(!snap.topics.length || snap.topicsStarted === 0, tag + ": " + sid + " topics back to not started");
      var band = M.ensureBand(kid, sid);
      assert(Object.keys(band.skills).every(function (k) { return !band.skills[k].answers.length; }), tag + ": " + sid + " every skill record empty");
      M.skillIdsOf(sid).forEach(function (k) { assert(!kid.recent[k], tag + ": " + sid + " seen-question history cleared (" + k + ")"); });
      assert(!kid.lastAsk[sid], tag + ": " + sid + " last question forgotten");
    }
    M.SUBJECTS.forEach(function (sub) {
      var kid = kidWithProgress("Ada"), other = kidWithProgress("Bo");
      var otherBefore = copy(other);
      var before = copy(kid);
      var res = M.resetProfileProgress(kid, sub.id);
      var tag = "reset " + sub.id;
      assert(res.subjects.length === 1 && res.subjects[0] === sub.id, tag + ": reports the subject");
      fresh(kid, sub.id, tag);
      M.SUBJECTS.forEach(function (o) {
        if (o.id === sub.id) return;
        assert(JSON.stringify(kid.subjects[o.id]) === JSON.stringify(before.subjects[o.id]), tag + ": " + o.id + " untouched");
        M.skillIdsOf(o.id).forEach(function (k) { if (before.recent[k]) assert(JSON.stringify(kid.recent[k]) === JSON.stringify(before.recent[k]), tag + ": " + o.id + " history kept"); });
        assert(JSON.stringify(kid.lastAsk[o.id]) === JSON.stringify(before.lastAsk[o.id]), tag + ": " + o.id + " last question kept");
      });
      ["name", "color", "hat", "photo", "ageBand", "soundOn", "hearWords", "goalMin", "reduceMotion", "mathStyle", "level", "mathTrain", "days", "hidden"].forEach(function (f) {
        assert(JSON.stringify(kid[f]) === JSON.stringify(before[f]), tag + ": keeps " + f);
      });
      if (sub.id === "reading") {
        assert(!kid.wordLadder && (!kid.sightWords || !Object.keys(kid.sightWords).length) && !kid.sightRecent, tag + ": word ladder and sight words cleared");
        assert(M.sightProgress(kid).known === 0 && M.ladderTier(kid, "sight", "beginner") === 1, tag + ": sight words 0 known, ladder back to one word");
      } else {
        assert(JSON.stringify(kid.wordLadder) === JSON.stringify(before.wordLadder) && JSON.stringify(kid.sightWords) === JSON.stringify(before.sightWords), tag + ": reading ladder and sight words kept");
      }
      assert(JSON.stringify(other) === JSON.stringify(otherBefore), tag + ": the other child is untouched");
    });
    var kidAll = kidWithProgress("Ada"), keep = copy(kidAll);
    var resAll = M.resetProfileProgress(kidAll, "all");
    assert(resAll.subjects.length === M.SUBJECTS.length, "reset all: reports every subject");
    M.SUBJECTS.forEach(function (sub) { fresh(kidAll, sub.id, "reset all"); });
    assert(!kidAll.wordLadder && (!kidAll.sightWords || !Object.keys(kidAll.sightWords).length), "reset all: reading ladder and sight words cleared");
    assert(kidAll.level === "beginner" && kidAll.mathTrain === "beginner", "reset all: Home level back to Beginner");
    assert(JSON.stringify(kidAll.days) === "{}", "reset all: daily minutes cleared");
    ["name", "color", "hat", "photo", "ageBand", "soundOn", "hearWords", "goalMin", "reduceMotion", "mathStyle", "hidden"].forEach(function (f) {
      assert(JSON.stringify(kidAll[f]) === JSON.stringify(keep[f]), "reset all: keeps " + f);
    });
    // Nothing happens for an unknown subject.
    var same = kidWithProgress("Cy"), sameBefore = copy(same);
    assert(M.resetProfileProgress(same, "art").subjects.length === 0 && JSON.stringify(same) === JSON.stringify(sameBefore), "reset: unknown subject changes nothing");
    // Older saves: missing or odd fields do not break a reset.
    var old = { id: "old", name: "Old", ageBand: "7-8", subjects: { physics: { bands: { "7-8": { placed: true, working: { skillId: "friction", step: 3 }, skills: { friction: { answers: [{ step: 3, correct: true, unaided: true, at: 1 }] } } } } } } };
    var threw = false;
    try {
      M.resetProfileProgress(old, "physics");
      M.resetProfileProgress(old, "reading");
      M.resetProfileProgress({ id: "x", name: "X", ageBand: "9-10" }, "all");
      M.resetProfileProgress({ id: "y", name: "Y", ageBand: "5-6", subjects: null, recent: "bad", lastAsk: 3, wordLadder: 7 }, "all");
      M.resetProfileProgress(null, "all");
    } catch (err) { threw = String(err); }
    assert(!threw, "reset: older save formats do not break (" + threw + ")");
    assert(M.snapshot(old, "physics").working.step === 1 && old.subjects.physics.bands["7-8"].placed, "reset: an older save starts physics at step 1");
  })();

  var out = document.getElementById("out");
  if (!fails.length) {
    out.textContent = "PASS " + "all checks";
    document.title = "PASS";
  } else {
    out.textContent = "FAIL " + fails.length + "\n" + fails.join("\n");
    document.title = "FAIL";
  }
})(window.Merit);
