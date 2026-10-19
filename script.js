/* Vanilla JavaScript interactions for Hazmirryzan's portfolio */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const themeToggle = document.getElementById("themeToggle");
  const progressBar = document.getElementById("progressBar");
  const backTop = document.getElementById("backTop");
  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // 1. Mobile menu toggle.
  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  // 2. Close mobile menu after selecting a section.
  navLinks.forEach(link => link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }));

  // 3. Theme toggle with safe localStorage handling.
  function updateThemeLabel() {
    const light = root.classList.contains("light");
    themeToggle.textContent = light ? "☾" : "☼";
    themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    themeToggle.title = light ? "Switch to dark theme" : "Switch to light theme";
  }
  try {
    if (localStorage.getItem("hazmirryzan-theme") === "light") root.classList.add("light");
  } catch (error) {
    console.info("Theme preference storage is unavailable.");
  }
  updateThemeLabel();
  themeToggle.addEventListener("click", () => {
    root.classList.toggle("light");
    updateThemeLabel();
    try { localStorage.setItem("hazmirryzan-theme", root.classList.contains("light") ? "light" : "dark"); }
    catch (error) { showToast("Theme changed for this visit."); }
  });

  // 4. Scroll progress and 5. back-to-top visibility.
  function updateScrollEffects() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const percent = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    backTop.classList.toggle("visible", window.scrollY > 420);
  }
  window.addEventListener("scroll", updateScrollEffects, { passive: true });
  updateScrollEffects();
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // 6. Highlight navigation based on visible section.
  const pageSections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    pageSections.forEach(section => navObserver.observe(section));
  }

  // 7. Reveal project cards on scroll, with reduced-motion support.
  const revealCards = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealCards.forEach(card => revealObserver.observe(card));
  } else revealCards.forEach(card => card.classList.add("visible"));

  // 8. Filter project cards by category.
  const filterButtons = [...document.querySelectorAll(".filter")];
  const projectCards = [...document.querySelectorAll(".project-card")];
  filterButtons.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    projectCards.forEach(card => { card.hidden = filter !== "all" && card.dataset.category !== filter; });
  }));

  // 9. Accessible project detail dialog.
  const details = {
    team: { label:"01 / DEVELOPMENT", title:"Smart Student Team Collaboration Platform", text:"A coursework concept for supporting student group work through group management, tasks, comments, and deadline notifications.", points:["Explore user roles and group membership.","Organise tasks and deadlines.","Practise object-oriented structure and structured data."] },
    banjir: { label:"02 / GAME DESIGN", title:"Banjir! 72 Hours", text:"A 2D Android game concept about flood preparedness, time-sensitive choices, and emergency response.", points:["Develop the core gameplay idea.","Plan a clear 2D visual direction.","Document gameplay and player objectives."] },
    auction: { label:"03 / DATABASE", title:"Auction Management Database", text:"A relational data model for an auction workflow, including items, categories, bids, orders, payments, delivery, and ratings.", points:["Identify entities, primary keys, and relationships.","Create an ERD and relational schema.","Practise SQL and normalisation."] },
    concert: { label:"04 / UI/UX DESIGN", title:"Concert Ticket Booking App", text:"A user-interface concept focused on helping people browse concerts and understand the ticket booking flow.", points:["Consider different user needs.","Map a straightforward booking flow.","Create consistent wireframe components."] },
    graphics: { label:"05 / COMPUTER GRAPHICS", title:"Interactive Graphics Prototype", text:"A graphics programming exercise exploring an interactive scene and visual feedback using C++ and OpenGL.", points:["Practise rendering and object movement.","Experiment with visual effects.","Test interactions and debug behaviour."] }
  };
  const dialog = document.getElementById("projectDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogLabel = document.getElementById("dialogLabel");
  const dialogText = document.getElementById("dialogText");
  const dialogPoints = document.getElementById("dialogPoints");
  let lastProjectButton = null;
  document.querySelectorAll("[data-project]").forEach(button => button.addEventListener("click", () => {
    const info = details[button.dataset.project];
    if (!info) { showToast("Project details unavailable."); return; }
    lastProjectButton = button;
    dialogLabel.textContent = info.label;
    dialogTitle.textContent = info.title;
    dialogText.textContent = info.text;
    dialogPoints.replaceChildren(...info.points.map(text => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }));
    if (typeof dialog.showModal === "function") dialog.showModal();
    else showToast("Project details pop-up is not supported in this browser.");
  }));
  document.getElementById("dialogClose").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { if (lastProjectButton) lastProjectButton.focus(); });

  // 10. Copy the contact email.
  document.getElementById("copyEmail").addEventListener("click", async () => {
    const email = "hazmirryzan02@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      showToast("Email address copied.");
    } catch (error) {
      showToast(`Email: ${email}`);
    }
  });

  // 11. Validate contact form and prepare a mailto message.
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const fields = [document.getElementById("name"), document.getElementById("visitorEmail"), document.getElementById("message")];
  form.addEventListener("submit", event => {
    event.preventDefault();
    fields.forEach(field => field.classList.toggle("invalid", !field.checkValidity()));
    if (!form.checkValidity()) {
      formStatus.textContent = "Please check the highlighted fields and enter valid information.";
      formStatus.classList.add("error");
      form.reportValidity();
      return;
    }
    formStatus.classList.remove("error");
    formStatus.textContent = "Opening your email application…";
    const [name, email, message] = fields.map(field => field.value.trim());
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
    window.location.href = `mailto:hazmirryzan02@gmail.com?subject=${subject}&body=${body}`;
  });
  fields.forEach(field => field.addEventListener("input", () => {
    field.classList.remove("invalid");
    if (form.checkValidity()) {
      formStatus.textContent = "";
      formStatus.classList.remove("error");
    }
  }));

  // 12. Automatically update copyright year.
  document.getElementById("year").textContent = String(new Date().getFullYear());

  // 13. Typing animation for areas of interest.
  const rotatingText = document.getElementById("rotatingText");
  const phrases = ["Web Development", "Interactive Media", "UI / UX Design", "Game Development"];
  let phraseIndex = 0, charIndex = phrases[0].length, deleting = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    rotatingText.textContent = phrases[0];
  } else {
    function typeLoop() {
      const phrase = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      rotatingText.textContent = phrase.slice(0, Math.max(0, charIndex));
      let delay = deleting ? 42 : 75;
      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 250;
      } else if (!deleting && charIndex >= phrases[phraseIndex].length) {
        deleting = true;
        delay = 1200;
      }
      window.setTimeout(typeLoop, delay);
    }
    window.setTimeout(typeLoop, 1300);
  }
});
