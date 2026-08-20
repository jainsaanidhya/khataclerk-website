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
                <a href="${base}tutorial/index.html" class="nav__cta btn btn--small btn--secondary">Tutorial</a>
                <a href="https://app.khataclerk.com/" class="nav__cta btn btn--small btn--primary">Login or Signup</a>

                <button class="nav__burger" id="navBurger">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>

        <!-- Mobile dropdown - Compact 2-column dynamic menu -->
        <div class="nav__mobile" id="navMobile">
            <div class="nav__mobile-inner container">
                <div class="nav__mobile-grid">
                    <a href="${base}index.html#reality" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Reality</span>
                    </a>
                    <a href="${base}index.html#solution" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Solution</span>
                    </a>
                    <a href="${base}index.html#features" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Features</span>
                    </a>
                    <a href="${base}index.html#difference" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Difference</span>
                    </a>
                    <a href="${base}index.html#pricing" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Pricing</span>
                    </a>
                    <a href="${base}index.html#faq" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">FAQ</span>
                    </a>
                </div>
                <div class="nav__mobile-actions">
                    <a href="${base}tutorial/index.html" class="btn btn--small btn--secondary" style="flex: 1; justify-content: center; padding: 0.6rem 0.75rem; font-size: 0.88rem;">Tutorial</a>
                    <a href="https://app.khataclerk.com/" class="btn btn--small btn--primary" style="flex: 1.3; justify-content: center; padding: 0.6rem 0.75rem; font-size: 0.88rem;">Login / Signup</a>
                </div>
            </div>
        </div>
    `;

    // Dynamic Burger Menu Toggle & Interactions
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('navMobile');
    if (burger && menu) {
        burger.onclick = () => {
            const isOpen = menu.classList.toggle('active');
            burger.classList.toggle('active', isOpen);
        };

        // Close menu when a link inside is clicked
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                burger.classList.remove('active');
            });
        });
    }
}

// Run as soon as the page is ready
document.addEventListener('DOMContentLoaded', initKhataNav);
