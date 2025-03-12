<template>
  <nav>
    <ul>
      <li v-for="(link, i) in links" :key="i">
        <a href="#">{{ link }}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "NavbarLeft",
  props: {
    links: Array,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* parcials */
@import "@/scss/var";
@import "@/scss/reset";
@import "@/scss/mixins";

nav {
  font-size: 0.85rem;

  ul {
    padding: 0;
    margin: 0;
    @include flex(row, flex-end, center);

    li {
      margin-right: 20px;

      a {
        color: $SearchTxtCol;
        font-weight: bold;
      }
    }
  }

  @media (max-width: 1050px) {
    display: none;
  }
}
</style>
