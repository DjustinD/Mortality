(function () {
    const $ = id => document.getElementById(id);
    const geoSel = $("geo"), sexSel = $("sex"), ageIn = $("age"), retIn = $("ret"), balIn = $("bal"), modeSel = $("mode");
    let DATA = null;

    // CRA prescribed RRIF minimum factors (age 71..94); 95+ is 20%
    const RRIF = { 71: 5.28, 72: 5.40, 73: 5.53, 74: 5.67, 75: 5.82, 76: 5.98, 77: 6.17, 78: 6.36, 79: 6.58, 80: 6.82,
        81: 7.08, 82: 7.38, 83: 7.71, 84: 8.08, 85: 8.51, 86: 8.99, 87: 9.55, 88: 10.21, 89: 10.99, 90: 11.92,
        91: 13.06, 92: 14.49, 93: 16.34, 94: 18.79 };
    const rrif = a => a >= 95 ? 0.20 : a >= 71 ? RRIF[a] / 100 : a >= 0 ? 1 / (90 - a) : 0;

    const pct = v => (v * 100).toFixed(1) + "%";
    const money = v => "$" + Math.round(v).toLocaleString("en-CA");

    fetch("data.json").then(r => { if (!r.ok) throw new Error("Could not load data.json"); return r.json(); })
        .then(d => { DATA = d; init(); })
        .catch(e => { $("summary").textContent = e.message + '. If opening locally, serve the folder with "python -m http.server".'; });

    function init() {
        ["Canada", ...Object.keys(DATA.geos).filter(g => g !== "Canada").sort()].forEach(g => {
            const o = document.createElement("option");
            o.value = g; o.textContent = g === "Canada" ? "Canada (national average)" : g;
            geoSel.appendChild(o);
        });
        [geoSel, sexSel, ageIn, retIn, balIn, modeSel].forEach(el => el.addEventListener("input", render));
        window.addEventListener("resize", render);
        render();
    }

    // withdrawal fraction at every age from `start` to 100, given mortality q, return r, mode
    function rates(q, start, r, mode) {
        const v = 1 / (1 + r), out = [];
        for (let a = start; a <= 100; a++) {
            let s = 1, sum = 0, t0 = 0;
            // survival from age a, used for the expected / cautious horizon
            const S = [1];
            for (let k = a; k < 100; k++) S.push(S[S.length - 1] * (1 - q[k]));
            if (mode === "expected") {
                S.forEach((st, t) => { sum += st * Math.pow(v, t); });
            } else {
                // horizon: last age at which survival *from the current age* >= threshold
                const thr = mode === "p25" ? 0.25 : 0.10;
                const S0 = [1];
                for (let k = start; k < 100; k++) S0.push(S0[S0.length - 1] * (1 - q[k]));
                let H = start;
                for (let i = 0; i < S0.length; i++) if (S0[i] >= thr) H = start + i;
                const n = Math.max(0, H - a);
                for (let t = 0; t <= n; t++) sum += Math.pow(v, t);
            }
            out.push({ a, p: 1 / sum });
        }
        return out;
    }

    function render() {
        const geo = geoSel.value, sex = sexSel.value, mode = modeSel.value;
        let age = Math.round(Number(ageIn.value)); if (!Number.isFinite(age)) age = 0;
        age = Math.max(0, Math.min(100, age));
        let r = Number(retIn.value) / 100; if (!Number.isFinite(r)) r = 0;
        const bal = Number(balIn.value) > 0 ? Number(balIn.value) : null;
        const q = DATA.geos[geo][sex];

        const fb = DATA.bothSexesFallback[geo];
        $("note").hidden = !fb;
        $("note").textContent = fb ? `${geo}: Statistics Canada does not publish sex-specific tables, so national rates are shown.` : "";

        const rs = rates(q, age, r, mode);
        // projected balance following the suggestion
        let b = bal;
        rs.forEach(d => {
            d.bal = b;
            d.w = b === null ? null : b * d.p;
            if (b !== null) b = (b - d.w) * (1 + r);
        });

        const now = rs[0];
        $("summary").innerHTML = `
            <div><span>${pct(now.p)}</span>of your tax-deferred balance to withdraw this year</div>
            <div><span>${bal ? money(now.w) : "—"}</span>${bal ? "suggested withdrawal this year" : "enter a balance to see dollars"}</div>
            <div><span>${age >= 71 ? pct(rrif(age)) : "n/a"}</span>RRIF legal minimum${age >= 71 ? "" : " (starts at 71)"}</div>
            <div><span>${pct(0.04)}</span>fixed &ldquo;4% rule&rdquo; for comparison</div>`;

        const tb = document.querySelector("#wTable tbody");
        tb.innerHTML = "";
        rs.forEach((d, i) => {
            const tr = document.createElement("tr");
            if (i === 0) tr.className = "current";
            const cells = [d.a, pct(d.p), d.a >= 50 ? pct(rrif(d.a)) : "–",
                bal ? money(d.bal) : "–", bal ? money(d.w) : "–"];
            cells.forEach(c => { const td = document.createElement("td"); td.textContent = c; tr.appendChild(td); });
            tb.appendChild(tr);
        });

        draw(rs, age);
    }

    function draw(rs, age) {
        const el = $("chartW"); el.innerHTML = "";
        const W = Math.max(300, el.clientWidth), H = 340, m = { t: 16, r: 20, b: 44, l: 56 };
        const w = W - m.l - m.r, h = H - m.t - m.b;
        const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
        const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
        const x = d3.scaleLinear([age, 100], [0, w]);
        const y = d3.scaleLinear([0, 1], [h, 0]);
        g.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat("")).select(".domain").remove();
        g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(Math.min(10, 100 - age || 1)));
        g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5, "%"));
        g.append("text").attr("class", "label").attr("x", w / 2).attr("y", h + 38).attr("text-anchor", "middle").text("Age");
        g.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("x", -h / 2).attr("y", -44).attr("text-anchor", "middle").text("% of balance withdrawn that year");

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
                tip.style("display", null).style("left", Math.min(w - 120, x(d.a) + 60) + "px").style("top", (y(d.p) - 10) + "px")
                    .html(`Age <b>${d.a}</b><br>Withdraw: <b>${pct(d.p)}</b>`);
            })
            .on("mouseleave", () => { dot.style("display", "none"); tip.style("display", "none"); });
    }
})();
