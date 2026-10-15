// A rotatable 3D cube of digits. Drag to rotate, scroll to zoom, hover over a cube for its digit.
//
// Digits fill the cube the same way as in the analysis (analysis/scripts/3d/alignments.py):
// counting from the start digit, digit i goes to column i % side, row floor(i / side) % side and
// layer floor(i / side^2). So a step along a row, down a column or back a layer is a fixed jump in
// decimal places (1, side and side^2), and a straight line is a set of evenly spaced decimal places.

const numberNames = {
  pi: "π",
  sqrt2: "√2",
  e: "e",
  phi: "Golden ratio φ",
  oneOver9801: "1/9801",
  champernowne: "Champernowne",
};
const sides = [10, 15, 20, 30, 40, 50, 60];
const lineOptions = { 0: "Off", 4: "4 or more in a line", 5: "5 or more in a line", 6: "6 or more in a line" };
const defaults = { number: "pi", side: 20, start: 0, from: 9, lines: 5 };

// The 13 line directions in a cube (one of each pair of opposites), as [column, row, layer] steps
const directions = [];
for (const dz of [-1, 0, 1]) for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
  const first = [dz, dy, dx].find((step) => step !== 0);
  if (first === 1) directions.push([dx, dy, dz]);
}

// Every maximal straight line of one digit with at least minLength cubes, in all 13 directions.
// Maximal: the cube just before and just after the line is outside the cube or a different digit.
const findLines = (cells, side, minLength) => {
  const inside = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < side && y < side && z < side;
  const at = (x, y, z) => cells[(z * side + y) * side + x];
  const lines = [];
  for (const [dx, dy, dz] of directions) {
    for (let z = 0; z < side; z++) for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) {
      const digit = at(x, y, z);
      if (inside(x - dx, y - dy, z - dz) && at(x - dx, y - dy, z - dz) === digit) continue; // not the start
      let length = 1;
      while (inside(x + length * dx, y + length * dy, z + length * dz) && at(x + length * dx, y + length * dy, z + length * dz) === digit) length++;
      if (length >= minLength) lines.push({ x, y, z, dx, dy, dz, length, digit });
    }
  }
  return lines;
};

// How many such lines random digits would give on average (same formula as REPORT.md, section 9.2)
const expectedLines = (side, minLength) => {
  let total = 0;
  for (const direction of directions) {
    const reach = direction.reduce((product, step) => product * (side - (minLength - 1) * Math.abs(step)), 1);
    const interior = direction.reduce((product, step) => product * Math.max(side - minLength * Math.abs(step), 0), 1);
    if (reach > 0) total += 10 ** -(minLength - 1) * (reach - 0.1 * interior);
  }
  return total;
};

// ---- Controls ----
const controls = {
  number: document.getElementById("cubeNumber"),
  side: document.getElementById("cubeSide"),
  start: document.getElementById("cubeStart"),
  from: document.getElementById("cubeFrom"),
  lines: document.getElementById("cubeLines"),
};
for (const [name, label] of Object.entries(numberNames)) controls.number.add(new Option(label, name));
for (const side of sides) controls.side.add(new Option(`${side} × ${side} × ${side} (${(side ** 3).toLocaleString()} digits)`, side));
for (let digit = 0; digit <= 9; digit++) controls.from.add(new Option(digit, digit));
for (const [length, label] of Object.entries(lineOptions)) controls.lines.add(new Option(label, length));

// The address remembers the settings, e.g. cube.html#number=e&side=30&start=0&from=7&lines=5
const readSettings = () => {
  const saved = new URLSearchParams(location.hash.slice(1));
  const pick = (key, valid) => (saved.has(key) && valid(saved.get(key)) ? saved.get(key) : String(defaults[key]));
  return {
    number: pick("number", (value) => value in numberNames),
    side: Number(pick("side", (value) => sides.includes(Number(value)))),
    start: Number(pick("start", (value) => /^\d+$/.test(value) && Number(value) <= 500000)),
    from: Number(pick("from", (value) => /^[0-9]$/.test(value))),
    lines: Number(pick("lines", (value) => value in lineOptions)),
  };
};
const writeSettings = () => {
  const start = Math.min(Math.max(Math.floor(Number(controls.start.value) || 0), 0), 500000);
  location.hash = new URLSearchParams({
    number: controls.number.value, side: controls.side.value, start, from: controls.from.value, lines: controls.lines.value,
  }).toString();
};
for (const control of Object.values(controls)) control.addEventListener("change", writeSettings);

// ---- Building the cube ----
let cachedNumber = null;
let cachedDigits = "";
const digitsFor = (number, count) => {
  if (number !== cachedNumber || cachedDigits.length < count) {
    cachedNumber = number;
    cachedDigits = computeDigits[number](count);
  }
  return cachedDigits;
};

let cube = null; // { side, start, cells, lines, visible }
const build = () => {
  const settings = readSettings();
  controls.number.value = settings.number;
  controls.side.value = settings.side;
  controls.start.value = settings.start;
  controls.from.value = settings.from;
  controls.lines.value = settings.lines;

  const { number, side, start, from, lines: minLength } = settings;
  const count = side ** 3;
  const digits = digitsFor(number, start + count);
  const cells = new Int8Array(count);
  for (let i = 0; i < count; i++) cells[i] = digits.charCodeAt(start + i) - 48;

  const lines = minLength > 0 ? findLines(cells, side, minLength) : [];
  const onLine = new Uint8Array(count);
  for (const { x, y, z, dx, dy, dz, length } of lines) {
    for (let step = 0; step < length; step++) onLine[((z + step * dz) * side + (y + step * dy)) * side + (x + step * dx)] = 1;
  }

  // Cubes to draw: digits in the chosen range, plus every cube on a gold line
  const visible = [];
  for (let i = 0; i < count; i++) if (cells[i] >= from || onLine[i]) visible.push(i);

  cube = { side, start, cells, lines, visible: Int32Array.from(visible) };
  document.getElementById("cubeInfo").textContent = "Drag to rotate, scroll to zoom, hover over a cube for its digit";

  const summary = document.getElementById("cubeSummary");
  summary.textContent = minLength > 0
    ? `${lines.length} gold line${lines.length === 1 ? "" : "s"} of ${minLength} or more ` +
      `(random digits: about ${expectedLines(side, minLength).toFixed(1)}) · ` +
      `decimal places ${start.toLocaleString()} to ${(start + count - 1).toLocaleString()}`
    : `Decimal places ${start.toLocaleString()} to ${(start + count - 1).toLocaleString()}`;
  needsDrawing = true;
};
window.addEventListener("hashchange", build);

// ---- Drawing ----
const canvas = document.getElementById("cubeCanvas");
const context = canvas.getContext("2d");
let yaw = 0.6;
let pitch = -0.45;
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

// Turns a cube position (column, row, layer) into a screen position, size and depth
const makeProjection = () => {
  const { side } = cube;
  const middle = (side - 1) / 2;
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw), cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
  const distance = side * 2.4;
  const focal = Math.min(window.innerWidth, window.innerHeight) * 0.75 * zoom;
  const centreX = window.innerWidth / 2, centreY = window.innerHeight / 2 + 20;
  return (column, row, layer) => {
    // Columns go right, rows go down, layers go back
    const x = column - middle, y = middle - row, z = middle - layer;
    const x1 = x * cosYaw + z * sinYaw, z1 = -x * sinYaw + z * cosYaw;   // turn around the vertical axis
    const y2 = y * cosPitch - z1 * sinPitch, z2 = y * sinPitch + z1 * cosPitch; // tilt
    const depth = distance - z2;
    return { x: centreX + (focal * x1) / depth, y: centreY - (focal * y2) / depth, scale: focal / depth, nearness: z2 };
  };
};

