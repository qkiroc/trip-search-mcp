import http from 'http';
export default async function authenticate(
  request: http.IncomingMessage
): Promise<Record<string, unknown>> {
  const query = request.url?.split('?')[1];
  const params = new URLSearchParams(query);
  const token = params.get('token');
  if (!token || token !== process.env.AUTH_TOKEN) {
    throw new Response(null, {
      status: 401,
      statusText: 'Unauthorized'
    });
  }
  return {user: 'authenticatedUser'};
}
