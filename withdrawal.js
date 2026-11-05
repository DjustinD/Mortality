(function () {
    const I = window.I18N, t = I.t;
    const $ = id => document.getElementById(id);
    const geoSel = $("geo"), sexSel = $("sex"), ageIn = $("age"), retIn = $("ret"), balIn = $("bal"), modeSel = $("mode");
    let DATA = null;

    // CRA prescribed RRIF minimum factors (age 71..94); 95+ is 20%
    const RRIF = { 71: 5.28, 72: 5.40, 73: 5.53, 74: 5.67, 75: 5.82, 76: 5.98, 77: 6.17, 78: 6.36, 79: 6.58, 80: 6.82,
        81: 7.08, 82: 7.38, 83: 7.71, 84: 8.08, 85: 8.51, 86: 8.99, 87: 9.55, 88: 10.21, 89: 10.99, 90: 11.92,
        91: 13.06, 92: 14.49, 93: 16.34, 94: 18.79 };
    const rrif = a => a >= 95 ? 0.20 : a >= 71 ? RRIF[a] / 100 : 1 / (90 - a);

    const start = fn => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

    // ---- balance box: digits only, shown with thousands separators in the current language ----
    const balValue = () => { const d = balIn.value.replace(/\D/g, ""); return d ? Number(d) : null; };
    function formatBal() {
        const el = balIn;
        const caret = el.selectionStart ?? el.value.length;
        const digitsBefore = el.value.slice(0, caret).replace(/\D/g, "").length;
        const digits = el.value.replace(/\D/g, "").slice(0, 12);
        el.value = digits ? I.num(Number(digits)) : "";
        let pos = 0, seen = 0;
        while (pos < el.value.length && seen < digitsBefore) { if (/\d/.test(el.value[pos])) seen++; pos++; }
        try { el.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
    }
    // ---- return box: accepts "3.5" or "3,5" ----
    const retValue = () => { const v = parseFloat(retIn.value.replace(/\s/g, "").replace(",", ".")); return Number.isFinite(v) ? v : 0; };

    start(() => {
        fetch("data.json").then(r => { if (!r.ok) throw new Error("Could not load data.json"); return r.json(); })
            .then(d => { DATA = d; init(); })
            .catch(e => { $("summary").textContent = e.message + '. If opening locally, serve the folder with "python -m http.server".'; });
    });

    function fillGeo() {
        const prev = geoSel.value || "Canada";
        const names = Object.keys(DATA.geos).filter(g => g !== "Canada")
            .sort((a, b) => I.geoName(a).localeCompare(I.geoName(b), I.locale()));
        geoSel.innerHTML = "";
        ["Canada", ...names].forEach(g => {
            const o = document.createElement("option");
            o.value = g; o.textContent = I.geoName(g);
            geoSel.appendChild(o);
        });
        geoSel.value = prev;
    }

    function localize() {
        fillGeo();
        balIn.placeholder = (I.lang === "fr" ? "p. ex. " : "e.g. ") + I.num(500000);
        const r = retValue();
        retIn.value = I.num(r, Number.isInteger(r) ? 0 : 1);
        formatBal();
    }

    function init() {
        localize();
        [geoSel, sexSel, ageIn, retIn, modeSel].forEach(el => el.addEventListener("input", render));
        balIn.addEventListener("input", () => { formatBal(); render(); });
        window.addEventListener("resize", render);
        document.addEventListener("langchange", () => {
            // the displayed digits are reparsed under the old separators, so reformat from the stored numbers
            localize(); render();
        });
        render();
    }

    // withdrawal fraction at every age from `start` to 100
    function rates(q, startAge, r, mode) {
        const v = 1 / (1 + r), out = [];
        // survival measured from the current age decides the cautious planning horizon
        const S0 = [1];
        for (let k = startAge; k < 100; k++) S0.push(S0[S0.length - 1] * (1 - q[k]));
        let H = 100;
        if (mode !== "expected") {
            const thr = mode === "p25" ? 0.25 : 0.10;
            H = startAge;
            for (let i = 0; i < S0.length; i++) if (S0[i] >= thr) H = startAge + i;
        }
        for (let a = startAge; a <= 100; a++) {
            let sum = 0, S = 1;
            if (mode === "expected") {
                for (let k = a, tt = 0; k <= 100; k++, tt++) { sum += S * Math.pow(v, tt); S *= 1 - q[k]; }
            } else {
                for (let tt = 0; tt <= Math.max(0, H - a); tt++) sum += Math.pow(v, tt);
            }
            out.push({ a, p: 1 / sum });
        }
        return out;
    }

    function render() {
        const geo = geoSel.value, mode = modeSel.value;
        let age = Math.round(Number(ageIn.value)); if (!Number.isFinite(age)) age = 0;
        age = Math.max(0, Math.min(100, age));
        const r = retValue() / 100;
        const bal = balValue();
        const q = DATA.geos[geo][sexSel.value];
        const pct = v => I.pct(v, 1);

        const fb = DATA.bothSexesFallback[geo];
        $("note").hidden = !fb;
        $("note").textContent = fb ? t("fallback", { g: I.geoName(geo) }) : "";

        const rs = rates(q, age, r, mode);
        let b = bal;
        rs.forEach(d => {
            d.bal = b;
            d.w = b === null ? null : b * d.p;
            if (b !== null) b = (b - d.w) * (1 + r);
        });

        const now = rs[0];
        $("summary").innerHTML = `
            <div><span>${pct(now.p)}</span>${t("w.t1")}</div>
            <div><span>${bal ? I.money(now.w) : "—"}</span>${bal ? t("w.t2a") : t("w.t2b")}</div>
            <div><span>${age >= 71 ? pct(rrif(age)) : t("na")}</span>${age >= 71 ? t("w.t3") : t("w.t3n")}</div>
            <div><span>${pct(0.04)}</span>${t("w.t4")}</div>`;

        const tb = document.querySelector("#wTable tbody");
        tb.innerHTML = "";
        rs.forEach((d, i) => {
            const tr = document.createElement("tr");
            if (i === 0) tr.className = "current";
            [I.num(d.a), pct(d.p), d.a >= 50 ? pct(rrif(d.a)) : "–", bal ? I.money(d.bal) : "–", bal ? I.money(d.w) : "–"]
                .forEach(c => { const td = document.createElement("td"); td.textContent = c; tr.appendChild(td); });
            tb.appendChild(tr);
        });

        draw(rs, age);
    }

    function draw(rs, age) {
        const el = $("chartW"); el.innerHTML = "";
        const W = Math.max(300, el.clientWidth), H = 340, m = { t: 16, r: 20, b: 44, l: 64 };
        const w = W - m.l - m.r, h = H - m.t - m.b;
        const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
        const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
        const x = d3.scaleLinear([age, 100], [0, w]);
        const y = d3.scaleLinear([0, 1], [h, 0]);
        g.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat("")).select(".domain").remove();
        g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`)
            .call(d3.axisBottom(x).ticks(Math.min(10, 100 - age || 1)).tickFormat(v => I.num(v)));
        g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(v => I.pct(v, 0)));
        g.append("text").attr("class", "label").attr("x", w / 2).attr("y", h + 38).attr("text-anchor", "middle").text(t("x.age"));
        g.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("x", -h / 2).attr("y", -50).attr("text-anchor", "middle").text(t("w.y"));

        g.append("line").attr("class", "half").attr("x1", 0).attr("x2", w).attr("y1", y(0.04)).attr("y2", y(0.04));
        const rr = rs.filter(d => d.a >= 71).map(d => ({ a: d.a, p: rrif(d.a) }));
        const line = d3.line().x(d => x(d.a)).y(d => y(d.p)).curve(d3.curveMonotoneX);
        if (rr.length > 1) g.append("path").datum(rr).attr("class", "line alt").attr("d", line);
        const area = d3.area().x(d => x(d.a)).y0(h).y1(d => y(d.p)).curve(d3.curveMonotoneX);
        g.append("path").datum(rs).attr("class", "area").attr("d", area);
        g.append("path").datum(rs).attr("class", "line").attr("d", line);

        const dot = g.append("circle").attr("r", 5).attr("class", "dot").style("display", "none");
        const tip = d3.select(el).append("div").attr("class", "tip").style("display", "none");
        const bis = d3.bisector(d => d.a).center;
        g.append("rect").attr("width", w).attr("height", h).attr("fill", "transparent")
            .on("mousemove touchmove", function (ev) {
                const [mx] = d3.pointer(ev, this);
                const d = rs[bis(rs, Math.round(x.invert(mx)))];
                if (!d) return;
                dot.style("display", null).attr("cx", x(d.a)).attr("cy", y(d.p));
                tip.style("display", null).style("left", Math.min(w - 120, x(d.a) + 70) + "px").style("top", (y(d.p) - 10) + "px")
                    .html(`${t("x.age")} <b>${I.num(d.a)}</b><br>${t("w.tip")}: <b>${I.pct(d.p, 1)}</b>`);
            })
            .on("mouseleave", () => { dot.style("display", "none"); tip.style("display", "none"); });
    }
})();
