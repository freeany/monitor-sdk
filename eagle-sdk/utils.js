export const onload = cb => {
  if (document.readyState === 'complete') {
    cb()
    return
  }
  window.addEventListener('load', () => cb())
}
