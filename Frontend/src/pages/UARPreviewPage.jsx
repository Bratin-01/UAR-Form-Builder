import { useLocation, useNavigate } from "react-router-dom";
import cognizantLogo from "../assets/cognizant.png";
import { DEFAULT_ENVS, DEFAULT_DOC } from "../assets/formConfig.json";

const ROLE_BG = { operative:"#fce8d5", mdm:"#d5e8f5", viewer:"#d5edd5", uam:"#ece5f0" };

const mkEnvState = () => ({
  reason:"N/A (no change needed, move to departments)",
  opRoles:[], mdmRoles:[], vRoles:[], uamRoles:[],
  deptChange:false, deptSel:{},
});

// ─── COMPANY LOGO ─────────────────────────────────────────────────────────────
function CompanyLogo({ size = 56 }) {
  return <img src={cognizantLogo} alt="Cognizant" width={size} height={size} style={{ objectFit:"contain" }} />;
}

// ─── PRINT CHECKBOX ───────────────────────────────────────────────────────────
const PrintCheckbox = ({ checked }) => (
  <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:13, height:13, border:"1.5px solid #555", background:"#fff", flexShrink:0, verticalAlign:"middle" }}>
    {checked && <span style={{ fontSize:11, lineHeight:1, color:"#000", fontWeight:"bold" }}>✓</span>}
  </span>
);

// ─── SHARED CELL STYLE ────────────────────────────────────────────────────────
const ptc = (bg) => ({ border:"1px solid #555", padding:"3px 7px", fontSize:12, background:bg||"#fff", verticalAlign:"top" });

// ─── DOC HEADER ROWS (reused in thead for repeat + standalone pages) ──────────
function DocHeaderRows() {
  return (
    <>
      <tr>
        <td style={{ border:"1px solid #555", padding:6, width:90, textAlign:"center", background:"#fff" }}>
          <CompanyLogo size={56} />
        </td>
        <td style={{ border:"1px solid #555", padding:8, textAlign:"center", fontWeight:"bold", fontSize:13 }}>
          Document Title: {DEFAULT_DOC.docTitle}
        </td>
        <td style={{ border:"1px solid #555", padding:8, fontSize:12, width:160 }}>
          Doc.No.: {DEFAULT_DOC.docNo}
        </td>
      </tr>
      <tr>
        <td style={{ border:"1px solid #555", padding:6, fontSize:12, whiteSpace:"pre-line" }}>Entity : {DEFAULT_DOC.entity}</td>
        <td style={{ border:"1px solid #555", padding:6, fontSize:12 }}>Entity No: {DEFAULT_DOC.entityNo}</td>
        <td style={{ border:"1px solid #555", padding:6, fontSize:12 }}>Content Type:<br />{DEFAULT_DOC.contentType}</td>
      </tr>
    </>
  );
}

// ─── STANDALONE HEADER (for pages that don't use the thead trick) ─────────────
function PrintHeader() {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:10 }}>
      <tbody><DocHeaderRows /></tbody>
    </table>
  );
}

// ─── ROLE ROW — always coloured, checkbox shows ✓ only when selected ──────────
const RoleRow = ({ r, selected, color }) => (
  <tr style={{ background: color }}>
    <td style={{ width:28, padding:"2px 5px", borderBottom:"1px solid rgba(0,0,0,0.08)", borderRight:"1px solid rgba(0,0,0,0.12)", textAlign:"center" }}>
      <PrintCheckbox checked={selected} />
    </td>
    <td style={{ padding:"2px 8px", fontSize:12, borderBottom:"1px solid rgba(0,0,0,0.08)" }}>{r}</td>
  </tr>
);

