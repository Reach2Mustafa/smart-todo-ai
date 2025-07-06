import axiosInstance from "./axiosinstance";
const AddtaskApi = async (data) => {
  try {
        const token = localStorage.getItem("token");
    const headers = {
      authorization: `Bearer ${token}`,
    };
    const response = await axiosInstance.post(
      `/api/v1/tasks/create_task/`,
      data,{headers}
    );
    return response.data;
  } catch (error) {
    return {
      error:
        error?.response?.data?.error || "Please try again",
    };
  }
};
export default AddtaskApi;
