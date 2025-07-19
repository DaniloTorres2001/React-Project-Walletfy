import { createSlice } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark'

const getInitialTheme = (): ThemeMode => {
    const saved = localStorage.getItem('walletfy_theme')
    return saved === 'dark' ? 'dark' : 'light'
}

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        mode: getInitialTheme(),
    },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light'
            localStorage.setItem('walletfy_theme', state.mode)
        },
        setTheme: (state, action) => {
            state.mode = action.payload
            localStorage.setItem('walletfy_theme', state.mode)
        },
    },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
