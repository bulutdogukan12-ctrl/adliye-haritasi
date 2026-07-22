# Üçüncü Taraf Veri ve Yazılım Bildirimleri

## Türkiye il ve ilçe geometrileri

Bu projedeki türetilmiş `public/data/*.geojson` dosyaları Tacettin Tezer'in
[`ttezer/PowerBi`](https://github.com/ttezer/PowerBi) deposunda yayımlanan harita
verilerinden üretilmiştir. Kaynak depo, verinin ilk kaynağı olarak HDX Türkiye
idari sınır verisini belirtmektedir.

Copyright (c) 2023 Tacettin TEZER

MIT License kapsamında, telif hakkı ve izin bildirimi korunarak kullanılmıştır.
Kaynak geometriler Douglas–Peucker sadeleştirmesi, koordinat yuvarlama ve il
bazında parçalama işlemlerinden geçirilmiştir. Sınırlar resmî kadastro veya
mülki idare belgesi yerine geçmez.

## OpenStreetMap

Çevrimiçi taban haritası kullanıcı tarafından etkinleştirildiğinde
`tile.openstreetmap.org` servisi ve © OpenStreetMap katkıda bulunanlar atfı
gösterilir. Taban harita çevrimdışı kullanım için indirilmez veya önceden
getirilmez.

## Mevzuat ve resmî kaynaklar

Mevzuat metinleri uygulamaya kopyalanmamıştır. Sonuçlardaki bağlantılar T.C.
Mevzuat Bilgi Sistemi, Adalet Bakanlığı ve Hâkimler ve Savcılar Kurulu'nun
kamusal sayfalarına yönlendirir.

## Adlî yargı çevresi verisi

`public/data/judicial-districts.json`, Hâkimler ve Savcılar Kurulu başlıklı
`ADLÎ YARGI REHBER` tablosunun Adalet Bakanlığı RAYP alanında yayımlanan
08.05.2024 tarihli dosyasından türetilmiştir. Kaynak PDF 1.001 mahal/adliye satırı
içerir; uygulama bunları 973 seçilebilir coğrafi kayıtla eşleştirir.

Toplu tabloda yer almayan Sultanhanı, Kemalpaşa (Artvin) ve Derecik kayıtları HSK
Genel Kurulunun 06.08.2025 tarihli ve 1080 sayılı kararıyla; Sincan kaydı Adalet
Bakanlığı Ankara Batı adli yargı çevresi bilgisiyle tamamlanmıştır. Özel hukuk
siteleri yalnız keşif ve çapraz kontrol amacıyla kaynak dizininde tutulur.
