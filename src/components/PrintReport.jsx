import React from 'react';

export const PrintReport = ({ activeClass, students, meetings, grades, weights }) => {
  if (!activeClass) return null;

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

  return (
    <div className="hidden print:block p-8 bg-white text-black font-serif text-sm">
      <div className="flex items-center justify-center space-x-4 border-b-2 border-black pb-4 mb-6">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-16 h-16 object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Laporan Rekapitulasi Nilai Siswa</h1>
          <p className="text-base font-semibold">Tahun Ajaran {activeClass.academic_year} — Semester {activeClass.semester}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><strong>Kelas / Rombel:</strong> {activeClass.name} (Tingkat {activeClass.grade_level})</p>
          <p><strong>Mata Pelajaran:</strong> {activeClass.subject}</p>
        </div>
        <div className="text-right">
          <p><strong>Total Pertemuan:</strong> {meetings.length} Sesi</p>
          <p><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-black text-xs mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 w-10 text-center">No</th>
            <th className="border border-black p-2 w-28 text-center">NIS</th>
            <th className="border border-black p-2 text-left">Nama Siswa</th>
            <th className="border border-black p-2 w-12 text-center">L/P</th>
            <th className="border border-black p-2 w-20 text-center">Rata2 P</th>
            <th className="border border-black p-2 w-20 text-center">Rata2 K</th>
            <th className="border border-black p-2 w-20 text-center">Rata2 S</th>
            <th className="border border-black p-2 w-24 text-center font-bold">Nilai Akhir</th>
            <th className="border border-black p-2 w-20 text-center font-bold">Predikat</th>
          </tr>
        </thead>
        <tbody>
          {students.map((st, i) => {
            const stats = calculateFinalScore(st.id);
            return (
              <tr key={st.id}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2 text-center font-mono">{st.nis || '-'}</td>
                <td className="border border-black p-2 font-medium">{st.full_name}</td>
                <td className="border border-black p-2 text-center">{st.gender}</td>
                <td className="border border-black p-2 text-center">{stats.avgP}</td>
                <td className="border border-black p-2 text-center">{stats.avgK}</td>
                <td className="border border-black p-2 text-center">{stats.avgS}</td>
                <td className="border border-black p-2 text-center font-bold">{stats.finalScore}</td>
                <td className="border border-black p-2 text-center font-bold">{stats.predicate}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-8 text-center text-sm pt-8">
        <div>
          <p>Mengetahui,</p>
          <p className="font-semibold mb-16">Kepala Sekolah</p>
          <p className="font-bold underline">( ............................................ )</p>
          <p>NIP. .........................................</p>
        </div>
        <div>
          <p>Guru Pengampu Mata Pelajaran,</p>
          <p className="font-semibold mb-16">{activeClass.subject}</p>
          <p className="font-bold underline">( ............................................ )</p>
          <p>NIP. .........................................</p>
        </div>
      </div>
    </div>
  );
};

