import React, { useState } from 'react';
import { Save, Check, Trash2, Award } from 'lucide-react';

export const GradeTable = ({
  students,
  meetings,
  activeMeetingId,
  grades,
  onSaveGrade,
  onDeleteStudent,
  weights,
}) => {
  // Local state to track modified values before saving or quick auto-save
  const [savingId, setSavingId] = useState(null);

  // Helper to calculate student's cumulative average
  const calculateFinalScore = (studentId) => {
    const studentGrades = grades.filter((g) => g.student_id === studentId);
    if (studentGrades.length === 0) return { avgP: 0, avgK: 0, avgS: 0, finalScore: 0, predicate: '-' };

    let sumP = 0, sumK = 0, sumS = 0;
    studentGrades.forEach((g) => {
      sumP += Number(g.score_knowledge || 0);
      sumK += Number(g.score_skill || 0);
      sumS += Number(g.score_attitude || 0);
    });

    const count = studentGrades.length;
    const avgP = sumP / count;
    const avgK = sumK / count;
    const avgS = sumS / count;

    const wP = weights?.weight_knowledge ?? 35;
    const wK = weights?.weight_skill ?? 35;
    const wS = weights?.weight_attitude ?? 30;

    const finalScore = ((avgP * wP) + (avgK * wK) + (avgS * wS)) / 100;

    let predicate = 'D';
    if (finalScore >= 88) predicate = 'A';
    else if (finalScore >= 76) predicate = 'B';
    else if (finalScore >= 65) predicate = 'C';

    return {
      avgP: avgP.toFixed(1),
      avgK: avgK.toFixed(1),
      avgS: avgS.toFixed(1),
      finalScore: finalScore.toFixed(1),
      predicate,
    };
  };

  const getPredicateBadge = (predicate) => {
    switch (predicate) {
      case 'A':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800">A (Sangat Baik)</span>;
      case 'B':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-100 text-sky-800">B (Baik)</span>;
      case 'C':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800">C (Cukup)</span>;
      case 'D':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-800">D (Kurang)</span>;
      default:
        return <span className="px-2 py-0.5 text-xs text-slate-400">-</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
            <tr>
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">NIS / Nama Siswa</th>
              <th className="py-3 px-4 w-16 text-center">L/P</th>
              <th className="py-3 px-4 w-32 text-center bg-sky-50/50">Pengetahuan</th>
              <th className="py-3 px-4 w-32 text-center bg-emerald-50/50">Keterampilan</th>
              <th className="py-3 px-4 w-32 text-center bg-amber-50/50">Sikap</th>
              <th className="py-3 px-4 w-28 text-center bg-indigo-50/50">Nilai Akhir</th>
              <th className="py-3 px-4 w-36 text-center">Predikat</th>
              <th className="py-3 px-4 w-20 text-center no-print">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Belum ada siswa di kelas ini. Klik tombol "Tambah Siswa" untuk memulai.
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const currentGrade = grades.find(
                  (g) => g.student_id === student.id && g.meeting_id === activeMeetingId
                ) || { score_knowledge: '', score_skill: '', score_attitude: '' };

                const stats = calculateFinalScore(student.id);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{student.full_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{student.nis || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-xs text-slate-500">
                      {student.gender}
                    </td>
                    {/* Pengetahuan */}
                    <td className="py-2 px-3 text-center bg-sky-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        defaultValue={currentGrade.score_knowledge}
                        onBlur={(e) => {
                          onSaveGrade(student.id, activeMeetingId, {
                            score_knowledge: Number(e.target.value),
                            score_skill: Number(currentGrade.score_skill || 0),
                            score_attitude: Number(currentGrade.score_attitude || 0),
                          });
                        }}
                        className="w-20 text-center py-1.5 px-2 font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sky-800 bg-white"
                      />
                    </td>
                    {/* Keterampilan */}
                    <td className="py-2 px-3 text-center bg-emerald-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        defaultValue={currentGrade.score_skill}
                        onBlur={(e) => {
                          onSaveGrade(student.id, activeMeetingId, {
                            score_knowledge: Number(currentGrade.score_knowledge || 0),
                            score_skill: Number(e.target.value),
                            score_attitude: Number(currentGrade.score_attitude || 0),
                          });
                        }}
                        className="w-20 text-center py-1.5 px-2 font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-emerald-800 bg-white"
                      />
                    </td>
                    {/* Sikap */}
                    <td className="py-2 px-3 text-center bg-amber-50/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        defaultValue={currentGrade.score_attitude}
                        onBlur={(e) => {
                          onSaveGrade(student.id, activeMeetingId, {
                            score_knowledge: Number(currentGrade.score_knowledge || 0),
                            score_skill: Number(currentGrade.score_skill || 0),
                            score_attitude: Number(e.target.value),
                          });
                        }}
                        className="w-20 text-center py-1.5 px-2 font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 text-amber-800 bg-white"
                      />
                    </td>
                    {/* Nilai Akhir */}
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-700 bg-indigo-50/30 font-mono text-base">
                      {stats.finalScore > 0 ? stats.finalScore : '-'}
                    </td>
                    {/* Predikat */}
                    <td className="py-3.5 px-4 text-center">
                      {getPredicateBadge(stats.predicate)}
                    </td>
                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center no-print">
                      <button
                        onClick={() => onDeleteStudent(student.id, student.full_name)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE STACKED CARDS VIEW (NO HORIZONTAL SCROLL) */}
      <div className="md:hidden space-y-3">
        {students.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            Belum ada siswa di kelas ini.
          </div>
        ) : (
          students.map((student, idx) => {
            const currentGrade = grades.find(
              (g) => g.student_id === student.id && g.meeting_id === activeMeetingId
            ) || { score_knowledge: '', score_skill: '', score_attitude: '' };

            const stats = calculateFinalScore(student.id);

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-400">
                      #{idx + 1} • {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">{student.full_name}</h4>
                    <p className="text-xs text-slate-500 font-mono">NIS: {student.nis || '-'}</p>
                  </div>
                  <div className="text-right">
                    {getPredicateBadge(stats.predicate)}
                    <div className="text-xs text-indigo-700 font-bold mt-1 font-mono">
                      Akhir: {stats.finalScore > 0 ? stats.finalScore : '-'}
                    </div>
                  </div>
                </div>

                {/* Grade inputs in mobile */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div className="bg-sky-50/60 p-2 rounded-xl text-center">
                    <label className="block text-[10px] font-bold uppercase text-sky-800 mb-1">
                      Pengetahuan
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={currentGrade.score_knowledge}
                      onBlur={(e) => {
                        onSaveGrade(student.id, activeMeetingId, {
                          score_knowledge: Number(e.target.value),
                          score_skill: Number(currentGrade.score_skill || 0),
                          score_attitude: Number(currentGrade.score_attitude || 0),
                        });
                      }}
                      className="w-full text-center py-1 font-bold rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>

                  <div className="bg-emerald-50/60 p-2 rounded-xl text-center">
                    <label className="block text-[10px] font-bold uppercase text-emerald-800 mb-1">
                      Keterampilan
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={currentGrade.score_skill}
                      onBlur={(e) => {
                        onSaveGrade(student.id, activeMeetingId, {
                          score_knowledge: Number(currentGrade.score_knowledge || 0),
                          score_skill: Number(e.target.value),
                          score_attitude: Number(currentGrade.score_attitude || 0),
                        });
                      }}
                      className="w-full text-center py-1 font-bold rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div className="bg-amber-50/60 p-2 rounded-xl text-center">
                    <label className="block text-[10px] font-bold uppercase text-amber-800 mb-1">
                      Sikap
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={currentGrade.score_attitude}
                      onBlur={(e) => {
                        onSaveGrade(student.id, activeMeetingId, {
                          score_knowledge: Number(currentGrade.score_knowledge || 0),
                          score_skill: Number(currentGrade.score_skill || 0),
                          score_attitude: Number(e.target.value),
                        });
                      }}
                      className="w-full text-center py-1 font-bold rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onDeleteStudent(student.id, student.full_name)}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center space-x-1 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Siswa</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

