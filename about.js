// The "About" panel shared by the mosaic (index.html) and the 3D cube (cube.html).
// It opens by itself on a first visit; after it has been closed, it stays closed until "About" is clicked.

let placeAbout = () => {}; // set by setupAbout; also run whenever the text changes

const setupAbout = (storageKey) => {
  const panel = document.getElementById("aboutPanel");
  const button = document.getElementById("aboutButton");
  // Sit below the page's menu if the two would overlap (e.g. the cube page's wide control bar)
  const menu = document.getElementById("viewMenu") || document.getElementById("cubeMenu");
  const place = () => {
    if (panel.hidden) return;
    panel.style.top = "12px";
    const menuBox = menu.getBoundingClientRect(), panelBox = panel.getBoundingClientRect();
    const overlaps = menuBox.left < panelBox.right && menuBox.bottom > panelBox.top;
    const top = overlaps ? menuBox.bottom + 12 : 12;
    panel.style.top = `${top}px`;
    panel.style.maxHeight = `${window.innerHeight - top - 70}px`;
  };
  window.addEventListener("resize", place);
  placeAbout = place;

  const show = (open) => {
    panel.hidden = !open;
    place();
    button.setAttribute("aria-expanded", String(open));
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
