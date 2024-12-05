import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { prisma } from '../../lib/db'
import { sendEmail } from '../../lib/mail'
import { generateTwoFactorToken } from '../../lib/auth'
import { UserSession } from '../../lib/types/auth'

export type RegisterApiResponse = {
  success: boolean
  message?: string
}

const registerRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<RegisterApiResponse>
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  const { email, password, name, surname } = req.body

  try {
    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册',
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)


    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        surname,
        role: 'USER',
        enabled: false,
        status: 'PENDING',
        language: 'EN',
      },
    })

    const session: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
      }

    // 生成激活token
    const activationToken = generateTwoFactorToken(session)
    await prisma.user.update({
        where: { id: user.id },
        data: {
          activationToken: activationToken,
        },
      })
  
    // 发送激活邮件
    await sendEmail({
      to: email,
      subject: '账号激活',
      text: `请点击以下链接激活账号: ${process.env.APP_URL}/activate?token=${activationToken}`,
      html: `
        <h1>账号激活</h1>
        <p>请点击以下链接激活账号:</p>
        <a href="${process.env.APP_URL}/activate?token=${activationToken}">激活账号</a>
      `,
    })

    return res.status(200).json({
      success: true,
      message: '注册成功，请检查邮箱激活账号',
    })
  } catch (error) {
    console.error('注册错误:', error)
    return res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试',
    })
  }
}

export default registerRoute 