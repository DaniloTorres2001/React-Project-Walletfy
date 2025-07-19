import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/store'

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const mode = useSelector((state: RootState) => state.theme.mode)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', mode === 'dark')
    }, [mode])

    return <>{children}</>
}
