export interface SaveScreenOptions {
  disableCSSAnimation: boolean;
  hideScrollBars: boolean;
}

export interface Rectangles {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BrowserData {
  browserHeight: number;
  browserWidth: number;
  devicePixelRatio: number;
  fullPageHeight: number;
  fullPageWidth: number;
  viewPortHeight: number;
  viewPortWidth: number;
}

export interface RequestBrowserData {
  browserName: string;
  platformName: string;
  defaultDevicePixelRatio: number;
  addressBarShadowPadding: number;
  toolBarShadowPadding: number;
}

export interface SaveCroppedScreenshotOptions {
  browserHeight: number;
  browserName: string;
  browserWidth: number;
  bufferedScreenshot: Buffer;
  deviceName: string;
  devicePixelRatio: number;
  folder: string;
  formatString: string;
  isMobile: boolean;
  name: string;
  logName: string;
  rectangles: Rectangles;
  tag: string;
  testInBrowser: boolean;
}
