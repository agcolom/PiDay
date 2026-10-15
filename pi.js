// The view shown when the page opens. The menu in the top corner switches views,
// and the address bar remembers the choice (e.g. index.html#e-309).
const defaultView = "pi-147";

// Each view is a number and a width where a block of digits repeats. The repeat positions
// are decimal places, checked against a million digits computed two different ways.
// They only line up as matching blocks at that view's number of columns.
const views = {
  // A 3x4 block (7068 / 1461 / 2311) appears twice. The copies are 5,430 digits apart.
  "pi-147": {
    label: "π, 147 columns (3×4 repeat)",
    number: "pi",
    columns: 147,
    rows: 141, // 20,727 digits, fits a 1080px screen at 7px
    divSize: 7,
    repeats: [
      { start: 13310, height: 3, width: 4 },
      { start: 18740, height: 3, width: 4 },
    ],
  },
  // A 3x5 block (26857 / 98272 / 74389) appears twice. The copies are 62,082 digits apart.
  // One of the two biggest repeats in the first million digits at widths 2 to 2,000.
  "pi-157": {
    label: "π, 157 columns (3×5 repeat)",
    number: "pi",
    columns: 157,
    rows: 1150, // 180,550 digits, the page scrolls
    divSize: 8,
    repeats: [
      { start: 117089, height: 3, width: 5 },
      { start: 179171, height: 3, width: 5 },
    ],
  },
  // A 2x7 block (0800980 / 8857184) appears twice. The copies are 27,944 digits apart.
  "sqrt2-395": {
    label: "√2, 395 columns (2×7 repeat)",
    number: "sqrt2",
    columns: 395,
    rows: 256, // 101,120 digits, about one screen tall at 4px
    divSize: 4,
    repeats: [
      { start: 72436, height: 2, width: 7 },
      { start: 100380, height: 2, width: 7 },
    ],
  },
  // A 3x5 block (26706 / 42937 / 38235) appears twice. The copies are 334,376 digits apart.
  // The biggest repeat in the first million digits of e at widths 2 to 2,000.
  // Between them is a run of eight 9s at decimal place 384,340.
  "e-309": {
    label: "e, 309 columns (3×5 repeat)",
    number: "e",
    columns: 309,
    firstRow: 284, // skip the first 87,756 digits so the page starts just above the first copy
    rows: 1095, // 338,355 digits, the page scrolls
    divSize: 4,
    repeats: [
      { start: 89404, height: 3, width: 5 },
      { start: 423780, height: 3, width: 5 },
    ],
  },
  // The golden ratio. A 3x5 block (44792 / 81931 / 88069) appears twice. The copies are 46,013 digits apart.
  // Between them is a run of eight 5s at decimal place 771,950.
  "phi-370": {
    label: "Golden ratio φ, 370 columns (3×5 repeat)",
    number: "phi",
    columns: 370,
    firstRow: 2005, // skip the first 741,850 digits so the page starts just above the first copy
    rows: 136, // 50,320 digits, about half a screen tall at 4px
    divSize: 4,
    repeats: [
      { start: 743904, height: 3, width: 5 },
      { start: 789917, height: 3, width: 5 },
    ],
  },
  // 1/9801 = 0.00 01 02 03 ... 96 97 99 00 01 ..., the same 198 digits forever (98 is skipped).
  // At 198 columns every row is one full cycle, so every row is the same.
  "oneOver9801-198": {
    label: "1/9801, 198 columns (every row repeats)",
    number: "oneOver9801",
    columns: 198,
    rows: 100, // 19,800 digits
    divSize: 7,
    repeats: [], // everything repeats, so nothing is framed in cyan
  },
  // Champernowne's constant = 0.123456789101112..., the counting numbers written one after another.
  // 300 divides by 2, 3, 4, 5 and 6, so the numbers line up into columns in every stretch.
  "champernowne-300": {
    label: "Champernowne, 300 columns (counting numbers)",
    number: "champernowne",
    columns: 300,
    rows: 200, // 60,000 digits: all the 1- to 4-digit numbers and the start of the 5-digit ones
    divSize: 5,
    repeats: [],
  },
};

// BigInt holds each number as a whole number with extra digits, e.g. 31415926... instead of 3.1415926...
const guardDigits = 10n; // extra digits so rounding errors never reach the ones we keep

