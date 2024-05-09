import { program } from "commander";

import { Program } from "./program";
import { ServiceContainer } from "./service-container";
import { SendProgram } from "./tools/send/send.program";
import { VaultProgram } from "./vault.program";

export interface ProgramDefinition {
  new (serviceContainer: ServiceContainer): {
    register: () => Promise<void>;
  };
}

/**
 * The entrypoint of the BW CLI app
 */
export class Main {
  private constructor(private readonly programs: ProgramDefinition[]) {}

  static create() {
    return new Main([]);
  }

  /**
   * Register a program for execution when {@link run} is called.
   */
  with(program: ProgramDefinition) {
    return new Main([...this.programs, program]);
  }

  /**
   * Run the BW CLI app
   */
  async run() {
    const serviceContainer = new ServiceContainer();
    await serviceContainer.init();

    for (const programDefinition of this.programs) {
      const program = new programDefinition(serviceContainer);
      await program.register();
    }

    program.parse(process.argv);

    if (process.argv.slice(2).length === 0) {
      program.outputHelp();
    }
  }
}

export const ossMain = Main.create().with(Program).with(VaultProgram).with(SendProgram);
