import { Box, Flex, VStack, Link, Text } from '@chakra-ui/react'
import { FiUsers } from 'react-icons/fi'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  
  const menuItems = [
    {
      label: '用户管理',
      icon: <FiUsers />,
      href: '/admin/users',
    }
  ]

  return (
    <Flex h="100vh">
      {/* 左侧菜单 */}
      <Box w="240px" bg="gray.800" color="white" p={4}>
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
              bg={router.pathname === item.href ? 'blue.500' : 'transparent'}
              _hover={{ bg: 'blue.500' }}
            >
              {item.icon}
              <Text>{item.label}</Text>
            </Link>
          ))}
        </VStack>
      </Box>

      {/* 主内容区 */}
      <Box flex={1} p={6} bg="gray.50" overflowY="auto">
        {children}
      </Box>
    </Flex>
  )
} 