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

    window.scrollTo({ top: y, behavior: "smooth" });

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




(function solutionAutoLoop() {
    const stepsWrap = document.getElementById("solutionSteps");
    if (!stepsWrap) return;

    const steps = Array.from(stepsWrap.querySelectorAll(".step"));
    if (steps.length === 0) return;

    let currentIndex = 0;
    let loopTimer = null;
    let isDragInitialized = false;

    function setActive(i) {
        currentIndex = i;
        steps.forEach((el, idx) => el.classList.toggle("is-active", idx === i));

        if (loopTimer) clearTimeout(loopTimer);

        if (i === 0) {
            initInteractiveUpload();
        }
        // No auto-progress — transitions are user-triggered
    }

    // Initialize first step
    setActive(0);

    // Listen for the Review & Approve button in step 2 → go to step 3
    document.addEventListener("extract:approved", () => {
        setActive(2);
    });

    // Step 3 "Change Details" → back to step 2
    document.addEventListener("review:change", () => {
        setActive(1);
    });

    // Step 3 "Approve & Post" → go to step 4
    document.addEventListener("review:approved", () => {
        setActive(3);
    });

    // Step 4 "Next" or finishing the sync → back to step 1
    document.addEventListener("export:done", () => {
        setActive(0);
    });

    function initInteractiveUpload() {
        if (isDragInitialized) return;
        isDragInitialized = true;

        const demoContainer = document.getElementById("uploadDemo");
        const dragPdf = document.getElementById("dragPdf");
        const dragImg = document.getElementById("dragImg");
        const target = document.getElementById("uploadTarget");
        const files = document.getElementById("uploadFiles");
        const targetInner = document.getElementById("uploadTargetInner");

        if (!demoContainer || !dragPdf || !dragImg || !target || !files || !targetInner) {
            isDragInitialized = false;
            return;
        }

        let draggedEl = null;
        let ghost = null;
        let isDragging = false;
        let uploadTriggered = false;

        function createGhost(badge) {
            const rect = badge.getBoundingClientRect();
            const g = badge.cloneNode(true);
            g.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: ${rect.width}px;
                height: ${rect.height}px;
                box-sizing: border-box;
                z-index: 9999;
                pointer-events: none;
                opacity: 0.85;
                transform: scale(1.05);
                transition: none;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                border-radius: 8px;
                margin: 0;
            `;
            document.body.appendChild(g);
            return g;
        }

        function moveGhost(e) {
            if (!ghost) return;
            const touch = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : null);
            const x = e.clientX ?? touch?.clientX ?? 0;
            const y = e.clientY ?? touch?.clientY ?? 0;
            ghost.style.transform = `translate(${x - ghost.offsetWidth / 2}px, ${y - ghost.offsetHeight / 2}px) scale(1.05)`;
        }

        function isOverTarget(e) {
            const touch = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : null);
            const x = e.clientX ?? touch?.clientX ?? 0;
            const y = e.clientY ?? touch?.clientY ?? 0;
            const rect = target.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }

        function onPointerDown(e) {
            if (uploadTriggered) return;
            const badge = e.currentTarget;
            draggedEl = badge;
            isDragging = false;

            badge.classList.add("is-dragging");
            demoContainer.classList.add("user-dragging");

            ghost = createGhost(badge);
            moveGhost(e);

            document.addEventListener("mousemove", onPointerMove);
            document.addEventListener("mouseup", onPointerUp);
            document.addEventListener("touchmove", onPointerMove, { passive: false });
            document.addEventListener("touchend", onPointerUp);

            e.preventDefault();
        }

        function onPointerMove(e) {
            if (e.touches) e.preventDefault();
            isDragging = true;
            moveGhost(e);

            const label = document.getElementById("uploadTargetLabel");
            const defaultText = window.innerWidth <= 767 ? "Tap to upload files" : "Drop files here";

            if (isOverTarget(e)) {
                target.classList.add("drag-hover");
                if (label) label.innerText = "Drop to upload";
            } else {
                target.classList.remove("drag-hover");
                if (label) label.innerText = defaultText;
            }
        }

        function onPointerUp(e) {
            document.removeEventListener("mousemove", onPointerMove);
            document.removeEventListener("mouseup", onPointerUp);
            document.removeEventListener("touchmove", onPointerMove);
            document.removeEventListener("touchend", onPointerUp);

            if (ghost) {
                ghost.remove();
                ghost = null;
            }

            target.classList.remove("drag-hover");
            demoContainer.classList.remove("user-dragging");

            const label = document.getElementById("uploadTargetLabel");
            const defaultText = window.innerWidth <= 767 ? "Tap to upload files" : "Drop files here";
            if (label) label.innerText = defaultText;

            if (draggedEl) draggedEl.classList.remove("is-dragging");

            if (isDragging && isOverTarget(e) && !uploadTriggered) {
                const filename = draggedEl ? draggedEl.querySelector("span").textContent : "invoice.pdf";
                runUploadSequence(filename);
            }

            draggedEl = null;
            isDragging = false;
        }

        // Click also triggers the sequence as a fallback
        function onFileClick(e) {
            if (uploadTriggered) return;
            const filename = e.currentTarget.querySelector("span").textContent;
            runUploadSequence(filename);
        }

        dragPdf.addEventListener("mousedown", onPointerDown);
        dragPdf.addEventListener("touchstart", onPointerDown, { passive: false });
        dragPdf.addEventListener("click", onFileClick);

        dragImg.addEventListener("mousedown", onPointerDown);
        dragImg.addEventListener("touchstart", onPointerDown, { passive: false });
        dragImg.addEventListener("click", onFileClick);

        target.addEventListener("click", () => {
            if (uploadTriggered) return;
            runUploadSequence("scanned_invoice.jpg");
        });

        function runUploadSequence(filename = "invoice.pdf") {
            uploadTriggered = true;

            const extractFilenameSpan = document.getElementById("extractFilename");
            if (extractFilenameSpan) extractFilenameSpan.textContent = filename;

            // Fade out file list and arrow
            files.style.transition = "opacity 0.3s ease";
            files.style.opacity = "0";

            const arrow = document.querySelector(".drag-hint-arrow");
            if (arrow) {
                arrow.style.transition = "opacity 0.3s ease";
                arrow.style.opacity = "0";
            }

            // Show uploading state
            target.classList.add("is-uploading");
            targetInner.innerHTML = `
                <div class="upload-spinner"></div>
                <div class="upload-status-text">Uploading...</div>
            `;

            setTimeout(() => {
                target.classList.remove("is-uploading");
                target.classList.add("is-success");
                targetInner.innerHTML = `
                    <svg class="upload-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div class="upload-status-text">Successful!</div>
                `;

                setTimeout(() => {
                    setActive(1);
                    setTimeout(() => {
                        resetUploadStep();
                    }, 600);
                }, 1200);
            }, 1800);
        }

        function resetUploadStep() {
            uploadTriggered = false;
            isDragInitialized = false;
            target.classList.remove("is-uploading", "is-success", "drag-hover");
            files.style.opacity = "1";

            const arrow = document.querySelector(".drag-hint-arrow");
            if (arrow) arrow.style.opacity = "0.5";

            const defaultText = window.innerWidth <= 767 ? "Tap to upload files" : "Drop files here";

            targetInner.innerHTML = `
                <svg class="upload-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span class="upload-target-label" id="uploadTargetLabel">${defaultText}</span>
                <span class="upload-target-sub" id="uploadTargetSub">PDF, JPG, PNG</span>
            `;
        }
    }
})();

// ── Step 2: Extraction animation controller ───────────────────────────────────
(function initExtractionAnimation() {
    const extractStep = document.getElementById("extractStep");
    if (!extractStep) return;

    const scanFill = document.getElementById("extractScanFill");
    const aiLabel = document.getElementById("extractAiLabel");
    const actionDiv = document.getElementById("extractAction");
    const reviewBtn = document.getElementById("reviewApproveBtn");

    const fields = [
        { rowId: "ef-vendor", valId: "efv-vendor", value: "Gujarat Traders", delay: 700 },
        { rowId: "ef-invoice", valId: "efv-invoice", value: "INV-2024-0892", delay: 1400 },
        { rowId: "ef-date", valId: "efv-date", value: "12 Aug 2024", delay: 2100 },
        { rowId: "ef-gstin", valId: "efv-gstin", value: "24AADCG7890M1ZX", delay: 2800 },
        { rowId: "ef-amount", valId: "efv-amount", value: "₹53,100", delay: 3600 },
    ];

    // Progress bar steps matching field delays
    const progressSteps = [0, 20, 40, 60, 80, 100];

    let animTimer = null;
    let isRunning = false;

    function resetExtractionUI() {
        if (scanFill) scanFill.style.width = "0%";
        if (aiLabel) {
            aiLabel.innerHTML = `<span class="extract-ai-dot"></span> Khataclerk Extracting...`;
            aiLabel.style.opacity = "1";
        }
        if (actionDiv) actionDiv.classList.remove("is-visible");

        fields.forEach(({ rowId, valId }) => {
            const row = document.getElementById(rowId);
            const val = document.getElementById(valId);
            if (row) { row.classList.remove("is-visible", "is-revealed"); }
            if (val) { val.innerHTML = `<span class="extract-shimmer"></span>`; }
        });
    }

    let hasExtracted = false;

    function runExtractionAnimation() {
        if (isRunning) return;
        isRunning = true;

        if (hasExtracted) {
            // Fast-forward state if we came back from Step 3 (Review)
            if (scanFill) scanFill.style.width = "100%";
            if (aiLabel) {
                aiLabel.innerHTML = `<span class="extract-ai-dot" style="background:var(--emerald)"></span> Extraction Complete`;
            }
            if (actionDiv) actionDiv.classList.add("is-visible");

            fields.forEach(({ rowId, valId }) => {
                const row = document.getElementById(rowId);
                const val = document.getElementById(valId);
                if (row) row.classList.add("is-visible", "is-revealed");
                if (val) {
                    const input = val.querySelector("input");
                    if (input) input.removeAttribute("readonly");
                }
            });
            isRunning = false;
            return;
        }

        hasExtracted = true;
        resetExtractionUI();

        // Make all field rows immediately visible (with shimmer)
        fields.forEach(({ rowId }, i) => {
            const row = document.getElementById(rowId);
            if (row) {
                setTimeout(() => row.classList.add("is-visible"), i * 80);
            }
        });

        // Reveal each field value one by one
        fields.forEach(({ rowId, valId, value, delay }, i) => {
            // Update progress bar
            animTimer = setTimeout(() => {
                if (scanFill) scanFill.style.width = progressSteps[i + 1] + "%";
            }, delay - 300);

            // Pop in the value
            animTimer = setTimeout(() => {
                const row = document.getElementById(rowId);
                const val = document.getElementById(valId);
                if (!val || !row) return;

                val.innerHTML = `<input type="text" class="extract-value-input" value="${value}" readonly />`;
                row.classList.add("is-revealed");

                // On last field, complete the animation
                if (i === fields.length - 1) {
                    setTimeout(() => {
                        if (scanFill) scanFill.style.width = "100%";
                        if (aiLabel) {
                            aiLabel.innerHTML = `<span class="extract-ai-dot" style="background:var(--emerald)"></span> Extraction Complete`;
                        }
                        if (actionDiv) actionDiv.classList.add("is-visible");

                        // Make all inputs editable after animation completes
                        fields.forEach(({ valId }) => {
                            const input = document.getElementById(valId)?.querySelector("input");
                            if (input) input.removeAttribute("readonly");
                        });

                        isRunning = false;
                    }, 400);
                }
            }, delay);
        });
    }

    // Observe when extractStep becomes active
    const observer = new MutationObserver(() => {
        if (extractStep.classList.contains("is-active")) {
            // Small delay so step transition completes first
            setTimeout(runExtractionAnimation, 350);
        } else {
            isRunning = false;
        }
    });

    observer.observe(extractStep, { attributes: true, attributeFilter: ["class"] });

    // Wire up the Review & Approve button — goes to step 3
    if (reviewBtn) {
        reviewBtn.addEventListener("click", () => {
            // Sync values from extraction to review form
            const fieldMap = [
                ["efv-vendor", "rv-vendor"],
                ["efv-invoice", "rv-invoice"],
                ["efv-date", "rv-date"],
                ["efv-gstin", "rv-gstin"],
                ["efv-amount", "rv-amount"],
            ];
            fieldMap.forEach(([srcId, dstId]) => {
                const src = document.getElementById(srcId);
                const dst = document.getElementById(dstId);
                if (src && dst) {
                    const input = src.querySelector("input");
                    if (input) dst.value = input.value;
                }
            });
            document.dispatchEvent(new CustomEvent("extract:approved"));
        });
    }
})();

// ── Step 3: Ledger Mapping ───────────────────────────────────────────────
(function initReviewStep() {
    const changeBtn = document.getElementById("changeDetailsBtn");
    const approveBtn = document.getElementById("reviewApproveConfirmBtn");
    const reviewStep = document.getElementById("reviewStep");

    const mapVendor = document.getElementById("map-vendor");
    const mapTax = document.getElementById("map-tax");
    const mapCategory = document.getElementById("map-category");

    const mappings = [
        { el: mapVendor, text: "Sundry Creditors" },
        { el: mapTax, text: "Duties & Taxes (IGST)" },
        { el: mapCategory, text: "Indirect Expenses" }
    ];

    let animationStarted = false;

    if (changeBtn) {
        changeBtn.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("review:change"));
        });
    }

    if (approveBtn) {
        approveBtn.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("review:approved"));
        });
    }

    if (reviewStep) {
        const observer = new MutationObserver(() => {
            if (reviewStep.classList.contains("is-active")) {
                if (!animationStarted) {
                    animationStarted = true;
                    startMappingAnimation();
                }
            } else {
                // Reset state when not active
                animationStarted = false;
                mappings.forEach(m => {
                    if (m.el) {
                        m.el.classList.remove("is-mapped");
                        m.el.value = "Scanning...";
                    }
                });
            }
        });
        observer.observe(reviewStep, { attributes: true, attributeFilter: ["class"] });
    }

    function startMappingAnimation() {
        let delay = 600;
        mappings.forEach((m, i) => {
            setTimeout(() => {
                if (!m.el) return;
                m.el.style.opacity = "0"; // fade out
                setTimeout(() => {
                    m.el.value = m.text;
                    m.el.classList.add("is-mapped");
                    m.el.style.opacity = "1"; // fade back in
                }, 200);
            }, delay + (i * 800)); // Stagger animations
        });
    }
})();

// ── Step 4: Export / App Selector ─────────────────────────────────────────────
(function initExportStep() {
    const appImages = {
        "Tally": "assets/tally-logo.jpg",
        "Zoho Books": "assets/zoho-logo.jpg",
        "SAP": "assets/sap-logo.png",
    };

    const prompt = document.getElementById("exportPrompt");
    const sync = document.getElementById("exportSync");
    const syncBar = document.getElementById("exportSyncBar");
    const syncLabel = document.getElementById("exportSyncLabel");
    const syncLogo = document.getElementById("exportSyncLogo");
    const syncSuccess = document.getElementById("exportSyncSuccess");
    const successText = document.getElementById("exportSuccessText");
    const exportStep = document.getElementById("exportStep");
    const exportSkipBtn = document.getElementById("exportSkipBtn");

    if (exportSkipBtn) {
        exportSkipBtn.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("export:done"));
        });
    }

    if (!prompt || !sync || !syncBar) return;

    function resetExport() {
        if (prompt) { prompt.style.display = "flex"; prompt.style.flexDirection = "column"; prompt.style.alignItems = "center"; prompt.style.gap = "0.9rem"; }
        if (sync) sync.classList.remove("is-active", "is-done");
        if (syncBar) syncBar.style.width = "0%";
        if (syncSuccess) syncSuccess.classList.remove("is-visible");
        // deselect all
        document.querySelectorAll(".export-app-btn").forEach(b => b.classList.remove("is-selected"));
    }

    // Observe when step becomes active to reset state
    if (exportStep) {
        new MutationObserver(() => {
            if (exportStep.classList.contains("is-active")) {
                setTimeout(resetExport, 300);
            }
        }).observe(exportStep, { attributes: true, attributeFilter: ["class"] });
    }

    document.querySelectorAll(".export-app-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const appName = btn.dataset.app;
            const imgSrc = appImages[appName] || "assets/tally-logo.jpg";

            // Highlight selected
            document.querySelectorAll(".export-app-btn").forEach(b => b.classList.remove("is-selected"));
            btn.classList.add("is-selected");

            // Build logo IMG for sync planet
            if (syncLogo) {
                syncLogo.innerHTML = `
                    <img src="${imgSrc}" alt="${appName} Logo" style="width:100%; height:100%; object-fit:contain; background:white; border-radius:50%;" />
                `;
            }

            // After a short delay, hide prompt and show sync
            setTimeout(() => {
                if (prompt) prompt.style.display = "none";
                if (sync) {
                    sync.classList.add("is-active");
                    sync.classList.remove("is-done");
                }
                if (syncLabel) syncLabel.textContent = `Syncing to ${appName}...`;
                if (syncSuccess) syncSuccess.classList.remove("is-visible");
                if (syncBar) syncBar.style.width = "0%";

                // Animate progress bar in chunks
                const steps = [20, 45, 70, 90, 100];
                let si = 0;
                const tick = () => {
                    if (si >= steps.length) {
                        // Done — show success
                        if (syncLabel) syncLabel.textContent = "";
                        if (successText) successText.textContent = `Posted to ${appName}!`;
                        if (syncSuccess) syncSuccess.classList.add("is-visible");
                        if (sync) sync.classList.add("is-done");
                        return;
                    }
                    if (syncBar) syncBar.style.width = steps[si] + "%";
                    si++;
                    setTimeout(tick, si < steps.length ? 500 : 400);
                };
                setTimeout(tick, 300);
            }, 350);
        });
    });
})();

(() => {
    const openBtn = document.getElementById("openDemo");
    const modal = document.getElementById("demoModal");
    const backdrop = document.getElementById("demoBackdrop");
    const closeBtn = document.getElementById("closeDemo");
    const frame = document.getElementById("demoFrame");

    if (!openBtn || !modal || !backdrop || !closeBtn || !frame) return;

    const VIDEO_ID = "unHxLa9nfc4";
    const VIDEO_URL = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`;

    const open = () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        frame.src = VIDEO_URL;
        document.body.style.overflow = "hidden";
        closeBtn.focus();
    };

    const close = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        frame.src = ""; // stops video
        document.body.style.overflow = "";
        openBtn.focus();
    };

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
    });
})();

