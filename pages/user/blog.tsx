import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../providers/auth/AuthProvider'
import UserLayout from '../../components/user/UserLayout'
import { Box, Heading } from '@chakra-ui/react'

export default function UserBlogPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !currentUser) {
      router.push('/login')
    }
  }, [currentUser, isAuthenticated, router])

  if (!isAuthenticated || !currentUser) {
    return <div>Loading...</div>
  }

  return (
    <UserLayout>
      <Box>
        <Heading mb={6}>我的博客</Heading>
        {/* 博客内容组件 */}
      </Box>
    </UserLayout>
  )
} 