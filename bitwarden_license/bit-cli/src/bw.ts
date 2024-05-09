import { Main } from "@bitwarden/cli/bw";

// register OSS commands here

export const main = new Main();
// FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main.run();
