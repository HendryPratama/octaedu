'use client';
import { useActionState } from 'react';
import { createQuestion } from '@/app/actions/admin';

const initialState = {
  error: null as string | null,
  success: null as string | null,
};

export default function CreateQuestionForm({ classId }: { classId: string }) {
  // Mengikat classId ke dalam fungsi server action menggunakan bind
  const actionWithClassId = createQuestion.bind(null, classId);
  const [state, formAction, isPending] = useActionState(actionWithClassId, initialState);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Tambah Soal Baru</h2>

      <form action={formAction} className="flex flex-col gap-3">
        
        {state?.error && (
          <div className="bg-red-50 p-2 rounded text-xs text-red-700">{state.error}</div>
        )}
        {state?.success && (
          <div className="bg-green-50 p-2 rounded text-xs text-green-700">{state.success}</div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Pertanyaan</label>
          <textarea
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 resize-none h-20"
            name="question_text"
            placeholder="Tuliskan soal di sini..."
            required
          />
        </div>

        {/* Input Pilihan A sampai E */}
        {['A', 'B', 'C', 'D', 'E'].map((opt) => (
          <div key={opt} className="flex flex-col gap-0.5">
            <label className="text-[11px] font-semibold text-slate-500">Pilihan {opt}</label>
            <input
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900"
              name={`option_${opt.toLowerCase()}`}
              placeholder={`Teks opsi ${opt}...`}
              required
            />
          </div>
        ))}

        <div className="flex flex-col gap-1 mt-2">
          <label className="text-xs font-medium text-slate-600">Kunci Jawaban Benar</label>
          <select
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold"
            name="correct_answer"
            required
            defaultValue="A"
          >
            <option value="A">Opsi A</option>
            <option value="B">Opsi B</option>
            <option value="C">Opsi C</option>
            <option value="D">Opsi D</option>
            <option value="E">Opsi E</option>
          </select>
        </div>

        <button
          disabled={isPending}
          className="mt-3 w-full bg-blue-600 py-2.5 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {isPending ? 'Menambahkan...' : 'Simpan Soal'}
        </button>
      </form>
    </div>
  );
}