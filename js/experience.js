/* ========================================================
   Dedicated Experience page — reads the "experience" collection
   in Firestore. Add/edit/delete a document there and this page
   updates automatically, no code changes needed.
   ======================================================== */
function fmtDate(d) {
  return d ? escapeHTML(d) : '';
}

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  const isCurrent = s === 'current';
  const bg = isCurrent ? 'rgba(74,222,128,0.14)' : 'rgba(212,169,74,0.14)';
  const color = isCurrent ? '#4ade80' : 'var(--accent)';
  return `<span class="text-xs font-semibold px-3 py-1 rounded-full" style="background:${bg};color:${color};">${escapeHTML(status || '')}</span>`;
}

function experienceCardHTML(item) {
  const dates = `${fmtDate(item.startDate)}${item.endDate ? ' — ' + fmtDate(item.endDate) : ' — Present'}`;
  const logo = item.logo
    ? `<img src="${escapeHTML(item.logo)}" alt="${escapeHTML(item.company || '')} logo" class="w-14 h-14 rounded-xl object-cover flex-shrink-0" style="background:rgba(255,255,255,0.06);">`
    : `<div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(212,169,74,0.14);"><i class="fa-solid fa-building text-accent text-xl"></i></div>`;

  return `
    <div class="card p-7 reveal">
      <div class="flex items-start gap-5">
        ${logo}
        <div class="flex-1">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-1">
            <h3 class="font-semibold text-xl">${escapeHTML(item.designation || '')}</h3>
            ${item.status ? statusBadge(item.status) : ''}
          </div>
          <p class="text-sm text-accent font-medium mb-1">${escapeHTML(item.company || '')}${item.location ? ' · ' + escapeHTML(item.location) : ''}</p>
          <p class="text-xs uppercase tracking-wide mb-3" style="color:var(--text-muted);">${dates}</p>
          <p class="text-sm leading-6" style="color:var(--text-muted);">${escapeHTML(item.description || '')}</p>
        </div>
      </div>
    </div>
  `;
}

// Sort newest-first when a start date is set (falls back to
// original order for entries without a comparable date)
function sortByStartDateDesc(list) {
  return [...list].sort((a, b) => {
    const da = Date.parse(a.startDate || '');
    const db = Date.parse(b.startDate || '');
    if (isNaN(da) && isNaN(db)) return 0;
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return db - da;
  });
}

async function loadExperiencePage() {
  const holder = document.getElementById('experience-list');
  try {
    const exp = await API.getExperience();
    if (!exp.length) {
      holder.innerHTML = `<p class="text-sm text-center" style="color:var(--text-muted);">No experience entries yet. Add documents to the "experience" collection in Firestore.</p>`;
      return;
    }
    const sorted = sortByStartDateDesc(exp);
    holder.innerHTML = sorted.map(experienceCardHTML).join('');
    setupRevealAnimations();
  } catch (e) {
    console.error(e);
    holder.innerHTML = `<p class="text-sm text-center" style="color:var(--text-muted);">Unable to load experience right now.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadExperiencePage);
