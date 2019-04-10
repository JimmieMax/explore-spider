// 1 step
const script = document.createElement("script");
script.src = "https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js";
const s = document.getElementsByTagName("script")[0];
s.parentNode.insertBefore(script, s);

// 2 step
let arr = [],
    page = 2,
    sequence = 1;

const currentCrawl = () => {
    $('.figures_list li').each(function (index, item) {
        let title = $(this).find('strong a').text(),
            reading = $(this).find('.figure_info .info_inner').text(),
            time = $(this).find('.figure_info .figure_info_time').text();
        if (reading.includes('万')) {
            reading = reading.replace('万', '') * 10000;
        }
        arr.push({'id': sequence, 'title': title, 'reading': reading, 'time': time});
        sequence++;
    });
    console.log(`爬取第${page - 1}页成功，正在跳转第${page}页`);
    $('.page_next')[0].click();
    page++
};

const tableToExcel = () => {
    console.log(`正在导出数据`);
    //列标题，逗号隔开，每一个逗号就是隔开一个单元格
    let str = `序号,标题,浏览量,时间\n`;
    //增加\t为了不让表格显示科学计数法或者其他格式
    for (let i = 0; i < arr.length; i++) {
        for (let item in arr[i]) {
            str += `${arr[i][item]},`;
        }
        str += '\n';
    }
    //encodeURIComponent解决中文乱码
    let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    //通过创建a标签实现
    let link = document.createElement("a");
    link.href = uri;
    //对下载的文件命名
    link.download = "数据表.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//爬取当前页
currentCrawl();
//导出数据
tableToExcel();