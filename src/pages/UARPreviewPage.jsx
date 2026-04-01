import { useLocation, useNavigate } from "react-router-dom";
import {
  PDFDownloadLink, Document, Page,
  View, Text, Image, StyleSheet,
} from "@react-pdf/renderer";
import cognizantLogo from "../assets/cognizant.png";
import { DEFAULT_ENVS, DEFAULT_DOC } from "../assets/formConfig.json";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ROLE_BG = { operative:"#fce8d5", mdm:"#d5e8f5", viewer:"#d5edd5", uam:"#ece5f0" };

const mkEnvState = () => ({
  reason:"N/A (no change needed, move to departments)",
  opRoles:[], mdmRoles:[], vRoles:[], uamRoles:[],
  deptChange:false, deptSel:{},
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN COMPONENTS  (HTML — used for the on-screen preview only)
// ═══════════════════════════════════════════════════════════════════════════════
function CompanyLogo({ size = 56 }) {
  return <img src={cognizantLogo} alt="Cognizant" width={size} height={size} style={{ objectFit:"contain" }} />;
}

const PrintCheckbox = ({ checked }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", justifyContent:"center",
    width:14, height:14, border:"1.5px solid #333", background:"#fff",
    flexShrink:0, verticalAlign:"middle", fontSize:11, fontWeight:"bold",
    color:"#000", lineHeight:1,
  }}>
    {checked ? "✓" : ""}
  </span>
);

const ptc = (bg) => ({ border:"1px solid #555", padding:"3px 7px", fontSize:12, background:bg||"#fff", verticalAlign:"top" });

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

function PrintHeader() {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:10 }}>
      <tbody><DocHeaderRows /></tbody>
    </table>
  );
}

