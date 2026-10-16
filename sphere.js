// A rotatable sphere of digits. Drag to rotate, scroll to zoom, hover over a dot for its digit.
//
// The dots follow a Fibonacci spiral, the usual way of spreading points evenly over a sphere: dot i (counting
// from the start digit) sits at height 1 - 2(i + 0.5)/n, from the top down, and each dot turns a further
// 137.5° (the golden angle, 360° / φ²) around the sphere. Dots that end up next to each other on the sphere
// are a Fibonacci number of decimal places apart (for example 34, 55 or 89), so each dot's neighbours are
// digits at a handful of fixed distances. analysis/scripts/distances/distances.py tests every such distance.

const numberNames = {
  pi: "π",
  sqrt2: "√2",
  e: "e",
  phi: "Golden ratio φ",
  oneOver9801: "1/9801",
  champernowne: "Champernowne",
  leibniz: "Leibniz, 500,000 terms",
  leibniz4: "Leibniz, 4 terms",
  leibniz10: "Leibniz, 10 terms",
  leibniz12: "Leibniz, 12 terms",
  leibniz15: "Leibniz, 15 terms",
  leibniz16: "Leibniz, 16 terms",
  leibniz24: "Leibniz, 24 terms",
  polygon6: "Polygon area, 6 sides",
  polygon12: "Polygon area, 12 sides",
  polygon96: "Polygon area, 96 sides",
  polygon6144: "Polygon area, 6,144 sides",
  polygon6291456: "Polygon area, 6,291,456 sides",
};
// Plain-English descriptions for the About panel
const numberDescriptions = {
  pi: "<strong>π</strong> (3.14159…)",
  sqrt2: "<strong>√2</strong> (1.41421…), the number that gives 2 when multiplied by itself",
  e: "<strong>e</strong> (2.71828…), the number behind compound interest and natural growth",
  phi: "the <strong>golden ratio φ</strong> (1.61803…)",
  oneOver9801: "<strong>1 ÷ 9801</strong> (0.00 01 02 03 … 97 99, repeating every 198 digits)",
  champernowne: "<strong>Champernowne's constant</strong> (0.123456789101112…, the counting numbers written in a row)",
  leibniz: "<strong>the Leibniz series stopped early</strong>: 4 × (1 − 1/3 + 1/5 − … − 1/999,999), the first 500,000 terms (3.14159065…, close to π but not equal to it)",
  leibniz4: "<strong>the Leibniz series stopped after 4 terms</strong>: 4 × (1 − 1/3 + 1/5 − … − 1/7), a fraction whose digits repeat every 6 digits",
  leibniz10: "<strong>the Leibniz series stopped after 10 terms</strong>: 4 × (1 − 1/3 + 1/5 − … − 1/19), a fraction whose digits repeat every 144 digits",
  leibniz12: "<strong>the Leibniz series stopped after 12 terms</strong>: 4 × (1 − 1/3 + 1/5 − … − 1/23), a fraction whose digits repeat every 1,584 digits",
  leibniz15: "<strong>the Leibniz series stopped after 15 terms</strong>: 4 × (1 − 1/3 + 1/5 − … + 1/29), a fraction whose digits repeat every 11,088 digits",
  leibniz16: "<strong>the Leibniz series stopped after 16 terms</strong>: 4 × (1 − 1/3 + 1/5 − … − 1/31), a fraction whose digits repeat every 55,440 digits",
  leibniz24: "<strong>the Leibniz series stopped after 24 terms</strong>: 4 × (1 − 1/3 + 1/5 − … − 1/47), a fraction whose digits repeat every 1,275,120 digits",
  polygon6: "<strong>the area of a regular hexagon</strong> inside a circle of radius 1: 3√3/2 = 2.5980762…, irrational",
  polygon12: "<strong>the area of a regular 12-sided polygon</strong> inside a circle of radius 1: exactly 3, so every digit after the 3 is 0",
  polygon96: "<strong>the area of a regular 96-sided polygon</strong> inside a circle of radius 1, where Archimedes stopped: 3.1393502…, irrational",
  polygon6144: "<strong>the area of a regular 6,144-sided polygon</strong> inside a circle of radius 1: 3.1415921…, irrational, sharing 6 decimals with π",
  polygon6291456: "<strong>the area of a regular 6,291,456-sided polygon</strong> inside a circle of radius 1: 3.1415926535892…, irrational, sharing 12 decimals with π",
};
const dotCounts = [1000, 2000, 5000, 10000, 20000];
const defaults = { number: "pi", count: 2000, start: 0, from: 0, to: 9 };
const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 137.5°, in radians

