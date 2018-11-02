const
    http = require('http'),
    https = require('https'),
    cheerio = require('cheerio');


//该函数的作用：在本地存储所爬取的新闻内容资源
const savedContent = $ => {
    $('head link').each((index, item) => {
        // console.log(item);
        if (item.attribs.rel.toLowerCase().includes('shortcut')) {
            let href = item.attribs.href;
            if (href.startsWith('//')) {
                href = href.replace('//', '')
            }
            console.log(href)
        }
    });
};

const startRequest = async urls => {
    let promises = urls.map(({
        url
    }) => {
        return new Promise((reslove) =>{
            //采用http模块向服务器发起一次get请求
            let request = url.startsWith('https') ? https : http;
            request.get(url, (res) => {
                let html = ''; //用来存储请求网页的整个html内容
                res.setEncoding('utf-8'); //防止中文乱码
                //监听data事件，每次取一块数据
                res.on('data', (chunk) => {
                    html += chunk;
                });
                //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
                res.on('end', () => {
                    let $ = cheerio.load(html); //采用cheerio模块解析html
                    savedContent($,(href)=>{
                        reslove(href);
                    }); //存储每篇文章的内容及文章标题
                });
            }).on('error', (err) => {
                console.log(err);
            });
        })
    });
    // Promise.all(promises).then(() => {
    //     console.log('end')
    // });
    for(let promise of promises){
        await promise;
    }
    console.log('end')
};

startRequest([{
    url: "http://v.qq.com/vplus/wevideo/videos"
}, {
    url: 'https://zhidao.baidu.com/question/1884037713209785948.html'
}, {
    url: 'https://www.npmjs.com/package/cheerio'
}, {
    url: 'http://www.geek.cn/'
}, {
    url: 'https://bbs.csdn.net/topics/392358677?page=1'
}]); //主程序开始运行