'use client';
import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { submitExam } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function ExamClientForm({ classId, questions }: { classId: string, questions: any[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Timer state: 60 menit = 3600 detik (bisa diubah sesuai kebutuhan)
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60); 
  const router = useRouter();

  // Gunakan useRef untuk menyimpan nilai answers terbaru agar dapat diakses di dalam interval timer tanpa re-trigger effect
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleOptionChange = (questionId: string, optionKey: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  // Fungsi submit utama (dibungkus useCallback agar stabil)
  const handleFinalSubmit = useCallback(async (currentAnswers: Record<string, string>) => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    startTransition(async () => {
      const res = await submitExam(classId, currentAnswers);
      if (res?.error) {
        alert(res.error);
        setIsSubmitted(false);
      } else {
        router.refresh();
        window.location.href = `/dashboard/exams/${classId}/review`;
      }
    });
  }, [classId, isSubmitted, router]);

  // Timer Countdown Effect
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('⏰ Waktu ujian telah habis! Sistem akan mengumpulkan jawaban Anda secara otomatis.');
          handleFinalSubmit(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, handleFinalSubmit]);

  // Format detik ke MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;

    if (confirm('Apakah Anda yakin ingin mengumpulkan jawaban ujian ini?')) {
      handleFinalSubmit(answers);
    }
  };

  // Tentukan warna latar timer (berubah jadi merah jika sisa < 5 menit / 300 detik)
  const isUrgent = timeLeft <= 300;

  return (
    <form onSubmit={handleSubmitClick} className="space-y-6">
      
      {/* Floating / Sticky Timer Bar di atas lembar soal */}
      <div className="sticky top-4 z-40 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Sisa Waktu Ujian</span>
          <span className={`text-xl font-black ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
            ⏳ {formatTime(timeLeft)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Status Pengerjaan</span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            Sedang Berlangsung
          </span>
        </div>
      </div>

      {/* Daftar Soal */}
      {questions.map((q, index) => {
        const options = q.options as Record<string, string>;
        return (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <p className="font-semibold text-slate-800 mb-4 text-sm">
              <span className="text-blue-600 mr-2">#{index + 1}</span>
              {q.question_text}
            </p>

            <div className="space-y-2">
              {Object.entries(options || {}).map(([key, value]) => {
                const isSelected = answers[q.id] === key;
                return (
                  <label 
                    key={key} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium' 
                        : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={key}
                      checked={isSelected}
                      disabled={isSubmitted || isPending}
                      onChange={() => handleOptionChange(q.id, key)}
                      className="text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="w-5 font-bold text-xs">{key}.</span>
                    <span className="text-sm">{value}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isPending || isSubmitted}
        className="w-full bg-blue-600 py-3.5 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm disabled:bg-blue-300"
      >
        {isPending || isSubmitted ? 'Mengirim & Menghitung Nilai...' : 'Selesai & Kumpulkan Ujian'}
      </button>
    </form>
  );
}