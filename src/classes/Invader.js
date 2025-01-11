import { PATH_INVADER_IMAGE} from "../utils/constants.js";
import Projectile from "./Projectile.js";


class Invader{

    constructor(position,velocity){
        this.width=50*0.75;
        this.height=37*0.75;
        this.velocity=velocity;
        this.position=position;
        this.image = this.getImage(PATH_INVADER_IMAGE);
       
        
    }
    moveDown(){
        this.position.y += this.height;
    }
    moveLeft(){
        this.position.x -= this.velocity;
    }
    moveRight(){
        this.position.x += this.velocity;
    }
    getImage(path){
        const image = new Image();
        image.src= path;
        return image;
    }

    incrementVelocity(boost){
        this.velocity += boost;
    }

    draw(ctx){
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    
    }

   
    shoot(projectiles) {
        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 2,
                y: this.position.y + this.height,
            },
            10
        );

        projectiles.push(p);
    }

    hit(projectile){
        return (
            projectile.position.x >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectile.position.y >= this.position.y &&
            projectile.position.y <= this.position.y + this.height 
            
        );
    }
    collided(obstacle) {
        return (
            (obstacle.position.x >= this.position.x &&
                obstacle.position.x <= this.position.x + this.width &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height) ||
            (obstacle.position.x + obstacle.width >= this.position.x &&
                obstacle.position.x <= this.position.x &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height)
        );
    }

}

export default Invader;
