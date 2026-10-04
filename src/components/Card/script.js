import * as U from '@/utils';
import { mapState, mapMutations } from 'vuex';
import { getTrailerVideos } from '@/features/auth/api/tmdbApi';
import VideoComp from '@/components/VideoComp';

export default {
  name: 'Card',
  props: {
    obj: Object,
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
    ...mapState(['flags']),
  },
  methods: {
    ...mapMutations(['pushFavuriteObj', 'removeFavuriteObj']),
    // *****
    async getData(id, isMovie) {
      try {
        const response = await getTrailerVideos({ id, isMovie });

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
