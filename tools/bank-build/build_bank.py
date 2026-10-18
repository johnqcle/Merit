import json, re, random, math, collections, sys, ast, operator
sys.path.insert(0, "/workspace/merit/build")
from wordfreq import zipf_frequency
from fables import FABLES

R = "/workspace/merit/build/raw/"
rnd = random.Random(20261010)

def load(*names):
    out = []
    for n in names: out += json.load(open(R + n + ".json"))
    return out

# ---------------- shared safety + readability ----------------
BLOCK = re.compile(r"\b(kill\w*|die|dies|died|dying|dead|death|deaths|blood\w*|gun\w*|weapon\w*|knife|knives|sword\w*|war|wars|bomb\w*|explo\w*|poison\w*|toxic|drug\w*|alcohol\w*|beer|wine|liquor|drunk\w*|smok\w*|cigar\w*|tobacco|nicotine|sex\w*|pregnan\w*|birth\s*control|disease\w*|illness\w*|ill|sick\w*|cancer|tumor\w*|virus\w*|viral|bacteri\w*|infect\w*|germ\w*|fever|flu|vaccin\w*|injur\w*|wound\w*|hurt\w*|pain\w*|attack\w*|hunt\w*|shoot\w*|shot|bullet\w*|murder\w*|crime\w*|steal\w*|stole\w*|thief|thieves|rob\w*|police|prison\w*|jail\w*|fight\w*|punch\w*|slaughter\w*|butcher\w*|meat|hospital\w*|surgery|medicine\w*|medication\w*|pill\w*|doctor\w*|scary|fright\w*|terror\w*|horror|ghost\w*|monster\w*|disaster\w*|destroy\w*|tornado\w*|hurricane\w*|tsunami\w*|flood\w*|nuclear|radioactiv\w*|radiation|chemical\s+weapon|extinct\w*|corpse|skull|carcass|decompos\w*|rot|rotting|pollut\w*|toilet|urine|feces|sweat\w*|lung\w*|heart attack|obes\w*|diet\w*|calorie\w*|religio\w*|god|gods|church\w*|gambl\w*|casino|lottery|bet|bets|tax\w*|debt\w*|loan\w*|interest|salary|wage\w*|fired|divorc\w*|funeral\w*|grave\w*|prey|predator\w*|parasite\w*|insecticide\w*|pesticide\w*|cigarette\w*|vomit\w*|cough\w*|sneez\w*|bleed\w*|allerg\w*|asthma|diabet\w*|blind|deaf|cell\s*phone)\b", re.I)
DIAGRAM = re.compile(r"\b(diagram|shown|picture|graph|table|chart|map|figure|below|above|following data|data table|illustrat\w*|model shown|pictured|drawing)\b", re.I)
ADVANCED = re.compile(r"\b(atom\w*|electron\w*|proton\w*|neutron\w*|molecul\w*|isotope\w*|ion|ions|element|elements|compound\w*|velocity|acceleration|density|SI|newton\w*|joule\w*|watt\w*|calculator|laboratory|scientific notation|hypothes\w*|genotype|phenotype|allele\w*|chromosom\w*|DNA|gene|genes|mitosis|meiosis|nucleus|cytoplasm|organelle\w*|enzyme\w*|hormone\w*|tectonic|lithosphere|asthenosphere|mantle|wavelength\w*|frequency|amplitude|kinetic|potential energy|latitude|longitude|reservoir|stimulus|evolution|evolve\w*|species|population)\b", re.I)
SYMBOLS = re.compile(r"[\^_{}=<>~]|\d[Ee]\d|\bkg\b|\blb\b|\bml\b|\bcm\b|°")
WEIRD_CHOICE = re.compile(r"\b(all of the above|none of the above|both [a-d] and [a-d]|[a-d] and [a-d] only|only [a-d])\b", re.I)

