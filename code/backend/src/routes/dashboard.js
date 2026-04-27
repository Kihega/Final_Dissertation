const express = require('express')
const { prisma } = require('../lib/prisma')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [superAdmins, districtAdmins, villageOfficers, hospitalOfficers] = await Promise.all([
      prisma.superAdmin.count(),
      prisma.districtAdmin.count(),
      prisma.villageOfficer.count(),
      prisma.hospitalOfficer.count(),
    ])

    res.json({
      totalPopulation: 63748291,
      districtAdmins,
      systemHealth: 99.9,
      securityAlerts: 2,
      superAdmins,
      villageOfficers,
      hospitalOfficers,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// POST /api/admin/clean-database (demo only)
router.post('/clean-database', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin')
      return res.status(403).json({ error: 'Super Admin only' })

    const { confirm } = req.body
    if (confirm !== 'CONFIRM_CLEAN_DATABASE')
      return res.status(400).json({ error: 'Send confirm: CONFIRM_CLEAN_DATABASE' })

    // Delete all civil registry data (keep admins/officers)
    await prisma.$transaction([
      prisma.death.deleteMany(),
      prisma.birth.deleteMany(),
      prisma.marriage.deleteMany(),
      prisma.migration.deleteMany(),
      prisma.building.deleteMany(),
      prisma.publicInfrastructure.deleteMany(),
      prisma.citizen.deleteMany(),
      prisma.populationSnapshot.deleteMany(),
      prisma.auditLog.deleteMany(),
    ])

    res.json({ message: 'Database cleaned. System ready for real deployment.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Clean failed: ' + err.message })
  }
})

module.exports = router
