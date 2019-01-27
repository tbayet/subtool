<template>
  <v-card dark style="height:100px">
    <v-textarea
      style="text-align: justify; text-align-last: center;"
      disabled
      height="100px"
      v-model="translated"
      box
      label="Translated from Yandex"
    ></v-textarea>
  </v-card>
</template>

<script>
  import axios from "axios"

  export default {
    props: ['lang', 'text', 'dev'],
    data: () => ({
      translated: "",
    }),
    mounted() {
      if (this.text && this.lang && this.text.length && this.lang.length) {
        this.translate()
      }
    },
    watch: {
      text: function (val) {
        if (this.text && this.lang && this.text.length && this.lang.length) {
          this.translate()
        }
      }
    },
    methods: {
      translate() {
        if (this.dev == true) {
          this.translated =  this.text
        } else {
          axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate', { params: {
                key: "trnsl.1.1.20161229T041736Z.65dd058529799b6b.cd475f6e9c57bd9632ed3b86bcca91c9fff3b0db",
                text: this.text, // this.jsonStart[index].content,
                lang: this.lang, // this.project.endLang.toLowerCase(),
              }
            }, {
            headers: {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          }).then(response => {
            if (response.data) {
              this.translated = response.data.text[0]
            }
          })
        }
      }
    }
  }
</script>

<style>
</style>
