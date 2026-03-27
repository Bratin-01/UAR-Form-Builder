import { useState } from "react";

// ─── CONFIG (move to a config file / API later) ───────────────────────────────
const DEFAULT_ENVS = [
  {
    id: "MDP", label: "MDP",
    operativeRoles: ["Analyst","Batch and Sample Creator","Certification Manager","Head of Lab","Head of QC Inspection Lot Releaser","Incident Approver","Incident Finisher","Incident Manager","Instrument Manager","Lab tech Apprentice","Monitoring Analyst","Plant Operator","QA Assistant Inspection Lot Releaser","QA Inspection Lot Releaser","QC Inspection Lot Releaser","QC Supervisor","Qualified Person","Reagent Manager","Remover","Sample Handling Officer","Sample Reviewer","Sampler","Special Peer-Approver","Stability Inventory Manager","Stability Manager","Stability Officer"],
    mdmRoles: ["Global Master Data Manager*¹","Instrument Master Data Manager","Local Master Data Manager","Master Data Analyst*²","Monitoring Manager","Reagent Master Data Manager","Storage Handler"],
    viewerRoles: ["Extended Viewer","NON-QC"],
    uamRoles: ["User Access Manager"],
    departments: [
      { main:"ALH", children:["ALH-MA","ALH-MB","ALH-MMPP","ALH-QC"] },
      { main:"BRK", children:["BRK-DP","BRK-GRM","BRK-QA"] },
      { main:"GLOBAL", children:[] },
    ],
    footnote: "*¹ GMDM nomination required before access can be granted (as mentioned inside the Operational Manual)\n*² Master Data Analyst Jobtype can only be used in MDP-System",
  },
  {
    id: "P", label: "P",
    operativeRoles: ["Analyst","Batch and Sample Creator","Certification Manager","Head of Lab","Head of QC Inspection Lot Releaser","Incident Approver","Incident Finisher","Incident Manager","Instrument Manager","Lab tech Apprentice","Monitoring Analyst","Plant Operator","QA Assistant Inspection Lot Releaser","QA Inspection Lot Releaser","QC Inspection Lot Releaser","QC Supervisor","Qualified Person","Reagent Manager","Remover","Sample Handling Officer","Sample Reviewer","Sampler","Special Peer-Approver","Stability Inventory Manager","Stability Manager","Stability Officer"],
    mdmRoles: ["Global Master Data Manager*¹","Instrument Master Data Manager","Local Master Data Manager","Monitoring Manager","Reagent Master Data Manager","Storage Handler"],
    viewerRoles: ["Extended Viewer","NON-QC"],
    uamRoles: ["User Access Manager"],
    departments: [
      { main:"ALH", children:["ALH-MA","ALH-MB","ALH-MMPP","ALH-QC"] },
      { main:"BRK", children:["BRK-DP","BRK-GRM","BRK-QA"] },
      { main:"GLOBAL", children:[] },
    ],
    footnote: "*¹ GMDM nomination required before access can be granted (as mentioned inside the Operational Manual)\nNote: Master Data Analyst Jobtype can only be used in MDP-System",
  },
];

const DEFAULT_DOC = {
  docTitle: "Global LIMS - User Access Form",
  docNo: "GLO-AUM-CS-GL-00059.003",
  entity: "010\nGlobal-LIMS (CORE)",
  entityNo: "010 GL",
  contentType: "Authorization Management",
  docHistory: [
    { version:"1", changes:"New version", date:"2024-02-26" },
    { version:"2", changes:"Attachment removed", date:"2025-08-01" },
    { version:"3", changes:"Removed duplicates listed under operational roles\nAdded the roles based on VDO CR 128557\nUpdated the design how roles are presented in this document\nAdded table 2 for Access Requests in P environment", date:"See Cover Page" },
  ],
};

const ROLE_BG = { operative:"#fce8d5", mdm:"#d5e8f5", viewer:"#d5edd5", uam:"#ece5f0" };

