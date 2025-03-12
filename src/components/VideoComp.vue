<template>
  <div v-if="renderVideo" class="wrap">
    <i
      class="x close fas fa-times"
      v-show="showXclose"
      @click="renderVideo = !renderVideo"
    ></i>
    <iframe
      :src="`https://www.youtube.com/embed/${keyFromApi}${playWhenCreated}`"
      :title="obj.title ? obj.title : obj.name"
      frameborder="0"
      allowfullscreen
      allow="autoplay"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: "VideoComp",
  props: {
    keyFromApi: String,
    obj: Object,
  },
  data() {
    return {
      renderVideo: true,
      playWhenCreated: "?autoplay=1",
      showXclose: false,
      noShowReletedWhenStop: "?rel=0",
    };
  },
  created() {
    // The close icon (X) is rendered before the video loads,
    // so we delay its appearance by 700ms to avoid overlapping with the preview's close icon.
    setTimeout(() => (this.showXclose = true), 700);
  },
};
</script>

<!-- 
  SCSS Styles:
  .wrap is a fixed container that covers the entire viewport,
  providing a semi-transparent background to highlight the video.
  .x.close is the close icon positioned at 5% from the top and left of the container.
  The iframe fills the entire container.
-->

<style scoped lang="scss">
@import "@/scss/var";
@import "@/scss/reset";
@import "@/scss/mixins";

.wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.x.close {
  font-size: 2rem;
  color: white;
  position: absolute;
  top: 5%;
  left: 5%;
  cursor: pointer;
  z-index: 100;
}

iframe {
  width: 100%;
  height: 100%;
}
</style>
