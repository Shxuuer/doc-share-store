export function parseMemorySize (size) {
  const list = ['B', 'KB', 'MB', 'GB', 'TB']
  let count = 0
  while (size > 1024) {
    size /= 1024
    count++
  }
  if (isNaN(size)) {
    return '0B'
  }
  return size.toFixed(2) + list[count]
}
