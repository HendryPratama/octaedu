'use client';
import { useActionState } from 'react';
import { updateNewPassword } from '@/app/actions/auth';

const initialState = {
  error: null as string | null,
};

export default function UpdatePasswordPage() {
  const [state, formAction, isPending] = useActionState(updateNewPassword, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">Atur Password Baru</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Silakan masukkan password baru Anda di bawah ini.
        </p>
        
        <form action={formAction} className="flex flex-col gap-4">
          
          {state?.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 text-sm font-medium">{state.error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Password Baru</label>
            <input
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
            />
          </div>
          
          <button
            disabled={isPending}
            className="mt-2 w-full bg-blue-600 py-3 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isPending ? 'Menyimpan...' : 'Perbarui Password'}
          </button>
        </form>
      </div>
    </div>
  );
}