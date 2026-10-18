import sys, subprocess, time, json, os
from playwright.sync_api import sync_playwright
root = "/workspace/merit/work"; port = 8810
shots = root + "/screens"; os.makedirs(shots, exist_ok=True)
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errs = []; log = []
def st(pg): return pg.evaluate("Merit.appTest.state()")
try:
  with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
    pg.on("console", lambda m: errs.append("console.error: " + m.text) if m.type == "error" else None)
    pg.on("requestfailed", lambda r: errs.append("requestfailed: " + r.url) if "fonts.g" not in r.url else None)
    pg.goto(f"http://127.0.0.1:{port}/index.html"); pg.wait_for_timeout(800)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
    # create a player through the UI
    pg.click("[data-act=create]"); pg.fill("#player-name", "Ada"); pg.click("[data-act=name-next]")
    pg.click("[data-act=look-next]")
    if pg.locator("[data-act=age][data-id='7-8']").count() == 0:
        log.append("pass stage present; tapping icons")
        for _ in range(3):
            pg.locator("[data-act]").filter(has=pg.locator("svg")).first.click()
    pg.click("[data-act=age][data-id='7-8']"); pg.wait_for_timeout(300)
    log.append("home: " + st(pg)["screen"])
    pg.screenshot(path=shots + "/01-home.png")
    # Reading warm-up until a bank fable appears
    pg.click("[data-act=practice][data-id=reading]"); pg.wait_for_timeout(300)
    found = False
    for i in range(20):
        s = st(pg)
        if s["questionSkill"] == "story": found = True; break
        if pg.locator("[data-act=flash-yes]").count(): pg.click("[data-act=flash-yes]")
        else: pg.evaluate("Merit.appTest.correctAndNext()")
        pg.wait_for_timeout(150)
    log.append("reading fable reached: %s after %d" % (found, i))
    pg.wait_for_timeout(300)
    pg.screenshot(path=shots + "/02-reading-fable.png")
    s = st(pg)
    picks = pg.locator("[data-act=pick]")
    wrong = [picks.nth(k) for k in range(picks.count()) if picks.nth(k).get_attribute("data-id") != s["correctId"]]
    if wrong: wrong[0].click(); pg.wait_for_timeout(200); log.append("after wrong: pct=%s phase=%s miss=%s" % (st(pg)["pct"], st(pg)["phase"], pg.locator(".choice.miss").count()))
    pg.click(f"[data-act=pick][data-id='{s['correctId']}']"); pg.wait_for_timeout(200)
    log.append("after right: correct shown=%s" % pg.locator(".result-correct").count())
    pg.screenshot(path=shots + "/03-reading-correct.png")
    pg.wait_for_timeout(1300)
    log.append("advanced to index %s" % st(pg)["index"])
    # Science: placed set mode, find a bank fact
    pg.click(".session-bar [data-act=stop]"); pg.wait_for_timeout(200)
    pg.evaluate("Merit.appTest.reset(); Merit.appTest.create({name:'Bo', band:'9-10', placed:true});")
    pg.wait_for_timeout(200)
    pg.click("[data-act=practice][data-id=science]"); pg.wait_for_timeout(300)
    for i in range(12):
        if st(pg)["questionSkill"] == "facts": break
        pg.evaluate("Merit.appTest.correctAndNext()"); pg.wait_for_timeout(100)
    pg.evaluate("Merit.quiet && Merit.quiet()")
    log.append("science bank q: %s | %s" % (st(pg)["questionSkill"], st(pg)["prompt"]))
    pg.screenshot(path=shots + "/04-science-fact.png")
    pg.click(f"[data-act=pick][data-id='{st(pg)['correctId']}']"); pg.wait_for_timeout(200)
    log.append("science correct shown=%s" % pg.locator(".result-correct").count())
    # Math word problems via the math picker
    pg.click(".session-bar [data-act=stop]"); pg.wait_for_timeout(200)
    pg.click("[data-act=home]"); pg.wait_for_timeout(200)
    pg.click("[data-act=practice][data-id=math]"); pg.wait_for_timeout(200)
    pg.click("[data-act=math-level][data-id=intermediate]")
    pg.click("[data-act=math-section][data-id=word]")
    pg.screenshot(path=shots + "/05-math-pick.png")
    pg.click("[data-act=math-start]"); pg.wait_for_timeout(300)
    s = st(pg); log.append("math: %s step-allowType=%s | %s" % (s["questionSkill"], s["allowType"], s["prompt"]))
    pg.screenshot(path=shots + "/06-math-word.png")
    if s["allowType"]:
        q = pg.evaluate("Merit.appTest.state()")
        ans = pg.evaluate("(function(){var b=document.querySelector('[data-act=pick][data-id=\"'+Merit.appTest.state().correctId+'\"]');return b.textContent;})()")
        pg.fill("#typed", ans); pg.click("[data-act=type-go]"); pg.wait_for_timeout(200)
        log.append("typed %s -> correct shown=%s" % (ans, pg.locator(".result-correct").count()))
    else:
        pg.click(f"[data-act=pick][data-id='{s['correctId']}']")
    pg.wait_for_timeout(1300)
    # Parent screen credits
    pg.click(".session-bar [data-act=stop]"); pg.wait_for_timeout(200)
    pg.click("[data-act=home]"); pg.wait_for_timeout(200)
    pg.click("[data-act=ask-parent]"); pg.wait_for_timeout(200)
    txt = pg.locator(".sub").first.text_content()
    import re
    nums = [int(n) for n in re.findall(r"\d+", txt)][:2]
    pg.fill("#gate-answer", str(sum(nums))); pg.click("[data-act=gate-go]"); pg.wait_for_timeout(300)
    log.append("parent credits panel: %s" % pg.locator(".credits").count())
    pg.locator(".credits").scroll_into_view_if_needed()
    pg.screenshot(path=shots + "/07-parent-credits.png", full_page=True)
    # progress saved?
    saved = pg.evaluate("JSON.parse(localStorage.getItem('merit.v1')).profiles[0].subjects.science.bands['9-10'].skills.facts.answers.length")
    log.append("science facts answers saved in merit.v1: %s" % saved)
    b.close()
finally:
  srv.terminate()
print("\n".join(log)); print("ERRORS:", errs)
