'use client';
import { deleteQuestion } from '@/app/actions/admin';
import { useTransition } from 'react';

export default function DeleteQuestionButton({ questionId, classId }: { questionId: string, classId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Hapus soal ini?')) {
      startTransition(async () => {
        await deleteQuestion(questionId, classId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition"
    >
      {isPending ? '...' : 'Hapus'}
    </button>
  );
}