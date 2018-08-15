/**
 * Created by mengjq on 2016/4/28.
 */
$.register_module({
    name: 'og.api.rest.views.parame',
    dependencies: [],
    obj: function () {
        /**
         * 全局参数列表
         */
        var GlobalParam = {
            aggregators: [],
            viewdefinition: "",
            aggDefUniqueId: "",
            providers: [{}],
            portfolio: "",
            valuation: "",
            version: "",
            type: "",
            correction: "",
            benchId: "",
            calcTimeParam: "",
            securityType: ""
        };
        var request = "calcTimeParam";
        return {
            xhrArgs: function (/*clazz, attribute,*/module, _arguments) {
                var args = $.extend(true, module, _arguments);  //Object.assign(this[clazz][attribute], arguments);
                return this.common.readParame(args);
            },
            // navigation: { //导航栏
            //     myConcern: {
            //         viewdefinition/jax/components/AggregatedPortfolioProvider/main/getPortfolioAggregationProviderFunctionsKeyset
            //     },
            //     recentVisit: {},
            //     combination: {}
            // },

            /**
             * 我的组合
             */
            myCombination: {
                children: {
                    version: "myCombination_children",
                    viewdefinition: "DbCfg~13",
                    portfolio: "AgPrt~UserPortfolios"
                },
                basicInfo: {
                    viewdefinition: 'DbCfg~45'
                }
            },
            /**
             * 最近访问
             */
            recentVisit: {
                children: {
                    version: "recentVisit_children",
                    viewdefinition: 'DbCfg~12',
                    portfolio: "AgPrt~UserRecentVisited"
                },
                basicInfo: {
                    viewdefinition: 'DbCfg~47'
                }
            },
            /**
             * 我的关注
             */
            myConcern: {
                children: {
                    version: "myConcern_children",
                    viewdefinition: "DbCfg~11",
                    portfolio: "AgPrt~UserFocused"
                },
                basicInfo: {
                    viewdefinition: 'DbCfg~48'
                }
            },
            /**
             *
             */
            realtimeStare: {
                /**
                 * 股票分时图
                 * @returns {{aggregators: Array, providers: *[], viewdefinition: string, portfolio: string, valuation: string, version: string, correction: string}}
                 */
                timeTicketBaseLine: {
                    viewdefinition: 'DbCfg~17'
                },
                timeTicket: {
                    viewdefinition: 'DbCfg~15'
                },
                realtimeGrid: {
                    aggregators: ["SecurityType", JSON.stringify([{name: '股票', func: 'Industry one'}])],
                    viewdefinition: 'DbCfg~16',
                    aggDefUniqueId: 'DbCfg~105'
                }
            },
            test: {
                grid: {
                    viewdefinition: 'DbCfg~1770~0'
                }
            },
            /**
             * 组合概貌
             */
            compositeProfile: {
                //todo 暂未实现
                gains: {
                    viewdefinition: 'DbCfg~21'
                },
                basicInfo: {
                    viewdefinition: 'DbCfg~18'
                },
                fundIndexs: {
                    viewdefinition: 'DbCfg~19'
                },
                riskIndexs: {
                    viewdefinition: 'DbCfg~20'
                },
                historicalNetWorth: {
                    viewdefinition: 'DbCfg~25'
                }
            }
            ,
            /**
             * 持仓分析
             */
            positionAnalysis: {
                //重仓股
                awkwardness: {
                    viewdefinition: 'DbCfg~27'
                },
                //行业
                heavyIndustry: {
                    // Industry one
                    aggDefUniqueId: 'DbCfg~106',
                    aggregators: ["Industry one"],
                    viewdefinition: 'DbCfg~28'
                },
                //持仓明细
                detailbut: {
                    viewdefinition: 'DbCfg~23'
                },
                //仓位走势
                reportEchartData: {
                    type: "portfolio", viewdefinition: "DbCfg~22"
                }

            },
            /**
             * 调仓分析
             */
            siloAnalysis: {
                //todo 暂未实现
                //
                fivedealInfo: { //
                    viewdefinition: 'DbCfg~32',
                },
                adjustedInfo: { //
                    viewdefinition: "DbCfg~33"
                },
                dailyExchangeRate: {
                    viewdefinition: 'DbCfg~29'
                },
                detailYield: {
                    viewdefinition: "DbCfg~33"
                },
                siloInfo: {
                    viewdefinition: 'DbCfg~39'
                },
                awkwardnessSell: {
                    viewdefinition: 'DbCfg~26'
                },
                awkwardnessBuy: {
                    viewdefinition: 'DbCfg~24'
                },
                awkwardness: {},
                heavyIndustry: {},
                warehouseAnalytics: {
                    viewdefinition: 'DbCfg~39'
                },
                heavyIndustryYield: {
                    viewdefinition: 'DbCfg~30'
                },
                heavyIndustryLoss: {
                    viewdefinition: 'DbCfg~31'
                }

            },
            /**
             * 风险分析
             */
            riskAnalysis: {
                //总体分析
                valueList: {
                    viewdefinition: 'DbCfg~46'
                },
                //最大回撤
                retreatEchartData: {
                    type: "portfolio", viewdefinition: "DbCfg~46"
                },
                varRank: {
                    viewdefinition: "DbCfg~49",
                    portfolio: "AgPrt~UserPortfolios"
                }
            },
            /**
             * 盈亏分析
             */
            profitAndLoss: {
                //todo 暂时实现
                awkwardnessProfit: {
                    viewdefinition: 'DbCfg~34'
                },
                awkwardnessLoss: {
                    viewdefinition: 'DbCfg~35'
                },
                profitInfo: {
                    viewdefinition: 'DbCfg~38'
                },
                profInfo: {//盈亏分析总体分析
                    viewdefinition: 'DbCfg~40'
                },
                riskadjustedRadio: {
                    viewdefinition: 'DbCfg~41',
                    portfolio: "AgPrt~UserPortfolios"
                },
                yieldRanking: {
                    viewdefinition: 'DbCfg~42',
                    portfolio: "AgPrt~UserPortfolios"
                },
                riskadjusted: {
                    viewdefinition: "DbCfg~37"
                },
                yieldEchartData: {
                    viewdefinition: 'DbCfg~36'
                }
            },
            /***
             * 归因分析
             */
            attriBution: {
                //收益拆分
                basicInfo: {
                    // Industry one
                    aggDefUniqueId: 'DbCfg~106',
                    aggregators: ["Industry one"],
                    viewdefinition: "DbCfg~43"
                },
                //行业配置
                pieChartData: {
                    // Industry one
                    aggDefUniqueId: 'DbCfg~106',
                    aggregators: ["Industry one"],
                    viewdefinition: "DbCfg~44"
                }
            },
            /**
             * 自定义指标配置
             */
            customValDefConfiguration: {
                /*自定义*/
                customize: {
                    type: 'com.hundsun.frcp.financial.CustomValueClassification',
                    uniqueId: 'DbCfg~666'
                },
                /*基础*/
                essential: {
                    type: 'com.hundsun.frcp.financial.CustomValueClassification',
                    uniqueId: 'DbCfg~665'
                }
            },
            common: {
                getDateType: function (dateType) {
                    var dateParam = '-P1M';
                    switch (dateType) {
                        case '0':
                            dateParam = '-P1D';
                            break;
                        case '1':
                            dateParam = '-P7D';
                            break;
                        case '2':
                            dateParam = '-P1M';
                            break;
                        case '3':
                            dateParam = '-P3M';
                            break;
                        case '4':
                            dateParam = '-P6M';
                            break;
                        case '5':
                            dateParam = '-P1Y';
                            break;
                        case '6':
                            dateParam = 'YearEnd(-P1Y)';
                            break;
                    }
                    return dateParam;
                },
                /**
                 * 读取请求参数
                 * @param source
                 * @param target
                 * @returns {*}
                 */
                readParame: function (source) {
                    var _target = Object.assign({}, GlobalParam);
                    if (source) {
                        for (var key in source) {
                            _target[key] = (request == key) ? this.getDateType(source[key]) : source[key];
                        }
                    }
                    return _target;
                }
            }
        }
    }
});
