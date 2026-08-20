import { getFollowers } from '@/actions/user'
import { Avatar } from '@/components/common/Avatar'

export default async function FollowersPage(props: PageProps<'/profile/[username]/followers'>) {
  const { username } = await props.params
  const followers = await getFollowers(username)

  return (
    <div className="flex flex-col gap-4 p-3">
      {followers.map((follower) => (
        <div key={follower.id} className="flex items-center gap-4">
          <Avatar username={follower.username} src={follower.image} size="lg" />
          <div className="flex flex-col">
            <span className="font-bold">{follower.name || follower.username}</span>
            <span className="text-sm text-muted">@{follower.username}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
