import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COUNTRY_TIMEZONES, getUpcomingHolidayForCountry } from "@/lib/calendar/marketingHolidays";
import { autofillFromWebsite } from "@/lib/brand/autofillFromWebsite";
import { generateBrandStrategy } from "@/lib/ai/generateStrategy";
import { getIndustryPreset } from "@/lib/brand/industryPresets";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Geçersiz kurulum isteği." }, { status: 400 });
    }
    const { industry, country, teamSize, website, timezone } = body;
    const allowedIndustries = new Set(["ecommerce", "agency", "saas", "creator", "marketplace", "marketing", "local_business", "education", "other"]);
    const allowedTeamSizes = new Set(["solo", "small", "medium", "agency_large"]);
    if (typeof country !== "string" || !Object.hasOwn(COUNTRY_TIMEZONES, country) ||
        typeof industry !== "string" || !allowedIndustries.has(industry) ||
        typeof teamSize !== "string" || !allowedTeamSizes.has(teamSize) ||
        (website != null && typeof website !== "string") ||
        (timezone != null && (typeof timezone !== "string" || timezone.length > 64))) {
      return NextResponse.json({ error: "Kurulum seçimlerini kontrol edin." }, { status: 400 });
    }
    const selectedCountry = country;
    const selectedTimezone = timezone || "Europe/Istanbul";
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: selectedTimezone });
    } catch {
      return NextResponse.json({ error: "Geçerli bir saat dilimi seçin." }, { status: 400 });
    }
    const cleanWebsite =
      website && typeof website === "string" && website.trim() !== "" ? website.trim() : null;
    if (cleanWebsite) {
      try {
        const parsed = new URL(cleanWebsite);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("protocol");
      } catch {
        return NextResponse.json({ error: "Geçerli bir https:// web sitesi girin veya bu adımı atlayın." }, { status: 400 });
      }
    }

    // 1. Resolve user's active brand
    const { data: profile, error: profileReadError } = await supabase
      .from("profiles")
       .select("active_brand_id, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    if (profileReadError) throw profileReadError;
    if (profile?.onboarding_completed) {
      return NextResponse.json({ error: "Kurulum zaten tamamlandı. Pazarınızı marka ayarlarından değiştirebilirsiniz." }, { status: 409 });
    }

    let brandId = profile?.active_brand_id;

    if (!brandId) {
      // Find from organization memberships
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membership?.organization_id) {
        const { data: brand } = await supabase
          .from("brands")
          .select("id, name")
          .eq("organization_id", membership.organization_id)
          .limit(1)
          .maybeSingle();
        brandId = brand?.id;
      }
    }

    // If still no brand, create an organization & brand fallback
    if (!brandId) {
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({ name: "Benim Organizasyonum", plan: "starter" })
        .select("id")
        .single();

      if (!orgErr && org) {
        const { error: memberError } = await supabase.from("organization_members").insert({
          organization_id: org.id,
          user_id: user.id,
          role: "owner",
        });
        if (memberError) throw memberError;

        const { data: newBrand, error: brandCreateError } = await supabase
          .from("brands")
          .insert({
            organization_id: org.id,
            name: "Markam",
            timezone: selectedTimezone,
            country: selectedCountry,
            team_size: teamSize || "solo",
            website: cleanWebsite,
          })
          .select("id")
          .single();
        if (brandCreateError) throw brandCreateError;

        brandId = newBrand?.id;
      }
    }

    if (!brandId) {
      return NextResponse.json({ error: "Çalışma alanı bulunamadı veya oluşturulamadı." }, { status: 400 });
    }

    // 2. Perform AI Brand Analysis (Website Scraping or Industry Presets)
    let aiAutofillSucceeded = false;
    let brandNameUpdate: string | null = null;

    if (cleanWebsite) {
      try {
        console.log(`[Onboarding] Analyzing website with AI: ${cleanWebsite} for brand ${brandId}`);
        const result = await autofillFromWebsite(brandId, cleanWebsite);

        if (result && (result.industry || result.toneOfVoice || result.brandName)) {
          aiAutofillSucceeded = true;
          if (result.brandName && result.brandName.trim()) {
            brandNameUpdate = result.brandName.trim();
          }

          // Update brands table
          const brandUpdateObj: Record<string, unknown> = {
            country: selectedCountry,
            team_size: teamSize || "solo",
            timezone: selectedTimezone,
            website: cleanWebsite,
            updated_at: new Date().toISOString(),
          };
          if (brandNameUpdate) {
            brandUpdateObj.name = brandNameUpdate;
          }

          const { error: brandUpdateError } = await supabase.from("brands").update(brandUpdateObj).eq("id", brandId).select("id").single();
          if (brandUpdateError) throw brandUpdateError;

          // Update brand_dna with full extracted intelligence
          const { error: dnaError } = await supabase
            .from("brand_dna")
            .upsert(
              {
                brand_id: brandId,
                industry: result.industry || industry || "saas",
                tone_of_voice: result.toneOfVoice || "Profesyonel, samimi ve dinamik",
                brand_traits: result.brandTraits,
                color_palette: result.colorPalette,
                target_audience: result.targetAudience,
                competitors: result.competitors,
                competitor_analysis: result.competitorAnalysis,
                trait_scores: result.traitScores,
                tone_position: result.tonePosition,
                audience_persona: result.audiencePersona,
                audience_pain_points: result.audiencePainPoints,
                audience_motivations: result.audienceMotivations,
                market_comparison: result.marketComparison,
                raw_notes: result.rawNotes,
              },
              { onConflict: "brand_id" }
            );
          if (dnaError) throw dnaError;

          // Generate initial Brand Strategy
          try {
            await generateBrandStrategy(brandId);
          } catch (strategyErr) {
            console.warn("Brand strategy generation failed during onboarding:", strategyErr);
          }
        }
      } catch (scrapeErr) {
        if (aiAutofillSucceeded) throw scrapeErr;
        console.warn("Website autofill failed, falling back to industry preset:", scrapeErr);
      }
    }

    // Fallback: If no website or autofill didn't succeed, populate with high-fidelity industry preset
    if (!aiAutofillSucceeded) {
      const preset = getIndustryPreset(industry || "saas");

      const { error: brandUpdateError } = await supabase
        .from("brands")
        .update({
          country: selectedCountry,
          team_size: teamSize || "solo",
          timezone: selectedTimezone,
          website: cleanWebsite,
          updated_at: new Date().toISOString(),
        })
        .eq("id", brandId)
        .select("id")
        .single();
      if (brandUpdateError) throw brandUpdateError;

      const { error: dnaError } = await supabase
        .from("brand_dna")
        .upsert(
          {
            brand_id: brandId,
            industry: preset.industry,
            tone_of_voice: preset.tone_of_voice,
            brand_traits: preset.brand_traits,
            color_palette: preset.color_palette,
            target_audience: preset.target_audience,
            competitors: preset.competitors,
            trait_scores: preset.trait_scores,
            tone_position: preset.tone_position,
            audience_persona: preset.audience_persona,
            audience_pain_points: preset.audience_pain_points,
            audience_motivations: preset.audience_motivations,
            market_comparison: preset.market_comparison,
            raw_notes: preset.raw_notes,
          },
          { onConflict: "brand_id" }
        );
      if (dnaError) throw dnaError;

      // Attempt to generate initial Brand Strategy
      try {
        await generateBrandStrategy(brandId);
      } catch (strategyErr) {
        console.warn("Preset brand strategy generation notice:", strategyErr);
      }
    }

    // 3. Mark profile onboarding as completed and record active_brand_id
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        active_brand_id: brandId,
        onboarding_completed: true,
      })
      .eq("id", user.id)
      .select("id")
      .single();
    if (profileUpdateError) throw profileUpdateError;

    // 4. Seed upcoming holiday notification for the chosen country
    try {
      const holiday = getUpcomingHolidayForCountry(selectedCountry);
      if (holiday) {
        await supabase.from("notifications").insert({
          brand_id: brandId,
          user_id: user.id,
          category: "calendar",
          type: "holiday_upcoming",
          title: `${holiday.flag} Yaklaşan Özel Gün: ${holiday.name}`,
          message: `${holiday.name} (${holiday.tag}) yaklaşıyor. ${holiday.advice}`,
          link: "/dashboard/calendar",
          action_label: "Takvimde Gör",
          is_read: false,
        });
      }
    } catch (e) {
      console.warn("Could not insert seed notification:", e);
    }

    return NextResponse.json({
      success: true,
      brandId,
      brandName: brandNameUpdate,
      country: selectedCountry,
      timezone: selectedTimezone,
      aiAutofillSucceeded,
    });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    return NextResponse.json(
      { error: "Kurulum tamamlanırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
