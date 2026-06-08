const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.error ?? `Request failed with ${response.status}`);
  }

  return body;
}

export const customersApi = {
  list(sort = "name", limit = 100) {
    const params = new URLSearchParams({ sort, limit: String(limit) });
    return request(`/api/customers?${params}`);
  },
  create(data) {
    return request("/api/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id, data) {
    return request(`/api/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete(id) {
    return request(`/api/customers/${id}`, {
      method: "DELETE",
    });
  },
};

export const productsApi = {
  list(sort = "name", limit = 100) {
    const params = new URLSearchParams({ sort, limit: String(limit) });
    return request(`/api/products?${params}`);
  },
  create(data) {
    return request("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id, data) {
    return request(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete(id) {
    return request(`/api/products/${id}`, {
      method: "DELETE",
    });
  },
};

export const ordersApi = {
  list(status = "all", limit = 200) {
    const params = new URLSearchParams({ status, limit: String(limit) });
    return request(`/api/orders?${params}`);
  },
  create(data) {
    return request("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  delete(id) {
    return request(`/api/orders/${id}`, {
      method: "DELETE",
    });
  },
};
