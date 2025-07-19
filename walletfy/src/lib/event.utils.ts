import type { EventType } from '@/types/event'


export type EventGroup = {
    mesAnio: string
    eventos: EventType[]
    ingresos: number
    egresos: number
    balanceMes: number
    balanceGlobal: number
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}


export function agruparEventosPorMes(events: EventType[], balanceInicial = 0): EventGroup[] {
    const agrupados: Record<string, EventType[]> = {}

    for (const event of events) {
        const fecha = new Date(event.fecha)
        const mes = fecha.toLocaleString('es-EC', { month: 'long' })
        const anio = fecha.getFullYear()
        const mesAnio = `${capitalize(mes)} ${anio}`


        if (!agrupados[mesAnio]) {
            agrupados[mesAnio] = []
        }
        agrupados[mesAnio].push(event)
    }

    const ordenado = Object.entries(agrupados).sort((a, b) => {
        const fechaA = new Date(a[1][0].fecha)
        const fechaB = new Date(b[1][0].fecha)
        return fechaA.getTime() - fechaB.getTime()
    })

    let acumulado = balanceInicial

    return ordenado.map(([mesAnio, eventos]) => {
        const ingresos = eventos
            .filter((e) => e.tipo === 'ingreso')
            .reduce((acc, e) => acc + e.cantidad, 0)

        const egresos = eventos
            .filter((e) => e.tipo === 'egreso')
            .reduce((acc, e) => acc + e.cantidad, 0)

        const balanceMes = ingresos - egresos
        const balanceGlobal = acumulado + balanceMes
        acumulado = balanceGlobal

        return {
            mesAnio,
            eventos,
            ingresos,
            egresos,
            balanceMes,
            balanceGlobal,
        }
    })
}
