import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';

export const ClassModal = ({ isOpen, onClose, onSave, editingClass = null }) => {
  const [name, setName] = useState(editingClass?.name || '');
  const [gradeLevel, setGradeLevel] = useState(editingClass?.grade_level || '10');
  const [academicYear, setAcademicYear] = useState(editingClass?.academic_year || '2025/2026');
  const [semester, setSemester] = useState(editingClass?.semester || 'Ganjil');
  const [subject, setSubject] = useState(editingClass?.subject || 'Mata Pelajaran Umum');
  const [description, setDescription] = useState(editingClass?.description || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name,
      grade_level: gradeLevel,
      academic_year: academicYear,
      semester,
      subject,
      description,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {editingClass ? 'Edit Rombel / Kelas' : 'Tambah Rombel / Kelas Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kelas / Rombel</label>
            <input
              type="text"
              required
              placeholder="Contoh: X RPL 1, XII MIPA 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tingkat</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
              >
                <option value="7">Kelas 7 (SMP)</option>
                <option value="8">Kelas 8 (SMP)</option>
                <option value="9">Kelas 9 (SMP)</option>
                <option value="10">Kelas 10 (SMA/SMK)</option>
                <option value="11">Kelas 11 (SMA/SMK)</option>
                <option value="12">Kelas 12 (SMA/SMK)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                required
                placeholder="2025/2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                required
                placeholder="Matematika / Pemrograman"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan (Opsional)</label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan rombel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Kelas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