const mkEnvState = () => ({
  reason: "N/A (no change needed, move to departments)",
  opRoles: [], mdmRoles: [], vRoles: [], uamRoles: [],
  deptChange: false, deptSel: {},
});

// ─── BAYER LOGO ───────────────────────────────────────────────────────────────
function BayerLogo({ size = 56 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="97" fill="white" />
      <circle cx="100" cy="100" r="97" fill="none" stroke="#7BC144" strokeWidth="18" />
      <circle cx="100" cy="100" r="79" fill="none" stroke="#00BCFF" strokeWidth="10" />
      <circle cx="100" cy="100" r="74" fill="#003087" />
      <rect x="88" y="20" width="24" height="160" fill="white" />
      <rect x="20" y="88" width="160" height="24" fill="white" />
      {["B","A","Y","E","R"].map((l,i) => (
        <text key={`v${i}`} x="100" y={58+i*22} textAnchor="middle" fill="#003087" fontSize="19" fontWeight="bold" fontFamily="Arial, sans-serif">{l}</text>
      ))}
      {[["B",38],["A",59],["Y",100],["E",141],["R",162]].map(([l,x]) => (
        <text key={`h${l}`} x={x} y="106" textAnchor="middle" fill="#003087" fontSize="19" fontWeight="bold" fontFamily="Arial, sans-serif">{l}</text>
      ))}
    </svg>
  );
}

// ─── PRINT HELPERS ────────────────────────────────────────────────────────────
const PrintCheckbox = ({ checked }) => (
  <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:13, height:13, border:"1.5px solid #555", marginRight:5, background:"#fff", flexShrink:0, verticalAlign:"middle" }}>
    {checked && <span style={{ fontSize:11, lineHeight:1, color:"#000", fontWeight:"bold" }}>✓</span>}
  </span>
);

const ptc = (bg) => ({ border:"1px solid #555", padding:"3px 7px", fontSize:12, background:bg||"#fff", verticalAlign:"top" });

function PrintHeader({ doc }) {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:10 }}>
      <tbody>
        <tr>
          <td style={{ border:"1px solid #555", padding:6, width:90, textAlign:"center", background:"#fff" }}>
            <BayerLogo size={56} />
          </td>
          <td style={{ border:"1px solid #555", padding:8, textAlign:"center", fontWeight:"bold", fontSize:13 }}>
            Document Title: {doc.docTitle}
          </td>
          <td style={{ border:"1px solid #555", padding:8, fontSize:12, width:160 }}>
            Doc.No.: {doc.docNo}
          </td>
        </tr>
        <tr>
          <td style={{ border:"1px solid #555", padding:6, fontSize:12, whiteSpace:"pre-line" }}>Entity : {doc.entity}</td>
          <td style={{ border:"1px solid #555", padding:6, fontSize:12 }}>Entity No: {doc.entityNo}</td>
          <td style={{ border:"1px solid #555", padding:6, fontSize:12 }}>Content Type:<br/>{doc.contentType}</td>
        </tr>
      </tbody>
    </table>
  );
}

