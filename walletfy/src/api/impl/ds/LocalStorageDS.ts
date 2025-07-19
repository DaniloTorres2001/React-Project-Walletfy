import type DataDS from '@/api/domain/ds/DataDS'
import type {
  EventType,
  CreateEventType,
  UpdateEventType,
} from '@/types/event'

const EVENTS_KEY = 'walletfy_events'
const sleep = (ms = 400) => new Promise((res) => setTimeout(res, ms))

class LocalStorageDS implements DataDS {
  async getEvents(): Promise<EventType[]> {
    await sleep()
    try {
      const raw = localStorage.getItem(EVENTS_KEY) ?? '[]'
      return JSON.parse(raw) as EventType[]
    } catch (error) {
      console.error(error)
      throw new Error('Error cargando eventos')
    }
  }

  async getEventById(id: string): Promise<EventType> {
    await sleep()
    const events = await this.getEvents()
    const event = events.find((e) => e.id === id)

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    return event
  }

  async saveEvent(event: CreateEventType): Promise<boolean> {
    await sleep()
    try {
      const raw = localStorage.getItem(EVENTS_KEY) ?? '[]'
      const events = JSON.parse(raw) as EventType[]

      const newEvent: EventType = {
        ...event,
        id: crypto.randomUUID(),
      }

      events.push(newEvent)
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events))

      return true
    } catch (error) {
      console.error(error)
      throw new Error('Error al guardar el evento')
    }
  }

  async updateEvent(event: UpdateEventType): Promise<boolean> {
    await sleep()
    try {
      const raw = localStorage.getItem(EVENTS_KEY) ?? '[]'
      const events = JSON.parse(raw) as EventType[]

      const index = events.findIndex((e) => e.id === event.id)

      if (index === -1) {
        throw new Error('Evento no encontrado')
      }

      events[index] = { ...events[index], ...event }
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events))

      return true
    } catch (error) {
      console.error(error)
      throw new Error('Error actualizando el evento')
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    await sleep()
    try {
      const raw = localStorage.getItem(EVENTS_KEY) ?? '[]'
      const events = JSON.parse(raw) as EventType[]

      const index = events.findIndex((e) => e.id === id)

      if (index === -1) {
        throw new Error('Evento no encontrado')
      }

      events.splice(index, 1)
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events))

      return true
    } catch (error) {
      console.error(error)
      throw new Error('Error eliminando el evento')
    }
  }
}

export default LocalStorageDS
