<template>
  <v-card class="my-3">
    <v-card-title primary-title>
      <h3 class="headline mb-0">Add a rule</h3>
    </v-card-title>
    <div class="mx-5">
      <v-text-field
        v-model="wordFrom"
        label="This word"
        solo
      ></v-text-field>
      <v-icon class="mt-0 mb-2">arrow_downward</v-icon>
      <v-text-field
        v-model="wordTo"
        label="Have to be translated by"
        outline
      ></v-text-field>
    </div>
    <v-btn color="secondary" class="mb-3" small @click="submit">Add</v-btn>
  </v-card>
</template>

<script>
  import axios from 'axios'

  export default {
    props: ['id'],
    data: () => ({
      wordFrom: '',
      wordTo: '',
    }),
    methods: {
      submit() {
        axios.post('http://localhost:3000/addrule', {
          id: this.id,
          startWord: this.wordFrom,
          endWord: this.wordTo,
        }).then(response => {
          if (response.data) {
            this.wordFrom = "",
            this.wordTo = "",
            this.$socket.emit("addRule")
          } else {
            console.log("failed")
          }
        })
      }
    }
  }
</script>

<style scoped>
</style>
