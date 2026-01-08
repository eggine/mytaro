<script setup>
import { ref, onMounted, onUnmounted, defineEmits, inject, computed } from 'vue'

const props = defineProps({
    selectedCardList: {
        type: Array,
        default: () => []
    }
})

const currentCardId = ref('')

// 2. 计算分组后的二维数组（核心逻辑）
const cardRows = computed(() => {
    const rows = []
    let currentIndex = 0 // 记录当前处理到的牌的索引
    let rowNum = 1 // 记录当前是第几行（第n行放n张）
    const selectedCardList = props.selectedCardList
    // 循环分组，直到所有牌都被分配
    while (currentIndex < selectedCardList.length) {
        // 截取当前行需要的牌：从currentIndex开始，截取rowNum张
        const rowCards = selectedCardList.slice(currentIndex, currentIndex + rowNum)
        rows.push(rowCards)
        // 更新索引和行数
        currentIndex += rowNum
        rowNum += 1
    }

    return rows
})
console.log(cardRows.value)

function handleCardClick(card) {
    console.log(card)
    currentCardId.value = card.id
}
</script>

<template>
    <div class="h-full w-full">
        <div class="overlay" v-if="currentCardId" @click="currentCardId = ''"></div>
        <div class="selected-card-box">
            <div class="card-row" v-for="(row, rowIndex) in cardRows" :key="rowIndex">
                <!-- 内层循环：渲染当前行的每张牌 -->
                <div class="card" :class="{ 'active': card.id === currentCardId }" v-for="(card, cardIndex) in row"
                    :key="cardIndex" @click="handleCardClick(card)">
                    {{ card.index }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.selected-card-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: column;
    padding: 1rem;
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
    background: radial-gradient(circle, #a53d4e, #e94560);
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

.card.active {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(2.5);
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
</style>