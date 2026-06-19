#!/bin/bash
cd /Users/pareshtank/Documents/KHEDUTSATHI/KhedutSaathi/frontend/public/images/news-fallbacks

download() {
  echo "Downloading $1..."
  # Use prompt as path and nologo=true
  curl -s -L -o "$1" "https://image.pollinations.ai/prompt/$2?width=800&height=600&nologo=true&seed=$3"
  sleep 2
}

# Agriculture (5)
download agriculture-1.jpg "lush%20green%20crop%20fields%20farming%20agriculture" 101
download agriculture-2.jpg "indian%20farmers%20working%20in%20agricultural%20field" 102
download agriculture-3.jpg "modern%20farming%20tractor%20plowing%20agricultural%20field" 103
download agriculture-4.jpg "agricultural%20irrigation%20system%20watering%20crops%20farm" 104
download agriculture-5.jpg "fruit%20orchard%20farming%20agriculture%20trees" 105

# Weather (4)
download weather-1.jpg "heavy%20rainfall%20on%20green%20farm%20crops%20agriculture" 106
download weather-2.jpg "dark%20monsoon%20storm%20clouds%20over%20agricultural%20wheat%20field" 107
download weather-3.jpg "farmer%20looking%20at%20stormy%20sky%20weather%20alert%20field" 108
download weather-4.jpg "rain%20pouring%20over%20lush%20green%20agricultural%20farm" 109

# Government (3)
download government-1.jpg "indian%20farmer%20filling%20government%20scheme%20documents%20rural" 110
download government-2.jpg "rural%20government%20agriculture%20office%20farmers" 111
download government-3.jpg "farmer%20shaking%20hands%20with%20agriculture%20official%20subsidy" 112

# Market (4)
download market-1.jpg "busy%20indian%20farmer%20mandi%20produce%20market%20vegetables" 113
download market-2.jpg "sacks%20of%20grain%20crop%20trading%20agriculture%20market" 114
download market-3.jpg "fresh%20produce%20vegetable%20market%20stall%20farming" 115
download market-4.jpg "farmers%20selling%20harvested%20crops%20at%20agricultural%20market" 116

# Crop Health (4)
download crop-health-1.jpg "close%20up%20of%20very%20healthy%20green%20crop%20leaves%20agriculture" 117
download crop-health-2.jpg "agronomist%20inspecting%20crop%20leaf%20disease%20detection%20farm" 118
download crop-health-3.jpg "farmer%20inspecting%20plants%20in%20agricultural%20field" 119
download crop-health-4.jpg "agricultural%20scientist%20examining%20crop%20health%20farm" 120

download default.jpg "general%20agriculture%20farming%20news%20landscape" 121

echo "Done!"
