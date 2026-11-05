/* Shared English-CA / French-CA support: strings, number formats, language toggle.
   The chosen language is carried between pages in the URL hash (#fr / #en); nothing is stored. */
(function () {
    const T = {
        en: {
            "nav.table": "Mortality table", "nav.withdrawal": "Withdrawal rate", "toggle": "Français",
            "geo": "Province / territory", "sex": "Sex", "female": "Female", "male": "Male", "age": "Current age",
            "canada": "Canada (national average)",
            "privacy.sel": "Everything is calculated in your browser. Nothing you select is stored, saved or sent anywhere.",
            "privacy.ent": "Everything is calculated in your browser. Nothing you enter is stored, saved or sent anywhere.",
            "fallback": "{g}: Statistics Canada does not publish sex-specific tables, so national rates are shown.",
            "years": "yrs",

            "i.title": "Canadian Mortality Table",
            "i.lead": "Choose where you live, your sex and your age to see the chance of dying and of surviving in each year of life, from age 0 to 100.",
            "i.t1": "chance of dying in the next year", "i.t2": "average remaining life expectancy",
            "i.t3": "chance of reaching age 101", "i.t4": "age by which half of people your age have died (50% survival)",
            "i.h1": "Survival from your age", "i.h2": "Chance of dying each year", "i.h3": "Table",
            "i.th1": "Age", "i.th2": "Probability of dying this year", "i.th3": "Probability of surviving this year",
            "i.th4": "Chance of reaching this age from your age",
            "i.ysurv": "Chance of surviving to this age", "i.yq": "Chance of dying that year (log scale)",
            "i.surv": "Survival", "i.risk": "Risk", "x.age": "Age",
            "src.h": "Sources & methodology",
            "i.src1": 'Rates are from Statistics Canada life tables for 2022&ndash;2024 (three-year averages): <a href="https://doi.org/10.25318/1310011401-eng">Table 13-10-0114-01</a> (Canada and nine provinces, single-year ages) and <a href="https://doi.org/10.25318/1310014001-eng">Table 13-10-0140-01</a> (Prince Edward Island, Northwest Territories, Nunavut; 5-year age groups converted to annual rates assuming a constant risk within each group; ages 90&ndash;100 extrapolated).',
            "i.src2": "Yukon sex-specific tables are not published, so national rates are shown. Statistics Canada does not publish full life tables below the province/territory level.",
            "i.src3": "These are population averages, not a personal prediction. Individual health, income and lifestyle matter a great deal.",
            "font": 'Typeface: <a href="https://brailleinstitute.org/freefont">Atkinson Hyperlegible</a>, designed by the Braille Institute of America for maximum legibility, used under the <a href="https://openfontlicense.org">SIL Open Font License 1.1</a>. Charts by <a href="https://d3js.org">D3.js</a>.',

            "w.title": "How much of my RRSP / RRIF should I withdraw this year?",
            "w.lead": "A mortality-based withdrawal rate for tax-deferred savings (RRSP, RRIF, other registered accounts). Unlike the fixed &ldquo;4% rule&rdquo;, the percentage rises with age and reaches 100% at age 100, because less and less lifetime remains to spread the money over.",
            "w.ret": "Expected return, after inflation (%/yr)", "w.bal": "Tax-deferred balance ($, optional)",
            "w.mode": "Planning horizon", "w.m1": "Average lifespan (survival-weighted)",
            "w.m2": "Cautious: until 25% of people my age are still alive", "w.m3": "Very cautious: until 10% are still alive",
            "w.t1": "of your tax-deferred balance to withdraw this year", "w.t2a": "suggested withdrawal this year",
            "w.t2b": "enter a balance to see dollars", "w.t3": "RRIF legal minimum", "w.t3n": "RRIF legal minimum (starts at 71)",
            "w.t4": "fixed &ldquo;4% rule&rdquo; for comparison",
            "w.h1": "Suggested withdrawal rate by age", "w.h2": "Table",
            "w.l1": "Mortality-based rate", "w.l2": "Fixed 4% rule", "w.l3": "RRIF legal minimum (from age 71)",
            "w.th2": "Suggested % of balance", "w.th3": "RRIF minimum %", "w.th4": "Expected balance at start of year", "w.th5": "Suggested withdrawal",
            "w.y": "% of balance withdrawn that year", "w.tip": "Withdraw", "na": "n/a",
            "w.src1": "Each year the suggested withdrawal is the balance divided by the survival-weighted present value of one dollar a year for the rest of your life: p = 1 / &Sigma; S<sub>t</sub> &middot; (1+r)<sup>&minus;t</sup>, where S<sub>t</sub> is the chance of being alive t years from now (from the Statistics Canada life tables used on the mortality page) and r is your expected after-inflation return. Withdrawing p of the remaining balance each year spends the money evenly (in today&rsquo;s dollars) over your expected lifetime. At 100 the rate is 100% because the model has nothing left to plan for. The cautious options instead assume you live until the age at which only 25% or 10% of people your age are still alive.",
            "w.src2": "The &ldquo;expected balance&rdquo; column assumes you follow the suggestion and earn exactly your expected return every year; real returns vary, so recompute each year with your actual balance. Dollar figures are in today&rsquo;s purchasing power.",
            "w.src3": "The RRIF minimum is the federal schedule: 1/(90 &minus; age) before 71, a fixed table from 71, and 20% from 95. It only applies once an RRSP is converted to a RRIF (required by the end of the year you turn 71). Larger withdrawals are taxed as income and can push you into a higher bracket, and any remaining RRSP/RRIF is generally taxed as income on death (unless it rolls over to a spouse), which is the reason for drawing down registered money first. This is a planning illustration, not tax or investment advice."
        },
        fr: {
            "nav.table": "Table de mortalité", "nav.withdrawal": "Taux de retrait", "toggle": "English",
            "geo": "Province / territoire", "sex": "Sexe", "female": "Femme", "male": "Homme", "age": "Âge actuel",
            "canada": "Canada (moyenne nationale)",
            "privacy.sel": "Tous les calculs sont faits dans votre navigateur. Rien de ce que vous sélectionnez n’est conservé, enregistré ou transmis.",
            "privacy.ent": "Tous les calculs sont faits dans votre navigateur. Rien de ce que vous saisissez n’est conservé, enregistré ou transmis.",
            "fallback": "{g} : Statistique Canada ne publie pas de tables selon le sexe; les taux nationaux sont donc affichés.",
            "years": "ans",

            "i.title": "Table de mortalité canadienne",
            "i.lead": "Choisissez votre lieu de résidence, votre sexe et votre âge pour voir la probabilité de décès et de survie pour chaque année de vie, de 0 à 100 ans.",
            "i.t1": "probabilité de décès au cours de la prochaine année", "i.t2": "espérance de vie moyenne restante",
            "i.t3": "probabilité d’atteindre 101 ans", "i.t4": "âge auquel la moitié des personnes de votre âge sont décédées (survie de 50 %)",
            "i.h1": "Survie à partir de votre âge", "i.h2": "Probabilité de décès chaque année", "i.h3": "Tableau",
            "i.th1": "Âge", "i.th2": "Probabilité de décéder cette année", "i.th3": "Probabilité de survivre cette année",
            "i.th4": "Probabilité d’atteindre cet âge à partir de votre âge",
            "i.ysurv": "Probabilité de survivre jusqu’à cet âge", "i.yq": "Probabilité de décès cette année-là (échelle log)",
            "i.surv": "Survie", "i.risk": "Risque", "x.age": "Âge",
            "src.h": "Sources et méthodologie",
            "i.src1": 'Les taux proviennent des tables de mortalité de Statistique Canada pour 2022-2024 (moyennes sur trois ans) : <a href="https://doi.org/10.25318/1310011401-fra">Tableau 13-10-0114-01</a> (Canada et neuf provinces, âges simples) et <a href="https://doi.org/10.25318/1310014001-fra">Tableau 13-10-0140-01</a> (Île-du-Prince-Édouard, Territoires du Nord-Ouest, Nunavut; groupes d’âge de 5 ans convertis en taux annuels en supposant un risque constant dans chaque groupe; âges de 90 à 100 ans extrapolés).',
            "i.src2": "Les tables selon le sexe du Yukon ne sont pas publiées; les taux nationaux sont donc affichés. Statistique Canada ne publie pas de tables de mortalité complètes à une échelle inférieure à la province ou au territoire.",
            "i.src3": "Il s’agit de moyennes de population, et non d’une prévision personnelle. La santé, le revenu et le mode de vie de chacun comptent beaucoup.",
            "font": 'Caractère typographique : <a href="https://brailleinstitute.org/freefont">Atkinson Hyperlegible</a>, conçu par le Braille Institute of America pour une lisibilité maximale, utilisé sous la <a href="https://openfontlicense.org">licence SIL Open Font License 1.1</a>. Graphiques : <a href="https://d3js.org">D3.js</a>.',

            "w.title": "Quelle part de mon REER / FERR devrais-je retirer cette année?",
            "w.lead": "Un taux de retrait fondé sur la mortalité pour l’épargne à imposition différée (REER, FERR, autres comptes enregistrés). Contrairement à la « règle des 4 % » fixe, le pourcentage augmente avec l’âge et atteint 100 % à 100 ans, car il reste de moins en moins de temps sur lequel étaler l’argent.",
            "w.ret": "Rendement attendu, après inflation (%/an)", "w.bal": "Solde à imposition différée ($, facultatif)",
            "w.mode": "Horizon de planification", "w.m1": "Durée de vie moyenne (pondérée par la survie)",
            "w.m2": "Prudent : jusqu’à ce que 25 % des personnes de mon âge soient encore en vie", "w.m3": "Très prudent : jusqu’à ce que 10 % soient encore en vie",
            "w.t1": "de votre solde à imposition différée à retirer cette année", "w.t2a": "retrait suggéré cette année",
            "w.t2b": "saisissez un solde pour voir les montants", "w.t3": "minimum légal du FERR", "w.t3n": "minimum légal du FERR (à partir de 71 ans)",
            "w.t4": "« règle des 4 % » fixe, à titre de comparaison",
            "w.h1": "Taux de retrait suggéré selon l’âge", "w.h2": "Tableau",
            "w.l1": "Taux fondé sur la mortalité", "w.l2": "Règle fixe de 4 %", "w.l3": "Minimum légal du FERR (à partir de 71 ans)",
            "w.th2": "% suggéré du solde", "w.th3": "% minimum du FERR", "w.th4": "Solde prévu au début de l’année", "w.th5": "Retrait suggéré",
            "w.y": "% du solde retiré cette année-là", "w.tip": "Retrait", "na": "s. o.",
            "w.src1": "Chaque année, le retrait suggéré correspond au solde divisé par la valeur actuelle, pondérée par la survie, d’un dollar par année pour le reste de votre vie : p = 1 / &Sigma; S<sub>t</sub> &middot; (1+r)<sup>&minus;t</sup>, où S<sub>t</sub> est la probabilité d’être en vie dans t ans (selon les tables de mortalité de Statistique Canada utilisées sur la page de mortalité) et r est votre rendement attendu après inflation. Retirer la fraction p du solde restant chaque année répartit l’argent uniformément (en dollars d’aujourd’hui) sur votre durée de vie attendue. À 100 ans, le taux est de 100 % car le modèle n’a plus rien à planifier. Les options prudentes supposent plutôt que vous vivez jusqu’à l’âge où seulement 25 % ou 10 % des personnes de votre âge sont encore en vie.",
            "w.src2": "La colonne « solde prévu » suppose que vous suivez la suggestion et obtenez exactement le rendement attendu chaque année; les rendements réels varient, alors refaites le calcul chaque année avec votre solde réel. Les montants sont en dollars d’aujourd’hui (pouvoir d’achat actuel).",
            "w.src3": "Le minimum du FERR suit le barème fédéral : 1/(90 − âge) avant 71 ans, un tableau fixe à partir de 71 ans et 20 % à partir de 95 ans. Il ne s’applique qu’une fois le REER converti en FERR (obligatoire avant la fin de l’année de vos 71 ans). Des retraits plus importants sont imposés comme un revenu et peuvent vous faire passer dans une tranche supérieure; le REER ou FERR restant est généralement imposé comme un revenu au décès (sauf transfert au conjoint), d’où l’intérêt de puiser d’abord dans les fonds enregistrés. Il s’agit d’une illustration de planification, et non d’un conseil fiscal ou de placement."
        }
    };

    const GEO_FR = { "British Columbia": "Colombie-Britannique", "New Brunswick": "Nouveau-Brunswick",
        "Newfoundland and Labrador": "Terre-Neuve-et-Labrador", "Northwest Territories": "Territoires du Nord-Ouest",
        "Nova Scotia": "Nouvelle-Écosse", "Prince Edward Island": "Île-du-Prince-Édouard", "Quebec": "Québec" };

    const I = { lang: "en" };
    I.locale = () => (I.lang === "fr" ? "fr-CA" : "en-CA");
    I.t = (k, vars) => {
        let s = (T[I.lang][k] ?? T.en[k] ?? k);
        if (vars) for (const v in vars) s = s.replace("{" + v + "}", vars[v]);
        return s;
    };
    I.geoName = g => (g === "Canada" ? I.t("canada") : I.lang === "fr" ? (GEO_FR[g] || g) : g);

    // number formatting follows the language: 1,234.5 / $500,000 / 6.8%  vs  1 234,5 / 500 000 $ / 6,8 %
    I.pct = (v, d = 1) => new Intl.NumberFormat(I.locale(), { style: "percent", minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
    I.pctSmart = v => I.pct(v, v < 0.001 ? 3 : 2);
    I.num = (v, d = 0) => new Intl.NumberFormat(I.locale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
    I.money = v => new Intl.NumberFormat(I.locale(), { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(v);

    function detect() {
        const h = location.hash.replace("#", "");
        if (h === "fr" || h === "en") return h;
        return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
    }

    I.apply = function () {
        document.documentElement.lang = I.locale();
        document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = I.t(el.dataset.i18n); });
        document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = I.t(el.dataset.i18nHtml); });
        const title = document.querySelector("h1"); if (title) document.title = title.textContent;
        document.querySelectorAll("a.nav-link").forEach(a => { a.href = a.getAttribute("href").split("#")[0] + "#" + I.lang; });
        const btn = document.getElementById("langToggle");
        if (btn) { btn.textContent = I.t("toggle"); btn.lang = I.lang === "fr" ? "en" : "fr"; }
    };

    I.set = function (lang) {
        I.lang = lang;
        history.replaceState(null, "", "#" + lang);
        I.apply();
        document.dispatchEvent(new Event("langchange"));
    };

    I.lang = detect();
    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("langToggle");
        if (btn) btn.addEventListener("click", () => I.set(I.lang === "fr" ? "en" : "fr"));
        I.apply();
        document.dispatchEvent(new Event("i18nready"));
    });
    window.I18N = I;
})();
