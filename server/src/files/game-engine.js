

killAllMonsters(c2);
harvestAllObjects(c1);


async function harvestAllObjects(c) {
    const objects = c.getCloseLootableObjects(c)

    for(let i=0;i < objects.length; i++) {
        await c.harvest(objects[i])
    }
}

async function killAllMonsters(c) {
    const objects = c.getCloseMonsters(c)

    for(let i=0;i < objects.length; i++) {
        await c.attack(objects[i])
    }

}


