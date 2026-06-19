#!/bin/bash
cd /Users/pareshtank/Documents/KHEDUTSATHI/KhedutSaathi/frontend/public/images/news-fallbacks

download() {
  curl -s -L -o "$1" "https://images.unsplash.com/photo-$2?q=80&w=800&auto=format&fit=crop"
}

download agriculture-1.jpg 1625246333195-78d9c38ad449
download agriculture-2.jpg 1589923158776-cb441865913e
download agriculture-3.jpg 1595822543593-9c88214371b2
download agriculture-4.jpg 1495107315403-f3041a029377
download agriculture-5.jpg 1500937386664-56d1dfef4bf7

download weather-1.jpg 1561553590-267fc716698a
download weather-2.jpg 1530908295418-a12e326966ba
download weather-3.jpg 1454789476662-53eb23ba5907
download weather-4.jpg 1428592953211-077101b2021b

download government-1.jpg 1523292562811-8fa7962a78c8
download government-2.jpg 1555848962-6e79363ec58f
download government-3.jpg 1541872703-74c5e44368f9

download market-1.jpg 1533900298318-6b8da08a523e
download market-2.jpg 1542838132-92c53300491e
download market-3.jpg 1550989460-0adf9ea622e2
download market-4.jpg 1515150144380-bca9f1650ed9

download crop-health-1.jpg 1592982537447-6f23f8cb1594
download crop-health-2.jpg 1586771107146-f1aa3554e287
download crop-health-3.jpg 1459156115476-8f56ab0d18b1
download crop-health-4.jpg 1530504126442-f549a718b525

rm agriculture.jpg weather.jpg market.jpg government.jpg crop-health.jpg
