import { getFollowing } from '@/actions/user'
import { Avatar } from '@/components/common/Avatar'

export default async function FollowingPage(props: PageProps<'/profile/[username]/following'>) {
  const { username } = await props.params
  const following = await getFollowing(username)

  return (
    <div className="flex flex-col gap-4">
      {following.map((follow) => (
        <div key={follow.id} className="flex items-center gap-4">
          <Avatar username={follow.username} src={follow.image} size="profile" />
          <div className="flex flex-col">
            <span className="font-bold">{follow.name || follow.username}</span>
            <span className="text-sm text-muted">@{follow.username}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
