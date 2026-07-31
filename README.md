# Mohit Soni — Architectural Visualization & BIM Portfolio

A multi-page portfolio website for **Mohit Soni**, an architectural visualization artist &
BIM (Building Information Modeling) coordination specialist. The site showcases 3D renders,
architectural visualizations, BIM coordination work, MEP/structural clash detection, and
building data — with a full **Admin Panel** to manage every piece of content without touching code.

---

## 🌐 Public Pages (Site Map)

| Page | Path | Description |
|---|---|---|
| Home | `index.html` | Hero, services, featured projects, skills preview, CTA |
| About | `about.html` | Bio, contact quick-facts, download resume button |
| Resume | `resume.html` | Education & experience timelines, certifications, full skills list, resume download |
| Projects | `projects.html` | Full project gallery with **category filter** + **search** |
| Project Detail | `project-detail.html?id=<project_id>` | Full case study: cover image, description, tools, **asset tabs by category** (3D Render / Interior / Exterior / BIM Model / Clash Detection / Building Data / Floor Plan / etc.), **lightbox** viewer with prev/next & keyboard navigation, prev/next project links |
| Contact | `contact.html` | Contact info + message form (writes to `messages` table) |

## 🔐 Admin Panel

| Page | Path | Description |
|---|---|---|
| Admin Login | `admin/login.html` | Email + password login gate |
| Admin Dashboard | `admin/dashboard.html` | Full content management (see below) |

### How to access the Admin Panel
1. Go to **`admin/login.html`** (there's also an "Admin" link in the site header on every page).
2. Log in with the credentials stored in the **Profile** table:
   - **Email:** `mohitsoni2241@gmail.com`
   - **Password:** `mohitsoni123@`
3. You will land on the **Dashboard** with sections: Overview, Profile, Resume, Skills, Projects, Messages.

### 🔧 Important — how the admin login actually works
- The admin email/password are **not hardcoded** in the page source. They are stored as fields
  (`admin_email`, `admin_password`) inside the **`profile`** table record, and the login page checks
  the entered credentials against that record via the Table API.
- **To change your admin email/password:** log in, go to **Profile** tab, scroll to
  "Admin Login Credentials", update the fields, click **Save Profile**. Next login will require the new credentials.
- A successful login stores a session flag in the browser's `sessionStorage` (per-browser-tab session,
  cleared on logout or when the browser tab session ends). No one else can access `admin/dashboard.html`
  without first passing the login check — the dashboard script immediately redirects to the login page
  if no valid session flag is present.
- ⚠️ Note on security model: this is a **static front-end site**. The login check happens in client-side
  JavaScript against data readable via the public Table API. This is a practical convenience gate to keep
  casual visitors out of the admin UI, but it is **not equivalent to a server-side authentication system** —
  a technically sophisticated visitor could still read the API data directly. Do not store highly sensitive
  information in this password field.

### What you can manage from the Admin Panel
- **Profile** — name, title, bio, email, phone, location, profile photo URL, resume PDF URL, social links
  (LinkedIn/Instagram/Behance/Website), and the Admin login email/password. This feeds Home, About, Contact
  pages and the footer everywhere.
- **Resume** — add/edit/delete Education, Experience, Certification, and Award entries (title, organization,
  dates, description, sort order). Powers the `resume.html` timelines.
- **Skills** — add/edit/delete skills with category (Software/Design/Technical/Soft Skill) and a 0–100
  proficiency level shown as an animated bar. Powers Home preview + full Resume skills grid.
- **Projects** — the most important section:
  - Add/edit/delete projects: title, category, client, year, location, status, description, cover image,
    tools/software used (comma separated), Featured toggle (shows on homepage), sort order.
  - **Manage Assets** button on every project card opens an **asset manager** where you add unlimited images
    (3D renders, exterior renders, interior renders, BIM model screenshots, clash detection screenshots,
    building data / MEP images, floor plans, etc.) each with its own **category** and optional caption.
    These appear as filterable tabs + a lightbox gallery on the public project detail page.
  - Every asset is just an image URL — paste any hosted image link (from your own hosting, a CDN, cloud
    storage, etc.) and it appears instantly on the live project page.
- **Messages** — view all inquiries submitted through the public Contact form, mark as New/Read/Replied,
  or delete them.

---

## 🗄️ Data Model (Table API)

