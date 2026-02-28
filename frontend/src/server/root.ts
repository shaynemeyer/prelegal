import { router } from "@/server/trpc";
import { ndaRouter } from "@/server/routers/nda";

export const appRouter = router({
  nda: ndaRouter,
});

export type AppRouter = typeof appRouter;
