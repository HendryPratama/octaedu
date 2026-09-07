'use client';
import { deleteClass } from '@/app/actions/admin';
import { useTransition } from 'react';

export default function DeleteClassButton({ classId }: { classId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini beserta seluruh soal di dalamnya?')) {
      startTransition(async () => {
        await deleteClass(classId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50"
    >
      {isPending ? '...' : 'Hapus'}
    </button>
  );
}