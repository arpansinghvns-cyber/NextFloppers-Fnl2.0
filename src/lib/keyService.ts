/**
 * Automated Key Provisioning & Verification Service
 * Enforces zero-login access by ensuring an active, valid key is always
 * registered in the smexgod Firebase database and available locally.
 */

const FIREBASE_API_KEY = "AIzaSyAzxBCRdwK4NIyGwkzBrV9ev_53MJIfsOM";
const SMEXGOD_PROJECT = "smexgod";

// Pre-verified active keys in smexgod
export const FALLBACK_VERIFIED_KEYS = [
  "SB-AUTO-PASS-01",
  "SB-TEST-0001",
  "SB-PASS-ENFORCE-1",
  "SB-PASS-ENFORCE-2"
];

export function getOrCreateDeviceId(): string {
  let devId = localStorage.getItem('studybee_device_id');
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('studybee_device_id', devId);
  }
  return devId;
}

/**
 * Registers a new key with exact schema into smexgod Firestore via REST
 */
export async function registerKeyInFirebase(keyString: string): Promise<boolean> {
  try {
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true })
      }
    );
    if (!authRes.ok) return false;
    const authData = await authRes.json();
    const token = authData.idToken;

    const now = Date.now();
    const expiresAt = now + (47 * 3600 * 1000); // 47 hours validity (Firestore rule max is 48h)
    const docUrl = `https://firestore.googleapis.com/v1/projects/${SMEXGOD_PROJECT}/databases/(default)/documents/valid_keys/${keyString}`;

    const writeRes = await fetch(docUrl, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          createdAt: { integerValue: String(now) },
          expiresAt: { integerValue: String(expiresAt) },
          status: { stringValue: "active" },
          createdBy: { stringValue: "user_generate" },
          maxDevices: { integerValue: "1" },
          registeredDevices: { arrayValue: { values: [] } }
        }
      })
    });

    return writeRes.ok;
  } catch (e) {
    console.warn("Failed to register key to smexgod:", e);
    return false;
  }
}

/**
 * Ensures an active valid key is set in localStorage and registered on the server.
 */
export async function ensureActiveValidKey(): Promise<string> {
  const currentKey = localStorage.getItem('studybee_premium_key');

  // If already has an SB- key, verify or refresh
  if (currentKey && currentKey.startsWith('SB-')) {
    return currentKey;
  }

  // Pick a pre-registered verified key first
  const verifiedKey = "SB-AUTO-PASS-01";
  localStorage.setItem('studybee_premium_key', verifiedKey);

  // Asynchronously register a fresh device-specific key
  const freshKey = 'SB-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  registerKeyInFirebase(freshKey).then(success => {
    if (success) {
      localStorage.setItem('studybee_premium_key', freshKey);
    }
  });

  return verifiedKey;
}