// ---- Controls ----
const controls = {
  number: document.getElementById("sphereNumber"),
  count: document.getElementById("sphereCount"),
  start: document.getElementById("sphereStart"),
  from: document.getElementById("sphereFrom"),
  to: document.getElementById("sphereTo"),
};
for (const [name, label] of Object.entries(numberNames)) controls.number.add(new Option(label, name));
for (const count of dotCounts) controls.count.add(new Option(count.toLocaleString(), count));
for (let digit = 0; digit <= 9; digit++) {
  controls.from.add(new Option(digit, digit));
  controls.to.add(new Option(digit, digit));
}

// The address remembers the settings, e.g. sphere.html#number=e&count=5000&start=0&from=9&to=9
const readSettings = () => {
  const saved = new URLSearchParams(location.hash.slice(1));
  const pick = (key, valid) => (saved.has(key) && valid(saved.get(key)) ? saved.get(key) : String(defaults[key]));
  return {
    number: pick("number", (value) => value in numberNames),
    count: Number(pick("count", (value) => dotCounts.includes(Number(value)))),
    start: Number(pick("start", (value) => /^\d+$/.test(value) && Number(value) <= 500000)),
    from: Number(pick("from", (value) => /^[0-9]$/.test(value))),
    to: Number(pick("to", (value) => /^[0-9]$/.test(value))),
  };
};
const writeSettings = () => {
  const start = Math.min(Math.max(Math.floor(Number(controls.start.value) || 0), 0), 500000);
  location.hash = new URLSearchParams({
    number: controls.number.value, count: controls.count.value, start,
    // "from" is never above "to": if they cross, swap them
    from: Math.min(controls.from.value, controls.to.value), to: Math.max(controls.from.value, controls.to.value),
  }).toString();
};
for (const control of Object.values(controls)) control.addEventListener("change", writeSettings);

// ---- Building the sphere ----
let cachedNumber = null;
let cachedDigits = "";
const digitsFor = (number, count) => {
  if (number !== cachedNumber || cachedDigits.length < count) {
    cachedNumber = number;
    cachedDigits = computeDigits[number](count);
  }
  return cachedDigits;
};

// Positions on a sphere of radius 1: x to the right, y up, z towards the viewer
const fibonacciSphere = (count) => {
  const points = new Float64Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count, radius = Math.sqrt(1 - y * y), turn = i * goldenAngle;
    points.set([radius * Math.cos(turn), y, radius * Math.sin(turn)], i * 3);
  }
  return points;
};

// The dots nearest to dot i on the sphere, as distances in decimal places (the gaps between their positions)
const neighbourGaps = (points, count, i, howMany = 4) => {
  const near = [];
  for (let j = 0; j < count; j++) {
    if (j === i) continue;
    const dx = points[j * 3] - points[i * 3], dy = points[j * 3 + 1] - points[i * 3 + 1], dz = points[j * 3 + 2] - points[i * 3 + 2];
    near.push([dx * dx + dy * dy + dz * dz, Math.abs(j - i)]);
  }
  return near.sort((a, b) => a[0] - b[0]).slice(0, howMany).map(([, gap]) => gap);
};

// The most common neighbour gaps, from a sample of dots away from the top and bottom
const commonGaps = (points, count) => {
  const tally = new Map();
  for (let k = 0; k < 200; k++) {
    const i = Math.floor(count * (0.15 + (0.7 * k) / 200));
    for (const gap of neighbourGaps(points, count, i)) tally.set(gap, (tally.get(gap) || 0) + 1);
  }
  return [...tally].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([gap]) => gap).sort((a, b) => a - b);
};

