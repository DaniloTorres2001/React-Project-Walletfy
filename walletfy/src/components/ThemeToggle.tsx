import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '@/lib/store/themeSlice'
import type { RootState } from '@/lib/store'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
    const dispatch = useDispatch()
    const mode = useSelector((state: RootState) => state.theme.mode)

    const isDark = mode === 'dark'

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            aria-label="Cambiar tema"
            title="Cambiar tema"
            className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 shadow transition-all duration-300"
        >
            {isDark ? (
                <Sun className="text-yellow-300 transition-transform duration-300 rotate-0 scale-100" size={20} />
            ) : (
                <Moon className="text-gray-800 transition-transform duration-300 rotate-0 scale-100" size={20} />
            )}
        </button>
    )
}
