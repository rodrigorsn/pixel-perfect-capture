import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/features/pages';
export const Route = createFileRoute('/relatorios')({
 head:()=>({meta:[{title:'Relatórios — PsicoGestão NR-1'},{name:'description',content:'Relatório demonstrativo para subsidiar o GRO/PGR.'},{property:'og:title',content:'Relatórios — PsicoGestão NR-1'},{property:'og:description',content:'Relatório demonstrativo para subsidiar o GRO/PGR.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:ReportsPage,
});
