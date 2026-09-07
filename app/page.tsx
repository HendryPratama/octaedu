import Link from 'next/link';

export default function PreloginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              O
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">Octa<span className="text-blue-600">Edu</span></span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Platform Tryout & Belajar</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-4 py-2.5 transition"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-600/20"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Kolom Kiri: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Portal Resmi Tryout & Akselerasi Prestasi Indonesia
            </div>

            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Satu Platform Terpadu untuk <span className="text-blue-600">Ujian, Analisis, & Kolaborasi</span> Belajar.
            </h1>

            <p className="text-slate-600 text-base lg:text-lg leading-relaxed max-w-2xl">
              Tingkatkan kesiapan akademikmu lewat simulasi tryout interaktif berstandar nasional, bedah pembahasan mendalam, pantau grafik analisis skor secara real-time, dan berkompetisi di rangking nasional bersama rekan belajar lainnya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/register" 
                className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-center hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-base"
              >
                <span>Mulai Belajar Sekarang</span>
                <span>→</span>
              </Link>
              <Link 
                href="/login" 
                className="bg-white border border-slate-300 text-slate-700 font-bold px-8 py-4 rounded-xl text-center hover:bg-slate-50 transition text-base"
              >
                Masuk ke Akun Saya
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Card Fitur Unggulan (Mirip Portal Korporat Digital) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-4">
                Keunggulan Layanan OctaEdu
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    📊
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Tryout & Analisis Komprehensif</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Evaluasi performa ujian lengkap dengan skor akurat dan grafik perkembangan riwayat.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    💡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Pembahasan Soal Transparan</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Kunci jawaban dan ulasan detail untuk setiap nomor soal guna mempertajam pemahaman.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Peringkat & Grup Belajar</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Pacu motivasi belajar dengan memantau posisi skor dan berkolaborasi bersama grup.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500">Butuh bantuan pendaftaran kelas atau konfirmasi pembayaran?</p>
                <a 
                  href="https://wa.me/62895704254907" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-bold text-emerald-600 hover:underline mt-1"
                >
                  💬 Hubungi Admin via WhatsApp (+62 895-7042-54907)
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} OctaEdu Indonesia. All rights reserved. Platform Tryout & Pembahasan Pintar.</p>
      </footer>

    </div>
  );
}