import { useEffect } from 'react';

const TawkToWidget = () => {
  useEffect(() => {
    // Check if script is already injected to prevent duplicates
    if (document.getElementById('tawk-to-script')) return;

    // Define Tawk_API global if not exists
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = 'tawk-to-script';
    script.async = true;
    script.src = 'https://embed.tawk.to/6966912ad4544a1985f32b56/1hh2gm5ql';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

  }, []);

  return null;
};

export default TawkToWidget;