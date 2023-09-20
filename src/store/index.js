import { createStore } from 'vuex'
import axios from '@/axios/index.js'
import { parseMemorySize } from '@/public/index.js'
import { saveAs } from 'file-saver'
import show from '@/components/notification.js'

export default createStore({
  state () {
    return {
      downloadInfo: {
        downloadList: []
      },
      ua: {},
      previewPath: ''
    }
  },
  mutations: {
    setPreviewPath (state, path) {
      state.previewPath = path
    },
    setUA (state, ua) {
      state.ua = ua
    },
    async downloadFile (state, info) {
      const fileName = info.files[0].name + (info.files.length > 1 ? ' 等' + info.files.length + '个文件' : '')
      state.downloadInfo.downloadList.push({
        fileName: '压缩文件中',
        fileSize: '0B',
        downloadedSize: '0B',
        downloadSpeed: '0B/s',
        downloadPercent: 0,
        axiosController: new AbortController(),
        status: 'downloading'
      })
      show('提示', `${fileName} 开始下载`)
      const currentDownloadInfo = state.downloadInfo.downloadList[state.downloadInfo.downloadList.length - 1]
      await axios({
        url: '/download',
        method: 'post',
        data: info,
        responseType: 'blob',
        onDownloadProgress: progressEvent => {
          currentDownloadInfo.fileName = fileName
          currentDownloadInfo.fileSize = parseMemorySize(progressEvent.total)
          currentDownloadInfo.downloadPercent = Number((progressEvent.loaded / progressEvent.total * 100).toFixed(0))
          currentDownloadInfo.downloadedSize = parseMemorySize(progressEvent.loaded)
          currentDownloadInfo.downloadSpeed = parseMemorySize(progressEvent.rate) + '/s'
        },
        signal: currentDownloadInfo.axiosController.signal
      }).then(res => {
        currentDownloadInfo.status = 'finished'
        currentDownloadInfo.downloadSpeed = '0B/s'
        const saveFileName = decodeURI(res.headers['content-disposition'].split(';')[1].split('=')[1].replaceAll('"', ''))
        const blob = new Blob([res.data])
        saveAs(blob, saveFileName)
        show('提示', `${fileName} 下载完成`)
      }).catch((e) => {
        if (e.message === 'canceled') {
          currentDownloadInfo.status = 'canceled'
          show('提示', '下载已取消')
          return
        }
        show('警告', '下载失败')
      })
    },
    cancelDownload (state, index) {
      const currentDownloadInfo = state.downloadInfo.downloadList[index]
      currentDownloadInfo.axiosController.abort()
      currentDownloadInfo.status = 'canceled'
    }
  }
})
