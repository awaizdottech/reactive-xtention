// Type definitions for Chrome extension APIs
declare namespace Chrome {
  interface Message {
    type: string;
    payload?: any;
  }

  interface MessageResponse {
    success: boolean;
    data?: any;
    error?: string;
  }

  interface TabInfo {
    id: number;
    title: string;
    pathname: string;
    url: string;
    windowId: number;
  }
}

export type ChromeMessage = Chrome.Message;
export type ChromeMessageResponse = Chrome.MessageResponse;
export type ChromeTabInfo = Chrome.TabInfo;
