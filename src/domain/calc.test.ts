import { describe, expect, it } from 'vitest';
import { calculateScope, scoreItem } from './calc';
import { DEMO_INSTRUMENT, DEFAULT_INSTRUMENTS } from './instruments';
import { applyComplementarySuppression } from './privacy';
import { createDemoDatabase } from './demo-data';
import type { AnonymousResponse } from './types';

const base = (id: string, answers: Record<string,number|null>): AnonymousResponse => ({id,campaignId:'c',departmentId:'d',instrumentId:DEMO_INSTRUMENT.id,rulesVersion:DEMO_INSTRUMENT.rulesVersion,submittedAt:'2026-01-01T00:00:00Z',answers});
const calc=(responses:AnonymousResponse[],minGroupSize=1)=>calculateScope({campaignId:'c',scopeId:'d',scopeLabel:'D',instrument:DEMO_INSTRUMENT,responses,options:{minGroupSize}});
describe('motor demonstrativo',()=>{
 it('normaliza e inverte os itens',()=>{expect(scoreItem(4,DEMO_INSTRUMENT.options,false)).toBe(100);expect(scoreItem(4,DEMO_INSTRUMENT.options,true)).toBe(0)});
 it('exclui ausentes sem convertê-los em zero e respeita o mínimo de itens',()=>{const responses=[1,2,3,4,5].map(i=>base(String(i),{q1:4,q2:4,q3:null}));const result=calc(responses);expect(result.dimensions[0]?.score).toBe(100);expect(result.dimensions[0]?.validRespondents).toBe(5);expect(result.dimensions[0]?.answeredItems).toBe(10)});
 it('separa dimensão insuficiente das calculáveis',()=>{const responses=[1,2,3,4,5].map(i=>base(String(i),{q1:3,q2:3,q3:1,q13:i<3?4:null,q14:i<3?4:null}));const result=calc(responses);expect(result.dimensions[0]?.score).not.toBeNull();expect(result.dimensions.find(d=>d.dimensionId==='dim-conflito')?.status).toBe('dados_insuficientes')});
 it('suprime grupos pequenos e grupo complementar',()=>{expect(calc([base('1',{q1:4})],5).dimensions[0]?.score).toBeNull();const marked=applyComplementarySuppression([{count:2},{count:7},{count:12}],5);expect(marked.map(g=>g.suppressed)).toEqual([true,true,false])});
 it('mantém COPSOQ pendente bloqueado e campanha com cópia congelada',()=>{expect(DEFAULT_INSTRUMENTS.filter(i=>i.family==='COPSOQ').every(i=>!i.publishable&&i.questions.length===0)).toBe(true);const db=createDemoDatabase();expect(db.campaigns[0]?.instrumentSnapshot?.rulesVersion).toBe('demo-regras-1.0.0');expect(db.campaigns[0]?.frozenAt).toBeTruthy()});
});
