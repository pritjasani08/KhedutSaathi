const axios = require('axios');

async function testMarketFeed() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'workforcharge007@gmail.com',
      password: '1234'
    });
    
    const token = loginRes.data.token || (loginRes.data.data && loginRes.data.data.session && loginRes.data.data.session.access_token) || loginRes.data.access_token;
    
    if (!token) {
        console.log('Login successful but no token found. Response:', loginRes.data);
        return;
    }
    
    console.log('Login successful');

    const feedRes = await axios.get('http://localhost:5000/api/market-prices/feed', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Farmer:', feedRes.data.data.farmer);
    console.log('Summary:', feedRes.data.data.summary);
    
    console.log('\nTop 5 Markets Returned:');
    feedRes.data.data.markets.slice(0, 5).forEach(m => {
        console.log(`- ${m.market}, ${m.district} (${m.state}): ${m.commodity} @ ₹${m.modal_price} [${m.matchLabel}]`);
    });
    
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testMarketFeed();
