import events from 'events';

class OptimizationEventEmitter extends events.EventEmitter {

    // TODO: Prozentangabe an den Client senden
    progress = 0;
    constructor() {
        super();
    }

    sendProgressStatus(status, fileName, credits) {
        console.log("Progress status: ", status, fileName, credits);
        this.emit('progress', status, fileName, credits);
    }

    resetProgress() {
        this.progress = 0;
    }
}

const optimizationEventEmitter = new OptimizationEventEmitter();

export default optimizationEventEmitter;