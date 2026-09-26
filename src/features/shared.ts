import type { Database, Campaign, CalculationResult } from '@/domain/types';
import { calculateScope } from '@/domain/calc';
import { applyComplementarySuppression } from '@/domain/privacy';

export function campaignResults(db: Database, campaign: Campaign): CalculationResult[] {
  const instrument = campaign.instrumentSnapshot ?? db.instruments.find(i=>i.id===campaign.instrumentId);
  if (!instrument || instrument.questions.length===0) return [];
  const responses = db.responses.filter(r=>r.campaignId===campaign.id);
  const counts = campaign.departmentIds.map(id=>({id,count:responses.filter(r=>r.departmentId===id).length}));
  const marked = applyComplementarySuppression(counts, db.settings.minGroupSize);
  return marked.map(({id,suppressed})=>{
    const dept=db.departments.find(d=>d.id===id);
    const result=calculateScope({campaignId:campaign.id,scopeId:id,scopeLabel:dept?.name??id,instrument,responses:responses.filter(r=>r.departmentId===id),options:{minGroupSize:db.settings.minGroupSize}});
    if(suppressed) return {...result,suppressed:true,dimensions:result.dimensions.map(d=>({...d,status:'suprimido_privacidade' as const,score:null}))};
    return result;
  });
}
export function statusTone(status:string) { return /alto|atras|pendente|aguardando|insuficiente|suprimido/.test(status)?'warning':/avaliado|aprovada|concluida|finalizada/.test(status)?'success':'neutral'; }
