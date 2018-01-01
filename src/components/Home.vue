<template>
 <div>
    <div class="layout-padding">
      <div v-if="!authenticated">
        <div class="column items-center">
          <div class="auto">
            <h3>
              <router-link to="/signin">Sign In</router-link> or <router-link to="/register">Register</router-link> , if your time to you is worth savin'
            </h3>
          </div>
        </div>
	</div>
</div>
</div>

</template>

<script>
export default {
  data () {
    return {}
  },
  computed: {
    authenticated () {
      return this.$data.user !== null
    }
  }
}
</script>

<style>
</style>
