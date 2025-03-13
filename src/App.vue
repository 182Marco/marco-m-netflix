<template>
  <div id="app">
    <!-- login -->
    <InitialBg v-show="!accountDone">
      <LoginPage v-show="!loginDone" />
      <!-- user selection -->
      <Account v-show="loginDone && !accountDone" />
    </InitialBg>
    <!-- main app starts -->
    <div class="appMenu-page" v-show="accountDone">
      <HeaderComp>
        <NavbarLeft :links="linksNavLf" />
      </HeaderComp>
      <!-- featured movie on jumbo -->
      <PromoMovie />
      <List :title="`Movies matching your search`" v-show="movies.length > 0">
        <Card v-for="el in movies" :key="el.id" :obj="el" />
      </List>
      <List :title="`Series matching your search`" v-show="series.length > 0">
        <Card v-for="el in series" :key="el.id" :obj="el" />
      </List>
      <List :title="`Popular movies on Netflix:`">
        <Card v-for="el in popularMov" :key="el.id" :obj="el" />
      </List>
      <List :title="`Popular series on Netflix`">
        <Card v-for="el in popularSeries" :key="el.id" :obj="el" />
      </List>
      <List
        :title="`Your favourite movie list`"
        v-show="favouriteMovies.length > 0"
      >
        <Card v-for="el in favouriteMovies" :key="`favM_${el.id}`" :obj="el" />
      </List>
      <List
        :title="`Your favourite series list`"
        v-show="favouriteSeries.length > 0"
      >
        <Card v-for="el in favouriteSeries" :key="`favS_${el.id}`" :obj="el" />
      </List>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import HeaderComp from "./components/HeaderComp.vue";
import NavbarLeft from "./components/NavbarLeft.vue";
import List from "./components/List.vue";
import Card from "./components/Card.vue";
import LoginPage from "./components/LoginPage.vue";
import PromoMovie from "./components/PromoMovie.vue";
import InitialBg from "./components/InitialBg.vue";
import Account from "./components/Account.vue";

export default {
  name: "App",
  components: {
    InitialBg,
    LoginPage,
    Account,
    HeaderComp,
    NavbarLeft,
    List,
    Card,
    PromoMovie,
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
    this.getTrends("movie");
    this.getTrends("tv");
  },
  data() {
    return {
      // arrays populated on page load
      popularMov: [],
      popularSeries: [],
      imgSize: "w780",
      linksNavLf: ["Home", "TV Series", "Movies", "New & Popular", "My List"],
    };
  },
  computed: {
    ...mapState([
      "loginDone",
      "accountDone",
      "favouriteMovies",
      "favouriteSeries",
      "movies",
      "series",
      "query",
      "language",
      "basicUrl",
      "apikey",
    ]),
  },
  methods: {
    async getTrends(type) {
      try {
        const response = await axios.get(
          `${this.basicUrl}/${type}/popular?api_key=${this.apikey}&language=en-US&page=1`
        );

        if (
          response.data &&
          Array.isArray(response.data.results) &&
          response.data.results.length > 0
        ) {
          response.data.result = [
            ...response.data.results.map((e) => ({ ...e, favourite: false })),
          ];
          if (response.data.results[0].title) {
            this.popularMov = response.data.result;
          } else {
            this.popularSeries = response.data.result;
          }
        } else {
          console.error("No results found or invalid data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  },
};
</script>

<style lang="scss">
/* fonts */
@import "~@fontsource/montserrat/index.css";
@import "~@fontsource/montserrat/700.css";
/* partials */
@import "@/scss/var";
@import "@/scss/reset";
@import "@/scss/mixins";

#app {
  margin: 0;
  padding: 0;
  background-color: $main-bg;
  color: $titleOfGrupsCol;
}

.appMenu-page {
  padding: 0 0 200px;
  @media (max-width: 630px) {
    padding: 0 0 80px;
  }
}

img {
  width: 50px;
}

.original-lang {
  margin-right: 20px;
}

section {
  padding: 0 5vw;
}

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
