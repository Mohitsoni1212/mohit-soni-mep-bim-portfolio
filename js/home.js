/* ========================================================
   Home page dynamic content — driven entirely by Firestore
   (profile/main, projects, skills, experience)
   ======================================================== */
async function loadHomeProfile() {
  try {
    const profile = await API.getProfile();

    const heroPhoto = document.getElementById('hero-photo');
    if (heroPhoto) {
      heroPhoto.src = profile?.profileImage || 'https://via.placeholder.com/800x600?text=Add+profileImage+in+Firestore';
      heroPhoto.alt = (profile?.name || 'Profile') + ' photo';
    }

    const eyebrowText = document.getElementById('hero-eyebrow-text');
    if (eyebrowText && profile?.title) eyebrowText.textContent = profile.title;

    const heroSubtext = document.getElementById('hero-subtext');
    if (heroSubtext) {
      const name = profile?.name || 'Mohit Soni';
      const desc = profile?.subtitle || profile?.about ||
        "a MEP Senior Engineer working in Revit MEP, Navisworks & AutoCAD. I model HVAC, Plumbing and Fire Fighting systems, coordinate them across disciplines, and resolve clashes so every project ships clean, coordinated and construction-ready.";
      heroSubtext.innerHTML = `I'm <span class="text-accent font-semibold">${escapeHTML(name)}</span> — ${escapeHTML(desc)}`;
    }
  } catch (e) { console.error(e); }
}

