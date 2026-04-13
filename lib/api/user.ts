import api from "./axios"; // Sizning axios instance
import { User, UserProfile, UserContact, UserSession } from "../types/user";

export const userService = {
    // Profilni olish
    getMe: () => api.get<User>("/users/me/"),

    // Profilni yangilash
    updateProfile: (data: Partial<UserProfile>) => 
        api.put<User>("/users/me/profile", data),

    // Avatarni yuklash
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post<{ avatar_url: string }>("/users/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // Kontaktlar bilan ishlash
    getContacts: () => api.get<UserContact[]>("/users/me/contacts"),
    
    addContact: (contact_type: string, value: string) => 
        api.post<string>("/users/me/contacts", { contact_type, value }),

    setPrimaryContact: (id: number) => 
        api.patch<string>(`/users/me/contacts/${id}/primary`),

    deleteContact: (id: number) => 
        api.delete(`/users/me/contacts/${id}`),

    // Sessiyalar bilan ishlash
    getSessions: () => api.get<UserSession[]>("/users/me/sessions"),
    
    revokeSession: (sessionId: string) => 
        api.delete<string>(`/users/me/sessions/${sessionId}`)
};