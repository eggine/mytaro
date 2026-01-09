import fs from 'fs';
import path from 'path';

// 读取原始卡片数据
const cardsPath = path.resolve('public/data/cards.json');
const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

// 按照ID前缀分组
const groupedCards = {};

cardsData.forEach(card => {
    // 提取ID中数字前面的部分
    const id = card.id;
    let prefix = '';
    
    // 查找最后一个下划线的位置
    const lastUnderscoreIndex = id.lastIndexOf('_');
    
    // 查找第一个数字的位置
    const firstNumberIndex = id.search(/[0-9]/);
    
    if (lastUnderscoreIndex !== -1 && lastUnderscoreIndex < firstNumberIndex) {
        // 对于类似"RWS_Tarot_00_Fool"的ID，分组为"RWS_Tarot_"
        prefix = id.substring(0, lastUnderscoreIndex + 1);
    } else if (firstNumberIndex !== -1) {
        // 对于类似"Cups07"的ID，分组为"Cups"
        prefix = id.substring(0, firstNumberIndex);
    } else {
        // 如果没有数字，整个ID作为前缀
        prefix = id;
    }
    
    // 将卡片添加到相应的分组
    if (!groupedCards[prefix]) {
        groupedCards[prefix] = [];
    }
    groupedCards[prefix].push(card);
});

// 保存分组后的数据
const outputPath = path.resolve('src/assets/json/groupedCards.json');
fs.writeFileSync(outputPath, JSON.stringify(groupedCards, null, 2), 'utf8');

console.log('卡片数据已成功分组！');
console.log('分组结果已保存到:', outputPath);
console.log('分组情况:', Object.keys(groupedCards));
