import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ClipboardList, ShieldAlert, ListChecks, Users, ChevronRight, AlertCircle, CheckCircle2, Clock3 } from 'lucide-react';
import { useDb } from '@/state/store';
import { PageTitle, Notice } from './layout';
import { campaignResults } from './shared';
import { formatDate, isOverdue, RISK_STAGE_LABEL, ACTION_STATUS_LABEL } from '@/lib/format';
import { Button } from '@/components/ui/button';

export function Dashboard() {
 const db=useDb(); const campaign=db.campaigns[0]; const responseCount=db.responses.filter(r=>r.campaignId===campaign?.id).length;
 const pending=db.risks.filter(r=>r.reviewStage!=='avaliado').length; const overdue=db.actions.filter(a=>isOverdue(a.dueDate,a.status)).length;
 const verifying=db.actions.filter(a=>a.status==='implementada'||a.status==='em_verificacao_eficacia').length;
 const results=campaign?campaignResults(db,campaign):[];
 return <><PageTitle eyebrow="VISÃO GERAL" title="Panorama da avaliação" description={`Acompanhe campanhas, achados e decisões de ${db.company.name}.`} action={<Button asChild><Link to="/campanhas">Ver campanhas <ArrowUpRight/></Link></Button>}/>
 <Notice>Ambiente demonstrativo — utilize somente dados fictícios. O questionário produz achados; a avaliação ocupacional e as ações exigem decisão humana.</Notice>
 <div className="metric-grid">
  <div className="metric"><div className="metric-top"><span>Campanhas abertas</span><ClipboardList/></div><strong>{db.campaigns.filter(c=>c.status==='aberta').length}</strong><small>{db.campaigns.length} campanhas no total</small></div>
  <div className="metric"><div className="metric-top"><span>Participação agregada</span><Users/></div><strong>{responseCount}<em> / {campaign?.eligiblePopulation??0}</em></strong><small>{campaign?.eligiblePopulation?Math.round(responseCount/campaign.eligiblePopulation*100):0}% da população elegível · campanha principal</small></div>
  <div className="metric"><div className="metric-top"><span>Riscos aguardando avaliação</span><ShieldAlert/></div><strong>{pending}</strong><small>{db.risks.filter(r=>r.reviewStage==='avaliado').length} riscos avaliados</small></div>
  <div className="metric"><div className="metric-top"><span>Ações que exigem atenção</span><ListChecks/></div><strong>{overdue+verifying}</strong><small>{overdue} atrasada(s) · {verifying} em verificação</small></div>
 </div>
 <div className="two-columns"><section className="panel"><div className="panel-header"><div><span className="eyebrow">EM FOCO</span><h2>Campanha em análise</h2></div><Link to="/campanhas" className="text-link">Ver todas <ChevronRight size={16}/></Link></div>{campaign&&<><div className="campaign-feature"><div><span className="status neutral">Em análise</span><h3>{campaign.name}</h3><p>{campaign.objective}</p></div><div className="participation"><b>{Math.round(responseCount/campaign.eligiblePopulation*100)}%</b><span>participação</span></div></div><div className="progress-track"><div style={{width:`${Math.min(100,responseCount/campaign.eligiblePopulation*100)}%`}}/></div><div className="feature-foot"><span>{responseCount} respostas fictícias</span><span>{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</span></div></>}</section>
 <section className="panel"><div className="panel-header"><div><span className="eyebrow">PRÓXIMAS DECISÕES</span><h2>Pendências prioritárias</h2></div></div><div className="task-list"><Link to="/riscos"><span className="task-icon amber"><AlertCircle size={17}/></span><span><b>{pending} risco(s) aguardando análise</b><small>Registrar evidências e critérios de avaliação</small></span><ChevronRight size={16}/></Link><Link to="/acoes"><span className="task-icon red"><Clock3 size={17}/></span><span><b>{overdue} ação(ões) com prazo vencido</b><small>Atualizar andamento e responsável</small></span><ChevronRight size={16}/></Link><Link to="/acoes"><span className="task-icon teal"><CheckCircle2 size={17}/></span><span><b>{verifying} ação(ões) a verificar</b><small>Implementação não equivale à eficácia</small></span><ChevronRight size={16}/></Link></div></section></div>
 <section className="panel"><div className="panel-header"><div><span className="eyebrow">DADOS AGREGADOS</span><h2>Visão por setor</h2></div><Link to="/resultados" className="text-link">Explorar resultados <ChevronRight size={16}/></Link></div><div className="table-wrap"><table><thead><tr><th>Setor</th><th>Respostas</th><th>Exibição</th><th>Dimensões calculáveis</th></tr></thead><tbody>{results.map(r=><tr key={r.scopeId}><td className="cell-strong">{r.scopeLabel}</td><td>{r.suppressed?'—':r.totalResponses}</td><td><span className={`status ${r.suppressed?'warning':'success'}`}>{r.suppressed?'Suprimido':'Disponível'}</span></td><td>{r.suppressed?'—':r.dimensions.filter(d=>d.score!==null).length+' de '+r.dimensions.length}</td></tr>)}</tbody></table></div></section>
 </>;
}
