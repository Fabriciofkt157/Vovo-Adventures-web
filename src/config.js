// =====================================================================
// CONFIG.js — todas as constantes "de design" ficam aqui para facilitar
// ajustes finos sem precisar mexer na lógica do jogo.
// =====================================================================

export const GAME_W = 640;
export const GAME_H = 360;
export const ASPECT = GAME_W / GAME_H; // 16:9

export const PLAYER = {
  spawnScene1: { x: 220, y: 245 },  // 15px mais pra baixo que antes (230 -> 245)
  spawnScene2: { x: 60, y: 200 },   // 30px mais pra cima que antes (230 -> 200)
  runSpeed: 113,       // px/s (reajustado para casar com a animação a 20fps)
  rollSpeed: 141,      // px/s durante o rolamento (reajustado para casar com a animação a 20fps)
  jumpSpeed: 220,      // impulso vertical inicial (px/s)
  gravity: 700,        // px/s^2
  frameW: 64,
  frameH: 64,
  idleFrameH: 80,
  idleScale: 0.85,     // sprite de idle é maior que os das animações, reduz 15%
  fps: {
    correndo: 20,
    pulando: 20,
    rolando: 20,
  },
  maxHealth: 6,        // corresponde às 6 imagens de UI/Vida (+ 0 vazio)
  hurtInvulnMs: 800,   // invencibilidade após tomar dano
  attackCooldownMs: 450,
  boomerangSpeed: 260, // px/s indo até o mouse
  boomerangReturnSpeed: 320,
  boomerangOrbitRadius: 20,
  boomerangSpinSpeed: 14, // rad/s do giro visual da bengala
  caneOffsetY: 50,        // deslocamento vertical da bengala em relação ao centro do corpo (sobe ~40px em relação ao valor anterior de 10)
  projectileSpeed: 300,
};

export const ALERTA = {
  x: 404, y: 225, w: 20, h: 16,
  triggerRadius: 46,
};

export const PHONE_HOTSPOT = { x: 410, y: 244 }; // mesma área do alerta (o alerta fica acima do telefone)

export const SCENE1_EASTER_EGG = {
  targetX: 161, targetY: 107, // posição onde a bengala precisa ser jogada
  triggerRadius: 20,          // tolerância de acerto ao redor do alvo
  imgW: 42, imgH: 42,         // tamanho da imagem revelada
};

export const DIALOGUE_TEXT =
  "Olá, vovó... sentiu falta do seu netinho? Venha buscá-lo onde o mundo é obscuro ou ele sucumbirá nas trevas lógicas... Muahaha";

export const SCENE2 = {
  bgWidthFallback: 1280,
  portal: { x: 1160, y: 212, r: 26 }, // círculo amarelo -> vai para cena 3
  enemySpawns: [
    { x: 430, y: 110 },
    { x: 760, y: 150 },
  ],
};

export const ENEMY_PC = {
  frameW: 80,
  frameH: 50,
  hp: 5,
  fps: 8,
  hoverAmplitude: 10,
  hoverSpeedMin: 1.2,
  hoverSpeedMax: 2.0,
  chaseSpeed: 55,
  keepDistance: 170,     // distância que tenta manter do jogador (inimigo voador "kiting")
  attackRange: 320,
  attackCooldownMs: [1800, 2800], // intervalo aleatório entre ataques
  arrowSpeed: 180,
  arrowFrameW: 61,
  arrowFrameH: 8,
  arrowFps: 10,
  xpOnDeath: 1,
  invertMs: 2000,        // controles invertidos ao tomar flechada
  paralyzeMs: 1000,      // paralisia se atingido 2x seguidas
  comboWindowMs: 1500,   // janela para considerar "2 flechadas seguidas"
};

export const XP = {
  requirement: (level) => 2 + level, // nível 0->1 precisa de 2, escala levemente depois
  maxBarStages: 6,
};

export const CANE_STUN = {
  durationMs: 3000, // bengala "piscando" e desabilitada após colidir com clock
};

export const CARD_TIERS = {
  1: "ruim", 2: "ruim",
  3: "medio", 4: "medio",
  5: "bom", 6: "bom",
};

// nomes de carta com probabilidade 0 (features não implementadas ainda)
export const DISABLED_CARD_KEYWORDS = ["ouro", "guardachuva"];
