import { IconMoon, IconSun, IconSunMoon } from "@tabler/icons"
import { useEffect, useMemo, useState } from "react"

export enum ThemeType {
    LIGHT,
    DARK,
}

export type NullableThemeType = ThemeType | undefined

export function ThemeToggle(): JSX.Element {
    const [currentTheme, setCurrentTheme] = useState<NullableThemeType>(() => {
        const storageTheme = localStorage.theme as keyof typeof ThemeType
        if (storageTheme)
            return ThemeType[storageTheme]
        return undefined
    })

    useEffect(() => {
        switch (currentTheme) {
            case ThemeType.LIGHT:
                localStorage.theme = ThemeType[ThemeType.LIGHT]
                document.documentElement.setAttribute('data-theme', 'garden')
                break
            case ThemeType.DARK:
                localStorage.theme = ThemeType[ThemeType.DARK]
                document.documentElement.setAttribute('data-theme', 'garden-dark')
                break
            case undefined:
                localStorage.removeItem('theme')
                document.documentElement.removeAttribute('data-theme')
                break
        }
    }, [currentTheme])

    const getIcon = useMemo(() => {
        switch (currentTheme) {
            case ThemeType.LIGHT:
                return <IconSun />
            case ThemeType.DARK:
                return <IconMoon />
            case undefined:
                return <IconSunMoon />
        }
    }, [currentTheme])

    return (
        <div className='dropdown dropdown-end'>
            <label tabIndex={0} className='btn btn-ghost rounded-btn'>
                {getIcon}
            </label>
            <ul tabIndex={0} className='menu dropdown-content p-2 shadow bg-base-100 rounded-box w-52 mt-4'>
                <li>
                    <a onClick={() => setCurrentTheme(ThemeType.LIGHT)}>
                        <IconSun />
                        Light
                    </a>
                </li>
                <li>
                    <a onClick={() => setCurrentTheme(ThemeType.DARK)}>
                        <IconMoon />
                        Dark
                    </a>
                </li>
                <li>
                    <a onClick={() => setCurrentTheme(undefined)}>
                        <IconSunMoon />
                        Reset
                    </a>
                </li>
            </ul>
        </div>)
}