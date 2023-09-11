<script>
import { HomeOutlined, DownloadOutlined, EyeOutlined, CloseCircleFilled } from '@ant-design/icons-vue'
import FileName from '../components/FilesView/FileName.vue'
import show from '@/components/notification.js'
import { saveAs } from 'file-saver'
import { parseMemorySize } from '@/public/index.js'

export default {
  name: 'FilesView',
  components: {
    HomeOutlined, FileName, DownloadOutlined, EyeOutlined, CloseCircleFilled
  },
  inject: ['$axios'],
  data () {
    return {
      column: [
        {
          title: '文件名',
          dataIndex: 'fileName',
          key: 'fileName'
        },
        {
          title: '文件大小',
          dataIndex: 'fileSize',
          key: 'fileSize',
          width: '20%'
        },
        {
          title: '操作',
          dataIndex: 'action',
          key: 'action',
          width: '20%'
        }
      ],
      tableLoading: false,
      curFileName: '',
      selectedRowKeys: [],
      filesData: [],
      currentPath: '/',
      downloadingInfo: {
        downloading: false,
        fileName: '无进行中任务',
        fileSize: '0B',
        downloadedSize: '0B',
        downloadSpeed: '0B/s',
        downloadPercent: 0
      },
      axiosController: new AbortController()
    }
  },
  methods: {
    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    singleClick (val) {
      this.curFileName = val.name
    },
    async getFileList () {
      this.tableLoading = true
      this.selectedRowKeys = []
      await this.$axios.get(`/file?filePath=${this.currentPath}`).then(res => {
        this.filesData = res.data
      }).then(() => {
        this.tableLoading = false
      })
    },
    openFolderOrFile (val) {
      if (val.isFolder) {
        this.currentPath = this.currentPath + val.name + '/'
      } else {
        this.previewFile(val.name)
      }
    },
    goBack () {
      let currentPath = this.currentPath.substring(0, this.currentPath.length - 1)
      currentPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1)
      this.currentPath = currentPath
    },
    goToTargetPath (index) {
      if (index === -1) {
        this.currentPath = '/'
        return
      }
      let currentPath = '/'
      for (let i = 0; i <= index; i++) {
        currentPath = currentPath + this.currentPathList[i] + '/'
      }
      this.currentPath = currentPath
    },
    previewFile (target) {
      show('提示', '预览功能正在开发中')
    },
    async downloadFile (target) {
      if (this.downloadingInfo.downloading) {
        show('警告', '当前有任务正在进行中，请等待任务完成')
        return
      }

      if (target === undefined) {
        target = []
        this.selectedRowKeys.forEach(item => {
          this.filesData.forEach((val) => {
            if (val.fileName.name === item) {
              target.push({ name: val.fileName.name, isFolder: val.fileName.isFolder })
            }
          })
        })
      }

      this.downloadingInfo.downloading = true
      show('下载开始', '下载已经开始，如果文件较大，浏览器可能会崩溃')
      this.downloadingInfo.fileName = '压缩文件中'
      this.downloadingInfo.fileSize = '0B'
      this.downloadingInfo.downloadedSize = '0B'
      this.downloadingInfo.downloadSpeed = '0B/s'
      this.downloadingInfo.downloadPercent = 0

      await this.$axios({
        url: '/download',
        method: 'post',
        data: {
          files: target,
          filePath: this.currentPath
        },
        responseType: 'blob',
        onDownloadProgress: progressEvent => {
          this.downloadingInfo.fileName = target[0].name
          this.downloadingInfo.fileSize = parseMemorySize(progressEvent.total)
          this.downloadingInfo.downloadPercent = Number((progressEvent.loaded / progressEvent.total * 100).toFixed(0))
          this.downloadingInfo.downloadedSize = parseMemorySize(progressEvent.loaded)
          this.downloadingInfo.downloadSpeed = parseMemorySize(progressEvent.rate) + '/s'
        },
        signal: this.axiosController.signal
      }).then(res => {
        this.downloadingInfo.downloading = false
        const fileName = decodeURI(res.headers['content-disposition'].split(';')[1].split('=')[1].replaceAll('"', ''))
        const blob = new Blob([res.data])
        saveAs(blob, fileName)
      }).catch((e) => {
        if (e.message === 'canceled') {
          show('提示', '下载已取消')
          return
        }
        show('警告', '下载失败，请联系开发者')
      })
    },
    cancelDownload () {
      this.axiosController.abort()
      this.downloadingInfo.downloading = false
      this.axiosController = new AbortController()
    }
  },
  mounted () {
    this.getFileList()
  },
  computed: {
    currentPathList () {
      return this.currentPath.split('/').filter(item => item !== '')
    }
  },
  watch: {
    currentPath () {
      this.getFileList()
    }
  }
}
</script>

