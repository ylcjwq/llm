# Sharp 安装指南

## 方案一：安装 Visual Studio Build Tools（推荐）

### 1. 下载安装程序
访问：https://visualstudio.microsoft.com/downloads/

找到"Visual Studio 2022 生成工具"（Build Tools for Visual Studio 2022）

### 2. 安装时选择工作负载
勾选："使用 C++ 的桌面开发"（Desktop development with C++）

安装大小约 2-3GB，需要 10-20 分钟

### 3. 安装完成后重新安装依赖
```bash
# 删除有问题的 sharp
rm -rf node_modules/sharp node_modules/@xenova/transformers/node_modules/sharp

# 重新安装
bun install
```

## 方案二：使用 windows-build-tools（更简单）

以**管理员权限**运行 PowerShell：

```powershell
npm install -g windows-build-tools
```

这会自动安装 Python 和 Visual Studio Build Tools。

安装完成后：
```bash
bun install
```

## 验证安装

```bash
bun run dev
```

如果正常启动，说明 sharp 已正确安装。
