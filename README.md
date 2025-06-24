# 🧠 空间推理能力测评系统

基于矩阵取样（Matrix Sampling）的科研级空间推理能力测评平台，采用 PISA/TIMSS 等国际测评的标准设计。

## 📊 项目概述

### 核心特点
- 📐 **科学设计**: 采用矩阵取样框架，确保测评的科学性和效率
- 🎯 **智能分配**: 559道题目分为19个测试册，每人只需完成30题
- 🔗 **IRT链接**: 通过重叠题目实现不同测试册的结果统一标尺
- 📱 **现代界面**: React + Vite 构建的响应式Web应用
- ☁️ **云端部署**: 支持GitHub Pages自动部署

### 测评参数
| 参数 | 值 | 说明 |
|------|----|----|
| 总题数 (I) | 559 | DISE数据集中的题目总数 |
| 类别数 (C) | 10 | 空间认知类别数量 |
| 每人题数 (K) | 30 | 每份测试册的题目数量 |
| 测试册数 (B) | 19 | 总共生成的测试册数量 |
| 重叠题数 | 3 | 用于IRT链接的重叠题目数 |

## 🏗️ 系统架构

```
spatial-survey/
├── 📄 prepare_booklets.py      # 科学测卷生成脚本
├── 📁 frontend/                # React前端应用
│   ├── src/
│   │   ├── App.jsx            # 主应用组件
│   │   ├── components/        # UI组件
│   │   │   ├── WelcomePage.jsx      # 欢迎页面
│   │   │   ├── SurveyPage.jsx       # 测试页面
│   │   │   ├── QuestionCard.jsx     # 题目卡片
│   │   │   └── CompletionPage.jsx   # 完成页面
│   │   └── index.css          # 样式文件
│   ├── index.html             # 入口HTML
│   ├── package.json           # 依赖配置
│   └── vite.config.js         # 构建配置
├── 📁 backend/                 # AWS Lambda函数
│   ├── assign_booklet/        # 测试册分配API
│   └── save_response/         # 响应保存API
├── 📁 public/booklets/        # 生成的测试册JSON文件
└── 📁 .github/workflows/      # GitHub Actions部署配置
```

## 🚀 快速开始

### 1. 生成科学测卷

```bash
# 运行科学测卷生成脚本
cd spatial-survey
python prepare_booklets.py
```

这将生成：
- 19个测试册JSON文件 (0.json - 18.json)
- 统计报告 (stats.json)
- 每个测试册包含30道均衡分布的题目
- 自动添加重叠题目用于IRT链接

### 2. 启动前端开发

```bash
cd frontend
npm install
npm run dev
```

### 3. 生产部署

推送到GitHub后，GitHub Actions会自动：
1. 生成测试册
2. 构建React应用
3. 部署到GitHub Pages

## 🧪 科学设计原理

### 矩阵取样（Matrix Sampling）

采用国际教育测评（PISA、TIMSS）的标准方法：

1. **题目分层**: 按类别和难度分层随机排序
2. **均衡分配**: 确保每个测试册的类别分布均匀
3. **重叠设计**: 添加链接题目实现不同册子的IRT连接
4. **随机化**: 题目顺序随机化防止位置效应

### 优势特点

✅ **减轻负担**: 每人只需30题，约15分钟完成  
✅ **保证覆盖**: 全面覆盖559题和10个认知类别  
✅ **提高效率**: 相同样本量下获得更多信息  
✅ **科学可靠**: 通过IRT模型保证测量精度  

## 📱 用户体验

### 欢迎页面
- 📋 清晰的测试说明和科学背景介绍
- 👤 用户信息收集（ID、年龄、性别、教育背景）
- 🔒 隐私协议和知情同意

### 测试界面
- 📊 实时进度显示和时间统计
- 🖼️ 支持多种图像格式的题目展示
- 🎯 直观的选择题界面
- 🧭 快速导航和题目跳转

### 完成页面
- 📈 详细的测试统计信息
- 💾 结果下载功能
- 🔄 重新测试选项

## 🔧 API接口

### 获取测试册 (assign_booklet)
```javascript
POST /assign_booklet
Response: { "booklet_id": 3 }
```

### 保存响应 (save_response)
```javascript
POST /save_response
Body: {
  "user_id": "user123",
  "booklet_id": 3,
  "responses": { "q1": "A", "q2": "B" },
  "ts": 1625097600000
}
```

## 📊 数据结构

### 测试册格式
```json
[
  {
    "id": "q001",
    "question": "题目文本",
    "image": "base64或URL",
    "category": "空间类别",
    "difficulty": "简单/中等/困难",
    "options": [
      {"value": "A", "text": "选项A"},
      {"value": "B", "text": "选项B"}
    ],
    "booklet_id": 0,
    "position": 1,
    "is_linking": false
  }
]
```

### 响应数据格式
```json
{
  "user_id": "user123",
  "booklet_id": 3,
  "responses": {"q001": "A", "q002": "B"},
  "response_times": {"q001": 1500, "q002": 2300},
  "total_time": 900000,
  "completed_at": "2024-01-01T12:00:00Z"
}
```

## 🎨 自定义配置

### 修改测评参数
编辑 `prepare_booklets.py` 的核心参数：
```python
K = 30                     # 每份测试册题数
OVERLAP_ITEMS = 3          # 重叠题数量
SEED = 42                  # 随机种子
```

### 自定义UI样式
修改 `frontend/src/index.css` 中的CSS变量：
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
}
```

## 🔬 科研应用

### IRT分析建议
1. **模型选择**: 推荐使用2参数或3参数IRT模型
2. **软件工具**: 
   - Python: `py-irt`
   - R: `mirt`, `TAM`
3. **链接方法**: 通过重叠题目进行固定锚定或自由校准

### 数据收集最佳实践
- 每题建议3-5人作答以保证信度
- 控制测试环境一致性
- 记录详细的响应时间数据
- 收集必要的背景变量

## 📞 支持与贡献

### 问题反馈
如遇到任何问题，请提交 GitHub Issue 并包含：
- 操作系统和浏览器信息
- 详细的错误描述
- 复现步骤

### 贡献指南
欢迎提交Pull Request来改进系统：
1. Fork 项目仓库
2. 创建功能分支
3. 提交代码变更
4. 发起Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有参与测试的用户，您们的贡献对空间推理认知科学研究具有重要意义。

---

**空间推理能力测评系统** - 科学、高效、用户友好的认知评估平台 