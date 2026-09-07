'use client';
import { useActionState } from 'react';
import { createClass } from '@/app/actions/admin';

const initialState = {
  error: '',
  success: '',
};

export default function CreateClassForm() {
  const [state, formAction, isPending] = useActionState(createClass, initialState);

  return (
    // Removed the generic card background (bg-white shadow-sm rounded-xl). 
    // The form now integrates directly into the parent's structural layout.
    <div className="space-y-5">
      <form action={formAction} className="flex flex-col gap-6">
        
        {/* Error Alert: Replaced default red box with Ember inset */}
        {state?.error && (
          <div className="border-l-2 border-[#c45530] bg-[#c45530]/5 p-3">
            <p className="text-xs font-bold text-[#c45530] uppercase tracking-wide">{state.error}</p>
          </div>
        )}

        {/* Success Alert: Replaced default green box with Ink inset */}
        {state?.success && (
          <div className="border-l-2 border-[#1a1814] bg-[#3d3a32]/5 p-3">
            <p className="text-xs font-bold text-[#1a1814] uppercase tracking-wide">{state.success}</p>
          </div>
        )}

        {/* Input Group 1 */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#3d3a32]">
            Nomenklatur Kelas
          </label>
          <input
            className="px-4 py-3 bg-transparent border border-[#3d3a32]/30 rounded-none text-sm text-[#1a1814] focus:outline-none focus:border-[#1a1814] transition-colors placeholder:text-[#3d3a32]/40"
            name="name"
            placeholder="e.g., Tryout SNBT Gelombang 1"
            required
          />
        </div>

        {/* Input Group 2 */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#3d3a32]">
            Spesifikasi / Deskripsi
          </label>
          <textarea
            className="px-4 py-3 bg-transparent border border-[#3d3a32]/30 rounded-none text-sm text-[#1a1814] focus:outline-none focus:border-[#1a1814] transition-colors placeholder:text-[#3d3a32]/40 resize-none h-24"
            name="description"
            placeholder="Rincian cakupan materi ujian..."
          />
        </div>

        {/* Input Group 3 */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#3d3a32]">
            Tarif Dasar (IDR)
          </label>
          <input
            className="px-4 py-3 bg-transparent border border-[#3d3a32]/30 rounded-none text-sm text-[#1a1814] font-serif focus:outline-none focus:border-[#1a1814] transition-colors"
            type="number"
            name="price"
            defaultValue={0}
            min={0}
            required
          />
        </div>

        {/* Submit Action: Heavy, sharp block button */}
        <button
          disabled={isPending}
          className="mt-4 w-full bg-[#1a1814] py-4 text-[#f6f5f1] text-xs font-bold uppercase tracking-widest rounded-none hover:bg-[#3d3a32] transition-colors disabled:bg-[#3d3a32]/50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Menulis Data...' : 'Registrasi Kelas Baru'}
        </button>
      </form>
    </div>
  );
}