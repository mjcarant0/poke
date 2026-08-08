import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;

    const updated = await prisma.qAComment.update({
      where: { id: commentId },
      data: {
        upvotes: { increment: 1 },
      },
    });
    return NextResponse.json({ success: true, upvotes: updated.upvotes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
