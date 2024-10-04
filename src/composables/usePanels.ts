
export const usePanels = () => {
  const leftPanels = useState(() => [
    '01439aa1-551e-4cd4-835d-ccb5121a6563',
  ]);

  const definitions = usePanelDefinitions();
  return {
    leftPanels: computed(() => leftPanels.value.map(uuid => {
      return { ...definitions[uuid], uuid };
    })).value,
  };
};
