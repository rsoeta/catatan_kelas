import React, { useState } from 'react';
import { X, Layers, Plus, Edit3, Trash2, CheckCircle2, Search, BookOpen, Calendar, GraduationCap } from 'lucide-react';

export const ClassManagementModal = ({
  isOpen,
  onClose,
  classes,
  activeClassId,
  onSelectClass,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteClass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredClasses = classes.filter((cls) => {
    const term = searchTerm.toLowerCase();
    return (
      cls.name.toLowerCase().includes(term) ||
      (cls.subject && cls.subject.toLowerCase().includes(term)) ||
      (cls.academic_year && cls.academic_year.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-100">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Manajemen Rombel & Kelas</h3>
              <p className="text-xs text-slate-400">
                Kelola seluruh rombongan belajar, tahun ajaran, dan mata pelajaran Anda ({classes.length} Kelas)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onOpenCreateModal();
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tambah Kelas</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama kelas, mata pelajaran, atau tahun ajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* CLASS LIST / CARDS */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-base">Tidak Ada Kelas Ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? `Tidak ada rombel yang cocok dengan kata kunci "${searchTerm}".`
                  : 'Anda belum membuat rombel atau kelas apa pun.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClasses.map((cls) => {
                const isActive = cls.id === activeClassId;

                return (
                  <div
                    key={cls.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isActive
                        ? 'border-sky-500 bg-sky-50/20 ring-2 ring-sky-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800 text-lg">{cls.name}</h4>
                          {isActive && (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Sedang Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 flex items-center mt-1">
                          <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{cls.subject || 'Mata Pelajaran Umum'}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onOpenEditModal(cls)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Rombel"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClass(cls.id, cls.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Rombel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 mb-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 font-medium flex items-center">
                        <GraduationCap className="w-3 h-3 mr-1 text-slate-400" />
                        Tingkat {cls.grade_level}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 font-medium flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {cls.academic_year} ({cls.semester})
                      </span>
                    </div>

                    {cls.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 bg-slate-50 p-2 rounded-lg">
                        {cls.description}
                      </p>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <button
                        onClick={() => {
                          onSelectClass(cls.id);
                          onClose();
                        }}
                        disabled={isActive}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                          isActive
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Kelas Sedang Dibuka</span>
                          </>
                        ) : (
                          <span>Buka / Kelola Penilaian Kelas Ini</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