// Whole-number square root by Newton's method.
// Takes the square root of the leading half of the bits first, so Newton only needs a couple of full-size steps.
const squareRoot = (n) => {
  if (n < 1n << 52n) {
    let x = BigInt(Math.floor(Math.sqrt(Number(n))));
    while (x * x > n) x--;
    while ((x + 1n) * (x + 1n) <= n) x++;
    return x;
  }
  const shift = BigInt(Math.floor(n.toString(2).length / 4));
  let x = (squareRoot(n >> (2n * shift)) + 1n) << shift; // at or above the true root
  while (true) {
    const next = (x + n / x) >> 1n;
    if (next >= x) return x;
    x = next;
  }
};

// Pi digits, computed with the Chudnovsky formula (fast enough for hundreds of thousands of digits)
const computePiDigits = (count) => {
  const scale = 10n ** (BigInt(count) + guardDigits);
  const C3over24 = 640320n ** 3n / 24n;

  // Sums the series terms a..b-1 by splitting the range in half (binary splitting)
  const sumTerms = (a, b) => {
    if (b - a === 1n) {
      const P = a === 0n ? 1n : (6n * a - 5n) * (2n * a - 1n) * (6n * a - 1n);
      const Q = a === 0n ? 1n : a * a * a * C3over24;
      const T = P * (13591409n + 545140134n * a) * (a % 2n === 0n ? 1n : -1n);
      return [P, Q, T];
    }
    const middle = (a + b) / 2n;
    const [P1, Q1, T1] = sumTerms(a, middle);
    const [P2, Q2, T2] = sumTerms(middle, b);
    return [P1 * P2, Q1 * Q2, T1 * Q2 + P1 * T2];
  };

  const termCount = BigInt(Math.ceil(count / 14) + 2); // each term adds about 14 digits
  const [, Q, T] = sumTerms(0n, termCount);
  const pi = (Q * 426880n * squareRoot(10005n * scale * scale)) / T;
  return pi.toString().slice(0, count);
};

// Square root of 2 digits: the whole-number square root of 2 x 10^(2 x digits)
const computeSqrt2Digits = (count) => {
  const scale = 10n ** (BigInt(count) + guardDigits);
  return squareRoot(2n * scale * scale).toString().slice(0, count);
};

// e digits: e = 1/0! + 1/1! + 1/2! + 1/3! + ..., added up exactly by splitting the range in half
const computeEDigits = (count) => {
  const scale = 10n ** (BigInt(count) + guardDigits);

  // Enough terms that the last factorial is bigger than the scale
  let termCount = 1;
  for (let log10 = 0; log10 < count + Number(guardDigits); termCount++) log10 += Math.log10(termCount + 1);

  // Returns [P, Q] where P / Q = 1/(a+1) + 1/((a+1)(a+2)) + ... + 1/((a+1)...b) and Q = (a+1)...b
  const sumTerms = (a, b) => {
    if (b - a === 1) return [1n, BigInt(b)];
    const middle = Math.floor((a + b) / 2);
    const [P1, Q1] = sumTerms(a, middle);
    const [P2, Q2] = sumTerms(middle, b);
    return [P1 * Q2 + P2, Q1 * Q2];
  };

  const [P, Q] = sumTerms(0, termCount);
  return ((scale * (Q + P)) / Q).toString().slice(0, count);
};

// Golden ratio digits: (1 + square root of 5) / 2
const computePhiDigits = (count) => {
  const scale = 10n ** (BigInt(count) + guardDigits);
  return ((scale + squareRoot(5n * scale * scale)) / 2n).toString().slice(0, count);
};

// 1/9801 digits by long division: 10^(digits) / 9801, with the leading zeros put back
const computeOneOver9801Digits = (count) =>
  "0" + (10n ** BigInt(count - 1) / 9801n).toString().padStart(count - 1, "0");

// Champernowne digits: "0" for the whole-number part, then 1, 2, 3, ... written one after another
const computeChampernowneDigits = (count) => {
  const parts = ["0"];
  for (let n = 1, length = 1; length < count; n++) {
    parts.push(String(n));
    length += String(n).length;
  }
  return parts.join("").slice(0, count);
};

const computeDigits = {
  pi: computePiDigits,
  sqrt2: computeSqrt2Digits,
  e: computeEDigits,
  phi: computePhiDigits,
  oneOver9801: computeOneOver9801Digits,
  champernowne: computeChampernowneDigits,
};

// Calculate the alpha value based on the digits
const calculateAlpha = (digit) => (parseInt(digit) / 9).toFixed(2); // Normalize to a value between 0 and 1

