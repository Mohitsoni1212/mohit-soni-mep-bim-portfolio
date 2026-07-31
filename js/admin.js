/* ========================================================
   Admin Dashboard Logic
   Auth gate + CRUD for profile / resume_items / skills / projects / messages
   ======================================================== */

/* ---------------- AUTH GATE ----------------
   Ab auth check dashboard.html ke Firebase module script me hota hai.
   Ye file tabhi load hoti hai jab Firebase confirm kar chuka ho ke user
   admin_email se match karta hai, isliye yaha alag se gate ki zarurat nahi. */

// Ye file DOMContentLoaded ke baad (dynamically) load hoti hai, isliye
// 'DOMContentLoaded' event dobara nahi milega — turant chala do agar
// document already ready hai.
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

/* ---------------- FILE UPLOAD HELPER ----------------
   Wires a <input type="file"> to fill a URL text input via
   Firebase Storage upload. Used for profile photo, resume PDF,
   project cover image, and gallery asset images. */
function wireFileUpload(fileInputId, urlInputId, statusId, folder) {
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);
  const statusEl = document.getElementById(statusId);
  if (!fileInput || !urlInput) return;
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (statusEl) statusEl.textContent = 'Uploading...';
    try {
      const url = await API.uploadFile(file, folder);
      urlInput.value = url;
      if (statusEl) statusEl.textContent = 'Uploaded ✓';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.textContent = 'Upload failed';
    }
  });
}

let CURRENT_PROFILE = null;
let RESUME_ITEMS = [];
let SKILLS_ITEMS = [];
let PROJECTS_ITEMS = [];
let MESSAGES_ITEMS = [];
let CURRENT_ASSET_PROJECT_ID = null;
let CURRENT_ASSET_GALLERY = [];

/* ---------------- NAVIGATION ---------------- */
function showSection(name) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById('section-' + name);
  if (target) target.classList.remove('hidden');
  document.querySelectorAll('.admin-nav-link[data-section]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === name);
  });
  document.getElementById('mobile-admin-menu').classList.add('hidden');
  document.getElementById('mobile-admin-menu').classList.remove('flex');
}

