/* ========================================================
   Firestore data layer — matches this exact structure:

   profile/main            -> name, title, subtitle, about, email,
                               phone, location, profileImage, resume,
                               linkedin, github
   projects/{autoId}       -> title, description, category, location,
                               company, software[], discipline,
                               duration, status, year, coverImage,
                               gallery[]
   skills/{autoId}         -> name, category
   experience/{autoId}     -> company, designation, location,
                               startDate, endDate, status, description, logo
   education/{autoId}      -> degree, college, location, startDate,
                               endDate, status
   services/{autoId}       -> title, description
   contactMessages/{autoId}-> written by the contact form only

   Jab bhi in collections me koi naya document add hoga (chahe
   Firebase Console se ho, chahe kisi aur tarah), site apne aap
   nayi cards dikha degi — koi code change ki zaroorat nahi.
   ======================================================== */
const API = {
  async getProfile() {
    try {
      const doc = await FB.db.collection('profile').doc('main').get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) { console.error(e); return null; }
  },

  async getProjects() {
    try {
      const snap = await FB.db.collection('projects').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error(e); return []; }
  },

  async getProject(id) {
    try {
      const doc = await FB.db.collection('projects').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) { console.error(e); return null; }
  },

  async getSkills() {
    try {
      const snap = await FB.db.collection('skills').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error(e); return []; }
  },

  async getExperience() {
    try {
      const snap = await FB.db.collection('experience').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error(e); return []; }
  },

  async getEducation() {
    try {
      const snap = await FB.db.collection('education').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error(e); return []; }
  },

  async getServices() {
    try {
      const snap = await FB.db.collection('services').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error(e); return []; }
  },

  // Contact form -> writes a new document into contactMessages automatically
  async submitContactMessage(data) {
    await FB.db.collection('contactMessages').add({ ...data, created_at: Date.now() });
  }
};

// Small helper to escape HTML when injecting data into markup
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Some fields (like "software") may come in as a real array (recommended)
// or as a comma-separated string if entered by hand in Firebase Console —
// this normalizes either into a clean array.
function toArray(val) {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}
