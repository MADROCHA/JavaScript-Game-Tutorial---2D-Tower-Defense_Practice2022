const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 400;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 100;

let chosenDefender = 1;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

  // mouse draw cell hovering
    const mouse = {
        x: 10,
        y: 10,
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
    });
    canvas.addEventListener('mouseleave', function(){
        mouse.x = undefined;
        mouse.y = undefined;
    })
    /* console.log(canvasPosition); */

//GAME BOARD
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
    update(){
        
    }
    draw(){
        //if (collision(this, mouse)){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
// 'maps' height and width of grid within the canvas 
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
// reads gameGrid array, invoke draw method
function handleGameGrid(){
    for (let i  = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}

//PROJECTILES
class Projectiles {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++){
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
        /* console.log('`projectiles ' + projectiles.length); */
    }
}

//DEFENDERS
const defenderTypes = [];

const defender1 = new Image();
defender1.src = 'src/plant.png'
defenderTypes.push(defender1);

const defender2 = new Image();
defender2.src = 'src/enemy_digger.png'
defenderTypes.push(defender2);

class Defender {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2 ;
        this.height = cellSize - cellGap * 2 ;
        this.shooting = false;
        this.shootNow = false;
        /* this.projectiles = []; */
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        if (chosenDefender === 1){
            this.health = 100;
            this.spriteWidth = 167;
            this.spriteHeight = 243;
            this.minFrame = 0;
            this.maxFrame = 1;
        } else if (chosenDefender === 2){
            this.health = 200;
            this.spriteWidth = 260;
            this.spriteHeight = 178;
            this.minFrame = 0;
            this.maxFrame = 3;
        }
        this.chosenDefender = chosenDefender;



    }
    draw(){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'green';
        ctx.font = '30px Orbitron';
        if (this.chosenDefender === 1){
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x +15, this.y ,this.width *0.8, this.height);
        } else if (this.chosenDefender === 2){
            ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y ,this.width , this.height);

        }

        ctx.fillText(Math.floor(this.health), this.x + 10, this.y + 85);
    }
    update(){
        if (frame % 50 === 0){
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if (this.frameX === 1) this.shootNow = true;
        }
        if (this.shooting && this.shootNow){
            //this.timer++;
            //if (this.timer % 100 === 0){}
                projectiles.push(new Projectiles(this.x + this.width * 0.5, this.y + this.height * 0.5));
                this.shootNow = false;
        } /* else {
            this.timer = 0;
        } */
            
    }
}
/* canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize)return;
    for (let i = 0; i < defenders.length; i++){
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost){
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
        //console.log(defenderCost)
    }
}); */
function handleDefenders(){
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
                // enemies damage tweak
                if(enemies[j].enemyType === enemy1){
                    //part1A
                    defenders[i].health -= 0.2;
                } else if (enemies[j].enemyType === enemy2){
                    //part1B
                    defenders[i].health -= 0.1;

                }
            }
            if (defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
const card1 = {
    x:320,
    y:7.5,
    width:70,
    height:85
}
const card2 = {
    x:400,
    y:7.5,
    width:70,
    height:85, 
}

function chooseDefender(){
    
    let card1stroke = 'black';
    let card2stroke = 'black';
    if(collision(mouse, card1) && mouse.clicked){
        chosenDefender = 1;
    } else if (collision(mouse, card2) && mouse.clicked){
        chosenDefender = 2;
    }
    if (chosenDefender === 1){
        card1stroke = 'gold';
        card2stroke = 'black';
        
    } else if (chosenDefender === 2){
        card1stroke = 'black';
        card2stroke = 'gold';
    } else {
        card1stroke = 'black';
        card2stroke = 'black';
    }

    

    ctx.lineWidth = 1;
    //ctx.fillStyle = 'teal';
    ctx.fillStyle = 'rgba(0,0,0,0.2';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height, card1.color);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height, card1.color);
    ctx.drawImage(defender1, 0, 0, 167, 243, 320 , 7.5, 70 * 0.8 , 84  )
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height, card2.color);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height, card2.color);
    ctx.drawImage(defender2, 0, 0, 260, 178, 400, 15, 70 , 85 * 0.9 )
}