SCI_OK = set("""magnet magnets magnetic gravity friction mammal mammals reptile reptiles amphibian amphibians insect insects larva pupa caterpillar
caterpillars tadpole tadpoles seedling seedlings fossil fossils mineral minerals erosion habitat habitats evaporate evaporates evaporation
condense condenses condensation precipitation thermometer telescope microscope magnifying lens prism vibrate vibrates vibration vibrations
celsius fahrenheit centimeter centimeters meter meters kilogram kilograms gram grams liter liters milliliter milliliters
nectar pollen pollinate pollination photosynthesis chlorophyll oxygen carbon dioxide nutrients nutrient sprout sprouts germinate
crater craters orbit orbits orbiting rotate rotates rotation revolve revolves revolution axis hemisphere equator lunar solar planet planets
mercury venus mars jupiter saturn uranus neptune galaxy constellation constellations comet comets asteroid asteroids meteor
volcano volcanoes earthquake earthquakes glacier glaciers sediment sediments boulder pebble pebbles sand silt clay soil humus
herbivore herbivores carnivore carnivores omnivore omnivores decomposer decomposers producer producers consumer consumers
metamorphosis hibernate hibernation migrate migration camouflage adaptation adaptations inherited trait traits offspring
conductor conductors insulator insulators circuit circuits battery batteries bulb bulbs wire wires electricity electric electrical
pulley pulleys lever levers wedge ramp inclined plane screw axle mass volume density dissolve dissolves dissolved mixture mixtures solution
liquid liquids solid solids gas gases vapor freezes freezing melts melting boiling boils steam ice
weathering landform landforms canyon canyons delta valley valleys sunlight shadow shadows reflect reflects reflection mirror mirrors
opaque transparent translucent echo pitch thunder lightning hail sleet humid humidity forecast meteorologist
gills fins scales feathers fur beak beaks roots stems stem leaves petals seed seeds cone cones spores fern ferns moss
organism organisms environment ecosystem ecosystems recycle recycling renewable nonrenewable resource resources fuel fuels coal
skeleton skeletons muscle muscles bones heart stomach digest digestion senses sense nostrils
""".split())

def words(s): return re.findall(r"[A-Za-z']+", s)

def syl(w):
    w = w.lower()
    w = re.sub(r"[^a-z]", "", w)
    if not w: return 0
    if len(w) <= 3: return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w)
    w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))

def fk(text):
    ws = words(text)
    if not ws: return 0
    sents = max(1, len(re.findall(r"[.?!]", text)))
    s = sum(syl(w) for w in ws)
    return 0.39 * len(ws) / sents + 11.8 * s / len(ws) - 15.59

def rare_words(text, z):
    bad = []
    for w in words(text):
        lw = w.lower().strip("'")
        if lw.endswith("'s"): lw = lw[:-2]
        if len(lw) <= 2 or lw in SCI_OK: continue
        if zipf_frequency(lw, "en") < z: bad.append(lw)
    return bad

def safe(text): return not BLOCK.search(text)

# ---------------- science / physics from ARC ----------------
PHYS = re.compile(r"\b(force|forces|push\w*|pull\w*|motion|moving|move|moves|speed\w*|fast\w*|slow\w*|gravity|friction|magnet\w*|electric\w*|circuit\w*|battery|batteries|bulb\w*|light|lights|shadow\w*|mirror\w*|reflect\w*|prism|sound\w*|vibrat\w*|pitch|echo\w*|loud\w*|energy|heat|heats|heated|conduct\w*|insulat\w*|ramp\w*|lever\w*|pulley\w*|roll\w*|bounce\w*|wheel\w*|weight|mass|temperature|thermometer)\b", re.I)
LIFE_EARTH = re.compile(r"\b(plant\w*|animal\w*|leaf|leaves|seed\w*|flower\w*|root\w*|food chain|habitat\w*|offspring|trait\w*|cell\w*|organism\w*|fossil\w*|rock\w*|soil|weather\w*|cloud\w*|rain\w*|moon\w*|planet\w*|star\w*|sun\b|earth\b)\b", re.I)

def grade_of(rid):
    m = re.match(r"^(MCAS|NYSEDREGENTS|MEA|NCEOGA|MDSA|LEAP|VASoL|AKDE|OHAT|TAKS|MEAP|WASL|FCAT|AIMS|MSA|NAEP|TIMSS|ACTAAP)_\d{4}_(\d+)", rid)
    if m: return int(m.group(2))
    m = re.match(r"^(TIMSS|NAEP|ACTAAP|AIMS|MSA)_\d{4}_(\d+)", rid)
    return int(m.group(2)) if m else None

