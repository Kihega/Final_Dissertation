import { useState, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import {
  Menu, X, Search, Bell, Settings, Sun, Moon, ChevronRight, ArrowUpRight, Plus,
  TrendingUp, Eye, CheckCircle2, RefreshCw, AlertTriangle, KeyRound,
  LogOut as LogOutLucide, Shield, ShieldCheck, ChevronDown, Lock, Mail, EyeOff,
  CheckCircle, AlertCircle, Download, Wifi, WifiOff, Activity, UserCheck,
  UserX, Clock, Database, Server, Cpu, HardDrive, Globe, FileText,
  ShieldAlert, MoreVertical, Trash2, Edit3, ChevronLeft, ChevronUp,
  Heart, Ambulance, Users, Ban, UserMinus
} from 'lucide-react'
import DashboardIcon          from '@mui/icons-material/Dashboard'
import AccountBalanceIcon     from '@mui/icons-material/AccountBalance'
import LocationOnIcon         from '@mui/icons-material/LocationOn'
import ManageAccountsIcon     from '@mui/icons-material/ManageAccounts'
import SpeedIcon              from '@mui/icons-material/Speed'
import ArticleIcon            from '@mui/icons-material/Article'
import GppBadIcon             from '@mui/icons-material/GppBad'
import LogoutIcon             from '@mui/icons-material/Logout'
import PublicIcon             from '@mui/icons-material/Public'
import LocationCityIcon       from '@mui/icons-material/LocationCity'
import Groups2Icon            from '@mui/icons-material/Groups2'
import SecurityIcon           from '@mui/icons-material/Security'
import MonitorHeartIcon       from '@mui/icons-material/MonitorHeart'
import HomeWorkIcon           from '@mui/icons-material/HomeWork'
import BadgeIcon              from '@mui/icons-material/Badge'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CorporateFareIcon      from '@mui/icons-material/CorporateFare'
import SchoolIcon             from '@mui/icons-material/School'
import LocalHospitalIcon      from '@mui/icons-material/LocalHospital'
import ElectricBoltIcon       from '@mui/icons-material/ElectricBolt'
import WaterIcon              from '@mui/icons-material/Water'
import RoadIcon               from '@mui/icons-material/Landscape'
import FavoriteIcon           from '@mui/icons-material/Favorite'
import TrendingUpIcon         from '@mui/icons-material/TrendingUp'
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation'
import MedicalServicesIcon    from '@mui/icons-material/MedicalServices'
import ChangeCircleIcon       from '@mui/icons-material/ChangeCircle'

import ChangePasswordModal  from './modals/ChangePasswordModal'
import NewRegistrationModal from './modals/NewRegistrationModal'
import AllRegionsModal      from './modals/AllRegionsModal'
import AllActionsModal      from './modals/AllActionsModal'
import { TZ_GEO, ALL_REGIONS, getDistricts, getVillages } from '/src/tanzania.js'

// ── PYRAMID DATA ─────────────────────────────────────────
const buildPyramid = (scale=1) => [
  {age:'75+',  male:Math.round(420 *scale),female:Math.round(580 *scale)},
  {age:'70-74',male:Math.round(580 *scale),female:Math.round(720 *scale)},
  {age:'65-69',male:Math.round(780 *scale),female:Math.round(920 *scale)},
  {age:'60-64',male:Math.round(1020*scale),female:Math.round(1180*scale)},
  {age:'55-59',male:Math.round(1380*scale),female:Math.round(1520*scale)},
  {age:'50-54',male:Math.round(1820*scale),female:Math.round(1960*scale)},
  {age:'45-49',male:Math.round(2240*scale),female:Math.round(2380*scale)},
  {age:'40-44',male:Math.round(2780*scale),female:Math.round(2920*scale)},
  {age:'35-39',male:Math.round(3420*scale),female:Math.round(3580*scale)},
  {age:'30-34',male:Math.round(4180*scale),female:Math.round(4320*scale)},
  {age:'25-29',male:Math.round(5020*scale),female:Math.round(5180*scale)},
  {age:'20-24',male:Math.round(5840*scale),female:Math.round(5960*scale)},
  {age:'15-19',male:Math.round(6420*scale),female:Math.round(6380*scale)},
  {age:'10-14',male:Math.round(6980*scale),female:Math.round(6820*scale)},
  {age:'5-9',  male:Math.round(7240*scale),female:Math.round(7060*scale)},
  {age:'0-4',  male:Math.round(7580*scale),female:Math.round(7320*scale)},
]
const pyramidData={national:buildPyramid(1),mainland:buildPyramid(0.915),zanzibar:buildPyramid(0.085)}
const filterMeta={
  national:{pop:'63,748,291',male:'49.2%',female:'50.8%'},
  mainland:{pop:'58,319,686',male:'49.1%',female:'50.9%'},
  zanzibar:{pop:'5,428,605', male:'49.4%',female:'50.6%'},
}

const allActions=[
  {icon:CheckCircle2,color:'text-[#00ff9d]',text:'District Admin #4412 (Mwanza) validated 1,200 records', time:'2026-05-12 14:22:01 EAT',status:'SUCCESS',sc:'text-[#00ff9d]'},
  {icon:RefreshCw,   color:'text-[#00d4ff]',text:'Cloud DB synchronization triggered by System Scheduler',time:'2026-05-12 14:15:44 EAT',status:'SYNCING',sc:'text-[#00d4ff]'},
  {icon:AlertTriangle,color:'text-red-400', text:'Multiple failed login attempts — Region: Kilimanjaro',  time:'2026-05-12 13:58:12 EAT',status:'BLOCKED',sc:'text-red-400' },
  {icon:CheckCircle2,color:'text-[#00ff9d]',text:'New District Admin registered — Singida District',      time:'2026-05-12 13:30:05 EAT',status:'SUCCESS',sc:'text-[#00ff9d]'},
  {icon:CheckCircle2,color:'text-[#00ff9d]',text:'Migration #MIG-2026-00431 confirmed — Dodoma to Dar',   time:'2026-05-12 12:47:33 EAT',status:'SUCCESS',sc:'text-[#00ff9d]'},
  {icon:AlertTriangle,color:'text-red-400', text:'Unauthorized API access attempt blocked — IP: 41.x.x.x',time:'2026-05-12 12:10:00 EAT',status:'BLOCKED',sc:'text-red-400' },
  {icon:CheckCircle2,color:'text-[#00ff9d]',text:'Village Officer #0891 (Dodoma) registered 340 citizens',time:'2026-05-12 11:55:22 EAT',status:'SUCCESS',sc:'text-[#00ff9d]'},
  {icon:RefreshCw,   color:'text-[#00d4ff]',text:'Population snapshot generated for all 31 regions',      time:'2026-05-12 11:30:00 EAT',status:'SYNCING',sc:'text-[#00d4ff]'},
  {icon:CheckCircle2,color:'text-[#00ff9d]',text:'Birth certificate #BIRTH-2026-07-00012345 issued',       time:'2026-05-12 10:45:10 EAT',status:'SUCCESS',sc:'text-[#00ff9d]'},
  {icon:CheckCircle2,color:'text-[#00ff9d]',text:'Death certificate #DEATH-2026-07-00008409 issued',       time:'2026-05-12 10:22:05 EAT',status:'SUCCESS',sc:'text-[#00ff9d]'},
]

const NAV=[
  {label:'Dashboard',           Icon:DashboardIcon},
  {label:'Demographics View',   Icon:PublicIcon},
  {label:'Infrastructure View', Icon:LocationCityIcon},
  {label:'District Admins',     Icon:AccountBalanceIcon},
  {label:'Village Officers',    Icon:LocationOnIcon},
  {label:'Health Officers',     Icon:LocalHospitalIcon},
  {label:'Manage Users',        Icon:ManageAccountsIcon},
  {label:'System Performance',  Icon:SpeedIcon},
  {label:'System Log Reports',  Icon:ArticleIcon},
  {label:'Security Alerts',     Icon:GppBadIcon},
  {label:'Migration Trends',    Icon:TrendingUpIcon},
  {label:'Marriage Issues',     Icon:FavoriteIcon},
  {label:'Health Trends',       Icon:MonitorHeartIcon},
]

const STATS=[
  {MuiIcon:Groups2Icon,       label:'Total Population',value:'63,748,291',badge:'+1,247 this week',bColor:'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20',line:'bg-[#00ff9d]',ibg:'bg-[#00ff9d]/10 text-[#00ff9d]'},
  {MuiIcon:AccountBalanceIcon,label:'District Admins', value:'184',       badge:'12 pending',      bColor:'text-blue-400 bg-blue-500/10 border-blue-500/20',   line:'bg-blue-400',  ibg:'bg-blue-500/10 text-blue-400'  },
  {MuiIcon:MonitorHeartIcon,  label:'System Health',   value:'99.9%',     badge:'DB + Redis OK',   bColor:'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20',line:'bg-[#00d4ff]', ibg:'bg-[#00d4ff]/10 text-[#00d4ff]'},
  {MuiIcon:SecurityIcon,      label:'Security Alerts', value:'02',        badge:'AUDIT LOGS',      bColor:'text-red-400 bg-red-500/10 border-red-500/20',       line:'bg-red-400',   ibg:'bg-red-500/10 text-red-400'    },
]

function getStrength(pwd){
  let s=0
  if(pwd.length>=8)s++;if(/[A-Z]/.test(pwd))s++;if(/[0-9]/.test(pwd))s++;if(/[^A-Za-z0-9]/.test(pwd))s++;if(pwd.length>=12)s++
  if(s<=1)return{label:'Weak',      color:'bg-red-500',   tc:'text-red-400',   w:'w-1/5'}
  if(s<=2)return{label:'Fair',      color:'bg-orange-400',tc:'text-orange-400',w:'w-2/5'}
  if(s<=3)return{label:'Good',      color:'bg-yellow-400',tc:'text-yellow-400',w:'w-3/5'}
  if(s<=4)return{label:'Strong',    color:'bg-[#00d4ff]', tc:'text-[#00d4ff]', w:'w-4/5'}
  return        {label:'Very Strong',color:'bg-[#00ff9d]',tc:'text-[#00ff9d]', w:'w-full'}
}

const PyramidTooltip=({active,payload,label})=>{
  if(!active||!payload?.length)return null
  return(<div className="bg-[#0a1628] border border-[#1a3060] rounded-lg p-3 text-xs shadow-xl">
    <p className="text-gray-400 font-mono mb-2">Age {label}</p>
    {payload.map((p,i)=><p key={i} style={{color:p.fill}} className="font-semibold">{p.name}: {Math.abs(p.value).toLocaleString()}K</p>)}
  </div>)
}

// ── GEO FILTER BAR (reusable) ─────────────────────────────
function GeoFilterBar({onFilterChange,darkMode,t,showScopeCards=true}){
  const [scope,setScope]=useState('national')
  const [region,setRegion]=useState('')
  const [district,setDistrict]=useState('')
  const [village,setVillage]=useState('')
  const [rSearch,setRSearch]=useState('')
  const [dSearch,setDSearch]=useState('')
  const [vSearch,setVSearch]=useState('')
  const [showRDD,setShowRDD]=useState(false)
  const [showDDD,setShowDDD]=useState(false)
  const [showVDD,setShowVDD]=useState(false)

  const scopeRegions=ALL_REGIONS.filter(r=>scope==='national'?true:r.jurisdiction===scope)
  const filteredR=scopeRegions.filter(r=>r.name.toLowerCase().includes(rSearch.toLowerCase())||r.code.toLowerCase().includes(rSearch.toLowerCase()))
  const availD=getDistricts(region)
  const filteredD=availD.filter(d=>d.toLowerCase().includes(dSearch.toLowerCase()))
  const availV=getVillages(region,district)
  const filteredV=availV.filter(v=>v.toLowerCase().includes(vSearch.toLowerCase()))

  const handleScope=(s)=>{setScope(s);setRegion('');setDistrict('');setVillage('');setRSearch('');setDSearch('');setVSearch('');onFilterChange?.({scope:s,region:'',district:'',village:''})}
  const selRegion=(r)=>{setRegion(r.name);setRSearch(r.name);setDistrict('');setVillage('');setDSearch('');setVSearch('');setShowRDD(false);onFilterChange?.({scope,region:r.name,district:'',village:''})}
  const selDistrict=(d)=>{setDistrict(d);setDSearch(d);setVillage('');setVSearch('');setShowDDD(false);onFilterChange?.({scope,region,district:d,village:''})}
  const selVillage=(v)=>{setVillage(v);setVSearch(v);setShowVDD(false);onFilterChange?.({scope,region,district,village:v})}
  const clear=()=>handleScope(scope)

  const SCOPES=[
    {key:'national',label:'National', pop:'63,748,291',color:'text-[#00d4ff]',ab:'border-[#00d4ff]/50',abg:'bg-[#00d4ff]/10'},
    {key:'mainland',label:'Mainland', pop:'58,319,686',color:'text-[#00ff9d]',ab:'border-[#00ff9d]/50',abg:'bg-[#00ff9d]/10'},
    {key:'zanzibar',label:'Zanzibar', pop:'5,428,605', color:'text-orange-400',ab:'border-orange-400/50',abg:'bg-orange-400/10'},
  ]
  const iBase=`w-full ${t.input} border ${t.cardBorder} ${t.text} text-xs rounded-lg px-3 py-2 outline-none focus:border-[#00d4ff]/40 placeholder-gray-600 transition-colors`

  return(
    <div className="space-y-3 mb-5">
      {showScopeCards&&(
        <div className="grid grid-cols-3 gap-3">
          {SCOPES.map(({key,label,pop,color,ab,abg})=>(
            <button key={key} onClick={()=>handleScope(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${scope===key?`${abg} ${ab}`:`${t.cardBorder} hover:border-[#2a4060]`}`}>
              <p className={`text-[9px] font-bold uppercase tracking-widest ${scope===key?color:t.textDim}`}>{label}</p>
              <p className={`text-base font-extrabold mt-0.5 ${scope===key?color:t.textSub}`}>{pop}</p>
              <p className={`text-[8px] mt-0.5 ${t.textDim}`}>Total Population</p>
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {/* Region */}
        <div className="relative">
          <p className={`text-[9px] uppercase tracking-widest mb-1 ${t.textDim}`}>{region?`Region: ${region}`:'Filter by Region'}</p>
          <input value={rSearch} onChange={e=>{setRSearch(e.target.value);setShowRDD(true)}} onFocus={()=>setShowRDD(true)} placeholder="Search region..." className={iBase}/>
          {showRDD&&rSearch&&(
            <div className={`absolute top-full mt-1 left-0 right-0 z-30 rounded-lg border shadow-xl max-h-44 overflow-y-auto ${t.card} ${t.cardBorder}`}>
              {filteredR.length===0?<p className={`px-3 py-2 text-xs ${t.textDim}`}>No regions found</p>
               :filteredR.map(r=><button key={r.code} onClick={()=>selRegion(r)} className={`w-full text-left px-3 py-2 text-xs ${t.text} hover:bg-[#1a3060] hover:text-white`}>{r.name}<span className={`ml-2 text-[9px] ${t.textDim}`}>{r.pop}</span></button>)}
            </div>
          )}
        </div>
        {/* District */}
        <div className="relative">
          <p className={`text-[9px] uppercase tracking-widest mb-1 ${t.textDim}`}>{district?`District: ${district}`:'Filter by District'}</p>
          <input value={dSearch} onChange={e=>{setDSearch(e.target.value);setShowDDD(true)}} onFocus={()=>setShowDDD(true)} disabled={!region} placeholder={region?'Search district...':'Select region first'} className={`${iBase} disabled:opacity-40`}/>
          {showDDD&&dSearch&&region&&(
            <div className={`absolute top-full mt-1 left-0 right-0 z-30 rounded-lg border shadow-xl max-h-44 overflow-y-auto ${t.card} ${t.cardBorder}`}>
              {filteredD.length===0?<p className={`px-3 py-2 text-xs ${t.textDim}`}>No districts found</p>
               :filteredD.map(d=><button key={d} onClick={()=>selDistrict(d)} className={`w-full text-left px-3 py-2 text-xs ${t.text} hover:bg-[#1a3060] hover:text-white`}>{d}</button>)}
            </div>
          )}
        </div>
        {/* Village */}
        <div className="relative">
          <p className={`text-[9px] uppercase tracking-widest mb-1 ${t.textDim}`}>{village?`Village: ${village}`:'Filter by Village'}</p>
          <input value={vSearch} onChange={e=>{setVSearch(e.target.value);setShowVDD(true)}} onFocus={()=>setShowVDD(true)} disabled={!district} placeholder={district?'Search village...':'Select district first'} className={`${iBase} disabled:opacity-40`}/>
          {showVDD&&vSearch&&district&&(
            <div className={`absolute top-full mt-1 left-0 right-0 z-30 rounded-lg border shadow-xl max-h-44 overflow-y-auto ${t.card} ${t.cardBorder}`}>
              {filteredV.length===0?<p className={`px-3 py-2 text-xs ${t.textDim}`}>No villages found</p>
               :filteredV.map(v=><button key={v} onClick={()=>selVillage(v)} className={`w-full text-left px-3 py-2 text-xs ${t.text} hover:bg-[#1a3060] hover:text-white`}>{v}</button>)}
            </div>
          )}
        </div>
      </div>
      {(region||district||village)&&(
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] ${t.textDim}`}>Showing:</span>
          {region&&<span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20">{region}</span>}
          {district&&<><span className={`text-[9px] ${t.textDim}`}>›</span><span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20">{district}</span></>}
          {village&&<><span className={`text-[9px] ${t.textDim}`}>›</span><span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-orange-400/10 text-orange-400 border border-orange-400/20">{village}</span></>}
          <button onClick={clear} className="text-[9px] text-red-400 hover:underline ml-1">Clear ×</button>
        </div>
      )}
    </div>
  )
}

// ── WARNING POPUP (reusable) ──────────────────────────────
function WarningPopup({type,user,onConfirm,onCancel,t}){
  const isSuspend=type==='suspend'
  return(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel}/>
      <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl z-10 p-6 ${t.card} ${isSuspend?'border-yellow-400/30':'border-red-400/30'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isSuspend?'bg-yellow-400/10 border border-yellow-400/30':'bg-red-500/10 border border-red-500/30'}`}>
          {isSuspend?<Ban size={22} className="text-yellow-400"/>:<Trash2 size={22} className="text-red-400"/>}
        </div>
        <p className={`font-bold text-base text-center mb-2 ${t.text}`}>{isSuspend?'Suspend User?':'Delete User?'}</p>
        <p className={`text-xs text-center ${t.textSub} mb-1`}>{isSuspend?'This will pause access for:':'This will permanently remove:'}</p>
        <p className={`text-xs text-center font-semibold ${t.text} mb-4`}>{user?.name}</p>
        {isSuspend&&<p className={`text-[10px] text-center ${t.textDim} mb-4`}>User can be reinstated later from this panel.</p>}
        {!isSuspend&&<p className="text-[10px] text-center text-red-400 mb-4">This action cannot be undone.</p>}
        <div className="flex gap-3">
          <button onClick={onCancel} className={`flex-1 py-2.5 rounded-lg text-xs border ${t.cardBorder} ${t.textSub} hover:border-gray-400 transition-all`}>Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${isSuspend?'bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20':'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'}`}>
            {isSuspend?'Confirm Suspend':'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DASHBOARD CONTENT ────────────────────────────────────
function DashboardContent({darkMode,t,onNewReg}){
  const [pFilter,setPFilter]=useState('national')
  const [showRegions,setShowRegions]=useState(false)
  const [showActions,setShowActions]=useState(false)
  const meta=filterMeta[pFilter]
  const rawData=pyramidData[pFilter]
  const chartData=rawData.map(d=>({age:d.age,male:-d.male,female:d.female}))
  return(
    <div className="space-y-5">
      {showRegions&&<AllRegionsModal onClose={()=>setShowRegions(false)} darkMode={darkMode} t={t}/>}
      {showActions&&<AllActionsModal onClose={()=>setShowActions(false)} darkMode={darkMode} t={t}/>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Dashboard Overview</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>NBS National Intelligence Command Center</p></div>
        <div className="flex gap-2 flex-wrap">
          <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${darkMode?'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200':'bg-[#111827] border-[#1e2d45] text-gray-400 hover:text-white hover:border-[#2a4060]'}`}><ArrowUpRight size={13}/>Export Report</button>
          <button onClick={onNewReg} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all text-xs font-medium"><Plus size={13}/>New Registration</button>
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {STATS.map(({MuiIcon,label,value,badge,bColor,line,ibg})=>(
          <div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4 hover:shadow-lg transition-all`}>
            <div className="flex items-start justify-between mb-4"><div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ibg}`}><MuiIcon sx={{fontSize:18}}/></div><span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${bColor}`}>{badge}</span></div>
            <p className={`text-[10px] font-mono tracking-widest uppercase mb-1 ${t.textDim}`}>{label}</p>
            <p className={`font-bold text-xl sm:text-2xl ${t.text}`}>{value}</p>
            <div className={`mt-3 h-0.5 rounded-full ${line}`}/>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`xl:col-span-2 ${t.card} border ${t.cardBorder} rounded-xl p-4 sm:p-5`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
            <div><h2 className={`font-bold text-sm ${t.text}`}>Population Growth Trend</h2><p className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>NATIONAL LIVE CENSUS DATA</p></div>
            <div className="flex gap-1.5 shrink-0">
              {['national','mainland','zanzibar'].map(f=>(
                <button key={f} onClick={()=>setPFilter(f)} className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${pFilter===f?'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]':darkMode?'bg-gray-100 border-gray-300 text-gray-500':'bg-white/5 border-[#1e2d45] text-gray-500 hover:text-gray-300'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className={`flex gap-5 mb-3 pb-3 border-b ${t.border}`}>
            <div><p className={`text-[9px] font-mono ${t.textSub}`}>TOTAL</p><p className={`font-bold text-base ${t.text}`}>{meta.pop}</p></div>
            <div><p className="text-[#00d4ff] text-[9px] font-mono">MALE</p><p className="text-[#00d4ff] font-bold text-base">{meta.male}</p></div>
            <div><p className="text-[#ff6b9d] text-[9px] font-mono">FEMALE</p><p className="text-[#ff6b9d] font-bold text-base">{meta.female}</p></div>
          </div>
          <div className="flex gap-5 mb-2">
            <div className="flex items-center gap-1.5 text-[10px] text-[#00d4ff]"><div className="w-3 h-2 rounded-sm bg-[#00d4ff]/70"/>Male ←</div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#ff6b9d]">→ Female<div className="w-3 h-2 rounded-sm bg-[#ff6b9d]/70"/></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{top:0,right:10,left:32,bottom:0}} barCategoryGap="8%">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode?'#e5e7eb':'#1e2d45'} horizontal={false}/>
              <XAxis type="number" tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:9,fontFamily:'monospace'}} axisLine={false} tickLine={false} tickFormatter={v=>`${Math.abs(v)}K`}/>
              <YAxis type="category" dataKey="age" tick={{fill:darkMode?'#9ca3af':'#6b7280',fontSize:9,fontFamily:'monospace'}} axisLine={false} tickLine={false} width={32}/>
              <Tooltip content={<PyramidTooltip/>}/>
              <Bar dataKey="male" name="Male" radius={[0,2,2,0]}>{chartData.map((_,i)=><Cell key={i} fill="#00d4ff" fillOpacity={0.75}/>)}</Bar>
              <Bar dataKey="female" name="Female" radius={[2,0,0,2]}>{chartData.map((_,i)=><Cell key={i} fill="#ff6b9d" fillOpacity={0.75}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold text-sm ${t.text}`}>Regional Connectivity</h3>
              <button onClick={()=>setShowRegions(true)} className="text-[#00d4ff] text-[10px] font-mono hover:underline flex items-center gap-1"><Eye size={10}/>VIEW ALL</button>
            </div>
            <div className="space-y-2">
              {ALL_REGIONS.slice(0,5).map(({code,name,pop})=>(
                <div key={code} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${t.rowHover}`}>
                  <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${darkMode?'bg-gray-100 border-gray-300':'bg-[#1a2d4a] border-[#2a4060]'}`}><BadgeIcon sx={{fontSize:13,color:'#6b7280'}}/></div>
                  <div className="flex-1 min-w-0"><p className={`text-xs font-medium truncate ${t.text}`}>{name}</p><p className={`text-[10px] ${t.textSub}`}>{pop}</p></div>
                  <span className="text-[9px] font-mono text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/20 px-1.5 py-0.5 rounded-full shrink-0">LIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4 sm:p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-sm ${t.text}`}>Recent Administrative Actions</h3>
          <div className="flex items-center gap-3"><span className={`text-[10px] font-mono ${t.textSub}`}>LAST 24 HOURS</span><button onClick={()=>setShowActions(true)} className="text-[#00d4ff] text-[10px] font-mono hover:underline flex items-center gap-1"><Eye size={10}/>VIEW ALL</button></div>
        </div>
        <div className="space-y-2">
          {allActions.slice(0,5).map((a,i)=>(
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${t.rowHover}`}>
              <a.icon size={13} className={`shrink-0 ${a.color}`}/>
              <div className="flex-1 min-w-0"><p className={`text-xs truncate ${t.text}`}>{a.text}</p><p className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>{a.time}</p></div>
              <span className={`text-[9px] font-mono font-bold shrink-0 hidden sm:block ${a.sc}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── DEMOGRAPHICS CONTENT ─────────────────────────────────
function DemographicsContent({darkMode,t}){
  const [pFilter,setPFilter]=useState('national')
  const [activeFilter,setActiveFilter]=useState({scope:'national',region:'',district:'',village:''})
  const meta=filterMeta[pFilter]
  const rawData=pyramidData[pFilter]
  const chartData=rawData.map(d=>({age:d.age,male:-d.male,female:d.female}))
  const scopeLabel=activeFilter.village||activeFilter.district||activeFilter.region||activeFilter.scope

  // Cards update based on filter scope
  const scopeMult={national:1,mainland:0.915,zanzibar:0.085}
  const m=scopeMult[activeFilter.scope]||1
  const DCARDS=[
    {label:'Total Population',  value:Math.round(63748291*m).toLocaleString(), sub:'Status: Alive only',    color:'text-[#00ff9d]',bg:'bg-[#00ff9d]/10 border-[#00ff9d]/20'},
    {label:'Male Population',   value:Math.round(31364159*m).toLocaleString(), sub:'49.2% of total',        color:'text-[#00d4ff]',bg:'bg-[#00d4ff]/10 border-[#00d4ff]/20'},
    {label:'Female Population', value:Math.round(32384132*m).toLocaleString(), sub:'50.8% of total',        color:'text-[#ff6b9d]',bg:'bg-[#ff6b9d]/10 border-[#ff6b9d]/20'},
  ]
  const EMPLOYMENT=[
    {label:'Government Employees',note:'Teachers, Doctors, Officers',pct:18.4,color:'bg-[#00d4ff]',text:'text-[#00d4ff]'},
    {label:'Self Employed',        note:'Farmers, Business, Traders', pct:47.2,color:'bg-[#00ff9d]',text:'text-[#00ff9d]'},
    {label:'Others',               note:'Private Sector, NGO, etc.',  pct:34.4,color:'bg-orange-400',text:'text-orange-400'},
  ]
  const EDUCATION=[
    {level:'No Education',pct:18},{level:'Primary',pct:35},{level:'O-Level',pct:22},
    {level:'A-Level',pct:8},{level:'Certificate',pct:5},{level:'Diploma',pct:5},
    {level:"Bachelor's",pct:4},{level:"Master's+",pct:2},{level:'VETA / Other',pct:1},
  ]
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Demographics View</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>Showing: <span className="text-[#00d4ff] font-mono capitalize">{scopeLabel}</span></p></div>
      <GeoFilterBar onFilterChange={f=>{setActiveFilter(f);setPFilter(f.scope)}} darkMode={darkMode} t={t}/>
      <div className="grid grid-cols-3 gap-3">
        {DCARDS.map(({label,value,sub,color,bg})=>(
          <div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4 hover:shadow-lg transition-all`}>
            <p className={`text-[10px] font-mono tracking-widest uppercase mb-2 ${t.textDim}`}>{label}</p>
            <p className={`font-bold text-lg sm:text-xl mb-1 ${t.text}`}>{value}</p>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${color} ${bg}`}>{sub}</span>
          </div>
        ))}
      </div>
      {/* Employment Status Card */}
      <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><span className="text-xs">💼</span></div>
          <div><p className={`text-xs font-bold ${t.text}`}>Employment Status</p><p className={`text-[9px] ${t.textDim}`}>Primary Activity · {scopeLabel} estimate</p></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {EMPLOYMENT.map(({label,note,pct,color,text})=>(
            <div key={label}>
              <div className="flex items-start justify-between mb-1">
                <div><p className={`text-xs font-semibold ${t.text}`}>{label}</p><p className={`text-[9px] ${t.textDim}`}>{note}</p></div>
                <span className={`text-sm font-bold shrink-0 ml-2 ${text}`}>{pct}%</span>
              </div>
              <div className={`h-1.5 rounded-full ${darkMode?'bg-gray-200':'bg-[#1e2d45]'}`}>
                <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{width:`${pct}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div><h2 className={`font-bold text-sm ${t.text}`}>Population Pyramid</h2><p className={`text-[10px] font-mono ${t.textSub}`}>{scopeLabel}</p></div>
            <div className="flex gap-1.5">
              {['national','mainland','zanzibar'].map(f=>(
                <button key={f} onClick={()=>setPFilter(f)} className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold transition-all border ${pFilter===f?'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]':darkMode?'bg-gray-100 border-gray-300 text-gray-500':'bg-white/5 border-[#1e2d45] text-gray-500'}`}>{f==='national'?'NAT':f==='mainland'?'MAIN':'ZAN'}</button>
              ))}
            </div>
          </div>
          <div className={`flex gap-4 mb-3 pb-2 border-b ${t.border}`}>
            <div><p className={`text-[9px] font-mono ${t.textSub}`}>TOTAL</p><p className={`font-bold text-sm ${t.text}`}>{meta.pop}</p></div>
            <div><p className="text-[#00d4ff] text-[9px] font-mono">MALE</p><p className="text-[#00d4ff] font-bold text-sm">{meta.male}</p></div>
            <div><p className="text-[#ff6b9d] text-[9px] font-mono">FEMALE</p><p className="text-[#ff6b9d] font-bold text-sm">{meta.female}</p></div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{top:0,right:10,left:32,bottom:0}} barCategoryGap="8%">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode?'#e5e7eb':'#1e2d45'} horizontal={false}/>
              <XAxis type="number" tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:9,fontFamily:'monospace'}} axisLine={false} tickLine={false} tickFormatter={v=>`${Math.abs(v)}K`}/>
              <YAxis type="category" dataKey="age" tick={{fill:darkMode?'#9ca3af':'#6b7280',fontSize:9,fontFamily:'monospace'}} axisLine={false} tickLine={false} width={32}/>
              <Tooltip content={<PyramidTooltip/>}/>
              <Bar dataKey="male" name="Male" radius={[0,2,2,0]}>{chartData.map((_,i)=><Cell key={i} fill="#00d4ff" fillOpacity={0.75}/>)}</Bar>
              <Bar dataKey="female" name="Female" radius={[2,0,0,2]}>{chartData.map((_,i)=><Cell key={i} fill="#ff6b9d" fillOpacity={0.75}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
          <h2 className={`font-bold text-sm mb-1 ${t.text}`}>Education Distribution</h2>
          <p className={`text-[10px] font-mono mb-3 ${t.textSub}`}>% of registered citizens</p>
          <div className="space-y-2">
            {EDUCATION.map(({level,pct})=>(
              <div key={level}>
                <div className="flex justify-between mb-0.5"><p className={`text-[10px] ${t.text}`}>{level}</p><p className={`text-[10px] font-mono font-bold ${t.text}`}>{pct}%</p></div>
                <div className={`h-1.5 rounded-full ${darkMode?'bg-gray-200':'bg-[#1e2d45]'}`}><div className="h-1.5 rounded-full bg-[#00d4ff] transition-all" style={{width:`${pct*2.5}%`,opacity:0.4+(pct/100)}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── INFRASTRUCTURE CONTENT ───────────────────────────────
function InfrastructureContent({darkMode,t}){
  const [activeFilter,setActiveFilter]=useState({scope:'national',region:'',district:'',village:''})
  const [search,setSearch]=useState('')
  const [page,setPage]=useState(0)
  const PER_PAGE=8
  // Infrastructure grouped categories
  const INFRA_GROUPS=[
    {
      title:'Housing & Households',icon:'🏠',
      items:[
        {label:'Total Households',  value:'12,400,000', sub:'Registered units',      color:'text-[#00ff9d]',  pct:61},
        {label:'Urban Households',  value:'5,890,000',  sub:'47.5% of total',        color:'text-[#00d4ff]',  pct:48},
        {label:'Rural Households',  value:'6,510,000',  sub:'52.5% of total',        color:'text-orange-400', pct:52},
      ]
    },
    {
      title:'Business & Commerce',icon:'🏢',
      items:[
        {label:'Registered Businesses',value:'1,240,000',sub:'All sectors',           color:'text-purple-400', pct:55},
        {label:'Formal Sector',         value:'340,000',  sub:'27.4% of businesses',  color:'text-[#00d4ff]',  pct:27},
        {label:'Informal Sector',       value:'900,000',  sub:'72.6% of businesses',  color:'text-yellow-400', pct:73},
      ]
    },
    {
      title:'Transport Infrastructure',icon:'✈️',
      items:[
        {label:'Airports',            value:'28',        sub:'International & Domestic',color:'text-[#00d4ff]', pct:80},
        {label:'Shipping Ports',      value:'9',         sub:'Major seaports & lake',   color:'text-blue-400',  pct:70},
        {label:'Bus Terminals',       value:'312',       sub:'Registered terminals',     color:'text-orange-400',pct:65},
        {label:'Tarmac Roads',        value:'14,813 km', sub:'Paved national roads',     color:'text-[#00ff9d]', pct:35},
        {label:'Rough Roads',         value:'71,659 km', sub:'Unpaved / feeder roads',   color:'text-yellow-400',pct:65},
        {label:'Railway (SGR)',        value:'2,561 km',  sub:'Standard Gauge Railway',   color:'text-purple-400',pct:45},
        {label:'Railway (Normal)',     value:'3,687 km',  sub:'Conventional railway',     color:'text-gray-400',  pct:55},
        {label:'Sports Facilities',   value:'1,840',     sub:'Stadiums & grounds',        color:'text-red-400',   pct:40},
      ]
    },
    {
      title:'Education Facilities',icon:'🎓',
      items:[
        {label:'Primary Schools',    value:'17,700',  sub:'Public & Private',       color:'text-blue-400',   pct:72},
        {label:'Secondary Schools',  value:'5,143',   sub:'Ordinary & Advanced',    color:'text-[#00d4ff]',  pct:65},
        {label:'Colleges',           value:'312',     sub:'Technical & Vocational', color:'text-[#00ff9d]',  pct:48},
        {label:'Universities',       value:'68',      sub:'Public & Private',       color:'text-purple-400', pct:55},
        {label:'Training Centres',   value:'892',     sub:'VETA & Skills centres',  color:'text-yellow-400', pct:42},
      ]
    },
    {
      title:'Health Facilities',icon:'🏥',
      items:[
        {label:'Hospitals',          value:'320',     sub:'Referral & Regional',    color:'text-red-400',    pct:58},
        {label:'Health Centres',     value:'1,544',   sub:'Government & Private',   color:'text-orange-400', pct:62},
        {label:'Dispensaries',       value:'6,568',   sub:'Primary care units',     color:'text-yellow-400', pct:70},
      ]
    },
    {
      title:'Religious & Industry',icon:'⛪',
      items:[
        {label:'Religious Facilities',  value:'84,200',  sub:'Churches, Mosques, Temples',color:'text-[#00d4ff]', pct:80},
        {label:'Manufacturing Industries',value:'12,400', sub:'Registered factories',       color:'text-purple-400',pct:45},
        {label:'Processing Industries',   value:'8,910',  sub:'Agro & food processing',     color:'text-orange-400',pct:38},
      ]
    },
  ]
  const REGIONS_INFRA=ALL_REGIONS.map((r,i)=>({...r,schools:Math.floor(200+i*180),hospitals:Math.floor(30+i*25),electricity:Math.floor(45+i*6),water:Math.floor(55+i*5),entries:Math.floor(1200+i*430)}))
  const filtered=REGIONS_INFRA.filter(r=>{
    const mj=activeFilter.scope==='national'||r.jurisdiction===activeFilter.scope
    const ms=r.name.toLowerCase().includes(search.toLowerCase())
    return mj&&ms
  })
  const paged=filtered.slice(page*PER_PAGE,(page+1)*PER_PAGE)
  const totalPages=Math.ceil(filtered.length/PER_PAGE)
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Infrastructure View</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>National infrastructure coverage & facility mapping</p></div>
      <GeoFilterBar onFilterChange={setActiveFilter} darkMode={darkMode} t={t}/>
      {/* Infrastructure category groups */}
      <div className="space-y-4">
        {INFRA_GROUPS.map(({title,icon,items})=>(
          <div key={title} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{icon}</span>
              <p className={`font-bold text-sm ${t.text}`}>{title}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map(({label,value,sub,color,pct})=>(
                <div key={label} className={`${darkMode?'bg-gray-50':'bg-[#0d1526]'} border ${t.cardBorder} rounded-lg p-3 hover:shadow-md transition-all`}>
                  <p className={`text-[9px] font-mono tracking-widest uppercase mb-1 ${t.textDim}`}>{label}</p>
                  <p className={`font-bold text-base ${t.text} mb-0.5`}>{value}</p>
                  <p className={`text-[9px] ${t.textSub} mb-2`}>{sub}</p>
                  <div className={`h-1 rounded-full ${darkMode?'bg-gray-200':'bg-[#1e2d45]'}`}>
                    <div className={`h-1 rounded-full transition-all ${color.replace('text-','bg-')}`} style={{width:`${pct}%`,opacity:0.75}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${t.border}`}>
          <div><p className={`font-bold text-sm ${t.text}`}>Regional Infrastructure Breakdown</p><p className={`text-[10px] ${t.textSub}`}>Showing {paged.length} of {filtered.length} regions</p></div>
          <div className="flex items-center gap-2">
            <div className="relative"><Search size={12} className={`absolute left-2 top-1/2 -translate-y-1/2 ${t.textDim}`}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Search region..." className={`${t.input} border ${t.cardBorder} ${t.text} text-xs rounded-lg pl-7 pr-3 py-1.5 outline-none focus:border-[#00d4ff]/40`}/></div>
            <button className="text-[#00d4ff] text-[10px] font-mono hover:underline flex items-center gap-1"><Download size={10}/>Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className={`border-b ${t.border}`}>{['Region','Pop.','Schools','Hospitals','Electricity%','Water%','Entries'].map(h=><th key={h} className={`px-4 py-3 text-left text-[9px] font-mono uppercase tracking-widest ${t.textDim}`}>{h}</th>)}</tr></thead>
            <tbody>
              {paged.map((r,i)=>(
                <tr key={r.code} className={`border-b ${t.border} transition-all ${t.rowHover}`}>
                  <td className={`px-4 py-3 font-semibold ${t.text}`}>{r.name}</td>
                  <td className={`px-4 py-3 font-mono ${t.textSub}`}>{r.pop}</td>
                  <td className="px-4 py-3 text-blue-400 font-mono">{r.schools.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-400 font-mono">{r.hospitals}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`flex-1 h-1 rounded-full ${darkMode?'bg-gray-200':'bg-[#1e2d45]'}`}><div className="h-1 rounded-full bg-yellow-400" style={{width:`${r.electricity}%`}}/></div><span className={`text-[9px] font-mono ${t.textSub}`}>{r.electricity}%</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`flex-1 h-1 rounded-full ${darkMode?'bg-gray-200':'bg-[#1e2d45]'}`}><div className="h-1 rounded-full bg-[#00d4ff]" style={{width:`${r.water}%`}}/></div><span className={`text-[9px] font-mono ${t.textSub}`}>{r.water}%</span></div></td>
                  <td className={`px-4 py-3 text-[#00ff9d] font-mono text-[10px]`}>{page*PER_PAGE+i+1} of {r.entries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`px-5 py-3 border-t ${t.border} flex items-center justify-between`}>
          <span className={`text-[10px] font-mono ${t.textDim}`}>Page {page+1} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronLeft size={12}/></button>
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronRight size={12}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DISTRICT ADMINS CONTENT ──────────────────────────────
function DistrictAdminsContent({darkMode,t,onNewReg}){
  const [search,setSearch]=useState('')
  const [page,setPage]=useState(0)
  const PER_PAGE=5
  const ADMINS=[
    {id:'DA-001',name:'John Jovith Amsterdam',region:'Dar es Salaam',district:'Ilala',    status:'ACTIVE',   joined:'2025-01-15',mfa:true },
    {id:'DA-002',name:'Amina Said Mwinyi',    region:'Iringa',       district:'Mufindi',  status:'ACTIVE',   joined:'2025-02-08',mfa:false},
    {id:'DA-003',name:'Emmanuel Kihega Alpha',region:'Mbeya',        district:'Chunya',   status:'PENDING',  joined:'2026-04-20',mfa:false},
    {id:'DA-004',name:'Grace Haule Mbwana',   region:'Mwanza',       district:'Ilemela',  status:'ACTIVE',   joined:'2025-03-11',mfa:true },
    {id:'DA-005',name:'Peter Nduguru Swai',   region:'Arusha',       district:'Meru',     status:'SUSPENDED',joined:'2024-11-01',mfa:false},
    {id:'DA-006',name:'Rehema Juma Salim',    region:'Dodoma',       district:'Bahi',     status:'ACTIVE',   joined:'2025-06-20',mfa:true },
    {id:'DA-007',name:'Hamisi Mtoro Bakari',  region:'Tanga',        district:'Korogwe',  status:'ACTIVE',   joined:'2025-08-01',mfa:false},
  ]
  const filtered=ADMINS.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||a.district.toLowerCase().includes(search.toLowerCase())||a.region.toLowerCase().includes(search.toLowerCase()))
  const paged=filtered.slice(page*PER_PAGE,(page+1)*PER_PAGE)
  const totalPages=Math.ceil(filtered.length/PER_PAGE)
  const statusColor={ACTIVE:'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20',PENDING:'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',SUSPENDED:'text-red-400 bg-red-400/10 border-red-400/20'}
  return(
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>District Admins</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>{filtered.length} administrators registered</p></div>
        <button onClick={onNewReg} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all text-xs font-medium w-fit"><Plus size={13}/>Register Admin</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{label:'Total Admins',value:'184',color:'text-[#00d4ff]'},{label:'Active',value:'171',color:'text-[#00ff9d]'},{label:'Pending',value:'13',color:'text-yellow-400'}].map(({label,value,color})=>(
          <div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}><p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{label}</p><p className={`text-2xl font-extrabold ${color}`}>{value}</p></div>
        ))}
      </div>
      <div className="relative"><Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Search by name, district or region..." className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#00d4ff]/40 placeholder-gray-500`}/></div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${t.border} flex items-center justify-between`}>
          <span className={`text-[10px] font-mono ${t.textDim}`}>Entries {page*PER_PAGE+1}–{Math.min((page+1)*PER_PAGE,filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronLeft size={12}/></button>
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronRight size={12}/></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className={`border-b ${t.border}`}>{['ID','Name','Region','District','Status','MFA','Joined'].map(h=><th key={h} className={`px-4 py-3 text-left text-[9px] font-mono uppercase tracking-widest ${t.textDim}`}>{h}</th>)}</tr></thead>
            <tbody>
              {paged.map(a=>(
                <tr key={a.id} className={`border-b ${t.border} ${t.rowHover} transition-all`}>
                  <td className={`px-4 py-3 font-mono text-[10px] ${t.textDim}`}>{a.id}</td>
                  <td className={`px-4 py-3 font-semibold ${t.text}`}>{a.name}</td>
                  <td className={`px-4 py-3 ${t.textSub}`}>{a.region}</td>
                  <td className={`px-4 py-3 ${t.textSub}`}>{a.district}</td>
                  <td className="px-4 py-3"><span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${statusColor[a.status]}`}>{a.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-[9px] font-mono ${a.mfa?'text-[#00ff9d]':'text-gray-500'}`}>{a.mfa?'ON':'OFF'}</span></td>
                  <td className={`px-4 py-3 font-mono text-[10px] ${t.textSub}`}>{a.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── VILLAGE OFFICERS CONTENT ─────────────────────────────
function VillageOfficersContent({darkMode,t}){
  const [search,setSearch]=useState('')
  const [page,setPage]=useState(0)
  const PER_PAGE=5
  const OFFICERS=[
    {id:'VO-0891',name:'Juma Mwanga Salehe',  region:'Dodoma',       district:'Chamwino',   village:'Nzuguni',   status:'ACTIVE', offline:false,records:1240},
    {id:'VO-0892',name:'Neema Fumo Chande',   region:'Dar es Salaam',district:'Temeke',     village:'Keko',      status:'ACTIVE', offline:false,records:3418},
    {id:'VO-0893',name:'Hassan Mtoro Bakari', region:'Mwanza',       district:'Ilemela',    village:'Igogo',     status:'ACTIVE', offline:false,records:892 },
    {id:'VO-0894',name:'Upendo Ngowi Mbise',  region:'Kilimanjaro',  district:'Moshi Urban',village:'Karanga',   status:'PENDING',offline:true, records:0   },
    {id:'VO-0895',name:'Rashidi Tito Hamisi', region:'Arusha',       district:'Arusha City',village:'Ngarenaro', status:'ACTIVE', offline:false,records:2110},
    {id:'VO-0896',name:'Miriam Ally Chuma',   region:'Tanga',        district:'Tanga City', village:'Chumbageni',status:'ACTIVE', offline:true, records:567 },
    {id:'VO-0897',name:'Salim Otieno Boaz',   region:'Kagera',       district:'Bukoba Urban',village:'Ndama',    status:'ACTIVE', offline:false,records:1830},
  ]
  const filtered=OFFICERS.filter(o=>o.name.toLowerCase().includes(search.toLowerCase())||o.village.toLowerCase().includes(search.toLowerCase())||o.district.toLowerCase().includes(search.toLowerCase()))
  const paged=filtered.slice(page*PER_PAGE,(page+1)*PER_PAGE)
  const totalPages=Math.ceil(filtered.length/PER_PAGE)
  const offlineCount=OFFICERS.filter(o=>o.offline).length
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Village Officers</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>{filtered.length} village-level officers</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[
          {label:'Total Officers',value:'2,847',color:'text-[#00d4ff]'},
          {label:'Active',        value:'2,791',color:'text-[#00ff9d]'},
          {label:'Offline',       value:offlineCount.toString(),color:'text-orange-400'},
        ].map(({label,value,color})=>(
          <div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}><p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{label}</p><p className={`text-2xl font-extrabold ${color}`}>{value}</p></div>
        ))}
      </div>
      <div className="relative"><Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Search by name, village or district..." className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#00d4ff]/40 placeholder-gray-500`}/></div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${t.border} flex items-center justify-between`}>
          <span className={`text-[10px] font-mono ${t.textDim}`}>Entries {page*PER_PAGE+1}–{Math.min((page+1)*PER_PAGE,filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronLeft size={12}/></button>
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronRight size={12}/></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className={`border-b ${t.border}`}>{['Officer ID','Name','Region','District','Village','Offline','Status','Records'].map(h=><th key={h} className={`px-4 py-3 text-left text-[9px] font-mono uppercase tracking-widest ${t.textDim}`}>{h}</th>)}</tr></thead>
            <tbody>
              {paged.map(o=>(
                <tr key={o.id} className={`border-b ${t.border} ${t.rowHover} transition-all`}>
                  <td className={`px-4 py-3 font-mono text-[10px] ${t.textDim}`}>{o.id}</td>
                  <td className={`px-4 py-3 font-semibold ${t.text}`}>{o.name}</td>
                  <td className={`px-4 py-3 ${t.textSub}`}>{o.region}</td>
                  <td className={`px-4 py-3 ${t.textSub}`}>{o.district}</td>
                  <td className="px-4 py-3 text-[#00d4ff] font-mono">{o.village}</td>
                  <td className="px-4 py-3">
                    {o.offline
                      ?<span className="flex items-center gap-1 text-[9px] text-orange-400"><WifiOff size={10}/>YES</span>
                      :<span className="flex items-center gap-1 text-[9px] text-[#00ff9d]"><Wifi size={10}/>NO</span>}
                  </td>
                  <td className="px-4 py-3"><span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${o.status==='ACTIVE'?'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20':'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>{o.status}</span></td>
                  <td className={`px-4 py-3 font-mono ${t.text}`}>{o.records.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── HEALTH OFFICERS CONTENT ──────────────────────────────
function HealthOfficersContent({darkMode,t}){
  const [search,setSearch]=useState('')
  const [page,setPage]=useState(0)
  const PER_PAGE=5
  const OFFICERS=[
    {id:'HO-0101',name:'Dr. Fatuma Rashidi',  facility:'Muhimbili National Hospital',region:'Dar es Salaam',district:'Ilala',    status:'ACTIVE', records:4120},
    {id:'HO-0102',name:'Dr. James Mwamba',    facility:'Kilimanjaro Christian Medical',region:'Kilimanjaro',district:'Moshi Urban',status:'ACTIVE',records:2870},
    {id:'HO-0103',name:'Nurse Grace Ochieng', facility:'Mbeya Referral Hospital',     region:'Mbeya',        district:'Mbeya City',status:'ACTIVE', records:1930},
    {id:'HO-0104',name:'Dr. Salma Tito',      facility:'Bugando Medical Centre',      region:'Mwanza',       district:'Nyamagana',status:'ACTIVE', records:3210},
    {id:'HO-0105',name:'Dr. Hassan Mkocho',   facility:'Dodoma Regional Hospital',    region:'Dodoma',       district:'Dodoma City',status:'PENDING',records:0},
    {id:'HO-0106',name:'Nurse Upendo Chale',  facility:'Arusha Lutheran Medical',     region:'Arusha',       district:'Arusha City',status:'ACTIVE',records:1560},
  ]
  const filtered=OFFICERS.filter(o=>o.name.toLowerCase().includes(search.toLowerCase())||o.facility.toLowerCase().includes(search.toLowerCase()))
  const paged=filtered.slice(page*PER_PAGE,(page+1)*PER_PAGE)
  const totalPages=Math.ceil(filtered.length/PER_PAGE)
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Health Officers</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>{filtered.length} hospital-level officers</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[{label:'Total Officers',value:'1,248',color:'text-[#00d4ff]'},{label:'Active',value:'1,230',color:'text-[#00ff9d]'},{label:'Facilities',value:'8,432',color:'text-red-400'}].map(({label,value,color})=>(
          <div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}><p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{label}</p><p className={`text-2xl font-extrabold ${color}`}>{value}</p></div>
        ))}
      </div>
      <div className="relative"><Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Search officer or facility..." className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#00d4ff]/40 placeholder-gray-500`}/></div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${t.border} flex items-center justify-between`}>
          <span className={`text-[10px] font-mono ${t.textDim}`}>Entries {page*PER_PAGE+1}–{Math.min((page+1)*PER_PAGE,filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronLeft size={12}/></button>
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${t.iconBtn} disabled:opacity-30`}><ChevronRight size={12}/></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className={`border-b ${t.border}`}>{['ID','Name','Facility','Region','District','Status','Records'].map(h=><th key={h} className={`px-4 py-3 text-left text-[9px] font-mono uppercase tracking-widest ${t.textDim}`}>{h}</th>)}</tr></thead>
            <tbody>
              {paged.map(o=>(
                <tr key={o.id} className={`border-b ${t.border} ${t.rowHover} transition-all`}>
                  <td className={`px-4 py-3 font-mono text-[10px] ${t.textDim}`}>{o.id}</td>
                  <td className={`px-4 py-3 font-semibold ${t.text}`}>{o.name}</td>
                  <td className={`px-4 py-3 text-[#00d4ff] text-[10px]`}>{o.facility}</td>
                  <td className={`px-4 py-3 ${t.textSub}`}>{o.region}</td>
                  <td className={`px-4 py-3 ${t.textSub}`}>{o.district}</td>
                  <td className="px-4 py-3"><span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${o.status==='ACTIVE'?'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20':'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>{o.status}</span></td>
                  <td className={`px-4 py-3 font-mono ${t.text}`}>{o.records.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── MANAGE USERS CONTENT ─────────────────────────────────
function ManageUsersContent({darkMode,t}){
  const [roleFilter,setRoleFilter]=useState('all')
  const [search,setSearch]=useState('')
  const [warning,setWarning]=useState(null) // {type:'suspend'|'delete', user}
  const [users,setUsers]=useState([
    {id:'USR-001',name:'Dr. Fatuma Rashid',  role:'Super Admin',    email:'f.rashid@nbs.go.tz',    status:'ACTIVE',   last:'2026-05-12 14:20',online:true },
    {id:'USR-002',name:'John Amsterdam',      role:'Super Admin',    email:'j.amsterdam@nbs.go.tz',  status:'ACTIVE',   last:'2026-05-12 13:55',online:true },
    {id:'USR-003',name:'Amina Said Mwinyi',   role:'District Admin', email:'a.mwinyi@nbs.go.tz',     status:'ACTIVE',   last:'2026-05-12 11:30',online:false},
    {id:'USR-004',name:'Emmanuel Kihega',     role:'District Admin', email:'e.kihega@nbs.go.tz',     status:'PENDING',  last:'—',               online:false},
    {id:'USR-005',name:'Grace Haule',         role:'Village Officer',email:'g.haule@nbs.go.tz',      status:'ACTIVE',   last:'2026-05-12 09:10',online:false},
    {id:'USR-006',name:'Peter Nduguru',       role:'District Admin', email:'p.nduguru@nbs.go.tz',    status:'SUSPENDED',last:'2026-04-01 08:00',online:false},
    {id:'USR-007',name:'Juma Mwanga',         role:'Village Officer',email:'j.mwanga@nbs.go.tz',     status:'ACTIVE',   last:'2026-05-12 12:45',online:true },
    {id:'USR-008',name:'Akili Baraka (Citizen)',role:'Citizen',      email:'akili.b@gmail.com',       status:'ACTIVE',   last:'2026-05-10 18:30',online:false},
    {id:'USR-009',name:'Zawadi Omari (Citizen)',role:'Citizen',      email:'zawadi.o@gmail.com',       status:'ACTIVE',   last:'2026-05-11 09:15',online:true },
  ])
  const roles=['all','Super Admin','District Admin','Village Officer','Citizen']
  const filtered=users.filter(u=>(roleFilter==='all'||u.role===roleFilter)&&(u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())))
  const roleBadge={'Super Admin':'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20','District Admin':'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20','Village Officer':'text-purple-400 bg-purple-400/10 border-purple-400/20','Citizen':'text-orange-400 bg-orange-400/10 border-orange-400/20'}
  const statusColor={ACTIVE:'text-[#00ff9d]',PENDING:'text-yellow-400',SUSPENDED:'text-red-400'}
  const onlineCount=users.filter(u=>u.online).length
  const offlineCount=users.filter(u=>!u.online).length

  const handleConfirm=()=>{
    if(!warning)return
    setUsers(prev=>prev.map(u=>u.id===warning.user.id
      ?warning.type==='suspend'?{...u,status:'SUSPENDED',online:false}:null
      :u).filter(Boolean))
    setWarning(null)
  }

  return(
    <div className="space-y-5">
      {warning&&<WarningPopup type={warning.type} user={warning.user} onConfirm={handleConfirm} onCancel={()=>setWarning(null)} t={t}/>}
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Manage Users</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>All system users — admins, officers & citizens</p></div>
      {/* Live cards */}
      <div className="grid grid-cols-3 gap-3">
        {[{label:'Total System Users',value:users.length.toString(),color:'text-[#00d4ff]',bg:'bg-[#00d4ff]/10 border-[#00d4ff]/20'},{label:'Online Now',value:onlineCount.toString(),color:'text-[#00ff9d]',bg:'bg-[#00ff9d]/10 border-[#00ff9d]/20'},{label:'Offline',value:offlineCount.toString(),color:'text-orange-400',bg:'bg-orange-400/10 border-orange-400/20'}].map(({label,value,color,bg})=>(
          <div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
            <p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{label}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${bg} ${color} mt-1 inline-block`}>LIVE</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">{roles.map(r=><button key={r} onClick={()=>setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all border ${roleFilter===r?'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]':darkMode?'bg-gray-100 border-gray-300 text-gray-500':'bg-white/5 border-[#1e2d45] text-gray-500 hover:text-gray-300'}`}>{r}</button>)}</div>
        <div className="relative flex-1"><Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..." className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-[#00d4ff]/40 placeholder-gray-500`}/></div>
      </div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className={`border-b ${t.border}`}>{['ID','Name','Role','Email','Online','Last Login','Status','Actions'].map(h=><th key={h} className={`px-4 py-3 text-left text-[9px] font-mono uppercase tracking-widest ${t.textDim}`}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id} className={`border-b ${t.border} ${t.rowHover} transition-all`}>
                  <td className={`px-4 py-3 font-mono text-[10px] ${t.textDim}`}>{u.id}</td>
                  <td className={`px-4 py-3 font-semibold ${t.text}`}>{u.name}</td>
                  <td className="px-4 py-3"><span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${roleBadge[u.role]||'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>{u.role}</span></td>
                  <td className={`px-4 py-3 font-mono text-[10px] ${t.textSub}`}>{u.email}</td>
                  <td className="px-4 py-3">{u.online?<span className="flex items-center gap-1 text-[9px] text-[#00ff9d]"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"/>Online</span>:<span className={`text-[9px] ${t.textSub}`}>Offline</span>}</td>
                  <td className={`px-4 py-3 font-mono text-[10px] ${t.textSub}`}>{u.last}</td>
                  <td className={`px-4 py-3 font-bold text-[10px] ${statusColor[u.status]}`}>{u.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {u.status!=='SUSPENDED'&&<button onClick={()=>setWarning({type:'suspend',user:u})} title="Suspend" className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${t.iconBtn} hover:text-yellow-400 hover:border-yellow-400/30`}><Ban size={11}/></button>}
                      <button onClick={()=>setWarning({type:'delete',user:u})} title="Delete" className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${t.iconBtn} hover:text-red-400 hover:border-red-400/30`}><Trash2 size={11}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── SYSTEM PERFORMANCE ───────────────────────────────────
function SystemPerformanceContent({darkMode,t}){
  const [tick,setTick]=useState(0)
  useEffect(()=>{const id=setInterval(()=>setTick(x=>x+1),3000);return()=>clearInterval(id)},[])
  const cpu=Math.min(98,32+Math.round(Math.sin(tick*0.7)*12))
  const ram=Math.min(98,68+Math.round(Math.sin(tick*0.5)*8))
  const disk=47
  const net=Math.min(99,58+Math.round(Math.sin(tick*0.9)*18))
  const SERVICES=[
    {name:'PostgreSQL DB',  status:'RUNNING',latency:'2ms',  uptime:'99.98%',color:'text-[#00ff9d]'},
    {name:'Redis Cache',    status:'RUNNING',latency:'0.4ms',uptime:'100%',  color:'text-[#00ff9d]'},
    {name:'API Gateway',    status:'RUNNING',latency:'12ms', uptime:'99.95%',color:'text-[#00ff9d]'},
    {name:'NIDA Connector', status:'RUNNING',latency:'84ms', uptime:'99.80%',color:'text-[#00ff9d]'},
    {name:'Email Service',  status:'RUNNING',latency:'210ms',uptime:'99.70%',color:'text-[#00ff9d]'},
    {name:'Backup Service', status:'IDLE',   latency:'—',    uptime:'100%',  color:'text-yellow-400'},
    {name:'SMS Gateway',    status:'RUNNING',latency:'340ms',uptime:'98.90%',color:'text-[#00ff9d]'},
    {name:'Audit Logger',   status:'RUNNING',latency:'1ms',  uptime:'100%',  color:'text-[#00ff9d]'},
  ]
  const Gauge=({label,value,color})=>(
    <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3"><p className={`text-[10px] font-mono uppercase tracking-widest ${t.textDim}`}>{label}</p><span className={`text-lg font-extrabold ${color}`}>{value}%</span></div>
      <div className={`h-2 rounded-full ${darkMode?'bg-gray-200':'bg-[#1e2d45]'}`}><div className={`h-2 rounded-full transition-all duration-1000 ${value>85?'bg-red-500':value>70?'bg-yellow-400':color.replace('text-','bg-')}`} style={{width:`${value}%`}}/></div>
      <div className="flex justify-between mt-1"><span className={`text-[9px] ${t.textDim}`}>0%</span><span className={`text-[9px] ${t.textDim}`}>100%</span></div>
    </div>
  )
  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>System Performance</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>Live infrastructure metrics</p></div><span className="flex items-center gap-1.5 text-[10px] text-[#00ff9d] font-mono bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded-full px-3 py-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"/>LIVE</span></div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3"><Gauge label="CPU Usage" value={cpu} color="text-[#00d4ff]"/><Gauge label="RAM Usage" value={ram} color="text-[#00ff9d]"/><Gauge label="Disk Usage" value={disk} color="text-orange-400"/><Gauge label="Network I/O" value={net} color="text-purple-400"/></div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${t.border}`}><p className={`font-bold text-sm ${t.text}`}>Service Health</p></div>
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className={`border-b ${t.border}`}>{['Service','Status','Latency','Uptime'].map(h=><th key={h} className={`px-4 py-3 text-left text-[9px] font-mono uppercase tracking-widest ${t.textDim}`}>{h}</th>)}</tr></thead><tbody>{SERVICES.map(s=><tr key={s.name} className={`border-b ${t.border} ${t.rowHover}`}><td className={`px-4 py-3 font-semibold ${t.text}`}>{s.name}</td><td className="px-4 py-3"><span className={`text-[9px] font-mono ${s.color}`}>{s.status}</span></td><td className={`px-4 py-3 font-mono ${t.textSub}`}>{s.latency}</td><td className={`px-4 py-3 font-mono text-[#00ff9d]`}>{s.uptime}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  )
}

// ── LOG REPORTS ──────────────────────────────────────────
function LogReportsContent({darkMode,t}){
  const [typeFilter,setTypeFilter]=useState('all')
  const [search,setSearch]=useState('')
  const LOGS=[
    {id:'LOG-001',type:'AUTH',   level:'INFO', user:'j.amsterdam@nbs.go.tz',action:'Successful login',                    time:'2026-05-12 14:22:01',ip:'197.186.1.10'},
    {id:'LOG-002',type:'AUDIT',  level:'INFO', user:'a.mwinyi@nbs.go.tz',   action:'Validated 1,200 citizen records',      time:'2026-05-12 14:20:10',ip:'41.220.3.89'},
    {id:'LOG-003',type:'SECURITY',level:'WARN',user:'UNKNOWN',              action:'5 failed login attempts — Kilimanjaro', time:'2026-05-12 13:58:12',ip:'41.33.12.205'},
    {id:'LOG-004',type:'SYSTEM', level:'INFO', user:'SCHEDULER',            action:'Cloud DB sync completed',               time:'2026-05-12 13:55:44',ip:'internal'},
    {id:'LOG-005',type:'AUDIT',  level:'INFO', user:'g.haule@nbs.go.tz',    action:'Registered 340 citizens — Nzuguni',    time:'2026-05-12 11:55:22',ip:'105.27.4.11'},
    {id:'LOG-006',type:'SECURITY',level:'ERROR',user:'UNKNOWN',             action:'Unauthorized API access blocked',       time:'2026-05-12 12:10:00',ip:'41.200.55.3'},
    {id:'LOG-007',type:'AUTH',   level:'INFO', user:'f.rashid@nbs.go.tz',   action:'Password changed successfully',         time:'2026-05-12 09:30:15',ip:'41.58.12.90'},
    {id:'LOG-008',type:'SYSTEM', level:'INFO', user:'SYSTEM',               action:'Population snapshot generated',         time:'2026-05-12 11:30:00',ip:'internal'},
  ]
  const levelColor={INFO:'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20',WARN:'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',ERROR:'text-red-400 bg-red-400/10 border-red-400/20'}
  const types=['all','AUTH','AUDIT','SECURITY','SYSTEM']
  const filtered=LOGS.filter(l=>(typeFilter==='all'||l.type===typeFilter)&&(l.action.toLowerCase().includes(search.toLowerCase())||l.user.toLowerCase().includes(search.toLowerCase())))
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>System Log Reports</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>Audit trail — {filtered.length} entries</p></div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">{types.map(tp=><button key={tp} onClick={()=>setTypeFilter(tp)} className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all border ${typeFilter===tp?'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]':darkMode?'bg-gray-100 border-gray-300 text-gray-500':'bg-white/5 border-[#1e2d45] text-gray-500 hover:text-gray-300'}`}>{tp}</button>)}</div>
        <div className="relative flex-1"><Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs..." className={`w-full ${t.input} border ${t.cardBorder} ${t.text} text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-[#00d4ff]/40 placeholder-gray-500`}/></div>
      </div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className={`border-b ${t.border}`}>{['Log ID','Type','Level','User','Action','Time','IP'].map(h=><th key={h} className={`px-4 py-3 text-left text-[9px] font-mono uppercase tracking-widest ${t.textDim}`}>{h}</th>)}</tr></thead><tbody>{filtered.map(l=><tr key={l.id} className={`border-b ${t.border} ${t.rowHover} transition-all`}><td className={`px-4 py-3 font-mono text-[10px] ${t.textDim}`}>{l.id}</td><td className={`px-4 py-3 font-mono text-[10px] ${t.text}`}>{l.type}</td><td className="px-4 py-3"><span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${levelColor[l.level]}`}>{l.level}</span></td><td className={`px-4 py-3 font-mono text-[10px] ${t.textSub}`}>{l.user}</td><td className={`px-4 py-3 ${t.text}`}>{l.action}</td><td className={`px-4 py-3 font-mono text-[10px] ${t.textSub}`}>{l.time}</td><td className={`px-4 py-3 font-mono text-[10px] ${t.textDim}`}>{l.ip}</td></tr>)}</tbody></table></div></div>
    </div>
  )
}

// ── SECURITY ALERTS ──────────────────────────────────────
function SecurityAlertsContent({darkMode,t}){
  const [sevFilter,setSevFilter]=useState('all')
  const ALERTS=[
    {id:'ALT-001',severity:'CRITICAL',type:'Brute Force',    region:'Kilimanjaro',  detail:'5 consecutive failed logins from same IP',       time:'2026-05-12 13:58',ip:'41.33.12.205',resolved:false},
    {id:'ALT-002',severity:'HIGH',    type:'Unauthorized API',region:'National',     detail:'Blocked API call without valid Bearer token',     time:'2026-05-12 12:10',ip:'41.200.55.3', resolved:false},
    {id:'ALT-003',severity:'MEDIUM',  type:'Unusual Activity',region:'Dar es Salaam',detail:'Admin accessed 500+ records in under 2 minutes', time:'2026-05-12 10:44',ip:'197.186.1.22',resolved:true},
    {id:'ALT-004',severity:'LOW',     type:'Session Timeout', region:'Dodoma',       detail:'Admin session expired without explicit logout',   time:'2026-05-12 09:12',ip:'197.250.4.5', resolved:true},
    {id:'ALT-005',severity:'HIGH',    type:'IP Blacklist Hit',region:'External',     detail:'Known malicious IP attempted system access',      time:'2026-05-11 22:30',ip:'104.21.9.0',  resolved:true},
    {id:'ALT-006',severity:'MEDIUM',  type:'Cert Expiry',     region:'National',     detail:'SSL certificate expires in 14 days',              time:'2026-05-11 08:00',ip:'internal',     resolved:false},
  ]
  const sevColor={CRITICAL:'text-red-400 bg-red-400/10 border-red-400/30',HIGH:'text-orange-400 bg-orange-400/10 border-orange-400/30',MEDIUM:'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',LOW:'text-blue-400 bg-blue-400/10 border-blue-400/30'}
  const sevs=['all','CRITICAL','HIGH','MEDIUM','LOW']
  const filtered=ALERTS.filter(a=>sevFilter==='all'||a.severity===sevFilter)
  const unresolved=ALERTS.filter(a=>!a.resolved).length
  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Security Alerts</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>{unresolved} unresolved alerts</p></div>{unresolved>0&&<span className="flex items-center gap-1.5 text-[10px] text-red-400 font-mono bg-red-400/10 border border-red-400/20 rounded-full px-3 py-1 animate-pulse"><ShieldAlert size={10}/>{unresolved} ACTIVE</span>}</div>
      <div className="grid grid-cols-4 gap-3">{sevs.slice(1).map(s=>{const count=ALERTS.filter(a=>a.severity===s).length;return(<div key={s} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}><p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{s}</p><p className={`text-2xl font-extrabold ${sevColor[s].split(' ')[0]}`}>{count}</p></div>)})}</div>
      <div className="flex gap-2 flex-wrap">{sevs.map(s=><button key={s} onClick={()=>setSevFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all border ${sevFilter===s?'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]':darkMode?'bg-gray-100 border-gray-300 text-gray-500':'bg-white/5 border-[#1e2d45] text-gray-500 hover:text-gray-300'}`}>{s}</button>)}</div>
      <div className="space-y-2">{filtered.map(a=><div key={a.id} className={`${t.card} border ${t.cardBorder} rounded-xl p-4 transition-all ${!a.resolved?'border-l-4 border-l-red-500/50':''}`}><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><ShieldAlert size={15} className={sevColor[a.severity].split(' ')[0]}/><div><div className="flex items-center gap-2 mb-1 flex-wrap"><p className={`font-bold text-sm ${t.text}`}>{a.type}</p><span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${sevColor[a.severity]}`}>{a.severity}</span>{a.resolved&&<span className="text-[9px] font-mono text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/20 px-2 py-0.5 rounded-full">RESOLVED</span>}</div><p className={`text-xs ${t.textSub} mb-1`}>{a.detail}</p><div className={`flex items-center gap-3 text-[9px] font-mono ${t.textDim}`}><span>ID: {a.id}</span><span>Region: {a.region}</span><span>IP: {a.ip}</span><span>{a.time}</span></div></div></div>{!a.resolved&&<button className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/30 hover:bg-[#00ff9d]/20 transition-all shrink-0">Resolve</button>}</div></div>)}</div>
    </div>
  )
}

// ── MIGRATION TRENDS ─────────────────────────────────────
function MigrationTrendsContent({darkMode,t}){
  const [activeFilter,setActiveFilter]=useState({scope:'national',region:'',district:'',village:''})
  const data=[
    {month:'Jan',incoming:1240,outgoing:980},{month:'Feb',incoming:1380,outgoing:1120},
    {month:'Mar',incoming:1520,outgoing:1350},{month:'Apr',incoming:1680,outgoing:1200},
    {month:'May',incoming:1890,outgoing:1480},{month:'Jun',incoming:2100,outgoing:1620},
  ]
  const STATS_M=[
    {label:'Total Migrations',value:'4,891',color:'text-[#00d4ff]'},{label:'Confirmed',value:'3,240',color:'text-[#00ff9d]'},
    {label:'Pending',value:'1,231',color:'text-yellow-400'},{label:'Rejected',value:'420',color:'text-red-400'},
  ]
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Migration Trends</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>Population movement patterns — live census data</p></div>
      <GeoFilterBar onFilterChange={setActiveFilter} darkMode={darkMode} t={t}/>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{STATS_M.map(({label,value,color})=><div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}><p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{label}</p><p className={`text-2xl font-extrabold ${color}`}>{value}</p></div>)}</div>
      <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
        <h2 className={`font-bold text-sm mb-4 ${t.text}`}>Monthly Migration Flow</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={darkMode?'#e5e7eb':'#1e2d45'} vertical={false}/><XAxis dataKey="month" tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:10}}/><YAxis tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:10}}/><Tooltip/><Bar dataKey="incoming" name="Incoming" fill="#00d4ff" fillOpacity={0.8} radius={[4,4,0,0]}/><Bar dataKey="outgoing" name="Outgoing" fill="#ff6b9d" fillOpacity={0.8} radius={[4,4,0,0]}/></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── MARRIAGE ISSUES ──────────────────────────────────────
function MarriageIssuesContent({darkMode,t}){
  const [activeFilter,setActiveFilter]=useState({scope:'national',region:'',district:'',village:''})
  const STATS_M=[
    {label:'Total Marriages',value:'12,340,210',color:'text-[#00ff9d]'},{label:'Active',value:'11,890,430',color:'text-[#00d4ff]'},
    {label:'Dissolved',value:'312,840',color:'text-red-400'},{label:'Pending Dissolution',value:'136,940',color:'text-yellow-400'},
  ]
  const KINDS=[{label:'Monogamous',value:'78.4%',pct:78},{label:'Potentially Polygamous',value:'14.2%',pct:14},{label:'Polygamous',value:'4.8%',pct:5},{label:'Customary/Unregistered',value:'2.6%',pct:3}]
  // Daily 24-hr registrations/dissolutions
  const dailyMarriage=Array.from({length:24},(_,h)=>({
    hour:`${String(h).padStart(2,'0')}:00`,
    registrations: Math.round(8+Math.sin(h*0.5)*5+Math.random()*4),
    dissolutions:  Math.round(2+Math.sin(h*0.3)*2+Math.random()*2),
  }))
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Marriage Issues</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>Civil marriage registry — national data</p></div>
      <GeoFilterBar onFilterChange={setActiveFilter} darkMode={darkMode} t={t}/>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{STATS_M.map(({label,value,color})=><div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}><p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{label}</p><p className={`text-lg font-extrabold ${color}`}>{value}</p></div>)}</div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Marriage Types bar chart */}
        <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
          <h2 className={`font-bold text-sm mb-4 ${t.text}`}>Marriage Types Distribution</h2>
          <div className="space-y-3">{KINDS.map(({label,value,pct})=><div key={label}><div className="flex justify-between mb-1"><p className={`text-xs ${t.text}`}>{label}</p><p className={`text-xs font-bold ${t.text}`}>{value}</p></div><div className={`h-2 rounded-full ${darkMode?'bg-gray-200':'bg-[#1e2d45]'}`}><div className="h-2 rounded-full bg-[#00d4ff] transition-all" style={{width:`${pct*1.2}%`,opacity:0.8}}/></div></div>)}</div>
        </div>
        {/* Daily 24-hr trend */}
        <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-4">
            <div><h2 className={`font-bold text-sm ${t.text}`}>Daily Activity (24-Hour)</h2><p className={`text-[10px] ${t.textSub}`}>Registrations · Dissolutions — today</p></div>
            <span className="flex items-center gap-1 text-[9px] text-[#00ff9d] font-mono bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"/>LIVE</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyMarriage} margin={{top:5,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode?'#e5e7eb':'#1e2d45'} vertical={false}/>
              <XAxis dataKey="hour" tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:8,fontFamily:'monospace'}} interval={5} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:9}} axisLine={false} tickLine={false} width={25}/>
              <Tooltip contentStyle={{background:darkMode?'#fff':'#0a1628',border:'1px solid #1a3060',borderRadius:'8px',fontSize:'11px'}}/>
              <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#00ff9d" fill="#00ff9d" fillOpacity={0.15} strokeWidth={2}/>
              <Area type="monotone" dataKey="dissolutions"  name="Dissolutions"  stroke="#ff6b9d" fill="#ff6b9d" fillOpacity={0.12} strokeWidth={1.5}/>
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-1 justify-center">
            {[['Registrations','#00ff9d'],['Dissolutions','#ff6b9d']].map(([n,c])=>(
              <div key={n} className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full" style={{background:c}}/><span className="text-[9px] text-gray-500">{n}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── HEALTH TRENDS ─────────────────────────────────────────
function HealthTrendsContent({darkMode,t}){
  const [activeFilter,setActiveFilter]=useState({scope:'national',region:'',district:'',village:''})
  // Daily 24-hr data (00:00–23:00)
  const dailyData=Array.from({length:24},(_,h)=>({
    hour:`${String(h).padStart(2,'0')}:00`,
    births: Math.round(40+Math.sin(h*0.4)*25+Math.random()*15),
    deaths: Math.round(12+Math.sin(h*0.3)*8+Math.random()*6),
    admissions: Math.round(80+Math.sin(h*0.5)*40+Math.random()*20),
  }))
  const STATS_H=[
    {label:'Registered Births',    value:'1,247,320',  color:'text-[#00ff9d]'},
    {label:'Registered Deaths',    value:'312,840',    color:'text-red-400'},
    {label:'Total Facilities',     value:'8,432',      color:'text-[#00d4ff]'},
    {label:'Hospitals',            value:'320',        color:'text-orange-400'},
    {label:'Health Centres',       value:'1,544',      color:'text-purple-400'},
    {label:'Dispensaries',         value:'6,568',      color:'text-yellow-400'},
    {label:'Infant Mortality',     value:'3.2%',       color:'text-red-400'},
    {label:'Life Expectancy',      value:'67.4 yrs',   color:'text-[#00d4ff]'},
  ]
  return(
    <div className="space-y-5">
      <div><h1 className={`font-bold text-xl sm:text-2xl ${t.text}`}>Health Trends</h1><p className={`text-xs mt-0.5 ${t.textSub}`}>National health indicators — civil registry data</p></div>
      <GeoFilterBar onFilterChange={setActiveFilter} darkMode={darkMode} t={t}/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{STATS_H.map(({label,value,color})=><div key={label} className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}><p className={`text-[9px] uppercase tracking-widest font-mono ${t.textDim} mb-1`}>{label}</p><p className={`text-lg font-extrabold ${color}`}>{value}</p></div>)}</div>
      {/* Daily 24-hr trend */}
      <div className={`${t.card} border ${t.cardBorder} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className={`font-bold text-sm ${t.text}`}>Daily Health Activity (24-Hour)</h2><p className={`text-[10px] ${t.textSub}`}>Births · Deaths · Admissions — today</p></div>
          <span className="flex items-center gap-1 text-[9px] text-[#00ff9d] font-mono bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded-full px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"/>LIVE</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={dailyData} margin={{top:5,right:10,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode?'#e5e7eb':'#1e2d45'} vertical={false}/>
            <XAxis dataKey="hour" tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:8,fontFamily:'monospace'}} interval={3} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:darkMode?'#6b7280':'#4a6080',fontSize:9}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:darkMode?'#fff':'#0a1628',border:'1px solid #1a3060',borderRadius:'8px',fontSize:'11px'}}/>
            <Area type="monotone" dataKey="admissions" name="Admissions" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.1} strokeWidth={1.5}/>
            <Area type="monotone" dataKey="births" name="Births" stroke="#00ff9d" fill="#00ff9d" fillOpacity={0.15} strokeWidth={2}/>
            <Area type="monotone" dataKey="deaths" name="Deaths" stroke="#ff6b9d" fill="#ff6b9d" fillOpacity={0.12} strokeWidth={1.5}/>
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          {[['Admissions','#00d4ff'],['Births','#00ff9d'],['Deaths','#ff6b9d']].map(([n,c])=>(
            <div key={n} className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full" style={{background:c}}/><span className="text-[9px] text-gray-500">{n}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}


// ── GLOBAL SEARCH ─────────────────────────────────────────
const SEARCH_INDEX = [
  // Nav sections
  {type:'nav',  label:'Dashboard',              desc:'System overview & stats',               nav:'Dashboard'},
  {type:'nav',  label:'Demographics View',       desc:'Population, age, gender filters',       nav:'Demographics View'},
  {type:'nav',  label:'Infrastructure View',     desc:'Roads, schools, hospitals, housing',    nav:'Infrastructure View'},
  {type:'nav',  label:'District Admins',         desc:'Manage district-level administrators',  nav:'District Admins'},
  {type:'nav',  label:'Village Officers',        desc:'Village-level census officers',         nav:'Village Officers'},
  {type:'nav',  label:'Health Officers',         desc:'Hospital & clinic officers',            nav:'Health Officers'},
  {type:'nav',  label:'Manage Users',            desc:'All system users, suspend/delete',      nav:'Manage Users'},
  {type:'nav',  label:'System Performance',      desc:'Server metrics, CPU, RAM, services',    nav:'System Performance'},
  {type:'nav',  label:'System Log Reports',      desc:'Audit trail & log entries',             nav:'System Log Reports'},
  {type:'nav',  label:'Security Alerts',         desc:'Blocked IPs, suspicious activity',      nav:'Security Alerts'},
  {type:'nav',  label:'Migration Trends',        desc:'Internal & external migrations',        nav:'Migration Trends'},
  {type:'nav',  label:'Marriage Issues',         desc:'Registrations, divorces, disputes',     nav:'Marriage Issues'},
  {type:'nav',  label:'Health Trends',           desc:'Births, deaths, daily health data',     nav:'Health Trends'},
  // Quick actions
  {type:'action',label:'Register New Admin',    desc:'Open registration modal',               nav:'District Admins',  action:'newreg'},
  {type:'action',label:'Change Password',       desc:'Update your account password',          nav:null,               action:'changepwd'},
  {type:'action',label:'MFA Settings',          desc:'Enable or disable MFA',                nav:null,               action:'mfa'},
  {type:'action',label:'Export Report',         desc:'Download system report',               nav:'Dashboard'},
  // Data cards
  {type:'data',  label:'Total Population',      desc:'63,748,291 — National census total',   nav:'Demographics View'},
  {type:'data',  label:'Employment Status',     desc:'Gov 18.4% · Self 47.2% · Other 34.4%',nav:'Demographics View'},
  {type:'data',  label:'Health Facilities',     desc:'8,432 facilities nationwide',           nav:'Health Trends'},
  {type:'data',  label:'Registered Marriages',  desc:'12,340,210 registered couples',         nav:'Marriage Issues'},
  {type:'data',  label:'Migration Records',     desc:'4,891 active migration records',        nav:'Migration Trends'},
  {type:'data',  label:'Security Alerts',       desc:'2 unresolved active alerts',            nav:'Security Alerts'},
]

const TYPE_STYLE = {
  nav:    {label:'SECTION', color:'text-[#00d4ff]', bg:'bg-[#00d4ff]/10'},
  action: {label:'ACTION',  color:'text-[#00ff9d]', bg:'bg-[#00ff9d]/10'},
  data:   {label:'DATA',    color:'text-purple-400', bg:'bg-purple-400/10'},
}

function GlobalSearch({t, darkMode, onNavigate}) {
  const [query,   setQuery]   = useState('')
  const [focused, setFocused] = useState(false)
  const [selIdx,  setSelIdx]  = useState(0)
  const ref = useRef(null)

  const results = query.length >= 1
    ? SEARCH_INDEX.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  const handleSelect = (item) => {
    if (item.nav) onNavigate(item.nav)
    setQuery(''); setFocused(false)
  }

  const handleKey = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelIdx(i => Math.min(i+1, results.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelIdx(i => Math.max(i-1, 0)) }
    if (e.key === 'Enter')     { handleSelect(results[selIdx]) }
    if (e.key === 'Escape')    { setFocused(false); setQuery('') }
  }

  useEffect(() => { setSelIdx(0) }, [query])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setFocused(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="flex-1 max-w-sm ml-2 relative hidden md:block">
      <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim} z-10`}/>
      <input
        type="text"
        value={query}
        placeholder="Search sections, data, actions..."
        onChange={e => { setQuery(e.target.value); setFocused(true) }}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKey}
        className={`w-full ${t.input} border ${focused ? (darkMode?'border-blue-400':'border-[#00d4ff]/50') : t.cardBorder} ${t.text} text-sm rounded-lg pl-8 pr-4 py-2 outline-none transition-colors placeholder-gray-500`}
      />
      {focused && results.length > 0 && (
        <div className={`absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border shadow-2xl overflow-hidden
                        ${darkMode ? 'bg-white border-gray-200' : 'bg-[#0d1526] border-[#1a2d4a]'}`}>
          {results.map((item, i) => {
            const ts = TYPE_STYLE[item.type]
            return (
              <button
                key={i}
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all
                           ${i === selIdx
                             ? darkMode ? 'bg-blue-50' : 'bg-[#1a2d4a]'
                             : darkMode ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}
              >
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${ts.color} ${ts.bg}`}>
                  {ts.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${darkMode ? 'text-gray-800' : 'text-white'}`}>{item.label}</p>
                  <p className={`text-[10px] truncate ${t.textDim}`}>{item.desc}</p>
                </div>
                {item.nav && (
                  <ChevronRight size={10} className={`shrink-0 ${t.textDim}`}/>
                )}
              </button>
            )
          })}
          <div className={`px-4 py-1.5 border-t ${t.border} flex items-center gap-3`}>
            <span className={`text-[9px] font-mono ${t.textDim}`}>↑↓ navigate</span>
            <span className={`text-[9px] font-mono ${t.textDim}`}>↵ select</span>
            <span className={`text-[9px] font-mono ${t.textDim}`}>esc close</span>
          </div>
        </div>
      )}
      {focused && query.length >= 1 && results.length === 0 && (
        <div className={`absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border shadow-2xl px-4 py-3
                        ${darkMode ? 'bg-white border-gray-200' : 'bg-[#0d1526] border-[#1a2d4a]'}`}>
          <p className={`text-xs ${t.textDim}`}>No results for "<span className={t.text}>{query}</span>"</p>
        </div>
      )}
    </div>
  )
}

// ── MAIN SUPER ADMIN DASHBOARD ───────────────────────────
export default function SuperAdminDashboard({onSectionChange,onLogout}){
  const [sidebarOpen, setSidebarOpen] =useState(false)
  const [activeNav,   setActiveNav]   =useState('Dashboard')
  const [darkMode,    setDarkMode]    =useState(false)
  const [settingsOpen,setSettingsOpen]=useState(false)
  const [showChangePwd,setShowChangePwd]=useState(false)
  const [showNewReg,  setShowNewReg]  =useState(false)
  const [mfaEnabled,  setMfaEnabled]  =useState(true)
  const [showMfaSetup,setShowMfaSetup]=useState(false)
  const settingsRef=useRef(null)

  const setNav=(label)=>{setActiveNav(label);onSectionChange?.(label);setSidebarOpen(false)}

  useEffect(()=>{
    const h=(e)=>{if(settingsRef.current&&!settingsRef.current.contains(e.target))setSettingsOpen(false)}
    document.addEventListener('mousedown',h)
    return()=>document.removeEventListener('mousedown',h)
  },[])

  const t={
    bg:        darkMode?'bg-gray-50'      :'bg-[#0b111e]',
    sidebar:   darkMode?'bg-white'        :'bg-[#0d1526]',
    border:    darkMode?'border-gray-200' :'border-[#1a2d4a]',
    card:      darkMode?'bg-white'        :'bg-[#111827]',
    cardBorder:darkMode?'border-gray-200' :'border-[#1e2d45]',
    input:     darkMode?'bg-gray-100'     :'bg-[#111827]',
    topbar:    darkMode?'bg-white'        :'bg-[#0d1526]',
    text:      darkMode?'text-gray-900'   :'text-white',
    textDim:   darkMode?'text-gray-500'   :'text-gray-500',
    textSub:   darkMode?'text-gray-600'   :'text-gray-600',
    navActive: darkMode?'bg-blue-50 text-blue-600 border-blue-200':'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20',
    navHover:  darkMode?'hover:bg-gray-100 hover:text-gray-900':'hover:bg-white/5 hover:text-gray-200',
    rowHover:  darkMode?'bg-gray-50 border-gray-200 hover:border-gray-300':'bg-[#0d1526] border-[#1a2d4a] hover:border-[#2a4060]',
    footer:    darkMode?'bg-white'        :'bg-[#0d1526]',
    iconBtn:   darkMode?'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900':'bg-[#111827] border-[#1e2d45] text-gray-500 hover:text-white',
    dropdown:  darkMode?'bg-white border-gray-200':'bg-[#0d1526] border-[#1a2d4a]',
    dropItem:  darkMode?'text-gray-700 hover:bg-gray-100':'text-gray-300 hover:bg-white/5 hover:text-white',
  }

  const renderContent=()=>{
    switch(activeNav){
      case 'Dashboard':           return <DashboardContent darkMode={darkMode} t={t} onNewReg={()=>setShowNewReg(true)}/>
      case 'Demographics View':   return <DemographicsContent darkMode={darkMode} t={t}/>
      case 'Infrastructure View': return <InfrastructureContent darkMode={darkMode} t={t}/>
      case 'District Admins':     return <DistrictAdminsContent darkMode={darkMode} t={t} onNewReg={()=>setShowNewReg(true)}/>
      case 'Village Officers':    return <VillageOfficersContent darkMode={darkMode} t={t}/>
      case 'Health Officers':     return <HealthOfficersContent darkMode={darkMode} t={t}/>
      case 'Manage Users':        return <ManageUsersContent darkMode={darkMode} t={t}/>
      case 'System Performance':  return <SystemPerformanceContent darkMode={darkMode} t={t}/>
      case 'System Log Reports':  return <LogReportsContent darkMode={darkMode} t={t}/>
      case 'Security Alerts':     return <SecurityAlertsContent darkMode={darkMode} t={t}/>
      case 'Migration Trends':    return <MigrationTrendsContent darkMode={darkMode} t={t}/>
      case 'Marriage Issues':     return <MarriageIssuesContent darkMode={darkMode} t={t}/>
      case 'Health Trends':       return <HealthTrendsContent darkMode={darkMode} t={t}/>
      default: return null
    }
  }

  return(
    <div className={`flex h-full overflow-hidden ${t.bg} ${t.text}`}>
      {showChangePwd&&<ChangePasswordModal onClose={()=>setShowChangePwd(false)} darkMode={darkMode} t={t}/>}
      {showNewReg&&<NewRegistrationModal onClose={()=>setShowNewReg(false)} darkMode={darkMode} t={t}/>}
      {showMfaSetup&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>setShowMfaSetup(false)}/>
          <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl z-10 p-6 ${t.card} ${t.cardBorder}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center">
                  <Shield size={15} className="text-[#00ff9d]"/>
                </div>
                <div>
                  <p className={`font-bold text-sm ${t.text}`}>MFA Authentication</p>
                  <p className={`text-[10px] ${t.textSub}`}>{mfaEnabled?'Currently ENABLED — Google Authenticator active':'Currently DISABLED'}</p>
                </div>
              </div>
              <button onClick={()=>setShowMfaSetup(false)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.textDim} hover:text-red-400 hover:bg-red-500/10 transition-all`}>
                <X size={15}/>
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {[
                {val:true, icon:'🔐',title:'Enable MFA',   desc:'Require Google Authenticator code on every login (recommended)',col:'text-[#00ff9d]',  brd:'border-[#00ff9d]/40',  bg:'bg-[#00ff9d]/10'},
                {val:false,icon:'⚡', title:'Disable MFA', desc:'Login with email & password only — less secure',               col:'text-orange-400', brd:'border-orange-400/40', bg:'bg-orange-400/10'},
              ].map(({val,icon,title,desc,col,brd,bg})=>(
                <button key={String(val)} onClick={()=>setMfaEnabled(val)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${mfaEnabled===val?`${bg} ${brd}`:`${t.cardBorder} hover:border-[#2a4060]`}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${col}`}>{title}</p>
                      <p className="text-[10px] text-gray-500">{desc}</p>
                    </div>
                    {mfaEnabled===val&&<CheckCircle size={14} className={col}/>}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowMfaSetup(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00d4ff] to-[#0088bb] text-[#060f1e] hover:opacity-90 transition-all">
              Save & Close
            </button>
          </div>
        </div>
      )}
      {showMfaSetup&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>setShowMfaSetup(false)}/>
          <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl z-10 p-6 ${t.card} ${t.cardBorder}`}>
            <div className={`flex items-center justify-between mb-4`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center"><Shield size={15} className="text-[#00ff9d]"/></div>
                <div><p className={`font-bold text-sm ${t.text}`}>MFA Authentication</p><p className={`text-[10px] ${t.textSub}`}>{mfaEnabled?'Currently ENABLED':'Currently DISABLED'}</p></div>
              </div>
              <button onClick={()=>setShowMfaSetup(false)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.textDim} hover:text-red-400 hover:bg-red-500/10`}><X size={15}/></button>
            </div>
            <div className="space-y-3 mb-5">
              {[
                {val:true, icon:'🔐',title:'Enable MFA',desc:'Require Google Authenticator code on every login',col:'text-[#00ff9d]',brd:'border-[#00ff9d]/40',bg:'bg-[#00ff9d]/10'},
                {val:false,icon:'⚡',title:'Disable MFA',desc:'Login with email & password only (less secure)',col:'text-orange-400',brd:'border-orange-400/40',bg:'bg-orange-400/10'},
              ].map(({val,icon,title,desc,col,brd,bg})=>(
                <button key={String(val)} onClick={()=>setMfaEnabled(val)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${mfaEnabled===val?`${bg} ${brd}`:`${t.cardBorder} hover:border-[#2a4060]`}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1"><p className={`text-sm font-bold ${col}`}>{title}</p><p className="text-[10px] text-gray-500">{desc}</p></div>
                    {mfaEnabled===val&&<CheckCircle size={14} className={col}/>}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowMfaSetup(false)} className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00d4ff] to-[#0088bb] text-[#060f1e] hover:opacity-90 transition-all">
              Save & Close
            </button>
          </div>
        </div>
      )}
      {sidebarOpen&&<div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-56 ${t.sidebar} border-r ${t.border} flex flex-col transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex items-center justify-between px-4 py-4 border-b ${t.border}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg border overflow-hidden flex items-center justify-center ${darkMode?'bg-blue-50 border-blue-200':'bg-[#1a3060] border-[#2a4a80]'}`}>
              <img src="/assets/longo_nbs.png" alt="NBS" className="w-full h-full object-contain" onError={e=>{e.target.style.display='none';e.target.parentNode.innerHTML='<span style="font-size:16px;display:flex;align-items:center;justify-content:center;width:100%;height:100%">🏛</span>'}}/>
            </div>
            <div><p className={`font-bold text-[11px] leading-tight ${t.text}`}>Super Admin Panel</p><p className="text-[#00d4ff] text-[9px] font-mono tracking-widest">V 1.0.0</p></div>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className={`lg:hidden ${t.textDim} hover:text-red-400`}><X size={16}/></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(({label,Icon})=>(
            <button key={label} onClick={()=>setNav(label)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150 border text-[11px] font-medium ${activeNav===label?t.navActive:`${t.textDim} ${t.navHover} border-transparent`}`}>
              <Icon sx={{fontSize:15}} className="shrink-0"/>
              <span className="leading-tight">{label}</span>
              {activeNav===label&&<ChevronRight size={10} className="ml-auto opacity-60"/>}
            </button>
          ))}
        </nav>
        <div className={`p-2 border-t ${t.border}`}>
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-[11px] font-medium border border-transparent">
            <LogoutIcon sx={{fontSize:15}}/> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className={`h-14 ${t.topbar} border-b ${t.border} flex items-center gap-3 px-4 shrink-0`}>
          <button onClick={()=>setSidebarOpen(true)} className={`lg:hidden ${t.textDim} hover:text-blue-500`}><Menu size={18}/></button>
          <p className={`hidden sm:block font-bold text-sm tracking-wide ${t.text}`}>NBS CENSUS SYSTEM</p>
          <GlobalSearch t={t} darkMode={darkMode} onNavigate={setNav}/>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#00ff9d] bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"/>SYSTEM SECURE
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={()=>setDarkMode(!darkMode)} className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${t.iconBtn}`}>
              {darkMode?<Moon size={14} className="text-blue-500"/>:<Sun size={14} className="text-yellow-400"/>}
            </button>
            <button className={`relative w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${t.iconBtn}`}>
              <Bell size={14}/><span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            {/* Settings + dropdown */}
            <div className="relative" ref={settingsRef}>
              <button onClick={()=>setSettingsOpen(!settingsOpen)} className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${t.iconBtn} ${settingsOpen?'border-[#00d4ff]/40 text-[#00d4ff]':''}`}><Settings size={14}/></button>
              {settingsOpen&&(
                <div className={`absolute right-0 top-10 w-52 ${t.dropdown} border rounded-xl shadow-2xl z-50 overflow-hidden`}>
                  <div className="pt-2 pb-2">
                    <p className={`px-4 py-1.5 text-[9px] font-mono tracking-widest ${t.textSub} uppercase`}>Account</p>
                    <button onClick={()=>{setSettingsOpen(false);setShowChangePwd(true)}} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all ${t.dropItem}`}>
                      <KeyRound size={13} className="text-[#00d4ff] shrink-0"/>Change Password
                    </button>
                    <div className={`my-1 border-t ${t.border}`}/>
                    <p className={`px-4 py-1.5 text-[9px] font-mono tracking-widest ${t.textSub} uppercase`}>Security</p>
                    <button onClick={()=>{setSettingsOpen(false);setShowMfaSetup(true)}} className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs transition-all ${t.dropItem}`}>
                      <span className="flex items-center gap-2">
                        <Shield size={13} className={mfaEnabled?'text-[#00ff9d]':'text-gray-500'}/>
                        MFA Authentication
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${mfaEnabled?'text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/20':'text-gray-500 border-gray-600'}`}>
                        {mfaEnabled?'ON':'OFF'}
                      </span>
                    </button>
                    <div className={`my-1 border-t ${t.border}`}/>
                    <button onClick={()=>{setSettingsOpen(false);onLogout?.()}} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all">
                      <LogOutLucide size={13} className="shrink-0"/>Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Admin profile */}
            <div className={`flex items-center gap-2 ml-1 pl-3 border-l ${t.border}`}>
              <div className={`w-8 h-8 rounded-lg border overflow-hidden flex items-center justify-center ${darkMode?'bg-gray-100 border-gray-300':'bg-[#1a2d4a] border-[#2a4060]'}`}>
                <img src="/assets/court_of_arm.png" alt="Admin" className="w-full h-full object-contain" onError={e=>{e.target.style.display='none';e.target.parentNode.innerHTML=`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='#6b7280'><path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/></svg>`}}/>
              </div>
              <div className="hidden sm:block">
                <p className={`text-[11px] font-bold leading-tight ${t.text}`}>ADMINISTRATOR</p>
                <p className="text-[#00d4ff] text-[9px] font-mono tracking-widest">SUPER ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">{renderContent()}</main>

        {/* FOOTER */}
        <footer className={`h-8 ${t.footer} border-t ${t.border} flex items-center justify-between px-4 shrink-0`}>
          <span className="flex items-center gap-1.5 text-[10px] text-[#00ff9d] font-mono"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"/>CENSUS LIVE — LAST UPDATED: 2 MIN AGO</span>
          <span className={`text-[10px] hidden sm:block ${t.textSub}`}>© 2026 NBS TANZANIA — AUTOMATED DIGITAL LIVE CENSUS MODEL</span>
        </footer>
      </div>
    </div>
  )
}
