import React, { useState } from 'react';
import { X, Sliders, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const WeightSettingsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [knowledge, setKnowledge] = useState(settings?.weight_knowledge ?? 35);
  const [skill, setSkill] = useState(settings?.weight_skill ?? 35);
  const [attitude, setAttitude] = useState(settings?.weight_attitude ?? 30);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const total = Number(knowledge) + Number(skill) + Number(attitude);
  const isValid = total === 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      toast.error('Total bobot penilaian harus tepat 100%!');
      return;
    }
    setSaving(true);
    await onSave({
      weight_knowledge: Number(knowledge),
      weight_skill: Number(skill),
      weight_attitude: Number(attitude),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Sliders className="w-5 h-5" />
            </span>
            <span>Pengaturan Bobot Nilai Akhir</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Tentukan persentase kontribusi masing-masing aspek terhadap Nilai Akhir siswa. Total ketiga bobot wajib tepat <strong>100%</strong>.
          </p>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Bobot Pengetahuan (%)</span>
              <span className="text-sky-600">{knowledge}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Bobot Keterampilan (%)</span>
              <span className="text-emerald-600">{skill}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Bobot Sikap (%)</span>
              <span className="text-amber-600">{attitude}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={attitude}
              onChange={(e) => setAttitude(e.target.value)}
              className="w-full accent-amber-600"
            />
          </div>

          <div className={`p-3 rounded-xl text-sm flex items-center justify-between font-bold ${
            isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            <span>Total Bobot:</span>
            <span>{total}% {isValid ? '✓ (Pas)' : '✕ (Harus 100%)'}</span>
          </div>

          {!isValid && (
            <div className="text-xs text-rose-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Harap sesuaikan hingga jumlah pas 100%.</span>
            </div>
          )}

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
              disabled={!isValid || saving}
              className="px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Terapkan Bobot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

