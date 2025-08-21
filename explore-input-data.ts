#!/usr/bin/env bun
import { InputData, PlayerAuthInputData } from "@serenityjs/protocol";
import { InputDataLogger, logInputData } from "./src/utils/input-data-logger.js";

/**
 * Simple script to explore all InputData flags and their usage
 * Run with: bun run explore-input-data.ts
 */

console.log("🎮 InputData Explorer");
console.log("=".repeat(50));

// 1. Show all available InputData flags
console.log("\n📋 ALL AVAILABLE INPUTDATA FLAGS:");
console.log("-".repeat(40));
logInputData.allFlags();

// 2. Get flag statistics
const allFlags = InputDataLogger.getAllFlags();
console.log(`📊 STATISTICS:`);
console.log(`   Total flags available: ${allFlags.length}`);
console.log(`   Flag value range: ${Math.min(...allFlags.map(f => f.value))} - ${Math.max(...allFlags.map(f => f.value))}`);
console.log("");

// 3. Show some common flag examples
console.log("🔍 COMMON FLAG EXAMPLES:");
console.log("-".repeat(40));

// Example 1: Sneaking
console.log("Example 1 - Player Sneaking:");
const sneakingInput = new PlayerAuthInputData(0n);
sneakingInput.setFlag(InputData.Sneaking, true);
sneakingInput.setFlag(InputData.StartSneaking, true);
logInputData.active(sneakingInput, "  ");
logInputData.summary(sneakingInput, "  ");
console.log("");

// Example 2: Just sneaking (without start)
console.log("Example 2 - Player Continuing to Sneak:");
const continueSneakInput = new PlayerAuthInputData(0n);
continueSneakInput.setFlag(InputData.Sneaking, true);
logInputData.changes(sneakingInput, continueSneakInput, "  ");
console.log("");

// Example 3: Stop sneaking
console.log("Example 3 - Player Stops Sneaking:");
const stopSneakInput = new PlayerAuthInputData(0n);
if ('StopSneaking' in InputData) {
    (stopSneakInput as any).setFlag((InputData as any).StopSneaking, true);
    logInputData.active(stopSneakInput, "  ");
} else {
    console.log("  StopSneaking flag not found in this version");
}
console.log("");

// 4. Show how to search for specific flags
console.log("🔎 SEARCH FOR SPECIFIC FLAGS:");
console.log("-".repeat(40));

const searchTerms = ['sneak', 'jump', 'move', 'walk', 'run', 'sprint'];
for (const term of searchTerms) {
    const matchingFlags = allFlags.filter(flag =>
        flag.name.toLowerCase().includes(term.toLowerCase())
    );

    if (matchingFlags.length > 0) {
        console.log(`Flags containing "${term}":`);
        matchingFlags.forEach(flag => {
            console.log(`  • ${flag.name} = ${flag.value} (0x${flag.value.toString(16).toUpperCase()})`);
        });
        console.log("");
    }
}

// 5. Show flag categories (by bit patterns)
console.log("🏷️  FLAG CATEGORIES (by value ranges):");
console.log("-".repeat(40));

const categories = [
    { name: "Low values (0-15)", min: 0, max: 15 },
    { name: "Powers of 2", filter: (n: number) => n > 0 && (n & (n - 1)) === 0 },
    { name: "High values (>1000)", min: 1000, max: Infinity }
];

categories.forEach(category => {
    let flags: typeof allFlags;

    if ('filter' in category) {
        flags = allFlags.filter(f => category.filter!(f.value));
    } else {
        flags = allFlags.filter(f => f.value >= category.min && f.value <= category.max);
    }

    if (flags.length > 0) {
        console.log(`${category.name}: ${flags.length} flags`);
        flags.slice(0, 5).forEach(flag => {
            console.log(`  • ${flag.name} = ${flag.value}`);
        });
        if (flags.length > 5) {
            console.log(`  ... and ${flags.length - 5} more`);
        }
        console.log("");
    }
});

// 6. Interactive examples
console.log("🎯 QUICK USAGE EXAMPLES:");
console.log("-".repeat(40));
console.log("In your code, you can use:");
console.log("");
console.log("// Show all flags once");
console.log("logInputData.allFlags();");
console.log("");
console.log("// In packet handler:");
console.log("logInputData.active(packet.inputData);");
console.log("logInputData.summary(packet.inputData, '[PLAYER] ');");
console.log("");
console.log("// Track changes:");
console.log("logInputData.changes(previousInputData, currentInputData);");
console.log("");
console.log("// Custom analysis:");
console.log("const activeFlags = InputDataLogger.getActiveFlags(inputData);");
console.log("const flagStates = InputDataLogger.getAllFlagStates(inputData);");
console.log("");

console.log("✅ Exploration complete! Check the examples in src/examples/ for more detailed usage.");
