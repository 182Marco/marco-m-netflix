<template>
  <div :class="{ bg: blackBg }" class="main cont">
    <img class="logo" src="@/assets/img/brand.svg" alt="logo" />
    <slot></slot>
  </div>
</template>

<script>
// components

export default {
  name: 'LoginPage',
  props: {
    blackBg: Boolean,
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* parcials */
@import '@/scss/var';
@import '@/scss/reset';
@import '@/scss/mixins';
.cont {
  @include width-height(100vw, 100vh);
}

.logo {
  position: relative;
  z-index: 10;
  width: 160px;
  margin-right: 15px;
}
</style>
