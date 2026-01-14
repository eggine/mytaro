<script setup>
import { defineEmits } from 'vue'
const emit = defineEmits(['restart'])

function handleRestart() {
    window.location.reload()
    emit('restart')
}
</script>

<template>
    <div class="fixed btn-restart text-center text-white text-[0.4rem] font-bold cursor-pointer"
        @click="handleRestart">重新开始</div>
</template>

<style scoped>
.btn-restart {
   font-size: 0.4rem;
    color: #fff;
    border: 1px solid #fff;
    height: 0.8rem;
    line-height: 0.8rem;
    padding: 0 0.3rem;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    margin-right: 0.2rem;
    top: 0.3rem;
    right: 0.2rem;
}
</style>
