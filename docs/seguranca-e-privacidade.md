# Segurança e privacidade

[English](security-and-privacy.md) · **Português**

Como o gym-checkin protege os dados dos sócios, e porque é que cada decisão foi tomada. Tudo aqui descreve o código tal como está; o que ainda não está feito aparece em [Falhas conhecidas](#falhas-conhecidas).

## Dados pessoais (RGPD)

Só o que o ginásio precisa: sem e-mail, telefone, fotografia nem localização.

| Dados | Porquê |
| --- | --- |
| Nome, número de sócio (coluna `room`), username | A receção sabe quem está lá dentro (o número de sócio é como o ginásio identifica as pessoas) |
| Hash da password (bcrypt) | Login; a password em si nunca é guardada |
| Role, ativo, datas da conta | Permissões; contas desativadas mantêm o histórico mas não entram |
| Visitas: hora de entrada e saída, método de check-in, quem a fechou | A contagem de ocupação, a lista diária da receção e as estatísticas |
| Pedidos de entrada: quando, estado, que pessoa do staff decidiu | O método de aprovação pela receção, e um registo de quem deixou entrar quem |

O demo público só tem pessoas falsas. Os dados reais dos sócios destinam-se a uma instalação local, dentro da rede do ginásio (roadmap, fase 8), nunca ao demo na cloud.

## Quem vê o quê

| | Sócio | Receção | Admin |
| --- | --- | --- | --- |
| Quantas pessoas estão lá dentro | sim | sim | sim |
| Estatísticas (só contagens e médias) | sim | sim | sim |
| Quem está lá dentro, visitas de hoje com nomes | não | sim | sim |
| Contas (criar, desativar, mudar o número de sócio) | não | não | sim |

- **As estatísticas são agregados por desenho.** A consulta das estatísticas lê só as horas de entrada e saída (sem id nem nome do utilizador), e há um teste que verifica esse `select`. As médias são ponderadas pelo tempo, por isso nunca mostram uma visita sozinha. O único sítio com visitas individuais numa linha do tempo é a página do staff, para quem já vê a lista com nomes.
- **Os roles são verificados na API**, não só escondidos na interface: cada rota do staff tem um guard de role, e o role é lido da base de dados em cada pedido, por isso uma mudança aplica-se logo.

## Autenticação

- **JWT num cookie `httpOnly`**, nunca no `localStorage`: o JavaScript (e por isso uma falha de XSS) não o consegue ler. `Secure` em produção, `SameSite=Lax`, válido 7 dias.
- **Cada pedido volta a verificar a conta.** Um utilizador desativado fica logo sem acesso, e mudar a password termina a sessão nos outros dispositivos (os tokens emitidos antes da mudança deixam de funcionar).
- **Passwords:** bcrypt (10 rondas). As contas importadas recebem uma password temporária aleatória, mostrada ao admin uma única vez, e têm de escolher a sua no primeiro login. As contas de demonstração não podem mudar a sua.
- **Sem enumeração de utilizadores:** um username errado, uma password errada e uma conta inativa dão a mesma resposta no mesmo tempo (o bcrypt corre sempre).
- **CSRF:** o `SameSite=Lax` impede o envio do cookie em pedidos `POST`/`PATCH` vindos de outros sites, por isso outro site não consegue agir em nome de um sócio com sessão iniciada. Não há CORS configurado: a app e a API partilham a mesma origem.

## Limites de pedidos

| Endpoint | Limite |
| --- | --- |
| Login | 5 por minuto |
| Mudar a password | 5 por minuto, por utilizador |
| Check-in, checkout, pedido de entrada | 10 por minuto |

## Prova de presença

Um QR impresso em papel não prova nada: qualquer pessoa lhe tira uma foto e faz check-in de casa. Por isso o método de check-in é um componente trocável (padrão Strategy), e o ginásio ativa os que quiser:

- **QR rotativo num ecrã.** O código muda a cada 30 segundos e é uma assinatura HMAC da janela de tempo (comparada em tempo constante). São aceites a janela atual e a anterior, por isso uma foto funciona no máximo cerca de um minuto.
- **Aprovação da receção.** O sócio pede para entrar e uma pessoa ao balcão aprova. O pedido expira ao fim de 2 minutos.

As regras importantes vivem na base de dados e na API, não na interface: "uma visita aberta por pessoa" é um índice único parcial (`one_open_session_per_user`), por isso vale mesmo com dois pedidos ao mesmo tempo. As visitas que ficam abertas (uma chave esquecida) são fechadas por uma tarefa a cada 5 minutos e marcadas `AUTO`, para não deturparem as estatísticas.

## Segredos e configuração

O `JWT_SECRET` e o `QR_SECRET` vêm de variáveis de ambiente e são validados no arranque: sem eles, a API recusa-se a arrancar. As passwords do seed também vêm do ambiente, nunca do código.

## Falhas conhecidas

Listadas de propósito, para ninguém assumir que existem:

- **Retenção:** as visitas são guardadas para sempre. Plano: apagar ou anonimizar as visitas com mais de 12 meses.
- **Direito ao apagamento:** uma conta pode ser desativada, não apagada. Apagar obriga também a decidir o que acontece às suas visitas (anonimizar em vez de apagar, para manter as estatísticas).
- **Direito de acesso:** os sócios ainda não conseguem ver a lista das suas visitas na app; a receção pode mostrá-las.
- **Headers de segurança:** ainda não há Content-Security-Policy nem outros headers de proteção.
- **Foto do QR partilhada:** uma foto enviada a um amigo funciona até um minuto. Onde isso importa, a resposta é a aprovação pela receção (ou uma janela mais curta).
