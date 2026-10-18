# Merit question bank: sources and licenses

The question bank (`js/bank.js`, copy in `data/bank.json`) has 1,390 items in one pool per subject, sorted into the
app's three levels: **Beginner** (steps 1-2), **Intermediate** (steps 3-4), and **Expert** (step 5). Each item keeps
the age band it was first written for as a note (`band`, `bandStep`), but questions are picked by the level chosen on Home ("Pick a level:").
Every item records its source, license, and a credit line (and a source URL when it came from outside). The app
shows the credit line under each bank question and lists the sources on the Parent screen.

| Subject | Beginner | Intermediate | Expert |
|---|---|---|---|
| Math word problems | 100 (written for Merit) | 150 (SVAMP) | 150 (GSM8K) |
| Reading | 90 (written for Merit) | 75 (Aesop retellings, shorter) | 81 (Aesop retellings, longer) |
| Science facts | 90 (written for Merit) | 227 (ARC-Easy) | 176 (ARC-Easy, 30 ARC-Challenge) |
| Physics facts | 90 (written for Merit) | 87 (ARC-Easy) | 74 (ARC-Easy) |

| Source | Used for | License | Credit |
|---|---|---|---|
| AI2 Reasoning Challenge (ARC), ARC-Easy plus 30 ARC-Challenge items: https://huggingface.co/datasets/allenai/ai2_arc | Science facts and Physics facts, Intermediate and Expert (Challenge items only at Expert) | CC BY-SA 4.0 | Clark, Cowhey, Etzioni, Khot, Sabharwal, Schoenick, Tafjord. "Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge." Allen Institute for AI, 2018. |
| SVAMP: https://huggingface.co/datasets/ChilleD/SVAMP | Math word problems, Intermediate | MIT | Patel, Bhattamishra, Goyal. "Are NLP Models really able to Solve Simple Math Word Problems?" NAACL 2021. |
| GSM8K: https://huggingface.co/datasets/openai/gsm8k | Math word problems, Expert | MIT | Cobbe et al. "Training Verifiers to Solve Math Word Problems." OpenAI, 2021. |
| Written for Merit (original work) | Every Beginner item: story sums (math), listen and find (reading), science facts, physics facts. 370 in all | Original work for Merit; no outside license | "Written for Merit." |
| Aesop's Fables, translated by George Fyler Townsend, Project Gutenberg eBook #21: https://www.gutenberg.org/ebooks/21 | Reading stories, Intermediate and Expert | Public domain in the USA | Passages were retold in simpler words for young readers, based on Townsend's translation. All the reading questions were written for Merit. |

## Reading word-length ladder (v8)

The two-word phrases, short phrases and sentences used by the reading word ladder (184 lines in `js/questions.js`,
TIER2-TIER5) are original work written for Merit; no outside license. Wrong choices are made by the app by changing
one or two words to real look-alike words from the app's own word lists.

## Adaptations

- **ARC**: questions and answers are taken word for word, except for small tidy-ups: a `___` blank at the end of
  fill-in prompts, trailing periods removed from short answer choices, and at most 4 choices kept (one extra wrong
  choice dropped when there were 5). Adapted ARC material stays under **CC BY-SA 4.0**. If you share the bank, share
  those items under the same license and keep this credit.
- **SVAMP / GSM8K**: problem text is taken word for word (SVAMP spacing like `t - shirts` is fixed). The wrong choices
  were made up nearby (sums, differences, or products of the numbers in the problem, and the answer plus or minus a
  little). Every answer was checked again against the dataset: SVAMP by working out its equation, GSM8K by checking
  each calculator step and the final `####` answer.
- **Aesop**: retellings are new text that keeps the plot of the public-domain translation. Grim details were softened
  for children (for example, in "The Boy Who Cried Wolf" the wolf chases the flock away). Passages have at most 65
  words at Intermediate (first made for ages 7-8) and at most 92 words at Expert (first made for ages 9-10).

- **Beginner (written for Merit)**: no outside text was copied or adapted, and no ARC items were used for this level
  (the easiest ARC items were still too wordy for pre-readers). The reading micro-stories are new; the names and
  plots are not from any book. Words are kept to a high-frequency list built for this bank from `wordfreq` (very
  common words, Zipf 4.5 or more, plus a short hand-checked list of concrete words such as *puppy*, *magnet*,
  *puddle*); the build and the in-app tests both fail if a Beginner item uses a word outside that list. The list ships
  in `bank.js` as `M.BANK_EASY_WORDS` and in `bank.json` as `easyWords`. Pictures reuse the app's existing
  `scenes.js` drawings and counting pictures; no new art was made.

