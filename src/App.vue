<script setup>
import { ref, onMounted, onUnmounted, defineEmits, provide } from 'vue'
import Subject from './components/subject.vue'
import Shuffle from './components/shuffle.vue'
import CardSelect from './components/card-select.vue'
import Explain from './components/explain.vue'
import Analysis from './components/analysis.vue'

const flow = ref('subject')
const selectedSubject = ref({})
const selectedCardList = ref([])
const isShowAnalysis = ref(false)
const analysisCard = ref({})
const explainRef = ref()
const isRead = ref(false)
const analysisData = ref({})
const saveRole = ref('知心姐姐')
const isAgain = ref(false)

const handleSelectSubject = (subject) => {
  console.log(subject)
  flow.value = 'shuffle'
  selectedSubject.value = subject
}

const handleShuffleEnd = () => {
  console.log('洗牌结束')
  flow.value = 'select'
}

const handleSelectCard = (cards) => {
  console.log(cards)
  selectedCardList.value = cards
  flow.value = 'explain'
}

const handleAnalysis = (role) => {
  console.log(role)
  if (role !== saveRole.value && isRead.value) {
    isAgain.value = true
  } else {
    isAgain.value = false
  }
  saveRole.value = role
  isShowAnalysis.value = true
}

function handleRead(data) {
  isRead.value = true
  analysisData.value = data
}
</script>

<template>
  <div class="w-full h-full">
    <Subject v-if="flow === 'subject'" @selectSubject="handleSelectSubject" />
    <Shuffle v-if="flow === 'shuffle'" :selectedSubject="selectedSubject" @shuffleEnd="handleShuffleEnd" />
    <CardSelect v-if="flow === 'select'" :selectedSubject="selectedSubject" @selectCard="handleSelectCard" />
    <Explain ref="explainRef" v-if="flow === 'explain'" v-show="!isShowAnalysis" :selectedSubject="selectedSubject" :selectedCardList="selectedCardList" :isRead="isRead" @handleAnalysis="handleAnalysis" />
    <Analysis v-if="isShowAnalysis" v-model:isShowAnalysis="isShowAnalysis" :selectedSubject="selectedSubject" :selectedCardList="selectedCardList" :analysisCard="analysisCard" :analysisData="analysisData" :role="saveRole" :isAgain="isAgain" @handleRead="handleRead" />
  </div>
</template>

<style scoped></style>
