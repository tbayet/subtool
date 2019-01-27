<template>
  <v-container v-if="project.hasOwnProperty('name')">
    <v-layout
      text-xs-center
      row
      wrap
    >
      <v-flex xs12 md12>
        <v-card>
          <v-card-actions>
            <validate-navigation v-model="clickPack" :locked="lockedPacks" :valid="validPacks" :confirmed="confirmedPacks" :totalPacks="nbPacks"></validate-navigation>           
          </v-card-actions>

          <v-card-title primary-title>
            <div>
              <div class="headline">{{project.name}}</div>
              <span class="grey--text">[{{project.type}}] : {{project.startLang}} => {{project.endLang}}</span>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon><v-icon>save</v-icon></v-btn>
            <v-btn icon><v-icon>save_alt</v-icon></v-btn>
          </v-card-title>
        </v-card>
      </v-flex>

      <v-flex xs12 md4 class="mt-4">
        <translate :lang="project.endLang.toLowerCase()" :text="currentText" :dev="true"></translate>
        <rules></rules>
      </v-flex>

      <v-flex xs12 md8>
        <v-container>
          <v-layout text-xs-center row wrap>
            <v-flex xs12 md8>
              <v-card
                v-for="indexPack in (page == nbPages ? (nbPacks % packPerPage ? nbPacks % packPerPage : packPerPage) : packPerPage)"
                :class="{'confirmedPack': confirmedPacks.includes(indexPack + (page - 1)*packPerPage),'lockedPack': lockedPacks.includes(indexPack + (page - 1)*packPerPage), 'validPack': validPacks.includes(indexPack + (page - 1)*packPerPage)}"
                :key="'pack-' + (indexPack + (page - 1)*packPerPage)"
                :ref="'pack-' + (indexPack + (page - 1)*packPerPage)"
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
                      :disabled="confirmedPacks.includes(indexPack + (page - 1)*packPerPage) || lockedPacks.includes(indexPack + (page - 1)*packPerPage)"
                      :ref="'tab-'+source.index"
                      @keydown.enter="onEnter(source.index, $event)"
                      @focus="onFocus(source.index)"
                      @input="onInput(source.index)"
                      style="text-align: justify; text-align-last: center;"
                      :outline="!lockedPacks.includes(indexPack + (page - 1)*packPerPage && !confirmedPacks.includes(indexPack + (page - 1)*packPerPage))"
                      v-model="jsonEnd[source.index - 1].content"
                      auto-grow
                      single-line
                      rows="1"
                    ></v-textarea>
                  </v-card-text>
                </div>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn :disabled="!validPacks.includes(indexPack + (page - 1)*packPerPage)" @click="confirmPack(indexPack + (page - 1)*packPerPage)" icon large>
                    <v-icon large>{{confirmedPacks.includes(indexPack + (page - 1)*packPerPage) ? 'check_circle' : 'playlist_add_check'}}</v-icon>
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
  import Translate from "./project/Translate"
  import ValidateNavigation from "./project/ValidateNavigation"
  import Rules from "./project/Rules"

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
      clickPack: 0,
      currentText: "",
      validPacks: [],
      confirmedPacks: [],
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
      confirmPack(index) {
        if (this.confirmedPacks.includes(index) || this.validPacks.includes(index))
          this.$socket.emit("setConfirmedPack", {index})
      },
      isValidPack(index) {
        let valid = true
        this.jsonEnd.slice((index - 1) * this.packLength, (index) * this.packLength).forEach(e => {
          if (!e.content.length) {
            e.valid = false
            valid = false
          }
          else {
            e.valid = true
          }
        })
        if (this.validPacks.includes(index) != valid) {
          this.$socket.emit("setValidPack", {index, isValid: valid})
        }
        return valid;
      },
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
        this.currentText = this.jsonStart[index - 1].content
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
          this.isValidPack(this.getPack(index))
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
      confirmedPack: function (confirmed) {
        this.confirmedPacks = confirmed
      },
      validPack: function (valid) {
        this.validPacks = valid
      },
      getState: function (packs) {
        this.lockedPacks = packs.locked
        this.validPacks = packs.valid
        this.confirmedPacks = packs.confirmed
        console.log(packs)
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
    },
    watch: {
      clickPack() {
        if (this.clickPack != 0) {
          this.page = parseInt(this.clickPack / this.packPerPage) + (this.clickPack % this.packPerPage ? 1 : 0)
          this.$nextTick(() => {
            this.$vuetify.goTo(this.$refs["pack-"+this.clickPack][0].$el, {duration: 50, offset: -100})
          })
        }
        console.log(this.jsonEnd, this.jsonStart)
      }
    },
    components: {
      'translate': Translate,
      'validate-navigation' : ValidateNavigation,
      'rules' : Rules,
    }
  }
</script>

<style scoped>
  .lockedPack {
    color: #B0BEC5;
  }
  .validPack {
    background-color: rgb(252, 231, 198) !important;
  }
  .confirmedPack * {
    color: rgb(67, 116, 67) !important;
    background-color: rgb(210, 255, 210) !important;
  }
</style>
