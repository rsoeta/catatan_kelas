import React, { useState } from 'react';
import { X, UserPlus, Users } from 'lucide-react';

export const StudentModal = ({ isOpen, onClose, onSave, onBatchImport, classId }) => {
  const [tab, setTab] = useState('single'); // 'single' | 'batch'
  const [nis, setNis] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('L');
  const [notes, setNotes] = useState('');

  const [batchText, setBatchText] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    await onSave({
      class_id: classId,
      nis,
      full_name: fullName.trim(),
      gender,
      notes,
    });
    setSaving(false);
    onClose();
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    // Format: baris per baris. Contoh: "101;Ahmad;L" atau hanya nama "Ahmad"
    const lines = batchText.split('\n').map(l => l.trim()).filter(Boolean);
    const students = lines.map(line => {
      const parts = line.split(/[;\t]/);
      if (parts.length >= 3) {
        return {
          class_id: classId,
          nis: parts[0].trim(),
          full_name: parts[1].trim(),
          gender: parts[2].trim().toUpperCase() === 'P' ? 'P' : 'L',
        };
      } else if (parts.length === 2) {
        return {
          class_id: classId,
          nis: parts[0].trim(),
          full_name: parts[1].trim(),
          gender: 'L',
        };
      }
      return {
        class_id: classId,
        nis: '',
        full_name: line.trim(),
        gender: 'L',
      };
    });

    setSaving(true);
    await onBatchImport(students);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </span>
            <span>Tambah Data Siswa</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setTab('single')}
            className={`flex-1 py-2 text-sm font-semibold border-b-2 transition ${
              tab === 'single'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Satu Siswa
          </button>
          <button
            type="button"
            onClick={() => setTab('batch')}
            className={`flex-1 py-2 text-sm font-semibold border-b-2 transition flex items-center justify-center space-x-1.5 ${
              tab === 'batch'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Impor Massal (Copy-Paste)</span>
          </button>
        </div>

        {tab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Rizki"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">NIS / NISN</label>
                <input
                  type="text"
                  placeholder="100234"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                placeholder="Keterangan khusus siswa..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                {saving ? 'Menyimpan...' : 'Simpan Siswa'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Tempel daftar nama siswa dari Excel atau teks biasa. Format per baris:
              <br />
              <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700 font-mono">
                NIS;Nama Siswa;L/P
              </code>{' '}
              atau cukup nama siswa saja per baris.
            </p>
            <textarea
              rows={6}
              required
              placeholder={`101;Aditya Pratama;L\n102;Annisa Zahra;P\n103;Budi Prasetyo;L`}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
            />
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
                {saving ? 'Mengimpor...' : 'Impor Semua Siswa'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

