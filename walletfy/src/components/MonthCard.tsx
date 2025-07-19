import { Button, Tooltip } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { notifications } from '@/lib/notification'
import type { EventGroup } from '@/lib/event.utils'
import { cn } from '@/lib/utils'

type Props = {
    group: EventGroup
}

export default function MonthCard({ group }: Props) {
    const navigate = useNavigate()

    const handleEventClick = (eventId: string) => {
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
                                navigate({ to: '/form/$id', params: { id: eventId } })
                                notifications.hide('edit-event')
                            }}
                        >
                            Editar evento
                        </Button>
                    </div>
                </div>
            ),
            color: 'blue',
            autoClose: false,
            withCloseButton: true,
        })
    }

    return (
        <div className="bg-white rounded shadow-md overflow-hidden border">
            {/* Título del mes */}
            <div className="px-4 py-3 border-b text-lg font-semibold text-gray-800">
                {group.mesAnio}
            </div>

            {/* Lista de eventos */}
            <div className="divide-y">
                {group.eventos.map((e) => (
                    <Tooltip
                        key={e.id}
                        withArrow
                        color="gray"
                        position="bottom"
                        transitionProps={{ duration: 200 }}
                        multiline                                        
                        label={
                            <div className="flex flex-col items-center gap-2 p-1">
                                {e.descripcion ? (
                                    <p className="text-sm text-white text-center">{e.descripcion}</p>
                                ) : (
                                    <p className="text-sm text-white italic text-center">Sin descripción</p>
                                )}
                                {e.adjunto && (
                                    <img
                                        src={e.adjunto}
                                        alt="Vista previa"
                                        className="max-h-32 object-contain rounded border"
                                    />
                                )}
                            </div>
                        }
                    >

                        <div
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => handleEventClick(e.id)}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">{e.nombre}</span>
                                <span
                                    className={cn(
                                        'font-semibold',
                                        e.tipo === 'ingreso' ? 'text-green-500' : 'text-red-500'
                                    )}
                                >
                                    ${e.cantidad.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">
                                {new Date(e.fecha).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </Tooltip>
                ))}
            </div>

            {/* Resumen mensual */}
            <div className="border-t px-4 py-3 text-sm text-gray-700">
                <p>
                    Ingreso: <span className="float-right">${group.ingresos.toFixed(2)}</span>
                </p>
                <p>
                    Gasto: <span className="float-right">${group.egresos.toFixed(2)}</span>
                </p>
                <p>
                    Mensual: <span className="float-right">${group.balanceMes.toFixed(2)}</span>
                </p>
                <p className="font-medium">
                    Global: <span className="float-right">${group.balanceGlobal.toFixed(2)}</span>
                </p>
            </div>
        </div>
    )
}
