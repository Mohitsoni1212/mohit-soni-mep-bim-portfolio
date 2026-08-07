/* ========================================================
   Resume page dynamic content
   ======================================================== */

function fmtDate(d) {
  return d ? escapeHTML(d) : '';
}


/* =========================
   EXPERIENCE
========================= */

function experienceItemHTML(item) {
  const dates =
    `${fmtDate(item.startDate)}${
      item.endDate
        ? ' — ' + fmtDate(item.endDate)
        : (item.status
            ? ' — ' + escapeHTML(item.status)
            : ' — Present')
    }`;

  const logo = item.logo
    ? `<img
        src="${escapeHTML(item.logo)}"
        alt="${escapeHTML(item.company || '')} logo"
        class="w-9 h-9 rounded-md object-cover flex-shrink-0"
        style="background:rgba(255,255,255,0.06);"
      >`
    : '';

  return `
    <div class="timeline-item">

      <p class="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
        ${dates}
      </p>

      <div class="flex items-center gap-3 mb-1">
        ${logo}

        <div>
          <h3 class="font-semibold text-lg">
            ${escapeHTML(item.designation || '')}
          </h3>

          <p class="text-sm text-accent">
            ${escapeHTML(item.company || '')}
            ${item.location ? ' · ' + escapeHTML(item.location) : ''}
          </p>
        </div>
      </div>

      <p class="text-sm leading-6 mt-2" style="color:var(--text-muted);">
        ${escapeHTML(item.description || '')}
      </p>

    </div>
  `;
}


/* =========================
   EDUCATION
========================= */

function educationItemHTML(item) {
  const dates =
    `${fmtDate(item.startDate)}${
      item.endDate
        ? ' — ' + fmtDate(item.endDate)
        : (item.status
            ? ' — ' + escapeHTML(item.status)
            : '')
    }`;

  return `
    <div class="timeline-item">

      <p class="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
        ${dates}
      </p>

      <h3 class="font-semibold text-lg">
        ${escapeHTML(item.degree || '')}
      </h3>

      <p class="text-sm text-accent mb-2">
        ${escapeHTML(item.college || '')}
        ${item.location ? ' · ' + escapeHTML(item.location) : ''}
      </p>

    </div>
  `;
}


/* =========================
   SERVICES
========================= */

function serviceCardHTML(item) {
  return `
    <div class="card p-6">

      <div class="flex items-start gap-4">

        <div
          class="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style="background:rgba(212,169,74,0.14);"
        >
          <i class="fa-solid fa-toolbox text-accent"></i>
        </div>

        <div>

          <h3 class="font-semibold">
            ${escapeHTML(item.title || '')}
          </h3>

          <p
            class="text-sm mt-2"
            style="color:var(--text-muted);"
          >
            ${escapeHTML(item.description || '')}
          </p>

        </div>

      </div>

    </div>
  `;
}


/* =========================
   EDUCATION + EXPERIENCE
========================= */

async function loadEducationAndExperience() {

  const eduHolder =
    document.getElementById('education-timeline');

  const expHolder =
    document.getElementById('experience-timeline');

  try {

    const edu = await API.getEducation();

    eduHolder.innerHTML =
      edu.length
        ? edu.map(educationItemHTML).join('')
        : `<p class="text-sm" style="color:var(--text-muted);">
             No education entries yet.
           </p>`;

  } catch (e) {
    console.error('Education error:', e);
  }


  try {

    const exp = await API.getExperience();

    expHolder.innerHTML =
      exp.length
        ? exp.map(experienceItemHTML).join('')
        : `<p class="text-sm" style="color:var(--text-muted);">
             No experience entries yet.
           </p>`;

  } catch (e) {
    console.error('Experience error:', e);
  }

}


/* =========================
   SERVICES
========================= */

async function loadServicesSection() {

  const holder =
    document.getElementById('services-grid');

  try {

    const services = await API.getServices();

    holder.innerHTML =
      services.length
        ? services.map(serviceCardHTML).join('')
        : `<p class="text-sm col-span-2" style="color:var(--text-muted);">
             No services added yet.
           </p>`;

  } catch (e) {
    console.error('Services error:', e);
  }

}


/* ========================================================
   SKILLS + SOFTWARE WITH LOGOS
======================================================== */

async function loadSkillsFull() {

  const holder =
    document.getElementById('skills-full-grid');

  try {

    const skills = await API.getSkills();

    if (!skills.length) {

      holder.innerHTML = `
        <p class="text-sm" style="color:var(--text-muted);">
          No skills added yet.
        </p>
      `;

      return;
    }


    /* Categories */
    const categories = [
      ...new Set(
        skills.map(
          s => s.category || 'General'
        )
      )
    ];


    holder.innerHTML = categories.map(category => {

      const items = skills.filter(
        s => (s.category || 'General') === category
      );


      return `
        <div>

          <h3 class="font-semibold mb-5 text-accent">
            ${escapeHTML(category)}
          </h3>


          <div class="grid sm:grid-cols-2 gap-4">

            ${items.map(skill => {

              const name =
                escapeHTML(skill.name || 'Skill');

              const logo =
                skill.logo
                  ? `
                    <img
                      src="${escapeHTML(skill.logo)}"
                      alt="${name}"
                      class="w-16 h-16 object-contain"
                      loading="lazy"
                    >
                  `
                  : `
                    <i class="fa-solid fa-cube text-accent text-xl"></i>
                  `;


              return `
                <div
                  class="card p-4 flex items-center gap-4"
                  style="
                    transition:transform .25s ease,
                    border-color .25s ease;
                  "
                >

                  <!-- LOGO -->
                  <div
                    class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style="
                      background:rgba(255,255,255,0.06);
                      border:1px solid rgba(255,255,255,0.08);
                    "
                  >
                    ${logo}
                  </div>


                  <!-- NAME -->
                  <div>

                    <h4 class="font-semibold">
                      ${name}
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

            }).join('')}

          </div>

        </div>
      `;

    }).join('');


  } catch (e) {

    console.error('Skills error:', e);

    holder.innerHTML = `
      <p class="text-sm" style="color:var(--text-muted);">
        Unable to load skills.
      </p>
    `;

  }

}


/* ========================================================
   RESUME DOWNLOAD
======================================================== */

async function loadResumeDownload() {

  try {

    const profile = await API.getProfile();

    const btn =
      document.getElementById('resume-download-btn');


    if (profile && profile.resume) {

      btn.href = profile.resume;
      btn.target = '_blank';

      /*
       * Google Drive / external URLs ko browser
       * directly download nahi kar sakta.
       * Isliye link ko new tab me open karenge.
       */

      btn.onclick = function () {
        window.open(
          profile.resume,
          '_blank',
          'noopener,noreferrer'
        );
      };

    } else {

      btn.href = 'contact.html';

      btn.innerHTML =
        '<i class="fa-solid fa-envelope"></i> Request Resume';

    }

  } catch (e) {

    console.error('Resume error:', e);

  }

}


/* ========================================================
   PAGE LOAD
======================================================== */

document.addEventListener('DOMContentLoaded', () => {

  loadEducationAndExperience();

  loadServicesSection();

  loadSkillsFull();

  loadResumeDownload();

});