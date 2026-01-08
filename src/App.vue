<script setup>
import { ref, onMounted, onUnmounted, defineEmits, provide } from 'vue'
import Subject from './components/subject.vue'
import Shuffle from './components/shuffle.vue'
import CardSelect from './components/card-select.vue'
import Explain from './components/explain.vue'

const flow = ref('subject')
const selectedSubject = ref({})
const selectedCardList = ref([])

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
</script>

<template>
  <div class="w-full h-full">
    <Subject v-if="flow === 'subject'" @selectSubject="handleSelectSubject" />
    <Shuffle v-if="flow === 'shuffle'" :selectedSubject="selectedSubject" @shuffleEnd="handleShuffleEnd" />
    <CardSelect v-if="flow === 'select'" :selectedSubject="selectedSubject" @selectCard="handleSelectCard" />
    <Explain v-if="flow === 'explain'" :selectedCardList="selectedCardList" />
  </div>
</template>

<style scoped></style>
