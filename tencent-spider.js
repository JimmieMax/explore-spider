//http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&callback=jQuery191009402303422004277_1557815763578&iSortType=0&page_index=1&hasMore=true&stUserId=769563763&page_size=20&_=1557815763582

const
    http = require('http'),
    fs = require('fs'),
    xlsx = require('node-xlsx');
const axios = require('axios');

const toDate = (year, month, date) => new Date(year, month + 1, date);
const BaseUrl = 'http://access.video.qq.com/pc_client/GetUserVidListPage?vappid=50662744&vsecret=64b037e091deae75d3840dbc5d565c58abe9ea733743bbaf&iSortType=0&hasMore=true&page_size=20&_=1557817147319&callback=callback'
const RequestList = [{
        name: '梨视频',
        stUserId: '769563763',
        pageNum: 1,
        list: []
    },
    {
        name: '新京报',
        stUserId: '2955448967',
        pageNum: 1,
        list: []
    },
    {
        name: '青蜂侠',
        stUserId: '2209767239',
        pageNum: 1,
        list: []
    },
]
// 生成excel
const writeXlsx = (name, data) => {
    data.unshift(['标题', '阅读量', '时间']);
    const buffer = xlsx.build([{
        name: 'Tencent Video Reading',
        data
    }]);
    fs.writeFileSync(`./harvest/tencent/${name}-阅读量数据统计.xlsx`, buffer, {
        'flag': 'w'
    }); 
};
// 发起请求
const request = async (options) => {
    const url = `${BaseUrl}&stUserId=${options.stUserId}&page_index=${options.pageNum}`;
    await axios.get(url).then((res)=>{
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
                if (!create_time) {
                    console.log('数据有错误，请重试！');
                    return;
                }
                const d = new Date(Date.parse(create_time.replace(/-/g, "/")));
                const year = d.getFullYear();
                const month = d.getMonth() + 1;
                const date = d.getDate();
                const now = toDate(year, month, date);
                if (now >= begin && now <= end) {
                    options.list.push([title, view_all_count, create_time]);
                }
                lastDate = now;
            });

            if (lastDate < begin) {
                writeXlsx(options.name, options.list);
                console.log(`${options.name} Complete!`)
            } else {
                console.log(`${options.name} ${lastDate} Continue...`)
                options.pageNum++;
                request(options);
            }
        }
        eval(res.data);
    })
}

RequestList.forEach((options)=>{
    request(options);
});

const begin = toDate(2019, 12, 16);
const end = toDate(2019, 12, 22);