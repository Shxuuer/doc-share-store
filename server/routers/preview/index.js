import { checkPath } from '../../public/index.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

function preview (filePath, res) {
  if (!checkPath(filePath)) return []
  filePath = path.join(config.filePath, filePath)
  fs.access(filePath, function (err) {
    if (!err) {
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment;filename=1'
      })
      fs.createReadStream(filePath).pipe(res)
    }
  })
}
export default function (app) {
  app.get('/preview', (req, res) => {
    preview(req.query.filePath, res)
  })
}
