<template>
    <div class="pas-table-dropdown">
        <span class="caret" @click.stop.prevent="onDropdown($event)"
              @mousedown.stop.prevent="" @mouseup.stop.prevent=""></span>
        <div class="dropdown-area" tabindex="-1" @blur.stop.prevent="dropdownBlur()" ref="dropdownArea">
            <div class="column_visible_checkboxes">
                <div class="column_checkbox" v-for="(column, index) in allColumns" :key="index">
                    <input type="checkbox" :id="column.prop"
                           @click.stop.prevent="toggleColumnVisibility(column, index)"
                           @mousedown.stop.prevent=""
                           @mouseup.stop.prevent=""
                           :checked="column.visible">
                    <label :for="column.prop" :title="column.label"
                           @mousedown.stop.prevent=""
                           @mouseup.stop.prevent="">{{column.label}}</label>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'PASTableDropDown',
        props: {
            store: {
                required: true
            }
        },
        mounted() {
            $(window).on('resize', this.setDropdownHeight);
        },
        methods: {
            /*处理下拉框失去焦点事件*/
            dropdownBlur() {
                let dropdownArea = $(this.$refs.dropdownArea);
                dropdownArea.hide();
                dropdownArea.removeClass('dropdown-active');
            },
            /*打开下拉框*/
            onDropdown(event) {
                let el = $(this.$el);
                let dropDownArea = $(this.$refs.dropdownArea);
                // 关闭其他打开的下拉区域
                $(this.$parent.$el).find('.dropdown-area').each(
                    function () {
                        if (!this.isSameNode(dropDownArea[0])) {
                            $(this).removeClass('dropdown-active');
                            $(this).hide();
                        }
                    }
                );
                dropDownArea.show();
                // 打开下拉框时，添加'dropdown-active'激活类
                if (!dropDownArea.hasClass('dropdown-active')) {
                    dropDownArea.addClass('dropdown-active');
                    dropDownArea.focus();
                }
                setTimeout(this.setDropdownHeight(), 0);
            },
            /*切换列的可见性*/
            toggleColumnVisibility(column, index) {
                let minLength = this.checkedColumns.length;
                if (minLength > 1 || (minLength <= 1 && !column.visible)) {
                    column.visible = !column.visible;
                    this.store.commit('updateColumn', column);
                }
            },
            /*设置下拉框的max-height，用于控制下拉框是否出现滚动条*/
            setDropdownHeight() {
                let el = $(this.$el);
                let dropdown = el.find('span.caret');
                let dropdownRect = dropdown[0].getBoundingClientRect();
                let dropdownAreaEl = $(this.$refs.dropdownArea);
                if (!dropdownAreaEl.hasClass('dropdown-active')) {
                    return;
                }
                let clientH = $(document).height();
                // 表示下拉框底部距离窗口底部的距离
                let dist = dropdownAreaEl.height() - (clientH - dropdownRect.bottom) + 15;
                let maxHeight;
                if (dist > 0) {
                    maxHeight = clientH - dropdownRect.bottom - 30;
                } else {
                    maxHeight = dropdownAreaEl.height() + 100;
                }
                el.find('.column_visible_checkboxes').css({
                    'max-height': (maxHeight > 25 ? maxHeight : 25) + 'px'
                });
            }
        },
        computed: {
            checkedColumns() {
                return this.allColumns.filter(column => column.visible);
            },
            allColumns() {
                return this.store.states.columns;
            }
        }
    }
</script>