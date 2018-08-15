/*
 * 软件版权: 恒生电子股份有限公司
 * 修改记录:
 * 修改日期     修改人员  修改说明 
 * ========    =======  ============================================
 * 2018/3/16  rencc19758  新增
 * ========    =======  ============================================
*/
const zTreeUtil = (function (zTree) {
    if (!zTree) {
        console.error("Z-Tree is required.");
        return null;
    } else {
        return {
            /**
             * 获取一个节点的子节点中最后一个分类节点
             *
             * @param treeNode
             * @return {{treeNode: *, index: *}}
             */
            getLastCategoryNode(treeNode) {
                let children = treeNode.children, lastCategoryNode, idx;

                Array.prototype.forEach.call(children, (val, index) => {
                    if (val.isCategory) {
                        idx = index;
                        lastCategoryNode = val;
                    }
                });

                return {
                    treeNode: lastCategoryNode,
                    index: idx
                }
            },
            /**
             * 获取一个节点的子节点中最后一个指标节点
             *
             * @param treeNode
             * @return {{treeNode: *, index: *}}
             */
            getLastValueDefNode(treeNode) {
                let children = treeNode.children, lastValueDefNode, idx;

                Array.prototype.forEach.call(children, (val, index) => {
                    if (!val.isCategory) {
                        idx = index;
                        lastValueDefNode = val;
                    }
                });

                return {
                    treeNode: lastValueDefNode,
                    index: idx
                }
            },
            /**
             * 判断节点是否是分类节点
             *
             * @param treeNode
             * @return {boolean} treeNode是分类节点返回true，其他情况返回false
             */
            isCategoryNode(treeNode) {
                if (treeNode) {
                    /*Boolean*/
                    let isCategory = treeNode.isCategory;
                    return (isCategory != undefined
                        && isCategory != null
                        && typeof isCategory == 'boolean')
                    || treeNode.isParent ? isCategory : false;
                }
                return false;
            },
            /**
             * 获得节点的根节点
             *
             * @param treeNode
             * @return rootNode 如果treeNode为空，则返回null。
             */
            getRootNode(treeNode) {
                const getRootNode = (node) => {
                    if (node) {
                        let parentNode = node.getParentNode();
                        if (parentNode == null) {
                            return node;
                        } else {
                            return getRootNode(parentNode);
                        }
                    } else {
                        return null;
                    }
                }
                return getRootNode(treeNode);
            }
        };
    }
})($.fn.zTree)

export default zTreeUtil;