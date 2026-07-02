import api from "../../../core/interceptors/axiosInterceptor";

export const taskAttachmentService = {
  // Upload an attachment
  createAttachment: async (taskId, file, remark) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("task_id", taskId);
    if (remark) formData.append("remark", remark);

    const response = await api.post("/task_attachments/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all attachments
  getAllAttachments: async () => {
    const response = await api.get("/task_attachments/");
    return response.data;
  },

  // Get attachments by task id
  getAttachmentsByTaskId: async (taskId) => {
    const response = await api.get(`/task_attachments/task/${taskId}`);
    return response.data;
  },

  // Get attachment by id
  getAttachmentById: async (attachmentId) => {
    const response = await api.get(`/task_attachments/${attachmentId}`);
    return response.data;
  },

  // Download a file
  downloadFile: async (filename) => {
    const response = await api.get(`/task_attachments/download/${filename}`, {
      responseType: "blob",
    });
    return response;
  },

  // Update an attachment
  updateAttachment: async (attachmentId, data) => {
    const response = await api.put(`/task_attachments/${attachmentId}`, data);
    return response.data;
  },

  // Delete an attachment
  deleteAttachment: async (attachmentId) => {
    const response = await api.delete(`/task_attachments/${attachmentId}`);
    return response.data;
  },
};