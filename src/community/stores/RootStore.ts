import Player from "../../common/player"
import { SoundFontSynth } from "../../main/services/SoundFontSynth"
import { AuthStore } from "../../main/stores/AuthStore"
import { CloudFileStore } from "../../main/stores/CloudFileStore"
import { DialogStore } from "../../main/stores/DialogStore"
import { PromptStore } from "../../main/stores/PromptStore"
import { SongStore } from "./SongStore"

export default class RootStore {
  readonly songStore = new SongStore()
  readonly authStore = new AuthStore()
  readonly dialogStore = new DialogStore()
  readonly promptStore = new PromptStore()
  readonly cloudFileStore = new CloudFileStore()
  readonly player: Player
  readonly synth: SoundFontSynth

  constructor() {
    const context = new (window.AudioContext || window.webkitAudioContext)()

    this.synth = new SoundFontSynth(
      context,
      "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2"
    )

    const dummySynth = {
      activate() {},
      sendEvent() {},
    }

    const dummyTrackMute = {
      shouldPlayTrack: () => true,
    }

    this.player = new Player(
      this.synth,
      dummySynth,
      dummyTrackMute,
      this.songStore
    )
  }
}
