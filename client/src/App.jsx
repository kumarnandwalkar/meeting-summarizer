import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

export default function App() {
  const [transcriptText, setTranscript] = useState('');
  const [instruction, setInstruction] = useState('Summarize in concise bullet points with action items and owners.');
  const [title, setTitle] = useState('Weekly Sync');
  const [summary, setSummary] = useState('');
  const [summaryId, setSummaryId] = useState(null);
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('Meeting Summary');
  const [loading, setLoading] = useState(false);

  async function handleSummarize() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptText, instruction, title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSummary(data.summary);
      setSummaryId(data.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveEdits() {
    if (!summaryId) return alert('No summary to save yet.');
    const res = await fetch(`${API_BASE}/summaries/${summaryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryText: summary }),
    });
    if (!res.ok) alert('Failed to save'); else alert('Saved');
  }

  async function share() {
    const list = recipients.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length === 0) return alert('Add recipient emails');

    const payload = { 
      recipients: list,
      subject,
      summaryText: summary
    };

    console.log("📤 Sending payload to backend:", payload);

    try {
      const res = await fetch(`${API_BASE}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Response from backend:", data);

      if (!res.ok) {
        alert(data.error || 'Failed');
      } else {
        alert(`✅ Sent to ${data.count || list.length} recipient(s): ${list.join(", ")}`);
      }
    } catch (err) {
      console.error("❌ Share error:", err);
      alert("Error while sending mail: " + err.message);
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setTranscript(text);
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h2>AI Meeting Notes Summarizer</h2>

      <label>Title</label>
      <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />

      <label>Transcript (.txt or paste)</label>
      <input type="file" accept=".txt" onChange={handleFile} />
      <textarea value={transcriptText} onChange={e=>setTranscript(e.target.value)} rows={10} style={{ width: '100%', marginTop: 8 }} />

      <label>Instruction</label>
      <input value={instruction} onChange={e=>setInstruction(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />

      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Summary'}
      </button>

      <h3 style={{ marginTop: 16 }}>Summary (editable)</h3>
      <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={14} style={{ width: '100%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={saveEdits}>Save Edits</button>
        <button onClick={() => navigator.clipboard.writeText(summary)}>Copy</button>
      </div>

      <h3 style={{ marginTop: 16 }}>Share via Email</h3>
      <label>Subject</label>
      <input value={subject} onChange={e=>setSubject(e.target.value)} style={{ width: '100%' }} />
      <label>Recipients (comma-separated)</label>
      <input value={recipients} onChange={e=>setRecipients(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
      <button onClick={share}>Send</button>
    </div>
  );
}
