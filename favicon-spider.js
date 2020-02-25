const axios = require('axios');

const fetchFavicon = async (link) => {
    link = (link.includes('http', 0) ? '' : 'http://') + link
    const linkObj = new URL(link);
    let faviconUrl = '';
    let guessFaviconUrl = `${linkObj.origin}/favicon.ico`;
    const res = await axios.get(guessFaviconUrl).catch(err => {
        // throw err;
    });
    if (res && res.status === 200) {
        faviconUrl = guessFaviconUrl;
    } else {
        const res = await axios.get(link).catch(err => {
            // throw err;
        });
        if (res && res.data) {
            const iconTagReg = /<link[^>]+?shortcut.+?>/i;
            const iconUrlReg = /href="(.+?)"/i;
            const html = res.data;
            let iconTag = html.match(iconTagReg);
            if (iconTag) {
                iconTag = html.match(iconTagReg)[0].replace(/\s/g, '');
                faviconUrl = iconTag.match(iconUrlReg)[1];
            }
        }
    }
    return faviconUrl;
}

fetchFavicon('https://max-ui.netlify.com/favicon.ico').then(url => {
    console.log(url)
});