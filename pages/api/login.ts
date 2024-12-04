// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import * as auth from '../../lib/auth'
import { UserSession } from '../../lib/types/auth'
import { LoginApiResponse } from '../login/login'
import { sendEmail } from '../../lib/mail'

const loginRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<LoginApiResponse>
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' })
  }

  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 检查用户状态
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ message: '账户已被停用' })
    }

    // If user exists, check if password is correct using auth lib
    if (await auth.verifyPassword(password, user.password)) {
      // Keep only fields defined in SessionUser
      const session: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
      }

      // generate access + refresh token + email token for 2 factor authentication
      const token = auth.generateAccessToken(session)
      const refreshToken = auth.generateRefreshToken(session)
      const twoFactorToken = auth.generateTwoFactorToken(session)

      // save refresh token + second factor auth to database
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken,
          twoFactorToken,
        },
      })

      //  Send email with specified token
      sendEmail({
        to: user.email,
        subject: 'JWT Authentication - Two factor authentication',
        text: `Click this link to login...`,
        html: `<a href="http://localhost:3000/two-factor?token=${twoFactorToken}">Click here to login</a>`,
      })

      // return access and refresh token
      return res.status(200).json({
        success: true,
        data: {
          token,
          refreshToken,
          session,
        },
      })
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export default withMiddlewares(loginRoute)
