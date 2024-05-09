import { Main } from "./main";
import { ossProgramDefinitions } from "./oss-program-definitions";

const main = new Main();
ossProgramDefinitions.forEach((p) => main.registerProgram(p));
// Node does not support top-level await statements until ES2022, esnext, etc which we don't use yet
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main.run();
