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
import { useAuth } from '../providers/auth/AuthProvider'

type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const ChangePasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>()

  const toast = useToast()
  const router = useRouter()
  const { currentUser } = useAuth()

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: '密码修改成功',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        router.push('/')
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      toast({
        title: '密码修改失败',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <VStack spacing={4} align="stretch" maxW="sm" mx="auto" mt={8}>
      <Heading as="h1" size="2xl">修改密码</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.currentPassword} mb={4}>
          <FormLabel>当前密码</FormLabel>
          <Input
            type="password"
            {...register('currentPassword', {
              required: '请输入当前密码',
            })}
          />
          <FormErrorMessage>{errors.currentPassword?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.newPassword} mb={4}>
          <FormLabel>新密码</FormLabel>
          <Input
            type="password"
            {...register('newPassword', {
              required: '请输入新密码',
              minLength: {
                value: 6,
                message: '密码至少6个字符',
              },
            })}
          />
          <FormErrorMessage>{errors.newPassword?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword} mb={4}>
          <FormLabel>确认新密码</FormLabel>
          <Input
            type="password"
            {...register('confirmPassword', {
              required: '请确认新密码',
              validate: (value) =>
                value === watch('newPassword') || '两次输入的密码不一致',
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
          修改密码
        </Button>
      </form>
    </VStack>
  )
}

export default ChangePasswordPage 