def arc_items(rows, challenge=False):
    out = []; seen = set()
    for r in rows:
        q = " ".join(r["question"].split())
        texts = [" ".join(t.split()) for t in r["choices"]["text"]]
        labels = r["choices"]["label"]
        if r["answerKey"] not in labels: continue
        ans = texts[labels.index(r["answerKey"])]
        if len(texts) < 3: continue
        g = grade_of(r["id"])
        if g is not None and g > 5: continue
        blob = q + " " + " ".join(texts)
        if ADVANCED.search(blob) or SYMBOLS.search(blob): continue
        if not safe(blob) or DIAGRAM.search(q) or any(WEIRD_CHOICE.search(t) for t in texts): continue
        if re.search(r"\b[A-D]\b\)|\(\d\)|_{2,}", blob): continue
        if len(set(t.lower() for t in texts)) != len(texts): continue
        if q.lower() in seen: continue
        seen.add(q.lower())
        qw = len(words(q)); cw = max(len(words(t)) for t in texts)
        f = fk(q)
        rare35 = rare_words(blob, 3.5); rare30 = rare_words(blob, 3.0)
        band = None
        if qw <= 20 and cw <= 4 and f <= 5 and not rare35 and (g is None or g <= 4): band = "7-8"
        elif qw <= 30 and cw <= 7 and f <= 7.5 and not rare30: band = "9-10"
        if challenge and band: band = "9-10"
        if not band: continue
        key = q + " " + ans
        subj = "physics" if PHYS.search(key) and not LIFE_EARTH.search(key) else "science"
        score = f + 0.12 * qw + 0.3 * cw + 0.6 * len(rare35)
        wrong = [t for t in texts if t != ans]
        rnd.shuffle(wrong)
        out.append(dict(src_id=r["id"], q=q, ans=ans, wrong=wrong[:3], band=band, subject=subj, score=score, grade=g))
    return out

easy = arc_items(load("arc_easy_train", "arc_easy_validation", "arc_easy_test"))
chal = arc_items(load("arc_chal_train", "arc_chal_validation", "arc_chal_test"), challenge=True)

def relate(subject, band, q):
    t = q.lower()
    table = {
      ("science","7-8"): [("habitat", r"habitat|live in|desert|ocean|forest|pond"), ("cycle", r"life cycle|egg|larva|pupa|tadpole|caterpillar|grow into|adult"), ("matter", r"solid|liquid|gas|melt|freez|boil|evapor"), ("space", r"moon|planet|star|sun\b|earth's|orbit|sky")],
      ("science","9-10"): [("food", r"food chain|eat|energy from|herbivore|carnivore|consumer|producer"), ("mixture", r"mixture|dissolv|separat|sand and|salt"), ("water", r"water cycle|evapor|condens|precipit|cloud|rain"), ("fairtest", r"experiment|investigat|variable|test|hypothes"), ("space", r"moon|planet|star|sun\b|orbit|telescope")],
      ("physics","7-8"): [("friction", r"friction|rough|smooth|slide"), ("ramp", r"ramp|slope|roll"), ("magnet", r"magnet"), ("drop", r"drop|fall|gravity")],
      ("physics","9-10"): [("balanceforce", r"force|push|pull|gravity|friction"), ("trips", r"speed|distance|travel|fast"), ("light", r"light|shadow|mirror|reflect"), ("pulley", r"pulley|lever|machine")],
    }
    for sid, pat in table.get((subject, band), []):
        if re.search(pat, t): return sid
    return None

ARC_URL = "https://huggingface.co/datasets/allenai/ai2_arc"
ARC_CREDIT = "Question from the AI2 Reasoning Challenge (ARC), Allen Institute for AI, CC BY-SA 4.0."

def pick_spread(items, cap):
    items = sorted(items, key=lambda x: x["score"])
    if len(items) <= cap: return items
    # keep an even spread across difficulty
    step = len(items) / cap
    return [items[int(i * step)] for i in range(cap)]

