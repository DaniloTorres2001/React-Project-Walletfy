import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Notifications } from '@mantine/notifications'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/lib/store'
import ThemeWrapper from '@/components/ThemeWrapper'


import * as TanstackQuery from './integrations/tanstack-query/root-provider.tsx'

import * as Mantine from './integrations/mantine/root-provider.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen.ts'

import './styles.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import reportWebVitals from './reportWebVitals.ts'

import { initDefaultEventsIfNeeded } from './initDefaultEvents.ts'


// Dentro del return, después de la sección de eventos agrupados



initDefaultEventsIfNeeded()

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ReduxProvider store={store}>
        <TanstackQuery.Provider>
          <Mantine.Provider>
            <ThemeWrapper>
              <Notifications position="top-right" />
              <RouterProvider router={router} />
            </ThemeWrapper>
          </Mantine.Provider>
        </TanstackQuery.Provider>
      </ReduxProvider>
    </StrictMode>,
  )

}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
