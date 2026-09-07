import Link from 'next/link';

export default function PreloginPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f1] flex flex-col justify-between text-[#1a1814] font-sans">
      
      {/* Top Navigation Bar - Sharp borders, no drop shadows */}
      <header className="border-b border-[#3d3a32]/20 sticky top-0 z-50 bg-[#f6f5f1]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo: Replaced default rounded shape with sharp, typographic block */}
            <div className="w-8 h-8 bg-[#1a1814] flex items-center justify-center text-[#f6f5f1] font-bold font-serif text-lg">
              O
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#1a1814]">
                Octa<span className="text-[#c45530]">Edu</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-medium text-[#3d3a32] hover:text-[#c45530] transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="bg-[#c45530] text-[#f6f5f1] text-sm font-medium px-5 py-2 hover:bg-[#a34425] transition-colors"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Asymmetric Grid Layout */}
      {/* Col 1: Empty gutter | Col 2: Content | Col 3: Visual Card | Col 4: Empty gutter */}
      <main className="flex-1 w-full grid grid-cols-[minmax(1rem,1fr)_minmax(0,40rem)_minmax(0,24rem)_minmax(1rem,1fr)] items-end pb-24 pt-16 gap-y-16">
        
        {/* Left Content - Forced into column 2 */}
        <div className="col-start-1 lg:col-start-2 px-6 lg:px-12 pb-8">
          
          {/* Typography: Replaced generic standard text with high-contrast serif/sans mixing */}
          <h1 className="text-4xl lg:text-6xl font-serif text-[#1a1814] leading-[1.1] tracking-tight">
            Simulasi Tryout dengan <span className="text-[#c45530] italic">14.000+</span> Soal Terkalibrasi Nasional.
          </h1>

          {/* Copy: Replaced abstract AI buzzwords with concrete facts */}
          <p className="mt-6 text-[#3d3a32] text-base lg:text-lg leading-relaxed max-w-xl">
            Kerjakan tryout, lihat skor dalam 3 detik, dan bedah jawaban yang salah. Lebih dari 5.000 siswa menggunakan OctaEdu untuk mengeksekusi persiapan UTBK dan ujian mandiri setiap bulannya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <Link 
              href="/register" 
              className="bg-[#1a1814] text-[#f6f5f1] font-medium px-8 py-4 text-center hover:bg-[#3d3a32] transition-colors"
            >
              Mulai Ujian Pertamamu
            </Link>
            <Link 
              href="/login" 
              className="bg-transparent border border-[#3d3a32]/30 text-[#1a1814] font-medium px-8 py-4 text-center hover:bg-[#3d3a32]/5 transition-colors"
            >
              Lanjut Belajar
            </Link>
          </div>
        </div>

        {/* Right Feature Card - Bleeds into col 3 and overlaps layout */}
        <div className="col-start-1 lg:col-start-3 lg:col-span-2 px-6 lg:px-0">
          
          {/* Component Vocabulary: Replaced 'bg-white rounded-2xl shadow-xl' with flat, sharp borders */}
          <article className="border border-[#3d3a32]/20 bg-[#f6f5f1] p-8 max-w-md lg:-ml-12 relative z-10">
            <h3 className="font-serif text-[#1a1814] text-xl mb-6">
              Cara Kerja Sistem
            </h3>

            <div className="space-y-6">
              {/* Feature list: Replaced emoji icons with sharp inset borders */}
              <div className="border-l-2 border-[#c45530] pl-4">
                <h4 className="text-sm font-bold text-[#1a1814]">Hasil Keluar Real-time</h4>
                <p className="text-sm text-[#3d3a32] mt-1">Skor akurat dihitung langsung setelah menit ujian berakhir. Tanpa menunggu esok hari.</p>
              </div>

              <div className="border-l-2 border-[#3d3a32]/30 pl-4">
                <h4 className="text-sm font-bold text-[#1a1814]">Bedah Kesalahan Langsung</h4>
                <p className="text-sm text-[#3d3a32] mt-1">Sistem menandai pola materi yang paling sering salah dijawab beserta kunci pembahasannya.</p>
              </div>

              <div className="border-l-2 border-[#3d3a32]/30 pl-4">
                <h4 className="text-sm font-bold text-[#1a1814]">Peringkat Berjalan</h4>
                <p className="text-sm text-[#3d3a32] mt-1">Bandingkan posisimu dengan 5.000+ peserta lain secara nasional dalam satu dashboard.</p>
              </div>
            </div>

            {/* CTA/Help: Stripped out the generic background box, made it a subtle text link */}
            <div className="mt-8 pt-6 border-t border-[#3d3a32]/20">
              <p className="text-xs text-[#3d3a32]">Ada kendala pendaftaran?</p>
              <a 
                href="https://wa.me/62895704254907" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium text-[#c45530] hover:text-[#1a1814] transition-colors mt-1"
              >
                Kirim pesan ke Admin (+62 895-7042-54907) ↗
              </a>
            </div>
          </article>
        </div>

      </main>

      {/* Footer - Minimalist and direct */}
      <footer className="border-t border-[#3d3a32]/20 py-8 px-6 text-[#3d3a32]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} OctaEdu Indonesia.</p>
          <p>14.000+ Soal • Analisis Real-time</p>
        </div>
      </footer>

    </div>
  );
}