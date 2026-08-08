'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewerPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/feed');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] flex items-center justify-center text-xs font-semibold text-gray-500">
      Redirecting to Reviewer Feed...
    </div>
  );
}
