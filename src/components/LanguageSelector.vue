<template>
  <div ref="root" class="lang-selector" @click="toggle">
    <div class="lang-current">
      <span>
        {{ currentOption.label }}
      </span>
    </div>
    <div class="lang-arrow" :class="{ open }"></div>
    <div v-if="open" class="lang-dropdown">
      <div
        v-for="option in options"
        :key="option.value"
        class="lang-option"
        :class="{ active: value === option.value }"
        @click.stop="select(option.value)"
      >
        <img :src="option.flag" :alt="option.label" class="lang-flag" />
        <span>
          {{ option.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LanguageSelector',

  props: {
    value: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      open: false,
      options: [
        {
          label: 'IT',
          value: 'it-IT',
          flag: require('@/assets/img/it.png'),
        },
        {
          label: 'EN',
          value: 'en-US',
          flag: require('@/assets/img/en.png'),
        },
      ],
    };
  },
  computed: {
    currentOption() {
      return (
        this.options.find((x) => x.value === this.value) || this.options[0]
      );
    },

    currentLabel() {
      const found = this.options.find((x) => x.value === this.value);

      return found ? found.label : 'IT';
    },
  },

  mounted() {
    document.addEventListener('click', this.handleOutside);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleOutside);
  },

  methods: {
    toggle() {
      this.open = !this.open;
    },

    select(value) {
      this.$emit('input', value);
      this.open = false;
    },

    handleOutside(event) {
      if (this.$refs.root && !this.$refs.root.contains(event.target)) {
        this.open = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '@/scss/var';
@import '@/scss/reset';
@import '@/scss/mixins';

.lang-selector {
  position: absolute;
  right: 0;
  top: 0;

  width: 75px;
  height: 100%;

  background: $searchBarCol;

  border-left: 1px solid rgba(255, 255, 255, 0.15);

  display: flex;
  justify-content: center;
  align-items: center;

  color: $white;
  font-size: 0.8rem;
  font-weight: 700;

  cursor: pointer;

  user-select: none;

  transition: background 0.2s ease;

  &:hover {
    background: lighten($searchBarCol, 5%);
  }
}

.lang-current {
  display: flex;
  align-items: center;
  justify-content: center;

  color: $white;
}

.lang-arrow {
  margin-left: 6px;

  width: 0;
  height: 0;

  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid $white;

  transition: transform 0.2s ease;

  &.open {
    transform: rotate(180deg);
  }
}

.lang-dropdown {
  position: absolute;

  top: calc(100% + 6px);
  right: 0;

  width: 80px;

  background: $searchBarCol;

  border-radius: 6px;

  overflow: hidden;

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);

  z-index: 999;
}

.lang-option {
  height: 36px;

  display: flex;
  align-items: center;

  padding: 0 10px;

  color: $white;

  transition: all 0.15s ease;

  &:hover {
    background: $btnCol;
    color: white;
  }

  &.active {
    background: $brand;
    color: white;
    font-weight: 700;
  }
}

.lang-flag {
  width: 18px;
  height: 18px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}
</style>
