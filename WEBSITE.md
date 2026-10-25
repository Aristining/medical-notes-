# 医笺 · 医学课程复习网站

按 7 个科目组织资料：呼吸系统、泌尿系统、内分泌系统、生殖系统、实验诊断学、血液系统、医学影像学。

当前收录 20 份 Markdown 笔记（18 份用户原始笔记及 2 份课件整理笔记）：呼吸系统 8 份，泌尿系统 1 份，血液系统 1 份，内分泌系统 1 份，生殖系统 1 份，医学影像学 1 份，实验诊断学 7 份（阅读导航及六篇知识梳理）。原始文件完整保存在 materials/ 下，note-integrity.json 记录 SHA-256。未收到资料的科目显示空目录。

功能：科目目录、每篇章节目录、跨笔记全文搜索、原始 Markdown 下载、阅读字号、浅色/深色模式、章节收藏、点击展开的名词知识卡片、掌握状态与待巩固筛选、阅读进度与上次位置。收藏、卡片掌握状态和阅读位置保存在当前浏览器，不跨设备同步。网页内容公开可访问。

## GitHub Pages

发布入口是仓库根目录的 index.html。开启 Settings → Pages → Deploy from a branch → main → /(root)，保存即可。静态页面不需要服务端、密钥或依赖安装。正式网址：https://aristining.github.io/medical-notes-/ 。

修改笔记后需重新生成页面和搜索索引：Node.js >=20，npm install，然后 npm run build。生成器使用 marked 17.0.5（MIT）。既有原始笔记保持完整；由课件新整理的笔记区分课件口径与补充辨析，并标注课件页码和必要参考来源。

## 文件结构

- index.html：7 个科目总目录
- subjects/：各科目的笔记列表
- read/：每份资料的阅读页
- materials/：用户原始 Markdown 及标明来源的课件整理笔记（空科目使用 .gitkeep 占位）
- site.json：资料与科目的清单
- search-index.json：生成的全文搜索索引
- app.js / style.css：阅读功能与样式，无第三方网络依赖
- build.mjs / reader-template.html：页面生成源码

本地预览可在仓库目录运行 python3 -m http.server 5180，再打开 http://localhost:5180/。

## 知识卡片

卡片放在有名词解释的小节末尾，点击名词展开原笔记摘录，支持回看原文、标记已掌握、只看待巩固、打乱顺序和收起答案。原始 Markdown 保持完整。阅读导航、参考资料和自测说明不强行生成卡片。

flashcard-terms.json 维护按篇筛选的术语范围；flashcards.mjs 从该篇的定义句和名词表摘录解释及附近限定语。新增术语时先核对原文，再更新词表并构建。flashcards.json 保存卡片、出处和内容校验信息；卡片 ID 由笔记、小节和名词决定，便于更新后保留掌握状态。

运行 npm test 验证出处、限定语、重复定义、无关内容筛除和卡片标识稳定性。
