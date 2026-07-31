/* ========================================================
   Contact page: profile info + message form
   - Saves every message to Firestore -> contactMessages
   - Also emails you the message via EmailJS
   ======================================================== */

// ============================================
// EmailJS Configuration
// ============================================
const EMAILJS_PUBLIC_KEY = "-Cb2sysRnH_83gbqV";
const EMAILJS_SERVICE_ID = "service_x4serfk";
const EMAILJS_TEMPLATE_ID = "template_8gglu6p";

emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});

// Initialize EmailJS
if (window.emailjs) {
  emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
  });
}

async function loadContactProfile() {
  try {
    const profile = await API.getProfile();
    if (!profile) return;

    document.getElementById("contact-email").textContent =
      profile.email || "--";
    document.getElementById("contact-phone").textContent =
      profile.phone || "--";
    document.getElementById("contact-location").textContent =
      profile.location || "--";

    const socials = document.getElementById("contact-socials");
    const items = [];

    

    
  } catch (e) {
    console.error(e);
  }
  const socials = document.getElementById("contact-socials");

socials.innerHTML = `
<a href="https://www.linkedin.com/in/mohit-s-2422702a5"
   target="_blank"
   rel="noopener noreferrer"
   class="icon-btn"
   title="LinkedIn">
    <i class="fa-brands fa-linkedin-in"></i>
</a>

<a href="https://github.com/Mohitsoni1212"
   target="_blank"
   rel="noopener noreferrer"
   class="icon-btn"
   title="GitHub">
    <i class="fa-brands fa-github"></i>
</a>
`;

}


function setupContactForm() {
  const form = document.getElementById("contact-form");
  const successMsg = document.getElementById("contact-success");
  const errorMsg = document.getElementById("contact-error");
  const btn = document.getElementById("contact-submit-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    successMsg.classList.add("hidden");
    errorMsg.classList.add("hidden");

    btn.disabled = true;
    btn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      status: "New",
    };

    try {
      // Save in Firestore
      await API.submitContactMessage(payload);

      // Send Email
      if (window.emailjs) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            from_name: payload.name,
            from_email: payload.email,
            subject: payload.subject,
            message: payload.message,
            reply_to: payload.email,
          }
        );
      }

      successMsg.classList.remove("hidden");
      form.reset();
    } catch (err) {
      console.error(err);
      errorMsg.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.innerHTML =
        'Send Message <i class="fa-solid fa-paper-plane"></i>';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadContactProfile();
  setupContactForm();
});