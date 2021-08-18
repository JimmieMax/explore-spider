const axios = require('axios');

const fetchNavigation = (link, isHttps) => {
    return new Promise(async (resolve, reject) => {
        link = (/^http/.test(link) ? '' : `${isHttps? 'https' : 'http'}://`) + link;
        const linkObj = new URL(link);
        const res = await axios.get(link);
        let result = null;
        if (res && res.data) {
            const iconTagReg = /<link\s[^<]*rel\=\"(shortcut\s)?icon\"[^<]*>/i;
            const iconUrlReg = /href="(.+?)"/i;
            const titleReg = /<title>([\s\S]+?)<\/title>/i;
            const html = res.data;
            let iconTagArr = html.match(iconTagReg);
            let titleTagArr = html.match(titleReg);
            let title = titleTagArr ? titleTagArr[1] : '';
            let faviconUrl = '';
            if (iconTagArr) {
                faviconUrl = iconTagArr[0].match(iconUrlReg)[1];
            } else {
                let guessFaviconUrl = `${linkObj.origin}/favicon.ico`;
                const res = await axios.get(guessFaviconUrl);
                if (res && res.status === 200) {
                    faviconUrl = `//${linkObj.host}/favicon.ico`;
                }
            }
            title = title.replace(/\n/g, '');
            faviconUrl = faviconUrl.replace(/^\.?\/{1}/, `//${linkObj.host}/`);
            result = {
                title,
                faviconUrl
            };
        }
        resolve(result);
    })
}

const getValue = (obj, prop) => {
    return obj ? obj[prop] : ''
}

const fetchNavigationInfo = (link) => {
    return new Promise((resolve, reject) => {
        Promise.all([fetchNavigation(link, true), fetchNavigation(link, false)]).then((results) => {
            const [httpsResult, httpResult] = results;
            resolve({
                title: getValue(httpsResult, 'title') || getValue(httpResult, 'title'),
                faviconUrl: getValue(httpsResult, 'faviconUrl') || getValue(httpResult, 'faviconUrl')
            })
        })
    })
}

fetchNavigationInfo('baidu.com').then(result => {
    console.log('baidu.com:', result)
});