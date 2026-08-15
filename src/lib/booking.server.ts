const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-friendly booking reference, e.g. PN-7K2QF4 */
export function makeBookingRef() {
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `PN-${suffix}`;
}
