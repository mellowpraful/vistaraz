/**
 * Safe API fetch helper to eliminate uncaught JSON parsing crashes and preserve clean error state.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

export async function fetchSafeJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";

    let body: any = null;
    if (contentType.includes("application/json")) {
      try {
        body = await res.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON response from server:", jsonErr);
        return {
          success: false,
          error: `Invalid JSON payload received from server (HTTP ${res.status})`,
        };
      }
    } else {
      const rawText = await res.text();
      return {
        success: false,
        error: rawText?.slice(0, 200) || `Server returned non-JSON response (HTTP ${res.status})`,
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: body?.error || `Server returned HTTP ${res.status}`,
        ...(typeof body === "object" ? body : {}),
      };
    }

    if (typeof body === "object" && body !== null) {
      return {
        success: body.success !== false,
        ...body,
      };
    }

    return {
      success: true,
      data: body as T,
    };
  } catch (err: any) {
    console.error("Network or fetch execution error:", err);
    return {
      success: false,
      error: err?.message || "Failed to communicate with server",
    };
  }
}
