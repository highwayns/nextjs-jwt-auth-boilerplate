import { NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { prisma } from '../../lib/db'
import { withMiddlewares } from '../../middlewares'
import { authMiddleware, NextApiRequestWithUser } from '../../middlewares/auth-middleware'
import { verifyPassword } from '../../lib/auth'

export type ChangePasswordApiResponse = {
  success: boolean
  message?: string
}

const changePasswordRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<ChangePasswordApiResponse>
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  const { currentPassword, newPassword } = req.body

  try {
    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      })
    }

    // 验证当前密码
    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误',
      })
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
      },
    })

    return res.status(200).json({
      success: true,
      message: '密码修改成功',
    })
  } catch (error) {
    console.error('修改密码错误:', error)
    return res.status(500).json({
      success: false,
      message: '修改密码失败，请稍后重试',
    })
  }
}

export default withMiddlewares(authMiddleware, changePasswordRoute) 