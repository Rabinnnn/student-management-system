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
    if (!newName.trim() || !newCode.trim()) return;
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, code: newCode }),
    });
    setNewName('');
    setNewCode('');
    fetchSubjects();
    fetchAvailableSubjects();
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
  };

  const deleteSubject = async (id) => {
    if (window.confirm('Delete this subject?')) {
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
  };

  const removeSubject = async (subjectId) => {
    await fetch('/api/subjects/assign', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId: selectedStream, subjectId }),
    });
    fetchAssignedSubjects(selectedStream);
    fetchAvailableSubjects();
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
    <div>
      <h2 className="text-xl font-bold mb-4">Subjects Management</h2>

      {/* Add Subject Form */}
      <form onSubmit={createSubject} className="flex gap-2 mb-6 flex-wrap">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Subject name (e.g., Mathematics)"
          className="border rounded px-3 py-2 flex-1 min-w-[200px]"
        />
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Code (e.g., MATH101)"
          className="border rounded px-3 py-2 flex-1 min-w-[150px]"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Subject</button>
      </form>

      {/* Subjects List */}
      <div className="overflow-x-auto mb-8">
        <h3 className="font-semibold mb-2">All Subjects</h3>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Code</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {subjects.map(sub => (
              <tr key={sub.id} className="border-t">
                <td className="p-2">{sub.id}</td>
                <td className="p-2">
                  {editing === sub.id ? (
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1" />
                  ) : sub.name}
                </td>
                <td className="p-2">
                  {editing === sub.id ? (
                    <input value={editCode} onChange={e => setEditCode(e.target.value)} className="border px-2 py-1" />
                  ) : sub.code}
                </td>
                <td className="p-2 space-x-2">
                  {editing === sub.id ? (
                    <>
                      <button onClick={() => updateSubject(sub.id)} className="text-green-600">Save</button>
                      <button onClick={() => setEditing(null)} className="text-gray-500">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditing(sub.id); setEditName(sub.name); setEditCode(sub.code); }} className="text-blue-600">Edit</button>
                      <button onClick={() => deleteSubject(sub.id)} className="text-red-600">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Subjects to Stream */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Assign Subjects to Class Stream</h3>
        <select
          value={selectedStream}
          onChange={e => setSelectedStream(e.target.value)}
          className="border rounded px-3 py-2 mb-4 w-full max-w-sm"
        >
          <option value="">Select Stream</option>
          {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {selectedStream && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Available Subjects</h4>
              {availableSubjects.filter(s => !assignedSubjects.some(ass => ass.id === s.id)).map(sub => (
                <div key={sub.id} className="flex justify-between items-center border p-2 mb-1 rounded">
                  <span>{sub.name} ({sub.code})</span>
                  <button onClick={() => assignSubject(sub.id)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Assign</button>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-medium mb-2">Assigned to {streams.find(s => s.id == selectedStream)?.name}</h4>
              {assignedSubjects.map(sub => (
                <div key={sub.id} className="flex justify-between items-center border p-2 mb-1 rounded">
                  <span>{sub.name} ({sub.code})</span>
                  <button onClick={() => removeSubject(sub.id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subjects;