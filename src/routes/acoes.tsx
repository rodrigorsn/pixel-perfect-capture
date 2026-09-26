import { createFileRoute } from '@tanstack/react-router';
import { ActionsPage } from '@/features/pages';
export const Route = createFileRoute('/acoes')({
 head:()=>({meta:[{title:'Planos de ação — PsicoGestão NR-1'},{name:'description',content:'Sugestões simuladas, revisão e acompanhamento de ações.'},{property:'og:title',content:'Planos de ação — PsicoGestão NR-1'},{property:'og:description',content:'Sugestões simuladas, revisão e acompanhamento de ações.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:ActionsPage,
});
