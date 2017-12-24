export interface SaveType {
  element: boolean;
  fullPage: boolean;
  screen: boolean;
}

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
  addressBarShadowPadding: number;
  browserName: string;
  defaultDevicePixelRatio: number;
  platformName: string;
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

export interface SetCustomCssOptions {
  disableCSSAnimation: boolean;
  hideScrollBars: boolean,
  addressBarShadowPadding: number;
  toolBarShadowPadding: number;
}

export interface RequestCurrentInstanceData {
  SAVE_TYPE: SaveType;
  devicePixelRatio: number;
  testInBrowser: boolean;
  nativeWebScreenshot: boolean;
  addressBarShadowPadding: number;
  toolBarShadowPadding: number;
}

export interface CurrentInstanceData extends BrowserData {
  addressBarShadowPadding: number;
  browserName:string;
  deviceName:string
  logName:string
  name:string
  nativeWebScreenshot:boolean;
  platformName:string;
  testInBrowser:boolean;
  toolBarShadowPadding: number;
}
