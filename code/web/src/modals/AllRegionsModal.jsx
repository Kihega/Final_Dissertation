import { useState } from 'react'
import { X, Search } from 'lucide-react'
import BadgeIcon from '@mui/icons-material/Badge'

export const ALL_REGIONS = [
  {code:'DAR',name:'Dar es Salaam',  pop:'7.4M', jurisdiction:'mainland'},
  {code:'ARU',name:'Arusha',         pop:'2.1M', jurisdiction:'mainland'},
  {code:'DOD',name:'Dodoma',         pop:'2.7M', jurisdiction:'mainland'},
  {code:'MWA',name:'Mwanza',         pop:'3.7M', jurisdiction:'mainland'},
  {code:'MBY',name:'Mbeya',          pop:'2.7M', jurisdiction:'mainland'},
  {code:'TAN',name:'Tanga',          pop:'2.0M', jurisdiction:'mainland'},
  {code:'KIL',name:'Kilimanjaro',    pop:'1.7M', jurisdiction:'mainland'},
  {code:'MOR',name:'Morogoro',       pop:'2.5M', jurisdiction:'mainland'},
  {code:'IRN',name:'Iringa',         pop:'0.9M', jurisdiction:'mainland'},
  {code:'SHY',name:'Shinyanga',      pop:'1.5M', jurisdiction:'mainland'},
  {code:'KAG',name:'Kagera',         pop:'2.9M', jurisdiction:'mainland'},
  {code:'MAR',name:'Mara',           pop:'1.7M', jurisdiction:'mainland'},
  {code:'MAN',name:'Manyara',        pop:'1.5M', jurisdiction:'mainland'},
  {code:'TAB',name:'Tabora',         pop:'2.3M', jurisdiction:'mainland'},
  {code:'KIG',name:'Kigoma',         pop:'2.1M', jurisdiction:'mainland'},
  {code:'RUK',name:'Rukwa',          pop:'1.0M', jurisdiction:'mainland'},
  {code:'RUV',name:'Ruvuma',         pop:'1.4M', jurisdiction:'mainland'},
  {code:'LIN',name:'Lindi',          pop:'0.9M', jurisdiction:'mainland'},
  {code:'MTW',name:'Mtwara',         pop:'1.3M', jurisdiction:'mainland'},
  {code:'PWA',name:'Pwani',          pop:'1.1M', jurisdiction:'mainland'},
  {code:'SIM',name:'Simiyu',         pop:'1.5M', jurisdiction:'mainland'},
  {code:'GET',name:'Geita',          pop:'1.7M', jurisdiction:'mainland'},
  {code:'NJO',name:'Njombe',         pop:'0.7M', jurisdiction:'mainland'},
  {code:'KAT',name:'Katavi',         pop:'0.5M', jurisdiction:'mainland'},
  {code:'SON',name:'Songwe',         pop:'0.9M', jurisdiction:'mainland'},
  {code:'SIN',name:'Singida',        pop:'1.3M', jurisdiction:'mainland'},
  {code:'ZAN',name:'Zanzibar North', pop:'0.6M', jurisdiction:'zanzibar'},
  {code:'ZAS',name:'Zanzibar South', pop:'0.4M', jurisdiction:'zanzibar'},
  {code:'ZAW',name:'Zanzibar West',  pop:'1.0M', jurisdiction:'zanzibar'},
  {code:'PEN',name:'Pemba North',    pop:'0.2M', jurisdiction:'zanzibar'},
  {code:'PES',name:'Pemba South',    pop:'0.2M', jurisdiction:'zanzibar'},
]

export default function AllRegionsModal({ onClose, t }) {
  const [search, setSearch] = useState('')
  const [juris,  setJuris]  = useState('all')

  const filtered = ALL_REGIONS.filter(r => {
    const mj = juris === 'all' || r.jurisdiction === juris
    const ms = r.name.toLowerCase().includes(search.toLowerCase()) ||
               r.code.toLowerCase().includes(search.toLowerCase())
    return mj && ms
  })

  const dark = t.cardBorder.includes('gray')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl z-10 flex flex-col
                      ${t.card} ${t.cardBorder}`} style={{ maxHeight:'85vh' }}>

        <div className={`flex items-center justify-between px-5 py-4 border-b ${t.border} shrink-0`}>
          <div>
            <p className={`font-bold text-sm ${t.text}`}>All Regions — Tanzania</p>
            <p className={`text-[10px] ${t.textSub}`}>{filtered.length} of {ALL_REGIONS.length} regions</p>
          </div>
          <button onClick={onClose}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.textDim} hover:text-red-400 hover:bg-red-500/10`}>
            <X size={15} />
          </button>
        </div>

        <div className={`px-5 py-3 border-b ${t.border} shrink-0 space-y-2`}>
          <div className="flex gap-2">
            {['all','mainland','zanzibar'].map(f => (
              <button key={f} onClick={() => setJuris(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all border
                                 ${juris===f ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]'
                                             : dark ? 'bg-gray-100 border-gray-300 text-gray-500'
                                                    : 'bg-white/5 border-[#1e2d45] text-gray-500 hover:text-gray-300'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
            <input type="text" placeholder="Search region name or code..." value={search}
                   onChange={e => setSearch(e.target.value)}
                   className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-xs rounded-lg pl-8 pr-4 py-2 outline-none focus:border-[#00d4ff]/40 placeholder-gray-500 transition-colors`} />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
          {filtered.length === 0
            ? <div className="text-center py-8"><p className={`text-sm ${t.textSub}`}>No regions found</p></div>
            : filtered.map(({ code, name, pop, jurisdiction }) => (
                <div key={code}
                     className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${t.rowHover}`}>
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0
                                  ${dark ? 'bg-gray-100 border-gray-300' : 'bg-[#1a2d4a] border-[#2a4060]'}`}>
                    <span className={`text-[9px] font-mono font-bold ${t.textDim}`}>{code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${t.text}`}>{name}</p>
                    <p className={`text-[10px] ${t.textSub} capitalize`}>{jurisdiction}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${t.text}`}>{pop}</p>
                    <span className="text-[9px] font-mono text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/20 px-1.5 py-0.5 rounded-full">LIVE</span>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}
