
// c2.stop()


harvestAllObjects(c2);

// c2.stop();


async function harvestAllObjects(c) {
    const objects = getLootableObjects(c)

    for(let i=0;i < objects.length; i++) {
        await c.harvestObject(objects[i])
    }
}

function getLootableObjects(c) {
    return c.getObjectsNearby().filter((o) => o.type === 'LOOTABLE_OBJECT');
}
