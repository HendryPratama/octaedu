export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CreateClassForm from './CreateClassForm';
import DeleteClassButton from './DeleteClassButton';
import ApproveEnrollButton from './ApproveEnrollButton';

export default async function AdminClassesPage() {
  
  const supabase = await createClient();

  const { data: pendingEnrollments } = await supabase
    .from('class_enrollments')
    .select(`
        id,
        status,
        created_at,
        profiles (
        full_name,
        email,
        phone_number,
        school
        ),
        classes (
        name
        )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  

  // 1. Cek keamanan: pastikan login & berhak akses admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();


  if (profile?.role !== 'admin') {
    redirect('/dashboard'); // Jika bukan admin, tendang ke dashboard pelajar
  }

  // 2. Ambil daftar semua kelas dari database
  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Admin */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
          <div>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Workspace Admin
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              Manajemen Kelas & Ujian
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{profile?.full_name}</p>
            <Link href="/dashboard" className="text-xs text-blue-600 hover:underline">
              Kembali ke Dashboard Utama
            </Link>
          </div>
          <Link 
            href="/admin/analytics" 
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
            >
            <span>📊 Lihat Rekapitulasi & Statistik</span>
            </Link>
        </div>
        
        {/* Bagian Verifikasi Pembayaran / Pendaftaran Pending */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Permintaan Akses Kelas (Menunggu Konfirmasi Pembayaran)
        </h2>

        {pendingEnrollments?.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            Tidak ada permintaan akses yang tertunda.
            </p>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Pelajar</th>
                    <th className="pb-3 font-semibold">Kelas Diminta</th>
                    <th className="pb-3 font-semibold">Kontak / Sekolah</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                {pendingEnrollments?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3">
                        <p className="font-semibold text-slate-800">{item.profiles?.full_name}</p>
                        <p className="text-xs text-slate-500">{item.profiles?.email}</p>
                    </td>
                    <td className="py-3 font-medium text-blue-600">
                        {item.classes?.name}
                    </td>
                    <td className="py-3 text-xs text-slate-600">
                        <p>WA: {item.profiles?.phone_number}</p>
                        <p>Sekolah: {item.profiles?.school}</p>
                    </td>
                    <td className="py-3 text-right">
                        <ApproveEnrollButton enrollmentId={item.id} />
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>

        {/* Layout Grid: Form Tambah di Kiri, Daftar Kelas di Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Form Buat Kelas */}
          <div className="lg:col-span-1">
            <CreateClassForm />
          </div>

          {/* Kolom Kanan: Tabel Daftar Kelas */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Daftar Kelas Tersedia</h2>

              {classes?.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Belum ada kelas yang dibuat. Silakan buat melalui form di samping.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                        <th className="pb-3 font-semibold">Nama Kelas</th>
                        <th className="pb-3 font-semibold">Harga</th>
                        <th className="pb-3 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {classes?.map((cls) => (
                        <tr key={cls.id} className="hover:bg-slate-50/50">
                          <td className="py-4">
                            <p className="font-semibold text-slate-800">{cls.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{cls.description || 'Tidak ada deskripsi'}</p>
                          </td>
                          <td className="py-4 text-slate-600 font-medium">
                            Rp {cls.price.toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 text-right space-x-2">
                            {/* Tombol menuju manajemen soal khusus kelas ini */}
                            <Link 
                              href={`/admin/classes/${cls.id}/questions`}
                              className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                            >
                              Kelola Soal
                            </Link>
                            <DeleteClassButton classId={cls.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}