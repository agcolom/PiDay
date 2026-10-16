// Archimedes' polygons, drawn. A regular polygon inside a circle of radius 1 (area just under π) and,
// optionally, one outside it (area just over π), as Archimedes used to trap π between them.
//
// The inside polygon's corners are on the circle. The outside polygon's sides touch the circle halfway along
// the inside polygon's sides, so its corners are in the same directions, further out.
// Areas: inside (n/2) sin(2π/n), outside n tan(π/n). Both come from square roots only (digits.js), never from π.

const sideCounts = Array.from({ length: 21 }, (_, k) => 6 * 2 ** k); // 6, 12, 24, ..., 6,291,456
const defaults = { sides: 6, outside: true };
const shownDecimals = 30;
const svgNS = "http://www.w3.org/2000/svg";
const colours = {
  inside: "rgb(128, 0, 128)", // purple, as the mosaic
  insideFill: "rgba(128, 0, 128, 0.22)",
  gap: "rgba(255, 196, 0, 0.75)", // gold: the circle not covered by the inside polygon
  outside: "rgb(0, 128, 128)", // teal: the outside polygon
  outsideFill: "rgba(0, 128, 128, 0.18)",
  circle: "#222",
};

// ---- Exact areas, as digit strings ----
// The outside area n tan(π/n) by the same halving as computePolygonAreas in digits.js:
// with x = 2π/n, tan(x/2) = sin x / (1 + cos x).
const outsideArea = (count, sides) => {
  const guard = guardDigits + BigInt(String(sides).length);
  const scale = 10n ** (BigInt(count) + guard);
  let cos = scale / 2n, sin = squareRoot(3n * scale * scale) / 2n;
  for (let n = 6; n < sides; n *= 2) {
    const cosHalf = squareRoot((scale * (scale + cos)) / 2n);
    sin = (sin * scale) / (2n * cosHalf);
    cos = cosHalf;
  }
  return ((BigInt(sides) * sin * scale) / (scale + cos)).toString().slice(0, count);
};
const piDigits = computePiDigits(shownDecimals + 1);

// "3.14159…" with the decimals it shares with π in bold purple
const withSharedPart = (digits) => {
  let shared = 0;
  while (shared < digits.length && digits[shared] === piDigits[shared]) shared++;
  const text = `${digits[0]}.${digits.slice(1)}…`;
  const cut = shared === 0 ? 0 : shared + 1; // + 1 for the decimal point
  return { html: `<strong class="shared">${text.slice(0, cut)}</strong>${text.slice(cut)}`, decimals: Math.max(shared - 1, 0) };
};

