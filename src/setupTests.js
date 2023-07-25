// src/setupTests.js
import { server } from "./__mocks__/server";

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
