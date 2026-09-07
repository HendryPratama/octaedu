'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Fungsi untuk menambah kelas baru
export async function createClass(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // 1. Validasi user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Pastikan user tersebut benar-benar admin di tabel profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Akses ditolak. Anda bukan admin.' }
  }

  // 3. Ambil data dari form
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string) || 0

  // 4. Simpan ke tabel classes
  const { error } = await supabase.from('classes').insert({
    name,
    description,
    price,
    created_by: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/classes')
  return { success: 'Kelas berhasil dibuat!' }
}

// Fungsi untuk menghapus kelas
export async function deleteClass(classId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/classes')
  return { success: true }
}


// Fungsi untuk menambah soal ke dalam kelas tertentu
export async function createQuestion(classId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const questionText = formData.get('question_text') as string
  const optionA = formData.get('option_a') as string
  const optionB = formData.get('option_b') as string
  const optionC = formData.get('option_c') as string
  const optionD = formData.get('option_d') as string
  const optionE = formData.get('option_e') as string
  const correctAnswer = formData.get('correct_answer') as string

  // Susun opsi pilihan dalam bentuk struktur JSONB yang kompatibel dengan database kita
  const optionsJson = {
    A: optionA,
    B: optionB,
    C: optionC,
    D: optionD,
    E: optionE
  }

  const { error } = await supabase.from('questions').insert({
    class_id: classId,
    question_text: questionText,
    options: optionsJson,
    correct_answer: correctAnswer
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/classes/${classId}/questions`)
  return { success: 'Soal berhasil ditambahkan!' }
}

// Fungsi untuk menghapus soal
export async function deleteQuestion(questionId: string, classId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/classes/${classId}/questions`)
  return { success: true }
}

// Fungsi bagi pelajar untuk mendaftar/mengikuti kelas
export async function enrollClass(classId: string) {
  const supabase = await createClient()

  // 1. Ambil data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Anda harus login terlebih dahulu.' }

  // 2. Cek apakah user sudah terdaftar di kelas ini sebelumnya
  const { data: existingEnrollment } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('user_id', user.id) // Diubah dari student_id ke user_id
    .eq('class_id', classId)
    .single()

  if (existingEnrollment) {
    return { error: 'Anda sudah mendaftar kelas ini. Menunggu konfirmasi admin atau kelas sudah aktif.' }
  }

  // 3. Masukkan data ke tabel dengan status default 'pending' (menunggu konfirmasi manual admin)
  const { error } = await supabase.from('class_enrollments').insert({
    user_id: user.id, // Diubah dari student_id
    class_id: classId,
    status: 'pending' // Diubah dari payment_status ke status
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: 'Berhasil mendaftar! Silakan hubungi admin.' }
}

// Fungsi admin untuk mengaktifkan akses kelas pelajar
export async function approveEnrollment(enrollmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('class_enrollments')
    .update({ status: 'active' })
    .eq('id', enrollmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/classes')
  return { success: 'Akses kelas berhasil diaktifkan!' }
}

// Fungsi untuk memproses jawaban ujian dan menghitung skor
export async function submitExam(classId: string, studentAnswers: Record<string, string>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Ambil seluruh soal dan kunci jawaban yang benar untuk kelas ini
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('class_id', classId)

  if (qError || !questions || questions.length === 0) {
    return { error: 'Soal ujian tidak ditemukan.' }
  }

  // 2. Hitung jumlah jawaban yang benar
  let correctCount = 0
  const totalQuestions = questions.length

  questions.forEach((q) => {
    const studentChoice = studentAnswers[q.id]
    if (studentChoice && studentChoice === q.correct_answer) {
      correctCount++
    }
  })

  const score = Math.round((correctCount / totalQuestions) * 100)

  // 3. Batasi riwayat: Ambil semua riwayat ujian user ini untuk kelas ini (diurutkan dari yang terbaru)
  const { data: existingResults } = await supabase
    .from('exam_results')
    .select('id, completed_at')
    .eq('user_id', user.id)
    .eq('class_id', classId)
    .order('completed_at', { ascending: false })

  // Jika sudah ada 3 atau lebih, hapus yang paling lama (kelebihannya)
  if (existingResults && existingResults.length >= 3) {
    // Ambil ID dari hasil-hasil yang posisinya di indeks ke-2 ke bawah (paling lama)
    const idsToDelete = existingResults.slice(2).map(r => r.id)
    if (idsToDelete.length > 0) {
      await supabase
        .from('exam_results')
        .delete()
        .in('id', idsToDelete)
    }
  }

  // 4. Simpan hasil ujian baru ke tabel exam_results
  const { error: insertError } = await supabase.from('exam_results').insert({
    user_id: user.id,
    class_id: classId,
    score: score,
    student_answers: studentAnswers
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath(`/dashboard/exams/${classId}`)
  revalidatePath(`/dashboard/exams/${classId}/review`)
  return { success: true, score, correctCount, totalQuestions }
}

// Fungsi untuk menghapus riwayat ujian agar siswa bisa mengulang
export async function retakeExam(classId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Hapus data dari tabel exam_results berdasarkan user_id dan class_id
  const { error } = await supabase
    .from('exam_results')
    .delete()
    .eq('user_id', user.id)
    .eq('class_id', classId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/exams/${classId}`)
  return { success: true }
}