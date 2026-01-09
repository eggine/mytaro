<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed, defineProps } from 'vue'
import { getUUID } from '@/utils/index'
import btnRestart from './btn-restart.vue'
import cardsJson from '@/assets/json/cards.json'

console.log(cardsJson)
const emit = defineEmits(['selectCard'])
const props = defineProps({
  selectedSubject: {
    type: Object,
    default: () => ({})
  }
})
// 响应式卡片配置
const totalCardNum = props.selectedSubject.cardNum
// 基础卡片尺寸 (rem为单位，适配所有屏幕)
const cardBaseW = ref(0.8)  // 卡片宽度
const cardBaseH = ref(1.2)  // 卡片高度
// 核心：每张卡片向右重叠 1/3 宽度 (固定比例)
const overlapRatio = 1 / 3
const overlapWidth = computed(() => cardBaseW.value * overlapRatio)

// 响应式布局数据
const containerWidth = ref(0)
const cardList = ref([])
const rowCardCount = ref(0)
const isAnimating = ref(false)
// ✨ 新增：依次出场的动画延迟间隔(毫秒)，18ms是最佳值，78张卡片全部出场约1.4秒，不拖沓不仓促
const animateDelayStep = 18
const cardSpreadNum = ref(props.selectedSubject.cardSpread)
const selectedCardList = ref([])

// 初始化卡片数组
const initCardList = () => {
  cardList.value = Array.from({ length: totalCardNum }, (_, i) => ({
    index: i + 1,
    randomRotate: (Math.random() - 0.5) * 4, // 随机±2度旋转，错落有致
    // ✨ 新增：核心-给每个卡片生成递增的延迟时间，实现依次出场 i越大延迟越长
    delayMs: i * animateDelayStep,
    id: cardsJson[i].id,
    name: cardsJson[i].name,
    description: cardsJson[i].description,
    upright: cardsJson[i].upright,
    reversed: cardsJson[i].reversed,
    img: '/data/cards/' + cardsJson[i].id + '.jpg'
  }))
  const totalDelayMs = (totalCardNum - 1) * animateDelayStep
  setTimeout(() => {
    cardList.value.map(item => item.delayMs = 0)
  }, totalDelayMs)
}

// 核心方法：根据屏幕宽度精确计算一行能摆放多少张卡片
const calcLayout = () => {
  const container = document.querySelector('.cards-container')
  if (!container) return
  containerWidth.value = container.clientWidth - 2 // 减去padding的1rem*2
  const cardRealWidth = cardBaseW.value - overlapWidth.value
  let calcCount = Math.floor(containerWidth.value / (cardRealWidth * 16))
  rowCardCount.value = calcCount < 1 ? 1 : calcCount
  isAnimating.value = true
  setTimeout(() => isAnimating.value = false, 300)
}

// 点击重启动画方法
const restartAnimation = async () => {
  isAnimating.value = true
  initCardList() // 重新生成卡片，包含新的随机旋转和递增延迟
  await nextTick()
  isAnimating.value = false
}

// 窗口自适应-防抖处理
let resizeTimer = null
const resizeHandler = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    calcLayout()
  }, 100)
}

// 点击卡片事件
const handleCardClick = (item) => {
  if (selectedCardList.value.length >= cardSpreadNum.value || selectedCardList.value.map(card => card.id).includes(item.id)) {
    return
  }
  console.log(item)
  selectedCardList.value.push(item)
  if (selectedCardList.value.length === cardSpreadNum.value) {
    setTimeout(() => {
      emit('selectCard', selectedCardList.value)
    }, 1000)
  }
}

function handleCardImg(item) {
  return '/data/MinorArcana/' + subjectId + '/' + item.id + '.jpg'
}



// 生命周期
onMounted(() => {
  initCardList()
  calcLayout()
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
})
</script>

<template>
  <div class="cards-container">
    <btnRestart />
    <div class="text-center text-white font-bold title" v-if="selectedCardList.length === 0">请选{{ cardSpreadNum }}张牌
    </div>
    <div class="text-center text-white font-bold title" v-if="selectedCardList.length > 0">请再选{{ cardSpreadNum -
      selectedCardList.length }}张牌</div>
    <div class="card-group">
      <div v-for="item in cardList" :key="item.index" class="card" :class="{ animate: isAnimating, 'active': selectedCardList.map(card => card.id).includes(item.id) }" :data-id="item.id" :style="{
        marginLeft: item.index > 0 ? `-${overlapWidth}rem` : '0',
        width: `${cardBaseW}rem`,
        height: `${cardBaseH}rem`,
        transitionDelay: `${item.delayMs}ms`
      }" @click="handleCardClick(item)">
        <div class="card-inner">
        <div class="card-face card-back">
          <img src="/data/back.jpg" width="100%" height="100%" style="width: 100%; height: 100%;" />
        </div>
        <div class="card-face card-front">
           <img :src="item.img" width="100%" height="100%" style="width: 100%; height: 100%;" />
        </div>
        </div>
      </div>
    </div>

    <!-- <div class="selected-card">
      <div v-for="item in selectedCardList" :key="item.id" class="card" :style="{
        width: `${cardBaseW}rem`,
        height: `${cardBaseH}rem`,
      }">
        <div class="card-number">{{ item.index }}</div>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.cards-container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  cursor: pointer;
  padding: 0.5rem;
  box-sizing: border-box;
  padding-top: 2rem;
}

/* ========== 核心紧凑修改 保留不变 ========== */
.card-group {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
}

.card {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  /* border: 2px solid #868686; */
  /* background: radial-gradient(circle, #a53d4e, #e94560); */
  position: relative;
  flex-shrink: 0;
  margin-bottom: 0.02rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* ========== 核心紧凑修改结束 ========== */

.card-number {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-left: 0.1rem;
}

/* hover效果不变，保留原有高亮+3D旋转 */
.card:hover {
  transform: scale(1.08) !important;
  z-index: 1000 !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.9);
  border-color: rgba(0, 0, 0, 0.8);
}

/* ✨ 微调动画初始样式：和过渡属性完美匹配，入场更丝滑 */
.animate {
  opacity: 0;
}


.selected-card {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.selected-card .card .card-number {
  padding-left: 0;
}

.title {
  font-size: 0.6rem;
  margin-bottom: 0.4rem;
}

.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s 
cubic-bezier(0.23, 1, 0.32, 1);
    transform-style: preserve-3d;
}

.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.2rem;
}

.card-front {
    background-color: #eee;
    color: #222;
    transform: rotateY(180deg);
    font-weight: bold;
    width: 100%;
    height: 100%;
}

.card.active .card-inner{
  transform: rotateY(180deg);
}
</style>