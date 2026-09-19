import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      consent,
      // Honeypot field for bot protection
      website_hp,
    } = body;

    // If bot filled the honeypot, return fake success immediately
    if (website_hp) {
      return NextResponse.json({ success: true, message: "Mesajınız alındı." });
    }

    // Validation
    const cleanFirstName = typeof firstName === "string" ? firstName.trim() : "";
    const cleanLastName = typeof lastName === "string" ? lastName.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanSubject = typeof subject === "string" ? subject.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanFirstName || !cleanLastName) {
      return NextResponse.json(
        { error: "Lütfen adınızı ve soyadınızı belirtin." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    if (!cleanSubject) {
      return NextResponse.json(
        { error: "Lütfen mesajınız için bir konu seçin." },
        { status: 400 }
      );
    }

    if (!cleanMessage || cleanMessage.length < 5) {
      return NextResponse.json(
        { error: "Lütfen en az birkaç kelimelik bir mesaj yazın." },
        { status: 400 }
      );
    }

    if (cleanMessage.length > 5000) {
      return NextResponse.json(
        { error: "Mesaj metni çok uzun (en fazla 5000 karakter)." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Devam etmek için gizlilik politikasını onaylamalısınız." },
        { status: 400 }
      );
    }

    // Extract headers for security & abuse prevention
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Attempt to store in Supabase contact_submissions table
    try {
      const supabase = await createClient();
      const { error: dbError } = await supabase.from("contact_submissions").insert({
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone || null,
        subject: cleanSubject,
        message: cleanMessage,
        status: "new",
        ip_address: ip,
        user_agent: userAgent,
      });

      if (dbError) {
        console.warn("[Contact API] Supabase insert warning (table might be pending migration):", dbError.message);
      }
    } catch (dbErr) {
      console.warn("[Contact API] Database logging failed gracefully:", dbErr);
    }

    // In production, notifications can be routed to support@tentamark.com / info@tentamark.com
    console.log(`[Contact Submission] From: ${cleanFirstName} ${cleanLastName} <${cleanEmail}>, Subject: ${cleanSubject}`);

    return NextResponse.json({
      success: true,
      message: "Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.",
    });
  } catch (error) {
    console.error("[Contact API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Beklenmeyen bir sunucu hatası oluştu. Lütfen doğrudan support@tentamark.com adresine yazın." },
      { status: 500 }
    );
  }
}
