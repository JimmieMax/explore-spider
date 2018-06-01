const
    http = require('http'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    xlsx = require('node-xlsx');

const writeXlsx = datas => {
    let buffer = xlsx.build([
        {
            name: 'Tencent Video Reading',
            data: datas
        }
    ]);
    fs.writeFileSync('./harvest/tencent/1.xlsx', buffer, {'flag': 'w'});   //生成excel
};

//该函数的作用：在本地存储所爬取的新闻内容资源
const savedContent = $ => {
    let datas = [];
    datas.push(['标题', '阅读量']);
    $('.figures_list li').each(function (index, item) {
        let x = $(this).find('strong a').text();
        let y = $(this).find('.figure_info .info_inner').text();
        console.log(x, y);
        let data = [x, y];
        datas.push(data);    //一行一行添加的 不是一列一列
    });
    writeXlsx(datas);
};

const startRequest = x => {
    //采用http模块向服务器发起一次get请求
    http.get(x, function (res) {
        let html = '';        //用来存储请求网页的整个html内容
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
            let $ = cheerio.load(html); //采用cheerio模块解析html
            savedContent($);  //存储每篇文章的内容及文章标题
        });
    }).on('error', function (err) {
        console.log(err);
    });

};

startRequest("http://v.qq.com/vplus/wevideo/videos");      //主程序开始运行