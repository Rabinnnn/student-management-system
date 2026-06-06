import { useEffect, useState } from 'react';

function Scores() {
  const [streams, setStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1 2025');
  const [examScore, setExamScore] = useState('');
  const [continuousScore, setContinuousScore] = useState('');
  const [message, setMessage] = useState('');
  const [existingScores, setExistingScores] = useState([]);

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
  };

  const fetchStudents = async (streamId) => {
    if (!streamId) {
      setStudents([]);
      return;
    }
    const res = await fetch(`/api/students?streamId=${streamId}`);
    const data = await res.json();
    setStudents(data);
  };

  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects');
    const data = await res.json();
    setSubjects(data);
  };

  const fetchExistingScores = async () => {
    if (!selectedStudent || !selectedTerm) return;
    const res = await fetch(`/api/assessments/student/${selectedStudent}?term=${encodeURIComponent(selectedTerm)}`);
    if (res.ok) {
      const data = await res.json();
      setExistingScores(data);
    } else {
      setExistingScores([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject) {
      setMessage('Please select student, subject, and enter a term');
      return;
    }
    if (!selectedTerm.trim()) {
      setMessage('Please enter an academic term');
      return;
    }

    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: selectedStudent,
        subject_id: selectedSubject,
        academic_term: selectedTerm.trim(),
        exam_score: parseFloat(examScore) || null,
        continuous_score: parseFloat(continuousScore) || null,
      }),
    });

    if (res.ok) {
      setMessage('Score saved successfully!');
      setExamScore('');
      setContinuousScore('');
      fetchExistingScores(); // refresh the list
      setTimeout(() => setMessage(''), 3000);
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error}`);
    }
  };

  // When stream changes, load students and reset selected student
  useEffect(() => {
    fetchStudents(selectedStream);
    setSelectedStudent('');
  }, [selectedStream]);

  // When student or term changes, load existing scores
  useEffect(() => {
    if (selectedStudent && selectedTerm) {
      fetchExistingScores();
    } else {
      setExistingScores([]);
    }
  }, [selectedStudent, selectedTerm]);

  useEffect(() => {
    fetchStreams();
    fetchSubjects();
  }, []);

  // Pre-fill scores if editing an existing score for the selected subject
  useEffect(() => {
    if (selectedSubject && existingScores.length > 0) {
      const existing = existingScores.find(s => s.subject_id == selectedSubject);
      if (existing) {
        setExamScore(existing.exam_score ?? '');
        setContinuousScore(existing.continuous_score ?? '');
      } else {
        setExamScore('');
        setContinuousScore('');
      }
    } else {
      setExamScore('');
      setContinuousScore('');
    }
  }, [selectedSubject, existingScores]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Record Student Scores</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Academic Term</label>
            <input
              type="text"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              placeholder="e.g., Term 1 2025, Mid Term, etc."
              className="border rounded px-3 py-2 w-full"
              required
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
            {!selectedStream && (
                <p className="text-sm text-amber-600 mt-1">⚠️ Please select a class stream first</p>
            )}
        </div>
          <div>
            <label className="block font-medium mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Exam Score (0-100)</label>
            <input
              type="number"
              step="0.01"
              value={examScore}
              onChange={(e) => setExamScore(e.target.value)}
              placeholder="e.g., 75"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Continuous Assessment (0-100)</label>
            <input
              type="number"
              step="0.01"
              value={continuousScore}
              onChange={(e) => setContinuousScore(e.target.value)}
              placeholder="e.g., 20"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Save Score</button>
        {message && <p className="text-green-600 mt-2">{message}</p>}
      </form>

      {/* Show existing scores for this student/term */}
      {selectedStudent && selectedTerm && (
        <div className="mt-8">
          <h3 className="font-bold mb-2">Scores for {students.find(s => s.id == selectedStudent)?.name} - {selectedTerm}</h3>
          {existingScores.length === 0 ? (
            <p className="text-gray-500">No scores recorded for this term yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Subject</th>
                    <th className="p-2">Exam</th>
                    <th className="p-2">Continuous</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {existingScores.map(score => (
                    <tr key={score.id} className="border-t">
                      <td className="p-2">{score.subject_name}</td>
                      <td className="p-2">{score.exam_score ?? '-'}</td>
                      <td className="p-2">{score.continuous_score ?? '-'}</td>
                      <td className="p-2 font-semibold">{score.total_score ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Scores;