const draw = () => {
  const { side, cells, lines, visible } = cube;
  const project = makeProjection();
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Outline of the cube, so its orientation is visible
  const corner = (a, b, c) => project(a ? side - 0.5 : -0.5, b ? side - 0.5 : -0.5, c ? side - 0.5 : -0.5);
  context.strokeStyle = "rgba(0, 0, 0, 0.25)";
  context.lineWidth = 1;
  context.beginPath();
  for (const [a, b, c, d, e, f] of [
    [0,0,0, 1,0,0], [0,1,0, 1,1,0], [0,0,1, 1,0,1], [0,1,1, 1,1,1],
    [0,0,0, 0,1,0], [1,0,0, 1,1,0], [0,0,1, 0,1,1], [1,0,1, 1,1,1],
    [0,0,0, 0,0,1], [1,0,0, 1,0,1], [0,1,0, 0,1,1], [1,1,0, 1,1,1],
  ]) {
    const from = corner(a, b, c), to = corner(d, e, f);
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
  }
  context.stroke();

  // Cubes, drawn smaller than their spacing so you can see into the cube. Same colours as the flat mosaic.
  const points = Array.from(visible, (i) => {
    const column = i % side, row = Math.floor(i / side) % side, layer = Math.floor(i / (side * side));
    return { i, ...project(column, row, layer) };
  });

  // Gold lines through every straight line of one digit, cut into one piece per step
  // so each piece can be drawn at its own depth
  const pieces = [];
  for (const { x, y, z, dx, dy, dz, length } of lines) {
    for (let step = 0; step < length - 1; step++) {
      const from = project(x + step * dx, y + step * dy, z + step * dz);
      const to = project(x + (step + 1) * dx, y + (step + 1) * dy, z + (step + 1) * dz);
      pieces.push({ from, to, nearness: (from.nearness + to.nearness) / 2 });
    }
  }

  // Furthest first, so nearer cubes and lines are drawn on top
  const items = [...points, ...pieces].sort((a, b) => a.nearness - b.nearness);
  context.strokeStyle = "gold";
  context.lineCap = "round";
  for (const item of items) {
    if (item.from) {
      context.lineWidth = Math.max(2, ((item.from.scale + item.to.scale) / 2) * 0.25);
      context.beginPath();
      context.moveTo(item.from.x, item.from.y);
      context.lineTo(item.to.x, item.to.y);
      context.stroke();
    } else {
      const size = item.scale * 0.5;
      context.fillStyle = `rgba(128, 0, 128, ${(cells[item.i] / 9).toFixed(2)})`;
      context.fillRect(item.x - size / 2, item.y - size / 2, size, size);
    }
  }
  points.sort((a, b) => a.nearness - b.nearness);
  projected = points;
};

const frame = () => {
  if (autoRotate) { yaw += 0.003; needsDrawing = true; }
  if (needsDrawing && cube) { draw(); needsDrawing = false; }
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

// The nearest drawn cube under the pointer: its decimal place, digit and position in the cube
const info = document.getElementById("cubeInfo");
const showDigitUnder = (pointerX, pointerY) => {
  if (!projected) return;
  let best = null;
  for (const point of projected) {
    const half = point.scale * 0.25;
    if (Math.abs(point.x - pointerX) <= half && Math.abs(point.y - pointerY) <= half) best = point; // later = nearer
  }
  if (!best) return;
  const { side, start, cells } = cube;
  const column = best.i % side, row = Math.floor(best.i / side) % side, layer = Math.floor(best.i / (side * side));
  info.textContent = `Decimal place ${(start + best.i).toLocaleString()}: digit ${cells[best.i]} ` +
    `(column ${column + 1}, row ${row + 1}, layer ${layer + 1})`;
};

resize();
build();
requestAnimationFrame(frame);
