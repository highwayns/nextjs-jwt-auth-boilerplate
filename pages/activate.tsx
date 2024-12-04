import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
} from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { verifyActivationToken } from '../lib/auth'
import { prisma } from '../lib/db'

type Props = {
  success: boolean
  message: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { token } = context.query

  if (!token || typeof token !== 'string') {
    return {
      props: {
        success: false,
        message: '无效的激活链接',
      },
    }
  }

  try {
    const decoded = await verifyActivationToken(token)
    
    // 更新用户状态
    await prisma.user.update({
      where: { email: decoded.email },
      data: {
        enabled: true,
        twoFactorToken: null,
      },
    })

    return {
      props: {
        success: true,
        message: '账号激活成功',
      },
    }
  } catch (error) {
    return {
      props: {
        success: false,
        message: '激活链接已过期或无效',
      },
    }
  }
}

const ActivatePage = ({ success, message }: Props) => {
  const router = useRouter()

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }, [success, router])

  return (
    <VStack spacing={4} align="center" justify="center" minH="100vh">
      <Alert
        status={success ? 'success' : 'error'}
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          账号激活
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {message}
          {success && '，即将跳转到登录页面...'}
        </AlertDescription>
      </Alert>
    </VStack>
  )
}

export default ActivatePage 