let sphere = null; // { count, start, cells, points, visible }
const build = () => {
  const settings = readSettings();
  if (settings.from > settings.to) [settings.from, settings.to] = [settings.to, settings.from];
  for (const key of Object.keys(controls)) controls[key].value = settings[key];

  const { number, count, start, from, to } = settings;
  const digits = digitsFor(number, start + count);
  const cells = new Int8Array(count);
  for (let i = 0; i < count; i++) cells[i] = digits.charCodeAt(start + i) - 48;
  const points = fibonacciSphere(count);

  const visible = [];
  for (let i = 0; i < count; i++) if (cells[i] >= from && cells[i] <= to) visible.push(i);
  sphere = { ...settings, cells, points, visible: Int32Array.from(visible) };

  const shown = from === 0 && to === 9 ? "every digit" : from === to ? `only the ${from}s` : `digits ${from} to ${to}`;
  document.getElementById("sphereSummary").textContent =
    `Decimal places ${start.toLocaleString()} to ${(start + count - 1).toLocaleString()} · showing ${shown} ` +
    `(${visible.length.toLocaleString()} dots)`;
  document.getElementById("sphereInfo").textContent = "Drag to rotate, scroll to zoom, hover over a dot for its digit";
  setAboutText(aboutSphere(settings, commonGaps(points, count)));
  needsDrawing = true;
};
window.addEventListener("hashchange", build);

// The About panel's text for the current settings
const aboutSphere = ({ number, count, start }, gaps) => `
  <h2>What you're looking at</h2>
  <p>${count.toLocaleString()} digits of ${numberDescriptions[number]}, from decimal place
  ${start.toLocaleString()} to ${(start + count - 1).toLocaleString()}, wound onto a ball. Each dot is one
  digit, darker for bigger digits (9 is full purple, 0 the lightest). The first digit is at the top; the
  digits then spiral down to the bottom, each one turned 137.5° further round than the last. That angle is the
  <strong>golden angle</strong>, which comes from the golden ratio. It spreads the dots evenly, as in a
  sunflower head.</p>
  <p>Use "Show digits" to pick which digits appear, for example 9 to 9 for only the 9s. Drag to turn the ball,
  scroll to zoom, and hover over a dot to see its decimal place, its digit, and how far away (in decimal
  places) its nearest neighbours on the ball are. Dots on the far side are paler.</p>
  <h2>Which digits end up next to each other</h2>
  <p>On this ball, a dot's nearest neighbours are always digits a <strong>Fibonacci number</strong> of places
  away. With ${count.toLocaleString()} dots, most neighbours are ${gaps.join(", ").replace(/, (\d+)$/, " or $1")}
  places apart (fewer near the top and bottom). So any pattern you could see here would be a pattern
  in digits that many places apart.</p>
  <p>We tested every distance from 1 to 100,000 places in the first million digits: for each one, how often
  the two digits are the same, add up to 9, or count up or down by one. For π, √2, e and the golden ratio,
  every distance gave about 10%, as random digits would; the biggest differences were no larger than in
  strings of random digits. 1/9801 and Champernowne's constant stand out at thousands of distances.</p>
  <p><strong>Beware of illusions:</strong> the dots seem to form spiral arms curving across the ball, like the
  seeds of a sunflower. Those arms come from the golden-angle layout and appear for any digits at all; they
  aren't in the digits.</p>
  ${aboutLinks}`;

// ---- Drawing ----
const canvas = document.getElementById("sphereCanvas");
const context = canvas.getContext("2d");
let yaw = 0.6;
let pitch = -0.35;
let zoom = 1;
let autoRotate = true;
let needsDrawing = true;
let projected = null; // screen positions from the last drawing, used for hovering

const resize = () => {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  needsDrawing = true;
};
window.addEventListener("resize", resize);
window.addEventListener("aboutpanel", () => { needsDrawing = true; });

