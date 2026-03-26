import { User } from "../types/index";
import Api from "./Api";

export const UserServices = {
    getAll: async (): Promise<User[]> => {
        const response = await Api.get("/users");
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await Api.get(`/users/admin/${id}`);
        return response.data;
    },

    aregistre: async (payload: Partial<User> | FormData): Promise<User> => {
        const response = await Api.post("/auth/register", payload);
        return response.data.user;
    },

    login: async (data: any): Promise<any> => {
        const response = await Api.post("/auth/login", data);
        return response.data;
    },

    logout: async (): Promise<any> => {
        const response = await Api.post("/auth/logout");
        return response.data;
    },
    
    getMe: async (): Promise<any> => {
        const response = await Api.get("/auth/me");
        return response.data;
    },

    delete: async (id: string): Promise<any> => {
        const response = await Api.delete(`/users/admin/${id}`);
        return response.data;
    },

    put: async (data: Partial<User> | FormData, id: string): Promise<User> => {
        // Si on passe un ID, c'est probablement une action admin, sinon c'est le profil
        const endpoint = id ? `/users/admin/${id}` : "/users/profile";
        const response = await Api.put(endpoint, data);
        return response.data.user || response.data;
    }
};