# physics 7-8 is thin: lend it the plainest physics items that only just missed the 7-8 cut
p78 = [x for x in easy if x["subject"] == "physics" and x["band"] == "7-8"]
if len(p78) < 70:
    lend = sorted([x for x in easy if x["subject"] == "physics" and x["band"] == "9-10" and len(words(x["q"])) <= 22
                   and max(len(words(t)) for t in [x["ans"]] + x["wrong"]) <= 5 and fk(x["q"]) <= 6.5], key=lambda x: x["score"])
    for x in lend[: 70 - len(p78)]: x["band"] = "7-8"

bank = []
CAPS = {("science","7-8"): 220, ("science","9-10"): 260, ("physics","7-8"): 110, ("physics","9-10"): 140}
for (subj, band), cap in CAPS.items():
    pool = [x for x in easy if x["subject"] == subj and x["band"] == band]
    chosen = pick_spread(pool, cap)
    n = len(chosen)
    for i, x in enumerate(chosen):
        step = 1 + min(4, int(5 * i / n))
        if band == "9-10" and step == 5 and i % 2 == 1: pass
        bank.append(dict(kind="arc", subject=subj, band=band, step=step, x=x, dataset="ARC-Easy"))
    # sparing ARC-Challenge, hardest step of 9-10 only
    if band == "9-10":
        cpool = [x for x in chal if x["subject"] == subj]
        cpool = sorted(cpool, key=lambda x: x["score"])[: (20 if subj == "science" else 10)]
        for x in cpool: bank.append(dict(kind="arc", subject=subj, band=band, step=5, x=x, dataset="ARC-Challenge"))

items = []
counter = collections.Counter()
def new_id(prefix):
    counter[prefix] += 1
    return "%s-%04d" % (prefix, counter[prefix])

for b in bank:
    x = b["x"]
    def tidy(c):
        c = c.strip()
        if c.endswith(".") and not c.endswith("..") and len(words(c)) <= 8: c = c[:-1]
        return c
    ans = tidy(x["ans"]); choices = [ans] + [tidy(w) for w in x["wrong"]]
    prompt = x["q"]
    prompt = re.sub(r"\s*[-\u2013\u2014]\s*$", "", prompt)
    if not re.search(r"[?.!:]$", prompt): prompt = prompt + " ___"
    if len(set(c.lower() for c in choices)) != len(choices): continue
    items.append(dict(
        id=new_id(("sci" if b["subject"] == "science" else "phy") + b["band"].replace("-", "")),
        subject=b["subject"], band=b["band"], skill=("facts" if b["subject"] == "science" else "physfacts"), relatedSkill=relate(b["subject"], b["band"], x["q"]),
        step=b["step"], prompt=prompt, choices=choices, answer=ans,
        explanation="The answer is: " + ans + ".",
        source="AI2 Reasoning Challenge (" + b["dataset"] + "), item " + x["src_id"], sourceUrl=ARC_URL,
        license="CC BY-SA 4.0", credit=ARC_CREDIT, adapted=False))

# ---------------- math: SVAMP (7-8) ----------------
def nums_in(s): return [float(n) for n in re.findall(r"\d+(?:\.\d+)?", s.replace(",", ""))]

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}
def safe_eval(expr):
    def ev(n):
        if isinstance(n, ast.Expression): return ev(n.body)
        if isinstance(n, ast.Constant): return float(n.value)
        if isinstance(n, ast.BinOp) and type(n.op) in OPS: return OPS[type(n.op)](ev(n.left), ev(n.right))
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.USub): return -ev(n.operand)
        raise ValueError(expr)
    return ev(ast.parse(expr, mode="eval"))

