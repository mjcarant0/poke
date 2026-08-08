// User agent parser to extract OS, browser, device type, resolution, and specs

export interface ParsedUserAgent {
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
}

export function parseUserAgent(uaString: string | null | undefined): ParsedUserAgent {
  if (!uaString) {
    return { browser: 'Unknown', os: 'Unknown', deviceType: 'Desktop' };
  }

  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(uaString)) {
    deviceType = 'Tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(uaString)) {
    deviceType = 'Mobile';
  }

  if (uaString.includes('Firefox/')) {
    browser = 'Firefox';
  } else if (uaString.includes('Edg/')) {
    browser = 'Edge';
  } else if (uaString.includes('Chrome/')) {
    browser = 'Chrome';
  } else if (uaString.includes('Safari/') && !uaString.includes('Chrome')) {
    browser = 'Safari';
  } else if (uaString.includes('OPR/') || uaString.includes('Opera/')) {
    browser = 'Opera';
  }

  if (uaString.includes('Win')) {
    os = 'Windows';
  } else if (uaString.includes('Mac')) {
    os = 'macOS';
  } else if (uaString.includes('X11') || uaString.includes('Linux')) {
    os = 'Linux';
  } else if (uaString.includes('Android')) {
    os = 'Android';
  } else if (uaString.includes('iPhone') || uaString.includes('iPad')) {
    os = 'iOS';
  }

  return { browser, os, deviceType };
}

export function autoDetectCountry(): string {
  if (typeof window === 'undefined') return 'United States';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Manila')) return 'Philippines';
    if (tz.includes('Tokyo')) return 'Japan';
    if (tz.includes('Singapore')) return 'Singapore';
    if (tz.includes('Kolkata') || tz.includes('Calcutta')) return 'India';
    if (tz.includes('Berlin') || tz.includes('Frankfurt')) return 'Germany';
    if (tz.includes('London')) return 'United Kingdom';
    if (tz.includes('Paris')) return 'France';
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return 'Australia';
    if (tz.includes('Sao_Paulo')) return 'Brazil';
    if (tz.includes('Toronto') || tz.includes('Vancouver')) return 'Canada';
    if (tz.includes('America/')) return 'United States';

    const lang = navigator.language || '';
    if (lang.endsWith('-PH')) return 'Philippines';
    if (lang.endsWith('-DE')) return 'Germany';
    if (lang.endsWith('-GB')) return 'United Kingdom';
    if (lang.endsWith('-JP') || lang.startsWith('ja')) return 'Japan';
    if (lang.endsWith('-IN')) return 'India';
    if (lang.endsWith('-SG')) return 'Singapore';
  } catch (e) {
    // Ignore timezone detection error
  }
  return 'United States';
}

export function autoCaptureBrowserSpecs() {
  if (typeof window === 'undefined') {
    return {
      browser: 'Chrome 140',
      os: 'Windows 11',
      deviceType: 'Desktop',
      screenResolution: '1920 x 1080',
      country: 'United States',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referrer: '/home',
      pageTested: '/',
    };
  }

  const parsed = parseUserAgent(navigator.userAgent);
  const screenResolution = `${window.screen.width} x ${window.screen.height}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const country = autoDetectCountry();

  return {
    browser: parsed.browser,
    os: parsed.os,
    deviceType: parsed.deviceType,
    screenResolution,
    country,
    timestamp,
    referrer: document.referrer ? new URL(document.referrer).pathname : '/home',
    pageTested: window.location.pathname,
  };
}
