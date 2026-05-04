import { useState, useEffect } from "react";
import axios from "axios";

export default function DocumentsPatient({ patientId }) {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("Ordonnance");
  const [loading, setLoading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/documents/patient/${patientId}`);
      setDocs(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (patientId) fetchDocs(); }, [patientId]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      await axios.post(`http://localhost:8081/api/documents/upload/${patientId}`, formData);
      setFile(null);
      fetchDocs();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8081/api/documents/${id}`);
    fetchDocs();
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-3">Documents du patient</h3>
      <div className="flex gap-2 mb-4">
        <input type="file" onChange={e => setFile(e.target.files[0])} className="border p-1 rounded" />
        <select value={type} onChange={e => setType(e.target.value)} className="border p-1 rounded">
          <option>Ordonnance</option>
          <option>Analyse</option>
          <option>Radio</option>
          <option>Compte-rendu</option>
        </select>
        <button onClick={handleUpload} disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          {loading ? "..." : "Uploader"}
        </button>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead><tr className="bg-gray-100">
          <th className="p-2 text-left">Fichier</th>
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">Date</th>
          <th className="p-2"></th>
        </tr></thead>
        <tbody>
          {docs.map(d => (
            <tr key={d.id} className="border-t">
              <td className="p-2">
                <a href={`http://localhost:8081/api/documents/download/${d.nomFichier}`}
                  className="text-blue-600 underline" target="_blank">{d.nomFichier}</a>
              </td>
              <td className="p-2">{d.type}</td>
              <td className="p-2">{d.dateUpload?.slice(0,10)}</td>
              <td className="p-2">
                <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:underline">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}