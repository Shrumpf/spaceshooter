const canvasTxt = window.canvasTxt.default;

function dbug(ctx, player, startX, startY) {
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(startX, startY);
  ctx.stroke();
}

class Bullet {
  constructor(game, revert = false) {
    this.game = game;
    this.x = game.player.x + game.player.width / 2;
    this.y = game.player.y + game.player.height / 2;
    this.height = 15;
    this.width = 15;
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
  constructor(game, x, y, height = 25, width = 25, health = 100) {
    this.active = true;
    this.game = game;
    this.ctx = game.ctx;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.health = health;
  }

  draw() {
    if (!this.active) {
      return;
    }
    this.ctx.fillStyle = 'yellow';
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.checkHits();
  }

  checkHits() {
    //   if (bullet.x < this.x + this.width &&
    //     bullet.x + bullet.width > this.x &&
    //     bullet.y < this.y + this.height &&
    //     bullet.y + bullet.height > this.y) {
    //      // collision detected!
    //  }
    let bullets = this.game.bullets.filter(bullet => {
      if (bullet.x < this.x + this.width &&
        bullet.x + bullet.width > this.x &&
        bullet.y < this.y + this.height &&
        bullet.y + bullet.height > this.y) {
        return true;
      }
    });

    if (bullets.length > 0) {
      if (!this.game.player.powerups.laser) {
        bullets.forEach(b => b.active = false);
      }
      if (Math.random() < this.game.player.critrate) {
        console.log("Crit!");
        this.health -= this.game.player.damage * this.game.player.critdamage;
      } else {
        console.log("Hit!");
        this.health -= this.game.player.damage;
      }

      if (this.health <= 0) {
        this.active = false;
        this.game.score++;
      }
    }
  }
}


class Player {
  constructor(game) {
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
    this.vy = 2;
    this.vx = 2;
    this.critrate = 1;
    this.critdamage = 2;
    this.damage = 100;
    this.range = 0;
    this.powerups = {
      laser: false,
      split: 2
    }
  }

  draw() {
    //console.log(this.x);
    this.game.ctx.save();

    if (this.up) {
      this.y -= this.vy;
    }
    if (this.down) {
      this.y += this.vy;
    }

    if (this.left) {
      this.x -= this.vx;
    }

    if (this.right) {
      this.x += this.vx;
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
    this.bullets = [];
    this.enemies = [];
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext('2d');
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.player = new Player(this);
    this.score = 0;
    this.mousepos = {};

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

      this.mousepos = {x: startX, y: startY};
      
      // atan2(MouseYposition - PlayerYposition, MouseXposition - PlayerXposition)
      const rotation = Math.atan2(startY - this.player.y, startX - this.player.x);
      this.player.rotation = rotation;
      // this.bullets.push(new Bullet(this, rotation))
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const startX = parseInt(e.touches[0].clientX - offset(canvas).left);
      const startY = parseInt(e.touches[0].clientY - offset(canvas).top);
      // atan2(MouseYposition - PlayerYposition, MouseXposition - PlayerXposition)
      const rotation = Math.atan2(startY - this.player.y, startX - this.player.x);
      this.player.rotation = rotation;
      this.bullets.push(new Bullet(this))
      //this.player.x = startX;
      //this.player.y = startY;
      // this.ctx.fillRect(startX, startY, 25, 25);
    });
    this.canvas.addEventListener('click', (e) => {
      this.bullets.push(new Bullet(this));
    })
    this.init();
  }
  init() {
    this.canvas.style.height = this.height + "px";
    this.canvas.style.width = this.width + "px";
    this.canvas.setAttribute('height', this.height);
    this.canvas.setAttribute('width', this.width);
    setInterval(() => {
      if (Math.random() < 0.1) {
        this.enemies.push(new Enemy(this, getRandomInt(0, this.width - 25), getRandomInt(0, this.height - 25), 50, 50, 1000));

      } else {
        this.enemies.push(new Enemy(this, getRandomInt(0, this.width - 25), getRandomInt(0, this.height - 25)));

      }
    }, 10)
    // this.shootTimer();

    window.requestAnimationFrame(this.draw.bind(this));

  }
  draw() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.translate(0, 0);
    this.player.draw();
    for (let i = 0; i < 1; i++) {
      this.bullets.push(new Bullet(this));
      this.bullets.push(new Bullet(this, true));
    }
    this.bullets = this.bullets.filter(b => b.active);
    this.enemies = this.enemies.filter(b => b.active);
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].draw();
    }
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].draw();
    }
    this.ctx.restore();
    
    this.ctx.save();
    this.ctx.fillStyle = "#FFFFFF";
    canvasTxt.fontSize = 48;
    canvasTxt.drawText(this.ctx, `Score: ${this.score}`, 0, 0, 300, 100);
    this.ctx.restore();

    window.requestAnimationFrame(this.draw.bind(this));
  }

  shootTimer() {
    this.bullets.push(new Bullet(this))
    setTimeout(this.shootTimer.bind(this), 5000 - this.score * 100);
  }
}

function offset(elt) {
  var rect = elt.getBoundingClientRect(), bodyElt = document.body;

  return {
    top: rect.top + bodyElt.scrollTop,
    left: rect.left + bodyElt.scrollLeft
  }
}

function lineInterpolate(point1, point2, distance) {
  var xabs = Math.abs(point1.x - point2.x);
  var yabs = Math.abs(point1.y - point2.y);
  var xdiff = point2.x - point1.x;
  var ydiff = point2.y - point1.y;

  var length = Math.sqrt((Math.pow(xabs, 2) + Math.pow(yabs, 2)));
  var steps = length / distance;
  var xstep = xdiff / steps;
  var ystep = ydiff / steps;

  var newx = 0;
  var newy = 0;
  var result = new Array();

  for (var s = 0; s < steps; s++) {
    newx = point1.x + (xstep * s);
    newy = point1.y + (ystep * s);

    result.push({
      x: newx,
      y: newy
    });
  }

  return result;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


let game = new Game();