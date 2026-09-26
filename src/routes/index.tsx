import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@/features/dashboard';
export const Route = createFileRoute('/')({
 head:()=>({meta:[{title:'Dashboard — PsicoGestão NR-1'},{name:'description',content:'Panorama demonstrativo das campanhas, avaliações de riscos psicossociais e planos de ação.'},{property:'og:title',content:'Dashboard — PsicoGestão NR-1'},{property:'og:description',content:'Acompanhe campanhas, riscos e ações em um protótipo demonstrativo.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component: Dashboard,
});
