export interface SaveType {
  element: boolean;
  fullPage: boolean;
  screen: boolean;
}

export interface SaveScreenOptions {
  disableCSSAnimation: boolean;
  hideScrollBars: boolean;
}

export interface CheckScreenOptions {
  blockOutStatusBar: boolean;
  blockOut?: BlockOutRectangles[];
  disableCSSAnimation: boolean;
  ignoreAntialiasing: boolean;
  ignoreColors: boolean;
  ignoreTransparentPixel: boolean;
}

export interface BlockOutRectangles {
  x: number,
  y: number,
  height: number,
  width: number
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

export interface FormatFileNameOptions {
  browserName: string;
  deviceName: string;
  devicePixelRatio: number;
  browserHeight: number;
  logName: string;
  isMobile: boolean;
  testInBrowser: boolean;
  name: string;
  tag: string;
  browserWidth: number;
  formatString: string;
}

export interface SaveCroppedScreenshotOptions extends FormatFileNameOptions{
  bufferedScreenshot: Buffer;
  folder: string;
  rectangles: Rectangles;
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
  browserName: string;
  deviceName: string
  logName: string
  name: string
  nativeWebScreenshot: boolean;
  platformName: string;
  testInBrowser: boolean;
  toolBarShadowPadding: number;
}

export interface RequestImageComparisonPaths{
  actualFolder: string;
  baselineFolder: string;
  diffFolder: string;
  fileName: string;
}

export interface ImageComparisonPaths{
  actualImage: string;
  baselineImage: string;
  imageDiffPath: string;
}

export interface RequestImageExistsData{
  actualFolder: string;
  autoSaveBaseline: boolean;
  baselineFolder: string;
  fileName: string;
}
