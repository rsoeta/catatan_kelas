import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthModal = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) throw new Error('Nama lengkap wajib diisi!');
        await signUp(email, password, fullName);
        toast.success('Pendaftaran berhasil! Akun telah dibuat.');
      } else {
        await signIn(email, password);
        toast.success('Berhasil masuk!');
      }
    } catch (err) {
      const msg = err.message || 'Terjadi kesalahan saat otentikasi.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100">
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Logo Catatan Kelas"
            className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl hidden items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isRegister ? 'Buat Akun Guru' : 'Masuk ke Catatan Kelas'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister
              ? 'Daftar untuk mengelola kelas dan nilai siswa Anda'
              : 'Silakan masuk untuk melanjutkan rekap penilaian'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
                Nama Lengkap & Gelar
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Budi Santoso, S.Pd."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@sekolah.sch.id"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.99] transition shadow-md shadow-sky-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{isRegister ? 'Daftar Sekarang' : 'Masuk'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? 'Sudah memiliki akun?' : 'Belum memiliki akun guru?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="text-sky-600 font-semibold hover:underline"
          >
            {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