// ---- Drawing helpers ----
const element = (name, attributes) => {
  const node = document.createElementNS(svgNS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
};
const pointsText = (points) => points.map(([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`).join(" ");

// Corners of a polygon with `sides` sides at distance `radius`, with one side flat across the top.
// SVG's y axis points down, so y is flipped.
const corners = (sides, radius) => Array.from({ length: sides }, (_, i) => {
  const angle = Math.PI / 2 + Math.PI / sides + (2 * Math.PI * i) / sides;
  return [radius * Math.cos(angle), -radius * Math.sin(angle)];
});

// The whole circle. Above about 1,500 sides the polygon is closer to the circle than a hundredth of a pixel,
// so it is drawn with 1,536 corners (the picture is the same).
const drawWhole = ({ sides, outside }) => {
  const svg = document.getElementById("polygonWhole");
  svg.replaceChildren();
  const drawnSides = Math.min(sides, 1536);
  const a = Math.PI / drawnSides;
  if (outside) {
    svg.append(element("polygon", { points: pointsText(corners(drawnSides, 1 / Math.cos(a))), fill: colours.outsideFill,
      stroke: colours.outside, "stroke-width": 0.006, "stroke-linejoin": "round" }));
  }
  svg.append(element("circle", { cx: 0, cy: 0, r: 1, fill: colours.gap, stroke: "none" }));
  const inner = corners(drawnSides, 1);
  svg.append(element("polygon", { points: pointsText(inner), fill: "white" }));
  svg.append(element("polygon", { points: pointsText(inner), fill: colours.insideFill, stroke: colours.inside,
    "stroke-width": 0.006, "stroke-linejoin": "round" }));
  // The polygon is `sides` equal triangles meeting in the middle: show them while there is room
  if (sides <= 48) {
    for (const [x, y] of inner) svg.append(element("line", { x1: 0, y1: 0, x2: x, y2: y, stroke: colours.inside, "stroke-width": 0.003, opacity: 0.5 }));
  }
  // One triangle filled in: its area is ½ × 1 × 1 × sin(360°/n), and there are n of them (too thin to see past 192)
  if (sides <= 192) {
    svg.append(element("polygon", { points: pointsText([[0, 0], inner[drawnSides - 1], inner[0]]), fill: colours.inside, opacity: 0.55 }));
  }
  svg.append(element("circle", { cx: 0, cy: 0, r: 1, fill: "none", stroke: colours.circle, "stroke-width": 0.006 }));
  // Box showing where the close-up is (at least big enough to see)
  const { halfWidth, scaleY, top } = closeUpWindow(sides);
  const boxWidth = Math.max(2 * halfWidth, 0.04), boxHeight = Math.max(400 / scaleY, 0.03);
  svg.append(element("rect", { x: -boxWidth / 2, y: -1 - Math.max(top / scaleY, 0.01), width: boxWidth, height: boxHeight,
    fill: "none", stroke: "#222", "stroke-width": 0.004, "stroke-dasharray": "0.02 0.015" }));
  document.getElementById("wholeCaption").textContent =
    `${sides.toLocaleString()} sides${sides > 96 ? " (from here on the polygon looks the same as the circle)" : ""}. The dashed box is the close-up.`;
};

// Close-up of the top side, 400 x 400 units. Horizontally: true scale. Vertically: stretched, if needed, so that
// the gaps (thinner than a pixel from about 100 sides on) can be seen. Heights are computed as distances below
// the top of the circle with formulas that stay accurate when the gap is tiny (no 1 - cos x).
const closeUpWindow = (sides) => {
  const a = Math.PI / sides;
  const halfWidth = 1.3 * Math.tan(a); // the window spans the top side and a little of its neighbours
  const scaleX = 200 / halfWidth;
  const insideDrop = 2 * Math.sin(a / 2) ** 2; // 1 - cos(a): how far the inside polygon's top side is below the circle's top
  // Unstretched if the gap is at least 30 units tall; otherwise stretched so it fills about half the height
  const stretch = insideDrop * scaleX >= 30 ? 1 : 220 / (insideDrop * scaleX);
  return { a, halfWidth, scaleX, insideDrop, stretch, scaleY: scaleX * stretch, top: 90 }; // the circle's top is 90 units down
};

const drawCloseUp = ({ sides, outside }) => {
  const svg = document.getElementById("polygonCloseUp");
  svg.replaceChildren();
  const { a, halfWidth, scaleX, insideDrop, stretch, scaleY, top } = closeUpWindow(sides);
  const X = (x) => 200 + x * scaleX;
  const Y = (drop) => top + drop * scaleY; // `drop` is the distance below the circle's top

  // Corners near the top, as [x, drop] (exact formulas for the drops)
  const neighbour = 3 * a; // the next corner over, measured from straight up
  const insideTop = [[-Math.sin(neighbour), 2 * Math.sin(neighbour / 2) ** 2], [-Math.sin(a), insideDrop],
    [Math.sin(a), insideDrop], [Math.sin(neighbour), 2 * Math.sin(neighbour / 2) ** 2]];
  const R = 1 / Math.cos(a);
  const outsideNeighbourDrop = (2 * Math.sin(2 * a) * Math.sin(a)) / Math.cos(a); // 1 - R cos(3a)
  const outsideTop = [[-R * Math.sin(neighbour), outsideNeighbourDrop], [-Math.tan(a), 0], [Math.tan(a), 0],
    [R * Math.sin(neighbour), outsideNeighbourDrop]];
  const arc = [];
  for (let i = 0; i <= 200; i++) {
    const x = Math.min(halfWidth * 1.2, 0.999999) * (i / 100 - 1);
    arc.push([x, (x * x) / (1 + Math.sqrt(1 - x * x))]); // 1 - √(1 - x²), written without the subtraction
  }
  const toSvg = (points) => pointsText(points.map(([x, drop]) => [X(x), Y(drop)]));
  const bottom = [[X(arc.at(-1)[0]), 400], [X(arc[0][0]), 400]].map(([x, y]) => `${x},${y}`).join(" ");

  const clip = svg.appendChild(element("clipPath", { id: "closeUpClip" }));
  clip.append(element("rect", { x: 0, y: 0, width: 400, height: 400 }));
  const group = svg.appendChild(element("g", { "clip-path": "url(#closeUpClip)" }));
  if (outside) {
    group.append(element("polygon", { points: `${toSvg(outsideTop)} ${X(outsideTop.at(-1)[0])},400 ${X(outsideTop[0][0])},400`,
      fill: colours.outsideFill, stroke: colours.outside, "stroke-width": 2, "stroke-linejoin": "round" }));
  }
  group.append(element("polygon", { points: `${toSvg(arc)} ${bottom}`, fill: colours.gap }));
  group.append(element("polygon", { points: `${toSvg(insideTop)} ${X(insideTop.at(-1)[0])},400 ${X(insideTop[0][0])},400`, fill: "white" }));
  group.append(element("polygon", { points: `${toSvg(insideTop)} ${X(insideTop.at(-1)[0])},400 ${X(insideTop[0][0])},400`,
    fill: colours.insideFill, stroke: colours.inside, "stroke-width": 2, "stroke-linejoin": "round" }));
  group.append(element("polyline", { points: toSvg(arc), fill: "none", stroke: colours.circle, "stroke-width": 2 }));
  svg.append(element("rect", { x: 0.5, y: 0.5, width: 399, height: 399, fill: "none", stroke: "#222", "stroke-width": 1, "stroke-dasharray": "6 4" }));

  const thinness = (2 * Math.sin(a)) / insideDrop; // the top side's length divided by the gold gap's height
  document.getElementById("closeUpCaption").textContent = stretch > 1
    ? `Close-up of the top side, stretched upward ${Math.round(stretch).toLocaleString()} times so the gaps show. ` +
      `Unstretched, the gold gap is ${Math.round(thinness).toLocaleString()} times thinner than the side is long.`
    : "Close-up of the top side, true shape.";
};

// The areas, with the decimals they share with π in bold
const writeAreas = ({ sides, outside }) => {
  const inside = withSharedPart(computePolygonDigits(shownDecimals + 1, sides));
  const pi = withSharedPart(piDigits);
  const rows = [
    [`<span class="key insideKey"></span>Inside polygon`, `(${sides.toLocaleString()} / 2) × sin(360° / ${sides.toLocaleString()})`, inside.html,
      sides === 12 ? "exactly 3" : `${inside.decimals} decimal${inside.decimals === 1 ? "" : "s"} of π`],
    [`<span class="key circleKey"></span>Circle`, "π", pi.html, ""],
  ];
  if (outside) {
    const out = withSharedPart(outsideArea(shownDecimals + 1, sides));
    rows.push([`<span class="key outsideKey"></span>Outside polygon`, `${sides.toLocaleString()} × tan(180° / ${sides.toLocaleString()})`, out.html,
      `${out.decimals} decimal${out.decimals === 1 ? "" : "s"} of π`]);
  }
  document.getElementById("polygonAreas").innerHTML =
    `<caption>Areas (radius 1). In bold: the part that matches π.</caption>` +
    rows.map((cells) => `<tr>${cells.map((cell, i) => `<td class="col${i}">${cell}</td>`).join("")}</tr>`).join("");
};

// ---- About panel ----
const aboutPolygons = ({ sides, outside }) => `
  <h2>What you're looking at</h2>
  <p>A circle of radius 1, whose area is π, with a <strong>regular polygon</strong> of ${sides.toLocaleString()}
  sides inside it (purple)${outside ? " and another outside it (teal)" : ""}. The inside polygon is ${sides.toLocaleString()}
  equal triangles meeting in the middle${sides <= 192 ? " (one is filled in)" : ""}, each with two sides of length 1, so its area is
  (n/2) × sin(360°/n). The <strong>gold</strong> slivers are the part of the circle it misses.</p>
  <p>Around 250 BC, Archimedes trapped π this way, between polygons inside and outside the circle. He started
  with the hexagon and doubled the number of sides four times, to 96, and found that π is between 3 10/71 and
  3 1/7. He worked with the perimeters, but the areas tell the same story: the area of the polygon with 2n
  sides is exactly half the perimeter of the one with n sides.</p>
  <h2>Doubling the sides</h2>
  <p>Choose more sides and the gold slivers shrink: each doubling makes them about 4 times thinner, so the
  area gains about 0.6 decimals of π each time. By 96 sides the gap is thinner than a pixel, so the close-up
  on the right stretches the picture upward (the caption says by how much).</p>
  <p>No π is needed to work out these areas. Halving the angle only takes square roots: from the hexagon's
  cos 60° = ½ and sin 60° = √3/2, each doubling uses cos(x/2) = √((1 + cos x)/2). So every area is built from
  nested square roots, like 24 √(2 − √(2 + √(2 + √3))) for 96 sides.</p>
  <h2>The digits</h2>
  <p>The 12-gon's area is exactly <strong>3</strong>. Every other polygon here has an irrational area, so,
  unlike the Leibniz series stopped early, its digits never repeat in a cycle. The mosaic's
  <em>Polygon ladder</em> view stacks the areas from 6 to 6 × 2<sup>79</sup> sides, one per row, and the
  96-gon's first million decimals passed every test we ran for randomness.</p>` + aboutLinks;

// ---- Controls and address ----
const controls = { sides: document.getElementById("polygonSides"), outside: document.getElementById("polygonOutside") };
for (const n of sideCounts) controls.sides.add(new Option(n.toLocaleString(), n));

const readAddress = () => {
  const params = new URLSearchParams(location.hash.slice(1));
  const sides = Number(params.get("sides"));
  return { sides: sideCounts.includes(sides) ? sides : defaults.sides, outside: params.get("outside") !== "off" };
};
const show = () => {
  const settings = readAddress();
  controls.sides.value = settings.sides;
  controls.outside.checked = settings.outside;
  drawWhole(settings);
  drawCloseUp(settings);
  writeAreas(settings);
  setAboutText(aboutPolygons(settings));
};
const updateAddress = () => {
  location.hash = `sides=${controls.sides.value}` + (controls.outside.checked ? "" : "&outside=off");
};
controls.sides.addEventListener("change", updateAddress);
controls.outside.addEventListener("change", updateAddress);
window.addEventListener("hashchange", show);
setupAbout("piPolygonsAbout");
show();
