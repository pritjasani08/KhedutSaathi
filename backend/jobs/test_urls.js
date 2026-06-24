const urls = [
  "https://www.india.gov.in/topics/agriculture",
  "https://data.gov.in/"
];

const verify = async () => {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (res.status >= 200 && res.status < 500) {
        console.log(`[OK] ${url}`);
      } else {
        const getRes = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
        if (getRes.status >= 200 && getRes.status < 500) console.log(`[OK] ${url}`);
        else console.log(`[FAIL] ${url}`);
      }
    } catch (e) {
      console.log(`[FAIL] ${url} - ${e.message}`);
    }
  }
};
verify();
