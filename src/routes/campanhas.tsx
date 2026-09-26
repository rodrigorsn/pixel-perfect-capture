import { createFileRoute } from '@tanstack/react-router';
import { CampaignsPage } from '@/features/pages';
export const Route = createFileRoute('/campanhas')({
 head:()=>({meta:[{title:'Campanhas — PsicoGestão NR-1'},{name:'description',content:'Campanhas demonstrativas e questionários.'},{property:'og:title',content:'Campanhas — PsicoGestão NR-1'},{property:'og:description',content:'Campanhas demonstrativas e questionários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:CampaignsPage,
});
