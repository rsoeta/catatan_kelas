# Catatan Kelas - Sistem Penilaian Siswa & Rekapitulasi Nilai Modern

Aplikasi web modern berbasis **React 18, Vite, Tailwind CSS, Lucide Icons**, dan **Supabase (PostgreSQL Cloud & Auth)** yang dirancang khusus untuk mempermudah guru dalam mengelola rombel (kelas), mencatat penilaian siswa (**Pengetahuan, Keterampilan, dan Sikap**) per-sesi/pertemuan, menghitung akumulasi nilai akhir secara otomatis berbasis bobot dinamis, serta mencetak laporan rekapitulasi nilai resmi.

Aplikasi ini dioptimalkan untuk di-deploy secara kilat dan gratis ke **Vercel** langsung dari repositori GitHub tanpa memerlukan kartu kredit.

---

## Daftar Isi

1. [Fitur Utama & Arsitektur](#1-fitur-utama--arsitektur)
2. [Standar UI/UX Mobile-First & DevSecOps](#2-standar-uiux-mobile-first--devsecops)
3. [Skema Database PostgreSQL (Supabase)](#3-skema-database-postgresql-supabase)
4. [Kredensial & Autentikasi Pengguna](#4-kredensial--autentikasi-pengguna)
5. [Panduan Instalasi & Pengujian Lokal](#5-panduan-instalasi--pengujian-lokal)
6. [Panduan Deployment ke Vercel (Auto-Deploy GitHub)](#6-panduan-deployment-ke-vercel-auto-deploy-github)
7. [Struktur Direktori Proyek](#7-struktur-direktori-proyek)

---

## 1. Fitur Utama & Arsitektur

### Core Features

1. **Sistem Autentikasi Guru (Supabase Auth)**:
   - Registrasi dan login akun guru berbasis email & password terenkripsi (Bcrypt bawaan Supabase Auth).
   - Pengamanan data menggunakan **Row-Level Security (RLS)** pada tingkat PostgreSQL, memastikan setiap guru hanya dapat membaca dan memodifikasi data rombel miliknya sendiri.
   - Sesi terproteksi menggunakan JWT secure token storage.

2. **Manajemen Rombel / Kelas Dinamis**:
   - Pembuatan dan pengelolaan data kelas dengan atribut: Nama Kelas, Tingkat (SMP/SMA/SMK: 7 - 12), Tahun Ajaran (contoh: `2025/2026`), Semester (Ganjil/Genap), Mata Pelajaran, dan Keterangan.
   - Pemilih kelas cepat (*Class Selector*) di bilah atas untuk beralih rombel secara instan.

3. **Manajemen Data Siswa & Impor Massal**:
   - Tambah siswa perorangan (Nama, NIS/NISN, Jenis Kelamin L/P, Catatan).
   - **Fitur Impor Massal (Bulk Import)**: Cukup salin dan tempel daftar nama dari Microsoft Excel atau format teks `NIS;Nama;L/P` untuk memasukkan puluhan siswa sekaligus dalam 1 detik.
   - Hapus siswa beserta riwayat nilainya secara aman.

4. **Sesi Pertemuan / Pembelajaran Mingguan**:
   - Penomoran pertemuan otomatis (Pertemuan #1, #2, dst.).
   - Pencatatan tanggal dan topik bahasan/materi pelajaran.
   - Navigasi tab sesi horizontal yang responsif.

5. **Grid Penilaian Interaktif & Auto-Calculate**:
   - Tiga aspek penilaian per pertemuan:
     - **Pengetahuan** (0 - 100)
     - **Keterampilan** (0 - 100)
     - **Sikap** (0 - 100)
   - Penyimpanan nilai otomatis (*instant save on blur*).
   - Validasi batas nilai (0 - 100).

6. **Kalkulasi Akumulasi Nilai & Predikat Otomatis**:
   - **Perhitungan Rata-rata per Aspek**:
     $$\text{Rata-rata Pengetahuan } (\bar{P}) = \frac{\sum \text{Nilai Pengetahuan}}{N \text{ Pertemuan}}$$
     $$\text{Rata-rata Keterampilan } (\bar{K}) = \frac{\sum \text{Nilai Keterampilan}}{N \text{ Pertemuan}}$$
     $$\text{Rata-rata Sikap } (\bar{S}) = \frac{\sum \text{Nilai Sikap}}{N \text{ Pertemuan}}$$
   - **Perhitungan Nilai Akhir Berbasis Bobot**:
     $$\text{Nilai Akhir} = \frac{(w_p \times \bar{P}) + (w_k \times \bar{K}) + (w_s \times \bar{S})}{100}$$
     *(Secara default: $w_p = 35\%$, $w_k = 35\%$, $w_s = 30\%$. Bobot dapat diubah bebas oleh guru asalkan total berjumlah $100\%$).*
   - **Konversi Predikat Otomatis**:
     - **A (Sangat Baik)**: $\ge 88.0$
     - **B (Baik)**: $76.0 - 87.9$
     - **C (Cukup)**: $65.0 - 75.9$
     - **D (Kurang)**: $< 65.0$

7. **Cetak Rekap Nilai Resmi (Print / PDF)**:
   - Layout cetak formal menggunakan CSS `@media print`.
   - Otomatis menyembunyikan navigasi dan tombol aksi saat dicetak atau disimpan sebagai PDF.
   - Dilengkapi kop rekap, data rombel, tabel nilai rata-rata, predikat, dan kolom tanda tangan resmi Kepala Sekolah & Guru Mata Pelajaran.

---

## 2. Standar UI/UX Mobile-First & DevSecOps

### Standar UI/UX Mobile-First
- **Stacked Responsive Cards**: Di layar smartphone (lebar `< 768px`), tabel beralih menjadi kartu terstruktur per siswa sehingga **TIDAK ADA horizontal scroll**, memudahkan penginputan langsung dari smartphone guru di dalam kelas.
- **Data Matrix Table**: Di layar laptop/desktop (`>= 768px`), tampilan berganti otomatis menjadi tabel matriks tabular lengkap.
- **Tipografi Harmonis**: Heading menggunakan **Ubuntu** dan teks antarmuka menggunakan **Quicksand** dari Google Fonts.
- **Target Sentuh Ergonomis**: Tombol dan input dirancang minimal 44–48px agar nyaman ditekan dengan jari.

### Standar DevSecOps
1. **Zero Hardcoded Secrets**: Tidak ada kredensial database atau token rahasia yang disimpan di dalam source code repository. Seluruh koneksi menggunakan Environment Variables (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`).
2. **Row-Level Security (RLS)**: Isolasi data ketat pada lapisan database PostgreSQL via `auth.uid() = user_id`. Guru A tidak akan pernah bisa mengakses data milik Guru B.
3. **Prepared Parameter Binding**: Seluruh komunikasi data via Supabase JS SDK ke REST API PostgREST kebal terhadap serangan SQL Injection.
4. **Client-Side Sanitization**: React secara native melindungi aplikasi dari serangan Cross-Site Scripting (XSS) dengan escaping otomatis terhadap seluruh string yang dirender.

---

## 3. Skema Database PostgreSQL (Supabase)

Jalankan perintah SQL berikut di **SQL Editor** pada dashboard Supabase Anda:

```sql
-- 1. TABEL KELAS (CLASSES)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20) DEFAULT '10',
    academic_year VARCHAR(20) DEFAULT '2025/2026',
    semester VARCHAR(20) DEFAULT 'Ganjil',
    subject VARCHAR(100) DEFAULT 'Mata Pelajaran Umum',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL SISWA (STUDENTS)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    nis VARCHAR(50),
    full_name VARCHAR(150) NOT NULL,
    gender CHAR(1) DEFAULT 'L' CHECK (gender IN ('L', 'P')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PERTEMUAN (MEETINGS)
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    meeting_number INT DEFAULT 1,
    meeting_date DATE DEFAULT CURRENT_DATE,
    topic VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL NILAI (GRADES)
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    score_knowledge NUMERIC(5,2) DEFAULT 0 CHECK (score_knowledge >= 0 AND score_knowledge <= 100),
    score_skill NUMERIC(5,2) DEFAULT 0 CHECK (score_skill >= 0 AND score_skill <= 100),
    score_attitude NUMERIC(5,2) DEFAULT 0 CHECK (score_attitude >= 0 AND score_attitude <= 100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PENGATURAN BOBOT NILAI (SETTINGS)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    weight_knowledge INT DEFAULT 35,
    weight_skill INT DEFAULT 35,
    weight_attitude INT DEFAULT 30,
    google_sheet_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own classes" ON classes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own students" ON students FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own meetings" ON meetings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own grades" ON grades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own settings" ON settings FOR ALL USING (auth.uid() = user_id);
```

---

## 4. Kredensial & Autentikasi Pengguna

Aplikasi ini menggunakan sistem **Supabase Auth Dinamis** (bukan kredensial statis/hardcoded):
1. **Tidak Ada Akun Bawaan Kaku**: Anda tidak perlu menebak username atau password bawaan dari kode sumber.
2. **Pendaftaran Akun Baru**:
   - Buka aplikasi di browser.
   - Klik **"Daftar sekarang"** pada modal autentikasi.
   - Masukkan:
     - **Nama Lengkap & Gelar** (contoh: `Ahmad Fauzi, S.Pd.`)
     - **Email** (contoh: `guru@sekolah.sch.id`)
     - **Kata Sandi** (minimal 6 karakter)
   - Klik **Daftar Sekarang**. Akun akan langsung terdaftar dan dapat langsung digunakan.

> [!TIP]
> **Tips Supabase Auth**: Jika Anda ingin pendaftaran langsung aktif tanpa perlu konfirmasi email, buka dashboard Supabase > **Authentication** > **Providers** > **Email**, lalu nonaktifkan opsi **"Confirm email"**.

---

## 5. Panduan Instalasi & Pengujian Lokal

### Prasyarat
- **Node.js**: Versi 18+ atau 20+ (rekomendasi v20+).
- **NPM**: Versi 9+ atau 10+.

### Langkah-Langkah Menjalankan di Komputer Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/<username-anda>/catatan_kelas.git
   cd catatan_kelas
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan masukkan kredensial dari project Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka browser di alamat `http://localhost:5173`.

5. **Uji Build Produksi**:
   ```bash
   npm run build
   ```

---

## 6. Panduan Deployment ke Vercel (Auto-Deploy GitHub)

Deployment ke **Vercel** 100% gratis, tanpa memerlukan kartu kredit, dan langsung terintegrasi dengan **GitHub Desktop**:

1. **Push Perubahan ke GitHub**:
   - Buka aplikasi **GitHub Desktop**.
   - Masukkan pesan commit (contoh: `Deploy React app`).
   - Klik **Commit to master/main** lalu klik **Push origin**.

2. **Import ke Vercel**:
   - Buka [Vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
   - Di dashboard Vercel, klik tombol **Add New...** > **Project**.
   - Pilih repositori `catatan_kelas` Anda, lalu klik **Import**.

3. **Konfigurasi Environment Variables di Vercel**:
   - Vercel otomatis mendeteksi framework preset: **Vite**.
   - Buka accordion **Environment Variables**, lalu tambahkan 2 variabel berikut:
     | Name | Value |
     | :--- | :--- |
     | `VITE_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` |
     | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` *(anon key Supabase Anda)* |

4. **Deploy**:
   - Klik tombol **Deploy**.
   - Tunggu sekitar 20–30 detik.
   - Website Anda langsung aktif dan dapat diakses publik melalui domain resmi gratis dari Vercel (contoh: `https://catatan-kelas.vercel.app`).

Setiap kali Anda mengubah kode di komputer dan melakukan **Push** lewat GitHub Desktop, Vercel akan otomatis meng-update websitenya secara instan!

---

## 7. Struktur Direktori Proyek

```text
catatan_kelas/
├── index.html               # Entry point HTML & Google Fonts
├── package.json             # Dependensi React, Tailwind, Supabase, Lucide
├── vite.config.js           # Konfigurasi bundler Vite
├── tailwind.config.js       # Konfigurasi Tailwind CSS
├── postcss.config.js        # Konfigurasi PostCSS
├── .env.example             # Contoh format environment Supabase
├── src/
│   ├── main.jsx             # Entry point React DOM
│   ├── App.jsx              # Komponen utama antarmuka & alur data
│   ├── index.css            # Styling Tailwind & print rules
│   ├── context/
│   │   └── AuthContext.jsx  # State autentikasi Supabase global
│   ├── lib/
│   │   └── supabase.js      # Inisialisasi Supabase client
│   └── components/
│       ├── Navbar.jsx               # Header navigasi & profil guru
│       ├── AuthModal.jsx            # Modal login & registrasi guru
│       ├── ClassModal.jsx           # Modal pembuatan/pengeditan rombel
│       ├── StudentModal.jsx         # Modal input siswa & impor massal Excel
│       ├── MeetingModal.jsx         # Modal pembuatan sesi/pertemuan
│       ├── GradeTable.jsx           # Grid penilaian (Desktop Matrix + Mobile Cards)
│       ├── WeightSettingsModal.jsx  # Modal penyesuaian bobot nilai (P, K, S)
│       └── PrintReport.jsx          # Template cetak laporan resmi PDF
└── README.md                # Dokumentasi arsitektur & panduan sistem
```

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE). Bebas digunakan, dikembangkan, dan dimodifikasi untuk keperluan institusi pendidikan.
