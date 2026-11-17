/**
 * KhataClerk Navigation Component
 * Simple, fast, and works everywhere.
 */

function initKhataNav() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (!navPlaceholder) return;

    navPlaceholder.innerHTML = `
        <div class="nav__container container">
            <a href="/" class="nav__logo">KhataClerk</a>

            <!-- Desktop links -->
            <div class="nav__links nav__links--desktop">
                <a href="/#reality" class="nav__link">Reality</a>
                <a href="/#solution" class="nav__link">Solution</a>
                <a href="/#features" class="nav__link">Features</a>
                <a href="/#difference" class="nav__link">Difference</a>
                <a href="/#pricing" class="nav__link">Pricing</a>
                <a href="/#faq" class="nav__link">FAQ</a>
                <a href="/resources/" class="nav__link">Resources</a>
            </div>

            <!-- Right side -->
            <div class="nav__actions">
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
                    <a href="/#reality" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Reality</span>
                    </a>
                    <a href="/#solution" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Solution</span>
                    </a>
                    <a href="/#features" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Features</span>
                    </a>
                    <a href="/#difference" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Difference</span>
                    </a>
                    <a href="/#pricing" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Pricing</span>
                    </a>
                    <a href="/#faq" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">FAQ</span>
                    </a>
                    <a href="/resources/" class="nav__mobile-link">
                        <span class="nav__mobile-link-text">Resources</span>
                    </a>
                </div>
                <div class="nav__mobile-actions">
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