const RoleRow = ({ r, selected, color }) => (
  <tr style={{ background:color }}>
    <td style={{ width:28, padding:"2px 5px", borderBottom:"1px solid rgba(0,0,0,0.08)", borderRight:"1px solid rgba(0,0,0,0.12)", textAlign:"center" }}>
      <PrintCheckbox checked={selected} />
    </td>
    <td style={{ padding:"2px 8px", fontSize:12, borderBottom:"1px solid rgba(0,0,0,0.08)" }}>{r}</td>
  </tr>
);

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
        <tbody>{roles.map(r => <RoleRow key={r} r={r} selected={selected.includes(r)} color={color} />)}</tbody>
      </table>
    </>
  );
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14 }}>
      <thead style={{ display:"table-header-group" }}>
        <DocHeaderRows />
        <tr><td colSpan={3} style={{ padding:"6px 0 0", border:"none" }} /></tr>
      </thead>
      <tbody>
        <tr><td colSpan={3} style={{ padding:0 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #555" }}>
            <tbody>
              <tr><td colSpan={2} style={ptc()}><strong style={{ fontSize:13 }}>Table {tableNum}: Requested Role(s) and Department(s) for <u>{env.label}</u> System</strong></td></tr>
              <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Reason of Access Request</strong></td></tr>
              <tr><td colSpan={2} style={ptc()}>
                {reasonOpts.map((o,i) => (
                  <span key={i} style={{ marginRight:14, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:4 }}>
                    <PrintCheckbox checked={reason===o} />{o}
                  </span>
                ))}
              </td></tr>
              <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Job Types (s):</strong></td></tr>
              <tr><td colSpan={2} style={{ ...ptc(), padding:"6px 10px" }}>
                <div style={{ fontSize:12, fontWeight:"bold", marginBottom:4 }}>Job Type Reference to Role:</div>
                <RoleGroup title="1.&nbsp;&nbsp;Operative Roles"           roles={env.operativeRoles} selected={opRoles}  color={ROLE_BG.operative} />
                <RoleGroup title="2.&nbsp;&nbsp;Master Data Manager Roles" roles={env.mdmRoles}       selected={mdmRoles} color={ROLE_BG.mdm} />
                <RoleGroup title="3.&nbsp;&nbsp;Viewer Roles"              roles={env.viewerRoles}    selected={vRoles}   color={ROLE_BG.viewer} />
                <RoleGroup title="4.&nbsp;&nbsp;User Access Manager Roles" roles={env.uamRoles}       selected={uamRoles} color={ROLE_BG.uam} />
              </td></tr>
              <tr><td colSpan={2} style={ptc("#c8c8c8")}><strong>Describe the changes of departments</strong></td></tr>
              <tr><td colSpan={2} style={ptc()}>
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
              </td></tr>
            </tbody>
          </table>
        </td></tr>
      </tbody>
    </table>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF COMPONENTS  (@react-pdf/renderer — used for the downloaded PDF only)
// ═══════════════════════════════════════════════════════════════════════════════
const S = StyleSheet.create({
  page:       { padding:16, fontSize:9, fontFamily:"Helvetica", color:"#000" },
  bold:       { fontFamily:"Helvetica-Bold" },
  row:        { flexDirection:"row" },
  cell:       { borderWidth:1, borderColor:"#555", padding:4, fontSize:9 },
  gCell:      { borderWidth:1, borderColor:"#555", padding:4, fontSize:9, backgroundColor:"#c8c8c8" },
  restricted: { color:"#cc0000", fontFamily:"Helvetica-Bold", textAlign:"right", fontSize:11, marginTop:6 },
  cb:         { width:9, height:9, borderWidth:1, borderColor:"#333", alignItems:"center", justifyContent:"center", marginRight:3, flexShrink:0 },
  cbTick:     { fontSize:7, fontFamily:"Helvetica-Bold" },
});

// PDF Checkbox
const PdfCb = ({ checked }) => (
  <View style={S.cb}>{checked && <Text style={S.cbTick}>✓</Text>}</View>
);

// PDF Page Header
const PdfHeader = () => (
  <View style={{ marginBottom:8 }}>
    <View style={S.row}>
      <View style={[S.cell, { width:60, alignItems:"center", justifyContent:"center" }]}>
        <Image src={cognizantLogo} style={{ width:40, height:40, objectFit:"contain" }} />
      </View>
      <View style={[S.cell, { flex:1, alignItems:"center", justifyContent:"center" }]}>
        <Text style={[S.bold, { fontSize:10, textAlign:"center" }]}>Document Title: {DEFAULT_DOC.docTitle}</Text>
      </View>
      <View style={[S.cell, { width:130 }]}>
        <Text style={{ fontSize:9 }}>Doc.No.: {DEFAULT_DOC.docNo}</Text>
      </View>
    </View>
    <View style={S.row}>
      <View style={[S.cell, { width:60 }]}><Text style={{ fontSize:8 }}>Entity: {DEFAULT_DOC.entity}</Text></View>
      <View style={[S.cell, { flex:1 }]}><Text>Entity No: {DEFAULT_DOC.entityNo}</Text></View>
      <View style={[S.cell, { width:130 }]}><Text>Content Type:{'\n'}{DEFAULT_DOC.contentType}</Text></View>
    </View>
  </View>
);

// PDF Env Table
function PdfEnvTable({ env, tableNum, state }) {
  const { reason, opRoles, mdmRoles, vRoles, uamRoles, deptChange, deptSel } = state;
  const reasonOpts = [
    "N/A (no change needed, move to departments)",
    "Add Job types(s)",
    "Remove Job types (s)",
    'Change (see "Reason of Access Request")',
  ];
  const RoleGroup = ({ title, roles, selected, bg }) => (
    <View style={{ marginBottom:4 }}>
      <Text style={[S.bold, { fontSize:9, marginBottom:2 }]}>{title}</Text>
      <View style={{ width:"55%" }}>
        {roles.map(r => (
          <View key={r} style={[S.row, { backgroundColor:bg, borderBottomWidth:0.5, borderColor:"rgba(0,0,0,0.15)", alignItems:"center" }]}>
            <View style={{ width:20, padding:2, alignItems:"center", borderRightWidth:0.5, borderColor:"rgba(0,0,0,0.15)" }}>
              <PdfCb checked={selected.includes(r)} />
            </View>
            <Text style={{ padding:"2 5", fontSize:8, flex:1 }}>{r}</Text>
          </View>
        ))}
      </View>
    </View>
  );
  return (
    <View>
      <PdfHeader />
      <View style={{ borderWidth:1, borderColor:"#555" }}>
        <View style={S.cell}><Text style={S.bold}>Table {tableNum}: Requested Role(s) and Department(s) for {env.label} System</Text></View>
        <View style={S.gCell}><Text style={S.bold}>Reason of Access Request</Text></View>
        <View style={[S.cell, { flexDirection:"row", flexWrap:"wrap" }]}>
          {reasonOpts.map((o,i) => (
            <View key={i} style={{ flexDirection:"row", alignItems:"center", marginRight:10, marginBottom:2 }}>
              <PdfCb checked={reason===o} />
              <Text style={{ fontSize:8 }}>{o}</Text>
            </View>
          ))}
        </View>
        <View style={S.gCell}><Text style={S.bold}>Job Types(s):</Text></View>
        <View style={[S.cell, { padding:6 }]}>
          <Text style={[S.bold, { fontSize:9, marginBottom:4 }]}>Job Type Reference to Role:</Text>
          <RoleGroup title="1.  Operative Roles"           roles={env.operativeRoles} selected={opRoles}  bg={ROLE_BG.operative} />
          <RoleGroup title="2.  Master Data Manager Roles" roles={env.mdmRoles}       selected={mdmRoles} bg={ROLE_BG.mdm} />
          <RoleGroup title="3.  Viewer Roles"              roles={env.viewerRoles}    selected={vRoles}   bg={ROLE_BG.viewer} />
          <RoleGroup title="4.  User Access Manager Roles" roles={env.uamRoles}       selected={uamRoles} bg={ROLE_BG.uam} />
        </View>
        <View style={S.gCell}><Text style={S.bold}>Describe the changes of departments</Text></View>
        <View style={S.cell}>
          <View style={{ flexDirection:"row", alignItems:"flex-start", marginBottom:4 }}>
            <PdfCb checked={deptChange} />
            <Text style={{ fontSize:8, flex:1 }}>Change for local Departments (multiple entries if needed), consider global Department assignment only for GMDM Role:</Text>
          </View>
          {deptChange && (
            <View style={{ marginLeft:14 }}>
              {env.departments.map(({ main, children }) => {
                const mainSel = deptSel[main];
                const childSels = children.filter(c => deptSel[c]);
                if (!mainSel && childSels.length === 0) return null;
                return (
                  <View key={main} style={{ marginBottom:2 }}>
                    {mainSel && <View style={{ flexDirection:"row", alignItems:"center" }}><PdfCb checked /><Text style={{ fontSize:8 }}> {main}</Text></View>}
                    {childSels.map(c => (
                      <View key={c} style={{ flexDirection:"row", alignItems:"center", marginLeft:12 }}><PdfCb checked /><Text style={{ fontSize:8 }}> {c}</Text></View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
      <Text style={S.restricted}>RESTRICTED</Text>
    </View>
  );
}

// ─── MAIN PDF DOCUMENT ────────────────────────────────────────────────────────
function UARDocument({ users, reason, changeDesc, envStates, trainingNA, trainingNAReason, trainingConfirmed }) {
  const thCols = (cols) => cols.map(h => (
    <View key={h} style={[S.gCell, { flex:1 }]}><Text style={S.bold}>{h}</Text></View>
  ));
  return (
    <Document>
      {/* PAGE 1 — Cover */}
      <Page size="A4" style={S.page}>
        <PdfHeader />
        <Text style={[S.bold, { fontSize:12, textDecoration:"underline", margin:"12 0 8" }]}>Approval Cover Page</Text>
        <Text style={{ textAlign:"center", fontSize:10, marginBottom:3 }}>
          <Text style={S.bold}>Document Title: </Text>{DEFAULT_DOC.docTitle}
        </Text>
        <Text style={{ textAlign:"center", fontSize:10, marginBottom:10 }}>
          <Text style={S.bold}>Doc. No.: </Text>{DEFAULT_DOC.docNo}
        </Text>

        <Text style={[S.bold, { fontSize:10, marginBottom:4 }]}>Authoring</Text>
        <View>
          <View style={S.row}>{thCols(["#","Author","Job Title","Department","Functional Role","Authored on","Reason For Esign"])}</View>
          <View style={S.row}>
            {["1","","","","N/A","","Document Author"].map((v,i) => (
              <View key={i} style={[S.cell, { flex:1 }]}><Text>{v}</Text></View>
            ))}
          </View>
        </View>

        <Text style={[S.bold, { fontSize:10, marginTop:10, marginBottom:4 }]}>Approval</Text>
        <View>
          <View style={S.row}>{thCols(["#","Approver","Job Title","Department","Functional Role","Approved On","Reason For Esign"])}</View>
          {[1,2,3].map(n => (
            <View key={n} style={S.row}>
              {[String(n),"","","","","","Document Review and Approval"].map((v,i) => (
                <View key={i} style={[S.cell, { flex:1 }]}><Text>{v}</Text></View>
              ))}
            </View>
          ))}
        </View>
        <Text style={S.restricted}>RESTRICTED</Text>
      </Page>

      {/* PAGE 2 — User Details */}
      <Page size="A4" style={S.page}>
        <PdfHeader />
        <Text style={[S.bold, { fontSize:12, textAlign:"center", margin:"10 0 8" }]}>Global LIMS User Access Request Form</Text>
        <Text style={[S.bold, { fontSize:10, marginBottom:5 }]}>1. Access Permission</Text>
        <View style={{ marginBottom:8 }}>
          <View style={S.gCell}><Text style={S.bold}>User (multiple entries possible if needed)</Text></View>
          <View style={S.row}>{["Last Name","First Name","CWID","Function"].map(h => (
            <View key={h} style={[S.gCell, { flex:1 }]}><Text style={S.bold}>{h}</Text></View>
          ))}</View>
          {users.map((u,i) => (
            <View key={i} style={S.row}>
              <View style={[S.cell, { flex:1 }]}><Text>{u.lastName||"—"}</Text></View>
              <View style={[S.cell, { flex:1 }]}><Text>{u.firstName||"—"}</Text></View>
              <View style={[S.cell, { flex:1 }]}><Text>{u.cwid||"—"}</Text></View>
              <View style={[S.cell, { flex:1 }]}><Text>{u.function||"—"}</Text></View>
            </View>
          ))}
        </View>
        <View>
          <View style={S.gCell}><Text style={S.bold}>Reason of Access Request</Text></View>
          <View style={S.cell}>
            {[
              { label:"New", val:"New" },
              { label:"Deactivation (disable user account(s), remove all job types and departments)", val:"Deactivation" },
              { label:"Change (describe changes, include 'old' and 'new' value):", val:"Change" },
            ].map(({ label, val }) => (
              <View key={val} style={{ flexDirection:"row", alignItems:"flex-start", marginBottom:3 }}>
                <PdfCb checked={reason===val} />
                <Text style={{ fontSize:9, flex:1 }}>{label}</Text>
              </View>
            ))}
            <Text style={{ marginLeft:14, fontSize:9, color:changeDesc ? "#000" : "#999" }}>
              {changeDesc || "Click here to enter text."}
            </Text>
          </View>
        </View>
        <Text style={S.restricted}>RESTRICTED</Text>
      </Page>

      {/* ENV PAGES */}
      {DEFAULT_ENVS.map((env, idx) => (
        <Page key={env.id} size="A4" style={S.page}>
          <PdfEnvTable env={env} tableNum={idx+1} state={envStates[env.id] || mkEnvState()} />
        </Page>
      ))}

      {/* Training + Approval */}
      <Page size="A4" style={S.page}>
        <PdfHeader />
        <Text style={[S.bold, { fontSize:10, marginTop:8, marginBottom:5 }]}>2. Training documentation</Text>
        <View style={S.cell}>
          <View style={{ flexDirection:"row", alignItems:"center", marginBottom:5 }}>
            <PdfCb checked={trainingNA} />
            <Text style={{ fontSize:9 }}>N/A (Reason to be entered): {trainingNA && trainingNAReason ? trainingNAReason : ""}</Text>
          </View>
          <View style={{ flexDirection:"row", alignItems:"center" }}>
            <PdfCb checked={trainingConfirmed} />
            <Text style={{ fontSize:9 }}>Training record exist and is confirmed (access to the system is to be granted).</Text>
          </View>
          <View style={{ borderTopWidth:1, borderColor:"#999", marginTop:36, paddingTop:4 }}>
            <Text style={{ fontSize:8, color:"#555" }}>
              Date, Signature(s) R-Manager, CWID{'\n'}
              Or in case of support groups, Date, Signature IT Service Provider, CWID{'\n'}
              Or in case of IT service provider (to enable them to work on master data), Date, Signature, LPM, CWID
            </Text>
          </View>
        </View>

        <Text style={[S.bold, { fontSize:10, marginTop:10, marginBottom:5 }]}>3. Approval</Text>
        <View style={S.cell}>
          <Text style={{ fontSize:9, marginBottom:36 }}>For Local users: by Local Process Manager confirmation of local Department assignment and Segregation of duties. In case of GMDM role assignment, Nomination as part of OM must be completed and confirmed.</Text>
          <View style={{ borderTopWidth:1, borderColor:"#999", paddingTop:4 }}>
            <Text style={{ fontSize:8, color:"#555" }}>Date, Signature(s), CWID</Text>
          </View>
        </View>

        <Text style={[S.bold, { fontSize:10, marginTop:10, marginBottom:5 }]}>4. Authorization Implementation</Text>
        <Text style={{ fontSize:9, marginLeft:12 }}>Once Approvals are provided – Access can be granted through an User Access Manager in LIMS (Training record and approved User Access Form sheet must be attached into corresponding User Account in LIMS)</Text>
        <Text style={S.restricted}>RESTRICTED</Text>
      </Page>

      {/* Document History */}
      <Page size="A4" style={S.page}>
        <PdfHeader />
        <Text style={[S.bold, { fontSize:10, marginTop:8, marginBottom:5 }]}>5. Document History</Text>
        <View>
          <View style={S.row}>
            {[["Version No.",1],["Changes (incl. reason for changes)",3],["Effective date",1]].map(([h,f]) => (
              <View key={h} style={[S.gCell, { flex:f }]}><Text style={S.bold}>{h}</Text></View>
            ))}
          </View>
          {DEFAULT_DOC.docHistory.map((row,i) => (
            <View key={i} style={S.row}>
              <View style={[S.cell, { flex:1 }]}><Text>{row.version}</Text></View>
              <View style={[S.cell, { flex:3 }]}>
                {row.changes.split("\n").map((l,j) => l ? <Text key={j}>• {l}</Text> : null)}
              </View>
              <View style={[S.cell, { flex:1 }]}><Text>{row.date}</Text></View>
            </View>
          ))}
        </View>
        <Text style={S.restricted}>RESTRICTED</Text>
      </Page>
    </Document>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
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

  // ─── DB LOG HANDLER ─────────────────────────────────────────────────────────
  // This fires ONLY when the user clicks "Download PDF" — no dialog, no ambiguity.
  const handleDownloadClick = () => {
    console.log("✅ PDF Downloaded — user confirmed the download.");

    // 👉 TODO: Send data to your database here — this is 100% reliable.
    // fetch("/api/log-print", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ action: "downloaded", timestamp: new Date() }),
    // });
  };

  const docProps = { users, reason, changeDesc, envStates, trainingNA, trainingNAReason, trainingConfirmed };

  return (
    <div style={{ fontFamily:"Arial, sans-serif" }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-blue-400 text-white px-5 py-2.5 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate("/uar-form", { state })}
          className="bg-white/20 text-white border border-white/30 px-4 py-1.5 rounded text-sm hover:bg-white/30 transition-colors cursor-pointer">
          ← Edit Form
        </button>
        <span className="font-semibold text-sm">Print Preview — Global LIMS UAR Form</span>

        {/*
          PDFDownloadLink generates the PDF client-side and triggers a direct
          file download — no print dialog appears at all. The onClick fires
          with 100% certainty only when the user clicks this button.
        */}
        <PDFDownloadLink
          document={<UARDocument {...docProps} />}
          fileName="Global-LIMS-UAR-Form.pdf"
          onClick={handleDownloadClick}
          className="ml-auto bg-white text-blue-600 font-bold px-5 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
        >
          {({ loading }) => loading ? "⏳ Generating…" : "⬇ Download PDF"}
        </PDFDownloadLink>
      </div>

      {/* On-screen HTML preview (unchanged) */}
      <div style={{ fontFamily:"Arial, sans-serif", maxWidth:800, margin:"20px auto", padding:"0 20px" }}>

        {/* PAGE 1 — Cover */}
        <div className="print-page" style={{ marginBottom:40 }}>
          <PrintHeader />
          <h3 style={{ textDecoration:"underline", fontSize:14, margin:"16px 0 10px" }}>Approval Cover Page</h3>
          <p style={{ textAlign:"center", fontSize:14 }}><strong>Document Title :</strong>{DEFAULT_DOC.docTitle}</p>
          <p style={{ textAlign:"center", fontSize:14 }}><strong>Doc. No. :</strong>{DEFAULT_DOC.docNo}</p>
          <p style={{ fontWeight:"bold", fontSize:13, margin:"14px 0 6px" }}>Authoring</p>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16 }}>
            <thead><tr>{["#","Author","Job Title","Department","Functional Role","Authored on","Reason For Esign"].map(h=><th key={h} style={ptc("#c8c8c8")}>{h}</th>)}</tr></thead>
            <tbody><tr><td style={ptc()}>1</td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}></td><td style={ptc()}>N/A</td><td style={ptc()}></td><td style={ptc()}>Document Author</td></tr></tbody>
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

        {/* PAGE 2 — User Details */}
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

        {/* ONE PAGE PER ENV */}
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