function PrintEnvTable({ env, tableNum, state }) {
  const { reason, opRoles, mdmRoles, vRoles, uamRoles, deptChange, deptSel } = state;
  const reasonOpts = [
    "N/A (no change needed, move to departments)",
    "Add Job types(s)",
    "Remove Job types (s)",
    'Change (see "Reason of Access Request")',
  ];

  const RoleRow = ({ r, selected, color }) => (
    <tr style={{ background: selected ? color : "#fff" }}>
      <td style={{ width:28, padding:"1px 6px", border:"none", textAlign:"center" }}><PrintCheckbox checked={selected}/></td>
      <td style={{ padding:"2px 6px", fontSize:12, border:"none" }}>{r}</td>
    </tr>
  );

  return (
    <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14, border:"1px solid #555" }}>
      <tbody>
        <tr>
          <td colSpan={2} style={ptc()}>
            <strong style={{ fontSize:13 }}>Table {tableNum}: Requested Role(s) and Department(s) for <u>{env.label}</u> System</strong>
          </td>
        </tr>
        <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Reason of Access Request</strong></td></tr>
        <tr>
          <td colSpan={2} style={ptc()}>
            {reasonOpts.map((o,i) => (
              <span key={i} style={{ marginRight:14, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center" }}>
                <PrintCheckbox checked={reason===o}/>{o}
              </span>
            ))}
          </td>
        </tr>
        <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Job Types (s):</strong></td></tr>
        <tr>
          <td style={{ ...ptc(), width:"48%", padding:0 }}>
            <div style={{ padding:"4px 8px 2px", fontSize:12 }}>
              <strong>Job Type Reference to Role:</strong><br/>
              <strong>1.&nbsp;&nbsp;Operative Roles</strong>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <tbody>{env.operativeRoles.map(r => <RoleRow key={r} r={r} selected={opRoles.includes(r)} color={ROLE_BG.operative}/>)}</tbody>
            </table>
          </td>
          <td style={{ ...ptc(), padding:0 }}>
            <div style={{ padding:"4px 8px 2px", fontSize:12, fontWeight:"bold" }}>2.&nbsp;&nbsp;Master Data Manager Roles</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <tbody>{env.mdmRoles.map(r => <RoleRow key={r} r={r} selected={mdmRoles.includes(r)} color={ROLE_BG.mdm}/>)}</tbody>
            </table>
            <div style={{ padding:"6px 8px 2px", fontSize:12, fontWeight:"bold" }}>3.&nbsp;&nbsp;Viewer Roles</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <tbody>{env.viewerRoles.map(r => <RoleRow key={r} r={r} selected={vRoles.includes(r)} color={ROLE_BG.viewer}/>)}</tbody>
            </table>
            <div style={{ padding:"6px 8px 2px", fontSize:12, fontWeight:"bold" }}>4.&nbsp;&nbsp;User Access Manager Roles</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <tbody>{env.uamRoles.map(r => <RoleRow key={r} r={r} selected={uamRoles.includes(r)} color={ROLE_BG.uam}/>)}</tbody>
            </table>
          </td>
        </tr>
        <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Describe the changes of departments</strong></td></tr>
        <tr>
          <td colSpan={2} style={ptc()}>
            <div style={{ marginBottom:6, display:"flex", alignItems:"flex-start", gap:4 }}>
              <PrintCheckbox checked={deptChange}/>
              <span style={{ fontSize:12 }}>Change for local Departments (multiple entries if needed), consider global Department assignment only for GMDM Role:</span>
            </div>
            {deptChange ? (
              <div style={{ marginLeft:20, fontSize:12 }}>
                {env.departments.map(({ main, children }) => {
                  const mainSel = deptSel[main];
                  const childSels = children.filter(c => deptSel[c]);
                  if (!mainSel && childSels.length === 0) return null;
                  return (
                    <div key={main} style={{ marginBottom:2 }}>
                      {mainSel && <div><PrintCheckbox checked/>{main}</div>}
                      {childSels.map(c => <div key={c} style={{ marginLeft:16 }}><PrintCheckbox checked/>{c}</div>)}
                    </div>
                  );
                })}
              </div>
            ) : <div style={{ minHeight:28, color:"#aaa", fontSize:12 }}>Click here to enter text.</div>}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── FILL FORM: ENV TABLE ─────────────────────────────────────────────────────
function FillEnvTable({ env, tableNum, state, setState }) {
  const { reason, opRoles, mdmRoles, vRoles, uamRoles, deptChange, deptSel } = state;
  const locked = reason === "N/A (no change needed, move to departments)";
  const reasonOpts = [
    "N/A (no change needed, move to departments)",
    "Add Job types(s)",
    "Remove Job types (s)",
    'Change (see "Reason of Access Request")',
  ];

  const toggleRole = (field, item) => {
    if (locked) return;
    setState(p => ({ ...p, [field]: p[field].includes(item) ? p[field].filter(r => r !== item) : [...p[field], item] }));
  };
  const toggleDept = (key) => setState(p => ({ ...p, deptSel: { ...p.deptSel, [key]: !p.deptSel[key] } }));

  const RoleCheck = ({ field, item, color }) => (
    <label
      className={`flex items-center gap-2 px-2 py-0.5 rounded cursor-pointer text-sm select-none ${locked ? "cursor-not-allowed opacity-50" : ""}`}
      style={{ background: state[field].includes(item) ? color : "transparent" }}
    >
      <input type="checkbox" className="w-3.5 h-3.5 accent-blue-700" checked={state[field].includes(item)} onChange={() => toggleRole(field, item)} disabled={locked}/>
      <span>{item}</span>
    </label>
  );

  return (
    <div className="border border-gray-300 rounded mb-5 overflow-hidden">
      <div className="bg-gray-300 px-3 py-2 font-bold text-sm">
        Table {tableNum}: Requested Role(s) and Department(s) for <u>{env.label}</u> System
      </div>
      <div className="p-4">
        {/* Reason */}
        <p className="font-semibold text-sm mb-2">Reason of Access Request (Job Types):</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          {reasonOpts.map(o => (
            <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name={`${env.id}_reason`} checked={reason === o} onChange={() => setState(p => ({ ...p, reason: o }))} />
              {o}
            </label>
          ))}
        </div>

        {/* Role columns */}
        <div className={`grid grid-cols-2 gap-4 mb-4 transition-opacity ${locked ? "opacity-40 pointer-events-none" : ""}`}>
          <div>
            <p className="font-bold text-xs mb-1">1. Operative Roles</p>
            {env.operativeRoles.map(r => <RoleCheck key={r} field="opRoles" item={r} color={ROLE_BG.operative}/>)}
          </div>
          <div>
            <p className="font-bold text-xs mb-1">2. Master Data Manager Roles</p>
            {env.mdmRoles.map(r => <RoleCheck key={r} field="mdmRoles" item={r} color={ROLE_BG.mdm}/>)}
            <p className="font-bold text-xs mt-3 mb-1">3. Viewer Roles</p>
            {env.viewerRoles.map(r => <RoleCheck key={r} field="vRoles" item={r} color={ROLE_BG.viewer}/>)}
            <p className="font-bold text-xs mt-3 mb-1">4. User Access Manager Roles</p>
            {env.uamRoles.map(r => <RoleCheck key={r} field="uamRoles" item={r} color={ROLE_BG.uam}/>)}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-gray-100 border border-gray-200 rounded p-3">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer mb-3">
            <input type="checkbox" checked={deptChange} onChange={e => setState(p => ({ ...p, deptChange: e.target.checked }))}/>
            Change for local Departments
            <span className="font-normal text-gray-500 text-xs">(consider global Department assignment only for GMDM Role)</span>
          </label>
          <div className={`space-y-2 transition-opacity ${deptChange ? "" : "opacity-40 pointer-events-none"}`}>
            {env.departments.map(({ main, children }) => (
              <div key={main} className="bg-white border border-gray-200 rounded p-2">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={!!deptSel[main]} onChange={() => toggleDept(main)}/>
                  {main}
                  {children.length === 0 && <span className="text-gray-400 font-normal text-xs">(no sub-departments)</span>}
                </label>
                {children.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-6">
                    {children.map(c => (
                      <label key={c} className="flex items-center gap-1.5 text-sm cursor-pointer bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
                        <input type="checkbox" checked={!!deptSel[c]} onChange={() => toggleDept(c)}/>
                        {c}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{env.footnote}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UARFormPage() {
  const [view, setView] = useState("form"); // "form" | "preview"
  const [doc] = useState(DEFAULT_DOC);
  const [envs] = useState(DEFAULT_ENVS);

  const [users, setUsers]   = useState([{ lastName:"", firstName:"", cwid:"", function:"" }]);
  const [reason, setReason] = useState("New");
  const [changeDesc, setChangeDesc] = useState("");

  const [envStates, setEnvStates] = useState(
    () => Object.fromEntries(DEFAULT_ENVS.map(e => [e.id, mkEnvState()]))
  );
  const setEnvState = (id, updater) =>
    setEnvStates(p => ({ ...p, [id]: typeof updater === "function" ? updater(p[id]) : updater }));

  const [trainingNA, setTrainingNA]           = useState(false);
  const [trainingNAReason, setTrainingNAReason] = useState("");
  const [trainingConfirmed, setTrainingConfirmed] = useState(false);

  const addUser    = () => setUsers([...users, { lastName:"", firstName:"", cwid:"", function:"" }]);
  const removeUser = (i) => setUsers(users.filter((_, idx) => idx !== i));
  const updateUser = (i, f, v) => { const u = [...users]; u[i][f] = v; setUsers(u); };

  const inpCls = "w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-bayer-blue";

  // ── FILL FORM VIEW ──────────────────────────────────────────────────────────
  if (view === "form") return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-bayer-blue">Global LIMS User Access Request Form</h1>
        <button
          onClick={() => setView("preview")}
          className="bg-bayer-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#004aad] transition-colors"
        >
          Preview & Print →
        </button>
      </div>

      {/* User Details */}
      <section className="border border-gray-300 rounded mb-5 overflow-hidden">
        <div className="bg-gray-300 px-3 py-2 font-bold text-sm">1. Access Permission — User Details</div>
        <div className="p-4">
          <table className="w-full text-sm border-collapse mb-3">
            <thead>
              <tr className="bg-gray-100">
                {["Last Name","First Name","CWID","Function",""].map(h => (
                  <th key={h} className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  {["lastName","firstName","cwid","function"].map(f => (
                    <td key={f} className="border border-gray-200 p-1">
                      <input value={u[f]} onChange={e => updateUser(i, f, e.target.value)} className={inpCls} placeholder={f === "cwid" ? "CWID" : f.charAt(0).toUpperCase()+f.slice(1)}/>
                    </td>
                  ))}
                  <td className="border border-gray-200 p-1 text-center w-10">
                    {users.length > 1 && (
                      <button onClick={() => removeUser(i)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addUser} className="text-sm bg-bayer-blue text-white px-3 py-1 rounded hover:bg-[#004aad] transition-colors">+ Add User</button>
        </div>
      </section>

      {/* Reason */}
      <section className="border border-gray-300 rounded mb-5 overflow-hidden">
        <div className="bg-gray-300 px-3 py-2 font-bold text-sm">Reason of Access Request</div>
        <div className="p-4 space-y-2">
          {["New","Deactivation","Change"].map(r => (
            <label key={r} className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="radio" name="accessReason" checked={reason === r} onChange={() => setReason(r)} className="mt-0.5"/>
              {r === "New" ? "New"
                : r === "Deactivation" ? "Deactivation (disable user account(s), remove all job types and departments)"
                : "Change (describe changes, include 'old' and 'new' value):"}
            </label>
          ))}
          {reason === "Change" && (
            <textarea value={changeDesc} onChange={e => setChangeDesc(e.target.value)}
              placeholder="Describe the change (old and new values)..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bayer-blue h-20 resize-none mt-1"/>
          )}
        </div>
      </section>

      {/* Dynamic Env Tables */}
      {envs.map((env, idx) => (
        <FillEnvTable key={env.id} env={env} tableNum={idx+1}
          state={envStates[env.id] || mkEnvState()}
          setState={(updater) => setEnvState(env.id, updater)}/>
      ))}

      {/* Training */}
      <section className="border border-gray-300 rounded mb-5 overflow-hidden">
        <div className="bg-gray-300 px-3 py-2 font-bold text-sm">2. Training Documentation</div>
        <div className="p-4 space-y-3">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={trainingNA} onChange={e => setTrainingNA(e.target.checked)} className="mt-0.5"/>
            N/A (Reason to be entered):
          </label>
          {trainingNA && (
            <input value={trainingNAReason} onChange={e => setTrainingNAReason(e.target.value)}
              placeholder="Enter reason..." className={inpCls}/>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={trainingConfirmed} onChange={e => setTrainingConfirmed(e.target.checked)}/>
            Training record exist and is confirmed (access to the system is to be granted).
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={() => setView("preview")}
          className="bg-bayer-blue text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#004aad] transition-colors">
          Preview & Print →
        </button>
      </div>
    </div>
  );

  // ── PRINT PREVIEW ───────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"Arial, sans-serif" }}>
      <style>{`@media print { .no-print { display:none!important; } .print-page { page-break-after: always; } }`}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-40 bg-bayer-blue text-white px-5 py-2.5 flex items-center gap-3 shadow-md">
        <button onClick={() => setView("form")}
          className="bg-white/20 text-white border border-white/30 px-4 py-1.5 rounded text-sm hover:bg-white/30 transition-colors">
          ← Edit Form
        </button>
        <span className="font-semibold text-sm">Print Preview — Global LIMS UAR Form</span>
        <button onClick={() => window.print()}
          className="ml-auto bg-white text-bayer-blue font-bold px-5 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors">
          🖨 Print
        </button>
      </div>

      <div style={{ maxWidth:800, margin:"20px auto", padding:"0 20px" }}>

        {/* PAGE 1 — Cover */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader doc={doc}/>
          <h3 style={{ textDecoration:"underline", fontSize:14, margin:"16px 0 10px" }}>Approval Cover Page</h3>
          <p style={{ textAlign:"center", fontSize:14 }}><strong>Document Title :</strong>{doc.docTitle}</p>
          <p style={{ textAlign:"center", fontSize:14 }}><strong>Doc. No. :</strong>{doc.docNo}</p>
          <p style={{ fontWeight:"bold", fontSize:13, margin:"14px 0 6px" }}>Authoring</p>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16 }}>
            <thead><tr>{["#","Author","Job Title","Department","Functional Role","Authored on","Reason For Esign"].map(h => <th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr></thead>
            <tbody><tr><td style={ptc()}>1</td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}>N/A</td><td style={ptc()}></td><td style={ptc()}>Document Author</td></tr></tbody>
          </table>
          <p style={{ fontWeight:"bold", fontSize:13, margin:"0 0 6px" }}>Approval</p>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["#","Approver","Job Title","Department","Functional Role","Approved On","Reason For Esign"].map(h => <th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr></thead>
            <tbody>{[1,2,3].map(n => (
              <tr key={n}><td style={ptc()}>{n}</td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}>Document Review and Approval</td></tr>
            ))}</tbody>
          </table>
          <div style={{ color:"#cc0000", fontWeight:"bold", textAlign:"right", fontSize:14, marginTop:8 }}>RESTRICTED</div>
        </div>

        {/* PAGE 2 — Form + Env Tables */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader doc={doc}/>
          <h2 style={{ textAlign:"center", fontSize:15, margin:"14px 0 10px" }}>Global LIMS User Access Request Form</h2>
          <h3 style={{ fontSize:14, margin:"0 0 8px" }}>1. Access Permission</h3>

          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:10 }}>
            <thead>
              <tr><td colSpan={4} style={ptc("#c8c8c8")}><strong>User (multiple entries possible if needed)</strong></td></tr>
              <tr>{["Last Name","First Name","CWID","Function"].map(h => <th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr>
            </thead>
            <tbody>{users.map((u,i) => (
              <tr key={i}>
                <td style={ptc()}>{u.lastName||"—"}</td>
                <td style={ptc()}>{u.firstName||"—"}</td>
                <td style={ptc()}>{u.cwid||"—"}</td>
                <td style={ptc()}>{u.function||"—"}</td>
              </tr>
            ))}</tbody>
          </table>

          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
            <tbody>
              <tr><td style={ptc("#c8c8c8")}><strong>Reason of Access Request</strong></td></tr>
              <tr><td style={ptc()}>
                <div><PrintCheckbox checked={reason==="New"}/> New</div>
                <div><PrintCheckbox checked={reason==="Deactivation"}/> Deactivation (disable user account(s), remove all job types and departments)</div>
                <div><PrintCheckbox checked={reason==="Change"}/> Change (describe changes, include 'old' and 'new' value):</div>
                <div style={{ marginLeft:18, minHeight:24, fontSize:12 }}>{changeDesc||<span style={{color:"#aaa"}}>Click here to enter text.</span>}</div>
              </td></tr>
            </tbody>
          </table>

          {envs.map((env, idx) => (
            <PrintEnvTable key={env.id} env={env} tableNum={idx+1} state={envStates[env.id] || mkEnvState()}/>
          ))}
          <div style={{ color:"#cc0000", fontWeight:"bold", textAlign:"right", fontSize:14, marginTop:8 }}>RESTRICTED</div>
        </div>

        {/* PAGE 3 — Training + Approval */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader doc={doc}/>
          <h3 style={{ fontSize:14, margin:"14px 0 8px" }}>2. Training documentation</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14 }}>
            <tbody><tr><td style={ptc()}>
              <div style={{ marginBottom:6 }}>
                <PrintCheckbox checked={trainingNA}/> N/A (Reason to be entered):{" "}
                {trainingNA && trainingNAReason ? trainingNAReason : <span style={{color:"#aaa",fontSize:12}}>Click here to enter text.</span>}
              </div>
              <div><PrintCheckbox checked={trainingConfirmed}/> Training record exist and is confirmed (access to the system is to be granted).</div>
              <div style={{ borderTop:"1px solid #999", marginTop:36, paddingTop:4, fontSize:11, color:"#555" }}>
                Date, Signature(s) R-Manager, CWID<br/>
                Or in case of support groups, Date, Signature IT Service Provider, CWID<br/>
                Or in case of IT service provider (to enable them to work on master data), Date, Signature, LPM, CWID
              </div>
            </td></tr></tbody>
          </table>
          <h3 style={{ fontSize:14, margin:"0 0 8px" }}>3. Approval</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14 }}>
            <tbody><tr><td style={ptc()}>
              <p style={{ fontSize:12, margin:"0 0 36px" }}>For Local users: by Local Process Manager confirmation of local Department assignment and Segregation of duties. In case of GMDM role assignment, Nomination as part of OM must be completed and confirmed.</p>
              <div style={{ borderTop:"1px solid #999", paddingTop:4, fontSize:11, color:"#555" }}>Date, Signature(s), CWID</div>
            </td></tr></tbody>
          </table>
          <h3 style={{ fontSize:14, margin:"0 0 8px" }}>4. Authorization Implementation</h3>
          <p style={{ fontSize:12, marginLeft:16 }}>Once Approvals are provided – Access can be granted through an User Access Manager in LIMS (Training record and approved User Access Form sheet must be attached into corresponding User Account in LIMS)</p>
          <div style={{ color:"#cc0000", fontWeight:"bold", textAlign:"right", fontSize:14, marginTop:8 }}>RESTRICTED</div>
        </div>

        {/* PAGE 4 — Doc History */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader doc={doc}/>
          <h3 style={{ fontSize:14, margin:"16px 0 10px" }}>5. Document History</h3>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["Version No.","Changes (incl. reason for changes)","Effective date"].map(h => <th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr></thead>
            <tbody>{doc.docHistory.map((row,i) => (
              <tr key={i}>
                <td style={{ ...ptc(), width:80 }}>{row.version}</td>
                <td style={ptc()}>{row.changes.split("\n").map((l,j) => <div key={j}>{l ? `• ${l}` : ""}</div>)}</td>
                <td style={{ ...ptc(), width:120 }}>{row.date}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ color:"#cc0000", fontWeight:"bold", textAlign:"right", fontSize:14, marginTop:8 }}>RESTRICTED</div>
        </div>

      </div>
    </div>
  );
}