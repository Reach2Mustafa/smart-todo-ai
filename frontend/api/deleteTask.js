import axiosInstance from "./axiosinstance";

const deleteTask = async (taskId) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.delete(
      `/api/v1/tasks/delete/${taskId}/`,
      { headers }
    );

    return response.data;
  } catch (error) {
    return {
      error: error?.response?.data?.error || "Failed to delete task.",
    };
  }
};

export default deleteTask;