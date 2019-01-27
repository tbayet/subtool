<template>
  <div class="container">
    <div
      v-for="index in (totalPacks)"
      :key="index"
      :class="{'selected': index == displayValue, 'default': true, 'locked': locked.includes(index) && !valid.includes(index), 'confirmed': confirmed.includes(index), 'valid': valid.includes(index) && !confirmed.includes(index)}"
      @click="selectItem(index)"
    >
    </div>
  </div>
</template>

<script>
  export default {
    props: ['value', 'locked', 'valid', 'confirmed', 'totalPacks'],
    data: () => ({
      displayValue: '',
    }),
    mounted() {
      this.displayValue = this.value
    },
    watch: {
      value() {
        this.displayValue = this.value
      }
    },
    methods: {
      selectItem(index) {
        this.$emit('input', index);
      }
    }
  }
</script>

<style scoped>
  .selected {
    border: solid 2px black;
    border-right: solid 2px black !important;
  }
  .locked {
    background-color: rgb(210, 0, 0) !important;
  }
  .confirmed {
    background-color: rgb(34, 206, 0) !important;
  }
  .valid {
    background-color: rgb(255, 191, 0) !important;
  }
  .default {
    background-color: rgb(255, 255, 255);
    flex: 1;
    height: 18px;
    border-right: dashed 1px black;
  }
  .container {
    cursor: pointer;
    display: flex;
    margin: 0;
    padding: 0;
    height: 20px;
    border: solid 1px black;
  }
</style>
