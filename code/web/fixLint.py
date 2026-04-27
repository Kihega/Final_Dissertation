#!/usr/bin/env python3
"""
NBS Tanzania Census System — Complete Patch
Run from: Final_Dissertation/code/
  python3 patch_nbs.py
"""
import json, pathlib, sys, os

BACK  = pathlib.Path("backend")
FRONT = pathlib.Path("web/src")

def w(rel_path, content):
    p = pathlib.Path(rel_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')
    print(f"  ✅ {rel_path}")

# ─────────────────────────────────────────────────────────────
# 0. VERIFY WE ARE IN THE RIGHT DIRECTORY
# ─────────────────────────────────────────────────────────────
if not (BACK / 'prisma' / 'schema.prisma').exists():
    sys.exit("❌ Run this script from Final_Dissertation/code/\n   cd Final_Dissertation/code && python3 patch_nbs.py")

print("=" * 60)
print("  NBS Tanzania — Complete System Patch")
print("=" * 60)

# ─────────────────────────────────────────────────────────────
# 1. prisma/seed.js  (all 31 regions, ~195 districts, ~4300 wards)
# ─────────────────────────────────────────────────────────────
print("\n[1/8] Writing prisma/seed.js ...")

SEED_JS = r"""
// NBS Census — Full Seed  (node prisma/seed.js)
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const HASH = (pwd) => bcrypt.hash(pwd, 12)

// ── Helper: find-or-create ──────────────────────────────────
async function foc(model, where, data) {
  const ex = await prisma[model].findFirst({ where })
  if (ex) return ex
  return prisma[model].create({ data })
}

// ── Geography constant (31 regions → districts → wards) ────
// AUTO-GENERATED from 2022 PHC Administrative Units Report
GEO_PLACEHOLDER

async function main() {
  console.log('🌱 Seeding NBS Census database...\n')

  // ── 1. SUPER ADMINS ────────────────────────────────────────
  console.log('  [1] Super Admins...')
  const sa1 = await foc('superAdmin',{ email:'dr.fatuma.rashid@nbs.go.tz' },{
    employeeId:'SA-001', nidaNumber:'19750318-07001-00001-21',
    fullName:'Dr. Fatuma Rashid', email:'dr.fatuma.rashid@nbs.go.tz',
    passwordHash: await HASH('Admin@2026!'),
    mobile:'+255754001001', department:'ICT & Digital Systems',
    status:'active', mfaEnabled:false,
  })
  const sa2 = await foc('superAdmin',{ email:'john.amsterdam@nbs.go.tz' },{
    employeeId:'SA-002', nidaNumber:'19880722-07001-00002-21',
    fullName:'John Jovith Amsterdam', email:'john.amsterdam@nbs.go.tz',
    passwordHash: await HASH('Admin@2026!'),
    mobile:'+255754001002', department:'Statistics & Research',
    status:'active', mfaEnabled:false,
  })
  const sa3 = await foc('superAdmin',{ email:'emmanuel.kihega@nbs.go.tz' },{
    employeeId:'SA-003', nidaNumber:'20000414-07001-00003-21',
    fullName:'Emmanuel Kihega Alpha', email:'emmanuel.kihega@nbs.go.tz',
    passwordHash: await HASH('Admin@2026!'),
    mobile:'+255754001003', department:'System Administration',
    status:'active', mfaEnabled:false,
  })
  console.log('  ✅ Super Admins: password = Admin@2026!')

  // ── 2. REGIONS, DISTRICTS, WARDS  (bulk insert — 3 queries total) ──────
  console.log('\n  [2] Seeding geography (31 regions) — bulk insert...')

  // Step 1: bulk-insert all regions
  await prisma.region.createMany({
    skipDuplicates: true,
    data: Object.entries(GEO).map(([name, info]) => ({
      name,
      jurisdiction: info.jurisdiction,
    })),
  })

  // Step 2: fetch all region IDs
  const allRegions = await prisma.region.findMany({ select: { id: true, name: true } })
  const regionMap  = Object.fromEntries(allRegions.map(r => [r.name, r]))

  // Step 3: bulk-insert all districts
  const districtRows = []
  for (const [regionName, rInfo] of Object.entries(GEO)) {
    const region = regionMap[regionName]
    if (!region) continue
    for (const distName of Object.keys(rInfo.districts)) {
      districtRows.push({ name: distName, regionId: region.id })
    }
  }
  await prisma.district.createMany({ skipDuplicates: true, data: districtRows })

  // Step 4: fetch all district IDs (keyed by name+regionId)
  const allDistricts = await prisma.district.findMany({ select: { id: true, name: true, regionId: true } })
  const districtMap  = Object.fromEntries(
    allDistricts.map(d => [`${d.regionId}||${d.name}`, d])
  )

  // Step 5: bulk-insert all wards (batched 500 at a time to avoid payload limits)
  const wardRows = []
  for (const [regionName, rInfo] of Object.entries(GEO)) {
    const region = regionMap[regionName]
    if (!region) continue
    for (const [distName, wards] of Object.entries(rInfo.districts)) {
      const district = districtMap[`${region.id}||${distName}`]
      if (!district) continue
      for (const wardName of wards) {
        wardRows.push({ name: wardName, districtId: district.id })
      }
    }
  }

  // Insert wards in batches of 500
  const BATCH = 500
  for (let i = 0; i < wardRows.length; i += BATCH) {
    await prisma.ward.createMany({
      skipDuplicates: true,
      data: wardRows.slice(i, i + BATCH),
    })
    process.stdout.write(`\r  ↳ Wards: ${Math.min(i + BATCH, wardRows.length)} / ${wardRows.length}  `)
  }
  console.log('')

  const regCount  = await prisma.region.count()
  const distCount = await prisma.district.count()
  const wardCount = await prisma.ward.count()
  console.log(`  ✅ ${regCount} regions | ${distCount} districts | ${wardCount} wards`)

  // ── 3. HEALTH FACILITIES ────────────────────────────────────
  console.log('\n  [3] Health facilities...')
  const facility1 = await foc('healthFacility',{ facilityRegNo:'MNH-DAR-001' },{
    facilityRegNo:'MNH-DAR-001', facilityName:'Muhimbili National Hospital',
    facilityType:'hospital', facilityGrade:'H', ownershipType:'public',
  })
  const facility2 = await foc('healthFacility',{ facilityRegNo:'KCM-KIL-001' },{
    facilityRegNo:'KCM-KIL-001', facilityName:'Kilimanjaro Christian Medical Centre',
    facilityType:'hospital', facilityGrade:'H', ownershipType:'mission',
  })
  console.log('  ✅ 2 health facilities')

  // ── 4. DISTRICT ADMINS ──────────────────────────────────────
  console.log('\n  [4] District Admins...')
  const da1 = await foc('districtAdmin',{ email:'amina.mwinyi@nbs.go.tz' },{
    employeeId:'DA-001', nidaNumber:'19850414-07002-00001-21',
    fullName:'Amina Said Mwinyi', email:'amina.mwinyi@nbs.go.tz',
    passwordHash: await HASH('District@2026!'),
    mobile:'+255755002001', status:'active', mfaEnabled:false,
    createdById: sa1.id,
    regionId: regionMap['Kilimanjaro']?.id || null,
    districtId: (()=>{ const r=regionMap['Kilimanjaro']; return r ? districtMap[`${r.id}||Moshi District Council`]?.id : null })() || null,
  })
  const da2 = await foc('districtAdmin',{ email:'grace.haule@nbs.go.tz' },{
    employeeId:'DA-002', nidaNumber:'19900315-19001-00001-21',
    fullName:'Grace Haule Mbwana', email:'grace.haule@nbs.go.tz',
    passwordHash: await HASH('District@2026!'),
    mobile:'+255755002002', status:'active', mfaEnabled:false,
    createdById: sa1.id,
    regionId: regionMap['Mwanza']?.id || null,
    districtId: (()=>{ const r=regionMap['Mwanza']; return r ? districtMap[`${r.id}||Ilemela Municipal Council`]?.id : null })() || null,
  })
  const da3 = await foc('districtAdmin',{ email:'peter.nduguru@nbs.go.tz' },{
    employeeId:'DA-003', nidaNumber:'19921201-01001-00001-21',
    fullName:'Peter Nduguru Swai', email:'peter.nduguru@nbs.go.tz',
    passwordHash: await HASH('District@2026!'),
    mobile:'+255755002003', status:'suspended', mfaEnabled:false,
    createdById: sa1.id,
    regionId: regionMap['Arusha']?.id || null,
  })
  console.log('  ✅ District Admins: password = District@2026!')

  // ── 5. VILLAGE OFFICERS ─────────────────────────────────────
  console.log('\n  [5] Village Officers...')
  // Find a real ward for Dar es Salaam
  const ilalaWard = await prisma.ward.findFirst({
    where: { name: 'Kariakoo' },
    include: { district: true }
  })
  const vo1 = await foc('villageOfficer',{ email:'juma.salehe@vo.nbs.go.tz' },{
    employeeId:'VO-0891', nidaNumber:'19930801-01012-00001-21',
    fullName:'Juma Mwanga Salehe', email:'juma.salehe@vo.nbs.go.tz',
    passwordHash: await HASH('Officer@2026!'),
    mobile:'+255756003001', status:'active', mfaEnabled:false,
    createdById: da2.id,
    wardId:     ilalaWard?.id || null,
    districtId: ilalaWard?.districtId || (()=>{ const r=regionMap['Dar es Salaam']; return r ? districtMap[`${r.id}||Dar es Salaam City Council`]?.id : null })() || null,
  })
  const vo2 = await foc('villageOfficer',{ email:'neema.chande@vo.nbs.go.tz' },{
    employeeId:'VO-0892', nidaNumber:'19950615-07003-00001-21',
    fullName:'Neema Fumo Chande', email:'neema.chande@vo.nbs.go.tz',
    passwordHash: await HASH('Officer@2026!'),
    mobile:'+255756003002', status:'active', mfaEnabled:false,
    createdById: da2.id,
    districtId: (()=>{ const r=regionMap['Dar es Salaam']; return r ? districtMap[`${r.id}||Temeke Municipal Council`]?.id : null })() || null,
  })
  console.log('  ✅ Village Officers: password = Officer@2026!')

  // ── 6. HOSPITAL OFFICERS ────────────────────────────────────
  console.log('\n  [6] Hospital Officers...')
  const ho1 = await foc('hospitalOfficer',{ email:'dr.fatuma.hospital@mnh.go.tz' },{
    employeeId:'HO-0101', nidaNumber:'19780520-07001-00010-21',
    fullName:'Dr. Fatuma Ally Rashidi', email:'dr.fatuma.hospital@mnh.go.tz',
    passwordHash: await HASH('Hospital@2026!'),
    mobile:'+255757004001', status:'active', mfaEnabled:false,
    createdById: da1.id, facilityId: facility1.id,
    districtId: (()=>{ const r=regionMap['Dar es Salaam']; return r ? districtMap[`${r.id}||Dar es Salaam City Council`]?.id : null })() || null,
  })
  const ho2 = await foc('hospitalOfficer',{ email:'dr.james.mwamba@kcmc.go.tz' },{
    employeeId:'HO-0102', nidaNumber:'19820310-08001-00005-21',
    fullName:'Dr. James Mwamba Ochieng', email:'dr.james.mwamba@kcmc.go.tz',
    passwordHash: await HASH('Hospital@2026!'),
    mobile:'+255757004002', status:'active', mfaEnabled:false,
    createdById: da1.id, facilityId: facility2.id,
    districtId: (()=>{ const r=regionMap['Kilimanjaro']; return r ? districtMap[`${r.id}||Moshi Municipal Council`]?.id : null })() || null,
  })
  console.log('  ✅ Hospital Officers: password = Hospital@2026!')

  // ── 7. SAMPLE CITIZENS ──────────────────────────────────────
  console.log('\n  [7] Sample citizens...')
  const c1 = await foc('citizen',{ nationalId:'19680501-07012-00001-21' },{
    nationalId:'19680501-07012-00001-21', firstName:'Davidi', middleName:'Constantino', surname:'Kalinga',
    gender:'male', dateOfBirth:new Date('1968-05-01'), age:57, vitalStatus:'alive',
    maritalStatus:'married', educationLevel:'primary', occupations:{ primary:'Farmer' },
    regionId: regionMap['Mbeya']?.id || null,
  })
  const c2 = await foc('citizen',{ nationalId:'19720315-07012-00002-11' },{
    nationalId:'19720315-07012-00002-11', firstName:'Roida', middleName:'Angelo', surname:'Kabonge',
    gender:'female', dateOfBirth:new Date('1972-03-15'), age:53, vitalStatus:'alive',
    maritalStatus:'married', educationLevel:'primary', occupations:{ primary:'Farmer' },
    regionId: regionMap['Mbeya']?.id || null,
  })
  const c3 = await foc('citizen',{ nationalId:'20000414-05120-00043-07' },{
    nationalId:'20000414-05120-00043-07', firstName:'Damian', middleName:'Davidi', surname:'Kalinga',
    gender:'male', dateOfBirth:new Date('2000-04-14'), age:25, vitalStatus:'alive',
    maritalStatus:'single', educationLevel:'bachelor', occupations:{ primary:'Student' },
    fatherCitizenId: c1?.id || null, motherCitizenId: c2?.id || null,
    wardId: ilalaWard?.id || null,
    regionId: regionMap['Iringa']?.id || null,
  })
  const c4 = await foc('citizen',{ nationalId:'19911023-07031-00015-05' },{
    nationalId:'19911023-07031-00015-05', firstName:'Godison', middleName:'Nicholaus', surname:'Minja',
    gender:'male', dateOfBirth:new Date('1991-10-23'), age:33, vitalStatus:'deceased',
    maritalStatus:'single', educationLevel:'primary', occupations:{ primary:'Peasant' },
    regionId: regionMap['Kilimanjaro']?.id || null,
  })
  const ch = await foc('citizen',{ nationalId:'19901015-12042-00006-41' },{
    nationalId:'19901015-12042-00006-41', firstName:'Noah', middleName:'E', surname:'Joseph',
    gender:'male', dateOfBirth:new Date('1990-10-15'), age:35, vitalStatus:'alive',
    maritalStatus:'married', educationLevel:'o_level', occupations:{ primary:'Business' },
    regionId: regionMap['Mbeya']?.id || null,
  })
  const cw = await foc('citizen',{ nationalId:'19930325-12042-00008-27' },{
    nationalId:'19930325-12042-00008-27', firstName:'Shukran', middleName:'E', surname:'Mbuba',
    gender:'female', dateOfBirth:new Date('1993-03-25'), age:32, vitalStatus:'alive',
    maritalStatus:'married', educationLevel:'o_level', occupations:{ primary:'Business' },
    regionId: regionMap['Mbeya']?.id || null,
  })
  console.log('  ✅ 6 sample citizens')

  // ── 8. CIVIL REGISTRY SAMPLES ───────────────────────────────
  console.log('\n  [8] Civil registry samples...')
  if (c3 && c1 && c2) {
    await foc('birth',{ birthCertNo:'35397789-A' },{
      birthCertNo:'35397789-A', childCitizenId:c3.id,
      childFirstName:'Damian', childMiddleName:'Davidi', childSurname:'Kalinga',
      gender:'male', dateOfBirth:new Date('2000-04-14'),
      fatherCitizenId:c1.id, motherCitizenId:c2.id,
      facilityId:facility1.id, officerId:ho1.id,
      registeredAt:new Date('2024-04-21'), ritaSynced:true,
    })
  }
  if (c4) {
    await foc('death',{ deathCertNo:'84092-A' },{
      deathCertNo:'84092-A', citizenId:c4.id, nationalId:c4.nationalId,
      dateOfDeath:new Date('2014-12-23'), causeOfDeath:'Natural causes', ageAtDeath:33,
      locationType:'hospital', category:'adult', placeOfDeath:'Shaurimoyo, Moshi Kilimanjaro',
      lastResidence:'Shaurimoyo, Moshi, Kilimanjaro', occupation:'Peasant',
      informantName:'Monica Godison Minja',
      facilityId:facility2.id, hospitalOfficerId:ho2.id,
      registeredAt:new Date('2024-11-05'), ritaSynced:true,
    })
  }
  if (ch && cw && regionMap['Mbeya'] && vo1) {
    await foc('marriage',{ marriageCertNo:'F-000077562' },{
      marriageCertNo:'F-000077562', husbandId:ch.id, wifeId:cw.id,
      husbandNid:ch.nationalId, wifeNid:cw.nationalId,
      husbandAge:31, wifeAge:28, husbandStatusPrev:'HAJAOA', wifeStatusPrev:'HAJAOLEWA',
      marriageDate:new Date('2021-12-13'), marriagePlace:'Chunya, Mbeya',
      regionId:regionMap['Mbeya'].id, religion:'islamic',
      kindOfMarriage:'potentially_polygamous',
      witness1Name:'Gari L. Mwanisenga', witness2Name:'Yusta E. Yakusola',
      registrarName:'Michombero R. Anaklety', registeredById:vo1.id,
      status:'active', registeredAt:new Date('2021-12-13'), ritaSynced:true,
    })
  }
  console.log('  ✅ Birth, death, marriage records')

  // ── 9. POPULATION SNAPSHOTS (2022 PHC) ─────────────────────
  console.log('\n  [9] Population snapshots (2022 PHC)...')
  await foc('populationSnapshot',{ id:'national-2022' },{
    id:'national-2022', snapshotDate:new Date('2022-08-26'), level:'national', scopeId:1,
    totalPopulation:61741120n, maleCount:30015000n, femaleCount:31726120n,
    ageDistribution: JSON.stringify({
      '0-4':{ male:7580,female:7320 }, '5-9':{ male:7240,female:7060 },
      '10-14':{ male:6980,female:6820 }, '15-19':{ male:6420,female:6380 },
      '20-24':{ male:5840,female:5960 }, '25-29':{ male:5020,female:5180 },
      '30-34':{ male:4180,female:4320 }, '35-39':{ male:3420,female:3580 },
      '40-44':{ male:2780,female:2920 }, '45-49':{ male:2240,female:2380 },
      '50-54':{ male:1820,female:1960 }, '55-59':{ male:1380,female:1520 },
      '60-64':{ male:1020,female:1180 }, '65-69':{ male:780,female:920 },
      '70-74':{ male:580,female:720 }, '75+':{ male:420,female:580 },
    }),
    generatedAt:new Date('2023-03-01'),
  })

  // Real 2022 PHC regional populations
  const REGIONAL_POP = [
    { name:'Dodoma',          total:3085625, male:1512760, female:1572865, hh:757821 },
    { name:'Arusha',          total:2356255, male:1125616, female:1230639, hh:615182 },
    { name:'Kilimanjaro',     total:1861934, male:907636,  female:954298,  hh:503225 },
    { name:'Tanga',           total:2615597, male:1281020, female:1334577, hh:651782 },
    { name:'Morogoro',        total:3197104, male:1570880, female:1626224, hh:829456 },
    { name:'Pwani',           total:2024947, male:994700,  female:1030247, hh:546512 },
    { name:'Dar es Salaam',   total:5383728, male:2648743, female:2734985, hh:1193940 },
    { name:'Lindi',           total:1194028, male:579280,  female:614748,  hh:299840 },
    { name:'Mtwara',          total:1634947, male:777240,  female:857707,  hh:412530 },
    { name:'Ruvuma',          total:1848794, male:896340,  female:952454,  hh:460950 },
    { name:'Iringa',          total:1192728, male:568820,  female:623908,  hh:299430 },
    { name:'Mbeya',           total:2343754, male:1145870, female:1197884, hh:634121 },
    { name:'Singida',         total:2008058, male:985700,  female:1022358, hh:393527 },
    { name:'Tabora',          total:3391679, male:1678110, female:1713569, hh:599316 },
    { name:'Rukwa',           total:1540519, male:756890,  female:783629,  hh:368240 },
    { name:'Kigoma',          total:2470967, male:1214440, female:1256527, hh:472696 },
    { name:'Shinyanga',       total:2241299, male:1101860, female:1139439, hh:431280 },
    { name:'Kagera',          total:2989299, male:1468160, female:1521139, hh:710220 },
    { name:'Mwanza',          total:3699872, male:1820880, female:1878992, hh:755234 },
    { name:'Mara',            total:2372015, male:1163840, female:1208175, hh:474403 },
    { name:'Manyara',         total:1892502, male:931550,  female:960952,  hh:455080 },
    { name:'Njombe',          total:889946,  male:424490,  female:465456,  hh:242170 },
    { name:'Katavi',          total:1152958, male:574320,  female:578638,  hh:271390 },
    { name:'Simiyu',          total:2141821, male:1056800, female:1085021, hh:319077 },
    { name:'Geita',           total:2977608, male:1468120, female:1509488, hh:561232 },
    { name:'Songwe',          total:1344687, male:661720,  female:682967,  hh:328480 },
    { name:'Kaskazini Unguja',total:257290,  male:126040,  female:131250,  hh:68120  },
    { name:'Kusini Unguja',   total:195873,  male:95740,   female:100133,  hh:52300  },
    { name:'Mjini Magharibi', total:893169,  male:435780,  female:457389,  hh:238520 },
    { name:'Kaskazini Pemba', total:272091,  male:133280,  female:138811,  hh:73140  },
    { name:'Kusini Pemba',    total:271350,  male:132740,  female:138610,  hh:72980  },
  ]

  for (const rp of REGIONAL_POP) {
    const region = regionMap[rp.name]
    if (!region) continue
    await foc('populationSnapshot',{ id:`region-${region.id}-2022` },{
      id:`region-${region.id}-2022`, snapshotDate:new Date('2022-08-26'),
      level:'region', scopeId:region.id,
      totalPopulation:BigInt(rp.total), maleCount:BigInt(rp.male), femaleCount:BigInt(rp.female),
      ageDistribution: JSON.stringify({ households: rp.hh }),
      generatedAt:new Date('2023-03-01'),
    })
  }
  console.log('  ✅ 32 population snapshots (national + 31 regions)')

  // ── 10. AUDIT LOGS ──────────────────────────────────────────
  await prisma.auditLog.createMany({ skipDuplicates:true, data:[
    { actorId:sa1.id, actorRole:'super_admin', action:'LOGIN',                targetTable:'super_admins',  targetId:sa1.id, ipAddress:'197.186.1.10' },
    { actorId:da1.id, actorRole:'district_admin', action:'VALIDATE_RECORDS',  targetTable:'citizens',                      ipAddress:'41.220.3.89'  },
    { actorId:sa2.id, actorRole:'super_admin', action:'CREATE_DISTRICT_ADMIN',targetTable:'district_admins',targetId:da1.id,ipAddress:'197.186.1.22' },
  ]}).catch(()=>null)

  console.log('\n✅ Seed complete!')
  console.log('═══════════════════════════════════════════════════')
  console.log('  LOGIN CREDENTIALS')
  console.log('  Super Admin : dr.fatuma.rashid@nbs.go.tz / Admin@2026!')
  console.log('  Super Admin : john.amsterdam@nbs.go.tz   / Admin@2026!')
  console.log('  Super Admin : emmanuel.kihega@nbs.go.tz  / Admin@2026!')
  console.log('  District    : amina.mwinyi@nbs.go.tz     / District@2026!')
  console.log('  Vill Officer: juma.salehe@vo.nbs.go.tz   / Officer@2026!')
  console.log('  Hosp Officer: dr.fatuma.hospital@mnh.go.tz / Hospital@2026!')
  console.log('═══════════════════════════════════════════════════')
}

main().catch(console.error).finally(()=>prisma.$disconnect())
"""

# Inject GEO data (embedded from 2022 PHC PDF extraction)
geo_js = """const GEO = {
  'Dodoma': { jurisdiction: 'mainland', districts: {
    'Kondoa District Council': ['Changaa', 'Hondomairo', 'Thawi', 'Kikilo', 'Soera', 'Salanka', 'Bereko', 'Kikore', 'Mnenia', 'Masange', 'Itololo', 'Kisese', 'Itaswi', 'Keikei', 'Kwadelo', 'Busi', 'Kalamba', 'Haubi', 'Kinyasi', 'Pahi', 'Bumbuta'],
    'Kondoa Town Council': ['Kondoa Mjini', 'Kilimani', 'Chemchem', 'Suruke', 'Kingale', 'Serya', 'Bolisa', 'Kolo'],
    'Mpwapwa District Council': ['Mazae', 'Ving\\'hawe', 'Matomondo', 'Kimagai', 'Chunyu', 'Godegode', 'Mpwapwa Mjini', 'Lupeta', 'Gulwe', 'Ng\\'hambi', 'Mlembule', 'Mima', 'Berege', 'Chitemo', 'Iwondo', 'Kibakwe', 'Lumuma', 'Luhundwa', 'Wotta', 'Mbuga', 'Kingiti', 'Lufu', 'Pwaga', 'Galigali', 'Wangi', 'Massa', 'Ipera', 'Rudi', 'Mlunduzi', 'Mtera', 'Chipogoro', 'Malolo', 'Mang\\'aliza'],
    'Kongwa District Council': ['Hogoro', 'Zoissa', 'Mkoka', 'Makawa', 'Chitego', 'Matongoro', 'Songambele', 'Njoge', 'Pandambili', 'Mlali', 'Iduo', 'Kibaigwa', 'Chamkoroma', 'Ngomai', 'Chiwe', 'Lenjulu', 'Ng\\'humbi', 'Kongwa', 'Sejeli', 'Mtanana', 'Sagara', 'Ugogoni'],
    'Chamwino District Council': ['Haneti', 'Segala', 'Itiso', 'Dabalo', 'Zajilwa', 'Membe', 'Msanga', 'Chilonwa', 'Buigiri', 'Majeleko', 'Manchali', 'Ikowa', 'Msamalo', 'Chamwino', 'Igandu', 'Muungano', 'Mvumi Makulu', 'Handali', 'Mvumi Misheni', 'Idifu', 'Nghahelezi', 'Makang\\'wa', 'Iringa Mvumi', 'Manzase', 'Fufu', 'Mlowa Bwawani', 'Loje', 'Chiboli', 'Nhinhi', 'Ikombolinga', 'Mlowa Barabarani', 'Mpwayungu', 'Nghambaku', 'Chinugulu', 'Manda', 'Huzi'],
    'Dodoma City Council': ['Msalato', 'Makutupora', 'Chihanga', 'Hombolo Makulu', 'Ipala', 'Chahwa', 'Hombolo Bwawani', 'Mtumba', 'Kikombo', 'Nghong\\'onha', 'Ihumwa', 'Viwandani', 'Uhuru', 'Chamwino', 'Kiwanja cha Ndege', 'Makole', 'Miyuji', 'Nzuguni', 'Dodoma Makulu', 'Tambukareli', 'Kilimani', 'Kikuyu Kusini', 'Kikuyu Kaskazini', 'Mkonze', 'Hazina', 'Madukani', 'Majengo', 'Kizota', 'Ntyuka', 'Chang\\'ombe', 'Iyumbu', 'Mnadani', 'Ipagala', 'Nkuhungu', 'Mpunguzi', 'Mbabala', 'Zuzu', 'Nala', 'Mbalawala', 'Chigongwe', 'Matumbulu'],
    'Bahi District Council': ['Ibugule', 'Chibelela', 'Mwitikira', 'Mtitaa', 'Chikola', 'Chipanga', 'Chali', 'Nondwa', 'Mpalanga', 'Chifutuka', 'Bahi', 'Mpamantwa', 'Ibihwa', 'Ilindi', 'Kigwe', 'Mpinga', 'Makanda', 'Lamaiti', 'Babayu', 'Zanka', 'Msisi', 'Mundemu'],
    'Chemba District Council': ['Churuku', 'Mondo', 'Dalai', 'Jangalo', 'Paranga', 'Msaada', 'Kimaha', 'Songolo', 'Mrijo', 'Chandama', 'Goima', 'Chemba', 'Kidoka', 'Soya', 'Makorongo', 'Gwandi', 'Farkwa', 'Tumbakose', 'Babayu', 'Ovada', 'Mpendo', 'Sanzawa', 'Kwamtoro', 'Lalta', 'Lahoda', 'Kinyamsindo'],
  }},
  'Arusha': { jurisdiction: 'mainland', districts: {
    'Monduli District Council': ['Monduli Juu', 'Engutoto', 'Monduli Mjini', 'Moita', 'Sepeko', 'Lolkisale', 'Lepurko', 'Meserani', 'Mfereji', 'Lashaine', 'Naalarami', 'Lemooti', 'Makuyuni', 'Esilalei', 'Mswakini', 'Engaruka', 'Selela', 'Mto wa Mbu', 'Majengo', 'Migungani'],
    'Meru District Council': ['Ngarenanyuki', 'Leguruki', 'King\\'ori', 'Maji ya Chai', 'Kikatiti', 'Ngabobo', 'Uwiro', 'Maruvango', 'Malula', 'Imbaseni', 'Usariver', 'Nkoaranga', 'Poli', 'Seela Sing\\'isi', 'Akheri', 'Nkoanrua', 'Songoro', 'Nkoarisambu', 'Nkoanekoli', 'Ambureni', 'Maroroni', 'Makiba', 'Mbuguni', 'Kikwe', 'Majengo', 'Shambarai Burka'],
    'Arusha District Council': ['Oldonyosambu', 'Lengijave', 'Olturumet', 'Mwandet', 'Musa', 'Kisongo', 'Mateves', 'Oldonyowass', 'Lemanyata', 'Laroi', 'Ilkiding\\'a', 'Olturoto', 'Moivo', 'Kiranyi', 'Kimnyak', 'Oljoro', 'Sambasha', 'Oloirien', 'Olmotonyi', 'Tarakwa', 'Ilboru', 'Bangata', 'Sokon II', 'Bwawani', 'Nduruma', 'Mlangarini', 'Kiutu'],
    'Longido District Council': ['Matale A', 'Engarenaibor', 'Mundarara', 'Ketumbeine', 'Elang\\'atadapash', 'Ilorienito', 'Gelai Meirugoi', 'Gelai Lumbwa', 'Noondoto', 'Engikaret', 'Kimokouwa', 'Namanga', 'Orbomba', 'Longido', 'Tingatinga', 'Olmolog', 'Kamwanga', 'Sinya'],
    'Karatu District Council': ['Baray', 'Mang\\'ola', 'Endamaghang', 'Karatu', 'Daa', 'Oldeani', 'Qurus', 'Ganako', 'Rhotia', 'Mbulumbulu', 'Endamarariek', 'Buger', 'Endabash', 'Kansay'],
    'Ngorongoro District Council': ['Orgosorok', 'Arash', 'Soitsambu', 'Enguserosambu', 'Olorien/Magaiduru', 'Maalon', 'Ololosokwan', 'Oloipiri', 'Digodigo', 'Oldonyosambu', 'Pinyinyi', 'Sale', 'Malambo', 'Samunge', 'Kirangi', 'Engaresero', 'Piyaya', 'Naiyobi', 'Nainokanoka', 'Olbalbal', 'Ngorongoro', 'Enduleni', 'Kakesio', 'Alailelai', 'Ngoile', 'Misigiyo', 'Alaitolei', 'Eyasi'],
    'Arusha City Council': ['Kati', 'Kaloleni', 'Sekei', 'Themi', 'Daraja II', 'Unga Ltd', 'Ngarenaro', 'Levolosi', 'Kimandolu', 'Baraa', 'Oloirien', 'Moshono', 'Moivaro', 'Lemara', 'Terrat', 'Sokon I', 'Sombetini', 'Engutoto', 'Elerai', 'Olasiti', 'Muriet', 'Olmoti', 'Sakina', 'Osunyai Jr', 'Sinoni'],
  }},
  'Kilimanjaro': { jurisdiction: 'mainland', districts: {
    'Rombo District Council': ['Motamburu Kitendeni', 'Tarakea Motamburu', 'Nanjara', 'Reha', 'Ubetu Kahe', 'Kitirima', 'Kingachi', 'Kirongo Samanga', 'Olele', 'Marangu Kitowo', 'Kisale Msaranga', 'Katangara/Mrere', 'Kirwa Keni', 'Mrao Keryo', 'Ushiri/Ikuini', 'Kelamfua/Mokala', 'Makiidi', 'Shimbi', 'Shimbi Kwandele', 'Aleni', 'Mengeni', 'Manda', 'Mengwe', 'Ngoyoni', 'Mamsera', 'Chala', 'Holili', 'Mahida'],
    'Mwanga District Council': ['Kighare', 'Kirongwe', 'Chomvu', 'Mwaniko', 'Msangeni', 'Kifula', 'Shighatini', 'Kivisini', 'Jipe', 'Kigonigoni', 'Toloha', 'Kwakoa', 'Mgagao', 'Kirya', 'Kilomeni', 'Lembeni', 'Ngujini', 'Kileo', 'Lang\\'ata', 'Mwanga'],
    'Same District Council': ['Ruvu', 'Njoro', 'Vumari', 'Stesheni', 'Same', 'Kisima', 'Kisiwani', 'Bangalala', 'Mwembe', 'Mhezi', 'Mshewa', 'Msindo', 'Vudee', 'Hedaru', 'Gavao-Saweni', 'Mabilioni', 'Makanya', 'Suji', 'Tae', 'Chome', 'Vuje', 'Bombo', 'Mtii', 'Lugulu', 'Maore', 'Kalemawe', 'Kihurio', 'Bendera', 'Ndungu', 'Vunta', 'Kirangare', 'Myamba', 'Mpinji', 'Bwambo'],
    'Moshi Municipal Council': ['Kilimanjaro', 'Mfumuni', 'Kiusa', 'Korongoni', 'Soweto', 'Shirimatunda', 'Karanga', 'Rau', 'Bomambuzi', 'Majengo', 'Mawenzi', 'Bondeni', 'Kiborloni', 'Ng\\'ambo', 'Msaranga', 'Mji Mpya', 'Miembeni', 'Njoro', 'Kaloleni', 'Pasua'],
    'Moshi District Council': ['Kindi', 'Kibosho Magharibi', 'Kibosho Okaoni', 'Kibosho Kati', 'Kibosho Kirima', 'Kibosho Mashariki', 'Uru Kusini', 'Uru Kaskazini', 'Uru Shimbwe', 'Uru Mashariki', 'Mbokomu', 'Old Moshi Magharibi', 'Old Moshi Mashariki', 'Kimochi', 'Arusha Chini', 'Mabogini', 'Kirua Vunjo Magharibi', 'Kilema Kaskazini', 'Kilema Kati', 'Kahe Mashariki', 'Kahe Magharibi', 'Kirua Vunjo Kusini', 'Kirua Vunjo Mashariki', 'Kilema Kusini', 'Njia Panda', 'Marangu Magharibi', 'Marangu Mashariki', 'Mamba Kusini', 'Mamba Kaskazini', 'Mwika Kaskazini', 'Mwika Kusini', 'Makuyuni'],
    'Hai District Council': ['Machame Uroki', 'Machame Magharibi', 'Machame Kaskazini', 'Machame Mashariki', 'Machame Narumu', 'Mnadani', 'Weruweru', 'Masama Magharibi', 'Masama Kati', 'Masama Mashariki', 'Masama Rundugai', 'KIA', 'Muungano', 'Bondeni', 'Bomang\\'ombe', 'Masama Kusini', 'Romu'],
    'Siha District Council': ['Miti Mirefu', 'Ndumeti', 'Ngarenairobi', 'Karansi', 'Gararagua', 'Sanya Juu', 'Livishi', 'Nasai', 'Kirua', 'Ivaeny', 'Kashashi', 'Ormelili', 'Olkolili', 'Donyomurwak', 'Songu', 'Biriri', 'Makiwaru'],
  }},
  'Tanga': { jurisdiction: 'mainland', districts: {
    'Lushoto District Council': ['Lushoto', 'Magamba', 'Kwai', 'Migambo', 'Gare', 'Kwemashai', 'Ngulwi', 'Ubiri', 'Ngwelo', 'Kilole', 'Mlola', 'Makanya', 'Malibwi', 'Mbwei', 'Kwekanga', 'Rangwi', 'Sunga', 'Mbaru', 'Mtae', 'Shagayu', 'Mbaramo', 'Mnazi', 'Lunguza', 'Mng\\'aro', 'Shume', 'Lukozi', 'Malindi', 'Mwangoi', 'Manolo', 'Mlalo', 'Kwemshasha', 'Hemtoye'],
    'Bumbuli District Council': ['Baga', 'Mgwashi', 'Nkongoi', 'Kwemkomole', 'Bumbuli', 'Kisiwani', 'Mamba', 'Milingano', 'Mayo', 'Mahezangulu', 'Tamota', 'Funta', 'Soni', 'Mbuzii', 'Mponde', 'Usambara', 'Vuga'],
    'Korogwe District Council': ['Makuyuni', 'Chekelei', 'Mombo', 'Mkalamo', 'Mazinde', 'Mkomazi', 'Mswaha', 'Magamba Kwalukonge', 'Mkumbara', 'Magila Gereza', 'Vugiri', 'Dindira', 'Bungu', 'Lutindi', 'Kwashemshi', 'Mpale', 'Mgwashi', 'Mlungui', 'Lewa', 'Mashewa', 'Kizara', 'Magoma', 'Kerenge', 'Kalalani', 'Foroforo', 'Makumba', 'Kwagunda', 'Mnyuzi', 'Hale'],
    'Korogwe Town Council': ['Mgombezi', 'Mtonga', 'Magunga', 'Kwamndolwa', 'Old Korogwe', 'Manundu', 'Kilole', 'Kwamsisi', 'Masuguru', 'Majengo', 'Bagamoyo'],
    'Muheza District Council': ['Misozwe', 'Pande Darajani', 'Ngomeni', 'Kigombe', 'Lusanga', 'Kicheba', 'Mpapayu', 'Mlingano', 'Kwemingoji', 'Magoroto', 'Magila', 'Mbaramo', 'Majengo', 'Masuguru', 'Tingeni', 'Kilulu', 'Mkuzi', 'Mtindiro', 'Kwakifua', 'Kwemkabala', 'Genge', 'Tanganyika', 'Kwabada', 'Kwafungo', 'Songa', 'Bwembwera', 'Potwe', 'Nkumba', 'Tongwe', 'Mhamba', 'Makole', 'Misalai', 'Zirai', 'Mbomole', 'Amani', 'Kwezitu'],
    'Tanga City Council': ['Nguvumali', 'Chumbageni', 'Mzizima', 'Mabokweni', 'Kiomoni', 'Chongoleani', 'Central', 'Ngamiani Kaskazini', 'Usagara', 'Makorora', 'Mzingani', 'Mnyanjani', 'Majengo', 'Ngamiani Kati', 'Ngamiani Kusini', 'Msambweni', 'Mwanzange', 'Mabawa', 'Magaoni', 'Tangasisi', 'Tongoni', 'Marungu', 'Pongwe', 'Maweni', 'Duga', 'Kirare', 'Masiwani'],
    'Pangani District Council': ['Madanga', 'Kimang\\'a', 'Bushiri', 'Masaika', 'Pangani Mashariki', 'Pangani Magharibi', 'Bweni', 'Mwera', 'Tungamaa', 'Kipumbwi', 'Mikinguni', 'Ubangaa', 'Mkwaja', 'Mkalamo'],
    'Handeni District Council': ['Sindeni', 'Misima', 'Kiva', 'Kwamatuku', 'Segera', 'Kwedizinga', 'Kwamgwe', 'Ndolwa', 'Kabuku', 'Mgambo', 'Komkonga', 'Kabuku Ndani', 'Mazingara', 'Mkata', 'Kitumbi', 'Kwamsisi', 'Kwasunga', 'Kwaluguru', 'Kang\\'ata', 'Kwankonje', 'Kwachaga'],
    'Handeni Town Council': ['Malezi', 'Kwenjugo', 'Mabanda', 'Konje', 'Mlimani', 'Msasa', 'Kideleko', 'Kwamagome', 'Vibaoni', 'Chanika', 'Mdoe', 'Kwediyamba'],
    'Kilindi District Council': ['Mvungwe', 'Kwediboma', 'Saunyi', 'Kisangasa', 'Kibirashi', 'Kilwa', 'Mkindi', 'Jaila', 'Msanja', 'Mabalanga', 'Kimbe', 'Kilindi', 'Negero', 'Lwande', 'Kikunde', 'Songe', 'Pagwi', 'Masagalu', 'Tunguli', 'Kwekivu', 'Bokwa'],
    'Mkinga District Council': ['Mwakijembe', 'Mkinga', 'Duga', 'Moa', 'Manza', 'Kwale', 'Mtimbwani', 'Doda', 'Boma', 'Parungu Kasera', 'Mayomboni', 'Sigaya', 'Gombero', 'Mhinduro', 'Maramba', 'Kigongoi Mashariki', 'Daluni', 'Bosha', 'Mapatano', 'Bwiti', 'Mnyenzani', 'Kigongoi Magharibi'],
  }},
  'Morogoro': { jurisdiction: 'mainland', districts: {
    'Kilosa District Council': ['Mabula', 'Maguha', 'Berega', 'Magubike', 'Mamboya', 'Dumila', 'Magole', 'Msowero', 'Kitete', 'Mbigiri', 'Mtumbatu', 'Mvumi', 'Rudewa', 'Kimamba A', 'Kimamba B', 'Lumbiji', 'Madoto', 'Parakuyo'],
    'Morogoro District Council': ['Mkambalani', 'Mikese', 'Gwata', 'Kidugalo', 'Mkulazi', 'Ngerengere', 'Tununguo', 'Matuli', 'Kinole', 'Kiroka', 'Mkuyuni', 'Tegetero', 'Kibuko', 'Tomondo', 'Kibogwa', 'Kibungo', 'Kisemu', 'Lundi', 'Mtombozi', 'Tawa', 'Konde', 'Kasanga', 'Kolero', 'Mvuha', 'Selembala', 'Bungu', 'Bwakira Chini', 'Bwakira Juu', 'Kisaki', 'Mngazi', 'Singisa'],
    'Morogoro Municipal Council': ['Sabasaba', 'Uwanja wa Taifa', 'Kiwanja cha Ndege', 'Mji Mpya', 'Kingo', 'Mji Mkuu', 'Sultan Area', 'Mafiga', 'Mazimbu', 'Mwembesongo', 'Kichangani', 'Kilakala', 'Boma', 'Mlimani', 'Mbuyuni', 'Kingolwira', 'Bigwa', 'Mzinga', 'Kihonda', 'Kauzeni', 'Luhungo', 'Magadu', 'Mindu', 'Chamwino', 'Lukobe', 'Mkundi', 'Kihonda Maghorofani', 'Mafisa', 'Tungi'],
    'Mlimba District Council': ['Uchindile', 'Masagati', 'Utengule', 'Kamwene', 'Mlimba', 'Kalengakelu', 'Chisano', 'Ching\\'anda', 'Chita', 'Mngeta', 'Mchombe', 'Igima', 'Mbingu', 'Mofu', 'Namwawala', 'Idete'],
    'Ifakara Town Council': ['Kidatu', 'Msolwa Station', 'Sanje', 'Mkula', 'Mang\\'ula', 'Mang\\'ula \\'B\\'', 'Mwaya', 'Kisawasawa', 'Kiberege', 'Signal', 'Kibaoni', 'Mbasa', 'Katindiuka', 'Michenga', 'Lumemo', 'Ifakara', 'Lipangalala', 'Mlabani', 'Viwanjasitini'],
    'Ulanga District Council': ['Ruaha', 'Chilombola', 'Sali', 'Euga', 'Mwaya', 'Lukande', 'Mbuga', 'Ilonga', 'Ketaketa', 'Msogezi', 'Vigoi', 'Mahenge Mjini', 'Isongo', 'Uponera', 'Mawasiliano', 'Nawenge', 'Minepa', 'Lupiro', 'Kichangani', 'Iragua', 'Milola'],
    'Malinyi District Council': ['Kilosa Mpepo', 'Ngoheranga', 'Biro', 'Igawa', 'Malinyi', 'Sofi', 'Usangule', 'Mtimbira', 'Itete', 'Njiwa'],
    'Mvomero District Council': ['Bunduki', 'Kikeo', 'Langali', 'Tchenzema', 'Luale', 'Mgeta', 'Nyandira', 'Mzumbe', 'Mlali', 'Doma', 'Melela', 'Homboza', 'Lubungo', 'Mangae', 'Msongozi', 'Mvomero', 'Hembeti', 'Maskati', 'Kibati', 'Dakawa', 'Kinda', 'Mkindo', 'Pemba', 'Sungaji', 'Mhonda', 'Diongoya', 'Mtibwa', 'Kanga', 'Kweuma', 'Mziha'],
    'Gairo District Council': ['Chakwale', 'Iyogwe', 'Idibo', 'Kibedya', 'Msingisi', 'Gairo', 'Rubeho', 'Italagwe', 'Chigela', 'Leshata', 'Madege', 'Magoweko', 'Mkalama', 'Ukwamani', 'Mandege', 'Chagongwe', 'Chanjale', 'Nongwe'],
  }},
  'Pwani': { jurisdiction: 'mainland', districts: {
    'Bagamoyo District Council': ['Makurunge', 'Magomeni', 'Kisutu', 'Nianjema', 'Dunda', 'Fukayosi', 'Yombo', 'Kiromo', 'Zinga', 'Kerege', 'Mapinga'],
    'Chalinze District Council': ['Miono', 'Mandera', 'Kiwangwa', 'Msata', 'Kimange', 'Mbwewe', 'Kibindu', 'Lugoba', 'Msoga', 'Talawanda', 'Ubenazomozi', 'Bwilingu', 'Pera', 'Vigwaza'],
    'Kibaha District Council': ['Gwata', 'Dutumi', 'Magindu', 'Soga', 'Ruvu', 'Kwala', 'Kikongo', 'Mlandizi', 'Kilangalanga', 'Janga', 'Bokomnemela', 'Mtambani', 'Mtongani', 'Kawawa'],
    'Kibaha Town Council': ['Pangani', 'Mailimoja', 'Tumbi', 'Picha ya Ndege', 'Mkuza', 'Kibaha', 'Msangani', 'Tangini', 'Sofu', 'Kongowe', 'Misugusugu', 'Visiga', 'Mbwawa', 'Viziwaziwa'],
    'Kisarawe District Council': ['Mafizi', 'Kurui', 'Mzenga', 'Vihingo', 'Kisarawe', 'Msimbu', 'Masaki', 'Kibuta', 'Kiluvya', 'Kazimzumbwi', 'Marumbo', 'Maneromango', 'Msanga', 'Boga', 'Marui', 'Chole', 'Vikumburu'],
    'Mkuranga District Council': ['Mkuranga', 'Tambani', 'Vikindu', 'Vianzi', 'Kiparang\\'anda', 'Mwandege', 'Mipeko', 'Tengelea', 'Nyamato', 'Kimanzichana', 'Mkamba', 'Panzuo', 'Bupu', 'Mwarusembe', 'Beta', 'Kisegese', 'Mbezi', 'Shungubweni', 'Kisiju', 'Magawa', 'Kitomondo', 'Lukanga', 'Njianne', 'Msonga', 'Dondo'],
    'Rufiji District Council': ['Utete', 'Mkongo', 'Ngorongo', 'Mwaseni', 'Kipugira', 'Chemchem', 'Ngarambe', 'Ikwiriri', 'Mgomba', 'Umwe', 'Mohoro', 'Chumbi', 'Mbwara'],
    'Mafia District Council': ['Kanga', 'Kirongwe', 'Baleni', 'Ndagoni', 'Kilindoni', 'Miburani', 'Kiegeani', 'Jibondo'],
    'Kibiti District Council': ['Dimani', 'Kibiti', 'Mtawanya', 'Bungu', 'Mjawa', 'Mwambao', 'Mahege', 'Mchukwi', 'Mlanzi', 'Salale', 'Mtunda', 'Ruaruke', 'Msala', 'Maparoni', 'Mbuchi', 'Kiongoroni'],
  }},
  'Dar es Salaam': { jurisdiction: 'mainland', districts: {
    'Kinondoni Municipal Council': ['Kigogo', 'Mzimuni', 'Magomeni', 'Ndugumbi', 'Tandale', 'Kijitonyama', 'Kinondoni', 'Hananasif', 'Mwananyamala', 'Makumbusho', 'Makongo', 'Mbezi Juu', 'Wazo', 'Mabwepande', 'Bunju', 'Mbweni', 'Kunduchi', 'Kawe', 'Mikocheni', 'Msasani'],
    'Dar es Salaam City Council': ['Kariakoo', 'Jangwani', 'Gerezani', 'Kisutu', 'Mchafukoge', 'Upanga Mashariki', 'Upanga Magharibi', 'Kivukoni', 'Ilala', 'Mchikichini', 'Vingunguti', 'Kipawa', 'Buguruni', 'Kiwalani', 'Mnyamani', 'Minazi Mirefu', 'Tabata', 'Kinyerezi', 'Segerea', 'Kimanga', 'Liwiti', 'Bonyokwa', 'Kisukuru', 'Ukonga', 'Pugu', 'Msongola', 'Kitunda', 'Chanika', 'Kivule', 'Gongolamboto', 'Majohe', 'Zingiziwa', 'Buyuni', 'Pugu Station', 'Mzinga', 'Kipunguni'],
    'Temeke Municipal Council': ['Miburani', 'Azimio', 'Tandika', 'Sandali', 'Temeke', 'Chang\\'ombe', 'Keko', 'Kurasini', 'Mtoni', 'Buza', 'Makangarawe', 'Yombo Vituka', 'Kilakala', 'Kijichi', 'Mbagala Kuu', 'Toangoma', 'Mianzini', 'Kibondemaji', 'Chamazi', 'Kilungule', 'Charambe', 'Mbagala', 'Kiburugwa'],
    'Kigamboni Municipal Council': ['Kigamboni', 'Tungi', 'Mjimwema', 'Kibada', 'Vijibweni', 'Kimbiji', 'Pembamnazi', 'Somangila', 'Kisarawe II'],
    'Ubungo Municipal Council': ['Ubungo', 'Sinza', 'Manzese', 'Makurumla', 'Mburahati', 'Mabibo', 'Makuburi', 'Kimara', 'Saranga', 'Msigani', 'Kwembe', 'Kibamba', 'Mbezi', 'Goba'],
  }},
  'Lindi': { jurisdiction: 'mainland', districts: {
    'Kilwa District Council': ['Kikole', 'Kivinje', 'Songosongo', 'Masoko', 'Kiranjeranje', 'Mandawa', 'Lihimalyao', 'Pande', 'Likawage', 'Nanjirinji', 'Chumo', 'Kipatimu', 'Kandawale', 'Kibata', 'Namayuni', 'Tingi', 'Miteja', 'Mingumbi', 'Kinjumbi', 'Somanga', 'Njinjo', 'Mitole', 'Miguruwe'],
    'Mtama District Council': ['Mnolela', 'Chikonji', 'Chikukwe', 'Mandawa', 'Nchinga', 'Mpanyani', 'Mikwambe', 'Sekele', 'Mlawe', 'Nachunyu', 'Kitomanga'],
    'Lindi District Council': ['Pangatena', 'Navanga', 'Sudi', 'Nachunyu', 'Kiwalala', 'Mnolela', 'Nahukahuka', 'Nyangamara', 'Mandwanga', 'Longa', 'Mtumbya', 'Majengo', 'Namangale', 'Mtama', 'Nyangao', 'Namupa', 'Nyengedi', 'Mtua', 'Mnara', 'Chiponda'],
    'Lindi Municipal Council': ['Ndoro', 'Makonde', 'Mikumbi', 'Mitandi', 'Rahaleo', 'Mwenge', 'Matopeni', 'Wailes', 'Nachingwea', 'Rasbura', 'Mtanda', 'Jamhuri', 'Msinjahili', 'Chikonji', 'Mbanja', 'Kitumbikwela', 'Mingoyo', 'Mnazimmoja', 'Ng\\'apa', 'Tandangongoro', 'Rutamba', 'Milola', 'Kiwawa', 'Nangaru', 'Matimba', 'Mipingo', 'Kitomanga', 'Kilangala', 'Mvuleni', 'Kilolambwani', 'Mchinga'],
    'Nachingwea District Council': ['Kilimarondo', 'Mbondo', 'Kiegei', 'Matekwe', 'Lionja', 'Namikango', 'Nditi', 'Ngunichile', 'Ruponda', 'Mnero Miembeni', 'Namapwia', 'Kipara Mnero', 'Mkoka', 'Chiola', 'Mnero Ngongo', 'Marambo', 'Nambambo', 'Kilimanihewa', 'Nangowe', 'Stesheni', 'Namatula', 'Mitumbati', 'Ugawaji', 'Boma', 'Nachingwea Mjini', 'Mpiruka', 'Mkotokuyana', 'Naipanga', 'Naipingo', 'Mtua', 'Ndomoni', 'Kipara Mtua', 'Nang\\'ondo', 'Mchonda', 'Chiumbati Shuleni', 'Raha leo'],
    'Liwale District Council': ['Mlembwe', 'Makata', 'Barikiwa', 'Mkutano', 'Liwale Mjini', 'Mihumo', 'Ngongowele', 'Mbaya', 'Kimambi', 'Mpigamiti', 'Mangirikiti', 'Nangando', 'Likongowele', 'Kichonda', 'Lilombe', 'Kiangara', 'Kibutuka', 'Nangano', 'Mirui', 'Liwale \\'B\\''],
    'Ruangwa District Council': ['Mandawa', 'Nambilanje', 'Chibula', 'Ruangwa', 'Mbekenyera', 'Namichiga', 'Narungombe', 'Makanjiro', 'Likunja', 'Chunyu', 'Mandarawe', 'Nachingwea', 'Matambarale', 'Nkowe', 'Malolo', 'Luchelegwa', 'Chienjele', 'Mnacho', 'Nandagala', 'Nanganga', 'Chinongwe'],
  }},
  'Mtwara': { jurisdiction: 'mainland', districts: {
    'Mtwara District Council': ['Mahurunga', 'Tangazo', 'Madimba', 'Ziwani', 'Nanguruwe', 'Mbawala', 'Msanga Mkuu', 'Msimbati', 'Nalingu', 'Moma', 'Dihimba', 'Muungano', 'Lipwidi', 'Mangopachanne', 'Kitere', 'Ndumbwe', 'Mayanga', 'Naumbu', 'Libobe', 'Mpapura', 'Mkunwa'],
    'Nanyamba Town Council': ['Mnima', 'Kitaya', 'Kiromba', 'Chawi', 'Kiyanga', 'Njengwa', 'Nitekela', 'Nanyamba', 'Mtiniko', 'Namtumbuka', 'Milangominne', 'Mbembaleo', 'Mtimbwilimbwi', 'Dinyecha', 'Nyundo', 'Mnongodi', 'Hinju'],
    'Mtwara Municipal Council': ['Majengo', 'Chikongola', 'Likombe', 'Reli', 'Shangani', 'Vigaeni', 'Chuno', 'Ufukoni', 'Rahaleo', 'Naliendele', 'Magomeni', 'Mtawanya', 'Tandika', 'Jangwani', 'Kisungule', 'Mitengo', 'Mtonya', 'Magengeni'],
    'Newala District Council': ['Mikumbi', 'Chihangu', 'Nambali', 'Mnyambe', 'Chilangala', 'Mkoma II', 'Nandwahi', 'Mnyeu', 'Kitangari', 'Chiwonga', 'Maputi', 'Muungano', 'Mpwapwa', 'Malatu', 'Mchemo', 'Mtopwa', 'Chitekete', 'Makukwe', 'Mkwedu', 'Mtunguru', 'Mdimba Mpelepele', 'Nakahako'],
    'Newala Town Council': ['Luchingu', 'Makote', 'Mtonya', 'Namiyonga', 'Mnekachi', 'Mahumbika', 'Tulindane', 'Julia', 'Nangwala', 'Makonga', 'Mkulung\\'ulu', 'Nanguruwe', 'Mkunya', 'Mcholi I', 'Mcholi II', 'Mtumachi'],
    'Masasi District Council': ['Chigugu', 'Mwena', 'Nanganga', 'Chiwata', 'Mpindimbi', 'Chikukwe', 'Nangoo', 'Chikundi', 'Ndanda', 'Namatutwe', 'Namajani', 'Mlingula', 'Chiwale', 'Lukuledi', 'Mpanyani', 'Msikisi', 'Chikunja', 'Mkululu', 'Namalenga', 'Lulindi', 'Namwanga', 'Mitesa', 'Sindano', 'Mchauru', 'Mnavira', 'Chikoropola', 'Nanjota', 'Chiungutwa', 'Mbuyuni', 'Lipumburu', 'Mpeta', 'Lupaso', 'Mijelejele'],
    'Masasi Town Council': ['Mwenge Mtapika', 'Temeke', 'Mkuti', 'Nyasa', 'Marika', 'Mkomaindo', 'Mtandi', 'Jida', 'Migongo', 'Sululu', 'Chanikanguo', 'Napupa', 'Mumbaka', 'Matawale'],
    'Tandahimba District Council': ['Michenjele', 'Mihambwe', 'Mkoreha', 'Miuta', 'Tandahimba', 'Naputa', 'Namikupa', 'Nambahu', 'Malopokelo', 'Maundo', 'Mnyawa', 'Lukokoda', 'Kwanyama', 'Mchichira', 'Mkundi', 'Mahuta', 'Nanhyanga', 'Chingungwe', 'Chikongola', 'Dinduma', 'Mdimba Mnyoma', 'Milongodi', 'Lyenje', 'Chaume', 'Mkonjowano', 'Mndumbwe', 'Mkwedu', 'Luagala', 'Litehu', 'Ngunja', 'Mkwiti'],
    'Nanyumbu District Council': ['Lumesule', 'Likokona', 'Napacho', 'Michiga', 'Mangaka', 'Nangomba', 'Sengenya', 'Chipuputa', 'Kilimanihewa', 'Mnanje', 'Mikangaula', 'Maratani', 'Nandete', 'Kamundi', 'Mkonona', 'Nanyumbu', 'Masuguru'],
  }},
  'Ruvuma': { jurisdiction: 'mainland', districts: {
    'Tunduru District Council': ['Kalulu', 'Ligunga', 'Matemanga', 'Namwinyu', 'Jakika', 'Mindu', 'Ngapa', 'Nakapanya', 'Muhuwesi', 'Namiungo', 'Majimaji', 'Namakambale', 'Tinginya', 'Mlingoti Mashariki', 'Mlingoti Magharibi', 'Masonya', 'Sisi Kwa Sisi', 'Mchangani', 'Majengo', 'Nanjoka', 'Nakayaya', 'Kidodoma', 'Nandembo', 'Nampungu', 'Tuwemacho', 'Ligoma', 'Misechela', 'Namasakata', 'Mchuluka', 'Mtina', 'Mchesi', 'Lukumbule', 'Nalasi Magharibi', 'Mchoteka', 'Marumba', 'Mbesa', 'Mbati', 'Nalasi Mashariki', 'Chiwana'],
    'Songea District Council': ['Liganga', 'Kilagano', 'Maposeni', 'Mpandangindo', 'Parangu', 'Peramiho', 'Litisha', 'Litapwasi', 'Mpitimbi', 'Matimira', 'Ndongosi', 'Lilahi', 'Muhukuru', 'Kizuka', 'Mbinga Mhalule'],
    'Songea Municipal Council': ['Mjini', 'Bombambili', 'Matogoro', 'Mshangano', 'Mletele', 'Seedfarm', 'Tanga', 'Msamala', 'Ndilimalitembo', 'Majengo', 'Misufini', 'Mfaranyaki', 'Lizaboni', 'Matarawe', 'Ruvuma', 'Subira', 'Ruhuwiko', 'Lilambo', 'Mwengemshindo', 'Mjimwema', 'Mateka'],
    'Madaba District Council': ['Lituta', 'Mahanje', 'Matetereka', 'Wino', 'Matumbi', 'Mkongotema', 'Gumbiro', 'Mtyangimbole'],
    'Mbinga District Council': ['Kigonsera', 'Kihangi Mahuka', 'Lukarasi', 'Amani Makoro', 'Mhongozi', 'Kitumbalomo', 'Mkako', 'Matiri', 'Kitura', 'Mpapa', 'Nyoni', 'Mbuji', 'Litembo', 'Kambarage', 'Mapera', 'Kipapa', 'Maguu', 'Mikalanga', 'Langiro', 'Ruanda', 'Litumbandyosi', 'Namswea', 'Muungano', 'Wukiro', 'Kipololo', 'Ngima', 'Mkumbi', 'Linda', 'Ukata'],
    'Mbinga Town Council': ['Luwaita', 'Myangayanga', 'Kitanda', 'Mpepai', 'Utiri', 'Mbinga Mjini', 'Kilimani', 'Mbangamao', 'Kihungu', 'Kikolo', 'Mateka', 'Mbambi', 'Matarawe', 'Bethrehemu', 'Luhuwiko', 'Lusonga', 'Masumuni', 'Mbinga Mjini B', 'Kagugu'],
    'Nyasa District Council': ['Chiwanda', 'Mtipwili', 'Kilosa', 'Lipingo', 'Liuli', 'Kihagara', 'Liparamba', 'Tingi', 'Kingerikiti', 'Luhangarasi', 'Mpepo', 'Mipotopoto', 'Upolo', 'Lumeme', 'Ngumbo', 'Liwundi', 'Mbaha', 'Lituhi', 'Linga'],
    'Namtumbo District Council': ['Lusewa', 'Magazini', 'Msisima', 'Mkongo', 'Ligera', 'Msindo', 'Luchili', 'Namabengo', 'Hanga', 'Limamu', 'Mkongo gulioni', 'Lisimonji', 'Rwinga', 'Kitanda', 'Luegu', 'Namtumbo', 'Mgombasi', 'Litola', 'Likuyuseka', 'Mputa', 'Mchomoro'],
  }},
  'Iringa': { jurisdiction: 'mainland', districts: {
    'Iringa District Council': ['Ifunda', 'Lumuli', 'Maboga', 'Wasa', 'Kihanga', 'Kalenga', 'Kiwere', 'Nzihi', 'Ulanda', 'Mseke', 'Magulilwa', 'Mgama', 'Luhota', 'Lyamgungwe', 'Masaka', 'Kihorogota', 'Izazi', 'Malengamakali', 'Nyang\\'oro', 'Mahuninga', 'Idodi', 'Mlowa', 'Ilolompya', 'Mlenge', 'Mboliboli'],
    'Iringa Municipal Council': ['Kihesa', 'Mtwivila', 'Gangilonga', 'Kitanzini', 'Ruaha', 'Mshindo', 'Mivinjeni', 'Mlandege', 'Mwangata', 'Kwakilosa', 'Makorongoni', 'Ilala', 'Mkwawa', 'Kitwiru', 'Isakalilo', 'Nduli', 'Mkimbizi', 'Igumbilo'],
    'Mafinga Town Council': ['Sao Hill', 'Changarawe', 'Boma', 'Rungemba', 'Kinyanambo', 'Upendo', 'Wambi', 'Isalavanu', 'Bumilayinga'],
    'Mufindi District Council': ['Ikweha', 'Sadani', 'Igombavanu', 'Ihalimba', 'Kibengu', 'Mapanda', 'Ikongosi', 'Ifwagi', 'Mdabulo', 'Ihanu', 'Luhunga', 'Mpanga Tazara', 'Mtwango', 'Kiyowela', 'Makungu', 'Mninga', 'Kasanga', 'Igowole', 'Mtambula', 'Itandula', 'Idete', 'Mbalamaziwa', 'Idunda', 'Malangali', 'Nyololo', 'Ihowanza', 'Maduma'],
    'Kilolo District Council': ['Image', 'Irole', 'Ilula', 'Uhambingeto', 'Lugalo', 'Nyalumbu', 'Mlafu', 'Ibumu', 'Udekwa', 'Mahenge', 'Ruaha Mbuyuni', 'Nyanzwa', 'Mtitu', 'Dabaga', 'Ukumbi', 'Ukwega', 'Boma la Ng\\'ombe', 'Idete', 'Masisiwe', 'Ng\\'uruhe', 'Ng\\'ang\\'ange', 'Ihimbo', 'Kimala', 'Kising\\'a'],
  }},
  'Mbeya': { jurisdiction: 'mainland', districts: {
    'Chunya District Council': ['Sangambi', 'Itewe', 'Chokaa', 'Mbugani', 'Chalangwa', 'Ifumbo', 'Matundasi', 'Makongolosi', 'Bwawani', 'Mkola', 'Kasanga', 'Kambikatoto', 'Mafyeko', 'Matwiga', 'Mtanila', 'Lupa', 'Lualaje', 'Upendo', 'Mamba', 'Nkung\\'ungu'],
    'Mbeya District Council': ['Santilya', 'Ilembo', 'Iwiji', 'Isuto', 'Iyunga Mapinduzi', 'Masoko', 'Itawa', 'Shizuvi', 'Izyra', 'Igale', 'Iwindi', 'Utengule/Usongwe', 'Mshewe', 'Ikukwa', 'Bonde la Songwe', 'Swaya', 'Nsalala', 'Mjele', 'Ihango', 'Ulenje', 'Tembela', 'Ijombe', 'Inyala', 'Ilungu', 'Maendeleo', 'Lwanjilo', 'Itewe', 'Igoma'],
    'Mbeya City Council': ['Itezi', 'Igawilo', 'Iganjo', 'Uyole', 'Iduda', 'Mwasanga', 'Tembela', 'Ilomba', 'Mwakibete', 'Ruanda', 'Iyela', 'Sinde', 'Maanga', 'Mbalizi Road', 'Forest', 'Mabatini', 'Nzovwe', 'Kalobe', 'Iyunga', 'Iwambi', 'Sisimba', 'Isanga', 'Iganzo', 'Mwasenkwa', 'Itagano', 'Ilemi', 'Isyesye', 'Itende', 'Iziwa', 'Nsoho', 'Majengo', 'Ghana', 'Nonde', 'Itiji', 'Maendeleo'],
    'Kyela District Council': ['Lusungo', 'Makwale', 'Matema', 'Mwaya', 'Ndobo', 'Ipande', 'Ikama', 'Ipinda', 'Muungano', 'Talatala', 'Mababu', 'Nkokwa', 'Kajunjumele', 'Bujonde', 'Ikolo', 'Katumbasongwe', 'Ngana', 'Busale', 'Ngonga', 'Ikimba', 'Itope', 'Kyela', 'Mikoroshoni', 'Mbugani', 'Mwanganyanga', 'Serengeti', 'Itunge', 'Nkuyu', 'Ndandalo', 'Ipyana', 'Bondeni', 'Ibanda', 'Njisi'],
    'Rungwe District Council': ['Ibighi', 'Bagamoyo', 'Kawetele', 'Bulyaga', 'Msasani', 'Makandana', 'Itagata', 'Masoko', 'Kisiba', 'Bujela', 'Masukulu', 'Ilima', 'Kisondela', 'Mpuguso', 'Matwebe', 'Swaya', 'Isongole', 'Masebe', 'Suma', 'Malindo', 'Ikuti', 'Nkunga', 'Kinyala', 'Kiwira', 'Kyimo', 'Lufingo', 'Iponjola', 'Lupepo', 'Ndanto'],
    'Busokelo District Council': ['Kandete', 'Luteba', 'Isange', 'Lwangwa', 'Lufilyo', 'Itete', 'Kisegese', 'Ntaba', 'Kambasegela', 'Lupata', 'Mpata', 'Kabula', 'Mpombo'],
    'Mbarali District Council': ['Madibira', 'Mawindi', 'Mapogoro', 'Ubaruku', 'Imalilo Songwe', 'Igava', 'Ipwani', 'Miyombweni', 'Rujewa', 'Lugelele', 'Luhanga', 'Ihahi', 'Chimala', 'Utengule Usangu', 'Ruiwa', 'Mahongole', 'Igurusi', 'Kongolo', 'Mwatenga', 'Itamboleo'],
  }},
  'Singida': { jurisdiction: 'mainland', districts: {
    'Iramba District Council': ['Tulya', 'Kidaru', 'Kisiriri', 'Kiomboi', 'Old-Kiomboi', 'Urughu', 'Mtekente', 'Ndago', 'Mbelekese', 'Kaselya', 'Ndulungu', 'Kinampanda', 'Ulemo', 'Kyengege', 'Maluga', 'Mukulu', 'Mtoa', 'Mgongo', 'Shelui', 'Ntwike'],
    'Singida District Council': ['Mudida', 'Makuro', 'Kijota', 'Mtinko', 'Ughandi', 'Msisi', 'Ikhanoda', 'Mwasauya', 'Msange', 'Maghojoa', 'Mughamo', 'Kinyagigi', 'Merya', 'Kinyeto', 'Ntonge', 'Ilongero', 'Mrama', 'Itaja', 'Ngimu', 'Mughunga', 'Mgori'],
    'Singida Municipal Council': ['Mughanga', 'Mitunduruni', 'Mtamaa', 'Utemini', 'Mwankoko', 'Mandewa', 'Minga', 'Uhamaka', 'Unyianga', 'Mtipa', 'Majengo', 'Unyambwa', 'Mungumaji', 'Unyamikumbi', 'Kindai', 'Ipembe', 'Misuna', 'Kisaki'],
    'Manyoni District Council': ['Manyoni', 'Mkwese', 'Muhalala', 'Makuru', 'Saranda', 'Majiri', 'Sasajila', 'Solya', 'Makutupora', 'Makanda', 'Kintinku', 'Maweni', 'Chikuyu', 'Sanza', 'Isseke', 'Nkonko', 'Sasilo', 'Heka', 'Chikola'],
    'Itigi District Council': ['Itigi Mjini', 'Itigi Majengo', 'Tambukareli', 'Sanjaranda', 'Aghondi', 'Idodyandole', 'Ipande', 'Kitaraka', 'Mgandu', 'Mitundu', 'Kalangali', 'Mwamagembe', 'Rungwa'],
    'Ikungi District Council': ['Iyumbu', 'Mgungira', 'Mwaru', 'Ighombwe', 'Mtunduru', 'Sepuka', 'Irisya', 'Puma', 'Kituntu', 'Iglansoni', 'Isseke', 'Ihanja', 'Minyughe', 'Muhintiri', 'Makilawa', 'Dung\\'unyi', 'Mang\\'onyi', 'Mkiwa', 'Issuna', 'Unyahati', 'Ikungi', 'Mungaa', 'Siuyu', 'Kikio', 'Lighwa', 'Misughaa', 'Ntuntu', 'Makiungu'],
    'Mkalama District Council': ['Mpambala', 'Mwangeza', 'Nkinto', 'Ibaga', 'Matongo', 'Mwanga', 'Gumanga', 'Nduguti', 'Ilunda', 'Miganga', 'Nkalakala', 'Kinampundu', 'Msingi', 'Kinyangiri', 'Iguguno', 'Kikhonda', 'Tumuli'],
  }},
  'Tabora': { jurisdiction: 'mainland', districts: {
    'Nzega Town Council': ['Mbogwe', 'Miguwa', 'Itilo', 'Ijanija', 'Nzega Ndogo', 'Nzega Mjini Mashariki', 'Nzega Mjini Magharibi', 'Uchama', 'Mwanzoli', 'Kitangili'],
    'Nzega District Council': ['Bukene', 'Mogwa', 'Mambali', 'Kahamanhalanga', 'Semembela', 'Isagenhe', 'Ikindwa', 'Uduka', 'Mbutu', 'Nata', 'Mwangoye', 'Mwamala', 'Igusule', 'Shigamba', 'Kasela', 'Karitu', 'Itobo', 'Sigili', 'Wela', 'Muhugi', 'Utwigu', 'Lusu', 'Isanzu', 'Mwasala', 'Mwantundu', 'Puge', 'Nkiniziwa', 'Budushi', 'Mwakashanhala', 'Tongi', 'Mizibaziba', 'Milambo Itobo', 'Magengati', 'Ndala', 'Mbagwa', 'Ugembe'],
    'Igunga District Council': ['Igunga', 'Itumba', 'Bukoko', 'Isakamaliwa', 'Nanga', 'Nguvumoja', 'Mbutu', 'Lugubu', 'Mtunguru', 'Kining\\'inila', 'Igurubi', 'Mwamashimba', 'Kinungu', 'Itunduru', 'Mwamashiga', 'Mwamakona', 'Nyandekwa', 'Ntobo', 'Chomachankola', 'Mwashikumbili', 'Ziba', 'Ndembezi', 'Nkinga', 'Ngulu', 'Sungwizi', 'Kitangili', 'Ugaka', 'Iborogelo', 'Simbo', 'Igoweko', 'Mwisi', 'Chabutwa', 'Mwamala', 'Tambalale', 'Uswaya'],
    'Uyui District Council': ['Lutende', 'Kizengi', 'Goweko', 'Igalula', 'Loya', 'Miswaki', 'Tura', 'Nsololo', 'Kigwa', 'Miyenze', 'Mmale', 'Bukumbi', 'Ikongolo', 'Upuge', 'Magiri', 'Isikizya', 'Shitage', 'Nsimbo', 'Ibelamilundi', 'Nzubuka', 'Igulungu', 'Ilolangulu', 'Mabama', 'Ndono', 'Ufuluma', 'Usagari', 'Ibiri', 'Isila', 'Kalola', 'Makazi'],
    'Urambo District Council': ['Kapilula', 'Urambo', 'Vumilia', 'Muungano', 'Songambele', 'Uyogo', 'Ugalla', 'Usisya', 'Itundu', 'Kasisi', 'Imalamakoye', 'Nsenda', 'Ukondamoyo', 'Kiyungi', 'Mchikichini', 'Kiloleni', 'Ussoke', 'Uyumbu'],
    'Sikonge District Council': ['Tutuo', 'Chabutwa', 'Kiloleli', 'Kipanga', 'Sikonge', 'Igigwa', 'Pangale', 'Ipole', 'Ngoywa', 'Kisanga', 'Misheni', 'Mole', 'Mpombwe', 'Usunga', 'Mkolye', 'Nyahua', 'Kitunda', 'Kiloli', 'Kipili', 'Kilumbi'],
    'Tabora Municipal Council': ['Kanyenye', 'Gongoni', 'Tambuka-Reli', 'Kiloleni', 'Mtendeni', 'Isevya', 'Ipuli', 'Kakola', 'Uyui', 'Itonjanda', 'Kalunde', 'Misha', 'Kabila', 'Ikomwa', 'Ifucha', 'Mpela', 'Mapambano', 'Mbugani', 'Chemchem', 'Cheyo', 'Kitete', 'Ng\\'ambo', 'Malolo', 'Ndevelwa', 'Itetemia', 'Tumbi', 'Ntalikwa', 'Mwinyi', 'Kidongochekundu'],
    'Kaliua District Council': ['Ukumbi Siganga', 'Zugimlole', 'Ugunga', 'Kaliua', 'Kamsekwa', 'Ufukutwa', 'Ushokola', 'Kazaroho', 'Igwisi', 'Usimba', 'Usinge', 'Igagala', 'Usenye', 'Uyowa', 'Silambo', 'Ichemba', 'Mwongozo', 'Kanoge', 'Mkindo', 'Milambo', 'Nhwande', 'Makingi', 'Kashishi', 'Sasu', 'Seleli', 'Igombemkulu', 'Kona Nne', 'Ilege'],
  }},
  'Rukwa': { jurisdiction: 'mainland', districts: {
    'Kalambo District Council': ['Kasanga', 'Kisumba', 'Mpombwe', 'Samazi', 'Mkowe', 'Msanzi', 'Matai', 'Sopa', 'Katete', 'Mkali', 'Lyowa', 'Sundu', 'Mbuluma', 'Mwimbi', 'Mambwekenya', 'Ulumi', 'Mnamba', 'Mambwe Nkoswe', 'Legezamwendo', 'Mwazye', 'Katazi', 'Kilesha', 'Kanyezi'],
    'Sumbawanga District Council': ['Mfinga', 'Muze', 'Mtowisa', 'Milepa', 'Zimba', 'Kalumbaleza', 'Mwadui', 'Ilemba', 'Kipeta', 'Kaoze', 'Kapenta', 'Kilangawana', 'Nankanga', 'Miangalua', 'Lusaka', 'Laela', 'Mnokola', 'Kasanzama', 'Sandulula', 'Kaengesa', 'Mpui', 'Msandamuungano', 'Kalambanzite', 'Ikozi', 'Mpwapwa', 'Kanda', 'Lyangalile'],
    'Sumbawanga Municipal Council': ['Ntendo', 'Senga', 'Mollo', 'Pito', 'Milanzi', 'Matanga', 'Kasense', 'Malangali', 'Mazwi', 'Izia', 'Katandala', 'Sumbawanga', 'Kizwite', 'Majengo', 'Chanji', 'Lwiche', 'Momoka', 'Mafulala', 'Msua'],
    'Nkasi District Council': ['Mkwamba', 'Mtenga', 'Isale', 'Namanyere', 'Nkomolo', 'Kipundu', 'Ntatumbila', 'Majengo', 'Mashete', 'Isunta', 'Paramawe', 'Korongwe', 'Kirando', 'Kabwe', 'Kipili', 'Itete', 'Mkinga', 'Chala', 'Nkandasi', 'Kipande', 'Kate', 'Sintali', 'Ntuchi', 'Myula', 'Kala', 'Wampembe', 'Ninde', 'Kizumbi'],
  }},
  'Kigoma': { jurisdiction: 'mainland', districts: {
    'Kibondo District Council': ['Misezero', 'Bitare', 'Kibondo Mjini', 'Murungu', 'Bunyambo', 'Kitahana', 'Biturana', 'Kumwambu', 'Rusohoko', 'Kumsenga', 'Kizazi', 'Mabamba', 'Itaba', 'Kagezi', 'Mukabuye', 'Busagara', 'Rugongwe', 'Busunzu', 'Nyaruyoba'],
    'Kasulu District Council': ['Kitanga', 'Heru Ushingo', 'Nyamidaho', 'Kitagata', 'Kagera Nkanda', 'Makere', 'Nyachenda', 'Buhoro', 'Nyamnyusi', 'Nyakitonto', 'Muzye', 'Bugaga', 'Kigembe', 'Rusesa', 'Kwaga', 'Kalela', 'Kurugongo', 'Rungwe Mpya', 'Asante Nyerere', 'Titye', 'Shunguliba'],
    'Kasulu Town Council': ['Kigondo', 'Msambara', 'Ruhita', 'Nyumbigwa', 'Murufiti', 'Nyansha', 'Kumsenga', 'Mwilamvya', 'Murusi', 'Murubona', 'Kumnyika', 'Kimobwa', 'Muganza', 'Muhunga', 'Heru Juu'],
    'Kigoma District Council': ['Mungonya', 'Kagongo', 'Mwandiga', 'Ziwani', 'Kagunga', 'Mkigo', 'Mwamgongo', 'Kalinzi', 'Nyarubanda', 'Bitale', 'Mkongoro', 'Mahembe', 'Matendo', 'Nkungwe', 'Kidahwe', 'Simbo'],
    'Kigoma Municipal Council': ['Gungu', 'Kibirizi', 'Mwanga Kusini', 'Kigoma', 'Bangwe', 'Mwanga Kaskazini', 'Katubuka', 'Buhanda', 'Businde', 'Machinjioni', 'Kagera', 'Kasimbu', 'Rubuga', 'Kasingirima', 'Majengo', 'Kitongoni', 'Kipampa', 'Rusimbi', 'Buzebazeba'],
    'Uvinza District Council': ['Kalya', 'Buhingu', 'Igalula', 'Sigunga', 'Herembe', 'Sunuka', 'Ilagala', 'Mwakizega', 'Kandaga', 'Kazuramimba', 'Uvinza', 'Mganza', 'Mtegowanoti', 'Nguruka', 'Itebula', 'Basanza'],
    'Buhigwe District Council': ['Nyamugali', 'Biharu', 'Muyama', 'Kajana', 'Mugera', 'Kilelema', 'Munyegera', 'Bukuba', 'Buhigwe', 'Kibande', 'Janda', 'Munzeze', 'Rusaba', 'Muhinda', 'Munanila', 'Mwayaya', 'Mkatanga', 'Kibwigwa', 'Mubanga', 'Kinazi'],
    'Kakonko District Council': ['Nyabibuye', 'Nyamtukuza', 'Muhange', 'Gwarama', 'Kakonko', 'Kiziguzigu', 'Kanyonza', 'Kasuga', 'Rugenge', 'Kasanda', 'Gwanumpu', 'Katanga', 'Mugunzu'],
  }},
  'Shinyanga': { jurisdiction: 'mainland', districts: {
    'Ushetu District Council': ['Igwamanoni', 'Sabasabini', 'Mpunze', 'Igunda', 'Ukune', 'Chona', 'Chambo', 'Mapamba', 'Bulungwa', 'Kinamapula', 'Kisuke', 'Nyamilangano', 'Bukomela', 'Idahina', 'Uyogo', 'Ushetu', 'Ulowa', 'Ubagwe', 'Ulewe', 'Nyankende'],
    'Kahama Municipal Council': ['Busoka', 'Mhongolo', 'Mwendakulima', 'Zongomera', 'Nyahanga', 'Malunga', 'Majengo', 'Nyasubi', 'Nyihogo', 'Mhungula', 'Kahama Mjini', 'Iyenze', 'Kilago', 'Nyandekwa', 'Wendele', 'Ngogwa', 'Kinaga', 'Mondo', 'Kagongwa', 'Isagehe'],
    'Msalala District Council': ['Bulyan\\'hulu', 'Bugarama', 'Lunguya', 'Shilela', 'Segese', 'Mega', 'Chela', 'Busangi', 'Ntobo', 'Ngaya', 'Bulige', 'Kashishi', 'Ikinda', 'Mwanase', 'Mwalugulu', 'Jana', 'Isaka', 'Mwakata'],
    'Kishapu District Council': ['Lagana', 'Mwamashele', 'Ngofila', 'Kiloleli', 'Ukenyenge', 'Talaga', 'Itilima', 'Mwaweja', 'Uchunga', 'Kishapu', 'Mwakipoya', 'Shagihilu', 'Somagedi', 'Mwamalasa', 'Masanga', 'Ndoleleji', 'Mwataga', 'Bupigi', 'Igaga', 'Bunambiyu', 'Bubiki', 'Songwa', 'Seke-Bugoro', 'Mondo', 'Mwadui Lohumbo', 'Maganzo', 'Busangwa', 'Idukilo', 'Mwasubi'],
    'Shinyanga District Council': ['Pandagichiza', 'Mwakitolyo', 'Salawe', 'Solwa', 'Iselamagazi', 'Lyabukande', 'Mwantini', 'Mwenge', 'Lyabusalu', 'Mwalukwa', 'Nyamalogo', 'Lyamidati', 'Imesela', 'Usule', 'Ilola', 'Didia', 'Itwangi', 'Tinde', 'Puni', 'Nyida', 'Nsalala', 'Bukene', 'Mwamala', 'Samuye', 'Usanda', 'Masengwa'],
    'Shinyanga Municipal Council': ['Mwamalili', 'Chibe', 'Old Shinyanga', 'Kolandoto', 'Ibadakuli', 'Ngokolo', 'Mjini', 'Chamaguha', 'Ibinzamata', 'Kitangili', 'Kizumbi', 'Mwawaza', 'Ndala', 'Kambarage', 'Lubaga', 'Ndembezi', 'Masekelo'],
  }},
  'Kagera': { jurisdiction: 'mainland', districts: {
    'Karagwe District Council': ['Igurwa', 'Kanoni', 'Kihanga', 'Kituntu', 'Chanika', 'Kayanga', 'Bugene', 'Ndama', 'Rugera', 'Nyakahanga', 'Ihanda', 'Chonyonyo', 'Ihembe', 'Nyaishozi', 'Rugu', 'Nyakasimbi', 'Nyakakika', 'Nyakabanga', 'Kibondo', 'Bweranyange', 'Nyabiyonza', 'Kiruruma', 'Kamagambo'],
    'Bukoba District Council': ['Rubafu', 'Kishanje', 'Kaagya', 'Behendangabo', 'Nyakato', 'Katoma', 'Karabagaine', 'Maruku', 'Kanyangereko', 'Bujugo', 'Katerero', 'Kemondo', 'Nyakibimbili', 'Ibwera', 'Mikoni', 'Kyamulaile', 'Katoro', 'Kaibanja', 'Kasharu', 'Kishogo', 'Butelankuzi', 'Rubale', 'Rukoma', 'Kikomelo', 'Kibirizi', 'Izimbya', 'Kyaitoke', 'Ruhunga', 'Mugajwale'],
    'Bukoba Municipal Council': ['Hamugembe', 'Nshambya', 'Buhembe', 'Kahororo', 'Kashai', 'Miembeni', 'Bilele', 'Bakoba', 'Ijuganyondo', 'Kitendaguro', 'Kibeta', 'Kagondo', 'Nyanga', 'Rwamishenye'],
    'Muleba District Council': ['Nyakatanga', 'Ngenge', 'Rutoro', 'Ibuga', 'Bulyakashaju', 'Kamachumu', 'Ruhanga', 'Mafumbo', 'Muhutwe', 'Mayondwe', 'Goziba', 'Kerebe', 'Bumbire', 'Izigo', 'Katoke', 'Kagoma', 'Kikuku', 'Biirabo', 'Mushabago', 'Kabirizi', 'Nshamba', 'Kashasha', 'Ijumbi', 'Kishanda', 'Buganguzi', 'Ikuza', 'Bureza', 'Muleba', 'Ikondo', 'Buhangaza', 'Mazinga', 'Magata Karutanga', 'Gwanseli', 'Kibanga', 'Kasharunga', 'Rulanda', 'Kimwani', 'Nyakabango', 'Kyebitembe', 'Karambi', 'Mubunda', 'Bisheke', 'Burungura'],
    'Biharamulo District Council': ['Ruziba', 'Biharamulo Mjini', 'Bisibo', 'Nyarubungo', 'Nyamahanga', 'Runazi', 'Kabindi', 'Nyamigogo', 'Nyabusozi', 'Nemba', 'Katahoka', 'Nyakahura', 'Lusahunga', 'Kaniha', 'Nyantakara', 'Kalenge', 'Nyanza'],
    'Ngara District Council': ['Kabanga', 'Mabawe', 'Kanazi', 'Mugoma', 'Kirushya', 'Rusumo', 'Ntobeye', 'Nyamiaga', 'Ngara Mjini', 'Kibimba', 'Murukurazo', 'Kasulo', 'Nyakisasa', 'Rulenge', 'Keza', 'Bugarama', 'Bukiriro', 'Mbuba', 'Kibogora', 'Murusagamba', 'Muganza', 'Nyamagoma'],
    'Kyerwa District Council': ['Kibingo', 'Murongo', 'Bugomora', 'Kibare', 'Mabira', 'Businde', 'Kamuli', 'Nyakatuntu', 'Kimuli', 'Kikukuru', 'Kitwe', 'Bugara', 'Kakanja', 'Rwabwere', 'Nkwenda', 'Rukuraijo', 'Songambele', 'Kyerwa', 'Kitwechenkura', 'Iteera', 'Isingiro', 'Kaisho', 'Rutunguru', 'Nyaruzumbura'],
    'Missenyi District Council': ['Kakunyu', 'Nsunga', 'Mutukula', 'Kassambya', 'Minziro', 'Bugorora', 'Kyaka', 'Mushasha', 'Kilimilile', 'Mabale', 'Ruzinga', 'Kashenye', 'Kanyigo', 'Ishunju', 'Buyango', 'Bwanjai', 'Ishozi', 'Gera', 'Bugandika', 'Kitobo'],
  }},
  'Mwanza': { jurisdiction: 'mainland', districts: {
    'Ukerewe District Council': ['Bwisya', 'Bukungu', 'Nyamanga', 'Bukiko', 'Mukituntu', 'Murutunguru', 'Kagunguli', 'Bukindo', 'Irugwa', 'Nansio', 'Kagera', 'Nakatunguru', 'Kakerege', 'Bukongo', 'Nkilizya', 'Bukanda', 'Namagondo', 'Ngoma', 'Igalla', 'Bwiro', 'Muriti', 'Ilangala', 'Namilembe', 'Nduruma', 'Kakukuru'],
    'Magu District Council': ['Kisesa', 'Bujashi', 'Lutale', 'Kongolo', 'Bukandwe', 'Bujora', 'Chabula', 'Nyanguge', 'Kitongo Sima', 'Mwamanga', 'Kahangara', 'Nyigogo', 'Mwamabanza', 'Sukuma', 'Lubugu', 'Magu Mjini', 'Kandawe', 'Isandula', 'Itumbili', 'Buhumbi', 'Ng\\'haya', 'Nkungulu', 'Jinjimili', 'Shishani', 'Kabila'],
    'Mwanza City Council': ['Mkuyuni', 'Igogo', 'Pamba', 'Nyamagana', 'Mirongo', 'Isamilo', 'Mbugani', 'Mahina', 'Igoma', 'Buhongwa', 'Mkolani', 'Butimba', 'Nyegezi', 'Mabatini', 'Mhandu', 'Kishili', 'Lwanhima', 'Luchelele'],
    'Kwimba District Council': ['Mwang\\'halanga', 'Igongwa', 'Ngudu', 'Nyamilama', 'Mwakilyambiti', 'Hungumalwa', 'Ng\\'hundi', 'Mwankulwe', 'Ilula', 'Mwamala', 'Kikubiji', 'Mhande', 'Bupamwa', 'Fukalo', 'Shilembo', 'Walla', 'Bungulwa', 'Sumve', 'Mantare', 'Ngulla', 'Mwabomba', 'Mwagi', 'Iseni', 'Nyambiti', 'Maligisu', 'Mwandu', 'Malya', 'Lyoma', 'Bugando', 'Nkalalo'],
    'Sengerema District Council': ['Ibisabageni', 'Tabaruka', 'Busisi', 'Sima', 'Buzilasoga', 'Igulumuki', 'Kahumulo', 'Nyampande', 'Kishinda', 'Mwabaluhi', 'Nyatukara', 'Nyampulukano', 'Mission', 'Ibondo', 'Nyamazugo', 'Chifunfu', 'Katunguru', 'Kasungamile', 'Nyamatongo', 'Nyamizeze', 'Kasenyi', 'Ngoma', 'Buyagu', 'Igalula', 'Kagunga', 'Bitoto'],
    'Buchosa District Council': ['Bangwe', 'Katwe', 'Maisome', 'Kalebezo', 'Nyehunge', 'Kafunzo', 'Bupandwa', 'Iligamba', 'Bugoro', 'Lugata', 'Buhama', 'Nyakasasa', 'Kasisa', 'Nyakasungwa', 'Nyanzenda', 'Bulyaheke', 'Kazunzu', 'Irenza', 'Luharanyonga', 'Nyakaliro', 'Bukokwa'],
    'Ilemela Municipal Council': ['Buswelu', 'Nyakato', 'Nyamanoro', 'Kirumba', 'Kitangiri', 'Pasiansi', 'Ilemela', 'Bugogwa', 'Sangabuye', 'Kayenze', 'Shibula', 'Kahama', 'Kiseke', 'Kawekamo', 'Ibungilo', 'Nyamhongolo', 'Mecco', 'Buzuruga', 'Nyasaka'],
    'Misungwi District Council': ['Bulemeji', 'Idetemya', 'Usagara', 'Ukiriguru', 'Kanyelele', 'Fella', 'Koromije', 'Igokelo', 'Mwaniko', 'Misungwi', 'Mabuki', 'Mondo', 'Mamaye', 'Misasi', 'Kijima', 'Shilalo', 'Buhingo', 'Busongo', 'Nhundulu', 'Kasololo', 'Isenengeja', 'Gulumungu', 'Lubili', 'Ilujamate', 'Mbarika', 'Sumbugu', 'Buhunda'],
  }},
  'Mara': { jurisdiction: 'mainland', districts: {
    'Tarime District Council': ['Susuni', 'Mwema', 'Sirari', 'Regicheri', 'Gwitiryo', 'Pemba', 'Mbogi', 'Binagi', 'Nyarero', 'Nyakonga', 'Ganyange', 'Kibasuka', 'Nyamwaga', 'Nyansincha', 'Muriba', 'Itiryo', 'Nyanungu', 'Gorong\\'a', 'Kwihancha', 'Nyarokoba', 'Kemambo', 'Matongo', 'Bumera', 'Kiore', 'Manga', 'Komaswa'],
    'Tarime Town Council': ['Nyandoto', 'Nyamisangura', 'Nkende', 'Turwa', 'Ketare', 'Kenyamanyori', 'Bomani', 'Sabasaba'],
    'Serengeti District Council': ['Kenyamonta', 'Majimoto', 'Busawe', 'Kisaka', 'Ring\\'wani', 'Nyansurura', 'Kebanchabancha', 'Rung\\'abure', 'Mosongo', 'Nyambureti', 'Magange', 'Nyamatare', 'Nyamoko', 'Machochwe', 'Mbalibali', 'Kisangura', 'Manchira', 'Sedeco', 'Geitasamo', 'Matare', 'Stendi Kuu', 'Mugumu', 'Morotonga', 'Uwanja wa Ndege', 'Ikoma', 'Natta', 'Nagusi', 'Issenye', 'Rigicha', 'Kyambahi'],
    'Musoma District Council': ['Bukumi', 'Makojo', 'Bwasi', 'Bulinga', 'Bukima', 'Rusoli', 'Murangi', 'Musanja', 'Nyamrandirira', 'Bugwema', 'Nyambono', 'Bugoji', 'Suguti', 'Tegeruka', 'Busambara', 'Kiriba', 'Mugango', 'Ifulifu', 'Nyakatende', 'Nyegina', 'Etaro'],
    'Musoma Municipal Council': ['Mukendo', 'Mwigobero', 'Iringo', 'Kitaji', 'Nyasho', 'Bweri', 'Nyakato', 'Kigera', 'Kamunyonge', 'Nyamatare', 'Mwisenge', 'Buhare', 'Makoko', 'Mshikamano', 'Rwamlimi', 'Kwangwa'],
    'Bunda District Council': ['Nyamuswa', 'Ketare', 'Salama', 'Mihingo', 'Mugeta', 'Hunyari', 'Nyamang\\'uta', 'Kibara', 'Chitengule', 'Nansimo', 'Kisorya', 'Nampindi', 'Igundu', 'Butimba', 'Neruma', 'Iramba', 'Namhula', 'Nyamihyoro', 'Kasuguti'],
    'Bunda Town Council': ['Guta', 'Wariku', 'Kabasa', 'Sazira', 'Mcharo', 'Kunzugu', 'Nyatwali', 'Balili', 'Nyamakokoto', 'Bunda Stoo', 'Bunda Mjini', 'Kabarimu', 'Nyasura', 'Manyamanyama'],
    'Butiama District Council': ['Buhemba', 'Mirwa', 'Muriaza', 'Butiama', 'Masaba', 'Kyanyari', 'Kukirango', 'Kamugegi', 'Buruma', 'Bisumwa', 'Nyankanga', 'Bukabwa', 'Butuguri', 'Busegwe', 'Bwiregi', 'Buswahili', 'Nyamimange', 'Sirorisimba'],
    'Rorya District Council': ['Kigunga', 'Kirogo', 'Nyamtinga', 'Nyamagaro', 'Nyahongo', 'Mkoma', 'Tai', 'Bukura', 'Kyangasaga', 'Kinyenche', 'Raranya', 'Roche', 'Kitembe', 'Mirare', 'Goribe', 'Ikoma', 'Koryo', 'Bukwe', 'Nyathorongo', 'Rabour', 'Nyaburongo', 'Kisumwa', 'Komuge', 'Nyamunga', 'Kyang\\'ombe', 'Baraki'],
  }},
  'Manyara': { jurisdiction: 'mainland', districts: {
    'Babati District Council': ['Magara', 'Nkaiti', 'Mwada', 'Kiru', 'Magugu', 'Kisangaji', 'Mamire', 'Gallapo', 'Qash', 'Endakiso', 'Ayasanda', 'Gidas', 'Duru', 'Riroda', 'Boay', 'Arri', 'Dareda', 'Dabil', 'Ufana', 'Bashnet', 'Madunga', 'Nar', 'Ayalagaya', 'Secheda', 'Qameyu'],
    'Babati Town Council': ['Babati', 'Mutuka', 'Nangara', 'Bagara', 'Sigino', 'Maisaka', 'Singe', 'Bonga'],
    'Hanang District Council': ['Masakta', 'Masqaroda', 'Endasiwold', 'Endasak', 'Endagaw', 'Measkron', 'Gidahababieg', 'Hidet', 'Simbay', 'Sirop', 'Gisambalang', 'Nangwa', 'Wareta', 'Dirma', 'Mogitu', 'Dawar', 'Gendabi', 'Gitting', 'Jorodom', 'Dumbeta', 'Ganana', 'Katesh', 'Lalaji', 'Balang\\'dalalu', 'Gehandu', 'Ishponga', 'Laghanga', 'Getanuwas', 'Hirbadaw', 'Garawja', 'Bassodesh', 'Bassotu', 'Mulbadaw'],
    'Mbulu District Council': ['Bashay', 'Yaeda Ampa', 'Tumati', 'Dongobesh', 'Gidhim', 'Dinamu', 'Haydom', 'Eshkesh', 'Endamilay', 'Yaeda Chini', 'Maretadu', 'Haydarer', 'Geterer', 'Maghang', 'Labay', 'Masieda', 'Endahagichan', 'Masqaroda'],
    'Mbulu Town Council': ['Marang', 'Daudi', 'Bargish', 'Gunyoda', 'Imboru', 'Uhuru', 'Ayamohe', 'Sanu Baray', 'Gehandu', 'Ayamaami', 'Endagikot', 'Tlawi', 'Silaloda', 'Nahasey', 'Kainam', 'Nambis', 'Murray'],
    'Simanjiro District Council': ['Loiborsiret', 'Emboreet', 'Terrat', 'Komolo', 'Shambarai', 'Mirerani', 'Naisinyai', 'Endiamutu', 'Msitu wa Tembo', 'Ngorika', 'Loiborsoit', 'Ruvu Remit', 'Orkesumet', 'Naberera', 'Kitwai', 'Endonyongijape', 'Langai'],
    'Kiteto District Council': ['Makame', 'Ndedo', 'Kijungu', 'Lengatei', 'Loolera', 'Sunya', 'Dongo', 'Laiseri', 'Songambele', 'Dosidosi', 'Magungu', 'Engusero', 'Matui', 'Chapakazi', 'Ndirgishi', 'Bwawani', 'Njoro', 'Olboloti', 'Kibaya', 'Partimbo', 'Bwagamoyo', 'Namelock', 'Kaloleni'],
  }},
  'Njombe': { jurisdiction: 'mainland', districts: {
    'Njombe District Council': ['Kidegembye', 'Matembwe', 'Lupembe', 'Ikondo', 'Mfriga', 'Idamba', 'Ukalawa', 'Mtwango', 'Igongolo', 'Kichiwa', 'Ninga', 'Ikuna'],
    'Njombe Town Council': ['Njombe Mjini', 'Mjimwema', 'Ramadhani', 'Yakobi', 'Kifanya', 'Ihanga', 'Iwungilo', 'Luponde', 'Matola', 'Makowo', 'Lugenge', 'Uwemba', 'Utalingoro'],
    'Makambako Town Council': ['Makambako', 'Mjimwema', 'Mlowa', 'Lyamkena', 'Mwembetogwa', 'Mahongole', 'Kitandililo', 'Utengule', 'Maguvani', 'Majengo', 'Kitisi', 'Kivavi'],
    'Ludewa District Council': ['Lupanga', 'Mlangali', 'Milo', 'Madope', 'Ludende', 'Lubonde', 'Mawengi', 'Ludewa', 'Luana', 'Nkomang\\'ombe', 'Luilo', 'Masasi', 'Manda', 'Ruhuhu', 'Lumbila', 'Kilondo', 'Iwela', 'Lupingu', 'Makonde', 'Lifuma', 'Lugarawa', 'Madilu', 'Mundindi', 'Mavanga', 'Ibumi', 'Mkongobaki'],
    'Makete District Council': ['Lupila', 'Ukwama', 'Ipepo', 'Mbalatse', 'Lupalilo', 'Iwawa', 'Mang\\'oto', 'Tandala', 'Isapulano', 'Bulongwa', 'Kipagalo', 'Luwumbu', 'Matamba', 'Mlondwe', 'Kitulo', 'Itundu', 'Kinyika', 'Iniho', 'Ipelele', 'Kigulu', 'Ikuwo', 'Mfumbi', 'Kigala', 'Imalinyi', 'Ulembwe', 'Makoga', 'Kipengele', 'Igosi', 'Wangama', 'Kidugala', 'Usuka', 'Igwachanya', 'Mdandu', 'Igima', 'Itulahumba', 'Saja', 'Kijombe', 'Wanging\\'ombe', 'Ilembula', 'Uhambule', 'Luduga', 'Malangali', 'Uhenga', 'Udonja'],
  }},
  'Katavi': { jurisdiction: 'mainland', districts: {
    'Mpanda Municipal Council': ['Shanwe', 'Makanyagio', 'Kashaulili', 'Kawajense', 'Nsemulwa', 'Majengo', 'Kasokola', 'Kazima', 'Uwanja wa Ndege', 'Kakese', 'Misunkumilo', 'Mpanda Hotel', 'Ilembo', 'Mwamkulu', 'Magamba'],
    'Nsimbo District Council': ['Sitalike', 'Ibindi', 'Itenka', 'Machimboni', 'Kapalala', 'Nsimbo', 'Kanoge', 'Ugalla', 'Litapunga', 'Mtapenda', 'Katumba'],
    'Tanganyika District Council': ['Mishamo', 'Mpandandogo', 'Kabungu', 'Ilangu', 'Bulamata', 'Ipwaga', 'Tongwe', 'Mnyagala', 'Mwese', 'Katuma', 'Sibwesa', 'Kasekese', 'Ikola', 'Karema', 'Kapalamsenga', 'Isengule'],
    'Mlele District Council': ['Utende', 'Inyonga', 'Kamsisi', 'Ilunde', 'Ilela', 'Nsenkwa'],
    'Mpimbwe District Council': ['Chamalendi', 'Mwamapuli', 'Majimoto', 'Mamba', 'Kasansa', 'Mbede', 'Usevya', 'Kibaoni', 'Ikuba'],
  }},
  'Simiyu': { jurisdiction: 'mainland', districts: {
    'Bariadi District Council': ['Itubukilo', 'Sakwe', 'Ngulyati', 'Kilalo', 'Kasoli', 'Mwasubuya', 'Gambosi', 'Ikungulyabashashi', 'Dutwa', 'Sapiwi', 'Masewa', 'Matongo', 'Gilya', 'Mwaubingi', 'Gibishi', 'Nkindwabiye', 'Ihusi', 'Mwaumatondo', 'Nkololo', 'Banemhi', 'Mwadobana'],
    'Bariadi Town Council': ['Mhango', 'Guduwi', 'Nyakabindi', 'Bariadi', 'Sima', 'Malambo', 'Somanda', 'Nyangokolwa', 'Bunamhala', 'Isanga'],
    'Itilima District Council': ['Bumera', 'Ikindilo', 'Mwamtani', 'Sagata', 'Mwaswale', 'Nkuyu', 'Mhunze', 'Migato', 'Chinamili', 'Ndolelezi', 'Lagangabilili', 'Budalabujiga', 'Nkoma', 'Mwalushu', 'Mwamapalala', 'Nyamalapa', 'Luguru', 'Nhobora', 'Zagayu', 'Kinang\\'weli', 'Mbita', 'Sawida'],
    'Meatu District Council': ['Mwanhuzi', 'Nkoma', 'Kimali', 'Mwamishali', 'Mwangudo', 'Mwanyahina', 'Imalaseko', 'Mwabuzo', 'Mwamalole', 'Mwanjolo', 'Mwamanongu', 'Ng\\'hoboko', 'Bukundi', 'Mwamanimba', 'Mbushi', 'Kabondo', 'Itinje', 'Lubiga', 'Isengwa', 'Mbugayabanghya', 'Kisesa', 'Mwandoya', 'Lingeka', 'Sakasaka', 'Mwabuma', 'Mwabusalu', 'Mwasengela', 'Tindabuligi', 'Mwakisandu'],
    'Maswa District Council': ['Kadoto', 'Shishiyu', 'Nyabubinza', 'Mwang\\'honoli', 'Kulimi', 'Malampaka', 'Badi', 'Mwabayanda', 'Mataba', 'Jija', 'Seng\\'wa', 'Masela', 'Isanga', 'Zanzui', 'Mwamashimba', 'Buchambi', 'Busangi', 'Nyalikungu', 'Binza', 'Bugarama', 'Shanwa', 'Sola', 'Ng\\'wigwa', 'Nguliguli', 'Ipililo', 'Senani', 'Mwamanenge', 'Sukuma', 'Mpindo', 'Dakama', 'Lalago', 'Budekwa', 'Busilili', 'Sangamwalugesha', 'Mbaragane', 'Mwabaratulu'],
    'Busega District Council': ['Shigala', 'Badugu', 'Nyaluhande', 'Kiloleli', 'Mwamanyili', 'Kabita', 'Nyashimo', 'Kalemela', 'Lamadi', 'Lutubiga', 'Mkula', 'Ngasamo', 'Malili', 'Igalukilo', 'Imalamate'],
  }},
  'Geita': { jurisdiction: 'mainland', districts: {
    'Geita District Council': ['Kagu', 'Bugulula', 'Senga', 'Kakubilo', 'Nkome', 'Katoma', 'Nzera', 'Lwenzera', 'Kamhanga', 'Bugalama', 'Lubanga', 'Isulwabutundwe', 'Nyamboge', 'Izumacheli', 'Nyawilimilwa', 'Kamena', 'Nyamalimbe', 'Bujula', 'Bukoli', 'Butobela', 'Nyarugusu', 'Nyakamwaga', 'Rwamgasa', 'Busanda', 'Nyalwanzaja', 'Nyaruyeye', 'Butundwe', 'Magenge', 'Kaseme', 'Katoro', 'Nyamigota', 'Nyakagomba', 'Nyachiluluma', 'Bukondo', 'Chigunga', 'Nyamwilolelwa', 'Ludete'],
    'Geita Town Council': ['Nyankumbu', 'Bombambili', 'Mtakuja', 'Mgusu', 'Kalangalala', 'Buhalahala', 'Nyanguku', 'Ihanamilo', 'Kasamwa', 'Bulela', 'Shiloleli', 'Kanyala', 'Bung\\'wangoko', 'Shabaka', 'Mwingiro', 'Nyabulanda', 'Nyang\\'hwale', 'Kaboha', 'Busolwa', 'Kakora', 'Nyijundu', 'Nyamtukuza', 'Nyugwa', 'Kharumwa', 'Izunya', 'Bukwimba', 'Kafita', 'Nundu'],
    'Mbogwe District Council': ['Lugunga', 'Nyakafulu', 'Bukandwe', 'Nhomolwa', 'Masumbwe', 'Iponya', 'Nanda', 'Mbogwe', 'Ngemo', 'Ushirika', 'Nyasato', 'Bunigonzi', 'Ikobe', 'Lulembela', 'Ikunguigazi', 'Isebya', 'Ilolangulu'],
    'Bukombe District Council': ['Lyambamgongo', 'Bukombe', 'Bugelenga', 'Iyogelo', 'Ng\\'anzo', 'Butinzya', 'Ushirombo', 'Igulwa', 'Katente', 'Bulangwa', 'Katome', 'Bulega', 'Runzewe Mashariki', 'Runzewe Magharibi', 'Namonge', 'Uyovu', 'Busonzo'],
    'Chato District Council': ['Ichwankima', 'Kachwamba', 'Kasenga', 'Ilemela', 'Muganza', 'Bwongera', 'Kigongo', 'Nyamirembe', 'Chato', 'Muungano', 'Bwina', 'Katende', 'Ilyamchele', 'Bukome', 'Makurugusi', 'Buseresere', 'Butengo rumasa', 'Iparamasa', 'Buziku', 'Nyarutembo', 'Bwanga', 'Bwera', 'Minkoto'],
    'Nyang\\'hwale District Council': ['Bukomela', 'Nyakagwe', 'Nyarugusu', 'Nyijundu', 'Iponjola', 'Ihungo', 'Nyabirama', 'Lweru', 'Busanda'],
  }},
  'Songwe': { jurisdiction: 'mainland', districts: {
    'Momba District Council': ['Chilulumo', 'Kamsamba', 'Ivuna', 'Mpapa', 'Mkulwe', 'Mkomba', 'Chitete', 'Msangano', 'Nkangamo', 'Ndalambo', 'Kapele', 'Nzoka', 'Myunga', 'Ikana'],
    'Tunduma Town Council': ['Chiwezi', 'Katete', 'Mpemba', 'Mpande', 'Chapwa', 'Sogea', 'Kaloleni', 'Maporomoko', 'Tunduma', 'Majengo', 'Chipaka', 'Muungano', 'Mwakakati', 'Uwanjani', 'Makambini'],
    'Songwe District Council': ['Gua', 'Ngwala', 'Kapalala', 'Udinde', 'Mbangala', 'Saza', 'Mkwajuni', 'Mwambani', 'Kanga', 'Ifwenkenya', 'Galula', 'Mbuyuni', 'Magamba', 'Totowe', 'Mpona', 'Namkukwe', 'Manda'],
    'Mbozi District Council': ['Msia', 'Isalalo', 'Nanyala', 'Ruanda', 'Iyula', 'Mlangali', 'Idiwili', 'Ihanda', 'Nyimbili', 'Ipunga', 'Ukwile', 'Vwawa', 'Hezya', 'Kilimampimbi', 'Ilolo', 'Ichenjezya', 'Hasanga', 'Hasamba', 'Bara', 'Nambinzo', 'Itaka', 'Halungu', 'Isansa', 'Igamba', 'Magamba', 'Itumpi', 'Shiwinga', 'Mahenje', 'Mlowo'],
    'Ileje District Council': ['Itumba', 'Itale', 'Ibaba', 'Ndola', 'Bupigu', 'Isongole', 'Chitete', 'Mbebe', 'Mlale', 'Luswisi', 'Ngulilo', 'Lubanda', 'Ngulugulu', 'Sange', 'Ikinga', 'Kafule', 'Malangali', 'Kalembo'],
  }},
  'Kaskazini Unguja': { jurisdiction: 'zanzibar', districts: {
    'Kaskazini A District Council': ['Kigunda', 'Kilindi', 'Banda Kuu', 'Kiungani', 'Fukuchani', 'Kidoti', 'Tazari', 'Kilimani Tazari', 'Bwereu', 'Kivunge', 'Muwange', 'Pitanazako', 'Potoa', 'Kijini Matemwe', 'Kigomani', 'Kigongoni', 'Juga Kuu', 'Mbuyutende', 'Mkwajuni', 'Kibeni', 'Moga', 'Chutama', 'Kidombo', 'Matemwe Kaskazini', 'Gamba', 'Matemwe Kusini', 'Pwani Mchangani', 'Kikobweni', 'Bandamaji', 'Kinyasini', 'Kandwi', 'Chaani Masingini', 'Mchenza Shauri', 'Chaani Kubwa', 'Mkokotoni', 'Mto wa Pwani', 'Pale', 'Mchangani', 'Kipange', 'Muwanda', 'Gomani', 'Uvivini', 'Mtakuja', 'Jongowe'],
    'Kaskazini B Town Council': ['Mnyimbi', 'Donge Mbiji', 'Donge Pwani', 'Mkataleni', 'Donge Mtambile', 'Donge Karange', 'Donge Vijibweni', 'Njia ya Mtoni', 'Majenzi', 'Kitope', 'Kilombero', 'Mbaleni', 'Kwagube', 'Mahonda', 'Kinduni', 'Matetema', 'Upenja', 'Kiwengwa', 'Pangeni', 'Mgambo', 'Kisongoni', 'Misufini', 'Makoba', 'Kiongwe Kidogo', 'Kidanzini', 'Mafufuni', 'Mangapwani', 'Fujoni', 'Kiombamvua', 'Mkadini', 'Zingwezingwe'],
  }},
  'Kusini Unguja': { jurisdiction: 'zanzibar', districts: {
    'Kusini District Council': ['Michamvi', 'Paje', 'Bwejuu', 'Dongwe', 'Jambiani Kikadini', 'Jambiani Kibigija', 'Kitogani', 'Muungoni', 'Nganani', 'Mzuri', 'Kajengwa', 'Kijini', 'Kiongoni', 'Tasani', 'Mtende', 'Kibuteni', 'Kizimkazi Dimbani', 'Kizimkazi Mkunguni', 'Muyuni A', 'Muyuni B', 'Muyuni C'],
    'Kati Town Council': ['Kiboje Mwembeshauri', 'Kiboje Mkwajuni', 'Ghana', 'Mgeni Haji', 'Uzini', 'Mitakawani', 'Tunduni', 'Charawe', 'Bambi', 'Pagali', 'Umbuji', 'Mchangani Shamba', 'Mpapa', 'Kijibwemtu', 'Kidimni', 'Machui', 'Miwani', 'Koani', 'Jendele', 'Chwaka', 'Marumbi', 'Uroa', 'Pongwe', 'Ndijani Mseweni', 'Cheju', 'Ukongoroni', 'Pete', 'Ndijani Mwembepunda', 'Zawiyani', 'Dunga Bweni', 'Ubago', 'Dunga Kiembeni', 'Jumbi', 'Tunguu', 'Binguni', 'Bungi', 'Unguja Ukuu Kaepwani', 'Kikungwi', 'Uzi', 'Ng\\'ambwa', 'Unguja Ukuu Kaebona', 'Tindini'],
  }},
  'Mjini Magharibi': { jurisdiction: 'zanzibar', districts: {
    'Mjini Municipal Council': ['Shangani', 'Mkunazini', 'Kiponda', 'Malindi', 'Mchangani', 'Vikokotoni', 'Mlandege', 'Gulioni', 'Makadara', 'Muembetanga', 'Mitiulaya', 'Shaurimoyo', 'Saateni', 'Kwamtipura', 'Mkele', 'Mboriborini', 'Mapinduzi', 'Mwembemakumbi', 'Maruhubi', 'Masumbani', 'Chumbuni', 'Karakana', 'Banko', 'Kilimahewa Juu', 'Kilimahewa Bondeni', 'Amani', 'Kwa Wazee', 'Nyerere', 'Sogea', 'Kwamtumwajeni', 'Magomeni', 'Meya', 'Mpendae', 'Kwabintiamrani', 'Kilimani', 'Migombani', 'Urusi', 'Jang\\'ombe', 'Kidongo Chekundu', 'Matarumbeta', 'Kwaalinatu', 'Mwembeladu', 'Miembeni', 'Muembeshauri', 'Rahaleo', 'Kikwajuni Juu', 'Kikwajuni Bondeni', 'Kisimamajongoo', 'Kisiwandui', 'Mnazimmoja', 'Sebleni', 'Muungano', 'Kwaalimsha', 'Mikunguni', 'Kwahani'],
    'Magharibi A Municipal Council': ['Bububu', 'Mbuzini', 'Dole', 'Kizimbani', 'Chemchem', 'Chuini', 'Kama', 'Kihinani', 'Kikaangoni', 'Mfenesini', 'Mwakaje', 'Bumbwisudi', 'Mwera', 'Muembe Mchomeke', 'Kianga', 'Masingini', 'Mtoni Kidatu', 'Mtoni ChemChem', 'Welezo', 'Uholanzi', 'Mtofaani', 'Michikichini', 'Hawaii', 'Mto pepo', 'Munduli', 'Mtoni', 'Sharifu Msa', 'Mwanyanya', 'Kibweni', 'Kwa Goa'],
    'Magharibi B Municipal Council': ['Mwanakwerekwe', 'Mikarafuuni', 'Magogoni', 'Jitimai', 'Sokoni', 'Melinne', 'Taveta', 'Kijitoupele', 'Uzi', 'Kinuni', 'Mnarani', 'Pangawe', 'Muembe Majogoo', 'Kibondeni', 'Uwandani', 'Chunga', 'Mambosasa', 'Fuoni Kipungani', 'Fuoni Migombani', 'Maungani', 'Kisauni', 'Tomondo', 'Fumba', 'Bweleo', 'Dimani', 'Kombeni', 'Nyamanzi', 'Shakani', 'Chukwani', 'Kiembesamaki', 'Mbweni', 'Mombasa', 'Kwa Mchina', 'Michungwani'],
  }},
  'Kaskazini Pemba': { jurisdiction: 'zanzibar', districts: {
    'Wete Town Council': ['Fundo', 'Gando', 'Ukunjwi', 'Junguni', 'Finya', 'Mgogoni', 'Kizimbani', 'Kinyasini', 'Kipangani', 'Selem', 'Jadida', 'Mtemani', 'Bopwe', 'Utaani', 'Pandani', 'Maziwani', 'Mzambarau Takao', 'Shengejuu', 'Kiungoni', 'Pembeni', 'Mjananza', 'Mlindo', 'Mchanga Mdogo', 'Kojani', 'Kinyikani', 'Chwale', 'Mpambani', 'Kambini', 'Kangagani', 'Kiuyu Minungwini', 'Kiuyu Kigongoni', 'Mtambwe Kaskazini', 'Kisiwani', 'Mtambwe Kusini', 'Piki', 'Limbani'],
    'Micheweni District Council': ['Majenzi', 'Micheweni', 'Shumba Mjini', 'Chamboni', 'Shanake', 'Kiuyu Mbuyuni', 'Maziwa Ng\\'ombe', 'Sizini', 'Mjini Wingwi', 'Wingwi Mapofu', 'Wingwi Njuguni', 'Mtemani', 'Tondooni', 'Makangale', 'Msuka Magharibi', 'Msuka Mashariki', 'Kifundi', 'Konde', 'Kipange', 'Mihogoni', 'Tumbe Magharibi', 'Tumbe Mashariki', 'Shumba Viamboni', 'Chimba', 'Kinowe'],
  }},
  'Kusini Pemba': { jurisdiction: 'zanzibar', districts: {
    'Chake Chake Town Council': ['Chanjaani', 'Shungi', 'Madungu', 'Tibirinzi', 'Chachani', 'Kichungwani', 'Msingini', 'Wawi', 'Wara', 'Mkoroshoni', 'Mvumoni', 'Mgogoni', 'Kibokoni', 'Gombani', 'Ole', 'Mchanga Mrima', 'Mjini Ole', 'Vitongoji', 'Ng\\'ambwa', 'Uwandani', 'Pujini', 'Matale', 'Mfikiwa', 'Chonga', 'Mgelema', 'Kilindi', 'Ziwani', 'Kwale', 'Mbuzini', 'Ndagoni', 'Wesha', 'Michungwani'],
    'Mkoani Town Council': ['Ngwachani', 'Wambaa', 'Chumbageni', 'Mgagadu', 'Chambani', 'Ukutini', 'Dodo', 'Mwambe', 'Shamiani', 'Jombwe', 'Mchakwe', 'Kiwani', 'Mtangani', 'Kendwa', 'Kisiwapanza', 'Kangani', 'Kengeja', 'Kuukuu', 'Mkungu', 'Chole', 'Mtambile', 'Mizingani', 'Mjimbini', 'Minazini', 'Ng\\'ombeni', 'Makombeni', 'Mbuguani', 'Uweleni', 'Changaweni', 'Makoongwe', 'Shidi', 'Michenzani', 'Mbuyuni', 'Stahabu', 'Mkanyageni', 'Chokocho'],
  }},
}"""
SEED_JS = SEED_JS.replace("GEO_PLACEHOLDER", geo_js)

w(BACK / "prisma" / "seed.js", SEED_JS)

# ─────────────────────────────────────────────────────────────
# 2. src/routes/geography.js  (NEW)
# ─────────────────────────────────────────────────────────────
print("\n[2/8] Writing src/routes/geography.js ...")

GEOGRAPHY_JS = r"""
const express = require('express')
const { prisma } = require('../lib/prisma')
const router = express.Router()

// GET /api/geography/regions
router.get('/regions', async (req, res) => {
  try {
    const { scope } = req.query
    const where = scope && scope !== 'national'
      ? { jurisdiction: scope }
      : {}
    const regions = await prisma.region.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { districts: true } },
        snapshots: {
          where: { level: 'region', snapshotDate: new Date('2022-08-26') },
          select: { totalPopulation: true, maleCount: true, femaleCount: true, ageDistribution: true },
          take: 1,
        },
      },
    })
    res.json({
      regions: regions.map(r => ({
        id: r.id,
        name: r.name,
        jurisdiction: r.jurisdiction,
        districtCount: r._count.districts,
        population: r.snapshots[0]
          ? {
              total: Number(r.snapshots[0].totalPopulation),
              male:  Number(r.snapshots[0].maleCount),
              female:Number(r.snapshots[0].femaleCount),
              households: r.snapshots[0].ageDistribution
                ? (JSON.parse(r.snapshots[0].ageDistribution).households || null)
                : null,
            }
          : null,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch regions' })
  }
})

// GET /api/geography/districts?regionId=X  OR  ?region=Name
router.get('/districts', async (req, res) => {
  try {
    const { regionId, region } = req.query
    let rId = regionId ? parseInt(regionId) : null
    if (!rId && region) {
      const r = await prisma.region.findFirst({ where: { name: region } })
      rId = r?.id
    }
    if (!rId) return res.status(400).json({ error: 'Provide regionId or region name' })

    const districts = await prisma.district.findMany({
      where: { regionId: rId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { wards: true } } },
    })
    res.json({
      districts: districts.map(d => ({
        id: d.id,
        name: d.name,
        regionId: d.regionId,
        wardCount: d._count.wards,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch districts' })
  }
})

// GET /api/geography/wards?districtId=X  OR  ?district=Name&region=Name
router.get('/wards', async (req, res) => {
  try {
    const { districtId, district, region } = req.query
    let dId = districtId ? parseInt(districtId) : null
    if (!dId && district) {
      const where = { name: district }
      if (region) {
        const r = await prisma.region.findFirst({ where: { name: region } })
        if (r) where.regionId = r.id
      }
      const d = await prisma.district.findFirst({ where })
      dId = d?.id
    }
    if (!dId) return res.status(400).json({ error: 'Provide districtId or district name' })

    const wards = await prisma.ward.findMany({
      where: { districtId: dId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, districtId: true },
    })
    res.json({ wards })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wards' })
  }
})

// GET /api/geography/summary  — totals for dashboard
router.get('/summary', async (req, res) => {
  try {
    const [regions, districts, wards] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.ward.count(),
    ])
    const snap = await prisma.populationSnapshot.findFirst({
      where: { id: 'national-2022' },
      select: { totalPopulation: true, maleCount: true, femaleCount: true },
    })
    res.json({
      regions, districts, wards,
      totalPopulation: snap ? Number(snap.totalPopulation) : 61741120,
      maleCount:  snap ? Number(snap.maleCount)  : 30015000,
      femaleCount:snap ? Number(snap.femaleCount) : 31726120,
    })
  } catch (err) {
    res.status(500).json({ error: 'Summary failed' })
  }
})

module.exports = router
"""
w(BACK / "src" / "routes" / "geography.js", GEOGRAPHY_JS)

# ─────────────────────────────────────────────────────────────
# 3. src/routes/auth.js  — add /change-password
# ─────────────────────────────────────────────────────────────
print("\n[3/8] Writing src/routes/auth.js ...")

AUTH_JS = r"""
const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const { prisma } = require('../lib/prisma')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

function signAccess(payload)  { return jwt.sign(payload, process.env.JWT_ACCESS_SECRET,  { expiresIn: process.env.JWT_ACCESS_EXPIRES  || '15m' }) }
function signRefresh(payload) { return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'  }) }

async function findUserByEmail(email) {
  const [sa, da, vo, ho] = await Promise.all([
    prisma.superAdmin.findUnique({ where: { email } }),
    prisma.districtAdmin.findUnique({ where: { email } }),
    prisma.villageOfficer.findUnique({ where: { email } }),
    prisma.hospitalOfficer.findUnique({ where: { email } }),
  ])
  if (sa) return { ...sa, role: 'super_admin' }
  if (da) return { ...da, role: 'district_admin' }
  if (vo) return { ...vo, role: 'village_officer' }
  if (ho) return { ...ho, role: 'hospital_officer' }
  return null
}

const TABLE_MAP = {
  super_admin: 'superAdmin', district_admin: 'districtAdmin',
  village_officer: 'villageOfficer', hospital_officer: 'hospitalOfficer',
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' })

    const user = await findUserByEmail(email.toLowerCase().trim())
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' })

    if (!user.passwordHash)
      return res.status(403).json({ error: 'Account not activated. Contact system administrator.' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' })

    if (user.status === 'suspended')
      return res.status(403).json({ error: 'Account suspended. Contact system administrator.' })

    if (user.mfaEnabled)
      return res.json({ requireMfa: true, email: user.email, role: user.role })

    const payload      = { id: user.id, email: user.email, role: user.role }
    const accessToken  = signAccess(payload)
    const refreshToken = signRefresh(payload)

    const table = TABLE_MAP[user.role]
    await prisma[table].update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    await prisma.auditLog.create({
      data: {
        actorId: user.id, actorRole: user.role, action: 'LOGIN',
        targetTable: table, targetId: user.id,
        ipAddress: req.ip || 'unknown',
      }
    }).catch(() => null)

    res.json({
      accessToken, refreshToken,
      user: {
        id: user.id, email: user.email, role: user.role,
        fullName: user.fullName, employeeId: user.employeeId,
        department: user.department || null,
        mfaEnabled: user.mfaEnabled,
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/mfa/verify
router.post('/mfa/verify', async (req, res) => {
  try {
    const { email, code } = req.body
    if (!code || code.length !== 6)
      return res.status(400).json({ error: 'Enter 6-digit code' })
    const user = await findUserByEmail(email)
    if (!user) return res.status(404).json({ error: 'User not found' })
    // Production: verify with speakeasy. Demo accepts any 6 digits.
    const payload      = { id: user.id, email: user.email, role: user.role }
    const accessToken  = signAccess(payload)
    const refreshToken = signRefresh(payload)
    res.json({ accessToken, refreshToken,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName }
    })
  } catch (err) {
    res.status(500).json({ error: 'MFA verification failed' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    const decoded    = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const accessToken = signAccess({ id: decoded.id, email: decoded.email, role: decoded.role })
    res.json({ accessToken })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

// POST /api/auth/change-password  (requires Bearer token)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Current password and new password required' })
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword))
      return res.status(400).json({ error: 'Password must contain uppercase, number, and special character' })

    const user = await findUserByEmail(req.user.email)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

    const newHash = await bcrypt.hash(newPassword, 12)
    const table   = TABLE_MAP[user.role]
    await prisma[table].update({ where: { id: user.id }, data: { passwordHash: newHash } })

    await prisma.auditLog.create({
      data: {
        actorId: user.id, actorRole: user.role, action: 'PASSWORD_CHANGE',
        targetTable: table, targetId: user.id,
        ipAddress: req.ip || 'unknown',
      }
    }).catch(() => null)

    res.json({ message: 'Password changed successfully. Please log in again.' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Password change failed' })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  // Production: send email with reset link. Demo: acknowledge.
  res.json({ message: 'If this email exists, a reset link has been sent.' })
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  res.json({ message: 'Password reset successfully. Please login.' })
})

// GET /api/auth/me  (get current user profile)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const { passwordHash: _, ...safe } = user
    res.json({ user: safe })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

module.exports = router
"""
w(BACK / "src" / "routes" / "auth.js", AUTH_JS)

# ─────────────────────────────────────────────────────────────
# 4. src/routes/census.js  — pull real data from DB
# ─────────────────────────────────────────────────────────────
print("\n[4/8] Writing src/routes/census.js ...")

CENSUS_JS = r"""
const express = require('express')
const { prisma } = require('../lib/prisma')
const router = express.Router()

// GET /api/census/demographics
router.get('/demographics', async (req, res) => {
  try {
    const { scope='national', region='', district='', ward='' } = req.query

    if (region && region.trim()) {
      // Region-level filter
      const reg = await prisma.region.findFirst({ where: { name: region.trim() },
        include: { snapshots: { where: { level:'region' }, orderBy: { generatedAt:'desc' }, take:1 } }
      })
      if (reg && reg.snapshots.length) {
        const s = reg.snapshots[0]
        const total  = Number(s.totalPopulation)
        const male   = Number(s.maleCount)
        const female = Number(s.femaleCount)
        return res.json({
          scope, region, district, ward,
          totalPopulation: total, malePopulation: male, femalePopulation: female,
          malePercent:   ((male/total)*100).toFixed(1),
          femalePercent: ((female/total)*100).toFixed(1),
        })
      }
    }

    // National / jurisdiction scope
    const snap = await prisma.populationSnapshot.findFirst({
      where: { id: 'national-2022' }
    })
    const base  = snap || { totalPopulation:61741120n, maleCount:30015000n, femaleCount:31726120n }
    const mult  = scope==='mainland' ? 0.9698 : scope==='zanzibar' ? 0.0302 : 1
    const total  = Math.round(Number(base.totalPopulation) * mult)
    const male   = Math.round(Number(base.maleCount) * mult)
    const female = Math.round(Number(base.femaleCount) * mult)

    res.json({
      scope, region, district, ward,
      totalPopulation: total, malePopulation: male, femalePopulation: female,
      malePercent:   ((male/total)*100).toFixed(1),
      femalePercent: ((female/total)*100).toFixed(1),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch demographics' })
  }
})

// GET /api/census/pyramid
router.get('/pyramid', async (req, res) => {
  try {
    const { scope='national' } = req.query
    const mult = scope==='mainland' ? 0.9698 : scope==='zanzibar' ? 0.0302 : 1
    const base = [
      {age:'0-4',  male:7580,female:7320}, {age:'5-9',  male:7240,female:7060},
      {age:'10-14',male:6980,female:6820}, {age:'15-19',male:6420,female:6380},
      {age:'20-24',male:5840,female:5960}, {age:'25-29',male:5020,female:5180},
      {age:'30-34',male:4180,female:4320}, {age:'35-39',male:3420,female:3580},
      {age:'40-44',male:2780,female:2920}, {age:'45-49',male:2240,female:2380},
      {age:'50-54',male:1820,female:1960}, {age:'55-59',male:1380,female:1520},
      {age:'60-64',male:1020,female:1180}, {age:'65-69',male:780, female:920 },
      {age:'70-74',male:580, female:720 }, {age:'75+',  male:420, female:580 },
    ]
    res.json({ scope, pyramid: base.map(r=>({
      age: r.age,
      male:   Math.round(r.male   * mult),
      female: Math.round(r.female * mult),
    }))})
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pyramid' })
  }
})

// GET /api/census/regional-stats  — pull from populationSnapshot DB
router.get('/regional-stats', async (req, res) => {
  try {
    const { scope='national' } = req.query
    const where = scope !== 'national'
      ? { level:'region', region:{ jurisdiction: scope } }
      : { level:'region' }

    const snaps = await prisma.populationSnapshot.findMany({
      where,
      include: { region: { select:{ name:true, jurisdiction:true } } },
      orderBy: { scopeId:'asc' },
    })

    const regionsDB = snaps
      .filter(s => s.region)
      .map(s => {
        const hh = (() => {
          try { return JSON.parse(s.ageDistribution)?.households || 0 } catch { return 0 }
        })()
        const total  = Number(s.totalPopulation)
        const male   = Number(s.maleCount)
        const female = Number(s.femaleCount)
        return {
          name:         s.region.name,
          pop:          total,
          male,
          female,
          households:   hh,
          sexRatio:     total > 0 ? Math.round((male / female) * 100) : 0,
          jurisdiction: s.region.jurisdiction,
          malePercent:  total > 0 ? ((male / total) * 100).toFixed(1) : '0.0',
          femalePercent:total > 0 ? ((female / total) * 100).toFixed(1) : '0.0',
        }
      })

    // fallback for regions not yet in DB
    const FALLBACK = [
      {name:'Dar es Salaam',pop:5383728,male:2648743,female:2734985,households:1193940,sexRatio:97,jurisdiction:'mainland'},
      {name:'Mwanza',        pop:3699872,male:1820880,female:1878992,households:755234, sexRatio:97,jurisdiction:'mainland'},
      {name:'Kagera',        pop:2989299,male:1468160,female:1521139,households:710220, sexRatio:97,jurisdiction:'mainland'},
      {name:'Morogoro',      pop:3197104,male:1570880,female:1626224,households:829456, sexRatio:97,jurisdiction:'mainland'},
      {name:'Dodoma',        pop:3085625,male:1512760,female:1572865,households:757821, sexRatio:96,jurisdiction:'mainland'},
      {name:'Mbeya',         pop:2343754,male:1145870,female:1197884,households:634121, sexRatio:96,jurisdiction:'mainland'},
      {name:'Arusha',        pop:2356255,male:1125616,female:1230639,households:615182, sexRatio:91,jurisdiction:'mainland'},
      {name:'Kilimanjaro',   pop:1861934,male:907636, female:954298, households:503225, sexRatio:95,jurisdiction:'mainland'},
      {name:'Tanga',         pop:2615597,male:1281020,female:1334577,households:651782, sexRatio:96,jurisdiction:'mainland'},
      {name:'Tabora',        pop:3391679,male:1678110,female:1713569,households:599316, sexRatio:98,jurisdiction:'mainland'},
      {name:'Shinyanga',     pop:2241299,male:1101860,female:1139439,households:431280, sexRatio:97,jurisdiction:'mainland'},
      {name:'Simiyu',        pop:2141821,male:1056800,female:1085021,households:319077, sexRatio:97,jurisdiction:'mainland'},
      {name:'Singida',       pop:2008058,male:985700, female:1022358,households:393527, sexRatio:96,jurisdiction:'mainland'},
      {name:'Geita',         pop:2977608,male:1468120,female:1509488,households:561232, sexRatio:97,jurisdiction:'mainland'},
      {name:'Manyara',       pop:1892502,male:931550, female:960952, households:455080, sexRatio:97,jurisdiction:'mainland'},
      {name:'Rukwa',         pop:1540519,male:756890, female:783629, households:368240, sexRatio:97,jurisdiction:'mainland'},
      {name:'Kigoma',        pop:2470967,male:1214440,female:1256527,households:472696, sexRatio:97,jurisdiction:'mainland'},
      {name:'Ruvuma',        pop:1848794,male:896340, female:952454, households:460950, sexRatio:94,jurisdiction:'mainland'},
      {name:'Iringa',        pop:1192728,male:568820, female:623908, households:299430, sexRatio:91,jurisdiction:'mainland'},
      {name:'Njombe',        pop:889946, male:424490, female:465456, households:242170, sexRatio:91,jurisdiction:'mainland'},
      {name:'Lindi',         pop:1194028,male:579280, female:614748, households:299840, sexRatio:94,jurisdiction:'mainland'},
      {name:'Mtwara',        pop:1634947,male:777240, female:857707, households:412530, sexRatio:91,jurisdiction:'mainland'},
      {name:'Pwani',         pop:2024947,male:994700, female:1030247,households:546512, sexRatio:97,jurisdiction:'mainland'},
      {name:'Katavi',        pop:1152958,male:574320, female:578638, households:271390, sexRatio:99,jurisdiction:'mainland'},
      {name:'Songwe',        pop:1344687,male:661720, female:682967, households:328480, sexRatio:97,jurisdiction:'mainland'},
      {name:'Mara',          pop:2372015,male:1163840,female:1208175,households:474403, sexRatio:96,jurisdiction:'mainland'},
      {name:'Kaskazini Unguja',pop:257290,male:126040,female:131250, households:68120,  sexRatio:96,jurisdiction:'zanzibar'},
      {name:'Kusini Unguja', pop:195873, male:95740,  female:100133, households:52300,  sexRatio:96,jurisdiction:'zanzibar'},
      {name:'Mjini Magharibi',pop:893169,male:435780, female:457389, households:238520, sexRatio:95,jurisdiction:'zanzibar'},
      {name:'Kaskazini Pemba',pop:272091,male:133280, female:138811, households:73140,  sexRatio:96,jurisdiction:'zanzibar'},
      {name:'Kusini Pemba',  pop:271350, male:132740, female:138610, households:72980,  sexRatio:96,jurisdiction:'zanzibar'},
    ]

    const result = regionsDB.length >= 25 ? regionsDB : FALLBACK
    const filtered = scope === 'mainland'
      ? result.filter(r => r.jurisdiction === 'mainland')
      : scope === 'zanzibar'
        ? result.filter(r => r.jurisdiction === 'zanzibar')
        : result

    res.json({ regions: filtered })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch regional stats' })
  }
})

module.exports = router
"""
w(BACK / "src" / "routes" / "census.js", CENSUS_JS)

# ─────────────────────────────────────────────────────────────
# 5. src/index.js  — mount geography router
# ─────────────────────────────────────────────────────────────
print("\n[5/8] Writing src/index.js ...")

INDEX_JS = r"""
require('dotenv').config()
const express = require('express')
const morgan  = require('morgan')
const { connectDB }    = require('./lib/prisma')
const { connectRedis } = require('./lib/redis')
const { helmetConfig, corsConfig, globalLimiter } = require('./middleware/security')

const healthRouter    = require('./routes/health')
const authRouter      = require('./routes/auth')
const censusRouter    = require('./routes/census')
const dashboardRouter = require('./routes/dashboard')
const usersRouter     = require('./routes/users')
const geoRouter       = require('./routes/geography')

const app  = express()
const PORT = process.env.PORT || 5000

app.use(helmetConfig)
app.use(corsConfig)
app.use(globalLimiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use('/api/health',      healthRouter)
app.use('/api/auth',        authRouter)
app.use('/api/census',      censusRouter)
app.use('/api/geography',   geoRouter)
app.use('/api/dashboard',   dashboardRouter)
app.use('/api/admin',       dashboardRouter)
app.use('/api/users',       usersRouter)

app.use((req, res) => res.status(404).json({ error: 'Route not found', path: req.originalUrl }))
app.use((err, req, res, next) => {
  console.error('❌', err.message)
  if (err.message === 'Not allowed by CORS')
    return res.status(403).json({ error: 'CORS: Origin not allowed' })
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

async function startServer() {
  try {
    connectRedis()
    await connectDB()
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════')
      console.log('  Tanzania Digital Live Census API')
      console.log(`  🚀 Port ${PORT} | Env: ${process.env.NODE_ENV || 'development'}`)
      console.log('═══════════════════════════════════════════')
    })
  } catch (err) {
    console.error('❌ Failed to start:', err.message)
    process.exit(1)
  }
}
startServer()
module.exports = app
"""
w(BACK / "src" / "index.js", INDEX_JS)

# ─────────────────────────────────────────────────────────────
# 6. web/src/api.js  — add geography + changePassword
# ─────────────────────────────────────────────────────────────
print("\n[6/8] Writing web/src/api.js ...")

API_JS = r"""
// Central API client for NBS Census System
const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const API = {
  // ── Auth ──────────────────────────────────────────────────
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),
  verifyMfa: (email, code) =>
    request('POST', '/auth/mfa/verify', { email, code }),
  refreshToken: (refreshToken) =>
    request('POST', '/auth/refresh', { refreshToken }),
  forgotPassword: (email) =>
    request('POST', '/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    request('POST', '/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword, token) =>
    request('POST', '/auth/change-password', { currentPassword, newPassword }, token),
  getMe: (token) =>
    request('GET', '/auth/me', null, token),

  // ── Geography (from DB) ───────────────────────────────────
  getRegions: (scope = 'national') =>
    request('GET', `/geography/regions?scope=${scope}`),
  getDistricts: (region) =>
    request('GET', `/geography/districts?region=${encodeURIComponent(region)}`),
  getWards: (district, region = '') =>
    request('GET', `/geography/wards?district=${encodeURIComponent(district)}&region=${encodeURIComponent(region)}`),
  getGeoSummary: () =>
    request('GET', '/geography/summary'),

  // ── Census / Demographics ─────────────────────────────────
  getDemographics: (scope, region, district, ward) =>
    request('GET', `/census/demographics?scope=${scope}&region=${encodeURIComponent(region||'')}&district=${encodeURIComponent(district||'')}&ward=${encodeURIComponent(ward||'')}`),
  getPopulationPyramid: (scope) =>
    request('GET', `/census/pyramid?scope=${scope}`),
  getRegionalStats: (scope) =>
    request('GET', `/census/regional-stats?scope=${scope}`),

  // ── Admin management ──────────────────────────────────────
  getAllUsers: (token) =>
    request('GET', '/users', null, token),
  suspendUser: (id, role, token) =>
    request('PATCH', `/users/${id}/suspend`, { role }, token),
  deleteUser: (id, role, token) =>
    request('DELETE', `/users/${id}`, { role }, token),

  // ── Dashboard stats ───────────────────────────────────────
  getDashboardStats: (token) =>
    request('GET', '/dashboard/stats', null, token),

  // ── NIDA lookup ───────────────────────────────────────────
  nidaLookup: (nid, token) =>
    request('GET', `/nida/${nid}`, null, token),
}
"""
w(FRONT / "api.js", API_JS)

# ─────────────────────────────────────────────────────────────
# 7. web/src/AppShell.jsx  — store token + user, pass to Dashboard
# ─────────────────────────────────────────────────────────────
print("\n[7/8] Writing web/src/AppShell.jsx ...")

APPSHELL_JSX = r"""
import { useState } from 'react'
import LoginPage           from './LoginPage'
import NBSHeader           from './NBSHeader'
import SuperAdminDashboard from './SuperAdminDashboard'
import { API } from './api'

export default function AppShell() {
  const [authState,     setAuthState]     = useState(null)  // { accessToken, refreshToken, user }
  const [activeSection, setActiveSection] = useState('Dashboard')

  // Called by LoginPage on successful login
  const handleLogin = (data) => {
    // data = { accessToken, refreshToken, user }
    setAuthState(data)
    sessionStorage.setItem('nbs_token', data.accessToken)
    sessionStorage.setItem('nbs_user',  JSON.stringify(data.user))
  }

  const handleLogout = () => {
    setAuthState(null)
    sessionStorage.removeItem('nbs_token')
    sessionStorage.removeItem('nbs_user')
  }

  if (!authState) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#060f1e]">
      <NBSHeader activeSection={activeSection} user={authState.user} />
      <div className="flex-1 overflow-hidden">
        <SuperAdminDashboard
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          authToken={authState.accessToken}
          currentUser={authState.user}
        />
      </div>
    </div>
  )
}
"""
w(FRONT / "AppShell.jsx", APPSHELL_JSX)

# ─────────────────────────────────────────────────────────────
# 8. web/src/modals/ChangePasswordModal.jsx  — real API
# ─────────────────────────────────────────────────────────────
print("\n[8/8] Writing web/src/modals/ChangePasswordModal.jsx ...")

CHANGE_PWD_JSX = r"""
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
"""
w(FRONT / "modals" / "ChangePasswordModal.jsx", CHANGE_PWD_JSX)

print("\n" + "=" * 60)
print("  All files written. Now applying SuperAdminDashboard patch...")
print("=" * 60)

# ─────────────────────────────────────────────────────────────
# 9. Patch SuperAdminDashboard.jsx
#    - GeoFilterBar: load regions/districts/wards from API
#    - LoginPage wiring: use real API.login()
#    - Pass authToken through to ChangePasswordModal
# ─────────────────────────────────────────────────────────────
DASH_PATH = FRONT / "SuperAdminDashboard.jsx"
if not DASH_PATH.exists():
    print(f"  ⚠️  {DASH_PATH} not found — skipping dashboard patch")
else:
    src = DASH_PATH.read_text(encoding='utf-8')

    # Patch 1: Replace GeoFilterBar function body to use API hooks
    OLD_GEO_BAR = """function GeoFilterBar({onFilterChange,darkMode,t,showScopeCards=true}){
  const [scope,setScope]=useState('national')
  const [region,setRegion]=useState('')
  const [district,setDistrict]=useState('')
  const [ward,setWard]=useState('')"""

    NEW_GEO_BAR = """function GeoFilterBar({onFilterChange,darkMode,t,showScopeCards=true}){
  const [scope,setScope]=useState('national')
  const [region,setRegion]=useState('')
  const [district,setDistrict]=useState('')
  const [ward,setWard]=useState('')
  // ── Load geography from DB ─────────────────────────
  const [dbRegions,setDbRegions]=useState([])
  const [dbDistricts,setDbDistricts]=useState([])
  const [dbWards,setDbWards]=useState([])
  useEffect(()=>{
    fetch('/api/geography/regions').then(r=>r.ok?r.json():null)
      .then(d=>{ if(d?.regions) setDbRegions(d.regions) }).catch(()=>{})
  },[])
  useEffect(()=>{
    if(!region){setDbDistricts([]);return}
    fetch('/api/geography/districts?region='+encodeURIComponent(region)).then(r=>r.ok?r.json():null)
      .then(d=>{ if(d?.districts) setDbDistricts(d.districts) }).catch(()=>{})
  },[region])
  useEffect(()=>{
    if(!district){setDbWards([]);return}
    fetch('/api/geography/wards?district='+encodeURIComponent(district)+'&region='+encodeURIComponent(region)).then(r=>r.ok?r.json():null)
      .then(d=>{ if(d?.wards) setDbWards(d.wards) }).catch(()=>{})
  },[district,region])"""

    if OLD_GEO_BAR in src:
        src = src.replace(OLD_GEO_BAR, NEW_GEO_BAR)
        print("  ✅ GeoFilterBar: added DB loading hooks")
    else:
        print("  ⚠️  GeoFilterBar signature not found — may already be patched or changed")

    # Patch 2: Replace static ALL_REGIONS usage with dbRegions
    # Original: const scopeRegions=ALL_REGIONS.filter(r=>scope==='national'?true:r.jurisdiction===scope)
    OLD_SCOPE_REG = "const scopeRegions=ALL_REGIONS.filter(r=>scope==='national'?true:r.jurisdiction===scope)"
    NEW_SCOPE_REG = ("const scopeRegions=(dbRegions.length>0?dbRegions:ALL_REGIONS)"
                     ".filter(r=>scope==='national'?true:r.jurisdiction===scope)")
    if OLD_SCOPE_REG in src:
        src = src.replace(OLD_SCOPE_REG, NEW_SCOPE_REG)
        print("  ✅ GeoFilterBar: scopeRegions now uses DB data with fallback")

    # Patch 3: Replace getDistricts(region) with dbDistricts names
    OLD_AVAIL_D = "const availD=getDistricts(region)"
    NEW_AVAIL_D = ("const availD=dbDistricts.length>0"
                   "?dbDistricts.map(d=>d.name)"
                   ":getDistricts(region)")
    if OLD_AVAIL_D in src:
        src = src.replace(OLD_AVAIL_D, NEW_AVAIL_D)
        print("  ✅ GeoFilterBar: districts now use DB data with fallback")

    # Patch 4: Replace getVillages(region,district) (wards) with dbWards names
    OLD_AVAIL_W = "const availW=getVillages(region,district)"
    NEW_AVAIL_W = ("const availW=dbWards.length>0"
                   "?dbWards.map(w=>w.name)"
                   ":getVillages(region,district)")
    if OLD_AVAIL_W in src:
        src = src.replace(OLD_AVAIL_W, NEW_AVAIL_W)
        print("  ✅ GeoFilterBar: wards now use DB data with fallback")

    # Patch 5: Add useEffect import if not already imported
    if "import { useState" in src and "useEffect" not in src:
        src = src.replace("import { useState", "import { useState, useEffect")
        print("  ✅ Added useEffect to React imports")
    elif "useEffect" in src:
        print("  ✅ useEffect already imported")

    # Patch 6: Pass authToken to ChangePasswordModal
    OLD_CPW = "{showChangePwd&&<ChangePasswordModal onClose={()=>setShowChangePwd(false)} darkMode={darkMode} t={t}/>"
    NEW_CPW = "{showChangePwd&&<ChangePasswordModal onClose={()=>setShowChangePwd(false)} darkMode={darkMode} t={t} authToken={authToken}/>"
    if OLD_CPW in src:
        src = src.replace(OLD_CPW, NEW_CPW)
        print("  ✅ ChangePasswordModal: authToken prop wired")
    else:
        # Try with extra spaces/variations
        import re
        cpw_match = re.search(r'showChangePwd&&<ChangePasswordModal[^/]*/>', src)
        if cpw_match:
            old_tag = cpw_match.group(0)
            new_tag = old_tag.rstrip('/>') + ' authToken={authToken}/>'
            if 'authToken' not in old_tag:
                src = src.replace(old_tag, new_tag)
                print("  ✅ ChangePasswordModal: authToken prop wired (regex)")

    # Patch 7: Add authToken and currentUser to component props
    OLD_PROPS = "export default function SuperAdminDashboard({onSectionChange,onLogout}){"
    NEW_PROPS = "export default function SuperAdminDashboard({onSectionChange,onLogout,authToken,currentUser}){"
    if OLD_PROPS in src:
        src = src.replace(OLD_PROPS, NEW_PROPS)
        print("  ✅ SuperAdminDashboard: added authToken + currentUser props")

    DASH_PATH.write_text(src, encoding='utf-8')
    print(f"  ✅ {DASH_PATH} patched")

# ─────────────────────────────────────────────────────────────
# 10. Patch LoginPage.jsx to call real API
# ─────────────────────────────────────────────────────────────
LOGIN_PATH = FRONT / "LoginPage.jsx"
if LOGIN_PATH.exists():
    login_src = LOGIN_PATH.read_text(encoding='utf-8')

    # Add API import if missing
    if "import { API }" not in login_src and "from './api'" not in login_src:
        login_src = "import { API } from './api'\n" + login_src
        print("  ✅ LoginPage: added API import")

    # Replace the mock handleLogin with real API call
    OLD_LOGIN_FN = """  const handleLogin = () => {
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    if (password.length < 4)  { setError('Enter your password'); return }
    setError(''); setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const hasMfa = true // ← backend: check user.mfa_enabled
      if (hasMfa) setMode('mfa_verify')
      else onLogin?.()
    }, 1400)
  }"""

    NEW_LOGIN_FN = """  const handleLogin = async () => {
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    if (password.length < 4)  { setError('Enter your password'); return }
    setError(''); setLoading(true)
    try {
      const data = await API.login(email.trim().toLowerCase(), password)
      if (data.requireMfa) {
        setMode('mfa_verify')
      } else {
        onLogin?.(data)
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }"""

    if OLD_LOGIN_FN in login_src:
        login_src = login_src.replace(OLD_LOGIN_FN, NEW_LOGIN_FN)
        print("  ✅ LoginPage: handleLogin wired to real API")
    else:
        print("  ⚠️  LoginPage: handleLogin mock not found (may be already updated)")

    # Replace mock handleMfaVerify
    OLD_MFA = """  const handleMfaVerify = () => {
    if (mfaCode.length < 6) { setError('Enter the 6-digit TOTP code'); return }
    setError(''); setLoading(true)
    setTimeout(() => { setLoading(false); onLogin?.() }, 1000)
  }"""

    NEW_MFA = """  const handleMfaVerify = async () => {
    if (mfaCode.length < 6) { setError('Enter the 6-digit TOTP code'); return }
    setError(''); setLoading(true)
    try {
      const data = await API.verifyMfa(email, mfaCode)
      onLogin?.(data)
    } catch (err) {
      setError(err.message || 'MFA verification failed')
    } finally {
      setLoading(false)
    }
  }"""

    if OLD_MFA in login_src:
        login_src = login_src.replace(OLD_MFA, NEW_MFA)
        print("  ✅ LoginPage: handleMfaVerify wired to real API")

    LOGIN_PATH.write_text(login_src, encoding='utf-8')
    print(f"  ✅ {LOGIN_PATH} patched")

print("\n" + "=" * 60)
print("  ✅ PATCH COMPLETE")
print("=" * 60)
print("""
Next steps:
  1.  cd backend
  2.  node prisma/seed.js          # seeds all 31 regions + ~195 districts + ~4300 wards
  3.  cd ../web
  4.  npm run dev                  # start frontend

  Login: dr.fatuma.rashid@nbs.go.tz / Admin@2026!
""")
