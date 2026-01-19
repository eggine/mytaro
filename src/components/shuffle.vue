<script setup>
import { ref, onMounted, onUnmounted, defineEmits, inject, nextTick } from 'vue'
import btnRestart from './btn-restart.vue'
import spread from '@/assets/json/spread.json'

console.log(spread)
const emit = defineEmits(['shuffleEnd'])
const props = defineProps({
    selectedSubject: {
        type: Object,
        default: () => ({})
    }
})

const selectedSubject = inject('selectedSubject')
console.log(props.selectedSubject)
const cardNum = spread[props.selectedSubject.spread].cardNum
const totalCardNum = ref(cardNum)
const cards = ref([])
const isShuffled = ref(false)

// 性能优化：减少状态变量
let pressTimer = null
const pressDuration = 500
let isLongPress = ref(false)
let animationFrameId = null

// 缓存计算值
let remInPixels = 0
let cardWidthPx = 0
let cardHeightPx = 0
let buttonCenterX = 0
let buttonCenterY = 0

// 屏幕尺寸
const screenWidth = ref(window.innerWidth)
const screenHeight = ref(window.innerHeight)

// 按钮尺寸（使用rem，后续转换为px）
const buttonSizeRem = 2.4
const cardWidthRem = 1.6
const cardHeightRem = 3.2

// 获取按钮中心点
const getButtonCenter = () => {
    const buttonContainer = document.querySelector('.btn-container')
    if (buttonContainer) {
        const rect = buttonContainer.getBoundingClientRect()
        buttonCenterX = rect.left + rect.width / 2
        buttonCenterY = rect.top + rect.height / 2
    }
}

// 开始按压
const startPress = (event) => {
    event.preventDefault()
    isLongPress.value = true

    if (pressTimer) clearTimeout(pressTimer)
    
    // 立即开始动画，减少延迟
    getButtonCenter()
    startAnimation()
}

// 结束按压
const endPress = () => {
    if (pressTimer) {
        clearTimeout(pressTimer)
        pressTimer = null
    }
    isLongPress.value = false

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }

    setTimeout(() => {
        emit('shuffleEnd')
    }, 500)
}

// 取消按压
const cancelPress = () => {
    if (pressTimer) {
        clearTimeout(pressTimer)
        pressTimer = null
    }
    isLongPress.value = false

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }
}

// 开始动画
const startAnimation = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
    }
    
    // 使用requestAnimationFrame进行动画循环
    const animate = () => {
        if (!isLongPress.value) return
        
        // 性能优化：减少每帧的计算量
        updateCardsPosition()
        animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
}

/**
 * 初始化卡片 - 调整卡片分布，集中在上下位置，离按钮更远
 */
