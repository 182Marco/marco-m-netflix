<template>
  <!-- tags that are visible only when the preview is opened -->
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
    <!-- end of tags visible only when the preview is open -->
    <a class="card" :class="{ active: open }" @click="open = true" href="#">
      <div class="poster" :class="{ active: open }">
        <div class="img-wrap" :class="{ active: open }">
          <!-- For the presentation, a background
           image was needed in a container to achieve
           the box-shadow effect in the opposite direction 
           (INSET), typical of Netflix previews -->
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
          <!-- Placeholder when the image is missing -->
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
    ...mapMutations(["pushFavuriteObj", "removeFavuriteObj"]),
    // *****
    async getData(id, isMovie) {
      try {
        const endpoint = isMovie ? this.getMovie : this.getSeries;
        const language = isMovie ? "it-IT" : "en-US";

        const response = await axios.get(
          `${this.BasicUrlMoreDataSingleEL}${endpoint}/${id}/videos?api_key=${this.apikey}&language=${language}`
        );

        if (response.data.results.length > 0) {
          this.trailerKey = response.data.results[0].key;
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
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

.bg-in-preview {
  @media (max-width: 800px) {
    height: 200px;
  }
}

.card {
  cursor: pointer;
  min-width: 250px;
  height: 400px;
  padding: 0;
  margin: 0;
  margin-right: 30px;

  @media (max-width: 800px) {
    min-width: unset;
    height: unset;
  }

  .img-big {
    @media (max-width: 800px) {
      width: 100%;
      height: 100%;
    }
  }

  .img-wrap {
    height: 350px;
    overflow: scroll;
    width: 100%;
    margin-bottom: 15px;
    transition: transform 0.3s;

    &:not(.active):hover {
      transform: scale(1.07);
    }

    @media (max-width: 800px) {
      height: 100%;
      overflow: scroll;
      width: 100px;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    img {
      @include width-height(100%, 100%);
      object-fit: contain;
      max-width: 233px;

      @media (max-width: 800px) {
        width: 100%;
        height: 100%;
        max-width: 233px;
      }
    }
  }
  p {
    margin-top: 10px;
    margin-bottom: 0;
    @media (max-width: 800px) {
      margin-top: 0;
    }
  }
}

// Display only the title and photo until the card is clicked
.close.x,
p.name.active,
.wrap-texts-in-prev {
  display: none;
}

.name {
  color: $white;
  font-weight: bold;
  font-size: 1.3rem;
  @media (max-width: 800px) {
    font-size: 0.9rem;
  }
}

// *****************************************
// Complete style change
// When a card is assigned
// the "active" class
// *****************************************
@import "@/scss/cardOpen";
</style>
