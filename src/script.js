import Grid from "./classes/Grid.js";
import Invader from "./classes/Invader.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import Projectile from "./classes/Projectile.js";
import SoundEffects from "./classes/SoundEffects.js";
import Star from "./classes/Star.js";
import { GameState, NUMBER_STARS } from "./utils/constants.js";

const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUL = document.querySelector(".score-ul");
const scoreElement = document.querySelector(".score > span");
const levelElement = document.querySelector(".level > span");
const hightElement = document.querySelector(".hight > span");
const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");

gameOverScreen.remove();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width=innerWidth;
canvas.height=innerHeight;

ctx.imageSmoothingEnabled = false;
let currentState = GameState.START;

const gameData = {
    score:0,
    level:1,
    hight:0
}

const showGameData = () => {
    scoreElement.textContent=gameData.score;
    levelElement.textContent=gameData.level;
    hightElement.textContent=gameData.hight;
}

const soundEffects = new SoundEffects()
const player = new Player(canvas.width,canvas.height);
const grid = new Grid(3,6);

const playerProjectiles=[];
const invaderProjectiles=[];
const particles = [];
const obstacles =[];
const stars = [];

const initObstacles = () => {
    const x = canvas.width / 2 - 50
    const y = canvas.height - 200;
    const offset = canvas.width * 0.15;
    const color = "crimson";

    const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, color);
    const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, color);

    obstacles.push(obstacle1);
    obstacles.push(obstacle2);
}
initObstacles();


const keys = {
    left:false,
    right:false,
    shoot:{
        pressed:false,
        released:true,
    },
};

const incrementScore = (value) =>{
    gameData.score+=value;
    if (gameData.score > gameData.hight) {
        gameData.hight = gameData.score;
    }
}

const generateStars = () => {
    for (let i = 0; i < NUMBER_STARS; i += 1) {
        stars.push(new Star(canvas.width, canvas.height));
        
    }
};

const drawStars = () => {
    clearStars();
    stars.forEach((star) => {
        star.draw(ctx);
        star.update();
    });
};

const drawObstacle = () => {
    obstacles.forEach((obstacle) => obstacle.draw(ctx));
}

const drawProjectiles = () => {
    const projectiles=[...playerProjectiles, ...invaderProjectiles]

    projectiles.forEach((projectile)=>{
        projectile.draw(ctx);
        projectile.update();
    });
}
const drawParticle = () =>{
    particles.forEach((particle) =>{
        particle.draw(ctx);
        particle.update();
    });
}

const clearProjectiles = () => {
    playerProjectiles.forEach((projectile,index)=>{
        if(projectile.position.y<=0){
            playerProjectiles.splice(index,1);
        };
    });
}

const clearParticles = () => {
    particles.forEach((particle,i)=>{
        if(particle.opacity <= 0){
            particles.splice(i,1)
        }
    
    });
}

const createExplosion = (position,size,color) => {
    for (let i = 0 ; i < 10; i+=1){
        const particle = new Particle(
           {
            x:position.x,
            y:position.y,
           },
           {
            x:Math.random() - 0.5 * 1.5,
            y:Math.random() - 0.5 * 1.5,
           },size,
           color
           
        );
        particles.push(particle)
    }
}

const clearStars = () => {
    stars.forEach((star, index) => {
        if (star.position.y > canvas.height + star.radius) {
            stars[index] = new Star(canvas.width, canvas.height);
        }
    });
};



const checkShootInvaders = () => {
    grid.invaders.forEach((invader,invaderIndex) => {
        playerProjectiles.some((projectile, projectileIndex) =>{
            if(invader.hit(projectile)){
                soundEffects.playHitSound();
                createExplosion({
                    x:invader.position.x +invader.width/2,
                    y:invader.position.y +invader.height/2,
                    },2,"#941CFF"
                );

                incrementScore(10);
                grid.invaders.splice(invaderIndex,1);
                playerProjectiles.splice(projectileIndex,1)
            }
        });
    });
}

const checkShootPlayer = () => {
    invaderProjectiles.some((projectile,i)=>{
        if (player.hit(projectile)){
            soundEffects.playExplosionSound();
            invaderProjectiles.splice(i,1);
            gameOver();
            
        }
    })
}

