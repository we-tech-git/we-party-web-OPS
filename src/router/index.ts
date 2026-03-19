/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { AuthService } from "@/services/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirect da rota raiz para a landing page
    {
      path: "",
      redirect: "/public/admin/home",
    },
    {
      path: "/",
      redirect: "/public/admin/home",
    },
    ...setupLayouts(routes),
  ],
});

// Guard de autenticação
router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const isAdminRoute = to.path.includes("/admin/");
  const isLoginRoute = to.path.includes("/login");

  // Se está tentando acessar rota admin sem autenticação, redireciona para login
  if (isAdminRoute && !isAuthenticated) {
    console.warn("⚠️ Acesso negado: autenticação necessária para rotas admin");
    next("/public/login");
    return;
  }

  // Se já está autenticado e tenta acessar login, redireciona para admin
  if (isLoginRoute && isAuthenticated) {
    next("/public/admin/home");
    return;
  }

  next();
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (localStorage.getItem("vuetify:dynamic-reload")) {
      console.error("Dynamic import error, reloading page did not fix it", err);
    } else {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;
