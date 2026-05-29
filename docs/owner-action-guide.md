# Owner Action Guide

Bu dosya, deploy aşamasına geçebilmek için senin sırayla yapman gereken
işlemleri listeler. Gizli değerleri chat içinde paylaşma; şifre ve secret key
gibi bilgiler yalnızca ilgili dashboard ekranlarına girilmeli.

## 1. Final Domain Kararını Ver

Önce tek bir final domain seç:

- Önerilen seçenekler: `nhmun26.org` veya `nhmun26.com`
- Alternatif seçilecekse kısa, yazımı kolay ve konferans adıyla net bağlantılı
  olmalı.
- Domain müsait değilse aynı gün içinde ikinci seçenek belirlenmeli.

Karar verince bana sadece seçilen domain adını söylemen yeterli.

## 2. Cloudflare Hesabını Hazırla

Cloudflare hesabı deploy için ana hesap olacak.

Yapılacaklar:

1. https://dash.cloudflare.com adresine gir.
2. Varsa mevcut hesabına giriş yap.
3. Hesap yoksa yeni hesap aç.
4. E-posta doğrulamasını tamamla.
5. Mümkünse two-factor authentication aç.
6. Domain satın almak için ödeme kartını Cloudflare hesabına ekle.

Bana Cloudflare şifresini gönderme. Gerekli adımlarda hesabın açık olması veya
senin ekrandaki onayları tamamlaman yeterli.

## 3. Domain Satın Al

Domaini mümkünse Cloudflare Registrar üzerinden satın al.

Yapılacaklar:

1. Cloudflare dashboard içinde domain registration / registrar ekranına gir.
2. Seçilen domaini ara.
3. Müsaitse 1 yıllık kayıt ile satın al.
4. Auto-renew açık kalabilir.
5. Satın alma ekranındaki son fiyatı ödeme yapmadan önce kontrol et.
6. Satın alma tamamlanınca domainin Cloudflare hesabında göründüğünü doğrula.

Satın alma sonrası bana domain adını yazman yeterli. Kart bilgisi, fatura
bilgisi veya Cloudflare şifresi gönderme.

## 4. GitHub Erişimini Kontrol Et

Repository deploy için GitHub üzerinden Cloudflare Pages'e bağlanacak.

Yapılacaklar:

1. https://github.com adresine gir.
2. `emir-ertunc` hesabına giriş yap.
3. `emir-ertunc/nhmun26-site` repository'sini açabildiğini kontrol et.
4. `main` branch'e merge işlemi yapılabildiğini doğrula.

Bana GitHub şifresi gönderme.

## 5. Resend Hesabı Aç

Resend başvuru onay ve karar e-postaları için kullanılacak.

Yapılacaklar:

1. https://resend.com adresine gir.
2. Hesap aç veya mevcut hesaba giriş yap.
3. E-posta doğrulamasını tamamla.
4. Domain satın alındıktan sonra Resend içinde sender domain ekle.
5. Resend'in verdiği DNS kayıtlarını Cloudflare DNS'e ekle.
6. Domain doğrulaması tamamlanana kadar bekle.

Resend API key oluşturulacak ama chat içinde paylaşılmayacak. Deploy sırasında
bu değer doğrudan Cloudflare environment variable ekranına girilecek.

## 6. E-posta Adreslerini Netleştir

Şu üç karar deploy öncesi net olmalı:

| Amaç                    | Örnek değer                         | Not                                      |
| ----------------------- | ----------------------------------- | ---------------------------------------- |
| Admin erişimi           | `nhmun2026@gmail.com`               | `/admin` paneline girecek e-postalar     |
| Bildirim alıcıları      | `nhmun2026@gmail.com`               | Yeni başvuru bildirimi alacak adresler   |
| Production sender/reply | `applications@domain` + Gmail reply | Sender domain bazlı, reply-to Gmail olur |

Bana admin ve bildirim alıcısı e-posta listesini yazabilirsin. Şifre gönderme.

## 7. Cloudflare Pages Project Oluştur

Bu adım siteyi Cloudflare'a bağlar.

Yapılacaklar:

1. Cloudflare dashboard içinde `Workers & Pages` bölümüne gir.
2. `Create application` veya `Create project` seç.
3. `Pages` seç.
4. GitHub bağlantısını başlat.
5. Repository olarak `emir-ertunc/nhmun26-site` seç.
6. Production branch olarak `main` seç.
7. Build command: `npm run check`
8. Build output directory: `dist`
9. Project oluştur.

