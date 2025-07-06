import axiosInstance from "./axiosinstance";
const getUserTasks = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
    authorization: `Bearer ${token}`,
  };
    const response = await axiosInstance.get(
      `/api/v1/tasks/get_user_tasks/`, {
      headers,
    }
     
    );
    return response.data;
  } catch (error) {
   return {
      error:
        error?.response?.data?.error || "Please try again",
    };
  }
};
export default getUserTasks;
