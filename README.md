# Catatan Kelas - Sistem Penilaian Siswa & Rekapitulasi Google Sheets

Aplikasi web modern berbasis **PHP 8.4+ / CodeIgniter 4** dan **Tailwind CSS** yang dirancang khusus untuk mencatat penilaian siswa (**Pengetahuan, Keterampilan, dan Sikap**) di berbagai kelas (rombongan belajar) per-minggu atau per-pertemuan. Pada akhir semester/periode, nilai diakumulasikan dan dibagi dengan jumlah pertemuan sehingga menghasilkan nilai akhir pada skala **0 - 100**, lengkap dengan predikat otomatis (A, B, C, D) serta sinkronisasi awan dua arah via **Google Sheets API**.

---

## Daftar Isi

1. [Fitur Utama & Arsitektur](#1-fitur-utama--arsitektur)
2. [Standar UI/UX & DevSecOps](#2-standar-uiux--devsecops)
3. [Kebutuhan Server & Sistem](#3-kebutuhan-server--sistem)
4. [Panduan Instalasi & Pengujian Lokal](#4-panduan-instalasi--pengujian-lokal)
5. [Panduan Lengkap Deployment ke cPanel](#5-panduan-lengkap-deployment-ke-cpanel)
   - [Metode 1: Best Practice (Struktur Terpisah di Luar public_html)](#metode-1-best-practice-rekomendasi---di-luar-public_html)
   - [Metode 2: Single Directory (Langsung di dalam public_html dengan .htaccess)](#metode-2-single-directory-langsung-di-public_html)
   - [Konfigurasi Versi PHP & Ekstensi di cPanel](#konfigurasi-versi-php--ekstensi-di-cpanel)
   - [Konfigurasi Database MySQL di cPanel](#konfigurasi-database-mysql-di-cpanel)
   - [Konfigurasi File Environment (.env) Produksi](#konfigurasi-file-environment-env-produksi)
   - [Pengaturan Izin Akses Folder (File Permissions)](#pengaturan-izin-akses-folder-file-permissions)
   - [Konfigurasi Otomasi Cron Job di cPanel](#konfigurasi-otomasi-cron-job-di-cpanel)
6. [Panduan Integrasi Google Sheets API](#6-panduan-integrasi-google-sheets-api)
7. [Troubleshooting & Solusi Error cPanel](#7-troubleshooting--solusi-error-cpanel)

---

## 1. Fitur Utama & Arsitektur

### Core Features

1. **Fitur 1 - Sistem Autentikasi Admin & RBAC**:
   - Validasi akun admin dinamis dari database menggunakan `password_hash()` (Bcrypt). Kredensial tidak di-hardcode.
   - Proteksi brute-force login dengan _Rate Limiting / Throttler_ (maks. 5 percobaan gagal per menit).
   - Regenerasi ID sesi otomatis saat login untuk memitigasi serangan _Session Fixation_.
   - Manajemen Profil & pembaruan Password terenkripsi dengan validasi regex kompleksitas (huruf besar, kecil, angka, min. 8 karakter).
   - _Session idle timeout_ otomatis setelah 2 jam tidak ada aktivitas.

2. **Fitur 2 - Dashboard Tabel Rekapitulasi Data**:
   - Metrik statistik: Total Kelas, Total Siswa, Total Pertemuan, dan Rata-rata Nilai Kelas (0-100).
   - Pemilih kelas cepat (_Class Selector_) untuk beralih antar-rombel.
   - **Perhitungan Akumulasi Nilai**:
     $$\text{Rata-rata Pengetahuan } (\bar{P}) = \frac{\sum \text{Nilai Pengetahuan}}{N \text{ Pertemuan}}$$
     $$\text{Rata-rata Keterampilan } (\bar{K}) = \frac{\sum \text{Nilai Keterampilan}}{N \text{ Pertemuan}}$$
     $$\text{Rata-rata Sikap } (\bar{S}) = \frac{\sum \text{Nilai Sikap}}{N \text{ Pertemuan}}$$
     $$\text{Nilai Akhir} = \frac{(w_p \times \bar{P}) + (w_k \times \bar{K}) + (w_s \times \bar{S})}{100}$$
   - Konversi predikat otomatis:
     - **A (Sangat Baik)**: $\ge 88.0$
     - **B (Baik)**: $76.0 - 87.9$
     - **C (Cukup)**: $65.0 - 75.9$
     - **D (Perlu Bimbingan)**: $< 65.0$

3. **Fitur 3 - Form Input dengan Validasi**:
   - Manajemen Kelas, Data Siswa, dan Sesi Pertemuan mingguan.
   - Fitur **Impor Massal Siswa** (cukup copy-paste daftar nama dari Excel atau format `NIS;Nama;L/P`).
   - Grid input nilai Pengetahuan, Keterampilan, dan Sikap dengan _live calculated average_ per pertemuan.
   - Validasi angka ketat rentang **0 - 100** baik di sisi klien maupun server.
   - Simpan satuan cepat via AJAX (_Quick Save Single_) dan simpan massal seluruh kelas (_Batch Save_).
   - Notifikasi interaktif berbasis **SweetAlert2** (tidak ada `alert()` atau `confirm()` bawaan browser).

4. **Fitur 4 - Export Laporan ke Excel & PDF**:
   - **Export Excel (CSV)**: Encoding **UTF-8 BOM** agar karakter tabel langsung terbaca rapi di Microsoft Excel.
   - **Cetak Laporan PDF**: Desain cetak siap pakai (`@media print`) dengan Kop Resmi, data rombel, tabel nilai, legenda predikat, dan blok tanda tangan Kepala Sekolah & Guru Pengampu.
   - **Sinkronisasi Google Sheets**: Ekspor data langsung ke cloud spreadsheet.

---

## 2. Standar UI/UX & DevSecOps

### Standar UI/UX Mobile-First

- **Strictly Mobile-First**: Di layar smartphone/tablet, tampilan tabel beralih ke **Stacked Responsive Cards** sehingga **TIDAK ADA horizontal scroll**, dengan tombol aksi tersusun rapi di sisi kanan. Di layar laptop/desktop, tabel beralih ke layout matriks tabular yang luas.
- **Fluid Flexbox**: Layout responsif menggunakan `display: flex; flex-wrap: wrap;` tanpa ketergantungan media query statis yang kaku.
- **Target Sentuh**: Semua elemen interaktif (tombol, input, dropdown) memiliki ukuran minimal **48x48px** (`min-h-[48px] min-w-[48px]`).
- **Tipografi**: Kombinasi Google Fonts **Ubuntu** (heading) dan **Quicksand** (body).
- **SweetAlert2 Global**: Fungsi reusable `showSuccess(msg)`, `showError(msg)`, `confirmDelete(formId, name)`, dan `confirmAction()`.

### Standar 20 DevSecOps Checks

1. **Object-Level RBAC**: Setiap operasi (GET, POST, PUT, DELETE) memvalidasi `WHERE user_id = currently_logged_in_user_id`.
2. **UUIDv4**: Semua entitas menggunakan UUID acak 36-karakter, mencegah eksploitasi _ID Enumeration / Insecure Direct Object Reference (IDOR)_.
3. **Generic Error Masking**: Permintaan ke resource milik user lain mengembalikan 404/403 generik tanpa membocorkan keberadaan data.
4. **Prepared Statements**: Seluruh kueri menggunakan Query Builder CodeIgniter 4 dengan parameter binding (kebal terhadap SQL Injection).
5. **Dynamic Password Hashing**: Password disimpan menggunakan algoritma Bcrypt via `password_hash()` (tidak di-hardcode).
6. **CSRF Protection**: Token acak `csrf_test_name` wajib disertakan pada form POST dan header AJAX (`X-CSRF-TOKEN`).
7. **XSS Sanitization**: Seluruh output escaping menggunakan helper `esc()` dan sanitasi HTML context-aware.
8. **Secure HTTP Headers**: Filter `DevSecOpsFilter` menambahkan `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
9. **Anti-Session Hijacking**: Cookie sesi diatur `HTTPOnly`, `SameSite=Lax`, dan regenerasi session ID saat login.
10. **Brute-Force Guard**: Rate limiter membatasi percobaan login maksimal 5 kali per menit per IP.
11. **Strict Input Validation**: Validasi tipe data numerik (0-100), tanggal `Y-m-d`, dan pembersihan string.
12. **Production Error Masking**: Stack trace sensitif disembunyikan saat `CI_ENVIRONMENT = production`.
13. **Directory Browsing Disabled**: Direktif `Options -Indexes` pada konfigurasi Apache.
14. **Environment Isolation**: File kredensial `.env` dilindungi dan diabaikan dari git.
15. **Safe File Upload**: Pemeriksaan MIME-type dan ekstensi ketat untuk file kredensial JSON.
16. **Strict Content-Type**: Header `application/json` pada respons endpoint API.
17. **Open Redirect Prevention**: Pengalihan URL dibatasi hanya pada rute internal aplikasi.
18. **Anti-Caching Header**: Header `Cache-Control: no-store, no-cache` pada seluruh halaman terotentikasi.
19. **Session Expiry**: Sesi otomatis hangus jika tidak ada aktivitas selama 2 jam (7200 detik).
20. **Secure Logout**: Penghapusan total data sesi dan invalidasi cookie saat logout.

---

## 3. Kebutuhan Server & Sistem

- **PHP Version**: PHP 8.2, 8.3, 8.4, atau 8.5
- **Ekstensi PHP Wajib**:
  - `intl` (Internationalization extension)
  - `mbstring` (Multibyte string support)
  - `curl` (Koneksi ke Google Sheets API)
  - `openssl` (Pembuatan token JWT Google Service Account)
  - `json` (Parsing data payload & API)
  - `fileinfo` (Validasi berkas upload)
  - `zip` (Dukungan packaging / kompresi berkas)
  - `pdo_mysql` & `mysqli` (Jika menggunakan database MySQL / MariaDB)
  - `pdo_sqlite` & `sqlite3` (Jika menggunakan database SQLite3)
- **Web Server**: Apache dengan modul `mod_rewrite` aktif (standar cPanel)

---

## 4. Panduan Instalasi & Pengujian Lokal

### 1. Clone Repository & Install Dependensi

```bash
git clone https://github.com/username/catatan_kelas.git
cd catatan_kelas
composer install
```

### 2. Konfigurasi Environment Lokal

Buat salinan file `.env` dan generate encryption key:

```bash
cp env .env
php spark key:generate
```

Pastikan pengaturan database di `.env` telah diset (secara default menggunakan SQLite3):

```ini
database.default.DBDriver = SQLite3
database.default.database = catatan_kelas.db
```

### 3. Migrasi & Seed Data Awal

```bash
php spark migrate
php spark db:seed CatatanKelasSeeder
```

### 4. Eksekusi Automated Test Suite

Jalankan verifikasi sistem menyeluruh:

```bash
php spark app:test
```

_Output yang diharapkan: 8 pengujian lulus 100% (Auth, RBAC, Akumulasi Nilai 0-100, Google Sheets fallback)._

### 5. Menjalankan Server Lokal

```bash
php spark serve --port 8080
```

Akses di browser: `http://localhost:8080/login`

- **Username Default**: `admin`
- **Password Default**: `admin123`

---

## 5. Panduan Lengkap Deployment ke cPanel

Terdapat dua metode deployment ke cPanel. **Metode 1** adalah standar keamanan tertinggi (_best practice_ resmi CodeIgniter), sedangkan **Metode 2** adalah metode cepat jika Anda hanya memiliki akses terbatas ke direktori `public_html`.

---

### Metode 1: Best Practice (Rekomendasi) - Di Luar public_html

Pada metode ini, file inti aplikasi (`app`, `system`, `writable`, `.env`, dll.) diletakkan di luar `public_html`, sehingga pengunjung situs web sama sekali tidak memiliki akses langsung ke kode sumber dan konfigurasi sensitif.

```
/home/cpanel_user/
│
├── catatan_kelas_core/        <-- Folder aplikasi inti (DI LUAR public_html)
│   ├── app/
│   ├── vendor/
│   ├── writable/
│   ├── .env
│   └── ...
│
└── public_html/               <-- Hanya berisi isi folder public/
    ├── index.php              <-- File bootstrap yang telah disesuaikan path-nya
    ├── .htaccess              <-- Apache rewrite rules bawaan public/
    ├── favicon.ico
    └── robots.txt
```

#### Langkah-langkah Penerapan Metode 1:

1. **Persiapan Berkas Lokal**:
   - Pastikan telah menjalankan `composer install --no-dev --optimize-autoloader` di komputer lokal.
   - Kompres seluruh project menjadi file `catatan_kelas.zip`.

2. **Upload & Ekstrak di cPanel**:
   - Masuk ke **cPanel > File Manager**.
   - Buka root directory hosting Anda: `/home/username/` (satu tingkat di atas `public_html`).
   - Buat folder baru, misalnya: `catatan_kelas_core`.
   - Upload file `catatan_kelas.zip` ke dalam folder `catatan_kelas_core` tersebut, lalu klik **Extract**.

3. **Pindahkan Berkas Publik ke `public_html`**:
   - Masuk ke folder `/home/username/catatan_kelas_core/public/`.
   - Pilih semua file dan folder di dalamnya (`index.php`, `.htaccess`, assets, dll.), lalu pilih **Move**.
   - Arahkan tujuan pemindahan ke `/home/username/public_html/` (atau direktori subdomain jika menggunakan subdomain).

4. **Sesuaikan Path pada `public_html/index.php`**:
   - Buka dan edit file `/home/username/public_html/index.php`.
   - Cari baris konfigurasi `$pathsConfig`:

     ```php
     // Ubah dari:
     require FCPATH . '../app/Config/Paths.php';

     // Menjadi (arahkan ke folder core di luar public_html):
     require FCPATH . '../catatan_kelas_core/app/Config/Paths.php';
     ```

   - Simpan perubahan file.

5. **Konfigurasi Path Writable di `app/Config/Paths.php`**:
   - Buka `/home/username/catatan_kelas_core/app/Config/Paths.php`.
   - Pastikan variabel `$writableDirectory` menunjuk ke folder writable yang benar:
     ```php
     public string $writableDirectory = __DIR__ . '/../../writable';
     ```

---

### Metode 2: Single Directory (Langsung di public_html)

Jika paket hosting Anda tidak mengizinkan penempatan file di luar `public_html`, gunakan konfigurasi root `.htaccess` yang telah disediakan oleh project ini untuk memproteksi direktori inti.

```
/home/cpanel_user/public_html/
├── .htaccess                 <-- Root rewrite & security shield
├── .env                      <-- File konfigurasi (DIBLOKIR oleh .htaccess)
├── app/                      <-- Direktori aplikasi (DIBLOKIR oleh .htaccess)
├── writable/                 <-- Direktori cache & logs (DIBLOKIR oleh .htaccess)
├── vendor/                   <-- Vendor libraries (DIBLOKIR oleh .htaccess)
├── spark
└── public/                   <-- Berkas web publik
    ├── index.php
    └── .htaccess
```

#### Langkah-langkah Penerapan Metode 2:

1. **Upload Seluruh Project**:
   - Upload file zip project langsung ke `/home/username/public_html/` dan ekstrak seluruh isinya.
2. **Pastikan File `.htaccess` Root Ada**:
   - Pastikan di dalam `/home/username/public_html/` terdapat file `.htaccess` dengan konfigurasi berikut:

     ```apache
     # Catatan Kelas - cPanel Apache Configuration
     Options -Indexes

     <IfModule mod_rewrite.c>
         RewriteEngine On

         # 1. Blokir akses langsung ke file & folder sensitif (HTTP 403 Forbidden)
         RewriteRule ^(\.env|\.git|app|system|writable|tests|composer\.(json|lock)) - [F,L,NC]

         # 2. Redirect/Rewrite otomatis seluruh trafik ke subfolder public/
         RewriteCond %{REQUEST_URI} !^/public/
         RewriteRule ^(.*)$ public/$1 [L]
     </IfModule>

     <IfModule !mod_rewrite.c>
         ErrorDocument 404 public/index.php
     </IfModule>
     ```

3. **Pengujian Keamanan**:
   - Akses via browser: `https://domainanda.com/.env`.
   - Pastikan server mengembalikan **403 Forbidden**, bukan menampilkan isi file kredensial!

---

### Konfigurasi Versi PHP & Ekstensi di cPanel

1. **Buka Menu cPanel**:
   - Cari menu **Select PHP Version** atau **MultiPHP Manager**.
2. **Pilih Versi PHP**:
   - Pilih domain Anda dan atur versi PHP minimal ke **PHP 8.2**, disarankan **PHP 8.3** atau **PHP 8.4**.
3. **Aktifkan Modul / Ekstensi PHP**:
   - Masuk ke tab **Extensions** di PHP Selector.
   - Centang ekstensi wajib berikut:
     - [x] `intl`
     - [x] `mbstring`
     - [x] `curl`
     - [x] `openssl`
     - [x] `json`
     - [x] `fileinfo`
     - [x] `zip`
     - [x] `mysqli` & `pdo_mysql` (jika menggunakan MySQL)
     - [x] `sqlite3` & `pdo_sqlite` (jika menggunakan SQLite)
4. **Pengaturan PHP Options (php.ini)**:
   - `memory_limit` = `256M` (minimal)
   - `upload_max_filesize` = `20M`
   - `post_max_size` = `25M`
   - `max_execution_time` = `120`

---

### Konfigurasi Database MySQL di cPanel

Jika Anda ingin menggunakan MySQL / MariaDB alih-alih SQLite3 di cPanel:

1. **Buat Database & User MySQL**:
   - Buka menu **MySQL Database Wizard** di cPanel.
   - **Langkah 1**: Buat nama database, misalnya `cpaneluser_catatankelas`.
   - **Langkah 2**: Buat pengguna database baru beserta password yang kuat, misalnya user `cpaneluser_dbuser`.
   - **Langkah 3**: Berikan **ALL PRIVILEGES** kepada pengguna tersebut pada database yang baru dibuat.
2. **Update Konfigurasi `.env`**:
   Buka file `.env` di cPanel File Manager dan sesuaikan:
   ```ini
   #--------------------------------------------------------------------
   # DATABASE CONFIGURATION (MySQL)
   #--------------------------------------------------------------------
   database.default.hostname = localhost
   database.default.database = cpaneluser_catatankelas
   database.default.username = cpaneluser_dbuser
   database.default.password = PasswordSuperRahasiaAnda123!
   database.default.DBDriver = MySQLi
   database.default.DBPrefix =
   database.default.port     = 3306
   ```
3. **Eksekusi Migrasi Database di cPanel**:
   - **Opsi A (Via Terminal cPanel)**:
     Buka menu **Terminal** di cPanel, masuk ke folder project, lalu jalankan:
     ```bash
     php spark migrate
     php spark db:seed CatatanKelasSeeder
     ```
   - **Opsi B (Via phpMyAdmin)**:
     Jika cPanel Anda tidak menyediakan akses Terminal, jalankan migrasi di komputer lokal terlebih dahulu pada database MySQL lokal, kemudian export file `.sql` via phpMyAdmin lokal dan import file `.sql` tersebut melalui menu **phpMyAdmin** di cPanel Anda.

---

### Konfigurasi File Environment (.env) Produksi

Di server cPanel produksi, pastikan file `.env` dikonfigurasi dengan mode **production** untuk mengaktifkan seluruh proteksi keamanan:

```ini
#--------------------------------------------------------------------
# ENVIRONMENT
#--------------------------------------------------------------------
CI_ENVIRONMENT = production

#--------------------------------------------------------------------
# APP SETTINGS
#--------------------------------------------------------------------
app.baseURL = 'https://namadomainanda.com/'
app.forceGlobalSecureRequests = true
app.sessionDriver = 'CodeIgniter\Session\Handlers\FileHandler'
app.sessionCookieName = 'catatan_session'
app.sessionExpiration = 7200
app.sessionSavePath = WRITEPATH . 'session'

#--------------------------------------------------------------------
# SECURITY & ENCRYPTION KEY
#--------------------------------------------------------------------
# Pastikan encryption key unik telah terisi
encryption.key = hex2bin:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

#--------------------------------------------------------------------
# LOGGER
#--------------------------------------------------------------------
# Di production, cukup catat level error dan critical
logger.threshold = 3
```

---

### Pengaturan Izin Akses Folder (File Permissions)

Untuk mencegah error _Permission Denied_ atau celah keamanan:

| Direktori / File                                                | Rekomendasi Izin (chmod) | Keterangan                                                                    |
| --------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| Folder `writable/` dan seluruh subfoldernya                     | `775` atau `755`         | Wajib dapat ditulis oleh proses web server PHP untuk session, cache, dan log. |
| Folder `writable/session/`, `writable/cache/`, `writable/logs/` | `775` atau `755`         | Tempat penyimpanan file sesi dan log error.                                   |
| File database `catatan_kelas.db` (jika pakai SQLite)            | `664` atau `660`         | Harus dapat dibaca dan ditulis oleh web server.                               |
| File konfigurasi `.env`                                         | `600` atau `640`         | Hanya boleh dibaca oleh pemilik akun cPanel dan PHP.                          |
| File `.htaccess`                                                | `644`                    | Hak akses standar konfigurasi Apache.                                         |
| File PHP (`*.php`)                                              | `644`                    | Hak akses standar eksekusi skrip PHP.                                         |
| Seluruh Folder lainnya                                          | `755`                    | Hak akses standar direktori.                                                  |

> [!TIP]
> **Cara mengubah permission di cPanel File Manager**:
> Klik kanan pada folder (misal `writable`), pilih **Change Permissions**, centang _Write_ untuk _User_ dan _Group_, lalu klik tombol **Change Permissions**.

---

### Konfigurasi Otomasi Cron Job di cPanel

Jika Anda ingin melakukan sinkronisasi otomatis harian data nilai siswa ke Google Sheets:

1. Buka menu **Cron Jobs** di cPanel.
2. Atur jadwal eksekusi, misalnya setiap pukul 17:00 sore (setelah jam sekolah selesai):
   - **Minute**: `0`
   - **Hour**: `17`
   - **Day**: `*`
   - **Month**: `*`
   - **Weekday**: `1-5` (Senin s/d Jumat)
3. Masukkan perintah (_Command_):
   ```bash
   /usr/local/bin/php /home/username/catatan_kelas_core/spark app:test > /dev/null 2>&1
   ```
   _(Sesuaikan path binary PHP dan path direktori project Anda)._

---

## 6. Panduan Integrasi Google Sheets API

Aplikasi ini telah dilengkapi dengan kelas service mandiri ([`GoogleSheetsService.php`](app/Services/GoogleSheetsService.php)) yang berkomunikasi langsung dengan Google Sheets API v4 menggunakan token JWT Service Account tanpa library eksternal yang membebani server cPanel.

### Langkah 1: Buat Proyek di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru dengan nama misalnya `Catatan Kelas App`.
3. Masuk ke menu **APIs & Services > Library**, cari **Google Sheets API**, lalu klik **Enable (Aktifkan)**.

### Langkah 2: Buat Service Account & Unduh Key JSON

1. Masuk ke menu **APIs & Services > Credentials**.
2. Klik tombol **+ Create Credentials** dan pilih **Service Account**.
3. Beri nama service account, misalnya `catatan-kelas-service`, lalu klik **Create and Continue** dan akhiri dengan **Done**.
4. Klik pada email service account yang baru dibuat (format: `catatan-kelas-service@nama-proyek.iam.gserviceaccount.com`).
5. Buka tab **Keys**, klik **Add Key > Create new key**, pilih format **JSON**, lalu klik **Create**. File JSON akan otomatis terunduh ke komputer Anda.

### Langkah 3: Buat Spreadsheet & Bagikan Akses (Share)

1. Buka [Google Sheets](https://sheets.google.com/) dan buat spreadsheet baru.
2. Salin **Spreadsheet ID** dari URL browser:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
3. Klik tombol **Share (Bagikan)** di pojok kanan atas spreadsheet.
4. Tambahkan alamat email Service Account Anda (dari Langkah 2) dan berikan peran sebagai **Editor**, lalu simpan.

### Langkah 4: Simpan di Menu Pengaturan Aplikasi

1. Buka aplikasi Catatan Kelas Anda, masuk ke menu **Google Sheets & Bobot** (`/settings`).
2. Masukkan **Google Spreadsheet ID** pada kolom yang tersedia.
3. Unggah file JSON Service Account atau tempelkan isinya pada textarea yang disediakan.
4. Klik **Simpan Seluruh Pengaturan**.
5. Klik tombol **Uji Koneksi Google Sheets**. Sistem akan otomatis memverifikasi koneksi dan membuat 5 tab spreadsheet: `Kelas`, `Siswa`, `Pertemuan`, `Nilai`, dan `Rekap_Nilai`.

---

## 7. Troubleshooting & Solusi Error cPanel

### 1. Error 500 - Internal Server Error

- **Penyebab**: Kesalahan sintaks pada `.htaccess`, versi PHP terlalu rendah, atau ekstensi yang hilang.
- **Solusi**:
  1. Periksa file log error di cPanel File Manager: `public_html/error_log` atau `writable/logs/log-YYYY-MM-DD.log`.
  2. Pastikan versi PHP minimal **8.2**.
  3. Jika menggunakan root `.htaccess` di subfolder, pastikan menambahkan direktif `RewriteBase /`.

### 2. Error 404 pada Halaman Selain Halaman Utama

- **Penyebab**: Modul Apache `mod_rewrite` tidak mengizinkan penulisan ulang URL (AllowOverride None) atau file `public/.htaccess` terhapus saat upload.
- **Solusi**:
  1. Pastikan file `.htaccess` di dalam folder `public/` ikut terupload.
  2. Buka file `app/Config/App.php` dan pastikan `$indexPage = '';`.

### 3. Error Class 'IntlDateFormatter' or 'Locale' Not Found

- **Penyebab**: Ekstensi PHP `intl` belum diaktifkan di cPanel.
- **Solusi**: Masuk ke **cPanel > Select PHP Version > Extensions**, lalu centang modul `intl`.

### 4. Error "Unable to connect to the database" (SQLite)

- **Penyebab**: Web server tidak memiliki izin tulis (_write permission_) pada file database atau folder `writable`.
- **Solusi**: Ubah permission folder `writable/` menjadi `775` atau `755` dan pastikan ekstensi `pdo_sqlite` serta `sqlite3` aktif di cPanel.

### 5. Error CSRF Token Mismatch saat Submit Form

- **Penyebab**: Penggunaan Cloudflare atau reverse proxy dengan konfigurasi caching halaman HTML dinamis.
- **Solusi**: Nonaktifkan HTML caching di Cloudflare untuk domain aplikasi agar token CSRF dan session cookie tidak tercache oleh proxy.

---

## Lisensi & Pengembang

Aplikasi ini dikembangkan dengan standar kode bersih, modular, dan mematuhi kaidah keamanan DevSecOps. Bebas digunakan dan dimodifikasi untuk kebutuhan pengelolaan nilai di lingkungan pendidikan sekolah maupun perguruan tinggi.

---

## 5. Panduan Lengkap Deployment ke cPanel

Terdapat dua metode deployment ke cPanel. **Metode 1** adalah standar keamanan tertinggi (_best practice_ resmi CodeIgniter), sedangkan **Metode 2** adalah metode cepat jika Anda hanya memiliki akses terbatas ke direktori `public_html`.

---

### Metode 1: Best Practice (Rekomendasi) - Di Luar public_html

Pada metode ini, file inti aplikasi (`app`, `system`, `writable`, `.env`, dll.) diletakkan di luar `public_html`, sehingga pengunjung situs web sama sekali tidak memiliki akses langsung ke kode sumber dan konfigurasi sensitif.

```
/home/cpanel_user/
│
├── catatan_kelas_core/        <-- Folder aplikasi inti (DI LUAR public_html)
│   ├── app/
│   ├── vendor/
│   ├── writable/
│   ├── .env
│   └── ...
│
└── public_html/               <-- Hanya berisi isi folder public/
    ├── index.php              <-- File bootstrap yang telah disesuaikan path-nya
    ├── .htaccess              <-- Apache rewrite rules bawaan public/
    ├── favicon.ico
    └── robots.txt
```

#### Langkah-langkah Penerapan Metode 1:

1. **Persiapan Berkas Lokal**:
   - Pastikan telah menjalankan `composer install --no-dev --optimize-autoloader` di komputer lokal.
   - Kompres seluruh project menjadi file `catatan_kelas.zip`.

2. **Upload & Ekstrak di cPanel**:
   - Masuk ke **cPanel > File Manager**.
   - Buka root directory hosting Anda: `/home/username/` (satu tingkat di atas `public_html`).
   - Buat folder baru, misalnya: `catatan_kelas_core`.
   - Upload file `catatan_kelas.zip` ke dalam folder `catatan_kelas_core` tersebut, lalu klik **Extract**.

3. **Pindahkan Berkas Publik ke `public_html`**:
   - Masuk ke folder `/home/username/catatan_kelas_core/public/`.
   - Pilih semua file dan folder di dalamnya (`index.php`, `.htaccess`, assets, dll.), lalu pilih **Move**.
   - Arahkan tujuan pemindahan ke `/home/username/public_html/` (atau direktori subdomain jika menggunakan subdomain).

4. **Sesuaikan Path pada `public_html/index.php`**:
   - Buka dan edit file `/home/username/public_html/index.php`.
   - Cari baris konfigurasi `$pathsConfig`:

     ```php
     // Ubah dari:
     require FCPATH . '../app/Config/Paths.php';

     // Menjadi (arahkan ke folder core di luar public_html):
     require FCPATH . '../catatan_kelas_core/app/Config/Paths.php';
     ```

   - Simpan perubahan file.

5. **Konfigurasi Path Writable di `app/Config/Paths.php`**:
   - Buka `/home/username/catatan_kelas_core/app/Config/Paths.php`.
   - Pastikan variabel `$writableDirectory` menunjuk ke folder writable yang benar:
     ```php
     public string $writableDirectory = __DIR__ . '/../../writable';
     ```

---

### Metode 2: Single Directory (Langsung di public_html)

Jika paket hosting Anda tidak mengizinkan penempatan file di luar `public_html`, gunakan konfigurasi root `.htaccess` yang telah disediakan oleh project ini untuk memproteksi direktori inti.

```
/home/cpanel_user/public_html/
├── .htaccess                 <-- Root rewrite & security shield
├── .env                      <-- File konfigurasi (DIBLOKIR oleh .htaccess)
├── app/                      <-- Direktori aplikasi (DIBLOKIR oleh .htaccess)
├── writable/                 <-- Direktori cache & logs (DIBLOKIR oleh .htaccess)
├── vendor/                   <-- Vendor libraries (DIBLOKIR oleh .htaccess)
├── spark
└── public/                   <-- Berkas web publik
    ├── index.php
    └── .htaccess
```

#### Langkah-langkah Penerapan Metode 2:

1. **Upload Seluruh Project**:
   - Upload file zip project langsung ke `/home/username/public_html/` dan ekstrak seluruh isinya.
2. **Pastikan File `.htaccess` Root Ada**:
   - Pastikan di dalam `/home/username/public_html/` terdapat file `.htaccess` dengan konfigurasi berikut:

     ```apache
     # Catatan Kelas - cPanel Apache Configuration
     Options -Indexes

     <IfModule mod_rewrite.c>
         RewriteEngine On

         # 1. Blokir akses langsung ke file & folder sensitif (HTTP 403 Forbidden)
         RewriteRule ^(\.env|\.git|app|system|writable|tests|composer\.(json|lock)) - [F,L,NC]

         # 2. Redirect/Rewrite otomatis seluruh trafik ke subfolder public/
         RewriteCond %{REQUEST_URI} !^/public/
         RewriteRule ^(.*)$ public/$1 [L]
     </IfModule>

     <IfModule !mod_rewrite.c>
         ErrorDocument 404 public/index.php
     </IfModule>
     ```

3. **Pengujian Keamanan**:
   - Akses via browser: `https://domainanda.com/.env`.
   - Pastikan server mengembalikan **403 Forbidden**, bukan menampilkan isi file kredensial!

---

### Konfigurasi Versi PHP & Ekstensi di cPanel

1. **Buka Menu cPanel**:
   - Cari menu **Select PHP Version** atau **MultiPHP Manager**.
2. **Pilih Versi PHP**:
   - Pilih domain Anda dan atur versi PHP minimal ke **PHP 8.2**, disarankan **PHP 8.3** atau **PHP 8.4**.
3. **Aktifkan Modul / Ekstensi PHP**:
   - Masuk ke tab **Extensions** di PHP Selector.
   - Centang ekstensi wajib berikut:
     - [x] `intl`
     - [x] `mbstring`
     - [x] `curl`
     - [x] `openssl`
     - [x] `json`
     - [x] `fileinfo`
     - [x] `zip`
     - [x] `mysqli` & `pdo_mysql` (jika menggunakan MySQL)
     - [x] `sqlite3` & `pdo_sqlite` (jika menggunakan SQLite)
4. **Pengaturan PHP Options (php.ini)**:
   - `memory_limit` = `256M` (minimal)
   - `upload_max_filesize` = `20M`
   - `post_max_size` = `25M`
   - `max_execution_time` = `120`

---

### Konfigurasi Database MySQL di cPanel

Jika Anda ingin menggunakan MySQL / MariaDB alih-alih SQLite3 di cPanel:

1. **Buat Database & User MySQL**:
   - Buka menu **MySQL Database Wizard** di cPanel.
   - **Langkah 1**: Buat nama database, misalnya `cpaneluser_catatankelas`.
   - **Langkah 2**: Buat pengguna database baru beserta password yang kuat, misalnya user `cpaneluser_dbuser`.
   - **Langkah 3**: Berikan **ALL PRIVILEGES** kepada pengguna tersebut pada database yang baru dibuat.
2. **Update Konfigurasi `.env`**:
   Buka file `.env` di cPanel File Manager dan sesuaikan:
   ```ini
   #--------------------------------------------------------------------
   # DATABASE CONFIGURATION (MySQL)
   #--------------------------------------------------------------------
   database.default.hostname = localhost
   database.default.database = cpaneluser_catatankelas
   database.default.username = cpaneluser_dbuser
   database.default.password = PasswordSuperRahasiaAnda123!
   database.default.DBDriver = MySQLi
   database.default.DBPrefix =
   database.default.port     = 3306
   ```
3. **Eksekusi Migrasi Database di cPanel**:
   - **Opsi A (Via Terminal cPanel)**:
     Buka menu **Terminal** di cPanel, masuk ke folder project, lalu jalankan:
     ```bash
     php spark migrate
     php spark db:seed CatatanKelasSeeder
     ```
   - **Opsi B (Via phpMyAdmin)**:
     Jika cPanel Anda tidak menyediakan akses Terminal, jalankan migrasi di komputer lokal terlebih dahulu pada database MySQL lokal, kemudian export file `.sql` via phpMyAdmin lokal dan import file `.sql` tersebut melalui menu **phpMyAdmin** di cPanel Anda.

---

### Konfigurasi File Environment (.env) Produksi

Di server cPanel produksi, pastikan file `.env` dikonfigurasi dengan mode **production** untuk mengaktifkan seluruh proteksi keamanan:

```ini
#--------------------------------------------------------------------
# ENVIRONMENT
#--------------------------------------------------------------------
CI_ENVIRONMENT = production

#--------------------------------------------------------------------
# APP SETTINGS
#--------------------------------------------------------------------
app.baseURL = 'https://namadomainanda.com/'
app.forceGlobalSecureRequests = true
app.sessionDriver = 'CodeIgniter\Session\Handlers\FileHandler'
app.sessionCookieName = 'catatan_session'
app.sessionExpiration = 7200
app.sessionSavePath = WRITEPATH . 'session'

#--------------------------------------------------------------------
# SECURITY & ENCRYPTION KEY
#--------------------------------------------------------------------
# Pastikan encryption key unik telah terisi
encryption.key = hex2bin:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

#--------------------------------------------------------------------
# LOGGER
#--------------------------------------------------------------------
# Di production, cukup catat level error dan critical
logger.threshold = 3
```

---

### Pengaturan Izin Akses Folder (File Permissions)

Untuk mencegah error _Permission Denied_ atau celah keamanan:

| Direktori / File                                                | Rekomendasi Izin (chmod) | Keterangan                                                                    |
| --------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| Folder `writable/` dan seluruh subfoldernya                     | `775` atau `755`         | Wajib dapat ditulis oleh proses web server PHP untuk session, cache, dan log. |
| Folder `writable/session/`, `writable/cache/`, `writable/logs/` | `775` atau `755`         | Tempat penyimpanan file sesi dan log error.                                   |
| File database `catatan_kelas.db` (jika pakai SQLite)            | `664` atau `660`         | Harus dapat dibaca dan ditulis oleh web server.                               |
| File konfigurasi `.env`                                         | `600` atau `640`         | Hanya boleh dibaca oleh pemilik akun cPanel dan PHP.                          |
| File `.htaccess`                                                | `644`                    | Hak akses standar konfigurasi Apache.                                         |
| File PHP (`*.php`)                                              | `644`                    | Hak akses standar eksekusi skrip PHP.                                         |
| Seluruh Folder lainnya                                          | `755`                    | Hak akses standar direktori.                                                  |

> [!TIP]
> **Cara mengubah permission di cPanel File Manager**:
> Klik kanan pada folder (misal `writable`), pilih **Change Permissions**, centang _Write_ untuk _User_ dan _Group_, lalu klik tombol **Change Permissions**.

---

### Konfigurasi Otomasi Cron Job di cPanel

Jika Anda ingin melakukan sinkronisasi otomatis harian data nilai siswa ke Google Sheets:

1. Buka menu **Cron Jobs** di cPanel.
2. Atur jadwal eksekusi, misalnya setiap pukul 17:00 sore (setelah jam sekolah selesai):
   - **Minute**: `0`
   - **Hour**: `17`
   - **Day**: `*`
   - **Month**: `*`
   - **Weekday**: `1-5` (Senin s/d Jumat)
3. Masukkan perintah (_Command_):
   ```bash
   /usr/local/bin/php /home/username/catatan_kelas_core/spark app:test > /dev/null 2>&1
   ```
   _(Sesuaikan path binary PHP dan path direktori project Anda)._

---

## 6. Panduan Integrasi Google Sheets API

Aplikasi ini telah dilengkapi dengan kelas service mandiri ([`GoogleSheetsService.php`](app/Services/GoogleSheetsService.php)) yang berkomunikasi langsung dengan Google Sheets API v4 menggunakan token JWT Service Account tanpa library eksternal yang membebani server cPanel.

### Langkah 1: Buat Proyek di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru dengan nama misalnya `Catatan Kelas App`.
3. Masuk ke menu **APIs & Services > Library**, cari **Google Sheets API**, lalu klik **Enable (Aktifkan)**.

### Langkah 2: Buat Service Account & Unduh Key JSON

1. Masuk ke menu **APIs & Services > Credentials**.
2. Klik tombol **+ Create Credentials** dan pilih **Service Account**.
3. Beri nama service account, misalnya `catatan-kelas-service`, lalu klik **Create and Continue** dan akhiri dengan **Done**.
4. Klik pada email service account yang baru dibuat (format: `catatan-kelas-service@nama-proyek.iam.gserviceaccount.com`).
5. Buka tab **Keys**, klik **Add Key > Create new key**, pilih format **JSON**, lalu klik **Create**. File JSON akan otomatis terunduh ke komputer Anda.

### Langkah 3: Buat Spreadsheet & Bagikan Akses (Share)

1. Buka [Google Sheets](https://sheets.google.com/) dan buat spreadsheet baru.
2. Salin **Spreadsheet ID** dari URL browser:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
3. Klik tombol **Share (Bagikan)** di pojok kanan atas spreadsheet.
4. Tambahkan alamat email Service Account Anda (dari Langkah 2) dan berikan peran sebagai **Editor**, lalu simpan.

### Langkah 4: Simpan di Menu Pengaturan Aplikasi

1. Buka aplikasi Catatan Kelas Anda, masuk ke menu **Google Sheets & Bobot** (`/settings`).
2. Masukkan **Google Spreadsheet ID** pada kolom yang tersedia.
3. Unggah file JSON Service Account atau tempelkan isinya pada textarea yang disediakan.
4. Klik **Simpan Seluruh Pengaturan**.
5. Klik tombol **Uji Koneksi Google Sheets**. Sistem akan otomatis memverifikasi koneksi dan membuat 5 tab spreadsheet: `Kelas`, `Siswa`, `Pertemuan`, `Nilai`, dan `Rekap_Nilai`.

---

## 7. Troubleshooting & Solusi Error cPanel

### 1. Error 500 - Internal Server Error

- **Penyebab**: Kesalahan sintaks pada `.htaccess`, versi PHP terlalu rendah, atau ekstensi yang hilang.
- **Solusi**:
  1. Periksa file log error di cPanel File Manager: `public_html/error_log` atau `writable/logs/log-YYYY-MM-DD.log`.
  2. Pastikan versi PHP minimal **8.2**.
  3. Jika menggunakan root `.htaccess` di subfolder, pastikan menambahkan direktif `RewriteBase /`.

### 2. Error 404 pada Halaman Selain Halaman Utama

- **Penyebab**: Modul Apache `mod_rewrite` tidak mengizinkan penulisan ulang URL (AllowOverride None) atau file `public/.htaccess` terhapus saat upload.
- **Solusi**:
  1. Pastikan file `.htaccess` di dalam folder `public/` ikut terupload.
  2. Buka file `app/Config/App.php` dan pastikan `$indexPage = '';`.

### 3. Error Class 'IntlDateFormatter' or 'Locale' Not Found

- **Penyebab**: Ekstensi PHP `intl` belum diaktifkan di cPanel.
- **Solusi**: Masuk ke **cPanel > Select PHP Version > Extensions**, lalu centang modul `intl`.

### 4. Error "Unable to connect to the database" (SQLite)

- **Penyebab**: Web server tidak memiliki izin tulis (_write permission_) pada file database atau folder `writable`.
- **Solusi**: Ubah permission folder `writable/` menjadi `775` atau `755` dan pastikan ekstensi `pdo_sqlite` serta `sqlite3` aktif di cPanel.

### 5. Error CSRF Token Mismatch saat Submit Form

- **Penyebab**: Penggunaan Cloudflare atau reverse proxy dengan konfigurasi caching halaman HTML dinamis.
- **Solusi**: Nonaktifkan HTML caching di Cloudflare untuk domain aplikasi agar token CSRF dan session cookie tidak tercache oleh proxy.

---

## Lisensi & Pengembang

Aplikasi ini dikembangkan dengan standar kode bersih, modular, dan mematuhi kaidah keamanan DevSecOps. Bebas digunakan dan dimodifikasi untuk kebutuhan pengelolaan nilai di lingkungan pendidikan sekolah maupun perguruan tinggi.
