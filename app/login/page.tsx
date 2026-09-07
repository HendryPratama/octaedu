'use client';

import { Suspense } from 'react';
import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const initialState = {
  error: null as string | null,
};

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('message');

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Success Message: Replaced default green box with sharp dark inset */}
      {successMessage && (
        <div className="border-l-2 border-[#1a1814] bg-[#3d3a32]/5 p-4 mb-2">
          <p className="text-[#1a1814] text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {/* Error Message: Replaced default red box with Ember inset */}
      {state?.error && (
        <div className="border-l-2 border-[#c45530] bg-[#c45530]/5 p-4 mb-2">
          <p className="text-[#c45530] text-sm font-bold">{state.error}</p>
        </div>
      )}

      {/* Input Group: Replaced rounded-lg with sharp borders and structural labels */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#3d3a32]" htmlFor="email">
          Alamat Email
        </label>
        <input
          className="px-4 py-3 bg-transparent border border-[#3d3a32]/30 rounded-none text-[#1a1814] focus:outline-none focus:border-[#1a1814] transition-colors placeholder:text-[#3d3a32]/40"
          name="email"
          type="email"
          placeholder="nama@email.com"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold uppercase tracking-wider text-[#3d3a32]" htmlFor="password">
            Kata Sandi
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-[#c45530] hover:text-[#1a1814] transition-colors">
            Lupa sandi?
          </Link>
        </div>
        <input
          className="px-4 py-3 bg-transparent border border-[#3d3a32]/30 rounded-none text-[#1a1814] focus:outline-none focus:border-[#1a1814] transition-colors placeholder:text-[#3d3a32]/40"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
      </div>

      {/* Button: Solid sharp block instead of a rounded blue pill */}
      <button
        disabled={isPending}
        className="mt-2 w-full bg-[#1a1814] py-4 text-[#f6f5f1] font-medium rounded-none hover:bg-[#3d3a32] transition-colors disabled:bg-[#3d3a32]/50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Otentikasi...' : 'Akses Dashboard'}
      </button>

      {/* Link section separated by a sharp structural line */}
      <div className="pt-6 border-t border-[#3d3a32]/20 text-center mt-2">
        <p className="text-sm text-[#3d3a32]">
          Belum terdaftar?{' '}
          <Link href="/register" className="text-[#1a1814] font-bold hover:text-[#c45530] transition-colors">
            Buat akun baru ↗
          </Link>
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f5f1] p-6 font-sans">
      
      {/* Removed the generic bg-white shadow-lg card entirely. 
          The form now uses structural whitespace and sits directly on the background. */}
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-[#1a1814] mb-3">Akses Akun</h1>
          <p className="text-[#3d3a32] text-sm leading-relaxed">
            Lanjutkan simulasi tryout dan pantau grafik analitik skormu hari ini.
          </p>
        </div>

        <Suspense fallback={<div className="text-sm text-[#3d3a32] animate-pulse">Memuat form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      
    </div>
  );
}