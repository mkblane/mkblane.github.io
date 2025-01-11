// File: API.js

class API {
  constructor() {
    // Spotify Client Credentials (hardcoded for demo purposes)
    this.clientId = '1ea4678f8cdf4141a8fd6ed6f0411cff';  // Your Spotify Client ID
    this.clientSecret = 'a8fa287e25c74bd7a613b853b9d1818a'; // Your Spotify Client Secret
    this.accessToken = "";
    this.baseUrl = "https://api.spotify.com/v1"; // Default to Spotify API
  }

  // Authenticate with Spotify using Client Credentials Flow
  async authenticateSpotify() {
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const credentials = btoa(`${this.clientId}:${this.clientSecret}`);

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with Spotify.");
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log("Spotify authenticated successfully.");
    } catch (error) {
      console.error("Spotify Authentication error:", error);
    }
  }

  // Generic API GET request
  async get(endpoint, params = {}, customBaseUrl = null) {
    const url = new URL(`${customBaseUrl || this.baseUrl}${endpoint}`);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`GET request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GET request error:", error);
      return null;
    }
  }

  // General POST request
  async post(endpoint, body = {}, customBaseUrl = null) {
    const url = `${customBaseUrl || this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`POST request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("POST request error:", error);
      return null;
    }
  }

  // Fetch Spotify recommendations (based on genres, moods, etc.)
  async getRecommendations(attributes) {
    try {
      const recommendations = await this.get("/recommendations", attributes);
      return recommendations.tracks.map((track) => ({
        title: track.name,
        artist: track.artists.map((artist) => artist.name).join(", "),
        album: track.album.name,
        url: track.external_urls.spotify,
      }));
    } catch (error) {
      console.error("Error fetching Spotify recommendations:", error);
      return [];
    }
  }

  // Fetch mood-based music recommendations (e.g., 'rock', 'pop', 'classical')
  async getMoodRecommendations(mood) {
    const attributes = { seed_genres: mood, limit: 10 };  // Fetch 10 tracks based on mood
    return await this.getRecommendations(attributes);
  }

  // Advanced Website-Specific Features
  async getSiteData(endpoint, params = {}) {
    try {
      const response = await this.get(endpoint, params, "https://api.yourwebsite.com/");
      console.log("Fetched site data successfully:", response);
      return response;
    } catch (error) {
      console.error("Error fetching site data:", error);
      return null;
    }
  }
}

export default API;
