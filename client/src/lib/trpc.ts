import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from "../../../server/routers";

// Conditionally import mockTrpc
const isMockApi = import.meta.env.VITE_MOCK_API === 'true';
let trpcClient;

if (isMockApi) {
  const { trpc: mockTrpc } = await import('./mockTrpc');
  trpcClient = mockTrpc;
} else {
  trpcClient = createTRPCReact<AppRouter>();
}

export const trpc = trpcClient;
