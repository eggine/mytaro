import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ESM 中需要手动获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.cwd();
const outputFileName = 'descp.json';

try {
    const files = fs.readdirSync(targetDir);

    const jpgFiles = files.filter(file => 
        path.extname(file).toLowerCase() === '.jpg'
    );

    const resultData = jpgFiles.map(filename => ({
        img: filename,
        content: "",
        norm: "",
        reve: ""
    }));

    fs.writeFileSync(
        path.join(targetDir, outputFileName),
        JSON.stringify(resultData, null, 4),
        'utf8'
    );

    console.log(`成功！处理了 ${jpgFiles.length} 张图片，已生成 ${outputFileName}`);
} catch (err) {
    console.error('发生错误:', err);
}