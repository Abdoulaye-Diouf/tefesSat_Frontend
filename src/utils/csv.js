/** Parse RFC 4180-style CSV text, including quoted fields and escaped quotes. */
export function parseCsv(text) {
  const input = text.replace(/^\uFEFF/, '')
  const records = []
  let record = []
  let field = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      record.push(field)
      field = ''
    } else if (character === '\n' || character === '\r') {
      record.push(field)
      records.push(record)
      record = []
      field = ''
      if (character === '\r' && input[index + 1] === '\n') index += 1
    } else {
      field += character
    }
  }

  if (record.length || field) {
    record.push(field)
    records.push(record)
  }

  const headers = records.shift()?.map((header) => header.trim()) ?? []
  return records
    .filter((values) => values.some((value) => value !== ''))
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? '']),
      ),
    )
}

export function getCsvNumber(value) {
  if (value == null || String(value).trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
