import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Settings, Printer } from 'lucide-react';

export const Navbar = ({ onOpenSettings, onPrint }) => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Logo Catatan Kelas"
              className="w-10 h-10 object-contain rounded-xl shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }
              }}
            />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 hidden items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Catatan Kelas
              </span>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Sistem Penilaian & Rekapitulasi Siswa
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <button
                  onClick={onPrint}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition"
                  title="Cetak Laporan / PDF"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Cetak Rekap</span>
                </button>

                <button
                  onClick={onOpenSettings}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition"
                  title="Pengaturan Bobot Nilai"
                >
                  <Settings className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Bobot Nilai</span>
                </button>

                <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>

                <button
                  onClick={signOut}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

