import db, { type Perfil } from './db';

export interface PerfilAPI extends Perfil {}

export interface PerfilInput {
  nome: string;
  data_nascimento?: string;
  altura_cm?: number;
  sexo?: 'M' | 'F';
  objetivo?: string;
  peso_atual?: number;
}

export const getPerfil = async (): Promise<PerfilAPI | null> => {
  // Since it's a single user, we just get the first profile (id 1 usually)
  const perfis = await db.perfil.toArray();
  return perfis.length > 0 ? perfis[0] : null;
};

export const savePerfil = async (data: PerfilInput): Promise<PerfilAPI> => {
  const existing = await getPerfil();
  
  const now = new Date().toISOString();
  let id: number;

  if (existing && existing.id) {
    // Update
    await db.perfil.update(existing.id, {
      ...data,
      atualizado_em: now
    });
    const updated = await db.perfil.get(existing.id);
    return updated as PerfilAPI;
  } else {
    // Create new
    const novoPerfil: Perfil = {
      ...data,
      criado_em: now,
      atualizado_em: now
    };
    const newId = await db.perfil.add(novoPerfil);
    novoPerfil.id = newId as number;
    return novoPerfil as PerfilAPI;
  }
};

export const updatePerfil = async (id: number, data: PerfilInput): Promise<PerfilAPI> => {
  await db.perfil.update(id, {
    ...data,
    atualizado_em: new Date().toISOString()
  });
  const updated = await db.perfil.get(id);
  if (!updated) throw new Error('Perfil não encontrado');
  return updated as PerfilAPI;
};
