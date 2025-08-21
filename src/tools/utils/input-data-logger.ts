import { InputData, PlayerAuthInputData } from "@serenityjs/protocol";

/**
 * Utility class for logging and analyzing InputData enum flags
 */
export class InputDataLogger {
  /**
   * Get all available InputData flags as an array of key-value pairs
   */
  static getAllFlags(): Array<{ name: string; value: number }> {
    const flags: Array<{ name: string; value: number }> = [];

    // Get all enumerable properties of InputData
    for (const key in InputData) {
      if (typeof InputData[key as keyof typeof InputData] === 'number') {
        flags.push({
          name: key,
          value: InputData[key as keyof typeof InputData] as number
        });
      }
    }

    // Sort by value for consistent output
    return flags.sort((a, b) => a.value - b.value);
  }

  /**
   * Get all flag names as an array
   */
  static getFlagNames(): string[] {
    return this.getAllFlags().map(flag => flag.name);
  }

  /**
   * Check which flags are active in the given input data
   */
  static getActiveFlags(inputData: PlayerAuthInputData): Array<{ name: string; value: number }> {
    const allFlags = this.getAllFlags();
    const activeFlags: Array<{ name: string; value: number }> = [];

    for (const flag of allFlags) {
      if (inputData.hasFlag(flag.value as any)) {
        activeFlags.push(flag);
      }
    }

    return activeFlags;
  }

  /**
   * Get all flags with their current state (active/inactive)
   */
  static getAllFlagStates(inputData: PlayerAuthInputData): Array<{ name: string; value: number; active: boolean }> {
    const allFlags = this.getAllFlags();
    return allFlags.map(flag => ({
      ...flag,
      active: inputData.hasFlag(flag.value as any)
    }));
  }

  /**
   * Log all available InputData flags
   */
  static logAllFlags(): void {
    const flags = this.getAllFlags();
    console.log('=== All InputData Flags ===');
    console.log(`Total flags: ${flags.length}`);
    console.log('');

    flags.forEach((flag, index) => {
      console.log(`${index + 1}. ${flag.name} = ${flag.value} (0x${flag.value.toString(16).toUpperCase()})`);
    });
    console.log('');
  }

  /**
   * Log only active flags in the input data
   */
  static logActiveFlags(inputData: PlayerAuthInputData, prefix: string = ''): void {
    const activeFlags = this.getActiveFlags(inputData);

    if (activeFlags.length === 0) {
      console.log(`${prefix}No active flags`);
      return;
    }

    console.log(`${prefix}Active flags (${activeFlags.length}):`);
    activeFlags.forEach(flag => {
      console.log(`${prefix}  - ${flag.name} (${flag.value})`);
    });
  }

  /**
   * Log all flags with their current state
   */
  static logAllFlagStates(inputData: PlayerAuthInputData, prefix: string = ''): void {
    const flagStates = this.getAllFlagStates(inputData);
    const activeCount = flagStates.filter(f => f.active).length;

    console.log(`${prefix}=== InputData Flag States ===`);
    console.log(`${prefix}Active: ${activeCount} / ${flagStates.length}`);
    console.log('');

    flagStates.forEach(flag => {
      const status = flag.active ? '✓' : '✗';
      const statusText = flag.active ? 'ACTIVE' : 'inactive';
      console.log(`${prefix}${status} ${flag.name.padEnd(20)} = ${flag.value.toString().padStart(3)} (${statusText})`);
    });
    console.log('');
  }

  /**
   * Log a compact summary of input data
   */
  static logSummary(inputData: PlayerAuthInputData, prefix: string = ''): void {
    const activeFlags = this.getActiveFlags(inputData);
    const totalFlags = this.getAllFlags().length;

    console.log(`${prefix}InputData Summary: ${activeFlags.length}/${totalFlags} flags active`);
    if (activeFlags.length > 0) {
      const flagNames = activeFlags.map(f => f.name).join(', ');
      console.log(`${prefix}Active: ${flagNames}`);
    }
  }

  /**
   * Create a detailed report as a string
   */
  static createReport(inputData: PlayerAuthInputData): string {
    const flagStates = this.getAllFlagStates(inputData);
    const activeFlags = flagStates.filter(f => f.active);

    let report = '=== InputData Detailed Report ===\n';
    report += `Total flags: ${flagStates.length}\n`;
    report += `Active flags: ${activeFlags.length}\n\n`;

    if (activeFlags.length > 0) {
      report += 'ACTIVE FLAGS:\n';
      activeFlags.forEach(flag => {
        report += `  ✓ ${flag.name} (value: ${flag.value}, hex: 0x${flag.value.toString(16).toUpperCase()})\n`;
      });
      report += '\n';
    }

    const inactiveFlags = flagStates.filter(f => !f.active);
    if (inactiveFlags.length > 0) {
      report += 'INACTIVE FLAGS:\n';
      inactiveFlags.forEach(flag => {
        report += `  ✗ ${flag.name} (value: ${flag.value})\n`;
      });
    }

    return report;
  }

  /**
   * Watch for flag changes between two input data states
   */
  static logFlagChanges(
    previousInputData: PlayerAuthInputData | null,
    currentInputData: PlayerAuthInputData,
    prefix: string = ''
  ): void {
    if (!previousInputData) {
      console.log(`${prefix}Initial state - logging all active flags:`);
      this.logActiveFlags(currentInputData, prefix);
      return;
    }

    const previousActive = this.getActiveFlags(previousInputData).map(f => f.name);
    const currentActive = this.getActiveFlags(currentInputData).map(f => f.name);

    const newlyActive = currentActive.filter(name => !previousActive.includes(name));
    const newlyInactive = previousActive.filter(name => !currentActive.includes(name));

    if (newlyActive.length === 0 && newlyInactive.length === 0) {
      console.log(`${prefix}No flag changes detected`);
      return;
    }

    console.log(`${prefix}=== InputData Flag Changes ===`);

    if (newlyActive.length > 0) {
      console.log(`${prefix}Newly ACTIVE (${newlyActive.length}):`);
      newlyActive.forEach(name => {
        console.log(`${prefix}  + ${name}`);
      });
    }

    if (newlyInactive.length > 0) {
      console.log(`${prefix}Newly INACTIVE (${newlyInactive.length}):`);
      newlyInactive.forEach(name => {
        console.log(`${prefix}  - ${name}`);
      });
    }
    console.log('');
  }
}

/**
 * Quick utility functions for common use cases
 */
export const logInputData = {
  /**
   * Log all available InputData flags (call once to see all possible flags)
   */
  allFlags: () => InputDataLogger.logAllFlags(),

  /**
   * Log only active flags in input data
   */
  active: (inputData: PlayerAuthInputData, prefix?: string) =>
    InputDataLogger.logActiveFlags(inputData, prefix),

  /**
   * Log all flags with their states
   */
  all: (inputData: PlayerAuthInputData, prefix?: string) =>
    InputDataLogger.logAllFlagStates(inputData, prefix),

  /**
   * Log a compact summary
   */
  summary: (inputData: PlayerAuthInputData, prefix?: string) =>
    InputDataLogger.logSummary(inputData, prefix),

  /**
   * Log changes between two states
   */
  changes: (previous: PlayerAuthInputData | null, current: PlayerAuthInputData, prefix?: string) =>
    InputDataLogger.logFlagChanges(previous, current, prefix)
};

// Export the enum for convenience
export { InputData };
