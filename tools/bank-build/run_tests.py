import sys, subprocess, time, json
from playwright.sync_api import sync_playwright
root, port = sys.argv[1], int(sys.argv[2])
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.0)
res = {}
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for page_name in ["tests.html", "flowtest.html"]:
            pg = b.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
            pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if m.type == "error" else None)
            pg.route("**/fonts.googleapis.com/**", lambda r: r.abort())
            pg.route("**/fonts.gstatic.com/**", lambda r: r.abort())
            pg.goto(f"http://127.0.0.1:{port}/{page_name}")
            try: pg.wait_for_function("document.title === 'PASS' || document.title === 'FAIL' || (document.getElementById('out') && document.getElementById('out').textContent !== 'running')", timeout=120000)
            except Exception as e: errs.append("timeout " + str(e)[:100])
            out = pg.evaluate("document.getElementById('out') ? document.getElementById('out').textContent : ''")
            res[page_name] = dict(title=pg.title(), out=out[:4000], errors=[e for e in errs if "fonts" not in e][:20])
            pg.close()
        b.close()
finally:
    srv.terminate()
print(json.dumps(res, indent=1))
