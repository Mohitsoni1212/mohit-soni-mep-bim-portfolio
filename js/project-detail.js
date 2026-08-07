/* ========================================================
   Project Detail Page
   Firebase Firestore -> projects/{projectId}
   ======================================================== */

let CURRENT_PROJECT = null;
let ALL_PROJECTS_LIST = [];
let CURRENT_GALLERY = [];
let LIGHTBOX_INDEX = 0;


/* ========================================================
   GET PROJECT ID FROM URL
   Example:
   project-detail.html?id=project1
   ======================================================== */

function getProjectIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}


/* ========================================================
   PROJECT GALLERY
   Maximum 3 images
   ======================================================== */

function renderGallery() {

  const holder = document.getElementById("pd-gallery");
  const section = document.getElementById("project-images-section");

  if (!holder) return;

  const images = Array.isArray(CURRENT_GALLERY)
    ? CURRENT_GALLERY.slice(0, 3)
    : [];

  if (!images.length) {

    if (section) {
      section.classList.add("hidden");
    }

    holder.innerHTML = "";
    return;
  }

  if (section) {
    section.classList.remove("hidden");
  }

  holder.innerHTML = images.map((url, i) => `
    
    <div
      class="card overflow-hidden cursor-pointer group"
      data-index="${i}"
      onclick="openLightbox(${i})"
    >

      <div
        class="thumb-wrap"
        style="aspect-ratio:4/3;"
      >

        <img
          src="${escapeHTML(url)}"
          alt="Project Image ${i + 1}"
          loading="lazy"
          style="
            width:100%;
            height:100%;
            object-fit:cover;
            transition:transform .5s ease;
          "
          onerror="this.style.display='none';"
        >

      </div>

    </div>

  `).join("");
}


/* ========================================================
   LIGHTBOX
   ======================================================== */

function openLightbox(index) {

  LIGHTBOX_INDEX = index;

  showLightbox();
}


function showLightbox() {

  const lightbox = document.getElementById("lightbox");

  if (!lightbox || !CURRENT_GALLERY.length) {
    return;
  }

  const url = CURRENT_GALLERY[LIGHTBOX_INDEX];

  if (!url) return;

  const image = document.getElementById("lb-img");
  const caption = document.getElementById("lb-caption");

  if (image) {
    image.src = url;
  }

  if (caption) {
    caption.textContent =
      CURRENT_PROJECT?.title || "";
  }

  lightbox.classList.add("open");
}


function closeLightbox() {

  const lightbox =
    document.getElementById("lightbox");

  if (lightbox) {
    lightbox.classList.remove("open");
  }
}


function lightboxNav(direction) {

  if (!CURRENT_GALLERY.length) {
    return;
  }

  LIGHTBOX_INDEX =
    (
      LIGHTBOX_INDEX +
      direction +
      CURRENT_GALLERY.length
    ) %
    CURRENT_GALLERY.length;

  showLightbox();
}


/* ========================================================
   PROJECT DETAIL
   ======================================================== */

