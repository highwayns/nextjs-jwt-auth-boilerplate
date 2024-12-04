import { Box, Flex, VStack, Link, Text } from '@chakra-ui/react'
import { FiBook, FiHome } from 'react-icons/fi'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

interface UserLayoutProps {
  children: React.ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter()
  
  const menuItems = [
    {
      label: '首页',
      icon: <FiHome />,
      href: '/',
    },
    {
      label: '我的博客',
      icon: <FiBook />,
      href: '/user/blog',
    }
  ]

  return (
    <Flex h="100vh">
      {/* 左侧菜单 */}
      <Box w="240px" bg="gray.100" p={4}>
        <VStack align="stretch" spacing={2}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              as={NextLink}
              href={item.href}
              p={3}
              rounded="md"
              display="flex"
              alignItems="center"
              gap={3}
              bg={router.pathname === item.href ? 'blue.100' : 'transparent'}
              _hover={{ bg: 'blue.50' }}
            >
              {item.icon}
              <Text>{item.label}</Text>
            </Link>
          ))}
        </VStack>
      </Box>

      {/* 主内容区 */}
      <Box flex={1} p={6} bg="white" overflowY="auto">
        {children}
      </Box>
    </Flex>
  )
} 