import { Post } from '@prisma/client'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface PostsApiResponse extends ApiResponse {
  data?: {
    posts: Post[]
  }
} 