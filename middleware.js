export default function middleware(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic realm=\"Xiembra Control Center\"" },
    });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const [user, pwd] = atob(base64Credentials).split(":");

  const validUser = process.env.BASIC_AUTH_USER;
  const validPass = process.env.BASIC_AUTH_PASSWORD;

  if (user === validUser && pwd === validPass) {
    // Continue to the original request
    return;
  }

  return new Response("Invalid Credentials", {
    status: 401,
    headers: { "WWW-Authenticate": "Basic realm=\"Xiembra Control Center\"" },
  });
}

export const config = {
  matcher: "/(.*)",
};
