# Rebuilding the starter question bank

These scripts made `js/bank.js` and `data/bank.json`. They are not needed to run Merit.

1. Python 3 venv with `datasets pyarrow pandas wordfreq playwright` (then `python -m playwright install chromium`).
2. Download the datasets into `raw/` (Hugging Face `datasets`: `allenai/ai2_arc` ARC-Easy and ARC-Challenge,
   `ChilleD/SVAMP`, `openai/gsm8k` main) as JSON lists, and Aesop's Fables from
   https://www.gutenberg.org/cache/epub/21/pg21.txt (one download).
3. `python build_bank.py` writes the bank; `python verify_bank.py` re-checks every math answer and ARC key against the
   raw datasets and checks that the JS and JSON copies match.
4. `python run_tests.py <app folder> 8802` runs tests.html and flowtest.html headless; `python smoke.py` clicks through
   bank questions and saves screenshots to `screens/`.

Paths at the top of the scripts point at /workspace/merit/...; change them for your machine.
`fables.py` holds the retold fables and the hand-written reading questions.
