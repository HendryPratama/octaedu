export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ExamClientForm from './ExamClientForm';

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ retake?: string }>
}) {
  const { classId } = await params;
  const { retake } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Validasi: Pastikan siswa terdaftar dan statusnya sudah 'active'
  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('status')
    .eq('user_id', user.id)
    .eq('class_id', classId)
    .single();

  if (!enrollment || enrollment.status !== 'active') {
    redirect('/dashboard'); // Jika belum aktif, tendang kembali ke dashboard
  }

  // 2. Ambil detail kelas
  const { data: currentClass } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  // 3. Ambil daftar soal ujian untuk kelas ini
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: true });

  // 4. Cek apakah siswa sudah pernah mengerjakan ujian ini sebelumnya 
  // (Akan dilewati jika URL mengandung parameter ?retake=true)
  let pastResult = null;
  if (retake !== 'true') {
    const { data } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('class_id', classId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    pastResult = data;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Ujian */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-xs font-semibold text-blue-600 hover:underline">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              Ujian: {currentClass?.name}
            </h1>
          </div>
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            {questions?.length || 0} Soal
          </span>
        </div>

        {/* KONDISI 1: Jika sudah pernah ujian (dan tidak sedang retake), tampilkan ringkasan & tombol review */}
        {pastResult ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              {pastResult.score}
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Ujian Telah Diselesaikan</h2>
            <p className="text-slate-500 mt-2 text-sm">
              Skor Akhir Anda: <span className="font-bold text-slate-800 text-lg">{pastResult.score}</span> / 100
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link 
                href={`/dashboard/exams/${classId}/review`} 
                className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
              >
                🔍 Lihat Pembahasan Soal
              </Link>
              
              <Link 
                href="/dashboard" 
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition"
              >
                ← Kembali ke Dashboard
              </Link>
            </div>
          </div>
        ) : questions?.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center text-slate-500 text-sm">
            Belum ada soal yang diunggah untuk ujian ini oleh admin.
          </div>
        ) : (
          // KONDISI 2: Jika belum pernah ujian atau sedang melakukan tes ulang (retake)
          <ExamClientForm classId={classId} questions={(questions || []) as any[]} />
        )}

      </div>
    </main>
  );
}