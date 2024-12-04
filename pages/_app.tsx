import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import AllProviders from '../providers'
import '../i18n/config'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AllProviders>
        <Component {...pageProps} />
      </AllProviders>
    </ChakraProvider>
  )
}
