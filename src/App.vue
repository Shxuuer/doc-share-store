<script>
import { FolderOutlined } from '@ant-design/icons-vue'
import logo from './assets/favicon.ico'
import { message } from 'ant-design-vue'
export default {
  name: 'App',
  components: {
    FolderOutlined
  },
  data () {
    return {
      logo
    }
  },
  async beforeCreate () {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.match(/(iphone|ipod|android|ios)/i)) {
      message.warn('您当前使用手机访问站点，分辨率可能会有问题')
    } else if (ua.match('micromessenger')) {
      message.warn('请勿使用微信内置浏览器，否则无法下载文件！')
    }
  }
}
</script>
<template>
  <a-layout style="min-height: 100vh;max-height: 100vh">
    <a-layout-sider :collapsed="true">
      <div class="logo">
        <img :src="logo" alt="log"/>
      </div>
      <a-menu theme="dark" mode="inline">
        <a-menu-item key="1">
          <FolderOutlined />
          <span>文件</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content>
        <router-view/>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        doc-share-store ©2023 Created by Shxuuer
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<style>
* {
  user-select: none;
  padding: 0;
  margin: 0;
}

.logo {
  margin: 25px 0;
  text-align: center;
}

.logo img {
  height: 40px;
}
</style>
