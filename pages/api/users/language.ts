import { NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { withMiddlewares } from '../../../middlewares'
import { authMiddleware, NextApiRequestWithUser } from '../../../middlewares/auth-middleware'

const validLanguages = ['EN', 'ZH', 'JA']

export default withMiddlewares(authMiddleware, async (
  req: NextApiRequestWithUser,
  res: NextApiResponse
) => {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { language } = req.body

    if (!language || !validLanguages.includes(language)) {
      return res.status(400).json({ message: 'Invalid language' })
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { language: language as string }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Update language error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}) 