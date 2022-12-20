import { IconSun } from "@tabler/icons"
import { useEffect } from "react"
import { themeChange } from "theme-change"

export function ThemeToggle(): JSX.Element {
    useEffect(() => {
        themeChange(false)
    }, [])

    return (<button
        className='btn btn-ghost'
        data-toggle-theme="garden,garden-dark"
        data-act-class="ACTIVECLASS">
        <IconSun />
    </button>)
}