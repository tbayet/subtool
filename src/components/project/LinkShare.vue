<template>
<div>
    <v-chip @click="copyLink()" id="link_chip" color="secondary" text-color="white" >
      <v-avatar>
        <v-icon>file_copy</v-icon>
      </v-avatar>
      {{".." + linkto.substr(parseInt(linkto.length / 3), parseInt(linkto.length / 3) + 12) + ".." }}
      <v-tooltip nudge-left="150px" nudge-bottom="10px" v-model="copied" bottom>
        <span slot="activator"></span>
        <span>Link copied !</span>
      </v-tooltip>
    </v-chip>
</div>
</template>

<script>
  import axios from 'axios'

  export default {
    props: ['linkto'],
    data: () => ({
      copied: false,
    }),
    methods: {
     copyLink () {
        var el = document.createElement('textarea')
        el.value = this.linkto
        el.setAttribute('readonly', '')
        el.style = {position: 'absolute', left: '-9999px'}
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        this.copied = true
        setTimeout(() => {
          this.copied = false
        }, 3000)
      },
    },
  }
</script>

<style scoped>
</style>
