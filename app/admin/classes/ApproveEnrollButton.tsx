'use client';
import { approveEnrollment } from '@/app/actions/admin';
import { useTransition } from 'react';

export default function ApproveEnrollButton({ enrollmentId }: { enrollmentId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveEnrollment(enrollmentId);
      if (res?.error) alert(res.error);
    });
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
    >
      {isPending ? 'Memproses...' : 'Setujui & Beri Akses'}
    </button>
  );
}