import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { usePlayer } from "../hooks/usePlayer"
import { useStores } from "../hooks/useStores"
import { SongListItem } from "./SongListItem"

export const SongList: FC = observer(() => {
  const { communitySongStore } = useStores()
  const { play } = usePlayer()

  useEffect(() => {
    ;(async () => {
      await communitySongStore.load()
    })()
  }, [])

  const { songs } = communitySongStore

  const items = songs.map((d) => ({
    song: {
      id: d.id,
      name: d.data().name,
      updatedAt: new Date(d.data().updatedAt.toDate()),
    },
    user: {
      name: d.data().userId,
      photoURL: "",
    },
    dataRef: d.data().dataRef,
  }))

  return (
    <>
      {items.map((s) => (
        <SongListItem
          song={s.song}
          user={s.user}
          onClick={() => play(s.dataRef)}
        />
      ))}
    </>
  )
})
