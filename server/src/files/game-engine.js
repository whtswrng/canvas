game.off('TARGET_HIT');
game.off('TARGET_DEAD');
game.off('OBJECT_HIT');
game.off('OBJECT_DESTROYED');


if(window.i1) clearInterval(window.i1);

runGameEngine();

// default game engine
function runGameEngine() {
    const hitSound = new Audio('/sounds/target_hit.ogg');
    const deadSound = new Audio('/sounds/target_dead.ogg');

    game.on('TARGET_HIT', (data) => {
        hitSound.play();
        console.log(
            `%c ${data.from} => ${data.target} (${data.damage})`, 'background: green; color: red'
        );
    });
    game.on('OBJECT_HIT', (data) => {
        hitSound.play();
        console.log(
            `%c ${data.from} => ${data.target} (${data.damage})`, 'background: green; color: gold'
        );
    });
    game.on('OBJECT_DESTROYED', (data) => {
        hitSound.play();
        console.table(data);
    });
    game.on('TARGET_DEAD', async (data) => {
        deadSound.play();
        console.table(data);
    });

}


window.i1 = setInterval(async () => {
    const attrs = await c2.getAttributes();
    console.log('ENERGIE: ', attrs.energy);
}, 3000);

c1.harvest()