def distractors(ans, numbers, rng):
    cands = []
    ns = [int(n) for n in numbers if float(n).is_integer()]
    for i in range(len(ns)):
        for j in range(len(ns)):
            if i == j: continue
            a, b = ns[i], ns[j]
            cands += [a + b, abs(a - b)]
            if a * b <= 200: cands.append(a * b)
    cands += ns
    near = [ans + d for d in (1, -1, 2, -2, 10, -10, 3, -3, 5, -5)]
    pool = []
    for c in cands:
        if c != ans and c > 0 and c not in pool and abs(c - ans) <= max(12, ans): pool.append(c)
    rng.shuffle(pool)
    out = pool[:2]
    for c in near:
        if len(out) >= 3: break
        if c > 0 and c != ans and c not in out: out.append(c)
    return out[:3]

MATH_WORDS = 3.2
def kid_text_ok(text, z=MATH_WORDS):
    return safe(text) and not rare_words(text, z) and "$" not in text and "%" not in text and not re.search(r"\d+/\d+|\d\.\d", text)

sv = load("svamp_train", "svamp_test")
svamp = []
for r in sv:
    text = " ".join((r["Body"].strip().rstrip(".") + ". " + r["Question"].strip()).split())
    text = text.replace(" ,", ",").replace(" .", ".")
    text = re.sub(r"(\w) - (\w)", r"\1-\2", text)
    if re.match(r"^(He|She|They|It|Then)\b", text): continue
    if re.search(r"\b(stray|eating goldfish|disappeared|salt)\b", text, re.I): continue
    try: val = safe_eval(r["Equation"])
    except Exception: continue
    if abs(val - float(r["Answer"])) > 1e-6 or not float(val).is_integer(): continue
    ans = int(val)
    if ans <= 0 or ans > 60: continue
    if len(words(text)) > 42 or not kid_text_ok(text): continue
    if any(n > 100 for n in nums_in(text)): continue
    nops = len(re.findall(r"[-+*/]", r["Equation"]))
    if nops > 2: continue
    hasmd = bool(re.search(r"[*/]", r["Equation"]))
    score = nops * 2 + (1.5 if hasmd else 0) + ans / 25 + len(words(text)) / 30
    eq = re.sub(r"(\d+)\.0\b", r"\1", r["Equation"]).replace("*", "×").replace("/", "÷")
    eq = re.sub(r"\(\s*", "(", eq); eq = re.sub(r"\s*\)", ")", eq); eq = " ".join(eq.split())
    if eq.startswith("(") and eq.endswith(")") and eq.count("(") == 1: eq = eq[1:-1]
    svamp.append(dict(src=r["ID"], text=text, ans=ans, score=score, eq=eq, nums=nums_in(text)))
svamp.sort(key=lambda x: x["score"])
seen = set(); svamp = [s for s in svamp if not (s["text"] in seen or seen.add(s["text"]))]
svamp = pick_spread(svamp, 150)
for i, s in enumerate(svamp):
    step = 1 + min(4, int(5 * i / len(svamp)))
    wr = distractors(s["ans"], s["nums"], rnd)
    items.append(dict(id=new_id("math78"), subject="math", band="7-8", skill="word", relatedSkill=None, step=step,
        prompt=s["text"], choices=[str(s["ans"])] + [str(w) for w in wr], answer=str(s["ans"]), answerKind="number",
        explanation=s["eq"] + " = " + str(s["ans"]),
        source="SVAMP, item " + s["src"], sourceUrl="https://huggingface.co/datasets/ChilleD/SVAMP",
        license="MIT", credit="Word problem from SVAMP (Patel, Bhattamishra & Goyal, 2021), MIT License.", adapted=False))

