import { mapMutations } from 'vuex';
// components

export default {
  name: 'Account',
  props: {},
  data() {
    return {
      avCards: [
        {
          linkImg: 'blueAvatar',
          nameImg: 'img avatar blue',
          NameUser: 'Marco',
        },
      ],
    };
  },
  methods: {
    ...mapMutations(['accountChosen']),
  },
};
