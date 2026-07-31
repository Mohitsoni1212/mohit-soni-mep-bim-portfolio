/* ========================================================
   Projects listing page: filters + search
   (auto-updates whenever a new document is added to the
   "projects" collection in Firestore — no code changes needed)
   ======================================================== */
let ALL_PROJECTS = [];
let ACTIVE_FILTER = 'All';

function projectListCardHTML(p) {
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

function renderFilterBar() {
  const categories = ['All', ...new Set(ALL_PROJECTS.map(p => p.category).filter(Boolean))];
  const bar = document.getElementById('filter-bar');
  bar.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === ACTIVE_FILTER ? 'active' : ''}" data-filter="${escapeHTML(cat)}">${escapeHTML(cat)}</button>
  `).join('');
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      ACTIVE_FILTER = btn.dataset.filter;
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjectsGrid();
    });
  });
}

function renderProjectsGrid() {
  const holder = document.getElementById('projects-grid');
  const noResults = document.getElementById('no-results');
  const search = (document.getElementById('project-search').value || '').toLowerCase().trim();

  let filtered = ALL_PROJECTS;
  if (ACTIVE_FILTER !== 'All') filtered = filtered.filter(p => p.category === ACTIVE_FILTER);
  if (search) {
    filtered = filtered.filter(p =>
      (p.title || '').toLowerCase().includes(search) ||
      (p.company || '').toLowerCase().includes(search) ||
      (p.category || '').toLowerCase().includes(search) ||
      (p.location || '').toLowerCase().includes(search)
    );
  }

  if (filtered.length === 0) {
    holder.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');
  holder.innerHTML = filtered.map(projectListCardHTML).join('');
  setupRevealAnimations();
}

async function loadAllProjects() {
  try {
    ALL_PROJECTS = await API.getProjects();
    renderFilterBar();
    renderProjectsGrid();
  } catch (e) {
    console.error(e);
    document.getElementById('projects-grid').innerHTML = `<p class="text-sm col-span-3 text-center" style="color:var(--text-muted);">Unable to load projects right now.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAllProjects();
  document.getElementById('project-search').addEventListener('input', renderProjectsGrid);
});
