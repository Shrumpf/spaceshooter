import { initFont, font } from './tf.js';

class Powerup {
  constructor(game, x, y, name, icon) {
    this.active = true;
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 15;
    this.height = 15;
    this.name = name;
    this.icon = icon;
  }

  draw() {
    if (!this.active) {
      return;
    }
    this.game.ctx.fillStyle = 'green';
    this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.game.render(this.icon, this.x, this.y, 14, "black");
    this.update();
  }

  update() {
    if (collision(this.game.player, this)) {
      switch (this.name) {
        case "laser":
          this.game.player.powerups.laser = true;
          setTimeout(() => { this.game.player.powerups.laser = false }, 5000)
          break;
        case "split":
          this.game.player.powerups.split = true;
          setTimeout(() => { this.game.player.powerups.split = false }, 5000)
          break;
      }
      this.active = false;
    }
  }
}

class Bullet {
  constructor(game, revert = false) {
    this.game = game;
    this.height = 15;
    this.width = 15;
    this.x = game.player.x + game.player.width / 2;
    this.y = game.player.y + game.player.height / 2;
    this.rotation = game.player.rotation;
    this.vx = 25;
    this.vy = 25;
    this.active = true;
    this.revert = revert;
  }

  draw() {
    if (this.y > this.game.height || this.y < 0 || this.x > this.game.width || this.x < 0) {
      this.active = false;
    }

    if (!this.active) {
      return;
    }


    //console.log(this.x);
    //this.game.ctx.translate(this.x + (this.width/2), this.y + (this.height/2));
    //this.game.ctx.rotate(this.rotation);
    //this.game.ctx.translate(0,0);
    //this.game.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    this.game.ctx.fillStyle = 'blue';
    this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
    // this.game.ctx.translate(-200, -200);
    // this.x += (this.target.x - this.x) / 10;
    // this.y += (this.target.y - this.y) / 10;
    if (this.revert) {
      this.x -= Math.cos(this.rotation) * this.vx;
      this.y -= Math.sin(this.rotation) * this.vy;
    } else {
      this.x += Math.cos(this.rotation) * this.vx;
      this.y += Math.sin(this.rotation) * this.vy;
    }
  }
}

class Enemy {
  constructor(game, height = 25, width = 25, health = 100, score = 1, color = 'yellow') {
    this.active = true;
    this.game = game;
    this.ctx = game.ctx;
    this.height = height;
    this.width = width;
    this.health = health;
    this.score = score;
    this.color = color;
    this.x = getRandomInt(0, this.game.width - 25);
    this.y = getRandomInt(0, this.game.height - 25);
  }

  draw() {
    if (!this.active) {
      return;
    }
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.checkHits();
  }

  checkHits() {
    let bullets = this.game.bullets.filter(bullet => {
      if (collision(bullet, this)) {
        return true;
      }
    });

    if (bullets.length > 0) {
      if (!this.game.player.powerups.laser) {
        bullets.forEach(b => b.active = false);
      }
      if (Math.random() < this.game.player.critrate) {
        this.health -= this.game.player.damage * this.game.player.critdamage;
      } else {
        this.health -= this.game.player.damage;
      }

      if (this.health <= 0) {
        this.active = false;
        this.game.score += this.score;
        if (getRandomInt(0, 2) < 0.1) {
          if (getRandomInt(0, 2) < 0.5) {
            this.game.drops.push(new Powerup(this.game, this.x, this.y, "split", "S"));
          }
          else {
            this.game.drops.push(new Powerup(this.game, this.x, this.y, "laser", "L"));
          }
        }
      }
    }
  }
}

class Boss extends Enemy {
  constructor(game) {
    super(game, 50, 50, 1000, 10, "red");
  }
}