## How items were sorted into levels

- Items first made for ages 5-6, and the 210 new Beginner items, are **Beginner**. Their old steps 1-2 became
  Beginner step 1 and old steps 3-5 became Beginner step 2.
- Items first made for ages 7-8 are **Intermediate**: old steps 1-3 became step 3, old steps 4-5 became step 4.
- Items first made for ages 9-10 are **Expert** (step 5), except the easiest ones, which moved down to Intermediate
  step 4: science old steps 1-2 and physics old step 1. Every GSM8K problem and every ARC-Challenge item is Expert.
- Only the level and step changed. No question text, choices, answers, or credits changed in the move.
- Every Beginner item is checked against the high-frequency word list (see below). The build and the in-app tests
  fail if a Beginner item uses a word outside it.

## Not used

- **QASC** (allenai/qasc, CC BY 4.0) was downloaded and checked but not used. Its 8 crowd-written choices often
  include another answer that is also right (for example, "rain" is listed as a wrong answer to "What type of water
  formation is formed by clouds?"), so its items are not reliable for children without a review by hand.

## Art (v11)

The logo, favicon, subject mascots, counting objects, avatar and 3D shading are original SVG drawn
for Merit (js/art.js, assets/logo.svg, favicon.svg, merit.ico). No third-party images are used.

## Physics topics (v13)

17 physics topic skills with 320 more questions live in `js/physics_topics.js` (copy in `data/physics_topics.json`),
built by `tools/bank-build/physics_topics.py` from `tools/bank-build/ptsrc/*.py`. The older physics questions are unchanged.

| Source | Items | License | Credit |
|---|---|---|---|
| Written for Merit (original work) | 245 (all 119 Beginner, most Intermediate and Expert) | Original work for Merit; no outside license | "Written for Merit." |
| AI2 Reasoning Challenge (ARC-Easy and ARC-Challenge): https://huggingface.co/datasets/allenai/ai2_arc | 56, Intermediate and Expert | CC BY-SA 4.0 | Clark et al., Allen Institute for AI, 2018. The explanation lines are new, written for Merit. |
| MMLU, conceptual_physics subset: https://huggingface.co/datasets/cais/mmlu | 19, Expert (one Intermediate) | MIT | Hendrycks, Burns, Basart, Zou, Mazeika, Song, Steinhardt. "Measuring Massive Multitask Language Understanding." ICLR 2021. The explanation lines are new, written for Merit. |

Topics: Motion and speed, Gravity and falling, Forces and balance, Simple machines, Energy, Heat and temperature,
Light and color, Sound, Magnet power, Electricity, Solids, liquids, and gases, Space physics, Water and air pressure,
Waves, Measuring, Air and flight, Fun physics facts. Each one has 7 Beginner, 5-6 Intermediate and 5-6 Expert items.

- **Facts and explanations.** Every topic item has a one-line explanation, shown after the right answer as
  "Did you know?" and read aloud after "Correct". Each item records the reference its fact was checked against
  (`factRef`, `factRefUrl`): OpenStax *College Physics* (1st ed., CC BY 4.0;
  https://openstax.org/details/books/college-physics) for concepts and values (speed of sound about 343 m/s in air at
  20 C; water freezes at 0 C and boils at 100 C at sea level; pressure, buoyancy, circuits, magnets, waves, simple
  machines). NASA Science / NASA Space Place / the NSSDC Planetary Fact Sheet for space facts (Moon gravity 0.166 of
  Earth's, Mars 0.38, Jupiter about 2.4; Moon phases repeat every 29.5 days; sunlight reaches Earth in about 8
  minutes 20 seconds). NIST for the speed of light (299,792,458 m/s). ESFI for electrical safety advice. Some
  question ideas are like the PhET simulations (University of Colorado Boulder); no PhET text or images are used.
  NASA and NIST pages are cited for facts only; no text was copied.
- **ARC / MMLU tidy-ups.** Same as above: a `___` blank at the end of fill-in prompts, trailing periods removed from
  short choices, and fill-in choices start in lower case so no choice stands out. Question and answer text is
  otherwise word for word. `tools/bank-build/verify_topics.py` re-checks every ARC and MMLU answer against the
  downloaded datasets. Adapted ARC material stays under CC BY-SA 4.0; MMLU items stay under MIT.
- **Beginner items** pass the same high-frequency word list as the rest of the Beginner bank (the build and the
  in-app tests check it).
- **Pictures.** Items reuse the existing scene drawings where they fit. Six new pictures were drawn for Merit in
  `js/art.js` (lever, circuit with battery and bulb, prism and rainbow, drum with sound waves, Moon phases, water
  waves). They are original SVG; no third-party images are used.

## Sight words (v15)

200 single-word Beginner reading items live in `js/sightwords.js` (copy in `data/sightwords.json`), built by
`tools/bank-build/sightwords.py` and checked by `tools/bank-build/verify_sightwords.py`.

| Source | Items | License | Credit |
|---|---|---|---|
| Dolch sight word list (220 "service words"), Edward W. Dolch, first published 1936 (*Problems in Reading*, 1948): https://en.wikipedia.org/wiki/Dolch_word_list | 200 Beginner sight-word items (`sw-001` ... `sw-200`) | Public domain (a list of common words; no text copied beyond the words themselves) | "Sight word from the Dolch list (public domain)." |

- **Which 200**: every pre-primer (40), primer (52), 1st grade (41) and 2nd grade (46) word except *don't* (its
  apostrophe would stand out among the choices), 178 words, plus the 22 most common 3rd grade words by `wordfreq`
  (*if, about, only, much, got, never, long, better, own, show, keep, done, start, today, full, small, far, try,
  together, kind, light, myself*). Each item records its Dolch level (`dolch`) and list order (`rank`); pre-primer and
  primer words are Beginner step 1, the rest step 2.
