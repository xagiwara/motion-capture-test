<template>
  <span :class="clz" :style="{
    'font-variation-settings': `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
  }">{{ props.name }}</span>
</template>

<script lang="ts" setup>
const props = defineProps<{
  name: string;
  symbolStyle?: 'outlined' | 'rounded' | 'sharp';
  fill?: boolean;
}>();

const symbolStyle = computed(() => {
  return props.symbolStyle || 'outlined';
});

const fill = computed(() => {
  return (props.fill || false) ? 1 : 0;
});

const clz = computed(() => {
  return `material-symbols-${symbolStyle.value}`;
});
</script>
