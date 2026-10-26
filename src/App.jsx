import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ClassModal } from './components/ClassModal';
import { ClassManagementModal } from './components/ClassManagementModal';
import { StudentModal } from './components/StudentModal';
import { MeetingModal } from './components/MeetingModal';
import { WeightSettingsModal } from './components/WeightSettingsModal';
import { GradeTable } from './components/GradeTable';
import { PrintReport } from './components/PrintReport';
import {
  Layers,
  Plus,
  Users,
  Calendar,
  AlertTriangle,
  Loader2,
  Edit3,
  Trash2,
  BookOpen,
  Settings2
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  // Data States
  const [classes, setClasses] = useState([]);
  const [activeClassId, setActiveClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activeMeetingId, setActiveMeetingId] = useState('');
  const [grades, setGrades] = useState([]);
  const [settings, setSettings] = useState({
    weight_knowledge: 35,
    weight_skill: 35,
    weight_attitude: 30,
  });

  // UI Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isClassManagementOpen, setIsClassManagementOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // 1. Fetch Classes & Settings when user logs in
  useEffect(() => {
    if (!user || !supabase) return;

    const fetchInitialData = async () => {
      setLoadingData(true);
      try {
        // Fetch classes
        const { data: clsData } = await supabase
          .from('classes')
          .select('*')
          .order('name');
        
        if (clsData) {
          setClasses(clsData);
          if (clsData.length > 0 && !activeClassId) {
            setActiveClassId(clsData[0].id);
          }
        }

        // Fetch settings
        const { data: setData } = await supabase
          .from('settings')
          .select('*')
          .single();
        if (setData) setSettings(setData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, [user]);

  // 2. Fetch Students, Meetings & Grades when activeClassId changes
  useEffect(() => {
    if (!user || !supabase || !activeClassId) {
      setStudents([]);
      setMeetings([]);
      setActiveMeetingId('');
      setGrades([]);
      return;
    }

    const fetchClassDetails = async () => {
      try {
        // Fetch students
        const { data: stdData } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', activeClassId)
          .order('full_name');
        setStudents(stdData || []);

        // Fetch meetings
        const { data: mtData } = await supabase
          .from('meetings')
          .select('*')
          .eq('class_id', activeClassId)
          .order('meeting_number');
        
        if (mtData && mtData.length > 0) {
          setMeetings(mtData);
          setActiveMeetingId(mtData[0].id);
        } else {
          setMeetings([]);
          setActiveMeetingId('');
        }

        // Fetch all grades for this class
        const { data: grdData } = await supabase
          .from('grades')
          .select('*');
        setGrades(grdData || []);
      } catch (err) {
        console.error('Error fetching class details:', err);
      }
    };

    fetchClassDetails();
  }, [user, activeClassId]);

  // Handlers for Class Management
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls) => {
    setEditingClass(cls);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (classData) => {
    if (!supabase || !user) return;

    if (classData.id) {
      // Update existing class
      const { id, ...payload } = classData;
      const { data, error } = await supabase
        .from('classes')
        .update({ ...payload, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        alert('Gagal memperbarui kelas: ' + error.message);
        return;
      }
      setClasses((prev) => prev.map((c) => (c.id === id ? data : c)));
    } else {
      // Create new class
      const { data, error } = await supabase
        .from('classes')
        .insert([{ ...classData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        alert('Gagal menambah kelas: ' + error.message);
        return;
      }
      setClasses((prev) => [...prev, data]);
      setActiveClassId(data.id);
    }
    setEditingClass(null);
  };

  const handleDeleteClass = async (classId, className) => {
    if (
      !window.confirm(
        `PERINGATAN: Menghapus kelas "${className}" akan menghapus seluruh data siswa, pertemuan, dan penilaian di kelas ini secara permanen.\n\nApakah Anda yakin ingin melanjutkan?`
      )
    ) {
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) {
      alert('Gagal menghapus kelas: ' + error.message);
      return;
    }

    setClasses((prev) => {
      const remaining = prev.filter((c) => c.id !== classId);
      if (activeClassId === classId) {
        setActiveClassId(remaining.length > 0 ? remaining[0].id : '');
      }
      return remaining;
    });
  };

  // Student Handlers
  const handleSaveStudent = async (studentData) => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from('students')
      .insert([{ ...studentData, user_id: user.id }])
      .select()
      .single();
    if (error) {
      alert('Gagal menambah siswa: ' + error.message);
      return;
    }
    setStudents((prev) => [...prev, data]);
  };

  const handleBatchImportStudents = async (studentList) => {
    if (!supabase || !user) return;
    const withUser = studentList.map((s) => ({ ...s, user_id: user.id }));
    const { data, error } = await supabase
      .from('students')
      .insert(withUser)
      .select();
    if (error) {
      alert('Gagal impor siswa: ' + error.message);
      return;
    }
    setStudents((prev) => [...prev, ...data]);
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Yakin ingin menghapus siswa "${studentName}" beserta seluruh nilainya?`)) return;
    if (!supabase) return;
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      alert('Gagal menghapus siswa: ' + error.message);
      return;
    }
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setGrades((prev) => prev.filter((g) => g.student_id !== studentId));
  };

  // Meeting Handlers
  const handleSaveMeeting = async (meetingData) => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from('meetings')
      .insert([{ ...meetingData, user_id: user.id }])
      .select()
      .single();
    if (error) {
      alert('Gagal menambah pertemuan: ' + error.message);
      return;
    }
    setMeetings((prev) => [...prev, data]);
    setActiveMeetingId(data.id);
  };

  // Grade Handlers
  const handleSaveGrade = async (studentId, meetingId, scores) => {
    if (!supabase || !user) return;
    if (!meetingId) {
      alert('Silakan buat pertemuan/sesi terlebih dahulu sebelum mengisi nilai!');
      return;
    }

    const existing = grades.find((g) => g.student_id === studentId && g.meeting_id === meetingId);

    if (existing) {
      const { data, error } = await supabase
        .from('grades')
        .update({ ...scores, updated_at: new Date() })
        .eq('id', existing.id)
        .select()
        .single();
      if (!error && data) {
        setGrades((prev) => prev.map((g) => (g.id === existing.id ? data : g)));
      }
    } else {
      const { data, error } = await supabase
        .from('grades')
        .insert([{
          user_id: user.id,
          student_id: studentId,
          meeting_id: meetingId,
          ...scores,
        }])
        .select()
        .single();
      if (!error && data) {
        setGrades((prev) => [...prev, data]);
      }
    }
  };

  const handleSaveSettings = async (newWeights) => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from('settings')
      .upsert({ user_id: user.id, ...newWeights })
      .select()
      .single();
    if (!error && data) {
      setSettings(data);
    }
  };

  const activeClass = classes.find((c) => c.id === activeClassId);

  // SUPABASE CONFIG WARNING BANNER
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
          <div className="flex items-center space-x-3 text-amber-600 mb-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <h2 className="text-xl font-bold text-slate-800">Konfigurasi Supabase Diperlukan</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Aplikasi React telah siap! Silakan masukkan <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> ke file <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono text-xs">.env</code> lokal Anda (atau di Environment Variables Vercel).
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono text-slate-700">
            <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Kredensial bisa didapatkan dari menu <strong>Project Settings &gt; API</strong> di dashboard Supabase Anda.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onPrint={() => window.print()}
      />

      {!user ? (
        <AuthModal />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 no-print">
          {/* HEADER / CLASS & MEETING CONTROLS */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-100 pb-4">
              {/* Class Selector Dropdown & Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400">
                    Rombel / Kelas Aktif
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={activeClassId}
                      onChange={(e) => setActiveClassId(e.target.value)}
                      className="text-base font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer max-w-xs sm:max-w-md truncate"
                    >
                      {classes.length === 0 ? (
                        <option value="">(Belum ada kelas dibuat)</option>
                      ) : (
                        classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} • {cls.subject} ({cls.semester} - Tingkat {cls.grade_level})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Quick Edit & Delete for current class */}
                {activeClass && (
                  <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                    <button
                      onClick={() => handleOpenEditClass(activeClass)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Detail Kelas Ini"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(activeClass.id, activeClass.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Kelas Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions: Class Management Hub & Add Class */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsClassManagementOpen(true)}
                  className="inline-flex items-center justify-center px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Buka Pusat Manajemen Seluruh Kelas"
                >
                  <Settings2 className="w-4 h-4 mr-1.5 text-slate-500" />
                  <span>Kelola Kelas</span>
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-white rounded-md font-bold text-sky-700 shadow-sm">
                    {classes.length}
                  </span>
                </button>

                <button
                  onClick={handleOpenCreateClass}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Tambah Kelas</span>
                </button>
              </div>
            </div>

            {/* Meetings Tab Bar */}
            {activeClass && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" /> Sesi:
                  </span>
                  {meetings.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Belum ada pertemuan</span>
                  ) : (
                    meetings.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveMeetingId(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                          activeMeetingId === m.id
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={m.topic}
                      >
                        Pertemuan #{m.meeting_number}
                      </button>
                    ))
                  )}
                  <button
                    onClick={() => setIsMeetingModalOpen(true)}
                    className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 border border-dashed border-sky-300 transition"
                    title="Tambah Pertemuan"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsStudentModalOpen(true)}
                    className="inline-flex items-center justify-center px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>Tambah Siswa</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE MEETING INFO */}
          {activeMeetingId && meetings.find((m) => m.id === activeMeetingId) && (
            <div className="bg-indigo-50/60 rounded-xl px-4 py-3 border border-indigo-100 flex justify-between items-center text-xs sm:text-sm">
              <div className="flex items-center space-x-2 text-indigo-900">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="font-bold">
                  Topik: {meetings.find((m) => m.id === activeMeetingId)?.topic}
                </span>
                <span className="text-indigo-400">•</span>
                <span className="text-indigo-600">
                  {meetings.find((m) => m.id === activeMeetingId)?.meeting_date}
                </span>
              </div>
              <div className="text-xs text-indigo-700 font-semibold hidden sm:block">
                Nilai otomatis tersimpan saat Anda berpindah kolom.
              </div>
            </div>
          )}

          {/* MAIN GRADE TABLE */}
          {activeClass ? (
            <GradeTable
              students={students}
              meetings={meetings}
              activeMeetingId={activeMeetingId}
              grades={grades}
              onSaveGrade={handleSaveGrade}
              onDeleteStudent={handleDeleteStudent}
              weights={settings}
            />
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">Belum Ada Kelas yang Dipilih</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Buat rombel pertama Anda atau buka Pusat Manajemen Kelas untuk mulai mencatat penilaian siswa.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleOpenCreateClass}
                  className="px-5 py-2.5 text-sm font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-md inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Buat Kelas Baru</span>
                </button>
                {classes.length > 0 && (
                  <button
                    onClick={() => setIsClassManagementOpen(true)}
                    className="px-5 py-2.5 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center"
                  >
                    <Settings2 className="w-4 h-4 mr-1.5" />
                    <span>Buka Daftar Kelas</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* PRINT REPORT (HIDDEN IN SCREEN, SHOWN WHEN PRINTED) */}
      <PrintReport
        activeClass={activeClass}
        students={students}
        meetings={meetings}
        grades={grades}
        weights={settings}
      />

      {/* MODALS */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
        editingClass={editingClass}
      />

      <ClassManagementModal
        isOpen={isClassManagementOpen}
        onClose={() => setIsClassManagementOpen(false)}
        classes={classes}
        activeClassId={activeClassId}
        onSelectClass={(id) => setActiveClassId(id)}
        onOpenCreateModal={() => {
          setIsClassManagementOpen(false);
          handleOpenCreateClass();
        }}
        onOpenEditModal={(cls) => {
          setIsClassManagementOpen(false);
          handleOpenEditClass(cls);
        }}
        onDeleteClass={handleDeleteClass}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        onBatchImport={handleBatchImportStudents}
        classId={activeClassId}
      />

      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSave={handleSaveMeeting}
        nextMeetingNumber={meetings.length + 1}
        classId={activeClassId}
      />

      <WeightSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
