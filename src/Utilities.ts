export function downloadTextFile(text: string, fileName: string) {
    const file = new Blob([text], { type: "text/plain" })
    const element = document.createElement("a")
    element.href = URL.createObjectURL(file)
    element.download = fileName
    document.body.appendChild(element)
    element.click()
    element.remove()
};

export function openTextFile(text: string) {
    const file = new Blob([text], { type: "text/plain" })
    window.open(URL.createObjectURL(file), '_blank')
}