function initCards() {
    cards.value = []
    
    // 缓存计算值
    remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize)
    cardWidthPx = cardWidthRem * remInPixels
    cardHeightPx = cardHeightRem * remInPixels
    
    // 计算按钮半径
    const buttonRadius = (buttonSizeRem * remInPixels) / 2
    
    // 计算最小半径（大幅增加，让卡片离按钮更远）
    // 在手机端，为了让卡片离按钮更远，我们使用更大的系数
    const minRadius = buttonRadius + cardWidthPx * 6.5
    
    // 计算最大可用半径（使用屏幕宽高较小值的40%作为最大半径）
    const screenMinSize = Math.min(screenWidth.value, screenHeight.value)
    const maxRadius = screenMinSize * 0.4
    
    // 确保最小半径不超过最大半径
    const actualMinRadius = Math.min(minRadius, maxRadius * 0.8)
    
    // 根据卡片数量决定轨道数量（使用椭圆形分布，集中在上下）
    const orbitCount = Math.min(4, Math.max(2, Math.ceil(totalCardNum.value / 3)))
    
    // 计算每个轨道的卡片数量
    const cardsPerOrbit = Math.ceil(totalCardNum.value / orbitCount)
    
    for (let i = 0; i < totalCardNum.value; i++) {
        // 确定轨道索引
        const orbitIndex = Math.floor(i / cardsPerOrbit)
        
        // 计算基础半径（从内向外递增）
        const orbitProgress = orbitIndex / (orbitCount - 1 || 1)
        const baseRadius = actualMinRadius + (maxRadius - actualMinRadius) * orbitProgress
        
        // 使用椭圆形分布，让卡片更多集中在上下方向
        // 计算角度（集中在上下方向）
        const angleStep = (2 * Math.PI) / cardsPerOrbit
        let baseAngle = angleStep * (i % cardsPerOrbit)
        
        // 调整角度，让更多卡片集中在上下方向（90°和270°附近）
        // 将角度转换为度数以便处理
        let angleDeg = (baseAngle * 180 / Math.PI) % 360
        
        // 如果是左右方向（0°, 180°附近），向外偏移一些角度
        if ((angleDeg >= 315 || angleDeg <= 45) || (angleDeg >= 135 && angleDeg <= 225)) {
            // 左右方向的卡片，向外偏移15°
            baseAngle += (Math.PI / 12) * (Math.random() > 0.5 ? 1 : -1)
        }
        
        // 为椭圆形分布设置不同的XY半径
        // 上下方向使用更大的半径，左右方向使用较小的半径
        let radiusX, radiusY
        
        // 判断角度是否在上下方向（60°-120°或240°-300°）
        if ((angleDeg > 60 && angleDeg < 120) || (angleDeg > 240 && angleDeg < 300)) {
            // 上下方向：Y轴半径更大，X轴半径更小
            radiusX = baseRadius * 0.7
            radiusY = baseRadius * 1.3
        } else {
            // 左右方向：X轴半径更大，Y轴半径更小
            radiusX = baseRadius * 1.1
            radiusY = baseRadius * 0.9
        }
        
        // 添加少量随机性
        const randomOffset = (Math.random() - 0.5) * 0.2
        baseAngle += randomOffset
        
        // 计算位置（椭圆形分布）
        const x = Math.cos(baseAngle) * radiusX
        const y = Math.sin(baseAngle) * radiusY
        
        // 计算实际半径（用于公转）
        const actualRadius = Math.sqrt(x * x + y * y)
        
        // 随机自转速度和方向
        const spinSpeed = (Math.random() - 0.5) * 3.5
        
        const card = {
            index: i + 1,
            x: x,
            y: y,
            angle: baseAngle,
            radius: actualRadius,
            radiusX: radiusX,
            radiusY: radiusY,
            rotation: Math.random() * 360,
            spinSpeed: spinSpeed,
            orbitSpeed: 1.5 + Math.random() * 0.8, // 降低公转速度
            zIndex: i,
            orbitIndex: orbitIndex
        }
        
        cards.value.push(card)
    }
}

/**
 * 更新卡片位置 - 使用椭圆形公转
 */
function updateCardsPosition() {
    cards.value.forEach((card) => {
        // 更新公转角度
        card.angle += card.orbitSpeed * 0.015 // 降低角度增量
        
        // 确保角度在合理范围内
        if (card.angle > Math.PI * 2) card.angle -= Math.PI * 2
        if (card.angle < 0) card.angle += Math.PI * 2
        
        // 更新位置（椭圆形分布）
        card.x = Math.cos(card.angle) * card.radiusX
        card.y = Math.sin(card.angle) * card.radiusY
        
        // 更新实际半径
        card.radius = Math.sqrt(card.x * card.x + card.y * card.y)
        
        // 更新自转
        card.rotation += card.spinSpeed
        if (card.rotation > 360) card.rotation -= 360
        if (card.rotation < 0) card.rotation += 360
    })
}

/**
 * 计算卡片样式
 */
const cardStyle = (card) => {
    // 计算卡片在屏幕上的绝对位置
    const left = buttonCenterX + card.x
    const top = buttonCenterY + card.y
    
    return {
        // 使用transform3d进行硬件加速
        transform: `translate3d(${left}px, ${top}px, 0) rotate(${card.rotation}deg)`,
        willChange: 'transform',
        zIndex: card.zIndex,
        boxShadow: `0 2px 10px rgba(0,0,0,${0.15 + card.orbitIndex * 0.03})`,
    }
}

// 更新屏幕尺寸
const updateScreenSize = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    getButtonCenter()
    initCards()
}

onMounted(() => {
    updateScreenSize()
    
    // 使用nextTick确保DOM已渲染
    nextTick(() => {
        getButtonCenter()
        // 延迟一点点确保按钮位置正确
        setTimeout(() => {
            initCards()
        }, 100)
    })
    
    window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    if (pressTimer) clearTimeout(pressTimer)
    window.removeEventListener('resize', updateScreenSize)
})
</script>

