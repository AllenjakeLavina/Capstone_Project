<template>
  <section>
    <h2>Terms and Conditions</h2>
    <TermsText />
  </section>
</template>

<script>
import TermsText from './TermsText.vue'

export default {
  name: 'TermsSettings',
  components: { TermsText }
}
</script>

<style scoped>
h2 {
  margin: 0 0 12px 0;
}
</style>


