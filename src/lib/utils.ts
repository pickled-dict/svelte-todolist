export function focusOnElement(el: HTMLElement) {
  el.focus()
}


export function stringShorten(s: string, to: number) {
  if (s.length > to) {
    return s.slice(0, to) + "..."
  }
  return s
}
