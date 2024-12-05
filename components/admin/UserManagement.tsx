import React, { useEffect, useState } from 'react'
import { Role } from '@prisma/client'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../providers/auth/AuthProvider'

enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

interface User {
  id: number
  email: string
  name: string
  surname: string
  role: Role
  status: UserStatus
  enabled: boolean
}

export default function UserManagement() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { refreshSession } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        const refreshSuccessful = await refreshSession()
        if (refreshSuccessful === undefined) return // 会自动重定向到登录页

        const newToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]

        const retryResponse = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        })
        
        if (!retryResponse.ok) throw new Error('获取用户列表失败')
        const data = await retryResponse.json()
        setUsers(data)
      } else {
        if (!response.ok) throw new Error('获取用户列表失败')
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: number, updates: { status?: UserStatus, role?: Role }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, ...updates })
      })

      if (response.status === 401) {
        await refreshSession()
        const newToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]
        const retryResponse = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({ userId, ...updates })
        })
        
        if (!retryResponse.ok) throw new Error('更新用户失败')
        const updatedUser = await retryResponse.json()
        setUsers(users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ))
      } else {
        if (!response.ok) throw new Error('更新用户失败')
        const updatedUser = await response.json()
        setUsers(users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    }
  }

  if (loading) return <div>{t('userManagement.loading')}</div>
  if (error) return <div>{t('userManagement.error')}{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('userManagement.title')}</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">{t('userManagement.table.id')}</th>
            <th className="px-4 py-2">{t('userManagement.table.email')}</th>
            <th className="px-4 py-2">{t('userManagement.table.name')}</th>
            <th className="px-4 py-2">{t('userManagement.table.status')}</th>
            <th className="px-4 py-2">{t('userManagement.table.role')}</th>
            <th className="px-4 py-2">{t('userManagement.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{`${user.name} ${user.surname}`}</td>
              <td className="border px-4 py-2">
                <select
                  value={user.status}
                  onChange={(e) => updateUser(user.id, { status: e.target.value as UserStatus })}
                  className="form-select"
                >
                  {Object.values(UserStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td className="border px-4 py-2">
                <select
                  value={user.role}
                  onChange={(e) => updateUser(user.id, { role: e.target.value as Role })}
                  className="form-select"
                >
                  {Object.values(Role).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => updateUser(user.id, { 
                    status: user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE 
                  })}
                  className={`px-4 py-1 rounded ${
                    user.status === UserStatus.ACTIVE ? 'bg-red-500' : 'bg-green-500'
                  } text-white`}
                >
                  {user.status === UserStatus.ACTIVE 
                    ? t('userManagement.actions.suspend')
                    : t('userManagement.actions.activate')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 