<?php
/*
Plugin Name: Ajans Özel Analitik
Description: Müşteri sitelerinden trafik verilerini toplayan hafif ajan eklentisi.
Version: 1.2
Author: Seyid TURGUT
*/

if (!defined('ABSPATH'))
    exit; // Güvenlik: Doğrudan erişimi engelle

// 1. Admin Menüsü Oluşturma
add_action('admin_menu', 'ajans_analitik_menu');

function ajans_analitik_menu()
{
    add_menu_page(
        'Analitik Ayarları',    // Sayfa Başlığı
        'Ajans Analitik',       // Menü Adı
        'manage_options',       // Yetki
        'ajans-analitik-setup', // Slug
        'ajans_analitik_page_html', // Gösterilecek Fonksiyon
        'dashicons-chart-line', // İkon
        90 // Sıra
    );
}

// 2. Ayarları Kaydetme (Sadece Site ID)
add_action('admin_init', 'ajans_analitik_settings');

function ajans_analitik_settings()
{
    register_setting('ajans_analitik_group', 'ajans_site_id');
}

// 3. Admin Sayfası HTML Çıktısı
function ajans_analitik_page_html()
{
    ?>
    <div class="wrap">
        <h1>📊 Analitik Kurulumu</h1>
        <form method="post" action="options.php">
            <?php settings_fields('ajans_analitik_group'); ?>
            <?php do_settings_sections('ajans_analitik_group'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Müşteri/Site ID:</th>
                    <td>
                        <input type="text" name="ajans_site_id" value="<?php echo esc_attr(get_option('ajans_site_id')); ?>"
                            placeholder="TR-XXXX-Y" />
                        <p class="description">Ajans panelinizden aldığınız ID'yi buraya girin.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// 4. Frontend: Takip Kodunu Siteye Ekleme (Footer)
add_action('wp_footer', 'ajans_analitik_tracker_code');

function ajans_analitik_tracker_code()
{
    $site_id = get_option('ajans_site_id');

    // If ID is empty, return
    if (empty($site_id))
        return;

    // API URL - Production Domain
    $api_url = 'https://tembelhane.com';
    $endpoint = $api_url . '/api/track';

    ?>
    <!-- Ajans Analitik Başlangıç -->
    <script>
        (function () {
            const endpoint = '<?php echo esc_js($endpoint); ?>';

            // Basit Cihaz Tespiti
            function getDeviceType() {
                const ua = navigator.userAgent;
                if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                    return "Tablet";
                }
                if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                    return "Mobil";
                }
                return "Masaüstü";
            }

            const payload = {
                site_id: '<?php echo esc_js($site_id); ?>',
                url: window.location.href,
                referrer: document.referrer,
                timestamp: new Date().toISOString(),
                screen_width: window.screen.width,
                device: getDeviceType()
            };

            // Veri Gönder
            function sendData() {
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    keepalive: true,
                    mode: 'cors'
                }).catch(err => console.error('Analitik hatası:', err));
            }

            // Sayfa Yüklendiğinde
            if (document.readyState === 'complete') {
                sendData();
            } else {
                window.addEventListener('load', sendData);
            }

            // Single Page Application (SPA) desteği için URL değişimlerini dinle
            let lastUrl = location.href;
            new MutationObserver(() => {
                const url = location.href;
                if (url !== lastUrl) {
                    lastUrl = url;
                    payload.url = url;
                    sendData();
                }
            }).observe(document, { subtree: true, childList: true });

        })();
    </script>
    <!-- Ajans Analitik Bitiş -->
    <?php
}