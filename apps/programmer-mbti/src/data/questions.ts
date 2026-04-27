import type { Question } from "../lib/types";

export const likertScale = [
  { value: 1, label: "Strongly Agree" },
  { value: 2, label: "Agree" },
  { value: 3, label: "Slightly Agree" },
  { value: 4, label: "Neutral" },
  { value: 5, label: "Slightly Disagree" },
  { value: 6, label: "Disagree" },
  { value: 7, label: "Strongly Disagree" },
] as const;

export const questions: Question[] = [
  {
    id: "S1",
    dimension: "S",
    kind: "scenario",
    prompt:
      "周五傍晚突然塞来脏活，我第一反应是先让 AI（比如 Gemini、Claude 或 Copilot）吐个能上线的骨架。",
    agreementPole: "C",
    disagreementPole: "T",
  },
  {
    id: "S2",
    dimension: "S",
    kind: "scenario",
    prompt:
      "接到陌生需求时，比起先啃文档和老代码，我更愿意先让 AI 给我一版八成能跑的脚手架。",
    agreementPole: "C",
    disagreementPole: "T",
  },
  {
    id: "S3",
    dimension: "S",
    kind: "scenario",
    prompt:
      "写那些毫无营养的 boilerplate 时，我宁愿花时间琢磨 prompt 让 AI 替我写，也不想亲手弄脏自己的手。",
    agreementPole: "C",
    disagreementPole: "T",
  },
  {
    id: "S4",
    dimension: "S",
    kind: "scenario",
    prompt:
      "面对 Reviewer 在 CL/PR 里刁钻的灵魂拷问，我更倾向于把 comment 丢给大模型求一段反驳话术。",
    agreementPole: "C",
    disagreementPole: "T",
  },
  {
    id: "S5",
    dimension: "S",
    kind: "attitude",
    prompt:
      "哪怕 AI 给的代码已经能过测试，核心逻辑我还是更想自己手敲一遍，否则心里不踏实。",
    agreementPole: "T",
    disagreementPole: "C",
  },
  {
    id: "H1",
    dimension: "H",
    kind: "scenario",
    prompt:
      "一个内部小工具需求，我也会本能想到解耦 Decoupling、分层和未来扩展性。",
    agreementPole: "O",
    disagreementPole: "A",
  },
  {
    id: "H2",
    dimension: "H",
    kind: "scenario",
    prompt:
      "明明只是个普通 CRUD，我也会忍不住想把它包装成 Platform 级别的通用服务。",
    agreementPole: "O",
    disagreementPole: "A",
  },
  {
    id: "H3",
    dimension: "H",
    kind: "scenario",
    prompt:
      "需求还没落地，我脑子里已经开始盘算 Scalability、Backward compatibility 和 HA。",
    agreementPole: "O",
    disagreementPole: "A",
  },
  {
    id: "H4",
    dimension: "H",
    kind: "scenario",
    prompt: "只要今晚能 Push to Prod，我完全可以先糊一个能活过这周的版本。",
    agreementPole: "A",
    disagreementPole: "O",
  },
  {
    id: "H5",
    dimension: "H",
    kind: "attitude",
    prompt:
      "比起为了架构 purity 多开几轮 design review，我更愿意先 Release、以后再慢慢收技术债。",
    agreementPole: "A",
    disagreementPole: "O",
  },
  {
    id: "I1",
    dimension: "I",
    kind: "scenario",
    prompt:
      "线上一报错，我第一反应通常是翻日志、看 trace、对最近变更，而不是先碰运气重启。",
    agreementPole: "L",
    disagreementPole: "R",
  },
  {
    id: "I2",
    dimension: "I",
    kind: "scenario",
    prompt:
      "遇到极难复现的偶发 bug，比起死磕 root cause，我更倾向于先写个兜底的定时 restart 脚本。",
    agreementPole: "R",
    disagreementPole: "L",
  },
  {
    id: "I3",
    dimension: "I",
    kind: "scenario",
    prompt:
      "本地没事、一上 Prod 就炸时，我通常会先加 print 或 console.log 到处试，而不是立刻翻源码。",
    agreementPole: "R",
    disagreementPole: "L",
  },
  {
    id: "I4",
    dimension: "I",
    kind: "attitude",
    prompt:
      "只要服务先恢复了，这次 incident 暂时没把根因挖到底，我其实也能接受。",
    agreementPole: "R",
    disagreementPole: "L",
  },
  {
    id: "I5",
    dimension: "I",
    kind: "attitude",
    prompt:
      "不把“为什么会坏、为什么这样修”搞明白，我很难真正收工，更别说安心下班。",
    agreementPole: "L",
    disagreementPole: "R",
  },
  {
    id: "P1",
    dimension: "P",
    kind: "attitude",
    prompt:
      "哪怕不算 perf、不给 bonus，我周末也愿意自愿折腾 side project、开源工具或者新技术。",
    agreementPole: "G",
    disagreementPole: "W",
  },
  {
    id: "P2",
    dimension: "P",
    kind: "scenario",
    prompt:
      "公司开 hackathon、20% project 或新模型试点时，我会真心想报名，不只是表演积极。",
    agreementPole: "G",
    disagreementPole: "W",
  },
  {
    id: "P3",
    dimension: "P",
    kind: "attitude",
    prompt:
      "想到 perf review、promo 和 PIP，比想到技术本身更能驱动我认真干活。",
    agreementPole: "W",
    disagreementPole: "G",
  },
  {
    id: "P4",
    dimension: "P",
    kind: "attitude",
    prompt:
      "H1B、PERM 或 layoff 带来的现实压力，会明显影响我对工作和风险的选择。",
    agreementPole: "W",
    disagreementPole: "G",
  },
  {
    id: "P5",
    dimension: "P",
    kind: "attitude",
    prompt:
      "只要能准时下班，我通常不会主动再给公司多贡献一个晚上的脑细胞。",
    agreementPole: "W",
    disagreementPole: "G",
  },
];
