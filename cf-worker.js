export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // GET all users
    if (path === '/api/users' && request.method === 'GET') {
      const data = await env.USERS_KV.get('all_users', 'json') || {};
      return Response.json(data);
    }

    // POST (save) a single user
    if (path.startsWith('/api/users/') && request.method === 'POST') {
      const username = decodeURIComponent(path.replace('/api/users/', ''));
      const userData = await request.json();
      const all = await env.USERS_KV.get('all_users', 'json') || {};
      all[username] = userData;
      await env.USERS_KV.put('all_users', JSON.stringify(all));
      return Response.json({ ok: true });
    }

    // DELETE a user
    if (path.startsWith('/api/users/') && request.method === 'DELETE') {
      const username = decodeURIComponent(path.replace('/api/users/', ''));
      const all = await env.USERS_KV.get('all_users', 'json') || {};
      delete all[username];
      await env.USERS_KV.put('all_users', JSON.stringify(all));
      return Response.json({ ok: true });
    }

    // Serve main app at root
    if (path === '/' || path === '') {
      const html = await env.ASSETS.fetch(new Request(url.origin + '/alufei_kayitz.html'));
      return html;
    }

    // All other static assets
    return env.ASSETS.fetch(request);
  }
};
