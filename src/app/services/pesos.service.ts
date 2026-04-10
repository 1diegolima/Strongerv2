import db, { type Peso } from './db';

export interface PesoAPI extends Peso {}

export interface PesoInput {
  peso_kg: number;
  observacao?: string;
  data_registro?: string;
}

export const getPesos = async (): Promise<PesoAPI[]> => {
  // Return pesos ordered by creation date
  return await db.pesos.orderBy('data_registro').toArray();
};

export const addPeso = async (data: PesoInput): Promise<PesoAPI> => {
  const novoPeso: Peso = {
    peso_kg: data.peso_kg.toString(),
    data_registro: data.data_registro || new Date().toISOString().split('T')[0],
    observacao: data.observacao || null,
    criado_em: new Date().toISOString()
  };

  const id = await db.pesos.add(novoPeso);
  novoPeso.id = id as number;
  return novoPeso;
};

export const deletePeso = async (id: number): Promise<void> => {
  await db.pesos.delete(id);
};
