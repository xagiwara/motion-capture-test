const sidePanelMinWidth = 160;
const bottomPanelMinHeight = 160;
const contentMinWidth = 320;
const contentMinHeight = 320;

export const useUILayout = () => {
  const state = ref<{
    leftPanelWidth: number;
    rightPanelWidth: number;
    bottomPanelHeight: number;
    leftPanelSelected: string | undefined;
    rightPanelSelected: string | undefined;
    bottomPanelSelected: string | undefined;
  }>({
    leftPanelWidth: 240,
    rightPanelWidth: 240,
    bottomPanelHeight: 240,
    leftPanelSelected: undefined,
    rightPanelSelected: undefined,
    bottomPanelSelected: undefined,
  });

  watch(state, value => {
    if (import.meta.client) {
      localStorage.setItem('uiLayout', JSON.stringify(value));
    }
  }, { deep: true });

  const savedString = import.meta.client && localStorage.getItem('uiLayout');
  if (savedString) {
    try {
      state.value = JSON.parse(savedString);
    } catch (ex) {
      console.error(ex);
    }
  }

  return {
    state: state.value,
    setLeftPanelWidth: (width: number) => {
      state.value.leftPanelWidth = Math.min(Math.max(sidePanelMinWidth, width), window.innerWidth - contentMinWidth - state.value.rightPanelWidth);
    },
    setRightPanelWidth: (width: number) => {
      state.value.rightPanelWidth = Math.min(Math.max(sidePanelMinWidth, width), window.innerWidth - contentMinWidth - state.value.leftPanelWidth);
    },
    setBottomPanelHeight: (height: number) => {
      state.value.bottomPanelHeight = Math.min(Math.max(bottomPanelMinHeight, height), window.innerHeight - contentMinHeight);
    },
  };
};
