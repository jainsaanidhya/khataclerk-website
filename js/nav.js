/**
 * KhataClerk Navigation Component
 * Simple, fast, and works everywhere.
 */

function initKhataNav() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (!navPlaceholder) return;

    // Direct check: are we in a subfolder (like /tutorial/)?
    const isSubfolder = window.location.pathname.includes('/tutorial');
    const base = isSubfolder ? '../' : './';

    navPlaceholder.innerHTML = `
        <div class="nav__container container">
            <a href="${base}index.html" class="nav__logo">KhataClerk</a>

            <!-- Desktop links -->
            <div class="nav__links nav__links--desktop">
                <a href="${base}index.html#reality" class="nav__link">Reality</a>
                <a href="${base}index.html#solution" class="nav__link">Solution</a>
                <a href="${base}index.html#features" class="nav__link">Features</a>
                <a href="${base}index.html#difference" class="nav__link">Difference</a>
                <a href="${base}index.html#pricing" class="nav__link">Pricing</a>
                <a href="${base}index.html#faq" class="nav__link">FAQ</a>
            </div>

            <!-- Right side -->
            <div class="nav__actions">
                <a href="${base}tutorial/index.html" class="nav__cta btn btn--small btn--primary">Tutorial</a>
                <a href="https://app.khataclerk.com/" class="nav__cta btn btn--small btn--primary">Login or Signup</a>

                <button class="nav__burger" id="navBurger">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>

        <!-- Mobile dropdown -->
        <div class="nav__mobile" id="navMobile">
            <div class="nav__mobile-inner container">
                <a href="${base}index.html#reality" class="nav__mobile-link">Reality</a>
                <a href="${base}index.html#solution" class="nav__mobile-link">Solution</a>
                <a href="${base}index.html#features" class="nav__mobile-link">Features</a>
                <a href="${base}index.html#difference" class="nav__mobile-link">Difference</a>
                <a href="${base}index.html#pricing" class="nav__mobile-link">Pricing</a>
                <a href="${base}index.html#faq" class="nav__mobile-link">FAQ</a>
            </div>
        </div>
    `;

    // Simple Burger Menu Toggle
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('navMobile');
    if (burger && menu) {
        burger.onclick = () => menu.classList.toggle('active');
    }
}

// Run as soon as the page is ready
document.addEventListener('DOMContentLoaded', initKhataNav);
