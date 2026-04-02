/**
 * KhataClerk Footer Component
 */

function initKhataFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const isSubfolder = window.location.pathname.includes('/tutorial/');
    const base = isSubfolder ? '../' : './';

    footerPlaceholder.innerHTML = `
        <footer class="footer">
        <div class="footer__container container">
            <div class="footer__main">
                <div class="footer__col footer__col--brand">
                    <div class="footer__logo">KhataClerk</div>
                    <p class="footer__tagline">Invoice Intelligence for every business.</p>
                    <p class="footer__company">A product by Perceptive Labs Private Limited</p>
                </div>

                <div class="footer__col">
                    <h4 class="footer__title">Product</h4>
                    <ul class="footer__links">
                        <li><a href="https://www.youtube.com/@KhataClerk" target="_blank"
                                rel="noopener noreferrer nofollow">Youtube</a></li>

                        <li><a href="https://www.linkedin.com/showcase/khataclerk/about/" target="_blank"
                                rel="noopener noreferrer nofollow">Linkedin</a></li>

                    </ul>
                </div>

                <div class="footer__col">
                    <h4 class="footer__title">Resources</h4>
                    <ul class="footer__links">
                        <li>
                            <a href="https://www.youtube.com/results?search_query=tally+gst+invoice+entry"
                                target="_blank" rel="noopener noreferrer nofollow">
                                Video Tutorials
                            </a>
                        </li>
                        <li><a href="https://tallysolutions.com/" target="_blank"
                                rel="noopener noreferrer nofollow">Tally
                                Tips</a>
                        </li>
                    </ul>
                </div>

                <div class="footer__col">
                    <h4 class="footer__title">Company</h4>
                    <ul class="footer__links">
                        <li><a href="https://perceptivelabs.in" target="_blank" rel="noopener noreferrer nofollow">About
                                Perceptive
                                Labs</a></li>
                        <li><a href="mailto:help@khataclerk.com">Contact Us</a></li>
                    </ul>
                </div>

                <div class="footer__col">
                    <h4 class="footer__title" style="margin-top: 1.5rem;">Connect</h4>
                    <ul class="footer__links">
                        <li><a href="mailto:help@khataclerk.com">help@khataclerk.com</a></li>
                    </ul>
                    <ul class="footer__links">
                        <li><a href="mailto:team@perceptivelabs.in">team@perceptivelabs.in</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer__bottom">
                <p>&copy; 2026 Perceptive Labs Private Limited. All rights reserved.</p>
                <p class="footer__made">Made in India 🇮🇳</p>
            </div>
        </div>
    </footer>
    `;
}

document.addEventListener('DOMContentLoaded', initKhataFooter);
