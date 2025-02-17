const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const waveCounter = document.getElementById('waveCounter');
const enemiesLeftCounter = document.getElementById('enemiesLeftCounter');

const gameWidth = gameArea.offsetWidth;
const gameHeight = gameArea.offsetHeight;

let playerX = gameWidth / 2;
let playerY = gameHeight / 2;
let moveSpeed = 5;
let wave = 1;
let enemies = [];
let bullets = [];
let facing = 'down'; // initial facing direction
let enemiesLeft = 0; // To track the number of enemies left in the wave

// Player movement keys
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function movePlayer() {
    if (keys['w']) {
        playerY -= moveSpeed;
        facing = 'up';
    }
    if (keys['s']) {
        playerY += moveSpeed;
        facing = 'down';
    }
    if (keys['a']) {
        playerX -= moveSpeed;
        facing = 'left';
    }
    if (keys['d']) {
        playerX += moveSpeed;
        facing = 'right';
    }

    // Prevent the player from moving out of bounds
    playerX = Math.max(0, Math.min(gameWidth - 30, playerX));
    playerY = Math.max(0, Math.min(gameHeight - 30, playerY));

    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}

// Shooting mechanic
document.addEventListener('keydown', (e) => {
    if (e.key === 'e') {
        shoot();
    }
});

function shoot() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.border = '2px solid black'; // Black outline for the bullet
    gameArea.appendChild(bullet);

    let bulletX = playerX + 10;
    let bulletY = playerY + 10;

    // Set bullet direction based on player facing direction
    const bulletDirection = { x: 0, y: 0 };

    switch (facing) {
        case 'up':
            bulletDirection.y = -1;
            bulletY -= 10;
            break;
        case 'down':
            bulletDirection.y = 1;
            bulletY += 10;
            break;
        case 'left':
            bulletDirection.x = -1;
            bulletX -= 10;
            break;
        case 'right':
            bulletDirection.x = 1;
            bulletX += 10;
            break;
    }

    bullet.style.left = `${bulletX}px`;
    bullet.style.top = `${bulletY}px`;

    // Add bullet with fixed direction
    bullets.push({ element: bullet, direction: bulletDirection });
}

// Enemy spawn and movement from outside the border
function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    gameArea.appendChild(enemy);

    // Randomly spawn enemies outside the border (off-screen)
    const spawnSide = Math.floor(Math.random() * 4);
    let enemyX, enemyY;

    switch (spawnSide) {
        case 0: // top
            enemyX = Math.random() * gameWidth;
            enemyY = -30; // spawn above the screen
            break;
        case 1: // right
            enemyX = gameWidth + 30; // spawn to the right of the screen
            enemyY = Math.random() * gameHeight;
            break;
        case 2: // bottom
            enemyX = Math.random() * gameWidth;
            enemyY = gameHeight + 30; // spawn below the screen
            break;
        case 3: // left
            enemyX = -30; // spawn to the left of the screen
            enemyY = Math.random() * gameHeight;
            break;
    }

    enemy.style.left = `${enemyX}px`;
    enemy.style.top = `${enemyY}px`;

    enemies.push({ element: enemy, x: enemyX, y: enemyY });
    enemiesLeft++; // Increase the number of enemies left for the wave
}

// Move enemies towards player
function moveEnemies() {
    enemies.forEach((enemy) => {
        const enemyRect = enemy.element.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        const deltaX = playerRect.x - enemyRect.x;
        const deltaY = playerRect.y - enemyRect.y;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        // Normalize movement
        const moveX = (deltaX / distance) * 1.5; // Speed of enemy movement
        const moveY = (deltaY / distance) * 1.5;

        enemy.x += moveX;
        enemy.y += moveY;

        enemy.element.style.left = `${enemy.x}px`;
        enemy.element.style.top = `${enemy.y}px`;
    });
}

// Update game
function update() {
    movePlayer();
    moveBullets();
    moveEnemies();
    checkCollisions();
}

// Move bullets
function moveBullets() {
    bullets.forEach((bullet, index) => {
        let bulletLeft = parseInt(bullet.element.style.left);
        let bulletTop = parseInt(bullet.element.style.top);

        bulletLeft += bullet.direction.x * 5; // Move bullets in fixed direction
        bulletTop += bullet.direction.y * 5;

        bullet.element.style.left = `${bulletLeft}px`;
        bullet.element.style.top = `${bulletTop}px`;

        if (bulletLeft < 0 || bulletTop < 0 || bulletLeft > gameWidth || bulletTop > gameHeight) {
            bullet.element.remove();
            bullets.splice(index, 1);
        }
    });
}

// Check for collisions
function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            const bulletRect = bullet.element.getBoundingClientRect();
            const enemyRect = enemy.element.getBoundingClientRect();

            if (bulletRect.top < enemyRect.bottom &&
                bulletRect.bottom > enemyRect.top &&
                bulletRect.left < enemyRect.right &&
                bulletRect.right > enemyRect.left) {

                enemy.element.remove();
                bullet.element.remove();
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);

                // Decrease the number of enemies left
                enemiesLeft--;
            }
        });
    });
}

// Increase wave and spawn new enemies
function nextWave() {
    // Only increase wave if there are no enemies left
    if (enemiesLeft <= 0) {
        wave++;
        waveCounter.textContent = `Wave: ${wave}`;

        // Spawn the new enemies based on wave number
        const enemiesToSpawn = wave * 2;
        for (let i = 0; i < enemiesToSpawn; i++) {
            spawnEnemy();
        }
    }
}

// Update the Enemies Left counter
function updateEnemiesLeft() {
    enemiesLeftCounter.textContent = `Enemies Left: ${enemiesLeft}`;
}

// Game loop
function gameLoop() {
    update();
    updateEnemiesLeft(); // Update the counter for enemies left
    moveBullets();
    moveEnemies();

    // Proceed to the next wave only when all enemies are defeated
    if (enemiesLeft <= 0 && enemies.length === 0) {
        setTimeout(nextWave, 1000); // Proceed to next wave after a short delay
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
