import json, re, subprocess, sys
sys.path.insert(0, "/workspace/merit/build")
R = "/workspace/merit/build/raw/"
W = "/workspace/merit/work/"
doc = json.load(open(W + "data/bank.json"))
items = doc["items"]
# JS and JSON copies agree
js = subprocess.run(["node", "-e", "global.window={};require('%sjs/bank.js');process.stdout.write(JSON.stringify(window.Merit.BANK))" % W], capture_output=True, text=True, check=True).stdout
assert json.loads(js) == items, "bank.js and bank.json differ"
def load(*n):
    out=[]
    for x in n: out += json.load(open(R + x + ".json"))
    return out
sv = {r["ID"]: r for r in load("svamp_train","svamp_test")}
gtr, gte = load("gsm8k_train"), load("gsm8k_test")
arc = {r["id"]: r for r in load("arc_easy_train","arc_easy_validation","arc_easy_test","arc_chal_train","arc_chal_validation","arc_chal_test")}
n = dict(svamp=0, gsm=0, arc=0)
for it in items:
    src = it["source"]
    if src.startswith("SVAMP"):
        r = sv[src.split("item ")[1]]
        assert float(r["Answer"]) == float(it["answer"]), it["id"]; n["svamp"] += 1
    elif src.startswith("GSM8K"):
        split, k = src.split(", ")[1].split("#"); r = (gtr if split == "train" else gte)[int(k)]
        assert r["question"].split() == it["prompt"].split(), it["id"]
        assert int(r["answer"].split("####")[1].strip().replace(",", "")) == int(it["answer"]), it["id"]; n["gsm"] += 1
    elif src.startswith("AI2"):
        r = arc[src.split("item ")[1]]
        key = " ".join(r["choices"]["text"][r["choices"]["label"].index(r["answerKey"])].split())
        assert key.rstrip(".") == it["answer"].rstrip("."), (it["id"], key, it["answer"]); n["arc"] += 1
print("verified against source datasets:", n, "| JS == JSON:", True, "| total", len(items))
