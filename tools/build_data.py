"""Build data.json from Statistics Canada life tables (13-10-0114-01 complete, 13-10-0140-01 abridged).
Usage: python build_data.py <13100114.csv> <13100140.csv> <out.json>"""
import csv, json, sys, math
PERIOD = "2022/2024"
SEX = {"Males": "male", "Females": "female", "Both sexes": "both"}
res = {}  # geo -> sex -> [q0..q100]

def rows(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        yield from csv.DictReader(f)

# complete tables: annual qx
raw = {}
for r in rows(sys.argv[1]):
    if r["REF_DATE"] != PERIOD or not r["Element"].startswith("Death probability between"): continue
    if r["VALUE"] == "": continue
    age = int(r["Age group"].split()[0])
    raw.setdefault((r["GEO"], SEX[r["Sex"]]), {})[age] = float(r["VALUE"])
for (g, s), d in raw.items():
    res.setdefault(g, {})[s] = [round(d[a], 6) for a in range(101)]

# abridged tables: convert interval prob to annual (constant hazard in interval)
ab = {}
for r in rows(sys.argv[2]):
    if r["REF_DATE"] != PERIOD or r["VALUE"] == "": continue
    el = r["Element"]
    k = "q" if el.startswith("Death probability in") else "e" if el.startswith("Life expectancy") else None
    if k: ab.setdefault((r["GEO"], SEX[r["Sex"]]), {}).setdefault(k, {})[r["Age interval"]] = float(r["VALUE"])
def start(lbl): return int(lbl.split()[0])
for (g, s), d in ab.items():
    q = {start(l): v for l, v in d["q"].items()}
    out = [None] * 101
    lens = {0: 1, 1: 4}
    for a in sorted(q):
        if a >= 90: continue
        n = lens.get(a, 5)
        ann = 1 - (1 - q[a]) ** (1 / n)
        for i in range(a, a + n): out[i] = round(ann, 6)
    # 90+ open interval: continue the 85-89 hazard upward with Gompertz slope ~0.1/yr
    h = -math.log(1 - out[87])
    for a in range(90, 101):
        out[a] = round(min(0.9, 1 - math.exp(-h * math.exp(0.1 * (a - 87)))), 6)
    res.setdefault(g, {})[s] = out

# geographies lacking sex-specific rows fall back to both-sexes
notes = {}
for g, d in res.items():
    for s in ("male", "female"):
        if s not in d and "both" in d:
            d[s] = d["both"]; notes.setdefault(g, []).append(s)
for g, d in res.items(): d.pop("both", None)
# Yukon sex-specific tables are suppressed by StatCan: use national rates
res["Yukon"] = res["Canada"]
notes["Yukon"] = ["male", "female"]
json.dump({"period": PERIOD, "geos": res, "bothSexesFallback": notes}, open(sys.argv[3], "w"), separators=(",", ":"))
print(sorted(res), notes)
