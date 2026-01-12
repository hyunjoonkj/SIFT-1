
const url = 'http://localhost:3000/api/sift';
const body = JSON.stringify({
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    platform: 'tiktok'
});

console.log('Testing Sift (TikTok)...');

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body
})
    .then(async res => {
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            if (data.page && data.page.tags && data.page.tags.includes('Bookmark')) {
                console.log('STATUS: FALLBACK (Bookmark detected)');
                console.log('Summary:', data.page.summary);
            } else if (data.page) {
                console.log('STATUS: SUCCESS');
                console.log('Category:', data.page.metadata.category);
                console.log('Tags:', data.page.tags);
            } else {
                console.log('STATUS: ERROR');
                console.log('Response:', text);
            }
        } catch (e) {
            console.log('STATUS: PARSE_ERROR');
            console.log('Raw:', text);
        }
    })
    .catch(err => console.error(err));
