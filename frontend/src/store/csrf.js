import Cookies from 'js-cookie';

export async function csrfFetch(url, options = {}) {
  // Set defaults
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.credentials = 'include'; // Crucial for cookies

  // For non-GET requests, add CSRF token and content type
  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] =
      options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }

  const res = await window.fetch(url, options);

  // Handle CSRF token refresh
  if (res.headers.get('XSRF-Token')) {
    Cookies.set('XSRF-TOKEN', res.headers.get('XSRF-Token'));
  }

  if (res.status >= 400) throw res;
  return res;
}

export async function restoreCSRF() {
  const response = await csrfFetch('/api/csrf/restore');
  const token = response.headers.get('XSRF-Token') || 
                (await response.json())['XSRF-Token'];
  if (token) Cookies.set('XSRF-TOKEN', token);
  return response;
}