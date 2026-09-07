'use client';

export default function ClassFilter({ 
  classesList, 
  currentClassId 
}: { 
  classesList: { id: string; name: string }[]; 
  currentClassId?: string 
}) {
  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      <span className="text-xs font-bold text-slate-500 shrink-0">Filter Kelas:</span>
      <div className="flex gap-2 w-full md:w-auto">
        <a
          href="/admin/analytics"
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
            !currentClassId 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Kelas
        </a>
        
        <select
          defaultValue={currentClassId || ''}
          onChange={(e) => {
            const val = e.target.value;
            window.location.href = val ? `/admin/analytics?classId=${val}` : '/admin/analytics';
          }}
          className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Pilih Kelas Spesifik...</option>
          {classesList.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}