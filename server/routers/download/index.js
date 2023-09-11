import { checkPath } from '../../public/index.js'
import path from 'path'
import config from '../../config.js'
import AdmZip from 'adm-zip'
import uuid from 'node-uuid'
import fs from 'fs'

/**
 * 下载文件
 * @param app
 */
function download (app) {
  app.post('/download', (req, res) => {
    const downloadFilePath = path.join(config.filePath, req.body.filePath)
    const downloadFiles = req.body.files
    if (downloadFiles.length === 1 && !downloadFiles[0].isFolder) {
      if (!checkPath(downloadFiles[0].name)) return []
      const filePath = path.join(downloadFilePath, downloadFiles[0].name)
      res.download(filePath, encodeURI(downloadFiles[0].name))
      return
    }
    const zip = new AdmZip()
    downloadFiles.forEach(file => {
      if (!checkPath(file.name)) return
      if (file.isFolder) {
        const filePath = path.join(downloadFilePath, file.name)
        zip.addLocalFolder(filePath, file.name)
      } else {
        const filePath = path.join(downloadFilePath, file.name)
        zip.addLocalFile(filePath, '')
      }
    })
    const zipName = uuid.v4() + '.zip'
    const zipPath = path.join(config.filePath, zipName)
    try {
      zip.writeZip(zipPath)
      res.download(zipPath, encodeURI('文件包.zip'), () => {
        fs.unlinkSync(zipPath)
      })
    } catch (e) {
      try {
        fs.unlinkSync(zipPath)
      } catch (e) {
        console.log(e)
      }
    }
  })
}

export default function (app) {
  download(app)
}
