import React, { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-form'

import type { CreateEventType } from '@/types/event'
import { CreateEventSchema } from '@/types/event'

import DataRepo from '@/api/datasource'
import { useAppForm } from '@/hooks/form'
import { notifications } from '@/lib/notification'

export const Route = createFileRoute('/form/$id')({
  component: RouteComponent,
})

const defaultValues: CreateEventType = {
  nombre: '',
  descripcion: '',
  cantidad: 0,
  fecha: new Date().toISOString().split('T')[0],
  tipo: 'ingreso',
  adjunto: '',
}

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [mode] = React.useState<'create' | 'update'>(
    id === 'new' ? 'create' : 'update',
  )

  const { data } = useQuery({
    enabled: mode === 'update',
    queryKey: ['evento', id],
    queryFn: () => DataRepo.getEventById(id),
  })

  const { mutate, isPending } = useMutation<boolean, Error, CreateEventType>({
    mutationKey: ['evento'],
    mutationFn: async (values) => {
      if (mode === 'create') {
        await DataRepo.saveEvent(values)
      } else {
        await DataRepo.updateEvent({ ...values, id })
      }
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      return true
    },
    onSettled: (_, error) => {
      if (error) {
        notifications.error({
          title: 'Error',
          message: error.message || 'No se pudo guardar el evento',
        })
      } else {
        notifications.success({
          title: 'Éxito',
          message:
            mode === 'create'
              ? 'Evento creado exitosamente'
              : 'Evento actualizado exitosamente',
        })
        navigate({ to: '/events' })
      }
    },
  })

  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => mutate(value),
    onSubmitInvalid: (errors) => {
      console.error('Errores del formulario:', errors)
    },
    validators: {
      onSubmit: CreateEventSchema,
    },
  })

  useEffect(() => {
    if (data) {
      form.reset(
        {
          nombre: data.nombre,
          descripcion: data.descripcion,
          cantidad: data.cantidad,
          fecha: data.fecha,
          tipo: data.tipo,
          adjunto: data.adjunto ?? '',
        },
        { keepDefaultValues: true },
      )
    }
  }, [data])

  const formValues = useStore(form.store, (state) => state.values)

  return (
    <div className="flex justify-center py-10 bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <form
        className="flex flex-col gap-5 p-6 w-full max-w-2xl bg-white dark:bg-zinc-800 rounded shadow-md"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          {mode === 'create' ? 'Crear Evento' : 'Editar Evento'}
        </h1>

        {/* Nombre */}
        <form.AppField name="nombre">
          {(field) => (
            <field.Input
              type="text"
              label="Nombre"
              placeholder="Ej: Sueldo, Arriendo"
              className="w-full"
            />
          )}
        </form.AppField>

        {/* Descripción */}
        <form.AppField name="descripcion">
          {(field) => (
            <field.Input
              type="text"
              label="Descripción"
              placeholder="Ej: Pago correspondiente a..."
              className="w-full"
            />
          )}
        </form.AppField>

        {/* Cantidad */}
        <form.AppField name="cantidad">
          {(field) => (
            <field.Input
              type="number"
              label="Cantidad"
              placeholder="Ej: 100.00"
              className="w-full"
              value={field.state.value}
              error={field.state.meta.errors.map((e) => e?.message).join(', ')}
              onChange={(e) => field.setValue(parseFloat(e.target.value))}
            />
          )}
        </form.AppField>

        {/* Fecha */}
        <form.AppField name="fecha">
          {(field) => (
            <field.Input type="date" label="Fecha" className="w-full" />
          )}
        </form.AppField>

        {/* Tipo */}
        <form.AppField name="tipo">
          {(field) => (
            <field.Select
              label="Tipo"
              className="w-full"
              options={[
                { label: 'Ingreso', value: 'ingreso' },
                { label: 'Egreso', value: 'egreso' },
              ]}
            />
          )}
        </form.AppField>

        {/* Imagen Adjunto */}
        <form.AppField name="adjunto">
          {() => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Imagen adjunta (opcional)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded cursor-pointer dark:text-gray-400 dark:bg-zinc-800 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      if (reader.result) {
                        form.setFieldValue('adjunto', reader.result.toString())
                      }
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />

              {formValues.adjunto ? (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <p className="text-xs text-gray-500">Archivo cargado:</p>
                  <img
                    src={formValues.adjunto}
                    alt="Previsualización"
                    className="w-32 h-32 object-contain border rounded bg-white p-2 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      form.setFieldValue('adjunto', '')
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="text-xs text-red-500 underline hover:text-red-700 mt-1"
                  >
                    Eliminar imagen
                  </button>
                </div>
              ) : (
                <p className="text-xs italic text-gray-400 mt-1">
                  No se ha cargado ninguna imagen aún.
                </p>
              )}
            </div>
          )}
        </form.AppField>

        {/* Botones */}
        <form.AppForm>
          <form.SubmitButton
            type="submit"
            text={
              isPending
                ? 'Guardando...'
                : mode === 'create'
                  ? 'Crear Evento'
                  : 'Actualizar Evento'
            }
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          />
        </form.AppForm>
      </form>
    </div>
  )
}
