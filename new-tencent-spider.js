//http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&callback=jQuery191009402303422004277_1557815763578&iSortType=0&page_index=1&hasMore=true&stUserId=769563763&page_size=20&_=1557815763582
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
    fs.writeFileSync('./harvest/tencent/新京报-阅读量数据统计.xlsx', buffer, {
        'flag': 'w'
    }); //生成excel
};

// let url = 'http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&iSortType=0&hasMore=true&stUserId=769563763&page_size=20&_=1557815763582&callback=callback';
let url = 'http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&iSortType=0&hasMore=true&stUserId=2955448967&page_size=20&_=1557817147319&callback=callback';

const startRequest = () => {
    const newUrl = url + '&page_index=' + pageNum;
    //采用http模块向服务器发起一次get请求
    http.get(newUrl, function (res) {
        let json = ''; //用来存储请求网页的整个html内容
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            json += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
            function callback(data) {
                const videoList = data.data.vecVidInfo;
                let lastDate;
                videoList.forEach(({
                    mapKeyValue: {
                        title,
                        view_all_count,
                        create_time
                    }
                }) => {
                    console.log(title, view_all_count, create_time)
                    title = title.replace(/,/g, "，").replace(/:/g, "：")
                    view_all_count = Number(view_all_count);
                    const d = new Date(Date.parse(create_time.replace(/-/g, "/")));
                    const month = d.getMonth();
                    const date = d.getDate();
                    console.log(month, date)
                    if (date >= 6 && date <= 12) {
                        list.push([title, view_all_count, create_time]);
                    }
                    lastDate = date;
                });

                if (lastDate <= 5) {
                    writeXlsx(list);
                    console.log('Complete')
                } else {
                    console.log('Continue')
                    pageNum++;
                    startRequest();
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
startRequest(); //主程序开始运行