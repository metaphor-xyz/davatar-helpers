// .storybook/manager.js
import { addons } from '@storybook/addons';

addons.setConfig({
  isFullscreen: false,
  showNav: false,
  showPanel: false,
  panelPosition: 'bottom',
  enableShortcuts: true,
  showToolbar: false,
  theme: undefined,
  selectedPanel: undefined,
  initialActive: 'sidebar',
  sidebar: {
    showRoots: false,
    collapsedRoots: ['other'],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
