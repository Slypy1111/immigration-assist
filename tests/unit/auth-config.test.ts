import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getAuthMode,
  isClerkConfigured,
  isDevAuthMode,
  isClerkKeyInvalid,
} from "@/lib/auth/config";

describe("auth config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns dev when AUTH_MODE=dev", () => {
    process.env.AUTH_MODE = "dev";
    expect(getAuthMode()).toBe("dev");
    expect(isDevAuthMode()).toBe(true);
    expect(isClerkConfigured()).toBe(false);
  });

  it("returns clerk when AUTH_MODE=clerk and valid key", () => {
    process.env.AUTH_MODE = "clerk";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_validkey123";
    expect(getAuthMode()).toBe("clerk");
    expect(isClerkConfigured()).toBe(true);
  });

  it("falls back to dev for placeholder keys", () => {
    delete process.env.AUTH_MODE;
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_placeholder";
    expect(getAuthMode()).toBe("dev");
  });

  it("detects invalid clerk keys", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "invalid";
    expect(isClerkKeyInvalid()).toBe(true);
  });

  it("accepts valid pk_test_ keys", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_abc123";
    expect(isClerkKeyInvalid()).toBe(false);
  });
});
