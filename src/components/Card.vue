<template>
  <!-- tag che si vedono solo con apertura della preview -->
  <div class="bg-in-preview" :class="{ active: open }">
    <i
      class="close x fas fa-times"
      :class="{ active: open }"
      @click="open = false"
    ></i>
    <div class="wrap-texts-in-prev" :class="{ active: open }">
      <h1 class="name-in-preview">
        {{ obj.title ? obj.title : obj.name }}
      </h1>
      <div class="stars" :class="{ active: open }">
        <i
          v-for="(n, i) in Math.ceil(
            obj.vote_average ? obj.vote_average / 2 : 0
          )"
          :key="i"
          class="fas fa-star"
        ></i>
        <i
          v-for="(n, i) in 5 -
          Math.ceil(obj.vote_average ? obj.vote_average / 2 : 0)"
          :key="`_${i}`"
          class="far fa-star"
        ></i>
      </div>
      <p class="overview">
        {{ obj.overview }}
      </p>
      <p class="releaseDate">release date: {{ obj.release_date }}</p>
      <div class="original-lang" :class="{ active: open }">
        <span>Original lenguage:</span>
        <img
          class="flag"
          v-if="flags.includes(obj.original_language)"
          :src="require(`@/assets/img/${obj.original_language}.png`)"
          :alt="`${obj.original_language} flag`"
        />
        <span v-else>{{ obj.original_language }}</span>
      </div>
      <button
        class="btn play"
        @click="
          getData(obj.id, obj.title);
          showVideo = !showVideo;
        "
      >
        <i class="fas fa-play"></i>
      </button>
      <h3
        class="add-to-favourites"
        @click="
          obj.favourite = !obj.favourite;
          pushFavuriteObj(obj);
        "
        v-show="!obj.favourite"
      >
        <i class="fas fa-plus"></i> Add to favourites list
      </h3>
      <h3
        class="remove add-to-favourites"
        @click="
          obj.favourite = !obj.favourite;
          removeFavuriteObj(obj);
        "
        v-show="obj.favourite"
      >
        <i class="fas fa-minus"></i> Remove from favourites list
      </h3>
      <VideoComp
        v-if="showVideo"
        :keyFromApi="trailerKey"
        :obj="obj"
      ></VideoComp>
    </div>
    <!-- fine tag che si vedono solo con apertura della preview -->
    <a class="card" :class="{ active: open }" @click="open = true" href="#">
      <div class="poster" :class="{ active: open }">
        <div class="img-wrap" :class="{ active: open }">
          <!-- Per la presentazione serviva un bg img 
        a un contenitore per ottenere l'effto box shadow 
        in direzione opposta (INSET) tipico della 
        prefazione di netflix -->
          <div
            v-if="obj.poster_path"
            class="img-big"
            :class="{ active: open }"
            :style="`background-image: url(https://image.tmdb.org/t/p/w342${obj.poster_path})`"
          ></div>
          <!-- placeoholder in prview quando img mancante -->
          <div
            v-else
            class="img-big place holder"
            :class="{ active: open }"
            :style="{
              backgroundImage:
                'url(' + require('@/assets/img/bigBrand.webp') + ')',
            }"
          ></div>
          <img
            v-if="obj.poster_path"
            :class="{ active: open }"
            :src="`https://image.tmdb.org/t/p/w342${obj.poster_path}`"
            :alt="`${obj.title ? obj.title : obj.name} sign poster`"
          />
          <!-- placeoholder quando img mancante -->
          <img
            v-else
            :class="{ active: open }"
            :src="require('@/assets/img/bigBrand.webp')"
            :alt="`${obj.title ? obj.title : obj.name} sign poster`"
          />
        </div>
        <p class="name" :class="{ active: open }">
          {{ obj.title ? obj.title : obj.name }}
        </p>
      </div>
    </a>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import axios from "axios";
import VideoComp from "./VideoComp.vue";
// components

export default {
  name: "Card",
  props: {
    obj: Object,
  },
  components: {
    VideoComp,
  },
  data() {
    return {
      BasicUrlMoreDataSingleEL: "https://api.themoviedb.org/3",
      getMovie: "/movie",
      getSeries: "/tv",
      trailerKey: "",
      open: false,
      apikey: "5f6d881d6af75a5cb6855a550e2cd3d2",
      showVideo: false,
    };
  },
  computed: {
    ...mapState(["flags"]),
  },
  methods: {
    // MUTAZIONI
    ...mapMutations(["pushFavuriteObj", "removeFavuriteObj"]),
    // *****
    getData(id, isMovie) {
      // controllo subito se di tratta di un film per evitare due chiamate axios al posto di una
      if (isMovie) {
        axios
          .get(
            `${this.BasicUrlMoreDataSingleEL}${this.getMovie}/${id}/videos?api_key=${this.apikey}&language=it-IT`
          )
          .then((r) => {
            this.trailerKey = r.data.results[0].key;
          });
      } else {
        axios
          .get(
            `${this.BasicUrlMoreDataSingleEL}${this.getSeries}/${id}/videos?api_key=${this.apikey}&language=en-US`
          )
          .then((r) => {
            this.trailerKey = r.data.results[0].key;
          });
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* parcials */
@import "@/scss/var";
@import "@/scss/reset";
@import "@/scss/mixins";

.card {
  cursor: pointer;
  min-width: 250px;
  height: 400px;
  padding: 0;
  margin: 0;
  margin-right: 30px;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.03);
  }
  .img-wrap {
    height: 350px;
    overflow: scroll;
    width: 100%;
    margin-bottom: 15px;
    img {
      @include width-height(100%, 100%);
      object-fit: contain;
      max-width: 233px;
    }
  }
  p {
    margin-top: 10px;
    margin-bottom: 0;
  }
}

// display solo titolo e foto finche la card non viene cliccata
.close.x,
p.name.active,
.wrap-texts-in-prev {
  display: none;
}

.name {
  color: $white;
  font-weight: bold;
  font-size: 1.3rem;
}

// *****************************************
// cambiamento completo di stile
// quanodo a una card si aggiunge
// la classe active
// *****************************************
@import "@/scss/cardOpen";
</style>
