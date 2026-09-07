'use client';
export const dynamic = 'force-dynamic';
import { useActionState } from 'react';
import { signup } from '@/app/actions/auth';
import Link from 'next/link';

const initialState = {
  error: null as string | null,
};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">Buat Akun Baru</h1>
        <p className="text-center text-slate-500 mb-8 text-sm">Daftar sebagai pelajar untuk mengakses ujian.</p>
        
        <form action={formAction} className="flex flex-col gap-4">
          
          {state?.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 text-sm font-medium">{state.error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="full_name">Nama Lengkap</label>
            <input
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              name="full_name"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              name="email"
              type="email"
              placeholder="nama@email.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              type="password"
              name="password"
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
            />
          </div>
          
          <button
            disabled={isPending}
            className="mt-4 w-full bg-blue-600 py-3 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>

          <p className="text-center mt-6 text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}