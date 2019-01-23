<template>
  <v-container>
    <v-layout
      text-xs-center
      wrap
    >
      <v-flex xs12>
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        ></v-img>
      </v-flex>

      <v-flex xs-10 sm-10 md-6>
        <h1 class="display-2 font-weight-bold mb-3">
          Create a project
        </h1>

        <center><div class="mb-4" v-if="file_selected.length" style="width:300px;text-align:left;color: grey;">{{file_preview}}</div></center>
        <v-text-field v-if="!file_json" label="Select a file (.srt)" @click='browse' v-model='file_name' prepend-icon='attach_file'></v-text-field>
        <input
          type="file"
          style="display: none"
          ref="file_input"
          accept="*"
          @change="validateFile"
        >
        <v-btn v-if="!file_json" :disabled="!file_selected" @click="addFile" color="primary">Start</v-btn>

        <v-form  v-if="file_json" ref="project_form" v-model="form_valid" lazy-validation>
          <v-text-field
            v-model="project_name"
            :rules="rules.name"
            label="Project name"
          ></v-text-field>
          <v-radio-group label="Project privacy" v-model="project_privacy">
            <v-radio color="primary" label="Public" value="1"></v-radio>
            <v-radio color="error" label="Private" value="2"></v-radio>
          </v-radio-group>
          <v-text-field
            v-model="project_startLang"
            :rules="rules.lang"
            label="Language from"
          ></v-text-field>
          <v-text-field
            v-model="project_endLang"
            :rules="rules.lang"
            label="Language to"
          ></v-text-field>
          <v-btn color="primary" @click.native="formSubmit">Create</v-btn>
        </v-form>
        <v-alert transition="scale-transition" outline :value="!!alert.type" :type="alert.type">{{alert.message}}</v-alert>
      </v-flex>

      <v-flex xs-10 sm-10 md-6>
        <h1 class="display-2 font-weight-bold mb-3">
          Join a project
        </h1>
        <p class="subheading font-weight-regular">
          For help and collaboration with other Vuetify developers,
          <br>please join our online
          <a href="https://community.vuetifyjs.com" target="_blank">Discord Community</a>
        </p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import {srtToJson} from "./tools/parsing.js"
  import axios from "axios"

  export default {
    data: () => ({
      form_valid: true,
      file_selected: "",
      file_preview: "",
      file_name: '',
      alert: {},
      file_json: null,
      project_name: "",
      project_privacy: "1",
      project_startLang: "EN",
      project_endLang: "FR",
      rules: {
        name: [
          v => (!v || (v && v.length >= 4 && v.length <= 50)) || 'This must be between 4 and 50 characters',
        ],
        lang: [
          v => (!v || (v && v.length == 2)) || 'Lang uses Alpha-2 country code (ex: FR, EN, ...)',
        ],
      }
    }),
    methods: {
      browse() {
        this.$refs.file_input.click()
      },
      addFile() {
        this.alert = {}
        const res = srtToJson(this.file_selected)
        if (res.error) {
          this.alert = {
            type: 'error',
            message: res.message,
          }
        } else {
          this.project_name = this.file_name.substr(0, this.file_name.length - 4)
          this.file_json = res.data
        }
        this.cleanField()
      },
      cleanField() {
        this.$refs.file_input.value = null
        this.file_selected = ""
        this.file_name = ''
      },
      validateFile(e) {
        this.alert = {}
        const file = e.target.files[0]

        const fr = new FileReader()
        this.file_name = file.name
        fr.onloadend = () => {
          //console.log("type: ", file)
          if (file.type == "" && file.name.substr(-4, 4).toLowerCase() == ".srt") {
            this.file_selected = fr.result
            this.file_preview = this.file_selected.substr(0, 300) + "..."
          } else {
            this.alert = {
              type: 'error',
              message: "Wrong format (expected an .srt)",
            }
            this.cleanField()
          }
        }
        fr.readAsText(file, "UTF-8")
      },
      formSubmit() {
        this.alert = {}
        if (this.$refs.project_form.validate()) {
          axios.post('http://localhost:3000/createproject', {
            name: this.project_name,
            privacy: this.project_privacy,
            file: this.file_json,
            type: "srt"
          }).then(response => {
            if (response.data) {
              // REDIRECTION TO THE PROJECT => THEN CREATE USERNAME + SOCKET
            } else {
              this.alert = {
                type: 'error',
                message: "Invalid entries"
              }
            }
          })
        } else {
          this.alert = {
            type: 'error',
            message: "Invalid entries"
          }
        }
      }
    }
  }
</script>

<style>

</style>
