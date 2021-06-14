const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
let numberOfResources = 150;
const enemies = [];
const enemyPositions = [];
let enemiesInterval = 1000;
let frame = 0;
let gameOver = false;
const projectiles = [];
const lasers = [];
let score = 0;
const resources = [];
const winningScore = 10000;
let chosenDefender = 1;
const explosions = [];
const largeorbs = [];
const enemyprojectiles = [];

//mouse
const mouse = {
    x: 0,
    y: 0,
    width: 0.1,
    height: 0.1,
    clicked: false
}
canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
});
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
})
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
})

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'white';
            ctx.strokeRect(this.x, this.y, this. width, this.height);
        }
    }
}
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}
//projectiles
const defender1projectile = new Image();
defender1projectile.src = 'defender1projectile.png'

class Projectile {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.drawImage(defender1projectile, 0, 0, 40, 40, this.x, this.y, this.width, this.height);
    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for(let j = 0; j < enemies.length; j++){
           if(enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
               enemies[j].health -= projectiles[i].power;
               explosions.push(new Explosion(projectiles[i].x, projectiles[i].y - 12, 'small'));
               projectiles.splice(i, 1);
               i--;
           } 
        }

        if (projectiles[i] && projectiles[i].x > canvas.width){
            projectiles.splice(i,1);
            i--;
        }
    }
}
class EnemyProjectile {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x -= this.speed;
    }
    draw(){
        ctx.drawImage(defender1projectile, 0, 0, 40, 40, this.x, this.y, this.width, this.height);
    }
}
function handleEnemyProjectiles(){
    for (let i = 0; i < enemyprojectiles.length; i++){
        enemyprojectiles[i].update();
        enemyprojectiles[i].draw();

        for(let j = 0; j < defenders.length; j++){
           if(defenders[j] && enemyprojectiles[i] && collision(enemyprojectiles[i], defenders[j])){
               defenders[j].health -= enemyprojectiles[i].power;
               explosions.push(new Explosion(enemyprojectiles[i].x, enemyprojectiles[i].y - 12, 'small'));
               enemyprojectiles.splice(i, 1);
               i--;
           } 
        }

        // if (enemyprojectiles[i] && enemyprojectiles[i].x < canvas.width){
        //     enemyprojectiles.splice(i,1);
        //     i--;
        // }
    }
}
const largeOrb = new Image();
largeOrb.src = 'largeorb.png'

