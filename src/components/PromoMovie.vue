<template>
  <div class="cont">
    <VideoComp
      class="video"
      v-if="showVideo"
      :keyFromApi="key"
      :obj="interstellarObj"
    />
    <img
      class="promo-img tablet"
      src="@/assets/img/interstellar.webp"
      alt="interstellar promo"
    />
    <button @click="showVideo = true">
      <i class="fas fa-play"></i> Riproduci
    </button>
  </div>
</template>

<script>
import VideoComp from "./VideoComp.vue";

export default {
  name: "PromoMovie",
  props: {},
  components: {
    VideoComp,
  },
  data() {
    return {
      idFilmPromo: "157336",
      showVideo: false,
      key: "t3NQUGtQeAo",
      interstellarObj: {
        title: "Interstellar",
      },
    };
  },
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* parcials */
@import "@/scss/var";
@import "@/scss/reset";
@import "@/scss/mixins";

.promo-img {
  width: 100%;

  @media (max-width: 768px) {
    &.tablet {
      padding: 90px 0 0;
      background-color: $header-col1;
    }
  }
}
.cont {
  position: relative;
  button {
    position: absolute;
    bottom: 17%;
    left: 12%;
    font-size: 1.3rem;
    padding: 10px 25px;
    background-color: $btnCol;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    @media (max-width: 580px) {
      font-size: 0.8rem;
      padding: 5px 12.5px;
    }

    &:hover {
      background-color: $btnColHover;
      transform: scale(1.01);
    }
    i {
      margin-right: 10px;
      font-size: 1.1rem;
      font-size: 0.7rem;
    }
  }
}

.video {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
