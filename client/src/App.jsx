import React, { useState } from 'react';
import './App.css';

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
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo">📝</div>
          <div>
            <h1 className="title">Meeting Summarizer</h1>
            <p className="subtitle">Turn raw transcripts into polished notes</p>
          </div>
        </div>
        {summaryId && (
          <div className="badge">ID: {summaryId}</div>
        )}
      </header>

      <main className="container">
        <div className="grid">
          <section className="panel">
            <div className="panel-header">Input</div>

            <div className="form-group">
              <label className="label">Title</label>
              <input
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Weekly Sync"
              />
            </div>

            <div className="form-group">
              <label className="label">Transcript (.txt or paste)</label>
              <input className="input-file" type="file" accept=".txt" onChange={handleFile} />
              <textarea
                className="textarea"
                value={transcriptText}
                onChange={e => setTranscript(e.target.value)}
                rows={10}
                placeholder="Paste meeting transcript here..."
              />
            </div>

            <div className="form-group">
              <label className="label">Instruction</label>
              <input
                className="input"
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                placeholder="How should the AI summarize?"
              />
            </div>

            <div className="actions">
              <button className="button primary" onClick={handleSummarize} disabled={loading}>
                {loading ? 'Generating…' : 'Generate Summary'}
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">Summary (editable)</div>
            <textarea
              className="textarea tall"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={14}
              placeholder="Your summary will appear here..."
            />
            <div className="actions">
              <button className="button" onClick={saveEdits} disabled={!summaryId}>Save Edits</button>
              <button className="button ghost" onClick={() => navigator.clipboard.writeText(summary)} disabled={!summary}>Copy</button>
            </div>

            <div className="panel-subheader">Share via Email</div>
            <div className="form-group">
              <label className="label">Subject</label>
              <input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Meeting Summary" />
            </div>
            <div className="form-group">
              <label className="label">Recipients (comma-separated)</label>
              <input className="input" value={recipients} onChange={e => setRecipients(e.target.value)} placeholder="alice@acme.com, bob@acme.com" />
            </div>
            <div className="actions">
              <button className="button primary" onClick={share} disabled={!summary || !recipients.trim()}>Send</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
