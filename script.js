(function () {
    const I = window.I18N, t = I.t;
    const geoSel = document.getElementById("geo");
    const sexSel = document.getElementById("sex");
    const ageIn = document.getElementById("age");
    const note = document.getElementById("note");
    let DATA = null;

    const start = fn => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

    start(() => {
        fetch("data.json")
            .then(r => { if (!r.ok) throw new Error("Could not load data.json"); return r.json(); })
            .then(d => { DATA = d; init(); })
            .catch(e => {
                document.querySelector("#mortalityTable tbody").innerHTML =
                    `<tr><td colspan="4" style="color:#b00">${e.message}. If opening locally, serve the folder with "python -m http.server".</td></tr>`;
            });
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

    function init() {
        fillGeo();
        [geoSel, sexSel, ageIn].forEach(el => el.addEventListener("input", render));
        window.addEventListener("resize", render);
        document.addEventListener("langchange", () => { fillGeo(); render(); });
        render();
    }

    function render() {
        const geo = geoSel.value, sex = sexSel.value;
        let age = Math.round(Number(ageIn.value));
        if (!Number.isFinite(age)) age = 0;
        age = Math.max(0, Math.min(100, age));
        const q = DATA.geos[geo][sex];
        const pct = I.pctSmart;

        const surv = new Array(101).fill(null);
        let s = 1;
        for (let a = age; a <= 100; a++) { surv[a] = s; s *= 1 - q[a]; }
        const survTo101 = s;

        const fb = DATA.bothSexesFallback[geo];
        note.hidden = !fb;
        note.textContent = fb ? t("fallback", { g: I.geoName(geo) }) : "";

        let ex = 0, sp = 1;
        for (let a = age; a <= 100; a++) { sp *= 1 - q[a]; ex += sp; }
        ex += sp * 3; // rough tail beyond 100
        const median = (() => { for (let a = age; a <= 100; a++) if (surv[a] < 0.5) return a - 1; return 100; })();

        document.getElementById("summary").innerHTML = `
            <div><span>${pct(q[age])}</span>${t("i.t1")}</div>
            <div><span>~${I.num(ex, 1)} ${t("years")}</span>${t("i.t2")}</div>
            <div><span>${I.pct(survTo101, 1)}</span>${t("i.t3")}</div>
            <div><span>${I.num(median)}</span>${t("i.t4")}</div>`;

        const tbody = document.querySelector("#mortalityTable tbody");
        tbody.innerHTML = "";
        for (let a = 0; a <= 100; a++) {
            const tr = document.createElement("tr");
            if (a < age) tr.className = "past";
            if (a === age) tr.className = "current";
            [I.num(a), pct(q[a]), pct(1 - q[a]), surv[a] === null ? "–" : pct(surv[a])]
                .forEach(c => { const td = document.createElement("td"); td.textContent = c; tr.appendChild(td); });
            tbody.appendChild(tr);
        }

        drawSurvival(surv, age);
        drawQ(q, age);
    }

    function setup(id) {
        const el = document.getElementById(id);
        el.innerHTML = "";
        const W = Math.max(300, el.clientWidth), H = 340;
        const m = { t: 16, r: 20, b: 44, l: 64 };
        const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
        const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
        return { el, svg, g, w: W - m.l - m.r, h: H - m.t - m.b };
    }

    function axes(c, x, y, yAxis, ylabel) {
        c.g.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(6).tickSize(-c.w).tickFormat("")).select(".domain").remove();
        c.g.append("g").attr("class", "axis").attr("transform", `translate(0,${c.h})`).call(d3.axisBottom(x).ticks(10).tickFormat(v => I.num(v)));
        c.g.append("g").attr("class", "axis").call(yAxis);
        c.g.append("text").attr("class", "label").attr("x", c.w / 2).attr("y", c.h + 38).attr("text-anchor", "middle").text(t("x.age"));
        c.g.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("x", -c.h / 2).attr("y", -50).attr("text-anchor", "middle").text(ylabel);
    }

    function hover(c, x, y, pts, fmt, label) {
        const dot = c.g.append("circle").attr("r", 5).attr("class", "dot").style("display", "none");
        const tip = d3.select(c.el).append("div").attr("class", "tip").style("display", "none");
        const bis = d3.bisector(d => d.a).center;
        c.g.append("rect").attr("width", c.w).attr("height", c.h).attr("fill", "transparent")
            .on("mousemove touchmove", function (ev) {
                const [mx] = d3.pointer(ev, this);
                const d = pts[bis(pts, Math.round(x.invert(mx)))];
                if (!d) return;
                dot.style("display", null).attr("cx", x(d.a)).attr("cy", y(d.v));
                tip.style("display", null)
                    .style("left", Math.min(c.w - 120, x(d.a) + 70) + "px").style("top", (y(d.v) - 10) + "px")
                    .html(`${t("x.age")} <b>${I.num(d.a)}</b><br>${label}: <b>${fmt(d.v)}</b>`);
            })
            .on("mouseleave", () => { dot.style("display", "none"); tip.style("display", "none"); });
    }

    function drawSurvival(surv, age) {
        const c = setup("chartSurvival");
        const pts = surv.map((v, a) => ({ a, v })).filter(d => d.v !== null);
        const x = d3.scaleLinear([age, 100], [0, c.w]);
        const y = d3.scaleLinear([0, 1], [c.h, 0]);
        axes(c, x, y, d3.axisLeft(y).ticks(6).tickFormat(v => I.pct(v, 0)), t("i.ysurv"));
        const area = d3.area().x(d => x(d.a)).y0(c.h).y1(d => y(d.v)).curve(d3.curveMonotoneX);
        const line = d3.line().x(d => x(d.a)).y(d => y(d.v)).curve(d3.curveMonotoneX);
        c.g.append("path").datum(pts).attr("class", "area").attr("d", area);
        c.g.append("path").datum(pts).attr("class", "line").attr("d", line);
        c.g.append("line").attr("class", "half").attr("x1", 0).attr("x2", c.w).attr("y1", y(0.5)).attr("y2", y(0.5));
        hover(c, x, y, pts, v => I.pct(v, 1), t("i.surv"));
    }

    function drawQ(q, age) {
        const c = setup("chartQ");
        const pts = q.map((v, a) => ({ a, v: Math.max(v, 1e-5) }));
        const x = d3.scaleLinear([0, 100], [0, c.w]);
        const y = d3.scaleLog([1e-4, 1], [c.h, 0]);
        const yAxis = d3.axisLeft(y).tickValues([1e-4, 1e-3, 1e-2, 1e-1, 1]).tickFormat(v => I.pct(v, v < 0.01 ? (v < 0.001 ? 2 : 1) : 0));
        axes(c, x, y, yAxis, t("i.yq"));
        const line = d3.line().x(d => x(d.a)).y(d => y(d.v)).curve(d3.curveMonotoneX);
        c.g.append("path").datum(pts).attr("class", "line alt").attr("d", line);
        c.g.append("line").attr("class", "agemark").attr("x1", x(age)).attr("x2", x(age)).attr("y1", 0).attr("y2", c.h);
        hover(c, x, y, pts, v => I.pctSmart(v), t("i.risk"));
    }
})();
