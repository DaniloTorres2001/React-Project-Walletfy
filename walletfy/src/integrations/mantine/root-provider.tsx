import { MantineProvider, createTheme } from '@mantine/core'

type ProviderProps = {
  children?: React.ReactNode
}

const theme = createTheme({
  primaryColor: 'violet',
})

export function Provider({ children }: ProviderProps) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>
}
