//http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&callback=jQuery191009402303422004277_1557815763578&iSortType=0&page_index=1&hasMore=true&stUserId=769563763&page_size=20&_=1557815763582
const
    http = require('http'),
    fs = require('fs'),
    xlsx = require('node-xlsx');

let list = [
        ['标题', '阅读量', '时间']
    ],
    pageNum = 1;

const writeXlsx = (name, data) => {
    const buffer = xlsx.build([{
        name: 'Tencent Video Reading',
        data
    }]);
    fs.writeFileSync(`./harvest/tencent/${name}-阅读量数据统计.xlsx`, buffer, {
        'flag': 'w'
    }); //生成excel
};
const toDate = (year, month, date) => new Date(year, month + 1, date);

// const options = {
//     name: '梨视频',
//     url: 'http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&iSortType=0&hasMore=true&stUserId=769563763&page_size=20&_=1557815763582&callback=callback'
// }
const options = {
    name: '新京报',
    url: 'http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&iSortType=0&hasMore=true&stUserId=2955448967&page_size=20&_=1557817147319&callback=callback'
}
// let url = 'http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&iSortType=0&hasMore=true&stUserId=769563763&page_size=20&_=1557815763582&callback=callback';
// 新京报
// let url = 'http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&iSortType=0&hasMore=true&stUserId=2955448967&page_size=20&_=1557817147319&callback=callback';
const begin = toDate(2019, 5, 13);
const end = toDate(2019, 5, 19);

const startRequest = () => {
    const newUrl = options.url + '&page_index=' + pageNum;
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
                    const year = d.getFullYear();
                    const month = d.getMonth() + 1;
                    const date = d.getDate();
                    const now = toDate(year, month, date);
                    if (now >= begin && now <= end) {
                        list.push([title, view_all_count, create_time]);
                    }
                    lastDate = now;
                });

                if (lastDate < begin) {
                    writeXlsx(options.name, list);
                    console.log('Complete!')
                } else {
                    console.log('Continue...')
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

startRequest(); //主程序开始运行