class Player {
  constructor(game) {
    this.active = true;
    this.rotation = 0;
    this.game = game;
    this.height = 25;
    this.width = 25;
    this.x = game.width / 2 - this.width / 2;
    this.y = game.height / 2 - this.height / 2;
    this.up = 0;
    this.left = 0;
    this.down = 0;
    this.right = 0;
    this.speed = 5;
    this.critrate = 1;
    this.critdamage = 2;
    this.damage = 100;
    this.range = 0;
    this.health = 3;
    this.autoshoot = false;
    this.powerups = {
      laser: false,
      split: false,
      invincible: false
    }
  }

  draw() {
    if (!this.active) {
      return;
    }

    //console.log(this.x);
    if (this.game.enemies.filter(e => collision(e, this)).length > 0 && !this.powerups.invincible) {
      console.log("Hit")
      this.health -= 1;
      this.powerups.invincible = true;
      console.log("Invicible")
      setTimeout(() => {
        this.powerups.invincible = false;
        console.log("Not Invicible");
      }, 1000)
    };

    if (this.health <= 0) {
      this.active = false;
      this.game.state = 1;
      if (this.game.score > this.game.highscore) {
        this.game.highscore = this.game.score;
        localStorage.setItem('o9asdjad_highscore', this.game.highscore);
      }
      return;
    }

    this.game.ctx.save();

    if (this.up) {
      this.y -= this.speed;
    }
    if (this.down) {
      this.y += this.speed;
    }

    if (this.left) {
      this.x -= this.speed;
    }

    if (this.right) {
      this.x += this.speed;
    }

    this.rotation = Math.atan2(this.game.mousepos.y - this.y, this.game.mousepos.x - this.x);

    this.game.ctx.fillStyle = 'red';
    this.game.ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
    this.game.ctx.rotate(this.rotation);
    //this.game.ctx.translate(0,0);
    this.game.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    //this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.game.ctx.translate(0, 0);
    this.game.ctx.restore();
  }
}

class Game {
  constructor() {
    this.state = 2;
    this.bullets = [];
    this.enemies = [];
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext('2d');
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.player = new Player(this);
    this.score = 0;
    this.highscore = localStorage.getItem('o9asdjad_highscore') ?? 0;
    this.mousepos = {};
    this.render = initFont(font, this.ctx);
    this.drops = [];
    this.stars = [];

    window.addEventListener('keydown', (e) => {
      // Up (up / W / Z)
      if (e.keyCode == 38 || e.keyCode == 90 || e.keyCode == 87) {
        this.player.up = true;
      }

      // Right (right / D)
      if (e.keyCode == 39 || e.keyCode == 68) {
        this.player.right = true;
      }

      // Down (down / S)
      if (e.keyCode == 40 || e.keyCode == 83) {
        this.player.down = true;
      }

      // Left (left / A / Q)
      if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 81) {
        this.player.left = true;
      }

      // F
      if (e.keyCode === 70) {
        this.player.autoshoot = !this.player.autoshoot;
      }

      this.player.rotation = Math.atan2(this.mousepos.y - this.player.y, this.mousepos.x - this.player.x);

    });
    window.addEventListener('keyup', (e) => {
      if (e.keyCode == 38 || e.keyCode == 90 || e.keyCode == 87) {
        this.player.up = false;
      }

      // Right
      if (e.keyCode == 39 || e.keyCode == 68) {
        this.player.right = false;
      }

      // Down
      if (e.keyCode == 40 || e.keyCode == 83) {
        this.player.down = false;
      }

      // Left
      if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 81) {
        this.player.left = false;
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const startX = parseInt(e.clientX - offset(canvas).left);
      const startY = parseInt(e.clientY - offset(canvas).top);

      this.mousepos = { x: startX, y: startY };

      // atan2(MouseYposition - PlayerYposition, MouseXposition - PlayerXposition)
      const rotation = Math.atan2(startY - this.player.y, startX - this.player.x);
      this.player.rotation = rotation;
      // this.bullets.push(new Bullet(this, rotation))
    });

    this.canvas.addEventListener('click', (e) => {
      this.bullets.push(new Bullet(this));
    });

