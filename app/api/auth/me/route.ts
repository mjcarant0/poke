import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hashPassword, comparePassword, createSessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedUser(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
      },
    });

    if (user) {
      return NextResponse.json({ authenticated: true, user });
    }
    return NextResponse.json({ authenticated: false, user: null });
  } catch (err: any) {
    console.error('Auth check DB Error:', err);
    return NextResponse.json({ authenticated: false, user: null, error: err.message });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAuthenticatedUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, username, email, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Check if new username or email is already taken by another account
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: 'Username is already taken by another account.' }, { status: 400 });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: 'Email address is already in use by another account.' }, { status: 400 });
      }
    }

    let updateData: any = {
      name: name?.trim() || user.name,
      username: username?.trim() || user.username,
      email: email?.trim() || user.email,
    };

    // Password change verification
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password.' }, { status: 400 });
      }

      const isValidPassword = await comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
      }

      updateData.password = await hashPassword(newPassword.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
      },
    });

    // Generate new JWT session token with updated info
    const token = await createSessionToken({
      userId: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    });

    const response = NextResponse.json({
      message: 'Account profile updated successfully!',
      user: updatedUser,
    });

    // Set cookie
    response.cookies.set('poke_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user profile.' }, { status: 500 });
  }
}
