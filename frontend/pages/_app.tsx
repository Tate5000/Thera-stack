import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { MessageProvider } from '../context/MessageContext'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MessageProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MessageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}