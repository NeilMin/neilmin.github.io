const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-projects-'));

try {
  execFileSync('hugo', ['--cleanDestinationDir', '--destination', tempDir], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  const projectsPagePath = path.join(tempDir, 'projects', 'index.html');
  assert.ok(fs.existsSync(projectsPagePath), 'expected Hugo to generate /projects/index.html');
  const zhProjectsPagePath = path.join(tempDir, 'zh', 'projects', 'index.html');
  assert.ok(fs.existsSync(zhProjectsPagePath), 'expected Hugo to generate /zh/projects/index.html');

  const html = fs.readFileSync(projectsPagePath, 'utf8');
  const zhHtml = fs.readFileSync(zhProjectsPagePath, 'utf8');
  const searchIndexPath = path.join(tempDir, 'index.json');
  assert.ok(fs.existsSync(searchIndexPath), 'expected Hugo to generate /index.json for search');
  const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
  const zhSearchIndexPath = path.join(tempDir, 'zh', 'index.json');
  assert.ok(fs.existsSync(zhSearchIndexPath), 'expected Hugo to generate /zh/index.json for search');
  const zhSearchIndex = JSON.parse(fs.readFileSync(zhSearchIndexPath, 'utf8'));

  assert.ok(html.includes('Programmer MBTI Test'), 'expected first project to render');
  assert.ok(html.includes('AI Cover Songs'), 'expected second project to render');
  assert.ok(html.includes('/images/projects/programmer-mbti-cover.png'), 'expected the first project to use the real PNG asset');
  assert.ok(html.includes('/images/projects/voice-cloning-cover.png'), 'expected the second project to use the replacement PNG asset');
  assert.ok(html.includes('href="/resume/"'), 'expected header resume link to stay local');
  assert.ok(html.includes('href="/projects/"'), 'expected header projects link to stay local');
  assert.ok(html.includes('href="/zh/projects/"'), 'expected language switch link to stay local');
  assert.ok(!html.includes('post-description'), 'expected projects page to omit the section description block');
  assert.ok(!html.includes('post-content'), 'expected projects page to omit the section body copy');

  const mbtiIndex = html.indexOf('Programmer MBTI Test');
  const voiceIndex = html.indexOf('AI Cover Songs');
  assert.ok(mbtiIndex >= 0 && voiceIndex >= 0 && mbtiIndex < voiceIndex, 'expected projects to be sorted by ascending weight');

  assert.ok(html.includes('https://mbti.neilmin.com'), 'expected primary CTA for the first project');
  assert.ok(
    html.includes('https://youtube.com/playlist?list=PLr_EbLeiZKPk_fEOvsJ7arsGGiOHddihK&amp;si=-Z8vwresgb27mq1F'),
    'expected the provided YouTube playlist URL for the second project'
  );
  assert.ok(html.includes('Read the post'), 'expected optional secondary CTA to render when present');
  assert.ok(html.includes('GitHub'), 'expected GitHub link to render when provided');
  assert.ok(html.includes('All Tags'), 'expected a tag filter reset control');
  assert.ok(html.includes('data-project-tags='), 'expected project cards to expose tag metadata for filtering');
  assert.ok(html.includes('?tag=hugo'), 'expected project tags to render as filter links');

  const secondProjectStart = html.indexOf('AI Cover Songs');
  const secondProjectEnd = html.indexOf('</article>', secondProjectStart);
  const secondProjectHtml = html.slice(secondProjectStart, secondProjectEnd);

  assert.ok(!secondProjectHtml.includes('Read the post'), 'expected no secondary CTA for the second project');
  assert.ok(!secondProjectHtml.includes('GitHub'), 'expected no GitHub link for the second project');

  const projectSearchEntry = searchIndex.find((entry) => entry.permalink && entry.permalink.includes('/projects/#programmer-mbti-test'));
  assert.ok(projectSearchEntry, 'expected projects to be indexed for site search');
  assert.ok(Array.isArray(projectSearchEntry.tags), 'expected indexed project to carry searchable tags');
  assert.ok(projectSearchEntry.tags.includes('Hugo'), 'expected indexed project tags to include Hugo');

  assert.ok(zhHtml.includes('程序员 MBTI 测试'), 'expected localized Chinese project title');
  assert.ok(zhHtml.includes('一个 MBTI 风格的小测试，测测你是哪一种程序员人格。'), 'expected localized Chinese project description');
  assert.ok(zhHtml.includes('查看博文'), 'expected localized Chinese secondary CTA');
  assert.ok(zhHtml.includes('试听歌单'), 'expected localized Chinese primary CTA');
  assert.ok(!zhHtml.includes('post-description'), 'expected Chinese projects page to omit the section description block');
  assert.ok(!zhHtml.includes('post-content'), 'expected Chinese projects page to omit the section body copy');

  const zhProjectSearchEntry = zhSearchIndex.find((entry) => entry.permalink && entry.permalink.includes('/zh/projects/#programmer-mbti-test'));
  assert.ok(zhProjectSearchEntry, 'expected Chinese projects to be indexed for site search');
  assert.ok(zhProjectSearchEntry.title === '程序员 MBTI 测试', 'expected Chinese search index to use localized project titles');
  assert.ok(zhProjectSearchEntry.summary === '一个 MBTI 风格的小测试，测测你是哪一种程序员人格。', 'expected Chinese search index to use localized project summaries');

  console.log('projects showcase assertions passed');
} finally {
  fs.rmdirSync(tempDir, { recursive: true });
}
