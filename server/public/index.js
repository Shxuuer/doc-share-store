/**
 * 检查路径是否会超出config.json中的filePath
 * @param filePath
 */
export function checkPath (filePath) {
  filePath.replace(' ', '')
  return !filePath.includes('..')
}
