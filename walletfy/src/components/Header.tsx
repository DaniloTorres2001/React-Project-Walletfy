import { Link } from '@tanstack/react-router'
import { Title } from '@mantine/core'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-border bg-background theme-transition">
      <Link to="/events" className="hover:opacity-80 transition">
        <Title order={3} className="text-primary">
          Walletfy
        </Title>
      </Link>
      <ThemeToggle />
    </header>

  )
}