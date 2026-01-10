<script setup>
import { ref, onMounted, onUnmounted, defineEmits, inject, computed } from 'vue'
import btnRestart from './btn-restart.vue'
import spread from '@/assets/json/spread.json'
const emit = defineEmits(['restart'])

const props = defineProps({
    selectedSubject: {
        type: Object,
        default: () => ({})
    },
    selectedCardList: {
        type: Array,
        default: () => []
    }
})
const slots = spread[props.selectedSubject.spread].slots
console.log(slots)
const currentCard = computed(() => {
    return props.selectedCardList.find(card => card.id === currentCardId.value) || {}
})
const currentCardId = ref('')

// 2. 计算分组后的二维数组（核心逻辑）
const cardRows = computed(() => {
    const rows = []
    let currentIndex = 0 // 记录当前处理到的牌的索引
    const selectedCardList = props.selectedCardList
    const CARDS_PER_ROW = 3 // 每行固定放三张
    
    // 循环分组，直到所有牌都被分配
    while (currentIndex < selectedCardList.length) {
        // 截取当前行需要的牌：从currentIndex开始，截取CARDS_PER_ROW张
        const rowCards = selectedCardList.slice(currentIndex, currentIndex + CARDS_PER_ROW)
        rows.push(rowCards)
        // 更新索引
        currentIndex += CARDS_PER_ROW
    }

    return rows
})
console.log(cardRows.value)

function handleCardClick(card) {
    console.log(card)
    currentCardId.value = card.id
}

function handleRestart() {
    currentCardId.value = ''
    emit('restart')
}
</script>

<template>
    <div class="h-full w-full">
        <btnRestart />
        <div class="selected-card-box">
            <div class="card-row" v-for="(row, rowIndex) in cardRows" :key="rowIndex">
                <!-- 内层循环：渲染当前行的每张牌 -->
                 <div class="card-item" v-for="(card, cardIndex) in row" :key="cardIndex" @click="handleCardClick(card)">
                <div class="card"  >
                    <img :src="card.img" width="100%" height="100%" style="width: 100%; height: 100%;" :style="{ transform: card.isReversed ? 'rotateX(180deg)' : 'rotateX(0deg)' }"/>
                    
                </div>
                <div class="card-text">{{ slots[cardIndex] }}</div>
                </div>
            </div>
        </div>
        <div class="overlay" v-if="currentCardId" @click="currentCardId = ''"></div>
        <transition name="zoom">
            <div v-if="currentCardId" class="card-box-fixed" @click="currentCardId = ''">
                <div @click.stop>

                    <div class="title-box">
                        <div class="card-desc">描述：{{ currentCard.description }}</div>
                        <div class="card-upright">正面：{{ currentCard.upright }}</div>
                        <div class="card-reversed">反面：{{ currentCard.reversed }}</div>
                    </div>
                    <div :class="{ 'active-box': currentCardId }">
                        <div class="card-name">{{ currentCard.name }}</div>
                        <div class="card">
                            <img :src="currentCard.img" width="100%" height="100%" style="width: 100%; height: 100%;" :style="{ transform: currentCard.isReversed ? 'rotateX(180deg)' : 'rotateX(0deg)' }"/>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.selected-card-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: column;
    padding: 1rem;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.card-row {
    display: flex;
    gap: 10px;
    /* 牌之间的间距 */
    margin-bottom: 15px;
    /* 行之间的间距 */
    justify-content: flex-start;
    /* 靠左对齐 */
}

.card-item {
    width: 1.6rem;
    position: relative;
    height: 3.4rem;
}

.card-text {
    color: #fff;
    text-align: center;
    font-size: 0.2rem;
}

.card {
    width: 1.6rem;
    height: 3rem;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 4px !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 2px solid #868686;
    /* background: radial-gradient(circle, #a53d4e, #e94560); */
    position: relative;
    flex-shrink: 0;
    margin-bottom: 0.02rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(233, 69, 96, 0.5);
}

.active-box {
    height: 100%;
    position: relative;
    width: 100%;
    transform: scale(2.5);
}

.active-box .card {
    /* position: fixed; */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* 居中并放大 */
    z-index: 100;
    cursor: zoom-out;
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.2);
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10;
}

/* 遮罩层过渡效果 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 卡片缩放过渡效果 */
.zoom-enter-active,
.zoom-leave-active {
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.zoom-enter-from,
.zoom-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
}

.card-box-fixed {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.title-box {
    width: 4rem;
    position: fixed;
    left: 70%;
    font-size: 0.25rem;
    color: #fff;
    top: 30%;
    padding-right: 0.3rem;
}

.card-name {
    font-size: 0.15rem;
    color: #fff;
    text-align: center;
    left: 0;
    right: 0;
    position: absolute;
    transform: translateY(-150%);
}

@media screen and (max-width: 760px) {
    .title-box {
        bottom: 10%;
        top: auto;
        left: 50%;
        transform: translateX(-50%);
        padding-right: 0;
    }
}
</style>