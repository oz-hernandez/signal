import { max, min } from "lodash"
import {
  PianoNotesClipboardData,
  isPianoNotesClipboardData,
} from "../clipboard/clipboardTypes"
import { Rect } from "../entities/geometry/Rect"
import { Selection } from "../entities/selection/Selection"
import { isNotUndefined } from "../helpers/array"
import { tickToMillisec } from "../helpers/bpm"
import { useStores } from "../hooks/useStores"
import clipboard from "../services/Clipboard"
import RootStore from "../stores/RootStore"
import { NoteEvent, TrackEvent, isNoteEvent } from "../track"
import { startNote, stopNote } from "./player"
import { transposeNotes } from "./song"

export function eventsInSelection(events: TrackEvent[], selection: Selection) {
  const selectionRect = {
    x: selection.fromTick,
    width: selection.toTick - selection.fromTick,
    y: selection.toNoteNumber,
    height: selection.fromNoteNumber - selection.toNoteNumber,
  }
  return events.filter(isNoteEvent).filter((b) =>
    Rect.intersects(
      {
        x: b.tick,
        width: b.duration,
        y: b.noteNumber - 1, // Subtract 1 since the pitch is the lower end of the rectangle
        height: 1,
      },
      selectionRect,
    ),
  )
}

export const transposeSelection =
  (rootStore: RootStore) => (deltaPitch: number) => {
    const {
      pianoRollStore,
      pianoRollStore: { selectedTrackIndex, selection, selectedNoteIds },
      pushHistory,
    } = rootStore

    pushHistory()

    if (selection !== null) {
      const s = Selection.moved(selection, 0, deltaPitch)
      pianoRollStore.selection = s
    }

    transposeNotes(rootStore)(deltaPitch, {
      [selectedTrackIndex]: selectedNoteIds,
    })
  }

export const resetSelection =
  ({ pianoRollStore }: RootStore) =>
  () => {
    pianoRollStore.selection = null
    pianoRollStore.selectedNoteIds = []
  }

export const cloneSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
  }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selection === null) {
      return
    }

    // 選択範囲内のノートをコピーした選択範囲を作成
    // Create a selection that copies notes within selection
    const notes = selectedNoteIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)
      .map((note) => ({
        ...note, // copy
      }))
    selectedTrack.addEvents(notes)
    pianoRollStore.selectedNoteIds = notes.map((e) => e.id)
  }

export const copySelection =
  ({
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
  }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selectedNoteIds.length === 0) {
      return
    }

    const selectedNotes = selectedNoteIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)
      .filter(isNoteEvent)

    const startTick =
      selection?.fromTick ?? min(selectedNotes.map((note) => note.tick))!

    // 選択されたノートをコピー
    // Copy selected note
    const notes = selectedNotes.map((note) => ({
      ...note,
      tick: note.tick - startTick, // 選択範囲からの相対位置にする
    }))

    const data: PianoNotesClipboardData = {
      type: "piano_notes",
      notes,
    }

    clipboard.writeText(JSON.stringify(data))
  }

export const deleteSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
    pushHistory,
  }: RootStore) =>
  () => {
    if (
      selectedTrack === undefined ||
      (selectedNoteIds.length === 0 && selection === null)
    ) {
      return
    }

    pushHistory()

    // 選択範囲と選択されたノートを削除
    // Remove selected notes and selected notes
    selectedTrack.removeEvents(selectedNoteIds)
    pianoRollStore.selection = null
    pianoRollStore.selectedNoteIds = []
  }

export const pasteSelection =
  ({ player, pianoRollStore: { selectedTrack }, pushHistory }: RootStore) =>
  () => {
    if (selectedTrack === undefined) {
      return
    }
    // Paste notes copied to the current position
    const text = clipboard.readText()
    if (!text || text.length === 0) {
      return
    }
    const obj = JSON.parse(text)
    if (!isPianoNotesClipboardData(obj)) {
      return
    }

    pushHistory()

    const notes = obj.notes.map((note) => ({
      ...note,
      tick: Math.max(0, note.tick + player.position),
    }))
    selectedTrack.addEvents(notes)
  }

