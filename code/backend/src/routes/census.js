
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
