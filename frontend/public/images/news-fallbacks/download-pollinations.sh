#!/bin/bash
cd /Users/pareshtank/Documents/KHEDUTSATHI/KhedutSaathi/frontend/public/images/news-fallbacks

download() {
  curl -s -L -o "$1" "https://image.pollinations.ai/prompt/$2?width=800&height=600&seed=$3"
}

download agriculture-1.jpg "agriculture%20farm%20landscape" 1
download agriculture-2.jpg "agriculture%20farm%20landscape" 2
download agriculture-3.jpg "agriculture%20farm%20landscape" 3
download agriculture-4.jpg "agriculture%20farm%20landscape" 4
download agriculture-5.jpg "agriculture%20farm%20landscape" 5

download weather-1.jpg "weather%20climate%20rain%20farm" 1
download weather-2.jpg "weather%20climate%20rain%20farm" 2
download weather-3.jpg "weather%20climate%20rain%20farm" 3
download weather-4.jpg "weather%20climate%20rain%20farm" 4

download government-1.jpg "government%20building%20india" 1
download government-2.jpg "government%20building%20india" 2
download government-3.jpg "government%20building%20india" 3

download market-1.jpg "farmers%20market%20vegetables" 1
download market-2.jpg "farmers%20market%20vegetables" 2
download market-3.jpg "farmers%20market%20vegetables" 3
download market-4.jpg "farmers%20market%20vegetables" 4

download crop-health-1.jpg "healthy%20crops%20leaves" 1
download crop-health-2.jpg "healthy%20crops%20leaves" 2
download crop-health-3.jpg "healthy%20crops%20leaves" 3
download crop-health-4.jpg "healthy%20crops%20leaves" 4

download default.jpg "agriculture%20news" 10
