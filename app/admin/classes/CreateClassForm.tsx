'use client';
import { useActionState } from 'react';
import { createClass } from '@/app/actions/admin';

const initialState = {
  error: null as string | null,
  success: null as string | null,
};

export default function CreateClassForm() {
  const [state, formAction, isPending] = useActionState(createClass, initialState);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Buat Kelas Baru</h2>

      <form action={formAction} className="flex flex-col gap-4">
        
        {state?.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-xs text-green-700">
            {state.success}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Nama Kelas / Ujian</label>
          <input
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
            name="name"
            placeholder="Contoh: Tryout UTBK 2026"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Deskripsi Singkat</label>
          <textarea
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 resize-none h-20"
            name="description"
            placeholder="Penjelasan materi ujian..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Harga Akses (Rp)</label>
          <input
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
            type="number"
            name="price"
            defaultValue={0}
            min={0}
            required
          />
        </div>

        <button
          disabled={isPending}
          className="mt-2 w-full bg-blue-600 py-2.5 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Kelas'}
        </button>
      </form>
    </div>
  );
}