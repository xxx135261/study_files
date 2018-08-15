/**
 * Created by Administrator on 6/23/2017.
 */
import CommonTools from './../../core/util/com.hundsun.pas.common.util.public_methods';

var commonTools = new CommonTools();

$.register_module({
    name: 'com.hundsun.pas.common.gadgets.CellMenu',
    dependencies: ['com.hundsun.pas.common.gadgets.mapping'],
    obj: function () {
        var module = this, mapping = com.hundsun.pas.common.gadgets.mapping;
        //cell_option选择器面板HTML代码
        var html_wrapper = {
            //单元格选择器
            div_cell_option: '<div class="OG-cell-options">\n' +
            // '    <div style="background-color: rgba(212,0,0,0.2);width: 200px;height: 32px;margin-left: -81px;margin-top: -5px;">' +
            '    <div class="og-group">\n' +
            '        <div class="og-inplace"></div>\n' +
            '    </div>\n' +
            '    <div class="og-cell-border og-cell-border-top"></div>\n' +
            '    <div class="og-cell-border og-cell-border-bottom"></div>\n' +
            '    <div class="og-cell-border og-cell-border-left"></div>\n' +
            // '</div>' +
            '</div>',
            //箭头指向单元格选择器
            div_inplace_tash: '<div class="OG-analytics-inplace">\n' +
            '  <div class="OG-icon og-icon-down-chevron og-menu-toggle og-focus"></div>\n' +
            '  <div class="OG-layout-analytics-{{this.name}} OG-gadgets-container og-menu">\n' +
            '    <div class="ui-layout-header">\n' +
            '    </div>\n' +
            '    <div class="ui-layout-content">\n' +
            '      <div class="OG-gadget-container">\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</div>'
        };
        /**
         *
         * @param gird
         * @param cell
         */
        var hide_menu = function (gird, cell) {

        }
        /**
         * 指标数据下钻,数据源接口对象.
         * @param table 需要绑定事件的单元格对象.
         * @param grid  表格数据源对象.
         * @author mengjq@hundsun.com.
         */
        var constructor = function (table, grid) {
            var cellmenu = this, inplace_config, timer;
            cellmenu.frozen = false; //用于记录，Depgraph 是否存在
            cellmenu.grid = $(table);
            cellmenu.id = '#' + og.common.id('cellmenu');
            cellmenu.ogGrid = grid;
            cellmenu.busy = (function (busy) { //用于记录当前Gadgetscontainer是否已经创建完毕
                return function (value) {
                    busy = value !== 'undefined' ? value : busy;
                    return busy;
                }
            }, false);

            //开始加载外部html
            /***
             * 1.读取布局div
             * 2.单元格绑定当鼠标指针位于元素上方时，触发下拉菜单的展现
             * 3.锁定单元格位置,跟随表格单元格,锁定下拉列表，用户展现下钻表格
             * @type {jQuery|HTMLElement}
             */
            var template = $(html_wrapper.div_cell_option);
            (cellmenu.menu = template).hide();

            var mouseoverHandler = function (cell) {
                var cellValue = $(cell.target).find('.pas-table-cell');
                // TODO：区分普通表格和表格组件。未来统一使用表格组件时可以去除此段逻辑。
                if (cellValue.length == 0) {
                    cellValue = $(cell.target);
                }

                // cell属性
                var cellAttr = cell.target.attributes.cell;
                var classList = cell.target.classList;
                // 为了解决IE10及以下，鼠标移到单元格值上下钻框会隐藏的问题
                if (Array.prototype.indexOf.call(classList, "pas-table-cell") > -1) {
                    cellAttr = cell.target.parentElement.attributes.cell;
                }

                // 为了解决IE10及以下，鼠标移到单元格的迷你折线图上下钻框会隐藏的问题
                if (cell.target.localName.toLowerCase() == 'canvas') {
                    cellAttr = cell.target.parentElement.parentElement.attributes.cell;
                    cellValue = $(cell.target.parentElement.parentElement).find('.pas-table-cell');
                }

                if (cellAttr == undefined || cellAttr == null || !cellAttr.value) {
                    return;
                }

                // 去除首尾空白符
                if (!cellValue.text().trim()) {
                    return;
                }
                if (!!(cellValue.text().indexOf('--') != -1)) {
                    return;
                }
                clearTimeout(timer);
                var $this = $(this);
                // console.log('显示：' + cellValue.text());
                cellmenu.current = cell.currentTarget;
                // 添加cell的属性（包括value、row_name、position_id等）
                cellmenu.current.cellOption = JSON.parse(cellAttr.value);
                cellmenu.row = $this.parent().index() + 1;//行的位置
                cellmenu.col = $this.index() + 1;//列位置
                if (cellmenu.frozen || cellmenu.busy) { //繁忙时，需要处理
                    return;
                }
                clearTimeout(timer);
                if (hide_menu(grid, cell)) {
                    cellmenu.hide();
                } else {
                    cellmenu.show(cellmenu.cell_coords(cellmenu.row, cellmenu.col));
                }
            }
            var mouseoutHandler = function (cell) {
                clearTimeout(timer);
                // console.log('隐藏' + cellmenu.id);
                if (commonTools.isIE()) {
                    timer = setTimeout(function () {
                        if (!cellmenu.menu.is(':hover')) {
                            cellmenu.hide();
                        }
                    }, 0);
                } else {
                    if (!cellmenu.menu.is(':hover')) {
                        cellmenu.hide();
                    }
                }
            }
            //表格中的单元格绑定事件
            cellmenu.grid.on('mouseover', mouseoverHandler).on('mouseout', mouseoutHandler);

            // 更新cellmenu绑定的表格
            cellmenu.updateGrid = function () {
                cellmenu.grid.off('mouseover', mouseoverHandler).off('mouseout', mouseoutHandler);
                cellmenu.grid = $(table);
                cellmenu.grid.on('mouseover', mouseoverHandler).on('mouseout', mouseoutHandler);
            }

            /**
             * 1.定义inplace组件
             * 2.
             *
             * @type {jQuery|HTMLElement}
             */
            var unique = og.common.id('inplace');
            inplace_config = {
                cntr: $('.og-inplace', cellmenu.menu),
                tmpl: html_wrapper.div_inplace_tash,
                data: {
                    name: unique
                }
            };
            cellmenu.inplace = new com.hundsun.pas.common.gadgets.DropMenu(inplace_config);
            cellmenu.container = new com.hundsun.pas.common.gadgets.GadgetsContainer('.OG-layout-analytics-', unique);
            cellmenu.inplace.$dom.toggle.on('click', function () {
                if (cellmenu.inplace.toggle_handler()) {
                    cellmenu.create_inplace('.OG-layout-analytics-' + unique, cellmenu.grid);
                    cellmenu.inplace.$dom.menu.blurkill(cellmenu.destroy_frozen.bind(cellmenu));
                } else {
                    cellmenu.destroy_frozen();
                }
            });
        };


        constructor.prototype.destroy_frozen = function () {
            $('.OG-cell-options.og-frozen').remove();
            $('.og-inplace-resizer').remove();
        };
        /**
         *
         * @param selector
         * @param grid
         */
        constructor.prototype.create_inplace = function (selector, grid) {
            var cellmenu = this, panel = 'inplace', options, cell = cellmenu.current, inner_height, inner_width,
                new_menu, cell_width = this.current.offsetWidth, offset = cellmenu.inplace.$dom.cntr.offset(),
                inner = cellmenu.inplace.$dom.menu, _currentCell = JSON.parse($(cell).attr('cell')),
                input = {
                    view_id: cellmenu.ogGrid.dataman.connection.view_id,
                    grid_type: cellmenu.ogGrid.dataman.connection.grid_type,
                    viewport_id: cellmenu.ogGrid.dataman.viewport_id,
                    row: _currentCell.row,
                    col: _currentCell.col
                };
            cell.type = _currentCell.type, cell.row = _currentCell.row, cell.col = _currentCell.col,
                cell.col_name = _currentCell.col_name, cell.row_name = {
                name: _currentCell.row_name,
                // nodeId: _currentCell.nodeId
            }, cell.value = {h: _currentCell.h, t: _currentCell.type, v: _currentCell.value};
            cellmenu.destroy_frozen();
            cellmenu.frozen = true; //Depgraph 处于打开状态
            cellmenu.menu.addClass('og-frozen');
            /** value requirements are not needed when:
             * 1. gadgets are launched off a depgraph
             * 2. Position/Trade gadgets are launched (cell.col = 0)
             */
            // if (false || cell.col || cellmenu.grid.source.depgraph) {
            // 0
            //
            // } else {
            og.api.rest.views.grid.viewports.valuereq.get(input).pipe(implement);

            // }
            function implement(result) {
                //翻译表格内容区域
                options = mapping.options(cell.cellOption, cellmenu.ogGrid, panel, result ? result.data : null);
                cellmenu.container.add([options], null, true);
                inner_height = $(window).height() / 2.5;
                inner_width = $(window).width() / 2.5;
                inner.height(inner_height);
                inner.width(inner_width);
                if ((offset.top + inner_height + 10) > $(window).height()) {
                    cellmenu.menu.addClass('og-pop-up');
                    inner.css({marginTop: -inner_height + 1});
                }
                if ((offset.left - cell_width + inner_width) > $(window).width()) {
                    inner.css({marginLeft: -inner_width - (offset.left - $(window).width())});
                }
                new_menu = new constructor(cellmenu.grid, cellmenu.ogGrid, cellmenu.name);
                com.hundsun.pas.common.gadgets.resize({
                    selector: selector,
                    offset: {top: -25, left: -1},
                    tmpl: '<div class="OG-analytics-resize og-resizer og-inplace-resizer" title="Drag to resize me" />',
                    mouseup_handler: function (right, bottom) {
                        var newWidth = Math.max(480, ($(document).outerWidth() - right) - inner.offset().left),
                            newHeight = Math.max(200, ($(document).outerHeight() - bottom) - inner.offset().top);
                        inner.css({width: newWidth, height: newHeight});
                        cellmenu.container.resize();
                    }
                });
            }
        };

        /**
         *  显示CellMenu 窗口
         *  coordinates
         */
        constructor.prototype.show = function (coordinates) {
            var cellmenu = this, current = this.current,
                width = current.offsetWidth, height = current.offsetHeight, gadget_type = 'Depgraph', // mapping.type(cellmenu.current, 'inplace'),
                $chevron = cellmenu.menu.find('.og-icon-down-chevron');
            if (cellmenu.menu && cellmenu.menu.length) {
                if (!mapping.is_complex(gadget_type)) {
                    $chevron.addClass('og-complex');
                } else {
                    $chevron.removeClass('og-complex');
                }
                cellmenu.menu.appendTo($('body')).css({
                    top: $(current).offset().top + 5,
                    left: $(current).offset().left + width
                }).show()
                    .find('.OG-gadgets-container').css('margin-left', -width + 'px').end()
                    .find('.og-cell-border').css({left: -width + 'px'}).show();
            }
        };
        /**
         * 隐藏CellMenu 窗口
         */
        constructor.prototype.hide = function () {
            var cellmenu = this;
            if (cellmenu.menu && cellmenu.menu.length && !cellmenu.frozen) {
                cellmenu.menu.hide();
                cellmenu.frozen = false;
            }
        };
        constructor.prototype.setdrag = function (state) {
            constructor.prototype.drag = state;
        };
        constructor.prototype.getdrag = function () {
            return constructor.prototype.drag;
        };
        constructor.prototype.cell_coords = function (row, col) {
            var grid = this, top = grid.current.offsetTop, buttom, left = grid.current.offsetLeft, right;
            return {top: top, bottom: buttom, left: left, right: right, col: col, row: row};
        };
        return constructor;
    }
});