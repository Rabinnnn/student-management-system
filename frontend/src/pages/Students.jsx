import { useEffect, useState } from 'react';

function Students() {
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [filterStream, setFilterStream] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ admission_no: '', name: '', stream_id: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);

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
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    setEditing(null);
    setFormData({ admission_no: '', name: '', stream_id: '' });
    fetchStudents(filterStream);
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Delete this student?')) {
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
    <div>
      <h2 className="text-xl font-bold mb-4">Students Management</h2>

      {/* Filters & Add Button */}
      <div className="flex gap-4 mb-4 flex-wrap items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium mb-1">Filter by Stream</label>
          <select
            value={filterStream}
            onChange={(e) => setFilterStream(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">All Streams</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button onClick={() => { setEditing(null); setFormData({ admission_no: '', name: '', stream_id: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Student
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Admission No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Stream</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.admission_no}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.stream_name || 'Not assigned'}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => viewStudent(s.id)} className="text-green-600">View</button>
                  <button onClick={() => { setEditing(s.id); setFormData({ admission_no: s.admission_no, name: s.name, stream_id: s.stream_id || '' }); setShowModal(true); }} className="text-blue-600">Edit</button>
                  <button onClick={() => deleteStudent(s.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Student Details</h3>
            <p><strong>Admission No:</strong> {selectedStudent.admission_no}</p>
            <p><strong>Name:</strong> {selectedStudent.name}</p>
            <p><strong>Stream:</strong> {selectedStudent.stream_name || 'Not assigned'}</p>
            <button onClick={() => setSelectedStudent(null)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Student' : 'Add Student'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium">Admission Number</label>
                <input type="text" required value={formData.admission_no} onChange={e => setFormData({ ...formData, admission_no: e.target.value })} className="border rounded px-3 py-2 w-full" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="border rounded px-3 py-2 w-full" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Stream (Optional)</label>
                <select value={formData.stream_id} onChange={e => setFormData({ ...formData, stream_id: e.target.value })} className="border rounded px-3 py-2 w-full">
                  <option value="">None</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;