# ---------------- math: GSM8K (9-10) ----------------
gs = load("gsm8k_train", "gsm8k_test")
gsm = []
for k, r in enumerate(gs):
    q = " ".join(r["question"].split())
    sol = r["answer"]
    m = re.search(r"####\s*(-?[\d,]+)\s*$", sol)
    if not m: continue
    final = int(m.group(1).replace(",", ""))
    calcs = re.findall(r"<<([^=<>]+)=([^<>]+)>>", sol)
    if not calcs or len(calcs) > 3: continue
    ok = True; last = None
    for expr, res in calcs:
        try:
            v = safe_eval(expr.replace("x", "*").replace("X", "*"))
            rv = float(res.replace(",", ""))
        except Exception: ok = False; break
        if abs(v - rv) > 1e-6 or not float(v).is_integer() or v < 0 or v > 500: ok = False; break
        last = v
    if not ok or last is None or int(last) != final: continue
    if final <= 0 or final > 120: continue
    if len(words(q)) > 48 or not kid_text_ok(q, 3.0): continue
    if any(n > 200 for n in nums_in(q)): continue
    if re.search(r"\b(years? old|as old|older|younger|ages?|rate|efficiency|percent|half|third|quarter|fraction|average|ratio|per cent|dozen|hour\w* per|minutes? per|miles|mph|km)\b", q, re.I): continue
    steps_txt = []
    for line in sol.split("\n"):
        if line.startswith("####"): continue
        line = re.sub(r"<<[^>]*>>", "", line).strip()
        if line: steps_txt.append(line)
    expl = " ".join(steps_txt)
    if len(words(expl)) > 60 or not safe(expl): continue
    nums = nums_in(q)
    score = len(calcs) * 3 + final / 40 + len(words(q)) / 25 + (1 if re.search(r"[*/x]", " ".join(c[0] for c in calcs)) else 0)
    gsm.append(dict(src=("train" if k < 7473 else "test") + "#" + str(k if k < 7473 else k - 7473), text=q, ans=final, score=score, expl=expl, nums=nums))
gsm.sort(key=lambda x: x["score"])
seen = set(); gsm = [s for s in gsm if not (s["text"] in seen or seen.add(s["text"]))]
gsm = pick_spread(gsm, 150)
for i, s in enumerate(gsm):
    step = 1 + min(4, int(5 * i / len(gsm)))
    wr = distractors(s["ans"], s["nums"], rnd)
    items.append(dict(id=new_id("math910"), subject="math", band="9-10", skill="word", relatedSkill=None, step=step,
        prompt=s["text"], choices=[str(s["ans"])] + [str(w) for w in wr], answer=str(s["ans"]), answerKind="number",
        explanation=s["expl"],
        source="GSM8K, " + s["src"], sourceUrl="https://huggingface.co/datasets/openai/gsm8k",
        license="MIT", credit="Word problem from GSM8K (Cobbe et al., OpenAI, 2021), MIT License.", adapted=False))

# ---------------- reading: Aesop retellings ----------------
for f in FABLES:
    for n, (step, prompt, ans, wrong, expl) in enumerate(f["qs"]):
        items.append(dict(id=new_id("read" + f["band"].replace("-", "")), subject="reading", band=f["band"], skill="story", relatedSkill=None,
            step=step, title=f["title"], passage=f["text"], prompt=prompt, choices=[ans] + wrong, answer=ans, explanation=expl,
            source="Aesop's Fables, tr. George Fyler Townsend (Project Gutenberg eBook #21): \"" + f["title"] + "\"",
            sourceUrl="https://www.gutenberg.org/ebooks/21", license="Public domain (passage); questions original to this bank",
            credit="Retold from Aesop's Fables (Townsend translation, public domain, via Project Gutenberg). Questions written for Merit.",
            adapted=True))

# ---------------- validation ----------------
ids = set()
for it in items:
    assert it["id"] not in ids; ids.add(it["id"])
    assert it["answer"] in it["choices"], it
    assert len(it["choices"]) == len(set(it["choices"])) >= 3, it
    assert 1 <= it["step"] <= 5
    blob = it["prompt"] + " " + " ".join(it["choices"]) + " " + it.get("passage", "")
    if it["subject"] != "reading": assert safe(blob), it
    if it.get("answerKind") == "number": assert all(re.fullmatch(r"\d+", c) for c in it["choices"]), it
    for k in ("id","subject","band","skill","step","prompt","choices","answer","source","sourceUrl","license","credit"): assert it.get(k) not in (None, ""), (k, it)

json.dump(dict(version=1, built="2026-10-10", count=len(items), items=items), open("/workspace/merit/build/bank.json", "w"), indent=1, ensure_ascii=False)
c = collections.Counter((i["subject"], i["band"], i["skill"]) for i in items)
for k in sorted(c): print(k, c[k], dict(sorted(collections.Counter(i["step"] for i in items if (i["subject"], i["band"], i["skill"]) == k).items())))
print("total", len(items))
print("arc easy candidates", collections.Counter((x["subject"], x["band"]) for x in easy))
print("svamp kept", len(svamp), "gsm kept", len(gsm))

