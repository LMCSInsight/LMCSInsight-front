import { type ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import { queryClient } from '@/shared/lib/queryClient'
import { AuthProvider } from '@/shared/context/AuthContext'
import { ThemeProvider } from '@/shared/context/ThemeContext'
import { useTheme } from '@/shared/context/ThemeContext'
import { router } from '@/app/router'

function ToasterWrapper() {
  const { isDark } = useTheme()

  return (
    <Toaster
      theme={isDark ? 'dark' : 'light'}
      position='top-right'
      gap={12}
      visibleToasts={3}
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast: 'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
          title: 'font-medium',
          description: 'text-sm leading-relaxed',
          icon: 'size-4 shrink-0',
          loader: 'size-4 shrink-0',
          closeButton: 'rounded-full transition-colors hover:opacity-75',
          success:
            'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
          error:
            'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
          info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
          warning:
            'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
          actionButton:
            'rounded-md bg-foreground/15 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-foreground/25 text-foreground',
          cancelButton:
            'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-foreground',
          content: 'gap-2 flex-1',
        },
      }}
      style={{ zIndex: 10050 }}
    />
  )
}

interface ProvidersProps {
  children?: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToasterWrapper />
            {children ?? <RouterProvider router={router} />}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  )
}