- **Questions** (written for Merit): the word is shown big on the chalkboard and read aloud ("Find this word." then
  the word); the child taps the same word among 4 choices. A few words a voice may say oddly on their own (*a, I,
  read, live, us, does, use, am, its, may, an*) are followed by a short sentence, e.g. "read" then "I like to read."
- **Wrong choices**: other Dolch words, all lowercase (only *I* is capitalized, and only as its own answer).
  Look-alikes kids mix up come first (was/saw, on/no, the/then, of/off, where/were, said/say, there/three ...), then
  words one letter off or of about the same length. A choice is never a homophone of the word or of another choice
  (to/two/too, for/four, there/their, no/know, right/write, by/buy, eight/ate, read/red, our/are ...).
- **In the app**: mixed into Beginner reading practice (the 2nd and 6th of every 8 questions) and, half the time, on
  the one-word tier of the Everyday words / More sight words ladder skills. Words missed last time come back first,
  then new or least-seen words in Dolch order, with a few known words for review. A word counts as known after two
  right first tries in a row ("X of 200 words" on Home, Parent and the Classroom wall). Sight-word answers do not
  change the reading score, the reading path or the word-ladder rules for other skills. The 5-6 core skill that used
  to be called "Sight words" is now "Everyday words" (same questions) so the two are not confused.

## Shapes (v20)

The Math "Shapes" questions (sides and corners of the circle and of shapes with 3 to 10 sides, shape names, and
the "Did you know?" lines) and their pictures are original work written for Merit.

## Astronomy questions (v21)

`js/astronomy.js` / `data/astronomy.json`: 100 original space and planets questions written for Merit
(40 Beginner, 30 Intermediate, 30 Expert), built by `tools/bank-build/astronomy.py`. Every "Did you know?"
fact was checked against NASA pages (works of the U.S. Government, used here only as fact references; no NASA
text or images are copied):

- NASA Science: Sun, Earth, Moon and Moon phases, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto,
  planets, stars, galaxies, comets, asteroids, meteors and meteorites, black holes, eclipses (science.nasa.gov)
- NASA Science: Hubble Space Telescope and James Webb Space Telescope mission pages
- NASA: International Space Station, Apollo 11 mission, What is a rocket? (www.nasa.gov)
- NASA Space Place: seasons, constellations, gravity (spaceplace.nasa.gov)

Each item names its page in `factRef` / `factRefUrl`. The v21 items ask no moon counts for the giant planets; v22 adds them only as "more than" ranges (see below).

## More Astronomy questions (v22): moons, how many Earths fit inside, dwarf planets and the Kuiper Belt

86 more original questions (astro-101 to astro-186; 30 Beginner, 33 Intermediate, 23 Expert), also written for Merit and built
by `tools/bank-build/astronomy.py` from `tools/bank-build/astrosrc/items_v22.py`. Numbers are written in words so they read aloud
naturally. Checked on 2026-10-14 against these NASA pages:

