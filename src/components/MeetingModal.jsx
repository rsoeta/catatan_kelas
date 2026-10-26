import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

export const MeetingModal = ({ isOpen, onClose, onSave, nextMeetingNumber, classId }) => {
  const [meetingNumber, setMeetingNumber] = useState(nextMeetingNumber || 1);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setSaving(true);
    await onSave({
      class_id: classId,
      meeting_number: Number(meetingNumber),
      meeting_date: meetingDate,
      topic: topic.trim(),
      description: description.trim(),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <span>Tambah Pertemuan / Sesi</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pertemuan Ke-</label>
              <input
                type="number"
                min="1"
                required
                value={meetingNumber}
                onChange={(e) => setMeetingNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Materi / Topik Bahasan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Logika Algoritma & Percabangan"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Tambahan</label>
            <textarea
              rows={2}
              placeholder="Rincian tugas atau materi praktikum..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
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
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pertemuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

