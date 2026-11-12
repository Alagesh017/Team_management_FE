import api from "../../../core/interceptors/axiosInterceptor";

export const projectCredentialService = {
  async list(projectId) {
    const { data } = await api.get("/project-credentials", { params: { project_id: projectId } });
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/project-credentials", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/project-credentials/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/project-credentials/${id}`);
    return data;
  },
};
