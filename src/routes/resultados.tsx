import { createFileRoute } from '@tanstack/react-router';
import { ResultsPage } from '@/features/pages';
export const Route = createFileRoute('/resultados')({
 head:()=>({meta:[{title:'Resultados agregados — PsicoGestão NR-1'},{name:'description',content:'Achados descritivos do questionário demonstrativo.'},{property:'og:title',content:'Resultados agregados — PsicoGestão NR-1'},{property:'og:description',content:'Achados descritivos do questionário demonstrativo.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:ResultsPage,
});
