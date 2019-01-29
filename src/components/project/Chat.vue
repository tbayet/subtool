<template>
  <v-card>
    <v-toolbar color="grey-blue" dark>
      <v-toolbar-title>Chat</v-toolbar-title>
    </v-toolbar>
    <v-form @submit.prevent @keyup.native.enter.prevent="sendMessage">
      <v-text-field
        class="px-3 mt-2"
        v-model="newMessage"
        append-outer-icon="send"
        box
        clearable
        label="Message"
        type="text"
        @click:append-outer="sendMessage"
      >
      </v-text-field>
    </v-form>
    <v-divider></v-divider>
    <div style="height:400px; overflow-y:auto">
      <v-list two-line>
        <template v-for="(message, index) in chat">
          <v-list-tile
            :key="index"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{message.author}}</v-list-tile-title>
              <v-list-tile-sub-title v-html="message.content"></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider :key="'d'+index"></v-divider>
        </template>
      </v-list>
    </div>
  </v-card>
</template>

<script>
  import {parseMessage} from '../tools/parsing.js'

  export default {
    props: ['link'],
    data: () => ({
      newMessage: "",
      chat: [],
    }),
    methods: {
      sendMessage() {
        this.$socket.emit("newMessage", parseMessage(this.newMessage, "http://localhost:8080/#/project/" + this.link))
        this.newMessage = ""
      }
    },
    sockets: {
      newMessage: function (data) {
        this.chat.unshift(data)
      },
    }
  }
</script>

<style scoped>
</style>