<template>
    <div class="shuffle-container">
        <btnRestart />
        
        <!-- 卡片容器，用于定位卡片 -->
        <div class="cards-container">
            <div 
                v-for="(card, index) in cards" 
                :key="index" 
                class="card" 
                :style="cardStyle(card)"
            >
                <img src="/data/back.jpg" width="100%" height="100%" />
            </div>
        </div>

        <!-- 按钮容器 - 确保在中心 -->
        <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 btn-container">
            <div class="btn-box" :class="{ 'long': isLongPress }">
                <div class="box" :class="{ 'long': isLongPress }"></div>
                <div 
                    class="btn" 
                    @mousedown="startPress" 
                    @mouseup="endPress" 
                    @touchstart="startPress"
                    @touchend="endPress" 
                    @mouseleave="cancelPress" 
                    @touchcancel="cancelPress" 
                    @contextmenu.prevent
                >
                    按住提问
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.shuffle-container {
    position: relative;
    width: 100%;
    height: 100%;
    --color: orange;
    --lineColor: rgba(102, 163, 224, .2);
    /* 启用硬件加速 */
    transform: translateZ(0);
    backface-visibility: hidden;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-box {
    position: relative;
    width: 2.4rem;
    height: 2.4rem;
}

.box,
.box::after,
.box::before {
    border: 2px solid var(--lineColor);
    border-left: 2px solid var(--color);
    border-right: 2px solid var(--color);
    border-radius: 50%;
}

.box::after,
.box::before {
    position: absolute;
    content: '';
    left: 50%;
    top: 50%;
}

.box {
    width: 2.4rem;
    height: 2.4rem;
    position: relative;
    transform-origin: 50% 50%;
    backface-visibility: hidden;
}

.box.long {
    animation: turn 0.6s linear infinite;
}

.box::before {
    width: 2.2rem;
    height: 2.2rem;
    margin-top: -1.1rem;
    margin-left: -1.1rem;
    transform: rotateZ(60deg);
    backface-visibility: hidden;
}

.box.long::before {
    animation: turn2 0.8s linear infinite;
}

.box::after {
    width: 2rem;
    height: 2rem;
    margin-top: -1rem;
    margin-left: -1rem;
    transform: rotateZ(30deg);
    backface-visibility: hidden;
}

.box.long::after {
    animation: turn2 1s linear infinite;
}

@keyframes turn {
    100% {
        transform: rotateZ(-1turn);
    }
}

@keyframes turn2 {
    100% {
        transform: rotateZ(1turn);
    }
}

.btn {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background-color: var(--color);
    box-shadow: 
        0 0 30px rgba(52, 152, 219, 0.4),
        0 0 0 10px rgba(255, 165, 0, 0.1); /* 增加按钮周围的发光效果 */
    color: #fff;
    font-size: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: bold;
    z-index: 1000;
    cursor: pointer;
    /* 启用硬件加速 */
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/* 卡片样式 - 移除背景颜色和边框 */
.card {
    position: absolute;
    width: 1.6rem;
    height: 3.2rem;
    border-radius: 0.06rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.25rem;
    font-weight: bold;
    color: #333;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
    transform-origin: center;
    /* 启用硬件加速 */
    will-change: transform;
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
    /* 提升渲染层级 */
    transform: translateZ(0);
    z-index: 10;
    pointer-events: none;
    /* 调整卡片位置，使其中心对准坐标点 */
    margin-left: -0.8rem;  /* 向左移动卡片宽度的一半 */
    margin-top: -1.6rem;   /* 向上移动卡片高度的一半 */
    /* 移除背景颜色和边框 */
    background: transparent;
    border: none;
}

/* 确保按钮在卡片之上 */
.btn-container {
    z-index: 1000;
    /* 启用硬件加速 */
    transform: translateZ(0);
}

/* 卡片容器 */
.cards-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* 启用硬件加速 */
    transform: translateZ(0);
}

/* 移动端触摸优化 */
@media (max-width: 768px) {
    .btn {
        touch-action: manipulation;
        font-size: 0.28rem;
        box-shadow: 
            0 0 25px rgba(52, 152, 219, 0.5),
            0 0 0 8px rgba(255, 165, 0, 0.15); /* 移动端增加发光范围 */
    }
    
    .card {
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
    }
}
</style>