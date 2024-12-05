/**
 * This library is used to generate confirmation tokens needed for certain actions.
 */

import { sign, verify } from 'jsonwebtoken'
import { User, PrismaClient } from '@prisma/client'
import { JwtPayload } from 'jsonwebtoken'
import { UserSession } from './types/auth'

const prisma = new PrismaClient()

export const generateToken = <T extends Object | string>(
  payload: T,
  secret: string,
  expiresIn: string | number | undefined
) => {
  return sign(payload, secret, {
    expiresIn,
  })
}

export const verifyToken = (
  token: string,
  secret: string
): Promise<UserSession> => {
  return new Promise((resolve, reject) => {
    try {
      verify(token, secret, (err, decoded) => {
        if (err || !decoded) {
          return reject(err)
        }
        const userDecoded = decoded as UserSession
        // Now, convert decoded to UserSession by removing additional properties
        const userSession: UserSession = {
          id: userDecoded.id,
          email: userDecoded.email,
          role: userDecoded.role,
          name: userDecoded.name,
          surname: userDecoded.surname,
        }
        resolve(userSession)
      })
    } catch (err) {
      reject(err)
    }
  })
}

export const generateAccessToken = (user: User) => {
  return sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '24h'
  })
}

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) throw new Error('User not found')

    return generateAccessToken(user)
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}
