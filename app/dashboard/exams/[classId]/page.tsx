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
    redirect('/dashboard'); 
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
    <main className="min-h-screen bg-[#f6f5f1] font-sans text-[#1a1814] pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        
        {/* Header Ujian: Heavy structural line, stark typography */}
        <header className="pt-12 pb-8 mb-12 border-b-2 border-[#1a1814] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-4">
              <Link 
                href="/dashboard" 
                className="text-[10px] font-bold uppercase tracking-widest text-[#3d3a32] hover:text-[#c45530] transition-colors border-b border-transparent hover:border-[#c45530] pb-0.5"
              >
                Kembali ke Portal
              </Link>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#1a1814] tracking-tight">
              {currentClass?.name}
            </h1>
          </div>
          
          {/* Replaced soft blue pill badge with a sharp outlined metrics box */}
          <div className="border border-[#3d3a32]/30 px-4 py-2 flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3d3a32]">
              Total: <span className="text-[#1a1814]">{questions?.length || 0} Soal</span>
            </span>
          </div>
        </header>

        {/* KONDISI 1: Jika sudah pernah ujian (dan tidak sedang retake) */}
        {pastResult ? (
          <section className="border border-[#1a1814] p-10 flex flex-col items-center justify-center text-center bg-transparent mt-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3d3a32] mb-6">
              Status: Ujian Selesai
            </p>
            
            {/* Replaced generic circular badge with massive serif typography */}
            <div className="mb-6 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-[#3d3a32] tracking-widest mb-1">Nilai Akhir</span>
              <div className="text-7xl lg:text-8xl font-serif font-bold text-[#1a1814] leading-none">
                {pastResult.score}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Link 
                href={`/dashboard/exams/${classId}/review`} 
                className="inline-block border border-[#1a1814] text-[#1a1814] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#1a1814] hover:text-[#f6f5f1] transition-colors text-center"
              >
                Akses Analisis & Pembahasan
              </Link>
              
              <Link 
                href="/dashboard" 
                className="inline-block bg-[#1a1814] text-[#f6f5f1] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#3d3a32] transition-colors text-center border border-[#1a1814]"
              >
                Tutup Sesi
              </Link>
            </div>
          </section>
        ) : questions?.length === 0 ? (
          // Empty State: Replaced gray dashed box with a stark inset warning
          <div className="border-l-2 border-[#c45530] bg-[#c45530]/5 p-6 mt-8">
            <p className="text-[#c45530] text-sm font-bold uppercase tracking-wide">
              Peringatan Sistem: Bank soal untuk kelas ini belum dikonfigurasi.
            </p>
          </div>
        ) : (
          // KONDISI 2: Ujian berlangsung
          <section className="mt-8">
            <ExamClientForm classId={classId} questions={(questions || []) as any[]} />
          </section>
        )}

      </div>
    </main>
  );
}