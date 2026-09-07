# 🚀 Platform Ujian Daring (Tryout App)

Platform manajemen tryout dan ujian online berbasis web yang dikembangkan menggunakan **Next.js (App Router)**, **Supabase** (Autentikasi, Database, & RLS), dan **Tailwind CSS**. Aplikasi ini dirancang untuk dua peran utama: **Admin** (pengelola kelas dan soal) serta **Pelajar** (peserta ujian dan pendaftar).

---

## 🛠️ Tech Stack & Arsitektur
- **Framework:** Next.js 14+ / 15+ (App Router, Server Actions, Server & Client Components)
- **Database & Auth:** Supabase PostgreSQL (dengan Row Level Security & Storage)
- **Styling:** Tailwind CSS
- **Bahasa:** TypeScript

---

## 📋 Fitur Utama & Alur Sistem

### 1. Autentikasi & Manajemen Profil Pengguna
- **Registrasi & Login:** Autentikasi aman berbasis Supabase Auth.
- **Validasi Profil Wajib:** Pelajar yang baru mendaftar wajib melengkapi data diri (Nomor WhatsApp, Asal Sekolah, Usia) sebelum dapat mengakses katalog kelas.
- **Manajemen Peran (Role-Based):** Pemisahan akses otomatis antara `admin` dan `student`. Jika akun pelajar mencoba mengakses rute admin, sistem akan mengarahkan kembali ke dashboard pelajar.

### 2. Workspace Admin (Manajemen Kelas & Soal)
- **CRUD Kelas:** Admin dapat membuat, melihat, dan menghapus kelas/tryout lengkap dengan penetapan harga (Gratis atau Berbayar).
- **CRUD Soal Interaktif:** Pengelolaan soal pilihan ganda spesifik per kelas menggunakan tipe data `JSONB` untuk opsi jawaban dinamis serta kunci jawaban yang aman di sisi server.
- **Verifikasi Pendaftaran (Approval):** Panel khusus bagi admin untuk memantau permintaan akses kelas dari pelajar dan menyetujuinya secara instan.

### 3. Alur Pendaftaran & Pembayaran Manual (Pelajar)
- **Katalog Kelas:** Pelajar dapat melihat daftar kelas yang tersedia dan memilih kelas yang ingin diikuti.
- **Konfirmasi WhatsApp:** Pendaftaran kelas berbayar terintegrasi langsung dengan tombol interaktif WhatsApp ke nomor admin (`0895704254907`) dengan *template* pesan otomatis yang mencakup nama lengkap, email, dan nama kelas pilihan.
- **Aktivasi Akses:** Setelah admin mengonfirmasi pembayaran di WhatsApp dan menyetujuinya via Workspace Admin, status akses pelajar otomatis berubah dari `pending` menjadi `active`.

### 4. Sistem Pengerjaan Ujian & Penilaian Otomatis
- **Lembar Soal Interaktif:** Pelajar mengerjakan soal ujian secara *real-time* dengan opsi navigasi pilihan ganda yang terlindungi dari klik ganda (*double-submit protection*).
- **Kalkulasi Nilai Instan:** Sistem secara otomatis mencocokkan jawaban siswa dengan kunci jawaban di *database* dan mengonversi skor ke dalam skala 0–100.
- **Pembatasan Riwayat Otomatis:** Sistem secara cerdas membatasi riwayat penyimpanan hasil ujian pelajar (maksimal **3 riwayat hasil terakhir** per kelas), di mana data ujian terlama akan otomatis dihapus untuk menjaga agar penyimpanan *database* tetap efisien.

### 5. Review Jawaban & Tes Ulang (Retake)
- **Halaman Pembahasan (`/review`):** Menampilkan daftar lengkap soal beserta penanda visual jawaban (🟢 Hijau untuk benar, 🔴 Merah untuk salah) dan kejelasan kunci jawaban yang benar.
- **Fitur Tes Ulang (*Retake*):** Pelajar dapat melakukan *tryout* kembali dengan menekan tombol **"🔄 Tes Ulang"** yang mengarahkan mereka kembali ke lembar soal tanpa menghilangkan riwayat skor sebelumnya.

