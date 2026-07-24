export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0; // em coordenadas de MUNDO do jogo (já convertido)
    this.mouseScreenX = 0;
    this.mouseScreenY = 0;
    this.leftPressed = false;
    this.rightPressed = false;
    this.leftJustPressed = false;
    this.rightJustPressed = false;

    this.inverted = false;   // controles invertidos (flechada)
    this.locked = false;     // paralisado (não aceita nenhum input de movimento)

    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));

    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouseScreenX = ((e.clientX - r.left) / r.width) * canvas.width;
      this.mouseScreenY = ((e.clientY - r.top) / r.height) * canvas.height;
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.leftPressed = true;
        this.leftJustPressed = true;
      }
      if (e.button === 2) {
        this.rightPressed = true;
        this.rightJustPressed = true;
      }
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.leftPressed = false;
      if (e.button === 2) this.rightPressed = false;
    });
  }

  // deve ser chamado no fim de cada frame do loop principal
  endFrame() {
    this.leftJustPressed = false;
    this.rightJustPressed = false;
  }

  _rawAxis() {
    let dir = 0;
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) dir -= 1;
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) dir += 1;
    return dir;
  }

  // eixo horizontal já considerando inversão/bloqueio
  moveAxis() {
    if (this.locked) return 0;
    let dir = this._rawAxis();
    if (this.inverted) dir *= -1;
    return dir;
  }

  jumpPressed() {
    if (this.locked) return false;
    return this.keys.has("Space") || this.keys.has("ArrowUp") || this.keys.has("KeyW");
  }

  rollPressed() {
    if (this.locked) return false;
    return this.keys.has("ShiftLeft") || this.keys.has("ShiftRight") || this.keys.has("KeyS") || this.keys.has("ArrowDown");
  }
}
