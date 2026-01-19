<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { getUUID } from '@/utils/index'
import queries from '@/assets/json/queries.json'
import cardsJson from '@/assets/json/cards.json'

const emit = defineEmits(['selectSubject'])

const subjectTypeList = ref(queries)
const selectTypeIndex = ref(0)
const isTypeSelect = ref(false)
const typeHide = ref(true)
const selectSubjectIndex = ref(0)
const isSubjectSelect = ref(false)
const imgs = ref(cardsJson)

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
    emit('selectSubject', subjectTypeList.value[selectTypeIndex.value].details[index])
}
</script>

<template>
    <div class="w-full h-full">
        <div class="subject-box p-[2rem]">
            <div class="subject-type" :class="{ 'fade': isTypeSelect }" v-show="typeHide">
                <div class="title text-[0.6rem] mb-[4rem] text-[#000] text-center">口袋塔塔-内测版</div>
                <div v-for="(item, index) in subjectTypeList" :key="item.id" class="text-[#000] text-[0.8rem] td"
                    :class="{ 'click': selectTypeIndex === index && isTypeSelect }" @click="handleTypeClick(index)">
                    {{ item.kind }}
                </div>
            </div>

            <div v-show="!typeHide">
                <div class="title text-[0.6rem] mb-[4rem] text-[#000] flex items-center justify-center">请选择题目</div>
                <div class="title-tr" v-for="(item, index) in subjectTypeList[selectTypeIndex].details" :key="item.id"
                    :class="{ 'click': selectSubjectIndex === index && isSubjectSelect }"
                    @click="handleSubjectClick(index)">
                    {{ item.descrip }}
                </div>
            </div>
        </div>

        <img v-for="item in imgs" :key="item.id" :src="'/data/cards/' + item.id + '.jpg'"  style="width: 250px; height: 430px;display: none;" />
    </div>
</template>

<style scoped>
.w-full.h-full {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.subject-box {
    padding: 0.8rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    border: 1px solid rgba(255, 255, 255, 0.18);
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
    margin-bottom: 1rem;
}

.td {
    padding: 0.4rem 1rem;
    border: 1px solid #fff;
    border-radius: 0.2rem;
    margin: 0.2rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}

.td:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.td.click {
    border: 1px solid rgba(212, 175, 55, 0.8);
    color: rgba(212, 175, 55, 0.8);
    background: rgba(212, 175, 55, 0.2);
}

.title-tr {
    padding: 0.4rem 1rem;
    border: 1px solid #fff;
    border-radius: 0.2rem;
    margin: 0.2rem;
    text-align: left;
    color: #000000;
    font-size: 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}

.title-tr:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.title-tr.click {
    border: 1px solid rgba(212, 175, 55, 0.8);
    color: rgba(212, 175, 55, 0.8);
    background: rgba(212, 175, 55, 0.2);
}
</style>