import { useEffect, useState } from 'react';
import ClassReportTemplate from '../components/ClassReportTemplate';
import { generateClassReport } from '../utils/pdfGenerator';

function ClassPerformance() {
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1 2025');
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('subject');
  const [streamName, setStreamName] = useState('');

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
    const stream = streams.find(s => s.id == selectedStream);
    setStreamName(stream ? stream.name : '');
  }, [selectedStream, streams]);

  useEffect(() => {
    setPerformance(null);
  }, [selectedStream, selectedSubject, selectedTerm, viewType]);

  useEffect(() => {
    if (selectedStream && selectedTerm && (viewType === 'subject' ? selectedSubject : true)) {
      fetchPerformance();
    }
  }, [selectedStream, selectedSubject, selectedTerm, viewType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Class Performance</h1>
        <p className="text-gray-500 mt-1">View and analyze performance per subject or overall ranking</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-700">Report Filters</h2>
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
              <label className="label">Report Type</label>
              <select value={viewType} onChange={(e) => setViewType(e.target.value)} className="input">
                <option value="subject">By Subject</option>
                <option value="overall">Overall Class Ranking</option>
              </select>
            </div>
            {viewType === 'subject' && (
              <div>
                <label className="label">Subject</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input">
                  <option value="">Select Subject</option>
                  {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading class performance...</div>}
      {performance && performance.students && performance.students.length > 0 && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-700">
                {viewType === 'subject' ? `${performance.subject_name} - ${performance.term}` : `Overall Class Ranking - ${performance.term}`}
              </h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Position</th><th>Admission No</th><th>Student Name</th>
                    {viewType === 'subject' ? (
                      <><th>Exam</th><th>Continuous</th><th>Total</th></>
                    ) : (
                      <><th>Total Marks</th><th>Average</th></>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {performance.students.map((student, idx) => (
                    <tr key={student.student_id}>
                      <td className="font-semibold">{student.position}</td>
                      <td>{student.admission_no}</td>
                      <td>{student.student_name}</td>
                      {viewType === 'subject' ? (
                        <>
                          <td>{student.exam_score}</td>
                          <td>{student.continuous_score}</td>
                          <td className="font-semibold">{student.total_score}</td>
                        </>
                      ) : (
                        <>
                          <td>{student.total_marks}</td>
                          <td>{student.average}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => generateClassReport({ stream_name: streamName }, performance, 'class-report-template')} className="btn-success">
              Download Class Report (PDF)
            </button>
          </div>
        </div>
      )}
      {!loading && selectedStream && (!performance || !performance.students || performance.students.length === 0) && (
        <div className="card">
          <div className="card-body text-center text-gray-500 py-8">No performance data available for the selected criteria.</div>
        </div>
      )}

      {/* Hidden PDF Template */}
      {performance && (
        <div id="class-report-template" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <ClassReportTemplate
            className={streamName}
            term={performance.term}
            students={performance.students}
            viewType={viewType}
            subjectName={viewType === 'subject' ? performance.subject_name : null}
          />
        </div>
      )}
    </div>
  );
}

export default ClassPerformance;