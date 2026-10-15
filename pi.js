// The view shown when the page opens. The menu in the top corner switches views,
// and the address bar remembers the choice (e.g. index.html#e-309).
const defaultView = "pi-147";

// Each view is a number and a width where a block of digits repeats. The repeat positions
// are decimal places, checked against a million digits computed two different ways.
// They only line up as matching blocks at that view's number of columns.
const views = {
  // A 3x4 block (7068 / 1461 / 2311) appears twice. The copies are 5,430 digits apart.
  "pi-147": {
    about: `
      <p>The first 20,727 digits of <strong>π</strong> (3.14159…), 147 to a row.</p>
      <p><strong>Gold, row 6:</strong> the famous <em>Feynman point</em>, six 9s in a row starting at the 762nd
      decimal place. Random digits put a run of six this early only about 1 time in 150, so this one
      is a genuine rarity.</p>
      <p><strong>Cyan, rows 91 and 128:</strong> the same 3×4 block of digits (7068 / 1461 / 2311) appears
      twice, 5,430 digits apart. It looks like a pattern, but it isn't: across all row widths from 2 to
      2,000, the first million digits of π contain about 4,000 repeated blocks this size, which is what
      random digits would give.</p>`,
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
    about: `
      <p>The first 180,550 digits of <strong>π</strong>, 157 to a row. Scroll down to see them all.</p>
      <p><strong>Cyan, rows 746 and 1,142:</strong> a 3×5 block (26857 / 98272 / 74389) that appears twice,
      62,082 digits apart. It's one of the two biggest repeated blocks in the first million digits of π
      at any row width from 2 to 2,000. Random digits would give about two blocks this size, and π has
      two.</p>
      <p><strong>Gold, row 5:</strong> the Feynman point, six 9s starting at the 762nd decimal place.</p>`,
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
    about: `
      <p>The first 101,120 digits of <strong>√2</strong> (1.41421…), the number that gives 2 when multiplied
      by itself, 395 to a row. On a narrow screen, scroll sideways.</p>
      <p><strong>Cyan, rows 184 and 255:</strong> a 2×7 block (0800980 / 8857184) that appears twice, 27,944
      digits apart. Random digits give about 19 repeats this size in a million digits across all row
      widths. √2 has 10 in its first million and 18 in its second, so nothing unusual.</p>
      <p><strong>Gold, rows 83 and 238:</strong> six 4s and six 8s in a row. A million random digits contain
      about 9 runs of six; √2 has 12.</p>`,
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
    about: `
      <p>Digits of <strong>e</strong> (2.71828…), the number behind compound interest and natural growth,
      309 to a row. This view starts at the 87,756th decimal place and shows 338,355 digits. Scroll down
      to see them all.</p>
      <p><strong>Cyan, rows 6 and 1,088:</strong> a 3×5 block (26706 / 42937 / 38235) that appears twice,
      334,376 digits apart: the biggest repeated block in e's first million digits at any row width from
      2 to 2,000.</p>
      <p><strong>Gold, row 960:</strong> eight 9s in a row, at the 384,340th decimal place. About 1 in 12
      stretches of a million random digits contains a run of eight, so it's lucky rather than meaningful.
      The other gold frames are runs of six or seven.</p>`,
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
    about: `
      <p>Digits of the <strong>golden ratio φ</strong> (1.61803…), which appears in geometry, art and the
      Fibonacci numbers, 370 to a row. This view starts at the 741,850th decimal place.</p>
      <p><strong>Cyan, rows 6 and 130:</strong> a 3×5 block (44792 / 81931 / 88069) that appears twice,
      46,013 digits apart.</p>
      <p><strong>Gold, row 82:</strong> eight 5s in a row at the 771,950th decimal place. Like e's eight 9s,
      that happens in about 1 in 12 stretches of a million random digits.</p>
      <p>A few of φ's counts looked slightly unusual in its first million digits, but they were back to
      normal in its next million.</p>`,
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
    about: `
      <p><strong>1 ÷ 9801</strong> = 0.00 01 02 03 … 96 97 99 00 01 …: it counts upwards in pairs of
      digits, skips 98, then repeats the same 198 digits forever.</p>
      <p>With 198 squares to a row, each row is exactly one repeat, so every row is the same and the
      picture is vertical stripes. The very first square is different only because it's the 0 before
      the decimal point.</p>
      <p>This is what a <strong>real pattern</strong> looks like. Compare it with π.</p>`,
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
    about: `
      <p><strong>Champernowne's constant</strong> = 0.1234567891011121314…: simply the counting numbers
      written one after another.</p>
      <p>300 squares to a row divides evenly into 2-, 3-, 4- and 5-digit numbers, so the numbers line up
      into columns and stripes. The texture changes where the numbers grow from 3 to 4 to 5 digits. The
      gold frames are runs such as 1111 followed by 1112.</p>
      <p>Mathematicians have proven that every digit, and every block of digits, turns up equally often
      in this number in the long run, which nobody has yet proven for π. Yet it obviously doesn't look
      random: "every digit equally often" is not the same as "random".</p>`,
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

// Plain-English text for the About panel, used with each view's own "about" text
const aboutIntro = `
  <h2>What you're looking at</h2>
  <p>Each small square is one digit of a number, in order: left to right along a row, then on to the next
  row, like reading a page. The darker the square, the bigger the digit: 0 is white and 9 is full purple.</p>
  <p>How many squares fit in a row decides which digits end up above and below each other, and so which
  shapes you see. Each view uses a row width where something interesting lines up.</p>
  <p><strong>Gold frames</strong> mark six or more of the same digit in a row.
  <strong>Cyan frames</strong> mark a block of digits that appears twice, exactly the same.</p>
  <h2>This view</h2>`;

const aboutFolds = {
  "left-right": `
    <h2>Folded left onto right</h2>
    <p>The left half is laid over the right half, like closing a book, so each square meets its mirror
    image. Only one half is shown. A <strong>solid</strong> square means both halves have the same digit
    there; a pale square means they differ. Frames are hidden while folded.</p>`,
  "top-bottom": `
    <h2>Folded top onto bottom</h2>
    <p>The top half is laid over the bottom half, so each square meets the one in the mirror-image row.
    Only one half is shown. A <strong>solid</strong> square means both halves have the same digit there;
    a pale square means they differ. Frames are hidden while folded.</p>`,
};
const aboutFoldMeaning = `
  <p>For random digits about 1 square in 10 matches, scattered like speckle with no shapes. Lines, bands
  or blocks of solid squares would mean the two halves are related. The match rate is shown in the menu.</p>`;

const aboutConclusion = `
  <h2>What we found</h2>
  <p>In the first million digits of π, √2, e and the golden ratio, repeated blocks, runs of the same digit,
  straight lines in 3D and 4D, and matches when folded all turn up about as often as they would in random
  digits. Nobody has proven that these numbers' digits behave randomly, and these tests can't prove it
  either: they only show that nothing stood out. The two patterned numbers, 1/9801 and Champernowne's
  constant, stand out in every test.</p>`;

// Draws one view, replacing whatever was on the page before.
// fold is "none", "left-right" (fold the left half onto the right) or "top-bottom".
const showView = (viewName, fold = "none") => {
  // Size of each small div in pixels comes from the view
  const { number, columns, firstRow = 0, rows, divSize, repeats, about } = views[viewName];
  setAboutText(aboutIntro + about + (fold === "none" ? "" : aboutFolds[fold] + aboutFoldMeaning) + aboutConclusion + aboutLinks);

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
setupAbout("piMosaicAbout");
showViewFromAddress();
