import { useEffect, useMemo, useState } from 'react'
import { Check, FileText, Layers, Send, Settings, Shield, Zap } from 'lucide-react'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Stat({ label, value }) {
  return (
    <div className="bg-white/60 backdrop-blur rounded-lg p-4 border border-gray-100 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  )
}

function Plan({ name, price, features, highlight }) {
  return (
    <div className={`rounded-2xl border ${highlight ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'} bg-white p-6 flex flex-col shadow-sm`}>
      <div className="flex items-baseline gap-2">
        <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
      </div>
      <div className="mt-3">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        <span className="text-gray-500">/mo</span>
      </div>
      <ul className="mt-6 space-y-2 text-sm text-gray-700">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5" /> {f}</li>
        ))}
      </ul>
      <button className={`mt-6 w-full py-2 rounded-md font-medium ${highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-black'}`}>
        Get started
      </button>
    </div>
  )
}

function Pricing() {
  const [plans, setPlans] = useState([])
  useEffect(() => {
    fetch(`${apiBase}/pricing`).then(r => r.json()).then(d => setPlans(d.plans || [])).catch(() => {})
  }, [])
  const mapped = useMemo(() => plans.map(p => ({ name: p.name, price: p.price_usd, features: p.features })), [plans])
  return (
    <section className="py-16" id="pricing">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Simple, scalable pricing</h2>
        <p className="text-gray-600 text-center mt-2">Start free. Upgrade as your workflows grow.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {mapped.map((p, i) => (
            <Plan key={i} name={p.name} price={p.price} features={p.features} highlight={i===1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Templates() {
  const [seeded, setSeeded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  const seed = async () => {
    setLoading(true)
    try {
      await fetch(`${apiBase}/templates/seed`, { method: 'POST' })
      const res = await fetch(`${apiBase}/workflows?category=Finance`)
      const data = await res.json()
      setItems(data.items || [])
      setSeeded(true)
    } catch (e) { /* noop */ }
    setLoading(false)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50" id="templates">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Pre-built finance workflows</h2>
          <button onClick={seed} disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            <Zap className="h-4 w-4" /> {loading ? 'Seeding...' : (seeded ? 'Reseed' : 'Seed templates')}
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {items.map(w => (
            <div key={w.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">{w.name}</h3>
              </div>
              <p className="text-gray-600 text-sm mt-2">{w.description}</p>
              <div className="mt-4">
                <div className="text-xs text-gray-500">Steps</div>
                <ul className="mt-1 text-sm list-disc ml-5">
                  {(w.steps || []).map((s, i) => <li key={i}>{s.name} • {s.type}</li>)}
                </ul>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="md:col-span-3 text-gray-600">No templates yet. Click "Seed templates" to add finance workflows like Invoices, Expenses, and POs.</div>
          )}
        </div>
      </div>
    </section>
  )
}

function QuickSubmit() {
  const [forms, setForms] = useState([])
  const [selected, setSelected] = useState('')
  const [values, setValues] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => { fetch(`${apiBase}/forms`).then(r=>r.json()).then(d=>setForms(d.items||[])).catch(()=>{}) }, [])

  const submit = async () => {
    if (!selected) return
    const body = { form_id: selected, data: values }
    const res = await fetch(`${apiBase}/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data)
  }

  const currentForm = forms.find(f => f.id === selected)

  return (
    <section className="py-16" id="submit">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Try it now</h2>
        <p className="text-gray-600 text-center mt-2">Submit a form and route for approval.</p>
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-sm text-gray-600">Choose form</label>
              <select value={selected} onChange={e=>setSelected(e.target.value)} className="mt-1 w-full border rounded-md p-2">
                <option value="">-- Select --</option>
                {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              {currentForm ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {(currentForm.fields||[]).map(field => (
                    <div key={field.key}>
                      <label className="text-sm text-gray-700">{field.label}</label>
                      <input type="text" className="mt-1 w-full border rounded-md p-2" onChange={e=>setValues(v=>({...v, [field.key]: e.target.value}))} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Select a form to preview fields.</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={submit} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-black"><Send className="h-4 w-4" /> Submit</button>
            {result && <span className="text-sm text-gray-600">Submission: {result.id} • Status: {result.status}</span>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [summary, setSummary] = useState(null)
  useEffect(() => { fetch(`${apiBase}/dashboard/summary`).then(r=>r.json()).then(setSummary).catch(()=>{}) }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-semibold">FlowPilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#templates" className="hover:text-gray-900">Templates</a>
            <a href="#submit" className="hover:text-gray-900">Try</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          </nav>
          <button className="inline-flex items-center gap-2 text-sm bg-gray-900 text-white px-3 py-2 rounded-md"><Settings className="h-4 w-4" /> Launch Studio</button>
        </div>
      </header>

      <section className="pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">No-code workflow automation for modern SMEs</h1>
            <p className="mt-4 text-gray-600">Collect requests with forms, route approvals, auto-generate PDFs, archive documents, and track it all from clean dashboards.</p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#templates" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"><Layers className="h-4 w-4" /> Explore templates</a>
              <a href="/test" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md inline-flex items-center gap-2"><FileText className="h-4 w-4" /> Check backend</a>
            </div>
            {summary && (
              <div className="grid grid-cols-3 gap-3 mt-8">
                <Stat label="Forms" value={summary.totals.forms} />
                <Stat label="Workflows" value={summary.totals.workflows} />
                <Stat label="Submissions" value={summary.totals.submissions} />
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">Drag-and-drop forms</div>
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">Rules-based approvals</div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">PDF generation</div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">Document archive</div>
              <div className="p-3 rounded-lg bg-pink-50 border border-pink-100">Dashboards</div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">SaaS billing-ready</div>
            </div>
          </div>
        </div>
      </section>

      <Templates />
      <QuickSubmit />
      <Pricing />

      <footer className="py-10 text-center text-sm text-gray-500">© {new Date().getFullYear()} FlowPilot — Built for SMEs</footer>
    </div>
  )
}
