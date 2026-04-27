import { useState } from 'react'
import { X, Search, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react'

export const ALL_ACTIONS = [
  {icon:CheckCircle2, color:'text-[#00ff9d]', text:'District Admin #4412 (Mwanza) validated 1,200 records',  time:'2026-05-12 14:22:01 EAT', status:'SUCCESS', sc:'text-[#00ff9d]'},
  {icon:RefreshCw,    color:'text-[#00d4ff]', text:'Cloud DB synchronization triggered by System Scheduler', time:'2026-05-12 14:15:44 EAT', status:'SYNCING', sc:'text-[#00d4ff]'},
  {icon:AlertTriangle,color:'text-red-400',   text:'Multiple failed login attempts — Region: Kilimanjaro',   time:'2026-05-12 13:58:12 EAT', status:'BLOCKED', sc:'text-red-400'  },
  {icon:CheckCircle2, color:'text-[#00ff9d]', text:'New District Admin registered — Singida District',       time:'2026-05-12 13:30:05 EAT', status:'SUCCESS', sc:'text-[#00ff9d]'},
  {icon:CheckCircle2, color:'text-[#00ff9d]', text:'Migration #MIG-2026-00431 confirmed — Dodoma to Dar',    time:'2026-05-12 12:47:33 EAT', status:'SUCCESS', sc:'text-[#00ff9d]'},
  {icon:AlertTriangle,color:'text-red-400',   text:'Unauthorized API access attempt blocked — IP: 41.x.x.x', time:'2026-05-12 12:10:00 EAT', status:'BLOCKED', sc:'text-red-400'  },
  {icon:CheckCircle2, color:'text-[#00ff9d]', text:'Village Officer #0891 registered 340 citizens (Dodoma)', time:'2026-05-12 11:55:22 EAT', status:'SUCCESS', sc:'text-[#00ff9d]'},
  {icon:RefreshCw,    color:'text-[#00d4ff]', text:'Population snapshot generated for all 31 regions',       time:'2026-05-12 11:30:00 EAT', status:'SYNCING', sc:'text-[#00d4ff]'},
  {icon:CheckCircle2, color:'text-[#00ff9d]', text:'Birth certificate #BIRTH-2026-07-00012345 issued',        time:'2026-05-12 10:45:10 EAT', status:'SUCCESS', sc:'text-[#00ff9d]'},
  {icon:CheckCircle2, color:'text-[#00ff9d]', text:'Death certificate #DEATH-2026-07-00008409 issued',        time:'2026-05-12 10:22:05 EAT', status:'SUCCESS', sc:'text-[#00ff9d]'},
  {icon:AlertTriangle,color:'text-red-400',   text:'Security scan detected anomaly in Tabora district',       time:'2026-05-12 09:50:00 EAT', status:'BLOCKED', sc:'text-red-400'  },
  {icon:RefreshCw,    color:'text-[#00d4ff]', text:'Redis cache refreshed — 15-min cron job completed',       time:'2026-05-12 09:30:00 EAT', status:'SYNCING', sc:'text-[#00d4ff]'},
]

export default function AllActionsModal({ onClose, t }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = ALL_ACTIONS.filter(a => {
    const mf = filter === 'all' || a.status === filter
    const ms = a.text.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  const dark = t.cardBorder.includes('gray')

  const statusBtnClass = (f) => {
    if (filter === f) {
      if (f==='SUCCESS') return 'bg-[#00ff9d]/10 border-[#00ff9d]/40 text-[#00ff9d]'
      if (f==='SYNCING') return 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]'
      if (f==='BLOCKED') return 'bg-red-500/10 border-red-500/40 text-red-400'
      return 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]'
    }
    return dark ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-white/5 border-[#1e2d45] text-gray-500 hover:text-gray-300'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl z-10 flex flex-col
                      ${t.card} ${t.cardBorder}`} style={{ maxHeight:'85vh' }}>

        <div className={`flex items-center justify-between px-5 py-4 border-b ${t.border} shrink-0`}>
          <div>
            <p className={`font-bold text-sm ${t.text}`}>All Administrative Actions</p>
            <p className={`text-[10px] ${t.textSub}`}>{filtered.length} records shown</p>
          </div>
          <button onClick={onClose}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.textDim} hover:text-red-400 hover:bg-red-500/10`}>
            <X size={15} />
          </button>
        </div>

        <div className={`px-5 py-3 border-b ${t.border} shrink-0 space-y-2`}>
          <div className="flex gap-2 flex-wrap">
            {['all','SUCCESS','SYNCING','BLOCKED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all border ${statusBtnClass(f)}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
            <input type="text" placeholder="Search actions..." value={search}
                   onChange={e => setSearch(e.target.value)}
                   className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-xs rounded-lg pl-8 pr-4 py-2 outline-none focus:border-[#00d4ff]/40 placeholder-gray-500 transition-colors`} />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
          {filtered.length === 0
            ? <div className="text-center py-8"><p className={`text-sm ${t.textSub}`}>No actions found</p></div>
            : filtered.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${t.rowHover}`}>
                  <a.icon size={13} className={`shrink-0 ${a.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${t.text}`}>{a.text}</p>
                    <p className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>{a.time}</p>
                  </div>
                  <span className={`text-[9px] font-mono font-bold shrink-0 ${a.sc}`}>{a.status}</span>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}
