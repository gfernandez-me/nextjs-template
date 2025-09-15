const fs = require("fs");

// Read the gear.txt file
const data = fs.readFileSync("/workspace/prisma/gear.txt", "utf8");
const parsed = JSON.parse(data);

console.log("Checking hero ID consistency...");

// Get sample heroes
const sampleHeroes = parsed.heroes.slice(0, 5);
console.log("\nSample heroes:");
sampleHeroes.forEach((hero) => {
  console.log(`Hero: ${hero.name}, id: ${hero.id}, type: ${typeof hero.id}`);
});

// Get sample equipped gears
const equippedGears = parsed.items.filter(
  (gear) =>
    gear.ingameEquippedId &&
    gear.ingameEquippedId !== "undefined" &&
    gear.ingameEquippedId !== undefined
);

console.log("\nSample equipped gears:");
equippedGears.slice(0, 5).forEach((gear) => {
  console.log(
    `Gear: ${gear.type}, ingameEquippedId: ${
      gear.ingameEquippedId
    }, type: ${typeof gear.ingameEquippedId}`
  );
});

// Check if gear ingameEquippedId matches hero id
const heroIds = new Set(parsed.heroes.map((h) => h.id.toString()));
const gearHeroIds = new Set(
  equippedGears.map((g) => g.ingameEquippedId.toString())
);

console.log("\nHero IDs in heroes data:", Array.from(heroIds).slice(0, 5));
console.log("Hero IDs in gear data:", Array.from(gearHeroIds).slice(0, 5));

const matchingIds = [...gearHeroIds].filter((id) => heroIds.has(id));
console.log(`Matching IDs: ${matchingIds.length} out of ${gearHeroIds.size}`);

// Check specific examples
console.log("\nChecking specific examples:");
equippedGears.slice(0, 3).forEach((gear) => {
  const hero = parsed.heroes.find(
    (h) => h.id.toString() === gear.ingameEquippedId.toString()
  );
  console.log(
    `Gear ${gear.id} (${gear.type}) -> ingameEquippedId: ${gear.ingameEquippedId}`
  );
  console.log(`  Hero found: ${hero ? hero.name : "NOT FOUND"}`);
  console.log(`  Hero ID: ${hero ? hero.id : "N/A"}`);
});
