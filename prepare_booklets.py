"""
科研级矩阵取样测卷生成脚本
实现 PISA/TIMSS 风格的测卷设计：类别均衡 + 重叠题 + IRT链接
"""
import pandas as pd
import numpy as np
import json
import pathlib
from collections import defaultdict
import base64

# ===== 核心参数 =====
CSV = "/Volumes/Disk1T/DISE-dataset/DISE-bench/DISE-benchmark.csv"      # 包含题目内容和图片路径的文件
IMAGE_BASE_PATH = pathlib.Path("/Volumes/Disk1T/DISE-dataset/")  # 图片文件的根目录
I = 559                    # 题目总数
C = 10                     # 类别数
K = 30                     # 每人做的题目数（每份测卷题数）
OVERLAP_ITEMS = 3          # 重叠题数量（用于IRT链接）
SEED = 42


def encode_image_to_base64(image_path):
    """读取图片文件并编码为Base64 Data URI"""
    if pd.isna(image_path) or not image_path.strip():
        return None
    try:
        # 这里的 image_path 是 "DISE-dataset/images/..."，所以我们直接用根路径
        full_image_path = IMAGE_BASE_PATH / \
            image_path.replace("DISE-dataset/", "", 1)
        ext = full_image_path.suffix.lstrip('.').lower()
        if ext == 'jpg':
            ext = 'jpeg'

        with open(full_image_path, "rb") as image_file:
            encoded_string = base64.b64encode(
                image_file.read()).decode('utf-8')
            return f"data:image/{ext};base64,{encoded_string}"
    except (FileNotFoundError, IOError) as e:
        print(f"⚠️  警告: 无法读取图片文件 {image_path}。错误: {e}")
        return None


def create_scientific_booklets():
    """生成科学的矩阵取样测卷"""

    # 1. 读取包含图片路径的数据
    print("📚 读取 DISE 数据集（包含图片路径）...")
    df = pd.read_csv(CSV)

    # 2. 将图片路径实时编码为base64
    print("🖼️  正在将图片编码为 base64...")
    df['image'] = df['image'].apply(encode_image_to_base64)

    # 确保有图片数据列
    if 'image' not in df.columns:
        print("❌ 错误：数据文件中没有找到image列")
        return

    print(f"总题数: {len(df)}, 类别数: {df['category'].nunique()}")

    # 检查图片数据格式
    sample_image = df['image'].iloc[0] if len(df) > 0 else None
    if sample_image and not str(sample_image).startswith('data:'):
        print("📝 图片数据需要转换为data URI格式...")
    else:
        print("✅ 图片数据已经是正确的格式")

    # 3. 按类别、难度分层随机排序（保证每类别在各测卷中均匀分布）
    print("🔀 按类别和难度分层排序...")
    df = df.sort_values(['category', 'difficulty'], na_position='last')
    df = df.groupby('category').apply(lambda x: x.sample(
        frac=1, random_state=SEED)).reset_index(drop=True)

    # 4. 计算测卷数量
    B = int(np.ceil(len(df) / K))
    print(f"📖 生成 {B} 个测卷，每卷 {K} 题")

    # 5. 创建均衡的测卷分配
    booklets = create_balanced_booklets(df, B, K)

    # 6. 添加重叠题（用于IRT链接）
    booklets = add_linking_items(booklets, OVERLAP_ITEMS)

    # 7. 输出测卷文件
    save_booklets(booklets)

    # 8. 生成统计报告
    generate_stats_report(booklets, df)


