import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ExamReviewPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Ambil detail kelas
  const { data: currentClass } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  // 2. Ambil soal dan kunci jawaban
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: true });

  // 3. Ambil SEMUA riwayat ujian user ini (maksimal 3 terakhir) untuk ditampilkan & dipilih
  const { data: allResults } = await supabase
    .from('exam_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('class_id', classId)
    .order('completed_at', { ascending: false })
    .limit(3);

  if (!allResults || allResults.length === 0) {
    redirect(`/dashboard/exams/${classId}`);
  }

  // Ambil hasil yang paling baru sebagai default untuk review
  const pastResult = allResults[0];
  const studentAnswers = (pastResult.student_answers as Record<string, string>) || {};

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Review & Tombol Aksi Cepat */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/dashboard" className="text-xs font-semibold text-blue-600 hover:underline">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              Review & Pembahasan: {currentClass?.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Diselesaikan pada: {new Date(pastResult.completed_at).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Skor Terakhir:</span>
              <span className="text-lg font-bold text-blue-600">{pastResult.score} / 100</span>
            </div>
            
            {/* Tombol Tes Ulang */}
            <form action={async () => {
              'use server';
              const supabase = await createClient();
              // Cukup arahkan user kembali ke halaman lembar ujian untuk mengerjakan ulang
              // (Hasil lama tetap aman tersimpan di riwayat max 3)
              redirect(`/dashboard/exams/${classId}?retake=true`);
            }}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm">
                🔄 Tes Ulang
              </button>
            </form>
          </div>
        </div>

        {/* Informasi Riwayat (Max 3 Percobaan Terakhir) */}
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 flex items-center justify-between text-xs text-slate-600">
          <span>📊 Menampilkan riwayat dari total {allResults.length} percobaan tersimpan (Maks. 3 riwayat terakhir).</span>
          <div className="flex gap-2">
            {allResults.map((res, idx) => (
              <span key={res.id} className={`px-2 py-1 rounded font-semibold ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border'}`}>
                #{idx + 1}: {res.score} pts
              </span>
            ))}
          </div>
        </div>

        {/* Daftar Pembahasan Soal */}
        <div className="space-y-6">
          {questions?.map((q, index) => {
            const options = q.options as Record<string, string>;
            const studentChoice = studentAnswers[q.id];
            const isCorrect = studentChoice === q.correct_answer;

            return (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    Soal #{index + 1}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isCorrect ? '✓ Benar' : '✕ Salah'}
                  </span>
                </div>

                <p className="font-medium text-slate-800 mb-4 text-sm">{q.question_text}</p>

                <div className="space-y-2 mb-4">
                  {Object.entries(options || {}).map(([key, value]) => {
                    const isStudentPick = studentChoice === key;
                    const isTheCorrectAnswer = q.correct_answer === key;

                    let styleClass = 'bg-slate-50/50 border-slate-200 text-slate-700';
                    if (isTheCorrectAnswer) {
                      styleClass = 'bg-green-50 border-green-300 text-green-900 font-medium';
                    } else if (isStudentPick && !isCorrect) {
                      styleClass = 'bg-red-50 border-red-300 text-red-900 font-medium';
                    }

                    return (
                      <div key={key} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${styleClass}`}>
                        <span className="w-5 font-bold text-xs">{key}.</span>
                        <span className="flex-1">{value}</span>
                        {isTheCorrectAnswer && <span className="text-xs font-bold text-green-600">(Kunci Jawaban)</span>}
                        {isStudentPick && !isTheCorrectAnswer && <span className="text-xs font-bold text-red-600">(Pilihan Anda)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/dashboard" 
            className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            Selesai & Kembali ke Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}