
const url = 'http://localhost:3000/api/sift';
const body = JSON.stringify({
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173', // Famous dog video (likely safe/public)
    platform: 'tiktok'
});

console.log('Testing Sift with TikTok URL:', body);

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body
})
    .then(async res => {
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
    })
    .catch(err => console.error(err));
