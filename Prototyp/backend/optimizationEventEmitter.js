import events from 'events';

class OptimizationEventEmitter extends events.EventEmitter {

    // TODO: Prozentangabe an den Client senden
    progress = 0;
    constructor() {
        super();
    }

    sendProgressStatus(status) {
        console.log("Progress status: ", status);
        this.emit('progress', status);
    }

    resetProgress() {
        this.progress = 0;
    }
}

const optimizationEventEmitter = new OptimizationEventEmitter();

export default optimizationEventEmitter;