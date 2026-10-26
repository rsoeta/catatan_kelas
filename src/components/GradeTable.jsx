import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Edit3,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const GradeTable = ({
  students,
  meetings,
  activeMeetingId,
  grades,
  onSaveGrade,
  onEditStudent,
  onDeleteStudent,
  weights,
}) => {
  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  // Handle column header clicks for sorting (toggles: asc/desc -> reverse -> reset)
  const handleSort = (key) => {
    setSortConfig((prev) => {
      // Numerical / score columns naturally sort descending first (highest first)
      const isScoreCol = ['knowledge', 'skill', 'attitude', 'finalScore', 'predicate'].includes(key);
      const initialDirection = isScoreCol ? 'desc' : 'asc';

      if (prev.key === key) {
        if (prev.direction === initialDirection) {
          return { key, direction: initialDirection === 'desc' ? 'asc' : 'desc' };
        }
        // Reset sort to original default order
        return { key: null, direction: 'asc' };
      }

      return { key, direction: initialDirection };
    });
  };

  // Render sort icon based on state
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition flex-shrink-0" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-3.5 h-3.5 text-sky-600 font-bold flex-shrink-0" />;
    }
    return <ArrowDown className="w-3.5 h-3.5 text-sky-600 font-bold flex-shrink-0" />;
  };

  // Memoized processed students list: Enriched, Filtered, and Sorted
  const processedStudents = useMemo(() => {
    // 1. Attach calculated scores and original index
    const enriched = students.map((student, originalIndex) => {
      const currentGrade = grades.find(
        (g) => g.student_id === student.id && g.meeting_id === activeMeetingId
      ) || { score_knowledge: '', score_skill: '', score_attitude: '' };

      const stats = calculateFinalScore(student.id);

      return {
        student,
        originalIndex: originalIndex + 1,
        currentGrade,
        stats,
      };
    });

    // 2. Filter by search query (NIS or Full Name)
    let filtered = enriched;
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        ({ student }) =>
          (student.full_name || '').toLowerCase().includes(term) ||
          (student.nis || '').toLowerCase().includes(term)
      );
    }

    // 3. Sort
    if (sortConfig.key) {
      const { key, direction } = sortConfig;
      const factor = direction === 'asc' ? 1 : -1;

      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        switch (key) {
          case 'no':
            comparison = a.originalIndex - b.originalIndex;
            break;
          case 'name':
            comparison = (a.student.full_name || '').localeCompare(
              b.student.full_name || '',
              'id',
              { sensitivity: 'base' }
            );
            break;
          case 'nis':
            comparison = (a.student.nis || '').localeCompare(
              b.student.nis || '',
              'id',
              { numeric: true }
            );
            break;
          case 'gender':
            comparison = (a.student.gender || '').localeCompare(b.student.gender || '');
            break;
          case 'knowledge': {
            const valA = Number(a.currentGrade.score_knowledge) || 0;
            const valB = Number(b.currentGrade.score_knowledge) || 0;
            comparison = valA - valB;
            break;
          }
          case 'skill': {
            const valA = Number(a.currentGrade.score_skill) || 0;
            const valB = Number(b.currentGrade.score_skill) || 0;
            comparison = valA - valB;
            break;
          }
          case 'attitude': {
            const valA = Number(a.currentGrade.score_attitude) || 0;
            const valB = Number(b.currentGrade.score_attitude) || 0;
            comparison = valA - valB;
            break;
          }
          case 'finalScore': {
            const valA = parseFloat(a.stats.finalScore) || 0;
            const valB = parseFloat(b.stats.finalScore) || 0;
            comparison = valA - valB;
            break;
          }
          case 'predicate': {
            const rank = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, '-': 0 };
            const valA = rank[a.stats.predicate] ?? 0;
            const valB = rank[b.stats.predicate] ?? 0;
            comparison = valA - valB;
            break;
          }
          default:
            comparison = 0;
        }

        // Secondary stable sort by original index
        if (comparison === 0) {
          return a.originalIndex - b.originalIndex;
        }

        return comparison * factor;
      });
    }

    return filtered;
  }, [students, grades, activeMeetingId, weights, searchQuery, sortConfig]);

  return (
    <div className="space-y-4">
      {/* SEARCH & SORT TOOLBAR */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan NIS atau Nama Siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
              title="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Sort Dropdown & Item Counter */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
          <div className="flex items-center space-x-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden xs:block" />
            <select
              value={sortConfig.key ? `${sortConfig.key}-${sortConfig.direction}` : ''}
              onChange={(e) => {
                if (!e.target.value) {
                  setSortConfig({ key: null, direction: 'asc' });
                } else {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction });
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="">Urutan: Standar</option>
              <option value="name-asc">Nama Siswa (A - Z)</option>
              <option value="name-desc">Nama Siswa (Z - A)</option>
              <option value="nis-asc">NIS (Terkecil - Terbesar)</option>
              <option value="nis-desc">NIS (Terbesar - Terkecil)</option>
              <option value="gender-asc">Jenis Kelamin (L - P)</option>
              <option value="gender-desc">Jenis Kelamin (P - L)</option>
              <option value="knowledge-desc">Pengetahuan (Tertinggi)</option>
              <option value="knowledge-asc">Pengetahuan (Terendah)</option>
              <option value="skill-desc">Keterampilan (Tertinggi)</option>
              <option value="skill-asc">Keterampilan (Terendah)</option>
              <option value="attitude-desc">Sikap (Tertinggi)</option>
              <option value="attitude-asc">Sikap (Terendah)</option>
              <option value="finalScore-desc">Nilai Akhir (Tertinggi)</option>
              <option value="finalScore-asc">Nilai Akhir (Terendah)</option>
              <option value="predicate-desc">Predikat (A - D)</option>
              <option value="predicate-asc">Predikat (D - A)</option>
              <option value="no-desc">Nomor Terbalik (N - 1)</option>
            </select>
          </div>

          {sortConfig.key && (
            <button
              type="button"
              onClick={() => setSortConfig({ key: null, direction: 'asc' })}
              className="inline-flex items-center px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition"
              title="Kembalikan urutan semula"
            >
              <X className="w-3 h-3 mr-1" />
              <span>Reset</span>
            </button>
          )}

          <div className="text-xs text-slate-500 font-medium pl-1">
            {searchQuery ? (
              <span>
                <strong className="text-sky-600 font-bold">{processedStudents.length}</strong> / {students.length} siswa
              </span>
            ) : (
              <span>{students.length} siswa</span>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
            <tr>
              {/* No Header */}
              <th
                onClick={() => handleSort('no')}
                className={`py-3 px-3 w-16 text-center cursor-pointer select-none transition group ${
                  sortConfig.key === 'no' ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-100'
                }`}
                title="Klik untuk mengurutkan berdasarkan Nomor Urut"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>No</span>
                  {renderSortIcon('no')}
                </div>
              </th>

              {/* NIS / Nama Siswa Header */}
              <th className="py-3 px-4 select-none">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className={`flex items-center space-x-1 hover:text-sky-600 transition group ${
                      sortConfig.key === 'name' ? 'text-sky-700 font-bold' : ''
                    }`}
                    title="Klik untuk mengurutkan berdasarkan Nama Siswa (A-Z / Z-A)"
                  >
                    <span>Nama Siswa</span>
                    {renderSortIcon('name')}
                  </button>
                  <span className="text-slate-300">/</span>
                  <button
                    type="button"
                    onClick={() => handleSort('nis')}
                    className={`flex items-center space-x-1 hover:text-sky-600 transition group ${
                      sortConfig.key === 'nis' ? 'text-sky-700 font-bold' : 'text-slate-400'
                    }`}
                    title="Klik untuk mengurutkan berdasarkan NIS"
                  >
                    <span>NIS</span>
                    {renderSortIcon('nis')}
                  </button>
                </div>
              </th>

              {/* L/P Header */}
              <th
                onClick={() => handleSort('gender')}
                className={`py-3 px-3 w-16 text-center cursor-pointer select-none transition group ${
                  sortConfig.key === 'gender' ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-100'
                }`}
                title="Klik untuk mengurutkan berdasarkan Jenis Kelamin"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>L/P</span>
                  {renderSortIcon('gender')}
                </div>
              </th>

              {/* Pengetahuan Header */}
              <th
                onClick={() => handleSort('knowledge')}
                className={`py-3 px-3 w-32 text-center cursor-pointer select-none transition group ${
                  sortConfig.key === 'knowledge'
                    ? 'bg-sky-100/80 text-sky-800 font-bold'
                    : 'bg-sky-50/50 hover:bg-sky-100/50'
                }`}
                title="Klik untuk mengurutkan berdasarkan Nilai Pengetahuan"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Pengetahuan</span>
                  {renderSortIcon('knowledge')}
                </div>
              </th>

              {/* Keterampilan Header */}
              <th
                onClick={() => handleSort('skill')}
                className={`py-3 px-3 w-32 text-center cursor-pointer select-none transition group ${
                  sortConfig.key === 'skill'
                    ? 'bg-emerald-100/80 text-emerald-800 font-bold'
                    : 'bg-emerald-50/50 hover:bg-emerald-100/50'
                }`}
                title="Klik untuk mengurutkan berdasarkan Nilai Keterampilan"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Keterampilan</span>
                  {renderSortIcon('skill')}
                </div>
              </th>

              {/* Sikap Header */}
              <th
                onClick={() => handleSort('attitude')}
                className={`py-3 px-3 w-32 text-center cursor-pointer select-none transition group ${
                  sortConfig.key === 'attitude'
                    ? 'bg-amber-100/80 text-amber-800 font-bold'
                    : 'bg-amber-50/50 hover:bg-amber-100/50'
                }`}
                title="Klik untuk mengurutkan berdasarkan Nilai Sikap"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Sikap</span>
                  {renderSortIcon('attitude')}
                </div>
              </th>

              {/* Nilai Akhir Header */}
              <th
                onClick={() => handleSort('finalScore')}
                className={`py-3 px-3 w-28 text-center cursor-pointer select-none transition group ${
                  sortConfig.key === 'finalScore'
                    ? 'bg-indigo-100/80 text-indigo-800 font-bold'
                    : 'bg-indigo-50/50 hover:bg-indigo-100/50'
                }`}
                title="Klik untuk mengurutkan berdasarkan Nilai Akhir Kumulatif"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Nilai Akhir</span>
                  {renderSortIcon('finalScore')}
                </div>
              </th>

              {/* Predikat Header */}
              <th
                onClick={() => handleSort('predicate')}
                className={`py-3 px-3 w-36 text-center cursor-pointer select-none transition group ${
                  sortConfig.key === 'predicate'
                    ? 'bg-slate-200 text-slate-800 font-bold'
                    : 'hover:bg-slate-100'
                }`}
                title="Klik untuk mengurutkan berdasarkan Predikat Nilai"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Predikat</span>
                  {renderSortIcon('predicate')}
                </div>
              </th>

              {/* Aksi Header (Kecuali Aksi - Tidak ada sort) */}
              <th className="py-3 px-4 w-24 text-center no-print text-slate-600 font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Belum ada siswa di kelas ini. Klik tombol "Tambah Siswa" untuk memulai.
                </td>
              </tr>
            ) : processedStudents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">Tidak ada siswa ditemukan</p>
                    <p className="text-xs text-slate-400">
                      Tidak ada data yang cocok dengan pencarian "<strong>{searchQuery}</strong>".
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs font-bold text-sky-600 hover:underline"
                    >
                      Hapus Kata Kunci Pencarian
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              processedStudents.map(({ student, currentGrade, stats, originalIndex }, idx) => {
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
                        key={`${student.id}-${activeMeetingId}-k`}
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
                        key={`${student.id}-${activeMeetingId}-s`}
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
                        key={`${student.id}-${activeMeetingId}-a`}
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
                    {/* Aksi (Edit & Hapus) */}
                    <td className="py-3.5 px-4 text-center no-print">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                          title="Edit Data Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id, student.full_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        ) : processedStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada siswa ditemukan</p>
            <p className="text-xs text-slate-400">
              Tidak ada data yang cocok dengan pencarian "<strong>{searchQuery}</strong>".
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-sky-600 hover:underline"
            >
              Hapus Pencarian
            </button>
          </div>
        ) : (
          processedStudents.map(({ student, currentGrade, stats, originalIndex }, idx) => {
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
                      key={`${student.id}-${activeMeetingId}-m-k`}
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
                      key={`${student.id}-${activeMeetingId}-m-s`}
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
                      key={`${student.id}-${activeMeetingId}-m-a`}
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

                <div className="flex justify-end items-center space-x-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onEditStudent(student)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center space-x-1 p-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Siswa</span>
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id, student.full_name)}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center space-x-1 p-1"
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
