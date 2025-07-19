import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '@/lib/store/themeSlice'
import type { RootState } from '@/lib/store'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
    const dispatch = useDispatch()
    const mode = useSelector((state: RootState) => state.theme.mode)

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition"
            title="Cambiar tema"
        >
            {mode === 'light' ? (
                <Moon size={18} className="text-gray-800" />
            ) : (
                <Sun size={18} className="text-yellow-400" />
            )}
        </button>
    )
    
}
