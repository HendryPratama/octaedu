'use client';

export default function ExportButton({ data }: { data: any[] }) {
  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    // 1. Buat Header CSV
    const headers = ['Peringkat', 'Nama Peserta', 'Email', 'Asal Sekolah', 'Kelas / Tryout', 'Skor Akhir', 'Waktu Selesai'];
    
    // 2. Petakan baris data
    const rows = data.map((res, index) => {
      const profile = res.profiles || {};
      const cls = res.classes || {};
      const formattedDate = new Date(res.completed_at).toLocaleString('id-ID');

      return [
        `#${index + 1}`,
        `"${profile.full_name || 'Tanpa Nama'}"`,
        `"${profile.email || '-'}"`,
        `"${profile.school || '-'}"`,
        `"${cls.name || '-'}"`,
        res.score,
        `"${formattedDate}"`
      ];
    });

    // 3. Gabungkan menjadi teks CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 4. Unduh file via Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Nilai_OctaEdu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExportCSV}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
    >
      <span>📥 Unduh Laporan (Excel / CSV)</span>
    </button>
  );
}