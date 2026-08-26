# Roadmap de plataforma — OceanQuiet

Este documento registra a evolução planejada. Ele **não** significa que o backend ou o deploy já estejam ativos.

## Estado atual

- O app é um protótipo Next.js executado localmente.
- Contas de demonstração, tarefas, diário, check-ins, foco, tema, idioma e foto de perfil ficam no armazenamento local do navegador.
- O clima usa a permissão de localização do navegador e serviços externos de clima/geocodificação somente quando essa permissão é concedida.

## Próxima arquitetura: Supabase

1. **Autenticação:** substituir o login local por Supabase Auth; migrar sessão, recuperação de senha e verificação de e-mail.
2. **Banco (Postgres):** criar migrations para `profiles`, `tasks`, `task_categories`, `routine_slots`, `journal_entries`, `journal_checkins`, `focus_sessions` e `subscriptions`.
3. **Segurança:** ativar Row Level Security em todas as tabelas; toda linha precisa de `user_id = auth.uid()` e políticas explícitas para `select`, `insert`, `update` e `delete`.
4. **Arquivos:** guardar fotos de perfil no Supabase Storage em bucket privado, com caminho por usuário e URLs assinadas — não em `localStorage`.
5. **Migração do protótipo:** oferecer uma importação consentida do conteúdo local, com prévia e opção de ignorar dados sensíveis (diário/check-ins).
6. **Privacidade:** antes de enviar qualquer conteúdo para a nuvem, revisar a Política de Privacidade, publicar canal do encarregado, retenção, exclusão/exportação e subprocessadores.

## Deploy: Vercel

1. Conectar o repositório à Vercel e manter preview por pull request.
2. Configurar apenas variáveis públicas necessárias no cliente, como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`; nunca expor `service_role` no navegador.
3. Guardar segredos de servidor somente nas variáveis de ambiente da Vercel/Supabase.
4. Definir domínios de produção, headers de segurança, monitoramento de erros e backups/migrations antes do lançamento.
5. Validar fluxo de login, RLS, upload, exclusão e exportação em preview antes de cada produção.

## Critérios antes de ativar a nuvem

- [ ] Migrations versionadas e revisadas.
- [ ] RLS testada com pelo menos dois usuários.
- [ ] Fluxo de exportação e exclusão de conta definido.
- [ ] Política LGPD revisada com dados reais de tratamento e contato de privacidade.
- [ ] Limites de upload, validação de tipo e política de retenção definidos.
- [ ] Variáveis de ambiente registradas fora do código.