function renderProjectDetail(p) {

  console.log("PROJECT DATA:", p);

  /* -------------------------
     CATEGORY
     ------------------------- */

  const categoryEl =
    document.getElementById("pd-category");

  if (categoryEl) {
    categoryEl.textContent =
      p.category || "Project";
  }


  /* -------------------------
     TITLE
     ------------------------- */

  const titleEl =
    document.getElementById("pd-title");

  if (titleEl) {
    titleEl.textContent =
      p.title || "Untitled Project";
  }


  /* -------------------------
     LOCATION
     Firebase:
     location
     ------------------------- */

  const locationEl =
    document.getElementById("pd-location");

  if (locationEl) {

    locationEl.textContent =
      p.location || "--";

  }


  /* -------------------------
     STATUS
     Firebase may have:
     status
     OR
     Status
     ------------------------- */

  const statusEl =
    document.getElementById("pd-status");

  if (statusEl) {

    statusEl.textContent =
      p.status ||
      p.Status ||
      "--";

  }


  /* -------------------------
     YEAR
     ------------------------- */

  const yearEl =
    document.getElementById("pd-year");

  if (yearEl) {

    if (p.year) {

      yearEl.textContent =
        p.year;

      if (yearEl.parentElement) {
        yearEl.parentElement.classList.remove("hidden");
      }

    } else {

      if (yearEl.parentElement) {
        yearEl.parentElement.classList.add("hidden");
      }

    }

  }


  /* -------------------------
     COVER IMAGE
     ------------------------- */

  const coverEl =
    document.getElementById("pd-cover");

  if (coverEl) {

    coverEl.src =
      p.coverImage ||
      "https://via.placeholder.com/1200x700?text=No+Image";

    coverEl.alt =
      p.title || "Project";

  }


  /* -------------------------
     DESCRIPTION
     ------------------------- */

  const descriptionEl =
    document.getElementById("pd-description");

  if (descriptionEl) {

    descriptionEl.textContent =
      p.description ||
      "No description provided yet.";

  }


  /* -------------------------
     SOFTWARE + DISCIPLINE
     ------------------------- */

  const software =
    toArray(p.software);

  const tags = [
    ...software
  ];

  if (p.discipline) {

    tags.push(
      p.discipline
    );

  }


  const toolsEl =
    document.getElementById("pd-tools");

  if (toolsEl) {

    toolsEl.innerHTML =
      tags.length

        ? tags.map(tag => `
            
            <span class="category-chip">
              ${escapeHTML(tag)}
            </span>

          `).join("")

        : `
          
          <p
            class="text-sm"
            style="color:var(--text-muted);"
          >
            No software/discipline listed.
          </p>

        `;

  }


  /* ========================================================
     PROJECT IMAGES
     ======================================================== */

  CURRENT_GALLERY =
    toArray(p.gallery).slice(0, 3);

  renderGallery();


  /* ========================================================
     CLASH IMAGES
     ======================================================== */

  renderClashImages(
    toArray(p.clashImages)
  );


  /* ========================================================
     PDF SHEETS
     ======================================================== */

  renderSheets(
    toArray(p.sheets)
  );


  /* ========================================================
     PAGE TITLE
     ======================================================== */

  document.title =
    `${p.title || "Project"} | Mohit Soni`;


  /* ========================================================
     SHOW PROJECT
     ======================================================== */

  const loading =
    document.getElementById("project-loading");

  const content =
    document.getElementById("project-content");

  if (loading) {
    loading.classList.add("hidden");
  }

  if (content) {
    content.classList.remove("hidden");
  }

}


/* ========================================================
   CLASH DETECTION IMAGES
   ======================================================== */

function renderClashImages(images = []) {

  const section =
    document.getElementById("clash-section");

  const container =
    document.getElementById("pd-clashes");

  if (!section || !container) {
    return;
  }


  if (!Array.isArray(images) || !images.length) {

    section.classList.add("hidden");

    container.innerHTML = "";

    return;
  }


  section.classList.remove("hidden");


  container.innerHTML =
    images.map((url, index) => `

      <div
        class="card overflow-hidden"
      >

        <img
          src="${escapeHTML(url)}"
          alt="Clash Detection ${index + 1}"
          loading="lazy"
          class="w-full h-72 object-cover"
        >

      </div>

    `).join("");

}


/* ========================================================
   PDF SHEETS
   Small preview card
   Click -> Full PDF
   ======================================================== */

function renderSheets(sheets = []) {

  const section =
    document.getElementById("sheets-section");

  const container =
    document.getElementById("pd-sheets");


  if (!section || !container) {
    return;
  }


  /* No PDF sheets */

  if (
    !Array.isArray(sheets) ||
    sheets.length === 0
  ) {

    section.classList.add("hidden");

    container.innerHTML = "";

    return;
  }


  section.classList.remove("hidden");


  container.innerHTML =
    sheets.map((url, index) => {

      /*
        Cloudinary PDF -> first page preview
      */

      const previewUrl =
        url
          .replace(
            "/image/upload/",
            "/image/upload/pg_1,w_500,c_fit/"
          )
          .replace(
            ".pdf",
            ".jpg"
          );


      return `

        <div
          class="card overflow-hidden"
        >

          <!-- PDF PREVIEW -->

          <a
            href="${escapeHTML(url)}"
            target="_blank"
            rel="noopener noreferrer"
            style="display:block;"
          >

            <div
              style="
                height:180px;
                background:#fff;
                display:flex;
                align-items:center;
                justify-content:center;
                overflow:hidden;
              "
            >

              <img
                src="${escapeHTML(previewUrl)}"
                alt="MEP Sheet ${index + 1}"
                loading="lazy"
                style="
                  width:100%;
                  height:100%;
                  object-fit:contain;
                  cursor:pointer;
                "
              >

            </div>

          </a>


          <!-- PDF INFO -->

          <div
            class="p-4 flex items-center justify-between gap-3"
          >

            <div class="min-w-0">

              <p
                class="font-semibold truncate"
              >
                MEP Drawing / Sheet
                ${String(index + 1).padStart(2, "0")}
              </p>

              <p
                class="text-xs mt-1"
                style="color:var(--text-muted);"
              >
                Drawing / Shop Drawing
              </p>

            </div>


            <a
              href="${escapeHTML(url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-outline text-sm shrink-0"
            >

              <i class="fa-solid fa-file-pdf"></i>

              View

            </a>

          </div>

        </div>

      `;

    }).join("");

}


