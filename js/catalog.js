(function (M) {
  "use strict";

  M.SUBJECTS = [
    { id: "math", name: "Math", short: "Math" },
    { id: "reading", name: "Reading", short: "Reading" },
    { id: "science", name: "Science & Engineering", short: "Science" },
    { id: "physics", name: "Physics", short: "Physics" },
    { id: "programming", name: "Programming", short: "Code" },
    // v21: Astronomy is a section of Science & Engineering (no Home card of its own: tap the Science card and
    // pick it). Tracked on its own, shown on Parent and the Classroom wall, and in Reset progress.
    { id: "astronomy", name: "Astronomy", short: "Space", under: "science" }
  ];
  M.homeSubjects = function () { return M.SUBJECTS.filter(function (s) { return !s.under; }); };
  M.subjectShown = function (p, s) {
    var hidden = (p && p.hidden) || [];
    return hidden.indexOf(s.id) < 0 && !(s.under && hidden.indexOf(s.under) >= 0);
  };

  M.BANDS = ["5-6", "7-8", "9-10"];

  // Skills that were removed. Saved progress for them is dropped when a save loads (v25: "Missing step").
  M.RETIRED_SKILLS = { programming: ["orderbug"] };

  M.SKILLS = {
    math: {
      "5-6": [
        { id: "add", title: "Addition", line: "Add small numbers" },
        { id: "sub", title: "Subtraction", line: "Take away" },
        { id: "mul", title: "Multiplication", line: "Equal groups" },
        { id: "div", title: "Division", line: "Share into equal groups" },
        { id: "word", title: "Story sums", line: "Tiny math stories up to 10" }
      ],
      "7-8": [
        { id: "add", title: "Addition", line: "Add bigger numbers" },
        { id: "sub", title: "Subtraction", line: "Subtract bigger numbers" },
        { id: "mul", title: "Multiplication", line: "Times facts" },
        { id: "div", title: "Division", line: "Divide into equal groups" },
        { id: "word", title: "Word problems", line: "Read a short math story" }
      ],
      "9-10": [
        { id: "add", title: "Addition", line: "Add two-digit numbers" },
        { id: "sub", title: "Subtraction", line: "Subtract two-digit numbers" },
        { id: "mul", title: "Multiplication", line: "Larger times facts" },
        { id: "div", title: "Division", line: "Larger division facts" },
        { id: "word", title: "Word problems", line: "Solve a math story in steps" }
      ]
    },
    reading: {
      "5-6": [
        { id: "sounds", title: "First words", line: "Read a tiny word" },
        { id: "names", title: "Simple words", line: "Read a short word" },
        { id: "cvc", title: "Short words", line: "Read words like cat and sun" },
        { id: "sight", title: "Everyday words", line: "Words you see a lot" },
        { id: "story", title: "Listen and find", line: "Words, rhymes, and tiny stories" }
      ],
      "7-8": [
        { id: "digraphs", title: "Letter teams", line: "Read ship, chat, and thin" },
        { id: "silente", title: "Silent e", line: "Read cake, bike, and home" },
        { id: "sentence", title: "Short lines", line: "Read a few words together" },
        { id: "sight2", title: "More sight words", line: "Longer everyday words" },
        { id: "story", title: "Fables", line: "Read a short fable and answer" }
      ],
      "9-10": [
        { id: "multi", title: "Two-part words", line: "Read sunlight and backpack" },
        { id: "mainidea", title: "Longer lines", line: "Read a whole sentence" },
        { id: "prefix", title: "Word parts", line: "Read words with un- and re-" },
        { id: "whyq", title: "Story lines", line: "Read a longer sentence" },
        { id: "story", title: "Fables", line: "Read a fable: who, what, why" }
      ]
    },
    science: {
      "5-6": [
        { id: "living", title: "Living things", line: "Living and nonliving" },
        { id: "needs", title: "What they need", line: "Water, light, and air" },
        { id: "weather", title: "Weather", line: "Sun, rain, and wind" },
        { id: "materials", title: "Materials", line: "Pick a material for a job" },
        { id: "space", title: "Planets and space", line: "Sun, Moon, Earth, and a rocket" },
        { id: "facts", title: "Science facts", line: "Animals, plants, and weather" }
      ],
      "7-8": [
        { id: "habitat", title: "Habitats", line: "Where a living thing belongs" },
        { id: "cycle", title: "Life cycles", line: "What comes next" },
        { id: "matter", title: "Matter", line: "Solid, liquid, and gas" },
        { id: "bridge", title: "Bridges", line: "A support helps it hold" },
        { id: "space", title: "Planets and space", line: "The planets around our Sun" },
        { id: "facts", title: "Science facts", line: "Plants, animals, Earth, and sky" }
      ],
      "9-10": [
        { id: "food", title: "Food chains", line: "Who eats what" },
        { id: "mixture", title: "Mixtures", line: "What you can separate" },
        { id: "water", title: "Water cycle", line: "Where the water goes" },
        { id: "fairtest", title: "Fair tests", line: "Change one thing" },
        { id: "space", title: "Planets and space", line: "Orbits, moons, and stars" },
        { id: "facts", title: "Science facts", line: "Life, Earth, and space questions" }
      ]
    },
    astronomy: {
      "5-6": [
        { id: "astro", title: "Space quiz", line: "Sun, Moon, planets, stars, and rockets" },
        { id: "astrospace", title: "Planets and space", line: "Sun, Moon, Earth, and a rocket" }
      ],
      "7-8": [
        { id: "astro", title: "Space quiz", line: "Planets, moons, stars, and rockets" },
        { id: "astrospace", title: "Planets and space", line: "The planets around our Sun" }
      ],
      "9-10": [
        { id: "astro", title: "Space quiz", line: "Galaxies, black holes, and space travel" },
        { id: "astrospace", title: "Planets and space", line: "Orbits, moons, and stars" }
      ]
    },
    physics: {
      "5-6": [
        { id: "push", title: "Push and pull", line: "Which way it moves" },
        { id: "speed", title: "Fast and slow", line: "Who gets there first" },
        { id: "balance", title: "Balance", line: "Which side goes down" },
        { id: "float", title: "Sink or float", line: "Guess, then picture it" },
        { id: "physfacts", title: "Physics facts", line: "Push, pull, hot, cold, and light" }
      ],
      "7-8": [
        { id: "friction", title: "Friction", line: "Rough and smooth" },
        { id: "ramp", title: "Ramps", line: "Which ramp rolls farther" },
        { id: "magnet", title: "Magnets", line: "Stick or push apart" },
        { id: "drop", title: "Dropping", line: "What lands first" },
        { id: "physfacts", title: "Physics facts", line: "Forces, light, sound, and energy" }
      ],
      "9-10": [
        { id: "balanceforce", title: "Forces", line: "Balanced and unbalanced" },
        { id: "trips", title: "Trips", line: "Who went farther" },
        { id: "light", title: "Light and shadow", line: "Where the shadow falls" },
        { id: "pulley", title: "Pulleys", line: "Pull down, the load goes up" },
        { id: "physfacts", title: "Physics facts", line: "Forces, energy, light, and sound" }
      ]
    },
    programming: {
      "5-6": [
        { id: "robot", title: "Robot arrows", line: "Press the arrows to drive the robot to the star" },
        { id: "sequence", title: "Steps in order", line: "Move the square to the star" },
        { id: "repeat", title: "Repeat", line: "Pick the matching arrows" },
        { id: "predict", title: "Which path", line: "Pick the arrows that reach the star" }
      ],
      "7-8": [
        { id: "robot", title: "Robot arrows", line: "Plan the arrows, get the gems, press Go" },
        { id: "longer", title: "Longer paths", line: "Move the square along a longer path" },
        { id: "repeatpath", title: "Repeat a path", line: "How many times to repeat" },
        { id: "predict2", title: "Predict", line: "Which longer path reaches the star" },
        { id: "fixone", title: "Fix one block", line: "Replace the wrong arrow" }
      ],
      "9-10": [
        { id: "robot", title: "Robot arrows", line: "Keys, doors, and a move budget" },
        { id: "repmix", title: "Repeat two moves", line: "Which arrows, done twice" },
        { id: "ifblocked", title: "If blocked", line: "Go around the wall" },
        { id: "predict3", title: "Long predict", line: "Read a longer path" },
        { id: "fixcount", title: "How many times", line: "Count the steps to the star" }
      ]
    }
  };

  // Skills whose questions come from the starter bank (js/bank.js), by subject.
  M.BANK_SKILLS = { math: "word", reading: "story", science: "facts", physics: "physfacts" };

  M.RANKS = {
    math: ["Counter", "Adder", "Number Maker", "Fact Finder", "Math Chief"],
    reading: ["Letter Listener", "Word Reader", "Sentence Ranger", "Story Scout", "Reading Chief"],
    science: ["Noticer", "Sorter", "Nature Hand", "Test Maker", "Science Chief"],
    astronomy: ["Stargazer", "Moon Walker", "Planet Hopper", "Comet Chaser", "Space Chief"],
    physics: ["Pusher", "Roller", "Force Hand", "Motion Maker", "Physics Chief"],
    programming: ["Stepper", "Repeater", "Path Finder", "Bug Fixer", "Code Chief"]
  };

  M.rankFor = function (subjectId, score) {
    var names = M.RANKS[subjectId];
    var star = score >= 100;
    var index = score >= 80 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : score >= 20 ? 1 : 0;
    var title = names[index];
    if (star) title = names[4];
    return { title: title, star: star, index: index };
  };

  M.skillMeta = function (subjectId, band, skillId) {
    var list = M.SKILLS[subjectId][band];
    for (var i = 0; i < list.length; i++) if (list[i].id === skillId) return list[i];
    var topic = M.topicMeta(subjectId, skillId);
    if (topic) return topic;
    var extra = M.extraSkillsFor(subjectId).filter(function (s) { return s.id === skillId; })[0];
    if (extra) return extra;
    return list[0];
  };

  // Topic skills (v13): extra bank-backed skills that every age band shares. They are mixed
  // into practice sets, tracked per skill like any other, and listed apart from the core
  // skills (the subject score and the step-by-step path still use the core skills only).
  // Physics topics come from js/physics_topics.js (M.PHYSICS_TOPICS).
  M.topicsFor = function (subjectId) {
    if (subjectId === "physics") return M.PHYSICS_TOPICS || [];
    if (subjectId === "science") return M.SCIENCE_TOPICS || [];   // v26 Plants, Animals, Human body, Matter (js/sci_topics.js)
    return [];
  };
  M.topicMeta = function (subjectId, skillId) {
    var list = M.topicsFor(subjectId);
    for (var i = 0; i < list.length; i++) if (list[i].id === skillId) return list[i];
    return null;
  };
  // Extra skills (v15): Reading "Sight words" (js/sightwords.js, 200 Dolch words). Mixed into Beginner
  // reading practice, tracked per word ("X of 200 words"); never part of the reading score, path or ladder.
  // v20: Math "Shapes" (sides and corners up to 10): Beginner level only, tracked on its own (not in the math score).
  M.SHAPES_SKILL = { id: "shapes", title: "Shapes", line: "Sides and corners up to 10" };
  M.extraSkillsFor = function (subjectId) {
    if (subjectId === "math") return M.MATH_MIX_SKILL ? [M.SHAPES_SKILL, M.MATH_MIX_SKILL] : [M.SHAPES_SKILL];   // v30 Math mix
    if (subjectId !== "reading") return [];
    var out = [];
    if (M.SIGHT_SKILL && M.SIGHT_ITEMS && M.SIGHT_ITEMS.length) out.push(M.SIGHT_SKILL);
    if (M.WORD_SKILL && M.WORD_ITEMS && M.WORD_ITEMS.length) out.push(M.WORD_SKILL);   // v23 Word match
    return out;
  };
  M.isTopicSkill = function (subjectId, skillId) {
    return !!M.topicMeta(subjectId, skillId);
  };

  M.LOOKS = {
    colors: [
      { id: "red", hex: "#e24b4b" },
      { id: "blue", hex: "#2f6fed" },
      { id: "green", hex: "#2f8f55" },
      { id: "gold", hex: "#e0a106" },
      { id: "navy", hex: "#24315c" }
    ],
    hats: [
      { id: "cap", label: "Cap" },
      { id: "bow", label: "Bow" },
      { id: "star", label: "Star" },
      { id: "none", label: "None" }
    ]
  };

  M.PASS_ICONS = ["apple", "star", "pencil", "book", "sun", "bell", "block", "bus"];
})(window.Merit = window.Merit || {});
