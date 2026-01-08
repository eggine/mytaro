<script setup>
import { ref, onMounted, onUnmounted, defineEmits, inject } from 'vue'
import btnRestart from './btn-restart.vue'

const emit = defineEmits(['shuffleEnd'])
const props = defineProps({
    selectedSubject: {
        type: Object,
        default: () => ({})
    }
})
const selectedSubject = inject('selectedSubject')
console.log(props.selectedSubject)
const totalCardNum = ref(props.selectedSubject.cardNum)
const cards = ref([])
const isShuffled = ref(false)
let pressTimer = null;
let pressDuration = 500;
let isLongPress = ref(false);
let animationFrameId = null;
let buttonCenterX = 0;
let buttonCenterY = 0;

// 屏幕尺寸
const screenWidth = ref(window.innerWidth);
const screenHeight = ref(window.innerHeight);

// 按钮的尺寸（rem单位转换为px）
const buttonSizeRem = 2.4;
const cardWidthRem = 0.8;
const cardHeightRem = 1.6;

// 获取按钮中心点
const getButtonCenter = () => {
    const buttonContainer = document.querySelector('.btn-container');
    if (buttonContainer) {
        const rect = buttonContainer.getBoundingClientRect();
        buttonCenterX = rect.left + rect.width / 2;
        buttonCenterY = rect.top + rect.height / 2;
    }
};

// 开始按压
const startPress = (event) => {
    event.preventDefault();
    isLongPress.value = true;

    if (pressTimer) clearTimeout(pressTimer);

    handleLongPress();
};

// 结束按压
const endPress = () => {
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
    isLongPress.value = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    setTimeout(() => {
        emit('shuffleEnd')
    }, 500)
};

// 取消按压
const cancelPress = () => {
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
    isLongPress.value = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
};

// 处理长按逻辑
const handleLongPress = () => {
    pressTimer = null;
    getButtonCenter();
    startAnimation();
};

// 开始动画
const startAnimation = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    step();
};

/**
 * 初始化卡片 - 减小卡片距离，让卡片更靠近中心按钮
 */
function initCards() {
    cards.value = []
    const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);

    // 计算卡片尺寸（像素）
    const cardWidthPx = cardWidthRem * remInPixels;
    const cardHeightPx = cardHeightRem * remInPixels;
    const cardDiagonal = Math.sqrt(cardWidthPx * cardWidthPx + cardHeightPx * cardHeightPx);

    // 计算安全范围
    const minDistanceToEdgeX = Math.min(buttonCenterX, screenWidth.value - buttonCenterX);
    const minDistanceToEdgeY = Math.min(buttonCenterY, screenHeight.value - buttonCenterY);

    // 计算最大半径，减小最大半径，让卡片更靠近中心
    const maxRadiusX = minDistanceToEdgeX - cardWidthPx / 2;
    const maxRadiusY = minDistanceToEdgeY - cardHeightPx / 2;
    const maxRadius = Math.min(maxRadiusX, maxRadiusY) * 0.6; // 从0.9减少到0.6，让卡片更靠近

    // 使用轨道数量，但减少轨道间距
    const orbitCount = 6; // 减少轨道数量，让卡片更集中
    const cardsPerOrbit = Math.ceil(totalCardNum.value / orbitCount);

    // 创建位置数组，用于避免重叠
    const positions = [];

    for (let i = 0; i < totalCardNum.value; i++) {
        // 尝试找到不重叠的位置
        let attempts = 0;
        let foundPosition = false;
        let angle, radius;

        while (!foundPosition && attempts < 30) { // 减少尝试次数
            // 确定轨道
            const orbitIndex = Math.floor(i / cardsPerOrbit) % orbitCount;

            // 计算每个轨道的半径 - 减小最小半径
            const t = orbitIndex / (orbitCount - 1);
            const minRadius = (buttonSizeRem * remInPixels) / 2 + cardDiagonal * 0.8; // 从1.5减少到0.8

            radius = minRadius + Math.pow(t, 1.2) * maxRadius; // 减小指数系数

            // 减小随机偏移幅度，让卡片更整齐
            const radiusOffset = (Math.random() - 0.5) * (radius * 0.08);
            radius = Math.max(minRadius, Math.min(radius + radiusOffset, maxRadius));

            // 计算角度，减少随机性
            const baseAngle = (i * 2 * Math.PI) / cardsPerOrbit;
            const angleOffset = (orbitIndex * Math.PI / 4) + (Math.random() - 0.5) * 0.2;
            angle = baseAngle + angleOffset;

            // 检查这个位置是否与已有位置重叠
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            let tooClose = false;
            for (const pos of positions) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < cardDiagonal * 1.1) { // 减小最小距离
                    tooClose = true;
                    break;
                }
            }

            if (!tooClose) {
                foundPosition = true;
                positions.push({ x, y });
            }

            attempts++;
        }

        // 如果找不到不重叠的位置，使用随机位置
        if (!foundPosition) {
            const orbitIndex = Math.floor(i / cardsPerOrbit) % orbitCount;
            const t = orbitIndex / (orbitCount - 1);
            const minRadius = (buttonSizeRem * remInPixels) / 2 + cardDiagonal * 0.8;
            radius = minRadius + Math.pow(t, 1.2) * maxRadius;
            angle = Math.random() * 2 * Math.PI;
        }

        // 公转速度
        const orbitSpeed = 4.5 + Math.random() * 1.5;

        const card = {
            index: i + 1,
            angle: angle,
            radius: radius,
            rotation: Math.random() * 360,
            orbitSpeed: orbitSpeed,
            spinSpeed: 2.5 + Math.random() * 3,
            zIndex: i,
            orbitIndex: Math.floor(i / cardsPerOrbit) % orbitCount,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            bounceX: 1,
            bounceY: 1
        };

        // 确保卡片在屏幕内
        ensureCardInScreen(card);
        cards.value.push(card);
    }
}

