import { useEffect, useState } from 'react';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [message, setMessage] = useState('');

  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects');
    const data = await res.json();
    setSubjects(data);
  };

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
  };

  const fetchAssignedSubjects = async (streamId) => {
    if (!streamId) return;
    const res = await fetch(`/api/subjects/stream/${streamId}`);
    const data = await res.json();
    setAssignedSubjects(data);
  };

  const fetchAvailableSubjects = async () => {
    const res = await fetch('/api/subjects');
    const data = await res.json();
    setAvailableSubjects(data);
  };

  const createSubject = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      setMessage('Please fill both name and code');
      return;
    }
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, code: newCode }),
    });
    if (res.ok) {
      setNewName('');
      setNewCode('');
      setMessage('Subject added!');
      setTimeout(() => setMessage(''), 2000);
      fetchSubjects();
      fetchAvailableSubjects();
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error}`);
    }
  };

  const updateSubject = async (id) => {
    await fetch(`/api/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, code: editCode }),
    });
    setEditing(null);
    fetchSubjects();
    fetchAvailableSubjects();
    if (selectedStream) fetchAssignedSubjects(selectedStream);
  };

  const deleteSubject = async (id) => {
    if (window.confirm('Delete this subject? This will remove it from all streams.')) {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      fetchSubjects();
      fetchAvailableSubjects();
      if (selectedStream) fetchAssignedSubjects(selectedStream);
    }
  };

  const assignSubject = async (subjectId) => {
    await fetch('/api/subjects/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId: selectedStream, subjectId }),
    });
    fetchAssignedSubjects(selectedStream);
    fetchAvailableSubjects();
    setMessage('Subject assigned!');
    setTimeout(() => setMessage(''), 2000);
  };

  const removeSubject = async (subjectId) => {
    await fetch('/api/subjects/assign', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId: selectedStream, subjectId }),
    });
    fetchAssignedSubjects(selectedStream);
    fetchAvailableSubjects();
    setMessage('Subject removed');
    setTimeout(() => setMessage(''), 2000);
  };

  useEffect(() => {
    fetchSubjects();
    fetchStreams();
    fetchAvailableSubjects();
  }, []);

  useEffect(() => {
    if (selectedStream) {
      fetchAssignedSubjects(selectedStream);
    }
  }, [selectedStream]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Subjects Management</h1>
        <p className="text-gray-500 mt-1">Create, edit, delete subjects and assign them to class streams</p>
      </div>

      {/* Add Subject Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-700">Add New Subject</h2>
        </div>
        <div className="card-body">
          {message && <div className="mb-4 p-2 rounded bg-green-100 text-green-700 text-sm">{message}</div>}
          <form onSubmit={createSubject} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Subject name (e.g., Mathematics)"
              className="input flex-1"
            />
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Code (e.g., MATH101)"
              className="input flex-1"
            />
            <button type="submit" className="btn-primary">+ Add Subject</button>
          </form>
        </div>
      </div>

      {/* Subjects List Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-700">All Subjects</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Code</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {subjects.map(sub => (
                <tr key={sub.id}>
                  <td>{sub.id}</td>
                  <td>
                    {editing === sub.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border rounded px-2 py-1" />
                    ) : sub.name}
                  </td>
                  <td>
                    {editing === sub.id ? (
                      <input value={editCode} onChange={(e) => setEditCode(e.target.value)} className="border rounded px-2 py-1" />
                    ) : sub.code}
                  </td>
                  <td className="space-x-2">
                    {editing === sub.id ? (
                      <>
                        <button onClick={() => updateSubject(sub.id)} className="text-green-600 hover:text-green-800">Save</button>
                        <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditing(sub.id); setEditName(sub.name); setEditCode(sub.code); }} className="text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={() => deleteSubject(sub.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-gray-500">No subjects yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Subjects to Stream Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-700">Assign Subjects to Class Stream</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Select Class Stream</label>
            <select
              value={selectedStream}
              onChange={e => setSelectedStream(e.target.value)}
              className="input max-w-sm"
            >
              <option value="">-- Choose a stream --</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {selectedStream && (
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">📚 Available Subjects</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableSubjects.filter(s => !assignedSubjects.some(ass => ass.id === s.id)).map(sub => (
                    <div key={sub.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span>{sub.name} ({sub.code})</span>
                      <button onClick={() => assignSubject(sub.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">+ Assign</button>
                    </div>
                  ))}
                  {availableSubjects.filter(s => !assignedSubjects.some(ass => ass.id === s.id)).length === 0 && (
                    <p className="text-gray-500 italic">No more subjects to assign.</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">✅ Assigned to {streams.find(s => s.id == selectedStream)?.name}</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {assignedSubjects.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
                      <span>{sub.name} ({sub.code})</span>
                      <button onClick={() => removeSubject(sub.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                    </div>
                  ))}
                  {assignedSubjects.length === 0 && <p className="text-gray-500 italic">No subjects assigned yet.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Subjects;