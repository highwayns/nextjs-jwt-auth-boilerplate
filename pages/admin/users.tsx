import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../providers/auth/AuthProvider'
import UserManagement from '../../components/admin/UserManagement'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminUsersPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.role !== 'ADMIN') {
      router.push('/')
    }
  }, [currentUser, isAuthenticated, router])

  if (!isAuthenticated || !currentUser) {
    return <div>Loading...</div>
  }

  if (currentUser.role !== 'ADMIN') {
    return null
  }

  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  )
} 