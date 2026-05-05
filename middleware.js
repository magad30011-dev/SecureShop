export function middleware(req) {
  const url = req.nextUrl.toString().toLowerCase()

  const attacks = [
    "<script>",
    "select",
    "insert",
    "drop",
    "--",
    "' or",
    "union"
  ]

  for (let a of attacks) {
    if (url.includes(a)) {
      console.log("🚨 Attack detected:", url)

      return new Response("Blocked by RASP", {
        status: 403
      })
    }
  }

  return Response.next()
}

export const config = {
  matcher: "/:path*"
}