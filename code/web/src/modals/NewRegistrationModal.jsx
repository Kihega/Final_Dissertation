import { useState } from 'react'
import { X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CorporateFareIcon      from '@mui/icons-material/CorporateFare'

// Simulated NIDA data lookup
const NIDA_DB = {
  '19900101-07001-00001-21': { fullName:'John Jovith Amsterdam', dob:'01 Jan 1990', gender:'Male', region:'Dar es Salaam', district:'Ilala',    ward:'Kariakoo', photo:null },
  '19850414-05120-00043-07': { fullName:'Amina Said Mwinyi',     dob:'14 Apr 1985', gender:'Female',region:'Iringa',      district:'Mufindi',   ward:'Mdabulo',  photo:null },
  '20001231-12042-00012-11': { fullName:'Emmanuel Kihega Alpha', dob:'31 Dec 2000', gender:'Male', region:'Mbeya',        district:'Chunya',    ward:'Lupa',     photo:null },
}

const ROLES = [
  {
    key:'super_admin', Icon:AdminPanelSettingsIcon,
    title:'Register Super Admin',
    desc:'National-level administrator. Full system access across all regions.',
    note:'System maximum: 5 Super Admins allowed.',
    current:3, max:5,
    accent:'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20', bar:'bg-[#00d4ff]',
  },
  {
    key:'district_admin', Icon:CorporateFareIcon,
    title:'Register District Admin',
    desc:'District-level administrator. Manages officers within assigned district.',
    note:'Minimum 2 admins required per district.',
    current:184, max:200,
    accent:'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20', bar:'bg-[#00ff9d]',
  },
]

export default function NewRegistrationModal({ onClose, t }) {
  const [role,      setRole]      = useState(null)
  const [step,      setStep]      = useState('choose') // choose|form|preview|confirm|done
  const [nid,       setNid]       = useState('')
  const [nidaData,  setNidaData]  = useState(null)
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleNidaLookup = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const found = NIDA_DB[nid.trim()]
      if (found) { setNidaData(found); setStep('preview') }
      else setError('National ID not found in NIDA database. Please verify and retry.')
    }, 1400)
  }

  const handleRegister = () => {
    if (!email.includes('@')) { setError('Enter a valid email address.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('done') }, 1200)
  }

  const resetAll = () => {
    setRole(null); setStep('choose'); setNid(''); setNidaData(null)
    setEmail(''); setError(''); setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl z-10 ${t.card} ${t.cardBorder}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border}`}>
          <div>
            <p className={`font-bold text-sm ${t.text}`}>New Registration</p>
            <p className={`text-[10px] ${t.textSub}`}>
              {step==='choose'  && 'Select registration type'}
              {step==='form'    && `Register ${role==='super_admin'?'Super Admin':'District Admin'} — Enter NID`}
              {step==='preview' && 'Verify NIDA identity data'}
              {step==='confirm' && 'Enter official email to send credentials'}
              {step==='done'    && 'Registration completed successfully'}
            </p>
          </div>
          <button onClick={onClose}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.textDim} hover:text-red-400 hover:bg-red-500/10 transition-all`}>
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* STEP 1 — Choose role */}
          {step === 'choose' && (
            <>
              {ROLES.map(({ key, Icon, title, desc, note, current, max, accent, bar }) => {
                const pct  = Math.round((current / max) * 100)
                const full = current >= max
                return (
                  <button key={key} disabled={full} onClick={() => { setRole(key); setStep('form') }}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                                     ${full
                                       ? `opacity-50 cursor-not-allowed ${t.cardBorder} ${t.card}`
                                       : `${t.cardBorder} ${t.card} hover:border-[#00d4ff]/40 hover:shadow-lg`}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${accent}`}>
                        <Icon sx={{ fontSize:20 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-bold text-sm ${t.text}`}>{title}</p>
                          {full && <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">LIMIT REACHED</span>}
                        </div>
                        <p className={`text-xs ${t.textSub} mb-1`}>{desc}</p>
                        <p className={`text-[10px] font-mono ${t.textDim} mb-2`}>{note}</p>
                        <div className="flex items-center gap-2">
                          <div className={`flex-1 h-1.5 rounded-full ${t.cardBorder.includes('gray')?'bg-gray-200':'bg-[#1e2d45]'}`}>
                            <div className={`h-1.5 rounded-full ${bar}`} style={{ width:`${pct}%` }} />
                          </div>
                          <span className={`text-[10px] font-mono shrink-0 ${t.textSub}`}>{current}/{max}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
              <button onClick={onClose}
                      className={`w-full py-2 rounded-lg text-xs ${t.textSub} border ${t.cardBorder} hover:border-red-400/30 hover:text-red-400 transition-all`}>
                Cancel
              </button>
            </>
          )}

          {/* STEP 2 — NID form */}
          {step === 'form' && (
            <form onSubmit={handleNidaLookup} className="space-y-4">
              <div className={`p-3 rounded-lg border ${t.cardBorder.includes('gray')?'bg-blue-50 border-blue-200':'bg-[#00d4ff]/5 border-[#00d4ff]/20'}`}>
                <p className="text-[#00d4ff] text-xs">
                  Enter the staff member's National ID to auto-fetch their bio data from NIDA.
                </p>
              </div>
              <div>
                <label className={`text-[10px] uppercase tracking-widest ${t.textDim} mb-1 block`}>
                  National ID Number (NIN)
                </label>
                <input value={nid} onChange={e => { setNid(e.target.value); setError('') }}
                       placeholder="e.g. 19900101-07001-00001-21"
                       className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#00d4ff]/50 placeholder-gray-500 transition-colors font-mono`} />
                <p className={`text-[10px] mt-1 ${t.textDim}`}>
                  Try: <span className="font-mono text-[#00d4ff]">19900101-07001-00001-21</span>
                </p>
              </div>
              {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('choose')}
                        className={`flex-1 py-2.5 rounded-lg text-xs border ${t.cardBorder} ${t.textSub} hover:border-[#00d4ff]/30 transition-all`}>
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                        className="flex-1 py-2.5 rounded-lg text-xs bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] font-bold hover:bg-[#00d4ff]/20 transition-all flex items-center justify-center gap-2">
                  {loading ? <><RefreshCw size={12} className="animate-spin"/>Looking up...</> : 'Fetch NIDA Data →'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 — Preview NIDA */}
          {step === 'preview' && nidaData && (
            <>
              <div className={`p-3 rounded-lg border ${t.cardBorder.includes('gray')?'bg-green-50 border-green-200':'bg-[#00ff9d]/5 border-[#00ff9d]/20'}`}>
                <p className="text-[#00ff9d] text-xs">NIDA data fetched successfully. Verify the identity below.</p>
              </div>
              <div className={`rounded-xl border ${t.cardBorder} overflow-hidden`}>
                <div className={`grid grid-cols-2 divide-x ${t.border} text-xs`}>
                  {[
                    ['Full Name',  nidaData.fullName],
                    ['Date of Birth', nidaData.dob],
                    ['Gender',    nidaData.gender],
                    ['Region',    nidaData.region],
                    ['District',  nidaData.district],
                    ['Ward',      nidaData.ward],
                    ['Role',      role === 'super_admin' ? 'Super Admin' : 'District Admin'],
                  ].map(([k, v], i) => (
                    <div key={k} className={`p-3 border-b ${i%2===0?'border-r':''} ${t.border}`}>
                      <p className={`text-[8.5px] uppercase tracking-widest ${t.textDim}`}>{k}</p>
                      <p className={`text-xs font-semibold ${t.text} mt-0.5`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className={`text-[10px] ${t.textSub}`}>
                ⚠ Confirm this person matches the intended registrant before proceeding.
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setNidaData(null); setStep('form') }}
                        className={`flex-1 py-2.5 rounded-lg text-xs border ${t.cardBorder} ${t.textSub} hover:border-red-400/30 hover:text-red-400 transition-all`}>
                  ← Wrong Person
                </button>
                <button onClick={() => setStep('confirm')}
                        className="flex-1 py-2.5 rounded-lg text-xs bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] font-bold hover:bg-[#00ff9d]/20 transition-all">
                  Confirm Identity ✓
                </button>
              </div>
            </>
          )}

          {/* STEP 4 — Email */}
          {step === 'confirm' && (
            <>
              <div className={`p-3 rounded-lg border ${t.cardBorder.includes('gray')?'bg-green-50 border-green-200':'bg-[#00ff9d]/5 border-[#00ff9d]/20'}`}>
                <p className="text-[#00ff9d] text-xs">
                  Identity confirmed for <strong>{nidaData?.fullName}</strong>.
                  Enter their official government email to send login credentials.
                </p>
              </div>
              <div>
                <label className={`text-[10px] uppercase tracking-widest ${t.textDim} mb-1 block`}>
                  Official Email Address
                </label>
                <input value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                       placeholder="official@nbs.go.tz" type="email"
                       className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#00ff9d]/50 placeholder-gray-500 transition-colors`} />
              </div>
              {error && <p className="text-red-400 text-[10px] flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
              <div className={`p-3 rounded-lg border ${t.cardBorder} space-y-1`}>
                <p className={`text-[10px] ${t.textDim}`}>📧 Login token will be sent to the email above</p>
                <p className={`text-[10px] ${t.textDim}`}>🔗 Dashboard access link included in the email</p>
                <p className={`text-[10px] ${t.textDim}`}>🔒 Admin must complete profile setup on first login</p>
              </div>
              <button onClick={handleRegister} disabled={loading}
                      className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00ff9d] to-[#00bb6e] text-[#060f1e] hover:opacity-90 transition-all flex items-center justify-center gap-2">
                {loading ? <><RefreshCw size={14} className="animate-spin"/>Sending...</> : 'Register & Send Credentials →'}
              </button>
            </>
          )}

          {/* STEP 5 — Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-[#00ff9d]" />
              </div>
              <p className={`font-bold text-base mb-2 ${t.text}`}>Registration Successful!</p>
              <p className={`text-xs ${t.textSub} mb-1`}>Login token & dashboard link sent to:</p>
              <p className="text-[#00d4ff] text-xs font-mono mb-4">{email}</p>
              <button onClick={onClose}
                      className="px-6 py-2 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-xs hover:bg-[#00d4ff]/20 transition-all">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
