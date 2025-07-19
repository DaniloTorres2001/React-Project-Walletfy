import { useEffect, useState } from "react"


export const useDebounce = <T>(initialValue: T, delay: number) => {

    const [value, setValue] = useState<T>(initialValue)
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }

    }, [value,])

    return [debouncedValue, setValue, value] as const
}
