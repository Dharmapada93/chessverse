export type ClientDeviceDetails = {
  browser: string;
  os: string;
  device: string;
};

export function parseUserAgent(userAgent?: string): ClientDeviceDetails {
  if (!userAgent) {
    return {
      browser: "Chrome",
      os: "Windows",
      device: "Desktop",
    };
  }

  let browser = "Browser";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browser = "Opera";

  let os = "Desktop";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac OS") || userAgent.includes("Macintosh")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";

  let device = "Desktop";
  if (userAgent.includes("iPad") || userAgent.includes("Tablet")) {
    device = "Tablet";
  } else if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
    device = "Mobile";
  }

  return { browser, os, device };
}
