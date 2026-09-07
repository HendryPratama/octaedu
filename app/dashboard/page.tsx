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
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">Halo, {profile?.full_name}! 👋</h1>
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

  // Ambil riwayat hasil ujian user ini untuk mendeteksi apakah sudah dikerjakan
  const { data: myExamResults } = await supabase
    .from('exam_results')
    .select('class_id, score')
    .eq('user_id', user.id);

  const completedExamMap = new Map();
  myExamResults?.forEach((res) => {
    completedExamMap.set(res.class_id, res.score);
  });

  // Ambil SEMUA kelas yang ada di database untuk katalog
  const { data: allClasses } = await supabase
    .from('classes')
    .select('*');

  // Filter kelas mana saja yang BELUM diikuti
  const enrolledClassIds = myEnrollments?.map((item: any) => item.classes?.id) || [];
  const availableClasses = allClasses?.filter((cls) => !enrolledClassIds.includes(cls.id)) || [];

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Pelajar</h1>
            <p className="text-slate-500 text-sm">Selamat datang kembali, <span className="font-semibold text-slate-700">{profile?.full_name}</span> ({profile?.school})</p>
          </div>
          <LogoutButton />
        </div>

        {/* Bagian 1: Kelas Saya (Enrolled Classes) */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Kelas yang Anda Ikuti</h2>
          
          {myEnrollments?.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center text-slate-500 text-sm">
              Anda belum mengikuti kelas apapun. Pilih kelas di katalog bawah untuk mulai belajar!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEnrollments?.map((item: any) => {
                const cls = item.classes;
                if (!cls) return null;
                
                const isPending = item.status === 'pending';
                const hasCompleted = completedExamMap.has(cls.id);
                const score = completedExamMap.get(cls.id);

                return (
                    <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 text-lg">{cls.name}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                            isPending 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                            {isPending ? 'Menunggu Pembayaran' : 'Aktif'}
                        </span>
                        </div>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{cls.description || 'Tidak ada deskripsi.'}</p>
                    </div>
                    
                    {isPending ? (
                        <a 
                        href={`https://wa.me/62895704254907?text=${encodeURIComponent(
                            `Halo Admin, saya ${profile?.full_name} (Email: ${user.email}) ingin membayar untuk kelas: *${cls.name}*. Tolong konfirmasi pembayaran saya.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition"
                        >
                        <span>💬 Konfirmasi Pembayaran via WhatsApp</span>
                        </a>
                    ) : hasCompleted ? (
                        <div className="flex flex-col gap-2">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Ujian Selesai (Skor):</span>
                            <span className="font-bold text-blue-600 text-sm">{score} / 100</span>
                        </div>
                        <Link 
                            href={`/dashboard/exams/${cls.id}`}
                            className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-semibold text-center hover:bg-slate-800 transition"
                        >
                            Lihat Hasil & Review Pembahasan →
                        </Link>
                        </div>
                    ) : (
                        <Link 
                        href={`/dashboard/exams/${cls.id}`}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-blue-700 transition"
                        >
                        Mulai Ujian / Kerjakan Soal →
                        </Link>
                    )}
                    </div>
                );
                })}
            </div>
          )}
        </div>

        {/* Bagian 2: Katalog Kelas Tersedia */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Katalog Kelas & Tryout</h2>

          {availableClasses.length === 0 ? (
            <p className="text-slate-500 text-sm bg-white p-6 rounded-xl border border-slate-100 text-center">
              Semua kelas yang tersedia sudah Anda ikuti!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableClasses.map((cls) => (
                <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-lg">{cls.name}</h3>
                      <span className="text-blue-600 font-semibold text-sm">
                        {cls.price === 0 ? 'Gratis' : `Rp ${cls.price.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">{cls.description || 'Tidak ada deskripsi.'}</p>
                  </div>

                  <EnrollButton classId={cls.id} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

function LogoutButton() {
  return (
    <form action={async () => {
      'use server';
      const supabase = await createClient();
      await supabase.auth.signOut();
      redirect('/login');
    }}>
      <button className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium">
        Keluar
      </button>
    </form>
  );
}