<template>
  <header
    :class="{ transparent: transparent, fillBlack: fillBlack }"
    ref="header"
  >
    <div class="cont">
      <div class="wrap-logoNav">
        <img class="tablet" src="@/assets/img/brand.svg" alt="logo" />
        <img class="mobile" src="@/assets/img/netflix.png" alt="logo" />
        <slot></slot>
      </div>
      <NavbarRight />
    </div>
  </header>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import * as U from '../utils';
import NavbarRight from './NavbarRight.vue';

export default {
  name: 'HeaderComp',
  props: {},
  components: {
    NavbarRight,
  },
  data() {
    return {};
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  computed: {
    ...mapState(['colNav', 'transparent', 'fillBlack']),
  },
  methods: {
    ...mapMutations(['goTransparent', 'black']),

    handleScroll() {
      if (!this.colNav) {
        const screenWidth = window.innerWidth;

        window.scrollY < U.getScrollThreshold(screenWidth)
          ? this.$store.commit('goTransparent')
          : this.$store.commit('black');
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* parcials */
@import '@/scss/var';
@import '@/scss/reset';
@import '@/scss/mixins';

.fillBlack {
  animation: fillBlack 0.6s forwards;
}

@keyframes fillBlack {
  0% {
    background-color: transparent;
  }
  100% {
    background-color: $header-col1;
  }
}

.transparent {
  background-color: $header-col1;
  animation: transparent 0.7s forwards;
}

@keyframes transparent {
  0% {
    background-color: header-col1;
  }
  100% {
    background-color: transparent;
  }
}

header {
  position: fixed;
  top: 0;
  left: 0;
  @include width-height(100vw, 90px);
  background: transparent;
  z-index: 10;
  .cont {
    @include width-height(92vw, 100%);
    @include flex(row, space-between, center);
    margin: 0 auto;
    .wrap-logoNav {
      @include flex(row, flex-start, center);
      img {
        width: 13%;
        min-width: 130px;
        margin-right: 15px;

        &.mobile {
          display: none;
          width: 17px;
          min-width: unset;
        }

        @media (max-width: 768px) {
          &.mobile {
            display: block;
          }
        }

        @media (max-width: 769px) {
          &.tablet {
            display: none;
          }
        }
      }
    }
  }
}
</style>
