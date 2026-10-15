// The "About" panel shared by the mosaic (index.html), the 3D cube (cube.html) and the sphere (sphere.html).
// It sits on the right, just below the page's menu.
// It opens by itself on a first visit; after it has been closed, it stays closed until "About" is clicked.

let placeAbout = () => {}; // set by setupAbout; also run whenever the text changes

const setupAbout = (storageKey) => {
  const panel = document.getElementById("aboutPanel");
  const button = document.getElementById("aboutButton");
  const menu = document.getElementById("viewMenu") || document.getElementById("cubeMenu") || document.getElementById("sphereMenu");
  const place = () => {
    if (panel.hidden) return;
    const top = menu.getBoundingClientRect().bottom + 12;
    panel.style.top = `${top}px`;
    panel.style.maxHeight = `${window.innerHeight - top - 70}px`;
  };
  window.addEventListener("resize", place);
  placeAbout = place;

  const show = (open) => {
    panel.hidden = !open;
    place();
    button.setAttribute("aria-expanded", String(open));
    window.dispatchEvent(new Event("aboutpanel")); // lets the cube make room for the panel
    try { localStorage.setItem(storageKey, open ? "open" : "closed"); } catch { /* storage can be blocked */ }
  };
  button.addEventListener("click", () => show(panel.hidden));
  document.getElementById("aboutClose").addEventListener("click", () => show(false));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") show(false); });
  let saved = null;
  try { saved = localStorage.getItem(storageKey); } catch { /* storage can be blocked */ }
  show(saved !== "closed");
};

// Replaces the panel's text (the text is written in pi.js and cube.js, never taken from the address)
const setAboutText = (html) => {
  document.getElementById("aboutText").innerHTML = html;
  placeAbout(); // the menu may have changed height too
};

// Links to the full write-up, used at the end of both panels
const aboutLinks = `
  <p class="aboutLinks">
    <a href="https://github.com/agcolom/PiDay/blob/main/FINDINGS.md">All the results</a> ·
    <a href="https://github.com/agcolom/PiDay/blob/main/REPORT.md">How it was done</a> ·
    <a href="https://github.com/agcolom/PiDay">Code</a>
  </p>`;
