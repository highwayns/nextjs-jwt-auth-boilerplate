import {
  VStack,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

type RegisterFormData = {
  email: string
  password: string
  confirmPassword: string
  name: string
  surname: string
}

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>()

  const toast = useToast()
  const router = useRouter()

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: '注册成功',
          description: '请检查邮箱激活账号',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        router.push('/login')
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      toast({
        title: '注册失败',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <VStack spacing={4} align="stretch" maxW="sm" mx="auto" mt={8}>
      <Heading as="h1" size="2xl">注册</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.email} mb={4}>
          <FormLabel>邮箱</FormLabel>
          <Input
            {...register('email', {
              required: '请输入邮箱',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '无效的邮箱地址',
              },
            })}
          />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name} mb={4}>
          <FormLabel>名字</FormLabel>
          <Input
            {...register('name', {
              required: '请输入名字',
            })}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.surname} mb={4}>
          <FormLabel>姓氏</FormLabel>
          <Input
            {...register('surname', {
              required: '请输入姓氏',
            })}
          />
          <FormErrorMessage>{errors.surname?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password} mb={4}>
          <FormLabel>密码</FormLabel>
          <Input
            type="password"
            {...register('password', {
              required: '请输入密码',
              minLength: {
                value: 6,
                message: '密码至少6个字符',
              },
            })}
          />
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword} mb={4}>
          <FormLabel>确认密码</FormLabel>
          <Input
            type="password"
            {...register('confirmPassword', {
              required: '请确认密码',
              validate: (value) => 
                value === watch('password') || '两次输入的密码不一致',
            })}
          />
          <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isSubmitting}
        >
          注册
        </Button>
      </form>
    </VStack>
  )
}

export default RegisterPage
