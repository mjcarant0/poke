import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdentifier = body.emailOrUsername || body.identifier || body.email || body.username;
    const password = body.password;

    if (!rawIdentifier || !password) {
      return NextResponse.json({ error: 'Please enter your email address/username and password.' }, { status: 400 });
    }

    const cleanIdentifier = rawIdentifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanIdentifier },
            { username: cleanIdentifier },
          ],
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });
      }

      const isPasswordValid = await comparePassword(cleanPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid credentials. Password incorrect.' }, { status: 401 });
      }

      const token = await createSessionToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      const response = NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      });

      response.cookies.set('poke_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    } catch (dbErr: any) {
      console.error('Login DB Error:', dbErr);
      return NextResponse.json({ error: dbErr.message || 'Database error during login.' }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error during login' }, { status: 500 });
  }
}