def create_balanced_booklets(df, B, K):
    """创建类别均衡的测卷"""
    booklets = {i: [] for i in range(B)}

    # 按类别循环分配，确保每个测卷的类别分布均匀
    categories = df['category'].unique()
    items_per_category = K // len(categories)  # 每类别在单测卷中的题数

    print(f"📊 每个测卷包含 {len(categories)} 个类别，每类约 {items_per_category} 题")

    for cat in categories:
        cat_items = df[df['category'] == cat].copy()

        # 循环分配该类别的题目到各测卷
        for i, (_, item) in enumerate(cat_items.iterrows()):
            booklet_id = i % B
            if len(booklets[booklet_id]) < K:  # 防止超出每卷题数限制
                item_dict = item.to_dict()
                item_dict['booklet_id'] = booklet_id
                item_dict['position'] = len(booklets[booklet_id]) + 1

                # 将base64图片数据格式化为data URI
                if pd.notna(item_dict.get('image')):
                    image_data = item_dict['image']
                    # 如果不是data URI格式，转换为data URI
                    if not str(image_data).startswith('data:'):
                        item_dict['image'] = f"data:image/png;base64,{image_data}"
                    # 如果已经是data URI格式，保持不变
                else:
                    item_dict['image'] = None

                booklets[booklet_id].append(item_dict)

    return booklets


def add_linking_items(booklets, overlap_count):
    """添加重叠题实现测卷间IRT链接"""
    print(f"🔗 添加 {overlap_count} 个重叠题进行IRT链接...")

    B = len(booklets)

    # 为每个测卷添加来自前一个测卷的重叠题
    for i in range(1, B):  # 从第2个测卷开始
        prev_booklet = booklets[i-1]
        current_booklet = booklets[i]

        # 取前一测卷的最后几题作为当前测卷的链接题
        linking_items = prev_booklet[-overlap_count:].copy() if len(
            prev_booklet) >= overlap_count else prev_booklet.copy()

        for item in linking_items:
            item_copy = item.copy()
            item_copy['is_linking'] = True
            item_copy['original_booklet'] = i-1
            item_copy['position'] = len(current_booklet) + 1
            current_booklet.append(item_copy)

    return booklets


def save_booklets(booklets):
    """保存测卷到文件"""
    out = pathlib.Path("public/booklets")
    out.mkdir(parents=True, exist_ok=True)

    print(f"💾 保存测卷到 {out}/...")

    for bid, items in booklets.items():
        # 随机打乱题目顺序（防止位置效应）
        items_shuffled = items.copy()
        np.random.seed(SEED + bid)  # 每个测卷使用不同的随机种子
        np.random.shuffle(items_shuffled)

        # 重新编号
        for pos, item in enumerate(items_shuffled, 1):
            item['position'] = pos

        (out / f"{bid}.json").write_text(
            json.dumps(items_shuffled, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

    print(f"✅ {len(booklets)} 个测卷已生成")


def generate_stats_report(booklets, df):
    """生成统计报告"""
    print("\n📈 === 测卷统计报告 ===")

    # 基础统计
    total_items = sum(len(items) for items in booklets.values())
    avg_items_per_booklet = total_items / len(booklets)

    print(f"测卷总数: {len(booklets)}")
    print(f"总题数: {total_items}")
    print(f"平均每卷题数: {avg_items_per_booklet:.1f}")

    # 类别分布统计
    category_dist = defaultdict(lambda: defaultdict(int))
    for bid, items in booklets.items():
        for item in items:
            category_dist[bid][item.get('category', 'Unknown')] += 1

    print(f"\n📊 类别分布（每个测卷）:")
    categories = df['category'].unique()
    for cat in categories:
        counts = [category_dist[bid][cat] for bid in range(len(booklets))]
        print(
            f"  {cat}: 平均 {np.mean(counts):.1f} 题 (范围: {min(counts)}-{max(counts)})")

    # 重叠题统计
    linking_items = sum(1 for items in booklets.values()
                        for item in items if item.get('is_linking', False))
    print(f"\n🔗 链接题总数: {linking_items}")

    # 保存详细报告
    report = {
        'total_booklets': len(booklets),
        'total_items': total_items,
        'avg_items_per_booklet': avg_items_per_booklet,
        'category_distribution': dict(category_dist),
        'linking_items_count': linking_items,
        'generation_params': {
            'K': K,
            'OVERLAP_ITEMS': OVERLAP_ITEMS,
            'SEED': SEED
        }
    }

    pathlib.Path("public/booklets/stats.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print("📄 详细报告已保存到 public/booklets/stats.json")


if __name__ == "__main__":
    np.random.seed(SEED)
    create_scientific_booklets()
    print("\n🎉 科研级测卷生成完成！")
