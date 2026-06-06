import { useEffect, useState } from 'react';

function Students() {
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [filterStream, setFilterStream] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ admission_no: '', name: '', stream_id: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');

  const fetchStudents = async (streamId = '') => {
    const url = streamId ? `/api/students?streamId=${streamId}` : '/api/students';
    const res = await fetch(url);
    const data = await res.json();
    setStudents(data);
  };

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/students/${editing}` : '/api/students';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setMessage(editing ? 'Student updated!' : 'Student added!');
      setTimeout(() => setMessage(''), 2000);
      setShowModal(false);
      setEditing(null);
      setFormData({ admission_no: '', name: '', stream_id: '' });
      fetchStudents(filterStream);
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error}`);
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Delete this student? This will also delete all their scores.')) {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchStudents(filterStream);
    }
  };

  const viewStudent = async (id) => {
    const res = await fetch(`/api/students/${id}`);
    const data = await res.json();
    setSelectedStudent(data);
  };

  useEffect(() => {
    fetchStudents(filterStream);
    fetchStreams();
  }, [filterStream]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
        <p className="text-gray-500 mt-1">Register, edit, delete students and view their details</p>
      </div>

      {/* Filters and Add Button */}
      <div className="card">
        <div className="card-body flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="flex-1">
            <label className="label">Filter by Stream</label>
            <select
              value={filterStream}
              onChange={e => setFilterStream(e.target.value)}
              className="input"
            >
              <option value="">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={() => { setEditing(null); setFormData({ admission_no: '', name: '', stream_id: '' }); setShowModal(true); }} className="btn-primary">
            + Add Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Admission No</th><th>Name</th><th>Stream</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.admission_no}</td>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.stream_name || 'Not assigned'}</td>
                  <td className="space-x-2">
                    <button onClick={() => viewStudent(s.id)} className="text-purple-600 hover:text-purple-800">View</button>
                    <button onClick={() => { setEditing(s.id); setFormData({ admission_no: s.admission_no, name: s.name, stream_id: s.stream_id || '' }); setShowModal(true); }} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => deleteStudent(s.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-gray-500">No students found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Student Details</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-2">
              <p><span className="font-semibold">Admission No:</span> {selectedStudent.admission_no}</p>
              <p><span className="font-semibold">Name:</span> {selectedStudent.name}</p>
              <p><span className="font-semibold">Stream:</span> {selectedStudent.stream_name || 'Not assigned'}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button onClick={() => setSelectedStudent(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h3 className="text-xl font-bold">{editing ? 'Edit Student' : 'Add Student'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Admission Number</label>
                <input type="text" required value={formData.admission_no} onChange={e => setFormData({ ...formData, admission_no: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Stream (Optional)</label>
                <select value={formData.stream_id} onChange={e => setFormData({ ...formData, stream_id: e.target.value })} className="input">
                  <option value="">None</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
              {message && <p className="text-sm text-green-600">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;