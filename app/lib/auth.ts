const TOKEN_SECRET = process.env.TOKEN_SECRET || 'banturide-admin-secret-key-change-in-production';

async function hmacSign(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(TOKEN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacVerify(payload: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(payload);
  return expected === signature;
}

export async function signToken(email: string): Promise<string> {
  const payload = `${email}|${Date.now()}`;
  const signature = await hmacSign(payload);
  return btoa(`${payload}|${signature}`);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = atob(token);
    const parts = decoded.split('|');
    if (parts.length !== 3) return null;

    const [email, timestampStr, signature] = parts;
    const payload = `${email}|${timestampStr}`;

    const valid = await hmacVerify(payload, signature);
    if (!valid) return null;

    // Check token age (24 hours)
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return null;

    return email;
  } catch {
    return null;
  }
}
