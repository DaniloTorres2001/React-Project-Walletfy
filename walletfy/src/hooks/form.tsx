import {
    createFormHook,
    createFormHookContexts,
    useStore,
} from '@tanstack/react-form'

import { Input } from '@/components/form/input'
import SubmitButton from '@/components/form/button'
import { Select } from '@/components/form/select'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
    createFormHookContexts()

export const { useAppForm } = createFormHook({
    fieldComponents: {
        Input: Input,
        Select: Select,
    },
    formComponents: {
        SubmitButton: (props) => (
            <SubmitButton {...props} className="bg-indigo-500" />
        ),
    },
    fieldContext,
    formContext,
})

export function useField() {
    try {
        const field = useFieldContext<unknown>()
        const errors = useStore(field.store, (state) => state.meta.errors)

        return {
            field,
            errors,
        }
    } catch {
        return {
            field: null,
            errors: [],
        }
    }
}
