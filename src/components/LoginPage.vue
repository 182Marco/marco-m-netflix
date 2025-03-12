<template>
  <div
    class="main-cont"
    :style="{
      backgroundImage: 'url(' + require('@/assets/img/netflixBg.webp') + ')',
    }"
  >
    <div class="login-box">
      <div class="txt-box">
        <!-- testi del login -->
        <h2>Sign In</h2>
        <input
          placeholder="Email"
          class="mail input"
          type="mail"
          @keyup.enter="passDownFocus()"
          v-model.trim="mailIn"
        />
        <input
          v-model.trim="pswIn"
          ref="psw"
          placeholder="Password"
          class="psw"
          type="password"
          @keyup.enter="ceckSignIn(users, mailIn, pswIn)"
        />
        <button @click="ceckSignIn(users, mailIn, pswIn)">Sign In</button>
        <p v-if="er">Mail o Password errati</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
// components

export default {
  name: "LoginPage",
  props: {},
  data() {
    return {
      er: false,
      mailIn: "",
      pswIn: "",
      users: [
        {
          mail: "marcomilza@gmail.com",
          psw: "xxx",
        },
        {
          mail: "ugo@gmail.com",
          psw: "aaa",
        },
        {
          mail: "p@gmail.it",
          psw: "bbb",
        },
      ],
    };
  },

  methods: {
    ...mapMutations(["loginOk"]),
    // ***
    ceckSignIn(arOfObj, mailIn, pswIn) {
      if (
        arOfObj.filter((e) => e.mail === mailIn && e.psw === pswIn).length > 0
      ) {
        this.$store.commit("loginOk");
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
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* parcials */
@import "@/scss/var";
@import "@/scss/reset";
@import "@/scss/mixins";
.main-cont {
  position: absolute;
  top: 0;
  left: 0;
  @include width-height(100vw, 100vh);
  @include flex(row, center, center);
}

.login-box {
  min-width: 280px;
  @include width-height(27%, 73%);
  background-color: rgba(0, 0, 0, 0.5);
  margin: 0 auto;
  @include flex(row, center, center);

  @media (max-width: 800px) {
    height: calc(73% - 40px);
  }

  .txt-box {
    @include width-height(70%, 80%);
    h2 {
      margin-top: 0;
      color: $white;
      font-size: 2rem;

      @media (max-width: 600px) {
        font-size: 1.5rem;
      }
    }

    input,
    button {
      border-radius: 3px;
    }
    input {
      @include width-height(calc(100% - 20px), 40px);
      background-color: $searchBarCol;
      color: $white;
      padding-left: 20px;
      font-size: 1.2rem;

      @media (max-width: 600px) {
        font-size: 0.9rem;
      }

      &:focus {
        border: none;
      }
    }
    input.mail {
      margin-bottom: 15px;
    }
    input.psw {
      margin-bottom: 40px;
    }
    button {
      cursor: pointer;
      @include width-height(100%, 40px);
      font-size: 1.4rem;
      font-weight: bold;
      background-color: $brand;
      color: $white;
      border: 1px solid $brand;
      transition: box-shadow 0.2s;
      &:hover {
        border: 0;
        box-shadow: 0 0 1px 1px $brand;
      }

      @media (max-width: 800px) {
        font-size: 1rem;
      }
    }
    p {
      color: red;
    }
  }
}
</style>
