import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { lerPlano } from "./io";
import { formatarPainel } from "./logic";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(dirname(__dirname));
const caminhoPlano = join(root, "docs", "maestri", "plano.json");

const plano = lerPlano(caminhoPlano);
process.stdout.write(formatarPainel(plano));
