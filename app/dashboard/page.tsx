export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';
import EnrollButton from './EnrollButton';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Ambil profil user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isProfileIncomplete = !profile?.school || !profile?.phone_number || !profile?.age;

  // Jika profil belum lengkap, tampilkan form profil
  if (isProfileIncomplete) {
    return (
      <main className="min-h-screen bg-[#f6f5f1] font-sans text-[#1a1814] p-6 lg:p-12">
        <div className="max-w-3xl mx-auto">
          {/* Header Profil Incomplete: Flat bordered block instead of floating card */}
          <div className="border-b-2 border-[#1a1814] pb-6 mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c45530] mb-2">
                Tindakan Diperlukan
              </p>
              <h1 className="text-3xl font-serif text-[#1a1814] tracking-tight">
                Lengkapi Data Registrasi
              </h1>
            </div>
            <LogoutButton />
          </div>
          <ProfileForm />
        </div>
      </main>
    );
  }

  // Ambil daftar kelas yang SUDAH diikuti oleh student ini
  const { data: myEnrollments } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      status,
      class_id,
      classes (
        id,
        name,
        description,
        price
      )
    `)
    .eq('user_id', user.id);

  // Ambil riwayat hasil ujian user
  const { data: myExamResults } = await supabase
    .from('exam_results')
    .select('class_id, score')
    .eq('user_id', user.id);

  const completedExamMap = new Map();
  myExamResults?.forEach((res) => {
    completedExamMap.set(res.class_id, res.score);
  });

  // Ambil SEMUA kelas
  const { data: allClasses } = await supabase
    .from('classes')
    .select('*');

  const enrolledClassIds = myEnrollments?.map((item: any) => item.classes?.id) || [];
  const availableClasses = allClasses?.filter((cls) => !enrolledClassIds.includes(cls.id)) || [];

  return (
    <main className="min-h-screen bg-[#f6f5f1] font-sans text-[#1a1814] pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header Dashboard: Heavy structural line, no background boxes */}
        <header className="pt-12 pb-8 mb-16 border-b-2 border-[#1a1814] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1814]">
                Portal Pelajar
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#1a1814] tracking-tight mb-1">
              Sesi: {profile?.full_name}
            </h1>
            <p className="text-sm font-medium text-[#3d3a32] uppercase tracking-wide">
              {profile?.school}
            </p>
          </div>
          <LogoutButton />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-12 lg:gap-24">
          
          {/* Kolom Kiri: Program Aktif / Kelas Saya */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3d3a32] mb-6 border-b border-[#3d3a32]/20 pb-4">
              Program Otorisasi Anda
            </h2>
            
            {myEnrollments?.length === 0 ? (
              // Empty state: Flat stark inset
              <div className="border-l-2 border-[#3d3a32]/20 pl-4 py-2">
                <p className="text-[#3d3a32] text-sm">Tidak ada rekam jejak program aktif. Silakan lakukan registrasi pada katalog.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {myEnrollments?.map((item: any) => {
                  const cls = item.classes;
                  if (!cls) return null;
                  
                  const isPending = item.status === 'pending';
                  const hasCompleted = completedExamMap.has(cls.id);
                  const score = completedExamMap.get(cls.id);

                  return (
                    // Replaced bg-white floating card with a stark, flat outlined box
                    <article key={cls.id} className="border border-[#1a1814] p-6 flex flex-col sm:flex-row gap-6 justify-between items-start bg-transparent">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-[#1a1814] text-xl">{cls.name}</h3>
                          {/* Replaced soft pills with hard text brackets */}
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            isPending ? 'text-[#c45530]' : 'text-[#3d3a32]'
                          }`}>
                            {isPending ? '[ MENUNGGU VERIFIKASI ]' : '[ AKTIF ]'}
                          </span>
                        </div>
                        <p className="text-[#3d3a32] text-sm line-clamp-2 max-w-lg mb-6">
                          {cls.description || 'Tidak ada spesifikasi kelas.'}
                        </p>

                        <div className="mt-auto">
                          {isPending ? (
                            <a 
                              href={`https://wa.me/62895704254907?text=${encodeURIComponent(
                                `Sistem: Permintaan Verifikasi\nNama: ${profile?.full_name}\nEmail: ${user.email}\nTarget Kelas: ${cls.name}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block border border-[#c45530] text-[#c45530] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#c45530] hover:text-[#f6f5f1] transition-colors"
                            >
                              Kontak Admin (WhatsApp) ↗
                            </a>
                          ) : hasCompleted ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="border-l-2 border-[#1a1814] pl-3 py-1 flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-[#3d3a32]">Skor Akhir</span>
                                <span className="font-serif font-bold text-[#1a1814] text-lg leading-none">{score} / 100</span>
                              </div>
                              <Link 
                                href={`/dashboard/exams/${cls.id}`}
                                className="inline-block bg-transparent text-[#1a1814] border-b border-[#1a1814] pb-0.5 text-xs font-bold uppercase tracking-widest hover:text-[#c45530] hover:border-[#c45530] transition-colors mt-2 sm:mt-0"
                              >
                                Akses Analitik Skor →
                              </Link>
                            </div>
                          ) : (
                            <Link 
                              href={`/dashboard/exams/${cls.id}`}
                              className="inline-block bg-[#1a1814] text-[#f6f5f1] px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#3d3a32] transition-colors"
                            >
                              Eksekusi Ujian
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Kolom Kanan: Katalog Program */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3d3a32] mb-6 border-b border-[#3d3a32]/20 pb-4">
              Katalog Program
            </h2>

            {availableClasses.length === 0 ? (
              <div className="border-l-2 border-[#3d3a32]/20 pl-4 py-2">
                <p className="text-[#3d3a32] text-sm">Seluruh program yang tersedia telah diotorisasi pada akun Anda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {availableClasses.map((cls) => (
                  // Distinct styling for catalog items: no side borders, just heavy top/bottom dividers
                  <article key={cls.id} className="border-t border-b border-[#3d3a32]/20 py-5 flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[#1a1814] text-base">{cls.name}</h3>
                        <span className="text-[#1a1814] font-serif font-bold text-sm">
                          {cls.price === 0 ? 'Gratis' : `Rp ${cls.price.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                      <p className="text-[#3d3a32] text-xs max-w-sm">
                        {cls.description || 'Tidak ada spesifikasi.'}
                      </p>
                    </div>

                    <div className="mt-2">
                      <EnrollButton classId={cls.id} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}

// Refactored Logout Button: Stripped the red background pill, changed to a stark text action
function LogoutButton() {
  return (
    <form action={async () => {
      'use server';
      const supabase = await createClient();
      await supabase.auth.signOut();
      redirect('/login');
    }}>
      <button className="text-[10px] font-bold uppercase tracking-widest text-[#3d3a32] hover:text-[#c45530] transition-colors border-b border-transparent hover:border-[#c45530] pb-0.5">
        Akhiri Sesi (Logout)
      </button>
    </form>
  );
}