class LargeOrb {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.power = 75;
        this.speed = 1.5;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 1;
        this.spriteWidth = 160;
        this.spriteHeight = 160;
    }
    update(){
        this.x += this.speed;
        if(frame % 25 === 0) {
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = this.minFrame;
            }
        }
    }
    draw(){
        ctx.drawImage(largeOrb, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
function handleLargeOrbs(){
    for (let i = 0; i < largeorbs.length; i++){
        largeorbs[i].update();
        largeorbs[i].draw();
        for(let j = 0; j < enemies.length; j++){
           if(enemies[j] && largeorbs[i] && collision(largeorbs[i], enemies[j])) {
               enemies[j].health -= largeorbs[i].power;
               explosions.push(new Explosion(largeorbs[i].x - cellSize, largeorbs[i].y - cellSize, 'lightning'));
               largeorbs.splice(i, 1);
               i--;
           }
        }
        if (largeorbs[i] && largeorbs[i].x > canvas.width){
            largeorbs.splice(i, 1);
            i--;
        }
    }
}
const laser = new Image();
laser.src = 'laser.png'

class Laser {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = 20;
        this.power = 0.3;
        this.speed = 20;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 8;
        this.spriteWidth = 160;
        this.spriteHeight = 160;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.drawImage(laser, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, 100);
    }
}
function handleLasers(){
    for (let i = 0; i < lasers.length; i++){
        lasers[i].update();
        lasers[i].draw();
        for(let j = 0; j < enemies.length; j++){
           if(enemies[j] && lasers[i] && collision(lasers[i], enemies[j])){
               enemies[j].health -= lasers[i].power;
           } 
        }
        if (lasers[i] && lasers[i].x > canvas.width){
            lasers.splice(i, 1);
            i--;
        }
    }
}
//defenders
const defender1 = new Image();
defender1.src = 'defender1.png'
const defender2 = new Image();
defender2.src = 'defender2.png'
const defender3 = new Image();
defender3.src = 'defender3.png'
const defender4 = new Image();
defender4.src = 'defender4.png'

class Defender {
    constructor(x,y){
        this.chosenDefender = chosenDefender;
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 8;
        this.spriteWidth = 160;
        this.spriteHeight = 160;
        if(this.chosenDefender === 4) {
            this.health = 500;
        }
    }
    draw(){
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        // ctx.fillStyle = 'gold';
        // ctx.font = '20px "Press Start 2P"';
        // ctx.fillText(Math.floor(this.health), this.x + 20, this.y + 25);
        if (this.chosenDefender === 1){
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 2) {
            ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 3) {
            ctx.drawImage(defender3, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 4) {
            ctx.drawImage(defender4, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
    update(){
        if (this.chosenDefender === 1) {
            if(frame % 8 === 0) {
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                } else {
                    this.frameX = this.minFrame;
                }
                if(this.frameX === 17) {
                    this.shootNow = true;
                }
            }
        } else if(this.chosenDefender === 2) {
            if (!this.shooting) {
                if(frame % 8 === 0) {
                    if (this.frameX < this.maxFrame) {
                        this.frameX++;
                    } else {
                        this.frameX = this.minFrame;
                    }
                }
            } else {
                if(frame % 2 === 0) {
                    if (this.frameX < this.maxFrame) {
                        this.frameX++;
                    } else {
                        this.frameX = this.minFrame;
                    }
                    if(this.frameX === 16) {
                        this.shootNow = true;
                    }
                }
            }
        } else if (this.chosenDefender === 3) {
            if(frame % 12 === 0) {
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                } else {
                    this.frameX = this.minFrame;
                }
                if(this.frameX === 20) {
                    this.shootNow = true;
                }
            }
        } else if (this.chosenDefender === 4) {
            if(frame % 12 === 0) {
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                } else {
                    this.frameX = this.minFrame;
                }
                if(this.frameX === 0) {
                    this.shootNow = true;
                }
            }
        }
        if (this.chosenDefender === 1) {
            if(this.shooting){
                this.minFrame = 9;
                this.maxFrame = 20;
            } else {
                this.minFrame = 0;
                this.maxFrame = 8;
            }
        } else if (this.chosenDefender === 2) {
            if(this.shooting){
                this.minFrame = 10;
                this.maxFrame = 19;
            } else {
                this.minFrame = 0;
                this.maxFrame = 9;
            }
        } else if (this.chosenDefender === 3) {
            if(this.shooting){
                this.minFrame = 0;
                this.maxFrame = 22;
            } else {
                this.minFrame = 0;
                this.maxFrame = 2;
            }
        } else if (this.chosenDefender === 4) {
            this.minFrame = 0;
            this.maxFrame = 5;
        }
        
        if (this.chosenDefender === 1) {
            if(this.shooting && this.shootNow) {
                projectiles.push(new Projectile(this.x + 75, this.y + 37));
                this.shootNow = false;
            }
        } else if (this.chosenDefender === 2) {
            if(this.shooting && this.shootNow) {
                lasers.push(new Laser(this.x + 60, this.y - 5));
                this.shootNow = false;
            }
        } else if (this.chosenDefender === 3) {
            if(this.shooting && this.shootNow) {
                largeorbs.push(new LargeOrb(this.x + 75, this.y + 3));
                this.shootNow = false;
            }
        }
    }
}

function handleDefenders() {
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1){
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++){
            if (defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 1;
                if(defenders[i].chosenDefender === 4 && defenders[i].shootNow) {
                    explosions.push(new Explosion(defenders[i].x + 50, defenders[i].y + 25, 'small'));
                    defenders[i].shootNow = false;
                }
            }
            if (defenders[i] && defenders[i].health <= 0){
                explosions.push(new Explosion(defenders[i].x, defenders[i].y, 'large'));
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
const card1 = {
    x: 10,
    y: 10,
    width: 80,
    height: 80
}
const card2 = {
    x: 100,
    y: 10,
    width: 80,
    height: 80
}
// const card3 = {
//     x: 190,
//     y: 10,
//     width: 80,
//     height: 80
// }
// const card4 = {
//     x: 280,
//     y: 10,
//     width: 80,
//     height: 80
// }

function chooseDefender() {
    let card1stroke = 'black';
    let card2stroke = 'black';
    let card3stroke = 'black';
    let card4stroke = 'black';
    if(collision(mouse, card1) && mouse.clicked) {
        chosenDefender = 1;
    } else if (collision(mouse, card2) && mouse.clicked) {
        chosenDefender = 2; }
    // else if (collision(mouse, card3) && mouse.clicked) {
    //     chosenDefender = 3;
    // } else if (collision(mouse, card4) && mouse.clicked) {
    //     chosenDefender = 4;
    // }
    if (chosenDefender === 1) {
        card1stroke = '#41bfd0';
        card2stroke = 'black';
        card3stroke = 'black';
        card4stroke = 'black';
    } else if (chosenDefender === 2) {
        card1stroke = 'black';
        card2stroke = '#41bfd0';
        card3stroke = 'black';
        card4stroke = 'black';
    } else if (chosenDefender === 3) {
        card1stroke = 'black';
        card2stroke = 'black';
        card3stroke = '#41bfd0';
        card4stroke = 'black';
    } else if (chosenDefender === 4) {
        card1stroke = 'black';
        card2stroke = 'black';
        card3stroke = 'black';
        card4stroke = '#41bfd0';
    } else {
        card1stroke = 'black';
        card2stroke = 'black';
        card3stroke = 'black';
        card4stroke = 'black';
    }

    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(defender1, 0, 0, 160, 160, 10, 10, 80, 80);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.drawImage(defender2, 0, 0, 160, 160, 100, 10, 80, 80);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
    // ctx.fillRect(card3.x, card3.y, card3.width, card3.height);
    // ctx.drawImage(defender3, 0, 0, 160, 160, 190, 10, 80, 80);
    // ctx.strokeStyle = card3stroke;
    // ctx.strokeRect(card3.x, card3.y, card3.width, card3.height);
    // ctx.fillRect(card4.x, card4.y, card4.width, card4.height);
    // ctx.drawImage(defender4, 0, 0, 160, 160, 280, 10, 80, 80);
    // ctx.strokeStyle = card4stroke;
    // ctx.strokeRect(card4.x, card4.y, card4.width, card4.height);
}

//Floating Messages
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color){
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.02) this.opacity -= 0.02;
    }
    draw(){
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px "Press Start 2P"';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages(){
    for (let i = 0; i < floatingMessages.length; i++){
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'enemy1.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = 'enemy2.png'
enemyTypes.push(enemy2);
const enemy3 = new Image();
enemy3.src = 'enemy3.png'
enemyTypes.push(enemy3);

class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.health = 100;
        this.projectiles = [];
        this.maxHealth = this.health;
        this.enemyType = enemy1;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.shootNow = false;
        this.canShoot = false;
        if (this.enemyType === enemy1){
            this.maxFrame = 3;
            this.health = 150;
            this.reward = 25;
            this.speed = Math.random() * 0.2 + 0.4;
            this.movement = this.speed;
        } else if (this.enemyType === enemy2) {
            this.maxFrame = 11;
            this.health = 250;
            this.maxHealth = 250;
            this.speed = Math.random() * 0.15 + 0.3;
            this.reward = 50;
            this.movement = this.speed;
        } else if (this.enemyType === enemy3) {
            this.maxFrame = 7;
            this.health = 100;
            this.maxHealth = 100;
            this.speed = Math.random() * 0.10 + 0.15;
            this.reward = 50;
            this.movement = this.speed;
        }
        this.spriteWidth = 160;
        this.spriteHeight = 160;
    }
    update(){
        this.x -= this.movement;
        if (frame % 10 === 0) {
            if(this.frameX < this.maxFrame){
                this.frameX += 1;
            } else this.frameX = this.minFrame;
        }
        if (this.enemyType === enemy3 && this.frameX === 0) {
            this.shootNow = false;
            this.canShoot = true;
        }
        if (this.enemyType === enemy3 && this.frameX === 7) {
            this.shootNow = true;
        }
        if (this.enemyType === enemy3 && this.shootNow && this.canShoot) {
            enemyprojectiles.push(new EnemyProjectile(this.x + 50, this.y + 40));
            this.canShoot = false;
            this.shootNow = false;
        }
    }
    draw(){
        // ctx.fillStyle = 'gold';
        // ctx.font = '20px "Press Start 2P"';
        // ctx.fillText(Math.floor(this.health), this.x + 20, this.y - 50);
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
function handleEnemies(){
    for (let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].reward;
            floatingMessages.push(new floatingMessage('+' + gainedResources, enemies[i].x, enemies[i].y, 25, '#41bfd0'));
            numberOfResources += gainedResources;
            score += gainedResources;
            explosions.push(new Explosion(enemies[i].x, enemies[i].y, 'large'));
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1)
            enemies.splice(i, 1);
            i--;
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 100) enemiesInterval -= 40;
    }
}

//resources
const credits = new Image();
credits.src = 'credits.png';
class Resource {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.8;
        this.height = cellSize * 0.8;
        this.amount = 50;
    }
    draw() {
        ctx.drawImage(credits, 0, 0, 160, 160, this.x, this.y, this.width, this.height);
    }
}
function handleResources(){
    if (frame % 500 === 0 && score < winningScore){
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberOfResources += resources[i].amount;
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 25, '#41bfd0'));
            resources.splice(i, 1);
            i--;
        }
    }
}
//utilities
const explosion = new Image();
explosion.src = 'explosion.png';
const smallexplosion = new Image();
smallexplosion.src = 'smallexplosion.png';
const lightningexplosion = new Image();
lightningexplosion.src = 'lightningexplosion.png';

