// =====================================================================
// ASSETS.js — caminhos de todos os arquivos usados nas cenas 1 e 2
// (os demais assets do zip, ex: Vale_nao/Trombadinha, ficam disponíveis
// em /assets para as próximas cenas, mas não são carregados ainda)
// =====================================================================

const BASE = "assets/";

function seq(prefix, count, pad = 3) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    out.push(prefix + String(i).padStart(pad, "0") + ".png");
  }
  return out;
}

export const MANIFEST = {
  images: {
    bg1: BASE + "Backgrounds/1.png",
    bg2: BASE + "Backgrounds/2.png",

    alerta: BASE + "UI/alerta.png",
    caixaFalas: BASE + "UI/caixa_de_falas.png",
    logoPet: BASE + "UI/logo_pet.png",

    idle: BASE + "Sprites/Senhorinha/idle.png",
    bengala: BASE + "Sprites/Senhorinha/bengala.png",
    bengalaBrilhante: BASE + "Sprites/Senhorinha/bengala_brilhante.png",
    projetil: BASE + "Sprites/Senhorinha/projetil.png",

    correndo: seq(BASE + "Sprites/Senhorinha/Correndo/senhorinha_", 17),
    pulando: seq(BASE + "Sprites/Senhorinha/Pulando/", 11),
    rolando: seq(BASE + "Sprites/Senhorinha/Rolando/", 29),

    pcBase: [1, 2, 3, 4].map((n) => BASE + `Sprites/Inimigos/PC/SPRITES-BASE/INIMIGOPCSPRITES${n}.png`),
    pcDano: [1, 2, 3, 4].map((n) => BASE + `Sprites/Inimigos/PC/SPRITES-DANO/INIMIGOPCDANO${n}.png`),
    pcAtaque: [1, 2].map((n) => BASE + `Sprites/Inimigos/PC/ATAQUE/ATAQUEPC${n}.png`),

    vida: [0, 1, 2, 3, 4, 5, 6].map((n) => {
      const names = {
        0: "0Vida_Vazia", 1: "1Vida_pouco_", 2: "2Vida_media", 3: "3Vida_meio",
        4: "4Vida_66_", 5: "5Vida_Quase_cheia", 6: "6Vida_cheia",
      };
      return BASE + `UI/Vida/${names[n]}.png`;
    }),
    xp: [0, 1, 2, 3, 4, 5, 6].map((n) => {
      const names = {
        0: "0Xp_vazio", 1: "1Xp_inicio", 2: "2Xp_33_", 3: "3Xp_meio",
        4: "4Xp_66_", 5: "5Xp_quase_cheio", 6: "6Xp_cheio",
      };
      return BASE + `UI/XP/${names[n]}.png`;
    }),

    dadoAnimacao: seq(BASE + "UI/Dado/Animacao/Dado_animacao", 13, 0),
    dadoNumero: [1, 2, 3, 4, 5, 6].map((n) => BASE + `UI/Dado/Numeros/Dado${n}.png`),

    cartas: {
      1: {
        dano: BASE + "UI/Dado/Cartas/carta_1_lado/carta_1.lado_dano.png",
        inimigovelocidade: BASE + "UI/Dado/Cartas/carta_1_lado/carta_1.lado_inimigovelocidade.png",
        inimigovida: BASE + "UI/Dado/Cartas/carta_1_lado/carta_1.lado_inimigovida.png",
        movimento: BASE + "UI/Dado/Cartas/carta_1_lado/carta_1.lado_movimento.png",
        velocidadeatk: BASE + "UI/Dado/Cartas/carta_1_lado/carta_1.lado_velocidadeatk.png",
      },
      2: {
        guardachuva: BASE + "UI/Dado/Cartas/carta_2_lado/carta_2.lado_guardachuva.png",
        spawninimigo: BASE + "UI/Dado/Cartas/carta_2_lado/carta_2.lado_spawninimigo.png",
        velocidadeinimigo: BASE + "UI/Dado/Cartas/carta_2_lado/carta_2.lado_velocidadeinimigo.png",
        vidainimigo: BASE + "UI/Dado/Cartas/carta_2_lado/carta_2.lado_vidainimigo.png",
      },
      3: {
        dano: BASE + "UI/Dado/Cartas/carta_3_lado/carta_3.lado_dano.png",
        guardachuva: BASE + "UI/Dado/Cartas/carta_3_lado/carta_3.lado_guardachuva.png",
        movimento: BASE + "UI/Dado/Cartas/carta_3_lado/carta_3.lado_movimento.png",
        vida: BASE + "UI/Dado/Cartas/carta_3_lado/carta_3.lado_vida.png",
      },
      4: {
        dano: BASE + "UI/Dado/Cartas/carta_4_lado/carta_4.lado_dano.png",
        desconto: BASE + "UI/Dado/Cartas/carta_4_lado/carta_4.lado_desconto.png",
        ouro: BASE + "UI/Dado/Cartas/carta_4_lado/carta_4.lado_ouro.png",
        velocidadeatk: BASE + "UI/Dado/Cartas/carta_4_lado/carta_4.lado_velocidadeatk.png",
        vida: BASE + "UI/Dado/Cartas/carta_4_lado/carta_4.lado_vida.png",
      },
      5: {
        dano: BASE + "UI/Dado/Cartas/carta_5_lado/carta_5.lado_dano.png",
        velocidadeatk: BASE + "UI/Dado/Cartas/carta_5_lado/carta_5.lado_velocidadeatk.png",
        vida: BASE + "UI/Dado/Cartas/carta_5_lado/carta_5.lado_vida.png",
        xp: BASE + "UI/Dado/Cartas/carta_5_lado/carta_5.lado_xp.png",
      },
      6: {
        dano: BASE + "UI/Dado/Cartas/carta_6_lado/carta_6.lado_dano.png",
        ouro: BASE + "UI/Dado/Cartas/carta_6_lado/carta_6.lado_ouro.png",
        velocidadeatk: BASE + "UI/Dado/Cartas/carta_6_lado/carta_6.lado_velocidadeatk.png",
        vida: BASE + "UI/Dado/Cartas/carta_6_lado/carta_6.lado_vida.png",
        xp: BASE + "UI/Dado/Cartas/carta_6_lado/carta_6.lado_xp.png",
      },
    },
  },

  audio: {
    telefone: BASE + "Sounds/telefone.mp3",
    acao: BASE + "Sounds/Acao.mp3",
    tranquila: BASE + "Sounds/Tranquila.mp3",
    pcAtk: BASE + "Sounds/PCs/atk1.wav",
    pcRugido: BASE + "Sounds/PCs/rugido.wav",
    hit1: BASE + "Sounds/Senhorinha/Hit1.wav",
    hit2: BASE + "Sounds/Senhorinha/Hit2.wav",
    hit3: BASE + "Sounds/Senhorinha/Hit3.wav",
    tiro: BASE + "Sounds/Senhorinha/Tiro1.wav",
    upSkill: BASE + "Sounds/Senhorinha/UpSkill.wav",
    passo1: BASE + "Sounds/Senhorinha/passo1.wav",
    passo2: BASE + "Sounds/Senhorinha/passo2.wav",
    pulo: BASE + "Sounds/Senhorinha/pulo.wav",
  },
};