// FAQ Accordion
(function () {
    const questions = document.querySelectorAll('.faq__question');
    questions.forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';

            // Close all other accordions
            questions.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    const otherAnswer = otherBtn.nextElementSibling;
                    otherAnswer.style.height = '0px';
                    otherAnswer.style.opacity = '0';
                }
            });

            // Toggle current accordion
            const answer = btn.nextElementSibling;
            if (!isExpanded) {
                btn.setAttribute('aria-expanded', 'true');
                answer.style.height = answer.scrollHeight + 'px';
                answer.style.opacity = '1';
            } else {
                btn.setAttribute('aria-expanded', 'false');
                answer.style.height = '0px';
                answer.style.opacity = '0';
            }
        });
    });
})();

// Hero Animation Sequence
(function initHeroSequence() {
    var hero = document.getElementById('heroCarousel');
    if (!hero) return;

    var viz = document.getElementById('heroViz');

    function initHeroViz() {
        if (!viz || viz.dataset.loopStarted) return;
        hero.classList.add('kc-done');
        viz.dataset.loopStarted = "true";

        const panels = [
            document.getElementById('vizDoc'),
            document.getElementById('vizData'),
            document.getElementById('vizEntry'),
            document.getElementById('vizIntegrations')
        ];
        let currentPanelIdx = 0;

        // Initialize first panel
        panels.forEach(p => {
            if (p) p.classList.remove('is-active', 'is-exiting');
        });
        if (panels[0]) panels[0].classList.add('is-active');

        function advanceCarousel() {
            const nextIdx = (currentPanelIdx + 1) % panels.length;
            const currentPanel = panels[currentPanelIdx];
            const nextPanel = panels[nextIdx];

            if (!currentPanel || !nextPanel) return;

            // Reset internal states if next is Data
            if (nextIdx === 1) {
                const fields = nextPanel.querySelectorAll('.hv-data__field');
                fields.forEach(f => f.classList.remove('is-revealed'));

                setTimeout(() => {
                    fields.forEach((f, idx) => {
                        setTimeout(() => {
                            f.classList.add('is-revealed');
                        }, idx * 250);
                    });
                }, 1000); // Start pop-in sequence AFTER panel finishes sliding in
            }

            // Slide out current to the left
            currentPanel.classList.remove('is-active');
            currentPanel.classList.add('is-exiting');

            // Temporarily disable transition on nextPanel so it instantly snaps to the right
            nextPanel.style.transition = 'none';
            nextPanel.classList.remove('is-exiting');

            // Wait for the exit animation to finish before starting the entrance
            setTimeout(() => {
                nextPanel.style.transition = '';
                // Small delay to allow reflow
                setTimeout(() => {
                    nextPanel.classList.add('is-active');
                }, 50);
            }, 500);

            currentPanelIdx = nextIdx;
        }

        // Start continuous loop
        setTimeout(() => {
            setInterval(advanceCarousel, 3500);
        }, 500);
    }



    var played = false;
    var isReversing = false;

    function play() {
        // Reset classes for looping
        hero.classList.remove('kc-run', 'kc-done', 'kc-reverse');

        // Force reflow
        void hero.offsetWidth;

        requestAnimationFrame(function () {
            if (isReversing) {
                hero.classList.add('kc-reverse');
            } else {
                hero.classList.add('kc-run');
            }
            isReversing = !isReversing;

            // Reliably start the hero visualization after the intro animation starts
            setTimeout(initHeroViz, 1800);
        });
    }

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    if (!played) {
                        played = true;
                        play();
                        io.disconnect();
                    }
                }
            });
        }, { threshold: 0.25 });
        io.observe(hero);
    } else {
        played = true;
        play();
    }
})();

