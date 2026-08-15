#!/usr/bin/env node

import { readFile } from 'node:fs/promises'

const path = process.argv[2]
if (!path) {
  console.error('Usage: node prototype/m0/summarize-results.mjs <results.json>')
  process.exit(2)
}

const data = JSON.parse(await readFile(path, 'utf8'))
const sessions = data.sessions ?? []
const fields = [
  'targetUserConfirmed',
  'primaryActionSeconds',
  'foundPrimaryActionUnaided',
  'lesson1StateAccurate',
  'lesson2StateAccurate',
  'lesson3StateAccurate',
  'recognizedAllStateChanges',
]
const complete = sessions.length === 5 && sessions.every(session => fields.every(field => session[field] !== null))
const valid = sessions.filter(session => session.targetUserConfirmed === true)
const primary = valid.filter(session => session.foundPrimaryActionUnaided === true && session.primaryActionSeconds <= 30).length
const state = valid.filter(session => session.recognizedAllStateChanges === true).length
const consistent = valid.every(session => session.recognizedAllStateChanges === (
  session.lesson1StateAccurate === true
  && session.lesson2StateAccurate === true
  && session.lesson3StateAccurate === true
))
const gate = complete && valid.length === 5 && consistent && primary >= 4 && state >= 4 ? 'PASS' : complete ? 'FAIL' : 'PENDING'

console.log(`VALID_TARGET_USERS=${valid.length}/5`)
console.log(`PRIMARY_ACTION=${primary}/5`)
console.log(`STATE_CHANGE=${state}/5`)
console.log(`RECORDS_COMPLETE=${complete}`)
console.log(`RECORDS_CONSISTENT=${consistent}`)
console.log(`M0_GATE=${gate}`)

process.exit(gate === 'FAIL' ? 1 : 0)