// Turns a point on the sphere into a screen position, size and nearness (positive on the near side)
const distance = 4;
const makeProjection = () => {
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw), cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
  const focal = Math.min(window.innerWidth, window.innerHeight) * 1.3 * zoom;
  // While the About panel is open on the right, centre the sphere in the space to its left
  const panel = document.getElementById("aboutPanel");
  const freeWidth = panel.hidden ? window.innerWidth : panel.getBoundingClientRect().left;
  const centreX = freeWidth / 2, centreY = window.innerHeight / 2 + 20;
  const project = (x, y, z) => {
    const x1 = x * cosYaw + z * sinYaw, z1 = -x * sinYaw + z * cosYaw;   // turn around the vertical axis
    const y2 = y * cosPitch - z1 * sinPitch, z2 = y * sinPitch + z1 * cosPitch; // tilt
    const depth = distance - z2;
    return { x: centreX + (focal * x1) / depth, y: centreY - (focal * y2) / depth, scale: focal / depth, nearness: z2 };
  };
  return { project, centreX, centreY, outline: focal / Math.sqrt(distance * distance - 1) };
};

const draw = () => {
  const { count, cells, points, visible } = sphere;
  const { project, centreX, centreY, outline } = makeProjection();
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Outline of the ball, so its shape shows even when few digits are shown
  context.strokeStyle = "rgba(0, 0, 0, 0.25)";
  context.lineWidth = 1;
  context.beginPath();
  context.arc(centreX, centreY, outline, 0, 2 * Math.PI);
  context.stroke();

  const at = (i) => project(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
  const dots = Array.from(visible, (i) => ({ i, ...at(i) }));
  dots.sort((a, b) => a.nearness - b.nearness);
  const spacing = Math.sqrt((4 * Math.PI) / count); // typical gap between neighbouring dots, on a ball of radius 1
  // Furthest first, so nearer dots are drawn on top; dots on the far half are paler
  for (const dot of dots) {
    const facing = dot.nearness >= 0 ? 1 : 0.3;
    // Darker for bigger digits, as in the mosaic, but never fainter than 0.3 so 0s and 1s stay visible
    context.fillStyle = `rgba(128, 0, 128, ${((0.3 + 0.7 * (cells[dot.i] / 9)) * facing).toFixed(2)})`;
    context.beginPath();
    context.arc(dot.x, dot.y, dot.scale * spacing * 0.33, 0, 2 * Math.PI);
    context.fill();
  }
  projected = dots;
};

const frame = () => {
  if (autoRotate) { yaw += 0.003; needsDrawing = true; }
  if (needsDrawing && sphere) { draw(); needsDrawing = false; }
  requestAnimationFrame(frame);
};

// ---- Rotating, zooming and hovering ----
let dragging = null;
canvas.addEventListener("pointerdown", (event) => {
  dragging = { x: event.clientX, y: event.clientY };
  autoRotate = false;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (dragging) {
    yaw += (event.clientX - dragging.x) * 0.008;
    pitch = Math.max(-1.5, Math.min(1.5, pitch + (event.clientY - dragging.y) * 0.008));
    dragging = { x: event.clientX, y: event.clientY };
    needsDrawing = true;
    return;
  }
  showDigitUnder(event.clientX, event.clientY);
});
canvas.addEventListener("pointerup", () => { dragging = null; });
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoom = Math.max(0.3, Math.min(6, zoom * Math.exp(-event.deltaY * 0.001)));
  needsDrawing = true;
}, { passive: false });

// The nearest drawn dot under the pointer: its decimal place, digit, and how far away its neighbours are
const info = document.getElementById("sphereInfo");
const showDigitUnder = (pointerX, pointerY) => {
  if (!projected) return;
  const { count, start, cells, points } = sphere;
  const reach = Math.sqrt((4 * Math.PI) / count) * 0.5;
  let best = null;
  for (const point of projected) {
    const radius = Math.max(point.scale * reach, 4);
    if ((point.x - pointerX) ** 2 + (point.y - pointerY) ** 2 <= radius ** 2) best = point; // later = nearer
  }
  if (!best) return;
  // Each gap usually appears twice, for a neighbour that many places before and one that many after
  const gaps = [...new Set(neighbourGaps(points, count, best.i))].sort((a, b) => a - b);
  info.textContent = `Decimal place ${(start + best.i).toLocaleString()}: digit ${cells[best.i]} · ` +
    `nearest dots are ${gaps.join(", ").replace(/, (\d+)$/, " and $1")} places before or after it`;
};

resize();
setupAbout("piSphereAbout");
build();
requestAnimationFrame(frame);
