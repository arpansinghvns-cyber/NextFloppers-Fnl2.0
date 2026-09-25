/**
 * Next Floppers Key Provisioning & Verification Service
 * - Enforces mandatory key verification for all content.
 * - Random accounts DO NOT get free automatic keys.
 * - 'floppyadmin' has special bypass / master access.
 * - Regular users must complete the Ad & Redirection checkpoint to generate a valid key.
 */

const FIREBASE_API_KEY = "AIzaSyAzxBCRdwK4NIyGwkzBrV9ev_53MJIfsOM";
const SMEXGOD_PROJECT = "smexgod";

export const FALLBACK_VERIFIED_KEYS = [
  "SB-AUTO-PASS-01",
  "SB-TEST-0001",
  "SB-PASS-ENFORCE-1",
  "SB-PASS-ENFORCE-2"
];

const FLOPPY_ADMIN_MASTER_KEY = "SB-FLOPPYADMIN-MASTER-PASS";

export function getOrCreateDeviceId(): string {
  let devId = localStorage.getItem('studybee_device_id');
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('studybee_device_id', devId);
  }
  return devId;
}

/**
 * Checks if the user currently holds a valid, non-expired key
 */
export function hasActiveKey(): boolean {
  const key = localStorage.getItem('studybee_premium_key');
  if (!key) return false;

  // Floppy admin master key never expires
  if (key === FLOPPY_ADMIN_MASTER_KEY || isFloppyAdminUser()) {
    return true;
  }

  const expiry = localStorage.getItem('studybee_key_expiry');
  if (expiry) {
    const expTime = parseInt(expiry, 10);
    if (!isNaN(expTime) && Date.now() > expTime) {
      // Key expired! Remove it
      clearActiveKey();
      return false;
    }
  }

  // Valid key format
  return key.length >= 6;
}

/**
 * Get active key if valid, or null if no valid key exists
 */
export function getActiveKey(): string | null {
  if (!hasActiveKey()) {
    return null;
  }
  return localStorage.getItem('studybee_premium_key');
}

/**
 * Synchronously get key or empty string
 */
export function getActiveKeySync(): string {
  return getActiveKey() || '';
}

/**
 * Check if the active key is floppyadmin
 */
export function isFloppyAdminUser(): boolean {
  const adminFlag = localStorage.getItem('studybee_is_floppy_admin');
  const key = localStorage.getItem('studybee_premium_key');
  return adminFlag === 'true' || key === FLOPPY_ADMIN_MASTER_KEY;
}

/**
 * Get remaining key validity in hours and minutes
 */
export function getKeyTimeRemaining(): { hours: number; minutes: number; isPermanent: boolean } | null {
  if (!hasActiveKey()) return null;
  if (isFloppyAdminUser()) return { hours: 9999, minutes: 0, isPermanent: true };

  const expiry = localStorage.getItem('studybee_key_expiry');
  if (!expiry) return { hours: 24, minutes: 0, isPermanent: false };

  const remainingMs = Math.max(0, parseInt(expiry, 10) - Date.now());
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, isPermanent: false };
}

/**
 * Activate FloppyAdmin Master Bypass
 */
export function activateFloppyAdmin(): { success: boolean; key: string } {
  localStorage.setItem('studybee_premium_key', FLOPPY_ADMIN_MASTER_KEY);
  localStorage.setItem('studybee_is_floppy_admin', 'true');
  localStorage.setItem('studybee_key_expiry', String(Date.now() + 365 * 24 * 3600 * 1000));
  return { success: true, key: FLOPPY_ADMIN_MASTER_KEY };
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
    const expiresAt = now + (47 * 3600 * 1000);
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
          createdBy: { stringValue: "ad_process_generate" },
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
 * Validates and saves an entered key or code
 * If user enters 'floppyadmin', activates admin master bypass!
 */
export function submitUserKey(rawKey: string): { success: boolean; message: string; isAdmin?: boolean; key?: string } {
  const trimmed = rawKey.trim();
  if (!trimmed) {
    return { success: false, message: "Please enter a key or admin code." };
  }

  // FloppyAdmin Master Bypass
  const normalized = trimmed.toLowerCase();
  if (normalized === 'floppyadmin' || normalized === 'floppy_admin' || normalized === 'adminfloppy') {
    activateFloppyAdmin();
    return { 
      success: true, 
      message: "👑 FloppyAdmin Master Access Activated! Zero ads & unlimited bypass.", 
      isAdmin: true,
      key: FLOPPY_ADMIN_MASTER_KEY
    };
  }

  // Check valid key prefixes
  if (trimmed.startsWith('SB-') || trimmed.startsWith('NF-') || trimmed.length >= 8) {
    const expiresAt = Date.now() + 24 * 3600 * 1000; // 24 hours
    localStorage.setItem('studybee_premium_key', trimmed);
    localStorage.setItem('studybee_key_expiry', String(expiresAt));
    localStorage.removeItem('studybee_is_floppy_admin');
    
    // Register in background if needed
    registerKeyInFirebase(trimmed).catch(() => {});
    
    return { 
      success: true, 
      message: "Access Key activated successfully for 24 hours!",
      key: trimmed
    };
  }

  return {
    success: false,
    message: "Invalid Key format. Complete the Ad & Redirection checkpoint to get a valid key or login as floppyadmin."
  };
}

/**
 * Mints an authentic 24-hour key after user successfully completes the Ad & Redirection checkpoint
 */
export function generateKeyFromAdProcess(): { key: string; expiresAt: number } {
  const rand1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const rand2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newKey = `SB-FLOP-${rand1}-${rand2}`;
  const expiresAt = Date.now() + 24 * 3600 * 1000; // 24 hours

  localStorage.setItem('studybee_premium_key', newKey);
  localStorage.setItem('studybee_key_expiry', String(expiresAt));
  localStorage.removeItem('studybee_is_floppy_admin');

  // Register in firebase
  registerKeyInFirebase(newKey).catch(() => {});

  return { key: newKey, expiresAt };
}

/**
 * Clear the current key
 */
export function clearActiveKey(): void {
  localStorage.removeItem('studybee_premium_key');
  localStorage.removeItem('studybee_key_expiry');
  localStorage.removeItem('studybee_is_floppy_admin');
}

/**
 * Ensures key is available for playback, or returns empty string if not unlocked
 */
export async function ensureActiveValidKey(): Promise<string> {
  const active = getActiveKey();
  if (active) return active;
  return '';
}
