<template>
  <v-container v-if="project.hasOwnProperty('name')">
    <v-layout
      text-xs-center
      wrap
    >
      <v-flex xs12 md12>
        <v-card>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>favorite</v-icon>
            </v-btn>
          </v-card-actions>

          <v-card-title primary-title>
            <div>
              <div class="headline">{{project.name}}</div>
              <span class="grey--text">[{{project.type}}] : {{project.startLang}} => {{project.endLang}}</span>
            </div>
          </v-card-title>
        </v-card>
        <v-btn @click="tryit">TRY</v-btn>
      </v-flex>

      <v-flex xs12 md8>
        <v-container>
          <v-layout text-xs-center>
            <v-flex xs12 md8>
              <v-card
               v-for="indexPack in (parseInt(jsonStart.length / 10) + (jsonStart.length % 10 ? 1 : 0))"
               :key="'pack-' + indexPack"
              >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn icon>
                    <v-icon>favorite</v-icon>
                  </v-btn>
                </v-card-actions>
                <div
                  v-for="(source, index) in jsonStart.slice((indexPack-1)*10, (indexPack-1)*10 + 10)"
                  :key="indexPack*10 + index"
                >
                  <v-card-title primary-title>
                    <div>
                      <div class="headline">{{source.index}}</div>
                      <span class="grey--text">{{source.start}} => {{source.end}}</span>
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <p v-for="(content, key) in source.content" :key="'p-'+key">{{content}}</p>
                  </v-card-text>
                </div>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import axios from "axios"

  export default {
    props: ['link'],
    data: () => ({
      project: {},
      rules: [],
      jsonStart: [],
      jsonEnd: [],
    }),
    beforeMount() {
      this.getJsonFile()
    },
    methods: {
      getJsonFile() {
        if (this.link) {
          axios.get('http://localhost:3000/project/' + this.link).then(response => {
            if (response.data) {
              this.$socket.emit('join-room', this.link)
              this.rules = response.data.rules
              this.jsonStart = response.data.jsonStart
              this.jsonEnd = response.data.jsonEnd
              this.project = response.data.project
              console.log(this.project, this.rules, this.jsonStart, this.jsonEnd)
            } else {
              this.$router.push('/')
            }
          })
        } else {
          this.$router.push('/')
        }
      },


      tryit () {
        this.$socket.emit('message', this.link)
      }
    },
    sockets: {
      try: function (send) {
        console.log("WORKING   " + send)
      }
    }
  }
</script>

<style>

</style>
