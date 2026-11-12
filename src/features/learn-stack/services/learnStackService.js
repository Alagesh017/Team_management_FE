import api from "../../../core/interceptors/axiosInterceptor";

function throwData(error) {
  throw error?.response?.data || error;
}

export const learnStackService = {
  async getDomains(params = {}) {
    const { data } = await api.get("/learn-stack/domains", { params });
    return data;
  },
  async createDomain(payload) {
    const { data } = await api.post("/learn-stack/domains", payload);
    return data;
  },
  async updateDomain(id, payload) {
    const { data } = await api.put(`/learn-stack/domains/${id}`, payload);
    return data;
  },
  async deleteDomain(id) {
    const { data } = await api.delete(`/learn-stack/domains/${id}`);
    return data;
  },

  async getTechnologies(params = {}) {
    const { data } = await api.get("/learn-stack/technologies", { params });
    return data;
  },
  async createTechnology(payload) {
    const { data } = await api.post("/learn-stack/technologies", payload);
    return data;
  },
  async updateTechnology(id, payload) {
    const { data } = await api.put(`/learn-stack/technologies/${id}`, payload);
    return data;
  },
  async deleteTechnology(id) {
    const { data } = await api.delete(`/learn-stack/technologies/${id}`);
    return data;
  },

  async getCards(params = {}) {
    const { data } = await api.get("/learn-stack/cards", { params });
    return data;
  },
  async getCard(id) {
    const { data } = await api.get(`/learn-stack/cards/${id}`);
    return data;
  },
  async createCard(payload) {
    const { data } = await api.post("/learn-stack/cards", payload);
    return data;
  },
  async updateCard(id, payload) {
    const { data } = await api.put(`/learn-stack/cards/${id}`, payload);
    return data;
  },
  async deleteCard(id) {
    const { data } = await api.delete(`/learn-stack/cards/${id}`);
    return data;
  },
  async recordView(id) {
    const { data } = await api.post(`/learn-stack/cards/${id}/view`);
    return data;
  },
  async toggleLike(id) {
    const { data } = await api.post(`/learn-stack/cards/${id}/like`);
    return data;
  },
  async getComments(id) {
    const { data } = await api.get(`/learn-stack/cards/${id}/comments`);
    return data;
  },
  async addComment(id, body) {
    const { data } = await api.post(`/learn-stack/cards/${id}/comments`, { body });
    return data;
  },
  async deleteComment(cardId, commentId) {
    const { data } = await api.delete(`/learn-stack/cards/${cardId}/comments/${commentId}`);
    return data;
  },

  async uploadFile(file, kind = "document") {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    try {
      const { data } = await api.post("/learn-stack/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      throwData(error);
    }
  },
};
