import { setupWorker } from 'msw/browser';
import { hybridHandlers } from './handlers/hybrid.mock';
export const client = setupWorker(...hybridHandlers);
