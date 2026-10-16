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
const sides = [10, 15, 20, 30, 40, 50, 60];
const lineOptions = { 0: "Off", 4: "4 or more in a line", 5: "5 or more in a line", 6: "6 or more in a line" };
// Gold lines: the same digit all along. Green lines: digits counting up or down by one (e.g. 3 4 5 6 7).
const kindOptions = { same: "Same digit (gold)", counting: "Counting digits (green)", both: "Both" };
const lineColours = { 0: "gold", 1: "limegreen", "-1": "limegreen" };
// Rollover: whether counting carries on from 9 to 0 (going up) and from 0 to 9 (going down), as in 8 9 0 1 2
const rolloverOptions = { off: "stops at 9 and 0", on: "rolls over (8 9 0 1)" };
const defaults = { number: "pi", side: 20, start: 0, from: 9, to: 9, lines: 5, kind: "same", rollover: "off" };

// The 13 line directions in a cube (one of each pair of opposites), as [column, row, layer] steps
const directions = [];
for (const dz of [-1, 0, 1]) for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
  const first = [dz, dy, dx].find((step) => step !== 0);
  if (first === 1) directions.push([dx, dy, dz]);
}

// Every maximal straight line with at least minLength cubes, in all 13 directions, where each digit is
// `step` more than the one before: step 0 for the same digit, 1 for counting up, -1 for counting down.
// With rollover, counting wraps round (9 then 0 going up, 0 then 9 going down); without it, it stops at 9 and 0.
// Maximal: the cube just before and just after the line is outside the cube or doesn't continue the pattern.
const findLines = (cells, side, minLength, steps = [0], rollover = false) => {
  const inside = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < side && y < side && z < side;
  const at = (x, y, z) => cells[(z * side + y) * side + x];
  const follows = (before, after, step) => (rollover ? (after - before - step + 20) % 10 === 0 : after === before + step);
  const lines = [];
  for (const step of steps) for (const [dx, dy, dz] of directions) {
    for (let z = 0; z < side; z++) for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) {
      const digit = at(x, y, z);
      if (inside(x - dx, y - dy, z - dz) && follows(at(x - dx, y - dy, z - dz), digit, step)) continue; // not the start
      let length = 1;
      while (inside(x + length * dx, y + length * dy, z + length * dz) &&
             follows(at(x + (length - 1) * dx, y + (length - 1) * dy, z + (length - 1) * dz),
                     at(x + length * dx, y + length * dy, z + length * dz), step)) length++;
      if (length >= minLength) lines.push({ x, y, z, dx, dy, dz, length, digit, step });
    }
  }
  return lines;
};
const stepsFor = { same: [0], counting: [1, -1], both: [0, 1, -1] };

// How many such lines random digits would give on average (REPORT.md, sections 9.2 and 9.7).
// For counting lines without rollover the first digit must leave room to count (e.g. a rising line of 7
// starts at 0 to 3); with rollover any digit can start one.
const expectedLines = (side, minLength, kind = "same", rollover = false) => {
  let total = 0;
  for (const direction of directions) {
    const reach = direction.reduce((product, step) => product * (side - (minLength - 1) * Math.abs(step)), 1);
    const interior = direction.reduce((product, step) => product * Math.max(side - minLength * Math.abs(step), 0), 1);
    if (reach <= 0) continue;
    const boundary = reach - interior;
    if (kind === "same") total += 10 ** -(minLength - 1) * (reach - 0.1 * interior);
    else if (rollover) total += 2 * 10 ** -(minLength - 1) * (reach - 0.1 * interior);
    else total += 2 * 10 ** -(minLength - 1) * 0.1 * (boundary * (11 - minLength) + interior * (1 + 0.9 * (10 - minLength)));
  }
  return total;
};

