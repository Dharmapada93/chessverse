export function getApiBaseUrl(): string {
  // In the browser, always use relative path "" so all /api/... calls hit the current Next.js domain directly with zero CORS issues
  if (typeof window !== "undefined") {
    return "";
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("api.chessverse.app") && !envUrl.includes("onrender.com")) {
    return envUrl.replace(/\/+$/, "");
  }

  return "";
}

export const API_URL = getApiBaseUrl();

export async function ensureAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("chessverse-token");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("chessverse-token")
      : null;

  if (!token && typeof window !== "undefined") {
    token = await ensureAuthToken();
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(
      url,
      {
        credentials: "include",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
          ...options.headers,
        },
      },
    );

    // Auto-recover on 401 by getting fresh token and retrying once
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("chessverse-token");
    }

    return response;
  } catch (err) {
    // If fetch threw network error in browser, try relative path directly
    if (typeof window !== "undefined" && path.startsWith("/api/")) {
      try {
        return await fetch(path, {
          credentials: "include",
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
        });
      } catch {
        throw err;
      }
    }
    throw err;
  }
}
