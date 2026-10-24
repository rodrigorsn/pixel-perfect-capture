import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { lerPlano, lerStatus, gravarStatus } from "./io";
import { formatarStatus, atualizarStatusMarkdown } from "./logic";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(dirname(__dirname));
const caminhoPlano = join(root, "docs", "maestri", "plano.json");
const caminhoStatus = join(root, "docs", "maestri", "STATUS.md");

const plano = lerPlano(caminhoPlano);
const bloco = formatarStatus(plano);
const atual = lerStatus(caminhoStatus);
const novo = atualizarStatusMarkdown(atual, bloco);
gravarStatus(caminhoStatus, novo);
