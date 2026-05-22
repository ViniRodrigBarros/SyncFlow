import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const empresa1 = await prisma.empresa.upsert({
    where: { id: 1 },
    update: { nome: 'Empresa Alpha' },
    create: { id: 1, nome: 'Empresa Alpha' },
  });

  const empresa2 = await prisma.empresa.upsert({
    where: { id: 2 },
    update: { nome: 'Empresa Beta' },
    create: { id: 2, nome: 'Empresa Beta' },
  });

  const senhaHash1 = await bcrypt.hash('123456', 10);
  const senhaHash2 = await bcrypt.hash('123456', 10);

  const usuario1 = await prisma.usuario.upsert({
    where: { login: 'alpha@teste.com' },
    update: {},
    create: {
      nome: 'Usuário Alpha',
      login: 'alpha@teste.com',
      senha: senhaHash1,
      empresaId: empresa1.id,
    },
  });

  const usuario2 = await prisma.usuario.upsert({
    where: { login: 'beta@teste.com' },
    update: {},
    create: {
      nome: 'Usuário Beta',
      login: 'beta@teste.com',
      senha: senhaHash2,
      empresaId: empresa2.id,
    },
  });

  console.log('Seed concluído.');
  console.log('Empresas:', { empresa1, empresa2 });
  console.log('Usuários (senha: 123456):', {
    alpha: usuario1.login,
    beta: usuario2.login,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
