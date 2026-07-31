/* ========================================================
   Project detail page: pulls one document from the
   "projects" collection (matched by ?id=) and shows title,
   info and full image gallery with a lightbox.
   ======================================================== */
let CURRENT_PROJECT = null;
let ALL_PROJECTS_LIST = [];
let CURRENT_GALLERY = [];
let LIGHTBOX_INDEX = 0;

function getProjectIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderGallery() {
  const holder = document.getElementById('pd-gallery');
  if (!CURRENT_GALLERY.length) {
    holder.innerHTML = `<p class="text-sm col-span-3" style="color:var(--text-muted);">No gallery images yet — add URLs to the "gallery" array field on this project in Firestore.</p>`;
    return;
  }
  holder.innerHTML = CURRENT_GALLERY.map((url, i) => `
    <div class="card overflow-hidden cursor-pointer group" data-index="${i}" onclick="openLightbox(${i})">
      <div class="thumb-wrap" style="aspect-ratio:4/3;">
        <img src="${escapeHTML(url)}" alt="Gallery image ${i + 1}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      </div>
    </div>
  `).join('');
}

function openLightbox(idx) {
  LIGHTBOX_INDEX = idx;
  showLightbox();
}

function showLightbox() {
  const lb = document.getElementById('lightbox');
  const url = CURRENT_GALLERY[LIGHTBOX_INDEX];
  if (!url) return;
  document.getElementById('lb-img').src = url;
  document.getElementById('lb-caption').textContent = CURRENT_PROJECT ? (CURRENT_PROJECT.title || '') : '';
  lb.classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

function lightboxNav(dir) {
  if (!CURRENT_GALLERY.length) return;
  LIGHTBOX_INDEX = (LIGHTBOX_INDEX + dir + CURRENT_GALLERY.length) % CURRENT_GALLERY.length;
  showLightbox();
}

function renderProjectDetail(p) {

  console.log("PROJECT DATA:", p);
  console.log("STATUS:", p.status);

  document.getElementById('pd-category').textContent =
    p.category || 'Project';

  document.getElementById('pd-title').textContent =
    p.title || 'Untitled Project';

  document.getElementById('pd-location').textContent =
    p.location || '--';

  // STATUS
  const statusElement = document.getElementById('pd-status');

  if (statusElement) {
    statusElement.textContent = p.status || 'Completed';
  }

  document.getElementById('pd-cover').src =
    p.coverImage ||
    'https://via.placeholder.com/1200x700?text=No+Image';

  document.getElementById('pd-cover').alt =
    p.title || '';

  document.getElementById('pd-description').textContent =
    p.description || 'No description provided yet.';

  const software = toArray(p.software);
  const tags = [...software];

  if (p.discipline) {
    tags.push(p.discipline);
  }

  document.getElementById('pd-tools').innerHTML =
    tags.length
      ? tags.map(t =>
          `<span class="category-chip">${escapeHTML(t)}</span>`
        ).join('')
      : `<p class="text-sm" style="color:var(--text-muted);">
           No software/discipline listed.
         </p>`;

  CURRENT_GALLERY = toArray(p.gallery);
  renderGallery();

  document.title = `${p.title || 'Project'} | Mohit Soni`;

  document.getElementById('project-loading').classList.add('hidden');
  document.getElementById('project-content').classList.remove('hidden');
}
function setupPrevNext() {
  const idx = ALL_PROJECTS_LIST.findIndex(p => p.id === CURRENT_PROJECT.id);
  const prevEl = document.getElementById('pd-prev');
  const nextEl = document.getElementById('pd-next');
  if (idx > 0) {
    prevEl.href = `project-detail.html?id=${encodeURIComponent(ALL_PROJECTS_LIST[idx - 1].id)}`;
  } else {
    prevEl.classList.add('opacity-40', 'pointer-events-none');
  }
  if (idx < ALL_PROJECTS_LIST.length - 1 && idx !== -1) {
    nextEl.href = `project-detail.html?id=${encodeURIComponent(ALL_PROJECTS_LIST[idx + 1].id)}`;
  } else {
    nextEl.classList.add('opacity-40', 'pointer-events-none');
  }
}

async function loadProjectDetail() {
  const id = getProjectIdFromURL();
  if (!id) {
    document.getElementById('project-loading').classList.add('hidden');
    document.getElementById('project-not-found').classList.remove('hidden');
    return;
  }
  try {
    ALL_PROJECTS_LIST = await API.getProjects();
    const project = ALL_PROJECTS_LIST.find(p => p.id === id);
    if (!project) {
      document.getElementById('project-loading').classList.add('hidden');
      document.getElementById('project-not-found').classList.remove('hidden');
      return;
    }
    CURRENT_PROJECT = project;
    renderProjectDetail(project);
    setupPrevNext();
  } catch (e) {
    console.error(e);
    document.getElementById('project-loading').classList.add('hidden');
    document.getElementById('project-not-found').classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProjectDetail();
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () => lightboxNav(-1));
  document.getElementById('lb-next').addEventListener('click', () => lightboxNav(1));
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });
});
