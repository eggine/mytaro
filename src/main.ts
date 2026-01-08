import { createApp } from 'vue'
import './style.css'
// @ts-ignore 无法找到模块声明文件，暂时忽略类型检查
import 'tailwindcss/index';
// @ts-ignore 无法找到模块声明文件，暂时忽略类型检查
import App from './App.vue'


createApp(App).mount('#app')
