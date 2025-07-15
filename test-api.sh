#!/bin/bash

# Aether Beasts - API Test Script

API_BASE="http://localhost:3001"

echo "🧪 Testing Aether Beasts API..."

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
response=$(curl -s -w "HTTP_STATUS:%{http_code}" $API_BASE/api/health)
status=$(echo $response | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
body=$(echo $response | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$status" = "200" ]; then
    echo "✅ Health check passed: $body"
else
    echo "❌ Health check failed: HTTP $status"
fi

# Test 2: Get Mythologies
echo -e "\n2. Testing Mythologies Endpoint..."
response=$(curl -s -w "HTTP_STATUS:%{http_code}" $API_BASE/api/mythologies)
status=$(echo $response | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
body=$(echo $response | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$status" = "200" ]; then
    echo "✅ Mythologies endpoint passed: $body"
else
    echo "❌ Mythologies endpoint failed: HTTP $status"
fi

# Test 3: Get All Cards
echo -e "\n3. Testing All Cards Endpoint..."
response=$(curl -s -w "HTTP_STATUS:%{http_code}" $API_BASE/api/cards)
status=$(echo $response | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$status" = "200" ]; then
    card_count=$(echo $response | sed 's/HTTP_STATUS:[0-9]*$//' | jq length 2>/dev/null || echo "unknown")
    echo "✅ All cards endpoint passed: $card_count cards loaded"
else
    echo "❌ All cards endpoint failed: HTTP $status"
fi

# Test 4: Get Cards by Mythology
mythologies=("greek" "egyptian" "norse" "chinese")
for mythology in "${mythologies[@]}"; do
    echo -e "\n4.$((${#mythologies[@]} - ${#mythologies[@]} + $(echo ${mythologies[@]} | tr ' ' '\n' | grep -n $mythology | cut -d: -f1))). Testing $mythology Cards..."
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" $API_BASE/api/cards/$mythology)
    status=$(echo $response | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$status" = "200" ]; then
        card_count=$(echo $response | sed 's/HTTP_STATUS:[0-9]*$//' | jq length 2>/dev/null || echo "unknown")
        echo "✅ $mythology cards endpoint passed: $card_count cards"
    else
        echo "❌ $mythology cards endpoint failed: HTTP $status"
    fi
done

echo -e "\n🎮 API testing complete!"
echo "If all tests passed, the backend is ready for the game!"