---

## 🗄️ Skema Database Supabase

1. **`profiles`**
   - `id` (UUID, relasi ke `auth.users`)
   - `full_name`, `email`, `role` (`admin`/`student`)
   - `school`, `phone_number`, `age`

2. **`classes`**
   - `id` (UUID, Primary Key)
   - `name`, `description`, `price`
   - `created_at`

3. **`class_enrollments`**
   - `id` (UUID, Primary Key)
   - `user_id` (Relasi ke `profiles`)
   - `class_id` (Relasi ke `classes`)
   - `status` (`pending` / `active`)
   - `created_at`

4. **`questions`**
   - `id` (UUID, Primary Key)
   - `class_id` (Relasi ke `classes`)
   - `question_text`
   - `options` (JSONB untuk opsi A, B, C, D, dst.)
   - `correct_answer` (String kunci jawaban)

5. **`exam_results`**
   - `id` (UUID, Primary Key)
   - `user_id` (Relasi ke `profiles`)
   - `class_id` (Relasi ke `classes`)
   - `score` (Integer)
   - `student_answers` (JSONB pilihan jawaban siswa)
   - `completed_at` (Timestamp waktu pengumpulan ujian)

---

## 📂 Struktur Direktori Proyek

```text
/app
  ├── actions/
  │   ├── auth.ts              # Server Actions untuk Autentikasi & Profil
  │   └── admin.ts             # Server Actions untuk Kelas, Soal, Enrollment, & Ujian
  ├── admin/
  │   └── classes/
  │       ├── page.tsx         # Dashboard Utama Admin (Daftar Kelas & Verifikasi Pending)
  │       ├── CreateClassForm.tsx
  │       ├── DeleteClassButton.tsx
  │       ├── ApproveEnrollButton.tsx
  │       └── [id]/
  │           └── questions/   # Manajemen Soal per Kelas
  ├── dashboard/
  │   ├── page.tsx             # Dashboard Pelajar (Katalog, Kelas Saya, & Status Ujian)
  │   ├── ProfileForm.tsx      # Form Pelengkap Data Diri Wajib
  │   └── EnrollButton.tsx     # Tombol Ambil Kelas Interaktif
  │   └── exams/
  │       └── [classId]/
  │           ├── page.tsx     # Lembar Ujian / Ringkasan Skor Terakhir
  │           ├── ExamClientForm.tsx # Komponen Pengerjaan Soal (Client Side)
  │           └── review/
  │               └── page.tsx # Halaman Pembahasan & Evaluasi Jawaban
  ├── login/                   # Halaman Masuk Akun
  ├── register/                # Halaman Pendaftaran Akun Baru
  ├── globals.css              # Konfigurasi Styling Tailwind CSS
  └── layout.tsx               # Root Layout Global


Untuk langkah pengembangan berikutnya (Next Steps), Anda bisa memilih salah satu atau beberapa fitur lanjutan berikut sesuai prioritas proyek Anda:

Timer / Penghitung Waktu Ujian Otomatis: Menambahkan batasan waktu pengerjaan (misalnya 60 menit per ujian) di komponen ExamClientForm sehingga ujian akan otomatis tersubmit ketika waktu habis. (sudah)

Dashboard Statistik & Leaderboard (Peringkat Nilai): Membuat halaman rekap bagi admin untuk melihat statistik nilai rata-rata seluruh siswa, atau tabel peringkat (leaderboard) antar pelajar di kelas tersebut berdasarkan skor tertinggi.
(sudah)

Ekspor Laporan Nilai (PDF / Excel): Menambahkan fitur bagi admin untuk mengunduh laporan hasil ujian seluruh siswa dalam format Excel atau PDF guna keperluan administrasi offline. (sudah)

Manajemen Sesi Ujian (Jadwal Buka/Tutup): Menambahkan kolom start_time dan end_time pada tabel kelas agar ujian hanya bisa dikerjakan pada rentang tanggal/waktu tertentu.