class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        if(this.size === 'small') {
            this.width = cellSize / 2;
            this.height = cellSize / 2;
            this.frameX = 0;
            this.frameY = 0;
            this.minFrame = 0;
            this.maxFrame = 6;
            this.spriteWidth = 80;
            this.spriteHeight = 80;
            this.sprite = smallexplosion;
        } else if (this.size === 'large') {
            this.width = cellSize;
            this.height = cellSize;
            this.frameX = 0;
            this.frameY = 0;
            this.minFrame = 0;
            this.maxFrame = 6;
            this.spriteWidth = 160;
            this.spriteHeight = 160;
            this.sprite = explosion;
        } else if (this.size === 'lightning') {
            this.width = cellSize * 3;
            this.height = cellSize * 3;
            this.frameX = 0;
            this.frameY = 0;
            this.minFrame = 0;
            this.maxFrame = 6;
            this.spriteWidth = 480;
            this.spriteHeight = 480;
            this.sprite = lightningexplosion;
        }
    }
    update(){
        if (frame % 10 === 0) {
            if(this.frameX < this.maxFrame){
                this.frameX += 1;
            }
        }
    }
    draw(){
        //ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.drawImage(this.sprite, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
function handleExplosions() {
    for (let i = 0; i < explosions.length; i++){
        explosions[i].update();
        explosions[i].draw();
        if (explosions[i].frameX >= 6) {
            explosions.splice(this, 1);
            i--;
        }
        if(explosions[i] && explosions[i].size === 'lightning') {
            for(let j = 0; j < enemies.length; j++){
                if(enemies[j] && explosions[i] && collision(explosions[i], enemies[j])) {
                    enemies[j].health -= 0.5;
                }
            }
        }
    }
}

function handleGameStatus(){
    ctx.fillStyle = '#41bfd0';
    ctx.strokeStyle = '#181c5a';
    ctx.lineWidth = 3;
    ctx.font = '40px "Press Start 2P"';
    ctx.fillText(numberOfResources, 740, 75);
    ctx.strokeText(numberOfResources, 740, 75);
    ctx.lineWidth = 2;
    ctx.font = '25px "Press Start 2P"';
    ctx.fillText('75', 40, 90);
    ctx.strokeText('75', 40, 90);
    ctx.fillText('125', 105, 90);
    ctx.strokeText('125', 105, 90);
    ctx.drawImage(credits, 0, 0, 160, 160, 670, 15, 75, 75);
    // ctx.fillText('Score: ' + score, 700, 55);
    if (gameOver){
        ctx.fillStyle = 'white';
        ctx.font = '60px "Press Start 2P"';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score > winningScore && enemies.length === 0) {
        ctx.fillStyle = 'white';
        ctx.font = '40px "Press Start 2P"';
        ctx.fillText('LEVEL COMPLETE', 135, 330);
    }
    if (numberOfResources > 9999) {
        numberOfResources = 9999;
    }
}

canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++){
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }
    let defenderCost = 75;
    if (chosenDefender === 1) {
        defenderCost = 75;
    } else if (chosenDefender === 2) {
        defenderCost = 125;
    } else if (chosenDefender === 3) {
        defenderCost = 175;
    } else if (chosenDefender === 4) {
        defenderCost = 50;
    }
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push(new floatingMessage('Not Enough Resources!', mouse.x - 150, mouse.y, 15, 'red'));
    }
});
let backgroundFrameX = 0;
const backgroundMinFrame = 0;
const backgroundMaxFrame = 3;

function drawBackground() {
    const background = new Image();
    background.src = 'bg.png';
    if (frame % 20 === 0) {
        if(backgroundFrameX < backgroundMaxFrame){
            backgroundFrameX += 1;
        } else backgroundFrameX = backgroundMinFrame;
    }
    ctx.drawImage(background, backgroundFrameX * 1440, 0, 1440, 800, 0, cellSize, 900, 500);
}

function animate() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    const menubar = new Image();
    menubar.src = 'menubar.png';
    ctx.drawImage(menubar, 0, 0, 1440, 160, 0, 0, canvas.width, cellSize);
    drawBackground();
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemyProjectiles();
    handleLasers();
    handleLargeOrbs();
    handleEnemies();
    handleExplosions();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second){
    if ( !(first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y)
    ) {
        return true;
    };
};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})