import { createFileRoute } from '@tanstack/react-router';
import { RisksPage } from '@/features/pages';
export const Route = createFileRoute('/riscos')({
 head:()=>({meta:[{title:'Inventário de riscos — PsicoGestão NR-1'},{name:'description',content:'Avaliação ocupacional separada dos resultados do questionário.'},{property:'og:title',content:'Inventário de riscos — PsicoGestão NR-1'},{property:'og:description',content:'Avaliação ocupacional separada dos resultados do questionário.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:RisksPage,
});
