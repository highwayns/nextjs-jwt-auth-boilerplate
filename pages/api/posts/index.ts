import { NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { withMiddlewares } from '../../../middlewares'
import { authMiddleware, NextApiRequestWithUser } from '../../../middlewares/auth-middleware'
import { Post } from '@prisma/client'

export interface PostsApiResponse {
  success: boolean
  data?: {
    posts: Post[]
  }
  message?: string
}

export default withMiddlewares(authMiddleware, async (
  req: NextApiRequestWithUser,
  res: NextApiResponse
) => {
  if (req.method === 'POST') {
    const { title, content } = req.body

    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e',
          authorId: req.user.id
        }
      })

      return res.status(201).json(post)
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create post' })
    }
  }

  if (req.method === 'GET') {
    try {
      const posts = await prisma.post.findMany({
        where: {
          authorId: req.user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json(posts)
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch posts' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
})