/* ========================================================
   PREVIOUS / NEXT PROJECT
   ======================================================== */

function setupPrevNext() {

  if (!CURRENT_PROJECT) {
    return;
  }


  const index =
    ALL_PROJECTS_LIST.findIndex(
      project =>
        project.id === CURRENT_PROJECT.id
    );


  const previous =
    document.getElementById("pd-prev");

  const next =
    document.getElementById("pd-next");


  if (!previous || !next) {
    return;
  }


  /* PREVIOUS */

  if (index > 0) {

    previous.href =
      `project-detail.html?id=${
        encodeURIComponent(
          ALL_PROJECTS_LIST[index - 1].id
        )
      }`;

    previous.classList.remove(
      "opacity-40",
      "pointer-events-none"
    );

  } else {

    previous.classList.add(
      "opacity-40",
      "pointer-events-none"
    );

  }


  /* NEXT */

  if (
    index !== -1 &&
    index <
      ALL_PROJECTS_LIST.length - 1
  ) {

    next.href =
      `project-detail.html?id=${
        encodeURIComponent(
          ALL_PROJECTS_LIST[index + 1].id
        )
      }`;

    next.classList.remove(
      "opacity-40",
      "pointer-events-none"
    );

  } else {

    next.classList.add(
      "opacity-40",
      "pointer-events-none"
    );

  }

}


/* ========================================================
   LOAD PROJECT
   ======================================================== */

async function loadProjectDetail() {

  const id =
    getProjectIdFromURL();


  /* No ID */

  if (!id) {

    document
      .getElementById("project-loading")
      ?.classList.add("hidden");

    document
      .getElementById("project-not-found")
      ?.classList.remove("hidden");

    return;
  }


  try {

    console.log(
      "Loading project ID:",
      id
    );


    /* Get all projects */

    ALL_PROJECTS_LIST =
      await API.getProjects();


    console.log(
      "Projects from Firebase:",
      ALL_PROJECTS_LIST
    );


    /* Find selected project */

    const project =
      ALL_PROJECTS_LIST.find(
        p => p.id === id
      );


    if (!project) {

      console.error(
        "Project not found:",
        id
      );

      document
        .getElementById("project-loading")
        ?.classList.add("hidden");

      document
        .getElementById("project-not-found")
        ?.classList.remove("hidden");

      return;
    }


    /* Save current project */

    CURRENT_PROJECT =
      project;


    /* Render */

    renderProjectDetail(
      project
    );


    /* Previous / Next */

    setupPrevNext();


  } catch (error) {

    console.error(
      "PROJECT LOAD ERROR:",
      error
    );


    document
      .getElementById("project-loading")
      ?.classList.add("hidden");

    document
      .getElementById("project-not-found")
      ?.classList.remove("hidden");

  }

}


/* ========================================================
   PAGE EVENTS
   ======================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProjectDetail();


    /* Lightbox close */

    const closeBtn =
      document.getElementById("lb-close");

    if (closeBtn) {

      closeBtn.addEventListener(
        "click",
        closeLightbox
      );

    }


    /* Lightbox previous */

    const previousBtn =
      document.getElementById("lb-prev");

    if (previousBtn) {

      previousBtn.addEventListener(
        "click",
        () => lightboxNav(-1)
      );

    }


    /* Lightbox next */

    const nextBtn =
      document.getElementById("lb-next");

    if (nextBtn) {

      nextBtn.addEventListener(
        "click",
        () => lightboxNav(1)
      );

    }


    /* Click outside lightbox */

    const lightbox =
      document.getElementById("lightbox");

    if (lightbox) {

      lightbox.addEventListener(
        "click",
        event => {

          if (
            event.target.id === "lightbox"
          ) {

            closeLightbox();

          }

        }
      );

    }


    /* Keyboard */

    document.addEventListener(
      "keydown",
      event => {

        if (
          !lightbox ||
          !lightbox.classList.contains("open")
        ) {
          return;
        }


        if (event.key === "Escape") {

          closeLightbox();

        }


        if (event.key === "ArrowLeft") {

          lightboxNav(-1);

        }


        if (event.key === "ArrowRight") {

          lightboxNav(1);

        }

      }
    );

  }
);