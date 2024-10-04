<template>
  <div class="leftmenu">
    <div class="icons">
      <div v-for="panel in panels.leftPanels" :key="panel.uuid"
        :class="{ selected: layout.state.leftPanelSelected === panel.uuid }" class="icon" :title="panel.title"
        @click="toggle(panel.uuid)">
        <component :is="panel.icon.component" v-bind="panel.icon.props" />
      </div>
    </div>
    <div v-if="selectedItem" ref="panelRef" class="panel" :style="{ width: `${layout.state.leftPanelWidth}px` }">
      <div class="panel-title">
        {{ selectedItem.title }}
      </div>
      <component :is="selectedItem.component" />
    </div>
    <div v-if="selectedItem" class="sizer" :class="{ grabbed: sizerGrabbed }" @mousedown="sizerMousedown" />
  </div>
</template>

<script setup lang="ts">
const panels = usePanels();

const selectedItem = computed(() => panels.leftPanels.find(p => p.uuid === layout.state.leftPanelSelected));
const layout = useUILayout();

const panelRef = ref<HTMLElement>();
const sizerGrabbed = ref(false);

const toggle = (uuid: string) => {
  if (layout.state.leftPanelSelected === uuid) {
    layout.state.leftPanelSelected = undefined;
  } else {
    layout.state.leftPanelSelected = uuid;
  }
};

const sizerMousedown = (ev: MouseEvent) => {
  const offset = ev.clientX - (panelRef.value?.getBoundingClientRect()?.right ?? 0);
  const move = (ev: MouseEvent) => {
    if (ev.buttons === 1) {
      const rect = panelRef.value?.getBoundingClientRect();
      if (rect) {
        console.log(offset, rect.right, ev.clientX + offset);
        layout.setLeftPanelWidth(ev.clientX + offset - rect.left);
      }
    } else {
      document.removeEventListener('mousemove', move);
      sizerGrabbed.value = false;
    }
  };
  if (ev.buttons === 1) {
    document.addEventListener('mousemove', move);
    sizerGrabbed.value = true;
  }
};

</script>

<style lang="scss" scoped>
.leftmenu {
  display: grid;
  grid-template-columns: auto auto;
  position: relative;

  .icons,
  .panel {
    border-right: 1px solid rgba(127, 127, 127, 0.5);
  }

  .icon {
    cursor: pointer;
    box-sizing: border-box;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;

    width: 48px;
    height: 48px;
    text-align: center;

    position: relative;

    >* {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &.selected {
      border-left: 4px solid #0078d4;
    }
  }

  .sizer {
    width: 4px;
    position: absolute;
    right: -2px;
    width: 4px;
    top: 0;
    bottom: 0;
    cursor: ew-resize;
    z-index: 1;

    background: transparent;

    &.grabbed,
    &:hover {
      background: #0078d4;
    }
  }
}
</style>

<!-- <div>
        Mode▼
        <div>Pose</div>
        <div>Animation</div>
        <div>Interop</div>
        <div>Scene</div>
    </div> -->