İlk deploy, environment variable ve D1 ayarları tamamlanmadan eksik olabilir;
asıl production deploy son ayarlardan sonra yapılacak.

## 8. D1 Database Oluştur

Başvurular Cloudflare D1 içinde tutulacak.

Yapılacaklar:

1. Cloudflare dashboard içinde `D1` bölümüne gir.
2. Yeni database oluştur.
3. Database adı: `nhmun26-applications`
4. Oluşturma sonrası `database_id` değerini kopyala.

`database_id` gizli şifre değildir; bunu bana gönderebilirsin. Bu değer
`wrangler.toml` içindeki placeholder ile değiştirilecek.

## 9. Turnstile Oluştur

Turnstile form spam koruması için kullanılacak.

Yapılacaklar:

1. Cloudflare dashboard içinde `Turnstile` bölümüne gir.
2. Yeni widget oluştur.
3. Widget adı: `NHMUN26 Applications`
4. Domain olarak final domaini ekle.
5. Widget oluşturulduktan sonra site key ve secret key oluşacak.

Site key public olabilir. Secret key paylaşılmamalı; Cloudflare Pages
environment variable ekranına doğrudan girilecek.

## 10. Cloudflare Access Ayarla

Admin paneli herkese açık olmamalı. Cloudflare Access ile korunacak.

Yapılacaklar:

1. Cloudflare Zero Trust dashboard'a gir.
2. Team domain oluşturman istenirse kısa bir team adı seç.
3. Access application oluştur.
4. Korunacak path'ler:
   - `/admin`
   - `/api/admin/*`
5. Login method olarak e-posta one-time PIN yeterli.
6. Sadece admin e-posta listesinde olan adreslere izin ver.
7. Access application audience tag değerini sakla.

Audience tag ve team domain deploy sırasında environment variable olarak
kullanılacak.

## 11. Environment Variable Değerlerini Gir

Cloudflare Pages project içinde production environment variables ekranına şu
değerler girilecek:

```text
APP_ENV=production
PUBLIC_SITE_URL=https://final-domain
VITE_TURNSTILE_SITE_KEY=<public-turnstile-site-key>
TURNSTILE_SECRET_KEY=<private-turnstile-secret-key>
ADMIN_EMAIL_ALLOWLIST=<admin-emails>
CLOUDFLARE_ACCESS_AUD=<access-audience-tag>
CLOUDFLARE_ACCESS_TEAM_DOMAIN=<team-name>.cloudflareaccess.com
RESEND_API_KEY=<private-resend-api-key>
EMAIL_FROM=NHMUN26 <applications@final-domain>
EMAIL_NOTIFICATION_TO=<notification-emails>
EMAIL_REPLY_TO=<reply-to-email>
```

Private değerleri chat içinde paylaşma. Bu değerleri ekran paylaşımıyla veya
senin doğrudan dashboard'a girmenle tamamlamak daha doğru.

## 12. Bana Gönderebileceğin Bilgiler

Güvenle paylaşabileceğin bilgiler:

- Final domain adı
- Admin paneline girecek e-posta listesi
- Başvuru bildirimi alacak e-posta listesi
- Reply-to olarak kullanılacak e-posta adresi
- D1 `database_id`
- Public Turnstile site key
- Cloudflare Access team domain
- Cloudflare Access audience tag
- Instagram ekip açıklama metinleri

Paylaşmaman gereken bilgiler:

- Cloudflare şifresi
- GitHub şifresi
- Gmail şifresi
- Resend API key
- Turnstile secret key
- Cloudflare API token
- Kart bilgileri

## 13. Son Deploy Öncesi Kontrol

Bu maddeler tamamlanmadan production açılmamalı:

1. Domain satın alındı veya Cloudflare DNS'e bağlandı.
2. D1 database oluşturuldu.
3. `wrangler.toml` içindeki `database_id` güncellendi.
4. D1 migrations production'a uygulandı.
5. Turnstile production domain için çalışıyor.
6. Cloudflare Access admin panelini koruyor.
7. Resend sender domain doğrulandı.
8. Environment variables Cloudflare Pages'e girildi.
9. `robots.txt`, `sitemap.xml` ve site URL değerleri final domainle güncellendi.
10. Test başvurusu, admin paneli, CSV export ve karar e-postası kontrol edildi.
