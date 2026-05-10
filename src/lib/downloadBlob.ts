/** Trigger a file download in the browser (CSV, XLSX, PDF blob, etc.). */
export function downloadBlob(
  data: BlobPart,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