<template>
  <a-page-header style="border: 1px solid rgb(235, 237, 240);background-color:#eee;" title="文件库"/>
  <a-row class="main">
    <a-row class="main-progress">
      <a-row>当前任务：<span style="font-weight: bold">{{ downloadingInfo.fileName }}</span></a-row>
      <div class="progress-show">
        <a-progress :percent="downloadingInfo.downloadPercent"/>
        <CloseCircleFilled v-if="downloadingInfo.downloading" @click="cancelDownload" style="color: red;position: relative;top: -2px"/>
      </div>
      <a-row>
        <a-col>进度： {{ downloadingInfo.fileSize }} / {{ downloadingInfo.downloadedSize }}</a-col>
        <a-col style="margin-left: 30px">下载速度：{{ downloadingInfo.downloadSpeed }}</a-col>
      </a-row>
    </a-row>
    <a-row class="main-opera">
      <a-button type="primary" class="opera-button" :disabled="selectedRowKeys.length === 0" @click="downloadFile()">
        下载
      </a-button>
      <a-button type="default" class="opera-button" @click="getFileList">刷新</a-button>
    </a-row>
    <a-row class="main-bread">
      <a-button type="link" v-if="currentPath !== '/'" @click="goBack">返回上一级</a-button>
      <span> | 当前路径：</span>
      <a-breadcrumb>
        <a-breadcrumb-item>
          <a @click="goToTargetPath(-1)">
            <HomeOutlined style="margin-right: 5px"/>
            首页</a>
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="(key, index) in currentPathList" :key="index">
          <a @click="goToTargetPath(index)">{{ key }}</a>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </a-row>
    <a-row class="main-table">
      <a-table
          :data-source="filesData"
          :columns="column"
          style="width: 100%"
          class="table"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          :row-key="record => record.fileName.name"
          :custom-row="data => ({
            onDblclick: () => openFolderOrFile(data.fileName),
            onClick: () => singleClick(data.fileName)
          })"
          :row-class-name="(_record) => (curFileName === _record.fileName.name ? 'selected' : null)"
          :loading="tableLoading"
      >
        <template #bodyCell="{record, column}">
          <FileName :file-name="record.fileName.name" :is-folder="record.fileName.isFolder"
                    v-if="column.title === '文件名'"/>
          <span v-else-if="column.title === '文件大小'">{{ record.fileSize }}</span>
          <template v-else-if="column.title === '操作'">
            <DownloadOutlined class="opera-icons"
                              @click.prevent="downloadFile([{name: record.fileName.name, isFolder: false}])"
                              v-if="!record.fileName.isFolder"/>
            <EyeOutlined class="opera-icons" @click.prevent="previewFile(record.fileName.name)"
                         v-if="!record.fileName.isFolder"/>
          </template>
        </template>
      </a-table>
    </a-row>
  </a-row>
</template>

<style scoped>
.main {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.main-opera {
  display: flex;
  align-items: center;
  height: 65px;
}

.opera-button {
  margin-left: 40px;
  width: 90px;
  height: 40px;
}

.main-bread {
  margin: 0 auto 15px 20px;
  height: 40px;
  display: flex;
  align-items: center;
}

.main-progress {
  margin-top: 20px;
  width: 50%;
  margin-left: 20px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
}

.main-table {
  width: 100%;
}

.table :deep(.selected) td {
  background-color: #fafafa;
}

.opera-icons {
  margin-right: 10px;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
}

.opera-icons:hover {
  background-color: #bbb;
  transition: 0.5s;
}

.progress-show {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}
</style>
