import { TextInput } from '@mantine/core';

export type SearchInputProps = {
    value: string
    onChange: (v: string) => void
}

const SearchInput: React.FC<SearchInputProps> = (props) => {
    return (
        <TextInput
            label="Buscar por mes o año"
            placeholder="Ej: Julio 2025"
            onChange={(e) => props.onChange(e.target.value)}
            value={props.value}
        />
    )
}

export default SearchInput