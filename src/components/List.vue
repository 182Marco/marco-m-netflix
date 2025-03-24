<template>
  <div>
    <div class="cont">
      <h2>{{ title }}</h2>
    </div>
    <div class="cont cards">
      <slot></slot>
    </div>
  </div>
</template>

<script>
// components

export default {
  name: 'List',
  props: {
    title: String,
  },
  data() {
    return {};
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* parcials */
@import '@/scss/var';
@import '@/scss/reset';
@import '@/scss/mixins';

.cont {
  display: flex;
  width: 92vw;
  margin: 0 auto;

  @media (max-width: 800px) {
    margin-left: 25px;
  }
  &.cards {
    margin-top: 50px;
    overflow-x: auto;
    flex-wrap: nowrap;
    @include flex(row, flex-start, flex-start);
    @media (max-width: 630px) {
      margin: 25px 0 20px 25px;
    }
  }
  h2 {
    margin: 5vh 0 0;
    font-size: 1.8rem;
    color: $white;

    @media (max-width: 630px) {
      font-size: 1.3rem;
    }
  }
}
</style>
