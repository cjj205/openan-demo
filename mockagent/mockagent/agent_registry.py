# -*- coding: utf-8 -*-
"""Agent 注册表：每个打桩 Agent 是 agents/ 下的一个独立目录。

布局 / Layout:
    agents/
    ├── _defaults.json              # 共享基线（llm 默认、12 模板变体池、workDirRoot 等）
    └── <agent-id>/agent.json       # 单个 Agent 定义（名称/端口/数据集范围/变体/工作流）

`load_define()` 把目录聚合成旧版单文件 define 形态（{"defaults", "instances"}），
路由层与启动器均通过本模块访问 Agent 定义。
"""
from __future__ import annotations

import json
import os
from pathlib import Path

AGENT_FILENAME = "agent.json"
DEFAULTS_FILENAME = "_defaults.json"


def agents_dir() -> Path:
    """agents/ 目录（可用 MOCK_AGENT_AGENTS_DIR 覆盖）。"""
    override = os.environ.get("MOCK_AGENT_AGENTS_DIR")
    if override:
        return Path(override)
    return Path(__file__).resolve().parents[1] / "agents"


def list_agent_dirs() -> list[Path]:
    root = agents_dir()
    if not root.is_dir():
        return []
    return sorted(d for d in root.iterdir() if d.is_dir() and (d / AGENT_FILENAME).is_file())


def load_defaults() -> dict:
    path = agents_dir() / DEFAULTS_FILENAME
    return json.loads(path.read_text(encoding="utf-8"))


def load_agent(agent_dir: Path) -> dict:
    return json.loads((agent_dir / AGENT_FILENAME).read_text(encoding="utf-8"))


def load_define() -> dict:
    """聚合为 define 形态：{"version", "defaults", "instances": [...]}。"""
    defaults = load_defaults()
    instances = [load_agent(d) for d in list_agent_dirs()]
    return {"version": 1, "defaults": defaults, "instances": instances}


def resolve_agent_dir(agent: str) -> Path:
    """按 id 或目录路径定位 Agent 目录。"""
    candidate = Path(agent)
    if candidate.is_dir() and (candidate / AGENT_FILENAME).is_file():
        return candidate
    directory = agents_dir() / agent
    if (directory / AGENT_FILENAME).is_file():
        return directory
    raise FileNotFoundError(f"未找到 Agent 目录：{agent}（agents/{agent}/{AGENT_FILENAME} 不存在）")
