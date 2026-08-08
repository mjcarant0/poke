import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, email, password, confirmPassword } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields (name, username, email, password) are required.' }, { status: 400 });
    }

    if (confirmPassword !== undefined && password.trim() !== confirmPassword.trim()) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check unique email and username in database
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            { username: cleanUsername },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === cleanEmail) {
          return NextResponse.json({ error: 'Email address is already registered.' }, { status: 400 });
        }
        if (existingUser.username === cleanUsername) {
          return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 });
        }
      }

      const hashedPassword = await hashPassword(cleanPassword);

      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          username: cleanUsername,
          email: cleanEmail,
          password: hashedPassword,
        },
      });

      const token = await createSessionToken({
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });

      const res = NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
        },
      }, { status: 201 });

      res.cookies.set('poke_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return res;
    } catch (dbErr: any) {
      console.error('Registration DB Error:', dbErr);
      return NextResponse.json({ error: dbErr.message || 'Database error during registration.' }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

