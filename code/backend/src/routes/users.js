const express = require('express')
const { prisma } = require('../lib/prisma')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// GET /api/users — all system users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [superAdmins, districtAdmins, villageOfficers, hospitalOfficers, publicUsers] =
      await Promise.all([
        prisma.superAdmin.findMany({ select:{id:true,fullName:true,email:true,status:true,lastLogin:true} }),
        prisma.districtAdmin.findMany({ select:{id:true,fullName:true,email:true,status:true,lastLogin:true} }),
        prisma.villageOfficer.findMany({ select:{id:true,fullName:true,email:true,status:true,lastLogin:true} }),
        prisma.hospitalOfficer.findMany({ select:{id:true,fullName:true,email:true,status:true,lastLogin:true} }),
        prisma.publicUser.findMany({ select:{id:true,displayName:true,email:true,status:true,lastLogin:true} }).catch(()=>[]),
      ])

    const mapRole = (users, role) =>
      users.map(u => ({ ...u, role, name: u.fullName || u.displayName || u.email }))

    res.json({
      users: [
        ...mapRole(superAdmins,     'Super Admin'),
        ...mapRole(districtAdmins,  'District Admin'),
        ...mapRole(villageOfficers, 'Village Officer'),
        ...mapRole(hospitalOfficers,'Hospital Officer'),
        ...mapRole(publicUsers,     'Citizen'),
      ]
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// PATCH /api/users/:id/suspend
router.patch('/:id/suspend', authMiddleware, async (req, res) => {
  const { role } = req.body
  const { id } = req.params
  try {
    const tableMap = {
      'Super Admin':'superAdmin','District Admin':'districtAdmin',
      'Village Officer':'villageOfficer','Hospital Officer':'hospitalOfficer','Citizen':'publicUser'
    }
    const table = tableMap[role]
    if (!table) return res.status(400).json({ error: 'Unknown role' })
    const statusField = role === 'Citizen' ? 'status' : 'status'
    await prisma[table].update({ where:{id}, data:{ status: role==='Citizen'?'suspended':'suspended' } })
    res.json({ message: 'User suspended' })
  } catch (err) {
    res.status(500).json({ error: 'Suspend failed' })
  }
})

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const { role } = req.body
  const { id } = req.params
  try {
    const tableMap = {
      'Super Admin':'superAdmin','District Admin':'districtAdmin',
      'Village Officer':'villageOfficer','Hospital Officer':'hospitalOfficer','Citizen':'publicUser'
    }
    const table = tableMap[role]
    if (!table) return res.status(400).json({ error: 'Unknown role' })
    await prisma[table].delete({ where:{id} })
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' })
  }
})

module.exports = router
