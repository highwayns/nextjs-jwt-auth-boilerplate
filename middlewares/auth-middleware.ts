import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, refreshAccessToken } from '../lib/jwt'
import { UserSession } from '../lib/types/auth'
import { Middleware } from '../lib/types/middleware'

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserSession
}

export const authMiddleware: Middleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    try {
      await verifyToken(token, process.env.JWT_SECRET!)
      if (next) await next(req, res)
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken
        if (refreshToken) {
          try {
            const newToken = await refreshAccessToken(refreshToken)
            res.setHeader('Set-Cookie', `token=${newToken}; Path=/`)
            if (next) await next(req, res)
          } catch (refreshError) {
            return res.status(401).json({ message: 'Token refresh failed' })
          }
        }
      }
      return res.status(401).json({ message: 'Invalid token' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}
