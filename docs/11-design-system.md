# 11. Tasarım Sistemi ve Marka

> Bu dosya, `web/src/app/globals.css` içindeki token sisteminin **neden** öyle
> olduğunu kaydeder. Kod tek gerçek kaynaktır; bu doküman gerekçedir.
>
> **Tarih:** 8 Eylül 2026

---

## 11.1 Nereden geldi

Palet göz kararı seçilmedi. Üç referans sitede deterministik renk ölçümü
çalıştırıldı (design-dna skill'i, k-means kümeleme, piksel kaplama oranıyla):

| Site | Baskın zemin | Kaplama | Metin | Aksan |
|---|---|---|---|---|
| sproutsocial.com | `#050405` | **%58.8** | `#fdfdfd` | `#0677a0` %1.7 |
| metricool.com | `#ffffff` | **%78.3** | `#2e1c2a` | `#ee5944` %3.6 |
| later.com | `#f9f4ee` | **%65.3** | `#060808` | `#5125c0` %4.2 |

İki çıkarım:

1. **Üçü de tek bir zemine tam commit ediyor** (%59-78 kaplama). Gradient yıkama,
   çok tonlu zemin yok. Bizde iki radial gradient vardı, kaldırıldı.
2. **Aksan %4'ün altında.** Bizde mor buton, başlık, rozet, ikon, çerçeve ve
   çubukta aynı anda kullanılıyordu.

Bu ölçüm ilk olarak sıcak krem + mor bir yöne götürdü (later.com'un paletine
yakın). Sonra sproutsocial'ın **görsel dili** incelendi (sadece renkleri değil):
gerçek insan fotoğrafı, üstünde yüzen ürün arayüzü, saf siyah bantlar. Ürünün
hedefi ajans ve profesyonel olduğu için yön oraya çevrildi. Güncel palet §11.3.

---

## 11.2 Üç rampa

Token mimarisi, [post-scheduler-frontend](https://github.com/dineshstack/post-scheduler-frontend)'in
yapısından alındı. **Renkleri değil, yapısı.** O projenin paleti Tailwind'in
kutudan çıkan varsayılanı (`#4f46e5` = indigo-600, `#0f172a` = slate-900,
Geist font), yani marka değil, şablon.

```
surface   bg  ->  surface  ->  surface-soft  ->  surface-strong
          sayfa   kart         kuyu/hover      basılı/aktif

text      ink  ->  muted  ->  faint
          başlık   ikincil    büyük metin/UI (gövde metni DEĞİL)

accent    accent -> accent-hover -> accent-subtle -> accent-text
          dolgu     hover           tint zemin       tint üstü metin
```

Ayrıca:

- `line` — hairline kenarlıklar
- `inverse` / `inverse-text` — sayfanın tek yüksek kontrast bandı
- `on-inverse-accent` — bandın içindeki vurgu rengi

---

## 11.3 Palet: tam beyaz / tam siyah + mavi

Sıcak krem ve mor yön, sproutsocial'ın görsel dili referans alınınca bırakıldı.
Yeni yön: **saf beyaz sayfa, saf siyah bant, aralarda mavi aksan.**

Mor terk edildi çünkü ana eylem rengi olarak taste-skill'in "LILA RULE" dediği
AI imzasına en yakın renkti ve koyu zeminde kontrastı zayıftı (aşağıya bakın).
Tenta maskotu hâlâ mor, ama artık arayüzün değil markanın rengi.

### Kontrast: hesaplandı, tahmin edilmedi

**Açık tema** (zemin `#ffffff`):

| Token | Değer | Oran | Kullanım |
|---|---|---|---|
| `--ink` | `#0a0a0b` | 19.9:1 | Başlık ve gövde |
| `--muted` | `#5c5c66` | 7.2:1 | İkincil metin |
| `--faint` | `#8b8b96` | **3.4:1** | **Sadece büyük metin ve UI.** Gövde metninde kullanılamaz |
| `--accent` | `#2563eb` | 5.2:1 | Mavi, tek dolgu aksanı |

**Koyu tema** (zemin `#0a0a0b`):

| Token | Değer | Oran |
|---|---|---|
| `--ink` | `#fafafa` | 18.9:1 |
| `--muted` | `#a1a1ad` | 8.0:1 |
| `--accent` | `#60a5fa` | 7.8:1 |

### Bant tema değiştirince ters dönüyor

Siyah bant, koyu temada beyaz banda dönüşüyor. Bu yüzden bandın içindeki vurgu
rengi de tema ile takas ediliyor:

| Tema | Bant | Vurgu | Oran |
|---|---|---|---|
| Açık | siyah `#0a0a0b` | açık mavi `#7dd3fc` | 10.7:1 |
| Koyu | beyaz `#fafafa` | koyu mavi `#1d4ed8` | 7.7:1 |

Sabit tek bir vurgu rengi kullanılsaydı, bantlardan birinde okunmaz olurdu.

### Siyahtan beyaza geçiş

sproutsocial'ın köşe muamelesi: açık blok koyu bloğun **üstüne biniyor**, sert
bir dikişle bitişmiyor. Uygulaması:

- Koyu bölüm: `rounded-b-[2rem] sm:rounded-b-[2.5rem]`
- Sonraki açık bölüm: `rounded-t-[2rem] sm:rounded-t-[2.5rem]` + `-mt-8 sm:-mt-10` + `relative z-10`
- Geçişte üst kenarlık **yok**; rengin kendisi dikiştir.

---

## 11.4 Yüzey kuralı

Belgelenmiş tek kural, [10-domain-architecture.md](10-domain-architecture.md)'deki
mimari kararlar gibi kodda da yorum olarak duruyor:

- **Yarıçap:** kartlar, çerçeveler ve medya kuyuları `rounded-2xl` (16px);
  pill, buton ve avatarlar `rounded-full`. Başka değer yok.
- **Dinlenme:** yüzeyler düz durur, sadece hairline kenarlıkla tutulur.
  **Dinlenirken gölge yok.**
- **Kalkma:** tek paylaşılan `.lift` sınıfı. `--lift-rgb` ile kartın kendi
  aksanına boyanır, böylece her yüzey aynı şekilde ama kendi renginde kalkar.

Bu kural, birbirinden kopmuş **14 farklı gölge değerinin** (8'i elle yazılmış
tek kullanımlık string) yerini aldı. Referans ölçümü bunu destekliyor: sprout ve
metricool'da dinlenme gölgesi neredeyse hiç yok.

---

## 11.4b Platform ikonları

Emoji kullanılmıyor, elle SVG de çizilmiyor. Marka logoları
[`react-icons`](https://www.npmjs.com/package/react-icons)'ın Font Awesome 6
brands setinden geliyor.

**Neden Simple Icons değil:** Simple Icons artık LinkedIn markasını
barındırmıyor (marka sahibinin talebiyle kaldırıldı) ve LinkedIn üç lansman
platformumuzdan biri. Tek eksik logo için ikinci bir kütüphane karıştırmak
yerine hepsini tek setten almak daha tutarlı.

Renkler resmi marka hex'leri ve **bilerek sabit**: bir marka logosu bizim tema
token'larımızla değişmemeli.

`PlatformIcon` iki varyant sunar:

| Varyant | Görünüm | Nerede |
|---|---|---|
| `tile` (varsayılan) | Marka renginde yuvarlak kare, beyaz glif | Hero güven satırı, ConnectStrip, platform kartları |
| `bare` | Sadece glif, marka renginde | Satır içi kullanım |

Henüz bağlanamayan platformlar `opacity-35 grayscale` ile gösteriliyor: logo
tanınır kalıyor ama geri çekiliyor, böylece sıra bir yol haritası gibi okunuyor,
sahip olmadığımız bir yeteneği iddia etmiyor.

---

## 11.5 Ana buton neden koyu

Üç referansın da ana butonu koyu:

| Site | Ana buton |
|---|---|
| sproutsocial | `#040404` siyah |
| metricool | `#2D1A29` koyu erik (üstünde lime metin) |
| Tentamark | `--ink`, hover'da `--accent` |

Bizde "mor buton + mor parıltı" vardı. Bu, taste-skill'in **LILA RULE** diye
adlandırdığı klasik AI imzası. Aksan artık rozet, vurgu, odak halkası ve aktif
durumda yaşıyor; ana eylemde değil.

---

## 11.6 Tipografi

| Rol | Font | Nerede |
|---|---|---|
| `--font-display` | Baloo 2 | Başlıklar, marka adı. Logonun yuvarlak diliyle uyumlu |
| `--font-body` | IBM Plex Sans | Gövde metni |
| `--font-mono` | IBM Plex Mono | Mikro etiketler, sayılar, teknik metin |

**Kaldırılan:** Cormorant Garamond, sinematik hero için yüklenmişti. O hero
sayfadan çıkınca fontu kullanan kimse kalmadı ve her sayfa yüklemesinde boşuna
inen bir webfont oldu. `layout.tsx` içinde nasıl geri getirileceği yorum olarak
duruyor.

---

## 11.7 Tema geçişi

- Tercih `<html data-theme>` üzerinde yaşar, `localStorage`'da saklanır.
- `layout.tsx` içindeki **inline script ilk boyamadan önce** çalışır, böylece
  koyu tercih eden ziyaretçi açık tema parlaması (FOUC) görmez.
- Tercih yoksa `prefers-color-scheme` geçerli olur.
- `ThemeToggle` bileşeni `useSyncExternalStore` kullanır, effect içinde setState
  yapmaz. Tema DOM'da yaşayan harici bir durum olduğu için doğru API budur.
- `localStorage` engelliyse (gizli mod) düğme yine çalışır, sadece tercih
  kalıcı olmaz.

---

## 11.8 Sözlük: hangi token nerede

Yeni bileşen yazarken:

| İhtiyaç | Token |
|---|---|
| Sayfa zemini | `bg-bg` (beyaz) |
| Kart | `bg-surface` + `border-line` + `rounded-2xl` |
| Kart içi kuyu, hover dolgusu | `bg-surface-soft` |
| Basılı/aktif dolgu | `bg-surface-strong` |
| Başlık, gövde | `text-ink` |
| İkincil açıklama | `text-muted` |
| Resim altı, devre dışı, **büyük** etiket | `text-faint` |
| Ana buton | `bg-ink text-bg hover:bg-accent` (siyah, hover mavi) |
| Rozet / tint | `bg-accent-subtle text-accent-text` |
| Yüksek kontrast bant | `bg-inverse text-inverse-text` + `rounded-b-[2rem]` |
| Bant içi vurgu | `text-on-inverse-accent` |
| Kart kalkma efekti | `.lift` + `style={{ "--lift-rgb": "R G B" }}` |
| Platform logosu | `<PlatformIcon name="instagram" />` (emoji veya elle SVG **yok**) |

`--lift-rgb` **boşlukla ayrılmış** RGB kanalları ister (`37 99 235`), virgülle
değil. Modern `rgb(... / alpha)` sözdizimi virgüllü formu kabul etmez.

---

## 11.9 Açık kalan

- **Dashboard token'ları.** Uygulama arayüzü başlayınca durum renkleri
  (başarı/uyarı/hata) ve veri görselleştirme paleti eklenecek. Kategorik grafik
  renkleri için ayrı bir dizi gerekir; mevcut aksan seti bunun için yeterli değil.
- **Koyu temada görsel varlıklar.** Dashboard mockup görselleri açık zeminli;
  koyu temada parlak dikdörtgen olarak duruyorlar. Sorun değil ama ileride koyu
  varyantları üretilebilir.
