const MIDIController = {
  MSB_BANK: 0x00,
  MSB_MODWHEEL: 0x01,
  MSB_BREATH: 0x02,
  MSB_FOOT: 0x04,
  MSB_PORTAMENTO_TIME: 0x05,
  MSB_DATA_ENTRY: 0x06,
  MSB_MAIN_VOLUME: 0x07,
  MSB_BALANCE: 0x08,
  MSB_PAN: 0x0a,
  MSB_EXPRESSION: 0x0b,
  MSB_EFFECT1: 0x0c,
  MSB_EFFECT2: 0x0d,
  MSB_GENERAL_PURPOSE1: 0x10,
  MSB_GENERAL_PURPOSE2: 0x11,
  MSB_GENERAL_PURPOSE3: 0x12,
  MSB_GENERAL_PURPOSE4: 0x13,
  LSB_BANK: 0x20,
  LSB_MODWHEEL: 0x21,
  LSB_BREATH: 0x22,
  LSB_FOOT: 0x24,
  LSB_PORTAMENTO_TIME: 0x25,
  LSB_DATA_ENTRY: 0x26,
  LSB_MAIN_VOLUME: 0x27,
  LSB_BALANCE: 0x28,
  LSB_PAN: 0x2a,
  LSB_EXPRESSION: 0x2b,
  LSB_EFFECT1: 0x2c,
  LSB_EFFECT2: 0x2d,
  LSB_GENERAL_PURPOSE1: 0x30,
  LSB_GENERAL_PURPOSE2: 0x31,
  LSB_GENERAL_PURPOSE3: 0x32,
  LSB_GENERAL_PURPOSE4: 0x33,
  SUSTAIN: 0x40,
  PORTAMENTO: 0x41,
  SOSTENUTO: 0x42,
  SUSTENUTO: 0x42,
  SOFT_PEDAL: 0x43,
  LEGATO_FOOTSWITCH: 0x44,
  HOLD2: 0x45,
  SC1_SOUND_VARIATION: 0x46,
  SC2_TIMBRE: 0x47,
  SC3_RELEASE_TIME: 0x48,
  SC4_ATTACK_TIME: 0x49,
  SC5_BRIGHTNESS: 0x4a,
  SC6: 0x4b,
  SC7: 0x4c,
  SC8: 0x4d,
  SC9: 0x4e,
  SC10: 0x4f,
  GENERAL_PURPOSE5: 0x50,
  GENERAL_PURPOSE6: 0x51,
  GENERAL_PURPOSE7: 0x52,
  GENERAL_PURPOSE8: 0x53,
  PORTAMENTO_CONTROL: 0x54,
  E1_REVERB_DEPTH: 0x5b,
  E2_TREMOLO_DEPTH: 0x5c,
  E3_CHORUS_DEPTH: 0x5d,
  E4_DETUNE_DEPTH: 0x5e,
  E5_PHASER_DEPTH: 0x5f,
  DATA_INCREMENT: 0x60,
  DATA_DECREMENT: 0x61,
  NONREG_PARM_NUM_LSB: 0x62,
  NONREG_PARM_NUM_MSB: 0x63,
  REGIST_PARM_NUM_LSB: 0x64,
  REGIST_PARM_NUM_MSB: 0x65,
  ALL_SOUNDS_OFF: 0x78,
  RESET_CONTROLLERS: 0x79,
  LOCAL_CONTROL_SWITCH: 0x7a,
  ALL_NOTES_OFF: 0x7b,
  OMNI_OFF: 0x7c,
  OMNI_ON: 0x7d,
  MONO1: 0x7e,
  MONO2: 0x7f,
}

const MIDIMetaEventTypeName = {
  0x00: "sequenceNumber",
  0x01: "text",
  0x02: "copyrightNotice",
  0x03: "trackName",
  0x04: "instrumentName",
  0x05: "lyrics",
  0x06: "marker",
  0x07: "cuePoint",
  0x20: "midiChannelPrefix",
  0x2f: "endOfTrack",
  0x51: "setTempo",
  0x54: "smpteOffset",
  0x58: "timeSignature",
  0x59: "keySignature",
  0x7f: "sequencerSpecific"
}

const MIDIMetaEventType = {
  sequenceNumber: 0x00,
  text: 0x01,
  copyrightNotice: 0x02,
  trackName: 0x03,
  instrumentName: 0x04,
  lyrics: 0x05,
  marker: 0x06,
  cuePoint: 0x07,
  midiChannelPrefix: 0x20,
  endOfTrack: 0x2f,
  setTempo: 0x51,
  smpteOffset: 0x54,
  timeSignature: 0x58,
  keySignature: 0x59,
  sequencerSpecific: 0x7f
}

const MIDIChannelEventType = {
  "noteOff": 0x08,
  "noteOn": 0x09,
  "noteAftertouch": 0x0a,
  "controller": 0x0b,
  "programChange": 0x0c,
  "channelAftertouch": 0x0d,
  "pitchBend": 0x0e,
}