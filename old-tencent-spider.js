//http://c.v.qq.com/vchannelinfo?otype=json&uin=ea1b1b8626787db2d198c58fb86eb4dc&qm=1&pagenum=1&num=50&sorttype=0&orderflag=0&callback=callback&low_login=1&_=1554648724958
const
    http = require('http'),
    fs = require('fs'),
    xlsx = require('node-xlsx');

let list = [
        ['标题', '阅读量', '时间']
    ],
    pageNum = 1;

const writeXlsx = data => {
    const buffer = xlsx.build([{
        name: 'Tencent Video Reading',
        data
    }]);
    fs.writeFileSync('./harvest/tencent/new.xlsx', buffer, {
        'flag': 'w'
    }); //生成excel
};

const startRequest = (page, url) => {
    url += '&pagenum=' + pageNum;
    //采用http模块向服务器发起一次get请求
    http.get(url, function (res) {
        let json = ''; //用来存储请求网页的整个html内容
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            json += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
            function callback(data) {
                data.videolst.forEach(({
                    title,
                    play_count,
                    uploadtime
                }) => {
                    title = title.replace(/,/g, "，").replace(/:/g, "：")
                    play_count = play_count.replace('万', '') * 10000;
                    list.push([title, play_count, uploadtime]);
                });
                if (pageNum == page) {
                    writeXlsx(list);
                    console.log('Complete')
                } else {
                    pageNum++;
                    startRequest(page, url);
                }
            }
            eval(json);
        });
    }).on('error', function (err) {
        console.log(err);
    });

};

/**
 * @param {Number} pageNum 页码
 * @param {String} url 访问的url
 */
startRequest(3, "http://c.v.qq.com/vchannelinfo?otype=json&uin=ea1b1b8626787db2d198c58fb86eb4dc&qm=1&num=24&sorttype=0&orderflag=0&low_login=1&_=1554648724958&callback=callback"); //主程序开始运行