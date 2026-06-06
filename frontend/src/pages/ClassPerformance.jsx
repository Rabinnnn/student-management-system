import { useEffect, useState } from 'react';

function ClassPerformance() {
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1 2025');
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('subject'); // 'subject' or 'overall'

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
  };

  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects');
    const data = await res.json();
    setSubjects(data);
  };

  const fetchPerformance = async () => {
    if (!selectedStream || !selectedTerm) return;
    setLoading(true);
    try {
      let url;
      if (viewType === 'subject') {
        if (!selectedSubject) return;
        url = `/api/results/class/${selectedStream}/subject/${selectedSubject}?term=${encodeURIComponent(selectedTerm)}`;
      } else {
        url = `/api/results/class/${selectedStream}/overall?term=${encodeURIComponent(selectedTerm)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPerformance(data);
    } catch (err) {
      console.error(err);
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    fetchSubjects();
  }, []);

  useEffect(() => {
    setPerformance(null);
  }, [selectedStream, selectedSubject, selectedTerm, viewType]);

  useEffect(() => {
    if (selectedStream && selectedTerm && (viewType === 'subject' ? selectedSubject : true)) {
      fetchPerformance();
    }
  }, [selectedStream, selectedSubject, selectedTerm, viewType]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Class Performance</h2>
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
          <label className="block font-medium mb-1">Report Type</label>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="subject">By Subject</option>
            <option value="overall">Overall Class Ranking</option>
          </select>
        </div>
        {viewType === 'subject' && (
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
        )}
      </div>

      {loading && <p>Loading...</p>}
      {performance && (
        <div className="overflow-x-auto">
          <h3 className="font-bold mb-2">
            {viewType === 'subject' 
              ? `${performance.subject_name} - ${performance.term}` 
              : `Overall Class Ranking - ${performance.term}`}
          </h3>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Position</th>
                <th className="p-2">Admission No</th>
                <th className="p-2">Student Name</th>
                {viewType === 'subject' ? (
                  <>
                    <th className="p-2">Exam</th>
                    <th className="p-2">Continuous</th>
                    <th className="p-2">Total</th>
                  </>
                ) : (
                  <>
                    <th className="p-2">Total Marks</th>
                    <th className="p-2">Average</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {performance.students.map((student, idx) => (
                <tr key={student.student_id} className="border-t">
                  <td className="p-2 font-semibold">{student.position}</td>
                  <td className="p-2">{student.admission_no}</td>
                  <td className="p-2">{student.student_name}</td>
                  {viewType === 'subject' ? (
                    <>
                      <td className="p-2">{student.exam_score}</td>
                      <td className="p-2">{student.continuous_score}</td>
                      <td className="p-2 font-semibold">{student.total_score}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{student.total_marks}</td>
                      <td className="p-2">{student.average}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && selectedStream && !performance && (
        <p className="text-gray-500">No performance data available for the selected criteria.</p>
      )}
    </div>
  );
}

export default ClassPerformance;