import { NextResponse } from "next/server";
import { verifyReturnJwt } from "@/lib/canva/client";

// Registered in the Canva Developer Portal as this integration's Return
// URL. Canva opens it inside the SAME popup window that was window.open()'d
// from MediaLibraryModal once the user finishes editing — it never becomes
// a page a person actually looks at, just a bounce that hands the verified
// design id back to the tab that started the flow and closes itself.
function htmlResponse(body: string) {
  return new NextResponse(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jwt = url.searchParams.get("correlation_jwt");
  const origin = url.origin;

  if (!jwt) {
    return htmlResponse(`<p>Canva'dan dönüş bilgisi eksik. Bu pencereyi kapatabilirsiniz.</p>`);
  }

  let designId: string;
  try {
    ({ designId } = await verifyReturnJwt(jwt));
  } catch (err) {
    console.error("Canva return JWT verification failed:", err instanceof Error ? err.message : err);
    return htmlResponse(`<p>Doğrulama başarısız oldu. Bu pencereyi kapatıp tekrar deneyin.</p>`);
  }

  const payload = JSON.stringify({ type: "canva-design-complete", designId });
  const targetOrigin = JSON.stringify(origin);

  return htmlResponse(`<!doctype html>
<html lang="tr"><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#334155">
<p>Tasarım alınıyor, bu pencere birazdan kapanacak...</p>
<script>
  if (window.opener) {
    window.opener.postMessage(${payload}, ${targetOrigin});
  }
  window.close();
</script>
</body></html>`);
}
