export interface PositionGuide {
  id: string;
  title: string;
  description: string;
  details: string[];
  image: string;
}

export const positions: PositionGuide[] = [
  {
    id: 'saque',
    title: 'Posição Inicial: O Saque',
    description: 'O jogo de Padel começa com o saque. Esta é a formação inicial padrão, onde cada jogador tem um papel e uma posição específica.',
    details: [
      'Sacador: O jogador que inicia o ponto, posicionado atrás da linha de serviço.',
      'Parceiro do Sacador: Fica posicionado próximo à rede, pronto para o ataque assim que o saque é feito.',
      'Recebedor: O jogador na diagonal oposta ao sacador, posicionado na caixa de serviço para devolver a bola.',
      'Parceiro do Recebedor: Permanece no fundo da quadra, atrás da linha de serviço, em uma posição mais defensiva.'
    ],
    image: '/posicao-saque.png'
  },
  {
    id: 'ataque',
    title: 'Posição de Ataque: Na Rede',
    description: 'Após o saque, a dupla que sacou geralmente avança para a rede para assumir a posição de ataque. Esta é a posição mais vantajosa no Padel, onde a maioria dos pontos é vencida.',
    details: [
      'Jogadores na Rede (Ataque): Ambos os jogadores da dupla se posicionam próximos à rede, cobrindo a maior parte da quadra e prontos para volear ou aplicar um smash. O objetivo é pressionar os adversários e finalizar o ponto. A dupla adversária permanece no fundo da quadra em posição defensiva.'
    ],
    image: '/posicao-ataque.png'
  },
  {
    id: 'defesa',
    title: 'Posição de Defesa: Fundo da Quadra',
    description: 'Quando a dupla adversária consegue um bom lob (bola alta por cima dos jogadores na rede) ou uma bola difícil, a equipe que estava na rede é forçada a recuar para o fundo da quadra. Esta é a posição defensiva.',
    details: [
      'Jogadores no Fundo (Defesa): Ambos os jogadores se posicionam atrás da linha de serviço. O objetivo é defender os ataques da equipe adversária, que agora assumiu a posição na rede, e tentar recuperar a posição de ataque através de um lob ou uma bola bem colocada.'
    ],
    image: '/posicao-defesa.png'
  },
  {
    id: 'diagrama',
    title: 'Diagrama das Zonas da Quadra',
    description: 'Para melhor compreensão, este diagrama mostra as principais zonas da quadra de Padel e suas funções estratégicas.',
    details: [
      'Zona de Defesa (Fundo de Quadra): A área atrás da linha de serviço. É onde os jogadores se posicionam para defender.',
      'Zona de Ataque (Rede): A área próxima à rede. É onde os jogadores se posicionam para atacar e finalizar o ponto.',
      'Terra de Ninguém (Zona de Transição): A área entre a linha de serviço e a zona de ataque. Deve ser evitada, pois é uma posição vulnerável. É usada apenas para transição entre a defesa e o ataque.',
      'Caixa de Serviço (Esquerda e Direita): As áreas onde a bola deve quicar após o saque.',
      'Linha Central: Divide a quadra em duas metades, esquerda e direita.'
    ],
    image: '/diagrama-zonas.png'
  }
];
