import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'poke-dev-secret-key-change-in-production-2026'
);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function createSessionToken(payload: { userId: string; username: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; username: string; email: string };
  } catch (err) {
    return null;
  }
}

export async function getAuthenticatedUser(req?: NextRequest) {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get('poke_session')?.value;
    } else {
      const cookieStore = cookies();
      token = cookieStore.get('poke_session')?.value;
    }

    if (!token) return null;
    return await verifySessionToken(token);
  } catch (err) {
    return null;
  }
}
