export const useRendererFPSMeasure = () => {
  const state = useState(() => ({
    measure: [] as number[],
    currentFPS: NaN,
  }));

  return {
    currentFPS: computed(() => state.value.currentFPS),
    pushFrame: () => {
      state.value.measure.push(performance.now());
      if (state.value.measure[0] + 1000 < state.value.measure.slice(-1)[0]) {
        state.value.currentFPS = 1000 / ((state.value.measure.slice(-1)[0] - state.value.measure[0]) / (state.value.measure.length - 1));
        state.value.measure = [state.value.measure.slice(-1)[0]];
      }
    },
  };
};
