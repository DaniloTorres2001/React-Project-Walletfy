import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import type { EventType } from '@/types/event'
import DataRepo from '@/api/datasource'
import { agruparEventosPorMes } from '@/lib/event.utils'

import MonthCard from '@/components/MonthCard'

type SearchParams = {
    tipo?: string
}

export const Route = createFileRoute('/events')({
    component: EventsPage,
    validateSearch: (
        search: Record<string, string | undefined>,
    ): SearchParams => ({
        tipo: search.tipo,
    }),
    loaderDeps: ({ search }) => ({
        tipo: search.tipo,
    }),
    loader: async ({ deps }) => {
        const { } = deps
        const events = await new Promise<Array<EventType>>((resolve) => {
            setTimeout(() => {
                DataRepo.getEvents().then(resolve)
            }, 500)
        })

        return {
            events,
        }
    },
})

function EventsPage() {
    const { } = Route.useSearch()

    const [balanceInicial, setBalanceInicial] = useState(() => {
        const saved = localStorage.getItem('walletfy_balance_inicial')
        return saved ? parseFloat(saved) : 0
    })

    const [inputBalance, setInputBalance] = useState(balanceInicial)

    const eventsQuery = useQuery({
        queryKey: ['eventos'],
        queryFn: () => DataRepo.getEvents(),
        retry: 2,
        refetchOnWindowFocus: true,
    })

    const agrupado = useMemo(() => {
        return agruparEventosPorMes(eventsQuery.data || [], balanceInicial)
    }, [eventsQuery.data, balanceInicial])


    const totalEventos = useMemo(() => {
        return agrupado.reduce((acc, grupo) => acc + grupo.eventos.length, 0)
    }, [agrupado])

    if (eventsQuery.isPending) {
        return <div className="p-4">Cargando eventos...</div>
    }

    if (eventsQuery.error) {
        return (
            <div className="p-4 text-red-500">
                Error: {eventsQuery.error.message}
            </div>
        )
    }

    return (
        <div className="p-6 min-h-screen bg-background text-foreground theme-transition">
            {/* Header superior */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sm font-medium text-muted-foreground">
                        Dinero inicial
                    </label>
                    <input
                        type="number"
                        value={inputBalance}
                        onChange={(e) => setInputBalance(parseFloat(e.target.value))}
                        className="px-3 py-2 text-sm rounded-md border border-border bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        className="px-4 py-2 rounded text-white font-semibold bg-violet-500 hover:bg-violet-600 transition"
                        onClick={() => {
                            localStorage.setItem('walletfy_balance_inicial', inputBalance.toString())
                            setBalanceInicial(inputBalance)
                        }}
                    >
                        Calcular
                    </button>
                </div>

                <Link
                    to="/form/$id"
                    params={{ id: 'new' }}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium px-4 py-2 rounded shadow hover:brightness-105 transition"
                >
                    Add Event
                </Link>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
                Tienes {totalEventos} eventos en {agrupado.length} meses
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {agrupado.map((grupo) => (
                    <MonthCard key={grupo.mesAnio} group={grupo} />
                ))}
            </div>
        </div>
    )

}

