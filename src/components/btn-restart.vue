<script setup>
import { defineEmits } from 'vue'
const emit = defineEmits(['restart'])

function handleRestart() {
    window.location.reload()
    emit('restart')
}
</script>

<template>
    <div class="fixed btn-restart top-[1rem] right-[1rem] text-center text-white text-[0.3rem] font-bold cursor-pointer"
        @click="handleRestart">重新开始</div>
</template>

<style scoped>
.btn-restart {
    background-color: #fff;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    color: #e94560;
    top: 0.2rem;
}
</style>
