const FAQ_GROUPS = [
  {
    label: "Ürün & Marka",
    items: [
      {
        q: "Hangi platformlarda yayın yapabiliyorum?",
        a: "Bugün Instagram, Facebook ve LinkedIn'de doğrudan yayın yapılıyor. TikTok, YouTube, Pinterest, Threads ve X yol haritamızda; sırayla açılıyor.",
      },
      {
        q: "Markamın tonunu nasıl öğreniyor?",
        a: "Kurulumda sektörünüzü, konuşma tonunuzu, renk paletinizi ve yasaklı konularınızı tanımlayan bir Brand DNA oluşturuyoruz. Üretilen her içerik bu DNA'ya göre yazılır.",
      },
      {
        q: "Görsel ve video içerikleri nasıl üretiliyor?",
        a: "Çekim konseptini kısaca anlatırsınız; Tentamark markanızın renk paletine ve tonuna uygun bir görsel veya video üretir. Diğer her içerik gibi, siz onaylamadan hiçbir şey yayına gitmez.",
      },
    ],
  },
  {
    label: "Güven & Kontrol",
    items: [
      {
        q: "Onayım olmadan bir şey yayınlanır mı?",
        a: "Hayır. Tentamark taslakları hazırlar, siz inceler ve onaylarsınız. Onayınız olmadan tek bir gönderi bile hesaplarınıza gitmez.",
      },
      {
        q: "Verilerim ve hesap şifrelerim güvende mi?",
        a: "Şifrenizi hiçbir zaman istemeyiz. Hesaplarınız resmi OAuth ile bağlanır, erişim istediğiniz an tek tıkla iptal edilebilir.",
      },
    ],
  },
  {
    label: "Fiyatlandırma & Erken Erişim",
    items: [
      {
        q: "Fiyatlandırma ne zaman netleşecek?",
        a: "Fiyatlandırma sayfasındaki rakamlar bugünkü hedef politikamız, ama ilk kullanıcılarımızla test ederken değişebilir. Erken erişime katılanlar herhangi bir değişiklik olursa ilk haberdar olur.",
      },
      {
        q: "Erken erişime katılırsam ne oluyor?",
        a: "Listeye e-posta adresinizi bırakıyorsunuz. Ürün kullanıma açıldığında ilk davet edilen grup arasında oluyorsunuz, spam göndermiyoruz.",
      },
    ],
  },
];

export default function FaqSection() {
  return (
    <section
      id="sss"
      className="relative z-90 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-sky text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-3xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky font-semibold mb-2">
            Sıkça Sorulan Sorular
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Merak ettikleriniz <span className="text-sky">muhtemelen burada.</span>
          </h2>
        </div>

        <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface shadow-sm">
          {FAQ_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-6 pt-5 pb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-faint">
                {group.label}
              </p>
              <div className="divide-y divide-line">
                {group.items.map((item) => (
                  <details key={item.q} name="faq" className="group px-6 py-4 open:pb-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-sm font-semibold text-ink marker:content-none">
                      {item.q}
                      <span
                        className="shrink-0 text-lg text-faint transition-transform duration-200 group-open:rotate-45 group-open:text-accent-text"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 font-body text-sm leading-relaxed text-muted">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
