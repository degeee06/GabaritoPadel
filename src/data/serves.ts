export interface ServeGuide {
  id: string;
  title: string;
  description: string;
  details: string[];
  image: string;
}

export const serves: ServeGuide[] = [
  {
    id: 'plano',
    title: '1. Saque Plano (Flat Serve)',
    description: 'O saque plano é o mais simples e seguro, ideal para iniciantes ou como segundo saque para garantir que a bola entre em jogo. O objetivo é ter controle e precisão, não potência ou efeito. A bola é golpeada com a face da raquete perpendicular ao chão, resultando em uma trajetória reta e um quique previsível.',
    details: [
      'Execução Técnica: Posicione-se atrás da linha de saque, de lado para a rede. Solte a bola ligeiramente à frente e ao lado do corpo. Golpei-a na altura da cintura ou abaixo, com um movimento para frente e ligeiramente para cima, mantendo a face da raquete plana. O acompanhamento deve ser na direção do alvo.',
      'Uso Tático: Usado principalmente como segundo saque para evitar duplas faltas, ou para surpreender o adversário com um saque rápido e profundo no meio da quadra ou nos cantos.'
    ],
    image: '/saque-plano.png'
  },
  {
    id: 'cortado',
    title: '2. Saque Cortado (Slice Serve)',
    description: 'O saque cortado é o mais comum e eficaz no Padel profissional. Ele imprime um efeito de rotação para trás (backspin) na bola, fazendo com que ela quique baixo e deslize após tocar o chão e, especialmente, após bater nas paredes de vidro. Isso dificulta a devolução do adversário.',
    details: [
      'Execução Técnica: Semelhante ao saque plano, mas a raquete golpeia a bola com um movimento descendente e "fatiando" a parte inferior da bola. A face da raquete está ligeiramente aberta (voltada para cima) no momento do impacto. O acompanhamento é feito cruzando o corpo.',
      'Uso Tático: Ideal para o primeiro saque, visando as paredes laterais ou o "T" (linha central) para forçar o adversário a se deslocar e devolver uma bola baixa e difícil. É uma excelente arma para ganhar a rede.'
    ],
    image: '/saque-cortado.png'
  },
  {
    id: 'topspin',
    title: '3. Saque com Topspin (Liftado)',
    description: 'Menos comum no Padel do que no tênis, o saque com topspin imprime uma rotação para frente na bola. Isso faz com que a bola caia mais rapidamente após passar a rede e quique mais alto, especialmente após bater no vidro.',
    details: [
      'Execução Técnica: A raquete deve "escovar" a parte de trás da bola de baixo para cima no momento do impacto. A face da raquete pode estar ligeiramente fechada (voltada para baixo). O movimento termina alto, acima do ombro oposto.',
      'Uso Tático: Usado para surpreender o adversário com um quique alto e imprevisível nas paredes. Pode ser eficaz para deslocar o adversário para fora da quadra ou forçar uma devolução alta que facilite o ataque na rede. Requer mais técnica e precisão.'
    ],
    image: '/saque-topspin.png'
  }
];
