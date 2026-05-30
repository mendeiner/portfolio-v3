const SCORES_KEY       = 'obrunoedita-reel-scores'
const LIKES_KEY        = 'obrunoedita-reel-likes'
const LITTLE_THRESHOLD = 0.30
const MOST_THRESHOLD   = 0.45
export const DEFAULT_SCORE = 1.1  // new-company discovery boost

// ── localStorage helpers ──────────────────────────────────────────────────────

export function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY)
    if (!raw) return { version: 1, companies: {} }
    const parsed = JSON.parse(raw)
    return parsed?.companies ? parsed : { version: 1, companies: {} }
  } catch {
    return { version: 1, companies: {} }
  }
}

export function saveScores(data) {
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(data)) } catch {}
}

export function getLikes() {
  try {
    const raw = localStorage.getItem(LIKES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function recordLike(slug) {
  try {
    const likes = getLikes()
    likes[slug] = (likes[slug] || 0) + 1
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
    window.dispatchEvent(new CustomEvent('reelLike', { detail: { slug } }))
  } catch {}
}

// ── Score helpers ─────────────────────────────────────────────────────────────

export function getScore(slug, scoreData) {
  return scoreData?.companies?.[slug]?.score ?? DEFAULT_SCORE
}

function ensureCompany(slug, data) {
  if (!data.companies[slug]) {
    data.companies[slug] = {
      score: DEFAULT_SCORE,
      likeCount: 0,
      mostCount: 0,
      littleCount: 0,
      seenCount: 0,
    }
  }
}

export function recordWatchtime(slug, pct, scoreData) {
  const updated = { ...scoreData, companies: { ...scoreData.companies } }
  ensureCompany(slug, updated)
  const c = { ...updated.companies[slug] }

  c.seenCount += 1

  let trigger = null

  if (pct < LITTLE_THRESHOLD) {
    c.littleCount += 1
    if (c.littleCount >= 2) {
      c.score = Math.max(0.5, c.score - 0.2)
      trigger = 'little'
    }
  } else if (pct >= MOST_THRESHOLD) {
    c.mostCount += 1
    c.score = Math.min(3.0, c.score + 0.25)
    trigger = 'most'
  }

  updated.companies[slug] = c
  return { updated, trigger }
}

// ── Feed building ─────────────────────────────────────────────────────────────

export function buildFeed(baseFeed, scoreData) {
  // Group by slug
  const groups = {}
  for (const item of baseFeed) {
    const slug = item.project.slug
    if (!groups[slug]) groups[slug] = []
    groups[slug].push(item)
  }

  // Sort slugs by score descending
  const sortedSlugs = Object.keys(groups).sort(
    (a, b) => getScore(b, scoreData) - getScore(a, scoreData)
  )

  // Round-robin: take 2 from each company before switching
  const BATCH = 2
  const result = []
  let remaining = sortedSlugs.map(slug => [...groups[slug]])
  while (remaining.some(g => g.length > 0)) {
    for (const group of remaining) {
      for (let j = 0; j < BATCH && group.length > 0; j++) {
        result.push(group.shift())
      }
    }
    remaining = remaining.filter(g => g.length > 0)
  }

  // Repeat 3× for infinite feel
  return [...result, ...result, ...result]
}

// ── Feed mutation helpers ─────────────────────────────────────────────────────

export function injectMore(slug, feed, afterIndex) {
  const toMove = []
  const remaining = []
  const seenSrcs = new Set([feed[afterIndex].videoSrc])

  for (let i = 0; i < feed.length; i++) {
    if (i <= afterIndex) continue
    if (feed[i].project.slug === slug && !seenSrcs.has(feed[i].videoSrc) && toMove.length < 3) {
      toMove.push(feed[i])
      seenSrcs.add(feed[i].videoSrc)
    } else {
      remaining.push(feed[i])
    }
  }

  if (toMove.length === 0) return { newFeed: feed, count: 0 }

  const newFeed = [
    ...feed.slice(0, afterIndex + 1),
    ...toMove,
    ...remaining,
  ]

  return { newFeed, count: toMove.length }
}

export function deprioritize(slug, feed, afterIndex) {
  const before = feed.slice(0, afterIndex + 1)
  const after  = feed.slice(afterIndex + 1)

  const keep = after.filter(item => item.project.slug !== slug)
  const moved = after.filter(item => item.project.slug === slug)

  return [...before, ...keep, ...moved]
}

// ── Server-side like counter ──────────────────────────────────────────────────

const LIKES_API = '/api/likes.php'

export async function fetchServerLikes() {
  try {
    const res = await fetch(LIKES_API, { cache: 'no-store' })
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

export async function postServerLike(slug) {
  try {
    const res = await fetch(LIKES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ── Debug ─────────────────────────────────────────────────────────────────────

export function debugInfo() {
  return { scores: loadScores(), likes: getLikes() }
}
