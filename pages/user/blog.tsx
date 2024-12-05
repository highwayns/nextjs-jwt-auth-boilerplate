import { useState } from 'react'
import { Box, Button, VStack, Input, Textarea, Text, useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import UserLayout from '../../components/user/UserLayout'

interface BlogPost {
  id: number
  title: string
  content: string
  createdAt: string
  authorId: number
}

export default function UserBlogPage() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      })

      if (!response.ok) throw new Error(t('blog.error.create'))

      const newPost = await response.json()
      setPosts([newPost, ...posts])
      setTitle('')
      setContent('')
      
      toast({
        title: t('blog.success.created'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('blog.error.create'),
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <UserLayout>
      <Box maxW="800px" mx="auto" p={4}>
        <VStack spacing={6} align="stretch">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder={t('blog.post.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder={t('blog.post.contentPlaceholder')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                minH="200px"
                required
              />
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
              >
                {t('blog.post.publish')}
              </Button>
            </VStack>
          </form>

          {posts.length === 0 ? (
            <Text>{t('blog.noPosts')}</Text>
          ) : (
            posts.map(post => (
              <Box
                key={post.id}
                p={4}
                borderWidth={1}
                borderRadius="md"
                shadow="sm"
              >
                <Text fontSize="xl" fontWeight="bold">{post.title}</Text>
                <Text color="gray.500" fontSize="sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
                <Text mt={2} whiteSpace="pre-wrap">{post.content}</Text>
              </Box>
            ))
          )}
        </VStack>
      </Box>
    </UserLayout>
  )
} 