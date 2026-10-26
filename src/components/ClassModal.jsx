import React, { useState, useEffect } from 'react';
import { X, Layers, Edit3, Plus } from 'lucide-react';

export const ClassModal = ({ isOpen, onClose, onSave, editingClass = null }) => {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('10');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState('Ganjil');
  const [subject, setSubject] = useState('Mata Pelajaran Umum');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingClass) {
      setName(editingClass.name || '');
      setGradeLevel(editingClass.grade_level || '10');
      setAcademicYear(editingClass.academic_year || '2025/2026');
      setSemester(editingClass.semester || 'Ganjil');
      setSubject(editingClass.subject || 'Mata Pelajaran Umum');
      setDescription(editingClass.description || '');
    } else {
      setName('');
      setGradeLevel('10');
      setAcademicYear('2025/2026');
      setSemester('Ganjil');
      setSubject('Mata Pelajaran Umum');
      setDescription('');
    }
  }, [editingClass, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      grade_level: gradeLevel,
      academic_year: academicYear.trim(),
      semester,
      subject: subject.trim(),
      description: description.trim(),
    };
    if (editingClass?.id) {
      payload.id = editingClass.id;
    }
    await onSave(payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${editingClass ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
              {editingClass ? <Edit3 className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {editingClass ? `Edit Rombel: ${editingClass.name}` : 'Tambah Rombel / Kelas Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Kelas / Rombel <span className="text-rose-500">*</span>
            </label>
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
                <option value="1">Kelas 1 (SD)</option>
                <option value="2">Kelas 2 (SD)</option>
                <option value="3">Kelas 3 (SD)</option>
                <option value="4">Kelas 4 (SD)</option>
                <option value="5">Kelas 5 (SD)</option>
                <option value="6">Kelas 6 (SD)</option>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Catatan (Opsional)</label>
            <textarea
              rows={2}
              placeholder="Catatan rombel, ruang kelas, atau jadwal..."
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
              className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1.5 ${
                editingClass ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {editingClass ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{saving ? 'Menyimpan...' : editingClass ? 'Perbarui Kelas' : 'Simpan Kelas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
