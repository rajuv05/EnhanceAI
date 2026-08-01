import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/login", formData, {
          headers: {
              "Content-Type": "application/x-www-form-urlencoded",
          }
      });

      return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    full_name: string;
  }) => {
    const response = await api.post("/register", data);
    return response.data;
  },

  resendVerification: async (email: string) => {
    const formData = new FormData();
    formData.append("email", email);
    const response = await api.post("/resend-verification", formData);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/verify-email?token=${token}`);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getMe: async () => {
    const response = await api.get("/me");
    return response.data;
  },
};

export const taskService = {
  uploadAndProcess: async (file: File, tool: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tool", tool);

    const response = await api.post("/enhance", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  getTasks: async () => {
    const response = await api.get("/tasks");
    return response.data;
  },

  getTask: async (id: number) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  deleteTask: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export const paymentService = {
  createOrder: async (plan: string = "pro") => {
    const formData = new FormData();
    formData.append("plan", plan);
    const response = await api.post("/payments/create-order", formData);
    return response.data;
  },
  verifyPayment: async (order_id: string, payment_id: string, signature: string) => {
    const formData = new FormData();
    formData.append("order_id", order_id);
    formData.append("payment_id", payment_id);
    formData.append("signature", signature);
    const response = await api.post("/payments/verify-payment", formData);
    return response.data;
  }
};

export const usageService = {
  getUsage: async () => {
    const response = await api.get("/usage");
    return response.data;
  },
  claimReward: async () => {
    const response = await api.post("/usage/reward");
    return response.data;
  }
}

export default api;
