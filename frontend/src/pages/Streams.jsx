import { useEffect, useState } from 'react';

function Streams() {
  const [streams, setStreams] = useState([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
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
    if (window.confirm('Delete this stream?')) {
      await fetch(`/api/streams/${id}`, { method: 'DELETE' });
      fetchStreams();
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Class Streams</h2>
      <form onSubmit={createStream} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New stream name (e.g., Form 1A)"
          className="border rounded px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Actions</th>
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
    </div>
  );
}

export default Streams;