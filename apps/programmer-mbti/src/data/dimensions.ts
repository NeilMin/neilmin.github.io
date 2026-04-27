import type { DimensionDefinition } from "../lib/types";

export const dimensions: DimensionDefinition[] = [
  {
    id: "S",
    name: "Source",
    label: "代码来源",
    description: "你更依赖 AI 和现成骨架，还是更相信自己亲手把逻辑敲出来。",
    leftPole: {
      code: "C",
      label: "Copilot",
      shortLabel: "Copilot",
    },
    rightPole: {
      code: "T",
      label: "Typecraft",
      shortLabel: "手工打磨",
    },
  },
  {
    id: "H",
    name: "Hierarchy",
    label: "架构审美",
    description: "你更容易往未来架构想，还是更倾向先交付一个今天能活下去的版本。",
    leftPole: {
      code: "O",
      label: "Overdesign",
      shortLabel: "Overdesign",
    },
    rightPole: {
      code: "A",
      label: "ASAP",
      shortLabel: "ASAP",
    },
  },
  {
    id: "I",
    name: "Investigation",
    label: "排错玄学",
    description: "你更靠日志和源码溯源，还是更靠重启、试错和求神拜佛。",
    leftPole: {
      code: "L",
      label: "Logic",
      shortLabel: "Logic",
    },
    rightPole: {
      code: "P",
      label: "Pray",
      shortLabel: "Pray",
    },
  },
  {
    id: "P",
    name: "Purpose",
    label: "工作动机",
    description: "你更像技术热爱者，还是更像在北美科技职场里努力求生的打工人。",
    leftPole: {
      code: "G",
      label: "Geek",
      shortLabel: "Geek",
    },
    rightPole: {
      code: "W",
      label: "Worker",
      shortLabel: "Worker",
    },
  },
];
