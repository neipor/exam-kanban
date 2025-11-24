# Exam Kanban (考试看板)

> "专注当下，掌控时间。"

Exam Kanban 是一款专为学生和备考者设计的桌面端考试日程管理与看板工具。
它不仅仅是一个倒计时器，更是一个优雅的时间线可视化系统，旨在用最直观、美观的方式展示考试进程，帮助你在高强度的考试周里保持从容。

![License](https://img.shields.io/badge/license-GPLv3-blue.svg)

## 🌐 在线体验

**[👉 点击立即体验 Web 版 (Demo)](https://exam-kanban.huarch.top/)**

*Powered by **Cloudflare Pages*** ⚡️

> **注意**：Web 版仅供功能体验和演示。包含完整系统级功能（如开机自启、Kiosk 锁定、离线运行等）的**原生桌面版 (Windows/macOS)** 正在紧张打包中，稍后发布，敬请期待！

## ✨ 设计理念

我是一名来自**天津四十二中**的高中生。

在日常的测验和备考中，我发现**市面上大多数的计时工具要么设计粗糙，要么充斥着让人焦虑的红色倒计时**。这种视觉上的压迫感往往会起到反作用。我认为，**真正优秀的辅助工具应该是安静、克制且优雅的**。

*   **视觉美学**：摒弃了传统的枯燥数字，使用流动的光影和呼吸感动画来表达时间的流逝。
*   **秩序感**：通过清晰的左侧看板和右侧侧边栏，让你时刻清楚“现在在哪”、“接下来做什么”。
*   **仪式感**：从"开始答题"到"立即停笔"的收卷时刻，每一个环节都有专门设计的交互，还原真实的考场节奏，但多了一份电子时代的精致。

## 🚀 核心功能

*   **沉浸式专注模式 (Focus Mode)**：
    *   全屏无干扰设计。
    *   根据剩余时间智能切换环境光效（冷静蓝 -> 专注金 -> 最终时刻）。
    *   *注：为了不制造焦虑，即使在最后时刻，我们也克制地使用了柔和的提示光，而非刺眼的警报。*
*   **智能考场逻辑**：
    *   **自动流转**：支持多科目连续排程，自动在"考试中"、"收卷中"、"休息中"状态间切换。
    *   **收卷模式 (Collection Mode)**：考试结束后的专属状态，优雅地提示停止答题。
    *   **监考控制台**：内置隐藏式控制面板，支持特殊情况下的时间调整（补时），并配备长按防误触锁。
*   **灵活的数据管理**：
    *   支持 JSON 格式的考程配置一键导入/导出。
    *   支持本地持久化存储，断电不丢失进度。

## 🛠️ 技术细节

本项目基于现代 Web 技术栈构建，并封装为原生桌面应用：

*   **Frontend**: React 19, TypeScript, Vite
*   **Desktop**: Electron
*   **UI/UX**: Tailwind CSS, Framer Motion (负责所有丝滑的动画效果)
*   **Architecture**: 采用 React Context + Custom Hooks 状态机模式，确保计时的绝对精准与逻辑的解耦。

## 💻 如何开发

```bash
# 克隆仓库
git clone https://github.com/neipor/exam-kanban.git

# 安装依赖
npm install

# 启动开发服务器
npm run electron:serve

# 打包构建
npm run electron:build
```

## 👨‍💻 作者

**Xinhe Hu** (@neipor)
📍 天津四十二中 (Tianjin No.42 High School)

这是一个高中生的课余作品。如果你觉得这个小工具让你的备考时光稍微美好了一点点，或者有任何改进建议，欢迎通过邮件联系我。

📧 Email: `neitherportal@proton.me`

---

**License**
[GNU General Public License v3.0](./LICENSE) © 2025 Xinhe Hu