    this.init();

  }
  init() {
    this.canvas.style.height = this.height + "px";
    this.canvas.style.width = this.width + "px";
    this.canvas.setAttribute('height', this.height);
    this.canvas.setAttribute('width', this.width);
    this.initStars();
    setInterval(() => {
      if (this.enemies.length > 100) return;
      if (Math.random() < 0.1) {
        this.enemies.push(new Boss(this));
      } else {
        this.enemies.push(new Enemy(this));
      }
    }, 10)
    // this.shootTimer();

    window.requestAnimationFrame(this.draw.bind(this));

  }
  draw() {
    if (this.state === 0) {
      return;
    } else if (this.state === 1) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.translate(0, 0);

      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].draw();
      }

      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalAlpha = 1;
      let textwidth = (count, score) => count * 30 + ("" + score).length * 30;
      this.render("GAME OVER", this.width / 2 - 190, 50, 50, 'white');
      this.render(`SCORE: ${this.score}`, this.width / 2 - textwidth(7, this.score) / 2, this.height / 2 - 50, 40, 'white');
      this.render(`HIGHSCORE: ${this.highscore}`, this.width / 2 - textwidth(11, this.highscore) / 2, this.height / 2, 40, 'white');
      this.ctx.restore();
      this.state = 0;
    } else if (this.state === 2) {
      this.ctx.save();
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.translate(0, 0);
      for (let star of this.stars) {
        star.update();
      }
      this.player.draw();
      if (this.player.autoshoot) {
        this.bullets.push(new Bullet(this));
        if (this.player.powerups.split) {
          this.bullets.push(new Bullet(this, true));
        }
      }

      this.bullets = this.bullets.filter(b => b.active);
      this.enemies = this.enemies.filter(b => b.active);
      for (let i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw();
      }
      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].draw();
      }
      for (let i = 0; i < this.drops.length; i++) {
        this.drops[i].draw();
      }
      this.ctx.restore();

      this.render(`SCORE: ${this.score}`, 25, 25, 38, 'white');
      this.render(`LIVES: ${this.player.health}`, 25, 75, 38, 'white');
    }
    window.requestAnimationFrame(this.draw.bind(this));
  }

  initStars() {
    // nearest stars
    for (let i = 0; i < 50; ++i) {
      const x = Math.random() * (this.width - starsConfig.nearStar.width);
      const y = Math.random() * (this.height - starsConfig.nearStar.width);
      this.stars.push(new Star(this.ctx, x, y, starsConfig.nearStar.width, starsConfig.nearStar.speed));
    }

    // mid-distance stars
    for (let i = 0; i < 100; ++i) {
      const x = Math.random() * (this.width - starsConfig.midStar.width);
      const y = Math.random() * (this.height - starsConfig.midStar.width);
      this.stars.push(new Star(this.ctx, x, y, starsConfig.midStar.width, starsConfig.midStar.speed));
    }

    // farthest stars
    for (let i = 0; i < 350; ++i) {
      const x = Math.random() * (this.width - starsConfig.farStar.width);
      const y = Math.random() * (this.height - starsConfig.farStar.width);
      this.stars.push(new Star(this.ctx, x, y, starsConfig.farStar.width, starsConfig.farStar.speed));
    }
  }
}

const starsConfig = {
  nearStar: {
    width: 3,
    speed: 0.2
  },
  midStar: {
    width: 2,
    speed: 0.1
  },
  farStar: {
    width: 1,
    speed: 0.025
  }
};

function offset(elt) {
  var rect = elt.getBoundingClientRect(), bodyElt = document.body;

  return {
    top: rect.top + bodyElt.scrollTop,
    left: rect.left + bodyElt.scrollLeft
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function collision(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y;
}


// codepen
class Star {
  constructor(ctx, x, y, width, speed) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.speed = speed;
    this.color = "#fff";
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.width);
  }

  update() {
    // check bounds
    if (this.x + this.width > innerWidth) {
      this.x = 0;
    }
    this.x += this.speed;

    this.draw();
  }
}

new Game();