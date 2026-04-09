import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_ENVS } from "../assets/formConfig.json";

const ROLE_BG = { operative:"#fce8d5", mdm:"#d5e8f5", viewer:"#d5edd5", uam:"#ece5f0" };

const mkEnvState = () => ({
  reason: "N/A (no change needed, move to departments)",
  opRoles:[], mdmRoles:[], vRoles:[], uamRoles:[],
  deptChange:false, deptSel:{},
});

// ─── FILL ENV TABLE ───────────────────────────────────────────────────────────
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
    setState(p => ({
      ...p,
      [field]: p[field].includes(item)
        ? p[field].filter(r => r !== item)
        : [...p[field], item],
    }));
  };
  const toggleDept = (key) =>
    setState(p => ({ ...p, deptSel: { ...p.deptSel, [key]: !p.deptSel[key] } }));

  const RoleCheck = ({ field, item, color }) => (
    <label
      className={`flex items-center gap-2 px-2 py-0.5 rounded cursor-pointer text-sm select-none ${locked ? "cursor-not-allowed opacity-50" : ""}`}
      style={{ background: state[field].includes(item) ? color : "transparent" }}
    >
      <input
        type="checkbox"
        className="w-3.5 h-3.5 accent-blue-700"
        checked={state[field].includes(item)}
        onChange={() => toggleRole(field, item)}
        disabled={locked}
      />
      <span>{item}</span>
    </label>
  );

  return (
    <div className="border border-gray-300 rounded mb-5 overflow-hidden">
      <div className="bg-gray-300 px-3 py-2 font-bold text-sm">
        Table {tableNum}: Requested Role(s) and Department(s) for <u>{env.label}</u> System
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm mb-2">Reason of Access Request:</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          {reasonOpts.map(o => (
            <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name={`${env.id}_reason`}
                checked={reason === o}
                onChange={() => setState(p => ({ ...p, reason: o }))}
              />
              {o}
            </label>
          ))}
        </div>

        <div className={`grid grid-cols-2 gap-4 mb-4 transition-opacity ${locked ? "opacity-40 pointer-events-none" : ""}`}>
          <div>
            <p className="font-bold text-xs mb-1">1. Operative Roles</p>
            {env.operativeRoles.map(r => <RoleCheck key={r} field="opRoles" item={r} color={ROLE_BG.operative} />)}
          </div>
          <div>
            <p className="font-bold text-xs mb-1">2. Master Data Manager Roles</p>
            {env.mdmRoles.map(r => <RoleCheck key={r} field="mdmRoles" item={r} color={ROLE_BG.mdm} />)}
            <p className="font-bold text-xs mt-3 mb-1">3. Viewer Roles</p>
            {env.viewerRoles.map(r => <RoleCheck key={r} field="vRoles" item={r} color={ROLE_BG.viewer} />)}
            <p className="font-bold text-xs mt-3 mb-1">4. User Access Manager Roles</p>
            {env.uamRoles.map(r => <RoleCheck key={r} field="uamRoles" item={r} color={ROLE_BG.uam} />)}
          </div>
        </div>

        <div className="bg-gray-100 border border-gray-200 rounded p-3">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={deptChange}
              onChange={e => setState(p => ({ ...p, deptChange: e.target.checked }))}
            />
            Change for local Departments
            <span className="font-normal text-gray-500 text-xs">(consider global Department assignment only for GMDM Role)</span>
          </label>
          <div className={`space-y-2 transition-opacity ${deptChange ? "" : "opacity-40 pointer-events-none"}`}>
            {env.departments.map(({ main, children }) => (
              <div key={main} className="bg-white border border-gray-200 rounded p-2">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={!!deptSel[main]} onChange={() => toggleDept(main)} />
                  {main}
                  {children.length === 0 && <span className="text-gray-400 font-normal text-xs">(no sub-departments)</span>}
                </label>
                {children.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-6">
                    {children.map(c => (
                      <label key={c} className="flex items-center gap-1.5 text-sm cursor-pointer bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
                        <input type="checkbox" checked={!!deptSel[c]} onChange={() => toggleDept(c)} />
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
  const navigate = useNavigate();

  const [envs]                                    = useState(DEFAULT_ENVS);
  const [users, setUsers]                         = useState([{ lastName:"", firstName:"", cwid:"", function:"" }]);
  const [reason, setReason]                       = useState("New");
  const [changeDesc, setChangeDesc]               = useState("");
  const [trainingNA, setTrainingNA]               = useState(false);
  const [trainingNAReason, setTrainingNAReason]   = useState("");
  const [trainingConfirmed, setTrainingConfirmed] = useState(false);

  const [envStates, setEnvStates] = useState(
    () => Object.fromEntries(DEFAULT_ENVS.map(e => [e.id, mkEnvState()]))
  );
  const setEnvState = (id, updater) =>
    setEnvStates(p => ({
      ...p,
      [id]: typeof updater === "function" ? updater(p[id]) : updater,
    }));

  const addUser    = () => setUsers([...users, { lastName:"", firstName:"", cwid:"", function:"" }]);
  const removeUser = (i) => setUsers(users.filter((_, idx) => idx !== i));
  const updateUser = (i, f, v) => { const u = [...users]; u[i][f] = v; setUsers(u); };

  const goToPreview = () => {
    navigate("/uar-preview", {
      state: { users, reason, changeDesc, envStates, trainingNA, trainingNAReason, trainingConfirmed },
    });
  };

  const inpCls = "w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-bayer-blue";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-bayer-blue">Global LIMS User Access Request Form</h1>
        <button onClick={goToPreview}
          className="bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#004aad] transition-colors">
          Preview & Download →
        </button>
      </div>

      {/* User Details */}
      <section className="border border-gray-300 rounded mb-5 overflow-hidden">
        <div className="bg-gray-300 px-3 py-2 font-bold text-sm">1. Access Permission — User Details</div>
        <div className="p-4">
          <table className="w-full text-sm border-collapse mb-3">
            <thead>
              <tr className="bg-gray-100">
                {["Last Name","First Name","CWID","Function"].map(h => (
                  <th key={h} className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-xs">{h}</th>
                ))}
                {users.length > 1 && <th className="border border-gray-300 w-10"></th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  {["lastName","firstName","cwid","function"].map(f => (
                    <td key={f} className="border border-gray-200 p-1">
                      <input
                        value={u[f]}
                        onChange={e => updateUser(i, f, e.target.value)}
                        className={inpCls}
                        placeholder={f === "cwid" ? "CWID" : f.charAt(0).toUpperCase() + f.slice(1)}
                      />
                    </td>
                  ))}
                  {users.length > 1 && (
                    <td className="border border-gray-200 p-1 text-center w-10">
                      <button onClick={() => removeUser(i)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">×</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addUser}
            className="text-sm bg-blue-400 text-white px-3 py-1 rounded hover:bg-[#004aad] transition-colors">
            + Add User
          </button>
        </div>
      </section>

      {/* Reason */}
      <section className="border border-gray-300 rounded mb-5 overflow-hidden">
        <div className="bg-gray-300 px-3 py-2 font-bold text-sm">Reason of Access Request</div>
        <div className="p-4 space-y-2">
          {["New","Deactivation","Change"].map(r => (
            <label key={r} className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="radio" name="accessReason" checked={reason === r}
                onChange={() => setReason(r)} className="mt-0.5" />
              {r === "New" ? "New"
                : r === "Deactivation" ? "Deactivation (disable user account(s), remove all job types and departments)"
                : "Change (describe changes, include 'old' and 'new' value):"}
            </label>
          ))}
          {reason === "Change" && (
            <textarea value={changeDesc} onChange={e => setChangeDesc(e.target.value)}
              placeholder="Describe the change (old and new values)..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bayer-blue h-20 resize-none mt-1" />
          )}
        </div>
      </section>

      {/* Env Tables */}
      {envs.map((env, idx) => (
        <FillEnvTable key={env.id} env={env} tableNum={idx + 1}
          state={envStates[env.id] || mkEnvState()}
          setState={(updater) => setEnvState(env.id, updater)} />
      ))}

      {/* Training */}
      <section className="border border-gray-300 rounded mb-5 overflow-hidden">
        <div className="bg-gray-300 px-3 py-2 font-bold text-sm">2. Training Documentation</div>
        <div className="p-4 space-y-3">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={trainingNA}
              onChange={e => setTrainingNA(e.target.checked)} className="mt-0.5" />
            N/A (Reason to be entered):
          </label>
          {trainingNA && (
            <input value={trainingNAReason} onChange={e => setTrainingNAReason(e.target.value)}
              placeholder="Enter reason..." className={inpCls} />
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={trainingConfirmed}
              onChange={e => setTrainingConfirmed(e.target.checked)} />
            Training record exist and is confirmed (access to the system is to be granted).
          </label>
        </div>
      </section>

      {/* Footer */}
      <div className="flex justify-end">
        <button onClick={goToPreview}
          className="bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#004aad] transition-colors">
          Preview & Download →
        </button>
      </div>

    </div>
  );
}