function projectCardHTML(p) {
  const software = toArray(p.software).slice(0, 3);
  return `
  <a href="project-detail.html?id=${encodeURIComponent(p.id)}" class="project-card reveal">
    <div class="thumb-wrap">
      <img src="${escapeHTML(p.coverImage || 'https://via.placeholder.com/800x600?text=No+Image')}" alt="${escapeHTML(p.title || '')}" loading="lazy">
      <div class="overlay"></div>
      <div class="absolute bottom-0 left-0 p-5 w-full">
        <span class="category-chip mb-2 inline-block">${escapeHTML(p.category || 'Project')}</span>
        <h3 class="font-semibold text-lg mt-2">${escapeHTML(p.title || 'Untitled Project')}</h3>
        <p class="text-xs mt-1" style="color:#c8ccd6;">${escapeHTML(p.location || '')}${p.year ? ' · ' + escapeHTML(p.year) : ''}</p>
        ${software.length ? `<div class="flex gap-2 mt-2 flex-wrap">${software.map(t => `<span class="text-[10px] px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.08);">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
        <p class="text-[11px] mt-2 text-accent"><i class="fa-solid fa-arrow-right mr-1"></i>View Details</p>
      </div>
    </div>
  </a>`;
}

async function loadFeaturedProjects() {
  const holder = document.getElementById('featured-projects');
  const statEl = document.getElementById('stat-projects');
  try {
    const all = await API.getProjects();
    if (statEl) statEl.textContent = all.length + (all.length ? '+' : '');
    if (!holder) return;
    const featured = all.slice(0, 3);
    if (featured.length === 0) {
      holder.innerHTML = `<p class="text-sm col-span-3 text-center" style="color:var(--text-muted);">No projects yet. Add a document to the "projects" collection in Firestore.</p>`;
      return;
    }
    holder.innerHTML = featured.map(projectCardHTML).join('');
    setupRevealAnimations();
  } catch (e) {
    console.error(e);
    if (holder) holder.innerHTML = `<p class="text-sm col-span-3 text-center" style="color:var(--text-muted);">Unable to load projects right now.</p>`;
  }
}


/* ========================================================
   RESUME DOWNLOAD
======================================================== */

async function loadSkillsPreview() {
  const holder = document.getElementById('skills-preview');
  const statEl = document.getElementById('stat-skills');

  if (!holder) return;

  try {
    const skills = await API.getSkills();

    // ==============================
    // TOTAL SKILLS COUNT
    // ==============================
    if (statEl) {
      statEl.textContent = skills.length > 0
        ? skills.length + '+'
        : '0';
    }

    // ==============================
    // NO SKILLS
    // ==============================
    if (!skills.length) {
      holder.innerHTML = `
        <p class="text-sm col-span-full text-center"
           style="color:var(--text-muted);">
          No skills added yet.
        </p>
      `;
      return;
    }

    // ==============================
    // SHOW 10 SKILLS ON HOME PAGE
    // ==============================
    const previewSkills = skills.slice(0, 100);

    holder.innerHTML = previewSkills.map(skill => {

      const name = skill.name || 'Skill';
      const category = skill.category || 'General';

      const logo = skill.logo
        ? `
          <img
            src="${escapeHTML(skill.logo)}"
            alt="${escapeHTML(name)}"
            loading="lazy"
            style="
              width:42px;
              height:42px;
              object-fit:contain;
            "
            onerror="this.style.display='none';"
          >
        `
        : `
          <i class="fa-solid fa-cube text-accent text-xl"></i>
        `;

      return `
        <div
          class="card p-4 flex items-center gap-4
                 hover:-translate-y-1 transition-all duration-300"
        >

          <!-- LOGO -->
          <div
            class="flex-shrink-0 flex items-center justify-center"
            style="
              width:58px;
              height:58px;
              border-radius:12px;
              background:rgba(255,255,255,0.06);
              border:1px solid rgba(255,255,255,0.08);
            "
          >
            ${logo}
          </div>

          <!-- NAME -->
          <div class="min-w-0">

            <h4 class="font-semibold text-sm">
              ${escapeHTML(name)}
            </h4>

            <p
              class="text-xs mt-1"
              style="color:var(--text-muted);"
            >
              ${escapeHTML(category)}
            </p>

          </div>

        </div>
      `;

    }).join('');

    setupRevealAnimations();

  } catch (e) {

    console.error('Skills loading error:', e);

    if (statEl) {
      statEl.textContent = '0';
    }

    holder.innerHTML = `
      <p class="text-sm col-span-full text-center"
         style="color:var(--text-muted);">
        Unable to load skills.
      </p>
    `;
  }
}
async function loadExperienceStat() {
  const statEl = document.getElementById('stat-experience');
  if (!statEl) return;
  try {
    const exp = await API.getExperience();
    statEl.textContent = exp.length + (exp.length ? '' : '');
  } catch (e) { console.error(e); }
}

function serviceIcon(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('hvac')) return 'fa-fan';
  if (t.includes('plumb') || t.includes('fire')) return 'fa-droplet';
  if (t.includes('electric')) return 'fa-bolt';
  if (t.includes('clash')) return 'fa-bore-hole';
  if (t.includes('shop') || t.includes('drawing')) return 'fa-file-lines';
  if (t.includes('coordinat') || t.includes('bim')) return 'fa-diagram-project';
  return 'fa-cube';
}

async function loadServicesHome() {
  const holder = document.getElementById('services-grid-home');
  if (!holder) return;
  try {
    const services = await API.getServices();
    if (!services.length) {
      holder.innerHTML = `<p class="text-sm col-span-4 text-center" style="color:var(--text-muted);">No services added yet. Add documents to the "services" collection in Firestore.</p>`;
      return;
    }
    holder.innerHTML = services.map(s => `
      <div class="card p-7 reveal">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style="background:rgba(212,169,74,0.14);"><i class="fa-solid ${serviceIcon(s.title)} text-accent text-xl"></i></div>
        <h3 class="font-semibold text-lg mb-2">${escapeHTML(s.title || '')}</h3>
        <p class="text-sm" style="color:var(--text-muted);">${escapeHTML(s.description || '')}</p>
      </div>
    `).join('');
    setupRevealAnimations();
  } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHomeProfile();
  loadFeaturedProjects();
  loadSkillsPreview();
  loadExperienceStat();
  loadServicesHome();
});
