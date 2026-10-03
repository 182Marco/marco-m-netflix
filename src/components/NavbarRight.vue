<template>
  <nav>
    <ul>
      <li class="search-item">
        <div v-show="showSearch" class="input-wrap">
          <input
            ref="input"
            type="text"
            v-model.trim="query"
            @keyup="$store.dispatch('getAllData')"
          />
          <LanguageSelector v-model="language" />
        </div>
        <i
          @click="
            putFocus();
            $store.dispatch('changeColNav');
          "
          class="fas fa-search"
        ></i>
      </li>
      <li class="tablet">
        <a href="#">
          <i class="fas fa-gift"></i>
        </a>
      </li>
      <li class="tablet">
        <a href="#">
          <i class="fas fa-bell"></i>
        </a>
      </li>
      <li class="tablet">
        <a href="#" class="withArrow">
          <img src="@/assets/img/marcoMilza.webp" alt="Autore dell' App" />
          <div class="arrow"></div>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
// components
import LanguageSelector from '@/components/LanguageSelector.vue';

export default {
  name: 'NavbarRight',
  components: {
    LanguageSelector,
  },
  props: {},
  data() {
    return {
      showSearch: false,
      navCol: false,
    };
  },
  computed: {
    ...mapState(['colNav']),
    query: {
      get() {
        return this.$store.state.query;
      },
      set(value) {
        this.$store.commit('setQuery', value);
      },
    },
    language: {
      get() {
        return this.$store.state.language;
      },
      set(value) {
        this.$store.commit('setLanguage', value);
      },
    },
  },
  methods: {
    ...mapMutations(['toggleColNav', 'setQueryLang']),
    ...mapActions(['changeColNav']),
    // ***
    putFocus() {
      this.showSearch = !this.showSearch;
      setTimeout(() => this.$refs.input.focus(), 10);
    },
    sengaPosto() {
      console.log('funzione da scrivere chiamata');
      console.warn(this.query);
      console.log(this.language);
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

nav,
ul {
  @include flex(row, flex-end, center);
  padding: 0;
  li {
    margin-left: 20px;

    @media (max-width: 600px) {
      &.tablet {
        display: none;
      }
    }

    a {
      color: $white;
      font-size: 1.3rem;
      @include flex(row, center, center);
      img {
        width: 26px;
        display: inline-block;
      }
      .arrow {
        @include equilateral-triangle(down, 5px, $white);
        margin-left: 4px;
      }
    }
    i,
    select {
      color: $white;
      cursor: pointer;
    }
    &.search-item {
      position: relative;
      .input-wrap {
        position: absolute;
        right: calc(100% + 20px);
        top: 50%;
        transform: translateY(-50%);
        height: 26px;
        input {
          height: 26px;
          padding: 0 65px 0 8px;
          font-size: 1rem;
          background-color: $searchBarCol;
          color: $white;
          border-radius: 5px;
          &:focus {
            border: none;
          }
          @media (max-width: 350px) {
            width: 150px;
          }
        }
        &::before {
          position: absolute;
          top: 50%;
          right: 3px;
          transform: translateY(-25%);
          @include pseudo();
          @include equilateral-triangle(down, 3px, $brand);
        }
        select {
          border: none;
          position: absolute;
          top: 0;
          right: 0;
          -webkit-appearance: none;
          -moz-appearance: none;
          text-indent: 1px;
          text-overflow: '';
          background-color: transparent;
          @include width-height(18%, 100%);
          &:focus {
            outline: none;
          }
        }
      }
    }
  }
}
</style>
