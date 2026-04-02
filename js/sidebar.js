/**
 * KhataClerk Tutorial Sidebar Component
 */

function initKhataSidebar() {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    if (!sidebarPlaceholder) return;

    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const isOnManageWorkspace = currentPage === 'manage_workspace.html';

    const sidebarSections = [
        {
            title: "1. Upload Your First bill",
            links: [
                { name: "Quick start", url: "index.html" }
            ]
        },
        // Uncomment it to Show the Complete Sidebar
        // {
        //     title: "1. Getting Started",
        //     links: [
        //         { name: "Overview", url: "index.html" },
        //         { name: "How to signup", url: "signup.html" },
        //         { name: "How to login", url: "login.html" }
        //     ]
        // },
        // {
        //     title: "2. Organizations",
        //     links: [
        //         { name: "Manage / Join Organization", url: "organization.html" }
        //     ]
        // },
        // {
        //     title: "3. Workspace",
        //     links: [
        //         { name: "Create / Join Workspace", url: "workspace.html" },
        //         {
        //             name: "Manage Workspace",
        //             url: "manage_workspace.html",
        //             subLinks: [
        //                 { name: "Your First Upload", anchor: "first-upload" },
        //                 { name: "Document Review", anchor: "document-review" },
        //                 { name: "Tally Review", anchor: "tally-review" }
        //             ]
        //         },
        //         {
        //             name: "Document Detail review",
        //             url: "document_detail_review.html",
        //         }
        //     ]
        // },
    ];

    let sidebarHTML = '';

    sidebarSections.forEach((section, index) => {
        const isLast = index === sidebarSections.length - 1;
        sidebarHTML += `
            <div style="${isLast ? '' : 'margin-bottom: 2rem;'}">
                <h3 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--navy); margin-bottom: 1rem;">
                    ${section.title}
                </h3>
                <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.6rem;">
        `;

        section.links.forEach(link => {
            const isActive = currentPage === link.url;
            const hasSubLinks = link.subLinks && link.subLinks.length > 0;

            if (hasSubLinks) {
                sidebarHTML += `
                    <li>
                        <a href="${link.url}"
                           style="color: ${isActive ? 'var(--emerald)' : 'var(--gray-600)'};
                                  font-weight: ${isActive ? '700' : '500'};
                                  text-decoration: none;
                                  font-size: 0.95rem;
                                  transition: color 0.2s;
                                  display: flex;
                                  align-items: center;
                                  justify-content: space-between;
                                  gap: 0.5rem;">
                            <span>${link.name}</span>
                            <span id="manage-ws-chevron"
                                  style="transition: transform 0.25s ease;
                                         transform: ${isOnManageWorkspace ? 'rotate(180deg)' : 'rotate(0deg)'};
                                         color: var(--gray-400);
                                         font-size: 0.7rem;
                                         line-height: 1;">▾</span>
                        </a>
                        <ul id="manage-ws-sublinks"
                            style="list-style: none;
                                   padding: 0;
                                   margin-top: 0.5rem;
                                   padding-left: 1rem;
                                   display: ${isOnManageWorkspace ? 'flex' : 'none'};
                                   flex-direction: column;
                                   gap: 0.45rem;
                                   border-left: 2px solid #a7f3d0;">
                            ${link.subLinks.map(sub => `
                                <li>
                                    <a href="manage_workspace.html#${sub.anchor}"
                                       data-anchor="${sub.anchor}"
                                       class="sidebar-sub-link"
                                       style="color: var(--gray-500);
                                              font-weight: 500;
                                              text-decoration: none;
                                              font-size: 0.875rem;
                                              transition: color 0.2s, font-weight 0.1s;
                                              display: block;
                                              line-height: 1.5;">
                                        ${sub.name}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </li>
                `;
            } else {
                sidebarHTML += `
                    <li>
                        <a href="${link.url}"
                           style="color: ${isActive ? 'var(--emerald)' : 'var(--gray-600)'};
                                  font-weight: ${isActive ? '700' : '500'};
                                  text-decoration: none;
                                  font-size: 0.95rem;
                                  transition: color 0.2s;">
                            ${link.name}
                        </a>
                    </li>
                `;
            }
        });

        sidebarHTML += `
                </ul>
            </div>
        `;
    });

    sidebarPlaceholder.innerHTML = sidebarHTML;

    // Toggle click handler for Manage Workspace (when NOT on its page)
    const manageLink = sidebarPlaceholder.querySelector('a[href="manage_workspace.html"]');
    const sublinksEl = document.getElementById('manage-ws-sublinks');
    const chevronEl = document.getElementById('manage-ws-chevron');

    if (manageLink && sublinksEl && chevronEl && !isOnManageWorkspace) {
        manageLink.addEventListener('click', (e) => {
            // Let navigation happen — on arrival the page auto-expands
        });
    }
}

document.addEventListener('DOMContentLoaded', initKhataSidebar);
