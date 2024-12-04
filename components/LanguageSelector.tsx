import { Select } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../providers/auth/AuthProvider'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' }
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const { currentUser } = useAuth()

  const handleLanguageChange = async (lang: string) => {
    try {
      // 更新 i18n 语言
      await i18n.changeLanguage(lang)

      // 如果用户已登录，保存语言偏好
      if (currentUser) {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]

        await fetch('/api/users/language', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language: lang.toUpperCase() })
        })
      }
    } catch (error) {
      console.error('Failed to update language preference:', error)
    }
  }

  return (
    <Select
      value={i18n.language}
      onChange={(e) => handleLanguageChange(e.target.value)}
      width="auto"
      size="sm"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  )
} 