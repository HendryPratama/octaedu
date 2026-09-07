'use client';
import { useActionState, useEffect } from 'react';
import { updateProfile } from '@/app/actions/auth';

const initialState = {
  error: null as string | null,
  success: false as boolean
};

export default function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
      <div className="mb-6 border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-md">
        <h3 className="font-semibold text-amber-800">Satu langkah lagi!</h3>
        <p className="text-sm text-amber-700">Mohon lengkapi data diri Anda sebelum mengakses ruang ujian.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        
        {state?.error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{state.error}</div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Asal Sekolah</label>
          <input
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            name="school"
            placeholder="SMA Negeri 1 Jakarta"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Umur</label>
            <input
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              type="number"
              name="age"
              placeholder="17"
              required
              min={10}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Nomor WhatsApp</label>
            <input
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              type="tel"
              name="phone_number"
              placeholder="08123456789"
              required
            />
          </div>
        </div>

        <button
          disabled={isPending}
          className="mt-4 bg-blue-600 py-3 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>
    </div>
  );
}