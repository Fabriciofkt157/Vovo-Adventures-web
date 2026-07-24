// Aplica efeito de carta ao jogador (e opcionalmente à lista de inimigos, para
// cartas que afetam os inimigos). Os valores são pensados para serem fáceis
// de reequilibrar depois.

export function applyCard(card, player, enemies) {
  const tier = card.tier; // 'ruim' | 'medio' | 'bom'

  switch (card.key) {
    case "dano": {
      const delta = tier === "ruim" ? -0.25 : tier === "medio" ? 0.15 : 0.35;
      player.stats.dano = Math.max(0.25, player.stats.dano + delta);
      break;
    }
    case "movimento": {
      const delta = tier === "ruim" ? -0.15 : tier === "medio" ? 0.1 : 0.2;
      player.stats.movimentoMult = Math.max(0.4, player.stats.movimentoMult + delta);
      break;
    }
    case "velocidadeatk": {
      // multiplicador do COOLDOWN: menor é melhor
      const delta = tier === "ruim" ? 0.25 : tier === "medio" ? -0.12 : -0.25;
      player.stats.velocidadeatkMult = Math.max(0.3, player.stats.velocidadeatkMult + delta);
      break;
    }
    case "vida": {
      const bonus = tier === "medio" ? 1 : 2;
      player.maxHealth += bonus;
      player.health = Math.min(player.maxHealth, player.health + bonus);
      break;
    }
    case "xp": {
      const bonus = tier === "bom" ? 1 : 1;
      player.xp += bonus;
      break;
    }
    case "inimigovelocidade":
    case "velocidadeinimigo": {
      const delta = tier === "ruim" ? 0.25 : 0.1;
      for (const e of enemies) e.speedMult = (e.speedMult || 1) + delta;
      break;
    }
    case "inimigovida":
    case "vidainimigo": {
      const bonus = tier === "ruim" ? 2 : 1;
      for (const e of enemies) {
        e.maxHp += bonus;
        e.hp += bonus;
      }
      break;
    }
    case "spawninimigo": {
      // reservado para cenas futuras com spawn contínuo de inimigos
      break;
    }
    case "desconto": {
      // reservado para quando houver loja/itens
      break;
    }
    default:
      break;
  }
}
