import type { ArquivosPainel } from "./io.ts";
import type { Estado } from "./modelo.ts";
import {
  analisarEventos,
  analisarPlano,
  mudarTarefa,
  serializarPlano,
  type SolicitacaoMudanca,
} from "./plano.ts";
import { atualizarBlocoStatus, renderizarQuadroMarkdown, renderizarTarefa } from "./quadro.ts";

export type ResultadoExecucao =
  { ok: true; de: Estado; para: Estado } | { ok: false; erro: string };

export type ResultadoConsulta = { ok: true; texto: string } | { ok: false; erro: string };

export type ResultadoStatus = { ok: true; alterado: boolean } | { ok: false; erro: string };

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}

export async function executarMudanca(
  arquivos: ArquivosPainel,
  solicitacao: SolicitacaoMudanca,
  agora: Date,
): Promise<ResultadoExecucao> {
  try {
    const textoPlano = await arquivos.lerPlano();
    if (textoPlano === null) {
      return { ok: false, erro: "docs/maestri/plano.json não encontrado." };
    }

    const plano = analisarPlano(textoPlano);
    const eventos = analisarEventos((await arquivos.lerEventos()) ?? "");
    const resultado = mudarTarefa(plano, eventos, solicitacao, agora);

    if (!resultado.ok) return { ok: false, erro: resultado.erro };

    await arquivos.gravarPlano(serializarPlano(resultado.plano));
    await arquivos.acrescentarEvento(resultado.evento);
    return { ok: true, de: resultado.de, para: resultado.evento.para };
  } catch (erro) {
    return { ok: false, erro: mensagemDeErro(erro) };
  }
}

export async function consultarTarefa(
  arquivos: ArquivosPainel,
  id: string,
): Promise<ResultadoConsulta> {
  try {
    const textoPlano = await arquivos.lerPlano();
    if (textoPlano === null) {
      return { ok: false, erro: "docs/maestri/plano.json não encontrado." };
    }

    const plano = analisarPlano(textoPlano);
    const eventos = analisarEventos((await arquivos.lerEventos()) ?? "");
    return { ok: true, texto: renderizarTarefa(plano, eventos, id) };
  } catch (erro) {
    return { ok: false, erro: mensagemDeErro(erro) };
  }
}

export async function executarStatus(arquivos: ArquivosPainel): Promise<ResultadoStatus> {
  try {
    const textoPlano = await arquivos.lerPlano();
    if (textoPlano === null) {
      return { ok: false, erro: "docs/maestri/plano.json não encontrado." };
    }

    const plano = analisarPlano(textoPlano);
    const atual = (await arquivos.lerStatus()) ?? "";
    const novo = atualizarBlocoStatus(atual, renderizarQuadroMarkdown(plano));

    if (novo === atual) return { ok: true, alterado: false };

    await arquivos.gravarStatus(novo);
    return { ok: true, alterado: true };
  } catch (erro) {
    return { ok: false, erro: mensagemDeErro(erro) };
  }
}