// Draws one view, replacing whatever was on the page before
const showView = (viewName) => {
  // Size of each small div in pixels comes from the view
  const { number, columns, firstRow = 0, rows, divSize, repeats } = views[viewName];

  // One digit per square, so the mosaic is always exactly full.
  // Digits before firstRow are computed (positions count from the start) but not drawn.
  const firstDigit = firstRow * columns;
  const digitCount = (firstRow + rows) * columns;

  const digits = computeDigits[number](digitCount);

  // Runs of six or more of the same digit, split where a run wraps onto the next row.
  // For pi this is the Feynman point: six 9s in a row starting at the 762nd decimal place.
  const runs = [...digits.matchAll(/(\d)\1{5,}/g)].flatMap((match) => {
    const pieces = [];
    for (let start = match.index; start < match.index + match[0].length; ) {
      const width = Math.min(match.index + match[0].length - start, columns - (start % columns));
      pieces.push({ start, height: 1, width, color: "gold" });
      start += width;
    }
    return pieces;
  });

  // Rectangles to frame, given as the digit index of the top-left square plus a size in squares
  const highlights = [
    ...runs,
    ...repeats.map((repeat) => ({ ...repeat, color: "cyan" })),
  ];

  // Inset shadows draw the frame inside each square, so the grid doesn't shift
  const frameThickness = divSize >= 7 ? 2 : 1; // thinner on small squares so the digits stay visible
  const frameFor = (index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    for (const { start, height, width, color } of highlights) {
      const top = Math.floor(start / columns);
      const left = start % columns;
      if (row < top || row >= top + height || col < left || col >= left + width) continue;
      const edges = [];
      if (row === top) edges.push(`inset 0 ${frameThickness}px 0 ${color}`);
      if (row === top + height - 1) edges.push(`inset 0 -${frameThickness}px 0 ${color}`);
      if (col === left) edges.push(`inset ${frameThickness}px 0 0 ${color}`);
      if (col === left + width - 1) edges.push(`inset -${frameThickness}px 0 0 ${color}`);
      return edges.join(", ");
    }
    return "";
  };

  // Create container element with an id and set the flex direction to row
      const container = document.createElement("div");
      container.id = "piContainer"; // Set the id
      container.style.width = `${columns * divSize}px`;
      container.style.height = `${rows * divSize}px`;
    
      // Convert each digit to alpha transparency and create small divs
      digits.slice(firstDigit).split("").forEach((digit, i) => {
        const index = firstDigit + i; // position in the number, used for the frames
        const alpha = calculateAlpha(digit);
        const color = `rgba(128, 0, 128, ${alpha})`; // Use rgba to include alpha channel
        const div = document.createElement("div");
        div.style.backgroundColor = color;
        div.style.width = `${divSize}px`;
        div.style.height = `${divSize}px`;
      
        // remove the comment at the start of the line below if you want a static image
        // and make sure to comment out the animation section towards the bottom of this file
        // div.style.visibility = "hidden"; 
      
        // If you want the option to add a border of the color defined above
        // div.style.border = `${color} solid 10px`;

        // Frame the highlighted squares (empty for everything else)
        div.style.boxShadow = frameFor(index);
        container.appendChild(div);
      });
    
      // This is the animation section
      // Comment out this section if you want to display a static image
       /* From Here */
      /*
      // Get all child divs with class piRectangle
            const piRectangles = container.querySelectorAll('div');
    
      // Loop through each div element
      for (let i = 0; i < piRectangles.length; i++) {
          // Set a timeout to make the div visible after a delay
          setTimeout(function() {
              // Make the current div visible
              piRectangles[i].style.visibility = "visible";
          }, i * 1); // Delay each rectangle by its index * the chosen delay in milliseconds
      }
    
      /* To here */
      document.getElementById("piContainer")?.remove(); // clear the previous view
      document.body.appendChild(container);

      // Start the page at the first copy of the repeat (if the view has one), then scroll down to find the second
      if (repeats.length > 0) {
        container.children[repeats[0].start - firstDigit].scrollIntoView({ block: "center", inline: "center" });
      } else {
        window.scrollTo(0, 0);
      }
};

// Fill the menu with the views, and redraw when the choice changes
const menu = document.getElementById("viewSelect");
for (const [name, { label }] of Object.entries(views)) menu.add(new Option(label, name));

const showViewFromAddress = () => {
  const name = location.hash.slice(1);
  const viewName = name in views ? name : defaultView;
  menu.value = viewName;
  showView(viewName);
};

menu.addEventListener("change", () => { location.hash = menu.value; }); // the hashchange below does the drawing
window.addEventListener("hashchange", showViewFromAddress);
showViewFromAddress();
