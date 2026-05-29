# Launch Requirements

Bu dosya, NHMUN'26 sitesini yayına almadan önce hazır olması gereken bilgileri,
hesapları ve kararları listeler.

## Senden Gereken Bilgiler

Deploy aşamasına geçmeden önce şu bilgileri netleştirmemiz gerekiyor:

1. Final domain adı
   - Örnek: `nhmun26.org`, `nhmun26.com` veya uygun başka bir seçenek.
   - Domain satın alındıysa hangi hesaba bağlı olduğunu belirt.
   - Domain satın alınmadıysa satın alma işlemi Cloudflare üzerinden yapılabilir.

2. Cloudflare hesabı
   - Hesap sahibi Cloudflare'a giriş yapabiliyor olmalı.
   - Cloudflare şifresini paylaşma.
   - Gereken ayarlar yapılırken hesabın açık olması veya ekrandaki doğrulama
     adımlarının senin tarafından tamamlanması yeterli.

3. GitHub erişimi
   - Repository: `emir-ertunc/nhmun26-site`
   - Production branch olarak `main` kullanılacak.
   - Deploy öncesi son PR `main` branch'ine merge edilmeli.

4. Admin paneline girecek e-posta adresleri
   - `/admin` erişimi alacak tüm e-postalar netleşmeli.
   - Örnek: `nhmun2026@gmail.com`

5. Başvuru bildirim alıcıları
   - Yeni başvuru geldiğinde hangi e-postalara bildirim gideceği netleşmeli.
   - Örnek: `nhmun2026@gmail.com`

6. E-posta gönderici kararı
   - Önerilen production sender: domain bazlı bir adres.
   - Örnek: `applications@final-domain`
   - Gmail adresi reply-to olarak kullanılabilir, fakat production e-posta
     gönderimi için Resend tarafında doğrulanmış domain kullanmak daha doğru.

7. Team modal açıklamaları
   - Şu an ekip kartlarında kısa rol açıklamaları var.
   - Instagram post açıklamaları ile birebir aynı olması isteniyorsa her kişi
     için net açıklama metinleri gönderilmeli.

## Gerekli Hesaplar

Bu hesapların hazır olması veya deploy sırasında oluşturulması gerekiyor:

- Cloudflare
  - Pages hosting
  - D1 database
  - Turnstile
  - Access protection
  - Domain registration veya DNS yönetimi
- GitHub
  - Repository'nin Cloudflare Pages'e bağlanması için
- Resend
  - Başvuru onay e-postaları
  - Accepted / waitlisted / rejected karar e-postaları

## Paylaşılmaması Gerekenler

Aşağıdaki değerleri chat içinde paylaşma ve repository'ye koyma:

- Cloudflare şifresi
- Gmail şifresi
- Cloudflare API token
- Resend API key
- Turnstile secret key
- Cloudflare Access secret değerleri

Bu değerler deploy sırasında doğrudan Cloudflare veya Resend dashboard'larına
girilmeli.

## Cloudflare Environment Değerleri

Cloudflare Pages tarafında ayarlanacak production environment değerleri:

```text
APP_ENV=production
PUBLIC_SITE_URL=https://final-domain
VITE_TURNSTILE_SITE_KEY=<public-turnstile-site-key>
TURNSTILE_SECRET_KEY=<private-turnstile-secret-key>
ADMIN_EMAIL_ALLOWLIST=<comma-separated-admin-emails>
CLOUDFLARE_ACCESS_AUD=<access-application-audience-tag>
CLOUDFLARE_ACCESS_TEAM_DOMAIN=<team-name>.cloudflareaccess.com
RESEND_API_KEY=<private-resend-api-key>
EMAIL_FROM=NHMUN26 <applications@final-domain>
EMAIL_NOTIFICATION_TO=<comma-separated-notification-emails>
EMAIL_REPLY_TO=<reply-to-email>
```

## Domain Maliyeti

Cloudflare Registrar domainleri kayıt operatörü maliyetiyle satar; Cloudflare
resmi dokümantasyonuna göre registration / renewal için ekstra registrar markup
eklemez.

Fiyatlar TLD'ye göre değişir. Satın almadan önce Cloudflare checkout ekranındaki
son tutar mutlaka kontrol edilmeli. Aşağıdaki fiyatlar 29 Mayıs 2026 tarihinde
kontrol edilen public Cloudflare Registrar fiyat verilerine göre yaklaşık
1 yıllık maliyettir:

| TLD    | İlk kayıt | Yenileme |                     Yaklaşık TL karşılığı |
| ------ | --------: | -------: | ----------------------------------------: |
| `.com` |  US$10.46 | US$10.46 |                           yaklaşık 480 TL |
| `.org` |   US$7.50 | US$10.13 | yaklaşık 344 TL ilk yıl / 465 TL yenileme |
| `.net` |  US$11.86 | US$11.86 |                           yaklaşık 545 TL |
| `.co`  |  US$26.00 | US$26.00 |                         yaklaşık 1.193 TL |
| `.io`  |  US$50.00 | US$50.00 |                         yaklaşık 2.295 TL |

TL hesabı yaklaşık `1 USD = 45.89 TRY` kuru ile yapılmıştır. Nihai kart
ekstresi; kur değişimi, banka dönüşüm kuru, vergi ve domain seçimine göre
farklı olabilir.

Kaynaklar:

- Cloudflare Registrar: https://developers.cloudflare.com/registrar/
- Cloudflare Registrar fiyat listesi: https://cfdomainpricing.com/
- USD / TRY kuru: https://fx-rate.net/USD/TRY/

## Minimum Launch Akışı

1. Current production PR `main` branch'ine merge edilir.
2. Cloudflare Pages project oluşturulur veya mevcut project bağlanır.
3. Final domain satın alınır veya Cloudflare DNS'e bağlanır.
4. D1 database oluşturulur ve `wrangler.toml` içindeki `database_id`
   güncellenir.
5. D1 migrations uygulanır.
6. Turnstile site key ve secret key oluşturulur.
7. `/admin` ve `/api/admin/*` için Cloudflare Access ayarlanır.
8. Resend oluşturulur veya production domain doğrulanır.
9. Cloudflare environment variables girilir.
10. `main` branch'i production'a deploy edilir.
11. Production kontrolleri yapılır:
    - `/api/health`
    - test başvurusu
    - admin application listesi
    - CSV export
    - decision email
    - desktop ve mobile görsel kontrol
