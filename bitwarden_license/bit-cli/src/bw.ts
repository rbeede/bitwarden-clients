import { Main } from "@bitwarden/cli/main";
import { ossProgramDefinitions } from "@bitwarden/cli/oss-program-definitions";

const programDefinitions = [
  ...ossProgramDefinitions,
  // Register BL programs here
];

const main = new Main();
programDefinitions.forEach((p) => main.registerProgram(p));
// Node does not support top-level await statements until ES2022, esnext, etc which we don't use yet
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main.run();
