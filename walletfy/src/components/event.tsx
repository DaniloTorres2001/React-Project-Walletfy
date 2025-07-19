import { Paper, Tooltip, Button } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { notifications } from '@/lib/notification'
import { cn } from '@/lib/utils'
import type { EventType } from '@/types/event'

type EventProps = {
    data: EventType
}

const EventItem = ({ data }: EventProps) => {
    const navigate = useNavigate()
    const { id, nombre, descripcion, cantidad, fecha, tipo, adjunto } = data
    const isIngreso = tipo === 'ingreso'

    const colorClass = isIngreso ? 'bg-green-500' : 'bg-red-500'

    const formattedDate = new Date(fecha).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

    const handleClickEditar = () => {
        notifications.show({
            id: 'edit-event',
            title: '¿Editar evento?',
            message: (
                <div className="flex flex-col gap-2">
                    <span>¿Deseas modificar este evento?</span>
                    <div className="flex gap-2 justify-end">
                        <Button
                            size="xs"
                            variant="default"
                            onClick={() => notifications.hide('edit-event')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="xs"
                            color="violet"
                            onClick={() => {
                                navigate({ to: '/form/$id', params: { id } })
                                notifications.hide('edit-event')
                            }}
                        >
                            Editar evento
                        </Button>
                    </div>
                </div>
            ),
            autoClose: false,
            withCloseButton: true,
        })
    }

    const copyData = () => {
        const textToCopy = `Evento: ${nombre}, Tipo: ${tipo}, Monto: $${cantidad}, Fecha: ${formattedDate}`
        navigator.clipboard
            .writeText(textToCopy)
            .then(() =>
                notifications.success({
                    title: 'Datos copiados',
                    message: 'Información del evento copiada al portapapeles.',
                }),
            )
            .catch((err) => console.error('Error al copiar:', err))
    }

    return (
        <Paper
            withBorder
            shadow="sm"
            className="p-4 w-full max-w-sm bg-white dark:bg-zinc-900 border dark:border-zinc-700"
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{nombre}</h2>
                <span
                    className={cn(
                        'text-white text-xs font-semibold px-2 py-1 rounded-full',
                        colorClass,
                    )}
                >
                    {tipo.toUpperCase()}
                </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm">Fecha: {formattedDate}</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Monto: ${cantidad.toFixed(2)}</p>

            {descripcion && (
                <Tooltip label={descripcion} withArrow position="bottom" offset={6}>
                    <p className="mt-2 text-violet-600 text-sm underline cursor-help">
                        Ver descripción
                    </p>
                </Tooltip>
            )}

            {adjunto && (
                <div className="mt-3 flex flex-col items-center gap-1">
                    <img
                        src={adjunto}
                        alt="Adjunto"
                        className="w-full h-auto max-h-48 object-contain border rounded"
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500">Imagen adjunta</span>
                </div>
            )}

            <div className="flex flex-col gap-2 mt-4">
                <Button
                    size="xs"
                    variant="outline"
                    color="gray"
                    onClick={copyData}
                >
                    Copiar datos
                </Button>

                <Button
                    size="xs"
                    variant="filled"
                    color="violet"
                    onClick={handleClickEditar}
                >
                    Editar evento
                </Button>
            </div>
        </Paper>
    )
}

export default EventItem
