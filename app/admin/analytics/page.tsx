import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ClassFilter from './ClassFilter';
import ExportButton from './ExportButton'; // <-- Impor Komponen Ekspor

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>
}) {
  const { classId } = await searchParams;
  const supabase = await createClient();

  // 1. Verifikasi Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // 2. Ambil daftar semua kelas untuk opsi pilihan filter dropdown
  const { data: classesList } = await supabase
    .from('classes')
    .select('id, name')
    .order('name', { ascending: true });

  // 3. Ambil seluruh hasil ujian (exam_results) dengan filter opsional classId
  let resultsQuery = supabase
    .from('exam_results')
    .select(`
      id,
      score,
      completed_at,
      student_answers,
      class_id,
      user_id,
      profiles ( full_name, email, school ),
      classes ( name )
    `)
    .order('score', { ascending: false });

  if (classId) {
    resultsQuery = resultsQuery.eq('class_id', classId);
  }

  const { data: allResults } = await resultsQuery;

  // 4. Ambil soal (dengan filter classId jika dipilih) untuk analisis kesulitan
  let questionsQuery = supabase
    .from('questions')
    .select('id, question_text, correct_answer, class_id');

  if (classId) {
    questionsQuery = questionsQuery.eq('class_id', classId);
  }

  const { data: allQuestions } = await questionsQuery;

  // 5. Hitung Statistik Umum
  const totalExamSubmissions = allResults?.length || 0;
  const averageScore = totalExamSubmissions > 0 
    ? Math.round(allResults.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalExamSubmissions) 
    : 0;

  const highestScore = totalExamSubmissions > 0 ? Math.max(...allResults.map(r => r.score || 0)) : 0;

  // 6. Analisis Tingkat Kesulitan Soal
  const questionStats: Record<string, { text: string; wrongCount: number; totalAnswered: number }> = {};
  
  allQuestions?.forEach(q => {
    questionStats[q.id] = { text: q.question_text, wrongCount: 0, totalAnswered: 0 };
  });

  allResults?.forEach(result => {
    const answers = (result.student_answers as Record<string, string>) || {};
    allQuestions?.forEach(q => {
      if (answers[q.id] !== undefined && questionStats[q.id]) {
        questionStats[q.id].totalAnswered++;
        if (answers[q.id] !== q.correct_answer) {
          questionStats[q.id].wrongCount++;
        }
      }
    });
  });

  const sortedDifficultQuestions = Object.entries(questionStats)
    .map(([id, stat]) => ({
      id,
      ...stat,
      errorRate: stat.totalAnswered > 0 ? Math.round((stat.wrongCount / stat.totalAnswered) * 100) : 0
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Navigasi & Filter */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/admin/classes" className="text-xs font-semibold text-blue-600 hover:underline">
              ← Kembali ke Manajemen Kelas
            </Link>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              📊 Rekapitulasi & Statistik Nilai Admin
            </h1>
            <p className="text-slate-500 text-sm">
              Analisis performa peserta tryout dan evaluasi tingkat kesulitan soal.
            </p>
          </div>

          {/* Filter Kelas & Tombol Ekspor */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <ClassFilter classesList={classesList || []} currentClassId={classId} />
            <ExportButton data={allResults || []} />
          </div>
        </div>

        {/* Grid Kartu Metrik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              📝
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ujian Dikerjakan</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalExamSubmissions} Sesi</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              📈
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-Rata Skor Sesi</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{averageScore} / 100</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
              🏆
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skor Tertinggi Diraih</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{highestScore} / 100</h3>
            </div>
          </div>
        </div>

        {/* Bagian 1: Leaderboard / Daftar Nilai Seluruh Peserta */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Peringkat & Daftar Nilai Peserta</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh hasil pengerjaan ujian siswa diurutkan dari skor tertinggi.</p>
            </div>
            {classId && (
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-lg">
                Menampilkan filter kelas aktif
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6">Peringkat</th>
                  <th className="p-4">Nama Peserta</th>
                  <th className="p-4">Asal Sekolah</th>
                  <th className="p-4">Kelas / Tryout</th>
                  <th className="p-4 text-center">Skor Akhir</th>
                  <th className="p-4 pr-6">Waktu Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allResults?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada data hasil ujian untuk filter kelas ini.
                    </td>
                  </tr>
                ) : (
                  allResults?.map((res: any, idx: number) => {
                    const profileData = res.profiles;
                    const classData = res.classes;
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 pl-6 font-bold text-slate-400">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{profileData?.full_name || 'Tanpa Nama'}</span>
                          <span className="text-xs text-slate-400">{profileData?.email}</span>
                        </td>
                        <td className="p-4 text-slate-600">{profileData?.school || '-'}</td>
                        <td className="p-4 font-semibold text-blue-600">{classData?.name || '-'}</td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-black text-xs">
                            {res.score} PTS
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-xs text-slate-400">
                          {new Date(res.completed_at).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bagian 2: Analisis Tingkat Kesulitan Soal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Analisis Tingkat Kesulitan Soal</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daftar soal yang paling sering dijawab salah oleh peserta pada cakupan filter aktif.</p>
          </div>

          <div className="space-y-4">
            {sortedDifficultQuestions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Belum ada data soal atau jawaban yang bisa dianalisis.</p>
            ) : (
              sortedDifficultQuestions.slice(0, 5).map((q, index) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        Peringkat Kesulitan #{index + 1}
                      </span>
                      <span className="text-xs text-slate-400">Total Salah: {q.wrongCount} dari {q.totalAnswered} jawaban</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm line-clamp-2">{q.text}</p>
                  </div>

                  <div className="w-full md:w-48 bg-white p-3 rounded-lg border border-slate-200 text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tingkat Kesalahan</span>
                    <span className="text-lg font-black text-red-600">{q.errorRate}% Salah</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}