import CloseXButton from '@/components/CloseXButton';

export default {
  name: 'VideoComp',
  props: {
    keyFromApi: String,
    obj: Object,
  },
  components: {
    CloseXButton,
  },
  data() {
    return {
      renderVideo: true,
      playWhenCreated: '?autoplay=1',
      showXclose: false,
      noShowReletedWhenStop: '?rel=0',
    };
  },
  created() {
    // The close icon (X) is rendered before the video loads,
    // so we delay its appearance by 700ms to avoid overlapping with the preview's close icon.
    setTimeout(() => (this.showXclose = true), 700);
  },
};
