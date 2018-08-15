<template>
    <div v-bind:class="type" @click.stop="focusLayout" tabindex="1" v-bind:id="areaId" style="width: 100%;height: 100%;"></div>
</template>

<script>
    export default {
        name: "layout-block",
        data() {
            return {
                areaId: null,
                type: null,
                focusLayout: null
            }
        },
        computed: {},
        methods: {}
    }
</script>

<style scoped>

</style>