/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2017/11/30  rencc19758  新增
 * ========    =======  ============================================
*/
import Vue from 'vue';

const TableStore = function (table, initialState = {}) {
    if (!table) {
        throw new Error('Table is required.');
    }
    this.table = table;

    this.states = {
        columns: [],
        data: [],
        fixedColumns: [],
        notFixedColumns: [],
        fixedColumnsTrimmed: [], /*除去excluded行（不在视图定义中的列）的固定行*/
        notFixedColumnsTrimmed: [], /*除去excluded行（不在视图定义中的列）的非固定行*/
        /**
         * 当前选中行。
         * highlight: {
         *      rowData: Object, 选中行的数据
         *      index: Number 选中行的序号
         * }
         */
        highlight: null,
        /**
         * 当前鼠标悬停行。
         * hover: {
         *      rowData: Object, 选中行的数据
         *      index: Number 选中行的序号
         * }
         */
        hover: null
    }
}

TableStore.prototype.updateColumns = function () {
    const states = this.states;
    const _columns = states.columns || [];
    const fixedColumns = _columns.filter((column) => column.fixed);
    const notFixedColumns = _columns.filter(column => !column.fixed);
    const fixedColumnsTrimmed = _columns.filter(column => column.fixed && !column.excluded);
    const notFixedColumnsTrimmed = _columns.filter(column => !column.fixed && !column.excluded);
    Vue.set(states, 'fixedColumns', fixedColumns);
    Vue.set(states, 'notFixedColumns', notFixedColumns);
    Vue.set(states, 'fixedColumnsTrimmed', fixedColumnsTrimmed);
    Vue.set(states, 'notFixedColumnsTrimmed', notFixedColumnsTrimmed);
    states.columns = [].concat(fixedColumns).concat(notFixedColumns);
}

TableStore.prototype.mutations = {
    insertColumn(states, column, index) {
        let array = states.columns;
        if (typeof index !== 'undefined') {
            array.splice(index, 0, column);
        } else {
            array.push(column);
        }
        Vue.set(states, 'columns', array);
        this.updateColumns();
    },
    removeColumn(states, column) {
        let array = states.columns;
        let index = array.findIndex(col => column.id === col.id);
        if (index < 0) {
            console.warn('column[id="' + column.id + '"] doesn\'t exist.');
            return;
        }
        if (array) {
            array.splice(index, 1);
        }
        Vue.set(states, 'columns', array);
        this.updateColumns();
    },
    updateColumn(states, column) {
        let array = states.columns;
        let index = array.findIndex(col => column.id === col.id);
        if (index < 0) {
            console.log('column[id="' + column.id + '"] doesn\'t exist.');
            return;
        }
        array.splice(index, 1, column);
        this.updateColumns();
    },
    setData(states, data) {
        Vue.set(states, 'data', data);
    },
    setHighlight(states, highlight) {
        Vue.set(states, 'highlight', highlight);
    },
    setHover(states, hover) {
        Vue.set(states, 'hover', hover);
    }
}

TableStore.prototype.commit = function (name, ...args) {
    const mutations = this.mutations;
    if (mutations[name]) {
        mutations[name].apply(this, [this.states].concat(args));
    } else {
        throw new Error('Action not found: ${name}');
    }
};

export default TableStore;