/**
 * 确保卡片在屏幕内
 */
function ensureCardInScreen(card) {
    const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const cardWidthPx = cardWidthRem * remInPixels;
    const cardHeightPx = cardHeightRem * remInPixels;

    // 计算卡片边界
    const cardLeft = buttonCenterX + card.x - cardWidthPx / 2;
    const cardRight = buttonCenterX + card.x + cardWidthPx / 2;
    const cardTop = buttonCenterY + card.y - cardHeightPx / 2;
    const cardBottom = buttonCenterY + card.y + cardHeightPx / 2;

    // 检查是否超出屏幕边界
    let adjusted = false;

    // 如果卡片超出右边界，调整x坐标
    if (cardRight > screenWidth.value) {
        card.x -= (cardRight - screenWidth.value);
        card.bounceX = -1;
        adjusted = true;
    }

    // 如果卡片超出左边界
    if (cardLeft < 0) {
        card.x -= cardLeft;
        card.bounceX = 1;
        adjusted = true;
    }

    // 如果卡片超出下边界
    if (cardBottom > screenHeight.value) {
        card.y -= (cardBottom - screenHeight.value);
        card.bounceY = -1;
        adjusted = true;
    }

    // 如果卡片超出上边界
    if (cardTop < 0) {
        card.y -= cardTop;
        card.bounceY = 1;
        adjusted = true;
    }

    // 如果调整了位置，更新角度和半径
    if (adjusted) {
        card.radius = Math.sqrt(card.x * card.x + card.y * card.y);
        card.angle = Math.atan2(card.y, card.x);
    }

    return adjusted;
}

/**
 * 更新卡片位置
 */
function updateCardPosition(card) {
    card.x = Math.cos(card.angle) * card.radius;
    card.y = Math.sin(card.angle) * card.radius;
}

/**
 * 计算卡片样式
 */
const cardStyle = (card) => {
    // 确保卡片在屏幕内
    ensureCardInScreen(card);

    const left = buttonCenterX + card.x;
    const top = buttonCenterY + card.y;

    return {
        left: `${left}px`,
        top: `${top}px`,
        transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,
        zIndex: card.zIndex,
        backgroundColor: '#fff',
        boxShadow: `0 2px 6px rgba(0,0,0,${0.1 + card.orbitIndex * 0.02})`,
        borderColor: `hsl(${card.orbitIndex * 40}, 50%, 85%)`
    };
};

/**
 * 每一帧的动画处理
 */
function step() {
    if (isLongPress.value) {
        cards.value.forEach(card => {
            // 公转
            card.angle += card.orbitSpeed * 0.015;

            // 自转
            card.rotation += card.spinSpeed;

            // 确保角度在0-2π之间
            if (card.angle < 0) card.angle += 2 * Math.PI;
            if (card.angle > 2 * Math.PI) card.angle -= 2 * Math.PI;

            updateCardPosition(card);

            // 检查卡片是否超出屏幕
            if (ensureCardInScreen(card)) {
                // 如果卡片超出边界，调整角度使其反弹
                card.angle += Math.PI * 0.01 * card.bounceX;
            }
        });

        animationFrameId = requestAnimationFrame(step);
    }
}

// 更新屏幕尺寸
const updateScreenSize = () => {
    screenWidth.value = window.innerWidth;
    screenHeight.value = window.innerHeight;
    getButtonCenter();
    initCards();
};

onMounted(() => {
    updateScreenSize();
    setTimeout(() => {
        getButtonCenter();
        initCards();
    }, 100);

    window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (pressTimer) clearTimeout(pressTimer);
    window.removeEventListener('resize', updateScreenSize);
});
</script>

<template>
    <div class="shuffle-container">
        <btnRestart />
        <!-- 卡片容器，用于定位卡片 -->
        <div class="cards-container">
            <div v-for="(card, index) in cards" :key="index" class="card" :style="cardStyle(card)">
                <div class="cards-number text-[0.5rem]">
                    ？
                </div>
            </div>
        </div>

        <!-- 按钮容器 -->
        <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 btn-container">
            <div class="btn-box" :class="{ 'long': isLongPress }">
                <div class="box" :class="{ 'long': isLongPress }"></div>
                <div class="btn" @mousedown="startPress" @mouseup="endPress" @touchstart="startPress"
                    @touchend="endPress" @mouseleave="cancelPress" @touchcancel="cancelPress" @contextmenu.prevent>按住洗牌
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
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background-color: var(--color);
    box-shadow: 0 0 30px rgba(52, 152, 219, 0.4);
    color: #fff;
    font-size: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: bold;
    z-index: 100;
    cursor: pointer;
}

/* 卡片样式 */
.card {
    position: absolute;
    width: 0.8rem;
    height: 1.6rem;
    background: radial-gradient(circle, #a53d4e, #e94560);
    color: var(--color);
    border-radius: 0.06rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.25rem;
    font-weight: bold;
    color: #333;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid #e0e0e0;
    transform-origin: center;
    z-index: 10;
    pointer-events: none;
}

/* 确保按钮在卡片之上 */
.btn-container {
    z-index: 100;
    /* position: relative; */
}

/* 卡片容器，用于定位卡片 */
.cards-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
</style>