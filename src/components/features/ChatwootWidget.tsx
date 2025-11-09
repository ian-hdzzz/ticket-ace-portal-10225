
import React, { useEffect } from 'react';

const ChatwootWidget = () => {
  useEffect(() => {
    // Add Chatwoot Settings
    window.chatwootSettings = {
      hideMessageBubble: false, // Changed to false to show the default bubble for debugging
      position: 'right', // This can be 'left' or 'right'
      locale: 'en', // Language to be set
      type: 'standard', // [standard, expanded_bubble]
    };

    const loadChatwoot = () => {
      const BASE_URL = "https://app.chatwoot.com"; // Replace with your Chatwoot instance URL
      const websiteToken = import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN;

      if (!websiteToken) {
        console.error('VITE_CHATWOOT_WEBSITE_TOKEN is not set. The Chatwoot widget will not be loaded.');
        return;
      }

      if (document.getElementById('chatwoot-widget-script')) {
        return;
      }

      const g = document.createElement('script');
      const s = document.getElementsByTagName('script')[0];
      g.id = 'chatwoot-widget-script';
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode.insertBefore(g, s);

      g.onload = function() {
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: websiteToken,
            baseUrl: BASE_URL
          });
        }
      };
    };

    loadChatwoot();

    return () => {
      const chatwootScript = document.getElementById('chatwoot-widget-script');
      if (chatwootScript) {
        chatwootScript.remove();
      }
    };
  }, []);

  return null;
};

export default ChatwootWidget;