# ---------------- emit js/bank.js + data/bank.json ----------------
import os
WORK = "/workspace/merit/work"
os.makedirs(WORK + "/data", exist_ok=True)
SOURCES = [
  dict(id="arc", name="AI2 Reasoning Challenge (ARC-Easy, a few ARC-Challenge)", url="https://huggingface.co/datasets/allenai/ai2_arc", license="CC BY-SA 4.0", by="Allen Institute for AI (Clark et al., 2018)", used="Science and physics facts, ages 7-8 and 9-10"),
  dict(id="svamp", name="SVAMP", url="https://huggingface.co/datasets/ChilleD/SVAMP", license="MIT", by="Patel, Bhattamishra & Goyal (2021)", used="Math word problems, ages 7-8"),
  dict(id="gsm8k", name="GSM8K", url="https://huggingface.co/datasets/openai/gsm8k", license="MIT", by="OpenAI (Cobbe et al., 2021)", used="Math word problems, ages 9-10"),
  dict(id="aesop", name="Aesop's Fables, translated by George Fyler Townsend (Project Gutenberg eBook #21)", url="https://www.gutenberg.org/ebooks/21", license="Public domain in the USA (retold in simpler words; questions written for Merit)", by="Project Gutenberg", used="Reading story questions, ages 7-8 and 9-10"),
]
out_items = []
for it in items:
    o = {k: v for k, v in it.items() if v is not None}
    out_items.append(o)
doc = dict(version=1, built="2026-10-10", count=len(out_items), sources=SOURCES, items=out_items)
json.dump(doc, open(WORK + "/data/bank.json", "w"), indent=1, ensure_ascii=False)
with open(WORK + "/js/bank.js", "w", encoding="utf-8") as fh:
    fh.write("""(function (M) {
  "use strict";

  // Starter question bank built from openly licensed datasets. Generated file:
  // rebuild with build/build_bank.py rather than editing by hand. See CREDITS.md.
  M.BANK_SOURCES = %s;

  M.BANK = [
%s
  ];

  var index = null;

  function buildIndex() {
    index = {};
    M.BANK.forEach(function (item) {
      var k = item.subject + "|" + item.band + "|" + item.skill;
      if (!index[k]) index[k] = { 1: [], 2: [], 3: [], 4: [], 5: [] };
      index[k][item.step].push(item);
    });
  }

  M.bankItems = function (subject, band, skill, step) {
    if (!index) buildIndex();
    var byStep = index[subject + "|" + band + "|" + skill];
    if (!byStep) return [];
    if (step == null) return [1, 2, 3, 4, 5].reduce(function (all, s) { return all.concat(byStep[s]); }, []);
    return byStep[step] || [];
  };

  M.bankHas = function (subject, band, skill) {
    return M.bankItems(subject, band, skill).length > 0;
  };

  // Pick one item for this subject, band, skill, and step. If the step is empty,
  // use the nearest step that has items (easier first on a tie).
  M.bankPick = function (subject, band, skill, step, rng) {
    rng = rng || Math.random;
    var s = Math.max(1, Math.min(5, step || 1));
    for (var d = 0; d <= 4; d++) {
      var tries = d === 0 ? [s] : [s - d, s + d];
      for (var i = 0; i < tries.length; i++) {
        if (tries[i] < 1 || tries[i] > 5) continue;
        var list = M.bankItems(subject, band, skill, tries[i]);
        if (list.length) return list[Math.floor(rng() * list.length)];
      }
    }
    return null;
  };
})(window.Merit = window.Merit || {});
""" % (json.dumps(SOURCES, ensure_ascii=False), ",\n".join("    " + json.dumps(o, ensure_ascii=False) for o in out_items)))
print("wrote", WORK + "/js/bank.js", os.path.getsize(WORK + "/js/bank.js"))
