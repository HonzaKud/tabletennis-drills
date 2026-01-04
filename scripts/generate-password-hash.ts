/**
 * Dev helper script: generate Argon2id password hash.
 *
 * Usage:
 *   npx tsx scripts/generate-password-hash.ts "mojeSilneHeslo123"
 */

import argon2 from "argon2";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error("❌ Chybí heslo.");
    console.error('Použití: npx tsx scripts/generate-password-hash.ts "heslo"');
    process.exit(1);
  }

  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3,
    parallelism: 1,
  });

  console.log("\n✅ Argon2id hash vygenerován:\n");
  console.log(hash);
  console.log("\n👉 Vlož do .env.local jako:");
  console.log("AUTH_DEV_SEED_PASSWORD_HASH=" + hash);
}

main().catch((err) => {
  console.error("❌ Chyba při generování hashe:", err);
  process.exit(1);
});
