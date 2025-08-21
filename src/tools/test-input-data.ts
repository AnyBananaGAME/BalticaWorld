import { InputData, PlayerAuthInputData } from "@serenityjs/protocol";
import { InputDataLogger, logInputData } from "../utils/input-data-logger.js";

/**
 * Test script to demonstrate InputData logging capabilities
 */
console.log("=== InputData Testing and Logging Demo ===\n");

// 1. First, let's see all available InputData flags
console.log("1. Logging all available InputData flags:");
logInputData.allFlags();

// 2. Create some mock input data scenarios for testing
console.log("2. Creating test scenarios...\n");

// Create a basic input data instance
const inputData1 = new PlayerAuthInputData(0n);

// Scenario 1: Player starts sneaking
console.log("Scenario 1: Player starts sneaking");
inputData1.setFlag(InputData.Sneaking, true);
inputData1.setFlag(InputData.StartSneaking, true);

// Show different logging methods
logInputData.summary(inputData1, "  ");
logInputData.active(inputData1, "  ");
console.log("");

// Scenario 2: Player is moving and jumping
console.log("Scenario 2: Player moving and jumping");
const inputData2 = new PlayerAuthInputData(0n);

// Set multiple movement flags (these are common InputData flags in Minecraft Bedrock)
// Note: The exact flag names may vary based on the SerenityJS protocol version
try {
  // Try to set common movement flags if they exist
  if ('Up' in InputData) inputData2.setFlag((InputData as any).Up, true);
  if ('Jump' in InputData) inputData2.setFlag((InputData as any).Jump, true);
  if ('MoveForward' in InputData) inputData2.setFlag((InputData as any).MoveForward, true);

  // Show the state
  logInputData.active(inputData2, "  ");

  // Show changes from previous state
  logInputData.changes(inputData1, inputData2, "  ");

} catch (error) {
  console.log("  Some flags may not be available in this version");
  console.log("  Available flags are shown above in the complete list");
}

console.log("");

// 3. Demonstrate all logging methods
console.log("3. Demonstrating all logging methods:\n");

// Create a more complex scenario
const inputData3 = new PlayerAuthInputData(0n);
inputData3.setFlag(InputData.Sneaking, true);

console.log("Method 1: Active flags only");
logInputData.active(inputData3, "  ");

console.log("Method 2: Summary");
logInputData.summary(inputData3, "  ");

console.log("Method 3: All flags with states (truncated for demo)");
// Show only first few flags to avoid spam
const allFlags = InputDataLogger.getAllFlags().slice(0, 10);
console.log("  (Showing first 10 flags only)");
allFlags.forEach(flag => {
  const active = inputData3.hasFlag(flag.value as any);
  const status = active ? '✓' : '✗';
  console.log(`  ${status} ${flag.name.padEnd(20)} = ${flag.value}`);
});

console.log("\nMethod 4: Detailed report");
const report = InputDataLogger.createReport(inputData3);
console.log(report);

// 4. Demonstrate change tracking
console.log("4. Change tracking demonstration:\n");

console.log("Initial state:");
const trackingData1 = new PlayerAuthInputData(0n);
logInputData.active(trackingData1, "  ");

console.log("After setting Sneaking:");
const trackingData2 = new PlayerAuthInputData(0n);
trackingData2.setFlag(InputData.Sneaking, true);
logInputData.changes(trackingData1, trackingData2, "  ");

console.log("After adding StartSneaking:");
const trackingData3 = new PlayerAuthInputData(0n);
trackingData3.setFlag(InputData.Sneaking, true);
trackingData3.setFlag(InputData.StartSneaking, true);
logInputData.changes(trackingData2, trackingData3, "  ");

console.log("After stopping sneak (only StartSneaking removed):");
const trackingData4 = new PlayerAuthInputData(0n);
trackingData4.setFlag(InputData.Sneaking, true);
logInputData.changes(trackingData3, trackingData4, "  ");

// 5. Show how to get raw data
console.log("5. Raw data access:\n");

console.log("All flag names:");
const flagNames = InputDataLogger.getFlagNames();
console.log(`  ${flagNames.slice(0, 10).join(', ')} ... (${flagNames.length} total)`);

console.log("\nAll flags with values:");
const allFlagsInfo = InputDataLogger.getAllFlags();
console.log(`  Found ${allFlagsInfo.length} total InputData flags`);

console.log("\nFirst 5 flags with details:");
allFlagsInfo.slice(0, 5).forEach(flag => {
  console.log(`  ${flag.name}: ${flag.value} (0x${flag.value.toString(16).toUpperCase()})`);
});

console.log("\n=== Demo Complete ===");
console.log("You can now use these logging methods in your proxy or other code!");
console.log("\nQuick usage examples:");
console.log("- logInputData.allFlags()           // Show all available flags");
console.log("- logInputData.active(inputData)    // Show only active flags");
console.log("- logInputData.summary(inputData)   // Show compact summary");
console.log("- logInputData.all(inputData)       // Show all flags with states");
console.log("- logInputData.changes(prev, curr)  // Show what changed");
