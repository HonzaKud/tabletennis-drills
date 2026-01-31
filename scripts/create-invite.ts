import { inviteService } from "@/server/auth/invite";

function getArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function firstPositionalArg(): string | null {
  // process.argv = [node, script, ...args]
  // return first arg that is not a flag and not a value of a known flag
  const args = process.argv.slice(2);

  const skipNextFor = new Set(["--email", "-e", "--base-url"]);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];

    if (skipNextFor.has(a)) {
      i += 1; // skip value
      continue;
    }

    if (a.startsWith("-")) continue; // other flags
    return a;
  }

  return null;
}

function printHelp() {
  console.log(`
Usage:
  npm run create-invite -- --email "user@example.com" [--base-url "https://yourapp.vercel.app"]
  npm run create-invite -- "user@example.com" [--base-url "https://yourapp.vercel.app"]

Options:
  --email, -e       Email uživatele (povinné)
  --base-url        Base URL aplikace (volitelné; default z env nebo http://localhost:3000)
  --help, -h        Zobrazit nápovědu
`.trim());
}

function requireEmail(): string {
  const email =
    getArg("--email") ??
    getArg("-e") ??
    firstPositionalArg();

  if (!email) {
    console.error(
      '❌ Chybí email. Použití: npm run create-invite -- --email "x@y.cz"'
    );
    process.exit(1);
  }
  return email;
}

function resolveBaseUrl(): string {
  const fromArg = getArg("--base-url");
  if (fromArg) return fromArg.replace(/\/+$/, "");

  const env =
    process.env.AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL;

  if (!env) return "http://localhost:3000";

  if (env.startsWith("http://") || env.startsWith("https://")) {
    return env.replace(/\/+$/, "");
  }
  return `https://${env}`.replace(/\/+$/, "");
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    printHelp();
    return;
  }

  const email = requireEmail();
  const baseUrl = resolveBaseUrl();

  const { token, expiresAt } = await inviteService.createInvite({ email });

  const url = `${baseUrl}/invite/${token}`;

  console.log("\n✅ Invite vytvořen");
  console.log("Email:", email);
  console.log("Platí do:", expiresAt.toISOString());
  console.log("\n🔗 Link:");
  console.log(url);
  console.log();
}

main().catch((err) => {
  console.error("❌ Chyba:", err);
  process.exit(1);
});