const checkShootObstacle = () =>{
    obstacles.forEach((obstacle) =>{
        playerProjectiles.some((projectile,i) => {
            if (obstacle.hit(projectile)) {
                playerProjectiles.splice(i,1);
            };
        });
        invaderProjectiles.some((projectile,i) => {
            if (obstacle.hit(projectile)) {
                invaderProjectiles.splice(i,1);
            }
        })
    });
}
const checkInvadersCollidedObstacles = () => {
    obstacles.forEach((obstacle, i) => {
        grid.invaders.some((invader) => {
            if (invader.collided(obstacle)) {
                obstacles.splice(i, 1);
            }
        });
    });
};

const checkPlayerCollidedInvaders = () => {
    grid.invaders.some((invader) => {
        if (
            invader.position.x >= player.position.x &&
            invader.position.x <= player.position.x + player.width &&
            invader.position.y >= player.position.y
        ) {
            gameOver();
        }
    });
};

const spawnGrid= ()=>{
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound();
        grid.rows = Math.round(Math.random() * 9 + 1)
        grid.cols = Math.round(Math.random() * 9 + 1)
        grid.restart();
        gameData.level += 1;
        grid.invaderVelocity+=grid.incrementVelocity;

        if (obstacles.length === 0) {
            initObstacles();
        }
    }   
}

const gameOver = () => {
    createExplosion(
        {
            x:player.position.x + player.width / 2,
            y:player.position.y + player.height / 2
        },2,"white"
    )
    createExplosion(
        {
            x:player.position.x + player.width / 2,
            y:player.position.y + player.height / 2
        },2,"#941CFF"
    )
    createExplosion(
        {
            x:player.position.x + player.width / 2,
            y:player.position.y + player.height / 2
        },2,"red"
    )
    currentState = GameState.GAME_OVER;
    player.alive=false;
    document.body.append(gameOverScreen)
}


const gameLoop = () =>{
    ctx.clearRect(0,0,canvas.width,canvas.height);

    
    drawStars();
    
    if (currentState == GameState.PLAYING){
        spawnGrid();
        
        showGameData();

        drawParticle();
        drawProjectiles();
        drawObstacle();

        clearProjectiles();
        clearParticles();

        checkShootInvaders();
        checkShootPlayer();
        checkShootObstacle();
        checkInvadersCollidedObstacles();
        checkPlayerCollidedInvaders();

        grid.draw(ctx);
        grid.update(player.alive);

        ctx.save();

        ctx.translate(
            player.position.x + player.width / 2, 
            player.position.y + player.height / 2
        );

        if(keys.shoot.pressed && keys.shoot.released){
            soundEffects.playShootSound();
            player.shoot(playerProjectiles);
            keys.shoot.released=false;
            
        }

        if (keys.left && player.position.x >=0) {
            player.moveLeft();
            ctx.rotate(-0.15);
         } 
        if (keys.right && player.position.x <= canvas.width - player.width) {
            player.moveRight();
            ctx.rotate(0.15);
        }  

        ctx.translate(
        -player.position.x - player.width / 2, 
        -player.position.y - player.height / 2
        );

        player.draw(ctx);
        ctx.restore();
    }
    if (currentState == GameState.GAME_OVER) {
        checkShootObstacle();
        
        drawParticle();
        drawProjectiles();
        drawObstacle();

        clearProjectiles();
        clearParticles();

        grid.draw(ctx);
        grid.update(player.alive);
    }
    requestAnimationFrame(gameLoop)
};


addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key === "a") keys.left = true;
    if (key === "d") keys.right = true;
    if (key === "enter") keys.shoot.pressed = true;
});

addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    if (key === "a") keys.left = false;
    if (key === "d") keys.right = false;
    if (key === "enter") {
        keys.shoot.pressed = false;
        keys.shoot.released = true;
    }
});



buttonPlay.addEventListener("click", () => {
    startScreen.remove();
    scoreUL.style.display = "block";
    currentState = GameState.PLAYING;
    

    setInterval(() => {
        const invader = grid.getRandomInvader();

        if (invader) {
            invader.shoot(invaderProjectiles);
        }
    }, 1000);
});

buttonRestart.addEventListener("click", () => {
    currentState= GameState.PLAYING;
    player.alive=true;

    grid.invaders.length=0
    grid.invaderVelocity=1
    invaderProjectiles.length=0
    gameData.score=0
    gameData.level=0
    gameOverScreen.remove();
});
generateStars();
gameLoop();