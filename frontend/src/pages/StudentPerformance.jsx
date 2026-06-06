import { useEffect, useState } from 'react';
import ReportCardTemplate from '../components/ReportCardTemplate';
import { generateStudentReportCard } from '../utils/pdfGenerator';

function StudentPerformance() {
  const [streams, setStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1 2025');
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [editingScore, setEditingScore] = useState(null);
  const [editExam, setEditExam] = useState('');
  const [editContinuous, setEditContinuous] = useState('');
  const [editMessage, setEditMessage] = useState('');

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
  };

  const fetchStudentsByStream = async (streamId) => {
    if (!streamId) return;
    const res = await fetch(`/api/students?streamId=${streamId}`);
    const data = await res.json();
    setStudents(data);
  };

  const fetchPerformance = async () => {
    if (!selectedStudent || !selectedTerm) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/results/student/${selectedStudent}?term=${encodeURIComponent(selectedTerm)}`);
      const data = await res.json();
      setPerformance(data);
    } catch (err) {
      console.error(err);
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentInfo = async (studentId) => {
    if (!studentId) return;
    const res = await fetch(`/api/students/${studentId}`);
    const data = await res.json();
    setStudentInfo(data);
  };

  const handleEditScore = (subject) => {
    setEditingScore({
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      exam_score: subject.exam_score || '',
      continuous_score: subject.continuous_score || ''
    });
    setEditExam(subject.exam_score || '');
    setEditContinuous(subject.continuous_score || '');
    setEditMessage('');
  };

  const saveEditedScore = async () => {
    if (!editingScore) return;
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: selectedStudent,
        subject_id: editingScore.subject_id,
        academic_term: selectedTerm,
        exam_score: parseFloat(editExam) || null,
        continuous_score: parseFloat(editContinuous) || null
      })
    });
    if (res.ok) {
      setEditMessage('Score updated!');
      setTimeout(() => setEditMessage(''), 2000);
      await fetchPerformance();
      setEditingScore(null);
    } else {
      const err = await res.json();
      setEditMessage(`Error: ${err.error}`);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  useEffect(() => {
    fetchStudentsByStream(selectedStream);
    setSelectedStudent('');
    setPerformance(null);
    setStudentInfo(null);
  }, [selectedStream]);

  useEffect(() => {
    if (selectedStudent && selectedTerm) fetchPerformance();
  }, [selectedStudent, selectedTerm]);

  useEffect(() => {
    if (selectedStudent) fetchStudentInfo(selectedStudent);
  }, [selectedStudent]);

  const filteredSubjects = performance?.subjects?.filter(sub => !subjectFilter || sub.subject_id == subjectFilter) || [];
  const allSubjects = performance?.subjects || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Student Performance</h1>
        <p className="text-gray-500 mt-1">View individual student results, subject-wise scores, and download report card</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-700">Select Criteria</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="label">Term</label>
              <input type="text" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Class Stream</label>
              <select value={selectedStream} onChange={(e) => setSelectedStream(e.target.value)} className="input">
                <option value="">Select Stream</option>
                {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Student</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="input" disabled={!selectedStream}>
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admission_no})</option>)}
              </select>
              {!selectedStream && <p className="text-xs text-amber-600 mt-1">Select stream first</p>}
            </div>
            <div>
              <label className="label">Filter by Subject</label>
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input" disabled={!performance}>
                <option value="">All Subjects</option>
                {allSubjects.map(sub => <option key={sub.subject_id} value={sub.subject_id}>{sub.subject_name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading performance data...</div>}
      {performance && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-700">Summary</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div><span className="font-semibold">Total Marks:</span> {performance.total_marks}</div>
                <div><span className="font-semibold">Average:</span> {performance.average_score}</div>
                <div><span className="font-semibold">Grade:</span> <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{performance.grade}</span></div>
                <div><span className="font-semibold">Remark:</span> {performance.remark}</div>
                <div><span className="font-semibold">Class Position:</span> {performance.overall_position || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-700">Subject Scores</h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Subject</th><th>Exam</th><th>Continuous</th><th>Total</th><th>Position</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredSubjects.map(sub => (
                    <tr key={sub.subject_id}>
                      <td>{sub.subject_name}</td>
                      <td>{sub.exam_score ?? '-'}</td>
                      <td>{sub.continuous_score ?? '-'}</td>
                      <td className="font-semibold">{sub.total_score ?? '-'}</td>
                      <td>{sub.position ?? '-'}</td>
                      <td><button onClick={() => handleEditScore(sub)} className="text-blue-600 hover:text-blue-800">Edit</button></td>
                    </tr>
                  ))}
                  {filteredSubjects.length === 0 && <tr><td colSpan="6" className="text-center py-6">No subjects match filter.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => generateStudentReportCard(studentInfo, performance, 'report-card-template')} className="btn-success">
              Download Report Card (PDF)
            </button>
          </div>
        </div>
      )}
      {!loading && selectedStudent && !performance && (
        <div className="card">
          <div className="card-body text-center text-gray-500 py-8">No scores recorded for this student in the selected term.</div>
        </div>
      )}

      {/* Hidden PDF Template */}
      {performance && studentInfo && (
        <div id="report-card-template" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <ReportCardTemplate student={studentInfo} performance={performance} />
        </div>
      )}

      {/* Edit Score Modal */}
      {editingScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h3 className="text-xl font-bold">Edit Score</h3>
            </div>
            <div className="p-6 space-y-4">
              <p><strong>Student:</strong> {studentInfo?.name}</p>
              <p><strong>Subject:</strong> {editingScore.subject_name}</p>
              <p><strong>Term:</strong> {selectedTerm}</p>
              <div>
                <label className="label">Exam Score (0-100)</label>
                <input type="number" step="0.01" value={editExam} onChange={(e) => setEditExam(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Continuous Assessment (0-100)</label>
                <input type="number" step="0.01" value={editContinuous} onChange={(e) => setEditContinuous(e.target.value)} className="input" />
              </div>
              {editMessage && <p className={`text-sm ${editMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{editMessage}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={saveEditedScore} className="btn-primary">Save Changes</button>
                <button onClick={() => setEditingScore(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPerformance;