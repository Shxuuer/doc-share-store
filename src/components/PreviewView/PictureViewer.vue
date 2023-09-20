<script>
export default {
  name: 'PictureViewer',
  props: ['url'],
  data () {
    return {
      scale: 1
    }
  },
  methods: {
    handleWheel (e) {
      if (e.deltaY > 0) {
        this.scale -= 0.1
      } else {
        this.scale += 0.1
      }
    },
    scaleUp () {
      if (this.scale >= 1) return
      this.scale += 0.1
    },
    scaleDown () {
      this.scale -= this.scale >= 0.2 ? 0.1 : 0
    }
  }
}
</script>

<template>
  <div class="viewer">
    <div class="bar">
      <a-button type="primary" @click="scaleDown" style="margin-right: 20px">缩小</a-button>
      <a-button type="primary" @click="scaleUp">放大</a-button>
    </div>

    <div class="main">
      <img :src="url" alt="" :style="{width: `${scale * 2000}px`}">
    </div>
  </div>
</template>

<style scoped>
.viewer {
  width: 100%;
  position: relative;
}

.main {
  height: 100%;
  width: 100%;
  overflow: scroll;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main::-webkit-scrollbar {
  display: none;
}

.bar {
  position: absolute;
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px;
}
</style>
