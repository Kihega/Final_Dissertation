
import { useState } from 'react'
import { X, KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle, AlertCircle, Lock } from 'lucide-react'
import { API } from '../api'

function getStrength(pwd) {
  let s = 0
  if (pwd.length >= 8)            s++
  if (/[A-Z]/.test(pwd))         s++
  if (/[0-9]/.test(pwd))         s++
  if (/[^A-Za-z0-9]/.test(pwd))  s++
  if (pwd.length >= 12)           s++
  if (s <= 1) return { label: 'Weak',        color: 'bg-red-500',    tc: 'text-red-400',    w: 'w-1/5'  }
  if (s <= 2) return { label: 'Fair',        color: 'bg-orange-400', tc: 'text-orange-400', w: 'w-2/5'  }
  if (s <= 3) return { label: 'Good',        color: 'bg-yellow-400', tc: 'text-yellow-400', w: 'w-3/5'  }
  if (s <= 4) return { label: 'Strong',      color: 'bg-[#00d4ff]',  tc: 'text-[#00d4ff]',  w: 'w-4/5'  }
  return           { label: 'Very Strong',   color: 'bg-[#00ff9d]',  tc: 'text-[#00ff9d]',  w: 'w-full' }
}

export default function ChangePasswordModal({ onClose, t, authToken }) {
  const [currentPwd,  setCurrentPwd]  = useState('')
  const [newPwd,      setNewPwd]      = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConf,    setShowConf]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)
  const strength = getStrength(newPwd)

  // Use token from prop or from sessionStorage
  const token = authToken || sessionStorage.getItem('nbs_token') || ''

  const validate = () => {
    if (!currentPwd)              return 'Enter your current password'
    if (newPwd.length < 8)        return 'New password must be at least 8 characters'
    if (!/[A-Z]/.test(newPwd))    return 'Include at least one uppercase letter'
    if (!/[0-9]/.test(newPwd))    return 'Include at least one number'
    if (!/[^A-Za-z0-9]/.test(newPwd)) return 'Include at least one special character'
    if (newPwd !== confirmPwd)    return 'Passwords do not match'
    if (newPwd === currentPwd)    return 'New password must differ from current password'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      await API.changePassword(currentPwd, newPwd, token)
      setSuccess(true)
    } catch (e) {
      setError(e.message || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full pl-9 pr-10 py-2.5 rounded-lg text-xs border outline-none transition-all
    ${t.input} ${t.text} ${t.cardBorder}
    focus:border-[#00d4ff]/60 focus:ring-1 focus:ring-[#00d4ff]/20`

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
                {success ? 'Password updated successfully' : 'Update your NBS account password'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.textDim}
              hover:text-red-400 hover:bg-red-500/10 transition-all`}>
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Success */}
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30
                flex items-center justify-center mx-auto">
                <CheckCircle size={30} className="text-[#00ff9d]" />
              </div>
              <div>
                <p className={`font-bold ${t.text}`}>Password Changed!</p>
                <p className={`text-xs mt-1 ${t.textSub}`}>
                  Your password has been updated. You will need to log in again next session.
                </p>
              </div>
              <button onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#00d4ff] text-[#060f1e] font-bold text-sm
                  hover:bg-[#00b8d9] transition-all">
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Security notice */}
              <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${t.cardBorder} bg-[#00d4ff]/5`}>
                <ShieldCheck size={14} className="text-[#00d4ff] mt-0.5 flex-shrink-0" />
                <p className={`text-[10px] leading-relaxed ${t.textSub}`}>
                  Password must be 8+ characters with uppercase, number, and special character.
                  Never share your credentials with anyone.
                </p>
              </div>

              {/* Current password */}
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${t.textDim}`}>
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPwd}
                    onChange={e => { setCurrentPwd(e.target.value); setError('') }}
                    placeholder="Enter current password"
                    className={inputCls}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowCurrent(p => !p)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textDim} hover:text-[#00d4ff] transition-colors`}>
                    {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${t.textDim}`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPwd}
                    onChange={e => { setNewPwd(e.target.value); setError('') }}
                    placeholder="Enter new password"
                    className={inputCls}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowNew(p => !p)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textDim} hover:text-[#00d4ff] transition-colors`}>
                    {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {newPwd && (
                  <div className="mt-1.5 space-y-1">
                    <div className={`h-1 rounded-full ${t.cardBorder} overflow-hidden bg-gray-700`}>
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.w}`} />
                    </div>
                    <p className={`text-[9px] font-mono ${strength.tc}`}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${t.textDim}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                  <input
                    type={showConf ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={e => { setConfirmPwd(e.target.value); setError('') }}
                    placeholder="Repeat new password"
                    className={inputCls}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConf(p => !p)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textDim} hover:text-[#00d4ff] transition-colors`}>
                    {showConf ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  {confirmPwd && newPwd && (
                    <div className="absolute right-9 top-1/2 -translate-y-1/2">
                      {newPwd === confirmPwd
                        ? <CheckCircle size={13} className="text-[#00ff9d]" />
                        : <AlertCircle size={13} className="text-red-400" />
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-[11px] text-red-400">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all
                    ${t.cardBorder} ${t.textSub} hover:border-gray-500`}>
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#00d4ff] text-[#060f1e] font-bold text-xs
                    hover:bg-[#00b8d9] transition-all disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2">
                  {loading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-[#060f1e]/40 border-t-[#060f1e] rounded-full animate-spin" />Updating...</>
                  ) : (
                    <><KeyRound size={13} />Change Password</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
