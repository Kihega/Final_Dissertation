import { useState } from 'react'
import { X, KeyRound, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react'

function getStrength(pwd) {
  let s = 0
  if (pwd.length >= 8)           s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  if (pwd.length >= 12)          s++
  if (s<=1) return { label:'Weak',       color:'bg-red-500',    tc:'text-red-400',    w:'w-1/5'  }
  if (s<=2) return { label:'Fair',       color:'bg-orange-400', tc:'text-orange-400', w:'w-2/5'  }
  if (s<=3) return { label:'Good',       color:'bg-yellow-400', tc:'text-yellow-400', w:'w-3/5'  }
  if (s<=4) return { label:'Strong',     color:'bg-[#00d4ff]',  tc:'text-[#00d4ff]',  w:'w-4/5'  }
  return           { label:'Very Strong',color:'bg-[#00ff9d]',  tc:'text-[#00ff9d]',  w:'w-full' }
}

export default function ChangePasswordModal({ onClose, t }) {
  const [step,       setStep]       = useState('email')
  const [email,      setEmail]      = useState('')
  const [token,      setToken]      = useState('')
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNew,    setShowNew]    = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [error,      setError]      = useState('')
  const strength = getStrength(newPwd)

  const steps = ['email','token','reset','success']
  const stepIdx = steps.indexOf(step)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl z-10 ${t.card} ${t.cardBorder}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
              <KeyRound size={15} className="text-[#00d4ff]" />
            </div>
            <div>
              <p className={`font-bold text-sm ${t.text}`}>Change Password</p>
              <p className={`text-[10px] ${t.textSub}`}>
                {step==='email'   && 'Step 1 — Enter your registered email'}
                {step==='token'   && 'Step 2 — Enter token from email'}
                {step==='reset'   && 'Step 3 — Set new password'}
                {step==='success' && 'Password updated successfully'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.textDim} hover:text-red-400 hover:bg-red-500/10 transition-all`}>
            <X size={15} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {steps.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500
                                    ${stepIdx >= i ? 'bg-[#00d4ff]' : t.cardBorder.includes('gray') ? 'bg-gray-200' : 'bg-[#1e2d45]'}`} />
          ))}
        </div>

        <div className="px-6 py-5">

          {/* STEP 1 — Email */}
          {step === 'email' && (
            <form onSubmit={e => {
              e.preventDefault()
              if (!email.includes('@')) { setError('Enter a valid email address.'); return }
              setError(''); setStep('token')
            }} className="space-y-4">
              <p className={`text-xs ${t.textSub}`}>
                Enter your registered email. A reset token will be sent.
              </p>
              <div className="relative">
                <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                <input type="email" placeholder="admin@nbs.go.tz" value={email}
                       onChange={e => { setEmail(e.target.value); setError('') }}
                       className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#00d4ff]/50 placeholder-gray-500 transition-colors`} />
              </div>
              {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
              <button type="submit"
                      className="w-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 font-semibold text-sm py-2.5 rounded-lg transition-all">
                Send Reset Token
              </button>
            </form>
          )}

          {/* STEP 2 — Token */}
          {step === 'token' && (
            <form onSubmit={e => {
              e.preventDefault()
              if (token.length < 4) { setError('Enter the token from your email.'); return }
              setError(''); setStep('reset')
            }} className="space-y-4">
              <div className={`p-3 rounded-lg border ${t.cardBorder.includes('gray') ? 'bg-blue-50 border-blue-200' : 'bg-[#00d4ff]/5 border-[#00d4ff]/20'}`}>
                <p className="text-[#00d4ff] text-xs">Token sent to <strong>{email}</strong>. Check your inbox.</p>
              </div>
              <div className="relative">
                <ShieldCheck size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                <input type="text" placeholder="Enter token from email" value={token}
                       onChange={e => { setToken(e.target.value); setError('') }}
                       className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#00d4ff]/50 placeholder-gray-500 transition-colors font-mono tracking-widest`} />
              </div>
              {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
              <button type="submit"
                      className="w-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 font-semibold text-sm py-2.5 rounded-lg transition-all">
                Verify Token
              </button>
              <button type="button" onClick={() => setStep('email')}
                      className={`w-full text-xs ${t.textSub} hover:underline`}>← Back</button>
            </form>
          )}

          {/* STEP 3 — Reset */}
          {step === 'reset' && (
            <form onSubmit={e => {
              e.preventDefault()
              if (newPwd.length < 8) { setError('Minimum 8 characters required.'); return }
              if (newPwd !== confirmPwd) { setError('Passwords do not match.'); return }
              setError(''); setStep('success')
              setTimeout(() => { onClose(); window.location.reload() }, 2500)
            }} className="space-y-4">
              <div>
                <label className={`text-xs font-medium ${t.textDim} mb-1.5 block`}>New Password</label>
                <div className="relative">
                  <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                  <input type={showNew ? 'text' : 'password'} placeholder="Min. 8 characters" value={newPwd}
                         onChange={e => { setNewPwd(e.target.value); setError('') }}
                         className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-10 py-2.5 outline-none focus:border-[#00d4ff]/50 placeholder-gray-500 transition-colors`} />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textDim}`}>
                    {showNew ? <EyeOff size={13}/> : <Eye size={13}/>}
                  </button>
                </div>
                {newPwd && (
                  <div className="mt-2">
                    <div className={`h-1 w-full rounded-full ${t.cardBorder.includes('gray') ? 'bg-gray-200' : 'bg-[#1e2d45]'}`}>
                      <div className={`h-1 rounded-full transition-all ${strength.color} ${strength.w}`} />
                    </div>
                    <p className={`text-[10px] mt-1 font-mono ${strength.tc}`}>Strength: {strength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className={`text-xs font-medium ${t.textDim} mb-1.5 block`}>Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                  <input type={showConf ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPwd}
                         onChange={e => { setConfirmPwd(e.target.value); setError('') }}
                         className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-10 py-2.5 outline-none focus:border-[#00d4ff]/50 placeholder-gray-500 transition-colors`} />
                  <button type="button" onClick={() => setShowConf(!showConf)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textDim}`}>
                    {showConf ? <EyeOff size={13}/> : <Eye size={13}/>}
                  </button>
                </div>
                {confirmPwd && newPwd !== confirmPwd && <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle size={10}/>Passwords do not match</p>}
                {confirmPwd && newPwd === confirmPwd  && <p className="text-[#00ff9d] text-[10px] mt-1 flex items-center gap-1"><CheckCircle size={10}/>Passwords match</p>}
              </div>
              {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
              <button type="submit"
                      className="w-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/20 font-semibold text-sm py-2.5 rounded-lg transition-all">
                Update Password
              </button>
            </form>
          )}

          {/* STEP 4 — Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-[#00ff9d]" />
              </div>
              <p className={`font-bold text-base mb-2 ${t.text}`}>Password Updated!</p>
              <p className={`text-xs ${t.textSub}`}>Refreshing dashboard in a moment...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
