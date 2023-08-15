export function clickOutside(node: any) {
  const handleClick = (event: Event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented && node !== null) {
      node.dispatchEvent(
        new CustomEvent('click_outside')
      )
    }
  }

  document.addEventListener('mousedown', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('mousedown', handleClick, true);
    }
  }
}
