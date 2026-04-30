import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// نوع context (لو ما عندك، خلّه بسيط)
type RouterContext = {
  user: any;
};

export const router = createRouter({
  routeTree,
  context: {
    user: null,
  } as RouterContext,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

// دعم TypeScript
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}