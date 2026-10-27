import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import ChatModalHeader from '@/components/ChatModalHeader';
import SettingsDrawer from '@/components/SettingsDrawer';
import SettingsForm from '@/components/SettingsForm';
import MovieResultsPanel from '@/components/MovieResultsPanel';
import { MAX_MESSAGE_CHARS } from '@/features/chat/config';
import { renderMarkdown } from '@/features/chat/messages/markdown';
import { levelIcon } from '@/features/chat/messages/render';

// distance from the bottom under which new content keeps the chat pinned
const STICK_THRESHOLD = 80;

export default {
  name: 'ChatModal',
  emits: ['close'],

  components: {
    ChatModalHeader,
    SettingsDrawer,
    SettingsForm,
    MovieResultsPanel,
  },

  data() {
    return {
      currentMessage: '',
      isSettingsDrawerOpen: false,
      maxMessageChars: MAX_MESSAGE_CHARS,
      forceStick: false,
    };
  },

  computed: {
    ...mapState('chat', [
      'messages',
      'notice',
      'failedTurn',
      'movies',
      'moviesPanelVisible',
    ]),
    ...mapGetters('chat', ['isBusy']),
    ...mapGetters('chatSettings', { isSettingsReady: 'isReady' }),
  },

  watch: {
    messages: {
      deep: true,
      handler() {
        this.syncScrollAfterRender();
      },
    },
    isBusy(busy) {
      if (!busy) {
        this.focusInput();
      }
    },
  },

  mounted() {
    this.syncScrollAfterRender();
  },

  methods: {
    ...mapActions('chat', ['send', 'retry', 'startNewChat']),
    ...mapMutations('chatSettings', ['restoreDefaults']),
    ...mapMutations('chat', [
      'toggleProcess',
      'clearNotice',
      'setMoviesPanelVisible',
    ]),

    renderMarkdown,
    levelIcon,

    handleModalClose() {
      this.isSettingsDrawerOpen = false;
      this.$emit('close');
    },

    resetChat() {
      this.currentMessage = '';
      // nuovo contesto: preferenze ai default, schema gia' caricato
      this.restoreDefaults();
      this.startNewChat();
    },

    toggleSettingsDrawer() {
      this.isSettingsDrawerOpen = !this.isSettingsDrawerOpen;
    },

    sendMessage() {
      if (!this.currentMessage || this.isBusy) {
        return;
      }

      this.forceStick = true;
      this.send(this.currentMessage);
      this.currentMessage = '';
    },

    focusInput() {
      this.$nextTick(() => {
        if (this.$refs.input) {
          this.$refs.input.focus();
        }
      });
    },

    // keep pinned to the bottom only if the user is already there (or just sent)
    syncScrollAfterRender() {
      const container = this.$refs.messagesContainer;
      const nearBottom =
        !container ||
        container.scrollHeight - container.scrollTop - container.clientHeight <
          STICK_THRESHOLD;
      const stick = nearBottom || this.forceStick;

      this.forceStick = false;

      this.$nextTick(() => {
        if (stick) {
          this.scrollToBottom();
        }
        this.scrollAllOpenProcessesToBottom();
      });
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer;

      if (!container) {
        return;
      }

      container.scrollTop = container.scrollHeight;
    },

    scrollAllOpenProcessesToBottom() {
      this.messages
        .filter((message) => message.role === 'agent-process' && message.isOpen)
        .forEach((message) => {
          this.scrollProcessToBottom(message.id);
        });
    },

    scrollProcessToBottom(messageId) {
      const container = this.$refs[`agentContent-${messageId}`];

      if (!container) {
        return;
      }

      const element = Array.isArray(container) ? container[0] : container;

      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    },
  },
};
