import axiosInstance from "./axiosinstance";
const getDashboardData = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
    authorization: `Bearer ${token}`,
  };
    const response = await axiosInstance.get(
      `/api/v1/tasks/dashboard_data/`, {
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
export default getDashboardData;