All content is stored via the built-in RESTful Table API (`tables/{table}`), which the site's
JavaScript (`js/api.js`) calls with `fetch()`.

### `profile` (single record)
`name, title, bio, email, phone, location, photo_url, resume_file_url, linkedin, instagram, behance, website, admin_email, admin_password`

### `resume_items`
`section (Education/Experience/Certification/Award), title, organization, start_date, end_date, description, order_index`

### `skills`
`name, category (Software/Design/Technical/Soft Skill), level (0-100), order_index`

### `projects`
`title, category, client, year, location, description, cover_image, gallery_json (JSON array of {url, category, caption}), tools (array), status, featured (bool), order_index`

### `messages`
`name, email, subject, message, status (New/Read/Replied)`

---

## 📁 File Structure
```
index.html                 Home page
about.html                 About page
resume.html                Resume page
projects.html              Projects gallery + filters
project-detail.html        Dynamic project case-study page
contact.html                Contact form
admin/
  ├── login.html            Admin login
  └── dashboard.html        Admin dashboard (all CRUD)
css/
  └── style.css             Global design system
js/
  ├── api.js                Table API helper + escapeHTML/safeParseJSON
  ├── site.js               Shared header/footer/reveal animations
  ├── home.js               Home page dynamic content
  ├── resume.js             Resume page dynamic content
  ├── projects.js           Projects listing filters/search
  ├── project-detail.js     Project detail + asset tabs + lightbox
  ├── contact.js            Contact form submission
  └── admin.js              Full admin dashboard logic (auth gate + CRUD)
```

---

## ✅ Currently completed features
- Fully responsive, dark-themed multi-page portfolio (not single-page).
- Dynamic Home, About, Resume, Projects, Project Detail, Contact pages — all driven by table data.
- Projects gallery with **category filters + live search**.
- Project detail page with **asset category tabs** and a full-screen **lightbox** (prev/next, keyboard
  arrows, captions) — supports unlimited images per project (3D renders, BIM screenshots, clash detection,
  building data, etc.).
- Contact form that saves messages into the `messages` table.
- Admin login gated by credentials stored in the `profile` table (editable from inside the admin panel).
- Full Admin Dashboard: Overview stats, Profile editor (incl. changing admin email/password), Resume CRUD,
  Skills CRUD (with live level slider), Projects CRUD, per-project **Asset Manager** (add/remove
  categorized images), Messages inbox with status updates.
- Sample data pre-loaded (profile, 5 resume items, 12 skills, 3 projects with real reference images) so the
  site is not empty on first load — everything is editable/deletable from the admin panel.

## 🚧 Not yet implemented
- Real file upload (drag-and-drop) for images — currently assets are added via **image URL** (paste a
  hosted link). This is a static-site constraint: there's no server to receive file uploads. Recommended
  workaround below.
- Server-side authentication / password hashing — current admin gate is a practical client-side check
  against table data (see security note above).
- Email notifications when a new Contact message arrives (would require a third-party email API).

## 🔜 Recommended next steps
1. **For your own images (3D renders, building renderings, clash coordination screenshots, building data):**
   upload them to any free image host / your own cloud storage / CDN that gives you a direct public image
   URL, then paste that URL into the Admin Panel → Projects → Manage Assets. This works for unlimited
   images per project.
2. Replace the placeholder profile photo and sample project images with your real work.
3. Update the Profile tab with your real phone number, socials, and (optionally) a hosted PDF resume link.
4. Change the Admin password in the Profile tab if you want a different one than the default.
5. When ready, publish from the **Publish tab** to make the site live on the internet.

---

## 🌍 Public URLs
This project is previewed inside the builder; once you click **Publish**, you'll get a live production URL
for the whole site. Key entry points once published:
- `/` or `/index.html` — Home
- `/about.html`, `/resume.html`, `/projects.html`, `/contact.html`
- `/project-detail.html?id=<project_id>` — dynamic, id comes from the Projects admin list
- `/admin/login.html` → `/admin/dashboard.html` — Admin Panel

## 🔑 Admin Credentials (default, editable anytime from the Profile tab)
- Email: `mohitsoni2241@gmail.com`
- Password: `mohitsoni123@`
#   m o h i t - s o n i - m e p - b i m - p o r t f o l i o  
 #   m o h i t - s o n i - m e p - b i m - p o r t f o l i o  
 