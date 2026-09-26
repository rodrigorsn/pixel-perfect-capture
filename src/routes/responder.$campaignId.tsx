import { createFileRoute } from '@tanstack/react-router';
import { RespondPage } from '@/features/respond';
export const Route = createFileRoute('/responder/$campaignId')({
 head:()=>({meta:[{title:'Responder questionário — PsicoGestão NR-1'},{name:'description',content:'Questionário demonstrativo de fatores psicossociais.'},{property:'og:title',content:'Questionário demonstrativo — PsicoGestão NR-1'},{property:'og:description',content:'Responda ao questionário demonstrativo de fatores psicossociais.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=>{const {campaignId}=Route.useParams();return <RespondPage campaignId={campaignId}/>},
});
