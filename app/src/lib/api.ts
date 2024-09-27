import { AppRouter } from "@api/trpc";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { cache } from "react";

export const api = cache(() =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000",
      }),
    ],
  })
);
