// 设置根字体大小
function setRootFontSize() {
    const clientWidth = document.documentElement.clientWidth;
    // 将屏幕宽度分成10份（也可分24份等），作为1rem的基准
    let rem = (clientWidth / 10);
    if (clientWidth > 760) {
        rem = 50;
    }
    document.documentElement.style.fontSize = rem + 'px';
}
// 初始设置
setRootFontSize();
// 监听窗口变化
window.addEventListener('resize', setRootFontSize);