function setupNav() {
  document.querySelectorAll('.admin-nav-link[data-section]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('logout-btn-mobile').addEventListener('click', logout);
  document.getElementById('mobile-admin-toggle').addEventListener('click', () => {
    const menu = document.getElementById('mobile-admin-menu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
  });
  document.getElementById('sidebar-admin-email').textContent = sessionStorage.getItem('admin_email') || '--';
}

function logout() {
  sessionStorage.removeItem('admin_email');
  if (window.__ADMIN_LOGOUT__) {
    window.__ADMIN_LOGOUT__();
  } else {
    window.location.href = 'login.html';
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

/* ---------------- PROFILE ---------------- */
async function loadProfileSection() {
  try {
    CURRENT_PROFILE = await API.getProfile();
    if (!CURRENT_PROFILE) return;
    const form = document.getElementById('profile-form');
    Object.keys(CURRENT_PROFILE).forEach(key => {
      const field = form.elements[key];
      if (field) field.value = CURRENT_PROFILE[key] || '';
    });
  } catch (e) { console.error(e); }
}

onReady(() => {
  const form = document.getElementById('profile-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => payload[k] = v);
    const msgEl = document.getElementById('profile-save-msg');
    try {
      if (CURRENT_PROFILE && CURRENT_PROFILE.id) {
        await API.update('profile', CURRENT_PROFILE.id, payload);
      } else {
        const created = await API.create('profile', payload);
        CURRENT_PROFILE = created;
      }
      msgEl.classList.remove('hidden');
      setTimeout(() => msgEl.classList.add('hidden'), 3000);
      await loadProfileSection();
    } catch (err) {
      console.error(err);
      alert('Failed to save profile. Please try again.');
    }
  });
});

/* ---------------- RESUME ITEMS ---------------- */
async function loadResumeSection() {
  try {
    const res = await API.list('resume_items', { limit: 200, sort: 'order_index' });
    RESUME_ITEMS = res.data || [];
    renderResumeTable();
  } catch (e) { console.error(e); }
}

function renderResumeTable() {
  const body = document.getElementById('resume-table-body');
  if (!RESUME_ITEMS.length) {
    body.innerHTML = `<tr><td colspan="6" class="text-center py-8" style="color:var(--text-muted);">No resume items yet. Click "Add Item" to create one.</td></tr>`;
    return;
  }
  body.innerHTML = RESUME_ITEMS.map(item => `
    <tr>
      <td><span class="category-chip">${escapeHTML(item.section)}</span></td>
      <td class="font-medium">${escapeHTML(item.title)}</td>
      <td style="color:var(--text-muted);">${escapeHTML(item.organization || '--')}</td>
      <td style="color:var(--text-muted);">${escapeHTML(item.start_date || '')} - ${escapeHTML(item.end_date || '')}</td>
      <td>${item.order_index ?? 0}</td>
      <td class="flex gap-2">
        <button class="icon-btn" onclick="openResumeModal('${item.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn danger" onclick="deleteResumeItem('${item.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openResumeModal(id) {
  const form = document.getElementById('resume-form');
  form.reset();
  document.getElementById('resume-modal-title').textContent = id ? 'Edit Resume Item' : 'Add Resume Item';
  if (id) {
    const item = RESUME_ITEMS.find(i => i.id === id);
    if (item) {
      Object.keys(item).forEach(key => {
        if (form.elements[key]) form.elements[key].value = item[key] ?? '';
      });
    }
  }
  openModal('resume-modal');
}

async function deleteResumeItem(id) {
  if (!confirm('Delete this resume item?')) return;
  try {
    await API.remove('resume_items', id);
    await loadResumeSection();
  } catch (e) { console.error(e); alert('Failed to delete.'); }
}

onReady(() => {
  document.getElementById('resume-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { if (k !== 'id') payload[k] = v; });
    payload.order_index = Number(payload.order_index) || 0;
    const id = fd.get('id');
    try {
      if (id) await API.update('resume_items', id, payload);
      else await API.create('resume_items', payload);
      closeModal('resume-modal');
      await loadResumeSection();
    } catch (err) { console.error(err); alert('Failed to save item.'); }
  });
});

/* ---------------- SKILLS ---------------- */
async function loadSkillsSection() {
  try {
    const res = await API.list('skills', { limit: 200, sort: 'order_index' });
    SKILLS_ITEMS = res.data || [];
    renderSkillsTable();
  } catch (e) { console.error(e); }
}

function renderSkillsTable() {
  const body = document.getElementById('skills-table-body');
  if (!SKILLS_ITEMS.length) {
    body.innerHTML = `<tr><td colspan="5" class="text-center py-8" style="color:var(--text-muted);">No skills yet. Click "Add Skill" to create one.</td></tr>`;
    return;
  }
  body.innerHTML = SKILLS_ITEMS.map(item => `
    <tr>
      <td class="font-medium">${escapeHTML(item.name)}</td>
      <td><span class="category-chip">${escapeHTML(item.category || '--')}</span></td>
      <td>
        <div class="flex items-center gap-2">
          <div class="skill-bar-track" style="width:80px;"><div class="skill-bar-fill" style="width:${Number(item.level)||0}%;"></div></div>
          <span class="text-xs">${Number(item.level)||0}%</span>
        </div>
      </td>
      <td>${item.order_index ?? 0}</td>
      <td class="flex gap-2">
        <button class="icon-btn" onclick="openSkillModal('${item.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn danger" onclick="deleteSkill('${item.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openSkillModal(id) {
  const form = document.getElementById('skill-form');
  form.reset();
  document.getElementById('skill-modal-title').textContent = id ? 'Edit Skill' : 'Add Skill';
  document.getElementById('skill-level-display').textContent = '70%';
  if (id) {
    const item = SKILLS_ITEMS.find(i => i.id === id);
    if (item) {
      Object.keys(item).forEach(key => {
        if (form.elements[key]) form.elements[key].value = item[key] ?? '';
      });
      document.getElementById('skill-level-display').textContent = (item.level || 0) + '%';
    }
  }
  openModal('skill-modal');
}

async function deleteSkill(id) {
  if (!confirm('Delete this skill?')) return;
  try {
    await API.remove('skills', id);
    await loadSkillsSection();
  } catch (e) { console.error(e); alert('Failed to delete.'); }
}

onReady(() => {
  document.getElementById('skill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { if (k !== 'id') payload[k] = v; });
    payload.level = Number(payload.level) || 0;
    payload.order_index = Number(payload.order_index) || 0;
    const id = fd.get('id');
    try {
      if (id) await API.update('skills', id, payload);
      else await API.create('skills', payload);
      closeModal('skill-modal');
      await loadSkillsSection();
    } catch (err) { console.error(err); alert('Failed to save skill.'); }
  });
});

/* ---------------- PROJECTS ---------------- */
async function loadProjectsSection() {
  try {
    const res = await API.list('projects', { limit: 200, sort: 'order_index' });
    PROJECTS_ITEMS = res.data || [];
    renderProjectsAdminGrid();
  } catch (e) { console.error(e); }
}

function renderProjectsAdminGrid() {
  const holder = document.getElementById('projects-admin-grid');
  if (!PROJECTS_ITEMS.length) {
    holder.innerHTML = `<p class="col-span-3 text-center py-10" style="color:var(--text-muted);">No projects yet. Click "Add Project" to create one.</p>`;
    return;
  }
  holder.innerHTML = PROJECTS_ITEMS.map(p => {
    const gallery = safeParseJSON(p.gallery_json, []);
    const count = Array.isArray(gallery) ? gallery.length : 0;
    return `
    <div class="card overflow-hidden">
      <div class="thumb-wrap" style="aspect-ratio:16/10;">
        <img src="${escapeHTML(p.cover_image || 'https://via.placeholder.com/600x400?text=No+Image')}" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="category-chip">${escapeHTML(p.category || '--')}</span>
          ${p.featured ? '<span class="text-[10px] text-accent font-semibold"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
        </div>
        <h3 class="font-semibold mb-1">${escapeHTML(p.title)}</h3>
        <p class="text-xs mb-3" style="color:var(--text-muted);">${escapeHTML(p.client || '')} ${p.year ? '· ' + escapeHTML(p.year) : ''} · ${count} asset(s)</p>
        <div class="flex gap-2 flex-wrap">
          <button class="btn-outline text-xs px-3 py-2" onclick="openAssetsModal('${p.id}')"><i class="fa-solid fa-images"></i> Assets</button>
          <button class="icon-btn" onclick="openProjectModal('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn danger" onclick="deleteProject('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openProjectModal(id) {
  const form = document.getElementById('project-form');
  form.reset();
  document.getElementById('project-modal-title').textContent = id ? 'Edit Project' : 'Add Project';
  if (id) {
    const item = PROJECTS_ITEMS.find(i => i.id === id);
    if (item) {
      Object.keys(item).forEach(key => {
        if (key === 'tools') {
          form.elements.tools.value = Array.isArray(item.tools) ? item.tools.join(', ') : '';
        } else if (key === 'featured') {
          form.elements.featured.checked = !!item.featured;
        } else if (form.elements[key]) {
          form.elements[key].value = item[key] ?? '';
        }
      });
    }
  }
  openModal('project-modal');
}

async function deleteProject(id) {
  if (!confirm('Delete this project? This will remove all its assets too.')) return;
  try {
    await API.remove('projects', id);
    await loadProjectsSection();
  } catch (e) { console.error(e); alert('Failed to delete.'); }
}

onReady(() => {
  document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const id = fd.get('id');
    const payload = {
      title: fd.get('title'),
      category: fd.get('category'),
      client: fd.get('client'),
      year: fd.get('year'),
      location: fd.get('location'),
      status: fd.get('status'),
      description: fd.get('description'),
      cover_image: fd.get('cover_image'),
      order_index: Number(fd.get('order_index')) || 0,
      featured: form.elements.featured.checked,
      tools: (fd.get('tools') || '').split(',').map(t => t.trim()).filter(Boolean)
    };
    try {
      if (id) {
        await API.update('projects', id, payload);
      } else {
        payload.gallery_json = '[]';
        await API.create('projects', payload);
      }
      closeModal('project-modal');
      await loadProjectsSection();
    } catch (err) { console.error(err); alert('Failed to save project.'); }
  });
});

/* ---------------- PROJECT ASSETS (gallery) ---------------- */
function openAssetsModal(projectId) {
  const project = PROJECTS_ITEMS.find(p => p.id === projectId);
  if (!project) return;
  CURRENT_ASSET_PROJECT_ID = projectId;
  CURRENT_ASSET_GALLERY = safeParseJSON(project.gallery_json, []);
  if (!Array.isArray(CURRENT_ASSET_GALLERY)) CURRENT_ASSET_GALLERY = [];
  document.getElementById('assets-modal-subtitle').textContent = `Managing assets for: ${project.title}`;
  document.getElementById('asset-add-form').reset();
  renderAssetGalleryGrid();
  openModal('assets-modal');
}

function renderAssetGalleryGrid() {
  const holder = document.getElementById('asset-gallery-grid');
  if (!CURRENT_ASSET_GALLERY.length) {
    holder.innerHTML = `<p class="col-span-4 text-center py-8" style="color:var(--text-muted);">No assets added yet. Add 3D renders, BIM screenshots, clash detection views, building data images, etc. above.</p>`;
    return;
  }
  holder.innerHTML = CURRENT_ASSET_GALLERY.map((g, i) => `
    <div class="gallery-thumb">
      <img src="${escapeHTML(g.url)}" alt="${escapeHTML(g.caption || '')}">
      <div class="rm-btn" onclick="removeAsset(${i})"><i class="fa-solid fa-xmark"></i></div>
      ${g.category ? `<span class="absolute bottom-1 left-1 text-[9px] px-2 py-0.5 rounded-full" style="background:rgba(0,0,0,0.65);color:#fff;">${escapeHTML(g.category)}</span>` : ''}
    </div>
  `).join('');
}

async function persistAssetGallery() {
  try {
    await API.update('projects', CURRENT_ASSET_PROJECT_ID, { gallery_json: JSON.stringify(CURRENT_ASSET_GALLERY) });
    const proj = PROJECTS_ITEMS.find(p => p.id === CURRENT_ASSET_PROJECT_ID);
    if (proj) proj.gallery_json = JSON.stringify(CURRENT_ASSET_GALLERY);
    renderProjectsAdminGrid();
  } catch (e) {
    console.error(e);
    alert('Failed to save assets.');
  }
}

function removeAsset(index) {
  CURRENT_ASSET_GALLERY.splice(index, 1);
  renderAssetGalleryGrid();
  persistAssetGallery();
}

onReady(() => {
  document.getElementById('asset-add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const url = (fd.get('url') || '').trim();
    if (!url) return;
    CURRENT_ASSET_GALLERY.push({
      url,
      category: (fd.get('category') || '').trim() || 'General',
      caption: (fd.get('caption') || '').trim()
    });
    renderAssetGalleryGrid();
    await persistAssetGallery();
    form.reset();
  });
});

/* ---------------- MESSAGES ---------------- */
async function loadMessagesSection() {
  try {
    const res = await API.list('messages', { limit: 200, sort: '-created_at' });
    MESSAGES_ITEMS = res.data || [];
    renderMessagesTable();
    updateMessageBadge();
  } catch (e) { console.error(e); }
}

function updateMessageBadge() {
  const badge = document.getElementById('msg-badge');
  const newCount = MESSAGES_ITEMS.filter(m => m.status === 'New').length;
  if (newCount > 0) {
    badge.textContent = newCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function statusBadgeHTML(status) {
  const map = { New: 'badge-new', Read: 'badge-read', Replied: 'badge-replied' };
  return `<span class="badge ${map[status] || 'badge-new'}">${escapeHTML(status || 'New')}</span>`;
}

function renderMessagesTable() {
  const body = document.getElementById('messages-table-body');
  if (!MESSAGES_ITEMS.length) {
    body.innerHTML = `<tr><td colspan="6" class="text-center py-8" style="color:var(--text-muted);">No messages received yet.</td></tr>`;
    return;
  }
  body.innerHTML = MESSAGES_ITEMS.map(m => `
    <tr>
      <td><p class="font-medium">${escapeHTML(m.name)}</p><p class="text-xs" style="color:var(--text-muted);">${escapeHTML(m.email)}</p></td>
      <td>${escapeHTML(m.subject || '--')}</td>
      <td class="max-w-xs truncate" style="color:var(--text-muted);" title="${escapeHTML(m.message || '')}">${escapeHTML(m.message || '')}</td>
      <td>
        <select class="form-select text-xs py-1" style="width:auto;" onchange="updateMessageStatus('${m.id}', this.value)">
          <option value="New" ${m.status === 'New' ? 'selected' : ''}>New</option>
          <option value="Read" ${m.status === 'Read' ? 'selected' : ''}>Read</option>
          <option value="Replied" ${m.status === 'Replied' ? 'selected' : ''}>Replied</option>
        </select>
      </td>
      <td style="color:var(--text-muted);" class="text-xs">${m.created_at ? new Date(m.created_at).toLocaleDateString() : '--'}</td>
      <td><button class="icon-btn danger" onclick="deleteMessage('${m.id}')"><i class="fa-solid fa-trash"></i></button></td>
    </tr>
  `).join('');
}

async function updateMessageStatus(id, status) {
  try {
    await API.update('messages', id, { status });
    await loadMessagesSection();
  } catch (e) { console.error(e); }
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await API.remove('messages', id);
    await loadMessagesSection();
  } catch (e) { console.error(e); alert('Failed to delete.'); }
}

/* ---------------- OVERVIEW ---------------- */
function updateOverviewStats() {
  document.getElementById('ov-projects').textContent = PROJECTS_ITEMS.length;
  document.getElementById('ov-skills').textContent = SKILLS_ITEMS.length;
  document.getElementById('ov-resume').textContent = RESUME_ITEMS.length;
  document.getElementById('ov-messages').textContent = MESSAGES_ITEMS.length;
}

/* ---------------- INIT ---------------- */
onReady(async () => {
  setupNav();
  await Promise.all([
    loadProfileSection(),
    loadResumeSection(),
    loadSkillsSection(),
    loadProjectsSection(),
    loadMessagesSection()
  ]);
  updateOverviewStats();
});