// ─── ENV TABLE — thead repeats doc header on every page break ─────────────────
function PrintEnvTable({ env, tableNum, state }) {
  const { reason, opRoles, mdmRoles, vRoles, uamRoles, deptChange, deptSel } = state;
  const reasonOpts = [
    "N/A (no change needed, move to departments)",
    "Add Job types(s)",
    "Remove Job types (s)",
    'Change (see "Reason of Access Request")',
  ];

  const RoleGroup = ({ title, roles, selected, color }) => (
    <>
      <div style={{ fontWeight:"bold", fontSize:12, padding:"6px 0 3px" }}>{title}</div>
      <table style={{ width:"55%", borderCollapse:"collapse", border:"1px solid rgba(0,0,0,0.15)" }}>
        <tbody>
          {roles.map(r => <RoleRow key={r} r={r} selected={selected.includes(r)} color={color} />)}
        </tbody>
      </table>
    </>
  );

  return (
    // Outer table: thead repeats on each new print page this table flows onto
    <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14 }}>
      <thead style={{ display:"table-header-group" }}>
        <DocHeaderRows />
        {/* Spacer row so content doesn't immediately follow the header */}
        <tr><td colSpan={3} style={{ padding:"6px 0 0", border:"none" }}></td></tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={3} style={{ padding:0 }}>
            {/* Inner env content table */}
            <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #555" }}>
              <tbody>
                {/* Title */}
                <tr>
                  <td colSpan={2} style={ptc()}>
                    <strong style={{ fontSize:13 }}>
                      Table {tableNum}: Requested Role(s) and Department(s) for <u>{env.label}</u> System
                    </strong>
                  </td>
                </tr>

                {/* Reason of Access */}
                <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Reason of Access Request</strong></td></tr>
                <tr>
                  <td colSpan={2} style={ptc()}>
                    {reasonOpts.map((o,i) => (
                      <span key={i} style={{ marginRight:14, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:4 }}>
                        <PrintCheckbox checked={reason===o} />{o}
                      </span>
                    ))}
                  </td>
                </tr>

                {/* Job Types */}
                <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Job Types (s):</strong></td></tr>
                <tr>
                  <td colSpan={2} style={{ ...ptc(), padding:"6px 10px" }}>
                    <div style={{ fontSize:12, fontWeight:"bold", marginBottom:4 }}>Job Type Reference to Role:</div>
                    <RoleGroup title="1.&nbsp;&nbsp;Operative Roles"           roles={env.operativeRoles} selected={opRoles}  color={ROLE_BG.operative} />
                    <RoleGroup title="2.&nbsp;&nbsp;Master Data Manager Roles" roles={env.mdmRoles}       selected={mdmRoles} color={ROLE_BG.mdm} />
                    <RoleGroup title="3.&nbsp;&nbsp;Viewer Roles"              roles={env.viewerRoles}    selected={vRoles}   color={ROLE_BG.viewer} />
                    <RoleGroup title="4.&nbsp;&nbsp;User Access Manager Roles" roles={env.uamRoles}       selected={uamRoles} color={ROLE_BG.uam} />
                  </td>
                </tr>

                {/* Departments */}
                <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Describe the changes of departments</strong></td></tr>
                <tr>
                  <td colSpan={2} style={ptc()}>
                    <div style={{ marginBottom:6, display:"flex", alignItems:"flex-start", gap:4 }}>
                      <PrintCheckbox checked={deptChange} />
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
                              {mainSel && <div><PrintCheckbox checked />&nbsp;{main}</div>}
                              {childSels.map(c => <div key={c} style={{ marginLeft:16 }}><PrintCheckbox checked />&nbsp;{c}</div>)}
                            </div>
                          );
                        })}
                      </div>
                    ) : <div style={{ minHeight:28, color:"#aaa", fontSize:12 }}>Click here to enter text.</div>}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── MAIN PREVIEW PAGE ────────────────────────────────────────────────────────
