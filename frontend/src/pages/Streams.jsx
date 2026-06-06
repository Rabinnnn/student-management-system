import { useEffect, useState } from 'react';

function Streams() {
  const [streams, setStreams] = useState([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [viewingStream, setViewingStream] = useState(null);
  const [streamDetails, setStreamDetails] = useState({ subjects: [], students: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
  };

  const fetchStreamDetails = async (streamId) => {
    setLoadingDetails(true);
    try {
      const subjectsRes = await fetch(`/api/subjects/stream/${streamId}`);
      const subjects = await subjectsRes.json();
      const studentsRes = await fetch(`/api/students?streamId=${streamId}`);
      const students = await studentsRes.json();
      setStreamDetails({ subjects, students });
    } catch (err) {
      console.error(err);
      setStreamDetails({ subjects: [], students: [] });
    } finally {
      setLoadingDetails(false);
    }
  };

  const createStream = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await fetch('/api/streams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    setNewName('');
    fetchStreams();
  };

  const updateStream = async (id) => {
    await fetch(`/api/streams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });
    setEditing(null);
    fetchStreams();
  };

  const deleteStream = async (id) => {
    if (window.confirm('Delete this stream? This will remove stream assignment from students but not delete students.')) {
      await fetch(`/api/streams/${id}`, { method: 'DELETE' });
      fetchStreams();
    }
  };

  const openViewModal = async (stream) => {
    setViewingStream(stream);
    await fetchStreamDetails(stream.id);
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Class Streams</h1>
        <p className="text-gray-500 mt-1">Manage academic streams and view assigned subjects/students</p>
      </div>

      {/* Add Stream Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-700">Add New Stream</h2>
        </div>
        <div className="card-body">
          <form onSubmit={createStream} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Form 1A, Form 2B"
              className="input flex-1"
            />
            <button type="submit" className="btn-primary">+ Add Stream</button>
          </form>
        </div>
      </div>

      {/* Streams List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-700">All Streams</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {streams.map(stream => (
                <tr key={stream.id}>
                  <td>{stream.id}</td>
                  <td>
                    {editing === stream.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium">{stream.name}</span>
                    )}
                  </td>
                  <td className="space-x-2">
                    {editing === stream.id ? (
                      <>
                        <button onClick={() => updateStream(stream.id)} className="text-green-600 hover:text-green-800">Save</button>
                        <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openViewModal(stream)} className="text-purple-600 hover:text-purple-800">View</button>
                        <button onClick={() => { setEditing(stream.id); setEditName(stream.name); }} className="text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={() => deleteStream(stream.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {streams.length === 0 && (
                <tr><td colSpan="3" className="text-center py-8 text-gray-500">No streams created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewingStream && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Stream Details: {viewingStream.name}</h3>
              <button onClick={() => setViewingStream(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <p className="text-center text-gray-500">Loading details...</p>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-gray-700">📖 Assigned Subjects</h4>
                    {streamDetails.subjects.length === 0 ? (
                      <p className="text-gray-500 italic">No subjects assigned.</p>
                    ) : (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {streamDetails.subjects.map(sub => (
                          <li key={sub.id} className="bg-gray-50 rounded px-3 py-2 text-gray-700">{sub.name} ({sub.code})</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-gray-700">👨‍🎓 Students in Stream</h4>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr><th>Admission No</th><th>Name</th></tr>
                        </thead>
                        <tbody>
                          {streamDetails.students.map(s => (
                            <tr key={s.id}><td>{s.admission_no}</td><td>{s.name}</td></tr>
                          ))}
                          {streamDetails.students.length === 0 && (
                            <tr><td colSpan="2" className="text-center py-4 text-gray-500">No students assigned.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button onClick={() => setViewingStream(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Streams;