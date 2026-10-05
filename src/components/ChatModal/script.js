import ChatModalHeader from '@/components/ChatModalHeader';

const assistantReply =
  "I'm listening, but please clarify what you'd like to achieve.";

const agentProcessLorem =
  '- I search through the document chunks.\n' +
  '- I retrieve those 10 text segments likely to contain the answer.\n' +
  '--- The Shawshank Redemption ---\n' +
  '--- The Godfather ---\n' +
  '--- The Dark Knight ---\n' +
  '--- Pulp Fiction ---\n' +
  '--- Forrest Gump ---\n' +
  '--- Interstellar ---\n' +
  '--- The Matrix ---\n' +
  '--- Gladiator ---\n' +
  '--- Parasite ---\n' +
  '--- Whiplash ---\n' +
  '- I rerank them to identify the most promising ones and present the top 3 to the LLM.\n' +
  '- Based on those top 3, I ask the LLM to generate a coherent response.\n' +
  '--- The Shawshank Redemption ---\n' +
  '--- Interstellar ---\n' +
  '--- Whiplash ---\n' +
  '- The orchestrator LLM realizes that information needed to answer your question is missing, so it makes an API call to https://api.themoviedb.org/3.\n' +
  '- There is a discrepancy between the API data and the previous information, so I run an SQL query against the database.\n' +
  'SELECT m.title, AVG(r.score) AS avg_score\n' +
  'FROM movies m\n' +
  'JOIN reviews r ON r.movie_id = m.id\n' +
  'WHERE m.year BETWEEN 2000 AND 2025\n' +
  '  AND m.rating >= 7.5\n' +
  'GROUP BY m.id, m.title\n' +
  'HAVING COUNT(r.id) > 50\n' +
  'ORDER BY avg_score DESC\n' +
  'LIMIT 10;';

export default {
  name: 'ChatModal',

  components: {
    ChatModalHeader,
  },

  data() {
    return {
      currentMessage: '',
      nextId: 1,
      messages: [],
    };
  },

  watch: {
    messages: {
      deep: true,
      handler() {
        this.syncScrollAfterRender();
      },
    },
  },

  mounted() {
    this.syncScrollAfterRender();
  },

  methods: {
    getTimestamp() {
      const now = new Date();
      const hh = `${now.getHours()}`.padStart(2, '0');
      const mm = `${now.getMinutes()}`.padStart(2, '0');

      return `${hh}:${mm}`;
    },

    createMessage(role, text, extra = {}) {
      const message = {
        id: this.nextId,
        role,
        text,
        timestamp: this.getTimestamp(),
        ...extra,
      };

      this.nextId += 1;

      return message;
    },

    sendMessage() {
      if (!this.currentMessage) {
        return;
      }

      this.messages.push(this.createMessage('user', this.currentMessage));

      this.messages.push(
        this.createMessage('agent-process', agentProcessLorem, {
          title: 'Agent Process',
          isOpen: true,
        }),
      );

      this.messages.push(this.createMessage('assistant', assistantReply));

      this.currentMessage = '';
    },

    toggleProcess(messageId) {
      const target = this.messages.find(msg => msg.id === messageId);

      if (!target) {
        return;
      }

      target.isOpen = !target.isOpen;
    },

    appendToLatestProcess(chunk) {
      const target = [...this.messages]
        .reverse()
        .find(msg => msg.role === 'agent-process');

      if (!target) {
        return;
      }

      target.text += chunk;
    },

    syncScrollAfterRender() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToBottom();
          this.scrollAllOpenProcessesToBottom();
        }, 0);
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
        .filter(message => message.role === 'agent-process' && message.isOpen)
        .forEach(message => {
          this.scrollProcessToBottom(message.id);
        });
    },

    scrollProcessToBottom(messageId) {
      const container = this.$refs[`agentContent-${messageId}`];

      if (!container) {
        return;
      }

      const element = Array.isArray(container) ? container[0] : container;

      element.scrollTop = element.scrollHeight;
    },
  },
};