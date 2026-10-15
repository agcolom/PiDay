// Digit formulas shared by the mosaic (pi.js) and the 3D cube (cube.js).
// Each function returns the first `count` digits as a string, starting with the whole-number part,
// so position k in the string is decimal place k.

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
