import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { verifyAccessToken } from '../../../lib/auth'
import { Role } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 验证管理员权限
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: '未授权访问' })
    }

    const decoded = await verifyAccessToken(token)
    const admin = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!admin || admin.role !== Role.ADMIN) {
      return res.status(403).json({ message: '需要管理员权限' })
    }

    // GET 获取用户列表
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          enabled: true,
        }
      })
      return res.status(200).json(users)
    }

    // PATCH 更新用户状态或角色
    if (req.method === 'PATCH') {
      const { userId, status, role } = req.body

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(status && { status }),
          ...(role && { role }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          role: true,
          enabled: true,
        }
      })

      return res.status(200).json(updatedUser)
    }

    return res.status(405).json({ message: '方法不允许' })
  } catch (error) {
    console.error('Admin API Error:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
} 