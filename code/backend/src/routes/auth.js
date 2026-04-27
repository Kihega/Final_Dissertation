
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
