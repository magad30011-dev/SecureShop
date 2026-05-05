export function detectAttack(input) {
  const patterns = [
    "<script>",
    "select",
    "insert",
    "drop",
    "--",
    "' or",
    "union"
  ]

  const value = input.toLowerCase()

  for (let p of patterns) {
    if (value.includes(p)) {
      console.log("🚨 Attack detected:", input)
      return true
    }
  }

  return false
}