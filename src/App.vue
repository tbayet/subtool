<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>SubTool</span>
        <span class="font-weight-light"> Coop Translation</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        to="/welcome"
      >
        <span class="mr-2">Home</span>
      </v-btn>
    </v-toolbar>

    <v-content>
      <router-view :key="$route.name"></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      //
    }
  }
}
</script>