// Floating Calculator Widget Logic
(function initCalcWidget() {
    const calc = document.getElementById("savingsCalc");
    const hero = document.getElementById("heroCarousel");
    const bubbleContainer = document.getElementById("calcBubbleContainer");
    const bubble = document.getElementById("calcBubble");
    const tooltip = document.getElementById("calcTooltip");
    const closeBtn = document.getElementById("closeCalc");

    if (!calc || !hero || !bubbleContainer || !bubble || !tooltip || !closeBtn) return;

    let timerExpired = false;
    let tooltipTimer = null;
    let isBubbleVisible = false;
    let isCalcOpen = false;

    // We observe the hero section.
    // When the hero leaves the screen (isIntersecting: false), the bubble should appear.
    // When the hero is on screen, the bubble & the calculator must be hidden/closed.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                // Show bubble
                bubbleContainer.classList.add("is-visible");
                isBubbleVisible = true;

                // Show tooltip and start 5-second timer
                if (!timerExpired && !isCalcOpen) {
                    tooltip.classList.add("is-visible");
                    if (tooltipTimer) clearTimeout(tooltipTimer);
                    tooltipTimer = setTimeout(() => {
                        tooltip.classList.remove("is-visible");
                        timerExpired = true;
                    }, 5000);
                }
            } else {
                // Hide bubble and close calculator
                bubbleContainer.classList.remove("is-visible");
                calc.classList.remove("is-open");
                tooltip.classList.remove("is-visible");
                isBubbleVisible = false;
                isCalcOpen = false;

                // Reset timer states when returning to hero
                timerExpired = false;
                if (tooltipTimer) {
                    clearTimeout(tooltipTimer);
                    tooltipTimer = null;
                }
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when less than 10% of hero is visible
        rootMargin: "0px"
    });

    observer.observe(hero);

    // Hover tooltip behavior (only works after the 5s timer has expired)
    bubble.addEventListener("mouseenter", () => {
        if (timerExpired && !isCalcOpen) {
            tooltip.classList.add("is-visible");
        }
    });

    bubble.addEventListener("mouseleave", () => {
        if (timerExpired) {
            tooltip.classList.remove("is-visible");
        }
    });

    // Clicking the bubble opens the calculator
    bubble.addEventListener("click", () => {
        calc.classList.add("is-open");
        isCalcOpen = true;

        // Hide the bubble and tooltip when open
        bubbleContainer.classList.remove("is-visible");
        tooltip.classList.remove("is-visible");
    });

    // Clicking the close button hides the calculator and restores the bubble
    closeBtn.addEventListener("click", () => {
        calc.classList.remove("is-open");
        isCalcOpen = false;

        // Bring back the bubble container (and tooltip if not expired)
        if (isBubbleVisible) {
            bubbleContainer.classList.add("is-visible");
            if (!timerExpired) {
                tooltip.classList.add("is-visible");
            }
        }
    });
})();

// Features Carousel Logic
(function initFeaturesCarousel() {
    const track = document.getElementById('featuresTrack');
    const prevBtn = document.getElementById('featuresPrev');
    const nextBtn = document.getElementById('featuresNext');
    const featuresSection = document.querySelector('.features');
    if (!track || !prevBtn || !nextBtn) return;

    let slides = Array.from(track.children);
    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 4500; // 4.5s per slide

    function updateCarousel() {
        slides.forEach(slide => {
            slide.classList.remove('is-active', 'is-prev', 'is-next');
        });

        const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        const nextIndex = (currentIndex + 1) % totalSlides;

        slides[currentIndex].classList.add('is-active');
        slides[prevIndex].classList.add('is-prev');
        slides[nextIndex].classList.add('is-next');
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
        resetAutoplay();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
        resetAutoplay();
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    function startAutoplay() {
        if (!autoplayTimer) {
            autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
        }
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Handle touch/swipe
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        if (touchStartX - touchEndX > threshold) {
            nextSlide();
        } else if (touchEndX - touchStartX > threshold) {
            prevSlide();
        }
    }

    // Init
    updateCarousel();
    startAutoplay();
})();