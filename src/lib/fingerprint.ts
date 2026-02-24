import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFingerprint: string | null = null;

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  const stored = localStorage.getItem("sg100_fp");
  if (stored) {
    cachedFingerprint = stored;
    return stored;
  }

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedFingerprint = result.visitorId;
  localStorage.setItem("sg100_fp", cachedFingerprint);
  return cachedFingerprint;
}
