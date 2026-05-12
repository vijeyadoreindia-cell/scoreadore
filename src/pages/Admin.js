import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp, setDoc, getDoc
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Admin.css";
import { ABOUT_PAGE_DEFAULTS, getDefaultAboutState, normalizeScoreBullets, DEFAULT_SCORE_BULLETS } from "../constants/aboutDefaults";

const TABS = ["Podcasts", "Programs", "Webinars", "Glimpses", "About", "Admins"];

export default function Admin() {
  const { isAdmin, user, SUPER_ADMIN } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Podcasts");

  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <main className="admin-main">
      <div className="container">
        <div className="admin-header fade-up">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage all content on the ADORE India portal</p>
          </div>
          <span className="admin-user-badge">👤 {user?.displayName}</span>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            (t === "Admins" && user?.email !== SUPER_ADMIN) ? null :
            <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
              {t === "Podcasts" && "🎙"} {t === "Programs" && "📚"} {t === "Webinars" && "📅"} {t === "Glimpses" && "🎬"} {t === "About" && "🌍"} {t === "Admins" && "👥"} {t}
            </button>
          ))}
        </div>

        <div className="admin-content fade-in">
          {activeTab === "Podcasts" && <PodcastsAdmin />}
          {activeTab === "Programs" && <ProgramsAdmin />}
          {activeTab === "Webinars" && <WebinarsAdmin />}
          {activeTab === "Glimpses" && <GlimpsesAdmin />}
          {activeTab === "About" && <AboutPageAdmin />}
          {activeTab === "Admins" && user?.email === SUPER_ADMIN && <AdminsAdmin />}
        </div>
      </div>
    </main>
  );
}

/* ─── PODCASTS CRUD ─────────────────────────────────────────── */
function PodcastsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    const q = query(collection(db, "podcasts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  const handleEdit = (item) => { setEditing(item); setShowForm(true); };
  const handleNew = () => { setEditing(null); setShowForm(true); };
  const handleClose = () => { setShowForm(false); setEditing(null); };

  async function handleDelete(id) {
    if (!window.confirm("Delete this podcast?")) return;
    await deleteDoc(doc(db, "podcasts", id));
    toast.success("Podcast deleted");
    fetch();
  }

  async function handleSave(data) {
    if (editing) {
      await updateDoc(doc(db, "podcasts", editing.id), data);
      toast.success("Podcast updated!");
    } else {
      await addDoc(collection(db, "podcasts"), { ...data, createdAt: serverTimestamp() });
      toast.success("Podcast added!");
    }
    handleClose(); fetch();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Podcasts <span className="count-badge">{items.length}</span></h2>
        <button className="btn btn-primary" onClick={handleNew}>+ Add Podcast</button>
      </div>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Guest</th><th>Date</th><th>Episode</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="empty-row">No podcasts yet</td></tr>}
              {items.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.guestName || "—"}</td>
                  <td>{p.date || "—"}</td>
                  <td>{p.episodeNumber ? `EP ${p.episodeNumber}` : "—"}</td>
                  <td className="action-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <PodcastForm initial={editing} onSave={handleSave} onClose={handleClose} />
      )}
    </section>
  );
}

function PodcastForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    guestName: initial?.guestName || "",
    description: initial?.description || "",
    videoUrl: initial?.videoUrl || "",
    thumbnailUrl: initial?.thumbnailUrl || "",
    episodeNumber: initial?.episodeNumber || "",
    date: initial?.date || "",
    duration: initial?.duration || "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) { toast.error("Title and Video URL are required"); return; }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{initial ? "Edit Podcast" : "Add New Podcast"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={set("title")} placeholder="Podcast title" /></div>
          <div className="form-group"><label>Guest Name</label><input value={form.guestName} onChange={set("guestName")} placeholder="e.g. Dr. Jane Doe" /></div>
          <div className="form-group">
            <label>Google Drive Video URL *</label>
            <input value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://drive.google.com/file/d/..." />
            <p className="form-hint">Paste the Google Drive share link of the video</p>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Episode No.</label><input value={form.episodeNumber} onChange={set("episodeNumber")} placeholder="e.g. 1" type="number" /></div>
            <div className="form-group"><label>Date</label><input value={form.date} onChange={set("date")} type="date" /></div>
            <div className="form-group"><label>Duration</label><input value={form.duration} onChange={set("duration")} placeholder="e.g. 45 min" /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={set("description")} placeholder="Brief description..." /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Update" : "Add Podcast"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── WEBINARS CRUD ─────────────────────────────────────────── */
function WebinarsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    const q = query(collection(db, "webinars"), orderBy("date", "asc"));
    const snap = await getDocs(q).catch(() => ({ docs: [] }));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this webinar?")) return;
    await deleteDoc(doc(db, "webinars", id));
    toast.success("Webinar deleted");
    fetch();
  }

  async function handleSave(data) {
    if (editing) {
      await updateDoc(doc(db, "webinars", editing.id), data);
      toast.success("Webinar updated!");
    } else {
      await addDoc(collection(db, "webinars"), { ...data, createdAt: serverTimestamp() });
      toast.success("Webinar added!");
    }
    setShowForm(false); setEditing(null); fetch();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Upcoming Workshops and Webinars <span className="count-badge">{items.length}</span></h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Webinar</button>
      </div>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Speaker</th><th>Date</th><th>Time</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="empty-row">No webinars yet</td></tr>}
              {items.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.title}</strong></td>
                  <td>{w.speaker || "—"}</td>
                  <td>{w.date || "—"}</td>
                  <td>{w.time || "—"}</td>
                  <td className="action-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(w); setShowForm(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(w.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <WebinarForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </section>
  );
}

function WebinarForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    speaker: initial?.speaker || "",
    description: initial?.description || "",
    date: initial?.date || "",
    time: initial?.time || "",
    platform: initial?.platform || "",
    tag: initial?.tag || "",
    posterUrl: initial?.posterUrl || "",
    registrationLink: initial?.registrationLink || "",
    completed: initial?.completed || false,
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{initial ? "Edit Webinar" : "Add New Webinar"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={set("title")} placeholder="Webinar title" /></div>
          <div className="form-group"><label>Speaker / Host</label><input value={form.speaker} onChange={set("speaker")} placeholder="Speaker name" /></div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input value={form.date} onChange={set("date")} type="date" /></div>
            <div className="form-group"><label>Time</label><input value={form.time} onChange={set("time")} placeholder="e.g. 6:00 PM IST" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Platform</label><input value={form.platform} onChange={set("platform")} placeholder="e.g. Zoom, Google Meet" /></div>
            <div className="form-group"><label>Topic Tag</label><input value={form.tag} onChange={set("tag")} placeholder="e.g. Leadership" /></div>
          </div>
          <div className="form-group">
            <label>Poster (Google Drive Image URL)</label>
            <input value={form.posterUrl} onChange={set("posterUrl")} placeholder="https://drive.google.com/file/d/..." />
            <p className="form-hint">Share link of the poster image from Google Drive</p>
          </div>
          <div className="form-group">
            <label>Registration Link</label>
            <input value={form.registrationLink} onChange={set("registrationLink")} placeholder="https://forms.gle/..." />
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={set("description")} placeholder="What will participants learn?" /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Update" : "Add Webinar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── PROGRAMS (Our Programs page) CRUD ─────────────────────── */
function ProgramsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    try {
      const q = query(collection(db, "programs"), orderBy("sortOrder", "asc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      const snap = await getDocs(collection(db, "programs")).catch(() => ({ docs: [] }));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setItems(list);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this program?")) return;
    await deleteDoc(doc(db, "programs", id));
    toast.success("Program deleted");
    fetch();
  }

  async function handleSave(data) {
    if (editing) {
      await updateDoc(doc(db, "programs", editing.id), data);
      toast.success("Program updated!");
    } else {
      await addDoc(collection(db, "programs"), { ...data, createdAt: serverTimestamp() });
      toast.success("Program added!");
    }
    setShowForm(false); setEditing(null); fetch();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Our Programs <span className="count-badge">{items.length}</span></h2>
        <button type="button" className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Program</button>
      </div>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Title</th><th>Topics preview</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={4} className="empty-row">No programs yet</td></tr>}
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.sortOrder ?? "—"}</td>
                  <td><strong>{p.title}</strong></td>
                  <td className="topics-preview-cell">{(p.topicsLine || "").slice(0, 80)}{(p.topicsLine && p.topicsLine.length > 80) ? "…" : ""}</td>
                  <td className="action-cell">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditing(p); setShowForm(true); }}>Edit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <ProgramForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </section>
  );
}

function ProgramForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    topicsLine: initial?.topicsLine || "",
    posterUrl: initial?.posterUrl || "",
    sortOrder: initial?.sortOrder != null ? String(initial.sortOrder) : "0",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const sortOrder = parseInt(form.sortOrder, 10);
    onSave({
      title: form.title.trim(),
      topicsLine: form.topicsLine.trim(),
      posterUrl: form.posterUrl.trim(),
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>✕</button>
        <h2>{initial ? "Edit Program" : "Add Program"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. Career development workshop" />
          </div>
          <div className="form-group">
            <label>Topics (use | or line breaks)</label>
            <textarea value={form.topicsLine} onChange={set("topicsLine")} placeholder={"e.g. Resume | Interview | LinkedIn\nor one topic per line"} rows={4} />
            <p className="form-hint">Example: Introduction to Meta platforms | LinkedIn | Analytics & KPI</p>
          </div>
          <div className="form-group">
            <label>Poster (Google Drive image link)</label>
            <input value={form.posterUrl} onChange={set("posterUrl")} placeholder="https://drive.google.com/file/d/..." />
            <p className="form-hint">Upload the poster to Drive → Share → Anyone with the link → paste the link here</p>
          </div>
          <div className="form-group">
            <label>Display order</label>
            <input value={form.sortOrder} onChange={set("sortOrder")} type="number" placeholder="0" />
            <p className="form-hint">Lower numbers appear first on the Our Programs page</p>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Update" : "Add Program"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── GLIMPSES CRUD ─────────────────────────────────────────── */
function GlimpsesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    const q = query(collection(db, "glimpses"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q).catch(() => ({ docs: [] }));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this glimpse?")) return;
    await deleteDoc(doc(db, "glimpses", id));
    toast.success("Glimpse deleted");
    fetch();
  }

  async function handleSave(data) {
    if (editing) {
      await updateDoc(doc(db, "glimpses", editing.id), data);
      toast.success("Glimpse updated!");
    } else {
      await addDoc(collection(db, "glimpses"), { ...data, createdAt: serverTimestamp() });
      toast.success("Glimpse added!");
    }
    setShowForm(false); setEditing(null); fetch();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Session Glimpses <span className="count-badge">{items.length}</span></h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Glimpse</button>
      </div>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Speaker</th><th>Tag</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="empty-row">No glimpses yet</td></tr>}
              {items.map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.title}</strong></td>
                  <td>{g.speaker || "—"}</td>
                  <td>{g.tag || "—"}</td>
                  <td>{g.date || "—"}</td>
                  <td className="action-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(g); setShowForm(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <GlimpseForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </section>
  );
}

function GlimpseForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    speaker: initial?.speaker || "",
    description: initial?.description || "",
    imageUrl: initial?.imageUrl || "",
    date: initial?.date || "",
    tag: initial?.tag || "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{initial ? "Edit Glimpse" : "Add Session Glimpse"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={set("title")} placeholder="e.g. Leadership Workshop 2025" /></div>
          <div className="form-group"><label>Speaker / Host</label><input value={form.speaker} onChange={set("speaker")} placeholder="Speaker name" /></div>
          <div className="form-group">
            <label>Google Drive Image URL</label>
            <input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://drive.google.com/file/d/..." />
            <p className="form-hint">Upload a photo/screenshot to Google Drive → Share → "Anyone with link" → paste the link here</p>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input value={form.date} onChange={set("date")} type="date" /></div>
            <div className="form-group"><label>Tag</label><input value={form.tag} onChange={set("tag")} placeholder="e.g. Workshop" /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={set("description")} placeholder="Brief description..." /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Update" : "Add Glimpse"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── ABOUT PAGE COPY (siteContent/about) ───────────────────── */
function AboutPageAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(getDefaultAboutState);
  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const setBullet = (index, field, value) => {
    setForm((prev) => {
      const scoreBullets = prev.scoreBullets.map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      );
      return { ...prev, scoreBullets };
    });
  };

  const addBullet = () => {
    setForm((prev) => {
      if (prev.scoreBullets.length >= 12) return prev;
      return { ...prev, scoreBullets: [...prev.scoreBullets, { icon: "•", text: "" }] };
    });
  };

  const removeBullet = (index) => {
    setForm((prev) => {
      if (prev.scoreBullets.length <= 1) {
        toast.warning("Keep at least one bullet row (you can clear the text to reset on save).");
        return prev;
      }
      return { ...prev, scoreBullets: prev.scoreBullets.filter((_, i) => i !== index) };
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "siteContent", "about"));
        if (snap.exists()) {
          const d = snap.data();
          setForm({
            adoreParagraph1: typeof d.adoreParagraph1 === "string" ? d.adoreParagraph1 : ABOUT_PAGE_DEFAULTS.adoreParagraph1,
            adoreParagraph2: typeof d.adoreParagraph2 === "string" ? d.adoreParagraph2 : ABOUT_PAGE_DEFAULTS.adoreParagraph2,
            scoreParagraph1: typeof d.scoreParagraph1 === "string" ? d.scoreParagraph1 : ABOUT_PAGE_DEFAULTS.scoreParagraph1,
            scoreParagraph2: typeof d.scoreParagraph2 === "string" ? d.scoreParagraph2 : ABOUT_PAGE_DEFAULTS.scoreParagraph2,
            scoreBullets: normalizeScoreBullets(d.scoreBullets).map((b) => ({ ...b })),
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not load About copy");
      }
      setLoading(false);
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    const cleaned = form.scoreBullets
      .map((b) => ({
        icon: (String(b.icon || "").trim().slice(0, 12) || "•"),
        text: String(b.text || "").trim(),
      }))
      .filter((b) => b.text);
    const scoreBullets = cleaned.length ? cleaned : DEFAULT_SCORE_BULLETS.map((b) => ({ ...b }));

    setSaving(true);
    try {
      await setDoc(doc(db, "siteContent", "about"), {
        adoreParagraph1: form.adoreParagraph1,
        adoreParagraph2: form.adoreParagraph2,
        scoreParagraph1: form.scoreParagraph1,
        scoreParagraph2: form.scoreParagraph2,
        scoreBullets,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success("About page saved");
      setForm((prev) => ({ ...prev, scoreBullets: scoreBullets.map((b) => ({ ...b })) }));
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="section-header">
        <h2>About page <span className="count-badge">/about</span></h2>
      </div>
      <p className="form-hint" style={{ marginBottom: 20 }}>
        Edits <strong>About ADORE India</strong> and <strong>About SCORE</strong> text on the public About page, including SCORE bullet points (emoji icon + line of text each).
        Leave SCORE paragraph 2 blank to hide that paragraph above the bullets.
      </p>
      {loading ? <p className="loading-text">Loading...</p> : (
        <form className="about-admin-form" onSubmit={handleSave}>
          <h3 className="about-admin-h3">About ADORE India</h3>
          <div className="form-group">
            <label>Paragraph 1</label>
            <textarea value={form.adoreParagraph1} onChange={set("adoreParagraph1")} rows={5} />
          </div>
          <div className="form-group">
            <label>Paragraph 2</label>
            <textarea value={form.adoreParagraph2} onChange={set("adoreParagraph2")} rows={5} />
          </div>
          <h3 className="about-admin-h3">About SCORE</h3>
          <div className="form-group">
            <label>Paragraph 1</label>
            <textarea value={form.scoreParagraph1} onChange={set("scoreParagraph1")} rows={5} />
          </div>
          <div className="form-group">
            <label>Paragraph 2 <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(optional)</span></label>
            <textarea value={form.scoreParagraph2} onChange={set("scoreParagraph2")} rows={4} placeholder="Leave empty to show only one paragraph above the bullet list" />
          </div>

          <h3 className="about-admin-h3">SCORE bullet points</h3>
          <p className="form-hint" style={{ marginBottom: 12 }}>Each row: a short emoji (or symbol) and the line shown next to it on the About page.</p>
          <div className="score-bullets-admin">
            {form.scoreBullets.map((row, index) => (
              <div key={index} className="score-bullet-admin-row">
                <div className="form-group score-bullet-icon-field">
                  <label>Icon</label>
                  <input
                    value={row.icon}
                    onChange={(e) => setBullet(index, "icon", e.target.value)}
                    maxLength={12}
                    placeholder="🎓"
                    aria-label={`Bullet ${index + 1} icon`}
                  />
                </div>
                <div className="form-group score-bullet-text-field">
                  <label>Text</label>
                  <input
                    value={row.text}
                    onChange={(e) => setBullet(index, "text", e.target.value)}
                    placeholder="Bullet point text"
                    aria-label={`Bullet ${index + 1} text`}
                  />
                </div>
                <button type="button" className="btn btn-ghost btn-sm score-bullet-remove" onClick={() => removeBullet(index)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={addBullet} disabled={form.scoreBullets.length >= 12}>
            + Add bullet
          </button>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save About page"}</button>
          </div>
        </form>
      )}
    </section>
  );
}

/* ─── ADMINS MANAGEMENT (Super Admin only) ──────────────────── */
function AdminsAdmin() {
  const { user, SUPER_ADMIN, createAdminAccount } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function addAdmin(e) {
    e.preventDefault();
    if (!form.email) { toast.error("Email is required"); return; }
    if (!form.password || form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    const existing = await getDoc(doc(db, "admins", form.email));
    if (existing.exists()) { toast.warning("This email is already an admin"); return; }

    setSaving(true);
    try {
      // Create Firebase Auth account for the new admin
      await createAdminAccount(form.email, form.password, form.name);

      // Save to Firestore admins collection
      await setDoc(doc(db, "admins", form.email), {
        email: form.email,
        name: form.name || form.email,
        addedBy: user.email,
        addedAt: new Date().toISOString(),
        isSuperAdmin: false,
      });

      toast.success(`✅ Admin account created for ${form.email}`);
      setForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "An account with this email already exists"
        : err.code === "auth/invalid-email"
        ? "Invalid email address"
        : err.message || "Failed to create admin";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function removeAdmin(email) {
    if (email === SUPER_ADMIN) { toast.error("Cannot remove the super admin"); return; }
    if (!window.confirm(`Remove ${email} as admin?`)) return;
    await deleteDoc(doc(db, "admins", email));
    toast.success("Admin removed");
    fetchAdmins();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Manage Admins <span className="count-badge">{admins.length}</span></h2>
      </div>

      <form className="add-admin-form" onSubmit={addAdmin}>
        <h3>Add New Admin</h3>
        <p className="form-hint" style={{ marginBottom: 14 }}>
          Creates a login account with the email and password you set. The admin signs in using email + password — no Google required.
        </p>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={set("name")} placeholder="Admin name" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input value={form.email} onChange={set("email")} placeholder="admin@example.com" type="email" required />
          </div>
        </div>
        <div className="form-group" style={{ maxWidth: 340 }}>
          <label>Password * <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(min. 6 characters)</span></label>
          <div className="password-field">
            <input
              value={form.password}
              onChange={set("password")}
              type={showPass ? "text" : "password"}
              placeholder="Set a password for this admin"
              required
            />
            <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 4 }}>
          {saving ? "Creating..." : "Create Admin Account"}
        </button>
      </form>

      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap" style={{ marginTop: 24 }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Added</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.name || "—"}</td>
                  <td>{a.email}</td>
                  <td>{a.addedAt ? new Date(a.addedAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    {a.isSuperAdmin
                      ? <span className="badge-super">Super Admin</span>
                      : <span className="badge-admin-sm">Admin</span>
                    }
                  </td>
                  <td className="action-cell">
                    {!a.isSuperAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => removeAdmin(a.email)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
