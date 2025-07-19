import { Link } from '@tanstack/react-router'
import { Title } from '@mantine/core'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b bg-white dark:bg-zinc-900 dark:border-zinc-700">
      <Link to="/events" className="hover:opacity-80 transition">
        <Title order={3} className="text-violet-600 dark:text-violet-300">
          Walletfy
        </Title>
      </Link>
      <ThemeToggle />
    </header>
  )
}