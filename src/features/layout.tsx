import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Building2, ClipboardList, ChartNoAxesCombined, ShieldAlert, ListChecks, FileText, BookOpen, ArrowLeft } from 'lucide-react';
import { StoreProvider } from '@/state/store';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/empresa', label: 'Empresa e setores', icon: Building2 },
  { to: '/campanhas', label: 'Campanhas', icon: ClipboardList },
  { to: '/resultados', label: 'Resultados', icon: ChartNoAxesCombined },
  { to: '/riscos', label: 'Inventário de riscos', icon: ShieldAlert },
  { to: '/acoes', label: 'Planos de ação', icon: ListChecks },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/metodologia', label: 'Metodologia e configurações', icon: BookOpen },
] as const;

export function AppFrame({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  if (path.startsWith('/responder/')) return <StoreProvider>{children}</StoreProvider>;
  const active = links.find(l => l.to === path);
  return <StoreProvider><div className="app-frame">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-mark">P<span>+</span></span><span>PsicoGestão <small>NR-1</small></span></Link>
      <div className="workspace-label">ESPAÇO DE TRABALHO</div>
      <nav aria-label="Navegação principal" className="side-nav">{links.map(({to,label,icon:Icon}) => <Link key={to} to={to} className={`nav-item ${path===to?'selected':''}`}><Icon size={18}/><span>{label}</span></Link>)}</nav>
      <div className="sidebar-bottom"><div className="demo-dot"/><span>Ambiente demonstrativo<br/><small>Utilize somente dados fictícios.</small></span></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="mobile-brand">PsicoGestão <b>NR-1</b></div><span className="breadcrumb">Visão geral <span>/</span> {active?.label ?? 'PsicoGestão'}</span><span className="topbar-right">AMBIENTE DEMONSTRATIVO <span className="avatar">PG</span></span></header><main className="content">{children}</main></div>
  </div></StoreProvider>;
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title:string; description?:string; action?:ReactNode }) {
  return <div className="page-heading"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>{action&&<div className="heading-action">{action}</div>}</div>;
}
export function Notice({children}: {children:ReactNode}) { return <div className="notice">{children}</div> }
export function BackLink({to='/' as typeof links[number]['to'], label='Voltar'}:{to?:typeof links[number]['to'];label?:string}) { return <Button asChild variant="ghost"><Link to={to}><ArrowLeft size={16}/>{label}</Link></Button> }