- Moon counts:
  - NASA Science: Jupiter moons, https://science.nasa.gov/jupiter/jupiter-moons/ (115 officially recognized). The questions say "more than one hundred".
  - NASA Science: Saturn moons, https://science.nasa.gov/saturn/moons/ (293 confirmed as of August 2026). The questions say "more than two hundred".
  - NASA Science: Uranus moons, https://science.nasa.gov/uranus/moons/ (29 as of August 2026). The questions say "more than twenty five".
  - NASA Science: Neptune moons, https://science.nasa.gov/neptune/moons/ (16). The questions say "more than ten".
  - NASA Science: Mars moons (Phobos and Deimos), https://science.nasa.gov/mars/moons/
  - NASA Science: Moons of our solar system, https://science.nasa.gov/solar-system/moons/ (Mercury and Venus have none; Earth has one).
  - NASA Science: Ganymede, Titan and Triton, https://science.nasa.gov/jupiter/moons/ganymede/ , https://science.nasa.gov/saturn/moons/titan/ , https://science.nasa.gov/neptune/moons/triton/
- How many Earths fit inside: volume ratios from the NASA NSSDC planetary fact sheets, https://nssdc.gsfc.nasa.gov/planetary/factsheet/
  - The ratios are Jupiter 1321, Saturn 764, Uranus 63, Neptune 58 and the Sun 1,304,000.
  - Going the other way, Mars is 0.151 of Earth's volume (so about 6.6 fit inside Earth), Mercury 0.056 (about 18), Venus 0.857 (about 1.2) and the Moon 0.020 (about 50).
- Dwarf planets and the Kuiper Belt:
  - NASA Science: Dwarf planets (five recognized: Ceres, Pluto, Haumea, Makemake, Eris; the 2006 reclassification), https://science.nasa.gov/dwarf-planets/
  - NASA Science: Pluto facts (Charon, the heart named for Clyde Tombaugh, the name chosen by Venetia Burney), https://science.nasa.gov/dwarf-planets/pluto/facts/
  - NASA Science: Ceres facts, https://science.nasa.gov/dwarf-planets/ceres/facts/
  - NASA Science: Eris, https://science.nasa.gov/dwarf-planets/eris/
  - NASA Science: Haumea (oval shape, about four hour day, rings), https://science.nasa.gov/dwarf-planets/haumea/
  - NASA Science: Makemake (Rapanui god, found in 2005 just after Easter, Kuiper Belt, reddish brown, moon nicknamed MK 2 that Hubble found in 2016), https://science.nasa.gov/dwarf-planets/makemake/
  - NASA Science: Kuiper Belt facts (Arrokoth, short period comets), https://science.nasa.gov/solar-system/kuiper-belt/facts/
  - NASA Science: Oort Cloud, https://science.nasa.gov/solar-system/oort-cloud/
  - NASA Science: New Horizons, https://science.nasa.gov/mission/new-horizons/

Read-aloud: space names are said with a speech-friendly spelling. These are Makemake "Mah-kee Mah-kee", Haumea "How-may-uh",
Charon "Kair-on", Ceres "Seer-eez", Kuiper "Kye-per", Arrokoth "Air-oh-koth", Tombaugh Regio, Deimos, Dysnomia and Rapa Nui.
Only the spoken text uses these spellings (see `js/speech.js`); the screen does not change.

## Word match (v23)

`js/wordmatch.js` / `data/wordmatch.json`: 100 everyday words, an original list written for Merit. They are built by
`tools/bank-build/wordmatch.py` and grouped as family, home, animals, vehicles, food, body, nature, toys, clothes,
school and more. No word is one of the 220 Dolch sight words. Each item shows the word big and says it. The child
picks it from four choices; the wrong choices are look-alike words from the same list and are never homophones.

## Science topics (v26)

168 Beginner questions on Plants, Animals, Human body, and Matter (`js/sci_topics.js`), all original work written for
Merit, with general facts as taught in early-grade science (plant parts and needs, animal coverings, habitats, life cycles
and groups, the five senses and main organs, solids, liquids, gases and changes of state). No text was copied.
The pictures in `js/sci_art.js` are original SVG drawn for Merit.

## Animals pictures (v27)

The animal, habitat and covering drawings in `js/sci_animals.js` are original SVG drawn for Merit.

## Living / nonliving pictures (v28)

The living-thing and nonliving-object drawings added to `js/sci_animals.js` for the Science living questions, and the
card layouts in `js/sci_living.js`, are original SVG drawn for Merit.

## Fonts (bundled for offline use)
- Nunito, by Vernon Adams, Cyreal, and Jacques Le Bailly. SIL Open Font License 1.1. Source: Google Fonts.
- Patrick Hand, by Patrick Wagesreiter. SIL Open Font License 1.1. Source: Google Fonts.
