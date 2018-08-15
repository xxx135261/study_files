/**
 * Created by mengjq on 4/14/2016.
 */
$.register_module({
    name: 'og.analytics.grid.data.Grid',
    dependencies: ['og.analytics.Data'],
    obj: function () {
        var module = this, row_height = 25, title_height = 31, set_height = 24, logging = 'logLevel',
            templates = null, default_col_width = 95, HTML = 'innerHTML',
            scrollbar = 17, /*scrollbar = og.common.util.scrollbar_size,*/
            do_not_expand = {
                DOUBLE: null,
                FUNGIBLE_TRADE: null,
                NODE: null,
                OTC_TRADE: null,
                POSITION: null,
                STRING: null
            },
            has = 'hasOwnProperty', hvalue = "h", loadMethod = 'loading';
        var available = (function () {
            var nodes;
            var all = function (total) {
                for (var result = [], lcv = 0; lcv < total; lcv += 1) result.push(lcv);
                return result;
            };
            var unravel = function (arr, result) {
                var start = arr[0], end = arr[1], children = arr[2], last_end = null,
                    i, j, len = children.length, child, curr_start, curr_end;
                result.push(start);
                if (!nodes[start]) return result;
                for (i = 0; i < len; i += 1) {
                    child = children[i];
                    curr_start = child[0];
                    curr_end = child[1];
                    for (j = (last_end || start) + 1; j < curr_start; j += 1) result.push(j);
                    last_end = start = curr_end;
                    unravel(child, result);
                }
                while (++start <= end) result.push(start);
                return result;
            };
            return function () {
                var grid = this, meta = grid.meta, state = grid.state;
                nodes = state.nodes;
                return meta.structure.length ? unravel(meta.structure, []) : all(meta.data_rows);
            };
        })();

        var Grid = function (config) {
            if (!config) return;
            var grid = this;
            grid.id = '#' + og.common.id('grid');
            grid.config = config.config;
            grid.source = config.source;
            if (grid.config.visibleArea) {
                grid.elements = grid.config.visibleArea;
            } else {
                grid.elements = {
                    width: 100, height: 100,
                    scrollHeight: 0,
                    scrollWidth: 0,
                    scrollTop: 0,
                    scrollLeft: 0
                }
            }

            grid.meta = null;
            grid.state = {col_override: [], col_reorder: [], nodes: null, structure: null, highlight: null};
            grid.updated = (function (last, delta) {
                return function (time) {
                    return time ? (last ? ((delta = time - last), (last = time), delta) : ((last = time), 0)) : delta;
                }
            })(null, 0);
            init_data.call(grid);
        }
        var init_data = function () {
            var grid = this;
            grid.busy = (function (busy) {
                return function (value) {
                    return busy = typeof value !== 'undefined' ? value : busy;
                };
            })(false);
            grid.dataman = new (og.analytics.Data)(grid.source, {bypass: false, label: 'grid'})
                .on('meta', init_grid, grid)
                .on('data', render_rows, grid)
                .on('disconnect', function () {
                    alert();
                });
        }

        var init_grid = function (metadata) {
            var grid = this, meta = grid.meta = Object.assign({}, metadata), lcv = 0;
            meta.viewport = {format: 'CELL'};
            meta.row_height = row_height;
            meta.set_height = meta.show_sets ? set_height : 0;
            meta.header_height = meta.set_height + title_height;
            meta.scrollbar = scrollbar;
            meta.fixed_length = meta.columns.fixed.length && meta.columns.fixed[0].columns.length;
            meta.scroll_length = meta.columns.scroll.reduce(function (acc, set) {
                return acc + set.columns.length;
            }, 0);

            verify_state.call(grid);
            if (!reorder_cols.call(grid)) {
                populate_cols.call(grid);
            }
            grid.resize();
            grid.fire("meta", meta);
            render_rows.call(grid, null, true);
        }

        var render_rows = (function () {
            var row_data = function (grid, fixed, loading) {
                var result = {rows: [], loading: loading};
                if (loading) return result;
                var data = grid.data, meta = grid.meta, state = grid.state, fixed_len = meta.fixed_length, row, col,
                    index, data_row, data_col, inner = meta.inner, prefix,
                    cols = meta.viewport.cols, rows = meta.viewport.rows, grid_row = state.available.indexOf(rows[0]),
                    types = meta.columns.types, type, total_cols = cols.length, col_end, row_len = rows.length,
                    col_len = fixed ? fixed_len : total_cols - fixed_len, column, cells, value,
                    nodeId, positionId, securityId, result = {rows: [], loading: loading};
                for (row = 0; row < row_len; row += 1) {
                    result.rows.push({cells: (cells = []), data_row: data_row = rows[row]});
                    if (fixed) {/*固定行*/
                        col = 0;
                        col_end = col_len;
                    } else { /*滚动行*/
                        col = fixed_len;
                        col_end = col_len + fixed_len;
                    }
                    for (; col < col_end; col += 1) {
                        data_col = cols[col];
                        index = row * total_cols + col;
                        column = data_col;
                        type = types[column];
                        value = data[index] && data[index].v || '';
                        value = value.name || value;
                        prefix = fixed && col === 0 ? state.unraveled_cache[state.unraveled[data_row]]({
                            state: grid.state.nodes[data_row] ? 'collapse' : 'expand'
                        }) : '';
                        nodeId = data[index].v ? data[index].v.nodeId : '';
                        positionId = data[index].v ? data[index].v.positionId : '';
                        securityId = data[index].v ? data[index].v.securityId : '';
                        if (data[index] !== undefined) { //catch any histogram and timeseries resize lags
                            // 取每一行的第一个单元格的数据
                            var firstCellOfEachRow = data[row * total_cols];
                            // modified by Rencc in 2018.1.15. 修改了col和row
                            cells.push({
                                column: column,
                                col: /*col*/column,
                                // modified by Rencc in 2018.1.10.（col改为column） column代表当前列的索引值，而col无实际意义
                                col_name: meta.columns.headers[state.col_reorder.length ? state.col_reorder.indexOf(col) : column],
                                row: /*row*/data_row,
                                row_name: firstCellOfEachRow ? firstCellOfEachRow.v.name : '',
                                value: value,
                                h: data[index].h,
                                dataRow: prefix,
                                type: data[index].t || type,
                                nodeId: nodeId,
                                positionId: positionId,
                                securityId: securityId
                            });
                        }
                    }
                }
                return result;
            };
            return function (data, loading, quiet) {
                var grid = this, meta = grid.meta, items = [];
                if (grid.busy()) {
                    return;
                } else {
                    grid.busy(true); // don't accept more data if rendering
                }
                grid.data = data;
                var fixed_data = row_data(grid, true, loading).rows;
                var scroll_data = row_data(grid, false, loading).rows;
                grid.updated(+new Date());
                grid.busy(false);
                if ((fixed_data && fixed_data.length > 0) || (scroll_data && scroll_data.length > 0)) {
                    items.push(meta.columns.headers, fixed_data, scroll_data);
                    items.push({'data-row': meta.data_rows});
                    grid.fire('data', items);
                }
            }
        })();
        var populate_cols = function (meta) {
            var grid = this, columns = grid.meta.columns, col_fields = ['description', 'header', 'type'];
            var populate = function (col) {
                col_fields.forEach(function (key) {
                    columns[key + 's'].push(col[key]);
                });
            };
            columns.orig_widths = columns.fixed.concat(columns.scroll).reduce(function (acc, set) {
                return acc.concat(set.columns.map(function (col) {
                    return col.width || null;
                }));
            }, []);
            grid.col_widths();
            col_fields.forEach(function (key) {
                columns[key + 's'] = [];
            }); // plural version
            columns.fixed.forEach(function (set) {
                set.columns.forEach(populate);
            });
            columns.scroll.forEach(function (set) {
                set.columns.forEach(populate);
            });
            columns.length = columns.types.length;
        };
        var reorder_cols = function () {
            var grid = this, meta = grid.meta, columns, reorder, scrolls, sets;
            if (!grid.state.col_reorder.length) return false;
            columns = (meta = grid.meta = $.extend(grid.meta, Object.clone(grid.dataman.meta))).columns;
            reorder = grid.state.col_reorder.slice(meta.fixed_length)
                .map(function (value) {
                    return value - meta.fixed_length;
                });
            scrolls = columns.scroll.reduce(function (acc, set, idx) {
                return acc.concat(set.columns.map(function (col) {
                    return (col.orig_set = idx), col;
                }));
            }, []);
            scrolls = reorder.map(function (idx) {
                return scrolls[idx];
            });
            sets = columns.scroll.reduce(function (acc, set) {
                delete set.columns;
                return acc.concat(set);
            }, []);
            columns.scroll = scrolls.reduce(function (acc, col, idx) {
                var length = acc.length, same_set = length && scrolls[idx - 1].orig_set === col.orig_set, orig_set;
                if (same_set) return acc[length - 1].columns.push(col), acc;
                orig_set = sets[col.orig_set];
                acc.push(Object.keys(orig_set).reduce(function (acc, key) {
                    return (acc[key] = orig_set[key]), acc;
                }, {columns: [col]}));
                return acc;
            }, []);
            return populate_cols.call(grid), true;
        };
        var viewport = function (handler) {
            var grid = this, meta = grid.meta, viewport = meta.viewport, row_start = 0, inner = meta.inner,
                elements = grid.elements,
                top_position = elements.scrollTop, left_position = elements.scrollLeft,
                fixed_len = meta.fixed_length, row_start = Math.floor((top_position / inner.height) * meta.rows),
                scroll_position = left_position + inner.width, buffer = viewport_buffer.call(grid), lcv, reorder,
                row_end = Math.min(row_start + meta.visible_rows + buffer.row, grid.state.available.length),
                scroll_cols = meta.columns.scroll.reduce(function (acc, set) {
                    return acc.concat(set.columns);
                }, []);
            if (row_end < 0) {
                return; // bail if number of rows is negative, occurs if you drag a grid before the grid loads
            }
            lcv = Math.max(0, row_start - 18/*buffer.row*/);
            viewport.rows = [];
            while (lcv < row_end) {
                viewport.rows.push(grid.state.available[lcv++]);
            }
            (viewport.cols = []), (lcv = 0);
            /*while (lcv < fixed_len) {
                viewport.cols.push(lcv++);
            }*/
            reorder = grid.state.col_reorder.length && grid.state.col_reorder;
            if (reorder === 0) {
                while (lcv < fixed_len) {
                    viewport.cols.push(lcv++);
                }
            } else {
                while (lcv < fixed_len) {
                    viewport.cols.push(reorder[lcv++]);
                }
            }
            viewport.cols = viewport.cols.concat(scroll_cols.reduce(function (acc, col, idx) {
                var lcv;
                if (!('scan' in acc)) return acc;
                if ((acc.scan += col.width) >= left_position) {
                    if (!acc.cols.length && idx) // pad before
                        for (lcv = Math.max(0, idx - buffer.col); lcv < idx; lcv += 1)
                            acc.cols.push(reorder ? reorder[lcv + fixed_len] : lcv + fixed_len);
                    acc.cols.push(reorder ? reorder[idx + fixed_len] : idx + fixed_len);
                }
                if (acc.scan > scroll_position) {
                    for (lcv = idx + 1; lcv < Math.min(idx + buffer.col, scroll_cols.length); lcv += 1)
                        acc.cols.push(reorder ? reorder[lcv + fixed_len] : lcv + fixed_len);
                    delete acc.scan;
                }
                return acc;
            }, {scan: 0, cols: []}).cols);
            grid.dataman.viewport(viewport);
            return (handler && handler.call(grid)), grid;
        };

        //核实
        var verify_state = function () {
            var grid = this, meta = grid.meta, state = grid.state;
            if (state.col_override.length !== meta.fixed_length + meta.scroll_length) { // length has changed (in meta)
                state.col_override = new Array(meta.fixed_length + meta.scroll_length);
                state.col_reorder = [];
            }
            if (!Object.equals(meta.structure, state.structure)) {
                unravel_structure.call(grid);
            }
        };

        //解除——表结构
        var unravel_structure = (function () {
            var rep_str = '&nbsp;&nbsp;&nbsp;', rep_memo = {}, cache, counter;//&nbsp;&nbsp;&nbsp;
            var all = function (total) {
                for (var result = [], lcv = 0; lcv < total; lcv += 1) result.push({prefix: 0});
                return (cache[''] = 0), result;
            };
            var rep = function (times, lcv, result) {
                if (times in rep_memo) return rep_memo[times];
                if ((result = '') || (lcv = times)) while (lcv--) result += rep_str;
                return rep_memo[times] = result;
            };
            /* arr is of format [start row, end row, [children]. expand] */
            var unravel = function (arr, result, indent) {
                var start = arr[0], end = arr[1], children = arr[2], expand = !arr[3], prefix, last_end = null, str,
                    i, j, len = children.length, child, curr_start, curr_end, html_children, html_empty;
                html_children = '<span data-row="' + start + '" data-splice="' + end + '" class="node {{state}}"></span>&nbsp;&nbsp;&nbsp;&nbsp;';
                html_empty = '<span data-row="' + start + '" data-splice="' + end + '"></span>&nbsp;';
                if (end - start) { // nodes with children
                    prefix = cache[rep(indent) + html_children] = counter++;
                    result.push({prefix: prefix, node: true, indent: indent, range: [start, end], expand: expand});
                } else { // empty nodes are basically just like other rows
                    prefix = cache[rep(indent) + html_empty] = counter++;
                    result.push({prefix: prefix});
                }
                for (i = 0; i < len; i += 1) {
                    child = children[i];
                    curr_start = child[0];
                    curr_end = child[1];
                    j = (last_end || start) + 1;
                    if (j < curr_start) {
                        prefix = (str = rep(indent + 2)) in cache ? cache[str] : cache[str] = counter++;
                    }
                    for (; j < curr_start; j += 1) {
                        result.push({prefix: prefix});
                    }
                    last_end = start = curr_end;
                    unravel(child, result, indent + 1);
                }
                prefix = (str = rep(indent + 2)) in cache ? cache[str] : (cache[str] = counter++);
                while (++start <= end) {
                    result.push({prefix: prefix});
                }
                return result;
            };
            return function () {
                var grid = this, meta = grid.meta, state = grid.state, unraveled,
                    collapse = grid.config[has]('collapse_level'), collapse_level = grid.config.collapse_level;
                cache = {};
                counter = 0;
                state.unraveled_cache = [];
                unraveled = meta.structure.length ? unravel(meta.structure, [], 0) : all(meta.data_rows);
                state.nodes = unraveled.reduce(function (acc, val, idx) {
                    if (!val.node) return acc;
                    acc[idx] = val.expand;
                    acc.all.push(idx);
                    acc.indent[idx] = val.indent;
                    acc.ranges.push(val.range);
                    acc.max_indent = Math.max(acc.max_indent, val.indent);
                    if (collapse && val.indent >= collapse_level) acc.collapse.push(idx); // e.g. depgraphs
                    return acc;
                }, {all: [], collapse: [], indent: {}, ranges: [], max_indent: 0});
                /* unraveled_cache() returns the indent and the expand/collapse markup for a node */
                Object.keys(cache).forEach(function (prefix) {
                    state.unraveled_cache[+cache[prefix]] = Handlebars.compile(prefix);
                });
                state.unraveled = unraveled.pluck('prefix');
                state.structure = meta.structure;
            };
        })();

        //表格缓冲区
        var viewport_buffer = function () {
            var grid = this, meta = grid.meta, sparklines = grid.config.sparklines;
            return {col: sparklines ? 0 : 3, row: sparklines ? 0 : Math.min(meta.visible_rows, 20)};
        };

        Grid.prototype.kill = function () {
            try {
                var grid = this;
                grid.dataman.kill();
                grid.fire('kill');
                console.log(grid.dataman);
            } catch (error) {
                og.dev.warn('og.analytics.grid.data.dataman.kill', error);
            }
        };
        Grid.prototype.col_widths = function () {
            var grid = this, state = grid.state, meta = grid.meta, avg_col_width, fixed_width,
                fixed_cols = meta.columns.fixed, scroll_cols = meta.columns.scroll, scroll_data_width,
                def_scrolls, scroll_width, last_set, remainder, parent_width = grid.elements.width;
            (function (idx) {
                fixed_cols.concat(scroll_cols).forEach(function (set) {
                    set.columns.forEach(function (col) {
                        col.width = state.col_override[idx] || meta.columns.orig_widths[idx];
                        idx += 1;
                    });
                });
            })(0);
            def_scrolls = scroll_cols.reduce(function (top, set) {
                top.length += set.columns.reduce(function (acc, col) {
                    top.width += +col.width;
                    return col.width ? acc + 1 : acc;
                }, 0);
                return top;
            }, {length: 0, width: 0});
            meta.columns.widths = [];
            fixed_width = meta.columns.fixed.length && meta.columns.fixed[0].columns.reduce(function (acc, col, idx) {
                meta.columns.widths.push(col.width = col.width || (idx ? 150 : 250));
                return acc + col.width;
            }, 0);
            scroll_width = parent_width - fixed_width - scrollbar;
            avg_col_width = Math.floor((scroll_width - def_scrolls.width) / (meta.scroll_length - def_scrolls.length));
            scroll_cols.forEach(function (set) {
                set.columns.forEach(function (col) {
                    meta.columns.widths.push(col.width = col.width || Math.max(default_col_width, avg_col_width));
                });
            });
            scroll_data_width = scroll_cols.pluck('columns').reduce(function (acc, set) {
                return acc + set.pluck('width')
                    .reduce(function (acc, val) {
                        return acc + val;
                    });
            }, 0);
            if ((remainder = scroll_width - scroll_data_width) <= 0) return;
            meta.columns.widths[meta.columns.widths.length - 1] += remainder;
            if (scroll_cols.length)
                (last_set = scroll_cols[scroll_cols.length - 1].columns)[last_set.length - 1].width += remainder;
        };
        Grid.prototype.fire = (function () {
            var fatal_fired = false;
            return function (type) {
                var args = Array.prototype.slice.call(arguments);
                try {
                    if (type === 'fatal' && !fatal_fired) { // fire only once ever
                        fatal_fired = true;
                        return og.common.events.fire.apply(this, args);
                    }
                    og.common.events.fire.apply(this, args);
                } catch (error) {
                    og.dev.warn(this.prefix + 'a ' + type + ' handler threw ', error);
                }
            };
        })();
        Grid.prototype.off = og.common.events.off;
        Grid.prototype.on = og.common.events.on;
        Grid.prototype.scrollend = function () {
            var grid = this, pause = 200, jump = function () {
                viewport.call(grid, function () {
                    grid.busy(false);
                });
            };
            setTimeout(jump, pause);
        };
        Grid.prototype.resize = function (collapse) {
            var grid = this, config = grid.config, meta = grid.meta, state = grid.state, columns = meta.columns,
                data_width,
                id = grid.id, width = grid.elements.width, height = grid.elements.height,
                header_height = meta.header_height;
            grid.col_widths();
            columns.width = {
                fixed: columns.fixed.reduce(function (acc, set) {
                    return acc + set.columns.reduce(function (acc, col, idx) {
                        return acc + col.width;
                    }, 0);
                }, 0),
                scroll: columns.scroll.reduce(function (acc, set) {
                    return acc + set.columns.reduce(function (acc, col) {
                        return acc + col.width;
                    }, 0);
                }, 0)
            };
            columns.scan = {
                fixed: columns.fixed.reduce(function (acc, set) {
                    return set.columns
                        .reduce(function (acc, col) {
                            return acc.arr.push(acc.val += col.width), acc;
                        }, acc);
                }, {arr: [], val: 0}).arr,
                scroll: columns.scroll.reduce(function (acc, set) {
                    return set.columns
                        .reduce(function (acc, col) {
                            return acc.arr.push(acc.val += col.width), acc;
                        }, acc);
                }, {arr: [], val: 0}).arr
            };
            columns.scan.all = columns.scan.fixed
                .concat(columns.scan.scroll.map(function (val) {
                    return val + columns.width.fixed;
                }));
            data_width = columns.scan.all[columns.scan.all.length - 1] + scrollbar;
            if (collapse) {
                let row = collapse;
                grid.state.nodes[row] = !grid.state.nodes[row];
            }
            meta.rows = (state.available = available.call(grid)).length;
            meta.inner = {
                scroll_height: height - header_height, height: meta.rows * row_height,
                width: Math.min(width, data_width) - columns.width.fixed
            };
            meta.visible_rows = Math.min(Math.ceil(meta.inner.scroll_height / row_height), meta.rows);
            grid.fire('resize');
            return viewport.call(grid);
        };
        return Grid;
    }
});