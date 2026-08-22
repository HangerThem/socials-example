import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { mentionRegex } from '@/const/mentionRegex'
import { tagRegex } from '@/const/tagRegex'
import { urlRegex } from '@/const/urlRegex'
import { getUsersByUsernames } from '@/actions/user'
import { MentionItem } from '@/components/common/MentionItem'

type Token = {
  start: number
  end: number
  key: string
  render: () => ReactNode
}

export async function renderMessageContent(text: string): Promise<ReactNode[]> {
  const tokens: Token[] = []

  const mentionUsernames = new Set<string>()
  let mentionMatch: RegExpExecArray | null
  const mentionRegexGlobal = new RegExp(
    mentionRegex.source,
    mentionRegex.flags.includes('g') ? mentionRegex.flags : mentionRegex.flags + 'g',
  )
  while ((mentionMatch = mentionRegexGlobal.exec(text)) !== null) {
    mentionUsernames.add(mentionMatch[1])
  }

  const users = await getUsersByUsernames(Array.from(mentionUsernames))
  const userMap = new Map(users.map((u) => [u.username, u]))

  const collect = (regex: RegExp, type: string, render: (match: RegExpExecArray) => ReactNode) => {
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
    let execResult: RegExpExecArray | null
    while ((execResult = re.exec(text)) !== null) {
      const match = execResult
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        key: `${type}-${match.index}-${match[0]}`,
        render: () => render(match),
      })
      if (match[0].length === 0) re.lastIndex++
    }
  }

  collect(urlRegex, 'url', (match) => {
    const url = match[0]
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer" className="post-link">
        {url.replace(/^(https?:\/\/)?(www\.)?/, '')}
      </Link>
    )
  })

  collect(mentionRegex, 'mention', (match) => {
    const username = match[1]
    const user = userMap.get(username)

    if (!user) {
      return <span className="post-mention">{match[0]}</span>
    }

    return <MentionItem key={user.username} user={user} />
  })

  collect(tagRegex, 'tag', (match) => <span className="post-tag">#{match[1]}</span>)

  tokens.sort((a, b) => a.start - b.start)
  const resolved: Token[] = []
  let cursor = 0
  for (const token of tokens) {
    if (token.start < cursor) continue
    resolved.push(token)
    cursor = token.end
  }

  const nodes: ReactNode[] = []
  let pos = 0

  const pushText = (chunk: string, keyBase: string) => {
    const lines = chunk.split('\n')
    lines.forEach((line, i) => {
      if (line) {
        const hash = Buffer.from(line).toString('base64').substring(0, 8)
        const lineKey = `${keyBase}-${pos}-${hash}`
        nodes.push(<Fragment key={lineKey}>{line}</Fragment>)
      }
      if (i < lines.length - 1) {
        nodes.push(<br key={`${keyBase}-br-${pos + i}`} />)
      }
    })
  }

  resolved.forEach((token) => {
    if (token.start > pos) pushText(text.slice(pos, token.start), `text-${pos}`)
    nodes.push(<Fragment key={token.key}>{token.render()}</Fragment>)
    pos = token.end
  })
  if (pos < text.length) pushText(text.slice(pos), `text-${pos}`)

  return nodes
}
