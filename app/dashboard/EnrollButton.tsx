'use client';
import { enrollClass } from '@/app/actions/admin';
import { useTransition } from 'react';

export default function EnrollButton({ classId }: { classId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleEnroll = () => {
    startTransition(async () => {
      const res = await enrollClass(classId);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isPending}
      className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition disabled:bg-slate-300"
    >
      {isPending ? 'Memproses...' : 'Ambil Kelas Ini'}
    </button>
  );
}