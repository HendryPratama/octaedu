import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CreateQuestionForm from './CreateQuestionForm';
import DeleteQuestionButton from './DeleteQuestionButton';
import BulkUploadModal from './BulkUploadModal';

export default async function AdminQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: classId } = await params;
  const supabase = await createClient();

  // 1. Validasi akses admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  // 2. Ambil informasi kelas saat ini
  const { data: currentClass } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  // 3. Ambil daftar soal yang terhubung dengan kelas ini
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: true });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Navigasi */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
          <div>
            <Link href="/admin/classes" className="text-xs font-semibold text-blue-600 hover:underline">
              ← Kembali ke Daftar Kelas
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              Kelola Soal: {currentClass?.name}
            </h1>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
            Total Soal: {questions?.length || 0}
          </span>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
          
          {/* Kolom Kiri: Form Tambah Soal */}
          <div className="lg:col-span-1 space-y-4">
            {/* 2. Tambahkan Modal Bulk Upload */}
            <BulkUploadModal classId={classId} />
            
            {/* Form Manual Input */}
            <CreateQuestionForm classId={classId} />
          </div>

          {/* Kolom Kanan: List Soal */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Daftar Pertanyaan</h2>

              {questions?.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Belum ada soal pada kelas ini.
                </p>
              ) : (
                <div className="space-y-6">
                  {questions?.map((q, index) => {
                    const options = q.options as Record<string, string>;
                    return (
                      <div key={q.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 relative group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            Soal #{index + 1}
                          </span>
                          <DeleteQuestionButton questionId={q.id} classId={classId} />
                        </div>

                        <p className="font-medium text-slate-800 mb-3 text-sm">{q.question_text}</p>

                        {/* Pilihan Opsi A-E */}
                        <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 mb-3">
                          {Object.entries(options || {}).map(([key, value]) => (
                            <div 
                              key={key} 
                              className={`px-3 py-1.5 rounded flex gap-2 ${
                                q.correct_answer === key 
                                  ? 'bg-green-100 text-green-800 font-semibold border border-green-200' 
                                  : 'bg-white border border-slate-200'
                              }`}
                            >
                              <span className="w-4 font-bold">{key}.</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-slate-400">
                          Kunci Jawaban Benar: <span className="font-bold text-green-600">{q.correct_answer}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}