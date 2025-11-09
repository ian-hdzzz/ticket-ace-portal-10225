
export {};

declare global {
  interface Window {
    chatwootSettings: {
      hideMessageBubble?: boolean;
      position?: 'left' | 'right';
      locale?: string;
      type?: 'standard' | 'expanded_bubble';
    };
    chatwootSDK: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
      toggle: () => void;
    };
    $chatwoot?: {
      toggle: (state?: 'open' | 'close') => void;
      toggleBubbleVisibility?: (state?: 'show' | 'hide') => void;
      setLabel?: (label: string) => void;
      removeLabel?: (label: string) => void;
      setCustomAttributes?: (attributes: Record<string, any>) => void;
    };
  }
}
