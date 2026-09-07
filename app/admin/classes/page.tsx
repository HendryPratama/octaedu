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
    <main className="min-h-screen bg-[#f6f5f1] font-sans text-[#1a1814] pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header Admin: Replaced floating card with a structural, heavy-bordered header */}
        <header className="pt-12 pb-8 mb-12 border-b-2 border-[#1a1814] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c45530]">
                Otoritas Administrator
              </span>
              <span className="text-xs font-medium text-[#3d3a32]">
                Sesi: {profile?.full_name}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#1a1814] tracking-tight">
              Sistem Manajemen Kelas
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-[#3d3a32] hover:text-[#1a1814] transition-colors border-b border-transparent hover:border-[#1a1814]"
            >
              Kembali ke Portal
            </Link>
            {/* Replaced soft shadow pill button with a stark rectangular block */}
            <Link 
              href="/admin/analytics" 
              className="bg-[#1a1814] text-[#f6f5f1] px-6 py-3 rounded-none text-sm font-medium hover:bg-[#3d3a32] transition-colors flex items-center gap-2"
            >
              <span>Akses Data Analitik ↗</span>
            </Link>
          </div>
        </header>
        
        {/* Otorisasi Kelas: Removed the white box container, placed directly on the background */}
        <section className="mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#3d3a32] mb-6">
            Otorisasi Akses (Menunggu Verifikasi)
          </h2>

          {pendingEnrollments?.length === 0 ? (
            // Empty state: Removed the dashed gray borders, used a flat minimal inset
            <div className="border-l-2 border-[#3d3a32]/20 pl-4 py-2">
              <p className="text-[#3d3a32] text-sm">Tidak ada antrean otorisasi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1814] text-xs text-[#1a1814] uppercase tracking-wider">
                    <th className="pb-4 font-bold">Identitas Pelajar</th>
                    <th className="pb-4 font-bold">Target Kelas</th>
                    <th className="pb-4 font-bold">Kontak / Institusi</th>
                    <th className="pb-4 font-bold text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d3a32]/20 text-sm">
                  {pendingEnrollments?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#3d3a32]/5 transition-colors">
                      <td className="py-4">
                        <p className="font-bold text-[#1a1814]">{item.profiles?.full_name}</p>
                        <p className="text-xs text-[#3d3a32] mt-0.5">{item.profiles?.email}</p>
                      </td>
                      <td className="py-4 font-bold text-[#c45530]">
                        {item.classes?.name}
                      </td>
                      <td className="py-4 text-xs text-[#3d3a32]">
                        <p className="font-medium text-[#1a1814]">WA: {item.profiles?.phone_number}</p>
                        <p className="mt-0.5">{item.profiles?.school}</p>
                      </td>
                      <td className="py-4 text-right">
                        <ApproveEnrollButton enrollmentId={item.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Layout Grid: Removed equal spacing, moved to an asymmetric 1:2 split without boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-24">
          
          {/* Kolom Kiri: Form Buat Kelas */}
          <aside className="lg:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3d3a32] mb-6 border-b border-[#3d3a32]/20 pb-4">
              Registrasi Kelas Baru
            </h2>
            {/* Note: Ensure CreateClassForm internally uses flat borders and solid dark buttons */}
            <CreateClassForm />
          </aside>

          {/* Kolom Kanan: Tabel Daftar Kelas */}
          <section className="lg:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3d3a32] mb-6 border-b border-[#3d3a32]/20 pb-4">
              Katalog Kelas Aktif
            </h2>

            {classes?.length === 0 ? (
              <div className="border-l-2 border-[#3d3a32]/20 pl-4 py-2">
                <p className="text-[#3d3a32] text-sm">Belum ada data kelas yang diregistrasi.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a1814] text-xs text-[#1a1814] uppercase tracking-wider">
                      <th className="pb-4 font-bold">Nomenklatur Kelas</th>
                      <th className="pb-4 font-bold">Tarif Dasar</th>
                      <th className="pb-4 font-bold text-right">Konfigurasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3d3a32]/20 text-sm">
                    {classes?.map((cls) => (
                      <tr key={cls.id} className="hover:bg-[#3d3a32]/5 transition-colors">
                        <td className="py-5 pr-4">
                          <p className="font-bold text-[#1a1814] text-base mb-1">{cls.name}</p>
                          <p className="text-xs text-[#3d3a32] max-w-xs">{cls.description || 'Tidak ada spesifikasi'}</p>
                        </td>
                        <td className="py-5 text-[#1a1814] font-serif font-bold text-lg">
                          Rp {cls.price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-5 text-right space-x-3">
                          {/* Replaced soft gray pill with sharp minimal outline button */}
                          <Link 
                            href={`/admin/classes/${cls.id}/questions`}
                            className="inline-block border border-[#3d3a32]/30 text-[#1a1814] px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wide hover:bg-[#1a1814] hover:text-[#f6f5f1] hover:border-[#1a1814] transition-colors"
                          >
                            Kelola Bank Soal
                          </Link>
                          <span className="inline-block">
                            <DeleteClassButton classId={cls.id} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}