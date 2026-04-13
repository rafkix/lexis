import { create } from "zustand"
import {
    getMyProfileAPI,
    updateProfileAPI,
    uploadAvatarAPI,
    changePasswordAPI,
} from "@/lib/api/user"

export interface User {
    id: number
    full_name: string
    username: string
    email?: string
    role: string
    profile_image: string
    bio?: string
    telegram_id?: string
}

interface UserStore {
    user: User | null
    loading: boolean

    fetchUser: () => Promise<void>
    clearUser: () => void

    updateProfile: (payload: {
        full_name?: string
        username?: string
        bio?: string
    }) => Promise<void>

    uploadAvatar: (file: File) => Promise<void>

    changePassword: (payload: {
        old_password: string
        new_password: string
    }) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    loading: false,

    // -------------------------------
    // LOAD USER
    // -------------------------------
    fetchUser: async () => {
        set({ loading: true })
        try {
        const res = await getMyProfileAPI()
        set({
            user: { ...(res.data as any), id: Number((res.data as any).id) } as User,
            loading: false,
        })
        } catch (err) {
        console.error("Profile load error:", err)
        set({ user: null, loading: false })
        }
    },

  // -------------------------------
  // CLEAR USER (logout)
  // -------------------------------
    clearUser: () => {
        set({ user: null, loading: false })
    },

  // -------------------------------
  // UPDATE PROFILE
  // -------------------------------
    updateProfile: async (payload) => {
        set({ loading: true })
        try {
        await updateProfileAPI(payload)

        const current = get().user
        if (current) {
            set({
            user: { ...current, ...payload },
            loading: false,
            })
        }
        } catch (err) {
        set({ loading: false })
        throw err
        }
    },

  // -------------------------------
  // UPLOAD AVATAR
  // -------------------------------
    uploadAvatar: async (file: File) => {
        set({ loading: true })
        try {
        const res = await uploadAvatarAPI(file)

        const current = get().user
        if (current) {
            set({
            user: {
                ...current,
                profile_image: res.data.profile_image ?? current.profile_image,
            },
            loading: false,
            })
        }
        } catch (err) {
        set({ loading: false })
        throw err
        }
    },

  // -------------------------------
  // CHANGE PASSWORD
  // -------------------------------
    changePassword: async (payload) => {
        set({ loading: true })
        try {
        await changePasswordAPI(payload)
        set({ loading: false })
        } catch (err) {
        set({ loading: false })
        throw err
        }
    },
}))
