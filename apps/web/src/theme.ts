import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#4da6e8',
    colorBgLayout: '#f0f7ff',
    colorBgContainer: '#ffffff',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#e8f4fd',
      siderBg: '#ffffff',
    },
    Menu: {
      itemBg: '#ffffff',
    },
  },
};

export default theme;
