import { isAuthorized, verifyAuth } from "@/router/middleware";
import { useAppStore } from "@/stores/appStore";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("@/views/Home.vue") },
    { path: "/login", component: () => import("@/views/Login.vue") },
    {
      path: "/dashboard",
      component: () => import("@/views/Dashboard.vue"),
      beforeEnter: async (to, from, next) => {
        const appStore = useAppStore();
        const result = await verifyAuth();
        if (result.userData) {
          appStore.userData = result.userData;
          if (await isAuthorized(result.userData)) next();
          else next({ name: "login" });
        }
      },
    },
    {
      path: "/admin",
      component: () => import("@/views/Admin.vue"),
      beforeEnter: async (to, from, next) => {
        const appStore = useAppStore();
        const result = await verifyAuth();
        if (result && result.userData.role === "admin") {
          appStore.userData = result.userData;
          next();
        } else next({ name: "not-found" });
      },
      children: [
        { path: "", component: () => import("@/views/admin/AdminGrid.vue") },
        {
          path: "presets",
          component: () => import("@/views/admin/Presets.vue"),
        },
        {
          path: "sessions",
          component: () => import("@/views/admin/Sessions.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

export default router;
