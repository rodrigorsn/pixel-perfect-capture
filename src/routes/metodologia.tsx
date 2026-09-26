import { createFileRoute } from '@tanstack/react-router';
import { MethodologyPage } from '@/features/pages';
export const Route = createFileRoute('/metodologia')({
 head:()=>({meta:[{title:'Metodologia e fontes — PsicoGestão NR-1'},{name:'description',content:'Instrumentos, fontes e regras demonstrativas.'},{property:'og:title',content:'Metodologia e fontes — PsicoGestão NR-1'},{property:'og:description',content:'Instrumentos, fontes e regras demonstrativas.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:MethodologyPage,
});
