'use server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Fungsi untuk proses Login
export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Jika gagal login, lempar error ke UI form
    return { error: error.message }
  }

  // Jika berhasil, arahkan ke dashboard
  redirect('/dashboard')
}

// Fungsi untuk proses Registrasi
export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=Akun berhasil dibuat. Silakan login.')
}

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Dapatkan data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Anda belum login' }
  }

  // Ambil input dari form
  const phoneNumber = formData.get('phone_number') as string
  const age = parseInt(formData.get('age') as string)
  const school = formData.get('school') as string

  // Update tabel profiles
  const { error } = await supabase
    .from('profiles')
    .update({
      phone_number: phoneNumber,
      age: age,
      school: school
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Jika berhasil, muat ulang halaman dashboard agar form hilang
  revalidatePath('/dashboard', 'page')
  return { success: true }
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // URL tujuan setelah user mengklik link di email (kita arahkan ke halaman reset password)
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Instruksi reset password telah dikirim ke email Anda. Cek kotak masuk atau folder spam.' }
}

export async function updateNewPassword(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=Password berhasil diubah. Silakan login kembali.')
}