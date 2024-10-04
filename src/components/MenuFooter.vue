<template>
  <div class="footer">
    <span>{{ currentFPS.toFixed(1) }} FPS</span>
    <span>
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
const { currentFPS } = useRendererFPSMeasure();
</script>

<style lang="scss" scoped>
.footer {
  border-top: 1px solid rgba(127, 127, 127, 0.5);
}
</style>