export const duplicateSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
    pushHistory,
  }: RootStore) =>
  () => {
    if (
      selectedTrack === undefined ||
      selection === null ||
      selectedNoteIds.length === 0
    ) {
      return
    }

    pushHistory()

    // move to the end of selection
    let deltaTick = selection.toTick - selection.fromTick

    const selectedNotes = selectedNoteIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)
      .filter(isNoteEvent)

    if (deltaTick === 0) {
      const left = min(selectedNotes.map((n) => n.tick)) ?? 0
      const right = max(selectedNotes.map((n) => n.tick + n.duration)) ?? 0
      deltaTick = right - left
    }

    const notes = selectedNotes.map((note) => ({
      ...note,
      tick: note.tick + deltaTick,
    }))

    // select the created notes
    const addedNotes = selectedTrack.addEvents(notes)
    pianoRollStore.selection = Selection.moved(selection, deltaTick, 0)
    pianoRollStore.selectedNoteIds = addedNotes.map((n) => n.id)
  }

export const useSelectNote = () => {
  const {
    pianoRollStore,
    pianoRollStore: { selectedTrack },
    controlStore,
  } = useStores()

  return (noteId: number) => {
    if (selectedTrack === undefined) {
      return
    }
    controlStore.selectedEventIds = []
    pianoRollStore.selectedNoteIds = [noteId]
  }
}

const sortedNotes = (notes: NoteEvent[]): NoteEvent[] =>
  notes.filter(isNoteEvent).sort((a, b) => {
    if (a.tick < b.tick) return -1
    if (a.tick > b.tick) return 1
    if (a.noteNumber < b.noteNumber) return -1
    if (a.noteNumber > b.noteNumber) return 1
    return 0
  })

const useSelectNeighborNote = () => {
  const rootStore = useStores()
  const {
    pianoRollStore: { selectedTrack, selectedNoteIds },
    song,
  } = rootStore
  const selectNote = useSelectNote()

  return (deltaIndex: number) => {
    if (selectedTrack === undefined || selectedNoteIds.length === 0) {
      return
    }

    const allNotes = selectedTrack.events.filter(isNoteEvent)
    const selectedNotes = sortedNotes(
      selectedNoteIds
        .map((id) => allNotes.find((n) => n.id === id))
        .filter(isNotUndefined),
    )
    if (selectedNotes.length === 0) {
      return
    }
    const channel = selectedTrack?.channel ?? 0
    const firstNote = sortedNotes(selectedNotes)[0]
    const notes = sortedNotes(allNotes)
    const currentIndex = notes.findIndex((n) => n.id === firstNote.id)
    const currentNote = notes[currentIndex]
    const nextNote = notes[currentIndex + deltaIndex]
    if (nextNote === undefined) {
      return
    }

    selectNote(nextNote.id)

    // Stop playing the current note, then play the new note.
    stopNote(rootStore)({ ...currentNote, channel })
    startNote(rootStore)({ ...nextNote, channel })
    stopNote(rootStore)(
      { ...nextNote, channel },
      tickToMillisec(nextNote.duration, 120, song.timebase) / 1000,
    )
  }
}

export const useSelectNextNote = () => {
  const selectNeighborNote = useSelectNeighborNote()
  return () => selectNeighborNote(1)
}

export const useSelectPreviousNote = () => {
  const selectNeighborNote = useSelectNeighborNote()
  return () => selectNeighborNote(-1)
}

export const quantizeSelectedNotes =
  ({
    pianoRollStore: {
      selectedTrack,
      selectedNoteIds,
      enabledQuantizer: quantizer,
    },
    pushHistory,
  }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selectedNoteIds.length === 0) {
      return
    }

    pushHistory()

    const notes = selectedNoteIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)
      .filter(isNoteEvent)
      .map((e) => ({
        ...e,
        tick: quantizer.round(e.tick),
      }))

    selectedTrack.updateEvents(notes)
  }

export const selectAllNotes =
  ({ pianoRollStore, pianoRollStore: { selectedTrack } }: RootStore) =>
  () => {
    if (selectedTrack) {
      pianoRollStore.selectedNoteIds = selectedTrack.events
        .filter(isNoteEvent)
        .map((note) => note.id)
    }
  }
