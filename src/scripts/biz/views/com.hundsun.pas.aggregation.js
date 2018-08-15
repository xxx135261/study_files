/*
* 维度模块，非api的公用方法
* add by ykf 20171213
*/
import '../api/com.hundsun.pas.configs.js';
import '../api/com.hundsun.pas.api.value.repoconfigs.js';
import '../api/com.hundsun.pas.customvaluedefinitions.js';
import CommonTools from './../../core/util/com.hundsun.pas.common.util.public_methods.js'

var aggregation = {
    /**
     * 返回config表
     * @param name
     * @param type
     * @param callBack
     */
    searchConfigs: function (name, type, callBack) {
        var data = {type: type}, results = [], i = 0;
        if (name) {
            data.name = name;
        }
        com.hundsun.pas.configs.get(data).pipe(function (result) {
            for (var index in result.data[1]) {
                var config = result.data[1][index];
                results[i++] = config;
            }
            callBack(results);
        });
    },
    /**
     *
     * @param uid
     * @param callBack
     */
    searchConfigsByUid: function (uid, callBack) {
        com.hundsun.pas.configs.getByUid(uid).pipe(function (result) {
            var results = [], i = 0;
            for (var index in result.data[1]) {
                var config = result.data[1][index];
                results[i++] = config;
            }
            callBack(results);
        });
    },

    /**
     * 分页查询config表
     */
    searchConfigsByPg: function (name, type, pgNum, callBack) {
        var data = {name: name, type: type.substring(type.lastIndexOf('.') + 1), pgNum: pgNum, pgSze: 5},
            results = {totalItems: 0, data: []}, i = 0;
        com.hundsun.pas.configs.getPg(data).pipe(function (result) {
            let data = result.data;
            results.totalItems = data[1].paging.totalItems;
            for (var index in data[1].documents) {
                results.data[i++] = data[1].documents[index].config;
            }
            callBack(results);
        });
    },

    /**
     * 返回所需指标根据type: 0(不参与维度聚合的指标) 1(参与维度聚合的指标) null(所有指标), valueCalcName: 为空就仅根据类型筛选，notNull仅选匹配计算名称的指标
     * @param type
     * @param valueCalcName
     * @param callBack
     */
    searchValueRepoConfig: function (type, valueCalcName, callBack) {
        var results = [], i = 0;
        com.hundsun.pas.value.repoconfigs.getValues(type, valueCalcName).pipe(function (result) {
            var result = result.data[1];
            delete result["-2"];
            for (var attribute in result) {
                if (typeof result[attribute] === 'object') {
                    results[i++] = result[attribute];
                }
            }
            callBack(results);
        });
    },

    /**
     * 更新单个config
     * 目前只返回错误500
     **/
    updateConfig: function (configId, name, data, type, callBack) {
        var config = configId.toString().split("~");
        config = config[0] + "~" + config[1];
        //添加ordinal = 0(fudgemesg)
        data["0"] = type;
        var data = new CommonTools().getRidOfNullData(data);
        var metaData = new CommonTools().toJsonMeta(data);
        var configJSON = {data: data, meta: metaData};
        var request = {configId: config, name: name, configJSON: JSON.stringify(configJSON)};
        com.hundsun.pas.configs.put(request).always(result => {
            if ($.isFunction(callBack)) {
                callBack(result);
            }
        });
    },

    /**
     * 新增config
     * 目前只返回错误500
     **/
    addConfig: function (name, data, type, callBack) {
        //添加ordinal = 0(fudgemesg)
        data["0"] = type;
        var data = new CommonTools().getRidOfNullData(data);
        var metaData = new CommonTools().toJsonMeta(data);
        var configJSON = {data: data, meta: metaData};
        var request = {
            name: name,
            configJSON: JSON.stringify(configJSON),
            type: type.substring(type.lastIndexOf('.') + 1)
        };
        com.hundsun.pas.configs.add(request).always(result => {
            if ($.isFunction(callBack)) {
                callBack(result);
            }
        });
    },

    /**
     * 删除config
     * 目前只返回错误500
     **/
    delConfig: function (configId, callBack) {
        var request = {configId: configId};
        com.hundsun.pas.configs.del(request).always(result => {
            if ($.isFunction(callBack)) {
                callBack(result);
            }
        });
    },

    /**
     * 获取所有自定义指标
     *
     * @param callback
     * @return {Object} key为uniqueId
     */
    searchCustomizedValueConfigs: function (callback) {
        com.hundsun.pas.customvalueDefinitions.get().then(result => {
            let valueConfigs = {}, rs = result.data;
            if (rs && rs.length >= 2) {
                const data = rs[1], keys = Object.keys(data);
                let key, value;
                for (let i = 4; i < keys.length; i++) {
                    value = data[keys[i]];
                    // i为偶数
                    if (i % 2 == 0) {
                        key = value;
                    } else {
                        valueConfigs[key] = value
                    }
                }
            }
            if (callback && $.isFunction(callback)) {
                callback(valueConfigs);
            }
        });
    },

    /**
     * 获取单个自定义指标
     *
     * @param uniqueId
     * @param callback
     */
    searchCustomizedValueConfigById: function (uniqueId, callback) {
        com.hundsun.pas.customvalueDefinitions.getSingle(uniqueId).then(result => {
            let valueConfigs = {}, rs = result.data;
            if (rs && rs.length >= 2) {
                const data = rs[1];
                valueConfigs = data;
            }
            if (callback && $.isFunction(callback)) {
                callback(valueConfigs);
            }
        });
    }
}

export default aggregation;