export const images = {}; // key -> HTMLImageElement (ou array de elementos)
export const sounds = {}; // key -> HTMLAudioElement

function loadImage(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Falha ao carregar imagem:", path);
      resolve(img);
    };
    img.src = path;
  });
}

function loadAudio(path) {
  return new Promise((resolve) => {
    const a = new Audio();
    a.oncanplaythrough = () => resolve(a);
    a.onerror = () => {
      console.warn("Falha ao carregar audio:", path);
      resolve(a);
    };
    a.src = path;
    a.load();
  });
}

export async function preloadAll(onProgress) {
  const tasks = [];
  let done = 0;
  let total = 0;

  // conta total primeiro
  function countPath(v) {
    if (Array.isArray(v)) v.forEach(countPath);
    else if (typeof v === "object") Object.values(v).forEach(countPath);
    else total++;
  }
  countPath(MANIFEST.images);
  total += Object.keys(MANIFEST.audio).length;

  function tick() {
    done++;
    if (onProgress) onProgress(done / total);
  }

  async function walkImages(node) {
    if (Array.isArray(node)) {
      const arr = [];
      for (const p of node) {
        arr.push(await loadImage(p));
        tick();
      }
      return arr;
    } else if (typeof node === "object") {
      const out = {};
      for (const k in node) out[k] = await walkImages(node[k]);
      return out;
    } else {
      const img = await loadImage(node);
      tick();
      return img;
    }
  }

  const imgResult = await walkImages(MANIFEST.images);
  Object.assign(images, imgResult);

  for (const key in MANIFEST.audio) {
    sounds[key] = await loadAudio(MANIFEST.audio[key]);
    tick();
  }

  return { images, sounds };
}
