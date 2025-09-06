import type { EventType } from '@/types/event'

const EVENTS_KEY = 'walletfy_events'

const eventosPorDefecto: EventType[] = [
    // DICIEMBRE 2024
    { id: 'evt1', nombre: 'Sueldo diciembre', descripcion: 'Pago mensual', cantidad: 1500, fecha: '2024-12-05', tipo: 'ingreso' },
    { id: 'evt2', nombre: 'Alquiler diciembre', descripcion: 'Pago de renta', cantidad: 600, fecha: '2024-12-10', tipo: 'egreso' },
    { id: 'evt3', nombre: 'Supermercado diciembre', descripcion: '', cantidad: 300, fecha: '2024-12-15', tipo: 'egreso' },

    // ENERO 2025
    { id: 'evt4', nombre: 'Freelance enero', descripcion: 'Proyecto web', cantidad: 800, fecha: '2025-01-10', tipo: 'ingreso' },
    { id: 'evt5', nombre: 'Luz enero', descripcion: 'Servicio básico', cantidad: 90, fecha: '2025-01-15', tipo: 'egreso' },
    { id: 'evt6', nombre: 'Sueldo enero', descripcion: '', cantidad: 1500, fecha: '2025-01-25', tipo: 'ingreso' },

    // FEBRERO 2025
    { id: 'evt7', nombre: 'Sueldo febrero', descripcion: '', cantidad: 1500, fecha: '2025-02-05', tipo: 'ingreso' },
    { id: 'evt8', nombre: 'Luz febrero', descripcion: 'Pago de servicios', cantidad: 120, fecha: '2025-02-14', tipo: 'egreso' },
    { id: 'evt9', nombre: 'Gas febrero', descripcion: '', cantidad: 20, fecha: '2025-02-18', tipo: 'egreso' },

    // MARZO 2025
    { id: 'evt10', nombre: 'Sueldo marzo', descripcion: '', cantidad: 1500, fecha: '2025-03-05', tipo: 'ingreso' },
    { id: 'evt11', nombre: 'Netflix marzo', descripcion: 'Suscripción mensual', cantidad: 20, fecha: '2025-03-15', tipo: 'egreso' },
    { id: 'evt12', nombre: 'Cena aniversario', descripcion: 'Restaurante', cantidad: 100, fecha: '2025-03-20', tipo: 'egreso' },

    // ABRIL 2025
    { id: 'evt13', nombre: 'Sueldo abril', descripcion: '', cantidad: 1500, fecha: '2025-04-05', tipo: 'ingreso' },
    { id: 'evt14', nombre: 'Amazon abril', descripcion: 'Compra en línea', cantidad: 250, fecha: '2025-04-10', tipo: 'egreso' },
    { id: 'evt15', nombre: 'Gym mensualidad', descripcion: 'Fitness', cantidad: 50, fecha: '2025-04-18', tipo: 'egreso' },

    // MAYO 2025
    { id: 'evt16', nombre: 'Sueldo mayo', descripcion: '', cantidad: 1500, fecha: '2025-05-05', tipo: 'ingreso' },
    { id: 'evt17', nombre: 'Spotify mayo', descripcion: 'Suscripción musical', cantidad: 10, fecha: '2025-05-10', tipo: 'egreso' },
    { id: 'evt18', nombre: 'Regalo Día de la Madre', descripcion: '', cantidad: 80, fecha: '2025-05-12', tipo: 'egreso' },

    // JUNIO 2025
    { id: 'evt19', nombre: 'Sueldo junio', descripcion: '', cantidad: 1500, fecha: '2025-06-05', tipo: 'ingreso' },
    { id: 'evt20', nombre: 'Cine', descripcion: 'Película en pareja', cantidad: 30, fecha: '2025-06-15', tipo: 'egreso' },
    { id: 'evt21', nombre: 'Taxi junio', descripcion: 'Movilidad', cantidad: 60, fecha: '2025-06-18', tipo: 'egreso' },

    // JULIO 2025
    { id: 'evt22', nombre: 'Sueldo julio', descripcion: '', cantidad: 1500, fecha: '2025-07-05', tipo: 'ingreso' },
    { id: 'evt23', nombre: 'Alquiler julio', descripcion: '', cantidad: 600, fecha: '2025-07-10', tipo: 'egreso' },
    { id: 'evt24', nombre: 'Médico general', descripcion: 'Consulta médica', cantidad: 100, fecha: '2025-07-20', tipo: 'egreso' },
]

export function initDefaultEventsIfNeeded() {
    const existeEvento = localStorage.getItem(EVENTS_KEY)
    if (!existeEvento) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(eventosPorDefecto))
    }
}
