const API_BASE_URL = "http://127.0.0.1:8000";

async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {};

  const options = {
    method: method,
    headers: headers,
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);

  }

  const token = localStorage.getItem("token");
  if (token) { //if the user is connected
    headers["Authorization"] = `Bearer ${token}`;
  }


  const response = await fetch(API_BASE_URL + endpoint, options);

  if (response.status === 204) { //empty answer
    return null;
  }

  const data = await response.json();

  if (!response.ok) { //error code
    if (response.status === 401 && endpoint !== "/auth/login") { //401 : expired token OR incorrect password
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "login.html";
      return;
    }

    throw new Error(data.detail || "Server Error");
  }

  return data;


}