'use client';
import { useActionState } from 'react';
import { forgotPassword } from '@/app/actions/auth';
import Link from 'next/link';

const initialState = {
  error: '',
  success: '',
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">Lupa Password?</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password Anda.
        </p>
        
        <form action={formAction} className="flex flex-col gap-4">
          
          {state?.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 text-sm font-medium">{state.error}</p>
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <p className="text-green-700 text-sm font-medium">{state.success}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">Email Terdaftar</label>
            <input
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              name="email"
              type="email"
              placeholder="nama@email.com"
              required
            />
          </div>
          
          <button
            disabled={isPending}
            className="mt-2 w-full bg-blue-600 py-3 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isPending ? 'Mengirim...' : 'Kirim Tautan Reset'}
          </button>

          <div className="text-center mt-4 text-sm text-slate-600">
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Kembali ke Halaman Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}