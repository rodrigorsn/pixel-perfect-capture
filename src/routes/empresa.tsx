import { createFileRoute } from '@tanstack/react-router';
import { CompanyPage } from '@/features/pages';
export const Route = createFileRoute('/empresa')({
 head:()=>({meta:[{title:'Empresa e setores — PsicoGestão NR-1'},{name:'description',content:'Contexto da empresa e setores demonstrativos.'},{property:'og:title',content:'Empresa e setores — PsicoGestão NR-1'},{property:'og:description',content:'Contexto da empresa e setores demonstrativos.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:CompanyPage,
});
