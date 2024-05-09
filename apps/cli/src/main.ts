import { program } from "commander";
import { Constructor } from "type-fest";

import { ServiceContainer } from "./service-container";

export type ProgramDefinition = Constructor<{
  register: (serviceContainer: ServiceContainer) => Promise<void>;
}>;

/**
 * The entrypoint of the BW CLI app
 */
export class Main {
  private programs: ProgramDefinition[] = [];

  /**
   * Register a program for execution when {@link run} is called.
   */
  registerProgram(program: ProgramDefinition) {
    this.programs.push(program);
  }

  /**
   * Run the BW CLI app
   */
  async run() {
    const serviceContainer = new ServiceContainer();
    await serviceContainer.init();

    for (const programDefinition of this.programs) {
      const program = new programDefinition(serviceContainer);
      await program.register(serviceContainer);
    }

    program.parse(process.argv);

    if (process.argv.slice(2).length === 0) {
      program.outputHelp();
    }
  }
}
