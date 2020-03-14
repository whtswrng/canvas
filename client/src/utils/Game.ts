window.game = {
    moveAngle: (degree: number) => {
        if (!window.socket) return;
        console.log('moving!', degree);
        window.socket.emit('MOVE_ANGLE', degree);
    }
};

export default () => { }
