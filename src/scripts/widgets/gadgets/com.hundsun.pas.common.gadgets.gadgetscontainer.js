/**
 * Created by Administrator on 6/23/2017.
 */

$.register_module({
    name: 'com.hundsun.pas.common.gadgets.GadgetsContainer',
    dependencies: ['og.api.text'],
    obj: function () {
        var api = og.api, tabs_template, overflow_template, dropbox_template, typemenu_template,
            inplace_template,
            counter = 1;
        var tabs_tmpl = '<div class="OG-gadget-tabs">\n' +
            '  <ul>\n' +
            '    {{#each tabs}}<li class="og-tab-{{this.id}}{{#if this.active}} og-active{{/if}}">\n' +
            '        <div>\n' +
            '          <div class="OG-multiselect"></div>\n' +
            '          <div class="OG-gadget-tabs-label">\n' +
            '            {{#if this.name}}{{this.name}}{{/if}}\n' +
            '            {{#if this.col_name}}{{this.col_name}}<span>&nbsp;on&nbsp;</span>{{this.row_name}}{{/if}}\n' +
            '          </div>\n' +
            '        </div>\n' +
            '        {{#if this.delete}}<div class="og-delete"></div>{{/if}}\n' +
            '      </li>{{/each}}<li class="og-overflow" style="display: none"><div>...</div></li>\n' +
            '  </ul>\n' +
            '  <div class="OG-gadget-tabs-options"></div>\n' +
            '</div>';
        var overflow_tmpl = '<div class="OG-tab-overflow-panel OG-shadow og-js-overflow-{{this.pane}}"><ul></ul></div>';
        var dropbox_tmpl = '<div class="OG-dropbox"><span class="OG-icon og-icon-new-window"></span></div>';
        var typemenu_tmpl = '<section>\n' +
            '  <div class="OG-analytics-typemenu">\n' +
            '    <div class="og-menu-toggle OG-gadget-buttons"></div>\n' +
            '    <div class="og-menu OG-shadow">\n' +
            '      {{#if complex_gadgets.length}}\n' +
            '        {{#each complex_gadgets}}\n' +
            '          <div class="og-js-icon OG-gadget-buttons" data-gadget_type="{{this.name}}" data-gadget_name="{{this.gadget_name}}">\n' +
            '            <span class="OG-icon og-icon-{{this.name}}"></span>{{this.gadget_name}}\n' +
            '          </div>\n' +
            '        {{/each}}\n' +
            '      {{/if}}\n' +
            '      {{#if simple_gadgets.length}}\n' +
            '        {{#each simple_gadgets}}\n' +
            '        <div class="og-js-icon OG-gadget-buttons" data-gadget_type="{{this.name}}" data-gadget_name="{{this.gadget_name}}">\n' +
            '            <span class="OG-icon og-icon-{{this.name}}"></span>{{this.gadget_name}}\n' +
            '        </div>\n' +
            '        {{/each}}\n' +
            '      {{/if}}\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</section>';
        var inplace_tmpl = '<div class="OG-gadget-inplace-header">\n' +
            '  <div class="og-container">\n' +
            '    <table>\n' +
            '      <tr>\n' +
            '        {{#if menu.complex_gadgets.length}}\n' +
            '          {{#each menu.complex_gadgets}}\n' +
            '            <td class="og-menu">\n' +
            '              <div class="og-js-icon OG-gadget-buttons{{#if this.default_type}} og-active{{/if}}"\n' +
            '                  title="{{this.gadget_name}}"\n' +
            '                  data-gadget_type="{{this.name}}" data-gadget_name="{{this.gadget_name}}">\n' +
            '                <span class="OG-icon og-icon-{{this.name}}"></span>\n' +
            '              </div>\n' +
            '            </td>\n' +
            '          {{/each}}\n' +
            '        {{/if}}\n' +
            '        {{#if menu.simple_gadgets.length}}\n' +
            '          {{#if menu.complex_gadgets.length}}<td class="og-separator"><span></span></td>{{/if}}\n' +
            '          {{#each menu.simple_gadgets}}\n' +
            '            <td class="og-menu">\n' +
            '              <div class="og-js-icon OG-gadget-buttons{{#if this.default_type}} og-active{{/if}}"\n' +
            '                  title="{{this.gadget_name}}"\n' +
            '                  data-gadget_type="{{this.name}}" data-gadget_name="{{this.gadget_name}}">\n' +
            '                <span class="OG-icon og-icon-{{this.name}}"></span>\n' +
            '              </div>\n' +
            '            </td>\n' +
            '          {{/each}}\n' +
            '        {{/if}}\n' +
            '        <td class="og-separator"><span></span></td>\n' +
            // '        <td class="og-menu og-dock">\n' +
            // '          <div class="og-js-icon OG-gadget-buttons" data-gadget_type="dock" title="Dock">\n' +
            // '            <span class="OG-icon og-icon-dock"></span>\n' +
            // '          </div>\n' +
            // '        </td>\n' +
            '        <td class="og-label og-tab-inplace">\n' +
            '          <div>\n' +
            '            {{#if this.first_col}}\n' +
            '              {{this.row_name}}\n' +
            '            {{else}}\n' +
            '              {{#if this.col_name}}{{this.col_name}}<span>&nbsp;on&nbsp;</span>{{this.row_name}}&nbsp;&nbsp;{{/if}}\n' +
            '            {{/if}}\n' +
            '          </div>\n' +
            '        </td>\n' +
            '      </tr>\n' +
            '    </table>\n' +
            '  </div>\n' +
            '</div>';
        var constructor = function (selector_prefix, pane) {
            var initialized = false, loading, gadgets = [], container = this,
                mapping = com.hundsun.pas.common.gadgets.mapping,
                selector = selector_prefix + pane, header = selector + ' .ui-layout-header', $selector = $(selector),
                class_prefix = selector_prefix.substring(1), live_id,         // active tab id
                overflow = {},   // document offset of overflow panel
                $overflow_panel; // panel that houses non visible tabs;
            var inplace_header = function (id) {
                if (!gadgets[0]) {
                    return;
                }
                var $header = $(header), val = gadgets[0], config = val.config,
                    depgraph = config.options.source.depgraph,
                    tmpl_data = mapping.available_types(config.data_type, depgraph, config.gadget_type),
                    template_obj = {
                        'row_name': config.row_name, 'col_name': config.col_name, menu: tmpl_data,
                        'first_col': !config.options.col
                    };
                gadgets[0].active = true;
                $header.html(inplace_template(template_obj)).off('mousedown').on('mousedown', '.og-js-icon', function () {
                    var gadget_type = $(this).attr('data-gadget_type'),
                        gadget_name = $(this).attr('data-gadget_name'),
                        swap_config;
                    if (gadget_type === 'dock') {
                        // og.analytics.url.add('south', gadgets[0].config);
                        // og.common.gadgets.manager.clean();
                        var iWidth = $(window).width() / 2.5, iHeight = $(window).height() / 2.5;
                        //获得窗口的垂直位置
                        var iTop = (window.screen.availHeight - 30 - iHeight) / 2;
                        //获得窗口的水平位置
                        var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
                        window.open('http://www.baidu.com', 'test', 'height=' + iHeight + ',innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',status=no,toolbar=no,menubar=no,location=no,resizable=no,scrollbars=0,titlebar=no');
                        return;
                    }
                    if (gadget_type === config.gadget_type) {
                        return false;
                    }
                    swap_config = {
                        gadget: 'com.hundsun.pas.common.gadgets.' + gadget_type, options: config.options,
                        gadget_name: gadget_name, col_name: config.col_name, gadget_type: gadget_type,
                        row_name: config.row_name, data_type: config.data_type
                    };
                    container.swap(swap_config, 0, true);
                    return false;
                });
                container.focus();
                // draggable($header.find('.og-label')); //拖拽
            };
            var update_tabs = function (id) {
                if (!!container.inplace) {
                    return inplace_header(id);
                }
                var $header = $(header), tabs;
                /**
                 * @param id Id of gadget to show, hide all others
                 */
                var show_gadget = function (id) {
                    $selector.find('.OG-gadget-container [class*=OG-gadget-]').hide()
                        .filter('.OG-gadget-' + id).show();
                    live_id = id;
                };
                /** Manages the widths of the tabs when the panel is resized, the following stages exist:
                 *  0 - all tabs are full size
                 *  1 - all but the active tab are truncated
                 *  2 - tabs are truncated plus some/all are moved to an overflow panel
                 *  3 - same as above with active tab being truncated
                 */
                var reflow = function () {
                    var overflow_buffer = 25, // space for the overflow button
                        buttons_buffer = {'south': 23}, // add extra buffer space if the tabs area has buttons
                        min_tab_width = 50,
                        $tabs_container = $(selector + ' .OG-gadget-tabs'),
                        $tabs = $tabs_container.find('li[class^=og-tab-]'),
                        $active_tab = $(selector + ' .og-active'),
                        $overflow_button = $(selector + ' .og-overflow'),
                        active_tab_width = $active_tab.outerWidth(),
                        num_tabs = $tabs.length,
                        num_inactive_tabs = num_tabs - 1,
                        new_tab_width, // new truncated width of a tab
                        compressed_tabs_width, // new full width of all tabs
                        space_needed, // number of pixles needed to reclaim
                        num_tabs_to_hide, // number of tabs to move to overflow
                        $tabs_to_move, // the actual tabs we are moving
                        // full available width
                        full_width = $tabs_container.width() - (overflow_buffer + (buttons_buffer[pane] || 0)),
                        // the full width of all the tabs
                        tabs_width = Array.prototype.reduce.apply($tabs
                            .map(function () {
                                return $(this).outerWidth();
                            }), [function (a, b) {
                            return a + b;
                        }, 0]);
                    // stage 1
                    if (tabs_width > full_width) {
                        new_tab_width = ~~((full_width - active_tab_width) / num_inactive_tabs);
                        new_tab_width = new_tab_width < min_tab_width ? min_tab_width : new_tab_width;
                        compressed_tabs_width = (num_inactive_tabs * new_tab_width) + active_tab_width;
                        // stage 2
                        if (compressed_tabs_width > full_width) {
                            if (num_tabs > 1) {
                                $overflow_button.show().on('click', function (e) {
                                    e.stopPropagation();
                                    $overflow_panel.toggle();
                                    var wins = [window].concat(Array.prototype.slice.call(window.frames));
                                    if ($overflow_panel.is(':visible')) {
                                        $(wins).on('click.overflow_handler', function () {
                                            $overflow_panel.hide();
                                            $(wins).off('click.overflow_handler');
                                        });
                                    } else {
                                        $(wins).off('click.overflow_handler');
                                    }
                                });
                            }
                            space_needed = full_width - compressed_tabs_width;
                            num_tabs_to_hide = Math.ceil(Math.abs(space_needed) / new_tab_width);
                            if (num_tabs_to_hide) {
                                $overflow_panel.find('ul').html(
                                    $tabs_to_move = $tabs.filter(':not(.og-active):lt(' + num_tabs_to_hide + ')')
                                );
                            }
                            // stage 3
                            if (num_tabs_to_hide >= num_tabs) {
                                $active_tab.width(
                                    active_tab_width
                                    + (space_needed + ((num_inactive_tabs * min_tab_width) - overflow_buffer))
                                    + 'px'
                                );
                            }
                        } else {
                            $overflow_panel.hide();
                        }
                        // set inactive tab widths to calculated value
                        $tabs.each(function () {
                            if (!$(this).hasClass('og-active')) {
                                var original_width = $(this).outerWidth();
                                $(this).outerWidth(original_width < new_tab_width ? original_width : new_tab_width);
                            }
                        });
                        // unset width of tabs in overflow panel
                        if ($tabs_to_move) {
                            $tabs_to_move.each(function () {
                                $(this).attr('style', '');
                            });
                        }
                        // set position of overflow panel
                        overflow.right = $(document).width() - ($overflow_button.offset().left + 25 - 5);
                        overflow.height = $overflow_button.height();
                        overflow.top = $overflow_button.offset().top + overflow.height + 1;
                        $overflow_panel.css({'right': overflow.right + 'px', 'top': overflow.top + 'px'});
                        $tabs.each(function () { // add tooltips to truncated tabs only
                            var $this = $(this);
                            if (!!$this.attr('style')) {
                                $this.find('.OG-gadget-tabs-label').attr('title', $this.text().replace(/\s+/g, ' ')
                                    .trim());
                            }
                        });
                    }
                    draggable($tabs);
                    container.focus();
                };
                if (id === null) { // empty tabs
                    $header.html(tabs_template({'tabs': [{'name': 'empty'}]}));
                } else {
                    if (id === void 0) {
                        id = live_id;
                    }
                    tabs = gadgets.reduce(function (acc, val, idx) {
                        return acc.push({
                            'gadget_type': val.config.gadget_type, 'row_name': val.config.row_name,
                            'delete': true, 'col_name': val.config.col_name,
                            'active': gadgets[idx].active = id === val.id, 'id': val.id,
                            'data_type': val.config.data_type, 'gadget_name': val.config.gadget_name,
                            'gadget': val, 'gadget_index': idx
                        }) && acc;
                    }, []);
                    $header.html(tabs_template({'tabs': tabs}));
                    $.each(tabs, function (key, val) {
                        var menu_config, menu_template, menu, $icon,
                            depgraph = val.gadget.config.options.source.depgraph,
                            tmpl_data = mapping.available_types(val.data_type, depgraph);
                        menu_template = typemenu_template(tmpl_data);
                        menu_config = {cntr: $('.og-tab-' + val.id + ' .OG-multiselect'), tmpl: menu_template};
                        menu = new og.common.util.ui.DropMenu(menu_config);
                        menu.$dom.toggle.on('mousedown', function () {
                            menu.toggle_handler();
                            return false;
                        });
                        $icon = $('<div class="OG-icon og-icon-' + val.gadget_type + '"></div>').css({
                            width: '16px',
                            height: '16px'
                        });
                        menu.$dom.menu.off('mousedown').on('mousedown', '.og-js-icon', function () {
                            var gadget_type = $(this).attr('data-gadget_type'), $icon,
                                gadget_name = $(this).attr('data-gadget_name'), swap_config;
                            menu.close();
                            if (gadget_type === val.gadget_type) {
                                return false;
                            }
                            $icon = $('<div class="OG-icon og-icon-' + (val.gadget_type = gadget_type) + '"></div>')
                                .css({width: '13px', height: '14px'});
                            menu.$dom.toggle.html($icon);
                            swap_config = {
                                gadget: 'og.common.gadgets.' + gadget_type, gadget_name: gadget_name,
                                options: val.gadget.config.options, gadget_type: gadget_type,
                                col_name: val.gadget.config.col_name, data_type: val.gadget.config.data_type,
                                row_name: val.gadget.config.row_name
                            };
                            container.swap(swap_config, val.gadget_index);
                            return false;
                        });
                        menu.$dom.toggle.html($icon);
                    });
                    reflow();
                    show_gadget(id);
                }
            };
            /**
             * @param data 定义需要加载的小工具
             * @param index 索引位置添加新的小工具
             * @param inplace 是否需要渲染标题
             */
            container.add = function (data, index, inplace) {
                if (!!inplace) {
                    container.inplace = inplace;
                }
                var panel_container = selector + ' .OG-gadget-container', new_gadgets;
                if (!loading && !initialized) {
                    container.init();
                    setTimeout(container.add.partial(data, index, inplace), 10);
                    return container;
                }
                if (!initialized) {
                    setTimeout(container.add.partial(data, index, inplace), 10);
                    return container;
                }
                if (!data) {
                    return container;
                }
                new_gadgets = data.map(function (obj, idx) {
                    var id, gadget_class = 'OG-gadget-' + (id = counter++), gadget, options = $.extend({}, obj.options),
                        constructor = obj.gadget.split('.').reduce(function (acc, val) {
                            return acc[val];
                        }, window), type = obj.gadget.replace(/^[a-z0-9.-_]+\.([a-z0-9.-_]+?)$/, '$1').toLowerCase();

                    $(panel_container).append('<div class="' + gadget_class + '" />')
                        .find('.' + gadget_class)
                        .css({
                            position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                            display: idx === data.length - 1 ? 'block' : 'none'
                        });
                    options.selector = panel_container + ' .' + gadget_class;
                    gadget = {id: id, config: obj, type: type, gadget: new constructor(options)};
                    if (typeof index === 'number') {
                        if (gadgets[index]) {
                            $(selector + ' .OG-gadget-container .OG-gadget-' + gadgets[index].id).remove();
                            if (gadgets[index]) {
                                gadgets[index].gadget.alive();
                            }
                        }
                        gadgets.splice(index, 1, gadget);
                    } else {
                        gadgets.push(gadget);
                    }
                    return gadget;
                });
                update_tabs(new_gadgets[new_gadgets.length - 1].id);
                return container;
            };
            container.alive = function () {
                gadgets.forEach(function (obj) {
                    obj.gadget.alive();
                });
                //clean up overflow panel
                return $(selector).length ? true : !$('og-js-overflow-' + pane).remove();

            };
            container.gadgets = function () {
                return gadgets;
            };
            /**
             * Add og-focus class to last clicked container tab and remove from all other gadget container instances
             */
            container.focus = function () {
                var $box, $tab, cont, options /*containers = og.analytics.containers,*/ /*grid = og.analytics.grid*/,
                    event_type = !!container.inplace ? 'cellhighlightinplace' : 'cellhighlight';
                // Highlight gadgetcontainer and tab
                // for (cont in containers) {
                //     $tab = $(selector_prefix + cont + ' .og-active');
                //     $box = $(selector_prefix + cont + ' .OG-gadget-container');
                //     if (cont === pane) {
                //         $tab.addClass('og-focus');
                //         $box.addClass('og-focus');
                //     } else {
                //         $tab.removeClass('og-focus');
                //         $box.removeClass('og-focus');
                //     }
                // }
                // Highlight grid cell
                if (!container.gadgets().length) {
                    return;
                }
                // options = Object.clone(container.gadgets().filter(function (val) {return !!val.active; })[0].config.options);
                // containers.fire(event_type, options.source, options.row, options.col, event_type);
            };
            container.init = function () {
                if (!tabs_template) {
                    tabs_template = Handlebars.compile(tabs_tmpl);
                }
                if (!overflow_template) {
                    overflow_template = Handlebars.compile(overflow_tmpl);
                }
                if (!dropbox_template) {
                    dropbox_template = Handlebars.compile(dropbox_tmpl);
                }
                if (!typemenu_template) {
                    typemenu_template = Handlebars.compile(typemenu_tmpl);
                }
                if (!inplace_template) {
                    inplace_template = Handlebars.compile(inplace_tmpl);
                }
                if (!$overflow_panel) {
                    $overflow_panel = $(overflow_template({pane: pane})).appendTo('body');
                }
                initialized = true;
                loading = false;
            };
            container.resize = function () {
                gadgets.forEach(function (obj) {
                    if (obj.gadget.alive() && obj.active) {
                        $(selector + ' .ui-layout-content').show();
                        update_tabs();
                        obj.gadget.resize();
                    }
                })
            };
            container.swap = function (config, index) {
                container.add([config], index);
                container.fire('swap', config, index);
            }
        };
        constructor.prototype.fire = og.common.events.fire;
        constructor.prototype.off = og.common.events.off;
        constructor.prototype.on = og.common.events.on;
        return constructor;
    }
})