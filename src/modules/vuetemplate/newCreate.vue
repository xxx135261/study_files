/**
* 组件名：新建视图
*
* ##接口说明##
* 函数：
* 事件：
*   update：修改视图保存/预览成功时触发该事件。
*       回调函数参数：{Object=自定义视图配置对象, String=类型（包括"edit"、"preview"）}
* 参数：
*   viewConfig：自定义视图配置对象。用于编辑视图的时候。
*/

<template src="../html/newCreate.html"></template>
<script>
    import newCreate from "../../scripts/biz/views/com.hundsun.pas.newCreate.js";

    export default newCreate;
</script>

<style scoped>
    @import "./../../styles/default1/TabClass/newCreate.css";

    fieldset {
        padding: .35em .625em .75em;
        margin: 0 2px;
        border: 1px solid silver
    }

    legend {
        padding: .5em;
        border: 0;
        width: auto
    }
</style>
