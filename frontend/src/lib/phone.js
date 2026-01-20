export function toSaudiMsisdn(input) {
  const raw = String(input || "").trim();

  // digits only
  let d = raw.replace(/\D/g, "");

  // remove leading 00 (international)
  if (d.startsWith("00")) d = d.slice(2);

  // if starts with 966 already -> ok
  if (d.startsWith("966")) {
    // if user wrote 9660xxxxxxxx remove extra 0
    if (d.length === 13 && d.startsWith("9660")) d = "966" + d.slice(4);
    return d;
  }

  // if user wrote 0XXXXXXXXX (local KSA)
  if (d.startsWith("0") && d.length >= 9) {
    d = d.slice(1);
  }

  // now assume KSA number without country code
  // mobile usually 9 digits (5xxxxxxxx)
  if (d.length === 9) return "966" + d;

  // if already looks valid (10-15 digits), return as-is
  return d;
}
