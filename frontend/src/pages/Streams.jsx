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
      // Fetch subjects assigned to this stream
      const subjectsRes = await fetch(`/api/subjects/stream/${streamId}`);
      const subjects = await subjectsRes.json();
      
      // Fetch students in this stream
      const studentsRes = await fetch(`/api/students?streamId=${streamId}`);
      const students = await studentsRes.json();
      
      setStreamDetails({ subjects, students });
    } catch (err) {
      console.error('Error fetching stream details:', err);
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
    <div>
      <h2 className="text-xl font-bold mb-4">Class Streams</h2>
      <form onSubmit={createStream} className="flex gap-2 mb-6 flex-wrap">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New stream name (e.g., Form 1A)"
          className="border rounded px-3 py-2 flex-1 min-w-[200px]"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Stream</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {streams.map(stream => (
              <tr key={stream.id} className="border-t">
                <td className="p-2">{stream.id}</td>
                <td className="p-2">
                  {editing === stream.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    stream.name
                  )}
                </td>
                <td className="p-2 space-x-2">
                  {editing === stream.id ? (
                    <>
                      <button onClick={() => updateStream(stream.id)} className="text-green-600">Save</button>
                      <button onClick={() => setEditing(null)} className="text-gray-500">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => openViewModal(stream)} className="text-purple-600">View</button>
                      <button onClick={() => { setEditing(stream.id); setEditName(stream.name); }} className="text-blue-600">Edit</button>
                      <button onClick={() => deleteStream(stream.id)} className="text-red-600">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Stream Modal */}
      {viewingStream && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Stream Details: {viewingStream.name}</h3>
              <button onClick={() => setViewingStream(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {loadingDetails ? (
              <p>Loading details...</p>
            ) : (
              <div className="space-y-4">
                {/* Assigned Subjects */}
                <div>
                  <h4 className="font-semibold text-lg mb-2">Assigned Subjects</h4>
                  {streamDetails.subjects.length === 0 ? (
                    <p className="text-gray-500">No subjects assigned to this stream yet.</p>
                  ) : (
                    <ul className="list-disc list-inside">
                      {streamDetails.subjects.map(sub => (
                        <li key={sub.id}>{sub.name} ({sub.code})</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Students in Stream */}
                <div>
                  <h4 className="font-semibold text-lg mb-2">Students</h4>
                  {streamDetails.students.length === 0 ? (
                    <p className="text-gray-500">No students assigned to this stream yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left">Admission No</th>
                            <th className="p-2 text-left">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {streamDetails.students.map(student => (
                            <tr key={student.id} className="border-t">
                              <td className="p-2">{student.admission_no}</td>
                              <td className="p-2">{student.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingStream(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Streams;