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

// The digit formulas (computeDigits) are in digits.js, which index.html loads first


// Calculate the alpha value based on the digits
const calculateAlpha = (digit) => (parseInt(digit) / 9).toFixed(2); // Normalize to a value between 0 and 1

// Draws one view, replacing whatever was on the page before.
// fold is "none", "left-right" (fold the left half onto the right) or "top-bottom".
const showView = (viewName, fold = "none") => {
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

  // Folded, the page shows one half; each square is compared with its mirror image in the other half
  const shownColumns = fold === "left-right" ? Math.floor(columns / 2) : columns;
  const shownRows = fold === "top-bottom" ? Math.floor(rows / 2) : rows;

  // Create container element with an id and set the flex direction to row
      const container = document.createElement("div");
      container.id = "piContainer"; // Set the id
      container.style.width = `${shownColumns * divSize}px`;
      container.style.height = `${shownRows * divSize}px`;

      const foldInfo = document.getElementById("foldInfo");
      if (fold === "none") foldInfo.textContent = "";
      else {
        // Solid where both layers have the same digit, pale where they differ
        let matches = 0;
        for (let row = 0; row < shownRows; row++) {
          for (let col = 0; col < shownColumns; col++) {
            const digit = digits[firstDigit + row * columns + col];
            const partner = fold === "left-right"
              ? digits[firstDigit + row * columns + (columns - 1 - col)]
              : digits[firstDigit + (rows - 1 - row) * columns + col];
            const div = document.createElement("div");
            div.style.backgroundColor = digit === partner ? "rgb(128, 0, 128)" : "rgba(128, 0, 128, 0.08)";
            div.style.width = `${divSize}px`;
            div.style.height = `${divSize}px`;
            if (digit === partner) matches++;
            container.appendChild(div);
          }
        }
        const share = (100 * matches) / (shownRows * shownColumns);
        foldInfo.textContent = `${share.toFixed(1)}% of squares match (random digits: 10%)`;
      }

      // Convert each digit to alpha transparency and create small divs
      if (fold === "none") digits.slice(firstDigit).split("").forEach((digit, i) => {
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
      if (repeats.length > 0 && fold === "none") {
        container.children[repeats[0].start - firstDigit].scrollIntoView({ block: "center", inline: "center" });
      } else {
        window.scrollTo(0, 0);
      }
};

// Fill the menus, and redraw when a choice changes.
// The address remembers both choices, e.g. index.html#pi-147 or index.html#pi-147/fold-left-right
const menu = document.getElementById("viewSelect");
for (const [name, { label }] of Object.entries(views)) menu.add(new Option(label, name));

const folds = { "none": "No fold", "left-right": "Fold left onto right", "top-bottom": "Fold top onto bottom" };
const foldMenu = document.getElementById("foldSelect");
for (const [name, label] of Object.entries(folds)) foldMenu.add(new Option(label, name));

const showViewFromAddress = () => {
  const [name, foldPart = ""] = location.hash.slice(1).split("/");
  const viewName = name in views ? name : defaultView;
  const fold = foldPart.replace("fold-", "") in folds ? foldPart.replace("fold-", "") : "none";
  menu.value = viewName;
  foldMenu.value = fold;
  showView(viewName, fold);
};

const updateAddress = () => {
  location.hash = menu.value + (foldMenu.value === "none" ? "" : `/fold-${foldMenu.value}`);
};
menu.addEventListener("change", updateAddress); // the hashchange below does the drawing
foldMenu.addEventListener("change", updateAddress);
window.addEventListener("hashchange", showViewFromAddress);
showViewFromAddress();