// ---- Controls ----
const controls = {
  number: document.getElementById("cubeNumber"),
  side: document.getElementById("cubeSide"),
  start: document.getElementById("cubeStart"),
  from: document.getElementById("cubeFrom"),
  to: document.getElementById("cubeTo"),
  lines: document.getElementById("cubeLines"),
  kind: document.getElementById("cubeKind"),
  rollover: document.getElementById("cubeRollover"),
};
for (const [name, label] of Object.entries(numberNames)) controls.number.add(new Option(label, name));
for (const side of sides) controls.side.add(new Option(`${side} × ${side} × ${side} (${(side ** 3).toLocaleString()} digits)`, side));
for (let digit = 0; digit <= 9; digit++) {
  controls.from.add(new Option(digit, digit));
  controls.to.add(new Option(digit, digit));
}
for (const [length, label] of Object.entries(lineOptions)) controls.lines.add(new Option(label, length));
for (const [kind, label] of Object.entries(kindOptions)) controls.kind.add(new Option(label, kind));
for (const [rollover, label] of Object.entries(rolloverOptions)) controls.rollover.add(new Option(label, rollover));

// The address remembers the settings, e.g. cube.html#number=e&side=30&start=0&from=7&to=9&lines=5
const readSettings = () => {
  const saved = new URLSearchParams(location.hash.slice(1));
  const pick = (key, valid) => (saved.has(key) && valid(saved.get(key)) ? saved.get(key) : String(defaults[key]));
  return {
    number: pick("number", (value) => value in numberNames),
    side: Number(pick("side", (value) => sides.includes(Number(value)))),
    start: Number(pick("start", (value) => /^\d+$/.test(value) && Number(value) <= 500000)),
    from: Number(pick("from", (value) => /^[0-9]$/.test(value))),
    to: Number(pick("to", (value) => /^[0-9]$/.test(value))),
    lines: Number(pick("lines", (value) => value in lineOptions)),
    kind: pick("kind", (value) => value in kindOptions),
    rollover: pick("rollover", (value) => value in rolloverOptions),
  };
};
const writeSettings = () => {
  const start = Math.min(Math.max(Math.floor(Number(controls.start.value) || 0), 0), 500000);
  location.hash = new URLSearchParams({
    number: controls.number.value, side: controls.side.value, start, lines: controls.lines.value,
    // "from" is never above "to": if they cross, swap them
    from: Math.min(controls.from.value, controls.to.value), to: Math.max(controls.from.value, controls.to.value),
    kind: controls.kind.value, rollover: controls.rollover.value,
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
  if (settings.from > settings.to) [settings.from, settings.to] = [settings.to, settings.from];
  controls.from.value = settings.from;
  controls.to.value = settings.to;
  controls.lines.value = settings.lines;
  controls.kind.value = settings.kind;
  controls.rollover.value = settings.rollover;
  controls.rollover.disabled = settings.kind === "same"; // rollover only matters for counting lines

  const { number, side, start, from, to, lines: minLength, kind } = settings;
  const rollover = settings.rollover === "on";
  const count = side ** 3;
  const digits = digitsFor(number, start + count);
  const cells = new Int8Array(count);
  for (let i = 0; i < count; i++) cells[i] = digits.charCodeAt(start + i) - 48;

  const lines = minLength > 0 ? findLines(cells, side, minLength, stepsFor[kind], rollover) : [];
  const onLine = new Uint8Array(count);
  for (const { x, y, z, dx, dy, dz, length } of lines) {
    for (let step = 0; step < length; step++) onLine[((z + step * dz) * side + (y + step * dy)) * side + (x + step * dx)] = 1;
  }

  // Cubes to draw: digits in the chosen range, plus every cube on a line
  const visible = [];
  for (let i = 0; i < count; i++) if ((cells[i] >= from && cells[i] <= to) || onLine[i]) visible.push(i);

  cube = { side, start, cells, lines, visible: Int32Array.from(visible) };
  document.getElementById("cubeInfo").textContent = "Drag to rotate, scroll to zoom, hover over a cube for its digit";

  const sameCount = lines.filter((line) => line.step === 0).length;
  const countingCount = lines.length - sameCount;
  const tally = (n, colour, k) => `${n} ${colour} line${n === 1 ? "" : "s"} (random digits: about ${expectedLines(side, minLength, k, rollover).toFixed(1)})`;
  const parts = minLength === 0 ? [] : [
    ...(kind !== "counting" ? [tally(sameCount, "gold", "same")] : []),
    ...(kind !== "same" ? [tally(countingCount, "green", "counting")] : []),
  ];
  const range = `decimal places ${start.toLocaleString()} to ${(start + count - 1).toLocaleString()}`;
  document.getElementById("cubeSummary").textContent = parts.length
    ? `${parts.join(" · ")} of ${minLength} or more · ${range}` : range.charAt(0).toUpperCase() + range.slice(1);
  const digitTally = drawDigitChart(cells);
  setAboutText(aboutCube(settings, sameCount, countingCount, digitTally));
  needsDrawing = true;
};
window.addEventListener("hashchange", build);

// The About panel's text for the current settings
const aboutCube = ({ number, side, start, from, to, lines: minLength, kind, rollover }, sameCount, countingCount, digitTally) => {
  const count = side ** 3;
  const shown = from === 0 && to === 9 ? "every digit"
    : from === to ? `only the ${from}s`
    : to === from + 1 ? `only the ${from}s and ${to}s`
    : `only the digits ${from} to ${to}`;
  const plural = (n) => (n === 1 ? "" : "s");
  const sameText = `<p>There ${sameCount === 1 ? "is" : "are"} <strong>${sameCount} gold line${plural(sameCount)}</strong> of
    ${minLength} or more dots with the same digit. Random digits would give about
    ${expectedLines(side, minLength, "same").toFixed(1)}.</p>`;
  const countingText = `<p>There ${countingCount === 1 ? "is" : "are"} <strong>${countingCount} green line${plural(countingCount)}</strong>
    of ${minLength} or more dots whose digits count up or down by one (such as 3 4 5 6 7, or 8 7 6 5 4)${rollover === "on"
      ? ", carrying on from 9 to 0 and from 0 to 9 (such as 8 9 0 1 2)" : ", stopping at 9 and 0"}.
    Random digits would give about ${expectedLines(side, minLength, "counting", rollover === "on").toFixed(1)}.</p>`;
  const linesText = minLength === 0 ? "<p>Lines are switched off.</p>"
    : (kind !== "counting" ? sameText : "") + (kind !== "same" ? countingText : "");
  return `
    <h2>What you're looking at</h2>
    <p>The digits of a number stacked into a cube, like threading a long string of beads into a box: left to
    right along a row, rows from top to bottom, then layer after layer from front to back. Each dot is one
    digit, darker for bigger digits (9 is full purple, 0 the lightest). Use "Show digits" to pick which
    digits appear, for example 3 to 3 for only the 3s.</p>
    <p><strong>Gold lines</strong> join dots that have the same digit and sit in a straight line: along a row,
    down a column, from front to back, or along any diagonal (13 directions in all). <strong>Green lines</strong>
    (chosen under "Lines of") join dots in a straight line whose digits count up or down by one. The
    "Counting" menu chooses whether counting stops at 9 and 0, or rolls over (8 9 0 1).</p>
    <p>Drag to turn the cube, scroll to zoom, and hover over a dot to see its decimal place and digit.</p>
    <h2>This cube</h2>
    <p>${count.toLocaleString()} digits of ${numberDescriptions[number]}, from decimal place
    ${start.toLocaleString()} to ${(start + count - 1).toLocaleString()}, arranged ${side} × ${side} × ${side}.
    To keep it see-through, it shows ${shown}, plus every dot on a line.</p>
    ${linesText}
    <h2>Does every digit appear equally often?</h2>
    <p>The chart at the bottom left counts each digit 0 to 9 in this cube; the line marks a tenth of the
    digits, which is what each would get if they were perfectly even. Random digits are never perfectly
    even, so a standard test (the chi-squared test) asks how often random digits would be at least this
    uneven: <strong>${digitTally.chance}</strong>. ${digitTally.verdict}</p>
    <p>Over their first million digits, π, √2, e and the golden ratio each have every digit between 9.89% and
    10.05% of the time, as random digits would. Champernowne's constant has far too many 1s (18%), and 1/9801
    is the opposite: in blocks of 10,000 digits it is more even than random digits practically ever are.</p>
    <h2>Why lines always appear</h2>
    <p>A theorem from 1927 (van der Waerden's) guarantees that any long enough string of digits contains
    straight lines of the same digit, as long as enough directions are allowed. So finding lines proves
    nothing on its own: what matters is whether there are more than random digits would give. The same goes
    for counting lines. For π, √2, e and the golden ratio there aren't more than chance, for either kind. For 1/9801 and Champernowne's constant the count is often wildly
    different, because their digits follow a pattern.</p>
    <p><strong>Beware of illusions:</strong> when you look straight along the grid, neighbouring dots line up
    into rows. That's the viewing angle, not the digits. Only the gold and green lines are real.</p>
    ${aboutLinks}`;
};

// ---- How often each digit appears ----

// Chi-squared test with 9 degrees of freedom: how often random digits would be at least this uneven.
// regularizedUpperGamma(a, x) is Q(a, x); the chance is Q(4.5, chi-squared / 2).
const logGamma = (z) => {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, tmp = x + 5.5, series = 1.000000000190015;
  tmp -= (x + 0.5) * Math.log(tmp);
  for (const coefficient of c) series += coefficient / ++y;
  return -tmp + Math.log((2.5066282746310005 * series) / x);
};
const regularizedUpperGamma = (a, x) => {
  if (x <= 0) return 1;
  if (x < a + 1) {
    let term = 1 / a, total = term, k = a;
    while (Math.abs(term) > Math.abs(total) * 1e-15) { k++; term *= x / k; total += term; }
    return 1 - total * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
};
const chanceOfSpread = (counts) => {
  const total = counts.reduce((a, b) => a + b, 0), expected = total / 10;
  const chiSquared = counts.reduce((sum, c) => sum + (c - expected) ** 2 / expected, 0);
  return { chiSquared, p: regularizedUpperGamma(4.5, chiSquared / 2) };
};

// Column chart of the ten digit counts, with a hairline at a tenth of the digits.
// One series, so no legend; the heading names it. Columns start at zero so ordinary differences look small.
const drawDigitChart = (cells) => {
  const counts = new Array(10).fill(0);
  for (const digit of cells) counts[digit]++;
  const total = cells.length, expected = total / 10;
  const { chiSquared, p } = chanceOfSpread(counts);

  const width = 280, height = 110, left = 8, baseline = 88, top = 8, slot = (width - 2 * left) / 10, bar = 16;
  const scale = (baseline - top) / Math.max(...counts, expected * 1.25);
  const y = (value) => baseline - value * scale;
  const columns = counts.map((count, digit) => {
    const x = left + digit * slot + (slot - bar) / 2, h = baseline - y(count), r = Math.min(4, h);
    // Rounded top (the data end), square at the baseline
    const shape = `M${x},${baseline} V${baseline - h + r} Q${x},${baseline - h} ${x + r},${baseline - h} ` +
      `H${x + bar - r} Q${x + bar},${baseline - h} ${x + bar},${baseline - h + r} V${baseline} Z`;
    const label = `Digit ${digit}: ${count.toLocaleString()} (${((100 * count) / total).toFixed(2)}%); a tenth would be ${expected.toLocaleString()}`;
    return `<g class="digitColumn"><title>${label}</title>
      <rect x="${left + digit * slot}" y="${top}" width="${slot}" height="${baseline - top + 18}" fill="transparent"></rect>
      <path d="${shape}" fill="rgb(128, 0, 128)"></path>
      <text x="${x + bar / 2}" y="${baseline + 14}" text-anchor="middle">${digit}</text></g>`;
  }).join("");
  const svg = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img"
      aria-label="Count of each digit 0 to 9 in this cube">
    <line x1="${left}" x2="${width - left}" y1="${baseline}" y2="${baseline}" class="axis"></line>
    ${columns}
    <line x1="${left}" x2="${width - left}" y1="${y(expected)}" y2="${y(expected)}" class="expected"></line>
  </svg>`;

  const chance = p >= 0.995 ? "more than 99% of the time" : p < 0.001 ? "less than 0.1% of the time"
    : `${(100 * p).toFixed(p < 0.1 ? 1 : 0)}% of the time`;
  const verdict = p < 0.001 ? "That's far too uneven to be chance."
    : p < 0.05 ? "That's more uneven than usual, though in many cubes a few will be by chance."
    : p > 0.99 ? "That's more even than random digits usually are."
    : "That's an ordinary spread for random digits.";
  document.getElementById("digitPanel").innerHTML = `
    <div class="digitTitle">Each digit in this cube <span>(line: a tenth of the digits)</span></div>
    ${svg}
    <div class="digitVerdict">Random digits are at least this uneven ${chance}. ${verdict}</div>
    <details><summary>Counts</summary><table>
      <tr><th>Digit</th>${counts.map((_, d) => `<td>${d}</td>`).join("")}</tr>
      <tr><th>Count</th>${counts.map((c) => `<td>${c.toLocaleString()}</td>`).join("")}</tr>
    </table></details>`;
  return { counts, chiSquared, p, chance, verdict };
};

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
window.addEventListener("aboutpanel", () => { needsDrawing = true; });

// Turns a cube position (column, row, layer) into a screen position, size and depth
const makeProjection = () => {
  const { side } = cube;
  const middle = (side - 1) / 2;
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw), cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
  const distance = side * 2.4;
  const focal = Math.min(window.innerWidth, window.innerHeight) * 0.75 * zoom;
  // While the About panel is open on the right, centre the cube in the space to its left
  const panel = document.getElementById("aboutPanel");
  const freeWidth = panel.hidden ? window.innerWidth : panel.getBoundingClientRect().left;
  const centreX = freeWidth / 2, centreY = window.innerHeight / 2 + 20;
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

  // Gold and green lines, cut into one piece per step
  // so each piece can be drawn at its own depth
  const pieces = [];
  for (const { x, y, z, dx, dy, dz, length, step } of lines) {
    for (let i = 0; i < length - 1; i++) {
      const from = project(x + i * dx, y + i * dy, z + i * dz);
      const to = project(x + (i + 1) * dx, y + (i + 1) * dy, z + (i + 1) * dz);
      pieces.push({ from, to, colour: lineColours[step], nearness: (from.nearness + to.nearness) / 2 });
    }
  }

  // Furthest first, so nearer cubes and lines are drawn on top
  const items = [...points, ...pieces].sort((a, b) => a.nearness - b.nearness);
  context.lineCap = "round";
  for (const item of items) {
    if (item.from) {
      context.strokeStyle = item.colour;
      context.lineWidth = Math.max(2, ((item.from.scale + item.to.scale) / 2) * 0.25);
      context.beginPath();
      context.moveTo(item.from.x, item.from.y);
      context.lineTo(item.to.x, item.to.y);
      context.stroke();
    } else {
      const size = item.scale * 0.5;
      // Darker for bigger digits, as in the mosaic, but never fainter than 0.3 so 0s and 1s stay visible
      context.fillStyle = `rgba(128, 0, 128, ${(0.3 + 0.7 * (cells[item.i] / 9)).toFixed(2)})`;
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
setupAbout("piCubeAbout");
build();
requestAnimationFrame(frame);
