'use client'

import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { mentionRegex } from '@/const/mentionRegex'
import { tagRegex } from '@/const/tagRegex'
import { urlRegex } from '@/const/urlRegex'
import Tooltip from '@/components/ui/Tooltip'
import { getUserByUsername } from '@/server-actions/user'
import { Avatar } from '@/components/common/Avatar'

type Token = {
  start: number
  end: number
  key: string
  render: () => ReactNode
}

export async function renderMessageContent(text: string): Promise<ReactNode[]> {
  const tokens: Token[] = []

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

  collect(mentionRegex, 'mention', async (match) => {
    const id = match[1]
    const user = await getUserByUsername(id)

    if (!user) {
      return <span className="post-mention">{match[0]}</span>
    }

    return (
      <Tooltip
        content={
          <div className="flex items-center gap-2 py-1">
            <Avatar username={user.username} src={user.image} />
            <div className="flex flex-col">
              <span>{user.displayUsername ? user.displayUsername : user.username}</span>
              <span className="text-xs text-muted">@{user.username}</span>
            </div>
          </div>
        }
      >
        <Link href={`/profile/${id}`} className="post-mention">
          {match[0] || 'Smazaný uživatel'}
        </Link>
      </Tooltip>
    )
  })

  collect(tagRegex, 'tag', (match) => <span className="post-tag">{match[1]}</span>)

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
      if (line) nodes.push(<Fragment key={`${keyBase}-line-${line}-${i}`}>{line}</Fragment>)
      if (i < lines.length - 1) nodes.push(<br key={`${keyBase}-br-${i}`} />)
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
