<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { getUUID } from '@/utils/index'
const emit = defineEmits(['selectSubject'])

const subjectTypeList = ref([
    {
        id: 1,
        name: '感情',
        children: [
            {
                id: 11,
                name: '感情-1',
                cardNum: 78,
                cardSpread: 3
            },
            {
                id: 12,
                name: '感情-2',
                cardNum: 78,
                cardSpread: 6
            },
        ]
    },
    {
        id: 2,
        name: '事业',
        children: [
            {
                id: 21,
                name: '事业-1',
                cardNum: 78,
                cardSpread: 3
            },
            {
                id: 22,
                name: '事业-2',
                cardNum: 78,
                cardSpread: 6
            }
        ]
    }
])
const selectTypeIndex = ref(0)
const isTypeSelect = ref(false)
const typeHide = ref(true)
const selectSubjectIndex = ref(0)
const isSubjectSelect = ref(false)

const handleTypeClick = (index) => {
    selectTypeIndex.value = index
    isTypeSelect.value = true
    setTimeout(() => {
        typeHide.value = false
    }, 500)
}
const handleSubjectClick = (index) => {
    selectSubjectIndex.value = index
    isSubjectSelect.value = true
    emit('selectSubject', subjectTypeList.value[selectTypeIndex.value].children[index])
}
</script>

<template>
    <div class="w-full h-full">
        <div class="subject-box p-[2rem]">
            <div class="subject-type" :class="{ 'fade': isTypeSelect }" v-show="typeHide">
                <div class="title text-[0.6rem] mb-[4rem] text-[#fff] text-center">请选择题目类型</div>
                <div v-for="(item, index) in subjectTypeList" :key="item.id" class="text-[#fff] text-[0.8rem] td"
                    :class="{ 'click': selectTypeIndex === index && isTypeSelect }" @click="handleTypeClick(index)">
                    {{ item.name }}
                </div>
            </div>

            <div v-show="!typeHide">
                <div class="title text-[0.6rem] mb-[4rem] text-[#fff] flex items-center justify-center">请选择题目</div>
                <div class="title-tr" v-for="(item, index) in subjectTypeList[selectTypeIndex].children" :key="item.id"
                    :class="{ 'click': selectSubjectIndex === index && isSubjectSelect }"
                    @click="handleSubjectClick(index)">
                    {{ (index + 1) }}、{{ item.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.subject-box {
    padding: 1rem;
}

.subject-type.fade {
    animation: fade 0.5s ease-in-out;
}

@keyframes fade {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        display: none;
    }
}

.title {
    margin-bottom: 3rem;
}

.td {
    padding: 0.4rem 1rem;
    border: 1px solid #fff;
    border-radius: 0.2rem;
    margin: 0.2rem;
    text-align: center;

}

.td.click {
    border: 1px solid rgba(212, 175, 55, 0.8);
    color: rgba(212, 175, 55, 0.8);
}

.title-tr {
    padding: 0.4rem 1rem;
    border: 1px solid #fff;
    border-radius: 0.2rem;
    margin: 0.2rem;
    text-align: center;
    color: #fff;
    font-size: 0.8rem;
}

.title-tr.click {
    border: 1px solid rgba(212, 175, 55, 0.8);
    color: rgba(212, 175, 55, 0.8);
}
</style>