export default function UARPreviewPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-gray-500 text-sm">No form data found. Please fill the form first.</p>
        <button onClick={() => navigate("/uar-form")}
          className="bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#004aad] transition-colors">
          ← Go to Form
        </button>
      </div>
    );
  }

  const { users, reason, changeDesc, envStates, trainingNA, trainingNAReason, trainingConfirmed } = state;

  return (
    <div style={{ fontFamily:"Arial, sans-serif" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: avoid; }
          thead { display: table-header-group; }
          tbody { display: table-row-group; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-40 bg-blue-400 text-white px-5 py-2.5 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate("/uar-form", { state })}
          className="bg-white/20 text-white border border-white/30 px-4 py-1.5 rounded text-sm hover:bg-white/30 transition-colors cursor-pointer">
          ← Edit Form
        </button>
        <span className="font-semibold text-sm">Print Preview — Global LIMS UAR Form</span>
        <button onClick={() => window.print()}
          className="ml-auto bg-white text-blue-600 font-bold px-5 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors">
          🖨 Print
        </button>
      </div>

      <div style={{ maxWidth:800, margin:"20px auto", padding:"0 20px" }}>

        {/* PAGE 1 — Cover */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader />
          <h3 style={{ textDecoration:"underline", fontSize:14, margin:"16px 0 10px" }}>Approval Cover Page</h3>
          <p style={{ textAlign:"center", fontSize:14 }}><strong>Document Title :</strong>{DEFAULT_DOC.docTitle}</p>
          <p style={{ textAlign:"center", fontSize:14 }}><strong>Doc. No. :</strong>{DEFAULT_DOC.docNo}</p>
          <p style={{ fontWeight:"bold", fontSize:13, margin:"14px 0 6px" }}>Authoring</p>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16 }}>
            <thead><tr>{["#","Author","Job Title","Department","Functional Role","Authored on","Reason For Esign"].map(h=><th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr></thead>
            <tbody>
              <tr><td style={ptc()}>1</td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}>N/A</td><td style={ptc()}></td><td style={ptc()}>Document Author</td></tr>
            </tbody>
          </table>
          <p style={{ fontWeight:"bold", fontSize:13, margin:"0 0 6px" }}>Approval</p>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["#","Approver","Job Title","Department","Functional Role","Approved On","Reason For Esign"].map(h=><th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr></thead>
            <tbody>{[1,2,3].map(n=>(
              <tr key={n}><td style={ptc()}>{n}</td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}>Document Review and Approval</td></tr>
            ))}</tbody>
          </table>
          <div style={{ color:"#cc0000", fontWeight:"bold", textAlign:"right", fontSize:14, marginTop:8 }}>RESTRICTED</div>
        </div>

        {/* PAGE 2 — User Details + Reason */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader />
          <h2 style={{ textAlign:"center", fontSize:15, margin:"14px 0 10px" }}>Global LIMS User Access Request Form</h2>
          <h3 style={{ fontSize:14, margin:"0 0 8px" }}>1. Access Permission</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:10 }}>
            <thead>
              <tr><td colSpan={4} style={ptc("#c8c8c8")}><strong>User (multiple entries possible if needed)</strong></td></tr>
              <tr>{["Last Name","First Name","CWID","Function"].map(h=><th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr>
            </thead>
            <tbody>{users.map((u,i)=>(
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
                <div><PrintCheckbox checked={reason==="New"} /> New</div>
                <div><PrintCheckbox checked={reason==="Deactivation"} /> Deactivation (disable user account(s), remove all job types and departments)</div>
                <div><PrintCheckbox checked={reason==="Change"} /> Change (describe changes, include 'old' and 'new' value):</div>
                <div style={{ marginLeft:18, minHeight:24, fontSize:12 }}>{changeDesc||<span style={{ color:"#aaa" }}>Click here to enter text.</span>}</div>
              </td></tr>
            </tbody>
          </table>
          <div style={{ color:"#cc0000", fontWeight:"bold", textAlign:"right", fontSize:14, marginTop:8 }}>RESTRICTED</div>
        </div>

        {/* ONE PAGE PER ENV — thead carries doc header to repeated pages */}
        {DEFAULT_ENVS.map((env, idx) => (
          <div key={env.id} className="print-page" style={{ marginBottom:40 }}>
            <PrintEnvTable env={env} tableNum={idx+1} state={envStates[env.id]||mkEnvState()} />
            <div style={{ color:"#cc0000", fontWeight:"bold", textAlign:"right", fontSize:14, marginTop:8 }}>RESTRICTED</div>
          </div>
        ))}

        {/* Training + Approval */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader />
          <h3 style={{ fontSize:14, margin:"14px 0 8px" }}>2. Training documentation</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14 }}>
            <tbody><tr><td style={ptc()}>
              <div style={{ marginBottom:6 }}>
                <PrintCheckbox checked={trainingNA} /> N/A (Reason to be entered):{" "}
                {trainingNA && trainingNAReason ? trainingNAReason : <span style={{ color:"#aaa", fontSize:12 }}>Click here to enter text.</span>}
              </div>
              <div><PrintCheckbox checked={trainingConfirmed} /> Training record exist and is confirmed (access to the system is to be granted).</div>
              <div style={{ borderTop:"1px solid #999", marginTop:36, paddingTop:4, fontSize:11, color:"#555" }}>
                Date, Signature(s) R-Manager, CWID<br />
                Or in case of support groups, Date, Signature IT Service Provider, CWID<br />
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

        {/* Document History */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader />
          <h3 style={{ fontSize:14, margin:"16px 0 10px" }}>5. Document History</h3>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["Version No.","Changes (incl. reason for changes)","Effective date"].map(h=><th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr></thead>
            <tbody>{DEFAULT_DOC.docHistory.map((row,i)=>(
              <tr key={i}>
                <td style={{ ...ptc(), width:80 }}>{row.version}</td>
                <td style={ptc()}>{row.changes.split("\n").map((l,j)=><div key={j}>{l?`• ${l}`:""}</div>)}</td>
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