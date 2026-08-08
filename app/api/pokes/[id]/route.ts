import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const body = await req.json();
    const { status } = body;

    const updated = await prisma.qAComment.update({
      where: { id: commentId },
      data: {
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
