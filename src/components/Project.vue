<template>
  <v-container>
    <div v-if="content_loading" class="text-xs-center">
      <v-progress-circular
        indeterminate
        color="blue-grey"
      ></v-progress-circular>
    </div>
    <v-layout
      v-if="project.hasOwnProperty('name')"
      text-xs-center
      row
      wrap
    >
      <!-- Title Bar -->
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
            <link-share :linkto="'http://localhost:8080/#/project/' + link"></link-share>
            <v-spacer></v-spacer>
            <v-btn title="Save" @click="saveProject" icon><v-icon>save</v-icon></v-btn>
            <v-btn title="Download" @click="downloadProject" icon><v-icon>save_alt</v-icon></v-btn>

          </v-card-title>

        </v-card>
      </v-flex>

      <!-- Left Panel -->
      <v-flex xs12 md4 class="mt-4">
        <translate :lang="project.endLang.toLowerCase()" :text="currentText" :dev="false"></translate>
        <rules :id="project.id"></rules>
        <chat :link="link"></chat>
      </v-flex>

      <!-- Right Panel (Project) -->
      <v-flex xs12 md8>
        <v-container>
          <v-layout text-xs-center row wrap>
            <v-flex xs12>
              <!-- Pack -->
              <v-card
                v-for="indexPack in (page == nbPages ? (nbPacks % packPerPage ? nbPacks % packPerPage : packPerPage) : packPerPage)"
                :class="{'confirmedPack': confirmedPacks.includes(indexPack + (page - 1)*packPerPage),'lockedPack': lockedPacks.includes(indexPack + (page - 1)*packPerPage), 'validPack': validPacks.includes(indexPack + (page - 1)*packPerPage)}"
                :key="'pack-' + (indexPack + (page - 1)*packPerPage)"
                :ref="'pack-' + (indexPack + (page - 1)*packPerPage)"
                class="mb-4"
              >
                <!-- Element -->
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
                    <!-- Highlighted text -->
                    <span class="headline" v-html="highlightRules(source.content, rules, rules.map(e=>(e.startWord)))"></span>

                    <v-textarea
                      id="tabarea"
                      :disabled="confirmedPacks.includes(indexPack + (page - 1)*packPerPage) || lockedPacks.includes(indexPack + (page - 1)*packPerPage)"
                      :ref="'tab-'+source.index"
                      @keydown.enter="onEnter(source.index, $event)"
                      @focus="onFocus(source.index)"
                      @focusout="onLooseFocus(source.index)"
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

                <!-- Pack Controls -->
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn :disabled="!validPacks.includes(indexPack + (page - 1)*packPerPage)" @click="confirmPack(indexPack + (page - 1)*packPerPage)" icon large>
                    <v-icon large>{{confirmedPacks.includes(indexPack + (page - 1)*packPerPage) ? 'check_circle' : 'playlist_add_check'}}</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>

              <!-- Pagination -->
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
  import Chat from "./project/Chat"
  import LinkShare from "./project/LinkShare"
  import {jsonToSrt, highlightRules} from "./tools/parsing.js"
  import { saveAs } from 'file-saver'

  export default {
    props: ['link'],
    data: () => ({
      content_loading: false,
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
    mounted() {
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
      highlightRules: highlightRules,
      saveProject() {
        axios.post('http://localhost:3000/saveproject', {
          id: this.project.id,
          link: this.link,
          json: this.jsonEnd,
        }).then(response => {
          if (response.data) {
            this.$socket.emit("saved")
          } else {
            //
          }
        })
      },
      downloadProject() {
        if (this.project.type == "SRT") {
          let blob = new Blob([jsonToSrt(this.jsonEnd)], {type: "application/x-subrip"})
          saveAs(blob, this.project.name + ".srt")
        }
      },
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
      onLooseFocus(index) {
        this.$nextTick(() => {
          if (document.activeElement.id != "tabarea") {
            this.$socket.emit("packUnlocked", {pack: this.currentPack})
            this.currentPack = 0
          }
        })
        this.$socket.emit("updateJson", {index: index , content: this.jsonEnd[index - 1].content})
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
        this.content_loading = true
        if (this.link) {
          axios.get('http://localhost:3000/project/' + this.link).then(response => {
            this.content_loading = false
            if (response.data) {
              this.$socket.emit('join-room', this.link)
              this.packLength = response.data.project.packLength
              this.rules = response.data.rules
              this.jsonStart = response.data.jsonStart
              this.jsonEnd = response.data.jsonEnd
              this.project = response.data.project
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
      getState: function (data) {
        this.lockedPacks = data.packs.locked
        this.validPacks = data.packs.valid
        this.confirmedPacks = data.packs.confirmed
        if ('updates' in data) {
          Object.keys(data.updates).map((key) => {
            this.jsonEnd[key - 1].content = data.updates[key]
          })
        }
      },
      updateWriting: function (params) {
        this.jsonEnd[params.index - 1].content = params.content
      },
      packLocked: function (indexPack) {
        if (!this.lockedPacks.includes(indexPack))
          this.lockedPacks.push(indexPack)
      },
      packUnlocked: function (indexPack) {
        if (this.lockedPacks.includes(indexPack))
          this.lockedPacks.splice(this.lockedPacks.indexOf(indexPack), 1)
      },
      addRule: function () {
        axios.get('http://localhost:3000/rules/', {params: {id: this.project.id}}).then(response => {
          if (response.data) {
            this.rules = response.data
          }
        })
      }
    },
    watch: {
      clickPack() {
        if (this.clickPack != 0) {
          this.page = parseInt(this.clickPack / this.packPerPage) + (this.clickPack % this.packPerPage ? 1 : 0)
          this.$nextTick(() => {
            this.$vuetify.goTo(this.$refs["pack-"+this.clickPack][0].$el, {duration: 50, offset: -100})
          })
        }
      },
      '$route' (to, from) {
        if (to.query && to.query.anchor) {
          if (to.query.anchor >= 1 && to.query.anchor <= this.jsonStart.length) {
            this.page = this.getPage(parseInt(to.query.anchor))
            this.$nextTick(() => {
              this.$vuetify.goTo(this.$refs["tab-"+to.query.anchor][0].$el, {duration: 50, offset: -220})
            })
          }
        }
      }
    },
    components: {
      'translate': Translate,
      'validate-navigation': ValidateNavigation,
      'rules': Rules,
      'chat': Chat,
      'link-share': LinkShare,
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