//FLOATING MESSAGES
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
        if (this.opacity > 0.01) this.opacity -= 0.01;
    }
    draw(){
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Orbitron';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages(){
    for (let i = 0; i < floatingMessages.length; i++){
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50){
            floatingMessages.splice(i, 1);
            i--;
        }
        // note, breaks the game v
        //console.log(floatingMessages[i].lifeSpan);
    }
}
//ENEMIES
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'src/zombie.png';
enemyTypes.push(enemy1);

const enemy2 = new Image();
enemy2.src = 'src/enemy_ghost_4.png';
enemyTypes.push(enemy2);



class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.enemyType = enemyTypes[Math.floor(Math.random()* enemyTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        if (this.enemyType === enemy1){
            this.health = 100;
            this.maxHealth = this.health;
            this.maxFrame = 7;
            this.spriteWidth = 292;
            this.spriteHeight = 410;
            
        } else if (this.enemyType === enemy2){
            this.health = 200;
            this.maxHealth = this.health;
            this.maxFrame = 5;
            this.spriteWidth = 60.16;
            this.spriteHeight = 70;

        }

    }
    update(){
        this.x -= this.movement;
        if (frame % 10 === 0){
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
    }
    draw(){
        ctx.strokeStyle = 'red';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'green';
        ctx.font = '30px Orbitron';
        if (this.enemyType === enemy1){
            ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width * 0.8, this.height);
            ctx.fillText(Math.floor(this.health), this.x + 10, this.y + 85);
        } else if (this.enemyType === enemy2){
            ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
            ctx.fillText(Math.floor(this.health), this.x + 10, this.y + 85);
        }


    }
}
function handleEnemies(){
    for(let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            gameOver = true;
        }
        if (enemies[i].health <= 0){
            let gainedResources = enemies[i].maxHealth * 0.2;
            numberOfResources += gainedResources;
            floatingMessages.push(new floatingMessage('+' + gainedResources, enemies[i].x, enemies[i].y, 30, 'gold'))
            floatingMessages.push(new floatingMessage('+' + gainedResources, 250, 50, 30, 'gold'))
            
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
            //console.log(enemyPositions);
        }
    }
    //spawn enemies
    if (frame % enemiesInterval === 0 && score < winningScore){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 50;
        /* console.log(enemyPositions); */
    }
}

//RESOURCES
const amounts = [20, 30, 40];
class Resource {
    constructor(){
        // 1:06:41 revisar
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) +1) * cellSize + 25;
        // 1:06:41 revisar
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle =  'black';
        ctx.font = '20px Orbitron'
        ctx.fillText(this.amount, this.x + 15, this.y + 25)
    }
    update(){
    }
}
function  handleResources(){
    if (frame % 500 === 0 && score < winningScore){
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberOfResources += resources[i].amount;
            //floatingMessages.push('value',x,y,size,color)
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'gold'))
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, 250, 50, 30, 'gold'))
            resources.splice(i, 1);
            i--;
        }
    }
}


//UTILITIES
function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score, 30, 40)
    ctx.fillText('Resources: ' + numberOfResources, 30, 80)
    if (gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('TRY AGAIN', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0){
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('WAVE CLEARED', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('Score ' + score + ' points!', 135, 340);
    }
}
canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize)return;
    for (let i = 0; i < defenders.length; i++){
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)return;
    }
    let defenderCost = 100;
    // alternative pricing
    if (chosenDefender === 1){
        floatingMessages.push(new floatingMessage('-' + defenderCost, card1.x, 80, 30, 'gold'))
        defenderCost = 100;
    } else if (chosenDefender === 2){
        floatingMessages.push(new floatingMessage('-' + defenderCost, card2.x, 80, 30, 'gold'))
        defenderCost = 120;
    }
    if (numberOfResources >= defenderCost){
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
        //console.log(defenderCost)
    } else {
        floatingMessages.push(new floatingMessage('need more resources', mouse.x, mouse.y, 20, 'blue'))
    }
});

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
    //console.log(frame)
    if(!gameOver)requestAnimationFrame(animate);
}
animate();

function collision(first, second){
    if (  !(first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y)
    ) { 
        return true;
        };
    }
    
    window.addEventListener('resize', function(){
        canvasPosition = canvas.getBoundingClientRect();
    })