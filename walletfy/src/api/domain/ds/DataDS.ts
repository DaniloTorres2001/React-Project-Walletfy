import type {
  EventType,
  CreateEventType,
  UpdateEventType,
} from '@/types/event'

abstract class DataDS {
  abstract getEvents(): Promise<Array<EventType>>

  abstract getEventById(id: string): Promise<EventType>

  abstract saveEvent(event: CreateEventType): Promise<boolean>

  abstract updateEvent(event: UpdateEventType): Promise<boolean>

  abstract deleteEvent(id: string): Promise<boolean>
}

export default DataDS
