/**
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明
 * ========    =======  ============================================
 * 2017/12/29  mengjq  新增
 * ========    =======  ============================================
 */
const state = {
    echartConfig: {
        tooltip: {
            trigger: 'axis',
           	backgroundColor:'#528DFF',
            color:'#fff',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                	color:'#fff',
                    backgroundColor: '#528DFF',
                    borderRadius:'.3'
                },
                crossStyle: {
                    type: 'solid'
                }
            },
        },
        legend: {
            data: ['单位净值']
        },
        grid: {
            y: 30,
            y2: 30,
            x: 75,
            x2: 85
            // width: '80%',
            // height: '60%'
        },
        xAxis: [{
            type: 'value',
            axisLine: {
                show: true,
                onZero: false,
                
            }, 
            axisLabel: {
                formatter: function (value, index) {
                    var str;
                    switch (value) {
                        case 0:
                            str = "09:30";
                            break;
                        case 60:
                            str = "10:30";
                            break;
                        case 120:
                            str = "11:30/13:00";
                            break;
                        case 180:
                            str = "14:00";
                            break;
                        case 240:
                            str = "15:00";
                            break;
                    }
                    return str;
                }
            },
            boundaryGap: false,
            axisPointer: {
                show: true,
                label: {
                    formatter: function (params) {
                        function timeFormat(time) {
                            return time < 10 ? "0" + time : time;
                        }

                        var val = params.value;
                        var labelText;
                        if (val < 120) {
                            // 570代表9:30的分钟数
                            var time = 570 + val;
                            var hour = Math.floor(time / 60);
                            var min = Math.floor(time % 60);
                            labelText = timeFormat(hour) + ":" + timeFormat(min);
                        } else if (val === 120) {
                            labelText = "11:30/13:00";
                        } else {
                            // 660 = 780(13:00) - 120
                            var time = 660 + val;
                            var hour = Math.floor(time / 60);
                            var min = Math.floor(time % 60);
                            labelText = hour + ":" + timeFormat(min);
                        }
                        return labelText;
                    }
                },
                
            },
            interval: 60,
            min: 0,
            max: 240
        }],
        yAxis: [{
            max: 1.0500,
            min: 0.9500,
            type: 'value',
            splitNumber: 8,
            axisLabel: {
                formatter: function (val) {
                    return Number(val).toFixed(4);
                },
                textStyle: {
                    color: function (val) {
                        if (val) {
                            var val = Number(val);
                            return val === 1.00 ? 'black' : val > 1.00 ? 'red' : val < 1.00 ? 'green' : 'black';
                        }
                    }
                }
            },
            axisPointer: {
                label: {
                    show: true,
                    precision: 4
                }
            }
        }, {
            max: 0.0500,
            min: -0.0500,
            type: 'value',
            splitNumber: 8,
            axisLabel: {
                formatter: function (val) {
                    return (100 * Number(val)).toFixed(2) + '%';
                },
                textStyle: {
                    color: function (val) {
                        if (val) {
                            var val = 100 * Number(val);
                            return val === 0.00 ? 'black' : val > 0.00 ? 'red' : val < 0.00 ? 'green' : 'black';
                        }
                    }
                }
            },
            axisPointer: {
                label: {
                    show: true,
                    formatter: function (params) {
                        return (100 * Number(params.value)).toFixed(2) + '%';
                    },
                    color:'#fff',
                    backgroundColor: '#528DFF',
                    borderRadius:'.3'
                }
            }
        }],
        series: [{
            name: '单位净值',
            type: 'line',
            symbol: 'none',
            color:['#528DFF'],  //折线条的颜色
         	itemStyle: {
                normal: {
                    areaStyle: {
                        color:'RGBA(237, 243, 255, 0.7)'
                    }
                }
            },
            markLine: {
                silent: true,
                symbol: ['none', 'none'],
                animation: false,
                lineStyle: {
                    normal: {
                        type: 'dotted',
                        color: '#528DFF'
                    }
                },
                data: [
                    [{
                        coord: [0, 1]
                    }, {
                        coord: [240, 1]
                    }]
                ]
            },
            data: []
        }, {
            name: '当前时间',
            type: 'line',
            symbol: 'none',
            xAxisIndex: 0,
            markLine: {
                silent: true,
                symbol: ['none', 'none'],
                animation: false,
                lineStyle: {
                    normal: {
                        type: 'solid',
                        color: '#528DFF',
                        width: 0.2
                    }
                },
                data: [
                    [{
                        yAxis: 'max',
                        xAxis: 120
                    }, {
                        yAxis: 'min',
                        xAxis: 120
                    }]
                ],
               
            }
        }]
    }
}


export default {namespaced: true, state}