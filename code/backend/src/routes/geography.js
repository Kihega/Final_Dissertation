
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
