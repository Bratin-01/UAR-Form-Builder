import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function FormRecordsPage() {
  const { user } = useAuth();
  const [forms,   setForms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // PDF viewer modal
  const [viewingPdf,  setViewingPdf]  = useState(null); // { form_id, url }
  const [pdfLoading,  setPdfLoading]  = useState(false);

  const isAdmin = user?.role === "Admin";

  // ── fetch forms ─────────────────────────────────────────────────────────────
  const fetchForms = async () => {
    setLoading(true);
    setError("");
    try {
      const url = isAdmin
        ? `${API}/api/forms`
        : `${API}/api/forms?user_id=${user.user_id}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to load records");
      setForms(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, []);

  // ── fetch blob ───────────────────────────────────────────────────────────────
  const fetchBlob = async (form_id) => {
    const res = await fetch(`${API}/api/forms/${form_id}/pdf`);
    if (!res.ok) throw new Error("File not found");
    return await res.blob();
  };

  // ── open in modal ────────────────────────────────────────────────────────────
  const handleView = async (form_id) => {
    setPdfLoading(true);
    try {
      const blob = await fetchBlob(form_id);
      const url  = URL.createObjectURL(blob);
      setViewingPdf({ form_id, url });
    } catch (e) {
      alert(e.message);
    } finally {
      setPdfLoading(false);
    }
  };

  // ── download ─────────────────────────────────────────────────────────────────
  const handleDownload = async (form_id) => {
    try {
      const blob = await fetchBlob(form_id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `form_${form_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    }
  };

  const closeModal = () => {
    if (viewingPdf?.url) URL.revokeObjectURL(viewingPdf.url);
    setViewingPdf(null);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : "—";

  const thCls = "px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bayer-blue">Form Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? "All submitted UAR forms" : "Your submitted UAR forms"}
          </p>
        </div>
        <button onClick={fetchForms}
          className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-2.5">
          ⚠ {error} — <button className="underline" onClick={fetchForms}>retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={`${thCls} w-10`}>#</th>
              <th className={thCls}>Form ID</th>
              {isAdmin && <th className={thCls}>Submitted By</th>}
              <th className={thCls}>Submitted At</th>
              <th className={thCls}>Last Updated</th>
              <th className={thCls}>PDF</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-gray-400 text-sm">
                  Loading records…
                </td>
              </tr>
            ) : forms.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-gray-400 text-sm">
                  No form records found.
                </td>
              </tr>
            ) : (
              forms.map((f, idx) => (
                <tr key={f.form_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      #{f.form_id}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-sm text-gray-700">{f.user_id}</td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-600">{fmt(f.submitted_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{fmt(f.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(f.form_id)}
                        disabled={pdfLoading}
                        className="text-xs text-blue-400 border border-blue-400 px-2.5 py-1 rounded hover:bg-blue-700 hover:text-white transition-colors disabled:opacity-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(f.form_id)}
                        className="text-xs text-green-600 border border-green-400 px-2.5 py-1 rounded hover:bg-green-600 hover:text-white transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Showing {forms.length} record{forms.length !== 1 ? "s" : ""}
      </p>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col"
            style={{ height: "90vh" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-700 text-sm">
                Form #{viewingPdf.form_id} — PDF Preview
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(viewingPdf.form_id)}
                  className="text-xs bg-bayer-blue text-white px-3 py-1.5 rounded hover:bg-[#004aad] transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={closeModal}
                  className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            {/* PDF iframe */}
            <iframe
              src={viewingPdf.url}
              className="flex-1 w-full rounded-b-xl"
              title={`Form ${viewingPdf.form_id}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}