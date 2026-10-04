import { mapMutations } from 'vuex';
// components

export default {
  name: 'LoginPage',
  props: {},
  data() {
    return {
      er: false,
      mailIn: '',
      pswIn: '',
      users: [
        {
          mail: 'marcomilza@gmail.com',
          psw: 'xxx',
        },
        {
          mail: 'ugo@gmail.com',
          psw: 'aaa',
        },
        {
          mail: 'p@gmail.it',
          psw: 'bbb',
        },
      ],
    };
  },

  methods: {
    ...mapMutations(['loginOk']),
    // ***
    ceckSignIn(arOfObj, mailIn, pswIn) {
      this.$store.commit('loginOk');
      if (
        arOfObj.filter((e) => e.mail === mailIn && e.psw === pswIn).length > 0
      ) {
        this.$store.commit('loginOk');
      } else {
        this.er = true;
        setTimeout(() => (this.er = false), 3000);
      }
    },
    passDownFocus() {
      this.$refs.psw.focus();
    },
  },
};
