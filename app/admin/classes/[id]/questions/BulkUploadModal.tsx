'use client';

import { useState, useTransition } from 'react';
import { bulkUploadQuestions } from '@/app/actions/admin';

export default function BulkUploadModal({ classId }: { classId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let parsedQuestions: Array<{
          question_text: string;
          options: Record<string, string>;
          correct_answer: string;
        }> = [];

        // A. Tipe File JSON
        if (fileName.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          if (!Array.isArray(jsonData)) {
            throw new Error('Format JSON harus berupa Array of Objects.');
          }
          parsedQuestions = jsonData.map((item, idx) => {
            if (!item.question_text || !item.options || !item.correct_answer) {
              throw new Error(`Item ke-${idx + 1} di JSON tidak memiliki atribut wajib (question_text, options, correct_answer).`);
            }
            return {
              question_text: String(item.question_text),
              options: item.options,
              correct_answer: String(item.correct_answer).toUpperCase(),
            };
          });
        } 
        // B. Tipe File CSV / Excel (Tipe CSV)
        else if (fileName.endsWith('.csv')) {
          const lines = content.split(/\r\n|\n/).filter((line) => line.trim() !== '');
          if (lines.length < 2) {
            throw new Error('File CSV kosong atau tidak memiliki baris data.');
          }

          // Abaikan header (baris 0)
          for (let i = 1; i < lines.length; i++) {
            // Memisahkan nilai koma, menangani tanda kutip
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 7) {
              const [qText, optA, optB, optC, optD, optE, correct] = cols;
              parsedQuestions.push({
                question_text: qText,
                options: { A: optA, B: optB, C: optC, D: optD, E: optE },
                correct_answer: correct.toUpperCase(),
              });
            }
          }
        } else {
          throw new Error('Format file tidak didukung. Harap unggah .json atau .csv');
        }

        if (parsedQuestions.length === 0) {
          throw new Error('Tidak ada data soal yang dapat dibaca dari file ini.');
        }

        // Jalankan Server Action
        startTransition(async () => {
          const res = await bulkUploadQuestions(classId, parsedQuestions);
          if (res.error) {
            setMessage({ type: 'error', text: res.error });
          } else if (res.success) {
            setMessage({ type: 'success', text: res.success });
            setTimeout(() => {
              setIsOpen(false);
              setMessage(null);
            }, 1500);
          }
        });

      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Gagal memproses file.' });
      }
    };

    reader.readAsText(file);
    // Reset nilai input file agar bisa memilih file yang sama jika gagal
    e.target.value = '';
  };

  const downloadTemplateJSON = () => {
    const sampleJSON = [
      {
        question_text: "Berapakah hasil dari 12 x 12?",
        options: {
          A: "124",
          B: "144",
          C: "154",
          D: "164",
          E: "174"
        },
        correct_answer: "B"
      },
      {
        question_text: "Ibu kota negara Indonesia adalah...",
        options: {
          A: "Surabaya",
          B: "Bandung",
          C: "Jakarta / Nusantara",
          D: "Medan",
          E: "Makassar"
        },
        correct_answer: "C"
      }
    ];
    const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_soal_octaedu.json';
    a.click();
  };

  const downloadTemplateCSV = () => {
    const csvHeader = 'question_text,option_a,option_b,option_c,option_d,option_e,correct_answer\n';
    const csvRow1 = '"Berapakah 5 + 5?","8","9","10","11","12","C"\n';
    const csvRow2 = '"Siapa penemu lampu pijar?","Albert Einstein","Thomas Edison","Nikola Tesla","Isaac Newton","Galileo","B"\n';
    const blob = new Blob([csvHeader + csvRow1 + csvRow2], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_soal_octaedu.csv';
    a.click();
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
      >
        <span>📥 Bulk Import Soal (JSON / CSV)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-slate-100 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Bulk Upload Soal</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Unduh contoh templat berikut jika Anda belum memiliki format filenya:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={downloadTemplateJSON}
                  className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                >
                  📄 Download Templat JSON
                </button>
                <button
                  onClick={downloadTemplateCSV}
                  className="text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                >
                  📊 Download Templat CSV/Excel
                </button>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100/50 transition">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                disabled={isPending}
                id="bulk-file-input"
                className="hidden"
              />
              <label
                htmlFor="bulk-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  📁
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {isPending ? 'Sedang Memproses File...' : 'Klik untuk Pilih File (.json / .csv)'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Soal baru akan otomatis ditambahkan (append) ke daftar soal saat ini.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}