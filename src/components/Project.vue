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
      </v-flex>

      <v-flex xs12 md8>
        <v-container>
          <v-layout text-xs-center>
            <v-flex xs12 md8>
              <v-card
                v-for="indexPack in (packPerPage)"
                :class="lockedPacks.includes(indexPack + (page - 1)*packPerPage) ? 'lockedPack' : ''"
                :key="'pack-' + (indexPack + (page - 1)*packPerPage)"
              >
                <div
                  v-for="(source) in jsonStart.slice(startIndex(indexPack), endIndex(indexPack))"
                  :key="source.index"
                >
                  <v-card-title primary-title>
                      <span>{{source.index}}</span>
                      <v-spacer></v-spacer>
                      <span class="grey--text">{{source.start}} => {{source.end}}</span>
                  </v-card-title>
                  <v-card-text :class="lockedPacks.includes(indexPack + (page - 1)*packPerPage) ? 'lockedPack' : ''">
                    <span class="headline" v-for="(content, key) in source.content" :key="'p-'+key">{{content}}</span>
                    <v-textarea
                      :disabled="lockedPacks.includes(indexPack + (page - 1)*packPerPage)"
                      :ref="'tab-'+source.index"
                      @keydown.enter="onEnter(source.index, $event)"
                      @focus="onFocus(source.index)"
                      @input="onInput(source.index)"
                      style="text-align: justify; text-align-last: center;"
                      :outline="!lockedPacks.includes(indexPack + (page - 1)*packPerPage)"
                      v-model="jsonEnd[source.index - 1].content"
                      auto-grow
                      single-line
                      rows="1"
                    ></v-textarea>
                  </v-card-text>
                </div>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn icon>
                    <v-icon>favorite</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
              <div class="text-xs-center">
                <v-pagination
                  v-model="page"
                  :length="nbPages"
                  circle
                  :total-visible="7"
                ></v-pagination>
              </div>
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
      page: 1,
      project: {},
      rules: [],
      jsonStart: [],
      jsonEnd: [],
      packLength: 10,
      lockedPacks: [],
      currentPack: 0,
    }),
    beforeMount() {
      this.getJsonFile()
    },
    computed: {
      packPerPage () {
        return (parseInt(100 / this.packLength))
      },
      nbPacks () {
        return (parseInt(this.jsonStart.length / this.packLength) + (this.jsonStart.length % this.packLength ? 1 : 0))
      },
      nbPages () {
        return (parseInt(this.jsonStart.length / (this.packPerPage * this.packLength)) + (this.jsonStart.length % (this.packPerPage * this.packLength) ? 1 : 0))
      }
    },
    methods: {
      getPack(index) {
        return (parseInt(index / this.packLength) + (index % this.packLength ? 1 : 0))
      },
      getPage(index) {
        if (index === null)
          return this.page
        let pack = this.getPack(index)
        return (parseInt(pack / this.packPerPage) + (pack % this.packPerPage ? 1 : 0))
      },
      onInput(index) {
        this.$socket.emit("updateWriting", {index, content: this.jsonEnd[index - 1].content})
      },
      onFocus(index) {
        let pack = this.getPack(index)
        if (pack != this.currentPack){
          this.$socket.emit("packUnlocked", {pack: this.currentPack})
          this.$socket.emit("packLocked", {pack: pack})
          this.currentPack = pack
        }
      },
      getNextTabIndex(index) {
        const saveIndex = index
        while (this.lockedPacks.includes(this.getPack(index))) {
          if (this.getPack(index) == this.nbPacks)
            index = 1
          else
            index += this.packLength
          if (index == saveIndex)
            return null
        }
        return index
      },
      onEnter(index, e){
        if (!e.shiftKey) {
          e.preventDefault()
          e.stopPropagation()
          if (this.getPack(index + 1) != this.currentPack){
            const nextIndex = this.getNextTabIndex(this.getPack(index) == this.nbPacks ? 1 : index + 1)
            this.page = this.getPage(nextIndex)
            this.$nextTick(() => {
              if (nextIndex !== null)
                this.$refs["tab-" + (nextIndex)][0].focus()
            })
          } else {
            this.$refs["tab-" + (index + 1)][0].focus()
          }         
        }
      },
      startIndex(indexPack) {
        return ((indexPack-1 + (this.page - 1) * this.packPerPage) * this.packLength)
      },
      endIndex(indexPack) {
        return (this.startIndex(indexPack) + this.packLength)
      },
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
    },
    sockets: {
      getState: function (lockedPacks) {
        console.log("GetState", lockedPacks)
        this.lockedPacks = lockedPacks
      },
      updateWriting: function (params) {
        this.jsonEnd[params.index - 1].content = params.content
      },
      packLocked: function (indexPack) {
        if (!this.lockedPacks.includes(indexPack))
          this.lockedPacks.push(indexPack)
        console.log(this.lockedPacks)
      },
      packUnlocked: function (indexPack) {
        if (this.lockedPacks.includes(indexPack))
          this.lockedPacks.splice(this.lockedPacks.indexOf(indexPack), 1)
        console.log(this.lockedPacks)
      },
    }
  }
</script>

<style>
  .lockedPack {
    color: #B0BEC5;
  }
</style>
