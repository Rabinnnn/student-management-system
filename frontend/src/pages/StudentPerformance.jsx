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
  const [subjectFilter, setSubjectFilter] = useState(''); // subject filter
  const [editingScore, setEditingScore] = useState(null); // { subject_id, subject_name, exam_score, continuous_score }
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
      setEditMessage('Score updated successfully!');
      setTimeout(() => setEditMessage(''), 2000);
      // Refresh performance data
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

  // Filter subjects if subjectFilter is set
  const filteredSubjects = performance?.subjects?.filter(sub => 
    !subjectFilter || sub.subject_id == subjectFilter
  ) || [];

  // Unique subjects for filter dropdown
  const allSubjects = performance?.subjects || [];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Student Performance</h2>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Term</label>
          <input
            type="text"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Class Stream</label>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Stream</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            disabled={!selectedStream}
          >
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admission_no})</option>)}
          </select>
          {!selectedStream && <p className="text-sm text-amber-600">Select stream first</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Filter by Subject</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            disabled={!performance}
          >
            <option value="">All Subjects</option>
            {allSubjects.map(sub => (
              <option key={sub.subject_id} value={sub.subject_id}>{sub.subject_name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {performance && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-lg mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div><span className="font-medium">Total Marks:</span> {performance.total_marks}</div>
              <div><span className="font-medium">Average:</span> {performance.average_score}</div>
              <div><span className="font-medium">Grade:</span> {performance.grade}</div>
              <div><span className="font-medium">Remark:</span> {performance.remark}</div>
              <div><span className="font-medium">Class Position:</span> {performance.overall_position || 'N/A'}</div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Exam Score</th>
                  <th className="p-2">Continuous</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Position</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map(sub => (
                  <tr key={sub.subject_id} className="border-t">
                    <td className="p-2">{sub.subject_name}</td>
                    <td className="p-2">{sub.exam_score ?? '-'}</td>
                    <td className="p-2">{sub.continuous_score ?? '-'}</td>
                    <td className="p-2 font-semibold">{sub.total_score ?? '-'}</td>
                    <td className="p-2">{sub.position ?? '-'}</td>
                    <td className="p-2">
                      <button 
                        onClick={() => handleEditScore(sub)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSubjects.length === 0 && (
                  <tr><td colSpan="6" className="p-4 text-center text-gray-500">No subjects match filter</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PDF Download Button */}
          <div className="mt-4">
            <button
              onClick={() => generateStudentReportCard(studentInfo, performance, 'report-card-template')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download Report Card (PDF)
            </button>
          </div>
        </div>
      )}
      {!loading && selectedStudent && !performance && <p className="text-gray-500">No scores recorded for this student in the selected term.</p>}

      {/* Hidden PDF Template */}
      {performance && studentInfo && (
        <div id="report-card-template" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <ReportCardTemplate student={studentInfo} performance={performance} />
        </div>
      )}

      {/* Edit Score Modal */}
      {editingScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Edit Score</h3>
            <p><strong>Student:</strong> {studentInfo?.name}</p>
            <p><strong>Subject:</strong> {editingScore.subject_name}</p>
            <p><strong>Term:</strong> {selectedTerm}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium">Exam Score (0-100)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editExam}
                  onChange={(e) => setEditExam(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Continuous Assessment (0-100)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editContinuous}
                  onChange={(e) => setEditContinuous(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              {editMessage && <p className={`text-sm ${editMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{editMessage}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={saveEditedScore} className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
                <button onClick={() => setEditingScore(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPerformance;