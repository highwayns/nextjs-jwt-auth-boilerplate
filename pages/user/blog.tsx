import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../providers/auth/AuthProvider'
import UserLayout from '../../components/user/UserLayout'
import { Box, Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export default function UserBlogPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (isAuthenticated && !currentUser) {
      router.push('/login')
    }
  }, [currentUser, isAuthenticated, router])

  if (!isAuthenticated || !currentUser) {
    return <div>{t('blog.loading')}</div>
  }

  return (
    <UserLayout>
      <Box>
        <Heading mb={6}>{t('blog.title')}</Heading>
        {/* 博客内容组件 */}
      </Box>
    </UserLayout>
  )
} 