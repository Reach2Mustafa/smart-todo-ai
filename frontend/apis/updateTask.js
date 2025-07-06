import axiosInstance from "./axiosinstance";

const updateTask = async (taskId, updatedData) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.put(
      `/api/v1/tasks/update/${taskId}/`,
      updatedData,
      { headers }
    );

    return response.data;
  } catch (error) {
    return {
      error: error?.response?.data?.error || "Failed to update task.",
    };
  }
};

export default updateTask;
