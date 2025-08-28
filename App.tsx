import React, { useEffect, useMemo, useState } from "react";

type StatusKey =
  | "Intake"
  | "Scheduled"
  | "Recording"
  | "Ingested"
  | "In Editing"
  | "Review"
  | "Delivered"
  | "Archived";

type RMSRecordType = "opportunities" | "projects" | "orders";

interface Project {
  id: string;
  projectId?: string;
  clientName?: string;
  eventName?: string;
  venue?: string;
  eventDate?: string;
  deliverablesDate?: string;
  priority?: "Low" | "Medium" | "High";
  projectLead?: string;
  cameraOp?: string;
  editor?: string;
  recordingRequired?: boolean;
  recordingType?: string;
  capturePlan?: string[];
  status: StatusKey;
  assignedTech?: string;
  fileLink?: string;
  notes?: string;
  rmsRecordType?: RMSRecordType;
  rmsIdOrSlug?: string;
  scope?: string;
  useOfFinalVideo?: string[];
  deliverableForm?: string[];
  integratedContent?: string[];
  editServices?: string[];
  layoutFormat?: string[];
  gear?: string[];
  metrics?: Record<string, string>;
  createdAt: number;
}

const STATUS_OPTIONS: StatusKey[] = [
  "Intake","Scheduled","Recording","Ingested","In Editing","Review","Delivered","Archived"
];

const STATUS_COLORS: Record<StatusKey, string> = {
  Intake: "bg-slate-200 text-slate-800",
  Scheduled: "bg-amber-100 text-amber-900",
  Recording: "bg-emerald-200 text-emerald-900",
  Ingested: "bg-indigo-100 text-indigo-900",
  "In Editing": "bg-sky-200 text-sky-900",
  Review: "bg-orange-100 text-orange-900",
  Delivered: "bg-green-200 text-green-900",
  Archived: "bg-zinc-200 text-zinc-900",
};

const PRIORITY_OPTIONS = ["Low","Medium","High"] as const;

const USE_OF_FINAL_VIDEO = [
  "No re-broadcast – archive only",
  "Segmented for social media",
  "Departmental training / multi-link",
  "Embedded on website/platform",
  "Ticketed streaming",
  "Launch date required",
];

const DELIVERABLE_FORM = [
  "ShareFile folder (downloadable)",
  "RAW via card/drive (purchase)",
  "Segmented clips",
  "Full show",
  "Raw footage upload",
  "Audio-only export",
  "Platform upload",
];

const CAPTURE_SHOT_PLAN = [
  "Content recorder (BMVA/PIX)",
  "Podium close-up",
  "Stage wide",
  "Room wide",
  "Multi-cam (2+)",
  "Roving cam",
  "Zoom call in/out",
];

const INTEGRATED_CONTENT = [
  "Presenter PPT","Pre-produced video","Live screen share demo",
  "Sponsor deck","Logo","Title slide","YouTube link (go/slides)"
];

const EDIT_SERVICES = [
  "Single session basic","Raw feed upload","Basic + graphics",
  "Raw series upload","Event series pro","Custom"
];

const LAYOUT_FORMAT = [
  "Auto ATEM (16:9x16:9)","Premium PIP","Closed captions (CC)",
  "Post composite: slides+crop+cam+gfx","Single screen over GFX",
  "Live display program mix","Content-only capture","Fullscreen + PIP","Fullscreen"
];

const GEAR_ITEMS = [
  "PTZs","Panasonic","JVC","Marshalls","Hand held mics","Lavs to board","Lav headset","Portable lav kit","Boom","Choir mic","Boundary mic","OWL","Lekos","Studio light","Panel light","BMVideo Assist","LUMIX","HAN REC","Canon VIXIA","Canon XA","Roland","ATEM"
];

const METRICS_KEYS = [
  "# Rooms/Sets","# of Videos","# Angles","FPS","Codec","Shutter Speed","Est. Capture Hrs","HD File Size Limit"
];

const uid = () => Math.random().toString(36).slice(2);
const LOCAL_KEY = "headlight_av_projects";

