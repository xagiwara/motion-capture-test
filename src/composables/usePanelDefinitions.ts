import MaterialSymbolIcon from '~/components/panel-icons/MaterialSymbolIcon.vue';
import ExplorerPanel from '~/components/panels/ExplorerPanel.vue';

export interface MenuPanelDefinition {
  readonly title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly component: any;
  readonly icon: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly component: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly props: Record<string, any>;
  };
}

export type MenuPanelDefinitions = Record<string, MenuPanelDefinition>;

const menuPanels: MenuPanelDefinitions = {};

export const registerMenuPanels = (...items: (MenuPanelDefinition & { readonly uuid: string })[]) => {
  items.forEach((item) => {
    menuPanels[item.uuid] = item;
  });
};

export const usePanelDefinitions = () => menuPanels;

export const menuPanelIconMaterialSymbol = (name: string, options?: {
  style?: 'outlined' | 'rounded' | 'sharp';
  fill?: boolean;
}) => {
  return {
    component: MaterialSymbolIcon,
    props: {
      name,
      style: options?.style ?? 'outlined',
      fill: options?.fill ?? false,
    },
  };
};


registerMenuPanels({
  title: 'ファイル',
  uuid: '01439aa1-551e-4cd4-835d-ccb5121a6563',
  icon: menuPanelIconMaterialSymbol('file_copy'),
  component: ExplorerPanel,
});
