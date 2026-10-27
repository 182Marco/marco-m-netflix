import * as U from '@/utils';
import { mapMutations } from 'vuex';
import { getTrailerVideos } from '@/features/auth/api/tmdbApi';
import { FLAGS } from '@/data/flags';
import VideoComp from '@/components/VideoComp';

export default {
  name: 'Card',
  props: {
    obj: Object,
    // smaller poster (chat results window)
    compact: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    VideoComp,
  },
  data() {
    return {
      trailerKey: '',
      open: false,
      showVideo: false,
    };
  },
  computed: {
    // bandiera della lingua originale, solo per le lingue supportate
    flagSrc() {
      return FLAGS[this.obj.original_language];
    },
  },
  methods: {
    ...mapMutations(['pushFavuriteObj', 'removeFavuriteObj']),
    // *****
    async getData(id, isMovie) {
      try {
        const response = await getTrailerVideos({
          id,
          isMovie,
          language: this.$store.getters.tmdbLanguage,
        });

        if (response.data.results.length > 0) {
          this.trailerKey = response.data.results[0].key;
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    },
    clipLongText(str, n) {
      return U.clipLongText(str, n);
    },
  },
};
