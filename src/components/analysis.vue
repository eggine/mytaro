<script setup>
import { getExplain } from '@/api/explain'
import { computed, onMounted, ref } from 'vue';
import spread from '@/assets/json/spread.json'

const emit = defineEmits(['update:isShowAnalysis', 'handleRead'])
const props = defineProps({
    isShowAnalysis: {
        type: Boolean,
        default: false
    },
    selectedSubject: {
        type: Object,
        default: () => ({})
    },
    selectedCardList: {
        type: Array,
        default: () => []
    },
    analysisCard: {
        type: Object,
        default: () => ({})
    },
    analysisData: {
        type: Object,
        default: () => ({})
    },
    role: {
        type: String,
        default: '知心姐姐'
    },
    isRead: {
        type: Boolean,
        default: false
    }
})

const slots = spread[props.selectedSubject.spread].slots
console.log(props.selectedSubject, props.selectedCardList)
const isError = ref(false)
// 双向绑定处理
const showAnalysis = computed({
    get: () => props.isShowAnalysis,
    set: value => emit('update:isShowAnalysis', value),
})
const isIng = ref(true)
const resData = ref({})

function handleBackClick() {
    showAnalysis.value = false
}

async function handleAskApi() {
    if (props.analysisData.total && props.isRead) {
        resData.value = JSON.parse(JSON.stringify(props.analysisData))
        isIng.value = false
        return
    }
    isError.value = false
    isIng.value = true
    const cardFaces = props.selectedCardList.map((card, index) => ({
        slot: slots[index],
        name: card.name,
        description: card.description,
        meaning: card.isReversed ? card.reversed : card.upright,
    }))
    const params = {
        '问题': props.selectedSubject.descrip,
        '牌面': cardFaces,
        role: props.role
    }
    const res = await getExplain(params).catch((err) => {
        isError.value = true
        console.log(err)
    })
    console.log(res)
    if (res && res.status === 200 && res.data && res.data.success) {
        isIng.value = false
        const cleanJsonStr = res.data.data
            .replace(/^```json\n/, "") // 匹配开头的```json和后续。换行，替换为空
            .replace(/\n```$/, "") // 匹配结尾的换行和```，替换为空
            .replace(/\\n/g, "") // 可选：清理残留的转义换行符（如需保留格式可省略）
            .replace(/\\"/g, '"'); // 可选：清理转义双引号（确保JSON格式合法）
        resData.value = JSON.parse(cleanJsonStr);
        console.log(resData.value)
        emit('handleRead', resData.value)
    } else {
        isError.value = true
    }
}

onMounted(() => {
    handleAskApi()
})
</script>

<template>
    <div class="analysis-box fixed w-full h-full left-0 top-0 bg-black bottom-0 right-0">
        <div class="back-btn" @click="handleBackClick">返回</div>
        <div class="weixin-box">
            <img src="/weixin.jpg" class="img" />
            <div class="text">加群认识更多塔友</div>
        </div>

        <div v-if="isIng && !isError" class="isIng">正在解读...请稍等</div>
        <div v-if="isError" class="isIng">解读失败，请重试</div>
        <div v-if="isError" class="isIng isError" @click="handleAskApi">重试</div>

        <div v-if="resData.total" class="analysis-content">
            <div class="tr">
                <div class="title">整体解读</div>
                <div class="content">{{ resData.total }}</div>
            </div>
            <div class="tr">
                <div class="title">建议</div>
                <div class="content">{{ resData.advise }}</div>
            </div>
            <div class="tr">
                <div class="title">逐牌解读</div>
                <div class="content">
                    <div v-for="(item, index) in resData.mono" :key="index" class="mono-tr">
                        <span style="color:yellow;">{{ slots[index] }}：</span>{{ item }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.analysis-box {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 1);
    z-index: 99;
    overflow: auto;
}

.back-btn {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    color: #fff;
    font-size: 0.4rem;
    border: 1px solid #fff;
    padding: 0.1rem 0.4rem;
    cursor: pointer;
    border-radius: 4px;
}

.isIng {
    color: #fff;
    font-size: 0.4rem;
    padding: 0.1rem 0.4rem;
    cursor: pointer;
    border-radius: 4px;
    text-align: center;
}

.isError {
    border: 1px solid #fff;
    height: 0.8rem;
    line-height: 0.8rem;
    padding: 0 0.8rem;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    margin-top: 4rem;
    width: 4rem;
    margin-left: auto;
    margin-right: auto;
}

.analysis-content {
    padding-top: 2.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
}

.tr {
    margin-top: 0.5rem;
}

.title {
    color: #fff;
    font-size: 0.6rem;
}

.content {
    color: #fff;
    font-size: 0.4rem;
}

.mono-tr {
    margin-bottom: 0.3rem;
}

.weixin-box {
    position: fixed;
    top: 0.2rem;
    left: 0.3rem;
     text-align: center;
}

.weixin-box .img {
    width: 2rem;
    margin: auto;
}
.weixin-box .text{
    font-size: 0.3rem;
    color: #fff;
    text-align: center;
    margin-top: 0.1rem;
}
</style>
