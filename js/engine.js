(function (M) {
  "use strict";

  M.dayOf = function (ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  };

  M.evaluateSkill = function (skill) {
    var answers = (skill && skill.answers) || [];
    var hard = answers.filter(function (a) { return a.unaided && a.step >= 4; });
    var last = hard.slice(-20);
    var solid = !!(skill && skill.solid);
    if (!solid && last.length >= 20) {
      var correct = last.filter(function (a) { return a.correct; }).length;
      var firstDay = M.dayOf(last[0].at);
      var later = last.filter(function (a) { return M.dayOf(a.at) > firstDay; }).length;
      if (correct >= 18 && later >= 6) solid = true;
    }
    if (solid && last.length >= 20) {
      var acc = last.filter(function (a) { return a.correct; }).length / last.length;
      if (acc < 0.7) solid = false;
    }
    if (solid) return { solid: true, mastery: 1, earnedStep: 5 };
    var earned = 0;
    for (var step = 1; step <= 5; step++) {
      var recent = answers.filter(function (a) { return a.unaided && a.step === step; }).slice(-10);
      var c = recent.filter(function (a) { return a.correct; }).length;
      if (recent.length >= 5 && c >= 8) earned = step;
    }
    return { solid: false, mastery: earned / 5, earnedStep: earned };
  };

  M.ensureBand = function (profile, subjectId) {
    var skills = M.SKILLS[subjectId][profile.ageBand];
    if (!profile.subjects[subjectId]) profile.subjects[subjectId] = { bands: {} };
    var sub = profile.subjects[subjectId];
    var band = sub.bands[profile.ageBand];
    if (!band) {
      band = sub.bands[profile.ageBand] = {
        placed: false,
        working: { skillId: skills[0].id, step: 1, up: 0, down: 0, support: false },
        skills: {}
      };
    }
    if (!band.tracks) band.tracks = {};
    ((M.RETIRED_SKILLS || {})[subjectId] || []).forEach(function (id) {
      delete band.skills[id]; delete band.tracks[id];
      if (profile.recent) delete profile.recent[id];
      if (profile.cycles && profile.cycles.pools) Object.keys(profile.cycles.pools).forEach(function (k) { if (k.split("|")[2] === id) delete profile.cycles.pools[k]; });
    });
    skills.forEach(function (s) {
      if (!band.skills[s.id]) band.skills[s.id] = { answers: [], solid: false };
      if (!band.tracks[s.id]) band.tracks[s.id] = { step: 1, up: 0, down: 0, support: false };
    });
    (M.topicsFor ? M.topicsFor(subjectId) : []).concat(M.extraSkillsFor ? M.extraSkillsFor(subjectId) : []).forEach(function (t) {
      if (!band.skills[t.id]) band.skills[t.id] = { answers: [], solid: false };
    });
    if (!skills.some(function (s) { return s.id === band.working.skillId; })) {
      band.working.skillId = skills[0].id;
      band.working.step = 1;
      band.working.up = 0;
      band.working.down = 0;
    }
    return band;
  };

  M.snapshot = function (profile, subjectId) {
    var band = M.ensureBand(profile, subjectId);
    var skills = M.SKILLS[subjectId][profile.ageBand];
    var detail = skills.map(function (s) {
      var ev = M.evaluateSkill(band.skills[s.id]);
      return { id: s.id, title: s.title, line: s.line, solid: ev.solid, mastery: ev.mastery, earnedStep: ev.earnedStep };
    });
    var score = Math.round(detail.reduce(function (a, s) { return a + s.mastery; }, 0) / detail.length * 100);
    // Topic skills are reported on their own and do not change the score or the path.
    var topics = (M.topicsFor ? M.topicsFor(subjectId) : []).map(function (t) {
      var rec = band.skills[t.id] || { answers: [] };
      var ev = M.evaluateSkill(rec);
      var tried = rec.answers.length;
      var right = rec.answers.filter(function (a) { return a.correct && a.unaided; }).length;
      return { id: t.id, title: t.title, line: t.line, solid: ev.solid, mastery: ev.mastery, earnedStep: ev.earnedStep, tried: tried, right: right };
    });
    return {
      score: score,
      sight: subjectId === "reading" && M.SIGHT_ITEMS && M.SIGHT_ITEMS.length ? M.sightProgress(profile) : null,
      words: subjectId === "reading" && M.WORD_ITEMS && M.WORD_ITEMS.length ? M.wordProgress(profile) : null,
      shapes: subjectId === "math" ? (function () {
        var rec = band.skills.shapes || { answers: [] };
        var ev = M.evaluateSkill(rec);
        return { id: "shapes", title: M.SHAPES_SKILL.title, line: M.SHAPES_SKILL.line, solid: ev.solid, mastery: ev.mastery, earnedStep: ev.earnedStep,
          tried: rec.answers.length, right: rec.answers.filter(function (a) { return a.correct && a.unaided; }).length };
      })() : null,
      mathmix: subjectId === "math" && M.MATH_MIX_SKILL ? (function () {
        var rec = band.skills.mathmix || { answers: [] };
        var ev = M.evaluateSkill(rec);
        return { id: "mathmix", title: M.MATH_MIX_SKILL.title, line: M.MATH_MIX_SKILL.line, solid: ev.solid, mastery: ev.mastery, earnedStep: ev.earnedStep,
          tried: rec.answers.length, right: rec.answers.filter(function (a) { return a.correct && a.unaided; }).length };
      })() : null,
      topics: topics,
      topicsStarted: topics.filter(function (t) { return t.tried > 0; }).length,
      rank: M.rankFor(subjectId, score),
      skills: detail,
      working: {
        skillId: band.working.skillId,
        step: band.working.step,
        up: band.working.up,
        down: band.working.down,
        support: !!band.working.support
      },
      placed: !!band.placed
    };
  };

  // ---- No-repeat cycles (v24) ----
  // Every question source is a "pool". A child sees every item of a pool once before any item comes back;
  // then a new cycle starts (reshuffled) and the last item of the old cycle is not first in the new one.
  //   profile.cycles = { v: 1, pools: { key: { seen: {id: 1}, n, cycle, last, prevLast, retried: {id: 1} } } }
  // Pool keys (subject is always the 2nd part, so Reset can clear one subject):
  //   "bank|<subject>|<skill>|<step>"   a bank list (each skill x step; a step belongs to one level, so each level has its own cycles)
  //   "list|reading|sightwords" / "list|reading|wordmatch"   the 200 sight words / 100 Word match words
  //   "gen|<subject>|<skill>|<step>"    generated questions, by the question key (its stem)
  // Generated pools have no fixed list: a pool counts as used up when 48 fresh draws in a row only give seen
  // questions, or when it holds M.GEN_WINDOW questions (a large recent window for huge spaces).
  M.CYCLES_VERSION = 1;
  M.GEN_WINDOW = 400;
  function skillSubject(skillId) {
    var hit = "";
    (M.SUBJECTS || []).forEach(function (s) { if (!hit && M.skillIdsOf && M.skillIdsOf(s.id).indexOf(skillId) >= 0) hit = s.id; });
    return hit;
  }
  M.cyclesOf = function (profile) {
    if (!profile || typeof profile !== "object") return null;
    var c = profile.cycles;
    if (c && typeof c === "object" && c.v === M.CYCLES_VERSION && c.pools && typeof c.pools === "object") return c;
    c = profile.cycles = { v: M.CYCLES_VERSION, pools: {} };
    // Older saves: the last questions each skill asked (profile.recent) count as seen in this first cycle.
    var recent = profile.recent && typeof profile.recent === "object" ? profile.recent : {};
    Object.keys(recent).forEach(function (skillId) {
      var list = Array.isArray(recent[skillId]) ? recent[skillId] : [];
      var sub = skillSubject(skillId);
      if (!sub) return;
      list.forEach(function (key) {
        var parts = String(key).split("|");
        if (parts.length < 3 || !/^[1-5]$/.test(parts[1])) return;
        M.cycleMark(profile, "gen|" + sub + "|" + skillId + "|" + parts[1], key);
      });
    });
    return c;
  };
  M.cyclePool = function (profile, key) {
    var c = profile.cycles && profile.cycles.pools ? profile.cycles : M.cyclesOf(profile);
    var pool = c.pools[key];
    if (!pool || typeof pool !== "object" || !pool.seen || typeof pool.seen !== "object") {
      pool = c.pools[key] = { seen: {}, n: 0, cycle: 1, last: "", prevLast: "", retried: {} };
    }
    if (!pool.retried || typeof pool.retried !== "object") pool.retried = {};
    return pool;
  };
  M.cycleRestart = function (pool) {
    pool.prevLast = pool.last;
    pool.seen = {};
    pool.n = 0;
    pool.retried = {};
    pool.cycle = (pool.cycle || 1) + 1;
  };
  // The items of a list not shown yet this cycle. When every item was shown, a new cycle starts and all
  // items come back except the one shown last (so it is not first again).
  M.cycleUnseen = function (profile, key, list, idOf) {
    if (!profile || !list || !list.length) return list || [];
    var pool = M.cyclePool(profile, key);
    var fresh = list.filter(function (it) { return !pool.seen[idOf(it)]; });
    if (fresh.length) return fresh;
    M.cycleRestart(pool);
    fresh = list.filter(function (it) { return idOf(it) !== pool.prevLast; });
    return fresh.length ? fresh : list.slice();
  };
  // Generated question keys are long, so they are kept as a short hash (keeps the save small).
  function shortId(key, id) {
    if (key.indexOf("gen|") !== 0) return id;
    var h = 5381, t = String(id);
    for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
    return h.toString(36) + t.length.toString(36);
  }
  M.cycleSeen = function (profile, key, id) {
    if (!profile) return false;
    return !!M.cyclePool(profile, key).seen[shortId(key, id)];
  };
  M.cycleMark = function (profile, key, id) {
    if (!profile || !key || id == null || id === "") return;
    var pool = M.cyclePool(profile, key);
    id = shortId(key, id);
    if (!pool.seen[id]) { pool.seen[id] = 1; pool.n += 1; }
    pool.last = id;
    if (key.indexOf("gen|") === 0 && pool.n >= M.GEN_WINDOW) { M.cycleRestart(pool); pool.seen[id] = 1; pool.n = 1; }
  };
  // Reset: drop one subject's cycles (or all of them).
  M.cyclesClear = function (profile, subjectId) {
    if (!profile || !profile.cycles || !profile.cycles.pools) return;
    if (subjectId === "all") { profile.cycles.pools = {}; return; }
    Object.keys(profile.cycles.pools).forEach(function (k) { if (k.split("|")[1] === subjectId) delete profile.cycles.pools[k]; });
  };

  // ---- Sight words (v15): per-word record on the profile (shared by every age band) ----
  //   profile.sightWords[word] = { n: first tries, r: right first tries, h: last results ("1" right, "0" miss; newest last), at }
  //   A word is known when its last two first tries were right (unaided). A later miss makes it not known again.
  function sightRec(profile) {
    if (!profile.sightWords || typeof profile.sightWords !== "object") profile.sightWords = {};
    return profile.sightWords;
  }
  M.sightKnown = function (rec) {
    return !!(rec && typeof rec.h === "string" && rec.h.length >= 2 && rec.h.slice(-2) === "11");
  };
  M.sightRecord = function (profile, word, correct) {
    var all = sightRec(profile);
    var r = all[word];
    if (!r || typeof r !== "object") r = all[word] = { n: 0, r: 0, h: "", at: 0 };
    r.n += 1;
    if (correct) r.r += 1;
    r.h = (String(r.h || "") + (correct ? "1" : "0")).slice(-6);
    r.at = Date.now();
    return M.sightKnown(r);
  };
  M.sightProgress = function (profile) {
    var all = sightRec(profile);
    var items = M.SIGHT_ITEMS || [];
    var known = 0, tried = 0, n = 0, right = 0;
    items.forEach(function (it) {
      var r = all[it.answer];
      if (!r || !r.n) return;
      tried += 1;
      n += r.n;
      right += r.r;
      if (M.sightKnown(r)) known += 1;
    });
    return { known: known, tried: tried, total: items.length, answers: n, right: right };
  };
  // Next sight word item. Words missed last time come back first (most missed first). Otherwise a small set of
  // words "in progress" (seen, right last time, not known yet) is finished before more new words come in, new
  // words come in Dolch order (earliest first), and now and then a known word comes back for review.
  // "avoid": the last few words asked (never the same word twice in a row).
  M.SIGHT_IN_PROGRESS = 4;
  // ---- Word match (v23): the same per-word records, kept in profile.wordMatch, for the 100 everyday words ----
  function withWords(fn) {
    return function () {
      var args = arguments, profile = args[0];
      if (!profile || typeof profile !== "object") return fn.apply(null, args);
      var keepRec = profile.sightWords, keepItems = M.SIGHT_ITEMS;
      if (!profile.wordMatch || typeof profile.wordMatch !== "object") profile.wordMatch = {};
      profile.sightWords = profile.wordMatch; M.SIGHT_ITEMS = M.WORD_ITEMS || [];
      try { return fn.apply(null, args); }
      finally { profile.wordMatch = profile.sightWords; if (keepRec === undefined) delete profile.sightWords; else profile.sightWords = keepRec; M.SIGHT_ITEMS = keepItems; }
    };
  }
  M.sightPick = function (profile, rng, avoid) {
    rng = rng || Math.random;
    avoid = avoid || [];
    var all = sightRec(profile);
    var full = M.SIGHT_ITEMS || [];
    if (!full.length) return null;
    // v24: only words not shown yet this cycle (a missed word may come back once, later, as a retry).
    var ckey = "list|reading|" + (full[0].skill || "sightwords");
    var pool = M.cyclePool(profile, ckey);
    var unseen = M.cycleUnseen(profile, ckey, full, function (it) { return it.answer; });
    var items = unseen.filter(function (it) { return avoid.indexOf(it.answer) < 0; });
    if (!items.length) items = unseen.slice();
    function rec(it) { return all[it.answer] || { n: 0, r: 0, h: "", at: 0 }; }
    function one(list) { return list[Math.floor(rng() * list.length)]; }
    var missed = full.filter(function (it) {
      var h = rec(it).h || "";
      return h.length && h.slice(-1) === "0" && avoid.indexOf(it.answer) < 0 && (!pool.seen[it.answer] || !pool.retried[it.answer]);
    });
    if (missed.length && rng() < 0.45) {
      missed.sort(function (a, b) { return (rec(b).n - rec(b).r) - (rec(a).n - rec(a).r) || a.rank - b.rank; });
      var back = one(missed.slice(0, 3));
      if (pool.seen[back.answer]) pool.retried[back.answer] = 1;
      return back;
    }
    missed = items.filter(function (it) { var h = rec(it).h || ""; return h.length && h.slice(-1) === "0"; });
    var known = items.filter(function (it) { return M.sightKnown(rec(it)); });
    var going = items.filter(function (it) { var r = rec(it); return r.n > 0 && !M.sightKnown(r) && String(r.h).slice(-1) === "1"; });
    var fresh = items.filter(function (it) { return !rec(it).n; }).sort(function (a, b) { return a.rank - b.rank; });
    var oldest = function (list) { return list.slice().sort(function (a, b) { return (rec(a).at || 0) - (rec(b).at || 0); }).slice(0, 2); };
    if (known.length && rng() < 0.1) return one(oldest(known));
    if (going.length && (going.length >= M.SIGHT_IN_PROGRESS || !fresh.length || rng() < 0.5)) return one(oldest(going));
    if (fresh.length) return one(fresh.slice(0, 3));
    if (missed.length) return one(missed);
    return one(oldest(known.length ? known : items));
  };

  M.wordRecord = withWords(function (p, w, c) { return M.sightRecord(p, w, c); });
  M.wordProgress = withWords(function (p) { return M.sightProgress(p); });
  M.wordPick = withWords(function (p, rng, avoid) { return M.sightPick(p, rng, avoid); });

  // ---- Reset progress (v17) ----
  // Clears one subject's progress for a child (or every subject with "all"), so the questions start over:
  // skill answers and steps, the working path (back to the first skill, step 1, no warm-up), physics topics,
  // the questions-seen history, and for Reading also the word-length ladder and the sight words.
  // Kept: name, look, picture, age band, settings (sound, hear words, less motion, daily ring goal, hidden
  // subjects, math style) and every other subject. "all" also clears the daily minutes and sets the Home level
  // back to Beginner. Works with older saves (missing or odd fields are just rebuilt).
  M.skillIdsOf = function (subjectId) {
    var ids = {};
    var bySub = (M.SKILLS && M.SKILLS[subjectId]) || {};
    Object.keys(bySub).forEach(function (b) { (bySub[b] || []).forEach(function (sk) { ids[sk.id] = true; }); });
    (M.topicsFor ? M.topicsFor(subjectId) : []).forEach(function (t) { ids[t.id] = true; });
    (M.extraSkillsFor ? M.extraSkillsFor(subjectId) : []).forEach(function (t) { ids[t.id] = true; });
    return Object.keys(ids);
  };
  M.resetProfileProgress = function (profile, subjectId) {
    if (!profile || typeof profile !== "object") return { subjects: [] };
    var all = subjectId === "all";
    var list = all ? M.SUBJECTS.map(function (s) { return s.id; }) : M.SUBJECTS.some(function (s) { return s.id === subjectId; }) ? [subjectId] : [];
    if (!list.length) return { subjects: [] };
    if (!profile.subjects || typeof profile.subjects !== "object") profile.subjects = {};
    if (!profile.recent || typeof profile.recent !== "object") profile.recent = {};
    if (!profile.lastAsk || typeof profile.lastAsk !== "object") profile.lastAsk = {};
    list.forEach(function (sid) {
      M.cyclesClear(profile, sid);   // v24: that subject's no-repeat cycles start over
      delete profile.subjects[sid];
      M.skillIdsOf(sid).forEach(function (k) { delete profile.recent[k]; });
      delete profile.lastAsk[sid];
      if (sid === "reading") {
        delete profile.wordLadder;
        delete profile.sightWords;
        delete profile.sightRecent;
        delete profile.wordMatch;
        delete profile.wordRecent;
      }
      if (profile.ageBand && M.SKILLS[sid] && M.SKILLS[sid][profile.ageBand]) {
        var band = M.ensureBand(profile, sid);
        band.placed = true;   // start over at the first skill, step 1 (no warm-up that could skip ahead)
      }
    });
    if (all) {
      profile.recent = {};
      profile.lastAsk = {};
      profile.days = {};
      profile.level = "beginner";
      profile.mathTrain = "beginner";
    }
    return { subjects: list };
  };

  M.nextWorking = function (working, skillIds, result) {
    var w = {
      skillId: working.skillId,
      step: working.step,
      up: working.up || 0,
      down: working.down || 0,
      support: !!working.support
    };
    var notice = "";
    if (!result.counts) return { working: w, notice: notice };
    if (result.correct && result.unaided) {
      w.up += 1;
      w.down = 0;
      if (w.up >= 5) {
        w.up = 0;
        if (w.support) {
          w.support = false;
          notice = "ready";
        } else {
          var idx = skillIds.indexOf(w.skillId);
          if (w.step < 5) {
            w.step += 1;
            notice = "harder";
          } else if (idx >= 0 && idx < skillIds.length - 1) {
            w.skillId = skillIds[idx + 1];
            w.step = 1;
            notice = "harder";
          }
        }
      }
    } else if (!result.correct) {
      w.up = 0;
      w.down += 1;
      if (w.down >= 3) {
        w.down = 0;
        var i = skillIds.indexOf(w.skillId);
        if (w.step > 1) {
          w.step -= 1;
          notice = "easier";
        } else if (i > 0) {
          w.skillId = skillIds[i - 1];
          w.step = 5;
          w.support = false;
          notice = "easier";
        } else {
          w.step = 1;
          w.support = true;
          notice = "support";
        }
      }
    } else {
      w.up = 0;
    }
    return { working: w, notice: notice };
  };

  M.normWord = function (s) {
    return String(s == null ? "" : s).trim().toLowerCase().replace(/[^a-z0-9/\s]/g, "").replace(/\s+/g, " ");
  };

  M.normNum = function (s) {
    var t = String(s == null ? "" : s).trim();
    if (!/^-?\d+$/.test(t)) return null;
    return String(parseInt(t, 10));
  };

  M.grade = function (q, res) {
    res = res || {};
    if (q.input === "sequence") {
      var got = res.sequence || [];
      var want = q.sequence || [];
      if (q.reach && q.grid && q.grid.goal) {
        if (!got.length) return false;
        if (q.robot && q.robot.budget && got.length > q.robot.budget) return false;
        var end = M.runMoves(q.grid, got);
        return end.done;
      }
      if (got.length !== want.length) return false;
      for (var i = 0; i < want.length; i++) if (got[i] !== want[i]) return false;
      return true;
    }
    if (q.input === "cell") {
      return !!(res.cell && q.cell && res.cell.x === q.cell.x && res.cell.y === q.cell.y);
    }
    if (q.input === "flash") return res.flash === "correct";
    var typed = res.text != null && String(res.text).trim() !== "";
    if (typed && q.allowType) {
      if (q.answerKind === "number") return M.normNum(res.text) !== null && M.normNum(res.text) === M.normNum(q.typedAnswer);
      return M.normWord(res.text) === M.normWord(q.typedAnswer);
    }
    return res.choiceId != null && res.choiceId === q.correctChoiceId;
  };

  M.recordAnswer = function (profile, subjectId, item) {
    var band = M.ensureBand(profile, subjectId);
    var skill = band.skills[item.skillId];
    skill.answers.push({
      step: item.step,
      correct: !!item.correct,
      unaided: !!item.unaided,
      at: item.at || Date.now(),
      role: item.role || "work"
    });
    if (skill.answers.length > 240) skill.answers.splice(0, skill.answers.length - 200);
    var ev = M.evaluateSkill(skill);
    skill.solid = ev.solid;
    var notice = "";
    if (item.role === "work" && item.holdSkill) {
      if (!band.tracks) band.tracks = {};
      var prev = band.tracks[item.skillId] || { step: item.step || 1, up: 0, down: 0, support: false };
      var held = M.nextWorking({
        skillId: item.skillId,
        step: prev.step,
        up: prev.up || 0,
        down: prev.down || 0,
        support: !!prev.support
      }, [item.skillId], {
        counts: true,
        correct: !!item.correct,
        unaided: !!item.unaided
      });
      band.tracks[item.skillId] = {
        step: held.working.step,
        up: held.working.up,
        down: held.working.down,
        support: !!held.working.support
      };
      notice = held.notice;
    } else if (item.role === "work" && item.skillId && item.skillId !== band.working.skillId) {
      notice = "";
    } else if (item.role === "work") {
      var ids = M.SKILLS[subjectId][profile.ageBand].map(function (s) { return s.id; });
      var moved = M.nextWorking(band.working, ids, {
        counts: true,
        correct: !!item.correct,
        unaided: !!item.unaided
      });
      band.working = moved.working;
      notice = moved.notice;
    }
    return notice;
  };

  M.finishPlacement = function (profile, subjectId, log) {
    var skills = M.SKILLS[subjectId][profile.ageBand];
    var band = M.ensureBand(profile, subjectId);
    var right = {};
    skills.forEach(function (s) { right[s.id] = 0; });
    log.forEach(function (item) {
      if (item.correct && item.unaided) right[item.skillId] = (right[item.skillId] || 0) + 1;
    });
    var start = 0;
    for (var i = 0; i < skills.length; i++) {
      start = i;
      if ((right[skills[i].id] || 0) < 2) break;
    }
    var got = right[skills[start].id] || 0;
    var step = got <= 0 ? 1 : got === 1 ? 2 : 4;
    if (start === skills.length - 1 && got >= 2) step = 4;
    band.working = { skillId: skills[start].id, step: step, up: 0, down: 0, support: false };
    band.placed = true;
    return band.working;
  };

  M.todayKey = function () {
    return M.dayOf(Date.now());
  };

  M.addPracticeMs = function (profile, ms) {
    if (!profile.days) profile.days = {};
    var k = M.todayKey();
    profile.days[k] = (profile.days[k] || 0) + Math.max(0, ms);
  };

  // Level earned in a subject (Beginner / Intermediate / Expert), from the best earned step
  // among its skills, with the same cut-offs as math: step 2 or more is Intermediate, 4 or more is Expert.
  M.levelProgress = function (profile, subjectId) {
    var band = M.ensureBand(profile, subjectId);
    var best = 0;
    (M.SKILLS[subjectId][profile.ageBand] || []).forEach(function (s) {
      var ev = M.evaluateSkill(band.skills[s.id]);
      if (ev.earnedStep > best) best = ev.earnedStep;
    });
    var id = "beginner";
    if (best >= 4) id = "expert";
    else if (best >= 2) id = "intermediate";
    return { id: id, earnedStep: best };
  };

  M.mathProgress = function (profile) {
    var band = M.ensureBand(profile, "math");
    var skills = M.SKILLS.math[profile.ageBand] || [];
    var best = 0;
    skills.forEach(function (s) {
      var ev = M.evaluateSkill(band.skills[s.id]);
      if (ev.earnedStep > best) best = ev.earnedStep;
    });
    var id = "beginner";
    if (best >= 4) id = "expert";
    else if (best >= 2) id = "intermediate";
    return { id: id, earnedStep: best };
  };

  // Reading word-length ladder (word-recognition skills). Per child, per reading skill:
  //   tier 1 one word, 2 two words, 3 three-four words, 4 a sentence (5-7 words), 5 longer / two sentences.
  //   Home level sets the window and the start: Beginner 1-3 (start 1), Intermediate 2-4 (start 3),
  //   Expert 3-5 (start 4).
  //   Up one tier: 5 unaided right in a row, or 8 of the last 10 unaided right.
  //   Down one tier: 2 misses within the last 3 answers (this also covers "3 of the last 5").
  //   After a move the history starts fresh and the next 3 answers cannot move the tier (cooldown).
  //   A right answer after a miss or with help counts as neither right nor a miss.
  M.LADDER = {
    skills: ["sounds", "names", "cvc", "sight", "digraphs", "silente", "sight2", "multi", "prefix"],
    windows: { beginner: [1, 3], intermediate: [2, 4], expert: [3, 5] },
    start: { beginner: 1, intermediate: 3, expert: 4 },
    titles: ["", "One word", "Two words", "Short phrases", "Sentences", "Long sentences"],
    upRun: 5, upOf: [8, 10], downOf: [[2, 3]], cooldown: 3, keep: 10
  };
  M.isLadderSkill = function (subjectId, skillId) {
    return subjectId === "reading" && M.LADDER.skills.indexOf(skillId) >= 0;
  };
  function ladderEntry(profile, skillId, levelId) {
    var L = M.LADDER;
    if (!L.windows[levelId]) levelId = "beginner";
    if (!profile.wordLadder || typeof profile.wordLadder !== "object") profile.wordLadder = {};
    var e = profile.wordLadder[skillId];
    var win = L.windows[levelId];
    if (!e || typeof e !== "object" || !(e.tier >= 1 && e.tier <= 5)) {
      e = profile.wordLadder[skillId] = { tier: L.start[levelId], hist: [], cool: 0, level: levelId };
    }
    if (!Array.isArray(e.hist)) e.hist = [];
    if (e.level !== levelId) {
      // Home level changed: keep the tier if it fits the new window, else start that level fresh.
      if (e.tier < win[0] || e.tier > win[1]) e.tier = L.start[levelId];
      e.level = levelId;
      e.hist = [];
      e.cool = 0;
    }
    return e;
  }
  M.ladderTier = function (profile, skillId, levelId) {
    return ladderEntry(profile, skillId, levelId).tier;
  };
  // result: { correct, unaided }. Returns { tier, moved: 1 | -1 | 0 }.
  M.ladderRecord = function (profile, skillId, levelId, result) {
    var L = M.LADDER;
    var e = ladderEntry(profile, skillId, levelId);
    var win = L.windows[e.level];
    var mark = result.correct ? (result.unaided ? 1 : 0.5) : 0;
    e.hist.push(mark);
    while (e.hist.length > L.keep) e.hist.shift();
    if (e.cool > 0) { e.cool -= 1; return { tier: e.tier, moved: 0 }; }
    var h = e.hist;
    function tail(n) { return h.slice(Math.max(0, h.length - n)); }
    function count(list, v) { return list.filter(function (x) { return x === v; }).length; }
    var moved = 0;
    var runUp = h.length >= L.upRun && count(tail(L.upRun), 1) === L.upRun;
    var ofUp = h.length >= L.upOf[1] && count(tail(L.upOf[1]), 1) >= L.upOf[0];
    var down = L.downOf.some(function (rule) { return count(tail(rule[1]), 0) >= rule[0]; });
    if (down && e.tier > win[0]) moved = -1;
    else if ((runUp || ofUp) && e.tier < win[1]) moved = 1;
    if (moved) {
      e.tier += moved;
      e.hist = [];
      e.cool = L.cooldown;
    }
    return { tier: e.tier, moved: moved };
  };
})(window.Merit = window.Merit || {});
