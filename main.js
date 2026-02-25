// -----------------------------
// KhataClerk demo animation FIX
// Copy-paste this whole script.
// -----------------------------

const stages = ["stageInvoice", "stageMapping", "stageSuccess"];

let currentStage = 0;
let loopTimer = null;
let scanTimer = null;

const invoiceDemo = document.getElementById("invoiceDemo");
const scanOverlay = document.getElementById("scanOverlay");
const scanHighlight = document.getElementById("scanHighlight");
const approveBtn = document.getElementById("approveBtn");

function syncNavHeight() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const h = Math.ceil(nav.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
}

function setStage(index) {
    const prev = currentStage;
    currentStage = index;

    const prevEl = document.getElementById(stages[prev]);
    const nextEl = document.getElementById(stages[currentStage]);
    if (!nextEl) return;

    // Mark previous as leaving (optional)
    if (prevEl && prev !== currentStage) {
        prevEl.classList.add("invoice-demo__stage--leaving");
        prevEl.classList.remove("invoice-demo__stage--active");
    }

    // Activate next in next frame for clean transitions
    requestAnimationFrame(() => {
        nextEl.classList.add("invoice-demo__stage--active");
        nextEl.classList.remove("invoice-demo__stage--leaving");
    });

    // scan overlay only on invoice stage
    if (scanOverlay) scanOverlay.classList.toggle("active", currentStage === 0);
    if (currentStage === 0) startScanHighlights();
    else stopScanHighlights();
}

function stopLoop() {
    if (loopTimer) clearTimeout(loopTimer);
    loopTimer = null;
}

function stopScanHighlights() {
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = null;
    if (scanHighlight) scanHighlight.classList.remove("active");
}

function positionHighlight(targetEl) {
    if (!targetEl || !scanHighlight) return;

    const card = document.querySelector("#stageInvoice .invoice-card");
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const r = targetEl.getBoundingClientRect();
    const pad = 6;

    // highlight is inside the card, so we position relative to the card rect
    scanHighlight.style.left = `${(r.left - cardRect.left) - pad}px`;
    scanHighlight.style.top = `${(r.top - cardRect.top) - pad}px`;
    scanHighlight.style.width = `${r.width + pad * 2}px`;
    scanHighlight.style.height = `${r.height + pad * 2}px`;
}

function startScanHighlights() {
    if (!scanHighlight) return;

    // stop any previous scan loop
    stopScanHighlights();

    const order = ["invno", "date", "billedto", "custgst", "items", "total"];
    const els = order
        .map((k) => document.querySelector(`#stageInvoice [data-scan="${k}"]`))
        .filter(Boolean);

    if (!els.length) return;

    scanHighlight.classList.add("active");

    let i = 0;
    const tick = () => {
        // Only run scan if we're still on invoice stage
        if (currentStage !== 0) return;

        positionHighlight(els[i]);
        i = (i + 1) % els.length;

        scanTimer = setTimeout(tick, 570);
    };

    // slight delay so layout is stable
    scanTimer = setTimeout(tick, 150);
}

function startLoop() {
    stopLoop();

    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        // Still rotate stages, just slower + no scan highlight spam
        setStage(0);
        loopTimer = setTimeout(function advanceReduced() {
            setStage((currentStage + 1) % stages.length);
            loopTimer = setTimeout(advanceReduced, 3500);
        }, 3500);
        return;
    }

    const advance = () => {
        // cycle: 0 -> 1 -> 2 -> 0
        const next = (currentStage + 1) % stages.length;
        setStage(next);

        // keep each stage visible for 3 seconds
        loopTimer = setTimeout(advance, 3000);
    };

    // start from invoice stage, then loop
    setStage(0);
    loopTimer = setTimeout(advance, 3000);
}

// Make Approve button actually do something
if (approveBtn) {
    approveBtn.addEventListener("click", () => {
        stopLoop(); // stop auto loop temporarily
        setStage(2); // success stage

        // resume loop after a moment
        loopTimer = setTimeout(() => {
            startLoop();
        }, 2500);
    });
}

window.addEventListener("resize", () => {
    syncNavHeight();
    // keep highlight aligned on resize
    if (currentStage === 0) startScanHighlights();
});

window.addEventListener("load", () => {
    syncNavHeight();
    startLoop();
    setTimeout(syncNavHeight, 300);
    setTimeout(syncNavHeight, 1200);
});

// Fonts sometimes change nav height after load
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNavHeight);
}

// Smooth-scroll with correct fixed-navbar offset (desktop + mobile)
document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const el = document.querySelector(href);
    if (!el) return;

    e.preventDefault();

    // Read nav height from CSS var (your syncNavHeight sets this)
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-gap")) || 12;

    const y = el.getBoundingClientRect().top + window.pageYOffset - (navH + gap);

    window.scrollTo({top: y, behavior: "smooth"});

    // OPTIONAL: keep URL clean (your old behavior)
    // history.replaceState(null, "", window.location.pathname + window.location.search);
});

(function () {
    const el = (id) => document.getElementById(id);

    const invPerMonth = el("invPerMonth");
    const minsPerInvoice = el("minsPerInvoice");
    const staffCount = el("staffCount");

    const outCostMonth = el("outCostMonth");
    const outCostYear = el("outCostYear");

    // Fixed assumptions (hidden constants)
    const WORK_DAYS_PER_MONTH = 22;
    const WORK_HOURS_PER_DAY = 8;
    const MONTHLY_SALARY_PER_STAFF = 20000;

    function num(v, fallback = 0) {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    }

    function formatINR(n) {
        const x = Math.max(0, Math.round(n));
        return x.toLocaleString("en-IN");
    }

    function recalc() {
        const invoices = Math.max(0, num(invPerMonth.value));
        const mins = Math.max(0, num(minsPerInvoice.value));
        const staff = Math.max(1, num(staffCount.value, 1));

        const manualHoursMonth = (invoices * mins) / 60;

        const hourlyCost =
            MONTHLY_SALARY_PER_STAFF / (WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY);

        const costMonth = manualHoursMonth * hourlyCost * staff;
        const costYear = costMonth * 12;

        outCostMonth.textContent = formatINR(costMonth);
        outCostYear.textContent = formatINR(costYear);
    }

    [invPerMonth, minsPerInvoice, staffCount].forEach((inp) => {
        if (!inp) return;
        inp.addEventListener("input", recalc);
        inp.addEventListener("change", recalc);
    });

    recalc();
})();

(function () {
    const burger = document.getElementById("navBurger");
    const mobile = document.getElementById("navMobile");

    if (!burger || !mobile) return;

    function closeMenu() {
        mobile.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        mobile.setAttribute("aria-hidden", "true");
    }

    function toggleMenu() {
        const open = mobile.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        mobile.setAttribute("aria-hidden", open ? "false" : "true");
    }

    burger.addEventListener("click", toggleMenu);

    // Close menu when you click a mobile link
    mobile.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (a) closeMenu();
    });

    // Close on resize to desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) closeMenu();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });
})();