function computeRmsUrl(type?: RMSRecordType, id?: string) {
  if (!type || !id) return "";
  return `https://headlight.current-rms.com/${type}/${id}`;
}

const Badge = ({ children, className="" }: {children: React.ReactNode, className?: string}) => (
  <span className={`badge ${className}`}>{children}</span>
);

function StatusBadge({ value }: { value: StatusKey }) {
  return <Badge className={STATUS_COLORS[value]}>{value}</Badge>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="separator" />
      <div className="card-content">{children}</div>
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setProjects(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(projects));
  }, [projects]);

  const [form, setForm] = useState<Project>({
    id: uid(),
    status: "Intake",
    recordingRequired: true,
    capturePlan: [],
    useOfFinalVideo: [],
    deliverableForm: [],
    integratedContent: [],
    editServices: [],
    layoutFormat: [],
    gear: [],
    metrics: {},
    createdAt: Date.now(),
  });

  const rmsUrl = useMemo(() => computeRmsUrl(form.rmsRecordType, form.rmsIdOrSlug), [form.rmsRecordType, form.rmsIdOrSlug]);

  const [filters, setFilters] = useState<{ q: string; status?: StatusKey | "All"; recording?: "All" | "Yes" | "No" }>({
    q: "", status: "All", recording: "All"
  });

  const filtered = projects.filter((p) => {
    const q = filters.q.toLowerCase();
    const matchesQ = !q || [p.clientName, p.eventName, p.venue, p.projectId].some((v) => (v || "").toLowerCase().includes(q));
    const matchesStatus = filters.status === "All" || p.status === filters.status;
    const matchesRec = filters.recording === "All" || (filters.recording === "Yes" ? p.recordingRequired : !p.recordingRequired);
    return matchesQ && matchesStatus && matchesRec;
  });

  function toggleMulti(field: keyof Project, value: string) {
    setForm((prev) => {
      const arr = new Set([...(prev[field] as string[] | undefined) ?? []]);
      if (arr.has(value)) arr.delete(value); else arr.add(value);
      return { ...prev, [field]: Array.from(arr) } as Project;
    });
  }

  function submitForm() {
    setProjects((prev) => [{ ...form }, ...prev]);
    setForm({
      id: uid(),
      status: "Intake",
      recordingRequired: true,
      capturePlan: [], useOfFinalVideo: [], deliverableForm: [], integratedContent: [], editServices: [], layoutFormat: [], gear: [], metrics: {},
      createdAt: Date.now(),
    });
  }

  function removeProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function nextStatus(s: StatusKey): StatusKey {
    const idx = STATUS_OPTIONS.indexOf(s);
    return STATUS_OPTIONS[Math.min(idx + 1, STATUS_OPTIONS.length - 1)];
  }
  function advance(id: string) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: nextStatus(p.status) } : p)));
  }

  function exportCSV() {
    const headers = [
      "Project ID","Client","Event","Venue","Event Date","Deliverables Date","Priority","Project Lead","Camera Op","Editor","Recording Required","Recording Type","Status","Assigned Tech","File Link","Notes","RMS Type","RMS ID","RMS URL"
    ];
    const rows = projects.map((p) => [
      p.projectId ?? "",
      p.clientName ?? "",
      p.eventName ?? "",
      p.venue ?? "",
      p.eventDate ?? "",
      p.deliverablesDate ?? "",
      p.priority ?? "",
      p.projectLead ?? "",
      p.cameraOp ?? "",
      p.editor ?? "",
      p.recordingRequired ? "Yes" : "No",
      p.recordingType ?? "",
      p.status,
      p.assignedTech ?? "",
      p.fileLink ?? "",
      (p.notes ?? "").replace(/\\n/g, " "),
      p.rmsRecordType ?? "",
      p.rmsIdOrSlug ?? "",
      computeRmsUrl(p.rmsRecordType, p.rmsIdOrSlug),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "headlight_av_projects.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // Simple modal for viewing project details
  const [openId, setOpenId] = useState<string|undefined>(undefined);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Headlight AV — Project Intake & Tracker</h1>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={exportCSV}>Export CSV</button>
            <a href="https://headlight.current-rms.com" target="_blank" rel="noreferrer" className="btn btn-primary">Open RMS</a>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Intake */}
          <div className="space-y-6">
            <Section title="Project & Contacts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Project ID</label>
                  <input className="input" placeholder="P-001" value={form.projectId ?? ""} onChange={(e)=>setForm({...form, projectId: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Client</label>
                  <input className="input" value={form.clientName ?? ""} onChange={(e)=>setForm({...form, clientName: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Project / Event</label>
                  <input className="input" value={form.eventName ?? ""} onChange={(e)=>setForm({...form, eventName: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Venue</label>
                  <input className="input" value={form.venue ?? ""} onChange={(e)=>setForm({...form, venue: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Event Date</label>
                  <input className="input" type="date" value={form.eventDate ?? ""} onChange={(e)=>setForm({...form, eventDate: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Deliverables Date</label>
                  <input className="input" type="date" value={form.deliverablesDate ?? ""} onChange={(e)=>setForm({...form, deliverablesDate: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm mb-1">Priority</label>
                  <select className="select" value={form.priority ?? ""} onChange={(e)=>setForm({...form, priority: e.target.value as any})}>
                    <option value="" disabled>Select</option>
                    {PRIORITY_OPTIONS.map(p=>(<option key={p} value={p}>{p}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm mb-1">Project Lead</label>
                    <input className="input" value={form.projectLead ?? ""} onChange={(e)=>setForm({...form, projectLead: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Camera Op</label>
                    <input className="input" value={form.cameraOp ?? ""} onChange={(e)=>setForm({...form, cameraOp: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Editor</label>
                    <input className="input" value={form.editor ?? ""} onChange={(e)=>setForm({...form, editor: e.target.value})}/>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="RMS Tracking">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm mb-1">Record Type</label>
                  <select className="select" value={form.rmsRecordType ?? ""} onChange={(e)=>setForm({...form, rmsRecordType: e.target.value as RMSRecordType})}>
                    <option value="" disabled>Select type</option>
                    <option value="opportunities">opportunities</option>
                    <option value="projects">projects</option>
                    <option value="orders">orders</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">RMS ID / Slug</label>
                  <input className="input" value={form.rmsIdOrSlug ?? ""} onChange={(e)=>setForm({...form, rmsIdOrSlug: e.target.value})}/>
                </div>
                <div className="flex gap-2">
                  <input className="input" readOnly value={rmsUrl} placeholder="RMS link will appear here"/>
                  <a href={rmsUrl || undefined} target="_blank" rel="noreferrer" className={`btn ${!rmsUrl ? "pointer-events-none opacity-50" : ""}`}>Open</a>
                </div>
              </div>
            </Section>

            <Section title="Scope / Description of Final Product">
              <textarea className="textarea" rows={5} value={form.scope ?? ""} onChange={(e)=>setForm({...form, scope: e.target.value})} placeholder="Notes, narrative, requirements…"/>
            </Section>

            {/* Checklists */}
            <Section title="Use of Final Video">
              <div className="grid md:grid-cols-2 gap-3">
                {USE_OF_FINAL_VIDEO.map((opt)=>(
                  <label key={opt} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.useOfFinalVideo?.includes(opt)} onChange={()=>toggleMulti("useOfFinalVideo", opt)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </Section>
            <Section title="Deliverable Form">
              <div className="grid md:grid-cols-2 gap-3">
                {DELIVERABLE_FORM.map((opt)=>(
                  <label key={opt} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.deliverableForm?.includes(opt)} onChange={()=>toggleMulti("deliverableForm", opt)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </Section>
            <Section title="Capture / Shot Plan">
              <div className="grid md:grid-cols-2 gap-3">
                {CAPTURE_SHOT_PLAN.map((opt)=>(
                  <label key={opt} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.capturePlan?.includes(opt)} onChange={()=>toggleMulti("capturePlan", opt)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Integrated Content">
              <div className="grid md:grid-cols-2 gap-3">
                {INTEGRATED_CONTENT.map((opt)=>(
                  <label key={opt} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.integratedContent?.includes(opt)} onChange={()=>toggleMulti("integratedContent", opt)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Metrics & Recording">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {METRICS_KEYS.map((key)=>(
                  <div key={key}>
                    <div className="text-xs mb-1">{key}</div>
                    <input className="input" value={form.metrics?.[key] ?? ""} onChange={(e)=>setForm({...form, metrics: {...(form.metrics||{}), [key]: e.target.value}})} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!form.recordingRequired} onChange={(e)=>setForm({...form, recordingRequired: e.target.checked})} />
                  <span>Recording Required</span>
                </label>
                <div>
                  <div className="text-sm mb-1">Recording Type</div>
                  <input className="input" value={form.recordingType ?? ""} onChange={(e)=>setForm({...form, recordingType: e.target.value})} placeholder="Audio / Video / Multi-cam / Livestream"/>
                </div>
                <div>
                  <div className="text-sm mb-1">Assigned Tech</div>
                  <input className="input" value={form.assignedTech ?? ""} onChange={(e)=>setForm({...form, assignedTech: e.target.value})}/>
                </div>
              </div>
            </Section>

            <Section title="Edit Services & Layout Format">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4">
                  <p className="font-medium mb-2">Edit Services</p>
                  <div className="grid gap-2">
                    {EDIT_SERVICES.map((opt)=>(
                      <label key={opt} className="flex items-center gap-2">
                        <input type="checkbox" checked={form.editServices?.includes(opt)} onChange={()=>toggleMulti("editServices", opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="font-medium mb-2">Layout Format</p>
                  <div className="grid gap-2">
                    {LAYOUT_FORMAT.map((opt)=>(
                      <label key={opt} className="flex items-center gap-2">
                        <input type="checkbox" checked={form.layoutFormat?.includes(opt)} onChange={()=>toggleMulti("layoutFormat", opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Gear, Files & Notes">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4 h-full">
                  <p className="font-medium mb-2">Gear</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GEAR_ITEMS.map((g)=>(
                      <label key={g} className="flex items-center gap-2">
                        <input type="checkbox" checked={form.gear?.includes(g)} onChange={()=>toggleMulti("gear", g)} />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm mb-1">File / Drive Link</div>
                    <input className="input" value={form.fileLink ?? ""} onChange={(e)=>setForm({...form, fileLink: e.target.value})} placeholder="ShareFile / Drive / Dropbox URL"/>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Notes</div>
                    <textarea className="textarea" rows={6} value={form.notes ?? ""} onChange={(e)=>setForm({...form, notes: e.target.value})}/>
                  </div>
                </div>
              </div>
            </Section>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm mb-1">Status</div>
                  <select className="select w-[200px]" value={form.status} onChange={(e)=>setForm({...form, status: e.target.value as StatusKey})}>
                    {STATUS_OPTIONS.map((s)=>(<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={submitForm}>Add Project</button>
              </div>
            </div>
          </div>

          {/* Tracker */}
          <div className="space-y-4">
            <div className="card">
              <div className="card-header"><div className="card-title">Project Tracker</div></div>
              <div className="card-content space-y-3">
                <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                  <div className="flex gap-2 w-full">
                    <input className="input w-full md:w-72" placeholder="Search client, event, venue…" value={filters.q} onChange={(e)=>setFilters({...filters, q: e.target.value})}/>
                    <select className="select w-[140px]" value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value as any})}>
                      <option value="All">All Statuses</option>
                      {STATUS_OPTIONS.map((s)=>(<option key={s} value={s}>{s}</option>))}
                    </select>
                    <select className="select w-[160px]" value={filters.recording} onChange={(e)=>setFilters({...filters, recording: e.target.value as any})}>
                      <option value="All">Recording: All</option>
                      <option value="Yes">Needs Recording</option>
                      <option value="No">No Recording</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Event</th>
                        <th className="px-3 py-2">Client</th>
                        <th className="px-3 py-2">Event Date</th>
                        <th className="px-3 py-2">Recording?</th>
                        <th className="px-3 py-2">RMS</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p)=>{
                        const url = computeRmsUrl(p.rmsRecordType, p.rmsIdOrSlug);
                        const overdue = p.deliverablesDate && p.status !== "Delivered" && new Date(p.deliverablesDate) < new Date();
                        const upcoming = p.eventDate && p.recordingRequired && new Date(p.eventDate) >= new Date() && new Date(p.eventDate) <= new Date(Date.now()+7*864e5);
                        return (
                          <tr key={p.id} className="border-t">
                            <td className="px-3 py-2"><StatusBadge value={p.status} /></td>
                            <td className="px-3 py-2">
                              <div className="font-medium">{p.eventName || "—"}</div>
                              <div className="text-xs text-slate-500">{p.venue || ""}</div>
                            </td>
                            <td className="px-3 py-2">{p.clientName || "—"}</td>
                            <td className="px-3 py-2">
                              {p.eventDate || "—"}
                              {upcoming && <span className="badge ml-2 bg-amber-100 text-amber-900">Upcoming ≤7d</span>}
                            </td>
                            <td className="px-3 py-2">{p.recordingRequired ? "Yes" : "No"}</td>
                            <td className="px-3 py-2">
                              {url ? <a className="text-blue-600 hover:underline" href={url} target="_blank" rel="noreferrer">{p.rmsRecordType}/{p.rmsIdOrSlug}</a> : "—"}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button className="btn" onClick={()=>advance(p.id)}>Advance</button>
                                <button className="btn" onClick={()=>setOpenId(p.id)}>View</button>
                                <button className="btn text-red-600 border-red-300" onClick={()=>removeProject(p.id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && (
                        <tr><td className="px-3 py-8 text-center text-slate-500" colSpan={7}>No projects yet. Add one on the left.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card p-4 md:flex md:items-center md:justify-between">
              <div className="text-sm text-slate-600">Status legend</div>
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                {STATUS_OPTIONS.map((s)=>(<StatusBadge key={s} value={s}/>))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple modal */}
      {openId && (()=>{
        const p = projects.find(x=>x.id===openId);
        if (!p) return null;
        const url = computeRmsUrl(p.rmsRecordType, p.rmsIdOrSlug);
        const overdue = p.deliverablesDate && p.status !== "Delivered" && new Date(p.deliverablesDate) < new Date();
        return (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={()=>setOpenId(undefined)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6" onClick={(e)=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">{p.eventName || "Project"}</div>
                <button className="btn" onClick={()=>setOpenId(undefined)}>Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><div className="text-sm text-slate-500">Client</div><div>{p.clientName || "—"}</div></div>
                <div><div className="text-sm text-slate-500">Venue</div><div>{p.venue || "—"}</div></div>
                <div><div className="text-sm text-slate-500">Event Date</div><div>{p.eventDate || "—"}</div></div>
                <div><div className="text-sm text-slate-500">Deliverables</div><div className={overdue? "text-red-600": undefined}>{p.deliverablesDate || "—"}</div></div>
                <div className="md:col-span-2"><div className="text-sm text-slate-500">Scope</div><div className="whitespace-pre-wrap">{p.scope || "—"}</div></div>
                <div><div className="text-sm text-slate-500">Recording</div><div>{p.recordingRequired? "Required":"No"}{p.recordingType?` — ${p.recordingType}`:""}</div></div>
                <div><div className="text-sm text-slate-500">Assigned Tech</div><div>{p.assignedTech || "—"}</div></div>
                <div className="md:col-span-2"><div className="text-sm text-slate-500">Links</div>
                  <div className="flex flex-wrap gap-3">
                    {p.fileLink && <a className="text-blue-600 hover:underline" href={p.fileLink} target="_blank" rel="noreferrer">File Location</a>}
                    {url && <a className="text-blue-600 hover:underline" href={url} target="_blank" rel="noreferrer">RMS</a>}
                  </div>
                </div>
                <div className="md:col-span-2"><div className="text-sm text-slate-500">Gear</div><div className="text-sm">{(p.gear||[]).join(", ") || "—"}</div></div>
                <div className="md:col-span-2"><div className="text-sm text-slate-500">Notes</div><div className="whitespace-pre-wrap">{p.notes || "—"}</div></div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}