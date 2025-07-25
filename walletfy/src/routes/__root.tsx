import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import ThemeWrapper from '@/components/ThemeWrapper'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ThemeWrapper>
        <Header />

        <Outlet />
        <TanStackRouterDevtools />

        <TanStackQueryLayout />


      </ThemeWrapper>

    </>
  ),
})
