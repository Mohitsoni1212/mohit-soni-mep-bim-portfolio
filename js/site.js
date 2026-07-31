/* ========================================================
   Shared site chrome: header, footer, mobile nav, reveal anim
   ======================================================== */
const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'about.html', label: 'About' },
  { href: 'experience.html', label: 'Experience' },
  { href: 'resume.html', label: 'Resume' },
  { href: 'projects.html', label: 'Projects' },
  { href: 'contact.html', label: 'Contact' }
];

function currentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function renderHeader() {
  const holder = document.getElementById('site-header');
  if (!holder) return;
  const page = currentPage();
  const links = NAV_LINKS.map(l => `
    <a href="${l.href}" class="nav-link ${page === l.href ? 'active' : ''}">${l.label}</a>
  `).join('');
  const mobileLinks = NAV_LINKS.map(l => `
    <a href="${l.href}" class="nav-link block py-2 ${page === l.href ? 'active' : ''}">${l.label}</a>
  `).join('');

  holder.innerHTML = `
    <div class="container-wide flex items-center justify-between py-4 px-6">
      <a href="index.html" class="logo text-accent" aria-label="Home">Mohit Soni<span style="color:#eef0f4"></span></a>
      <nav class="hidden md:flex items-center gap-8">
        ${links}
      </nav>
      <div class="hidden md:flex items-center gap-3">
        <a href="contact.html" class="btn-accent text-sm">Hire Me <i class="fa-solid fa-arrow-right"></i></a>
      </div>
  
<button
  id="mobile-toggle"
  class="mobile-toggle"
  type="button"
  aria-label="Open navigation"
  aria-expanded="false"
>
  <i class="fa-solid fa-bars"></i>
</button>


    </div>
    <div id="mobile-menu" class="md:hidden flex-col px-6 pb-5 gap-1">
      ${mobileLinks}
      <a href="contact.html" class="btn-accent text-sm justify-center mt-2">Hire Me</a>
    </div>
  `;

  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');

toggle.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');

  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

  toggle.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
});


}

async function renderFooter() {
  const holder = document.getElementById('site-footer');
  if (!holder) return;
  let profile = null;
  try { profile = await API.getProfile(); } catch (e) { /* ignore */ }
  const name = profile?.name || 'Mohit Soni';
  const email = profile?.email || 'mohitsoni2241@gmail.com';
  const phone = profile?.phone || '+91 7877790117';
  const location = profile?.location || 'Jaipur, Rajasthan, India';
  const linkedin = profile?.linkedin || '';
  const instagram = profile?.instagram || '';
  const behance = profile?.behance || '';

holder.innerHTML = `
  <div class="container-wide px-6 py-14 grid md:grid-cols-4 gap-10">

    <div class="md:col-span-2">
      <a href="index.html" class="logo text-accent text-2xl">
        ${escapeHTML(name)}<span style="color:#eef0f4"></span>
      </a>

      <p class="text-sm mt-4" style="color:var(--text-muted);max-width:380px;">
        MEP BIM Engineer specializing in Revit MEP, HVAC, Plumbing, Fire Fighting,
        and Electrical modeling. Experienced in BIM coordination, clash detection,
        LOD 100–500 modeling, and delivering accurate, coordinated,
        construction-ready MEP models.
      </p>

      <!-- SOCIAL LINKS -->
      <div class="flex gap-3 mt-5">

        ${
          linkedin
            ? `<a href="${linkedin.startsWith('http') ? linkedin : 'https://' + linkedin}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="icon-btn"
                 title="LinkedIn">
                 <i class="fa-brands fa-linkedin-in"></i>
               </a>`
            : ''
        }

        ${
          instagram
            ? `<a href="${instagram.startsWith('http') ? instagram : 'https://' + instagram}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="icon-btn"
                 title="Instagram">
                 <i class="fa-brands fa-instagram"></i>
               </a>`
            : ''
        }

        ${
          behance
            ? `<a href="${behance.startsWith('http') ? behance : 'https://' + behance}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="icon-btn"
                 title="Behance">
                 <i class="fa-brands fa-behance"></i>
               </a>`
            : ''
        }

      </div>
    </div>

    <!-- EXPLORE -->
    <div>
      <h4 class="text-sm font-semibold mb-4 uppercase tracking-wide text-accent">
        Explore
      </h4>

      <div class="flex flex-col gap-2 text-sm">
        <a href="about.html" class="nav-link">About</a>
        <a href="experience.html" class="nav-link">Experience</a>
        <a href="resume.html" class="nav-link">Resume</a>
        <a href="projects.html" class="nav-link">Projects</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </div>
    </div>

    <!-- CONTACT -->
    <div>
      <h4 class="text-sm font-semibold mb-4 uppercase tracking-wide text-accent">
        Contact
      </h4>

      <div class="flex flex-col gap-2 text-sm" style="color:var(--text-muted);">

        <span>
          <i class="fa-solid fa-envelope text-accent mr-2"></i>
          ${escapeHTML(email)}
        </span>

        ${
          phone
            ? `<span>
                 <i class="fa-solid fa-phone text-accent mr-2"></i>
                 ${escapeHTML(phone)}
               </span>`
            : ''
        }

        ${
          location
            ? `<span>
                 <i class="fa-solid fa-location-dot text-accent mr-2"></i>
                 ${escapeHTML(location)}
               </span>`
            : ''
        }

      </div>
    </div>

  </div>

  <div class="container-wide px-6 py-5 border-t text-xs flex flex-col md:flex-row justify-between gap-2"
       style="border-color:var(--border-soft); color:var(--text-muted);">

    <span>
      © ${new Date().getFullYear()} ${escapeHTML(name)}. All rights reserved.
    </span>

    <span>
      Built with Revit MEP, BIM coordination &amp; a lot of clash resolution.
    </span>

  </div>
`;
}

function setupRevealAnimations() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => observer.observe(item));
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  setupRevealAnimations();
});
