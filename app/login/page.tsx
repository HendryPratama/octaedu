'use client'; 
import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const initialState = {
  error: null as string | null,
};

// Pastikan tulisan export default function ada di sini
export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('message'); 

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">Masuk ke Platform</h1>
        <p className="text-center text-slate-500 mb-8 text-sm">Silakan login untuk mengakses kelas dan ujian Anda.</p>
        
        <form action={formAction} className="flex flex-col gap-4">
          
          {/* Pesan Sukses dari halaman Register */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-2">
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Pesan Error Login */}
          {state?.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-2">
              <p className="text-red-700 text-sm font-medium">{state.error}</p>
            </div>
          )}

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
          
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Lupa password?
            </Link>
          </div>
          <input
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          
          <button
            disabled={isPending}
            className="mt-4 w-full bg-blue-600 py-3 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isPending ? 'Memeriksa kredensial...' : 'Masuk Sekarang'}
          </button>

          <p className="text-center mt-6 text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}