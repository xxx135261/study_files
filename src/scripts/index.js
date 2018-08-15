/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/4/18  mengjq  新增
 * ========    =======  ============================================
 */
import "bootstrap";
import "ztree-vue";
// import "handlebars";

import "./core/util/js.ext.array.prototype.pluck.js";
import "./core/util/js.ext.array.prototype.reduce.js";
import "./core/util/js.ext.function.prototype.partial.js";
import "./core/util/js.ext.object.equals.js";
import "./core/util/js.ext.object.clone.js";
import "./core/util/js.ext.object.create.js";
import "./core/util/js.ext.object.keys.js";
import "./base/exterior/routemap.js";
import "./core/og.common.core.js";
import "./base/exterior/handlebars.min.js";
import "./base/jquery/jquery.cookie.js";
import "./base/jquery/jquery-blurkill.js";
import "./base/jquery/jquery-flot/jquery.flot";
import "./base/jquery/jquery-flot/jquery.flot.selection";
import "./base/jquery/jquery-ui.min.js";
import "./base/jquery/jquery.layout-latest.js";
import "./base/jquery/nicescroll/jquery.nicescroll.js";
import "./base/jquery/jquery-confirm.js";
import "./base/jquery/ztree/jquery.ztree.exhide.js";

import "./og.dev.js";
import "./og.app.js";
import "./biz/api/og.api.common.js";
import "./core/og.common.routes.js";
import "./core/og.common.id.js";
import "./core/og.common.events.js";
import "./biz/api/og.api.text.js";
import "./biz/api/og.api.rest.js";
import "./biz/api/og.api.rest.handshake.js";
import "./biz/api/og.api.rest.updates.js";
import "./biz/api/og.api.rest.subscribe.js";
import "./biz/api/og.api.rest.views.js";
import "./biz/api/og.api.rest.realtime.js";
import "./biz/api/og.api.rest.searchtext.js";
import "./biz/api/com.hundsun.pas.api.customviews.js";
import "./biz/api/com.hundsun.pas.api.userconcern.js";
import "./biz/api/com.hundsun.pas.api.userrecentaccsess.js";
import "./biz/api/com.hundsun.pas.api.vprt.portfolios.js";
import "./biz/api/com.hundsun.pas.api.vprt.feerate.js";
import "./biz/api/com.hundsun.pas.api.vprt.file.js";
import "./biz/api/com.hundsun.pas.api.vprt.alllocation.js";
import "./biz/api/com.hundsun.pas.api.vprt.position.js";
import "./biz/api/com.hundsun.pas.api.vprt.trade.js";
import "./biz/api/com.hundsun.pas.api.vprt.impmp.js";
import "./biz/analytics/og.analytics.data.js";
import "./biz/analytics/og.analytics.grid.data.js";
import "./biz/analytics/og.analytics.newdata.js";
import "./biz/analytics/og.analytics.realtime.stock.js";
import "./biz/analytics/og.analytics.cells.js";
import "./biz/analytics/og.analytics.echart.line.js";
import "./biz/analytics/og.analytics.data.chart.js";
import "./biz/analytics/og.analytics.multi.data.js";
import "./biz/analytics/og.analytics.multi.grid.js";
import "./biz/analytics/og.views.analytics.frame.js";
import "./biz/analytics/og.views.analytics.request.js";
import "./biz/analytics/og.views.analytics.line.js";
import "./biz/analytics/og.views.analytics.loaddata.js";
import "./core/util/com.hundsun.pas.common.util.parameter.js";
import "./core/util/com.hundsun.pas.common.util.utils.js";
import "./core/util/com.hundsun.pas.common.util.showNotice.js";
import "./core/util/com.hundsun.pas.common.util.common.js";
import "./core/util/com.hundsun.pas.common.util.number.js";
import "./core/util/com.hundsun.pas.common.util.modal_drag.js";

import "./widgets/gadgets/com.hundsun.pas.common.gadgets.resize.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.scrollbar_size.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.manger.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.mapping.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.cellmenu.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.dropmenu.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.gadgetscontainer.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.grid.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.depgraph.js";
import "./widgets/gadgets/com.hundsun.pas.common.timeseries";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.manager.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.timeseries.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.data.js";
import "./widgets/gadgets/com.hundsun.pas.common.util.date.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.log.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.histogram.js";
import "./widgets/gadgets/com.hundsun.pas.common.gadgets.histogram_plot.js";


import "./core/util/com.hundsun.pas.common.util.filters.js";
import "./core/util/com.hundsun.pas.common.util.echarts.js";
import "./core/util/com.hundsun.pas.common.array_shims";
import "./widgets/loading/loading.js";
import "./core/util/com.hundsun.pas.common.base64";

import "./core/util/com.hundsun.pas.common.util.public_methods";

