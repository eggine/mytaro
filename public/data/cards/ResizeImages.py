import os
from PIL import Image

def force_resize_images(input_folder, output_folder):
    # 设定目标分辨率：宽 256，高 512
    target_width = 256
    target_height = 512
    
    # 检查并创建输出目录
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"已创建输出文件夹: {output_folder}")

    # 支持的图片格式
    valid_extensions = ('.jpg', '.jpeg', '.JPG', '.JPEG')

    # 处理计数器
    count = 0

    for filename in os.listdir(input_folder):
        if filename.endswith(valid_extensions):
            try:
                img_path = os.path.join(input_folder, filename)
                with Image.open(img_path) as img:
                    # 核心操作：强制调整尺寸
                    # Image.Resampling.LANCZOS 保证了拉伸后的像素平滑度
                    resized_img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
                    
                    # 保存结果
                    save_path = os.path.join(output_folder, filename)
                    resized_img.save(save_path, quality=95)
                    
                    count += 1
                    print(f"[{count}] 已处理并拉伸: {filename}")
            except Exception as e:
                print(f"无法处理文件 {filename}: {e}")

    print(f"\n任务完成！共转换图片: {count} 张")

# --- 请在此处修改你的路径 ---
input_dir = 'D:/Poktata/public/data/cards/cute/1024'
output_dir = 'D:/Poktata/public/data/cards/cute'

force_resize_images(input_dir, output_dir)